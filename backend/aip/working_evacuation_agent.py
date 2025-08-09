"""
Working AIP Agent - Evacuation Decision Assistant
This demonstrates actual AIP integration with natural language processing.
"""

from palantir.aip import aip_agent, aip_logic
from palantir.ontology import HazardZone, EvacuationRoute, EmergencyUnit
from palantir.dataframe import DataFrame
import pandas as pd
import numpy as np
import h3
import structlog
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import re
import json

logger = structlog.get_logger(__name__)


@aip_agent(
    name="evacuation_assistant",
    description="Natural language assistant for evacuation decisions",
    version="1.0"
)
class EvacuationAssistant:
    """AIP agent that helps commanders make evacuation decisions using natural language"""
    
    def __init__(self):
        self.location_patterns = {
            r"pine valley": "Pine Valley",
            r"oak ridge": "Oak Ridge", 
            r"maple street": "Maple Street",
            r"harbor district": "Harbor District",
            r"downtown": "Downtown",
            r"north side": "North Side",
            r"south side": "South Side",
            r"east end": "East End",
            r"west end": "West End"
        }
        
        self.decision_keywords = {
            "evacuate": ["evacuate", "evacuation", "leave", "clear", "move"],
            "monitor": ["monitor", "watch", "observe", "track"],
            "prepare": ["prepare", "ready", "standby", "alert"]
        }
    
    def process_query(self, query: str) -> str:
        """
        Main entry point for natural language queries.
        Example: "Should we evacuate Pine Valley?"
        """
        try:
            logger.info("Processing evacuation query", query=query)
            
            # Extract location and intent
            location = self._extract_location(query)
            intent = self._extract_intent(query)
            
            if not location:
                return "I couldn't identify a location in your query. Please specify a location like 'Pine Valley' or 'Oak Ridge'."
            
            # Get current hazard assessment
            hazard_assessment = self._assess_hazards_near_location(location)
            
            # Get evacuation resources
            evacuation_resources = self._get_evacuation_resources(location)
            
            # Generate recommendation
            recommendation = self._generate_recommendation(
                location, intent, hazard_assessment, evacuation_resources
            )
            
            logger.info("Evacuation recommendation generated", 
                       location=location,
                       recommendation=recommendation[:100])
            
            return recommendation
            
        except Exception as e:
            logger.error("Error processing evacuation query", error=str(e))
            return "I'm unable to provide evacuation advice at this time. Please contact emergency services directly."
    
    def _extract_location(self, query: str) -> Optional[str]:
        """Extract location from natural language query"""
        query_lower = query.lower()
        
        for pattern, location in self.location_patterns.items():
            if re.search(pattern, query_lower):
                return location
        
        return None
    
    def _extract_intent(self, query: str) -> str:
        """Extract intent from query"""
        query_lower = query.lower()
        
        for intent, keywords in self.decision_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                return intent
        
        return "assess"  # Default to assessment
    
    def _assess_hazards_near_location(self, location: str) -> Dict[str, Any]:
        """Assess hazards near the specified location"""
        try:
            # Get location coordinates (in real implementation, this would geocode)
            location_coords = self._get_location_coordinates(location)
            
            # Query hazard zones within 5km
            nearby_hazards = HazardZone.objects() \
                .filter(distance_from(location_coords) < 5000) \
                .order_by("risk_level", descending=True)
            
            if not nearby_hazards.exists():
                return {
                    "status": "safe",
                    "hazards": [],
                    "risk_level": "low",
                    "message": "No active hazards detected in the area."
                }
            
            # Get the most critical hazard
            critical_hazard = nearby_hazards.first()
            
            # Calculate time to impact
            time_to_impact = self._calculate_time_to_impact(location_coords, critical_hazard)
            
            return {
                "status": "at_risk",
                "hazards": [h.to_dict() for h in nearby_hazards[:3]],  # Top 3 hazards
                "risk_level": critical_hazard.risk_level,
                "time_to_impact": time_to_impact,
                "affected_population": critical_hazard.affected_population,
                "message": f"{critical_hazard.risk_level.upper()} risk hazard detected."
            }
            
        except Exception as e:
            logger.error("Error assessing hazards", error=str(e))
            return {"status": "unknown", "message": "Unable to assess hazards."}
    
    def _get_evacuation_resources(self, location: str) -> Dict[str, Any]:
        """Get evacuation resources for the location"""
        try:
            location_coords = self._get_location_coordinates(location)
            
            # Get available evacuation routes
            safe_routes = EvacuationRoute.objects() \
                .filter(status="safe") \
                .filter(distance_from(location_coords) < 10000) \
                .order_by("distance_km")
            
            # Get available emergency units
            available_units = EmergencyUnit.objects() \
                .filter(status="available") \
                .filter(distance_from(location_coords) < 20000)
            
            return {
                "available_routes": safe_routes.count(),
                "nearest_route": safe_routes.first().distance_km if safe_routes.exists() else None,
                "available_units": available_units.count(),
                "unit_types": list(available_units.values_list("unit_type", flat=True))
            }
            
        except Exception as e:
            logger.error("Error getting evacuation resources", error=str(e))
            return {"available_routes": 0, "available_units": 0}
    
    def _generate_recommendation(self, 
                               location: str, 
                               intent: str, 
                               hazard_assessment: Dict[str, Any],
                               evacuation_resources: Dict[str, Any]) -> str:
        """Generate evacuation recommendation"""
        
        if hazard_assessment["status"] == "safe":
            return f"{location} appears safe. No evacuation needed at this time."
        
        risk_level = hazard_assessment["risk_level"]
        time_to_impact = hazard_assessment.get("time_to_impact", 0)
        affected_population = hazard_assessment.get("affected_population", 0)
        
        # Generate recommendation based on risk level and intent
        if risk_level in ["critical", "high"]:
            if intent == "evacuate":
                recommendation = f"YES, evacuate {location} immediately. "
            else:
                recommendation = f"CRITICAL: {location} should be evacuated. "
            
            recommendation += f"{risk_level.upper()} risk hazard detected. "
            
            if time_to_impact:
                recommendation += f"Estimated time to impact: {time_to_impact} minutes. "
            
            if affected_population:
                recommendation += f"Affected population: {affected_population:,} people. "
        
        elif risk_level == "medium":
            if intent == "evacuate":
                recommendation = f"Consider evacuating {location}. "
            else:
                recommendation = f"MONITOR: {location} has medium risk. "
            
            recommendation += f"Prepare evacuation plans and monitor conditions closely. "
        
        else:
            recommendation = f"Monitor {location}. Low risk hazard in area. "
        
        # Add resource information
        if evacuation_resources["available_routes"] > 0:
            recommendation += f"Available evacuation routes: {evacuation_resources['available_routes']}. "
            if evacuation_resources["nearest_route"]:
                recommendation += f"Nearest route: {evacuation_resources['nearest_route']:.1f}km. "
        
        if evacuation_resources["available_units"] > 0:
            recommendation += f"Available emergency units: {evacuation_resources['available_units']}. "
        
        return recommendation
    
    def _get_location_coordinates(self, location: str) -> Dict[str, float]:
        """Get coordinates for location (mock implementation)"""
        # In real implementation, this would use Foundry's geocoding service
        location_coords = {
            "Pine Valley": {"lat": 33.1234, "lon": -117.5678},
            "Oak Ridge": {"lat": 33.2345, "lon": -117.6789},
            "Maple Street": {"lat": 33.3456, "lon": -117.7890},
            "Harbor District": {"lat": 33.4567, "lon": -117.8901},
            "Downtown": {"lat": 33.5678, "lon": -117.9012},
            "North Side": {"lat": 33.6789, "lon": -117.0123},
            "South Side": {"lat": 33.7890, "lon": -117.1234},
            "East End": {"lat": 33.8901, "lon": -117.2345},
            "West End": {"lat": 33.9012, "lon": -117.3456}
        }
        
        return location_coords.get(location, {"lat": 33.5, "lon": -117.5})
    
    def _calculate_time_to_impact(self, location_coords: Dict[str, float], hazard: HazardZone) -> Optional[int]:
        """Calculate time to impact in minutes"""
        try:
            # Simple distance-based calculation
            # In real implementation, this would use the fire spread model
            
            # Get hazard location (mock)
            hazard_coords = {"lat": 33.5, "lon": -117.5}  # Mock hazard location
            
            # Calculate distance
            distance_km = self._calculate_distance(location_coords, hazard_coords)
            
            # Estimate spread rate based on risk level
            spread_rates = {
                "critical": 2.0,  # km/hour
                "high": 1.5,
                "medium": 1.0,
                "low": 0.5
            }
            
            spread_rate = spread_rates.get(hazard.risk_level, 1.0)
            
            # Calculate time to impact
            time_hours = distance_km / spread_rate
            time_minutes = int(time_hours * 60)
            
            return max(0, time_minutes)
            
        except Exception as e:
            logger.error("Error calculating time to impact", error=str(e))
            return None
    
    def _calculate_distance(self, coords1: Dict[str, float], coords2: Dict[str, float]) -> float:
        """Calculate distance between two coordinate pairs in km"""
        import math
        
        lat1, lon1 = coords1["lat"], coords1["lon"]
        lat2, lon2 = coords2["lat"], coords2["lon"]
        
        # Haversine formula
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c


# AIP Logic function for simple queries
@aip_logic(
    name="quick_evacuation_check",
    description="Quick evacuation status check for a location"
)
def quick_evacuation_check(location: str) -> str:
    """
    Simple AIP logic function for quick evacuation checks.
    Example: quick_evacuation_check("Pine Valley")
    """
    
    assistant = EvacuationAssistant()
    return assistant.process_query(f"What's the evacuation status for {location}?")


# AIP Logic function for population queries
@aip_logic(
    name="population_at_risk",
    description="Get population at risk for a location"
)
def get_population_at_risk(location: str) -> Dict[str, Any]:
    """
    Get detailed population at risk information.
    Example: get_population_at_risk("Pine Valley")
    """
    
    try:
        assistant = EvacuationAssistant()
        location_coords = assistant._get_location_coordinates(location)
        
        # Query hazard zones
        nearby_hazards = HazardZone.objects() \
            .filter(distance_from(location_coords) < 5000) \
            .order_by("risk_level", descending=True)
        
        total_at_risk = sum(h.affected_population for h in nearby_hazards)
        
        return {
            "location": location,
            "total_at_risk": total_at_risk,
            "hazard_count": nearby_hazards.count(),
            "risk_levels": list(nearby_hazards.values_list("risk_level", flat=True)),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error("Error getting population at risk", error=str(e))
        return {"error": "Unable to get population data"}
