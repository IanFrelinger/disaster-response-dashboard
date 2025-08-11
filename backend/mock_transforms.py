"""
Mock Palantir Transforms Module for Demo Environment
This provides the necessary functions to run the transform implementations
in a demo environment without requiring the actual Foundry platform.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import structlog

logger = structlog.get_logger(__name__)


def process_wildfire_data(firms_raw, weather_raw, population_raw, processed_hazards):
    """
    Mock implementation of wildfire data processing transform
    This simulates the actual Foundry transform behavior
    """
    logger.info("Starting wildfire data processing on Foundry Spark")
    
    try:
        # Read input data
        firms_df = firms_raw.dataframe()
        weather_df = weather_raw.dataframe()
        population_df = population_raw.dataframe()
        
        logger.info("Data loaded", 
                   firms_records=len(firms_df),
                   weather_records=len(weather_df),
                   population_records=len(population_df))
        
        # Convert satellite hotspots to H3 hexagons using distributed computing
        # Simulate H3 conversion
        firms_df['h3_cell'] = firms_df.apply(
            lambda row: f"8928308284{hash((row['latitude'], row['longitude'])) % 100000:05d}", 
            axis=1
        )
        
        # Group by H3 cell and aggregate
        fire_cells = firms_df.groupby('h3_cell').agg({
            'brightness': 'max',
            'latitude': 'first',
            'longitude': 'first'
        }).reset_index()
        fire_cells.rename(columns={'brightness': 'intensity'}, inplace=True)
        
        # Join with weather data for context
        hazard_data = pd.merge(
            fire_cells, 
            weather_df, 
            on='h3_cell', 
            how='left'
        )
        
        # Calculate risk scores with weather factors
        hazard_data['risk_score'] = (
            hazard_data['intensity'] * 
            hazard_data['wind_speed'].fillna(1.0) / 1000.0
        )
        
        # Add risk levels
        hazard_data['risk_level'] = np.where(
            hazard_data['risk_score'] > 0.8, 'critical',
            np.where(hazard_data['risk_score'] > 0.6, 'high',
            np.where(hazard_data['risk_score'] > 0.4, 'medium', 'low'))
        )
        
        # Join with population data for impact assessment
        population_impact = pd.merge(
            hazard_data, 
            population_df, 
            on='h3_cell', 
            how='left'
        )
        
        # Calculate affected population
        population_impact['affected_population'] = (
            population_impact['population'].fillna(0) * 
            population_impact['risk_score']
        )
        
        # Add metadata and timestamps
        final_hazards = population_impact.copy()
        final_hazards['processed_at'] = datetime.now()
        final_hazards['data_source'] = 'FIRMS_MODIS'
        final_hazards['transform_version'] = '1.0'
        
        # Write to Foundry dataset (mock)
        processed_hazards.write_dataframe(final_hazards)
        
        logger.info("Wildfire data processing completed", 
                   processed_cells=len(final_hazards),
                   critical_count=len(final_hazards[final_hazards['risk_level'] == 'critical']),
                   total_affected=final_hazards['affected_population'].sum())
        
        return final_hazards
        
    except Exception as e:
        logger.error(f"Error in wildfire data processing: {e}")
        raise


def compute_hazard_zones(processed_hazards, terrain_data, hazard_zones):
    """
    Mock implementation of hazard zone computation transform
    """
    logger.info("Starting hazard zone computation")
    
    try:
        # Read processed hazards
        hazards_df = processed_hazards.dataframe()
        terrain_df = terrain_data.dataframe()
        
        # Join with terrain data
        hazard_zones_df = pd.merge(
            hazards_df, 
            terrain_df, 
            on='h3_cell', 
            how='left'
        )
        
        # Add terrain-based risk factors
        hazard_zones_df['terrain_risk'] = np.where(
            hazard_zones_df['elevation'] > 1000, 1.2, 1.0
        )
        
        # Adjust risk scores with terrain
        hazard_zones_df['adjusted_risk_score'] = (
            hazard_zones_df['risk_score'] * 
            hazard_zones_df['terrain_risk']
        )
        
        # Update risk levels based on adjusted scores
        hazard_zones_df['final_risk_level'] = np.where(
            hazard_zones_df['adjusted_risk_score'] > 0.8, 'critical',
            np.where(hazard_zones_df['adjusted_risk_score'] > 0.6, 'high',
            np.where(hazard_zones_df['adjusted_risk_score'] > 0.4, 'medium', 'low'))
        )
        
        # Add zone metadata
        hazard_zones_df['zone_id'] = [
            f"zone_{i:04d}" for i in range(len(hazard_zones_df))
        ]
        hazard_zones_df['created_at'] = datetime.now()
        
        # Write to Foundry dataset (mock)
        hazard_zones.write_dataframe(hazard_zones_df)
        
        logger.info("Hazard zone computation completed", 
                   zones_created=len(hazard_zones_df),
                   critical_zones=len(hazard_zones_df[hazard_zones_df['final_risk_level'] == 'critical']))
        
        return hazard_zones_df
        
    except Exception as e:
        logger.error(f"Error in hazard zone computation: {e}")
        raise


def optimize_evacuation_routes(hazard_zones, evacuation_routes):
    """
    Mock implementation of evacuation route optimization transform
    """
    logger.info("Starting evacuation route optimization")
    
    try:
        # Read hazard zones
        zones_df = hazard_zones.dataframe()
        
        # Generate evacuation routes for each critical zone
        critical_zones = zones_df[zones_df['final_risk_level'] == 'critical']
        
        routes = []
        for idx, zone in critical_zones.iterrows():
            # Generate multiple route options
            for route_num in range(3):  # 3 routes per zone
                route = {
                    'route_id': f"route_{zone['zone_id']}_{route_num:02d}",
                    'origin_h3': zone['h3_cell'],
                    'destination_h3': f"safe_{zone['h3_cell']}",
                    'distance': np.random.uniform(2.0, 8.0),
                    'capacity': int(zone['affected_population'] * (1 + route_num * 0.5)),
                    'risk_score': zone['adjusted_risk_score'],
                    'status': 'available',
                    'created_at': datetime.now()
                }
                routes.append(route)
        
        routes_df = pd.DataFrame(routes)
        
        # Write to Foundry dataset (mock)
        evacuation_routes.write_dataframe(routes_df)
        
        logger.info("Evacuation route optimization completed", 
                   routes_created=len(routes_df),
                   zones_covered=len(critical_zones))
        
        return routes_df
        
    except Exception as e:
        logger.error(f"Error in evacuation route optimization: {e}")
        raise


def h3_udf(lat_col, lon_col, resolution):
    """
    Mock H3 UDF function for converting lat/lon to H3 cells
    """
    def _h3_convert(df):
        return df.apply(
            lambda row: f"8928308284{hash((row[lat_col], row[lon_col])) % 100000:05d}", 
            axis=1
        )
    return _h3_convert


def generate_route_options(origin_h3, risk_score):
    """
    Mock function to generate evacuation route options
    """
    routes = []
    for i in range(3):
        route = {
            'route_id': f"route_{origin_h3}_{i:02d}",
            'distance': np.random.uniform(2.0, 8.0),
            'capacity': int(1000 * (1 + i * 0.5)),
            'risk_level': 'low' if i == 0 else 'medium'
        }
        routes.append(route)
    
    return routes


def calculate_spread_probability(intensity, wind_speed, elevation):
    """
    Mock function to calculate fire spread probability
    """
    base_prob = intensity / 1000.0
    wind_factor = min(wind_speed / 30.0, 2.0)
    elevation_factor = 1.0 + (elevation / 2000.0) * 0.5
    
    return min(base_prob * wind_factor * elevation_factor, 1.0)


def estimate_evacuation_time(population, route_capacity):
    """
    Mock function to estimate evacuation time
    """
    if route_capacity <= 0:
        return float('inf')
    
    # Simple estimation: 2 minutes per 100 people
    return (population / route_capacity) * 2.0
