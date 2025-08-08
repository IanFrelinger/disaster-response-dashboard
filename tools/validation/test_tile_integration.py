#!/usr/bin/env python3
"""
Tile Integration Test Script
Tests that the frontend can properly access and display tiles from the tile server.
"""

import requests
import json
import time
from urllib.parse import urljoin

def test_tile_server_health():
    """Test if tile server is accessible"""
    try:
        response = requests.get('http://localhost:8080/', timeout=5)
        if response.status_code == 200:
            print("✅ Tile server is accessible")
            return True
        else:
            print(f"❌ Tile server returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Tile server not accessible: {e}")
        return False

def test_tile_endpoints():
    """Test if tile endpoints are working"""
    endpoints = [
        'data/admin_boundaries.json',
        'data/california_counties.json',
        'data/hazards.json',
        'data/routes.json'
    ]
    
    all_working = True
    for endpoint in endpoints:
        try:
            url = f'http://localhost:8080/{endpoint}'
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint} - {data.get('name', 'Unknown')}")
            else:
                print(f"❌ {endpoint} - Status {response.status_code}")
                all_working = False
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
            all_working = False
    
    return all_working

def test_tile_requests():
    """Test if actual tile requests work"""
    # Test a specific tile request
    try:
        url = 'http://localhost:8080/data/hazards/10/163/395.pbf'
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✅ Tile request successful - Size: {len(response.content)} bytes")
            return True
        else:
            print(f"❌ Tile request failed - Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Tile request error: {e}")
        return False

def test_frontend_access():
    """Test if frontend can access tile server"""
    try:
        response = requests.get('http://localhost:3000/', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def main():
    """Run all tile integration tests"""
    print("🗺️  Tile Integration Test")
    print("=" * 50)
    
    tests = [
        ("Tile Server Health", test_tile_server_health),
        ("Tile Endpoints", test_tile_endpoints),
        ("Tile Requests", test_tile_requests),
        ("Frontend Access", test_frontend_access),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        print("-" * 30)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tile integration tests passed! Tiles should be visible in the frontend.")
    else:
        print("⚠️  Some tests failed. Check the tile server and frontend configuration.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
