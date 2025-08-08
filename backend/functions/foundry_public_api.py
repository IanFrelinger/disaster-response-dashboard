"""
Foundry Functions API - Instant REST Endpoints
Public-facing safety APIs that leverage Ontology objects.
"""

from palantir.functions import function, Input, Output
from palantir.ontology import HazardZone, EmergencyUnit, EvacuationRoute, Building
from palantir.geocoding import FoundryGeocoder
from palantir.ontology.types import SafetyStatus, DispatchResult
import structlog
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = structlog.get_logger(__name__)


@function(public=True, cache_duration=30)
def check_address_safety(address: str) -> SafetyStatus:
    """
    Public API: Check if an address is safe from hazards
    Exposed at: GET /api/public/check-safety?address=123+Elm+St
    """
    
    try:
        # Geocode using Foundry's built-in service
        location = FoundryGeocoder.geocode(address)
        if not location:
            return SafetyStatus(
                status="ERROR",
                message="Address not found",
                timestamp=datetime.now().isoformat()
            )
        
        # Query ontology for nearby hazards
        nearby_hazards = HazardZone.objects() \
            .filter(distance_from(location) < 1000) \
            .order_by("risk_level", descending=True) \
            .take(5)
        
        if nearby_hazards.exists():
            nearest_hazard = nearby_hazards.first()
            
            # Calculate safe routes
            safe_routes = EvacuationRoute.objects() \
                .filter(status="safe") \
                .filter(distance_from(location) < 5000) \
                .order_by("distance_km") \
                .take(3)
            
            # Find nearest shelter
            nearest_shelter = Building.objects() \
                .filter(building_type="shelter") \
                .filter(status="open") \
                .order_by(distance_from(location)) \
                .first()
            
            return SafetyStatus(
                status="EVACUATE",
                address=address,
                nearest_hazard={
                    "risk_level": nearest_hazard.risk_level,
                    "distance_km": location.distance_to(nearest_hazard.geometry) * 111,
                    "affected_population": nearest_hazard.affected_population
                },
                safe_routes=[{
                    "route_id": route.route_id,
                    "destination": route.destination_h3,
                    "distance_km": route.distance_km,
                    "estimated_time_minutes": route.estimated_time_minutes
                } for route in safe_routes],
                nearest_shelter={
                    "address": nearest_shelter.address,
                    "distance_km": location.distance_to(nearest_shelter.geometry) * 111,
                    "capacity": nearest_shelter.occupancy
                } if nearest_shelter else None,
                timestamp=datetime.now().isoformat()
            )
        
        return SafetyStatus(
            status="SAFE",
            address=address,
            message="No hazards detected in your area",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error("Error checking address safety", error=str(e), address=address)
        return SafetyStatus(
            status="ERROR",
            message="Service temporarily unavailable",
            timestamp=datetime.now().isoformat()
        )


@function(public=True, cache_duration=60)
def get_evacuation_status(zone_id: str) -> Dict[str, Any]:
    """
    Public API: Get current evacuation status for a zone
    Exposed at: GET /api/public/evacuation-status?zone_id=8928308280fffff
    """
    
    try:
        hazard_zone = HazardZone.get(zone_id)
        if not hazard_zone:
            return {
                "status": "NOT_FOUND",
                "message": "Zone not found",
                "timestamp": datetime.now().isoformat()
            }
        
        # Get active evacuation orders
        active_orders = hazard_zone.evacuation_orders \
            .filter(status="active") \
            .order_by("timestamp", descending=True)
        
        # Get assigned resources
        assigned_units = hazard_zone.assigned_resources \
            .filter(status__in=["dispatched", "en_route", "on_scene"])
        
        # Calculate compliance metrics
        total_orders = active_orders.count()
        total_affected = hazard_zone.affected_population
        
        return {
            "zone_id": zone_id,
            "risk_level": hazard_zone.risk_level,
            "affected_population": total_affected,
            "active_evacuation_orders": total_orders,
            "assigned_units": assigned_units.count(),
            "unit_details": [{
                "call_sign": unit.call_sign,
                "unit_type": unit.unit_type,
                "status": unit.status
            } for unit in assigned_units],
            "latest_order": {
                "order_type": active_orders.first().order_type,
                "timestamp": active_orders.first().timestamp.isoformat(),
                "authorized_by": active_orders.first().authorized_by
            } if active_orders.exists() else None,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error("Error getting evacuation status", error=str(e), zone_id=zone_id)
        return {
            "status": "ERROR",
            "message": "Service temporarily unavailable",
            "timestamp": datetime.now().isoformat()
        }


@function(requires_auth=True)
def dispatch_resources(incident_id: str, units: List[str], dispatcher: str) -> DispatchResult:
    """
    Internal API: Dispatch resources to incident
    Requires authentication and dispatcher role
    """
    
    try:
        incident = Incident.get(incident_id)
        if not incident:
            return DispatchResult(
                success=False,
                error="Incident not found",
                dispatch_id=None
            )
        
        # Foundry handles transactions and conflict resolution
        with ontology_transaction() as txn:
            dispatched_units = []
            
            for unit_id in units:
                unit = EmergencyUnit.get(unit_id)
                if not unit or unit.status != UnitStatus.AVAILABLE:
                    continue
                
                # Dispatch unit
                dispatch_record = unit.dispatch_to_incident(incident_id, dispatcher)
                dispatched_units.append(unit_id)
            
            # Automatically logs who dispatched what
            return DispatchResult(
                success=True,
                dispatch_id=txn.id,
                dispatched_units=dispatched_units,
                incident_id=incident_id,
                dispatcher=dispatcher,
                timestamp=datetime.now().isoformat()
            )
            
    except Exception as e:
        logger.error("Error dispatching resources", error=str(e), incident_id=incident_id)
        return DispatchResult(
            success=False,
            error="Dispatch failed",
            dispatch_id=None
        )


@function(public=True, cache_duration=15)
def get_emergency_contacts() -> Dict[str, Any]:
    """
    Public API: Get emergency contact information
    Exposed at: GET /api/public/emergency-contacts
    """
    
    try:
        # Get available command units
        command_units = EmergencyUnit.objects() \
            .filter(unit_type=UnitType.COMMAND) \
            .filter(status=UnitStatus.AVAILABLE)
        
        # Get active incidents
        active_incidents = Incident.objects() \
            .filter(status="active") \
            .order_by("reported_at", descending=True)
        
        return {
            "emergency_contacts": {
                "911": "911",
                "fire_department": "+1-555-FIRE",
                "police": "+1-555-POLICE",
                "ambulance": "+1-555-AMBULANCE"
            },
            "command_units": [{
                "call_sign": unit.call_sign,
                "location": unit.current_location,
                "last_update": unit.last_location_update.isoformat()
            } for unit in command_units],
            "active_incidents": [{
                "incident_id": incident.incident_id,
                "type": incident.incident_type,
                "severity": incident.severity,
                "reported_at": incident.reported_at.isoformat()
            } for incident in active_incidents],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error("Error getting emergency contacts", error=str(e))
        return {
            "status": "ERROR",
            "message": "Service temporarily unavailable",
            "timestamp": datetime.now().isoformat()
        }


@function(requires_auth=True)
def update_unit_location(unit_id: str, h3_cell: str, updated_by: str) -> Dict[str, Any]:
    """
    Internal API: Update unit location (called by mobile apps)
    Requires authentication
    """
    
    try:
        unit = EmergencyUnit.get(unit_id)
        if not unit:
            return {
                "success": False,
                "error": "Unit not found"
            }
        
        # Update location
        unit.current_location = h3_cell
        unit.last_location_update = datetime.now()
        unit.save()
        
        logger.info("Unit location updated", 
                   unit=unit_id, 
                   location=h3_cell, 
                   updated_by=updated_by)
        
        return {
            "success": True,
            "unit_id": unit_id,
            "new_location": h3_cell,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error("Error updating unit location", error=str(e), unit_id=unit_id)
        return {
            "success": False,
            "error": "Update failed"
        }


# Data transfer objects
class SafetyStatus:
    def __init__(self, status: str, **kwargs):
        self.status = status
        for key, value in kwargs.items():
            setattr(self, key, value)


class DispatchResult:
    def __init__(self, success: bool, **kwargs):
        self.success = success
        for key, value in kwargs.items():
            setattr(self, key, value)
