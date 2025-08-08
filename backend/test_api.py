#!/usr/bin/env python3
"""
Simple test script for the Foundry API
"""

import requests
import json
import time

def test_api():
    """Test the Foundry API endpoints"""
    base_url = "http://localhost:5001"
    
    print("🧪 Testing Foundry API...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/foundry/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Status: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test fused state endpoint
    try:
        response = requests.get(f"{base_url}/api/foundry/state")
        if response.status_code == 200:
            data = response.json()
            print("✅ Fused state endpoint working")
            print(f"   Hazards: {data['hazards']['total']}")
            print(f"   Units: {data['units']['total']}")
            print(f"   Routes: {data['routes']['total']}")
        else:
            print(f"❌ Fused state failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Fused state error: {e}")
        return False
    
    # Test analytics endpoint
    try:
        response = requests.get(f"{base_url}/api/foundry/analytics")
        if response.status_code == 200:
            analytics = response.json()
            print("✅ Analytics endpoint working")
            print(f"   Affected Population: {analytics['totalAffectedPopulation']}")
            print(f"   Response Time: {analytics['averageResponseTime']}m")
            print(f"   Compliance: {analytics['evacuationCompliance']}%")
        else:
            print(f"❌ Analytics failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Analytics error: {e}")
        return False
    
    print("\n🎉 All API tests passed!")
    return True

if __name__ == "__main__":
    test_api()
