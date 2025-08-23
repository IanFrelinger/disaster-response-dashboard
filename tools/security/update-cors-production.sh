#!/bin/bash

# Update CORS Configuration for Production
# This script updates the CORS origins to be more restrictive for production

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🌐 $1${NC}"
    echo "=================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header "Updating CORS Configuration for Production"
echo ""

# Get the production domain from user input
echo "Enter your production domain (e.g., disaster-response.gov):"
read -p "Domain: " PRODUCTION_DOMAIN

if [ -z "$PRODUCTION_DOMAIN" ]; then
    print_warning "No domain provided. Using example domain."
    PRODUCTION_DOMAIN="disaster-response.gov"
fi

# Create production CORS configuration
PRODUCTION_CORS="https://${PRODUCTION_DOMAIN},https://www.${PRODUCTION_DOMAIN}"

print_header "Creating Production CORS Configuration"

# Create a production environment file with updated CORS
cat > backend/.env.production.cors << EOF
# Production CORS Configuration
# Update your .env file with these settings for production

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
ENABLE_CORS=true
CORS_ORIGINS=${PRODUCTION_CORS}

# =============================================================================
# PRODUCTION SETTINGS
# =============================================================================
FLASK_ENV=production
FLASK_DEBUG=false
API_DEBUG=false

# =============================================================================
# CORS HEADERS (for nginx/apache configuration)
# =============================================================================
# Add these headers to your web server configuration:
# 
# add_header Access-Control-Allow-Origin "${PRODUCTION_CORS}" always;
# add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
# add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
# add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
# 
# if (\$request_method = 'OPTIONS') {
#     add_header Access-Control-Allow-Origin "${PRODUCTION_CORS}" always;
#     add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
#     add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
#     add_header Access-Control-Max-Age 1728000;
#     add_header Content-Type 'text/plain; charset=utf-8';
#     add_header Content-Length 0;
#     return 204;
# }
EOF

print_success "Created production CORS configuration: backend/.env.production.cors"

# Create nginx configuration snippet
cat > deployment/nginx-cors-production.conf << EOF
# Production CORS Configuration for Nginx
# Include this in your nginx server block

# CORS headers for production
add_header Access-Control-Allow-Origin "${PRODUCTION_CORS}" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;

# Handle preflight requests
if (\$request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin "${PRODUCTION_CORS}" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Max-Age 1728000;
    add_header Content-Type 'text/plain; charset=utf-8';
    add_header Content-Length 0;
    return 204;
}
EOF

print_success "Created nginx CORS configuration: deployment/nginx-cors-production.conf"

# Create Apache configuration snippet
cat > deployment/apache-cors-production.conf << EOF
# Production CORS Configuration for Apache
# Add this to your .htaccess file or Apache configuration

# Enable CORS
Header always set Access-Control-Allow-Origin "${PRODUCTION_CORS}"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization"
Header always set Access-Control-Expose-Headers "Content-Length,Content-Range"

# Handle preflight requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ \$1 [R=204,L]
EOF

print_success "Created Apache CORS configuration: deployment/apache-cors-production.conf"

print_header "CORS Configuration Complete!"
echo ""
print_success "✅ Production CORS configuration created"
print_success "✅ Nginx configuration snippet created"
print_success "✅ Apache configuration snippet created"
echo ""
print_warning "⚠️  IMPORTANT: Update your .env file with the new CORS_ORIGINS"
print_warning "⚠️  IMPORTANT: Configure your web server with the CORS headers"
print_warning "⚠️  IMPORTANT: Test CORS functionality in production"
echo ""
print_success "📋 Files created:"
echo "   - backend/.env.production.cors"
echo "   - deployment/nginx-cors-production.conf"
echo "   - deployment/apache-cors-production.conf"
echo ""
print_success "🔒 Your CORS configuration is now production-ready!"
