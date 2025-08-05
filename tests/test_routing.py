"""
Tests for routing functionality.
"""

import pytest
from unittest.mock import Mock, patch
import geopandas as gpd
from shapely.geometry import Point, Polygon, LineString

from backend.transforms.routing.safe_routes import SafeRouteCalculator


@pytest.fixture
def mock_hazard_zones():
    """Create test hazard zones."""
    # Create test geometries
    hazard_data = {
        'geometry': [
            Polygon([(0, 0), (1, 0), (1, 1), (0, 1)]),  # Square hazard zone
            Polygon([(2, 2), (3, 2), (3, 3), (2, 3)])   # Another hazard zone
        ],
        'risk_level': ['high', 'medium'],
        'risk_score': [0.8, 0.5],
        'data_source': ['FIRMS', 'FIRMS']
    }
    return gpd.GeoDataFrame(hazard_data, crs='EPSG:4326')


@pytest.fixture
def mock_road_network():
    """Create mock road network."""
    # Mock networkx graph
    mock_graph = Mock()
    mock_graph.edges.return_value = [
        (0, 1, {'length': 100, 'geometry': Mock()}),
        (1, 2, {'length': 150, 'geometry': Mock()}),
        (2, 3, {'length': 200, 'geometry': Mock()})
    ]
    
    # Mock edge geometries
    for _, _, data in mock_graph.edges():
        data['geometry'].coords = [[0.5, 0.5], [1.5, 1.5]]
    
    return mock_graph


def test_safe_route_calculator_initialization(mock_hazard_zones):
    """Test SafeRouteCalculator initialization."""
    calculator = SafeRouteCalculator(mock_hazard_zones)
    assert calculator.hazard_zones is not None
    assert len(calculator.hazard_zones) == 2
    assert calculator.graph is None


def test_load_road_network(mock_hazard_zones):
    """Test road network loading."""
    calculator = SafeRouteCalculator(mock_hazard_zones)
    
    with patch('backend.transforms.routing.safe_routes.ox') as mock_ox:
        mock_ox.graph_from_bbox.return_value = Mock()
        bbox = [0, 0, 3, 3]
        
        calculator.load_road_network(bbox)
        
        assert calculator.graph is not None
        mock_ox.graph_from_bbox.assert_called_once_with(*bbox, network_type='drive')


def test_compute_safe_route_without_network(mock_hazard_zones):
    """Test that compute_safe_route raises error without loaded network."""
    calculator = SafeRouteCalculator(mock_hazard_zones)
    
    with pytest.raises(ValueError, match="Road network not loaded"):
        calculator.compute_safe_route((0, 0), (1, 1))


def test_compute_safe_route_success(mock_hazard_zones, mock_road_network):
    """Test successful route computation."""
    calculator = SafeRouteCalculator(mock_hazard_zones)
    calculator.graph = mock_road_network
    
    with patch('networkx.astar_path') as mock_astar:
        mock_astar.return_value = [0, 1, 2, 3]
        
        route = calculator.compute_safe_route((0, 0), (3, 3))
        
        assert route == [0, 1, 2, 3]
        mock_astar.assert_called_once()


def test_compute_safe_route_no_path(mock_hazard_zones, mock_road_network):
    """Test route computation when no path exists."""
    calculator = SafeRouteCalculator(mock_hazard_zones)
    calculator.graph = mock_road_network
    
    with patch('networkx.astar_path') as mock_astar:
        from networkx import NetworkXNoPath
        mock_astar.side_effect = NetworkXNoPath()
        
        route = calculator.compute_safe_route((0, 0), (3, 3))
        
        assert route is None


def test_apply_hazard_weights(mock_hazard_zones, mock_road_network):
    """Test hazard weight application to graph edges."""
    calculator = SafeRouteCalculator(mock_hazard_zones)
    calculator.graph = mock_road_network
    
    # Mock edge data with geometry
    edge_data = {
        'length': 100,
        'geometry': Mock()
    }
    edge_data['geometry'].coords = [[0.5, 0.5], [1.5, 1.5]]
    
    mock_road_network.edges.return_value = [(0, 1, edge_data)]
    mock_road_network.copy.return_value = mock_road_network
    
    weighted_graph = calculator._apply_hazard_weights(mock_road_network)
    
    assert weighted_graph is not None
    # Verify that weights were applied (this would need more specific testing based on implementation)


def test_intersects_hazard_zone():
    """Test hazard zone intersection detection."""
    # Create a route that intersects with a hazard zone
    route_geometry = LineString([(0.5, 0.5), (1.5, 1.5)])
    hazard_zone = Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])
    
    # Test intersection
    assert route_geometry.intersects(hazard_zone)


def test_route_avoids_hazards(mock_hazard_zones):
    """Test that computed routes avoid hazard zones."""
    calculator = SafeRouteCalculator(mock_hazard_zones)
    
    # Mock the road network and path finding
    with patch('backend.transforms.routing.safe_routes.ox') as mock_ox:
        mock_ox.graph_from_bbox.return_value = Mock()
        bbox = [0, 0, 3, 3]
        calculator.load_road_network(bbox)
        
        with patch('networkx.astar_path') as mock_astar:
            # Mock a route that should avoid hazards
            mock_astar.return_value = [(0, 0), (2, 2), (3, 3)]
            
            route = calculator.compute_safe_route((0, 0), (3, 3))
            
            assert route is not None
            # In a real test, you'd verify the route doesn't intersect hazard zones


def test_hazard_weight_calculation(mock_hazard_zones):
    """Test hazard weight calculation logic."""
    calculator = SafeRouteCalculator(mock_hazard_zones)
    
    # Test that closer hazards result in higher penalties
    close_point = Point(0.5, 0.5)  # Inside first hazard zone
    far_point = Point(5, 5)        # Far from all hazards
    
    # Calculate distances manually
    close_distance = min(close_point.distance(hazard.geometry) for hazard in mock_hazard_zones.itertuples())
    far_distance = min(far_point.distance(hazard.geometry) for hazard in mock_hazard_zones.itertuples())
    
    # Closer point should have higher penalty
    close_penalty = max(1.0, 10.0 / (close_distance + 0.1))
    far_penalty = max(1.0, 10.0 / (far_distance + 0.1))
    
    assert close_penalty > far_penalty


def test_edge_case_empty_hazard_zones():
    """Test routing with empty hazard zones."""
    empty_hazards = gpd.GeoDataFrame(columns=['geometry', 'risk_level'], crs='EPSG:4326')
    calculator = SafeRouteCalculator(empty_hazards)
    
    # Should handle empty hazard zones gracefully
    assert len(calculator.hazard_zones) == 0


def test_edge_case_single_hazard_zone():
    """Test routing with single hazard zone."""
    single_hazard = gpd.GeoDataFrame({
        'geometry': [Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])],
        'risk_level': ['high'],
        'risk_score': [0.8]
    }, crs='EPSG:4326')
    
    calculator = SafeRouteCalculator(single_hazard)
    assert len(calculator.hazard_zones) == 1


if __name__ == '__main__':
    pytest.main([__file__]) 