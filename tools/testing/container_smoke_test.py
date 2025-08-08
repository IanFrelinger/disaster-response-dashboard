#!/usr/bin/env python3
"""
Container Smoke Test for Disaster Response Dashboard
Validates UI rendering, tile system integration, and map functionality
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple
import subprocess
import sys

class ContainerSmokeTest:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.tile_server_url = "http://localhost:8080"
        self.api_url = "http://localhost:5001"
        self.results = []
        
    def test_service_health(self) -> Dict:
        """Test if all services are running and healthy"""
        print("🔍 Testing Service Health")
        
        services = [
            ("Frontend", f"{self.base_url}/"),
            ("Backend API", f"{self.api_url}/api/health"),
            ("Tile Server", f"{self.tile_server_url}/data/admin_boundaries.json")
        ]
        
        results = []
        for name, url in services:
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    results.append(f"✅ {name}: Healthy (HTTP 200)")
                else:
                    results.append(f"❌ {name}: HTTP {response.status_code}")
            except Exception as e:
                results.append(f"❌ {name}: {str(e)}")
        
        return {
            'test': 'Service Health',
            'status': 'PASS' if all('✅' in r for r in results) else 'FAIL',
            'results': results
        }
    
    def test_tile_system(self) -> Dict:
        """Test tile system functionality"""
        print("\n🗺️ Testing Tile System")
        
        # Test tile server endpoints
        tile_endpoints = [
            ("Admin Boundaries", "/data/admin_boundaries.json"),
            ("California Counties", "/data/california_counties.json"),
            ("Hazards", "/data/hazards.json"),
            ("Routes", "/data/routes.json")
        ]
        
        tile_results = []
        for name, endpoint in tile_endpoints:
            try:
                url = f"{self.tile_server_url}{endpoint}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if 'tiles' in data and len(data['tiles']) > 0:
                        tile_count = len(data['tiles'])
                        tile_results.append(f"✅ {name}: {tile_count} tiles available")
                    else:
                        tile_results.append(f"⚠️ {name}: No tiles found in response")
                else:
                    tile_results.append(f"❌ {name}: HTTP {response.status_code}")
            except Exception as e:
                tile_results.append(f"❌ {name}: {str(e)}")
        
        # Test actual tile serving
        print("   Testing tile serving...")
        tile_serving_results = []
        
        # Test a specific tile coordinate that we know should exist
        test_tiles = [
            ("Admin Boundaries", "/data/admin_boundaries/8/40/98.pbf"),
            ("California Counties", "/data/california_counties/8/40/98.pbf"),
            ("Hazards", "/data/hazards/8/40/98.pbf"),
            ("Routes", "/data/routes/8/40/98.pbf")
        ]
        
        for name, tile_path in test_tiles:
            try:
                url = f"{self.tile_server_url}{tile_path}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    content_length = len(response.content)
                    tile_serving_results.append(f"✅ {name}: Tile served ({content_length} bytes)")
                elif response.status_code == 204:
                    tile_serving_results.append(f"⚠️ {name}: No content (204) - tile may not exist at this coordinate")
                else:
                    tile_serving_results.append(f"❌ {name}: HTTP {response.status_code}")
            except Exception as e:
                tile_serving_results.append(f"❌ {name}: {str(e)}")
        
        return {
            'test': 'Tile System',
            'status': 'PASS' if all('✅' in r for r in tile_results) else 'FAIL',
            'tile_endpoints': tile_results,
            'tile_serving': tile_serving_results
        }
    
    def test_frontend_tile_integration(self) -> Dict:
        """Test frontend tile integration by checking for map components and tile URLs"""
        print("\n🌐 Testing Frontend Tile Integration")
        
        pages = [
            ("Command View", f"{self.base_url}/command"),
            ("Field View", f"{self.base_url}/field"),
            ("Public View", f"{self.base_url}/public")
        ]
        
        integration_results = []
        
        for page_name, url in pages:
            try:
                response = requests.get(url, timeout=15)
                
                if response.status_code == 200:
                    content = response.text
                    
                    # Check for React app structure
                    page_checks = []
                    
                    # Check for React root div
                    if 'id="root"' in content:
                        page_checks.append("✅ React root div found")
                    else:
                        page_checks.append("❌ React root div not found")
                    
                    # Check for JavaScript bundles (React components are here)
                    if 'index-' in content and '.js' in content:
                        page_checks.append("✅ JavaScript bundles found")
                    else:
                        page_checks.append("❌ JavaScript bundles not found")
                    
                    # Check for CSS bundles
                    if 'index-' in content and '.css' in content:
                        page_checks.append("✅ CSS bundles found")
                    else:
                        page_checks.append("❌ CSS bundles not found")
                    
                    # Check for environment variables (tile server config)
                    if 'VITE_TILE_SERVER_URL' in content or 'localhost:8080' in content:
                        page_checks.append("✅ Tile server configuration found")
                    else:
                        page_checks.append("❌ Tile server configuration not found")
                    
                    # Check for Mapbox configuration
                    if 'mapbox' in content.lower():
                        page_checks.append("✅ Mapbox configuration found")
                    else:
                        page_checks.append("❌ Mapbox configuration not found")
                    
                    # Check for disaster response styling references
                    if 'disaster' in content.lower() or 'response' in content.lower():
                        page_checks.append("✅ Disaster response references found")
                    else:
                        page_checks.append("❌ Disaster response references not found")
                    
                    # Check for routing configuration
                    if 'router' in content.lower() or 'route' in content.lower():
                        page_checks.append("✅ Routing configuration found")
                    else:
                        page_checks.append("❌ Routing configuration not found")
                    
                    integration_results.append({
                        'page': page_name,
                        'status': 'PASS' if all('✅' in check for check in page_checks) else 'FAIL',
                        'checks': page_checks
                    })
                    
                else:
                    integration_results.append({
                        'page': page_name,
                        'status': 'ERROR',
                        'error': f"HTTP {response.status_code}"
                    })
                    
            except Exception as e:
                integration_results.append({
                    'page': page_name,
                    'status': 'ERROR',
                    'error': str(e)
                })
        
        return {
            'test': 'Frontend Tile Integration',
            'results': integration_results
        }
    
    def test_javascript_bundles(self) -> Dict:
        """Test JavaScript bundles for expected components and functionality"""
        print("\n📦 Testing JavaScript Bundles")
        
        try:
            # Get the main page to find JavaScript bundle URLs
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code != 200:
                return {
                    'test': 'JavaScript Bundles',
                    'status': 'ERROR',
                    'error': f"Could not access main page: HTTP {response.status_code}"
                }
            
            content = response.text
            
            # Find JavaScript bundle URLs
            import re
            js_pattern = r'src="([^"]*index-[^"]*\.js)"'
            js_matches = re.findall(js_pattern, content)
            
            if not js_matches:
                return {
                    'test': 'JavaScript Bundles',
                    'status': 'FAIL',
                    'error': 'No JavaScript bundles found'
                }
            
            bundle_results = []
            for js_url in js_matches:
                if not js_url.startswith('http'):
                    js_url = f"{self.base_url}{js_url}"
                
                try:
                    js_response = requests.get(js_url, timeout=15)
                    if js_response.status_code == 200:
                        js_content = js_response.text
                        
                        # Check for key components and functionality
                        checks = []
                        
                        # Check for React components
                        if 'react' in js_content.lower():
                            checks.append("✅ React framework found")
                        else:
                            checks.append("❌ React framework not found")
                        
                        # Check for map components
                        if 'mapbox' in js_content.lower():
                            checks.append("✅ Mapbox GL found")
                        else:
                            checks.append("❌ Mapbox GL not found")
                        
                        # Check for tile service
                        if 'tileservice' in js_content.lower() or 'tile_service' in js_content.lower():
                            checks.append("✅ Tile service found")
                        else:
                            checks.append("❌ Tile service not found")
                        
                        # Check for map components
                        if 'map' in js_content.lower() and 'component' in js_content.lower():
                            checks.append("✅ Map components found")
                        else:
                            checks.append("❌ Map components not found")
                        
                        # Check for routing
                        if 'router' in js_content.lower() or 'route' in js_content.lower():
                            checks.append("✅ Routing found")
                        else:
                            checks.append("❌ Routing not found")
                        
                        bundle_results.append({
                            'url': js_url,
                            'size_bytes': len(js_content),
                            'checks': checks,
                            'status': 'PASS' if all('✅' in check for check in checks) else 'FAIL'
                        })
                    else:
                        bundle_results.append({
                            'url': js_url,
                            'status': 'ERROR',
                            'error': f"HTTP {js_response.status_code}"
                        })
                        
                except Exception as e:
                    bundle_results.append({
                        'url': js_url,
                        'status': 'ERROR',
                        'error': str(e)
                    })
            
            return {
                'test': 'JavaScript Bundles',
                'status': 'PASS' if all(r.get('status') == 'PASS' for r in bundle_results) else 'FAIL',
                'bundles': bundle_results
            }
            
        except Exception as e:
            return {
                'test': 'JavaScript Bundles',
                'status': 'ERROR',
                'error': str(e)
            }
    
    def test_api_endpoints(self) -> Dict:
        """Test backend API endpoints"""
        print("\n🔌 Testing Backend API Endpoints")
        
        endpoints = [
            ("Health", f"{self.api_url}/api/health"),
            ("Dashboard", f"{self.api_url}/api/dashboard"),
            ("Hazards", f"{self.api_url}/api/hazards"),
            ("Routes", f"{self.api_url}/api/routes")
        ]
        
        results = []
        for name, url in endpoints:
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    results.append(f"✅ {name}: OK ({len(str(data))} chars)")
                else:
                    results.append(f"❌ {name}: HTTP {response.status_code}")
            except Exception as e:
                results.append(f"❌ {name}: {str(e)}")
        
        return {
            'test': 'API Endpoints',
            'status': 'PASS' if all('✅' in r for r in results) else 'FAIL',
            'results': results
        }
    
    def test_page_rendering(self) -> Dict:
        """Test basic page rendering"""
        print("\n📄 Testing Page Rendering")
        
        pages = [
            ("Home Page", f"{self.base_url}/"),
            ("Command View", f"{self.base_url}/command"),
            ("Field View", f"{self.base_url}/field"),
            ("Public View", f"{self.base_url}/public")
        ]
        
        page_results = []
        for page_name, url in pages:
            try:
                response = requests.get(url, timeout=15)
                
                if response.status_code == 200:
                    content = response.text
                    
                    # Basic checks
                    checks = []
                    
                    if '<title>' in content:
                        checks.append("✅ Title tag found")
                    else:
                        checks.append("❌ Title tag missing")
                    
                    if 'id="root"' in content:
                        checks.append("✅ React root div found")
                    else:
                        checks.append("❌ React root div missing")
                    
                    if 'script' in content:
                        checks.append("✅ Script tags found")
                    else:
                        checks.append("❌ Script tags missing")
                    
                    if 'stylesheet' in content or 'css' in content:
                        checks.append("✅ Stylesheets found")
                    else:
                        checks.append("❌ Stylesheets missing")
                    
                    # Page-specific checks
                    if page_name == "Command View" and ('command' in content.lower() or 'emergency' in content.lower()):
                        checks.append("✅ Command view content found")
                    elif page_name == "Field View" and ('field' in content.lower() or 'tactical' in content.lower()):
                        checks.append("✅ Field view content found")
                    elif page_name == "Public View" and ('public' in content.lower() or 'safety' in content.lower()):
                        checks.append("✅ Public view content found")
                    
                    page_results.append({
                        'page': page_name,
                        'status': 'PASS' if all('✅' in check for check in checks) else 'FAIL',
                        'response_time_ms': round(response.elapsed.total_seconds() * 1000, 2),
                        'content_length': len(content),
                        'checks': checks
                    })
                    
                else:
                    page_results.append({
                        'page': page_name,
                        'status': 'ERROR',
                        'error': f"HTTP {response.status_code}"
                    })
                    
            except Exception as e:
                page_results.append({
                    'page': page_name,
                    'status': 'ERROR',
                    'error': str(e)
                })
        
        return {
            'test': 'Page Rendering',
            'results': page_results
        }
    
    def run_comprehensive_test(self) -> Dict:
        """Run comprehensive container smoke test"""
        print("🚀 Disaster Response Dashboard - Container Smoke Test")
        print("=" * 70)
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run all tests
        service_health = self.test_service_health()
        tile_system = self.test_tile_system()
        frontend_integration = self.test_frontend_tile_integration()
        javascript_bundles = self.test_javascript_bundles()
        api_endpoints = self.test_api_endpoints()
        page_rendering = self.test_page_rendering()
        
        # Calculate summary
        all_results = [
            service_health,
            tile_system,
            frontend_integration,
            javascript_bundles,
            api_endpoints,
            page_rendering
        ]
        
        # Count successes and failures
        total_tests = len(all_results)
        passed_tests = len([r for r in all_results if r.get('status') == 'PASS'])
        
        # Count page results
        total_pages = len(page_rendering['results'])
        passed_pages = len([r for r in page_rendering['results'] if r['status'] == 'PASS'])
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'test_success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            'total_pages': total_pages,
            'passed_pages': passed_pages,
            'page_success_rate': (passed_pages / total_pages * 100) if total_pages > 0 else 0,
            'service_health': service_health,
            'tile_system': tile_system,
            'frontend_integration': frontend_integration,
            'javascript_bundles': javascript_bundles,
            'api_endpoints': api_endpoints,
            'page_rendering': page_rendering
        }
        
        return summary
    
    def print_summary(self, summary: Dict):
        """Print comprehensive test summary"""
        print("\n" + "=" * 70)
        print("📊 CONTAINER SMOKE TEST SUMMARY")
        print("=" * 70)
        
        print(f"Test Time: {summary['timestamp']}")
        print(f"Overall Test Success Rate: {summary['test_success_rate']:.1f}%")
        print(f"Page Rendering Success Rate: {summary['page_success_rate']:.1f}%")
        print()
        
        # Service Health
        print("🏥 SERVICE HEALTH:")
        for result in summary['service_health']['results']:
            print(f"   {result}")
        
        # Tile System
        print("\n🗺️ TILE SYSTEM:")
        print("   Tile Endpoints:")
        for result in summary['tile_system']['tile_endpoints']:
            print(f"     {result}")
        print("   Tile Serving:")
        for result in summary['tile_system']['tile_serving']:
            print(f"     {result}")
        
        # Frontend Integration
        print("\n🌐 FRONTEND TILE INTEGRATION:")
        for result in summary['frontend_integration']['results']:
            status_icon = "✅" if result['status'] == 'PASS' else "❌"
            print(f"   {status_icon} {result['page']}: {result['status']}")
            if 'checks' in result:
                for check in result['checks']:
                    print(f"     {check}")
        
        # JavaScript Bundles
        print("\n📦 JAVASCRIPT BUNDLES:")
        if 'bundles' in summary['javascript_bundles']:
            for bundle in summary['javascript_bundles']['bundles']:
                status_icon = "✅" if bundle['status'] == 'PASS' else "❌"
                print(f"   {status_icon} Bundle: {bundle['status']}")
                if 'checks' in bundle:
                    for check in bundle['checks']:
                        print(f"     {check}")
                if 'size_bytes' in bundle:
                    print(f"     Size: {bundle['size_bytes']:,} bytes")
        else:
            status_icon = "✅" if summary['javascript_bundles']['status'] == 'PASS' else "❌"
            print(f"   {status_icon} {summary['javascript_bundles']['status']}")
            if 'error' in summary['javascript_bundles']:
                print(f"     Error: {summary['javascript_bundles']['error']}")
        
        # API Endpoints
        print("\n🔌 API ENDPOINTS:")
        for result in summary['api_endpoints']['results']:
            print(f"   {result}")
        
        # Page Rendering
        print("\n📄 PAGE RENDERING:")
        for result in summary['page_rendering']['results']:
            status_icon = "✅" if result['status'] == 'PASS' else "❌"
            print(f"   {status_icon} {result['page']}: {result['status']}")
            if result['status'] == 'PASS':
                print(f"     Response Time: {result['response_time_ms']}ms")
                print(f"     Content Length: {result['content_length']} bytes")
                for check in result['checks']:
                    print(f"     {check}")
            elif 'error' in result:
                print(f"     Error: {result['error']}")
        
        # Overall assessment
        print("\n" + "=" * 70)
        if summary['test_success_rate'] == 100 and summary['page_success_rate'] == 100:
            print("🎉 EXCELLENT: All systems operational!")
            print("✅ Tile system fully integrated and functional")
            print("✅ Frontend rendering correctly with maps")
            print("✅ All services healthy and responding")
        elif summary['test_success_rate'] >= 80:
            print("🟡 GOOD: Most systems operational")
            print("⚠️  Some minor issues detected")
        else:
            print("🔴 POOR: Multiple system issues detected")
            print("❌ Critical failures in tile system or frontend")

def main():
    """Run the container smoke test"""
    smoke_test = ContainerSmokeTest()
    
    try:
        summary = smoke_test.run_comprehensive_test()
        smoke_test.print_summary(summary)
        
        # Save results
        with open("container_smoke_test_results.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Results saved to container_smoke_test_results.json")
        
        # Return exit code
        if summary['test_success_rate'] == 100 and summary['page_success_rate'] == 100:
            print("\n🎉 Container smoke test PASSED - All systems operational!")
            return 0
        else:
            print(f"\n⚠️  Container smoke test FAILED - {100 - summary['test_success_rate']:.1f}% test failure rate")
            return 1
            
    except Exception as e:
        print(f"\n❌ Container smoke test ERROR: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())
