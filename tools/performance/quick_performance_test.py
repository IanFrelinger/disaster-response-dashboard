#!/usr/bin/env python3
"""
Quick Performance Test for Disaster Response Dashboard
Non-interactive performance testing
"""

import requests
import time
import json
from datetime import datetime
from typing import Dict, List

def test_endpoint(name: str, url: str, timeout: int = 10) -> Dict:
    """Test a single endpoint and return performance metrics"""
    try:
        start_time = time.time()
        response = requests.get(url, timeout=timeout)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        return {
            'name': name,
            'url': url,
            'status_code': response.status_code,
            'response_time_ms': round(response_time, 2),
            'success': response.status_code == 200,
            'timestamp': datetime.now().isoformat(),
            'error': None
        }
    except Exception as e:
        return {
            'name': name,
            'url': url,
            'status_code': None,
            'response_time_ms': None,
            'success': False,
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }

def run_quick_performance_test():
    """Run a quick performance test without user interaction"""
    print("🚀 Disaster Response Dashboard - Quick Performance Test")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    backend_url = "http://localhost:5001"
    frontend_url = "http://localhost:3000"
    
    endpoints = [
        ("Backend Health", f"{backend_url}/api/health"),
        ("Backend Dashboard", f"{backend_url}/api/dashboard"),
        ("Backend Hazards", f"{backend_url}/api/hazards"),
        ("Backend Routes", f"{backend_url}/api/routes"),
        ("Frontend Home", f"{frontend_url}/"),
        ("Frontend Field", f"{frontend_url}/field"),
        ("Frontend Command", f"{frontend_url}/command")
    ]
    
    results = []
    for name, url in endpoints:
        result = test_endpoint(name, url)
        results.append(result)
        
        if result['success']:
            print(f"✅ {name}: {result['response_time_ms']}ms")
        else:
            print(f"❌ {name}: {result['error']}")
    
    # Calculate summary statistics
    successful_tests = [r for r in results if r['success']]
    failed_tests = [r for r in results if not r['success']]
    
    if successful_tests:
        response_times = [r['response_time_ms'] for r in successful_tests]
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        min_response_time = min(response_times)
    else:
        avg_response_time = max_response_time = min_response_time = 0
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 PERFORMANCE SUMMARY")
    print("=" * 60)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total Tests: {len(results)}")
    print(f"Successful: {len(successful_tests)}")
    print(f"Failed: {len(failed_tests)}")
    print(f"Success Rate: {len(successful_tests) / len(results) * 100:.1f}%")
    print(f"Average Response Time: {avg_response_time:.2f}ms")
    print(f"Fastest Response: {min_response_time:.2f}ms")
    print(f"Slowest Response: {max_response_time:.2f}ms")
    
    if failed_tests:
        print("\n❌ Failed Tests:")
        for result in results:
            if not result['success']:
                print(f"  - {result['name']}: {result['error']}")
    
    # Performance assessment
    print("\n" + "=" * 60)
    print("🎯 PERFORMANCE ASSESSMENT")
    print("=" * 60)
    
    if avg_response_time < 10:
        print("🟢 EXCELLENT: Response times are very fast")
    elif avg_response_time < 50:
        print("🟡 GOOD: Response times are acceptable")
    elif avg_response_time < 100:
        print("🟠 FAIR: Response times are slow but tolerable")
    else:
        print("🔴 POOR: Response times are too slow")
    
    if len(successful_tests) == len(results):
        print("✅ All endpoints are responding correctly")
    else:
        print(f"⚠️  {len(failed_tests)} endpoints are not responding")
    
    # Save results
    summary = {
        'timestamp': datetime.now().isoformat(),
        'total_tests': len(results),
        'successful_tests': len(successful_tests),
        'failed_tests': len(failed_tests),
        'success_rate': len(successful_tests) / len(results) * 100,
        'avg_response_time_ms': round(avg_response_time, 2),
        'max_response_time_ms': round(max_response_time, 2),
        'min_response_time_ms': round(min_response_time, 2),
        'results': results
    }
    
    with open("quick_performance_results.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n💾 Results saved to quick_performance_results.json")
    
    return summary

if __name__ == "__main__":
    run_quick_performance_test()
