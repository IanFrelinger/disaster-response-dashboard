"""
Tests for compute modules.
"""

import pytest
import pandas as pd
import geopandas as gpd
import json
import sys
from unittest.mock import Mock, patch, mock_open
from datetime import datetime, timedelta
from shapely.geometry import Point, Polygon

from backend.compute_modules.risk_processor import RiskProcessor


class TestRiskProcessor:
    """Test suite for the RiskProcessor compute module."""
    
    def test_risk_processor_initialization(self):
        """Test RiskProcessor initialization with default config."""
        processor = RiskProcessor()
        
        assert processor.config is not None
        assert 'risk_thresholds' in processor.config
        assert 'processing_window_days' in processor.config
        assert 'output_format' in processor.config
        
        # Verify default thresholds
        thresholds = processor.config['risk_thresholds']
        assert thresholds['low'] == 0.25
        assert thresholds['medium'] == 0.5
        assert thresholds['high'] == 0.75
        assert thresholds['critical'] == 1.0
    
    def test_risk_processor_initialization_with_config_file(self):
        """Test RiskProcessor initialization with config file."""
        config_data = {
            'risk_thresholds': {
                'low': 0.3,
                'medium': 0.6,
                'high': 0.8,
                'critical': 1.0
            },
            'processing_window_days': 14,
            'output_format': 'json'
        }
        
        with patch('builtins.open', mock_open(read_data=json.dumps(config_data))):
            with patch('os.path.exists', return_value=True):
                processor = RiskProcessor('test_config.json')
                
                assert processor.config['risk_thresholds']['low'] == 0.3
                assert processor.config['processing_window_days'] == 14
                assert processor.config['output_format'] == 'json'
    
    def test_process_hazard_data_basic(self, sample_hazard_zones):
        """Test basic hazard data processing."""
        processor = RiskProcessor()
        
        # Process the hazard data
        result_gdf, summary = processor.process_hazard_data(sample_hazard_zones)
        
        # Verify output structure
        assert isinstance(result_gdf, gpd.GeoDataFrame)
        assert isinstance(summary, dict)
        
        # Verify additional columns were added
        expected_columns = ['temporal_risk', 'spatial_risk', 'weather_risk', 'combined_risk', 'risk_level']
        for col in expected_columns:
            assert col in result_gdf.columns
        
        # Verify risk levels are valid
        valid_levels = ['low', 'medium', 'high', 'critical']
        assert all(level in valid_levels for level in result_gdf['risk_level'].unique())
    
    def test_process_hazard_data_with_pandas_dataframe(self):
        """Test processing with pandas DataFrame input."""
        processor = RiskProcessor()
        
        # Create pandas DataFrame
        data = pd.DataFrame({
            'geometry': [Point(0, 0), Point(1, 1)],
            'risk_score': [0.3, 0.7],
            'acq_date': [datetime.now(), datetime.now()]
        })
        
        result_gdf, summary = processor.process_hazard_data(data)
        
        # Should convert to GeoDataFrame
        assert isinstance(result_gdf, gpd.GeoDataFrame)
        assert len(result_gdf) == 2
    
    def test_compute_temporal_risk(self):
        """Test temporal risk computation."""
        processor = RiskProcessor()
        
        # Create dates of different ages
        dates = pd.Series([
            datetime.now() - timedelta(hours=1),   # Very recent
            datetime.now() - timedelta(hours=6),   # Recent
            datetime.now() - timedelta(hours=24),  # Day old
            datetime.now() - timedelta(hours=72)   # 3 days old
        ])
        
        temporal_risks = processor._compute_temporal_risk(dates)
        
        # Verify temporal risks are computed
        assert len(temporal_risks) == 4
        
        # More recent dates should have higher temporal risk
        assert temporal_risks.iloc[0] > temporal_risks.iloc[1]
        assert temporal_risks.iloc[1] > temporal_risks.iloc[2]
        assert temporal_risks.iloc[2] > temporal_risks.iloc[3]
        
        # All values should be between 0 and 1
        assert temporal_risks.min() >= 0
        assert temporal_risks.max() <= 1
    
    def test_compute_spatial_risk(self, sample_hazard_zones):
        """Test spatial risk computation."""
        processor = RiskProcessor()
        
        spatial_risks = processor._compute_spatial_risk(sample_hazard_zones)
        
        # Should return a scalar value (placeholder implementation)
        assert isinstance(spatial_risks, (int, float))
        assert spatial_risks == 0.5  # Default value from implementation
    
    def test_compute_weather_risk(self, sample_hazard_zones):
        """Test weather risk computation."""
        processor = RiskProcessor()
        
        weather_risks = processor._compute_weather_risk(sample_hazard_zones)
        
        # Should return a scalar value (placeholder implementation)
        assert isinstance(weather_risks, (int, float))
        assert weather_risks == 0.3  # Default value from implementation
    
    def test_apply_risk_thresholds(self, sample_hazard_zones):
        """Test risk threshold application."""
        processor = RiskProcessor()
        
        # Add required columns for threshold application
        sample_hazard_zones['temporal_risk'] = 0.3
        sample_hazard_zones['spatial_risk'] = 0.5
        sample_hazard_zones['weather_risk'] = 0.3
        
        result_gdf = processor._apply_risk_thresholds(sample_hazard_zones)
        
        # Verify combined risk was computed
        assert 'combined_risk' in result_gdf.columns
        assert 'risk_level' in result_gdf.columns
        
        # Verify combined risk is weighted correctly
        for idx, row in result_gdf.iterrows():
            expected_combined = (
                row['risk_score'] * 0.4 +
                row['temporal_risk'] * 0.3 +
                row['spatial_risk'] * 0.2 +
                row['weather_risk'] * 0.1
            )
            assert abs(row['combined_risk'] - expected_combined) < 0.001
        
        # Verify risk levels are assigned correctly
        valid_levels = ['low', 'medium', 'high', 'critical']
        assert all(level in valid_levels for level in result_gdf['risk_level'].unique())
    
    def test_generate_risk_summary(self, sample_hazard_zones):
        """Test risk summary generation."""
        processor = RiskProcessor()
        
        # Add required columns
        sample_hazard_zones['combined_risk'] = [0.8, 0.5, 0.2]
        sample_hazard_zones['risk_level'] = ['high', 'medium', 'low']
        
        summary = processor._generate_risk_summary(sample_hazard_zones)
        
        # Verify summary structure
        expected_keys = [
            'total_hazards', 'risk_distribution', 'avg_risk_score',
            'max_risk_score', 'processing_timestamp'
        ]
        for key in expected_keys:
            assert key in summary
        
        # Verify summary values
        assert summary['total_hazards'] == 3
        assert summary['avg_risk_score'] == 0.5
        assert summary['max_risk_score'] == 0.8
        assert 'high' in summary['risk_distribution']
        assert 'medium' in summary['risk_distribution']
        assert 'low' in summary['risk_distribution']
    
    def test_process_hazard_data_error_handling(self):
        """Test error handling in hazard data processing."""
        processor = RiskProcessor()
        
        # Test with invalid data
        invalid_data = "not a dataframe"
        
        with pytest.raises(Exception):
            processor.process_hazard_data(invalid_data)
    
    def test_custom_risk_thresholds(self):
        """Test processing with custom risk thresholds."""
        custom_config = {
            'risk_thresholds': {
                'low': 0.1,
                'medium': 0.3,
                'high': 0.6,
                'critical': 0.9
            },
            'processing_window_days': 7,
            'output_format': 'geojson'
        }
        
        processor = RiskProcessor()
        processor.config = custom_config
        
        # Create test data
        data = pd.DataFrame({
            'geometry': [Point(0, 0), Point(1, 1), Point(2, 2)],
            'risk_score': [0.05, 0.25, 0.75],  # Should map to low, medium, high
            'acq_date': [datetime.now()] * 3
        })
        
        result_gdf, _ = processor.process_hazard_data(data)
        
        # Verify custom thresholds were applied
        risk_levels = result_gdf['risk_level'].tolist()
        assert 'low' in risk_levels
        assert 'medium' in risk_levels
        assert 'high' in risk_levels


class TestRiskProcessorMain:
    """Test suite for the main entry point of RiskProcessor."""
    
    @patch('sys.stdin')
    @patch('sys.argv', ['risk_processor.py'])
    def test_main_with_stdin(self, mock_stdin):
        """Test main function with stdin input."""
        # Mock stdin to return JSON data
        test_data = {
            'hazards': [
                {
                    'geometry': {'type': 'Point', 'coordinates': [0, 0]},
                    'risk_score': 0.5,
                    'acq_date': datetime.now().isoformat()
                }
            ]
        }
        mock_stdin.read.return_value = json.dumps(test_data)
        
        with patch('builtins.print') as mock_print:
            # Import and run main
            from backend.compute_modules.risk_processor import main
            main()
            
            # Verify output was printed
            mock_print.assert_called()
    
    @patch('sys.argv', ['risk_processor.py', 'test_input.json'])
    def test_main_with_file_input(self):
        """Test main function with file input."""
        test_data = {
            'hazards': [
                {
                    'geometry': {'type': 'Point', 'coordinates': [0, 0]},
                    'risk_score': 0.5,
                    'acq_date': datetime.now().isoformat()
                }
            ]
        }
        
        with patch('builtins.open', mock_open(read_data=json.dumps(test_data))):
            with patch('builtins.print') as mock_print:
                from backend.compute_modules.risk_processor import main
                main()
                
                # Verify output was printed
                mock_print.assert_called()
    
    @patch('sys.argv', ['risk_processor.py'])
    def test_main_error_handling(self):
        """Test main function error handling."""
        # Mock stdin to return invalid JSON
        with patch('sys.stdin') as mock_stdin:
            mock_stdin.read.return_value = "invalid json"
            
            with patch('sys.exit') as mock_exit:
                from backend.compute_modules.risk_processor import main
                main()
                
                # Verify exit was called with error code
                mock_exit.assert_called_with(1)
    
    def test_main_successful_processing(self):
        """Test successful processing in main function."""
        test_data = {
            'hazards': [
                {
                    'geometry': {'type': 'Point', 'coordinates': [0, 0]},
                    'risk_score': 0.5,
                    'acq_date': datetime.now().isoformat()
                }
            ]
        }
        
        with patch('sys.stdin') as mock_stdin:
            mock_stdin.read.return_value = json.dumps(test_data)
            
            with patch('builtins.print') as mock_print:
                from backend.compute_modules.risk_processor import main
                main()
                
                # Verify output contains expected structure
                output_call = mock_print.call_args[0][0]
                output_data = json.loads(output_call)
                
                assert 'processed_data' in output_data
                assert 'summary' in output_data
                assert 'total_hazards' in output_data['summary'] 