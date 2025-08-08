"""
Hazard Processing Pipeline
Processes multi-source hazard data and generates ML predictions for spread patterns.
"""

import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point, Polygon
import h3
from datetime import datetime, timedelta
import structlog
from typing import List, Dict, Any, Optional
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import json

logger = structlog.get_logger(__name__)


class HazardProcessor:
    """Core hazard processing engine with ML prediction capabilities."""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.h3_resolution = 9  # ~174m hexagons
        self.prediction_horizon_hours = 2
        
    def load_ml_model(self, model_path: str = None):
        """Load pre-trained ML model for hazard spread prediction."""
        try:
            if model_path:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(model_path.replace('.pkl', '_scaler.pkl'))
            else:
                # Initialize default model (in production, load from Foundry)
                self.model = RandomForestRegressor(n_estimators=100, random_state=42)
                self.scaler = StandardScaler()
            logger.info("ML model loaded successfully")
        except Exception as e:
            logger.error("Failed to load ML model", error=str(e))
            raise
    
    def process_firms_data(self, firms_df: pd.DataFrame) -> gpd.GeoDataFrame:
        """Process NASA FIRMS satellite fire detection data."""
        try:
            # Convert to GeoDataFrame
            geometry = [Point(xy) for xy in zip(firms_df['longitude'], firms_df['latitude'])]
            gdf = gpd.GeoDataFrame(firms_df, geometry=geometry, crs="EPSG:4326")
            
            # Add H3 indices
            gdf['h3_index'] = gdf.apply(
                lambda row: h3.latlng_to_cell(row['latitude'], row['longitude'], self.h3_resolution), 
                axis=1
            )
            
            # Calculate confidence scores based on brightness temperature
            gdf['confidence'] = self._calculate_fire_confidence(gdf['brightness_temp'])
            
            # Add metadata
            gdf['data_source'] = 'NASA_FIRMS'
            gdf['processed_at'] = datetime.now()
            
            logger.info("FIRMS data processed", records=len(gdf))
            return gdf
            
        except Exception as e:
            logger.error("Error processing FIRMS data", error=str(e))
            raise
    
    def process_weather_data(self, weather_df: pd.DataFrame) -> gpd.GeoDataFrame:
        """Process NOAA weather data for wind and environmental conditions."""
        try:
            # Convert to GeoDataFrame
            geometry = [Point(xy) for xy in zip(weather_df['longitude'], weather_df['latitude'])]
            gdf = gpd.GeoDataFrame(weather_df, geometry=geometry, crs="EPSG:4326")
            
            # Add H3 indices
            gdf['h3_index'] = gdf.apply(
                lambda row: h3.latlng_to_cell(row['latitude'], row['longitude'], self.h3_resolution), 
                axis=1
            )
            
            # Calculate wind vectors
            gdf['wind_speed'] = np.sqrt(gdf['u_wind']**2 + gdf['v_wind']**2)
            gdf['wind_direction'] = np.arctan2(gdf['v_wind'], gdf['u_wind']) * 180 / np.pi
            
            # Add metadata
            gdf['data_source'] = 'NOAA_WEATHER'
            gdf['processed_at'] = datetime.now()
            
            logger.info("Weather data processed", records=len(gdf))
            return gdf
            
        except Exception as e:
            logger.error("Error processing weather data", error=str(e))
            raise
    
    def predict_hazard_spread(self, 
                            hazard_points: gpd.GeoDataFrame,
                            weather_data: gpd.GeoDataFrame,
                            terrain_data: gpd.GeoDataFrame = None) -> Dict[str, Any]:
        """Predict hazard spread patterns using ML model."""
        try:
            predictions = []
            
            for _, hazard in hazard_points.iterrows():
                # Generate prediction features
                features = self._extract_prediction_features(hazard, weather_data, terrain_data)
                
                if self.model is not None and features is not None:
                    # Make prediction
                    features_scaled = self.scaler.transform([features])
                    spread_probability = self.model.predict(features_scaled)[0]
                    
                    # Generate spread cells
                    spread_cells = self._generate_spread_cells(
                        hazard.geometry, 
                        spread_probability, 
                        weather_data
                    )
                    
                    predictions.append({
                        'hazard_id': hazard.get('id', f"hazard_{hazard.name}"),
                        'origin_h3': hazard['h3_index'],
                        'spread_probability': float(spread_probability),
                        'spread_cells': spread_cells,
                        'prediction_horizon_hours': self.prediction_horizon_hours,
                        'confidence': hazard.get('confidence', 0.8),
                        'predicted_at': datetime.now().isoformat()
                    })
            
            result = {
                'predictions': predictions,
                'total_hazards': len(predictions),
                'prediction_timestamp': datetime.now().isoformat(),
                'model_version': 'fire_spread_v1'
            }
            
            logger.info("Hazard spread predictions generated", 
                       predictions_count=len(predictions))
            return result
            
        except Exception as e:
            logger.error("Error predicting hazard spread", error=str(e))
            raise
    
    def calculate_risk_zones(self, 
                           hazard_data: gpd.GeoDataFrame,
                           population_data: gpd.GeoDataFrame = None) -> gpd.GeoDataFrame:
        """Calculate comprehensive risk zones with population impact."""
        try:
            risk_zones = []
            
            for _, hazard in hazard_data.iterrows():
                # Create buffer around hazard
                buffer_distance = self._get_buffer_distance(hazard.get('severity', 'medium'))
                hazard_buffer = hazard.geometry.buffer(buffer_distance / 111000)  # Convert meters to degrees
                
                # Calculate risk metrics
                risk_score = self._calculate_risk_score(hazard)
                
                # Estimate affected population if data available
                affected_population = 0
                if population_data is not None:
                    affected_population = self._estimate_affected_population(
                        hazard_buffer, population_data
                    )
                
                risk_zone = {
                    'hazard_id': hazard.get('id', f"hazard_{hazard.name}"),
                    'geometry': hazard_buffer,
                    'risk_score': risk_score,
                    'risk_level': self._categorize_risk(risk_score),
                    'affected_population': affected_population,
                    'severity': hazard.get('severity', 'medium'),
                    'hazard_type': hazard.get('type', 'fire'),
                    'detected_at': hazard.get('detected_at', datetime.now()),
                    'data_source': hazard.get('data_source', 'unknown'),
                    'confidence': hazard.get('confidence', 0.8)
                }
                
                risk_zones.append(risk_zone)
            
            # Create GeoDataFrame
            risk_gdf = gpd.GeoDataFrame(risk_zones, crs="EPSG:4326")
            
            logger.info("Risk zones calculated", zones_count=len(risk_zones))
            return risk_gdf
            
        except Exception as e:
            logger.error("Error calculating risk zones", error=str(e))
            raise
    
    def _calculate_fire_confidence(self, brightness_temp: pd.Series) -> pd.Series:
        """Calculate confidence scores based on brightness temperature."""
        # Higher brightness temperature = higher confidence
        min_temp = 300  # Kelvin
        max_temp = 400  # Kelvin
        confidence = (brightness_temp - min_temp) / (max_temp - min_temp)
        return np.clip(confidence, 0.1, 1.0)
    
    def _extract_prediction_features(self, 
                                   hazard: pd.Series,
                                   weather_data: gpd.GeoDataFrame,
                                   terrain_data: gpd.GeoDataFrame = None) -> Optional[List[float]]:
        """Extract features for ML prediction."""
        try:
            # Find nearest weather data
            nearest_weather = self._find_nearest_weather(hazard.geometry, weather_data)
            
            if nearest_weather is None:
                return None
            
            features = [
                hazard.get('brightness_temp', 350),  # Fire intensity
                nearest_weather['wind_speed'],
                nearest_weather['wind_direction'],
                nearest_weather.get('humidity', 50),
                nearest_weather.get('temperature', 20),
                hazard.get('confidence', 0.8),
                # Add terrain features if available
                terrain_data.get('slope', 0) if terrain_data is not None else 0,
                terrain_data.get('elevation', 0) if terrain_data is not None else 0
            ]
            
            return features
            
        except Exception as e:
            logger.error("Error extracting prediction features", error=str(e))
            return None
    
    def _generate_spread_cells(self, 
                             origin_geometry: Point,
                             spread_probability: float,
                             weather_data: gpd.GeoDataFrame) -> List[str]:
        """Generate H3 cells for predicted spread."""
        try:
            # Get wind direction from nearest weather data
            nearest_weather = self._find_nearest_weather(origin_geometry, weather_data)
            wind_direction = nearest_weather['wind_direction'] if nearest_weather else 0
            
            # Generate spread pattern based on wind direction and probability
            spread_cells = []
            origin_lat, origin_lng = origin_geometry.y, origin_geometry.x
            
            # Create spread pattern (simplified - in production use more sophisticated models)
            for hour in range(1, self.prediction_horizon_hours + 1):
                # Calculate spread distance based on probability and time
                spread_distance_km = spread_probability * hour * 2  # 2 km/hour base rate
                
                # Convert to lat/lng offset
                lat_offset = spread_distance_km * np.cos(np.radians(wind_direction)) / 111
                lng_offset = spread_distance_km * np.sin(np.radians(wind_direction)) / (111 * np.cos(np.radians(origin_lat)))
                
                spread_lat = origin_lat + lat_offset
                spread_lng = origin_lng + lng_offset
                
                # Get H3 cell
                spread_h3 = h3.latlng_to_cell(spread_lat, spread_lng, self.h3_resolution)
                spread_cells.append(spread_h3)
            
            return spread_cells
            
        except Exception as e:
            logger.error("Error generating spread cells", error=str(e))
            return []
    
    def _find_nearest_weather(self, geometry: Point, weather_data: gpd.GeoDataFrame) -> Optional[pd.Series]:
        """Find nearest weather data point."""
        try:
            distances = weather_data.geometry.distance(geometry)
            nearest_idx = distances.idxmin()
            return weather_data.loc[nearest_idx]
        except Exception:
            return None
    
    def _get_buffer_distance(self, severity: str) -> float:
        """Get buffer distance in meters based on severity."""
        buffer_distances = {
            'low': 1000,      # 1km
            'medium': 2500,   # 2.5km
            'high': 5000,     # 5km
            'critical': 10000 # 10km
        }
        return buffer_distances.get(severity, 2500)
    
    def _calculate_risk_score(self, hazard: pd.Series) -> float:
        """Calculate composite risk score."""
        # Base score from confidence
        base_score = hazard.get('confidence', 0.5)
        
        # Severity multiplier
        severity_multipliers = {
            'low': 0.5,
            'medium': 1.0,
            'high': 2.0,
            'critical': 4.0
        }
        severity_mult = severity_multipliers.get(hazard.get('severity', 'medium'), 1.0)
        
        # Type multiplier
        type_multipliers = {
            'fire': 1.0,
            'flood': 0.8,
            'chemical': 1.5,
            'other': 0.7
        }
        type_mult = type_multipliers.get(hazard.get('type', 'fire'), 1.0)
        
        return base_score * severity_mult * type_mult
    
    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize risk level based on score."""
        if risk_score >= 3.0:
            return 'critical'
        elif risk_score >= 2.0:
            return 'high'
        elif risk_score >= 1.0:
            return 'medium'
        else:
            return 'low'
    
    def _estimate_affected_population(self, 
                                    hazard_buffer: Polygon,
                                    population_data: gpd.GeoDataFrame) -> int:
        """Estimate population affected by hazard."""
        try:
            # Find population data within buffer
            affected_pop = population_data[population_data.geometry.within(hazard_buffer)]
            return int(affected_pop['population'].sum()) if len(affected_pop) > 0 else 0
        except Exception:
            return 0
