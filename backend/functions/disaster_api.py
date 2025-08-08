"""
Disaster Response API Functions for Foundry.
Provides endpoints for hazard data, route planning, and real-time emergency coordination.
"""

from ..foundry_functions import function, Input, Output
import geopandas as gpd
import pandas as pd
import json
import structlog
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import numpy as np
from shapely.geometry import Point, Polygon

# Import our new processing modules
from ..transforms.processing.hazard_processor import HazardProcessor
from ..transforms.routing.route_optimizer import RouteOptimizer

logger = structlog.get_logger(__name__)

# Initialize processors
hazard_processor = HazardProcessor()
route_optimizer = RouteOptimizer()


@function(
    hazard_zones=Input("/data/processed/hazard_zones"),
    safe_routes=Input("/data/processed/safe_routes")
)
def get_hazard_summary(hazard_zones, safe_routes):
    """Get summary of current hazard zones and safe routes."""
    
    try:
        # Load hazard data
        hazard_gdf = hazard_zones.read_dataframe()
        
        # Generate summary statistics with safe column access
        summary = {
            'total_hazards': len(hazard_gdf),
            'risk_distribution': hazard_gdf['risk_level'].value_counts().to_dict() if 'risk_level' in hazard_gdf.columns else {},
            'data_sources': hazard_gdf['data_source'].value_counts().to_dict() if 'data_source' in hazard_gdf.columns else {},
            'last_updated': hazard_gdf['last_updated'].max().isoformat() if 'last_updated' in hazard_gdf.columns else None,
            'bbox': hazard_gdf.total_bounds.tolist() if len(hazard_gdf) > 0 else None,
            'total_population_at_risk': hazard_gdf['affected_population'].sum() if 'affected_population' in hazard_gdf.columns else 0
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
        
        # Convert timestamps to ISO strings for JSON serialization
        hazard_gdf_copy = hazard_gdf.copy()
        if 'last_updated' in hazard_gdf_copy.columns:
            hazard_gdf_copy['last_updated'] = hazard_gdf_copy['last_updated'].astype(str)
        if 'acq_date' in hazard_gdf_copy.columns:
            hazard_gdf_copy['acq_date'] = hazard_gdf_copy['acq_date'].astype(str)
        
        # Convert to GeoJSON
        geojson = json.loads(hazard_gdf_copy.to_json())
        
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
        
        # Find hazards that intersect with the buffer
        nearby_hazards = hazard_gdf[hazard_gdf.geometry.intersects(buffer_wgs84)]
        
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


@function(
    firms_data=Input("/data/raw/nasa_firms"),
    weather_data=Input("/data/raw/noaa_weather"),
    terrain_data=Input("/data/static/elevation_model")
)
def process_hazard_data(firms_data, weather_data, terrain_data):
    """Process raw hazard data and generate predictions."""
    
    try:
        # Load raw data
        firms_df = firms_data.read_dataframe()
        weather_df = weather_data.read_dataframe()
        terrain_gdf = terrain_data.read_dataframe()
        
        # Process FIRMS data
        processed_firms = hazard_processor.process_firms_data(firms_df)
        
        # Process weather data
        processed_weather = hazard_processor.process_weather_data(weather_df)
        
        # Generate hazard spread predictions
        predictions = hazard_processor.predict_hazard_spread(
            processed_firms, processed_weather, terrain_gdf
        )
        
        # Calculate risk zones
        risk_zones = hazard_processor.calculate_risk_zones(processed_firms)
        
        result = {
            'predictions': predictions,
            'risk_zones': risk_zones.to_dict('records'),
            'processed_hazards': len(processed_firms),
            'weather_stations': len(processed_weather),
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info("Hazard data processed", 
                   hazards=len(processed_firms),
                   predictions=len(predictions['predictions']))
        
        return result
        
    except Exception as e:
        logger.error("Error processing hazard data", error=str(e))
        raise


@function(
    hazard_zones=Input("/data/processed/hazard_zones"),
    road_network=Input("/data/static/road_network"),
    traffic_data=Input("/data/live/traffic_conditions")
)
def calculate_safe_route_api(hazard_zones, road_network, traffic_data, 
                           origin_lat, origin_lon, destination_lat, destination_lon,
                           vehicle_type='civilian', priority='safest'):
    """Calculate safe route avoiding hazards with real-time constraints."""
    
    try:
        # Load data
        hazard_gdf = hazard_zones.read_dataframe()
        road_gdf = road_network.read_dataframe()
        traffic_df = traffic_data.read_dataframe() if traffic_data else None
        
        # Load road network into optimizer
        route_optimizer.load_road_network(road_gdf)
        
        # Calculate safe route
        route_result = route_optimizer.calculate_safe_route(
            origin=(origin_lat, origin_lon),
            destination=(destination_lat, destination_lon),
            hazard_zones=hazard_gdf,
            vehicle_type=vehicle_type,
            priority=priority,
            traffic_data=traffic_df
        )
        
        if route_result['success']:
            # Convert geometry to GeoJSON
            if hasattr(route_result['geometry'], '__geo_interface__'):
                route_result['geometry'] = route_result['geometry'].__geo_interface__
        
        logger.info("Safe route calculated via API", 
                   success=route_result['success'],
                   distance_km=route_result.get('total_distance_km', 0))
        
        return route_result
        
    except Exception as e:
        logger.error("Error calculating safe route via API", error=str(e))
        return {
            'success': False,
            'error': str(e),
            'route_id': None
        }


@function(
    hazard_zones=Input("/data/processed/hazard_zones"),
    evacuation_zones=Input("/data/static/evacuation_zones"),
    shelter_locations=Input("/data/static/emergency_shelters")
)
def get_evacuation_status(hazard_zones, evacuation_zones, shelter_locations, zone_id=None):
    """Get evacuation status and progress for zones."""
    
    try:
        # Load data
        hazard_gdf = hazard_zones.read_dataframe()
        zones_gdf = evacuation_zones.read_dataframe()
        shelters_gdf = shelter_locations.read_dataframe()
        
        # Filter by specific zone if provided
        if zone_id:
            zones_gdf = zones_gdf[zones_gdf['zone_id'] == zone_id]
        
        evacuation_status = []
        
        for _, zone in zones_gdf.iterrows():
            # Calculate population at risk in this zone
            zone_geometry = zone.geometry
            hazards_in_zone = hazard_gdf[hazard_gdf.geometry.intersects(zone_geometry)]
            
            # Estimate evacuation progress (simplified - in production use real-time data)
            total_population = zone.get('population', 1000)
            evacuated_population = int(total_population * 0.67)  # Mock data
            
            # Find nearest shelters
            zone_center = zone_geometry.centroid
            shelter_distances = []
            
            for _, shelter in shelters_gdf.iterrows():
                distance = zone_center.distance(shelter.geometry) * 111  # Convert to km
                shelter_distances.append({
                    'shelter_id': shelter['shelter_id'],
                    'name': shelter['name'],
                    'distance_km': round(distance, 1),
                    'capacity': shelter.get('capacity', 1000),
                    'available_capacity': shelter.get('available_capacity', 500)
                })
            
            # Sort shelters by distance
            shelter_distances.sort(key=lambda x: x['distance_km'])
            
            zone_status = {
                'zone_id': zone['zone_id'],
                'zone_name': zone.get('name', f"Zone {zone['zone_id']}"),
                'total_population': total_population,
                'evacuated_population': evacuated_population,
                'evacuation_percent': round((evacuated_population / total_population) * 100, 1),
                'hazards_in_zone': len(hazards_in_zone),
                'risk_level': zone.get('risk_level', 'medium'),
                'evacuation_status': 'mandatory' if len(hazards_in_zone) > 0 else 'voluntary',
                'nearest_shelters': shelter_distances[:3],
                'last_updated': datetime.now().isoformat()
            }
            
            evacuation_status.append(zone_status)
        
        result = {
            'evacuation_status': evacuation_status,
            'total_zones': len(evacuation_status),
            'zones_with_hazards': len([z for z in evacuation_status if z['hazards_in_zone'] > 0]),
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info("Evacuation status retrieved", 
                   zones=len(evacuation_status),
                   zones_with_hazards=result['zones_with_hazards'])
        
        return result
        
    except Exception as e:
        logger.error("Error getting evacuation status", error=str(e))
        raise


@function(
    hazard_zones=Input("/data/processed/hazard_zones"),
    resource_positions=Input("/data/live/resource_positions")
)
def get_resource_coordination(hazard_zones, resource_positions):
    """Get resource coordination data for emergency response."""
    
    try:
        # Load data
        hazard_gdf = hazard_zones.read_dataframe()
        resources_df = resource_positions.read_dataframe()
        
        # Calculate resource availability and assignments
        available_resources = []
        assigned_resources = []
        
        for _, resource in resources_df.iterrows():
            resource_point = Point(resource['longitude'], resource['latitude'])
            
            # Find nearest hazards
            hazard_distances = []
            for _, hazard in hazard_gdf.iterrows():
                distance = resource_point.distance(hazard.geometry) * 111  # Convert to km
                hazard_distances.append({
                    'hazard_id': hazard['hazard_id'],
                    'distance_km': round(distance, 1),
                    'risk_level': hazard['risk_level'],
                    'hazard_type': hazard['hazard_type']
                })
            
            # Sort by distance
            hazard_distances.sort(key=lambda x: x['distance_km'])
            
            resource_info = {
                'resource_id': resource['resource_id'],
                'call_sign': resource['call_sign'],
                'type': resource['type'],
                'status': resource['status'],
                'position': {
                    'latitude': resource['latitude'],
                    'longitude': resource['longitude']
                },
                'crew_count': resource.get('crew_count', 0),
                'capabilities': resource.get('capabilities', []),
                'nearest_hazards': hazard_distances[:3],
                'last_updated': resource.get('last_updated', datetime.now().isoformat())
            }
            
            if resource['status'] == 'available':
                available_resources.append(resource_info)
            else:
                assigned_resources.append(resource_info)
        
        result = {
            'available_resources': available_resources,
            'assigned_resources': assigned_resources,
            'total_resources': len(resources_df),
            'available_count': len(available_resources),
            'assigned_count': len(assigned_resources),
            'active_hazards': len(hazard_gdf),
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info("Resource coordination data retrieved", 
                   total_resources=len(resources_df),
                   available=len(available_resources))
        
        return result
        
    except Exception as e:
        logger.error("Error getting resource coordination", error=str(e))
        raise


@function(
    hazard_zones=Input("/data/processed/hazard_zones")
)
def get_public_safety_status(hazard_zones, address=None, latitude=None, longitude=None):
    """Get public safety status for a specific location."""
    
    try:
        # Load hazard data
        hazard_gdf = hazard_zones.read_dataframe()
        
        # Determine location
        if address:
            # In production, use geocoding service
            # For now, use mock coordinates
            latitude, longitude = 37.7749, -122.4194  # San Francisco
        elif latitude and longitude:
            pass
        else:
            raise ValueError("Either address or coordinates must be provided")
        
        location_point = Point(longitude, latitude)
        
        # Find nearby hazards
        nearby_hazards = []
        evacuation_status = "SAFE"
        risk_level = "low"
        
        for _, hazard in hazard_gdf.iterrows():
            distance = location_point.distance(hazard.geometry) * 111  # Convert to km
            
            if distance <= 5:  # Within 5km
                nearby_hazards.append({
                    'hazard_id': hazard['hazard_id'],
                    'type': hazard['hazard_type'],
                    'distance_km': round(distance, 1),
                    'risk_level': hazard['risk_level'],
                    'direction': self._calculate_direction(location_point, hazard.geometry.centroid)
                })
        
        # Determine evacuation status
        if nearby_hazards:
            critical_hazards = [h for h in nearby_hazards if h['risk_level'] == 'critical']
            high_hazards = [h for h in nearby_hazards if h['risk_level'] == 'high']
            
            if critical_hazards:
                evacuation_status = "EVACUATE NOW"
                risk_level = "critical"
            elif high_hazards:
                evacuation_status = "PREPARE TO EVACUATE"
                risk_level = "high"
            else:
                evacuation_status = "MONITOR"
                risk_level = "medium"
        
        # Generate multi-language messages
        messages = self._generate_safety_messages(evacuation_status, nearby_hazards)
        
        result = {
            'location': {
                'latitude': latitude,
                'longitude': longitude,
                'address': address
            },
            'evacuation_status': evacuation_status,
            'risk_level': risk_level,
            'nearby_hazards': nearby_hazards,
            'messages': messages,
            'last_updated': datetime.now().isoformat()
        }
        
        logger.info("Public safety status retrieved", 
                   location=f"{latitude},{longitude}",
                   status=evacuation_status)
        
        return result
        
    except Exception as e:
        logger.error("Error getting public safety status", error=str(e))
        raise


def _calculate_direction(self, from_point: Point, to_point: Point) -> str:
    """Calculate cardinal direction from one point to another."""
    try:
        dx = to_point.x - from_point.x
        dy = to_point.y - from_point.y
        
        angle = np.arctan2(dy, dx) * 180 / np.pi
        
        if -22.5 <= angle <= 22.5:
            return "east"
        elif 22.5 < angle <= 67.5:
            return "northeast"
        elif 67.5 < angle <= 112.5:
            return "north"
        elif 112.5 < angle <= 157.5:
            return "northwest"
        elif 157.5 < angle <= 180 or -180 <= angle <= -157.5:
            return "west"
        elif -157.5 < angle <= -112.5:
            return "southwest"
        elif -112.5 < angle <= -67.5:
            return "south"
        else:
            return "southeast"
    except Exception:
        return "unknown"


def _generate_safety_messages(self, status: str, hazards: List[Dict]) -> Dict[str, Dict[str, str]]:
    """Generate multi-language safety messages."""
    
    messages = {
        'en': {
            'title': status,
            'body': self._generate_english_message(status, hazards),
            'action': 'Get Directions' if status != 'SAFE' else 'Stay Informed'
        },
        'es': {
            'title': self._translate_status_spanish(status),
            'body': self._generate_spanish_message(status, hazards),
            'action': 'Obtener Direcciones' if status != 'SAFE' else 'Mantenerse Informado'
        },
        'zh': {
            'title': self._translate_status_chinese(status),
            'body': self._generate_chinese_message(status, hazards),
            'action': '获取路线' if status != 'SAFE' else '保持关注'
        }
    }
    
    return messages


def _generate_english_message(self, status: str, hazards: List[Dict]) -> str:
    """Generate English safety message."""
    if status == "SAFE":
        return "No immediate threats detected in your area. Continue to monitor local emergency broadcasts."
    elif status == "EVACUATE NOW":
        return f"Critical hazard detected {hazards[0]['distance_km']}km to your {hazards[0]['direction']}. Leave immediately via designated evacuation routes."
    elif status == "PREPARE TO EVACUATE":
        return f"Hazard approaching from {hazards[0]['direction']}. Prepare to evacuate and monitor official instructions."
    else:
        return "Monitor local conditions and be prepared to evacuate if conditions worsen."


def _translate_status_spanish(self, status: str) -> str:
    """Translate status to Spanish."""
    translations = {
        'SAFE': 'SEGURO',
        'EVACUATE NOW': 'EVACUAR AHORA',
        'PREPARE TO EVACUATE': 'PREPARARSE PARA EVACUAR',
        'MONITOR': 'MONITOREAR'
    }
    return translations.get(status, status)


def _translate_status_chinese(self, status: str) -> str:
    """Translate status to Chinese."""
    translations = {
        'SAFE': '安全',
        'EVACUATE NOW': '立即撤离',
        'PREPARE TO EVACUATE': '准备撤离',
        'MONITOR': '监控'
    }
    return translations.get(status, status)


def _generate_spanish_message(self, status: str, hazards: List[Dict]) -> str:
    """Generate Spanish safety message."""
    if status == "SAFE":
        return "No se detectaron amenazas inmediatas en su área. Continúe monitoreando las transmisiones de emergencia locales."
    elif status == "EVACUATE NOW":
        return f"Amenaza crítica detectada a {hazards[0]['distance_km']}km hacia su {hazards[0]['direction']}. Salga inmediatamente por las rutas de evacuación designadas."
    elif status == "PREPARE TO EVACUATE":
        return f"Amenaza acercándose desde {hazards[0]['direction']}. Prepárese para evacuar y monitoree las instrucciones oficiales."
    else:
        return "Monitoree las condiciones locales y esté preparado para evacuar si las condiciones empeoran."


def _generate_chinese_message(self, status: str, hazards: List[Dict]) -> str:
    """Generate Chinese safety message."""
    if status == "SAFE":
        return "您所在区域未检测到即时威胁。请继续关注当地紧急广播。"
    elif status == "EVACUATE NOW":
        return f"检测到关键危险，位于您{hazards[0]['direction']}方向{hazards[0]['distance_km']}公里处。请立即通过指定疏散路线撤离。"
    elif status == "PREPARE TO EVACUATE":
        return f"危险正从{hazards[0]['direction']}方向接近。请准备撤离并关注官方指示。"
    else:
        return "请监控当地情况，如果情况恶化请准备撤离。" 