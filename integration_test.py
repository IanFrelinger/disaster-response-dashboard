#!/usr/bin/env python3
"""
Integration Test Script for Disaster Response Dashboard
Tests the communication between frontend and backend services
"""

import requests
import json
import time
from datetime import datetime

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get("http://localhost:5001/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend Health: {data['status']}")
            return True
        else:
            print(f"❌ Backend Health: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend Health: {e}")
        return False

def test_backend_endpoints():
    """Test various backend API endpoints"""
    print("\n🔍 Testing Backend Endpoints...")
    endpoints = [
        "/api/dashboard",
        "/api/hazards",
        "/api/routes",
        "/api/evacuation-routes"
    ]
    
    results = []
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:5001{endpoint}", timeout=10)
            if response.status_code == 200:
                print(f"✅ {endpoint}: OK")
                results.append(True)
            else:
                print(f"❌ {endpoint}: HTTP {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
            results.append(False)
    
    return all(results)

def test_frontend_access():
    """Test frontend accessibility"""
    print("\n🔍 Testing Frontend Access...")
    endpoints = [
        "/",
        "/field",
        "/command"
    ]
    
    results = []
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:3000{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ Frontend {endpoint}: OK")
                results.append(True)
            else:
                print(f"❌ Frontend {endpoint}: HTTP {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ Frontend {endpoint}: {e}")
            results.append(False)
    
    return all(results)

def test_data_flow():
    """Test data flow between frontend and backend"""
    print("\n🔍 Testing Data Flow...")
    
    # Test that backend provides data in expected format
    try:
        response = requests.get("http://localhost:5001/api/dashboard", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Check for expected data structure
            required_keys = ['data', 'success']
            if all(key in data for key in required_keys):
                print("✅ Dashboard data structure: Valid")
                
                # Check for specific data sections
                dashboard_data = data.get('data', {})
                if 'evacuationRoutes' in dashboard_data:
                    print("✅ Evacuation routes: Available")
                if 'hazards' in dashboard_data:
                    print("✅ Hazards data: Available")
                if 'safeZones' in dashboard_data:
                    print("✅ Safe zones: Available")
                
                return True
            else:
                print("❌ Dashboard data structure: Invalid")
                return False
        else:
            print(f"❌ Dashboard endpoint: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Data flow test: {e}")
        return False

def test_performance():
    """Test basic performance metrics"""
    print("\n🔍 Testing Performance...")
    
    # Test response times
    endpoints = [
        ("Backend Health", "http://localhost:5001/api/health"),
        ("Backend Dashboard", "http://localhost:5001/api/dashboard"),
        ("Frontend Home", "http://localhost:3000/"),
        ("Frontend Field", "http://localhost:3000/field"),
        ("Frontend Command", "http://localhost:3000/command")
    ]
    
    results = []
    for name, url in endpoints:
        try:
            start_time = time.time()
            response = requests.get(url, timeout=10)
            end_time = time.time()
            
            if response.status_code == 200:
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                print(f"✅ {name}: {response_time:.1f}ms")
                results.append(True)
            else:
                print(f"❌ {name}: HTTP {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ {name}: {e}")
            results.append(False)
    
    return all(results)

def main():
    """Run all integration tests"""
    print("🚀 Disaster Response Dashboard - Integration Tests")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Run tests
    tests = [
        ("Backend Health", test_backend_health),
        ("Backend Endpoints", test_backend_endpoints),
        ("Frontend Access", test_frontend_access),
        ("Data Flow", test_data_flow),
        ("Performance", test_performance)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name}: Test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 INTEGRATION TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All integration tests passed! The system is ready for use.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())
