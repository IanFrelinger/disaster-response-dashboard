"""
Foundry Transforms API - Real-Time Hazard Data Pipeline
Leverages Palantir's distributed computing for processing millions of data points.
"""

from palantir.transforms import transform, Input, Output
from palantir.dataframe import DataFrame
import h3
import structlog
from datetime import datetime, timedelta
from typing import Dict, List, Any

logger = structlog.get_logger(__name__)


@transform(
    nasa_firms=Input("/raw/satellite/firms_modis"),
    noaa_weather=Input("/raw/weather/wind_speed"),
    emergency_calls=Input("/raw/911/fire_reports"),
    unified_hazards=Output("/processed/unified_hazards")
)
def unify_hazard_sources(nasa_firms, noaa_weather, emergency_calls, unified_hazards):
    """
    Runs on Foundry's Spark infrastructure - processes millions of points in seconds.
    Converts satellite hotspots to H3 cells and validates with 911 calls.
    """
    
    logger.info("Starting unified hazard processing on Foundry Spark")
    
    try:
        # Convert satellite hotspots to H3 cells using distributed computing
        fire_cells = nasa_firms.dataframe() \
            .withColumn("h3_cell", h3_udf("latitude", "longitude", 9)) \
            .groupBy("h3_cell") \
            .agg(
                max("brightness").alias("intensity"),
                count("*").alias("detection_count"),
                max("acq_date").alias("latest_detection")
            )
        
        # Merge with 911 calls for validation
        validated_hazards = fire_cells.join(
            emergency_calls.dataframe(),
            on="h3_cell",
            how="left"
        ).withColumn("confidence", 
            when(col("call_count") > 0, 1.0).otherwise(0.7)
        )
        
        # Add weather context
        weather_context = validated_hazards.join(
            noaa_weather.dataframe(),
            on="h3_cell",
            how="left"
        ).withColumn("wind_risk", 
            when(col("wind_speed") > 20, 1.5).otherwise(1.0)
        )
        
        # Calculate final risk scores
        final_hazards = weather_context.withColumn("risk_score",
            col("intensity") * col("confidence") * col("wind_risk") / 1000.0
        ).withColumn("risk_level",
            when(col("risk_score") > 0.8, "critical")
            .when(col("risk_score") > 0.6, "high")
            .when(col("risk_score") > 0.4, "medium")
            .otherwise("low")
        )
        
        # Write to Foundry dataset
        unified_hazards.write_dataframe(final_hazards)
        
        logger.info("Unified hazard processing completed", 
                   processed_cells=final_hazards.count(),
                   critical_count=final_hazards.filter(col("risk_level") == "critical").count())
        
    except Exception as e:
        logger.error("Error in unified hazard processing", error=str(e))
        raise


@transform(
    unified_hazards=Input("/processed/unified_hazards"),
    population_data=Input("/static/population/census_blocks"),
    building_footprints=Input("/static/buildings/osm_footprints"),
    hazard_zones=Output("/processed/hazard_zones")
)
def compute_hazard_zones(unified_hazards, population_data, building_footprints, hazard_zones):
    """
    Computes comprehensive hazard zones with affected population and buildings.
    """
    
    logger.info("Computing hazard zones with population impact")
    
    try:
        # Get high-risk areas
        high_risk_areas = unified_hazards.dataframe() \
            .filter(col("risk_level").isin(["high", "critical"]))
        
        # Calculate affected population
        population_impact = high_risk_areas.join(
            population_data.dataframe(),
            on="h3_cell",
            how="inner"
        ).withColumn("affected_population",
            col("population") * col("risk_score")
        )
        
        # Add building footprints
        building_impact = population_impact.join(
            building_footprints.dataframe(),
            on="h3_cell",
            how="left"
        ).withColumn("buildings_at_risk",
            when(col("building_count").isNotNull(), col("building_count"))
            .otherwise(0)
        )
        
        # Create final hazard zones
        final_zones = building_impact.select(
            "h3_cell",
            "risk_level",
            "risk_score",
            "intensity",
            "confidence",
            "affected_population",
            "buildings_at_risk",
            "latest_detection",
            "wind_speed"
        ).withColumn("geometry", h3_to_geometry_udf("h3_cell")) \
         .withColumn("last_updated", current_timestamp())
        
        hazard_zones.write_dataframe(final_zones)
        
        logger.info("Hazard zones computed", 
                   total_zones=final_zones.count(),
                   total_affected=final_zones.agg(sum("affected_population")).collect()[0][0])
        
    except Exception as e:
        logger.error("Error computing hazard zones", error=str(e))
        raise


# UDFs for H3 operations
def h3_udf(lat_col, lon_col, resolution):
    """User-defined function for H3 cell conversion"""
    return udf(lambda lat, lon: h3.latlng_to_cell(lat, lon, resolution), StringType())


def h3_to_geometry_udf(h3_col):
    """Convert H3 cell to geometry"""
    return udf(lambda h3_cell: h3.cell_to_boundary(h3_cell), GeometryType())
