#!/usr/bin/env python3
"""
SPA Smoke Test for Disaster Response Dashboard
Verifies basic structure and API connectivity for React SPA
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
from typing import Dict, List

class SPASmokeTest:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.api_url = "http://localhost:5001"
        
    def test_spa_structure(self, url: str, page_name: str) -> Dict:
        """Test SPA basic structure and assets"""
        print(f"🔍 Testing {page_name} at {url}")
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                return {
                    'page': page_name,
                    'url': url,
                    'status': 'FAIL',
                    'error': f"HTTP {response.status_code}",
                    'checks': []
                }
            
            soup = BeautifulSoup(response.content, 'html.parser')
            checks = []
            
            # Basic HTML structure
            if soup.find('html'):
                checks.append("✅ HTML structure found")
            else:
                checks.append("❌ No HTML structure")
            
            # Check for title
            title = soup.find('title')
            if title:
                checks.append(f"✅ Title found: {title.text.strip()}")
            else:
                checks.append("❌ No title found")
            
            # Check for React root div
            root_div = soup.find('div', {'id': 'root'})
            if root_div:
                checks.append("✅ React root div found")
            else:
                checks.append("❌ React root div not found")
            
            # Check for JavaScript bundles
            scripts = soup.find_all('script', {'type': 'module'})
            if scripts:
                checks.append(f"✅ {len(scripts)} JavaScript modules found")
                for script in scripts:
                    if script.get('src'):
                        checks.append(f"✅ Script: {script['src']}")
            else:
                checks.append("❌ No JavaScript modules found")
            
            # Check for CSS
            stylesheets = soup.find_all('link', rel='stylesheet')
            if stylesheets:
                checks.append(f"✅ {len(stylesheets)} stylesheets found")
                for css in stylesheets:
                    if css.get('href'):
                        checks.append(f"✅ CSS: {css['href']}")
            else:
                checks.append("❌ No stylesheets found")
            
            # Check for viewport meta tag
            viewport = soup.find('meta', {'name': 'viewport'})
            if viewport:
                checks.append("✅ Viewport meta tag found")
            else:
                checks.append("❌ No viewport meta tag")
            
            # Check for charset
            charset = soup.find('meta', {'charset': True})
            if charset:
                checks.append("✅ Charset meta tag found")
            else:
                checks.append("❌ No charset meta tag")
            
            # Check content length
            content_length = len(response.content)
            if content_length > 1000:
                checks.append(f"✅ Content length: {content_length} bytes")
            else:
                checks.append(f"❌ Content too short: {content_length} bytes")
            
            # Determine status
            failed_checks = [c for c in checks if c.startswith("❌")]
            status = "PASS" if len(failed_checks) <= 1 else "FAIL"  # Allow 1 minor failure
            
            return {
                'page': page_name,
                'url': url,
                'status': status,
                'response_time_ms': round(response.elapsed.total_seconds() * 1000, 2),
                'content_length': content_length,
                'checks': checks,
                'failed_checks': len(failed_checks),
                'total_checks': len(checks)
            }
            
        except Exception as e:
            return {
                'page': page_name,
                'url': url,
                'status': 'ERROR',
                'error': str(e),
                'checks': []
            }
    
    def test_asset_loading(self) -> Dict:
        """Test if key assets can be loaded"""
        print("\n🔍 Testing Asset Loading")
        
        try:
            # Test main JavaScript bundle
            js_response = requests.get(f"{self.base_url}/assets/index-CpPyvOXr.js", timeout=10)
            js_status = "✅" if js_response.status_code == 200 else "❌"
            
            # Test main CSS bundle
            css_response = requests.get(f"{self.base_url}/assets/index-BBBoo69h.css", timeout=10)
            css_status = "✅" if css_response.status_code == 200 else "❌"
            
            # Test vendor bundle
            vendor_response = requests.get(f"{self.base_url}/assets/vendor-CDaM45aE.js", timeout=10)
            vendor_status = "✅" if vendor_response.status_code == 200 else "❌"
            
            checks = [
                f"{js_status} Main JS bundle: {js_response.status_code} ({len(js_response.content)} bytes)",
                f"{css_status} Main CSS bundle: {css_response.status_code} ({len(css_response.content)} bytes)",
                f"{vendor_status} Vendor bundle: {vendor_response.status_code} ({len(vendor_response.content)} bytes)"
            ]
            
            failed_checks = [c for c in checks if c.startswith("❌")]
            status = "PASS" if len(failed_checks) == 0 else "FAIL"
            
            return {
                'test': 'Asset Loading',
                'status': status,
                'checks': checks,
                'failed_checks': len(failed_checks)
            }
            
        except Exception as e:
            return {
                'test': 'Asset Loading',
                'status': 'ERROR',
                'error': str(e),
                'checks': []
            }
    
    def test_api_endpoints(self) -> Dict:
        """Test backend API endpoints"""
        print("\n🔍 Testing Backend API Endpoints")
        
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
        
        failed_checks = [r for r in results if r.startswith("❌")]
        status = "PASS" if len(failed_checks) == 0 else "FAIL"
        
        return {
            'test': 'API Endpoints',
            'status': status,
            'results': results,
            'failed_checks': len(failed_checks)
        }
    
    def test_routing(self) -> Dict:
        """Test that all routes return the SPA shell"""
        print("\n🔍 Testing SPA Routing")
        
        routes = [
            ("Home", "/"),
            ("Field View", "/field"),
            ("Command View", "/command"),
            ("Non-existent", "/nonexistent")
        ]
        
        results = []
        for name, route in routes:
            try:
                response = requests.get(f"{self.base_url}{route}", timeout=10)
                if response.status_code == 200:
                    # Check if it's the SPA shell (should have React root div)
                    soup = BeautifulSoup(response.content, 'html.parser')
                    root_div = soup.find('div', {'id': 'root'})
                    if root_div:
                        results.append(f"✅ {name}: SPA shell returned")
                    else:
                        results.append(f"❌ {name}: No React root div")
                else:
                    results.append(f"❌ {name}: HTTP {response.status_code}")
            except Exception as e:
                results.append(f"❌ {name}: {str(e)}")
        
        failed_checks = [r for r in results if r.startswith("❌")]
        status = "PASS" if len(failed_checks) == 0 else "FAIL"
        
        return {
            'test': 'SPA Routing',
            'status': status,
            'results': results,
            'failed_checks': len(failed_checks)
        }
    
    def run_comprehensive_test(self) -> Dict:
        """Run comprehensive SPA smoke test"""
        print("🚀 Disaster Response Dashboard - SPA Smoke Test")
        print("=" * 60)
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Test all pages
        pages = [
            ("Home Page", f"{self.base_url}/"),
            ("Field View", f"{self.base_url}/field"),
            ("Command View", f"{self.base_url}/command")
        ]
        
        page_results = []
        for page_name, url in pages:
            result = self.test_spa_structure(url, page_name)
            page_results.append(result)
            
            # Print immediate results
            status_icon = "✅" if result['status'] == 'PASS' else "❌"
            print(f"{status_icon} {page_name}: {result['status']}")
            if result['status'] == 'PASS':
                print(f"   Response Time: {result['response_time_ms']}ms")
                print(f"   Content Length: {result['content_length']} bytes")
                print(f"   Checks: {result['total_checks'] - result['failed_checks']}/{result['total_checks']} passed")
            elif 'error' in result:
                print(f"   Error: {result['error']}")
            print()
        
        # Test additional components
        asset_result = self.test_asset_loading()
        api_result = self.test_api_endpoints()
        routing_result = self.test_routing()
        
        # Calculate summary
        total_pages = len(page_results)
        passed_pages = len([r for r in page_results if r['status'] == 'PASS'])
        failed_pages = len([r for r in page_results if r['status'] == 'FAIL'])
        error_pages = len([r for r in page_results if r['status'] == 'ERROR'])
        
        total_checks = sum(r.get('total_checks', 0) for r in page_results)
        passed_checks = sum(r.get('total_checks', 0) - r.get('failed_checks', 0) for r in page_results)
        
        # Additional test results
        additional_tests = [asset_result, api_result, routing_result]
        additional_passed = len([t for t in additional_tests if t['status'] == 'PASS'])
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'total_pages': total_pages,
            'passed_pages': passed_pages,
            'failed_pages': failed_pages,
            'error_pages': error_pages,
            'total_checks': total_checks,
            'passed_checks': passed_checks,
            'page_success_rate': (passed_pages / total_pages * 100) if total_pages > 0 else 0,
            'check_success_rate': (passed_checks / total_checks * 100) if total_checks > 0 else 0,
            'additional_tests_passed': additional_passed,
            'total_additional_tests': len(additional_tests),
            'page_results': page_results,
            'asset_result': asset_result,
            'api_result': api_result,
            'routing_result': routing_result
        }
        
        return summary
    
    def print_summary(self, summary: Dict):
        """Print comprehensive test summary"""
        print("=" * 60)
        print("📊 SPA SMOKE TEST SUMMARY")
        print("=" * 60)
        
        print(f"Test Time: {summary['timestamp']}")
        print(f"Pages Tested: {summary['total_pages']}")
        print(f"Pages Passed: {summary['passed_pages']}")
        print(f"Pages Failed: {summary['failed_pages']}")
        print(f"Pages with Errors: {summary['error_pages']}")
        print(f"Page Success Rate: {summary['page_success_rate']:.1f}%")
        print()
        
        print(f"Total Checks: {summary['total_checks']}")
        print(f"Checks Passed: {summary['passed_checks']}")
        print(f"Check Success Rate: {summary['check_success_rate']:.1f}%")
        print()
        
        print(f"Additional Tests: {summary['additional_tests_passed']}/{summary['total_additional_tests']} passed")
        print()
        
        # Overall assessment
        if (summary['page_success_rate'] >= 90 and 
            summary['check_success_rate'] >= 80 and 
            summary['additional_tests_passed'] == summary['total_additional_tests']):
            print("🎉 EXCELLENT: SPA structure and assets working correctly!")
        elif summary['page_success_rate'] >= 70:
            print("🟡 GOOD: Most components working correctly")
        else:
            print("🔴 POOR: Multiple structural issues detected")
        
        # Detailed results
        print("\n" + "=" * 60)
        print("📋 DETAILED RESULTS")
        print("=" * 60)
        
        for result in summary['page_results']:
            status_icon = "✅" if result['status'] == 'PASS' else "❌"
            print(f"\n{status_icon} {result['page']}")
            print(f"   URL: {result['url']}")
            print(f"   Status: {result['status']}")
            
            if result['status'] == 'PASS':
                print(f"   Response Time: {result['response_time_ms']}ms")
                print(f"   Content Length: {result['content_length']} bytes")
                
                # Show failed checks if any
                failed_checks = [c for c in result['checks'] if c.startswith("❌")]
                if failed_checks:
                    print("   Failed Checks:")
                    for check in failed_checks:
                        print(f"     {check}")
            
            elif 'error' in result:
                print(f"   Error: {result['error']}")
        
        # Additional test results
        print(f"\n🔧 Asset Loading:")
        for check in summary['asset_result']['checks']:
            print(f"   {check}")
        
        print(f"\n🔌 API Endpoints:")
        for result in summary['api_result']['results']:
            print(f"   {result}")
        
        print(f"\n🛣️  SPA Routing:")
        for result in summary['routing_result']['results']:
            print(f"   {result}")

def main():
    """Run the SPA smoke test"""
    smoke_test = SPASmokeTest()
    summary = smoke_test.run_comprehensive_test()
    smoke_test.print_summary(summary)
    
    # Save results
    with open("spa_smoke_test_results.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n💾 Results saved to spa_smoke_test_results.json")
    
    # Return exit code
    if (summary['page_success_rate'] >= 90 and 
        summary['additional_tests_passed'] == summary['total_additional_tests']):
        print("\n🎉 SPA smoke test PASSED - Structure and assets working correctly!")
        return 0
    else:
        print(f"\n⚠️  SPA smoke test FAILED - {summary['failed_pages']} pages have issues")
        return 1

if __name__ == "__main__":
    exit(main())
