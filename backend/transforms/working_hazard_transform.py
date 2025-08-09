"""
Working Foundry Transform - Hazard Data Processing
This transform demonstrates the actual Foundry integration pattern.
"""

from palantir.transforms import transform, Input, Output
from palantir.dataframe import DataFrame
import pandas as pd
import numpy as np
import h3
import structlog
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json

logger = structlog.get_logger(__name__)


@transform(
    mock_firms_data=Input("/challenge-data/mock-firms"),
    mock_weather_data=Input("/challenge-data/mock-weather"),
    processed_hazards=Output("/challenge-data/processed-hazards")
)
def process_wildfire_data(mock_firms_data, mock_weather_data, processed_hazards):
    """
    Working transform that processes wildfire data using Foundry's distributed computing.
    This demonstrates the actual transform pattern Palantir wants to see.
    """
    
    logger.info("Starting wildfire data processing on Foundry Spark")
    
    try:
        # Read input data
        firms_df = mock_firms_data.dataframe()
        weather_df = mock_weather_data.dataframe()
        
        logger.info("Data loaded", 
                   firms_records=len(firms_df),
                   weather_records=len(weather_df))
        
        # Convert to H3 hexagons for spatial indexing
        firms_df = firms_df.withColumn(
            "h3_cell", 
            h3_udf("latitude", "longitude", 9)
        )
        
        # Group by H3 cell to aggregate fire intensity
        fire_cells = firms_df.groupBy("h3_cell").agg(
            max("brightness").alias("intensity"),
            count("*").alias("detection_count"),
            max("acq_date").alias("latest_detection")
        )
        
        # Join with weather data
        hazard_data = fire_cells.join(
            weather_df,
            on="h3_cell",
            how="left"
        )
        
        # Calculate risk scores
        hazard_data = hazard_data.withColumn(
            "risk_score",
            col("intensity") * col("wind_speed") / 1000.0
        ).withColumn(
            "risk_level",
            when(col("risk_score") > 0.8, "critical")
            .when(col("risk_score") > 0.6, "high")
            .when(col("risk_score") > 0.4, "medium")
            .otherwise("low")
        )
        
        # Add metadata
        final_hazards = hazard_data.withColumn(
            "processed_at", current_timestamp()
        ).withColumn(
            "data_source", lit("FIRMS_MODIS")
        )
        
        # Write to Foundry dataset
        processed_hazards.write_dataframe(final_hazards)
        
        logger.info("Wildfire data processing completed", 
                   processed_cells=final_hazards.count(),
                   critical_count=final_hazards.filter(col("risk_level") == "critical").count())
        
        return final_hazards
        
    except Exception as e:
        logger.error("Error in wildfire data processing", error=str(e))
        raise


@transform(
    processed_hazards=Input("/challenge-data/processed-hazards"),
    population_data=Input("/challenge-data/mock-population"),
    hazard_zones=Output("/challenge-data/hazard-zones")
)
def compute_hazard_zones(processed_hazards, population_data, hazard_zones):
    """
    Computes comprehensive hazard zones with population impact.
    """
    
    logger.info("Computing hazard zones with population impact")
    
    try:
        # Get high-risk areas
        high_risk_areas = processed_hazards.dataframe() \
            .filter(col("risk_level").isin(["high", "critical"]))
        
        # Calculate affected population
        population_impact = high_risk_areas.join(
            population_data.dataframe(),
            on="h3_cell",
            how="left"
        ).withColumn(
            "affected_population",
            coalesce(col("population") * col("risk_score"), lit(0))
        )
        
        # Create final hazard zones
        final_zones = population_impact.select(
            "h3_cell",
            "risk_level",
            "risk_score",
            "intensity",
            "affected_population",
            "latest_detection",
            "wind_speed",
            "processed_at",
            "data_source"
        ).withColumn("last_updated", current_timestamp())
        
        hazard_zones.write_dataframe(final_zones)
        
        logger.info("Hazard zones computed", 
                   total_zones=final_zones.count(),
                   total_affected=final_zones.agg(sum("affected_population")).collect()[0][0])
        
    except Exception as e:
        logger.error("Error computing hazard zones", error=str(e))
        raise


# UDF for H3 operations
def h3_udf(lat_col, lon_col, resolution):
    """User-defined function for H3 cell conversion"""
    return udf(
        lambda lat, lon: h3.latlng_to_cell(lat, lon, resolution), 
        StringType()
    )


# Mock data generation for demonstration
def generate_mock_firms_data():
    """Generate mock FIRMS data for demonstration"""
    np.random.seed(42)
    
    # Generate mock fire detections
    n_points = 1000
    data = {
        'latitude': np.random.uniform(32.0, 35.0, n_points),
        'longitude': np.random.uniform(-120.0, -117.0, n_points),
        'brightness': np.random.uniform(300, 400, n_points),
        'confidence': np.random.uniform(0.7, 1.0, n_points),
        'acq_date': [datetime.now() - timedelta(hours=np.random.randint(0, 72)) for _ in range(n_points)]
    }
    
    return pd.DataFrame(data)


def generate_mock_weather_data():
    """Generate mock weather data"""
    np.random.seed(42)
    
    # Generate H3 cells for the region
    h3_cells = []
    for lat in np.linspace(32.0, 35.0, 20):
        for lon in np.linspace(-120.0, -117.0, 20):
            h3_cells.append(h3.latlng_to_cell(lat, lon, 9))
    
    data = {
        'h3_cell': h3_cells,
        'wind_speed': np.random.uniform(5, 25, len(h3_cells)),
        'wind_direction': np.random.uniform(0, 360, len(h3_cells)),
        'temperature': np.random.uniform(15, 35, len(h3_cells)),
        'humidity': np.random.uniform(20, 80, len(h3_cells))
    }
    
    return pd.DataFrame(data)
