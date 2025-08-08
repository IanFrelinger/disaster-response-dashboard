#!/usr/bin/env python3
"""
Tile Integration Validation for Disaster Response Dashboard
Validates that the correct tiles are being displayed and integrated properly
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List

class TileIntegrationValidator:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.tile_server_url = "http://localhost:8080"
        self.api_url = "http://localhost:5001"
        
    def validate_tile_server(self) -> Dict:
        """Validate tile server is serving correct tiles"""
        print("🗺️ Validating Tile Server")
        
        # Test all tile layers
        layers = [
            ("Admin Boundaries", "/data/admin_boundaries.json"),
            ("California Counties", "/data/california_counties.json"),
            ("Hazards", "/data/hazards.json"),
            ("Routes", "/data/routes.json")
        ]
        
        results = []
        for layer_name, endpoint in layers:
            try:
                url = f"{self.tile_server_url}{endpoint}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate tile metadata
                    checks = []
                    
                    if 'tiles' in data:
                        tile_count = len(data['tiles'])
                        checks.append(f"✅ {tile_count} tiles available")
                        
                        # Check tile URLs
                        if any('admin_boundaries' in tile for tile in data['tiles']):
                            checks.append("✅ Admin boundaries tiles found")
                        if any('california_counties' in tile for tile in data['tiles']):
                            checks.append("✅ California counties tiles found")
                        if any('hazards' in tile for tile in data['tiles']):
                            checks.append("✅ Hazards tiles found")
                        if any('routes' in tile for tile in data['tiles']):
                            checks.append("✅ Routes tiles found")
                    else:
                        checks.append("❌ No tiles found in response")
                    
                    # Check bounds and zoom levels
                    if 'bounds' in data:
                        checks.append("✅ Bounds defined")
                    if 'minzoom' in data:
                        checks.append(f"✅ Min zoom: {data['minzoom']}")
                    if 'maxzoom' in data:
                        checks.append(f"✅ Max zoom: {data['maxzoom']}")
                    
                    results.append({
                        'layer': layer_name,
                        'status': 'PASS' if all('✅' in check for check in checks) else 'FAIL',
                        'checks': checks
                    })
                    
                else:
                    results.append({
                        'layer': layer_name,
                        'status': 'ERROR',
                        'error': f"HTTP {response.status_code}"
                    })
                    
            except Exception as e:
                results.append({
                    'layer': layer_name,
                    'status': 'ERROR',
                    'error': str(e)
                })
        
        return {
            'test': 'Tile Server Validation',
            'results': results
        }
    
    def validate_tile_serving(self) -> Dict:
        """Validate actual tile serving"""
        print("\n🔍 Validating Tile Serving")
        
        # Test specific tile coordinates that should exist
        test_tiles = [
            ("Admin Boundaries", "/data/admin_boundaries/8/40/98.pbf"),
            ("California Counties", "/data/california_counties/8/40/98.pbf"),
            ("Hazards", "/data/hazards/8/40/98.pbf"),
            ("Routes", "/data/routes/8/40/98.pbf")
        ]
        
        results = []
        for layer_name, tile_path in test_tiles:
            try:
                url = f"{self.tile_server_url}{tile_path}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    content_length = len(response.content)
                    results.append({
                        'layer': layer_name,
                        'status': 'PASS',
                        'tile_size': content_length,
                        'message': f"Tile served successfully ({content_length} bytes)"
                    })
                elif response.status_code == 204:
                    results.append({
                        'layer': layer_name,
                        'status': 'WARNING',
                        'message': "No content (204) - tile may not exist at this coordinate"
                    })
                else:
                    results.append({
                        'layer': layer_name,
                        'status': 'ERROR',
                        'error': f"HTTP {response.status_code}"
                    })
                    
            except Exception as e:
                results.append({
                    'layer': layer_name,
                    'status': 'ERROR',
                    'error': str(e)
                })
        
        return {
            'test': 'Tile Serving Validation',
            'results': results
        }
    
    def validate_frontend_integration(self) -> Dict:
        """Validate frontend integration with tile system"""
        print("\n🌐 Validating Frontend Integration")
        
        # Test that frontend can access tile server
        try:
            # Check if frontend can reach tile server through the network
            tile_test_url = f"{self.tile_server_url}/data/admin_boundaries.json"
            response = requests.get(tile_test_url, timeout=10)
            
            if response.status_code == 200:
                frontend_check = "✅ Frontend can access tile server"
            else:
                frontend_check = f"❌ Frontend cannot access tile server: HTTP {response.status_code}"
                
        except Exception as e:
            frontend_check = f"❌ Frontend cannot access tile server: {str(e)}"
        
        # Check JavaScript bundles for tile integration
        try:
            main_response = requests.get(f"{self.base_url}/", timeout=10)
            if main_response.status_code == 200:
                content = main_response.text
                
                # Find JavaScript bundle
                import re
                js_pattern = r'src="([^"]*index-[^"]*\.js)"'
                js_matches = re.findall(js_pattern, content)
                
                if js_matches:
                    js_url = js_matches[0]
                    if not js_url.startswith('http'):
                        js_url = f"{self.base_url}{js_url}"
                    
                    js_response = requests.get(js_url, timeout=15)
                    if js_response.status_code == 200:
                        js_content = js_response.text
                        
                        integration_checks = []
                        
                        # Check for tile service integration
                        if 'tileservice' in js_content.lower() or 'tile_service' in js_content.lower():
                            integration_checks.append("✅ Tile service found in bundle")
                        else:
                            integration_checks.append("❌ Tile service not found in bundle")
                        
                        # Check for mapbox integration
                        if 'mapbox' in js_content.lower():
                            integration_checks.append("✅ Mapbox integration found")
                        else:
                            integration_checks.append("❌ Mapbox integration not found")
                        
                        # Check for map components
                        if 'map' in js_content.lower() and 'component' in js_content.lower():
                            integration_checks.append("✅ Map components found")
                        else:
                            integration_checks.append("❌ Map components not found")
                        
                        # Check for tile server URL configuration
                        if 'localhost:8080' in js_content or 'tileserver' in js_content.lower():
                            integration_checks.append("✅ Tile server configuration found")
                        else:
                            integration_checks.append("❌ Tile server configuration not found")
                        
                        return {
                            'test': 'Frontend Integration',
                            'status': 'PASS' if all('✅' in check for check in integration_checks) else 'FAIL',
                            'checks': [frontend_check] + integration_checks
                        }
                    else:
                        return {
                            'test': 'Frontend Integration',
                            'status': 'ERROR',
                            'error': f"Could not access JavaScript bundle: HTTP {js_response.status_code}"
                        }
                else:
                    return {
                        'test': 'Frontend Integration',
                        'status': 'ERROR',
                        'error': 'No JavaScript bundle found'
                    }
            else:
                return {
                    'test': 'Frontend Integration',
                    'status': 'ERROR',
                    'error': f"Could not access frontend: HTTP {main_response.status_code}"
                }
                
        except Exception as e:
            return {
                'test': 'Frontend Integration',
                'status': 'ERROR',
                'error': str(e)
            }
    
    def validate_api_integration(self) -> Dict:
        """Validate API integration"""
        print("\n🔌 Validating API Integration")
        
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
                    results.append({
                        'endpoint': name,
                        'status': 'PASS',
                        'response_size': len(str(data)),
                        'message': f"API responding correctly ({len(str(data))} chars)"
                    })
                else:
                    results.append({
                        'endpoint': name,
                        'status': 'ERROR',
                        'error': f"HTTP {response.status_code}"
                    })
            except Exception as e:
                results.append({
                    'endpoint': name,
                    'status': 'ERROR',
                    'error': str(e)
                })
        
        return {
            'test': 'API Integration',
            'results': results
        }
    
    def run_validation(self) -> Dict:
        """Run complete tile integration validation"""
        print("🚀 Disaster Response Dashboard - Tile Integration Validation")
        print("=" * 70)
        print(f"Validation started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run all validations
        tile_server = self.validate_tile_server()
        tile_serving = self.validate_tile_serving()
        frontend_integration = self.validate_frontend_integration()
        api_integration = self.validate_api_integration()
        
        # Calculate summary
        all_tests = [tile_server, tile_serving, frontend_integration, api_integration]
        
        # Count results
        total_checks = 0
        passed_checks = 0
        
        for test in all_tests:
            if 'results' in test:
                for result in test['results']:
                    total_checks += 1
                    if result['status'] == 'PASS':
                        passed_checks += 1
            else:
                total_checks += 1
                if test['status'] == 'PASS':
                    passed_checks += 1
        
        success_rate = (passed_checks / total_checks * 100) if total_checks > 0 else 0
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'total_checks': total_checks,
            'passed_checks': passed_checks,
            'success_rate': success_rate,
            'tile_server': tile_server,
            'tile_serving': tile_serving,
            'frontend_integration': frontend_integration,
            'api_integration': api_integration
        }
        
        return summary
    
    def print_summary(self, summary: Dict):
        """Print validation summary"""
        print("\n" + "=" * 70)
        print("📊 TILE INTEGRATION VALIDATION SUMMARY")
        print("=" * 70)
        
        print(f"Validation Time: {summary['timestamp']}")
        print(f"Total Checks: {summary['total_checks']}")
        print(f"Passed Checks: {summary['passed_checks']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print()
        
        # Tile Server
        print("🗺️ TILE SERVER:")
        for result in summary['tile_server']['results']:
            status_icon = "✅" if result['status'] == 'PASS' else "❌"
            print(f"   {status_icon} {result['layer']}: {result['status']}")
            if 'checks' in result:
                for check in result['checks']:
                    print(f"     {check}")
            elif 'error' in result:
                print(f"     Error: {result['error']}")
        
        # Tile Serving
        print("\n🔍 TILE SERVING:")
        for result in summary['tile_serving']['results']:
            status_icon = "✅" if result['status'] == 'PASS' else "❌"
            print(f"   {status_icon} {result['layer']}: {result['status']}")
            if 'message' in result:
                print(f"     {result['message']}")
            elif 'error' in result:
                print(f"     Error: {result['error']}")
        
        # Frontend Integration
        print("\n🌐 FRONTEND INTEGRATION:")
        status_icon = "✅" if summary['frontend_integration']['status'] == 'PASS' else "❌"
        print(f"   {status_icon} {summary['frontend_integration']['status']}")
        if 'checks' in summary['frontend_integration']:
            for check in summary['frontend_integration']['checks']:
                print(f"     {check}")
        elif 'error' in summary['frontend_integration']:
            print(f"     Error: {summary['frontend_integration']['error']}")
        
        # API Integration
        print("\n🔌 API INTEGRATION:")
        for result in summary['api_integration']['results']:
            status_icon = "✅" if result['status'] == 'PASS' else "❌"
            print(f"   {status_icon} {result['endpoint']}: {result['status']}")
            if 'message' in result:
                print(f"     {result['message']}")
            elif 'error' in result:
                print(f"     Error: {result['error']}")
        
        # Overall assessment
        print("\n" + "=" * 70)
        if summary['success_rate'] == 100:
            print("🎉 EXCELLENT: Tile integration fully operational!")
            print("✅ All tile layers available and serving correctly")
            print("✅ Frontend properly integrated with tile system")
            print("✅ API endpoints responding correctly")
        elif summary['success_rate'] >= 80:
            print("🟡 GOOD: Tile integration mostly operational")
            print("⚠️  Some minor issues detected")
        else:
            print("🔴 POOR: Critical tile integration issues detected")
            print("❌ Multiple failures in tile system or integration")

def main():
    """Run the tile integration validation"""
    validator = TileIntegrationValidator()
    
    try:
        summary = validator.run_validation()
        validator.print_summary(summary)
        
        # Save results
        with open("tile_integration_validation.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Results saved to tile_integration_validation.json")
        
        # Return exit code
        if summary['success_rate'] == 100:
            print("\n🎉 Tile integration validation PASSED - All systems operational!")
            return 0
        else:
            print(f"\n⚠️  Tile integration validation FAILED - {100 - summary['success_rate']:.1f}% failure rate")
            return 1
            
    except Exception as e:
        print(f"\n❌ Tile integration validation ERROR: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())
