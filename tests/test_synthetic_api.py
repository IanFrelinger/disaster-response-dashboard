"""
Tests for Synthetic API endpoints.
"""

import pytest
import json
import time
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from flask import Flask

from backend.functions.synthetic_api import (
    app,
    get_cached_data,
    get_dashboard_data,
    get_hazard_zones,
    get_safe_routes,
    get_risk_assessment,
    get_hazard_summary,
    get_evacuation_routes,
    get_scenario_data,
    refresh_data,
    health_check,
    api_info
)


class TestSyntheticAPI:
    """Test suite for synthetic API endpoints."""
    
    @pytest.fixture
    def client(self):
        """Create a test client for the Flask app."""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def mock_synthetic_data(self):
        """Mock synthetic data for testing."""
        return {
            'hazards': [
                {
                    'id': 'hazard-1',
                    'geometry': {'type': 'Polygon', 'coordinates': [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
                    'riskLevel': 'high',
                    'lastUpdated': '2023-01-01T00:00:00',
                    'dataSource': 'FIRMS',
                    'riskScore': 0.8
                }
            ],
            'routes': [
                {
                    'id': 'route-1',
                    'origin': [37.7749, -122.4194],
                    'destination': [37.7849, -122.4094],
                    'route': {'type': 'LineString', 'coordinates': [[-122.4194, 37.7749], [-122.4094, 37.7849]]},
                    'hazardAvoided': True,
                    'distance': 1.5,
                    'estimatedTime': 3.0
                }
            ],
            'summary': {
                'totalHazards': 1,
                'riskDistribution': {'high': 1},
                'dataSources': {'FIRMS': 1},
                'lastUpdated': '2023-01-01T00:00:00'
            }
        }
    
    def test_get_cached_data_first_call(self, mock_synthetic_data):
        """Test get_cached_data on first call (no cache)."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_dashboard_data') as mock_generate:
            mock_generate.return_value = mock_synthetic_data
            
            result = get_cached_data()
            
            assert result == mock_synthetic_data
            mock_generate.assert_called_once()
    
    def test_get_cached_data_cached(self, mock_synthetic_data):
        """Test get_cached_data with valid cache."""
        # Clear cache first
        import backend.functions.synthetic_api as api_module
        api_module._data_cache = {}
        api_module._cache_timestamp = 0
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_dashboard_data') as mock_generate:
            mock_generate.return_value = mock_synthetic_data
            
            # First call to populate cache
            get_cached_data()
            
            # Second call should use cache
            result = get_cached_data()
            
            assert result == mock_synthetic_data
            # Should only be called once due to caching
            mock_generate.assert_called_once()
    
    def test_get_cached_data_cache_expired(self, mock_synthetic_data):
        """Test get_cached_data with expired cache."""
        # Clear cache first
        import backend.functions.synthetic_api as api_module
        api_module._data_cache = {}
        api_module._cache_timestamp = 0
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_dashboard_data') as mock_generate:
            mock_generate.return_value = mock_synthetic_data
            
            # First call to populate cache
            get_cached_data()
            
            # Simulate cache expiration by modifying timestamp
            api_module._cache_timestamp = 0  # Force cache expiration
            
            # Second call should regenerate data
            result = get_cached_data()
            
            assert result == mock_synthetic_data
            # Should be called twice due to cache expiration
            assert mock_generate.call_count == 2
    
    def test_get_dashboard_data_success(self, client, mock_synthetic_data):
        """Test successful dashboard data retrieval."""
        with patch('backend.functions.synthetic_api.get_cached_data') as mock_get_data:
            mock_get_data.return_value = mock_synthetic_data
            
            response = client.get('/api/dashboard')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['data'] == mock_synthetic_data
            assert 'timestamp' in data
    
    def test_get_dashboard_data_error(self, client):
        """Test dashboard data retrieval with error."""
        with patch('backend.functions.synthetic_api.get_cached_data') as mock_get_data:
            mock_get_data.side_effect = Exception("Test error")
            
            response = client.get('/api/dashboard')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
    
    def test_get_hazard_zones_success(self, client):
        """Test successful hazard zones retrieval."""
        mock_hazards = [
            Mock(id='hazard-1', to_dict=lambda: {'id': 'hazard-1', 'riskLevel': 'high'}),
            Mock(id='hazard-2', to_dict=lambda: {'id': 'hazard-2', 'riskLevel': 'medium'})
        ]
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_hazard_zones') as mock_generate:
            mock_generate.return_value = mock_hazards
            
            response = client.get('/api/hazards?count=2')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert len(data['data']) == 2
            assert data['count'] == 2
            assert 'timestamp' in data
    
    def test_get_hazard_zones_default_count(self, client):
        """Test hazard zones with default count."""
        mock_hazards = [Mock(id='hazard-1', to_dict=lambda: {'id': 'hazard-1'})]
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_hazard_zones') as mock_generate:
            mock_generate.return_value = mock_hazards
            
            response = client.get('/api/hazards')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            # Should use default count of 20
            mock_generate.assert_called_with(20)
    
    def test_get_hazard_zones_error(self, client):
        """Test hazard zones retrieval with error."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_hazard_zones') as mock_generate:
            mock_generate.side_effect = Exception("Test error")
            
            response = client.get('/api/hazards')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
    
    def test_get_safe_routes_success(self, client):
        """Test successful safe routes retrieval."""
        mock_routes = [
            Mock(id='route-1', to_dict=lambda: {'id': 'route-1', 'hazardAvoided': True}),
            Mock(id='route-2', to_dict=lambda: {'id': 'route-2', 'hazardAvoided': False})
        ]
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_safe_routes') as mock_generate:
            mock_generate.return_value = mock_routes
            
            response = client.get('/api/routes?count=2')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert len(data['data']) == 2
            assert data['count'] == 2
            assert 'timestamp' in data
    
    def test_get_safe_routes_default_count(self, client):
        """Test safe routes with default count."""
        mock_routes = [Mock(id='route-1', to_dict=lambda: {'id': 'route-1'})]
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_safe_routes') as mock_generate:
            mock_generate.return_value = mock_routes
            
            response = client.get('/api/routes')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            # Should use default count of 12
            mock_generate.assert_called_with(12)
    
    def test_get_safe_routes_error(self, client):
        """Test safe routes retrieval with error."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_safe_routes') as mock_generate:
            mock_generate.side_effect = Exception("Test error")
            
            response = client.get('/api/routes')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
    
    def test_get_risk_assessment_success(self, client):
        """Test successful risk assessment retrieval."""
        mock_assessment = Mock()
        mock_assessment.to_dict.return_value = {
            'totalNearbyHazards': 3,
            'riskLevels': {'high': 2, 'medium': 1},
            'avgRiskScore': 0.7,
            'maxRiskScore': 0.9,
            'closestHazardDistanceKm': 2.5,
            'assessmentRadiusKm': 10,
            'location': {'latitude': 37.7749, 'longitude': -122.4194},
            'assessmentTimestamp': '2023-01-01T00:00:00'
        }
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_risk_assessment') as mock_generate:
            mock_generate.return_value = mock_assessment
            
            response = client.get('/api/risk-assessment?lat=37.7749&lng=-122.4194')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['data'] == mock_assessment.to_dict()
            assert 'timestamp' in data
    
    def test_get_risk_assessment_default_coordinates(self, client):
        """Test risk assessment with default coordinates."""
        mock_assessment = Mock()
        mock_assessment.to_dict.return_value = {'location': {'latitude': 37.7749, 'longitude': -122.4194}}
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_risk_assessment') as mock_generate:
            mock_generate.return_value = mock_assessment
            
            response = client.get('/api/risk-assessment')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            # Should use default coordinates
            mock_generate.assert_called_with((-122.4194, 37.7749))
    
    def test_get_risk_assessment_error(self, client):
        """Test risk assessment retrieval with error."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_risk_assessment') as mock_generate:
            mock_generate.side_effect = Exception("Test error")
            
            response = client.get('/api/risk-assessment')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
    
    def test_get_hazard_summary_success(self, client):
        """Test successful hazard summary retrieval."""
        mock_summary = Mock()
        mock_summary.to_dict.return_value = {
            'totalHazards': 5,
            'riskDistribution': {'high': 2, 'medium': 2, 'low': 1},
            'dataSources': {'FIRMS': 3, 'NOAA': 2},
            'lastUpdated': '2023-01-01T00:00:00',
            'bbox': [-122.5, 37.7, -122.4, 37.8]
        }
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_hazard_summary') as mock_generate:
            mock_generate.return_value = mock_summary
            
            response = client.get('/api/hazard-summary')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['data'] == mock_summary.to_dict()
            assert 'timestamp' in data
    
    def test_get_hazard_summary_error(self, client):
        """Test hazard summary retrieval with error."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_hazard_summary') as mock_generate:
            mock_generate.side_effect = Exception("Test error")
            
            response = client.get('/api/hazard-summary')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
    
    def test_get_evacuation_routes_success(self, client):
        """Test successful evacuation routes retrieval."""
        mock_routes_response = Mock()
        mock_routes_response.to_dict.return_value = {
            'routes': [{'id': 'route-1', 'hazardAvoided': True}],
            'hazardCount': 3,
            'availableRoutes': 1,
            'generatedAt': '2023-01-01T00:00:00'
        }
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_evacuation_routes_response') as mock_generate:
            mock_generate.return_value = mock_routes_response
            
            response = client.get('/api/evacuation-routes')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['data'] == mock_routes_response.to_dict()
            assert 'timestamp' in data
    
    def test_get_evacuation_routes_error(self, client):
        """Test evacuation routes retrieval with error."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_evacuation_routes_response') as mock_generate:
            mock_generate.side_effect = Exception("Test error")
            
            response = client.get('/api/evacuation-routes')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
    
    def test_get_scenario_data_valid_scenario(self, client):
        """Test scenario data retrieval with valid scenario."""
        mock_scenario_data = {
            'hazards': [{'id': 'wildfire-1', 'riskLevel': 'critical'}],
            'routes': [{'id': 'evac-1', 'hazardAvoided': True}],
            'summary': {'totalHazards': 1}
        }
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_scenario_data') as mock_generate:
            mock_generate.return_value = mock_scenario_data
            
            response = client.get('/api/scenario/wildfire-napa')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['data'] == mock_scenario_data
            assert data['scenario'] == 'wildfire-napa'
            assert 'timestamp' in data
    
    def test_get_scenario_data_invalid_scenario(self, client):
        """Test scenario data retrieval with invalid scenario."""
        response = client.get('/api/scenario/invalid-scenario')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data
        assert 'Invalid scenario' in data['error']
    
    def test_get_scenario_data_legacy_scenario(self, client):
        """Test scenario data retrieval with legacy scenario."""
        mock_scenario_data = {'hazards': [], 'routes': []}
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_scenario_data') as mock_generate:
            mock_generate.return_value = mock_scenario_data
            
            response = client.get('/api/scenario/wildfire')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['scenario'] == 'wildfire'
    
    def test_get_scenario_data_error(self, client):
        """Test scenario data retrieval with error."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_scenario_data') as mock_generate:
            mock_generate.side_effect = Exception("Test error")
            
            response = client.get('/api/scenario/wildfire-napa')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
    
    def test_refresh_data_success(self, client, mock_synthetic_data):
        """Test successful data refresh."""
        with patch('backend.functions.synthetic_api.get_cached_data') as mock_get_data:
            mock_get_data.return_value = mock_synthetic_data
            
            response = client.post('/api/refresh')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['message'] == 'Data refreshed successfully'
            assert data['data'] == mock_synthetic_data
            assert 'timestamp' in data
    
    def test_refresh_data_error(self, client):
        """Test data refresh with error."""
        with patch('backend.functions.synthetic_api.get_cached_data') as mock_get_data:
            mock_get_data.side_effect = Exception("Test error")
            
            response = client.post('/api/refresh')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get('/api/health')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['status'] == 'healthy'
        assert data['service'] == 'synthetic-data-api'
        assert 'timestamp' in data
    
    def test_api_info(self, client):
        """Test API info endpoint."""
        response = client.get('/api/info')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['service'] == 'Disaster Response Dashboard - Synthetic Data API'
        assert data['version'] == '1.0.0'
        assert 'endpoints' in data
        assert 'parameters' in data
        
        # Check that all expected endpoints are documented
        expected_endpoints = [
            'GET /api/dashboard',
            'GET /api/hazards',
            'GET /api/routes',
            'GET /api/risk-assessment',
            'GET /api/hazard-summary',
            'GET /api/evacuation-routes',
            'GET /api/scenario/<id>',
            'POST /api/refresh',
            'GET /api/health',
            'GET /api/info'
        ]
        
        for endpoint in expected_endpoints:
            assert endpoint in data['endpoints']
    
    def test_cors_headers(self, client):
        """Test that CORS headers are properly set."""
        response = client.get('/api/health')
        
        # Flask-CORS should add CORS headers
        assert 'Access-Control-Allow-Origin' in response.headers
    
    def test_cache_clearing_on_refresh(self, client, mock_synthetic_data):
        """Test that cache is properly cleared on refresh."""
        import backend.functions.synthetic_api as api_module
        
        # Clear cache first
        api_module._data_cache = {}
        api_module._cache_timestamp = 0
        
        # Set up initial cache
        api_module._data_cache = {'old': 'data'}
        api_module._cache_timestamp = time.time()
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_dashboard_data') as mock_generate:
            mock_generate.return_value = mock_synthetic_data
            
            response = client.post('/api/refresh')
            
            assert response.status_code == 200
            # Cache should be cleared and regenerated
            assert api_module._data_cache == mock_synthetic_data
            assert api_module._cache_timestamp > 0
    
    def test_invalid_request_methods(self, client):
        """Test that invalid HTTP methods return appropriate errors."""
        # Test POST on GET-only endpoints
        response = client.post('/api/health')
        assert response.status_code == 405  # Method Not Allowed
        
        response = client.post('/api/info')
        assert response.status_code == 405
        
        # Test GET on POST-only endpoints
        response = client.get('/api/refresh')
        assert response.status_code == 405
    
    def test_missing_parameters_handling(self, client):
        """Test handling of missing query parameters."""
        # Test risk assessment with missing lat/lng (should use defaults)
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_risk_assessment') as mock_generate:
            mock_generate.return_value = Mock(to_dict=lambda: {})
            
            response = client.get('/api/risk-assessment')
            
            assert response.status_code == 200
            # Should use default coordinates
            mock_generate.assert_called_with((-122.4194, 37.7749))
    
    def test_parameter_type_conversion(self, client):
        """Test that query parameters are properly converted to correct types."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_hazard_zones') as mock_generate:
            mock_generate.return_value = []
            
            response = client.get('/api/hazards?count=5')
            
            assert response.status_code == 200
            # count should be converted to int
            mock_generate.assert_called_with(5)
        
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_risk_assessment') as mock_generate:
            mock_generate.return_value = Mock(to_dict=lambda: {})
            
            response = client.get('/api/risk-assessment?lat=37.5&lng=-122.5')
            
            assert response.status_code == 200
            # lat/lng should be converted to float
            mock_generate.assert_called_with((-122.5, 37.5))
    
    def test_error_response_structure(self, client):
        """Test that error responses have consistent structure."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_hazard_zones') as mock_generate:
            mock_generate.side_effect = ValueError("Invalid parameter")
            
            response = client.get('/api/hazards')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'error' in data
            assert isinstance(data['error'], str)
    
    def test_success_response_structure(self, client):
        """Test that success responses have consistent structure."""
        with patch('backend.functions.synthetic_api.SyntheticDataGenerator.generate_hazard_zones') as mock_generate:
            mock_generate.return_value = []
            
            response = client.get('/api/hazards')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert 'data' in data
            assert 'timestamp' in data
            assert isinstance(data['timestamp'], (int, float))
    

