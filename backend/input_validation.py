"""
Input validation and sanitization utilities
"""

import re
from typing import Any, Dict, List, Optional
from werkzeug.exceptions import BadRequest

class InputValidator:
    """Input validation and sanitization class"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Sanitize string input"""
        if not isinstance(value, str):
            raise BadRequest("Invalid string input")
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', value)
        
        # Limit length
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized.strip()
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise BadRequest("Invalid email format")
        return email.lower()
    
    @staticmethod
    def validate_coordinates(lat: float, lon: float) -> tuple:
        """Validate geographic coordinates"""
        if not (-90 <= lat <= 90):
            raise BadRequest("Invalid latitude: must be between -90 and 90")
        if not (-180 <= lon <= 180):
            raise BadRequest("Invalid longitude: must be between -180 and 180")
        return (lat, lon)
    
    @staticmethod
    def validate_api_key(key: str) -> str:
        """Validate API key format"""
        if not key or len(key) < 10:
            raise BadRequest("Invalid API key")
        return key.strip()
    
    @staticmethod
    def sanitize_json(data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize JSON data recursively"""
        sanitized: Dict[str, Any] = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = InputValidator.sanitize_string(value)
            elif isinstance(value, dict):
                sanitized[key] = InputValidator.sanitize_json(value)
            elif isinstance(value, list):
                sanitized[key] = [InputValidator.sanitize_json(item) if isinstance(item, dict) 
                                else InputValidator.sanitize_string(item) if isinstance(item, str) 
                                else item for item in value]
            else:
                sanitized[key] = value
        return sanitized
