"""
Simplified Disaster Models
Python classes for disaster response objects without Foundry dependencies
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
import json


@dataclass
class HazardZone:
    """Hazard zone model"""
    h3_cell_id: str
    risk_level: str  # 'low', 'medium', 'high', 'critical'
    risk_score: float
    intensity: float
    confidence: float
    affected_population: int
    buildings_at_risk: int
    latest_detection: Optional[datetime] = None
    wind_speed: float = 0.0
    last_updated: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "h3CellId": self.h3_cell_id,
            "riskLevel": self.risk_level,
            "riskScore": self.risk_score,
            "intensity": self.intensity,
            "confidence": self.confidence,
            "affectedPopulation": self.affected_population,
            "buildingsAtRisk": self.buildings_at_risk,
            "latestDetection": self.latest_detection.isoformat() if self.latest_detection else None,
            "windSpeed": self.wind_speed,
            "lastUpdated": self.last_updated.isoformat() if self.last_updated else None
        }


@dataclass
class EmergencyUnit:
    """Emergency unit model"""
    unit_id: str
    call_sign: str
    unit_type: str  # 'fire_engine', 'ambulance', 'police', 'helicopter', 'command'
    status: str  # 'available', 'dispatched', 'en_route', 'on_scene', 'returning', 'out_of_service'
    current_location: str  # H3 cell
    last_location_update: Optional[datetime] = None
    capacity: int = 0
    equipment: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "unitId": self.unit_id,
            "callSign": self.call_sign,
            "unitType": self.unit_type,
            "status": self.status,
            "currentLocation": self.current_location,
            "lastLocationUpdate": self.last_location_update.isoformat() if self.last_location_update else None,
            "capacity": self.capacity,
            "equipment": self.equipment
        }


@dataclass
class EvacuationRoute:
    """Evacuation route model"""
    route_id: str
    origin_h3: str
    destination_h3: str
    route_geometry: str  # GeoJSON string
    distance_km: float
    estimated_time_minutes: int
    capacity_per_hour: int
    status: str  # 'safe', 'compromised', 'closed'
    last_updated: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "routeId": self.route_id,
            "originH3": self.origin_h3,
            "destinationH3": self.destination_h3,
            "routeGeometry": self.route_geometry,
            "distanceKm": self.distance_km,
            "estimatedTimeMinutes": self.estimated_time_minutes,
            "capacityPerHour": self.capacity_per_hour,
            "status": self.status,
            "lastUpdated": self.last_updated.isoformat() if self.last_updated else None
        }


@dataclass
class Building:
    """Building model"""
    building_id: str
    address: str
    building_type: str
    occupancy: int
    h3_cell: str
    evacuation_status: str  # 'normal', 'ordered', 'evacuated'
    last_status_update: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "buildingId": self.building_id,
            "address": self.address,
            "buildingType": self.building_type,
            "occupancy": self.occupancy,
            "h3Cell": self.h3_cell,
            "evacuationStatus": self.evacuation_status,
            "lastStatusUpdate": self.last_status_update.isoformat() if self.last_status_update else None
        }


@dataclass
class Incident:
    """Incident model"""
    incident_id: str
    incident_type: str
    location_h3: str
    status: str  # 'active', 'resolved', 'closed'
    reported_at: Optional[datetime] = None
    severity: str = 'medium'
    description: str = ''
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "incidentId": self.incident_id,
            "incidentType": self.incident_type,
            "locationH3": self.location_h3,
            "reportedAt": self.reported_at.isoformat() if self.reported_at else None,
            "status": self.status,
            "severity": self.severity,
            "description": self.description
        }


@dataclass
class EvacuationOrder:
    """Evacuation order model"""
    order_id: str
    zone: HazardZone
    order_type: str  # 'mandatory', 'voluntary', 'shelter_in_place'
    authorized_by: str
    timestamp: Optional[datetime] = None
    status: str = 'active'  # 'active', 'completed', 'cancelled'
    public_message: str = ''
    affected_population: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "orderId": self.order_id,
            "zone": self.zone.to_dict(),
            "orderType": self.order_type,
            "authorizedBy": self.authorized_by,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "status": self.status,
            "publicMessage": self.public_message,
            "affectedPopulation": self.affected_population
        }


@dataclass
class DispatchRecord:
    """Dispatch record model"""
    record_id: str
    unit: EmergencyUnit
    incident: Incident
    dispatched_by: str
    dispatch_time: Optional[datetime] = None
    status: str = 'dispatched'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "recordId": self.record_id,
            "unit": self.unit.to_dict(),
            "incident": self.incident.to_dict(),
            "dispatchedBy": self.dispatched_by,
            "dispatchTime": self.dispatch_time.isoformat() if self.dispatch_time else None,
            "status": self.status
        }


@dataclass
class NotificationRecord:
    """Notification record model"""
    notification_id: str
    order: EvacuationOrder
    channel: str
    sent_at: Optional[datetime] = None
    status: str = 'sent'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "notificationId": self.notification_id,
            "order": self.order.to_dict(),
            "channel": self.channel,
            "sentAt": self.sent_at.isoformat() if self.sent_at else None,
            "status": self.status
        }


@dataclass
class RouteUsage:
    """Route usage model"""
    usage_id: str
    route: EvacuationRoute
    timestamp: Optional[datetime] = None
    vehicles_per_hour: int = 0
    average_speed: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "usageId": self.usage_id,
            "route": self.route.to_dict(),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "vehiclesPerHour": self.vehicles_per_hour,
            "averageSpeed": self.average_speed
        }


@dataclass
class ComplianceMetric:
    """Compliance metric model"""
    metric_id: str
    order: EvacuationOrder
    timestamp: Optional[datetime] = None
    compliance_rate: float = 0.0
    population_evacuated: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "metricId": self.metric_id,
            "order": self.order.to_dict(),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "complianceRate": self.compliance_rate,
            "populationEvacuated": self.population_evacuated
        }


@dataclass
class IncidentUpdate:
    """Incident update model"""
    update_id: str
    incident: Incident
    timestamp: Optional[datetime] = None
    status: str = ''
    notes: str = ''
    updated_by: str = ''
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "updateId": self.update_id,
            "incident": self.incident.to_dict(),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "status": self.status,
            "notes": self.notes,
            "updatedBy": self.updated_by
        }
