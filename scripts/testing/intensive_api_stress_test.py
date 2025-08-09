#!/usr/bin/env python3
"""
Intensive API Stress Test
Pushes the API to its absolute limits with extreme load testing
"""

import requests
import time
import threading
import json
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import sys
import random

# API Configuration
BASE_URL = "http://localhost:5001"
ENDPOINTS = [
    "/api/health",
    "/api/disaster-data", 
    "/api/foundry/state",
    "/api/foundry/hazards",
    "/api/foundry/units",
    "/api/foundry/routes",
    "/api/foundry/analytics",
    "/api/foundry/health"
]

# Intensive Test Configuration
INTENSIVE_CONCURRENT_USERS = 50
INTENSIVE_REQUESTS_PER_USER = 100
BURST_CONCURRENT_USERS = 100
BURST_REQUESTS_PER_USER = 50

class IntensiveAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.results = []
        self.lock = threading.Lock()
        
    def make_request(self, endpoint, test_type="normal"):
        """Make a single API request and record results"""
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}{endpoint}", timeout=30)
            response_time = time.time() - start_time
            success = response.status_code == 200
            
            result = {
                "endpoint": endpoint,
                "status_code": response.status_code,
                "response_time": response_time,
                "success": success,
                "test_type": test_type,
                "timestamp": datetime.now()
            }
            
            with self.lock:
                self.results.append(result)
                
            return result
            
        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            result = {
                "endpoint": endpoint,
                "status_code": 0,
                "response_time": response_time,
                "success": False,
                "test_type": test_type,
                "error": str(e),
                "timestamp": datetime.now()
            }
            
            with self.lock:
                self.results.append(result)
                
            return result
    
    def test_endpoint_intensively(self, endpoint, num_requests, concurrent_users, test_type="normal"):
        """Test a specific endpoint with intensive load"""
        print(f"🔥 Testing {endpoint} with {num_requests} requests using {concurrent_users} concurrent users...")
        
        with ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [executor.submit(self.make_request, endpoint, test_type) for _ in range(num_requests)]
            
            completed = 0
            for future in as_completed(futures):
                try:
                    result = future.result()
                    completed += 1
                    if not result["success"]:
                        print(f"❌ Failed request to {endpoint}: {result.get('status_code', 'timeout')}")
                    if completed % 50 == 0:
                        print(f"   Progress: {completed}/{num_requests} requests completed")
                except Exception as e:
                    print(f"❌ Exception in request to {endpoint}: {e}")
    
    def run_intensive_test(self):
        """Run intensive stress test"""
        print("🔥 INTENSIVE API STRESS TEST")
        print("="*60)
        print(f"📊 Configuration:")
        print(f"   - Base URL: {self.base_url}")
        print(f"   - Intensive Users: {INTENSIVE_CONCURRENT_USERS}")
        print(f"   - Intensive Requests: {INTENSIVE_REQUESTS_PER_USER}")
        print(f"   - Burst Users: {BURST_CONCURRENT_USERS}")
        print(f"   - Burst Requests: {BURST_REQUESTS_PER_USER}")
        print(f"   - Endpoints: {len(ENDPOINTS)}")
        print()
        
        start_time = time.time()
        
        # Phase 1: Intensive testing of each endpoint
        print("🚀 Phase 1: Intensive Load Testing")
        for endpoint in ENDPOINTS:
            self.test_endpoint_intensively(endpoint, INTENSIVE_REQUESTS_PER_USER, INTENSIVE_CONCURRENT_USERS, "intensive")
            time.sleep(2)  # Brief pause between endpoints
        
        # Phase 2: Burst testing of critical endpoints
        print("\n💥 Phase 2: Burst Load Testing")
        critical_endpoints = ["/api/foundry/state", "/api/disaster-data"]
        for endpoint in critical_endpoints:
            self.test_endpoint_intensively(endpoint, BURST_REQUESTS_PER_USER, BURST_CONCURRENT_USERS, "burst")
            time.sleep(1)
        
        # Phase 3: Mixed load testing
        print("\n🎯 Phase 3: Mixed Load Testing")
        for _ in range(5):  # 5 rounds of mixed testing
            for endpoint in random.sample(ENDPOINTS, 3):  # Random 3 endpoints
                self.test_endpoint_intensively(endpoint, 20, 10, "mixed")
            time.sleep(1)
        
        total_time = time.time() - start_time
        self.generate_intensive_report(total_time)
    
    def test_specific_scenarios(self):
        """Test specific edge case scenarios"""
        print("\n🔬 Testing Specific Scenarios")
        
        # Scenario 1: Rapid successive requests
        print("   Scenario 1: Rapid Successive Requests")
        for _ in range(10):
            for endpoint in ENDPOINTS:
                self.make_request(endpoint, "rapid")
            time.sleep(0.1)
        
        # Scenario 2: Large payload requests (if applicable)
        print("   Scenario 2: Large Payload Simulation")
        for endpoint in ["/api/foundry/state", "/api/disaster-data"]:
            for _ in range(20):
                self.make_request(endpoint, "large_payload")
        
        # Scenario 3: Concurrent mixed endpoints
        print("   Scenario 3: Concurrent Mixed Endpoints")
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = []
            for _ in range(100):
                endpoint = random.choice(ENDPOINTS)
                futures.append(executor.submit(self.make_request, endpoint, "concurrent_mixed"))
            
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    print(f"❌ Concurrent test error: {e}")
    
    def generate_intensive_report(self, total_time):
        """Generate comprehensive intensive test report"""
        print("\n" + "="*80)
        print("📋 INTENSIVE API STRESS TEST REPORT")
        print("="*80)
        
        # Overall statistics
        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r["success"])
        failed_requests = total_requests - successful_requests
        
        print(f"📊 Overall Results:")
        print(f"   - Total Requests: {total_requests:,}")
        print(f"   - Successful: {successful_requests:,}")
        print(f"   - Failed: {failed_requests:,}")
        print(f"   - Success Rate: {(successful_requests/total_requests)*100:.2f}%")
        print(f"   - Total Time: {total_time:.2f} seconds")
        print(f"   - Requests/Second: {total_requests/total_time:.2f}")
        
        # Response time statistics
        response_times = [r["response_time"] for r in self.results if r["success"]]
        if response_times:
            print(f"\n⏱️  Response Time Statistics (successful requests):")
            print(f"   - Average: {statistics.mean(response_times):.3f}s")
            print(f"   - Median: {statistics.median(response_times):.3f}s")
            print(f"   - Min: {min(response_times):.3f}s")
            print(f"   - Max: {max(response_times):.3f}s")
            print(f"   - 95th Percentile: {statistics.quantiles(response_times, n=20)[18]:.3f}s")
            print(f"   - 99th Percentile: {statistics.quantiles(response_times, n=100)[98]:.3f}s")
        
        # Per-endpoint statistics
        print(f"\n🔍 Per-Endpoint Results:")
        for endpoint in ENDPOINTS:
            endpoint_results = [r for r in self.results if r["endpoint"] == endpoint]
            if endpoint_results:
                endpoint_success = sum(1 for r in endpoint_results if r["success"])
                endpoint_times = [r["response_time"] for r in endpoint_results if r["success"]]
                
                print(f"\n   {endpoint}:")
                print(f"     - Requests: {len(endpoint_results):,}")
                print(f"     - Success Rate: {(endpoint_success/len(endpoint_results))*100:.2f}%")
                if endpoint_times:
                    print(f"     - Avg Response Time: {statistics.mean(endpoint_times):.3f}s")
                    print(f"     - Max Response Time: {max(endpoint_times):.3f}s")
                    print(f"     - 95th Percentile: {statistics.quantiles(endpoint_times, n=20)[18]:.3f}s")
        
        # Test type analysis
        print(f"\n🧪 Test Type Analysis:")
        test_types = {}
        for result in self.results:
            test_type = result.get("test_type", "unknown")
            if test_type not in test_types:
                test_types[test_type] = {"total": 0, "success": 0}
            test_types[test_type]["total"] += 1
            if result["success"]:
                test_types[test_type]["success"] += 1
        
        for test_type, stats in test_types.items():
            success_rate = (stats["success"]/stats["total"])*100
            print(f"   - {test_type}: {stats['success']:,}/{stats['total']:,} ({success_rate:.2f}%)")
        
        # Error analysis
        failed_results = [r for r in self.results if not r["success"]]
        if failed_results:
            print(f"\n❌ Error Analysis:")
            error_counts = {}
            for result in failed_results:
                error_key = f"{result['endpoint']} - {result.get('status_code', 'timeout')}"
                error_counts[error_key] = error_counts.get(error_key, 0) + 1
            
            for error, count in error_counts.items():
                print(f"   - {error}: {count} failures")
        
        print("\n" + "="*80)
        
        # Performance assessment
        if successful_requests/total_requests >= 0.99:
            print("🏆 OUTSTANDING: API is performing exceptionally under extreme stress")
        elif successful_requests/total_requests >= 0.95:
            print("✅ EXCELLENT: API is performing very well under extreme stress")
        elif successful_requests/total_requests >= 0.90:
            print("⚠️  GOOD: API is performing adequately under extreme stress")
        elif successful_requests/total_requests >= 0.80:
            print("⚠️  FAIR: API is experiencing some issues under extreme stress")
        else:
            print("❌ POOR: API is struggling under extreme stress")
        
        print("="*80)

def main():
    """Main intensive test execution"""
    print("🔥 Intensive API Stress Test Tool")
    print("="*50)
    
    # Check if API is running
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ API is running and responding")
        else:
            print(f"⚠️  API responded with status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to API: {e}")
        print("Please ensure the API is running on http://localhost:5001")
        sys.exit(1)
    
    tester = IntensiveAPITester(BASE_URL)
    
    # Run intensive test
    print("\n🔥 Starting intensive stress test...")
    tester.run_intensive_test()
    
    # Run specific scenarios
    print("\n🔬 Running specific edge case scenarios...")
    tester.test_specific_scenarios()
    
    print("\n✅ Intensive stress test completed!")

if __name__ == "__main__":
    main()
