"""
Foundry Ontology - Living Data Objects
Defines relationships that automatically sync across all systems.
"""

from palantir.ontology import ontology_object, PrimaryKey, Link, Action
from palantir.ontology.types import String, Integer, Double, DateTime, Boolean, List
from palantir.ontology.enums import Enum
from datetime import datetime
from typing import List, Optional
import structlog

logger = structlog.get_logger(__name__)


class RiskLevel(Enum):
    """Risk level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class UnitType(Enum):
    """Emergency unit types"""
    FIRE_ENGINE = "fire_engine"
    AMBULANCE = "ambulance"
    POLICE = "police"
    HELICOPTER = "helicopter"
    COMMAND = "command"


class UnitStatus(Enum):
    """Unit status enumeration"""
    AVAILABLE = "available"
    DISPATCHED = "dispatched"
    EN_ROUTE = "en_route"
    ON_SCENE = "on_scene"
    RETURNING = "returning"
    OUT_OF_SERVICE = "out_of_service"


@ontology_object
class HazardZone:
    """Hazard zone with automatic relationship updates"""
    
    # Primary properties
    h3_cell_id: str = PrimaryKey()
    risk_level: RiskLevel
    risk_score: Double
    intensity: Double
    confidence: Double
    affected_population: Integer
    buildings_at_risk: Integer
    latest_detection: DateTime
    wind_speed: Double
    last_updated: DateTime
    
    # Relationships that update dynamically
    @Link(many_to_many)
    evacuation_routes: List["EvacuationRoute"]
    
    @Link(one_to_many)
    assigned_resources: List["EmergencyUnit"]
    
    @Link(one_to_many)
    evacuation_orders: List["EvacuationOrder"]
    
    @Link(one_to_many)
    affected_buildings: List["Building"]
    
    @Action(requires_role="emergency_commander")
    def issue_evacuation_order(self, order_type: str, authorized_by: str) -> "EvacuationOrder":
        """Creates auditable record of evacuation orders"""
        logger.info("Issuing evacuation order", 
                   zone=self.h3_cell_id, 
                   type=order_type, 
                   authorized_by=authorized_by)
        
        order = EvacuationOrder.create(
            zone=self,
            order_type=order_type,
            authorized_by=authorized_by,
            timestamp=datetime.now(),
            status="active"
        )
        
        # Automatically update all connected objects
        self._update_connected_objects(order)
        
        return order
    
    def _update_connected_objects(self, order: "EvacuationOrder"):
        """Update all connected objects when evacuation is ordered"""
        # Mark routes as compromised
        for route in self.evacuation_routes:
            route.status = "compromised"
            route.save()
        
        # Reassign resources
        for unit in self.assigned_resources:
            if unit.status == UnitStatus.AVAILABLE:
                unit.dispatch_to_evacuation(order)
        
        # Update building status
        for building in self.affected_buildings:
            building.evacuation_status = "ordered"
            building.save()


@ontology_object
class EmergencyUnit:
    """Emergency response unit with real-time status"""
    
    # Primary properties
    unit_id: str = PrimaryKey()
    call_sign: String
    unit_type: UnitType
    status: UnitStatus
    current_location: String  # H3 cell
    last_location_update: DateTime
    capacity: Integer
    equipment: List[String]
    
    # Relationships
    @Link(many_to_one)
    current_incident: Optional["Incident"]
    
    @Link(many_to_one)
    assigned_zone: Optional[HazardZone]
    
    @Link(one_to_many)
    dispatch_history: List["DispatchRecord"]
    
    @Action(requires_role="dispatcher")
    def dispatch_to_incident(self, incident_id: str, dispatcher: str) -> "DispatchRecord":
        """Dispatch unit to incident with audit trail"""
        incident = Incident.get(incident_id)
        
        record = DispatchRecord.create(
            unit=self,
            incident=incident,
            dispatched_by=dispatcher,
            dispatch_time=datetime.now(),
            status="dispatched"
        )
        
        # Update unit status
        self.status = UnitStatus.DISPATCHED
        self.current_incident = incident
        self.save()
        
        logger.info("Unit dispatched", 
                   unit=self.call_sign, 
                   incident=incident_id, 
                   dispatcher=dispatcher)
        
        return record
    
    def dispatch_to_evacuation(self, evacuation_order: "EvacuationOrder"):
        """Dispatch unit for evacuation support"""
        self.status = UnitStatus.DISPATCHED
        self.assigned_zone = evacuation_order.zone
        self.save()
        
        logger.info("Unit assigned to evacuation", 
                   unit=self.call_sign, 
                   zone=evacuation_order.zone.h3_cell_id)


@ontology_object
class EvacuationRoute:
    """Safe evacuation route with hazard avoidance"""
    
    # Primary properties
    route_id: str = PrimaryKey()
    origin_h3: String
    destination_h3: String
    route_geometry: String  # GeoJSON
    distance_km: Double
    estimated_time_minutes: Integer
    capacity_per_hour: Integer
    status: String  # "safe", "compromised", "closed"
    last_updated: DateTime
    
    # Relationships
    @Link(many_to_many)
    hazard_zones: List[HazardZone]
    
    @Link(one_to_many)
    route_usage: List["RouteUsage"]
    
    def update_status(self):
        """Automatically update route status based on hazard zones"""
        compromised_hazards = [h for h in self.hazard_zones if h.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]]
        
        if compromised_hazards:
            self.status = "compromised"
            logger.warning("Route compromised", 
                          route=self.route_id, 
                          hazard_count=len(compromised_hazards))
        else:
            self.status = "safe"
        
        self.save()


@ontology_object
class EvacuationOrder:
    """Evacuation order with full audit trail"""
    
    # Primary properties
    order_id: str = PrimaryKey()
    zone: HazardZone
    order_type: String  # "mandatory", "voluntary", "shelter_in_place"
    authorized_by: String
    timestamp: DateTime
    status: String  # "active", "completed", "cancelled"
    public_message: String
    affected_population: Integer
    
    # Relationships
    @Link(one_to_many)
    notifications_sent: List["NotificationRecord"]
    
    @Link(one_to_many)
    compliance_metrics: List["ComplianceMetric"]
    
    def send_notifications(self, channels: List[str]):
        """Send notifications across multiple channels"""
        for channel in channels:
            notification = NotificationRecord.create(
                order=self,
                channel=channel,
                sent_at=datetime.now(),
                status="sent"
            )
            
            # In real implementation, this would trigger actual notifications
            logger.info("Notification sent", 
                       order=self.order_id, 
                       channel=channel)


@ontology_object
class Building:
    """Building with evacuation status"""
    
    # Primary properties
    building_id: str = PrimaryKey()
    address: String
    building_type: String
    occupancy: Integer
    h3_cell: String
    evacuation_status: String  # "normal", "ordered", "evacuated"
    last_status_update: DateTime
    
    # Relationships
    @Link(many_to_one)
    hazard_zone: Optional[HazardZone]


@ontology_object
class Incident:
    """Emergency incident with full tracking"""
    
    # Primary properties
    incident_id: str = PrimaryKey()
    incident_type: String
    location_h3: String
    reported_at: DateTime
    status: String  # "active", "resolved", "closed"
    severity: String
    description: String
    
    # Relationships
    @Link(one_to_many)
    assigned_units: List[EmergencyUnit]
    
    @Link(one_to_many)
    updates: List["IncidentUpdate"]


# Supporting objects for audit trails
@ontology_object
class DispatchRecord:
    """Audit trail for unit dispatches"""
    record_id: str = PrimaryKey()
    unit: EmergencyUnit
    incident: Incident
    dispatched_by: String
    dispatch_time: DateTime
    status: String


@ontology_object
class NotificationRecord:
    """Audit trail for notifications"""
    notification_id: str = PrimaryKey()
    order: EvacuationOrder
    channel: String
    sent_at: DateTime
    status: String


@ontology_object
class RouteUsage:
    """Track route usage during evacuations"""
    usage_id: str = PrimaryKey()
    route: EvacuationRoute
    timestamp: DateTime
    vehicles_per_hour: Integer
    average_speed: Double


@ontology_object
class ComplianceMetric:
    """Track evacuation compliance"""
    metric_id: str = PrimaryKey()
    order: EvacuationOrder
    timestamp: DateTime
    compliance_rate: Double
    population_evacuated: Integer


@ontology_object
class IncidentUpdate:
    """Incident status updates"""
    update_id: str = PrimaryKey()
    incident: Incident
    timestamp: DateTime
    status: String
    notes: String
    updated_by: String
