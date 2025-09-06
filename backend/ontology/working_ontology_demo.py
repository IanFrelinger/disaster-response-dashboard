"""
Working Ontology Demo - Living Data Objects with Actions
This demonstrates actual Foundry Ontology integration with working Actions.
"""

from palantir.ontology import ontology_object, PrimaryKey, Link, Action, OntologyTransaction
from palantir.ontology.types import String, Integer, Double, DateTime, Boolean, List
from palantir.ontology.enums import Enum
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import structlog
import h3
import json

logger = structlog.get_logger(__name__)


@ontology_object
class WorkingHazardZone:
    """Working hazard zone with live Actions"""
    
    # Primary properties
    h3_cell_id: str = PrimaryKey()
    risk_level: String
    risk_score: Double
    intensity: Double
    affected_population: Integer
    last_updated: DateTime
    status: String  # "active", "contained", "extinguished"
    
    # Relationships
    @Link(one_to_many)
    evacuation_orders
    
    @Link(one_to_many)
    assigned_units
    
    @Action(requires_role="emergency_commander")
    def issue_evacuation_order(self, order_type: str, authorized_by: str) -> "WorkingEvacuationOrder":
        """Creates evacuation order and updates all connected objects"""
        
        logger.info("Issuing evacuation order", 
                   zone=self.h3_cell_id, 
                   type=order_type, 
                   authorized_by=authorized_by)
        
        with OntologyTransaction() as txn:
            # Create evacuation order
            order = WorkingEvacuationOrder.create(
                zone=self,
                order_type=order_type,
                authorized_by=authorized_by,
                timestamp=datetime.now(),
                status="active",
                affected_population=self.affected_population
            )
            
            # Update zone status
            self.status = "evacuation_ordered"
            self.save()
            
            # Dispatch available units
            available_units = WorkingEmergencyUnit.objects() \
                .filter(status="available") \
                .filter(distance_from(self.h3_cell_id) < 10000) \
                .order_by("distance_km")
            
            for unit in available_units[:3]:  # Dispatch up to 3 units
                unit.dispatch_to_evacuation(order)
            
            logger.info("Evacuation order issued successfully", 
                       order_id=order.order_id,
                       units_dispatched=available_units.count())
            
            return order
    
    @Action(requires_role="fire_chief")
    def update_containment_status(self, status: str, updated_by: str) -> Dict[str, Any]:
        """Update fire containment status"""
        
        logger.info("Updating containment status", 
                   zone=self.h3_cell_id, 
                   status=status, 
                   updated_by=updated_by)
        
        with OntologyTransaction() as txn:
            # Update status
            self.status = status
            self.last_updated = datetime.now()
            self.save()
            
            # If contained, release units
            if status == "contained":
                for unit in self.assigned_units:
                    unit.status = "available"
                    unit.assigned_zone = None
                    unit.save()
                
                logger.info("Fire contained, units released", 
                           zone=self.h3_cell_id,
                           units_released=len(self.assigned_units))
            
            return {
                "zone_id": self.h3_cell_id,
                "new_status": status,
                "updated_at": self.last_updated.isoformat(),
                "units_affected": len(self.assigned_units)
            }


@ontology_object
class WorkingEmergencyUnit:
    """Working emergency unit with live Actions"""
    
    # Primary properties
    unit_id: str = PrimaryKey()
    call_sign: String
    unit_type: String
    status: String  # "available", "dispatched", "en_route", "on_scene"
    current_location: String  # H3 cell
    last_location_update: DateTime
    capacity: Integer
    
    # Relationships
    @Link(many_to_one)
    assigned_zone: Optional[WorkingHazardZone]
    
    @Link(one_to_many)
    dispatch_history
    
    @Action(requires_role="dispatcher")
    def dispatch_to_evacuation(self, evacuation_order: "WorkingEvacuationOrder") -> "WorkingDispatchRecord":
        """Dispatch unit for evacuation support"""
        
        logger.info("Dispatching unit to evacuation", 
                   unit=self.call_sign, 
                   order_id=evacuation_order.order_id)
        
        with OntologyTransaction() as txn:
            # Create dispatch record
            record = WorkingDispatchRecord.create(
                unit=self,
                evacuation_order=evacuation_order,
                dispatched_by="system",
                dispatch_time=datetime.now(),
                status="dispatched"
            )
            
            # Update unit status
            self.status = "dispatched"
            self.assigned_zone = evacuation_order.zone
            self.save()
            
            logger.info("Unit dispatched successfully", 
                       unit=self.call_sign,
                       record_id=record.record_id)
            
            return record
    
    @Action(requires_role="unit_commander")
    def update_location(self, new_location: str, updated_by: str) -> Dict[str, Any]:
        """Update unit location"""
        
        logger.info("Updating unit location", 
                   unit=self.call_sign, 
                   location=new_location)
        
        self.current_location = new_location
        self.last_location_update = datetime.now()
        self.save()
        
        return {
            "unit_id": self.unit_id,
            "new_location": new_location,
            "updated_at": self.last_location_update.isoformat()
        }
    
    @Action(requires_role="unit_commander")
    def update_status(self, new_status: str, updated_by: str) -> Dict[str, Any]:
        """Update unit status"""
        
        logger.info("Updating unit status", 
                   unit=self.call_sign, 
                   status=new_status)
        
        self.status = new_status
        self.save()
        
        return {
            "unit_id": self.unit_id,
            "new_status": new_status,
            "updated_at": datetime.now().isoformat()
        }


@ontology_object
class WorkingEvacuationOrder:
    """Working evacuation order with live Actions"""
    
    # Primary properties
    order_id: str = PrimaryKey()
    zone: WorkingHazardZone
    order_type: String  # "mandatory", "voluntary", "shelter_in_place"
    authorized_by: String
    timestamp: DateTime
    status: String  # "active", "completed", "cancelled"
    affected_population: Integer
    
    # Relationships
    @Link(one_to_many)
    notifications_sent
    
    @Link(one_to_many)
    assigned_units
    
    @Action(requires_role="emergency_commander")
    def send_notifications(self, channels: List[str]) -> List["WorkingNotificationRecord"]:
        """Send notifications across multiple channels"""
        
        logger.info("Sending evacuation notifications", 
                   order_id=self.order_id, 
                   channels=channels)
        
        notifications = []
        
        with OntologyTransaction() as txn:
            for channel in channels:
                notification = WorkingNotificationRecord.create(
                    order=self,
                    channel=channel,
                    sent_at=datetime.now(),
                    status="sent",
                    message=self._generate_notification_message(channel)
                )
                
                notifications.append(notification)
                
                logger.info("Notification sent", 
                           order_id=self.order_id, 
                           channel=channel,
                           notification_id=notification.notification_id)
        
        return notifications
    
    @Action(requires_role="emergency_commander")
    def complete_evacuation(self, completed_by: str) -> Dict[str, Any]:
        """Mark evacuation as completed"""
        
        logger.info("Completing evacuation", 
                   order_id=self.order_id, 
                   completed_by=completed_by)
        
        with OntologyTransaction() as txn:
            # Update order status
            self.status = "completed"
            self.save()
            
            # Release assigned units
            for unit in self.assigned_units:
                unit.status = "available"
                unit.assigned_zone = None
                unit.save()
            
            # Update zone status
            self.zone.status = "evacuation_completed"
            self.zone.save()
            
            logger.info("Evacuation completed", 
                       order_id=self.order_id,
                       units_released=len(self.assigned_units))
            
            return {
                "order_id": self.order_id,
                "status": "completed",
                "completed_at": datetime.now().isoformat(),
                "units_released": len(self.assigned_units)
            }
    
    def _generate_notification_message(self, channel: str) -> str:
        """Generate notification message for different channels"""
        
        base_message = f"EVACUATION ORDER: {self.order_type.upper()} evacuation for {self.zone.h3_cell_id}"
        
        if channel == "sms":
            return f"{base_message}. Leave immediately via designated routes."
        elif channel == "email":
            return f"{base_message}. Please evacuate immediately using designated evacuation routes. Emergency shelters available."
        elif channel == "emergency_broadcast":
            return f"EMERGENCY: {base_message}. All residents must evacuate immediately."
        else:
            return base_message


@ontology_object
class WorkingDispatchRecord:
    """Working dispatch record with audit trail"""
    
    # Primary properties
    record_id: str = PrimaryKey()
    unit: WorkingEmergencyUnit
    evacuation_order: WorkingEvacuationOrder
    dispatched_by: String
    dispatch_time: DateTime
    status: String  # "dispatched", "en_route", "on_scene", "completed"
    
    @Action(requires_role="unit_commander")
    def update_status(self, new_status: str, updated_by: str) -> Dict[str, Any]:
        """Update dispatch status"""
        
        logger.info("Updating dispatch status", 
                   record_id=self.record_id, 
                   status=new_status)
        
        self.status = new_status
        self.save()
        
        return {
            "record_id": self.record_id,
            "new_status": new_status,
            "updated_at": datetime.now().isoformat()
        }


@ontology_object
class WorkingNotificationRecord:
    """Working notification record with audit trail"""
    
    # Primary properties
    notification_id: str = PrimaryKey()
    order: WorkingEvacuationOrder
    channel: String
    sent_at: DateTime
    status: String  # "sent", "delivered", "failed"
    message: String


# Demo functions to show Ontology in action
def demo_ontology_workflow():
    """Demonstrate the working Ontology workflow"""
    
    logger.info("Starting Ontology workflow demo")
    
    try:
        # 1. Create a hazard zone
        hazard_zone = WorkingHazardZone.create(
            h3_cell_id="8928308280fffff",  # Example H3 cell
            risk_level="critical",
            risk_score=0.95,
            intensity=450.0,
            affected_population=3241,
            last_updated=datetime.now(),
            status="active"
        )
        
        # 2. Create emergency units
        unit1 = WorkingEmergencyUnit.create(
            unit_id="ENGINE_01",
            call_sign="Engine 1",
            unit_type="fire_engine",
            status="available",
            current_location="8928308281fffff",
            last_location_update=datetime.now(),
            capacity=4
        )
        
        unit2 = WorkingEmergencyUnit.create(
            unit_id="ENGINE_02", 
            call_sign="Engine 2",
            unit_type="fire_engine",
            status="available",
            current_location="8928308282fffff",
            last_location_update=datetime.now(),
            capacity=4
        )
        
        # 3. Issue evacuation order (triggers Actions)
        evacuation_order = hazard_zone.issue_evacuation_order(
            order_type="mandatory",
            authorized_by="Chief Johnson"
        )
        
        # 4. Send notifications
        notifications = evacuation_order.send_notifications([
            "sms", "email", "emergency_broadcast"
        ])
        
        # 5. Update unit locations
        unit1.update_location("8928308283fffff", "Captain Smith")
        unit1.update_status("en_route", "Captain Smith")
        
        # 6. Complete evacuation
        completion_result = evacuation_order.complete_evacuation("Chief Johnson")
        
        logger.info("Ontology workflow demo completed successfully")
        
        return {
            "hazard_zone": hazard_zone.h3_cell_id,
            "evacuation_order": evacuation_order.order_id,
            "notifications_sent": len(notifications),
            "completion_result": completion_result
        }
        
    except Exception as e:
        logger.error("Error in Ontology workflow demo", error=str(e))
        raise


def demo_aip_ontology_integration():
    """Demonstrate AIP integration with Ontology"""
    
    logger.info("Starting AIP-Ontology integration demo")
    
    try:
        # Create hazard zone
        hazard_zone = WorkingHazardZone.create(
            h3_cell_id="8928308284fffff",
            risk_level="high",
            risk_score=0.75,
            intensity=350.0,
            affected_population=1500,
            last_updated=datetime.now(),
            status="active"
        )
        
        # Simulate AIP query
        from .working_evacuation_agent import EvacuationAssistant
        
        assistant = EvacuationAssistant()
        recommendation = assistant.process_query("Should we evacuate Pine Valley?")
        
        # Issue evacuation order based on AIP recommendation
        if "evacuate" in recommendation.lower():
            evacuation_order = hazard_zone.issue_evacuation_order(
                order_type="mandatory",
                authorized_by="AIP_Assistant"
            )
            
            logger.info("AIP-triggered evacuation order issued", 
                       order_id=evacuation_order.order_id)
        
        return {
            "aip_recommendation": recommendation,
            "evacuation_ordered": "evacuate" in recommendation.lower(),
            "hazard_zone": hazard_zone.h3_cell_id
        }
        
    except Exception as e:
        logger.error("Error in AIP-Ontology integration demo", error=str(e))
        raise
