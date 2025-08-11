#!/usr/bin/env python3
"""
Validation script for mock modules
This ensures all mock implementations are working correctly for the demo
"""

import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def test_mock_transforms():
    """Test mock transforms module"""
    print("🔍 Testing mock transforms module...")
    
    try:
        from backend.mock_transforms import (
            process_wildfire_data, 
            compute_hazard_zones, 
            optimize_evacuation_routes
        )
        print("   ✅ All transform functions imported successfully")
        
        # Test function availability
        assert callable(process_wildfire_data), "process_wildfire_data should be callable"
        assert callable(compute_hazard_zones), "compute_hazard_zones should be callable"
        assert callable(optimize_evacuation_routes), "optimize_evacuation_routes should be callable"
        print("   ✅ All transform functions are callable")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Transform module test failed: {e}")
        return False

def test_mock_aip():
    """Test mock AIP module"""
    print("🔍 Testing mock AIP module...")
    
    try:
        from backend.mock_aip import (
            EvacuationCommander, 
            quick_evacuation_check, 
            get_population_at_risk, 
            predict_fire_spread
        )
        print("   ✅ All AIP functions imported successfully")
        
        # Test function availability
        assert callable(quick_evacuation_check), "quick_evacuation_check should be callable"
        assert callable(get_population_at_risk), "get_population_at_risk should be callable"
        assert callable(predict_fire_spread), "predict_fire_spread should be callable"
        print("   ✅ All AIP functions are callable")
        
        # Test class availability
        assert isinstance(EvacuationCommander, type), "EvacuationCommander should be a class"
        print("   ✅ EvacuationCommander class available")
        
        # Test instantiation
        commander = EvacuationCommander()
        assert hasattr(commander, 'process_query'), "EvacuationCommander should have process_query method"
        print("   ✅ EvacuationCommander can be instantiated")
        
        return True
        
    except Exception as e:
        print(f"   ❌ AIP module test failed: {e}")
        return False

def test_mock_ontology():
    """Test mock ontology module"""
    print("🔍 Testing mock ontology module...")
    
    try:
        from backend.mock_ontology import (
            ChallengeHazardZone, 
            ChallengeEmergencyUnit, 
            ChallengeEvacuationRoute, 
            ChallengeEvacuationOrder, 
            ChallengeBuilding
        )
        print("   ✅ All ontology classes imported successfully")
        
        # Test class availability
        classes = [
            ChallengeHazardZone, 
            ChallengeEmergencyUnit, 
            ChallengeEvacuationRoute, 
            ChallengeEvacuationOrder, 
            ChallengeBuilding
        ]
        
        for cls in classes:
            assert isinstance(cls, type), f"{cls.__name__} should be a class"
        print("   ✅ All ontology classes are valid")
        
        # Test instantiation
        hazard_zone = ChallengeHazardZone(
            h3_cell_id="8928308284fffff",
            risk_level="critical",
            risk_score=0.95
        )
        assert hasattr(hazard_zone, 'issue_evacuation_order'), "ChallengeHazardZone should have issue_evacuation_order method"
        print("   ✅ ChallengeHazardZone can be instantiated with actions")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Ontology module test failed: {e}")
        return False

def test_functional_demo():
    """Test that the functional demo can run"""
    print("🔍 Testing functional demo execution...")
    
    try:
        # Import the demo script functions
        from scripts.challenge_winning_demo import demo_functional_implementation
        
        # Test the demo function
        result = demo_functional_implementation()
        assert result == True, "Functional demo should return True on success"
        print("   ✅ Functional demo executed successfully")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Functional demo test failed: {e}")
        return False

def main():
    """Run all validation tests"""
    print("🚀 Starting mock module validation...\n")
    
    tests = [
        ("Mock Transforms", test_mock_transforms),
        ("Mock AIP", test_mock_aip),
        ("Mock Ontology", test_mock_ontology),
        ("Functional Demo", test_functional_demo)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"📋 {test_name}")
        result = test_func()
        results.append((test_name, result))
        print()
    
    # Summary
    print("=" * 60)
    print("🏆 VALIDATION SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Mock modules are ready for demo.")
        print("✅ Ready for Palantir Building Challenge submission!")
    else:
        print(f"⚠️  {total - passed} tests failed. Please fix issues before submission.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
