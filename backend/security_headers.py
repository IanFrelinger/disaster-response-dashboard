"""
Security headers middleware for Flask application
"""

from flask import request, make_response
import re

def add_security_headers(response):
    """Add security headers to all responses"""
    
    # Content Security Policy
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com; "
        "style-src 'self' 'unsafe-inline' https://api.mapbox.com; "
        "img-src 'self' data: https://api.mapbox.com https://*.tiles.mapbox.com; "
        "font-src 'self' https://api.mapbox.com; "
        "connect-src 'self' https://api.mapbox.com https://firms.modaps.eosdis.nasa.gov https://api.weather.gov; "
        "frame-ancestors 'none';"
    )
    
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = csp_policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    
    return response

def validate_input(data):
    """Basic input validation and sanitization"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        data = re.sub(r'[<>"\']', '', data)
        # Limit length
        if len(data) > 1000:
            return data[:1000]
    return data

def rate_limit_key():
    """Generate rate limiting key based on IP and user agent"""
    return f"{request.remote_addr}:{request.headers.get('User-Agent', 'unknown')}"
