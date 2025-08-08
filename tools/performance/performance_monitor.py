#!/usr/bin/env python3
"""
Performance Monitor for Disaster Response Dashboard
Monitors system performance and response times
"""

import requests
import time
import json
from datetime import datetime
from typing import Dict, List

class PerformanceMonitor:
    def __init__(self):
        self.backend_url = "http://localhost:5001"
        self.frontend_url = "http://localhost:3000"
        self.results: List[Dict] = []
    
    def test_endpoint(self, name: str, url: str, timeout: int = 10) -> Dict:
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
    
    def run_performance_test(self) -> Dict:
        """Run a complete performance test suite"""
        print(f"🔍 Running Performance Test at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        endpoints = [
            ("Backend Health", f"{self.backend_url}/api/health"),
            ("Backend Dashboard", f"{self.backend_url}/api/dashboard"),
            ("Backend Hazards", f"{self.backend_url}/api/hazards"),
            ("Backend Routes", f"{self.backend_url}/api/routes"),
            ("Frontend Home", f"{self.frontend_url}/"),
            ("Frontend Field", f"{self.frontend_url}/field"),
            ("Frontend Command", f"{self.frontend_url}/command")
        ]
        
        results = []
        for name, url in endpoints:
            result = self.test_endpoint(name, url)
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
        
        self.results.append(summary)
        return summary
    
    def print_summary(self, summary: Dict):
        """Print a formatted summary of performance results"""
        print("\n" + "=" * 60)
        print("📊 PERFORMANCE SUMMARY")
        print("=" * 60)
        print(f"Test Time: {summary['timestamp']}")
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Successful: {summary['successful_tests']}")
        print(f"Failed: {summary['failed_tests']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print(f"Average Response Time: {summary['avg_response_time_ms']}ms")
        print(f"Fastest Response: {summary['min_response_time_ms']}ms")
        print(f"Slowest Response: {summary['max_response_time_ms']}ms")
        
        if summary['failed_tests'] > 0:
            print("\n❌ Failed Tests:")
            for result in summary['results']:
                if not result['success']:
                    print(f"  - {result['name']}: {result['error']}")
    
    def save_results(self, filename: str = "performance_results.json"):
        """Save performance results to a JSON file"""
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\n💾 Results saved to {filename}")
    
    def continuous_monitoring(self, interval: int = 60, duration: int = 3600):
        """Run continuous monitoring for a specified duration"""
        print(f"🔄 Starting continuous monitoring for {duration} seconds")
        print(f"📊 Testing every {interval} seconds")
        print("Press Ctrl+C to stop early")
        
        start_time = time.time()
        test_count = 0
        
        try:
            while time.time() - start_time < duration:
                test_count += 1
                print(f"\n--- Test #{test_count} ---")
                
                summary = self.run_performance_test()
                self.print_summary(summary)
                
                # Save results after each test
                self.save_results()
                
                if time.time() - start_time < duration:
                    print(f"\n⏳ Waiting {interval} seconds until next test...")
                    time.sleep(interval)
        
        except KeyboardInterrupt:
            print("\n🛑 Monitoring stopped by user")
        
        print(f"\n📈 Monitoring completed. Ran {test_count} tests.")
        self.save_results()

def main():
    """Main function to run performance monitoring"""
    monitor = PerformanceMonitor()
    
    # Run a single performance test
    print("🚀 Disaster Response Dashboard - Performance Monitor")
    print("=" * 60)
    
    summary = monitor.run_performance_test()
    monitor.print_summary(summary)
    
    # Ask if user wants continuous monitoring
    print("\n" + "=" * 60)
    response = input("Would you like to run continuous monitoring? (y/n): ").lower().strip()
    
    if response in ['y', 'yes']:
        try:
            interval = int(input("Enter test interval in seconds (default 60): ") or "60")
            duration = int(input("Enter monitoring duration in seconds (default 3600): ") or "3600")
            monitor.continuous_monitoring(interval, duration)
        except ValueError:
            print("Invalid input. Using default values.")
            monitor.continuous_monitoring()
    
    # Save final results
    monitor.save_results()

if __name__ == "__main__":
    main()
