"""
Street Data API for disaster response routing.
Provides street network data in the same format as "Where am I" app.
"""

from foundry_functions import function, Input, Output
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point, LineString
import structlog
from datetime import datetime
import json

logger = structlog.get_logger(__name__)

@function(
    street_network=Input("/data/static/street_network"),
    hazard_zones=Input("/data/processed/hazard_zones")
)
def get_street_data(street_network, hazard_zones, lat, lon, radius=10000, 
                   street_types=None, access_types=None, max_speed=None, 
                   min_lanes=None, emergency_access_only=False, 
                   evacuation_routes_only=False):
    """
    Get street data for a specific area with filtering options.
    Matches the "Where am I" app data format.
    """
    try:
        # Load street network data
        streets_gdf = street_network.read_dataframe()
        hazard_gdf = hazard_zones.read_dataframe() if hazard_zones else gpd.GeoDataFrame()
        
        # Create point for query
        query_point = Point(lon, lat)
        
        # Filter by radius
        streets_gdf['distance'] = streets_gdf.geometry.distance(query_point)
        streets_gdf = streets_gdf[streets_gdf['distance'] <= radius / 111000]  # Convert meters to degrees
        
        # Apply filters
        if street_types:
            street_type_list = street_types.split(',')
            streets_gdf = streets_gdf[streets_gdf['highway'].isin(street_type_list)]
        
        if access_types:
            access_list = access_types.split(',')
            streets_gdf = streets_gdf[streets_gdf['access'].isin(access_list)]
        
        if max_speed:
            streets_gdf = streets_gdf[streets_gdf['maxspeed'] <= max_speed]
        
        if min_lanes:
            streets_gdf = streets_gdf[streets_gdf['lanes'] >= min_lanes]
        
        if emergency_access_only:
            streets_gdf = streets_gdf[streets_gdf['emergency_access'] == True]
        
        if evacuation_routes_only:
            streets_gdf = streets_gdf[streets_gdf['evacuation_route'] == True]
        
        # Convert to "Where am I" format
        street_segments = []
        for idx, row in streets_gdf.iterrows():
            # Check if street intersects with hazard zones
            hazard_zone = False
            if not hazard_gdf.empty:
                for _, hazard in hazard_gdf.iterrows():
                    if row.geometry.intersects(hazard.geometry):
                        hazard_zone = True
                        break
            
            # Convert geometry to coordinates
            if hasattr(row.geometry, 'coords'):
                coordinates = list(row.geometry.coords)
            else:
                coordinates = []
            
            street_segment = {
                'id': str(row.get('osm_id', idx)),
                'name': row.get('name', 'Unnamed Street'),
                'type': row.get('highway', 'residential'),
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinates
                },
                'properties': {
                    'length_m': float(row.get('length', 0)) * 111000,  # Convert degrees to meters
                    'speed_limit_kmh': float(row.get('maxspeed', 50)),
                    'lanes': int(row.get('lanes', 1)),
                    'one_way': bool(row.get('oneway', False)),
                    'surface': row.get('surface', 'paved'),
                    'width_m': float(row.get('width', 3.5)),
                    'max_weight_kg': float(row.get('maxweight', 3500)),
                    'max_height_m': float(row.get('maxheight', 4.0)),
                    'max_width_m': float(row.get('maxwidth', 2.5)),
                    'bridge': bool(row.get('bridge', False)),
                    'tunnel': bool(row.get('tunnel', False)),
                    'access': row.get('access', 'yes'),
                    'emergency_access': bool(row.get('emergency_access', True)),
                    'evacuation_route': bool(row.get('evacuation_route', False)),
                    'hazard_zone': hazard_zone,
                    'traffic_signals': bool(row.get('traffic_signals', False)),
                    'stop_signs': bool(row.get('stop_signs', False)),
                    'yield_signs': bool(row.get('yield_signs', False)),
                    'roundabouts': bool(row.get('roundabout', False)),
                    'traffic_calming': bool(row.get('traffic_calming', False)),
                    'lighting': bool(row.get('lit', True)),
                    'sidewalk': bool(row.get('sidewalk', True)),
                    'bike_lane': bool(row.get('bicycle', False)),
                    'bus_lane': bool(row.get('bus_lane', False)),
                    'hov_lane': bool(row.get('hov_lane', False)),
                    'toll': bool(row.get('toll', False)),
                    'seasonal': bool(row.get('seasonal', False)),
                    'condition': row.get('condition', 'good'),
                    'last_updated': datetime.now().isoformat()
                }
            }
            street_segments.append(street_segment)
        
        # Calculate query bounds
        if not streets_gdf.empty:
            bounds = streets_gdf.total_bounds
            query_bounds = {
                'north': bounds[3],
                'south': bounds[1],
                'east': bounds[2],
                'west': bounds[0]
            }
        else:
            query_bounds = {'north': lat, 'south': lat, 'east': lon, 'west': lon}
        
        response = {
            'success': True,
            'streets': street_segments,
            'total_count': len(street_segments),
            'query_bounds': query_bounds,
            'metadata': {
                'query_time_ms': 0,  # Would be calculated in real implementation
                'cache_hit': False
            }
        }
        
        logger.info("Street data retrieved", 
                   count=len(street_segments),
                   radius_m=radius,
                   filters_applied=bool(street_types or access_types or max_speed or min_lanes))
        
        return response
        
    except Exception as e:
        logger.error("Error retrieving street data", error=str(e))
        return {
            'success': False,
            'streets': [],
            'total_count': 0,
            'query_bounds': {'north': lat, 'south': lat, 'east': lon, 'west': lon},
            'metadata': {'query_time_ms': 0, 'cache_hit': False}
        }

@function(
    street_network=Input("/data/static/street_network")
)
def get_nearest_street(street_network, lat, lon, max_distance=1000):
    """
    Find the nearest street to a given point.
    """
    try:
        streets_gdf = street_network.read_dataframe()
        query_point = Point(lon, lat)
        
        # Calculate distances
        streets_gdf['distance'] = streets_gdf.geometry.distance(query_point)
        
        # Filter by max distance
        max_distance_degrees = max_distance / 111000
        streets_gdf = streets_gdf[streets_gdf['distance'] <= max_distance_degrees]
        
        if streets_gdf.empty:
            return {'success': False, 'street': None}
        
        # Get nearest street
        nearest_idx = streets_gdf['distance'].idxmin()
        nearest_street = streets_gdf.loc[nearest_idx]
        
        # Convert to street segment format
        street_segment = {
            'id': str(nearest_street.get('osm_id', nearest_idx)),
            'name': nearest_street.get('name', 'Unnamed Street'),
            'type': nearest_street.get('highway', 'residential'),
            'geometry': {
                'type': 'LineString',
                'coordinates': list(nearest_street.geometry.coords)
            },
            'properties': {
                'length_m': float(nearest_street.get('length', 0)) * 111000,
                'speed_limit_kmh': float(nearest_street.get('maxspeed', 50)),
                'lanes': int(nearest_street.get('lanes', 1)),
                'one_way': bool(nearest_street.get('oneway', False)),
                'surface': nearest_street.get('surface', 'paved'),
                'width_m': float(nearest_street.get('width', 3.5)),
                'max_weight_kg': float(nearest_street.get('maxweight', 3500)),
                'max_height_m': float(nearest_street.get('maxheight', 4.0)),
                'max_width_m': float(nearest_street.get('maxwidth', 2.5)),
                'bridge': bool(nearest_street.get('bridge', False)),
                'tunnel': bool(nearest_street.get('tunnel', False)),
                'access': nearest_street.get('access', 'yes'),
                'emergency_access': bool(nearest_street.get('emergency_access', True)),
                'evacuation_route': bool(nearest_street.get('evacuation_route', False)),
                'hazard_zone': False,
                'traffic_signals': bool(nearest_street.get('traffic_signals', False)),
                'stop_signs': bool(nearest_street.get('stop_signs', False)),
                'yield_signs': bool(nearest_street.get('yield_signs', False)),
                'roundabouts': bool(nearest_street.get('roundabout', False)),
                'traffic_calming': bool(nearest_street.get('traffic_calming', False)),
                'lighting': bool(nearest_street.get('lit', True)),
                'sidewalk': bool(nearest_street.get('sidewalk', True)),
                'bike_lane': bool(nearest_street.get('bicycle', False)),
                'bus_lane': bool(nearest_street.get('bus_lane', False)),
                'hov_lane': bool(nearest_street.get('hov_lane', False)),
                'toll': bool(nearest_street.get('toll', False)),
                'seasonal': bool(nearest_street.get('seasonal', False)),
                'condition': nearest_street.get('condition', 'good'),
                'last_updated': datetime.now().isoformat()
            }
        }
        
        logger.info("Nearest street found", 
                   distance_m=float(nearest_street['distance'] * 111000),
                   street_name=street_segment['name'])
        
        return {'success': True, 'street': street_segment}
        
    except Exception as e:
        logger.error("Error finding nearest street", error=str(e))
        return {'success': False, 'street': None}

@function(
    street_network=Input("/data/static/street_network")
)
def get_evacuation_routes(street_network, north, south, east, west):
    """
    Get evacuation routes within specified bounds.
    """
    try:
        streets_gdf = street_network.read_dataframe()
        
        # Filter by bounds
        bounds_filter = (
            (streets_gdf.geometry.bounds['minx'] >= west) &
            (streets_gdf.geometry.bounds['maxx'] <= east) &
            (streets_gdf.geometry.bounds['miny'] >= south) &
            (streets_gdf.geometry.bounds['maxy'] <= north)
        )
        streets_gdf = streets_gdf[bounds_filter]
        
        # Filter for evacuation routes
        streets_gdf = streets_gdf[streets_gdf['evacuation_route'] == True]
        
        # Convert to street segments
        evacuation_routes = []
        for idx, row in streets_gdf.iterrows():
            street_segment = {
                'id': str(row.get('osm_id', idx)),
                'name': row.get('name', 'Evacuation Route'),
                'type': row.get('highway', 'primary'),
                'geometry': {
                    'type': 'LineString',
                    'coordinates': list(row.geometry.coords)
                },
                'properties': {
                    'length_m': float(row.get('length', 0)) * 111000,
                    'speed_limit_kmh': float(row.get('maxspeed', 50)),
                    'lanes': int(row.get('lanes', 2)),
                    'one_way': bool(row.get('oneway', False)),
                    'surface': row.get('surface', 'paved'),
                    'width_m': float(row.get('width', 3.5)),
                    'max_weight_kg': float(row.get('maxweight', 3500)),
                    'max_height_m': float(row.get('maxheight', 4.0)),
                    'max_width_m': float(row.get('maxwidth', 2.5)),
                    'bridge': bool(row.get('bridge', False)),
                    'tunnel': bool(row.get('tunnel', False)),
                    'access': row.get('access', 'yes'),
                    'emergency_access': bool(row.get('emergency_access', True)),
                    'evacuation_route': True,
                    'hazard_zone': False,
                    'traffic_signals': bool(row.get('traffic_signals', False)),
                    'stop_signs': bool(row.get('stop_signs', False)),
                    'yield_signs': bool(row.get('yield_signs', False)),
                    'roundabouts': bool(row.get('roundabout', False)),
                    'traffic_calming': bool(row.get('traffic_calming', False)),
                    'lighting': bool(row.get('lit', True)),
                    'sidewalk': bool(row.get('sidewalk', True)),
                    'bike_lane': bool(row.get('bicycle', False)),
                    'bus_lane': bool(row.get('bus_lane', False)),
                    'hov_lane': bool(row.get('hov_lane', False)),
                    'toll': bool(row.get('toll', False)),
                    'seasonal': bool(row.get('seasonal', False)),
                    'condition': row.get('condition', 'good'),
                    'last_updated': datetime.now().isoformat()
                }
            }
            evacuation_routes.append(street_segment)
        
        logger.info("Evacuation routes retrieved", count=len(evacuation_routes))
        return {'success': True, 'routes': evacuation_routes}
        
    except Exception as e:
        logger.error("Error retrieving evacuation routes", error=str(e))
        return {'success': False, 'routes': []}

@function(
    street_network=Input("/data/static/street_network")
)
def get_emergency_access_routes(street_network, north, south, east, west):
    """
    Get emergency access routes within specified bounds.
    """
    try:
        streets_gdf = street_network.read_dataframe()
        
        # Filter by bounds
        bounds_filter = (
            (streets_gdf.geometry.bounds['minx'] >= west) &
            (streets_gdf.geometry.bounds['maxx'] <= east) &
            (streets_gdf.geometry.bounds['miny'] >= south) &
            (streets_gdf.geometry.bounds['maxy'] <= north)
        )
        streets_gdf = streets_gdf[bounds_filter]
        
        # Filter for emergency access routes
        streets_gdf = streets_gdf[streets_gdf['emergency_access'] == True]
        
        # Convert to street segments
        emergency_routes = []
        for idx, row in streets_gdf.iterrows():
            street_segment = {
                'id': str(row.get('osm_id', idx)),
                'name': row.get('name', 'Emergency Access Route'),
                'type': row.get('highway', 'primary'),
                'geometry': {
                    'type': 'LineString',
                    'coordinates': list(row.geometry.coords)
                },
                'properties': {
                    'length_m': float(row.get('length', 0)) * 111000,
                    'speed_limit_kmh': float(row.get('maxspeed', 50)),
                    'lanes': int(row.get('lanes', 2)),
                    'one_way': bool(row.get('oneway', False)),
                    'surface': row.get('surface', 'paved'),
                    'width_m': float(row.get('width', 3.5)),
                    'max_weight_kg': float(row.get('maxweight', 3500)),
                    'max_height_m': float(row.get('maxheight', 4.0)),
                    'max_width_m': float(row.get('maxwidth', 2.5)),
                    'bridge': bool(row.get('bridge', False)),
                    'tunnel': bool(row.get('tunnel', False)),
                    'access': row.get('access', 'yes'),
                    'emergency_access': True,
                    'evacuation_route': bool(row.get('evacuation_route', False)),
                    'hazard_zone': False,
                    'traffic_signals': bool(row.get('traffic_signals', False)),
                    'stop_signs': bool(row.get('stop_signs', False)),
                    'yield_signs': bool(row.get('yield_signs', False)),
                    'roundabouts': bool(row.get('roundabout', False)),
                    'traffic_calming': bool(row.get('traffic_calming', False)),
                    'lighting': bool(row.get('lit', True)),
                    'sidewalk': bool(row.get('sidewalk', True)),
                    'bike_lane': bool(row.get('bicycle', False)),
                    'bus_lane': bool(row.get('bus_lane', False)),
                    'hov_lane': bool(row.get('hov_lane', False)),
                    'toll': bool(row.get('toll', False)),
                    'seasonal': bool(row.get('seasonal', False)),
                    'condition': row.get('condition', 'good'),
                    'last_updated': datetime.now().isoformat()
                }
            }
            emergency_routes.append(street_segment)
        
        logger.info("Emergency access routes retrieved", count=len(emergency_routes))
        return {'success': True, 'routes': emergency_routes}
        
    except Exception as e:
        logger.error("Error retrieving emergency access routes", error=str(e))
        return {'success': False, 'routes': []}
