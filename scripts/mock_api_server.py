#!/usr/bin/env python3
"""
Simple Mock API Server
Uses only Python standard library to serve mock disaster response data.
"""

import json
import time
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
from datetime import datetime, timedelta


class MockAPIHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the mock API server."""
    
    def do_GET(self):
        """Handle GET requests."""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        # Route requests
        if path == '/api/health':
            response = self.get_health()
        elif path == '/api/info':
            response = self.get_info()
        elif path == '/api/dashboard':
            response = self.get_dashboard()
        elif path == '/api/hazards':
            response = self.get_hazards(query_params)
        elif path == '/api/routes':
            response = self.get_routes(query_params)
        elif path == '/api/hazard-summary':
            response = self.get_hazard_summary()
        elif path == '/api/evacuation-routes':
            response = self.get_evacuation_routes(query_params)
        elif path == '/api/risk-assessment':
            response = self.get_risk_assessment(query_params)
        else:
            response = {
                'success': False,
                'error': f'Endpoint not found: {path}',
                'timestamp': time.time()
            }
        
        self.wfile.write(json.dumps(response, indent=2).encode())
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Override to suppress logging."""
        pass
    
    def get_health(self):
        """Health check endpoint."""
        return {
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        }
    
    def get_info(self):
        """API information endpoint."""
        return {
            'success': True,
            'name': 'Disaster Response Dashboard API',
            'version': '1.0.0',
            'description': 'Real-time disaster response data API',
            'endpoints': [
                '/api/health',
                '/api/dashboard',
                '/api/hazards',
                '/api/routes',
                '/api/risk-assessment'
            ]
        }
    
    def get_dashboard(self):
        """Dashboard data endpoint."""
        return {
            'success': True,
            'data': {
                'hazards': self.generate_hazards(5),
                'routes': self.generate_routes(3),
                'metrics': {
                    'totalAffectedPopulation': 25000,
                    'averageResponseTime': 12,
                    'evacuationCompliance': 85,
                    'activeHazards': 3,
                    'availableRoutes': 8
                },
                'alerts': [
                    {
                        'id': 'alert-1',
                        'type': 'evacuation',
                        'message': 'Evacuation order issued for Oakland Hills area',
                        'severity': 'high',
                        'timestamp': datetime.now().isoformat()
                    }
                ]
            },
            'timestamp': time.time()
        }
    
    def get_hazards(self, query_params):
        """Hazards endpoint."""
        count = int(query_params.get('count', [20])[0])
        hazards = self.generate_hazards(count)
        
        return {
            'success': True,
            'data': hazards,
            'count': len(hazards),
            'timestamp': time.time()
        }
    
    def get_routes(self, query_params):
        """Routes endpoint."""
        count = int(query_params.get('count', [12])[0])
        routes = self.generate_routes(count)
        
        return {
            'success': True,
            'data': routes,
            'count': len(routes),
            'timestamp': time.time()
        }
    
    def get_hazard_summary(self):
        """Hazard summary endpoint."""
        return {
            'success': True,
            'total_hazards': 3,
            'active_hazards': 2,
            'total_affected_population': 25000,
            'hazard_types': {
                'wildfire': 2,
                'flood': 1
            },
            'severity_distribution': {
                'high': 1,
                'medium': 1,
                'low': 1
            },
            'timestamp': time.time()
        }
    
    def get_evacuation_routes(self, query_params):
        """Evacuation routes endpoint."""
        routes = self.generate_routes(5)
        for route in routes:
            route['capacity'] = 1000
            route['current_usage'] = random.randint(100, 500)
            route['estimated_clearance_time'] = random.randint(30, 60)
        
        return {
            'success': True,
            'data': routes,
            'timestamp': time.time()
        }
    
    def get_risk_assessment(self, query_params):
        """Risk assessment endpoint."""
        lat = float(query_params.get('lat', [37.7749])[0])
        lng = float(query_params.get('lng', [-122.4194])[0])
        
        # Simple risk calculation based on coordinates
        risk_score = (lat + abs(lng)) / 200.0
        risk_level = 'low' if risk_score < 0.3 else 'medium' if risk_score < 0.7 else 'high'
        
        return {
            'success': True,
            'risk_level': risk_level,
            'risk_score': round(risk_score, 2),
            'affected_population': random.randint(1000, 10000),
            'nearest_hazard': {
                'id': 'hazard-1',
                'distance': random.randint(1000, 5000),
                'type': 'wildfire'
            },
            'recommendations': [
                'Monitor local emergency broadcasts',
                'Prepare evacuation plan',
                'Stay informed about weather conditions'
            ],
            'timestamp': time.time()
        }
    
    def generate_hazards(self, count):
        """Generate mock hazard data."""
        hazard_types = ['wildfire', 'flood', 'earthquake', 'tsunami']
        severities = ['low', 'medium', 'high', 'critical']
        names = [
            'Oakland Hills Fire', 'San Francisco Bay Flood', 'Hayward Fault Activity',
            'Coastal Tsunami Warning', 'Mountain Wildfire', 'Urban Flooding'
        ]
        
        hazards = []
        for i in range(count):
            hazard_type = random.choice(hazard_types)
            severity = random.choice(severities)
            name = random.choice(names)
            
            hazard = {
                'id': f'hazard-{i+1}',
                'type': hazard_type,
                'name': name,
                'severity': severity,
                'coordinates': [
                    -122.4 + random.uniform(-0.1, 0.1),
                    37.7 + random.uniform(-0.1, 0.1)
                ],
                'radius': random.randint(1000, 10000),
                'affected_population': random.randint(1000, 20000),
                'last_updated': datetime.now().isoformat(),
                'status': 'active' if random.random() > 0.3 else 'monitoring'
            }
            hazards.append(hazard)
        
        return hazards
    
    def generate_routes(self, count):
        """Generate mock route data."""
        route_names = [
            'Oakland Hills Evacuation Route', 'Bay Area Emergency Access',
            'Hayward Fault Bypass', 'Coastal Evacuation Route',
            'Mountain Emergency Route', 'Urban Evacuation Path'
        ]
        
        routes = []
        for i in range(count):
            name = random.choice(route_names)
            
            route = {
                'id': f'route-{i+1}',
                'name': name,
                'start': [
                    -122.4 + random.uniform(-0.1, 0.1),
                    37.7 + random.uniform(-0.1, 0.1)
                ],
                'end': [
                    -122.3 + random.uniform(-0.1, 0.1),
                    37.8 + random.uniform(-0.1, 0.1)
                ],
                'distance': round(random.uniform(5.0, 15.0), 1),
                'duration': random.randint(10, 30),
                'status': 'open',
                'hazards_avoided': [f'hazard-{random.randint(1, 5)}']
            }
            routes.append(route)
        
        return routes


def start_server(port=8000):
    """Start the mock API server."""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAPIHandler)
    
    print(f"🚀 Starting Mock API Server on port {port}")
    print(f"📡 API will be available at: http://localhost:{port}")
    print(f"🏥 Health check: http://localhost:{port}/api/health")
    print(f"📊 Dashboard: http://localhost:{port}/api/dashboard")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down mock API server...")
        httpd.shutdown()


if __name__ == '__main__':
    start_server()

