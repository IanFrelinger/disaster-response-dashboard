"""
Synthetic data generator for disaster response dashboard backend.
Generates realistic mock data for testing and demonstration purposes.
"""

import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import json


@dataclass
class HazardZone:
    """Represents a hazard zone with geographic and risk information."""
    id: str
    geometry: Dict  # GeoJSON Polygon
    risk_level: str  # 'low', 'medium', 'high', 'critical'
    last_updated: datetime
    data_source: str  # 'FIRMS', 'NOAA', 'USGS'
    risk_score: float
    h3_index: Optional[str] = None
    brightness: Optional[float] = None
    confidence: Optional[float] = None
    acq_date: Optional[datetime] = None

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'geometry': self.geometry,
            'riskLevel': self.risk_level,
            'lastUpdated': self.last_updated.isoformat(),
            'dataSource': self.data_source,
            'riskScore': self.risk_score,
            'h3Index': self.h3_index,
            'brightness': self.brightness,
            'confidence': self.confidence,
            'acqDate': self.acq_date.isoformat() if self.acq_date else None
        }


@dataclass
class SafeRoute:
    """Represents a safe evacuation route."""
    id: str
    origin: Tuple[float, float]  # [lat, lon]
    destination: Tuple[float, float]  # [lat, lon]
    route: Dict  # GeoJSON LineString
    hazard_avoided: bool
    distance: float
    estimated_time: float

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'origin': list(self.origin),
            'destination': list(self.destination),
            'route': self.route,
            'hazardAvoided': self.hazard_avoided,
            'distance': self.distance,
            'estimatedTime': self.estimated_time
        }


@dataclass
class RiskAssessment:
    """Represents a risk assessment for a specific location."""
    total_nearby_hazards: int
    risk_levels: Dict[str, int]
    avg_risk_score: float
    max_risk_score: float
    closest_hazard_distance_km: Optional[float]
    assessment_radius_km: int
    location: Dict[str, float]  # {'latitude': float, 'longitude': float}
    assessment_timestamp: str

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'totalNearbyHazards': self.total_nearby_hazards,
            'riskLevels': self.risk_levels,
            'avgRiskScore': self.avg_risk_score,
            'maxRiskScore': self.max_risk_score,
            'closestHazardDistanceKm': self.closest_hazard_distance_km,
            'assessmentRadiusKm': self.assessment_radius_km,
            'location': self.location,
            'assessmentTimestamp': self.assessment_timestamp
        }


@dataclass
class HazardSummary:
    """Represents overall hazard statistics."""
    total_hazards: int
    risk_distribution: Dict[str, int]
    data_sources: Dict[str, int]
    last_updated: str
    bbox: Optional[List[float]] = None  # [minLon, minLat, maxLon, maxLat]

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'totalHazards': self.total_hazards,
            'riskDistribution': self.risk_distribution,
            'dataSources': self.data_sources,
            'lastUpdated': self.last_updated,
            'bbox': self.bbox
        }


@dataclass
class EvacuationRoutesResponse:
    """Represents evacuation routes response."""
    routes: List[SafeRoute]
    hazard_count: int
    available_routes: int
    generated_at: str

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'routes': [route.to_dict() for route in self.routes],
            'hazardCount': self.hazard_count,
            'availableRoutes': self.available_routes,
            'generatedAt': self.generated_at
        }


class SyntheticDataGenerator:
    """Generates synthetic data for disaster response dashboard."""
    
    # San Francisco Bay Area bounds
    SAN_FRANCISCO_CENTER = (-122.4194, 37.7749)
    BAY_AREA_BOUNDS = {
        'min_lat': 37.4,
        'max_lat': 38.2,
        'min_lng': -122.8,
        'max_lng': -121.8
    }

    @staticmethod
    def random_coordinate() -> Tuple[float, float]:
        """Generate random coordinates within Bay Area bounds."""
        lat = (SyntheticDataGenerator.BAY_AREA_BOUNDS['min_lat'] + 
               random.random() * (SyntheticDataGenerator.BAY_AREA_BOUNDS['max_lat'] - 
                                SyntheticDataGenerator.BAY_AREA_BOUNDS['min_lat']))
        lng = (SyntheticDataGenerator.BAY_AREA_BOUNDS['min_lng'] + 
               random.random() * (SyntheticDataGenerator.BAY_AREA_BOUNDS['max_lng'] - 
                                SyntheticDataGenerator.BAY_AREA_BOUNDS['min_lng']))
        return (lng, lat)

    @staticmethod
    def generate_polygon(center: Tuple[float, float], radius_km: float = 0.05) -> Dict:
        """Generate a polygon around a center point."""
        center_lng, center_lat = center
        radius_deg = radius_km / 111  # Approximate conversion
        
        points = []
        for i in range(8):
            angle = (i / 8) * 2 * math.pi
            lat = center_lat + radius_deg * math.cos(angle)
            lng = center_lng + radius_deg * math.sin(angle)
            points.append([lng, lat])
        points.append(points[0])  # Close the polygon
        
        return {
            'type': 'Polygon',
            'coordinates': [points]
        }

    @staticmethod
    def generate_route(origin: Tuple[float, float], destination: Tuple[float, float]) -> Dict:
        """Generate a line string for routes."""
        origin_lng, origin_lat = origin
        dest_lng, dest_lat = destination
        
        # Create a simple route with a few waypoints
        waypoints = [
            [origin_lng, origin_lat],
            [origin_lng + (dest_lng - origin_lng) * 0.3, origin_lat + (dest_lat - origin_lat) * 0.3],
            [origin_lng + (dest_lng - origin_lng) * 0.7, origin_lat + (dest_lat - origin_lat) * 0.7],
            [dest_lng, dest_lat]
        ]
        
        return {
            'type': 'LineString',
            'coordinates': waypoints
        }

    @staticmethod
    def generate_hazard_zones(count: int = 15) -> List[HazardZone]:
        """Generate synthetic hazard zones."""
        hazard_zones = []
        risk_levels = ['low', 'medium', 'high', 'critical']
        data_sources = ['FIRMS', 'NOAA', 'USGS']

        for i in range(count):
            center = SyntheticDataGenerator.random_coordinate()
            risk_level = random.choice(risk_levels)
            data_source = random.choice(data_sources)
            
            # Risk score based on risk level
            if risk_level == 'low':
                risk_score = 0.1 + random.random() * 0.3
            elif risk_level == 'medium':
                risk_score = 0.4 + random.random() * 0.3
            elif risk_level == 'high':
                risk_score = 0.7 + random.random() * 0.2
            else:  # critical
                risk_score = 0.9 + random.random() * 0.1

            hazard_zone = HazardZone(
                id=f'hazard-{i + 1}',
                geometry=SyntheticDataGenerator.generate_polygon(center, 0.02 + random.random() * 0.08),
                risk_level=risk_level,
                risk_score=risk_score,
                last_updated=datetime.now() - timedelta(hours=random.randint(0, 24)),
                data_source=data_source,
                h3_index=f'h3-{random.randint(1000000, 9999999)}',
                brightness=300 + random.random() * 200 if risk_level in ['critical', 'high'] else None,
                confidence=70 + random.random() * 30,
                acq_date=datetime.now() - timedelta(days=random.randint(0, 7))
            )

            hazard_zones.append(hazard_zone)

        return hazard_zones

    @staticmethod
    def generate_safe_routes(count: int = 8) -> List[SafeRoute]:
        """Generate synthetic safe routes."""
        safe_routes = []

        for i in range(count):
            origin = SyntheticDataGenerator.random_coordinate()
            destination = SyntheticDataGenerator.random_coordinate()
            route = SyntheticDataGenerator.generate_route(origin, destination)
            
            # Calculate distance (simplified)
            distance = math.sqrt(
                (destination[0] - origin[0]) ** 2 + (destination[1] - origin[1]) ** 2
            ) * 111  # Rough conversion to km
            
            safe_route = SafeRoute(
                id=f'route-{i + 1}',
                origin=(origin[1], origin[0]),  # Convert to [lat, lng]
                destination=(destination[1], destination[0]),  # Convert to [lat, lng]
                route=route,
                hazard_avoided=random.random() > 0.3,  # 70% chance of avoiding hazards
                distance=distance,
                estimated_time=distance * (2 + random.random() * 3)  # 2-5 minutes per km
            )

            safe_routes.append(safe_route)

        return safe_routes

    @staticmethod
    def generate_risk_assessment(location: Tuple[float, float] = SAN_FRANCISCO_CENTER) -> RiskAssessment:
        """Generate synthetic risk assessment."""
        nearby_hazards = random.randint(1, 10)
        risk_levels = {
            'low': random.randint(0, 5),
            'medium': random.randint(0, 8),
            'high': random.randint(0, 3),
            'critical': random.randint(0, 2)
        }

        total_hazards = sum(risk_levels.values())
        avg_risk_score = 0.3 + random.random() * 0.6
        max_risk_score = 0.7 + random.random() * 0.3

        return RiskAssessment(
            total_nearby_hazards=total_hazards,
            risk_levels=risk_levels,
            avg_risk_score=avg_risk_score,
            max_risk_score=max_risk_score,
            closest_hazard_distance_km=random.random() * 5,
            assessment_radius_km=10,
            location={'latitude': location[1], 'longitude': location[0]},
            assessment_timestamp=datetime.now().isoformat()
        )

    @staticmethod
    def generate_hazard_summary() -> HazardSummary:
        """Generate synthetic hazard summary."""
        total_hazards = random.randint(20, 70)
        risk_distribution = {
            'low': random.randint(5, 20),
            'medium': random.randint(10, 30),
            'high': random.randint(3, 15),
            'critical': random.randint(1, 8)
        }

        data_sources = {
            'FIRMS': random.randint(10, 30),
            'NOAA': random.randint(5, 20),
            'USGS': random.randint(3, 15)
        }

        return HazardSummary(
            total_hazards=total_hazards,
            risk_distribution=risk_distribution,
            data_sources=data_sources,
            last_updated=datetime.now().isoformat(),
            bbox=[
                SyntheticDataGenerator.BAY_AREA_BOUNDS['min_lng'],
                SyntheticDataGenerator.BAY_AREA_BOUNDS['min_lat'],
                SyntheticDataGenerator.BAY_AREA_BOUNDS['max_lng'],
                SyntheticDataGenerator.BAY_AREA_BOUNDS['max_lat']
            ]
        )

    @staticmethod
    def generate_evacuation_routes_response() -> EvacuationRoutesResponse:
        """Generate evacuation routes response."""
        routes = SyntheticDataGenerator.generate_safe_routes(5)
        
        return EvacuationRoutesResponse(
            routes=routes,
            hazard_count=random.randint(5, 25),
            available_routes=len(routes),
            generated_at=datetime.now().isoformat()
        )

    @staticmethod
    def generate_dashboard_data() -> Dict:
        """Generate complete dashboard data."""
        return {
            'hazardZones': [zone.to_dict() for zone in SyntheticDataGenerator.generate_hazard_zones(20)],
            'safeRoutes': [route.to_dict() for route in SyntheticDataGenerator.generate_safe_routes(12)],
            'riskAssessment': SyntheticDataGenerator.generate_risk_assessment().to_dict(),
            'hazardSummary': SyntheticDataGenerator.generate_hazard_summary().to_dict(),
            'evacuationRoutes': SyntheticDataGenerator.generate_evacuation_routes_response().to_dict()
        }

    @staticmethod
    def generate_scenario_data(scenario: str) -> Dict:
        """Generate data for specific disaster scenarios with realistic business impact."""
        
        if scenario == "wildfire-napa":
            # Napa Valley Wildfire Scenario
            return {
                "hazardZones": [zone.to_dict() for zone in SyntheticDataGenerator.generate_hazard_zones(25)],
                "safeRoutes": [route.to_dict() for route in SyntheticDataGenerator.generate_safe_routes(12)],
                "riskAssessment": SyntheticDataGenerator.generate_risk_assessment().to_dict(),
                "hazardSummary": SyntheticDataGenerator.generate_hazard_summary().to_dict(),
                "evacuationRoutes": SyntheticDataGenerator.generate_evacuation_routes_response().to_dict(),
                "businessImpact": {
                    "livesProtected": 15000,
                    "propertyValueProtected": 2500000000,  # $2.5B in vineyards and homes
                    "responseTimeReduction": 65.0,
                    "costSavings": 15000000,  # $15M in emergency response costs
                    "infrastructureProtected": 8,  # Hospitals, schools, utilities
                    "evacuationEfficiency": 78.5
                },
                "emergencyDecisions": [
                    {
                        "id": "evac-001",
                        "type": "evacuation",
                        "priority": "critical",
                        "title": "Immediate Evacuation of Napa Valley",
                        "description": "Fast-moving wildfire approaching residential areas and vineyards",
                        "action": "Issue mandatory evacuation orders for all residents within 5-mile radius",
                        "impact": "Protect 15,000 lives and $2.5B in property value",
                        "resources": ["Emergency Broadcast System", "Law Enforcement", "Red Cross"],
                        "estimatedTime": "30 minutes",
                        "location": "Napa Valley, CA"
                    },
                    {
                        "id": "resource-001",
                        "type": "resource_allocation",
                        "priority": "high",
                        "title": "Deploy Firefighting Resources",
                        "description": "Coordinate firefighting efforts to protect critical infrastructure",
                        "action": "Deploy 5 fire crews to protect hospitals and evacuation routes",
                        "impact": "Maintain access to critical medical facilities",
                        "resources": ["Fire Crews", "Water Tankers", "Helicopters"],
                        "estimatedTime": "45 minutes"
                    }
                ]
            }
            
        elif scenario == "flood-sacramento":
            # Sacramento River Flood Scenario
            return {
                "hazardZones": [zone.to_dict() for zone in SyntheticDataGenerator.generate_hazard_zones(18)],
                "safeRoutes": [route.to_dict() for route in SyntheticDataGenerator.generate_safe_routes(10)],
                "riskAssessment": SyntheticDataGenerator.generate_risk_assessment().to_dict(),
                "hazardSummary": SyntheticDataGenerator.generate_hazard_summary().to_dict(),
                "evacuationRoutes": SyntheticDataGenerator.generate_evacuation_routes_response().to_dict(),
                "businessImpact": {
                    "livesProtected": 45000,
                    "propertyValueProtected": 8500000000,  # $8.5B in government and business assets
                    "responseTimeReduction": 72.0,
                    "costSavings": 25000000,  # $25M in emergency response costs
                    "infrastructureProtected": 12,  # Government buildings, utilities, transportation
                    "evacuationEfficiency": 82.0
                },
                "emergencyDecisions": [
                    {
                        "id": "evac-002",
                        "type": "evacuation",
                        "priority": "critical",
                        "title": "Downtown Sacramento Evacuation",
                        "description": "Major flooding threatening government buildings and downtown area",
                        "action": "Evacuate all government buildings and downtown businesses",
                        "impact": "Protect 45,000 lives and critical government operations",
                        "resources": ["National Guard", "Emergency Services", "Transportation"],
                        "estimatedTime": "60 minutes",
                        "location": "Sacramento, CA"
                    }
                ]
            }
            
        elif scenario == "earthquake-sf":
            # San Francisco Earthquake Scenario
            return {
                "hazardZones": [zone.to_dict() for zone in SyntheticDataGenerator.generate_hazard_zones(35)],
                "safeRoutes": [route.to_dict() for route in SyntheticDataGenerator.generate_safe_routes(15)],
                "riskAssessment": SyntheticDataGenerator.generate_risk_assessment().to_dict(),
                "hazardSummary": SyntheticDataGenerator.generate_hazard_summary().to_dict(),
                "evacuationRoutes": SyntheticDataGenerator.generate_evacuation_routes_response().to_dict(),
                "businessImpact": {
                    "livesProtected": 850000,
                    "propertyValueProtected": 15000000000,  # $15B in tech and real estate
                    "responseTimeReduction": 85.0,
                    "costSavings": 50000000,  # $50M in emergency response costs
                    "infrastructureProtected": 25,  # Tech campuses, hospitals, utilities
                    "evacuationEfficiency": 88.0
                },
                "emergencyDecisions": [
                    {
                        "id": "evac-003",
                        "type": "evacuation",
                        "priority": "critical",
                        "title": "Bay Area Mass Evacuation",
                        "description": "6.8 magnitude earthquake affecting entire Bay Area",
                        "action": "Coordinate evacuation of 850,000 people from affected areas",
                        "impact": "Protect lives and maintain critical tech sector operations",
                        "resources": ["All Emergency Services", "Tech Companies", "Transportation"],
                        "estimatedTime": "120 minutes",
                        "location": "San Francisco Bay Area"
                    }
                ]
            }
            
        elif scenario == "hurricane-miami":
            # Miami Hurricane Scenario
            return {
                "hazardZones": [zone.to_dict() for zone in SyntheticDataGenerator.generate_hazard_zones(40)],
                "safeRoutes": [route.to_dict() for route in SyntheticDataGenerator.generate_safe_routes(20)],
                "riskAssessment": SyntheticDataGenerator.generate_risk_assessment().to_dict(),
                "hazardSummary": SyntheticDataGenerator.generate_hazard_summary().to_dict(),
                "evacuationRoutes": SyntheticDataGenerator.generate_evacuation_routes_response().to_dict(),
                "businessImpact": {
                    "livesProtected": 2800000,
                    "propertyValueProtected": 25000000000,  # $25B in tourism and real estate
                    "responseTimeReduction": 90.0,
                    "costSavings": 75,  # $75M in emergency response costs
                    "infrastructureProtected": 35,  # Ports, airports, hospitals, hotels
                    "evacuationEfficiency": 92.0
                },
                "emergencyDecisions": [
                    {
                        "id": "evac-004",
                        "type": "evacuation",
                        "priority": "critical",
                        "title": "Miami-Dade County Evacuation",
                        "description": "Category 4 hurricane approaching Miami metropolitan area",
                        "action": "Execute largest evacuation in Florida history",
                        "impact": "Protect 2.8M lives and $25B in tourism assets",
                        "resources": ["FEMA", "National Guard", "All Emergency Services"],
                        "estimatedTime": "180 minutes",
                        "location": "Miami-Dade County, FL"
                    }
                ]
            }
        else:
            return SyntheticDataGenerator.generate_dashboard_data() 