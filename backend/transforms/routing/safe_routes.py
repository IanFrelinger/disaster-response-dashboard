"""
Safe route calculation transforms for disaster response.
Implements path-finding algorithms that avoid hazard zones.
"""

from transforms.api import transform, Input, Output
import osmnx as ox
import networkx as nx
import geopandas as gpd
from shapely.geometry import Point, LineString
import structlog

logger = structlog.get_logger(__name__)


class SafeRouteCalculator:
    """Calculates safe routes avoiding hazard zones."""
    
    def __init__(self, hazard_zones_gdf):
        self.hazard_zones = hazard_zones_gdf
        self.graph = None
    
    def load_road_network(self, bbox):
        """Load OSM road network for area"""
        try:
            self.graph = ox.graph_from_bbox(*bbox, network_type='drive')
            logger.info("Road network loaded", bbox=bbox)
        except Exception as e:
            logger.error("Failed to load road network", error=str(e))
            raise
        
    def compute_safe_route(self, origin, destination):
        """A* with hazard penalty weights"""
        if self.graph is None:
            raise ValueError("Road network not loaded. Call load_road_network first.")
        
        # Apply hazard weights to graph
        weighted_graph = self._apply_hazard_weights(self.graph)
        
        try:
            path = nx.astar_path(weighted_graph, origin, destination)
            logger.info("Safe route computed", path_length=len(path))
            return path
        except nx.NetworkXNoPath:
            logger.warning("No safe path found between points")
            return None
    
    def _apply_hazard_weights(self, graph):
        """Apply hazard proximity penalties to graph edges"""
        weighted_graph = graph.copy()
        
        for u, v, k, data in weighted_graph.edges(data=True, keys=True):
            # Calculate hazard proximity penalty
            edge_center = Point(
                (data['geometry'].coords[0][0] + data['geometry'].coords[-1][0]) / 2,
                (data['geometry'].coords[0][1] + data['geometry'].coords[-1][1]) / 2
            )
            
            # Find nearest hazard zone
            min_distance = float('inf')
            for _, hazard in self.hazard_zones.iterrows():
                distance = edge_center.distance(hazard.geometry)
                if distance < min_distance:
                    min_distance = distance
            
            # Apply penalty based on distance (closer = higher penalty)
            hazard_penalty = max(1.0, 10.0 / (min_distance + 0.1))
            weighted_graph[u][v][k]['weight'] = data.get('length', 1.0) * hazard_penalty
        
        return weighted_graph


@transform(
    hazard_zones=Input("/data/processed/hazard_zones"),
    road_network=Input("/data/raw/road_network"),
    safe_routes=Output("/data/processed/safe_routes")
)
def compute_safe_routes(hazard_zones, road_network, safe_routes):
    """Transform to compute safe routes avoiding hazard zones."""
    
    # Load hazard zones
    hazard_gdf = hazard_zones.read_dataframe()
    
    # Initialize route calculator
    calculator = SafeRouteCalculator(hazard_gdf)
    
    # Load road network (assuming bbox is available)
    # This would need to be adapted based on your data structure
    bbox = hazard_gdf.total_bounds  # [minx, miny, maxx, maxy]
    calculator.load_road_network(bbox)
    
    # Compute routes for predefined evacuation points
    # This is a placeholder - you'd define actual origin/destination points
    evacuation_routes = []
    
    # Example: compute routes from multiple origins to safe destinations
    origins = [(bbox[0], bbox[1]), (bbox[2], bbox[1])]  # Example points
    destinations = [(bbox[0], bbox[3]), (bbox[2], bbox[3])]  # Example safe zones
    
    for origin in origins:
        for destination in destinations:
            route = calculator.compute_safe_route(origin, destination)
            if route:
                evacuation_routes.append({
                    'origin': origin,
                    'destination': destination,
                    'route': route,
                    'hazard_avoided': True
                })
    
    # Convert to DataFrame and save
    routes_df = gpd.GeoDataFrame(evacuation_routes)
    safe_routes.write_dataframe(routes_df) 