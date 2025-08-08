#!/usr/bin/env python3
"""
Smoke Test for Disaster Response Dashboard
Verifies UI rendering and component functionality
"""

import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime
from typing import Dict, List, Tuple

class SmokeTest:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.results = []
        
    def test_page_rendering(self, url: str, page_name: str) -> Dict:
        """Test if a page renders correctly with expected content"""
        print(f"🔍 Testing {page_name} at {url}")
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                return {
                    'page': page_name,
                    'url': url,
                    'status': 'FAIL',
                    'error': f"HTTP {response.status_code}",
                    'details': []
                }
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Basic page structure checks
            checks = []
            
            # Check for title
            title = soup.find('title')
            if title:
                checks.append(f"✅ Title found: {title.text.strip()}")
            else:
                checks.append("❌ No title found")
            
            # Check for main content
            main_content = soup.find('main') or soup.find('div', {'id': 'root'})
            if main_content:
                checks.append("✅ Main content container found")
            else:
                checks.append("❌ No main content container found")
            
            # Check for React app mounting
            root_div = soup.find('div', {'id': 'root'})
            if root_div:
                checks.append("✅ React root div found")
            else:
                checks.append("❌ React root div not found")
            
            # Check for JavaScript errors (basic)
            scripts = soup.find_all('script')
            if scripts:
                checks.append(f"✅ {len(scripts)} script tags found")
            else:
                checks.append("❌ No script tags found")
            
            # Check for CSS
            stylesheets = soup.find_all('link', rel='stylesheet')
            if stylesheets:
                checks.append(f"✅ {len(stylesheets)} stylesheets found")
            else:
                checks.append("❌ No stylesheets found")
            
            # Page-specific checks
            page_checks = self.get_page_specific_checks(page_name, soup)
            checks.extend(page_checks)
            
            # Check for common UI elements
            ui_checks = self.check_ui_elements(soup)
            checks.extend(ui_checks)
            
            # Determine overall status
            failed_checks = [c for c in checks if c.startswith("❌")]
            status = "PASS" if len(failed_checks) == 0 else "FAIL"
            
            return {
                'page': page_name,
                'url': url,
                'status': status,
                'response_time_ms': round(response.elapsed.total_seconds() * 1000, 2),
                'content_length': len(response.content),
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
    
    def get_page_specific_checks(self, page_name: str, soup: BeautifulSoup) -> List[str]:
        """Get page-specific content checks"""
        checks = []
        
        if page_name == "Home Page":
            # Check for navigation links
            nav_links = soup.find_all('a', href=True)
            field_link = any('/field' in link.get('href') for link in nav_links)
            command_link = any('/command' in link.get('href') for link in nav_links)
            
            if field_link:
                checks.append("✅ Field Operations link found")
            else:
                checks.append("❌ Field Operations link not found")
                
            if command_link:
                checks.append("✅ Command Center link found")
            else:
                checks.append("❌ Command Center link not found")
            
            # Check for main heading
            headings = soup.find_all(['h1', 'h2', 'h3'])
            if headings:
                checks.append(f"✅ {len(headings)} headings found")
            else:
                checks.append("❌ No headings found")
        
        elif page_name == "Field View":
            # Check for field-specific components
            if soup.find(string=re.compile('Tactical Map', re.I)):
                checks.append("✅ Tactical Map component found")
            else:
                checks.append("❌ Tactical Map component not found")
            
            if soup.find(string=re.compile('Navigation', re.I)):
                checks.append("✅ Navigation component found")
            else:
                checks.append("❌ Navigation component not found")
            
            if soup.find(string=re.compile('Quick Actions', re.I)):
                checks.append("✅ Quick Actions component found")
            else:
                checks.append("❌ Quick Actions component not found")
            
            # Check for tab navigation
            tabs = soup.find_all(string=re.compile('Map|Navigation|Actions|Resources|Alerts|Voice', re.I))
            if len(tabs) >= 3:
                checks.append(f"✅ {len(tabs)} tab components found")
            else:
                checks.append("❌ Tab navigation not found")
        
        elif page_name == "Command View":
            # Check for command-specific components
            if soup.find(string=re.compile('Metrics', re.I)):
                checks.append("✅ Metrics Grid component found")
            else:
                checks.append("❌ Metrics Grid component not found")
            
            if soup.find(string=re.compile('Tactical Map', re.I)):
                checks.append("✅ Command Tactical Map component found")
            else:
                checks.append("❌ Command Tactical Map component not found")
            
            if soup.find(string=re.compile('Resource', re.I)):
                checks.append("✅ Resource Table component found")
            else:
                checks.append("❌ Resource Table component not found")
            
            # Check for tab navigation
            tabs = soup.find_all(string=re.compile('Overview|Tactical Map|Resources|Communications|Timeline|AI Predictions', re.I))
            if len(tabs) >= 3:
                checks.append(f"✅ {len(tabs)} command tab components found")
            else:
                checks.append("❌ Command tab navigation not found")
        
        return checks
    
    def check_ui_elements(self, soup: BeautifulSoup) -> List[str]:
        """Check for common UI elements"""
        checks = []
        
        # Check for buttons
        buttons = soup.find_all('button')
        if buttons:
            checks.append(f"✅ {len(buttons)} buttons found")
        else:
            checks.append("❌ No buttons found")
        
        # Check for forms
        forms = soup.find_all('form')
        if forms:
            checks.append(f"✅ {len(forms)} forms found")
        
        # Check for input fields
        inputs = soup.find_all('input')
        if inputs:
            checks.append(f"✅ {len(inputs)} input fields found")
        
        # Check for icons (common icon classes)
        icon_elements = soup.find_all(class_=re.compile('icon|Icon', re.I))
        if icon_elements:
            checks.append(f"✅ {len(icon_elements)} icon elements found")
        
        # Check for cards or panels
        cards = soup.find_all(class_=re.compile('card|panel|Card|Panel', re.I))
        if cards:
            checks.append(f"✅ {len(cards)} card/panel elements found")
        
        return checks
    
    def test_api_endpoints(self) -> Dict:
        """Test backend API endpoints"""
        print("\n🔍 Testing Backend API Endpoints")
        
        api_url = "http://localhost:5001"
        endpoints = [
            ("Health", f"{api_url}/api/health"),
            ("Dashboard", f"{api_url}/api/dashboard"),
            ("Hazards", f"{api_url}/api/hazards"),
            ("Routes", f"{api_url}/api/routes")
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
    
    def run_comprehensive_test(self) -> Dict:
        """Run comprehensive smoke test"""
        print("🚀 Disaster Response Dashboard - Smoke Test")
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
            result = self.test_page_rendering(url, page_name)
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
        
        # Test API endpoints
        api_result = self.test_api_endpoints()
        
        # Calculate summary
        total_pages = len(page_results)
        passed_pages = len([r for r in page_results if r['status'] == 'PASS'])
        failed_pages = len([r for r in page_results if r['status'] == 'FAIL'])
        error_pages = len([r for r in page_results if r['status'] == 'ERROR'])
        
        total_checks = sum(r.get('total_checks', 0) for r in page_results)
        passed_checks = sum(r.get('total_checks', 0) - r.get('failed_checks', 0) for r in page_results)
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'total_pages': total_pages,
            'passed_pages': passed_pages,
            'failed_pages': failed_pages,
            'error_pages': error_pages,
            'total_checks': total_checks,
            'passed_checks': passed_checks,
            'success_rate': (passed_pages / total_pages * 100) if total_pages > 0 else 0,
            'check_success_rate': (passed_checks / total_checks * 100) if total_checks > 0 else 0,
            'page_results': page_results,
            'api_result': api_result
        }
        
        return summary
    
    def print_summary(self, summary: Dict):
        """Print comprehensive test summary"""
        print("=" * 60)
        print("📊 SMOKE TEST SUMMARY")
        print("=" * 60)
        
        print(f"Test Time: {summary['timestamp']}")
        print(f"Pages Tested: {summary['total_pages']}")
        print(f"Pages Passed: {summary['passed_pages']}")
        print(f"Pages Failed: {summary['failed_pages']}")
        print(f"Pages with Errors: {summary['error_pages']}")
        print(f"Page Success Rate: {summary['success_rate']:.1f}%")
        print()
        
        print(f"Total Checks: {summary['total_checks']}")
        print(f"Checks Passed: {summary['passed_checks']}")
        print(f"Check Success Rate: {summary['check_success_rate']:.1f}%")
        print()
        
        # API Status
        api_status = "✅ PASS" if summary['api_result']['status'] == 'PASS' else "❌ FAIL"
        print(f"API Endpoints: {api_status}")
        
        # Overall assessment
        if summary['success_rate'] == 100 and summary['check_success_rate'] >= 90:
            print("\n🎉 EXCELLENT: All pages rendering correctly!")
        elif summary['success_rate'] >= 80:
            print("\n🟡 GOOD: Most pages rendering correctly")
        else:
            print("\n🔴 POOR: Multiple rendering issues detected")
        
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
        
        # API Results
        print(f"\n🔌 API Endpoints:")
        for result in summary['api_result']['results']:
            print(f"   {result}")

def main():
    """Run the smoke test"""
    smoke_test = SmokeTest()
    summary = smoke_test.run_comprehensive_test()
    smoke_test.print_summary(summary)
    
    # Save results
    with open("smoke_test_results.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n💾 Results saved to smoke_test_results.json")
    
    # Return exit code
    if summary['success_rate'] == 100:
        print("\n🎉 Smoke test PASSED - UI rendering correctly!")
        return 0
    else:
        print(f"\n⚠️  Smoke test FAILED - {summary['failed_pages']} pages have issues")
        return 1

if __name__ == "__main__":
    exit(main())
