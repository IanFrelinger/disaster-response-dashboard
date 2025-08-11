#!/usr/bin/env python3
"""
Simple Dashboard Smoke Test
Tests the basic HTML dashboard functionality
"""

import requests
import json
from datetime import datetime
import time

def test_simple_dashboard():
    """Test the simple HTML dashboard"""
    print("🚀 Simple Dashboard Smoke Test")
    print("=" * 60)
    print(f"Test started at: {datetime.now()}")
    print()
    
    base_url = "http://localhost:3000"
    api_url = "http://localhost:5001"
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "tests": [],
        "api_tests": [],
        "summary": {}
    }
    
    # Test 1: Home page loads
    print("🔍 Testing Home Page")
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code == 200:
            content = response.text
            checks = []
            
            # Check for key elements
            if "Disaster Response Dashboard" in content:
                checks.append("✅ Dashboard title found")
            else:
                checks.append("❌ Dashboard title not found")
                
            if "System Status" in content:
                checks.append("✅ System Status card found")
            else:
                checks.append("❌ System Status card not found")
                
            if "Active Hazards" in content:
                checks.append("✅ Active Hazards card found")
            else:
                checks.append("❌ Active Hazards card not found")
                
            if "Safe Routes" in content:
                checks.append("✅ Safe Routes card found")
            else:
                checks.append("❌ Safe Routes card not found")
                
            if "Palantir Building Challenge Demo" in content:
                checks.append("✅ Challenge Demo section found")
            else:
                checks.append("❌ Challenge Demo section not found")
                
            if "refreshData()" in content:
                checks.append("✅ JavaScript functions found")
            else:
                checks.append("❌ JavaScript functions not found")
            
            passed_checks = sum(1 for check in checks if "✅" in check)
            total_checks = len(checks)
            
            test_result = {
                "test": "Home Page",
                "status": "PASS" if passed_checks == total_checks else "FAIL",
                "url": f"{base_url}/",
                "response_time": response.elapsed.total_seconds() * 1000,
                "content_length": len(content),
                "checks": checks,
                "passed_checks": passed_checks,
                "total_checks": total_checks
            }
            
            print(f"   Status: {test_result['status']}")
            print(f"   Checks: {passed_checks}/{total_checks} passed")
            for check in checks:
                print(f"     {check}")
            
        else:
            test_result = {
                "test": "Home Page",
                "status": "FAIL",
                "url": f"{base_url}/",
                "error": f"HTTP {response.status_code}",
                "checks": ["❌ Page failed to load"]
            }
            print(f"   Status: FAIL (HTTP {response.status_code})")
            
    except Exception as e:
        test_result = {
            "test": "Home Page",
            "status": "ERROR",
            "url": f"{base_url}/",
            "error": str(e),
            "checks": [f"❌ Error: {str(e)}"]
        }
        print(f"   Status: ERROR - {str(e)}")
    
    results["tests"].append(test_result)
    print()
    
    # Test 2: API endpoints
    print("🔍 Testing Backend API Endpoints")
    print("-" * 40)
    
    api_endpoints = [
        ("Health", f"{api_url}/api/health"),
        ("Dashboard", f"{api_url}/api/dashboard"),
        ("Hazards", f"{api_url}/api/hazards"),
        ("Routes", f"{api_url}/api/routes")
    ]
    
    api_passed = 0
    api_total = len(api_endpoints)
    
    for name, url in api_endpoints:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"   ✅ {name}: OK ({len(response.text)} chars)")
                api_passed += 1
                results["api_tests"].append({
                    "endpoint": name,
                    "status": "PASS",
                    "response_length": len(response.text)
                })
            else:
                print(f"   ❌ {name}: HTTP {response.status_code}")
                results["api_tests"].append({
                    "endpoint": name,
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                })
        except Exception as e:
            print(f"   ❌ {name}: Error - {str(e)}")
            results["api_tests"].append({
                "endpoint": name,
                "status": "ERROR",
                "error": str(e)
            })
    
    print()
    
    # Test 3: Dashboard functionality
    print("🔍 Testing Dashboard Functionality")
    print("-" * 40)
    
    # Test if the dashboard can make API calls by checking if it loads data
    try:
        # Get the dashboard HTML
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code == 200:
            content = response.text
            
            # Check if the dashboard has the right structure for API calls
            functionality_checks = []
            
            if "localhost:5001" in content:
                functionality_checks.append("✅ API endpoint configured correctly")
            else:
                functionality_checks.append("❌ API endpoint not configured")
                
            if "fetchData" in content:
                functionality_checks.append("✅ Data fetching functions present")
            else:
                functionality_checks.append("❌ Data fetching functions missing")
                
            if "updateSystemStatus" in content:
                functionality_checks.append("✅ System status update function present")
            else:
                functionality_checks.append("❌ System status update function missing")
                
            if "updateDashboardOverview" in content:
                functionality_checks.append("✅ Dashboard overview update function present")
            else:
                functionality_checks.append("❌ Dashboard overview update function missing")
            
            passed_func_checks = sum(1 for check in functionality_checks if "✅" in check)
            total_func_checks = len(functionality_checks)
            
            func_test_result = {
                "test": "Dashboard Functionality",
                "status": "PASS" if passed_func_checks == total_func_checks else "FAIL",
                "checks": functionality_checks,
                "passed_checks": passed_func_checks,
                "total_checks": total_func_checks
            }
            
            print(f"   Status: {func_test_result['status']}")
            print(f"   Checks: {passed_func_checks}/{total_func_checks} passed")
            for check in functionality_checks:
                print(f"     {check}")
            
            results["tests"].append(func_test_result)
            
        else:
            print("   ❌ Cannot test functionality - page not accessible")
            
    except Exception as e:
        print(f"   ❌ Error testing functionality: {str(e)}")
    
    print()
    
    # Summary
    print("📊 SMOKE TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len(results["tests"])
    passed_tests = sum(1 for test in results["tests"] if test.get("status") == "PASS")
    failed_tests = sum(1 for test in results["tests"] if test.get("status") == "FAIL")
    error_tests = sum(1 for test in results["tests"] if test.get("status") == "ERROR")
    
    total_checks = sum(test.get("total_checks", 0) for test in results["tests"])
    passed_checks = sum(test.get("passed_checks", 0) for test in results["tests"])
    
    print(f"Test Time: {results['timestamp']}")
    print(f"Tests Run: {total_tests}")
    print(f"Tests Passed: {passed_tests}")
    print(f"Tests Failed: {failed_tests}")
    print(f"Tests with Errors: {error_tests}")
    print(f"Test Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "Test Success Rate: N/A")
    print()
    
    print(f"Total Checks: {total_checks}")
    print(f"Checks Passed: {passed_checks}")
    print(f"Check Success Rate: {(passed_checks/total_checks*100):.1f}%" if total_checks > 0 else "Check Success Rate: N/A")
    print()
    
    print(f"API Endpoints: {'✅ PASS' if api_passed == api_total else '❌ FAIL'}")
    print()
    
    # Overall assessment
    if passed_tests == total_tests and api_passed == api_total:
        print("🟢 EXCELLENT: All tests passed!")
        overall_status = "EXCELLENT"
    elif passed_tests >= total_tests * 0.8 and api_passed == api_total:
        print("🟡 GOOD: Most tests passed, minor issues detected")
        overall_status = "GOOD"
    elif passed_tests >= total_tests * 0.6 and api_passed >= api_total * 0.8:
        print("🟠 FAIR: Some tests passed, moderate issues detected")
        overall_status = "FAIR"
    else:
        print("🔴 POOR: Multiple test failures detected")
        overall_status = "POOR"
    
    print()
    
    # Save results
    results["summary"] = {
        "total_tests": total_tests,
        "passed_tests": passed_tests,
        "failed_tests": failed_tests,
        "error_tests": error_tests,
        "total_checks": total_checks,
        "passed_checks": passed_checks,
        "api_passed": api_passed,
        "api_total": api_total,
        "overall_status": overall_status
    }
    
    with open("simple_dashboard_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"💾 Results saved to simple_dashboard_test_results.json")
    print()
    
    if overall_status in ["EXCELLENT", "GOOD"]:
        print("✅ Simple dashboard is working properly!")
        return True
    else:
        print("⚠️  Simple dashboard has issues that need attention")
        return False

if __name__ == "__main__":
    success = test_simple_dashboard()
    exit(0 if success else 1)
