"""
Foundry Data Fusion API
Handles all data processing, fusion, and analytics for the frontend
"""

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from typing import Dict, List, Any, Optional
import asyncio
import json
from datetime import datetime, timedelta
import logging

# Import simplified models
from models.disaster_models import HazardZone, EmergencyUnit, EvacuationRoute, Building, Incident

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Blueprint
foundry_fusion_bp = Blueprint('foundry_fusion', __name__, url_prefix='/api/foundry')

class FoundryDataFusionService:
    """Service class for handling Foundry data fusion and processing"""
    
    def __init__(self) -> None:
        # In-memory cache for real-time data
        self._hazard_cache: Dict[str, HazardZone] = {}
        self._unit_cache: Dict[str, EmergencyUnit] = {}
        self._route_cache: Dict[str, EvacuationRoute] = {}
        self._analytics_cache: Dict[str, Any] = {}
        self._last_update = datetime.now()
        
    def get_fused_state(self) -> Dict[str, Any]:
        """Get the complete fused data state"""
        try:
            # Get all hazard zones
            hazards = list(self._hazard_cache.values())
            active_hazards = [h for h in hazards if h.risk_level in ['high', 'critical']]
            critical_hazards = [h for h in hazards if h.risk_level == 'critical']
            
            # Get all emergency units
            units = list(self._unit_cache.values())
            available_units = [u for u in units if u.status == 'available']
            dispatched_units = [u for u in units if u.status != 'available']
            
            # Group units by type
            units_by_type: Dict[str, List[EmergencyUnit]] = {}
            for unit in units:
                unit_type = unit.unit_type
                if unit_type not in units_by_type:
                    units_by_type[unit_type] = []
                units_by_type[unit_type].append(unit)
            
            # Get evacuation routes
            routes = list(self._route_cache.values())
            safe_routes = [r for r in routes if r.status == 'safe']
            compromised_routes = [r for r in routes if r.status == 'compromised']
            
            # Calculate analytics
            analytics = self._calculate_analytics(hazards, units, routes)
            
            return {
                "hazards": {
                    "active": [self._serialize_hazard(h) for h in active_hazards],
                    "critical": [self._serialize_hazard(h) for h in critical_hazards],
                    "total": len(hazards),
                    "lastUpdated": self._last_update.isoformat()
                },
                "units": {
                    "available": [self._serialize_unit(u) for u in available_units],
                    "dispatched": [self._serialize_unit(u) for u in dispatched_units],
                    "total": len(units),
                    "byType": {k: [self._serialize_unit(u) for u in v] for k, v in units_by_type.items()},
                    "lastUpdated": self._last_update.isoformat()
                },
                "routes": {
                    "safe": [self._serialize_route(r) for r in safe_routes],
                    "compromised": [self._serialize_route(r) for r in compromised_routes],
                    "total": len(routes),
                    "lastUpdated": self._last_update.isoformat()
                },
                "analytics": analytics
            }
        except Exception as e:
            logger.error(f"Error getting fused state: {e}")
            return self._get_empty_state()
    
    def _calculate_analytics(self, hazards: List[HazardZone], units: List[EmergencyUnit], routes: List[EvacuationRoute]) -> Dict[str, Any]:
        """Calculate real-time analytics"""
        try:
            # Calculate total affected population
            total_affected = sum(h.affected_population for h in hazards if h.risk_level in ['high', 'critical'])
            
            # Calculate average response time (mock calculation)
            avg_response_time = 12.5  # minutes
            
            # Calculate evacuation compliance (mock calculation)
            evacuation_compliance = 85.2  # percentage
            
            return {
                "totalAffectedPopulation": total_affected,
                "averageResponseTime": avg_response_time,
                "evacuationCompliance": evacuation_compliance,
                "lastUpdated": self._last_update.isoformat()
            }
        except Exception as e:
            logger.error(f"Error calculating analytics: {e}")
            return {
                "totalAffectedPopulation": 0,
                "averageResponseTime": 0,
                "evacuationCompliance": 0,
                "lastUpdated": self._last_update.isoformat()
            }
    
    def _get_empty_state(self) -> Dict[str, Any]:
        """Return empty state when errors occur"""
        return {
            "hazards": {"active": [], "critical": [], "total": 0, "lastUpdated": datetime.now().isoformat()},
            "units": {"available": [], "dispatched": [], "total": 0, "byType": {}, "lastUpdated": datetime.now().isoformat()},
            "routes": {"safe": [], "compromised": [], "total": 0, "lastUpdated": datetime.now().isoformat()},
            "analytics": {
                "totalAffectedPopulation": 0,
                "averageResponseTime": 0,
                "evacuationCompliance": 0,
                "lastUpdated": datetime.now().isoformat()
            }
        }
    
    def _serialize_hazard(self, hazard: HazardZone) -> Dict[str, Any]:
        """Serialize hazard zone for JSON response"""
        return hazard.to_dict()
    
    def _serialize_unit(self, unit: EmergencyUnit) -> Dict[str, Any]:
        """Serialize emergency unit for JSON response"""
        return unit.to_dict()
    
    def _serialize_route(self, route: EvacuationRoute) -> Dict[str, Any]:
        """Serialize evacuation route for JSON response"""
        return route.to_dict()
    
    def update_hazards(self, hazards: List[HazardZone]) -> None:
        """Update hazard cache"""
        self._hazard_cache = {h.h3_cell_id: h for h in hazards}
        self._last_update = datetime.now()
        logger.info(f"Updated {len(hazards)} hazards")
    
    def update_units(self, units: List[EmergencyUnit]) -> None:
        """Update unit cache"""
        self._unit_cache = {u.unit_id: u for u in units}
        self._last_update = datetime.now()
        logger.info(f"Updated {len(units)} units")
    
    def update_routes(self, routes: List[EvacuationRoute]) -> None:
        """Update route cache"""
        self._route_cache = {r.route_id: r for r in routes}
        self._last_update = datetime.now()
        logger.info(f"Updated {len(routes)} routes")
    
    def refresh_all_data(self) -> None:
        """Refresh all data from sources"""
        try:
            # This would integrate with your existing data sources
            # For now, we'll use mock data
            self._load_mock_data()
            logger.info("Refreshed all data")
        except Exception as e:
            logger.error(f"Error refreshing data: {e}")
    
    def _load_mock_data(self) -> None:
        """Load mock data for testing"""
        from datetime import datetime, timedelta
        
        # Mock hazard zones
        mock_hazards = [
            HazardZone(
                h3_cell_id="8928308280fffff",
                risk_level="critical",
                risk_score=0.95,
                intensity=0.9,
                confidence=0.85,
                affected_population=15000,
                buildings_at_risk=250,
                latest_detection=datetime.now() - timedelta(minutes=5),
                wind_speed=25,
                last_updated=datetime.now()
            ),
            HazardZone(
                h3_cell_id="8928308281fffff",
                risk_level="high",
                risk_score=0.75,
                intensity=0.7,
                confidence=0.8,
                affected_population=8000,
                buildings_at_risk=120,
                latest_detection=datetime.now() - timedelta(minutes=10),
                wind_speed=15,
                last_updated=datetime.now()
            ),
            HazardZone(
                h3_cell_id="8928308282fffff",
                risk_level="medium",
                risk_score=0.55,
                intensity=0.5,
                confidence=0.75,
                affected_population=3000,
                buildings_at_risk=45,
                latest_detection=datetime.now() - timedelta(minutes=15),
                wind_speed=10,
                last_updated=datetime.now()
            )
        ]
        
        # Mock emergency units
        mock_units = [
            EmergencyUnit(
                unit_id="unit-001",
                call_sign="Engine 1",
                unit_type="fire_engine",
                status="available",
                current_location="8928308280fffff",
                last_location_update=datetime.now(),
                capacity=4,
                equipment=["Hose", "Ladder", "Pump", "SCBA"]
            ),
            EmergencyUnit(
                unit_id="unit-002",
                call_sign="Ambulance 1",
                unit_type="ambulance",
                status="available",
                current_location="8928308281fffff",
                last_location_update=datetime.now(),
                capacity=2,
                equipment=["Defibrillator", "Oxygen", "Stretcher"]
            ),
            EmergencyUnit(
                unit_id="unit-003",
                call_sign="Patrol 1",
                unit_type="police",
                status="dispatched",
                current_location="8928308282fffff",
                last_location_update=datetime.now(),
                capacity=2,
                equipment=["Radio", "Body Camera", "Taser"]
            )
        ]
        
        # Mock evacuation routes
        mock_routes = [
            EvacuationRoute(
                route_id="route-001",
                origin_h3="8928308280fffff",
                destination_h3="8928308283fffff",
                route_geometry=json.dumps({
                    "type": "LineString",
                    "coordinates": [
                        [-122.4194, 37.7749],
                        [-122.4100, 37.7800],
                        [-122.4000, 37.7850]
                    ]
                }),
                distance_km=2.5,
                estimated_time_minutes=15,
                capacity_per_hour=1000,
                status="safe",
                last_updated=datetime.now()
            ),
            EvacuationRoute(
                route_id="route-002",
                origin_h3="8928308281fffff",
                destination_h3="8928308284fffff",
                route_geometry=json.dumps({
                    "type": "LineString",
                    "coordinates": [
                        [-122.4180, 37.7755],
                        [-122.4080, 37.7805],
                        [-122.3980, 37.7855]
                    ]
                }),
                distance_km=3.2,
                estimated_time_minutes=20,
                capacity_per_hour=800,
                status="compromised",
                last_updated=datetime.now()
            )
        ]
        
        self.update_hazards(mock_hazards)
        self.update_units(mock_units)
        self.update_routes(mock_routes)

# Global service instance
fusion_service = FoundryDataFusionService()

# Initialize with mock data
fusion_service._load_mock_data()

# API Routes
@foundry_fusion_bp.route('/state', methods=['GET'])
@cross_origin()
def get_fused_state() -> Any:
    """Get complete fused data state"""
    try:
        state = fusion_service.get_fused_state()
        return jsonify(state), 200
    except Exception as e:
        logger.error(f"Error getting fused state: {e}")
        return jsonify({"error": "Failed to get fused state"}), 500

@foundry_fusion_bp.route('/hazards', methods=['GET'])
@cross_origin()
def get_hazards() -> Any:
    """Get hazard zones with optional filters"""
    try:
        filters = request.args.to_dict()
        state = fusion_service.get_fused_state()
        hazards = state['hazards']
        
        # Apply filters if provided
        if filters.get('risk_level'):
            risk_levels = filters['risk_level'].split(',')
            hazards['active'] = [h for h in hazards['active'] if h['riskLevel'] in risk_levels]
            hazards['critical'] = [h for h in hazards['critical'] if h['riskLevel'] in risk_levels]
        
        return jsonify(hazards), 200
    except Exception as e:
        logger.error(f"Error getting hazards: {e}")
        return jsonify({"error": "Failed to get hazards"}), 500

@foundry_fusion_bp.route('/units', methods=['GET'])
@cross_origin()
def get_units() -> Any:
    """Get emergency units with optional filters"""
    try:
        filters = request.args.to_dict()
        state = fusion_service.get_fused_state()
        units = state['units']
        
        # Apply filters if provided
        if filters.get('status'):
            statuses = filters['status'].split(',')
            units['available'] = [u for u in units['available'] if u['status'] in statuses]
            units['dispatched'] = [u for u in units['dispatched'] if u['status'] in statuses]
        
        return jsonify(units), 200
    except Exception as e:
        logger.error(f"Error getting units: {e}")
        return jsonify({"error": "Failed to get units"}), 500

@foundry_fusion_bp.route('/routes', methods=['GET'])
@cross_origin()
def get_routes() -> Any:
    """Get evacuation routes with optional filters"""
    try:
        filters = request.args.to_dict()
        state = fusion_service.get_fused_state()
        routes = state['routes']
        
        # Apply filters if provided
        if filters.get('status'):
            statuses = filters['status'].split(',')
            routes['safe'] = [r for r in routes['safe'] if r['status'] in statuses]
            routes['compromised'] = [r for r in routes['compromised'] if r['status'] in statuses]
        
        return jsonify(routes), 200
    except Exception as e:
        logger.error(f"Error getting routes: {e}")
        return jsonify({"error": "Failed to get routes"}), 500

@foundry_fusion_bp.route('/analytics', methods=['GET'])
@cross_origin()
def get_analytics() -> Any:
    """Get analytics data"""
    try:
        state = fusion_service.get_fused_state()
        return jsonify(state['analytics']), 200
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        return jsonify({"error": "Failed to get analytics"}), 500

@foundry_fusion_bp.route('/refresh', methods=['POST'])
@cross_origin()
def refresh_data() -> Any:
    """Refresh all data"""
    try:
        fusion_service.refresh_all_data()
        return jsonify({"message": "Data refreshed successfully"}), 200
    except Exception as e:
        logger.error(f"Error refreshing data: {e}")
        return jsonify({"error": "Failed to refresh data"}), 500

@foundry_fusion_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check() -> Any:
    """Health check endpoint"""
    try:
        state = fusion_service.get_fused_state()
        return jsonify({
            "status": "healthy",
            "lastUpdate": fusion_service._last_update.isoformat(),
            "dataCounts": {
                "hazards": state['hazards']['total'],
                "units": state['units']['total'],
                "routes": state['routes']['total']
            }
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 500
