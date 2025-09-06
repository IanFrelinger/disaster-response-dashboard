"""
Rate limiting configuration for API endpoints
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request, Flask
from typing import Any

# Rate limiting configuration
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Specific rate limits for different endpoints
def configure_rate_limits(app: Flask) -> None:
    """Configure rate limits for different endpoints"""
    
    # Public endpoints - more lenient
    @app.route('/api/health')
    @limiter.limit("100 per minute")
    def health_check() -> Any:
        pass
    
    # API endpoints - moderate limits
    @app.route('/api/dashboard')
    @limiter.limit("60 per minute")
    def dashboard() -> Any:
        pass
    
    # Authentication endpoints - stricter limits
    @app.route('/api/auth/login')
    @limiter.limit("5 per minute")
    def login() -> Any:
        pass
    
    # Admin endpoints - very strict limits
    @app.route('/api/admin')
    @limiter.limit("10 per hour")
    def admin() -> Any:
        pass

# Custom rate limiting for different user types
def get_rate_limit_key() -> str:
    """Get rate limiting key based on user type and IP"""
    user_type = request.headers.get('X-User-Type', 'anonymous')
    return f"{get_remote_address()}:{user_type}"
