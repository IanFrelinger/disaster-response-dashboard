#!/usr/bin/env python3
"""
Frontend Integration Test
Tests the integration between frontend and API for 3D terrain application
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:5001"
FRONTEND_BASE_URL = "http://localhost:3000"

def test_api_endpoints():
    """Test all API endpoints that the frontend depends on"""
    print("🔧 Testing API Endpoints")
    print("="*50)
    
    endpoints = [
        "/api/health",
        "/api/disaster-data",
        "/api/foundry/state",
        "/api/foundry/hazards",
        "/api/foundry/units",
        "/api/foundry/routes",
        "/api/foundry/analytics",
        "/api/foundry/health"
    ]
    
    results = {}
    
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=10)
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            data = response.json() if success else None
            
            results[endpoint] = {
                "success": success,
                "status_code": response.status_code,
                "response_time": response_time,
                "data": data
            }
            
            status = "✅" if success else "❌"
            print(f"{status} {endpoint}: {response.status_code} ({response_time:.3f}s)")
            
            if success and data:
                # Validate data structure for critical endpoints
                if endpoint == "/api/foundry/state":
                    validate_foundry_state(data)
                elif endpoint == "/api/disaster-data":
                    validate_disaster_data(data)
                    
        except Exception as e:
            results[endpoint] = {
                "success": False,
                "error": str(e),
                "response_time": 0
            }
            print(f"❌ {endpoint}: Error - {e}")
    
    return results

def validate_foundry_state(data):
    """Validate the structure of Foundry state data"""
    print("   📊 Validating Foundry state structure...")
    
    required_keys = ["hazards", "units", "routes", "analytics"]
    for key in required_keys:
        if key not in data:
            print(f"   ⚠️  Missing required key: {key}")
            return False
    
    # Validate hazards structure
    if "hazards" in data:
        hazards = data["hazards"]
        if "active" in hazards and isinstance(hazards["active"], list):
            print(f"   ✅ Hazards: {len(hazards['active'])} active hazards")
        if "total" in hazards:
            print(f"   ✅ Total hazards: {hazards['total']}")
    
    # Validate units structure
    if "units" in data:
        units = data["units"]
        if "available" in units and isinstance(units["available"], list):
            print(f"   ✅ Units: {len(units['available'])} available units")
        if "total" in units:
            print(f"   ✅ Total units: {units['total']}")
    
    # Validate routes structure
    if "routes" in data:
        routes = data["routes"]
        if "safe" in routes and isinstance(routes["safe"], list):
            print(f"   ✅ Routes: {len(routes['safe'])} safe routes")
        if "total" in routes:
            print(f"   ✅ Total routes: {routes['total']}")
    
    return True

def validate_disaster_data(data):
    """Validate the structure of disaster data"""
    print("   📊 Validating disaster data structure...")
    
    if "success" in data and data["success"]:
        disaster_data = data.get("data", {})
        
        if "hazards" in disaster_data and isinstance(disaster_data["hazards"], list):
            print(f"   ✅ Disaster hazards: {len(disaster_data['hazards'])}")
        
        if "routes" in disaster_data and isinstance(disaster_data["routes"], list):
            print(f"   ✅ Disaster routes: {len(disaster_data['routes'])}")
        
        if "resources" in disaster_data and isinstance(disaster_data["resources"], list):
            print(f"   ✅ Disaster resources: {len(disaster_data['resources'])}")
        
        if "metrics" in disaster_data:
            print(f"   ✅ Disaster metrics available")
    
    return True

def test_frontend_connectivity():
    """Test if frontend is accessible"""
    print("\n🌐 Testing Frontend Connectivity")
    print("="*50)
    
    try:
        response = requests.get(FRONTEND_BASE_URL, timeout=10)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"⚠️  Frontend responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to frontend: {e}")
        return False

def test_data_flow():
    """Test the complete data flow from API to frontend"""
    print("\n🔄 Testing Data Flow")
    print("="*50)
    
    # Test API data retrieval
    try:
        response = requests.get(f"{API_BASE_URL}/api/foundry/state", timeout=10)
        if response.status_code == 200:
            api_data = response.json()
            print("✅ API data retrieved successfully")
            
            # Check if data contains the expected structure for 3D terrain
            if "hazards" in api_data and "units" in api_data and "routes" in api_data:
                print("✅ Data structure suitable for 3D terrain visualization")
                
                # Count data points
                hazard_count = len(api_data["hazards"].get("active", []))
                unit_count = len(api_data["units"].get("available", []))
                route_count = len(api_data["routes"].get("safe", []))
                
                print(f"   📍 Hazard zones: {hazard_count}")
                print(f"   🚑 Emergency units: {unit_count}")
                print(f"   🛣️  Evacuation routes: {route_count}")
                
                return True
            else:
                print("❌ Data structure missing required components")
                return False
        else:
            print(f"❌ API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing data flow: {e}")
        return False

def test_api_performance():
    """Test API performance under realistic load"""
    print("\n⚡ Testing API Performance")
    print("="*50)
    
    # Test critical endpoints with realistic load
    critical_endpoints = ["/api/foundry/state", "/api/disaster-data"]
    
    for endpoint in critical_endpoints:
        print(f"Testing {endpoint}...")
        
        response_times = []
        success_count = 0
        
        for i in range(20):  # 20 requests per endpoint
            try:
                start_time = time.time()
                response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=5)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    success_count += 1
                    response_times.append(response_time)
                
                time.sleep(0.1)  # Small delay between requests
                
            except Exception as e:
                print(f"   ❌ Request {i+1} failed: {e}")
        
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            max_time = max(response_times)
            success_rate = (success_count / 20) * 100
            
            print(f"   ✅ Success rate: {success_rate:.1f}%")
            print(f"   ⏱️  Average response time: {avg_time:.3f}s")
            print(f"   ⏱️  Maximum response time: {max_time:.3f}s")
            
            if avg_time < 0.1:
                print("   🚀 Performance: Excellent")
            elif avg_time < 0.5:
                print("   ✅ Performance: Good")
            else:
                print("   ⚠️  Performance: Needs improvement")

def generate_integration_report(api_results, frontend_accessible, data_flow_ok):
    """Generate comprehensive integration test report"""
    print("\n" + "="*80)
    print("📋 FRONTEND-API INTEGRATION TEST REPORT")
    print("="*80)
    
    # API endpoint summary
    total_endpoints = len(api_results)
    successful_endpoints = sum(1 for r in api_results.values() if r["success"])
    
    print(f"📊 API Endpoints:")
    print(f"   - Total tested: {total_endpoints}")
    print(f"   - Successful: {successful_endpoints}")
    print(f"   - Success rate: {(successful_endpoints/total_endpoints)*100:.1f}%")
    
    # Frontend connectivity
    print(f"\n🌐 Frontend Connectivity:")
    print(f"   - Accessible: {'✅ Yes' if frontend_accessible else '❌ No'}")
    
    # Data flow
    print(f"\n🔄 Data Flow:")
    print(f"   - API to Frontend: {'✅ Working' if data_flow_ok else '❌ Failed'}")
    
    # Performance summary
    response_times = [r["response_time"] for r in api_results.values() if r["success"]]
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        
        print(f"\n⚡ Performance Summary:")
        print(f"   - Average response time: {avg_response_time:.3f}s")
        print(f"   - Maximum response time: {max_response_time:.3f}s")
        
        if avg_response_time < 0.1:
            print("   - Performance rating: 🚀 Excellent")
        elif avg_response_time < 0.5:
            print("   - Performance rating: ✅ Good")
        else:
            print("   - Performance rating: ⚠️  Needs improvement")
    
    print("\n" + "="*80)
    
    # Overall assessment
    if successful_endpoints == total_endpoints and frontend_accessible and data_flow_ok:
        print("🏆 OUTSTANDING: Frontend-API integration is working perfectly")
    elif successful_endpoints >= total_endpoints * 0.8 and frontend_accessible:
        print("✅ GOOD: Frontend-API integration is working well")
    elif successful_endpoints >= total_endpoints * 0.6:
        print("⚠️  FAIR: Frontend-API integration has some issues")
    else:
        print("❌ POOR: Frontend-API integration is not working properly")
    
    print("="*80)

def main():
    """Main integration test execution"""
    print("🔧 Frontend-API Integration Test")
    print("="*50)
    
    # Test API endpoints
    api_results = test_api_endpoints()
    
    # Test frontend connectivity
    frontend_accessible = test_frontend_connectivity()
    
    # Test data flow
    data_flow_ok = test_data_flow()
    
    # Test performance
    test_api_performance()
    
    # Generate report
    generate_integration_report(api_results, frontend_accessible, data_flow_ok)
    
    print("\n✅ Integration test completed!")

if __name__ == "__main__":
    main()
