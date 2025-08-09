#!/usr/bin/env python3
"""
Comprehensive API Stress Test
Tests all endpoints under various load conditions
"""

import requests
import time
import threading
import json
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import sys

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

# Test Configuration
CONCURRENT_USERS = 10
REQUESTS_PER_USER = 50
TOTAL_REQUESTS = CONCURRENT_USERS * REQUESTS_PER_USER

class APITestResult:
    def __init__(self, endpoint, status_code, response_time, success):
        self.endpoint = endpoint
        self.status_code = status_code
        self.response_time = response_time
        self.success = success
        self.timestamp = datetime.now()

class APIStressTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.results = []
        self.lock = threading.Lock()
        
    def make_request(self, endpoint):
        """Make a single API request and record results"""
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
            response_time = time.time() - start_time
            success = response.status_code == 200
            
            result = APITestResult(
                endpoint=endpoint,
                status_code=response.status_code,
                response_time=response_time,
                success=success
            )
            
            with self.lock:
                self.results.append(result)
                
            return result
            
        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            result = APITestResult(
                endpoint=endpoint,
                status_code=0,
                response_time=response_time,
                success=False
            )
            
            with self.lock:
                self.results.append(result)
                
            return result
    
    def test_endpoint_under_load(self, endpoint, num_requests):
        """Test a specific endpoint under load"""
        print(f"Testing {endpoint} with {num_requests} requests...")
        
        with ThreadPoolExecutor(max_workers=CONCURRENT_USERS) as executor:
            futures = [executor.submit(self.make_request, endpoint) for _ in range(num_requests)]
            
            for future in as_completed(futures):
                try:
                    result = future.result()
                    if not result.success:
                        print(f"❌ Failed request to {endpoint}: {result.status_code}")
                except Exception as e:
                    print(f"❌ Exception in request to {endpoint}: {e}")
    
    def test_all_endpoints(self):
        """Test all endpoints under load"""
        print(f"🚀 Starting API Stress Test")
        print(f"📊 Configuration:")
        print(f"   - Base URL: {self.base_url}")
        print(f"   - Concurrent Users: {CONCURRENT_USERS}")
        print(f"   - Requests per User: {REQUESTS_PER_USER}")
        print(f"   - Total Requests: {TOTAL_REQUESTS}")
        print(f"   - Endpoints: {len(ENDPOINTS)}")
        print()
        
        start_time = time.time()
        
        # Test each endpoint
        for endpoint in ENDPOINTS:
            self.test_endpoint_under_load(endpoint, REQUESTS_PER_USER)
            time.sleep(1)  # Brief pause between endpoints
        
        total_time = time.time() - start_time
        
        # Generate report
        self.generate_report(total_time)
    
    def test_specific_endpoint(self, endpoint, num_requests=100):
        """Test a specific endpoint intensively"""
        print(f"🎯 Intensive test of {endpoint} with {num_requests} requests...")
        
        start_time = time.time()
        self.test_endpoint_under_load(endpoint, num_requests)
        total_time = time.time() - start_time
        
        self.generate_endpoint_report(endpoint, total_time)
    
    def generate_report(self, total_time):
        """Generate comprehensive test report"""
        print("\n" + "="*80)
        print("📋 API STRESS TEST REPORT")
        print("="*80)
        
        # Overall statistics
        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r.success)
        failed_requests = total_requests - successful_requests
        
        print(f"📊 Overall Results:")
        print(f"   - Total Requests: {total_requests}")
        print(f"   - Successful: {successful_requests}")
        print(f"   - Failed: {failed_requests}")
        print(f"   - Success Rate: {(successful_requests/total_requests)*100:.2f}%")
        print(f"   - Total Time: {total_time:.2f} seconds")
        print(f"   - Requests/Second: {total_requests/total_time:.2f}")
        
        # Response time statistics
        response_times = [r.response_time for r in self.results if r.success]
        if response_times:
            print(f"\n⏱️  Response Time Statistics (successful requests):")
            print(f"   - Average: {statistics.mean(response_times):.3f}s")
            print(f"   - Median: {statistics.median(response_times):.3f}s")
            print(f"   - Min: {min(response_times):.3f}s")
            print(f"   - Max: {max(response_times):.3f}s")
            print(f"   - 95th Percentile: {statistics.quantiles(response_times, n=20)[18]:.3f}s")
        
        # Per-endpoint statistics
        print(f"\n🔍 Per-Endpoint Results:")
        for endpoint in ENDPOINTS:
            endpoint_results = [r for r in self.results if r.endpoint == endpoint]
            if endpoint_results:
                endpoint_success = sum(1 for r in endpoint_results if r.success)
                endpoint_times = [r.response_time for r in endpoint_results if r.success]
                
                print(f"\n   {endpoint}:")
                print(f"     - Requests: {len(endpoint_results)}")
                print(f"     - Success Rate: {(endpoint_success/len(endpoint_results))*100:.2f}%")
                if endpoint_times:
                    print(f"     - Avg Response Time: {statistics.mean(endpoint_times):.3f}s")
                    print(f"     - Max Response Time: {max(endpoint_times):.3f}s")
        
        # Error analysis
        failed_results = [r for r in self.results if not r.success]
        if failed_results:
            print(f"\n❌ Error Analysis:")
            error_counts = {}
            for result in failed_results:
                error_key = f"{result.endpoint} - {result.status_code}"
                error_counts[error_key] = error_counts.get(error_key, 0) + 1
            
            for error, count in error_counts.items():
                print(f"   - {error}: {count} failures")
        
        print("\n" + "="*80)
        
        # Performance assessment
        if successful_requests/total_requests >= 0.95:
            print("✅ EXCELLENT: API is performing well under stress")
        elif successful_requests/total_requests >= 0.90:
            print("⚠️  GOOD: API is performing adequately under stress")
        elif successful_requests/total_requests >= 0.80:
            print("⚠️  FAIR: API is experiencing some issues under stress")
        else:
            print("❌ POOR: API is struggling under stress")
        
        print("="*80)
    
    def generate_endpoint_report(self, endpoint, total_time):
        """Generate report for a specific endpoint"""
        endpoint_results = [r for r in self.results if r.endpoint == endpoint]
        if not endpoint_results:
            return
        
        successful = sum(1 for r in endpoint_results if r.success)
        response_times = [r.response_time for r in endpoint_results if r.success]
        
        print(f"\n📊 {endpoint} Results:")
        print(f"   - Total Requests: {len(endpoint_results)}")
        print(f"   - Success Rate: {(successful/len(endpoint_results))*100:.2f}%")
        print(f"   - Total Time: {total_time:.2f}s")
        print(f"   - Requests/Second: {len(endpoint_results)/total_time:.2f}")
        
        if response_times:
            print(f"   - Avg Response Time: {statistics.mean(response_times):.3f}s")
            print(f"   - Max Response Time: {max(response_times):.3f}s")

def main():
    """Main test execution"""
    print("🔧 API Stress Test Tool")
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
        print("Please ensure the API is running on http://localhost:5000")
        sys.exit(1)
    
    tester = APIStressTester(BASE_URL)
    
    # Run comprehensive test
    print("\n🚀 Starting comprehensive stress test...")
    tester.test_all_endpoints()
    
    # Run intensive test on critical endpoints
    print("\n🎯 Running intensive tests on critical endpoints...")
    critical_endpoints = ["/api/foundry/state", "/api/disaster-data"]
    for endpoint in critical_endpoints:
        tester.test_specific_endpoint(endpoint, 200)
    
    print("\n✅ Stress test completed!")

if __name__ == "__main__":
    main()
