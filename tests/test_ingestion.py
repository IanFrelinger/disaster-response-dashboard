"""
Tests for ingestion transforms.
"""

import pytest
import pandas as pd
import geopandas as gpd
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from shapely.geometry import Point

from backend.transforms.ingestion.wildfire_feed import compute_risk_scores, compute_hazard_zones


class TestWildfireFeedIngestion:
    """Test suite for wildfire feed ingestion transforms."""
    
    def test_compute_risk_scores_basic(self, sample_wildfire_data):
        """Test basic risk score computation."""
        # Convert to GeoDataFrame
        gdf = gpd.GeoDataFrame(
            sample_wildfire_data,
            geometry=[Point(lon, lat) for lon, lat in zip(sample_wildfire_data['longitude'], sample_wildfire_data['latitude'])],
            crs='EPSG:4326'
        )
        
        # Compute risk scores
        result = compute_risk_scores(gdf)
        
        # Verify risk scores were computed
        assert 'risk_score' in result.columns
        assert 'risk_level' in result.columns
        assert len(result) == len(gdf)
        
        # Verify risk scores are in valid range
        assert result['risk_score'].min() >= 0
        assert result['risk_score'].max() <= 1
        
        # Verify risk levels are valid
        valid_levels = ['low', 'medium', 'high', 'critical']
        assert all(level in valid_levels for level in result['risk_level'].unique())
    
    def test_compute_risk_scores_with_brightness(self):
        """Test risk scoring with brightness factor."""
        data = pd.DataFrame({
            'brightness': [100, 200, 300, 400],
            'confidence': [50, 60, 70, 80],
            'acq_date': [datetime.now() - timedelta(hours=i) for i in [1, 2, 3, 4]]
        })
        
        gdf = gpd.GeoDataFrame(data, crs='EPSG:4326')
        result = compute_risk_scores(gdf)
        
        # Higher brightness should generally result in higher risk scores
        brightness_risk_correlation = result['brightness'].corr(result['risk_score'])
        assert brightness_risk_correlation > 0  # Positive correlation
    
    def test_compute_risk_scores_with_confidence(self):
        """Test risk scoring with confidence factor."""
        data = pd.DataFrame({
            'brightness': [200, 200, 200, 200],  # Same brightness
            'confidence': [50, 60, 70, 80],      # Varying confidence
            'acq_date': [datetime.now() - timedelta(hours=1)] * 4
        })
        
        gdf = gpd.GeoDataFrame(data, crs='EPSG:4326')
        result = compute_risk_scores(gdf)
        
        # Higher confidence should generally result in higher risk scores
        confidence_risk_correlation = result['confidence'].corr(result['risk_score'])
        assert confidence_risk_correlation > 0  # Positive correlation
    
    def test_compute_risk_scores_temporal_factor(self):
        """Test risk scoring with temporal factor."""
        data = pd.DataFrame({
            'brightness': [200] * 4,
            'confidence': [70] * 4,
            'acq_date': [
                datetime.now() - timedelta(hours=1),   # Very recent
                datetime.now() - timedelta(hours=6),   # Recent
                datetime.now() - timedelta(hours=24),  # Day old
                datetime.now() - timedelta(hours=72)   # 3 days old
            ]
        })
        
        gdf = gpd.GeoDataFrame(data, crs='EPSG:4326')
        result = compute_risk_scores(gdf)
        
        # More recent fires should have higher risk scores
        assert result.iloc[0]['risk_score'] > result.iloc[1]['risk_score']
        assert result.iloc[1]['risk_score'] > result.iloc[2]['risk_score']
        assert result.iloc[2]['risk_score'] > result.iloc[3]['risk_score']
    
    def test_compute_risk_scores_missing_columns(self):
        """Test risk scoring with missing optional columns."""
        data = pd.DataFrame({
            'brightness': [200, 300],
            'acq_date': [datetime.now(), datetime.now()]
        })
        
        gdf = gpd.GeoDataFrame(data, crs='EPSG:4326')
        result = compute_risk_scores(gdf)
        
        # Should handle missing confidence column gracefully
        assert 'risk_score' in result.columns
        assert 'risk_level' in result.columns
        assert len(result) == 2
    
    def test_compute_risk_scores_edge_cases(self):
        """Test risk scoring with edge cases."""
        # Empty DataFrame
        empty_gdf = gpd.GeoDataFrame(columns=['brightness', 'confidence', 'acq_date'], crs='EPSG:4326')
        result = compute_risk_scores(empty_gdf)
        assert len(result) == 0
        
        # Single record
        single_data = pd.DataFrame({
            'brightness': [500],
            'confidence': [100],
            'acq_date': [datetime.now()]
        })
        single_gdf = gpd.GeoDataFrame(single_data, crs='EPSG:4326')
        result = compute_risk_scores(single_gdf)
        assert len(result) == 1
        assert result.iloc[0]['risk_score'] > 0


class TestWildfireFeedTransform:
    """Test suite for the main wildfire feed transform."""
    
    @patch('backend.transforms.ingestion.wildfire_feed.compute_risk_scores')
    def test_compute_hazard_zones_transform(self, mock_compute_risk_scores, sample_wildfire_data):
        """Test the main transform function."""
        # Mock the input and output
        mock_input = Mock()
        mock_output = Mock()
        
        # Create GeoDataFrame from sample data
        gdf = gpd.GeoDataFrame(
            sample_wildfire_data,
            geometry=[Point(lon, lat) for lon, lat in zip(sample_wildfire_data['longitude'], sample_wildfire_data['latitude'])],
            crs='EPSG:4326'
        )
        
        # Mock the read_dataframe method
        mock_input.read_dataframe.return_value = gdf
        
        # Mock the compute_risk_scores function
        mock_compute_risk_scores.return_value = gdf.copy()
        
        # Call the transform
        compute_hazard_zones(mock_input, mock_output)
        
        # Verify input was read
        mock_input.read_dataframe.assert_called_once()
        
        # Verify risk scores were computed
        mock_compute_risk_scores.assert_called_once()
        
        # Verify output was written
        mock_output.write_dataframe.assert_called_once()
    
    def test_compute_hazard_zones_with_lat_lon(self):
        """Test transform with latitude/longitude columns instead of geometry."""
        # Create data with lat/lon but no geometry
        data = pd.DataFrame({
            'latitude': [37.7749, 37.7849],
            'longitude': [-122.4194, -122.4094],
            'brightness': [300, 250],
            'confidence': [85, 92],
            'acq_date': [datetime.now(), datetime.now()]
        })
        
        mock_input = Mock()
        mock_output = Mock()
        mock_input.read_dataframe.return_value = data
        
        # Mock compute_risk_scores to return the same data
        with patch('backend.transforms.ingestion.wildfire_feed.compute_risk_scores') as mock_compute:
            mock_compute.return_value = data
            compute_hazard_zones(mock_input, mock_output)
        
        # Verify geometry was created from lat/lon
        mock_output.write_dataframe.assert_called_once()
    
    def test_compute_hazard_zones_no_geometry_error(self):
        """Test transform raises error when no geometry or lat/lon available."""
        # Create data with no geometry or lat/lon
        data = pd.DataFrame({
            'brightness': [300, 250],
            'confidence': [85, 92],
            'acq_date': [datetime.now(), datetime.now()]
        })
        
        mock_input = Mock()
        mock_output = Mock()
        mock_input.read_dataframe.return_value = data
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="No geometry column found"):
            compute_hazard_zones(mock_input, mock_output)
    
    def test_compute_hazard_zones_h3_indexing(self):
        """Test that H3 indexing is applied correctly."""
        data = pd.DataFrame({
            'latitude': [37.7749],
            'longitude': [-122.4194],
            'brightness': [300],
            'confidence': [85],
            'acq_date': [datetime.now()]
        })
        
        mock_input = Mock()
        mock_output = Mock()
        mock_input.read_dataframe.return_value = data
        
        with patch('backend.transforms.ingestion.wildfire_feed.compute_risk_scores') as mock_compute:
            mock_compute.return_value = data
            compute_hazard_zones(mock_input, mock_output)
        
        # Verify H3 indexing was applied
        called_data = mock_output.write_dataframe.call_args[0][0]
        assert 'h3_index' in called_data.columns
    
    def test_compute_hazard_zones_metadata(self):
        """Test that metadata is added correctly."""
        data = pd.DataFrame({
            'latitude': [37.7749],
            'longitude': [-122.4194],
            'brightness': [300],
            'confidence': [85],
            'acq_date': [datetime.now()]
        })
        
        mock_input = Mock()
        mock_output = Mock()
        mock_input.read_dataframe.return_value = data
        
        with patch('backend.transforms.ingestion.wildfire_feed.compute_risk_scores') as mock_compute:
            mock_compute.return_value = data
            compute_hazard_zones(mock_input, mock_output)
        
        # Verify metadata was added
        called_data = mock_output.write_dataframe.call_args[0][0]
        assert 'data_source' in called_data.columns
        assert 'last_updated' in called_data.columns
        assert called_data['data_source'].iloc[0] == 'FIRMS'
    
    def test_compute_hazard_zones_temporal_filtering(self):
        """Test that recent fires are filtered correctly."""
        # Create data with fires of different ages
        old_fire = datetime.now() - timedelta(days=10)
        recent_fire = datetime.now() - timedelta(hours=6)
        
        data = pd.DataFrame({
            'latitude': [37.7749, 37.7849],
            'longitude': [-122.4194, -122.4094],
            'brightness': [300, 250],
            'confidence': [85, 92],
            'acq_date': [old_fire, recent_fire]
        })
        
        mock_input = Mock()
        mock_output = Mock()
        mock_input.read_dataframe.return_value = data
        
        with patch('backend.transforms.ingestion.wildfire_feed.compute_risk_scores') as mock_compute:
            mock_compute.return_value = data
            compute_hazard_zones(mock_input, mock_output)
        
        # Verify only recent fires are included
        called_data = mock_output.write_dataframe.call_args[0][0]
        assert len(called_data) == 1  # Only the recent fire should remain
        assert called_data['acq_date'].iloc[0] == recent_fire 