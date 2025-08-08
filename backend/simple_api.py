"""
Simplified Disaster Response API
Single endpoint serving all disaster data for take-home project
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

# Mock data storage
MOCK_DATA = {
    "hazards": [],
    "routes": [],
    "resources": [],
    "metrics": {},
    "alerts": []
}

def load_mock_data():
    """Load mock disaster data"""
    # Hazard zones - wildfire and flood areas
    MOCK_DATA["hazards"] = [
        {
            "id": "hazard-1",
            "type": "wildfire",
            "name": "Oakland Hills Fire",
            "severity": "high",
            "coordinates": [-122.2, 37.8],
            "radius": 5000,
            "affected_population": 15000,
            "last_updated": datetime.now().isoformat(),
            "status": "active"
        },
        {
            "id": "hazard-2", 
            "type": "flood",
            "name": "San Francisco Bay Flood",
            "severity": "medium",
            "coordinates": [-122.4, 37.7],
            "radius": 3000,
            "affected_population": 8000,
            "last_updated": datetime.now().isoformat(),
            "status": "active"
        },
        {
            "id": "hazard-3",
            "type": "earthquake",
            "name": "Hayward Fault Activity",
            "severity": "low",
            "coordinates": [-122.1, 37.6],
            "radius": 2000,
            "affected_population": 5000,
            "last_updated": datetime.now().isoformat(),
            "status": "monitoring"
        }
    ]
    
    # Safe evacuation routes
    MOCK_DATA["routes"] = [
        {
            "id": "route-1",
            "name": "Oakland Hills Evacuation Route",
            "start": [-122.2, 37.8],
            "end": [-122.3, 37.9],
            "distance": 8.5,
            "duration": 15,
            "status": "open",
            "hazards_avoided": ["hazard-1"]
        },
        {
            "id": "route-2",
            "name": "Bay Area Emergency Access",
            "start": [-122.4, 37.7],
            "end": [-122.5, 37.8],
            "distance": 12.0,
            "duration": 20,
            "status": "open",
            "hazards_avoided": ["hazard-2"]
        },
        {
            "id": "route-3",
            "name": "Hayward Fault Bypass",
            "start": [-122.1, 37.6],
            "end": [-122.0, 37.7],
            "distance": 6.2,
            "duration": 10,
            "status": "open",
            "hazards_avoided": ["hazard-3"]
        }
    ]
    
    # Emergency resources
    MOCK_DATA["resources"] = [
        {
            "id": "resource-1",
            "type": "fire_truck",
            "name": "Engine 1",
            "location": [-122.2, 37.8],
            "status": "deployed",
            "capacity": "water_tank",
            "crew": 4
        },
        {
            "id": "resource-2",
            "type": "ambulance",
            "name": "Medic 2",
            "location": [-122.4, 37.7],
            "status": "available",
            "capacity": "patient_transport",
            "crew": 2
        },
        {
            "id": "resource-3",
            "type": "police_car",
            "name": "Patrol 3",
            "location": [-122.1, 37.6],
            "status": "responding",
            "capacity": "traffic_control",
            "crew": 2
        },
        {
            "id": "resource-4",
            "type": "helicopter",
            "name": "Air Rescue 1",
            "location": [-122.3, 37.8],
            "status": "available",
            "capacity": "aerial_surveillance",
            "crew": 3
        }
    ]
    
    # Dashboard metrics
    MOCK_DATA["metrics"] = {
        "total_hazards": len(MOCK_DATA["hazards"]),
        "active_hazards": len([h for h in MOCK_DATA["hazards"] if h["status"] == "active"]),
        "total_population_at_risk": sum(h["affected_population"] for h in MOCK_DATA["hazards"]),
        "available_resources": len([r for r in MOCK_DATA["resources"] if r["status"] == "available"]),
        "deployed_resources": len([r for r in MOCK_DATA["resources"] if r["status"] == "deployed"]),
        "open_routes": len([r for r in MOCK_DATA["routes"] if r["status"] == "open"]),
        "response_time_avg": 8.5,
        "evacuation_progress": 65
    }
    
    # Current alerts
    MOCK_DATA["alerts"] = [
        {
            "id": "alert-1",
            "type": "warning",
            "title": "Wildfire Spreading",
            "message": "Oakland Hills fire has expanded 2 miles in the last hour",
            "timestamp": datetime.now().isoformat(),
            "severity": "high"
        },
        {
            "id": "alert-2",
            "type": "info",
            "title": "Evacuation Route Open",
            "message": "Route 1 is now clear for evacuation traffic",
            "timestamp": datetime.now().isoformat(),
            "severity": "medium"
        }
    ]

@app.route('/api/disaster-data', methods=['GET'])
def get_disaster_data():
    """Main endpoint serving all disaster response data"""
    try:
        # Update metrics with current data
        MOCK_DATA["metrics"]["total_hazards"] = len(MOCK_DATA["hazards"])
        MOCK_DATA["metrics"]["active_hazards"] = len([h for h in MOCK_DATA["hazards"] if h["status"] == "active"])
        MOCK_DATA["metrics"]["total_population_at_risk"] = sum(h["affected_population"] for h in MOCK_DATA["hazards"])
        MOCK_DATA["metrics"]["available_resources"] = len([r for r in MOCK_DATA["resources"] if r["status"] == "available"])
        MOCK_DATA["metrics"]["deployed_resources"] = len([r for r in MOCK_DATA["resources"] if r["status"] == "deployed"])
        MOCK_DATA["metrics"]["open_routes"] = len([r for r in MOCK_DATA["routes"] if r["status"] == "open"])
        
        return jsonify({
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "data": MOCK_DATA
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/update-resource-status', methods=['POST'])
def update_resource_status():
    """Update resource status (for demo purposes)"""
    try:
        data = request.get_json()
        resource_id = data.get('resource_id')
        new_status = data.get('status')
        
        # Find and update resource
        for resource in MOCK_DATA["resources"]:
            if resource["id"] == resource_id:
                resource["status"] = new_status
                resource["last_updated"] = datetime.now().isoformat()
                break
        
        return jsonify({
            "success": True,
            "message": f"Resource {resource_id} status updated to {new_status}"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

@app.route('/api/add-alert', methods=['POST'])
def add_alert():
    """Add new alert (for demo purposes)"""
    try:
        data = request.get_json()
        new_alert = {
            "id": f"alert-{len(MOCK_DATA['alerts']) + 1}",
            "type": data.get('type', 'info'),
            "title": data.get('title', 'New Alert'),
            "message": data.get('message', ''),
            "timestamp": datetime.now().isoformat(),
            "severity": data.get('severity', 'medium')
        }
        
        MOCK_DATA["alerts"].append(new_alert)
        
        return jsonify({
            "success": True,
            "alert": new_alert
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

if __name__ == '__main__':
    # Load mock data on startup
    load_mock_data()
    
    print("🚀 Simplified Disaster Response API Starting...")
    print("📊 Loaded mock data:")
    print(f"   - {len(MOCK_DATA['hazards'])} hazard zones")
    print(f"   - {len(MOCK_DATA['routes'])} evacuation routes")
    print(f"   - {len(MOCK_DATA['resources'])} emergency resources")
    print(f"   - {len(MOCK_DATA['alerts'])} active alerts")
    print("\n🌐 API Endpoints:")
    print("   - GET  /api/disaster-data")
    print("   - GET  /api/health")
    print("   - POST /api/update-resource-status")
    print("   - POST /api/add-alert")
    print("\n📍 Server running on http://localhost:5001")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
