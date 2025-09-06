"""
Security headers middleware for Flask application
"""

from flask import request, make_response, Response
from typing import Any, Union
import re

def add_security_headers(response: Response) -> Response:
    """Add security headers to all responses"""
    
    # Content Security Policy - Updated to allow localhost connections
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com; "
        "style-src 'self' 'unsafe-inline' https://api.mapbox.com; "
        "img-src 'self' data: https://api.mapbox.com https://*.tiles.mapbox.com; "
        "font-src 'self' https://api.mapbox.com; "
        "connect-src 'self' http://localhost:3000 http://localhost:8000 https://api.mapbox.com https://firms.modaps.eosdis.nasa.gov https://api.weather.gov; "
        "frame-ancestors 'none';"
    )
    
    # Security headers (but preserve CORS headers)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = csp_policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    
    # Ensure CORS headers are preserved
    if 'Access-Control-Allow-Origin' not in response.headers:
        # Add CORS headers if they're missing
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    return response

def validate_input(data: Any) -> Any:
    """Basic input validation and sanitization"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        data = re.sub(r'[<>"\']', '', data)
        # Limit length
        if len(data) > 1000:
            return data[:1000]
    return data

def rate_limit_key() -> str:
    """Generate rate limiting key based on IP and user agent"""
    return f"{request.remote_addr}:{request.headers.get('User-Agent', 'unknown')}"
