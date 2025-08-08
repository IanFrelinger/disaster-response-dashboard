"""
Foundry AIP (AI Platform) - Fire Spread Prediction Model
Leverages Foundry's AutoML and real-time inference capabilities.
"""

from palantir.aip import aip_model, aip_inference, aip_logic
from palantir.ontology import HazardZone, EvacuationRoute
from palantir.dataframe import DataFrame
import h3
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import structlog

logger = structlog.get_logger(__name__)


@aip_model(
    name="wildfire_spread_predictor",
    version="3.2",
    training_data=Input("/historical/fire_progressions"),
    description="Predicts wildfire spread using weather, terrain, and fuel data"
)
class FireSpreadModel:
    """AI model for predicting wildfire spread patterns"""
    
    def __init__(self):
        self.model = None
        self.feature_columns = [
            'wind_speed', 'wind_direction', 'temperature', 'humidity',
            'fuel_moisture', 'terrain_slope', 'vegetation_type', 'elevation'
        ]
        self.target_column = 'spread_rate_mph'
    
    def train(self, historical_fires: DataFrame):
        """Train the model using Foundry's AutoML capabilities"""
        logger.info("Starting fire spread model training")
        
        try:
            # Extract features from historical data
            features = self.extract_features(historical_fires)
            
            # Use Foundry's AutoML for optimal model selection
            self.model = FoundryAutoML.train(
                features=features,
                target=self.target_column,
                algorithm="gradient_boosting",
                hyperparameter_tuning=True,
                cross_validation_folds=5,
                evaluation_metrics=["rmse", "mae", "r2"]
            )
            
            # Log model performance
            performance = self.model.evaluate(features)
            logger.info("Model training completed", 
                       r2_score=performance['r2'],
                       rmse=performance['rmse'],
                       mae=performance['mae'])
            
        except Exception as e:
            logger.error("Error training fire spread model", error=str(e))
            raise
    
    def extract_features(self, fire_data: DataFrame) -> DataFrame:
        """Extract and engineer features from fire progression data"""
        
        # Time-based features
        features = fire_data.withColumn("hours_since_start",
            (col("timestamp") - col("fire_start_time")).cast("double") / 3600
        )
        
        # Weather features
        features = features.withColumn("wind_risk",
            when(col("wind_speed") > 20, 1.5)
            .when(col("wind_speed") > 15, 1.2)
            .otherwise(1.0)
        )
        
        # Terrain features
        features = features.withColumn("slope_risk",
            when(col("terrain_slope") > 30, 1.3)
            .when(col("terrain_slope") > 15, 1.1)
            .otherwise(1.0)
        )
        
        # Fuel features
        features = features.withColumn("fuel_risk",
            when(col("fuel_moisture") < 10, 1.4)
            .when(col("fuel_moisture") < 20, 1.2)
            .otherwise(1.0)
        )
        
        # Combine risk factors
        features = features.withColumn("combined_risk",
            col("wind_risk") * col("slope_risk") * col("fuel_risk")
        )
        
        return features.select(self.feature_columns + [self.target_column])
    
    @aip_inference(batch_size=1000, cache_duration=300)
    def predict_spread(self, current_fire: HazardZone) -> Dict[str, Any]:
        """Predict fire spread for the next 2 hours"""
        
        try:
            # Real-time feature extraction
            features = self.extract_current_features(current_fire)
            
            # Make prediction
            prediction = self.model.predict(features)
            confidence = self.model.confidence_score(features)
            
            # Convert prediction to affected H3 cells
            affected_cells = self.predict_affected_cells(
                current_fire.h3_cell_id,
                prediction,
                features
            )
            
            return {
                "affected_cells": affected_cells,
                "spread_rate_mph": prediction,
                "confidence": confidence,
                "time_horizon": "2_hours",
                "prediction_timestamp": datetime.now().isoformat(),
                "fire_id": current_fire.h3_cell_id
            }
            
        except Exception as e:
            logger.error("Error predicting fire spread", error=str(e))
            return {
                "error": "Prediction failed",
                "fire_id": current_fire.h3_cell_id
            }
    
    def extract_current_features(self, fire: HazardZone) -> Dict[str, float]:
        """Extract current environmental features for prediction"""
        
        # Get current weather at fire location
        weather = self.get_current_weather(fire.h3_cell_id)
        
        # Get terrain data
        terrain = self.get_terrain_data(fire.h3_cell_id)
        
        # Get fuel moisture
        fuel = self.get_fuel_moisture(fire.h3_cell_id)
        
        return {
            "wind_speed": weather.get("wind_speed", 0.0),
            "wind_direction": weather.get("wind_direction", 0.0),
            "temperature": weather.get("temperature", 20.0),
            "humidity": weather.get("humidity", 50.0),
            "fuel_moisture": fuel.get("moisture", 15.0),
            "terrain_slope": terrain.get("slope", 5.0),
            "vegetation_type": terrain.get("vegetation", "mixed"),
            "elevation": terrain.get("elevation", 100.0)
        }
    
    def predict_affected_cells(self, origin_cell: str, spread_rate: float, 
                             features: Dict[str, float]) -> List[str]:
        """Predict which H3 cells will be affected"""
        
        affected_cells = []
        origin_lat, origin_lon = h3.cell_to_latlng(origin_cell)
        
        # Calculate spread distance (2 hours * spread rate)
        spread_distance_km = spread_rate * 2.0
        
        # Get neighboring cells within spread distance
        radius_cells = h3.grid_disk(origin_cell, radius=5)  # Adjust based on spread rate
        
        for cell in radius_cells:
            cell_lat, cell_lon = h3.cell_to_latlng(cell)
            distance = self.calculate_distance(origin_lat, origin_lon, cell_lat, cell_lon)
            
            # Adjust for wind direction
            wind_adjusted_distance = self.adjust_for_wind(
                distance, features["wind_direction"], origin_lat, origin_lon, cell_lat, cell_lon
            )
            
            if wind_adjusted_distance <= spread_distance_km:
                affected_cells.append(cell)
        
        return affected_cells
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in km"""
        from math import radians, cos, sin, asin, sqrt
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371  # Earth's radius in km
        
        return c * r
    
    def adjust_for_wind(self, distance: float, wind_direction: float, 
                       lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Adjust distance based on wind direction"""
        
        # Calculate bearing between points
        bearing = self.calculate_bearing(lat1, lon1, lat2, lon2)
        
        # Wind direction difference
        wind_diff = abs(bearing - wind_direction)
        if wind_diff > 180:
            wind_diff = 360 - wind_diff
        
        # Adjust distance based on wind alignment
        if wind_diff < 45:  # Downwind
            return distance * 0.7
        elif wind_diff < 90:  # Crosswind
            return distance * 1.0
        else:  # Upwind
            return distance * 1.5
    
    def calculate_bearing(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate bearing between two points"""
        from math import radians, cos, sin, atan2
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2 - lon1
        
        y = sin(dlon) * cos(lat2)
        x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dlon)
        
        bearing = atan2(y, x)
        return (bearing * 180 / 3.14159 + 360) % 360
    
    def get_current_weather(self, h3_cell: str) -> Dict[str, float]:
        """Get current weather data for H3 cell"""
        # In real implementation, this would query weather API
        return {
            "wind_speed": 15.0,
            "wind_direction": 270.0,
            "temperature": 25.0,
            "humidity": 40.0
        }
    
    def get_terrain_data(self, h3_cell: str) -> Dict[str, Any]:
        """Get terrain data for H3 cell"""
        # In real implementation, this would query terrain API
        return {
            "slope": 10.0,
            "vegetation": "mixed",
            "elevation": 150.0
        }
    
    def get_fuel_moisture(self, h3_cell: str) -> Dict[str, float]:
        """Get fuel moisture data for H3 cell"""
        # In real implementation, this would query fuel moisture API
        return {
            "moisture": 12.0
        }


@aip_logic(
    name="evacuation_assistant",
    description="Helps commanders make evacuation decisions using natural language"
)
def assist_evacuation_decision(query: str) -> str:
    """
    Natural language interface for evacuation decisions
    Example: "Should we evacuate Pine Valley?"
    """
    
    try:
        # Extract location from query
        location = extract_location_from_query(query)
        if not location:
            return "I couldn't identify a location in your query. Please specify a location."
        
        # Get current hazards
        hazards = HazardZone.objects() \
            .filter(distance_from(location) < 5000) \
            .order_by("risk_level", descending=True)
        
        if not hazards.exists():
            return f"No active hazards detected near {location}. Area appears safe."
        
        # Get fire spread prediction
        nearest_hazard = hazards.first()
        prediction = FireSpreadModel().predict_spread(nearest_hazard)
        
        # Get population data
        population = get_population_at_location(location)
        
        # Get evacuation routes
        routes = EvacuationRoute.objects() \
            .filter(status="safe") \
            .filter(distance_from(location) < 10000) \
            .order_by("distance_km")
        
        # Generate recommendation
        if prediction.get("affected_cells") and location in prediction["affected_cells"]:
            recommendation = f"YES, evacuate immediately. Fire predicted to reach {location} in approximately {prediction['spread_rate_mph'] * 2:.0f} minutes. "
        elif nearest_hazard.risk_level in ["high", "critical"]:
            recommendation = f"YES, evacuate as a precaution. {nearest_hazard.risk_level.upper()} risk fire {prediction.get('spread_rate_mph', 0) * 2:.0f} minutes away. "
        else:
            recommendation = f"Monitor situation. {nearest_hazard.risk_level.upper()} risk fire in area. "
        
        # Add details
        details = f"Affected population: {population}. "
        if routes.exists():
            details += f"Available routes: {routes.count()}. "
            nearest_route = routes.first()
            details += f"Nearest route: {nearest_route.distance_km:.1f}km ({nearest_route.estimated_time_minutes} minutes)."
        
        return recommendation + details
        
    except Exception as e:
        logger.error("Error in evacuation assistant", error=str(e))
        return "I'm unable to provide evacuation advice at this time. Please contact emergency services directly."


def extract_location_from_query(query: str) -> str:
    """Extract location from natural language query"""
    # Simple location extraction - in real implementation would use NLP
    query_lower = query.lower()
    
    # Common location patterns
    if "pine valley" in query_lower:
        return "Pine Valley"
    elif "oak ridge" in query_lower:
        return "Oak Ridge"
    elif "maple street" in query_lower:
        return "Maple Street"
    
    return None


def get_population_at_location(location: str) -> int:
    """Get population at specific location"""
    # In real implementation, this would query population data
    return 3241  # Example population
