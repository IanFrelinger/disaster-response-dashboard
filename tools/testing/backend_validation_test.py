#!/usr/bin/env python3
"""
Backend API Validation Test
Comprehensive testing of all backend API endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple

class BackendValidationTest:
    def __init__(self):
        self.base_url = "http://localhost:5001"
        self.results = []
        self.start_time = datetime.now()
        
    def test_health_endpoint(self) -> Dict:
        """Test the health check endpoint"""
        print("🏥 Testing Health Endpoint")
        
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Health check passed: {data.get('status', 'unknown')}")
                print(f"   📊 Service: {data.get('service', 'unknown')}")
                print(f"   🕐 Timestamp: {data.get('timestamp', 'unknown')}")
                
                return {
                    'test': 'Health Endpoint',
                    'status': 'PASS',
                    'response_time': response.elapsed.total_seconds(),
                    'data': data
                }
            else:
                print(f"   ❌ Health check failed: HTTP {response.status_code}")
                return {
                    'test': 'Health Endpoint',
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"   ❌ Health check error: {str(e)}")
            return {
                'test': 'Health Endpoint',
                'status': 'FAIL',
                'error': str(e)
            }
    
    def test_api_info(self) -> Dict:
        """Test the API info endpoint"""
        print("\n📖 Testing API Info Endpoint")
        
        try:
            response = requests.get(f"{self.base_url}/api/info", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ API info retrieved successfully")
                print(f"   📊 Service: {data.get('service', 'unknown')}")
                print(f"   🔢 Version: {data.get('version', 'unknown')}")
                
                # Check available endpoints
                endpoints = data.get('endpoints', {})
                print(f"   🌐 Available endpoints: {len(endpoints)}")
                for method_path, description in list(endpoints.items())[:5]:  # Show first 5
                    print(f"      • {method_path}: {description}")
                
                return {
                    'test': 'API Info Endpoint',
                    'status': 'PASS',
                    'response_time': response.elapsed.total_seconds(),
                    'endpoint_count': len(endpoints)
                }
            else:
                print(f"   ❌ API info failed: HTTP {response.status_code}")
                return {
                    'test': 'API Info Endpoint',
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"   ❌ API info error: {str(e)}")
            return {
                'test': 'API Info Endpoint',
                'status': 'FAIL',
                'error': str(e)
            }
    
    def test_dashboard_endpoint(self) -> Dict:
        """Test the main dashboard endpoint"""
        print("\n📊 Testing Dashboard Endpoint")
        
        try:
            response = requests.get(f"{self.base_url}/api/dashboard", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Dashboard data retrieved successfully")
                
                # Validate dashboard structure
                dashboard_data = data.get('data', {})
                evacuation_routes = dashboard_data.get('evacuationRoutes', {})
                hazards = dashboard_data.get('hazards', [])
                
                print(f"   🛣️  Evacuation routes: {evacuation_routes.get('availableRoutes', 0)} available")
                print(f"   🚨 Hazards: {len(hazards)} active")
                print(f"   📏 Response size: {len(response.content)} bytes")
                
                return {
                    'test': 'Dashboard Endpoint',
                    'status': 'PASS',
                    'response_time': response.elapsed.total_seconds(),
                    'route_count': evacuation_routes.get('availableRoutes', 0),
                    'hazard_count': len(hazards),
                    'response_size': len(response.content)
                }
            else:
                print(f"   ❌ Dashboard failed: HTTP {response.status_code}")
                return {
                    'test': 'Dashboard Endpoint',
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"   ❌ Dashboard error: {str(e)}")
            return {
                'test': 'Dashboard Endpoint',
                'status': 'FAIL',
                'error': str(e)
            }
    
    def test_hazards_endpoint(self) -> Dict:
        """Test the hazards endpoint"""
        print("\n🚨 Testing Hazards Endpoint")
        
        try:
            response = requests.get(f"{self.base_url}/api/hazards", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Hazards data retrieved successfully")
                
                hazards = data.get('hazards', [])
                print(f"   🔥 Active hazards: {len(hazards)}")
                
                if hazards:
                    # Show first hazard details
                    first_hazard = hazards[0]
                    print(f"   📍 First hazard: {first_hazard.get('type', 'unknown')} at {first_hazard.get('coordinates', 'unknown')}")
                    print(f"   ⚠️  Severity: {first_hazard.get('severity', 'unknown')}")
                
                return {
                    'test': 'Hazards Endpoint',
                    'status': 'PASS',
                    'response_time': response.elapsed.total_seconds(),
                    'hazard_count': len(hazards),
                    'response_size': len(response.content)
                }
            else:
                print(f"   ❌ Hazards failed: HTTP {response.status_code}")
                return {
                    'test': 'Hazards Endpoint',
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"   ❌ Hazards error: {str(e)}")
            return {
                'test': 'Hazards Endpoint',
                'status': 'FAIL',
                'error': str(e)
            }
    
    def test_routes_endpoint(self) -> Dict:
        """Test the routes endpoint"""
        print("\n🛣️ Testing Routes Endpoint")
        
        try:
            response = requests.get(f"{self.base_url}/api/routes", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Routes data retrieved successfully")
                
                routes = data.get('routes', [])
                print(f"   🚗 Available routes: {len(routes)}")
                
                if routes:
                    # Show first route details
                    first_route = routes[0]
                    print(f"   📍 Route: {first_route.get('name', 'unnamed')}")
                    print(f"   📏 Distance: {first_route.get('distance', 'unknown')} km")
                    print(f"   ⏱️  Duration: {first_route.get('duration', 'unknown')} min")
                
                return {
                    'test': 'Routes Endpoint',
                    'status': 'PASS',
                    'response_time': response.elapsed.total_seconds(),
                    'route_count': len(routes),
                    'response_size': len(response.content)
                }
            else:
                print(f"   ❌ Routes failed: HTTP {response.status_code}")
                return {
                    'test': 'Routes Endpoint',
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"   ❌ Routes error: {str(e)}")
            return {
                'test': 'Routes Endpoint',
                'status': 'FAIL',
                'error': str(e)
            }
    
    def test_evacuation_routes_endpoint(self) -> Dict:
        """Test the evacuation routes endpoint"""
        print("\n🚨 Testing Evacuation Routes Endpoint")
        
        try:
            response = requests.get(f"{self.base_url}/api/evacuation-routes", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Evacuation routes data retrieved successfully")
                
                evacuation_data = data.get('evacuationRoutes', {})
                routes = evacuation_data.get('routes', [])
                print(f"   🚨 Evacuation routes: {len(routes)} available")
                print(f"   🔥 Hazard count: {evacuation_data.get('hazardCount', 0)}")
                
                return {
                    'test': 'Evacuation Routes Endpoint',
                    'status': 'PASS',
                    'response_time': response.elapsed.total_seconds(),
                    'route_count': len(routes),
                    'hazard_count': evacuation_data.get('hazardCount', 0),
                    'response_size': len(response.content)
                }
            else:
                print(f"   ❌ Evacuation routes failed: HTTP {response.status_code}")
                return {
                    'test': 'Evacuation Routes Endpoint',
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"   ❌ Evacuation routes error: {str(e)}")
            return {
                'test': 'Evacuation Routes Endpoint',
                'status': 'FAIL',
                'error': str(e)
            }
    
    def test_hazard_summary_endpoint(self) -> Dict:
        """Test the hazard summary endpoint"""
        print("\n📈 Testing Hazard Summary Endpoint")
        
        try:
            response = requests.get(f"{self.base_url}/api/hazard-summary", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Hazard summary data retrieved successfully")
                
                summary = data.get('summary', {})
                print(f"   🔥 Total hazards: {summary.get('totalHazards', 0)}")
                print(f"   🚨 Critical hazards: {summary.get('criticalHazards', 0)}")
                print(f"   👥 Population at risk: {summary.get('populationAtRisk', 0):,}")
                
                return {
                    'test': 'Hazard Summary Endpoint',
                    'status': 'PASS',
                    'response_time': response.elapsed.total_seconds(),
                    'total_hazards': summary.get('totalHazards', 0),
                    'critical_hazards': summary.get('criticalHazards', 0),
                    'response_size': len(response.content)
                }
            else:
                print(f"   ❌ Hazard summary failed: HTTP {response.status_code}")
                return {
                    'test': 'Hazard Summary Endpoint',
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"   ❌ Hazard summary error: {str(e)}")
            return {
                'test': 'Hazard Summary Endpoint',
                'status': 'FAIL',
                'error': str(e)
            }
    
    def test_risk_assessment_endpoint(self) -> Dict:
        """Test the risk assessment endpoint with sample coordinates"""
        print("\n⚠️ Testing Risk Assessment Endpoint")
        
        # Test with San Francisco coordinates
        test_coords = [
            {"lat": 37.7749, "lng": -122.4194, "name": "San Francisco"},
            {"lat": 37.3382, "lng": -121.8863, "name": "San Jose"},
            {"lat": 37.8715, "lng": -122.2730, "name": "Berkeley"}
        ]
        
        results = []
        for coords in test_coords:
            try:
                params = {"lat": coords["lat"], "lng": coords["lng"]}
                response = requests.get(f"{self.base_url}/api/risk-assessment", params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    risk_level = data.get('riskLevel', 'unknown')
                    print(f"   ✅ {coords['name']}: Risk level {risk_level}")
                    results.append(f"✅ {coords['name']}: {risk_level}")
                else:
                    print(f"   ❌ {coords['name']}: HTTP {response.status_code}")
                    results.append(f"❌ {coords['name']}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ {coords['name']}: {str(e)}")
                results.append(f"❌ {coords['name']}: {str(e)}")
        
        success_count = sum(1 for r in results if '✅' in r)
        return {
            'test': 'Risk Assessment Endpoint',
            'status': 'PASS' if success_count == len(test_coords) else 'PARTIAL',
            'results': results,
            'success_rate': f"{success_count}/{len(test_coords)}"
        }
    
    def test_scenario_endpoints(self) -> Dict:
        """Test the scenario-specific endpoints"""
        print("\n🎭 Testing Scenario Endpoints")
        
        scenarios = [
            "wildfire-napa",
            "flood-sacramento", 
            "earthquake-sf",
            "hurricane-miami"
        ]
        
        results = []
        for scenario in scenarios:
            try:
                response = requests.get(f"{self.base_url}/api/scenario/{scenario}", timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    scenario_name = data.get('scenario', {}).get('name', scenario)
                    print(f"   ✅ {scenario}: {scenario_name}")
                    results.append(f"✅ {scenario}: OK")
                else:
                    print(f"   ❌ {scenario}: HTTP {response.status_code}")
                    results.append(f"❌ {scenario}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ {scenario}: {str(e)}")
                results.append(f"❌ {scenario}: {str(e)}")
        
        success_count = sum(1 for r in results if '✅' in r)
        return {
            'test': 'Scenario Endpoints',
            'status': 'PASS' if success_count == len(scenarios) else 'PARTIAL',
            'results': results,
            'success_rate': f"{success_count}/{len(scenarios)}"
        }
    
    def test_refresh_endpoint(self) -> Dict:
        """Test the refresh endpoint (POST)"""
        print("\n🔄 Testing Refresh Endpoint")
        
        try:
            response = requests.post(f"{self.base_url}/api/refresh", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Refresh endpoint working")
                print(f"   📊 Status: {data.get('status', 'unknown')}")
                
                return {
                    'test': 'Refresh Endpoint',
                    'status': 'PASS',
                    'response_time': response.elapsed.total_seconds(),
                    'response_size': len(response.content)
                }
            else:
                print(f"   ❌ Refresh failed: HTTP {response.status_code}")
                return {
                    'test': 'Refresh Endpoint',
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"   ❌ Refresh error: {str(e)}")
            return {
                'test': 'Refresh Endpoint',
                'status': 'FAIL',
                'error': str(e)
            }
    
    def test_performance(self) -> Dict:
        """Test API performance under load"""
        print("\n⚡ Testing API Performance")
        
        endpoints = [
            "/api/health",
            "/api/info", 
            "/api/dashboard",
            "/api/hazards",
            "/api/routes"
        ]
        
        performance_results = []
        for endpoint in endpoints:
            times = []
            for i in range(3):  # Test each endpoint 3 times
                try:
                    start_time = time.time()
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                    end_time = time.time()
                    
                    if response.status_code == 200:
                        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                        times.append(response_time)
                    else:
                        times.append(None)
                        
                except Exception:
                    times.append(None)
            
            # Calculate average response time
            valid_times = [t for t in times if t is not None]
            if valid_times:
                avg_time = sum(valid_times) / len(valid_times)
                print(f"   📊 {endpoint}: {avg_time:.1f}ms avg")
                performance_results.append(f"✅ {endpoint}: {avg_time:.1f}ms")
            else:
                print(f"   ❌ {endpoint}: Failed all attempts")
                performance_results.append(f"❌ {endpoint}: Failed")
        
        success_count = sum(1 for r in performance_results if '✅' in r)
        return {
            'test': 'API Performance',
            'status': 'PASS' if success_count == len(endpoints) else 'PARTIAL',
            'results': performance_results,
            'success_rate': f"{success_count}/{len(endpoints)}"
        }
    
    def run_comprehensive_test(self) -> Dict:
        """Run all validation tests"""
        print("🚀 Disaster Response Dashboard - Backend API Validation Test")
        print("=" * 80)
        print(f"Test started at: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Target: {self.base_url}")
        print("=" * 80)
        
        # Run all tests
        tests = [
            self.test_health_endpoint,
            self.test_api_info,
            self.test_dashboard_endpoint,
            self.test_hazards_endpoint,
            self.test_routes_endpoint,
            self.test_evacuation_routes_endpoint,
            self.test_hazard_summary_endpoint,
            self.test_risk_assessment_endpoint,
            self.test_scenario_endpoints,
            self.test_refresh_endpoint,
            self.test_performance
        ]
        
        for test_func in tests:
            try:
                result = test_func()
                self.results.append(result)
            except Exception as e:
                print(f"   ❌ Test {test_func.__name__} crashed: {str(e)}")
                self.results.append({
                    'test': test_func.__name__,
                    'status': 'CRASH',
                    'error': str(e)
                })
        
        return self.generate_summary()
    
    def generate_summary(self) -> Dict:
        """Generate comprehensive test summary"""
        end_time = datetime.now()
        test_duration = (end_time - self.start_time).total_seconds()
        
        # Count results by status
        status_counts = {}
        for result in self.results:
            status = result.get('status', 'UNKNOWN')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        total_tests = len(self.results)
        passed_tests = status_counts.get('PASS', 0)
        partial_tests = status_counts.get('PARTIAL', 0)
        failed_tests = status_counts.get('FAIL', 0) + status_counts.get('CRASH', 0)
        
        success_rate = (passed_tests + partial_tests * 0.5) / total_tests * 100 if total_tests > 0 else 0
        
        # Determine overall status
        if success_rate >= 90:
            overall_status = "EXCELLENT"
        elif success_rate >= 80:
            overall_status = "GOOD"
        elif success_rate >= 70:
            overall_status = "FAIR"
        else:
            overall_status = "POOR"
        
        summary = {
            'test_time': self.start_time.isoformat(),
            'test_duration_seconds': test_duration,
            'overall_status': overall_status,
            'success_rate_percent': round(success_rate, 1),
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'partial_tests': partial_tests,
            'failed_tests': failed_tests,
            'status_breakdown': status_counts,
            'results': self.results
        }
        
        return summary
    
    def print_summary(self, summary: Dict):
        """Print formatted test summary"""
        print("\n" + "=" * 80)
        print("📊 BACKEND API VALIDATION TEST SUMMARY")
        print("=" * 80)
        print(f"Test Time: {summary['test_time']}")
        print(f"Duration: {summary['test_duration_seconds']:.1f} seconds")
        print(f"Overall Status: {summary['overall_status']}")
        print(f"Success Rate: {summary['success_rate_percent']}%")
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed_tests']} ✅")
        print(f"Partial: {summary['partial_tests']} ⚠️")
        print(f"Failed: {summary['failed_tests']} ❌")
        print("=" * 80)
        
        # Print detailed results
        for result in summary['results']:
            test_name = result.get('test', 'Unknown Test')
            status = result.get('status', 'UNKNOWN')
            
            if status == 'PASS':
                print(f"✅ {test_name}")
            elif status == 'PARTIAL':
                print(f"⚠️  {test_name}")
            else:
                print(f"❌ {test_name}")
                if 'error' in result:
                    print(f"    Error: {result['error']}")
        
        print("=" * 80)
        
        # Final assessment
        if summary['success_rate_percent'] >= 90:
            print("🎉 EXCELLENT: Backend API is performing exceptionally well!")
        elif summary['success_rate_percent'] >= 80:
            print("👍 GOOD: Backend API is working well with minor issues.")
        elif summary['success_rate_percent'] >= 70:
            print("⚠️  FAIR: Backend API has some issues that need attention.")
        else:
            print("🔴 POOR: Backend API has significant issues requiring immediate attention.")
        
        print(f"\n💾 Results saved to backend_validation_results.json")

def main():
    """Main test execution"""
    tester = BackendValidationTest()
    
    try:
        summary = tester.run_comprehensive_test()
        tester.print_summary(summary)
        
        # Save results to file
        with open('backend_validation_results.json', 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        
        # Exit with appropriate code
        if summary['success_rate_percent'] >= 80:
            sys.exit(0)  # Success
        else:
            sys.exit(1)  # Failure
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test execution failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    import sys
    main()
