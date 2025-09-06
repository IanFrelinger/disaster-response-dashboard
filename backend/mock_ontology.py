"""
Mock Palantir Ontology Module for Demo Environment
This provides the necessary classes and decorators to run the ontology implementations
in a demo environment without requiring the actual Foundry platform.
"""

import structlog
from typing import Dict, List, Any, Optional, Union, Callable
from datetime import datetime
import uuid

logger = structlog.get_logger(__name__)


# Mock Ontology decorators
def ontology_object(cls: Any) -> Any:
    """Mock ontology object decorator"""
    cls._is_ontology_object = True
    return cls


def PrimaryKey() -> str:
    """Mock primary key field"""
    return "primary_key"


def String() -> str:
    """Mock string field"""
    return "string"


def Double() -> str:
    """Mock double field"""
    return "double"


def Integer() -> str:
    """Mock integer field"""
    return "integer"


def Boolean() -> str:
    """Mock boolean field"""
    return "boolean"


def DateTime() -> str:
    """Mock datetime field"""
    return "datetime"


def Link(relationship_type: str) -> Callable:
    """Mock link decorator"""
    def decorator(field: Any) -> Any:
        field._link_type = relationship_type
        return field
    return decorator


def Action(requires_role: Optional[str] = None) -> Callable:
    """Mock action decorator"""
    def decorator(method: Any) -> Any:
        method._requires_role = requires_role
        method._is_action = True
        return method
    return decorator


# Mock Ontology base classes
class OntologyObject:
    """Base class for all ontology objects"""
    
    def __init__(self, **kwargs: Any) -> None:
        self._id = str(uuid.uuid4())
        self._created_at = datetime.now()
        self._updated_at = datetime.now()
        self._audit_trail: List[Dict[str, Any]] = []
        
        # Set attributes from kwargs
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def _audit_action(self, action: str, user: str, details: Optional[Dict[str, Any]] = None) -> None:
        """Record an audit action"""
        audit_entry = {
            "timestamp": datetime.now(),
            "action": action,
            "user": user,
            "details": details or {}
        }
        self._audit_trail.append(audit_entry)
        logger.info(f"Audit: {action} by {user}", **details or {})
    
    def get_audit_trail(self) -> List[Dict[str, Any]]:
        """Get the audit trail for this object"""
        return self._audit_trail.copy()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert object to dictionary"""
        result = {}
        for attr in dir(self):
            if not attr.startswith('_') and not callable(getattr(self, attr)):
                value = getattr(self, attr)
                if not callable(value):
                    result[attr] = value
        return result


# Mock Challenge Ontology Objects
@ontology_object
class ChallengeHazardZone(OntologyObject):
    """Mock hazard zone ontology object"""
    
    def __init__(self, **kwargs: Any) -> None:
        # Define default attributes
        self.h3_cell_id = kwargs.get('h3_cell_id', '')
        self.risk_level = kwargs.get('risk_level', 'low')
        self.risk_score = kwargs.get('risk_score', 0.0)
        self.intensity = kwargs.get('intensity', 0.0)
        self.affected_population = kwargs.get('affected_population', 0)
        self.buildings_at_risk = kwargs.get('buildings_at_risk', 0)
        self.wind_speed = kwargs.get('wind_speed', 0.0)
        self.elevation = kwargs.get('elevation', 0.0)
        self.status = kwargs.get('status', 'inactive')
        
        # Initialize relationships
        self.evacuation_orders: List[Any] = []
        self.assigned_units: List[Any] = []
        self.evacuation_routes: List[Any] = []
        self.affected_buildings: List[Any] = []
        
        super().__init__(**kwargs)
    
    @Action(requires_role="emergency_commander")
    def issue_evacuation_order(self, order_type: str, authorized_by: str) -> None:
        """Issue an evacuation order for this hazard zone"""
        logger.info(f"Issuing evacuation order for {self.h3_cell_id}", 
                   order_type=order_type, authorized_by=authorized_by)
        
        # Create evacuation order
        order = ChallengeEvacuationOrder(
            hazard_zone_id=self.h3_cell_id,
            order_type=order_type,
            authorized_by=authorized_by,
            affected_population=self.affected_population
        )
        
        # Add to relationships
        self.evacuation_orders.append(order)
        
        # Update connected objects
        self._update_connected_objects(order)
        
        # Audit the action
        self._audit_action("issue_evacuation_order", authorized_by, {
            "order_type": order_type,
            "order_id": order._id
        })
        
        return order
    
    @Action(requires_role="risk_assessor")
    def update_risk_assessment(self, new_risk_level: str, new_risk_score: float, assessor: str) -> bool:
        """Update the risk assessment for this hazard zone"""
        logger.info(f"Updating risk assessment for {self.h3_cell_id}", 
                   old_level=self.risk_level, new_level=new_risk_level,
                   old_score=self.risk_score, new_score=new_risk_score)
        
        old_risk_level = self.risk_level
        old_risk_score = self.risk_score
        
        self.risk_level = new_risk_level
        self.risk_score = new_risk_score
        self._updated_at = datetime.now()
        
        # Audit the action
        self._audit_action("update_risk_assessment", assessor, {
            "old_risk_level": old_risk_level,
            "new_risk_level": new_risk_level,
            "old_risk_score": old_risk_level,
            "new_risk_score": new_risk_score
        })
        
        return True
    
    def _update_connected_objects(self, evacuation_order: Any) -> None:
        """Update all connected objects when evacuation order is issued"""
        # Update emergency units
        for unit in self.assigned_units:
            unit.status = "dispatched"
            unit.current_assignment = evacuation_order._id
        
        # Update evacuation routes
        for route in self.evacuation_routes:
            route.status = "active"
            route.evacuation_order_id = evacuation_order._id
        
        # Update buildings
        for building in self.affected_buildings:
            building.evacuation_status = "evacuation_ordered"
            building.evacuation_order_id = evacuation_order._id


@ontology_object
class ChallengeEmergencyUnit(OntologyObject):
    """Mock emergency unit ontology object"""
    
    def __init__(self, **kwargs: Any) -> None:
        self.unit_id = kwargs.get('unit_id', '')
        self.unit_type = kwargs.get('unit_type', 'fire_truck')
        self.status = kwargs.get('status', 'available')
        self.location = kwargs.get('location', '')
        self.capacity = kwargs.get('capacity', 0)
        self.current_assignment = kwargs.get('current_assignment', None)
        
        super().__init__(**kwargs)
    
    @Action(requires_role="dispatcher")
    def dispatch(self, assignment_id: str, dispatcher: str) -> bool:
        """Dispatch this unit to an assignment"""
        logger.info(f"Dispatching unit {self.unit_id}", 
                   assignment_id=assignment_id, dispatcher=dispatcher)
        
        old_status = self.status
        self.status = "dispatched"
        self.current_assignment = assignment_id
        self._updated_at = datetime.now()
        
        # Audit the action
        self._audit_action("dispatch", dispatcher, {
            "assignment_id": assignment_id,
            "old_status": old_status,
            "new_status": self.status
        })
        
        return True


@ontology_object
class ChallengeEvacuationRoute(OntologyObject):
    """Mock evacuation route ontology object"""
    
    def __init__(self, **kwargs: Any) -> None:
        self.route_id = kwargs.get('route_id', '')
        self.origin = kwargs.get('origin', '')
        self.destination = kwargs.get('destination', '')
        self.distance = kwargs.get('distance', 0.0)
        self.capacity = kwargs.get('capacity', 0)
        self.status = kwargs.get('status', 'available')
        self.evacuation_order_id = kwargs.get('evacuation_order_id', None)
        
        super().__init__(**kwargs)
    
    @Action(requires_role="route_planner")
    def activate_route(self, evacuation_order_id: str, planner: str) -> bool:
        """Activate this route for evacuation"""
        logger.info(f"Activating route {self.route_id}", 
                   evacuation_order_id=evacuation_order_id, planner=planner)
        
        old_status = self.status
        self.status = "active"
        self.evacuation_order_id = evacuation_order_id
        self._updated_at = datetime.now()
        
        # Audit the action
        self._audit_action("activate_route", planner, {
            "evacuation_order_id": evacuation_order_id,
            "old_status": old_status,
            "new_status": self.status
        })
        
        return True


@ontology_object
class ChallengeEvacuationOrder(OntologyObject):
    """Mock evacuation order ontology object"""
    
    def __init__(self, **kwargs: Any) -> None:
        self.order_id = kwargs.get('order_id', str(uuid.uuid4()))
        self.hazard_zone_id = kwargs.get('hazard_zone_id', '')
        self.order_type = kwargs.get('order_type', 'mandatory')
        self.authorized_by = kwargs.get('authorized_by', '')
        self.affected_population = kwargs.get('affected_population', 0)
        self.status = kwargs.get('status', 'issued')
        self.issued_at = kwargs.get('issued_at', datetime.now())
        self.effective_until = kwargs.get('effective_until', None)
        
        super().__init__(**kwargs)
    
    @Action(requires_role="emergency_commander")
    def cancel_order(self, reason: str, authorized_by: str) -> bool:
        """Cancel this evacuation order"""
        logger.info(f"Cancelling evacuation order {self.order_id}", 
                   reason=reason, authorized_by=authorized_by)
        
        old_status = self.status
        self.status = "cancelled"
        self._updated_at = datetime.now()
        
        # Audit the action
        self._audit_action("cancel_order", authorized_by, {
            "reason": reason,
            "old_status": old_status,
            "new_status": self.status
        })
        
        return True


@ontology_object
class ChallengeBuilding(OntologyObject):
    """Mock building ontology object"""
    
    def __init__(self, **kwargs: Any) -> None:
        self.building_id = kwargs.get('building_id', '')
        self.address = kwargs.get('address', '')
        self.building_type = kwargs.get('building_type', 'residential')
        self.occupancy = kwargs.get('occupancy', 0)
        self.evacuation_status = kwargs.get('evacuation_status', 'normal')
        self.evacuation_order_id = kwargs.get('evacuation_order_id', None)
        self.hazard_zone_id = kwargs.get('hazard_zone_id', None)
        
        super().__init__(**kwargs)
    
    @Action(requires_role="building_inspector")
    def update_evacuation_status(self, new_status: str, inspector: str) -> bool:
        """Update the evacuation status of this building"""
        logger.info(f"Updating evacuation status for building {self.building_id}", 
                   old_status=self.evacuation_status, new_status=new_status, inspector=inspector)
        
        old_status = self.evacuation_status
        self.evacuation_status = new_status
        self._updated_at = datetime.now()
        
        # Audit the action
        self._audit_action("update_evacuation_status", inspector, {
            "old_status": old_status,
            "new_status": new_status
        })
        
        return True


# Mock Ontology registry
class OntologyRegistry:
    """Mock ontology registry for managing objects"""
    
    def __init__(self) -> None:
        self._objects: Dict[str, OntologyObject] = {}
        self._types: Dict[str, Any] = {}
    
    def register_object(self, obj: OntologyObject) -> None:
        """Register an ontology object"""
        obj_type = type(obj).__name__
        if obj_type not in self._objects:
            self._objects[obj_type] = {}
        
        # Use appropriate ID field
        if hasattr(obj, 'h3_cell_id'):
            obj_id = obj.h3_cell_id
        elif hasattr(obj, 'unit_id'):
            obj_id = obj.unit_id
        elif hasattr(obj, 'route_id'):
            obj_id = obj.route_id
        elif hasattr(obj, 'order_id'):
            obj_id = obj.order_id
        elif hasattr(obj, 'building_id'):
            obj_id = obj.building_id
        else:
            obj_id = obj._id
        
        self._objects[obj_type][obj_id] = obj
        logger.info(f"Registered {obj_type} with ID {obj_id}")
    
    def get_object(self, obj_type: str, obj_id: str) -> Optional[OntologyObject]:
        """Get an ontology object by type and ID"""
        return self._objects.get(obj_type, {}).get(obj_id)
    
    def get_all_objects(self, obj_type: str) -> List[OntologyObject]:
        """Get all objects of a specific type"""
        return list(self._objects.get(obj_type, {}).values())
    
    def search_objects(self, obj_type: str, **criteria) -> List[OntologyObject]:
        """Search for objects matching criteria"""
        objects = self.get_all_objects(obj_type)
        results = []
        
        for obj in objects:
            match = True
            for key, value in criteria.items():
                if hasattr(obj, key):
                    if getattr(obj, key) != value:
                        match = False
                        break
                else:
                    match = False
                    break
            
            if match:
                results.append(obj)
        
        return results


# Global ontology registry instance
ontology_registry = OntologyRegistry()
