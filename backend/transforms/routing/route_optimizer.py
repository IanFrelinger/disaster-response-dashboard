"""
Route Optimization Engine
Calculates safe evacuation routes avoiding hazards with real-time constraints.
"""

import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point, LineString, Polygon
import networkx as nx
from typing import List, Dict, Any, Optional, Tuple
import structlog
from datetime import datetime
import h3
from scipy.spatial.distance import cdist

logger = structlog.get_logger(__name__)


class RouteOptimizer:
    """Advanced route optimization with hazard avoidance and real-time constraints."""
    
    def __init__(self):
        self.road_network = None
        self.hazard_buffer_distance = 500  # meters
        self.max_route_distance = 100  # km
        self.vehicle_constraints = {
            'engine': {'max_weight': 40000, 'height': 4.2, 'width': 2.6},
            'ambulance': {'max_weight': 5000, 'height': 3.2, 'width': 2.2},
            'civilian': {'max_weight': 3000, 'height': 2.0, 'width': 2.0}
        }
    
    def load_road_network(self, road_data: gpd.GeoDataFrame):
        """Load road network data for routing."""
        try:
            self.road_network = road_data.copy()
            
            # Ensure proper geometry types
            self.road_network = self.road_network[self.road_network.geometry.type == 'LineString']
            
            # Add network attributes
            self.road_network['length_m'] = self.road_network.geometry.length * 111000  # Convert degrees to meters
            self.road_network['speed_limit_kmh'] = self.road_network.get('speed_limit', 50)
            self.road_network['travel_time_min'] = (self.road_network['length_m'] / 1000) / self.road_network['speed_limit_kmh'] * 60
            
            # Create spatial index for performance
            self.road_network = self.road_network.set_crs("EPSG:4326")
            
            logger.info("Road network loaded", roads_count=len(self.road_network))
            
        except Exception as e:
            logger.error("Error loading road network", error=str(e))
            raise
    
    def calculate_safe_route(self,
                           origin: Tuple[float, float],
                           destination: Tuple[float, float],
                           hazard_zones: gpd.GeoDataFrame,
                           vehicle_type: str = 'civilian',
                           priority: str = 'safest',
                           traffic_data: pd.DataFrame = None) -> Dict[str, Any]:
        """Calculate safe route avoiding hazards with vehicle-specific constraints."""
        try:
            origin_point = Point(origin[1], origin[0])  # (lng, lat)
            dest_point = Point(destination[1], destination[0])
            
            # Validate inputs
            if self.road_network is None:
                raise ValueError("Road network not loaded")
            
            # Find nearest road segments to origin and destination
            origin_road = self._find_nearest_road(origin_point)
            dest_road = self._find_nearest_road(dest_point)
            
            if origin_road is None or dest_road is None:
                raise ValueError("Cannot find road access for origin or destination")
            
            # Build routing graph with hazard penalties
            graph = self._build_routing_graph(hazard_zones, vehicle_type, traffic_data)
            
            # Calculate route using A* algorithm
            route_path = self._calculate_astar_route(
                graph, origin_road, dest_road, priority
            )
            
            if route_path is None:
                return {
                    'success': False,
                    'error': 'No safe route found',
                    'route_id': None
                }
            
            # Build route geometry and calculate metrics
            route_geometry = self._build_route_geometry(route_path)
            route_metrics = self._calculate_route_metrics(
                route_path, route_geometry, hazard_zones
            )
            
            # Generate route response
            route_response = {
                'success': True,
                'route_id': f"route_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'geometry': route_geometry,
                'origin': {'latitude': origin[0], 'longitude': origin[1]},
                'destination': {'latitude': destination[0], 'longitude': destination[1]},
                'vehicle_type': vehicle_type,
                'priority': priority,
                'metrics': route_metrics,
                'hazard_clearance': self._calculate_hazard_clearance(route_geometry, hazard_zones),
                'estimated_duration_min': route_metrics['total_time_min'],
                'total_distance_km': route_metrics['total_distance_km'],
                'safety_score': route_metrics['safety_score'],
                'generated_at': datetime.now().isoformat()
            }
            
            logger.info("Safe route calculated", 
                       route_id=route_response['route_id'],
                       distance_km=route_metrics['total_distance_km'],
                       safety_score=route_metrics['safety_score'])
            
            return route_response
            
        except Exception as e:
            logger.error("Error calculating safe route", error=str(e))
            return {
                'success': False,
                'error': str(e),
                'route_id': None
            }
    
    def calculate_evacuation_routes(self,
                                  evacuation_zones: List[Dict[str, Any]],
                                  shelter_locations: List[Dict[str, Any]],
                                  hazard_zones: gpd.GeoDataFrame,
                                  max_routes_per_zone: int = 3) -> Dict[str, Any]:
        """Calculate evacuation routes for multiple zones to shelters."""
        try:
            all_routes = []
            
            for zone in evacuation_zones:
                zone_center = Point(zone['longitude'], zone['latitude'])
                zone_population = zone.get('population', 1000)
                
                # Find nearest shelters
                nearest_shelters = self._find_nearest_shelters(
                    zone_center, shelter_locations, max_count=3
                )
                
                zone_routes = []
                for shelter in nearest_shelters:
                    route = self.calculate_safe_route(
                        origin=(zone['latitude'], zone['longitude']),
                        destination=(shelter['latitude'], shelter['longitude']),
                        hazard_zones=hazard_zones,
                        vehicle_type='civilian',
                        priority='safest'
                    )
                    
                    if route['success']:
                        route['zone_id'] = zone['id']
                        route['shelter_id'] = shelter['id']
                        route['estimated_capacity'] = shelter.get('capacity', 1000)
                        route['zone_population'] = zone_population
                        
                        zone_routes.append(route)
                
                # Sort routes by safety score and add to results
                zone_routes.sort(key=lambda x: x['metrics']['safety_score'], reverse=True)
                all_routes.extend(zone_routes[:max_routes_per_zone])
            
            result = {
                'evacuation_routes': all_routes,
                'total_routes': len(all_routes),
                'zones_covered': len(evacuation_zones),
                'generated_at': datetime.now().isoformat()
            }
            
            logger.info("Evacuation routes calculated", 
                       total_routes=len(all_routes),
                       zones_covered=len(evacuation_zones))
            
            return result
            
        except Exception as e:
            logger.error("Error calculating evacuation routes", error=str(e))
            raise
    
    def _find_nearest_road(self, point: Point) -> Optional[pd.Series]:
        """Find nearest road segment to a point."""
        try:
            distances = self.road_network.geometry.distance(point)
            nearest_idx = distances.idxmin()
            return self.road_network.loc[nearest_idx]
        except Exception:
            return None
    
    def _build_routing_graph(self,
                           hazard_zones: gpd.GeoDataFrame,
                           vehicle_type: str,
                           traffic_data: pd.DataFrame = None) -> nx.Graph:
        """Build routing graph with hazard penalties and vehicle constraints."""
        try:
            graph = nx.Graph()
            
            # Add road segments as nodes
            for idx, road in self.road_network.iterrows():
                # Get road endpoints
                coords = list(road.geometry.coords)
                start_point = Point(coords[0])
                end_point = Point(coords[-1])
                
                # Calculate base weight
                base_weight = road['travel_time_min']
                
                # Add hazard penalty
                hazard_penalty = self._calculate_hazard_penalty(
                    road.geometry, hazard_zones
                )
                
                # Add traffic penalty if data available
                traffic_penalty = 0
                if traffic_data is not None:
                    traffic_penalty = self._get_traffic_penalty(road, traffic_data)
                
                # Add vehicle constraint penalty
                constraint_penalty = self._calculate_vehicle_constraint_penalty(
                    road, vehicle_type
                )
                
                # Total weight
                total_weight = base_weight * (1 + hazard_penalty + traffic_penalty + constraint_penalty)
                
                # Add edge to graph
                graph.add_edge(
                    f"road_{idx}_start", f"road_{idx}_end",
                    weight=total_weight,
                    road_id=idx,
                    geometry=road.geometry,
                    length_m=road['length_m'],
                    speed_limit=road['speed_limit_kmh']
                )
            
            # Connect nearby road endpoints
            self._connect_road_network(graph)
            
            logger.info("Routing graph built", nodes=graph.number_of_nodes(), edges=graph.number_of_edges())
            return graph
            
        except Exception as e:
            logger.error("Error building routing graph", error=str(e))
            raise
    
    def _calculate_hazard_penalty(self, road_geometry: LineString, hazard_zones: gpd.GeoDataFrame) -> float:
        """Calculate penalty for proximity to hazards."""
        try:
            penalty = 0.0
            
            for _, hazard in hazard_zones.iterrows():
                # Calculate minimum distance from road to hazard
                distance = road_geometry.distance(hazard.geometry)
                
                # Convert to meters (approximate)
                distance_m = distance * 111000
                
                # Apply penalty based on distance and hazard severity
                if distance_m < self.hazard_buffer_distance:
                    severity_multiplier = {
                        'low': 1.0,
                        'medium': 2.0,
                        'high': 5.0,
                        'critical': 10.0
                    }.get(hazard.get('risk_level', 'medium'), 2.0)
                    
                    # Exponential penalty for very close hazards
                    penalty += severity_multiplier * np.exp(-distance_m / 1000)
            
            return penalty
            
        except Exception:
            return 0.0
    
    def _get_traffic_penalty(self, road: pd.Series, traffic_data: pd.DataFrame) -> float:
        """Get traffic penalty for road segment."""
        try:
            # Find matching traffic data
            road_traffic = traffic_data[traffic_data['road_id'] == road.name]
            
            if len(road_traffic) > 0:
                # Calculate congestion penalty
                congestion_level = road_traffic['congestion_level'].iloc[0]
                return congestion_level * 0.5  # 50% time penalty for heavy congestion
            
            return 0.0
            
        except Exception:
            return 0.0
    
    def _calculate_vehicle_constraint_penalty(self, road: pd.Series, vehicle_type: str) -> float:
        """Calculate penalty for vehicle-specific constraints."""
        try:
            constraints = self.vehicle_constraints.get(vehicle_type, {})
            penalty = 0.0
            
            # Check bridge weight limits
            if road.get('bridge_weight_limit', 0) > 0:
                if constraints.get('max_weight', 0) > road['bridge_weight_limit']:
                    penalty += 10.0  # Heavy penalty for impassable bridges
            
            # Check height restrictions
            if road.get('height_limit', 0) > 0:
                if constraints.get('height', 0) > road['height_limit']:
                    penalty += 10.0
            
            # Check road type restrictions
            road_type = road.get('road_type', 'unknown')
            if vehicle_type == 'engine' and road_type in ['residential', 'alley']:
                penalty += 2.0  # Fire engines prefer major roads
            
            return penalty
            
        except Exception:
            return 0.0
    
    def _connect_road_network(self, graph: nx.Graph):
        """Connect nearby road endpoints to create a connected network."""
        try:
            # Get all road endpoints
            endpoints = []
            for node in graph.nodes():
                if 'start' in node or 'end' in node:
                    road_id = node.split('_')[1]
                    road = self.road_network.loc[int(road_id)]
                    coords = list(road.geometry.coords)
                    
                    if 'start' in node:
                        point = Point(coords[0])
                    else:
                        point = Point(coords[-1])
                    
                    endpoints.append((node, point))
            
            # Connect nearby endpoints
            for i, (node1, point1) in enumerate(endpoints):
                for j, (node2, point2) in enumerate(endpoints[i+1:], i+1):
                    distance = point1.distance(point2) * 111000  # Convert to meters
                    
                    if distance < 50:  # Connect if within 50 meters
                        graph.add_edge(node1, node2, weight=distance/1000)  # 1 minute per km
            
        except Exception as e:
            logger.error("Error connecting road network", error=str(e))
    
    def _calculate_astar_route(self,
                             graph: nx.Graph,
                             origin_road: pd.Series,
                             dest_road: pd.Series,
                             priority: str) -> Optional[List[str]]:
        """Calculate route using A* algorithm."""
        try:
            origin_node = f"road_{origin_road.name}_start"
            dest_node = f"road_{dest_road.name}_end"
            
            # Use A* with different heuristics based on priority
            if priority == 'fastest':
                # Use travel time as heuristic
                path = nx.astar_path(graph, origin_node, dest_node, weight='weight')
            else:  # safest
                # Use safety-weighted heuristic
                def safety_heuristic(u, v):
                    return graph[u][v].get('weight', 1.0)
                
                path = nx.astar_path(graph, origin_node, dest_node, weight='weight', heuristic=safety_heuristic)
            
            return path
            
        except nx.NetworkXNoPath:
            logger.warning("No path found between origin and destination")
            return None
        except Exception as e:
            logger.error("Error calculating A* route", error=str(e))
            return None
    
    def _build_route_geometry(self, route_path: List[str]) -> LineString:
        """Build route geometry from path."""
        try:
            road_geometries = []
            
            for i in range(0, len(route_path) - 1, 2):
                node1 = route_path[i]
                node2 = route_path[i + 1]
                
                if 'road_' in node1 and 'road_' in node2:
                    road_id = int(node1.split('_')[1])
                    road = self.road_network.loc[road_id]
                    road_geometries.append(road.geometry)
            
            # Combine road geometries
            if road_geometries:
                combined_geometry = road_geometries[0]
                for geom in road_geometries[1:]:
                    combined_geometry = combined_geometry.union(geom)
                
                return combined_geometry
            else:
                return LineString()
                
        except Exception as e:
            logger.error("Error building route geometry", error=str(e))
            return LineString()
    
    def _calculate_route_metrics(self,
                               route_path: List[str],
                               route_geometry: LineString,
                               hazard_zones: gpd.GeoDataFrame) -> Dict[str, Any]:
        """Calculate comprehensive route metrics."""
        try:
            # Calculate basic metrics
            total_distance_km = route_geometry.length * 111  # Convert degrees to km
            total_time_min = 0
            
            # Calculate time from road segments
            for i in range(0, len(route_path) - 1, 2):
                node1 = route_path[i]
                if 'road_' in node1:
                    road_id = int(node1.split('_')[1])
                    road = self.road_network.loc[road_id]
                    total_time_min += road['travel_time_min']
            
            # Calculate safety score
            safety_score = self._calculate_route_safety_score(route_geometry, hazard_zones)
            
            return {
                'total_distance_km': round(total_distance_km, 2),
                'total_time_min': round(total_time_min, 1),
                'safety_score': round(safety_score, 3),
                'road_segments': len(route_path) // 2,
                'hazard_intersections': 0  # Will be calculated separately
            }
            
        except Exception as e:
            logger.error("Error calculating route metrics", error=str(e))
            return {
                'total_distance_km': 0,
                'total_time_min': 0,
                'safety_score': 0,
                'road_segments': 0,
                'hazard_intersections': 0
            }
    
    def _calculate_route_safety_score(self, route_geometry: LineString, hazard_zones: gpd.GeoDataFrame) -> float:
        """Calculate safety score for route (0-1, higher is safer)."""
        try:
            if len(hazard_zones) == 0:
                return 1.0
            
            # Calculate minimum distance to any hazard
            min_distance = float('inf')
            for _, hazard in hazard_zones.iterrows():
                distance = route_geometry.distance(hazard.geometry) * 111000  # Convert to meters
                min_distance = min(min_distance, distance)
            
            # Convert to safety score (0-1)
            if min_distance >= self.hazard_buffer_distance:
                return 1.0
            elif min_distance <= 0:
                return 0.0
            else:
                return min_distance / self.hazard_buffer_distance
                
        except Exception:
            return 0.5
    
    def _calculate_hazard_clearance(self, route_geometry: LineString, hazard_zones: gpd.GeoDataFrame) -> float:
        """Calculate minimum clearance from route to hazards in meters."""
        try:
            if len(hazard_zones) == 0:
                return float('inf')
            
            min_distance = float('inf')
            for _, hazard in hazard_zones.iterrows():
                distance = route_geometry.distance(hazard.geometry) * 111000  # Convert to meters
                min_distance = min(min_distance, distance)
            
            return min_distance
            
        except Exception:
            return 0.0
    
    def _find_nearest_shelters(self,
                             zone_center: Point,
                             shelter_locations: List[Dict[str, Any]],
                             max_count: int = 3) -> List[Dict[str, Any]]:
        """Find nearest shelters to evacuation zone."""
        try:
            shelter_distances = []
            
            for shelter in shelter_locations:
                shelter_point = Point(shelter['longitude'], shelter['latitude'])
                distance = zone_center.distance(shelter_point) * 111  # Convert to km
                
                shelter_distances.append({
                    'shelter': shelter,
                    'distance_km': distance
                })
            
            # Sort by distance and return nearest
            shelter_distances.sort(key=lambda x: x['distance_km'])
            return [item['shelter'] for item in shelter_distances[:max_count]]
            
        except Exception as e:
            logger.error("Error finding nearest shelters", error=str(e))
            return []
