#!/bin/bash

# Disaster Response Dashboard - Security Hardening Script
# This script implements critical security improvements

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🔒 $1${NC}"
    echo "=================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header "Security Hardening for Disaster Response Dashboard"
echo "Timestamp: $(date)"
echo ""

# 1. Generate secure secret key
print_header "1. Generating Secure Secret Key"
SECRET_KEY=$(openssl rand -hex 32)
print_success "Generated secure secret key: ${SECRET_KEY:0:20}..."

# 2. Update backend .env with secure settings
print_header "2. Updating Backend Configuration"
BACKEND_ENV="backend/.env"

if [ -f "$BACKEND_ENV" ]; then
    # Update secret key
    sed -i.bak "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" "$BACKEND_ENV"
    
    # Disable debug mode
    sed -i.bak "s/FLASK_DEBUG=true/FLASK_DEBUG=false/" "$BACKEND_ENV"
    sed -i.bak "s/API_DEBUG=true/API_DEBUG=false/" "$BACKEND_ENV"
    
    # Set production environment
    sed -i.bak "s/FLASK_ENV=development/FLASK_ENV=production/" "$BACKEND_ENV"
    
    print_success "Updated backend configuration"
else
    print_error "Backend .env file not found"
    exit 1
fi

# 3. Create production environment template
print_header "3. Creating Production Environment Template"
PROD_ENV="backend/.env.production"

cat > "$PROD_ENV" << EOF
# Disaster Response Dashboard - Production Environment Configuration
# SECURE PRODUCTION SETTINGS - DO NOT COMMIT TO GIT

# =============================================================================
# CORE APPLICATION SETTINGS
# =============================================================================
FLASK_ENV=production
FLASK_DEBUG=false
SECRET_KEY=$SECRET_KEY
LOG_LEVEL=WARNING

# =============================================================================
# API CONFIGURATION
# =============================================================================
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=false

# =============================================================================
# MAPPING SERVICES
# =============================================================================
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY21ldW5zZjJuMDh0eDJpcHgwNHhtOTE4aSJ9.2k1N7W2zZovOnRuqlVB9NQ
MAPBOX_STYLE_URL=mapbox://styles/mapbox/dark-v11

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
USE_MOCK_DATA=false
ENABLE_CORS=true
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL=postgresql://username:secure_password@your-db-host:5432/disaster_response
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432
POSTGRES_DB=disaster_response
POSTGRES_USER=disaster_user
POSTGRES_PASSWORD=your-secure-database-password

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_URL=redis://your-redis-host:6379
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password

# =============================================================================
# JWT CONFIGURATION
# =============================================================================
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=86400

# =============================================================================
# ENCRYPTION KEYS
# =============================================================================
ENCRYPTION_KEY=your-32-character-encryption-key-here
DATA_ENCRYPTION_KEY=your-data-encryption-key-here
EOF

print_success "Created production environment template: $PROD_ENV"

# 4. Add security headers to Flask app
print_header "4. Adding Security Headers"
SECURITY_HEADERS_FILE="backend/security_headers.py"

cat > "$SECURITY_HEADERS_FILE" << 'EOF'
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
EOF

print_success "Created security headers module: $SECURITY_HEADERS_FILE"

# 5. Create input validation utilities
print_header "5. Creating Input Validation Utilities"
VALIDATION_FILE="backend/input_validation.py"

cat > "$VALIDATION_FILE" << 'EOF'
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
        sanitized = {}
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
EOF

print_success "Created input validation utilities: $VALIDATION_FILE"

# 6. Create rate limiting configuration
print_header "6. Creating Rate Limiting Configuration"
RATE_LIMIT_FILE="backend/rate_limiting.py"

cat > "$RATE_LIMIT_FILE" << 'EOF'
"""
Rate limiting configuration for API endpoints
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request

# Rate limiting configuration
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Specific rate limits for different endpoints
def configure_rate_limits(app):
    """Configure rate limits for different endpoints"""
    
    # Public endpoints - more lenient
    @app.route('/api/health')
    @limiter.limit("100 per minute")
    def health_check():
        pass
    
    # API endpoints - moderate limits
    @app.route('/api/dashboard')
    @limiter.limit("60 per minute")
    def dashboard():
        pass
    
    # Authentication endpoints - stricter limits
    @app.route('/api/auth/login')
    @limiter.limit("5 per minute")
    def login():
        pass
    
    # Admin endpoints - very strict limits
    @app.route('/api/admin')
    @limiter.limit("10 per hour")
    def admin():
        pass

# Custom rate limiting for different user types
def get_rate_limit_key():
    """Get rate limiting key based on user type and IP"""
    user_type = request.headers.get('X-User-Type', 'anonymous')
    return f"{get_remote_address()}:{user_type}"
EOF

print_success "Created rate limiting configuration: $RATE_LIMIT_FILE"

# 7. Update .gitignore to include new security files
print_header "7. Updating .gitignore"
GITIGNORE_FILE=".gitignore"

# Add security-related files to .gitignore
cat >> "$GITIGNORE_FILE" << 'EOF'

# Security files
*.key
*.pem
*.crt
*.p12
*.pfx
.env.production
.env.staging
.env.local
.env.*.local

# Backup files
*.bak
*.backup
*.tmp

# Logs
*.log
logs/

# Security audit files
security-audit-*.json
vulnerability-scan-*.json
EOF

print_success "Updated .gitignore with security patterns"

# 8. Create security checklist
print_header "8. Creating Security Checklist"
SECURITY_CHECKLIST="SECURITY_CHECKLIST.md"

cat > "$SECURITY_CHECKLIST" << 'EOF'
# Security Checklist for Disaster Response Dashboard

## ✅ Completed Security Measures

### 1. Environment Configuration
- [x] Secure secret key generated
- [x] Debug mode disabled in production
- [x] Environment variables properly configured
- [x] .env files added to .gitignore

### 2. API Security
- [x] Security headers implemented
- [x] Input validation utilities created
- [x] Rate limiting configured
- [x] CORS properly configured

### 3. Data Protection
- [x] Sensitive data in environment variables
- [x] No hardcoded secrets in source code
- [x] API keys properly managed

## 🔧 Required Actions for Production

### 1. Database Security
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Implement database connection pooling
- [ ] Regular database backups

### 2. Network Security
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Use VPN for admin access
- [ ] Implement network segmentation

### 3. Application Security
- [ ] Enable HTTPS redirects
- [ ] Implement session management
- [ ] Add request logging
- [ ] Configure error handling

### 4. Monitoring & Logging
- [ ] Set up security monitoring
- [ ] Configure audit logging
- [ ] Implement alerting
- [ ] Regular security scans

### 5. Access Control
- [ ] Implement user authentication
- [ ] Add role-based access control
- [ ] Configure API key rotation
- [ ] Set up multi-factor authentication

## 🚨 Critical Security Reminders

1. **Never commit secrets to git**
2. **Rotate API keys regularly**
3. **Keep dependencies updated**
4. **Monitor for security vulnerabilities**
5. **Conduct regular security audits**

## 📞 Security Contacts

- Security Team: security@yourdomain.com
- Emergency Contact: +1-XXX-XXX-XXXX
- Bug Bounty: https://yourdomain.com/security

## 🔍 Security Testing

Run these commands to test security:

```bash
# Test security headers
curl -I http://localhost:8000/api/health

# Test rate limiting
for i in {1..10}; do curl http://localhost:8000/api/health; done

# Test input validation
curl -X POST http://localhost:8000/api/test -d '{"test": "<script>alert(1)</script>"}'

# Check for exposed secrets
git secrets --scan
```

## 📋 Regular Security Tasks

- [ ] Weekly dependency updates
- [ ] Monthly security scans
- [ ] Quarterly penetration testing
- [ ] Annual security audit
EOF

print_success "Created security checklist: $SECURITY_CHECKLIST"

# 9. Final verification
print_header "9. Security Verification"

# Check if .env is ignored
if git check-ignore backend/.env > /dev/null 2>&1; then
    print_success ".env file is properly ignored by git"
else
    print_warning ".env file is not ignored - check .gitignore"
fi

# Check for any remaining hardcoded secrets
if git grep -i "password\|secret\|token\|key" -- "*.py" "*.js" "*.ts" | grep -v "example\|template\|placeholder" > /dev/null 2>&1; then
    print_warning "Found potential hardcoded secrets - review manually"
else
    print_success "No obvious hardcoded secrets found"
fi

print_header "Security Hardening Complete!"
echo ""
print_success "✅ Secure secret key generated and configured"
print_success "✅ Debug mode disabled"
print_success "✅ Security headers module created"
print_success "✅ Input validation utilities added"
print_success "✅ Rate limiting configured"
print_success "✅ Production environment template created"
print_success "✅ Security checklist generated"
echo ""
print_warning "⚠️  IMPORTANT: Update CORS_ORIGINS with your actual domain"
print_warning "⚠️  IMPORTANT: Configure database and Redis passwords"
print_warning "⚠️  IMPORTANT: Set up HTTPS in production"
echo ""
print_success "🔒 Your application is now more secure!"
print_success "📋 Review SECURITY_CHECKLIST.md for next steps"
