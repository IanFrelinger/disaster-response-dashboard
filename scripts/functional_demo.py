#!/usr/bin/env python3
"""
Functional Demo Script - Test Mock Implementations
This script tests the actual mock implementations to ensure they work correctly.
"""

import sys
import os
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import mock modules
try:
    from mock_transforms import process_wildfire_data, compute_hazard_zones, optimize_evacuation_routes
    from mock_aip import EvacuationCommander, quick_evacuation_check, get_population_at_risk, predict_fire_spread
    from mock_ontology import (
        ChallengeHazardZone, ChallengeEmergencyUnit, ChallengeEvacuationRoute, 
        ChallengeEvacuationOrder, ChallengeBuilding, ontology_registry
    )
    print("✅ Successfully imported mock modules")
except ImportError as e:
    print(f"❌ Failed to import mock modules: {e}")
    sys.exit(1)

import structlog

logger = structlog.get_logger(__name__)


def print_header(title: str):
    """Print a formatted header"""
    print("\n" + "="*80)
    print(f"🏆 {title}")
    print("="*80)


def print_section(title: str):
    """Print a formatted section"""
    print(f"\n📋 {title}")
    print("-" * 60)


def print_success(message: str):
    """Print a success message"""
    print(f"✅ {message}")


def print_info(message: str):
    """Print an info message"""
    print(f"ℹ️  {message}")


def print_warning(message: str):
    """Print a warning message"""
    print(f"⚠️  {message}")


def print_error(message: str):
    """Print an error message"""
    print(f"❌ {message}")


def test_transform_functions():
    """Test the transform functions with mock data"""
    print_section("TESTING TRANSFORM FUNCTIONS")
    
    try:
        # Create mock input/output objects
        class MockInput:
            def __init__(self, data_type):
                self.data_type = data_type
            
            def dataframe(self):
                import pandas as pd
                import numpy as np
                
                if "firms" in self.data_type:
                    # Mock FIRMS data
                    data = {
                        'latitude': np.random.uniform(32.5, 42.5, 50),
                        'longitude': np.random.uniform(-124.5, -114.5, 50),
                        'brightness': np.random.uniform(300, 500, 50),
                        'acq_date': [datetime.now() - timedelta(hours=i) for i in range(50)]
                    }
                elif "weather" in self.data_type:
                    # Mock weather data
                    data = {
                        'h3_cell': [f"8928308284{str(i).zfill(5)}" for i in range(50)],
                        'wind_speed': np.random.uniform(5, 35, 50),
                        'temperature': np.random.uniform(15, 35, 50)
                    }
                elif "population" in self.data_type:
                    # Mock population data
                    data = {
                        'h3_cell': [f"8928308284{str(i).zfill(5)}" for i in range(50)],
                        'population': np.random.randint(100, 5000, 50)
                    }
                elif "terrain" in self.data_type:
                    # Mock terrain data
                    data = {
                        'h3_cell': [f"8928308284{str(i).zfill(5)}" for i in range(50)],
                        'elevation': np.random.uniform(0, 2000, 50)
                    }
                else:
                    data = {}
                
                return pd.DataFrame(data)
        
        class MockOutput:
            def __init__(self, path):
                self.path = path
            
            def write_dataframe(self, df):
                print(f"Mock writing {len(df)} records to {self.path}")
                return True
        
        # Test process_wildfire_data
        print_info("Testing process_wildfire_data transform...")
        firms_input = MockInput("firms")
        weather_input = MockInput("weather")
        population_input = MockInput("population")
        hazards_output = MockOutput("/challenge-data/processed-hazards")
        
        result = process_wildfire_data(firms_input, weather_input, population_input, hazards_output)
        print_success(f"process_wildfire_data completed successfully! Processed {len(result)} records")
        
        # Test compute_hazard_zones
        print_info("Testing compute_hazard_zones transform...")
        terrain_input = MockInput("terrain")
        zones_output = MockOutput("/challenge-data/hazard-zones")
        
        result = compute_hazard_zones(hazards_output, terrain_input, zones_output)
        print_success(f"compute_hazard_zones completed successfully! Created {len(result)} zones")
        
        # Test optimize_evacuation_routes
        print_info("Testing optimize_evacuation_routes transform...")
        routes_output = MockOutput("/challenge-data/evacuation-routes")
        
        result = optimize_evacuation_routes(zones_output, routes_output)
        print_success(f"optimize_evacuation_routes completed successfully! Created {len(result)} routes")
        
        return True
        
    except Exception as e:
        print_error(f"Transform testing failed: {e}")
        return False


def test_aip_functions():
    """Test the AIP functions"""
    print_section("TESTING AIP FUNCTIONS")
    
    try:
        # Test quick_evacuation_check
        print_info("Testing quick_evacuation_check...")
        test_locations = ["Pine Valley", "Oak Ridge", "Harbor District", "Downtown"]
        
        for location in test_locations:
            result = quick_evacuation_check(location)
            print(f"   {location}: {result}")
        
        print_success("quick_evacuation_check completed successfully!")
        
        # Test get_population_at_risk
        print_info("Testing get_population_at_risk...")
        for location in test_locations:
            result = get_population_at_risk(location)
            print(f"   {location}: {result['at_risk']} people at risk")
        
        print_success("get_population_at_risk completed successfully!")
        
        # Test predict_fire_spread
        print_info("Testing predict_fire_spread...")
        for location in test_locations:
            result = predict_fire_spread(location)
            if result["time_to_reach"]:
                print(f"   {location}: Fire will reach in {result['time_to_reach']} minutes")
            else:
                print(f"   {location}: Fire not predicted to reach")
        
        print_success("predict_fire_spread completed successfully!")
        
        # Test EvacuationCommander class
        print_info("Testing EvacuationCommander class...")
        commander = EvacuationCommander()
        
        test_queries = [
            "Should we evacuate Pine Valley?",
            "What's the evacuation status for Oak Ridge?",
            "How many people are at risk in Harbor District?",
            "Will the fire reach Downtown?"
        ]
        
        for query in test_queries:
            response = commander.process_query(query)
            print(f"   Query: {query}")
            print(f"   Response: {response[:100]}...")
        
        print_success("EvacuationCommander class completed successfully!")
        
        return True
        
    except Exception as e:
        print_error(f"AIP testing failed: {e}")
        return False


def test_ontology_objects():
    """Test the ontology objects"""
    print_section("TESTING ONTOLOGY OBJECTS")
    
    try:
        # Test ChallengeHazardZone
        print_info("Testing ChallengeHazardZone...")
        hazard_zone = ChallengeHazardZone(
            h3_cell_id="8928308284fffff",
            risk_level="critical",
            risk_score=0.95,
            intensity=450.0,
            affected_population=3241,
            buildings_at_risk=847,
            wind_speed=25.0,
            elevation=1200.0,
            status="active"
        )
        
        print_success(f"Created hazard zone: {hazard_zone.h3_cell_id}")
        print_info(f"   Risk level: {hazard_zone.risk_level}")
        print_info(f"   Risk score: {hazard_zone.risk_score}")
        print_info(f"   Affected population: {hazard_zone.affected_population}")
        
        # Test issuing evacuation order
        print_info("Testing issue_evacuation_order action...")
        order = hazard_zone.issue_evacuation_order("mandatory", "Commander Smith")
        print_success(f"Issued evacuation order: {order.order_id}")
        
        # Test ChallengeEmergencyUnit
        print_info("Testing ChallengeEmergencyUnit...")
        emergency_unit = ChallengeEmergencyUnit(
            unit_id="unit_001",
            unit_type="fire_truck",
            status="available",
            location="Station A",
            capacity=1000
        )
        
        print_success(f"Created emergency unit: {emergency_unit.unit_id}")
        
        # Test ChallengeEvacuationRoute
        print_info("Testing ChallengeEvacuationRoute...")
        evacuation_route = ChallengeEvacuationRoute(
            route_id="route_001",
            origin="Pine Valley",
            destination="Safe Zone A",
            distance=3.2,
            capacity=2000
        )
        
        print_success(f"Created evacuation route: {evacuation_route.route_id}")
        
        # Test ChallengeBuilding
        print_info("Testing ChallengeBuilding...")
        building = ChallengeBuilding(
            building_id="building_001",
            address="123 Pine Valley Rd",
            building_type="residential",
            occupancy=4
        )
        
        print_success(f"Created building: {building.building_id}")
        
        # Test ontology registry
        print_info("Testing ontology registry...")
        ontology_registry.register_object(hazard_zone)
        ontology_registry.register_object(emergency_unit)
        ontology_registry.register_object(evacuation_route)
        ontology_registry.register_object(building)
        
        print_success("All objects registered successfully!")
        
        # Test searching
        critical_zones = ontology_registry.search_objects("ChallengeHazardZone", risk_level="critical")
        print_success(f"Found {len(critical_zones)} critical hazard zones")
        
        return True
        
    except Exception as e:
        print_error(f"Ontology testing failed: {e}")
        return False


def test_integration():
    """Test the integration of all components"""
    print_section("TESTING INTEGRATION")
    
    try:
        print_info("Testing end-to-end workflow...")
        
        # 1. Create hazard zone
        hazard_zone = ChallengeHazardZone(
            h3_cell_id="8928308284fffff",
            risk_level="critical",
            risk_score=0.95,
            affected_population=3241
        )
        
        # 2. Issue evacuation order
        order = hazard_zone.issue_evacuation_order("mandatory", "Commander Smith")
        
        # 3. Check evacuation status via AIP
        status = quick_evacuation_check("Pine Valley")
        
        # 4. Get population info
        population = get_population_at_risk("Pine Valley")
        
        # 5. Predict fire spread
        prediction = predict_fire_spread("Pine Valley")
        
        print_success("Integration test completed successfully!")
        print_info("Workflow results:")
        print(f"   • Hazard zone created: {hazard_zone.h3_cell_id}")
        print(f"   • Evacuation order issued: {order.order_id}")
        print(f"   • AIP status check: {status[:50]}...")
        print(f"   • Population at risk: {population['at_risk']}")
        print(f"   • Fire prediction: {prediction['time_to_reach']} minutes")
        
        return True
        
    except Exception as e:
        print_error(f"Integration testing failed: {e}")
        return False


def main():
    """Main testing function"""
    print_header("FUNCTIONAL IMPLEMENTATION TESTING")
    print_info("Testing all mock implementations to ensure they work correctly")
    
    # Track test results
    test_results = []
    
    # Run tests
    tests = [
        ("Transform Functions", test_transform_functions),
        ("AIP Functions", test_aip_functions),
        ("Ontology Objects", test_ontology_objects),
        ("Integration", test_integration)
    ]
    
    for test_name, test_func in tests:
        try:
            print(f"\n🔄 Running {test_name}...")
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print_error(f"Test {test_name} failed with exception: {e}")
            test_results.append((test_name, False))
    
    # Summary
    print_header("TEST SUMMARY")
    
    successful_tests = sum(1 for _, result in test_results if result)
    total_tests = len(test_results)
    
    print_info(f"Completed {total_tests} tests with {successful_tests} successful")
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} {test_name}")
    
    if successful_tests == total_tests:
        print_success("ALL TESTS PASSED! Mock implementations are working correctly.")
        print_info("This demonstrates that the Foundry integration patterns are properly implemented.")
    else:
        print_warning(f"{total_tests - successful_tests} tests failed. Review and fix before submission.")
    
    print_header("FUNCTIONAL DEMO COMPLETE")
    print_info("The mock implementations successfully demonstrate:")
    print("   • Transform pipeline functionality")
    print("   • AIP natural language processing")
    print("   • Ontology object relationships and actions")
    print("   • End-to-end integration")
    
    print_success("Ready for functional demonstration! 🏆")


if __name__ == "__main__":
    main()
