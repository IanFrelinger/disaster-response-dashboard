#!/usr/bin/env python3
"""
Quick API Test Script
Simple test to verify API is working without full setup.
"""

import time
import sys
from typing import Dict, Any

# Try to import requests, but handle the case where it's not available
try:
    import requests
except ImportError:
    print("❌ requests module not found. Please install it or run the full setup.")
    print("   pip install requests")
    sys.exit(1)


def print_success(message: str):
    """Print a success message"""
    print(f"✅ {message}")


def print_error(message: str):
    """Print an error message"""
    print(f"❌ {message}")


def print_info(message: str):
    """Print an info message"""
    print(f"ℹ️  {message}")


def test_api_health(base_url: str = "http://localhost:8000") -> bool:
    """Test basic API health"""
    try:
        print_info("Testing API health...")
        response = requests.get(f"{base_url}/api/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"API is healthy: {data.get('status', 'OK')}")
            return True
        else:
            print_error(f"API health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to API - server may not be running")
        return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False


def test_api_endpoints(base_url: str = "http://localhost:8000") -> bool:
    """Test key API endpoints"""
    endpoints = [
        ("/api/info", "API Info"),
        ("/api/dashboard", "Dashboard"),
        ("/api/hazards", "Hazards"),
        ("/api/routes", "Routes")
    ]
    
    all_success = True
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                print_success(f"{name}: OK")
                
                # Quick data validation
                if endpoint == "/api/dashboard":
                    data = response.json()
                    if 'data' in data and 'hazards' in data['data']:
                        hazard_count = len(data['data']['hazards'])
                        print_info(f"  Dashboard has {hazard_count} hazards")
                
                elif endpoint == "/api/hazards":
                    data = response.json()
                    if 'data' in data:
                        print_info(f"  Hazards endpoint returned {len(data['data'])} items")
                        
            else:
                print_error(f"{name}: Failed ({response.status_code})")
                all_success = False
                
        except Exception as e:
            print_error(f"{name}: Error - {e}")
            all_success = False
    
    return all_success


def test_api_performance(base_url: str = "http://localhost:8000") -> bool:
    """Test API performance"""
    print_info("Testing API performance...")
    
    endpoints = ["/api/health", "/api/dashboard", "/api/hazards"]
    
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                if response_time < 1000:
                    print_success(f"{endpoint}: {response_time:.1f}ms")
                elif response_time < 3000:
                    print_info(f"{endpoint}: {response_time:.1f}ms (acceptable)")
                else:
                    print_error(f"{endpoint}: {response_time:.1f}ms (slow)")
            else:
                print_error(f"{endpoint}: Failed")
                
        except Exception as e:
            print_error(f"{endpoint}: Error - {e}")
    
    return True


def main():
    """Main test function"""
    print("🧪 Quick API Test")
    print("=" * 50)
    
    # Check if API server is running
    if not test_api_health():
        print("\n💡 To start the API server:")
        print("   1. cd backend")
        print("   2. python run_synthetic_api.py")
        print("   3. Or run: scripts/setup_and_test_api.py")
        return False
    
    print()
    
    # Test endpoints
    if not test_api_endpoints():
        print_error("Some endpoints failed")
        return False
    
    print()
    
    # Test performance
    test_api_performance()
    
    print("\n🎉 Quick API test completed!")
    print("API is working correctly.")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
