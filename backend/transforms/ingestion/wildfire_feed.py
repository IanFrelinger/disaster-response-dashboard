"""
Wildfire feed ingestion transform for FIRMS MODIS data.
Processes raw wildfire data and computes hazard zones.
"""

from ..api import transform, Input, Output
import geopandas as gpd
import pandas as pd
import h3
import structlog
from datetime import datetime, timedelta

logger = structlog.get_logger(__name__)


def compute_risk_scores(gdf):
    """Compute risk scores for wildfire zones based on various factors."""
    
    # Add risk scoring logic
    gdf['risk_score'] = 0.0
    
    # Factor 1: Fire intensity (brightness)
    if 'brightness' in gdf.columns:
        gdf['risk_score'] += gdf['brightness'] / 100.0
    
    # Factor 2: Fire size (confidence)
    if 'confidence' in gdf.columns:
        gdf['risk_score'] += gdf['confidence'] / 100.0
    
    # Factor 3: Time since detection (fresher fires = higher risk)
    if 'acq_date' in gdf.columns:
        gdf['acq_date'] = pd.to_datetime(gdf['acq_date'])
        days_old = (datetime.now() - gdf['acq_date']).dt.days
        gdf['risk_score'] += (7 - days_old) / 7.0  # Newer fires get higher scores
    
    # Factor 4: Weather conditions (if available)
    # This would integrate with weather data
    
    # Normalize risk scores to 0-1 range
    gdf['risk_score'] = gdf['risk_score'].clip(0, 1)
    
    # Categorize risk levels
    gdf['risk_level'] = pd.cut(
        gdf['risk_score'],
        bins=[0, 0.25, 0.5, 0.75, 1.0],
        labels=['low', 'medium', 'high', 'critical']
    )
    
    return gdf


@transform(
    wildfire_feed=Input("/data/raw/firms_modis"),
    hazard_zones=Output("/data/processed/hazard_zones")
)
def compute_hazard_zones(wildfire_feed, hazard_zones):
    """Transform to process wildfire feed and compute hazard zones."""
    
    logger.info("Starting wildfire hazard zone computation")
    
    try:
        # Read wildfire feed data
        gdf = wildfire_feed.read_dataframe()
        logger.info("Wildfire feed loaded", record_count=len(gdf))
        
        # Ensure we have geometry column
        if 'geometry' not in gdf.columns:
            # Create geometry from lat/lon if available
            if 'latitude' in gdf.columns and 'longitude' in gdf.columns:
                from shapely.geometry import Point
                gdf['geometry'] = gdf.apply(
                    lambda row: Point(row['longitude'], row['latitude']), axis=1
                )
                gdf = gpd.GeoDataFrame(gdf, crs='EPSG:4326')
            else:
                raise ValueError("No geometry column found in wildfire feed")
        
        # Convert to H3 hexagons for efficient spatial indexing
        gdf['h3_index'] = gdf.geometry.apply(
            lambda g: h3.geo_to_h3(g.y, g.x, resolution=9)
        )
        
        # Add metadata
        gdf['data_source'] = 'FIRMS'
        gdf['last_updated'] = datetime.now()
        
        # Compute risk scores
        risk_zones = compute_risk_scores(gdf)
        
        # Filter to recent fires (last 7 days)
        if 'acq_date' in risk_zones.columns:
            week_ago = datetime.now() - timedelta(days=7)
            risk_zones = risk_zones[risk_zones['acq_date'] >= week_ago]
        
        logger.info("Risk zones computed", 
                   total_zones=len(risk_zones),
                   high_risk_count=len(risk_zones[risk_zones['risk_level'] == 'high']),
                   critical_count=len(risk_zones[risk_zones['risk_level'] == 'critical']))
        
        # Write processed data
        hazard_zones.write_dataframe(risk_zones)
        
    except Exception as e:
        logger.error("Error processing wildfire feed", error=str(e))
        raise 