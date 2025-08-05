"""
Pytest configuration and common fixtures for backend tests.
"""

import pytest
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, Polygon
from datetime import datetime, timedelta
import numpy as np


@pytest.fixture
def sample_wildfire_data():
    """Sample wildfire data for testing."""
    return pd.DataFrame({
        'latitude': [37.7749, 37.7849, 37.7649],
        'longitude': [-122.4194, -122.4094, -122.4294],
        'brightness': [300.5, 250.2, 400.1],
        'confidence': [85, 92, 78],
        'acq_date': [
            datetime.now() - timedelta(hours=2),
            datetime.now() - timedelta(hours=6),
            datetime.now() - timedelta(hours=12)
        ],
        'data_source': ['FIRMS', 'FIRMS', 'FIRMS']
    })


@pytest.fixture
def sample_hazard_zones():
    """Sample hazard zones for testing."""
    hazard_data = {
        'geometry': [
            Polygon([(0, 0), (1, 0), (1, 1), (0, 1)]),  # Square hazard zone
            Polygon([(2, 2), (3, 2), (3, 3), (2, 3)]),   # Another hazard zone
            Polygon([(4, 4), (5, 4), (5, 5), (4, 5)])    # Third hazard zone
        ],
        'risk_level': ['high', 'medium', 'low'],
        'risk_score': [0.8, 0.5, 0.2],
        'data_source': ['FIRMS', 'FIRMS', 'FIRMS'],
        'last_updated': [
            datetime.now(),
            datetime.now(),
            datetime.now()
        ],
        'h3_index': ['8928308280fffff', '8928308281fffff', '8928308282fffff']
    }
    return gpd.GeoDataFrame(hazard_data, crs='EPSG:4326')


@pytest.fixture
def sample_safe_routes():
    """Sample safe routes for testing."""
    route_data = {
        'origin': [(0, 0), (1, 1)],
        'destination': [(3, 3), (4, 4)],
        'route': [
            {'type': 'LineString', 'coordinates': [[0, 0], [1, 1], [2, 2], [3, 3]]},
            {'type': 'LineString', 'coordinates': [[1, 1], [2, 2], [3, 3], [4, 4]]}
        ],
        'hazard_avoided': [True, True],
        'distance': [100.5, 150.2],
        'estimated_time': [25, 35]
    }
    return pd.DataFrame(route_data)


@pytest.fixture
def mock_foundry_client():
    """Mock Foundry client for testing."""
    from unittest.mock import Mock
    
    mock_client = Mock()
    mock_client.upload_repository.return_value = {'status': 'success'}
    mock_client.build_repository.return_value = {'build_id': 'test-build-123'}
    mock_client.list_repositories.return_value = [
        {'name': 'test-repo', 'rid': 'ri.test.repo.123'}
    ]
    
    return mock_client


@pytest.fixture
def mock_road_network():
    """Mock road network for testing."""
    from unittest.mock import Mock
    
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


@pytest.fixture
def sample_risk_assessment():
    """Sample risk assessment data for testing."""
    return {
        'total_nearby_hazards': 3,
        'risk_levels': {'high': 1, 'medium': 1, 'low': 1},
        'avg_risk_score': 0.5,
        'max_risk_score': 0.8,
        'closest_hazard_distance_km': 2.5,
        'assessment_radius_km': 10,
        'location': {'latitude': 37.7749, 'longitude': -122.4194},
        'assessment_timestamp': datetime.now().isoformat()
    }


@pytest.fixture
def sample_hazard_summary():
    """Sample hazard summary data for testing."""
    return {
        'total_hazards': 15,
        'risk_distribution': {'low': 5, 'medium': 6, 'high': 3, 'critical': 1},
        'data_sources': {'FIRMS': 12, 'NOAA': 3},
        'last_updated': datetime.now().isoformat(),
        'bbox': [-122.5, 37.7, -122.3, 37.8]
    } 