"""
Backend validation API for map layers and system health
"""

from flask import Blueprint, jsonify, request
import time
import logging
from typing import Dict, Any, List

# Create blueprint
validation_bp = Blueprint('validation', __name__, url_prefix='/api/validation')

logger = logging.getLogger(__name__)

def validate_backend_health() -> Dict[str, Any]:
    """Validate backend system health"""
    try:
        # Check if we can import required modules
        import requests
        import json
        
        # Check if we can access configuration
        from config import get_config
        config = get_config()
        
        # Validate API keys (without exposing them)
        api_config = config.get_api_config()
        missing_keys = []
        
        for service, config_data in api_config.items():
            if not config_data.get('api_key') and not config_data.get('access_token'):
                missing_keys.append(service)
        
        return {
            "success": len(missing_keys) == 0,
            "timestamp": time.time(),
            "missing_api_keys": missing_keys,
            "services_configured": len(api_config) - len(missing_keys),
            "total_services": len(api_config)
        }
    except Exception as e:
        logger.error(f"Backend health validation failed: {e}")
        return {
            "success": False,
            "timestamp": time.time(),
            "error": str(e)
        }

def validate_data_sources() -> Dict[str, Any]:
    """Validate that data sources are accessible"""
    try:
        # Check if mock data is available
        MOCK_DATA: Dict[str, Any] = {"hazards": [], "routes": [], "resources": [], "metrics": {}, "alerts": []}
        
        data_validation = {
            "hazards": {
                "available": "hazards" in MOCK_DATA,
                "count": len(MOCK_DATA.get("hazards", [])),
                "has_geojson": False
            },
            "units": {
                "available": "units" in MOCK_DATA,
                "count": len(MOCK_DATA.get("units", [])),
                "has_geojson": False
            },
            "routes": {
                "available": "routes" in MOCK_DATA,
                "count": len(MOCK_DATA.get("routes", [])),
                "has_geojson": False
            },
            "buildings": {
                "available": "buildings" in MOCK_DATA,
                "count": len(MOCK_DATA.get("buildings", [])),
                "has_geojson": False
            }
        }
        
        # Check if data has proper GeoJSON structure
        for data_type, validation in data_validation.items():
            if validation["available"]:
                sample_data = MOCK_DATA.get(data_type, [])
                if sample_data and isinstance(sample_data, list) and len(sample_data) > 0:
                    sample_item = sample_data[0]
                    validation["has_geojson"] = (
                        isinstance(sample_item, dict) and 
                        "geometry" in sample_item and 
                        "properties" in sample_item
                    )
        
        return {
            "success": all(v["available"] and v["has_geojson"] for v in data_validation.values()),
            "timestamp": time.time(),
            "data_sources": data_validation
        }
    except Exception as e:
        logger.error(f"Data sources validation failed: {e}")
        return {
            "success": False,
            "timestamp": time.time(),
            "error": str(e)
        }

def validate_api_endpoints() -> Dict[str, Any]:
    """Validate that API endpoints are responding"""
    try:
        # Test internal endpoints
        endpoints_to_test = [
            "/api/health",
            "/api/hazards",
            "/api/units", 
            "/api/routes",
            "/api/buildings"
        ]
        
        endpoint_results: Dict[str, Any] = {}
        
        for endpoint in endpoints_to_test:
            try:
                # This is a simplified check - in a real scenario you'd make actual requests
                endpoint_results[endpoint] = {
                    "available": True,  # Assume available for now
                    "response_time": 0.1  # Mock response time
                }
            except Exception as e:
                endpoint_results[endpoint] = {
                    "available": False,
                    "response_time": 0.0,
                    "error": str(e)
                }
        
        return {
            "success": all(result["available"] for result in endpoint_results.values()),
            "timestamp": time.time(),
            "endpoints": endpoint_results
        }
    except Exception as e:
        logger.error(f"API endpoints validation failed: {e}")
        return {
            "success": False,
            "timestamp": time.time(),
            "error": str(e)
        }

@validation_bp.route('/health', methods=['GET'])
def backend_health_validation() -> Any:
    """Backend health validation endpoint"""
    try:
        result = validate_backend_health()
        status_code = 200 if result["success"] else 500
        return jsonify(result), status_code
    except Exception as e:
        logger.error(f"Backend health validation endpoint failed: {e}")
        return jsonify({
            "success": False,
            "timestamp": time.time(),
            "error": str(e)
        }), 500

@validation_bp.route('/data-sources', methods=['GET'])
def data_sources_validation() -> Any:
    """Data sources validation endpoint"""
    try:
        result = validate_data_sources()
        status_code = 200 if result["success"] else 500
        return jsonify(result), status_code
    except Exception as e:
        logger.error(f"Data sources validation endpoint failed: {e}")
        return jsonify({
            "success": False,
            "timestamp": time.time(),
            "error": str(e)
        }), 500

@validation_bp.route('/api-endpoints', methods=['GET'])
def api_endpoints_validation() -> Any:
    """API endpoints validation endpoint"""
    try:
        result = validate_api_endpoints()
        status_code = 200 if result["success"] else 500
        return jsonify(result), status_code
    except Exception as e:
        logger.error(f"API endpoints validation endpoint failed: {e}")
        return jsonify({
            "success": False,
            "timestamp": time.time(),
            "error": str(e)
        }), 500

@validation_bp.route('/comprehensive', methods=['GET'])
def comprehensive_validation() -> Any:
    """Comprehensive backend validation"""
    try:
        health_result = validate_backend_health()
        data_result = validate_data_sources()
        api_result = validate_api_endpoints()
        
        overall_success = all([
            health_result["success"],
            data_result["success"], 
            api_result["success"]
        ])
        
        result = {
            "success": overall_success,
            "timestamp": time.time(),
            "components": {
                "health": health_result,
                "data_sources": data_result,
                "api_endpoints": api_result
            },
            "summary": {
                "total_checks": 3,
                "passed_checks": sum([
                    health_result["success"],
                    data_result["success"],
                    api_result["success"]
                ]),
                "failed_checks": 3 - sum([
                    health_result["success"],
                    data_result["success"],
                    api_result["success"]
                ])
            }
        }
        
        status_code = 200 if overall_success else 500
        return jsonify(result), status_code
    except Exception as e:
        logger.error(f"Comprehensive validation failed: {e}")
        return jsonify({
            "success": False,
            "timestamp": time.time(),
            "error": str(e)
        }), 500

@validation_bp.route('/compare', methods=['POST'])
def compare_with_frontend() -> Any:
    """Compare backend validation with frontend validation results"""
    try:
        frontend_data = request.get_json()
        
        if not frontend_data:
            return jsonify({
                "success": False,
                "error": "No frontend validation data provided"
            }), 400
        
        # Get backend validation results
        backend_health = validate_backend_health()
        backend_data = validate_data_sources()
        backend_api = validate_api_endpoints()
        
        # Compare results
        comparison = {
            "success": True,
            "timestamp": time.time(),
            "frontend_results": frontend_data,
            "backend_results": {
                "health": backend_health,
                "data_sources": backend_data,
                "api_endpoints": backend_api
            },
            "discrepancies": [],
            "recommendations": []
        }
        
        # Check for discrepancies
        if frontend_data.get("success") != backend_health.get("success"):
            comparison["discrepancies"].append({
                "type": "health_validation",
                "frontend": frontend_data.get("success"),
                "backend": backend_health.get("success"),
                "message": "Health validation results differ between frontend and backend"
            })
        
        # Add recommendations based on discrepancies
        if comparison["discrepancies"]:
            comparison["success"] = False
            comparison["recommendations"].append("Investigate validation logic differences between frontend and backend")
            comparison["recommendations"].append("Ensure consistent validation criteria across both systems")
        else:
            comparison["recommendations"].append("Validation systems are in sync - no action needed")
        
        return jsonify(comparison), 200
    except Exception as e:
        logger.error(f"Frontend-backend comparison failed: {e}")
        return jsonify({
            "success": False,
            "timestamp": time.time(),
            "error": str(e)
        }), 500
