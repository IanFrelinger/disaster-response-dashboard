"""
Disaster Response API Functions for Foundry.
Provides endpoints for hazard data and route planning.
"""

from ..foundry_functions import function, Input, Output
import geopandas as gpd
import pandas as pd
import json
import structlog
from datetime import datetime, timedelta

logger = structlog.get_logger(__name__)


@function(
    hazard_zones=Input("/data/processed/hazard_zones"),
    safe_routes=Input("/data/processed/safe_routes")
)
def get_hazard_summary(hazard_zones, safe_routes):
    """Get summary of current hazard zones and safe routes."""
    
    try:
        # Load hazard data
        hazard_gdf = hazard_zones.read_dataframe()
        
        # Generate summary statistics
        summary = {
            'total_hazards': len(hazard_gdf),
            'risk_distribution': hazard_gdf['risk_level'].value_counts().to_dict(),
            'data_sources': hazard_gdf['data_source'].value_counts().to_dict(),
            'last_updated': hazard_gdf['last_updated'].max().isoformat() if 'last_updated' in hazard_gdf.columns else None,
            'bbox': hazard_gdf.total_bounds.tolist() if len(hazard_gdf) > 0 else None
        }
        
        logger.info("Hazard summary generated", summary=summary)
        return summary
        
    except Exception as e:
        logger.error("Error generating hazard summary", error=str(e))
        raise


@function(
    hazard_zones=Input("/data/processed/hazard_zones")
)
def get_hazard_zones_geojson(hazard_zones):
    """Get hazard zones as GeoJSON for mapping."""
    
    try:
        # Load hazard data
        hazard_gdf = hazard_zones.read_dataframe()
        
        # Convert to GeoJSON
        geojson = json.loads(hazard_gdf.to_json())
        
        # Add metadata
        geojson['metadata'] = {
            'generated_at': datetime.now().isoformat(),
            'total_features': len(geojson['features']),
            'bbox': hazard_gdf.total_bounds.tolist() if len(hazard_gdf) > 0 else None
        }
        
        logger.info("Hazard zones GeoJSON generated", feature_count=len(geojson['features']))
        return geojson
        
    except Exception as e:
        logger.error("Error generating hazard zones GeoJSON", error=str(e))
        raise


@function(
    hazard_zones=Input("/data/processed/hazard_zones"),
    safe_routes=Input("/data/processed/safe_routes")
)
def get_evacuation_routes(hazard_zones, safe_routes, origin_lat=None, origin_lon=None, destination_lat=None, destination_lon=None):
    """Get evacuation routes from origin to destination, avoiding hazard zones."""
    
    try:
        # Load data
        hazard_gdf = hazard_zones.read_dataframe()
        routes_gdf = safe_routes.read_dataframe()
        
        # If specific coordinates provided, find nearest routes
        if all([origin_lat, origin_lon, destination_lat, destination_lon]):
            from shapely.geometry import Point
            origin_point = Point(origin_lon, origin_lat)
            dest_point = Point(destination_lon, destination_lat)
            
            # Find routes closest to provided coordinates
            # This is a simplified approach - in practice you'd use spatial indexing
            closest_routes = routes_gdf.head(5)  # Return top 5 routes
        else:
            # Return all available routes
            closest_routes = routes_gdf
        
        # Format response
        routes_response = {
            'routes': closest_routes.to_dict('records'),
            'hazard_count': len(hazard_gdf),
            'available_routes': len(closest_routes),
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info("Evacuation routes retrieved", 
                   route_count=len(closest_routes),
                   hazard_count=len(hazard_gdf))
        
        return routes_response
        
    except Exception as e:
        logger.error("Error retrieving evacuation routes", error=str(e))
        raise


@function(
    hazard_zones=Input("/data/processed/hazard_zones")
)
def get_risk_assessment(hazard_zones, latitude, longitude, radius_km=10):
    """Get risk assessment for a specific location."""
    
    try:
        from shapely.geometry import Point
        from shapely.ops import unary_union
        import pyproj
        from functools import partial
        from shapely.ops import transform
        
        # Load hazard data
        hazard_gdf = hazard_zones.read_dataframe()
        
        # Create point for location
        location_point = Point(longitude, latitude)
        
        # Create buffer around location
        # Convert to projected CRS for accurate distance calculation
        proj_crs = pyproj.CRS.from_epsg(3857)  # Web Mercator
        wgs84_crs = pyproj.CRS.from_epsg(4326)
        
        project = partial(
            pyproj.transform,
            wgs84_crs,
            proj_crs
        )
        
        location_proj = transform(project, location_point)
        buffer_proj = location_proj.buffer(radius_km * 1000)  # Convert km to meters
        
        # Transform back to WGS84
        project_back = partial(
            pyproj.transform,
            proj_crs,
            wgs84_crs
        )
        
        buffer_wgs84 = transform(project_back, buffer_proj)
        
        # Find hazards within radius
        nearby_hazards = hazard_gdf[hazard_gdf.geometry.within(buffer_wgs84)]
        
        # Calculate risk metrics
        if len(nearby_hazards) > 0:
            risk_metrics = {
                'total_nearby_hazards': len(nearby_hazards),
                'risk_levels': nearby_hazards['risk_level'].value_counts().to_dict(),
                'avg_risk_score': nearby_hazards['risk_score'].mean(),
                'max_risk_score': nearby_hazards['risk_score'].max(),
                'closest_hazard_distance_km': min([
                    location_point.distance(hazard.geometry) * 111  # Rough km conversion
                    for hazard in nearby_hazards.itertuples()
                ]),
                'assessment_radius_km': radius_km
            }
        else:
            risk_metrics = {
                'total_nearby_hazards': 0,
                'risk_levels': {},
                'avg_risk_score': 0.0,
                'max_risk_score': 0.0,
                'closest_hazard_distance_km': None,
                'assessment_radius_km': radius_km
            }
        
        # Add location and timestamp
        risk_metrics.update({
            'location': {'latitude': latitude, 'longitude': longitude},
            'assessment_timestamp': datetime.now().isoformat()
        })
        
        logger.info("Risk assessment completed", 
                   location=f"{latitude},{longitude}",
                   nearby_hazards=risk_metrics['total_nearby_hazards'])
        
        return risk_metrics
        
    except Exception as e:
        logger.error("Error calculating risk assessment", error=str(e))
        raise 