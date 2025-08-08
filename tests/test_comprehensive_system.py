"""
Comprehensive System Test Suite
Tests the entire disaster response system end-to-end.
"""

import pytest
import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point, Polygon
import json
from datetime import datetime, timedelta
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from transforms.processing.hazard_processor import HazardProcessor
from transforms.routing.route_optimizer import RouteOptimizer


class TestComprehensiveDisasterResponseSystem:
    """Comprehensive test suite for the disaster response system."""
    
    @pytest.fixture
    def hazard_processor(self):
        """Initialize hazard processor for testing."""
        processor = HazardProcessor()
        processor.load_ml_model()  # Load default model
        return processor
    
    @pytest.fixture
    def route_optimizer(self):
        """Initialize route optimizer for testing."""
        return RouteOptimizer()
    
    @pytest.fixture
    def sample_firms_data(self):
        """Create sample NASA FIRMS data."""
        return pd.DataFrame({
            'latitude': [37.7749, 37.7849, 37.7649],
            'longitude': [-122.4194, -122.4094, -122.4294],
            'brightness_temp': [350, 380, 320],
            'confidence': [0.8, 0.9, 0.7],
            'detected_at': [datetime.now()] * 3
        })
    
    @pytest.fixture
    def sample_weather_data(self):
        """Create sample NOAA weather data."""
        return pd.DataFrame({
            'latitude': [37.7749, 37.7849, 37.7649],
            'longitude': [-122.4194, -122.4094, -122.4294],
            'u_wind': [5.0, 3.0, 7.0],
            'v_wind': [2.0, 4.0, 1.0],
            'humidity': [45, 50, 40],
            'temperature': [25, 23, 27]
        })
    
    @pytest.fixture
    def sample_road_network(self):
        """Create sample road network data."""
        roads = []
        for i in range(10):
            road = {
                'geometry': Point(-122.4194 + i*0.01, 37.7749 + i*0.01).buffer(0.001),
                'road_id': f'road_{i}',
                'name': f'Road {i}',
                'speed_limit': 50,
                'road_type': 'residential' if i % 2 == 0 else 'arterial',
                'bridge_weight_limit': 40000 if i % 3 == 0 else 0,
                'height_limit': 4.0 if i % 4 == 0 else 0
            }
            roads.append(road)
        
        return gpd.GeoDataFrame(roads, crs="EPSG:4326")
    
    @pytest.fixture
    def sample_hazard_zones(self):
        """Create sample hazard zones."""
        hazards = []
        for i in range(3):
            hazard = {
                'geometry': Point(-122.4194 + i*0.02, 37.7749 + i*0.02).buffer(0.005),
                'hazard_id': f'hazard_{i}',
                'type': 'fire',
                'severity': ['low', 'medium', 'high'][i],
                'risk_score': [0.5, 1.5, 2.5][i],
                'affected_population': [100, 500, 1000][i],
                'detected_at': datetime.now(),
                'data_source': 'NASA_FIRMS',
                'confidence': [0.7, 0.8, 0.9][i]
            }
            hazards.append(hazard)
        
        return gpd.GeoDataFrame(hazards, crs="EPSG:4326")

    def test_hazard_processing_pipeline(self, hazard_processor, sample_firms_data, sample_weather_data):
        """Test the complete hazard processing pipeline."""
        
        # Test FIRMS data processing
        processed_firms = hazard_processor.process_firms_data(sample_firms_data)
        assert len(processed_firms) == 3
        assert 'h3_index' in processed_firms.columns
        assert 'confidence' in processed_firms.columns
        assert 'data_source' in processed_firms.columns
        assert all(processed_firms['data_source'] == 'NASA_FIRMS')
        
        # Test weather data processing
        processed_weather = hazard_processor.process_weather_data(sample_weather_data)
        assert len(processed_weather) == 3
        assert 'wind_speed' in processed_weather.columns
        assert 'wind_direction' in processed_weather.columns
        assert 'data_source' in processed_weather.columns
        assert all(processed_weather['data_source'] == 'NOAA_WEATHER')
        
        # Test hazard spread prediction
        predictions = hazard_processor.predict_hazard_spread(
            processed_firms, processed_weather
        )
        assert 'predictions' in predictions
        assert 'total_hazards' in predictions
        assert 'prediction_timestamp' in predictions
        assert len(predictions['predictions']) == 3
        
        # Test risk zone calculation
        risk_zones = hazard_processor.calculate_risk_zones(processed_firms)
        assert len(risk_zones) == 3
        assert 'risk_score' in risk_zones.columns
        assert 'risk_level' in risk_zones.columns
        assert 'affected_population' in risk_zones.columns
        
        # Verify risk levels are categorized correctly
        risk_levels = risk_zones['risk_level'].unique()
        assert all(level in ['low', 'medium', 'high', 'critical'] for level in risk_levels)

    def test_route_optimization_system(self, route_optimizer, sample_road_network, sample_hazard_zones):
        """Test the route optimization system."""
        
        # Load road network
        route_optimizer.load_road_network(sample_road_network)
        assert route_optimizer.road_network is not None
        assert len(route_optimizer.road_network) == 10
        
        # Test safe route calculation
        origin = (37.7749, -122.4194)
        destination = (37.7849, -122.4094)
        
        route_result = route_optimizer.calculate_safe_route(
            origin=origin,
            destination=destination,
            hazard_zones=sample_hazard_zones,
            vehicle_type='engine',
            priority='safest'
        )
        
        assert 'success' in route_result
        if route_result['success']:
            assert 'route_id' in route_result
            assert 'geometry' in route_result
            assert 'metrics' in route_result
            assert 'safety_score' in route_result
            assert 'total_distance_km' in route_result
            assert 'estimated_duration_min' in route_result
            
            # Verify safety score is between 0 and 1
            assert 0 <= route_result['safety_score'] <= 1
            
            # Verify distance is reasonable
            assert route_result['total_distance_km'] > 0
            
        # Test evacuation route calculation
        evacuation_zones = [
            {
                'id': 'zone_1',
                'latitude': 37.7749,
                'longitude': -122.4194,
                'population': 1000
            }
        ]
        
        shelter_locations = [
            {
                'id': 'shelter_1',
                'latitude': 37.7849,
                'longitude': -122.4094,
                'capacity': 2000
            }
        ]
        
        evacuation_result = route_optimizer.calculate_evacuation_routes(
            evacuation_zones=evacuation_zones,
            shelter_locations=shelter_locations,
            hazard_zones=sample_hazard_zones
        )
        
        assert 'evacuation_routes' in evacuation_result
        assert 'total_routes' in evacuation_result
        assert 'zones_covered' in evacuation_result

    def test_hazard_confidence_calculation(self, hazard_processor):
        """Test hazard confidence calculation based on brightness temperature."""
        
        # Test with various brightness temperatures
        brightness_temps = pd.Series([300, 350, 400, 450])
        confidence_scores = hazard_processor._calculate_fire_confidence(brightness_temps)
        
        assert len(confidence_scores) == 4
        assert all(0.1 <= score <= 1.0 for score in confidence_scores)
        
        # Verify higher temperature = higher confidence
        assert confidence_scores.iloc[1] > confidence_scores.iloc[0]
        assert confidence_scores.iloc[2] > confidence_scores.iloc[1]

    def test_risk_score_calculation(self, hazard_processor):
        """Test risk score calculation with different hazard types and severities."""
        
        # Create test hazard data
        test_hazards = [
            {'severity': 'low', 'type': 'fire', 'confidence': 0.5},
            {'severity': 'medium', 'type': 'fire', 'confidence': 0.8},
            {'severity': 'high', 'type': 'chemical', 'confidence': 0.9},
            {'severity': 'critical', 'type': 'fire', 'confidence': 0.7}
        ]
        
        risk_scores = []
        for hazard_data in test_hazards:
            hazard_series = pd.Series(hazard_data)
            risk_score = hazard_processor._calculate_risk_score(hazard_series)
            risk_scores.append(risk_score)
        
        # Verify risk scores are calculated
        assert len(risk_scores) == 4
        assert all(score > 0 for score in risk_scores)
        
        # Verify critical hazards have higher scores
        critical_score = risk_scores[3]  # critical fire
        medium_score = risk_scores[1]    # medium fire
        assert critical_score > medium_score

    def test_hazard_spread_prediction(self, hazard_processor, sample_weather_data):
        """Test hazard spread prediction functionality."""
        
        # Create a simple hazard point
        hazard_point = pd.Series({
            'geometry': Point(-122.4194, 37.7749),
            'h3_index': '8928308280fffff',
            'brightness_temp': 350,
            'confidence': 0.8
        })
        
        # Test feature extraction
        features = hazard_processor._extract_prediction_features(
            hazard_point, sample_weather_data
        )
        
        assert features is not None
        assert len(features) >= 6  # Should have multiple features
        
        # Test spread cell generation
        spread_cells = hazard_processor._generate_spread_cells(
            Point(-122.4194, 37.7749),
            0.7,  # spread probability
            sample_weather_data
        )
        
        assert len(spread_cells) > 0
        assert all(isinstance(cell, str) for cell in spread_cells)  # H3 indices are strings

    def test_route_safety_calculation(self, route_optimizer, sample_hazard_zones):
        """Test route safety score calculation."""
        
        # Create a test route
        route_geometry = Point(-122.4194, 37.7749).buffer(0.01)
        
        # Test with hazards present
        safety_score_with_hazards = route_optimizer._calculate_route_safety_score(
            route_geometry, sample_hazard_zones
        )
        assert 0 <= safety_score_with_hazards <= 1
        
        # Test with no hazards
        empty_hazards = gpd.GeoDataFrame([], crs="EPSG:4326")
        safety_score_no_hazards = route_optimizer._calculate_route_safety_score(
            route_geometry, empty_hazards
        )
        assert safety_score_no_hazards == 1.0

    def test_vehicle_constraint_penalties(self, route_optimizer):
        """Test vehicle-specific constraint penalties."""
        
        # Create test road data
        road_data = pd.Series({
            'bridge_weight_limit': 30000,
            'height_limit': 3.0,
            'road_type': 'residential'
        })
        
        # Test engine constraints
        engine_penalty = route_optimizer._calculate_vehicle_constraint_penalty(
            road_data, 'engine'
        )
        assert engine_penalty > 0  # Should have penalty for weight limit
        
        # Test civilian constraints
        civilian_penalty = route_optimizer._calculate_vehicle_constraint_penalty(
            road_data, 'civilian'
        )
        assert civilian_penalty == 0  # No penalty for civilian vehicle

    def test_hazard_penalty_calculation(self, route_optimizer, sample_hazard_zones):
        """Test hazard penalty calculation for routes."""
        
        # Create a test road geometry
        road_geometry = Point(-122.4194, 37.7749).buffer(0.001)
        
        # Calculate penalty
        penalty = route_optimizer._calculate_hazard_penalty(
            road_geometry, sample_hazard_zones
        )
        
        assert penalty >= 0
        assert isinstance(penalty, float)

    def test_data_integration_workflow(self, hazard_processor, route_optimizer, 
                                     sample_firms_data, sample_weather_data, 
                                     sample_road_network, sample_hazard_zones):
        """Test the complete data integration workflow."""
        
        # Step 1: Process hazard data
        processed_firms = hazard_processor.process_firms_data(sample_firms_data)
        processed_weather = hazard_processor.process_weather_data(sample_weather_data)
        
        # Step 2: Generate predictions
        predictions = hazard_processor.predict_hazard_spread(
            processed_firms, processed_weather
        )
        
        # Step 3: Calculate risk zones
        risk_zones = hazard_processor.calculate_risk_zones(processed_firms)
        
        # Step 4: Load road network
        route_optimizer.load_road_network(sample_road_network)
        
        # Step 5: Calculate safe routes
        origin = (37.7749, -122.4194)
        destination = (37.7849, -122.4094)
        
        route_result = route_optimizer.calculate_safe_route(
            origin=origin,
            destination=destination,
            hazard_zones=risk_zones,  # Use calculated risk zones
            vehicle_type='engine',
            priority='safest'
        )
        
        # Verify the complete workflow produces valid results
        assert len(processed_firms) > 0
        assert len(processed_weather) > 0
        assert len(predictions['predictions']) > 0
        assert len(risk_zones) > 0
        assert route_optimizer.road_network is not None
        assert 'success' in route_result

    def test_performance_requirements(self, hazard_processor, route_optimizer,
                                    sample_firms_data, sample_weather_data,
                                    sample_road_network, sample_hazard_zones):
        """Test that the system meets performance requirements."""
        
        import time
        
        # Test hazard processing performance (< 15 seconds)
        start_time = time.time()
        processed_firms = hazard_processor.process_firms_data(sample_firms_data)
        processed_weather = hazard_processor.process_weather_data(sample_weather_data)
        processing_time = time.time() - start_time
        
        assert processing_time < 15, f"Hazard processing took {processing_time:.2f} seconds"
        
        # Test route calculation performance (< 3 seconds)
        route_optimizer.load_road_network(sample_road_network)
        
        start_time = time.time()
        route_result = route_optimizer.calculate_safe_route(
            origin=(37.7749, -122.4194),
            destination=(37.7849, -122.4094),
            hazard_zones=sample_hazard_zones,
            vehicle_type='engine',
            priority='safest'
        )
        route_time = time.time() - start_time
        
        assert route_time < 3, f"Route calculation took {route_time:.2f} seconds"

    def test_error_handling(self, hazard_processor, route_optimizer):
        """Test error handling and edge cases."""
        
        # Test with empty data
        empty_df = pd.DataFrame()
        
        with pytest.raises(Exception):
            hazard_processor.process_firms_data(empty_df)
        
        # Test route optimization without road network
        with pytest.raises(ValueError):
            route_optimizer.calculate_safe_route(
                origin=(37.7749, -122.4194),
                destination=(37.7849, -122.4094),
                hazard_zones=gpd.GeoDataFrame(),
                vehicle_type='engine'
            )

    def test_data_consistency(self, hazard_processor, sample_firms_data):
        """Test data consistency and validation."""
        
        processed_firms = hazard_processor.process_firms_data(sample_firms_data)
        
        # Verify all required columns are present
        required_columns = ['h3_index', 'confidence', 'data_source', 'processed_at']
        for col in required_columns:
            assert col in processed_firms.columns
        
        # Verify data types
        assert processed_firms['h3_index'].dtype == 'object'  # String
        assert processed_firms['confidence'].dtype in ['float64', 'float32']
        
        # Verify confidence scores are within valid range
        assert all(0.1 <= score <= 1.0 for score in processed_firms['confidence'])
        
        # Verify H3 indices are valid
        assert all(len(h3) > 0 for h3 in processed_firms['h3_index'])


if __name__ == "__main__":
    # Run the comprehensive test suite
    pytest.main([__file__, "-v", "--tb=short"])
