"""
API endpoints for serving synthetic data to the frontend.
This replaces frontend data generation with backend API calls.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import os
import sys
from typing import Dict, Optional

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.synthetic_data import SyntheticDataGenerator
from security_headers import add_security_headers

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "https://*.cloudfront.net",
    "http://localhost:3000",
    "http://localhost:3001"
]}})  # Enable CORS for frontend integration (CloudFront + local dev)

# Apply security headers to all responses
@app.after_request
def apply_security_headers(response):
    return add_security_headers(response)

@app.route('/health')
def health():
    """Health check endpoint for load balancers and monitoring."""
    return jsonify(status="ok", timestamp=time.time()), 200

@app.route('/')
def root():
    """Root endpoint for basic connectivity check."""
    return jsonify(message="Disaster Response API", status="running", timestamp=time.time()), 200

# Global cache for generated data (in production, this would be a database)
_data_cache: Dict = {}
_cache_timestamp: float = 0
_cache_duration: float = 300  # 5 minutes cache


def get_cached_data() -> Dict:
    """Get cached dashboard data or generate new data if cache is expired."""
    global _data_cache, _cache_timestamp
    
    current_time = time.time()
    
    # Check if cache is valid
    if current_time - _cache_timestamp < _cache_duration and _data_cache:
        return _data_cache
    
    # Generate new data
    _data_cache = SyntheticDataGenerator.generate_dashboard_data()
    _cache_timestamp = current_time
    
    return _data_cache


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get complete dashboard data."""
    try:
        data = get_cached_data()
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/hazards', methods=['GET'])
def get_hazard_zones():
    """Get hazard zones data."""
    try:
        count = request.args.get('count', default=20, type=int)
        hazard_zones = SyntheticDataGenerator.generate_hazard_zones(count)
        
        return jsonify({
            'success': True,
            'data': [zone.to_dict() for zone in hazard_zones],
            'count': len(hazard_zones),
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/routes', methods=['GET'])
def get_safe_routes():
    """Get safe evacuation routes."""
    try:
        count = request.args.get('count', default=12, type=int)
        safe_routes = SyntheticDataGenerator.generate_safe_routes(count)
        
        return jsonify({
            'success': True,
            'data': [route.to_dict() for route in safe_routes],
            'count': len(safe_routes),
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/risk-assessment', methods=['GET'])
def get_risk_assessment():
    """Get risk assessment for a specific location."""
    try:
        lat = request.args.get('lat', default=37.7749, type=float)
        lng = request.args.get('lng', default=-122.4194, type=float)
        
        location = (lng, lat)  # Convert to (lng, lat) format
        risk_assessment = SyntheticDataGenerator.generate_risk_assessment(location)
        
        return jsonify({
            'success': True,
            'data': risk_assessment.to_dict(),
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/hazard-summary', methods=['GET'])
def get_hazard_summary():
    """Get hazard summary statistics."""
    try:
        hazard_summary = SyntheticDataGenerator.generate_hazard_summary()
        
        return jsonify({
            'success': True,
            'data': hazard_summary.to_dict(),
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/evacuation-routes', methods=['GET'])
def get_evacuation_routes():
    """Get evacuation routes response."""
    try:
        evacuation_routes = SyntheticDataGenerator.generate_evacuation_routes_response()
        
        return jsonify({
            'success': True,
            'data': evacuation_routes.to_dict(),
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/scenario/<scenario_id>', methods=['GET'])
def get_scenario_data(scenario_id: str):
    """Get data for specific disaster scenarios."""
    try:
        valid_scenarios = [
            'wildfire-napa', 'flood-sacramento', 'earthquake-sf', 'hurricane-miami',
            'wildfire', 'earthquake', 'flood', 'normal'  # Legacy support
        ]
        
        if scenario_id not in valid_scenarios:
            return jsonify({
                'success': False,
                'error': f'Invalid scenario. Must be one of: {", ".join(valid_scenarios)}'
            }), 400
        
        scenario_data = SyntheticDataGenerator.generate_scenario_data(scenario_id)
        
        return jsonify({
            'success': True,
            'data': scenario_data,
            'scenario': scenario_id,
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/refresh', methods=['POST'])
def refresh_data():
    """Force refresh of cached data."""
    try:
        global _data_cache, _cache_timestamp
        
        # Clear cache
        _data_cache = {}
        _cache_timestamp = 0
        
        # Generate new data
        new_data = get_cached_data()
        
        return jsonify({
            'success': True,
            'message': 'Data refreshed successfully',
            'data': new_data,
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': time.time(),
        'service': 'synthetic-data-api'
    })

@app.route('/', methods=['GET'])
def root_health_check():
    """Root health check endpoint for App Runner."""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'message': 'Disaster Response Dashboard API is running',
        'timestamp': time.time(),
        'service': 'synthetic-data-api'
    })


@app.route('/api/info', methods=['GET'])
def api_info():
    """API information and available endpoints."""
    return jsonify({
        'success': True,
        'service': 'Disaster Response Dashboard - Synthetic Data API',
        'version': '1.0.0',
        'endpoints': {
            'GET /api/dashboard': 'Complete dashboard data',
            'GET /api/hazards': 'Hazard zones data',
            'GET /api/routes': 'Safe evacuation routes',
            'GET /api/risk-assessment': 'Risk assessment for location',
            'GET /api/hazard-summary': 'Hazard summary statistics',
            'GET /api/evacuation-routes': 'Evacuation routes response',
            'GET /api/scenario/<id>': 'Scenario-specific data (wildfire-napa, flood-sacramento, earthquake-sf, hurricane-miami)',
            'POST /api/refresh': 'Refresh cached data',
            'GET /api/health': 'Health check',
            'GET /api/info': 'API information'
        },
        'parameters': {
            'count': 'Number of items to generate (for hazards and routes)',
            'lat': 'Latitude for risk assessment',
            'lng': 'Longitude for risk assessment',
            'scenario_id': 'Scenario ID (wildfire-napa, flood-sacramento, earthquake-sf, hurricane-miami, or legacy: wildfire, earthquake, flood, normal)'
        }
    })


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8000) 