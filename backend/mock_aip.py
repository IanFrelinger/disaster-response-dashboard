"""
Mock Palantir AIP Module for Demo Environment
This provides the necessary classes and decorators to run the AIP implementations
in a demo environment without requiring the actual Foundry platform.
"""

import structlog
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random

logger = structlog.get_logger(__name__)


# Mock AIP agent decorator
def aip_agent(name: str, description: str, version: str = "1.0"):
    """Mock AIP agent decorator"""
    def decorator(cls):
        cls._aip_metadata = {
            "name": name,
            "description": description,
            "version": version
        }
        return cls
    return decorator


# Mock AIP functions
def quick_evacuation_check(location: str) -> str:
    """Mock quick evacuation check function"""
    # Simulate different evacuation statuses based on location
    statuses = {
        "Pine Valley": "CRITICAL - Immediate evacuation required. 3,241 residents affected. 3 safe routes available.",
        "Oak Ridge": "MONITOR - Medium risk. Prepare evacuation plans and monitor conditions closely.",
        "Harbor District": "SAFE - No evacuation needed at this time. Continue to monitor local emergency broadcasts.",
        "Downtown": "HIGH - Evacuation recommended within 30 minutes. 8,947 residents affected."
    }
    
    return statuses.get(location, "UNKNOWN - Location not found in current hazard assessment.")


def get_population_at_risk(location: str) -> Dict[str, Any]:
    """Mock population at risk function"""
    # Simulate population data
    populations = {
        "Pine Valley": {
            "total_population": 3241,
            "at_risk": 3241,
            "evacuated": 0,
            "remaining": 3241
        },
        "Oak Ridge": {
            "total_population": 1847,
            "at_risk": 923,
            "evacuated": 0,
            "remaining": 923
        },
        "Harbor District": {
            "total_population": 5672,
            "at_risk": 0,
            "evacuated": 0,
            "remaining": 0
        },
        "Downtown": {
            "total_population": 8947,
            "at_risk": 8947,
            "evacuated": 0,
            "remaining": 8947
        }
    }
    
    return populations.get(location, {
        "total_population": 0,
        "at_risk": 0,
        "evacuated": 0,
        "remaining": 0
    })


def predict_fire_spread(location: str) -> Dict[str, Any]:
    """Mock fire spread prediction function"""
    # Simulate fire spread predictions
    predictions = {
        "Pine Valley": {
            "time_to_reach": 47,
            "confidence": 0.87,
            "spread_direction": "northeast",
            "wind_factor": "high",
            "terrain_factor": "moderate"
        },
        "Oak Ridge": {
            "time_to_reach": 120,
            "confidence": 0.65,
            "spread_direction": "east",
            "wind_factor": "medium",
            "terrain_factor": "low"
        },
        "Harbor District": {
            "time_to_reach": None,
            "confidence": 0.95,
            "spread_direction": None,
            "wind_factor": "low",
            "terrain_factor": "low"
        },
        "Downtown": {
            "time_to_reach": 23,
            "confidence": 0.92,
            "spread_direction": "west",
            "wind_factor": "high",
            "terrain_factor": "low"
        }
    }
    
    return predictions.get(location, {
        "time_to_reach": None,
        "confidence": 0.0,
        "spread_direction": None,
        "wind_factor": "unknown",
        "terrain_factor": "unknown"
    })


# Mock EvacuationCommander class
@aip_agent(
    name="evacuation_commander",
    description="Natural language assistant for evacuation decisions",
    version="2.0"
)
class EvacuationCommander:
    """Mock AIP agent for evacuation decisions"""
    
    def __init__(self):
        self.name = "evacuation_commander"
        self.version = "2.0"
        self.description = "Natural language assistant for evacuation decisions"
    
    def process_query(self, query: str) -> str:
        """Process natural language evacuation queries"""
        query_lower = query.lower()
        
        # Extract location from query
        locations = ["Pine Valley", "Oak Ridge", "Harbor District", "Downtown"]
        location = None
        for loc in locations:
            if loc.lower() in query_lower:
                location = loc
                break
        
        if not location:
            return "I need a specific location to provide evacuation guidance. Please specify a location."
        
        # Analyze query intent
        if "evacuate" in query_lower or "should we evacuate" in query_lower:
            return self._analyze_evacuation_need(location)
        elif "status" in query_lower:
            return self._get_evacuation_status(location)
        elif "people" in query_lower or "population" in query_lower:
            return self._get_population_info(location)
        elif "reach" in query_lower or "fire" in query_lower:
            return self._predict_fire_spread(location)
        else:
            return self._general_evacuation_guidance(location)
    
    def _analyze_evacuation_need(self, location: str) -> str:
        """Analyze if evacuation is needed for a location"""
        if location == "Pine Valley":
            return "YES, evacuate Pine Valley immediately. CRITICAL risk hazard detected. Fire predicted to reach Pine Valley in 47 minutes. Affected population: 3,241 people. Available evacuation routes: 3. Nearest route: 2.3km."
        elif location == "Oak Ridge":
            return "MONITOR: Oak Ridge has medium risk. Prepare evacuation plans and monitor conditions closely. Available evacuation routes: 2. Available emergency units: 4."
        elif location == "Harbor District":
            return "Harbor District appears safe. No evacuation needed at this time. Continue to monitor local emergency broadcasts."
        elif location == "Downtown":
            return "YES, fire predicted to reach Downtown in 23 minutes. HIGH risk hazard detected. Affected population: 8,947 people. Available evacuation routes: 5. Available emergency units: 12."
        else:
            return f"Unable to assess evacuation need for {location}. Please check with local emergency services."
    
    def _get_evacuation_status(self, location: str) -> str:
        """Get current evacuation status for a location"""
        if location == "Pine Valley":
            return "Pine Valley evacuation status: CRITICAL - Immediate evacuation required. 3,241 residents affected. 3 safe routes available."
        elif location == "Oak Ridge":
            return "Oak Ridge evacuation status: MONITOR - Medium risk. Prepare evacuation plans and monitor conditions closely. Available evacuation routes: 2. Available emergency units: 4."
        elif location == "Harbor District":
            return "Harbor District evacuation status: SAFE - No evacuation needed at this time. Continue to monitor local emergency broadcasts."
        elif location == "Downtown":
            return "Downtown evacuation status: HIGH - Evacuation recommended within 30 minutes. 8,947 residents affected. Available evacuation routes: 5. Available emergency units: 12."
        else:
            return f"Evacuation status unknown for {location}. Please check with local emergency services."
    
    def _get_population_info(self, location: str) -> str:
        """Get population information for a location"""
        pop_data = get_population_at_risk(location)
        if pop_data["at_risk"] > 0:
            return f"{location} has {pop_data['at_risk']} people at risk. Total population: {pop_data['total_population']}. Evacuated: {pop_data['evacuated']}. Remaining: {pop_data['remaining']}."
        else:
            return f"{location} appears safe with no population currently at risk. Total population: {pop_data['total_population']}."
    
    def _predict_fire_spread(self, location: str) -> str:
        """Predict fire spread to a location"""
        prediction = predict_fire_spread(location)
        if prediction["time_to_reach"]:
            return f"YES, fire predicted to reach {location} in {prediction['time_to_reach']} minutes. Confidence: {prediction['confidence']:.0%}. Wind factor: {prediction['wind_factor']}. Terrain factor: {prediction['terrain_factor']}."
        else:
            return f"Fire is NOT predicted to reach {location} based on current conditions. Confidence: {prediction['confidence']:.0%}."
    
    def _general_evacuation_guidance(self, location: str) -> str:
        """Provide general evacuation guidance for a location"""
        return f"For {location}: Please follow local emergency instructions. Monitor official channels for updates. Have an evacuation plan ready. Know your evacuation routes."
    
    def get_available_actions(self) -> List[str]:
        """Get list of available actions"""
        return [
            "process_query(query)",
            "analyze_evacuation_need(location)",
            "get_evacuation_status(location)",
            "get_population_info(location)",
            "predict_fire_spread(location)"
        ]
    
    def get_metadata(self) -> Dict[str, Any]:
        """Get AIP agent metadata"""
        return getattr(self, '_aip_metadata', {
            "name": self.name,
            "description": self.description,
            "version": self.version
        })


# Mock fire spread model
class FireSpreadModel:
    """Mock fire spread prediction model"""
    
    def __init__(self):
        self.model_version = "2.1"
        self.last_updated = datetime.now()
    
    def predict_spread(self, location: str, wind_speed: float, temperature: float) -> Dict[str, Any]:
        """Predict fire spread to a location"""
        # Simple mock prediction based on wind and temperature
        base_time = 60  # minutes
        
        if wind_speed > 25:
            time_multiplier = 0.5  # Faster spread
        elif wind_speed > 15:
            time_multiplier = 0.8  # Moderate spread
        else:
            time_multiplier = 1.2  # Slower spread
        
        if temperature > 30:
            temp_multiplier = 0.7  # Faster spread in hot weather
        else:
            temp_multiplier = 1.0
        
        predicted_time = int(base_time * time_multiplier * temp_multiplier)
        
        return {
            "time_to_reach": predicted_time,
            "confidence": random.uniform(0.7, 0.95),
            "wind_factor": "high" if wind_speed > 25 else "medium" if wind_speed > 15 else "low",
            "temperature_factor": "high" if temperature > 30 else "medium" if temperature > 20 else "low"
        }
