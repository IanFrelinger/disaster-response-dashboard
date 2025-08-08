"""
Tests for Foundry Functions API endpoints.
"""

import pytest
import json
from unittest.mock import Mock, patch
from datetime import datetime
from shapely.geometry import Point, Polygon

from backend.functions.disaster_api import (
    get_hazard_summary,
    get_hazard_zones_geojson,
    get_evacuation_routes,
    get_risk_assessment
)


class TestDisasterAPI:
    """Test suite for disaster response API functions."""
    
    def test_get_hazard_summary(self, sample_hazard_zones, sample_safe_routes):
        """Test hazard summary generation."""
        # Mock input datasets
        mock_hazard_input = Mock()
        mock_routes_input = Mock()
        
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        mock_routes_input.read_dataframe.return_value = sample_safe_routes
        
        # Call the function
        summary = get_hazard_summary(mock_hazard_input, mock_routes_input)
        
        # Verify summary structure
        expected_keys = [
            'total_hazards', 'risk_distribution', 'data_sources',
            'last_updated', 'bbox'
        ]
        for key in expected_keys:
            assert key in summary
        
        # Verify summary values
        assert summary['total_hazards'] == 3
        assert 'high' in summary['risk_distribution']
        assert 'medium' in summary['risk_distribution']
        assert 'low' in summary['risk_distribution']
        assert summary['data_sources']['FIRMS'] == 3
        assert summary['bbox'] is not None
    
    def test_get_hazard_summary_empty_data(self, sample_hazard_zones, sample_safe_routes):
        """Test hazard summary with empty data."""
        # Create empty GeoDataFrame
        empty_gdf = sample_hazard_zones.iloc[0:0]  # Empty DataFrame
        empty_routes = sample_safe_routes.iloc[0:0]  # Empty DataFrame
        
        mock_hazard_input = Mock()
        mock_routes_input = Mock()
        
        mock_hazard_input.read_dataframe.return_value = empty_gdf
        mock_routes_input.read_dataframe.return_value = empty_routes
        
        summary = get_hazard_summary(mock_hazard_input, mock_routes_input)
        
        assert summary['total_hazards'] == 0
        assert summary['bbox'] is None
    
    def test_get_hazard_zones_geojson(self, sample_hazard_zones):
        """Test hazard zones GeoJSON generation."""
        mock_hazard_input = Mock()
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        
        geojson = get_hazard_zones_geojson(mock_hazard_input)
        
        # Verify GeoJSON structure
        assert 'type' in geojson
        assert 'features' in geojson
        assert 'metadata' in geojson
        
        # Verify features
        assert len(geojson['features']) == 3
        assert geojson['metadata']['total_features'] == 3
        
        # Verify feature structure
        feature = geojson['features'][0]
        assert 'type' in feature
        assert 'geometry' in feature
        assert 'properties' in feature
        
        # Verify metadata
        assert 'generated_at' in geojson['metadata']
        assert 'bbox' in geojson['metadata']
    
    def test_get_hazard_zones_geojson_empty(self, sample_hazard_zones):
        """Test GeoJSON generation with empty data."""
        empty_gdf = sample_hazard_zones.iloc[0:0]  # Empty DataFrame
        
        mock_hazard_input = Mock()
        mock_hazard_input.read_dataframe.return_value = empty_gdf
        
        geojson = get_hazard_zones_geojson(mock_hazard_input)
        
        assert len(geojson['features']) == 0
        assert geojson['metadata']['total_features'] == 0
    
    def test_get_evacuation_routes_with_coordinates(self, sample_hazard_zones, sample_safe_routes):
        """Test evacuation routes with specific coordinates."""
        mock_hazard_input = Mock()
        mock_routes_input = Mock()
        
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        mock_routes_input.read_dataframe.return_value = sample_safe_routes
        
        # Test with specific coordinates
        routes_response = get_evacuation_routes(
            mock_hazard_input, 
            mock_routes_input,
            origin_lat=0.5,
            origin_lon=0.5,
            destination_lat=3.5,
            destination_lon=3.5
        )
        
        # Verify response structure
        expected_keys = ['routes', 'hazard_count', 'available_routes', 'generated_at']
        for key in expected_keys:
            assert key in routes_response
        
        # Verify values
        assert routes_response['hazard_count'] == 3
        assert routes_response['available_routes'] == 2
        assert len(routes_response['routes']) == 2
    
    def test_get_evacuation_routes_without_coordinates(self, sample_hazard_zones, sample_safe_routes):
        """Test evacuation routes without specific coordinates."""
        mock_hazard_input = Mock()
        mock_routes_input = Mock()
        
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        mock_routes_input.read_dataframe.return_value = sample_safe_routes
        
        routes_response = get_evacuation_routes(mock_hazard_input, mock_routes_input)
        
        # Should return all available routes
        assert routes_response['available_routes'] == 2
        assert len(routes_response['routes']) == 2
    
    def test_get_evacuation_routes_empty_data(self, sample_hazard_zones, sample_safe_routes):
        """Test evacuation routes with empty data."""
        empty_hazards = sample_hazard_zones.iloc[0:0]
        empty_routes = sample_safe_routes.iloc[0:0]
        
        mock_hazard_input = Mock()
        mock_routes_input = Mock()
        
        mock_hazard_input.read_dataframe.return_value = empty_hazards
        mock_routes_input.read_dataframe.return_value = empty_routes
        
        routes_response = get_evacuation_routes(mock_hazard_input, mock_routes_input)
        
        assert routes_response['hazard_count'] == 0
        assert routes_response['available_routes'] == 0
        assert len(routes_response['routes']) == 0
    
    def test_get_risk_assessment_with_hazards(self, sample_hazard_zones):
        """Test risk assessment with nearby hazards."""
        mock_hazard_input = Mock()
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        
        # Test location near hazards
        risk_metrics = get_risk_assessment(
            mock_hazard_input,
            latitude=0.5,
            longitude=0.5,
            radius_km=10
        )
        
        # Verify response structure
        expected_keys = [
            'total_nearby_hazards', 'risk_levels', 'avg_risk_score',
            'max_risk_score', 'closest_hazard_distance_km', 'assessment_radius_km',
            'location', 'assessment_timestamp'
        ]
        for key in expected_keys:
            assert key in risk_metrics
        
        # Verify values
        assert risk_metrics['total_nearby_hazards'] > 0
        assert risk_metrics['assessment_radius_km'] == 10
        assert risk_metrics['location']['latitude'] == 0.5
        assert risk_metrics['location']['longitude'] == 0.5
        assert risk_metrics['closest_hazard_distance_km'] is not None
    
    def test_get_risk_assessment_no_hazards(self, sample_hazard_zones):
        """Test risk assessment with no nearby hazards."""
        mock_hazard_input = Mock()
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        
        # Test location far from hazards
        risk_metrics = get_risk_assessment(
            mock_hazard_input,
            latitude=100.0,
            longitude=100.0,
            radius_km=5
        )
        
        # Should find no nearby hazards
        assert risk_metrics['total_nearby_hazards'] == 0
        assert risk_metrics['avg_risk_score'] == 0.0
        assert risk_metrics['max_risk_score'] == 0.0
        assert risk_metrics['closest_hazard_distance_km'] is None
        assert len(risk_metrics['risk_levels']) == 0
    
    def test_get_risk_assessment_custom_radius(self, sample_hazard_zones):
        """Test risk assessment with custom radius."""
        mock_hazard_input = Mock()
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        
        # Test with different radius
        risk_metrics = get_risk_assessment(
            mock_hazard_input,
            latitude=0.5,
            longitude=0.5,
            radius_km=50
        )
        
        assert risk_metrics['assessment_radius_km'] == 50
    
    def test_get_risk_assessment_empty_data(self, sample_hazard_zones):
        """Test risk assessment with empty hazard data."""
        empty_hazards = sample_hazard_zones.iloc[0:0]
        
        mock_hazard_input = Mock()
        mock_hazard_input.read_dataframe.return_value = empty_hazards
        
        risk_metrics = get_risk_assessment(
            mock_hazard_input,
            latitude=0.5,
            longitude=0.5,
            radius_km=10
        )
        
        assert risk_metrics['total_nearby_hazards'] == 0
        assert risk_metrics['avg_risk_score'] == 0.0
        assert risk_metrics['max_risk_score'] == 0.0
    
    def test_get_hazard_summary_missing_columns(self, sample_hazard_zones, sample_safe_routes):
        """Test hazard summary with missing optional columns."""
        # Create data with missing columns
        minimal_data = sample_hazard_zones[['geometry', 'risk_level']].copy()
        
        mock_hazard_input = Mock()
        mock_routes_input = Mock()
        
        mock_hazard_input.read_dataframe.return_value = minimal_data
        mock_routes_input.read_dataframe.return_value = sample_safe_routes
        
        summary = get_hazard_summary(mock_hazard_input, mock_routes_input)
        
        # Should handle missing columns gracefully
        assert summary['total_hazards'] == 3
        assert 'risk_distribution' in summary
        assert summary['last_updated'] is None  # Missing column
    
    def test_get_hazard_zones_geojson_crs_handling(self, sample_hazard_zones):
        """Test GeoJSON generation with different CRS."""
        # Create data with different CRS
        data_3857 = sample_hazard_zones.copy()
        data_3857.crs = 'EPSG:3857'  # Web Mercator
        
        mock_hazard_input = Mock()
        mock_hazard_input.read_dataframe.return_value = data_3857
        
        geojson = get_hazard_zones_geojson(mock_hazard_input)
        
        # Should handle CRS conversion gracefully
        assert 'features' in geojson
        assert len(geojson['features']) == 3
    
    def test_get_evacuation_routes_coordinate_validation(self, sample_hazard_zones, sample_safe_routes):
        """Test evacuation routes with invalid coordinates."""
        mock_hazard_input = Mock()
        mock_routes_input = Mock()
        
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        mock_routes_input.read_dataframe.return_value = sample_safe_routes
        
        # Test with None coordinates
        routes_response = get_evacuation_routes(
            mock_hazard_input, 
            mock_routes_input,
            origin_lat=None,
            origin_lon=None,
            destination_lat=None,
            destination_lon=None
        )
        
        # Should return all routes when coordinates are None
        assert routes_response['available_routes'] == 2
    
    def test_get_risk_assessment_coordinate_validation(self, sample_hazard_zones):
        """Test risk assessment with invalid coordinates."""
        mock_hazard_input = Mock()
        mock_hazard_input.read_dataframe.return_value = sample_hazard_zones
        
        # Test with extreme coordinates
        risk_metrics = get_risk_assessment(
            mock_hazard_input,
            latitude=90.0,  # North pole
            longitude=180.0,  # International date line
            radius_km=10
        )
        
        # Should handle extreme coordinates gracefully
        assert 'total_nearby_hazards' in risk_metrics
        assert 'location' in risk_metrics
        assert risk_metrics['location']['latitude'] == 90.0
        assert risk_metrics['location']['longitude'] == 180.0 