#!/bin/bash

# Disaster Response Dashboard - Configuration Setup Script
# This script helps you set up API keys and environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to prompt for input with default value
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        echo "${input:-$default}"
    else
        read -p "$prompt: " input
        echo "$input"
    fi
}

# Function to check if file exists
check_file_exists() {
    if [ -f "$1" ]; then
        return 0
    else
        return 1
    fi
}

# Function to backup existing file
backup_file() {
    local file="$1"
    if check_file_exists "$file"; then
        local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$file" "$backup"
        print_status "Backed up $file to $backup"
    fi
}

print_header "Disaster Response Dashboard - Configuration Setup"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Setting up configuration files..."

# =============================================================================
# BACKEND CONFIGURATION
# =============================================================================

print_header "Backend Configuration"

# Check if backend config exists
if check_file_exists "backend/.env"; then
    print_warning "Backend .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " overwrite_backend
    if [[ $overwrite_backend =~ ^[Yy]$ ]]; then
        backup_file "backend/.env"
    else
        print_status "Skipping backend configuration"
    fi
fi

if [[ ! $overwrite_backend =~ ^[Nn]$ ]] || [ ! -f "backend/.env" ]; then
    print_status "Setting up backend environment variables..."
    
    # Copy example file
    if check_file_exists "backend/config.env.example"; then
        cp backend/config.env.example backend/.env
        print_status "Created backend/.env from template"
    else
        print_error "Backend config template not found. Please create backend/config.env.example first."
        exit 1
    fi
    
    # Prompt for essential API keys
    echo ""
    print_status "Please provide your API keys:"
    
    # Mapbox API Key
    mapbox_token=$(prompt_input "Mapbox Access Token" "" "MAPBOX_ACCESS_TOKEN")
    if [ -n "$mapbox_token" ]; then
        sed -i.bak "s/your-mapbox-access-token/$mapbox_token/g" backend/.env
    fi
    
    # NASA FIRMS API Key
    nasa_key=$(prompt_input "NASA FIRMS API Key" "" "NASA_FIRMS_API_KEY")
    if [ -n "$nasa_key" ]; then
        sed -i.bak "s/your-nasa-firms-api-key/$nasa_key/g" backend/.env
    fi
    
    # NOAA API Key
    noaa_key=$(prompt_input "NOAA API Key" "" "NOAA_API_KEY")
    if [ -n "$noaa_key" ]; then
        sed -i.bak "s/your-noaa-api-key/$noaa_key/g" backend/.env
    fi
    
    # Emergency 911 API Key
    emergency_key=$(prompt_input "Emergency 911 API Key (optional)" "" "EMERGENCY_911_API_KEY")
    if [ -n "$emergency_key" ]; then
        sed -i.bak "s/your-911-api-key/$emergency_key/g" backend/.env
    fi
    
    # FEMA API Key
    fema_key=$(prompt_input "FEMA API Key (optional)" "" "FEMA_API_KEY")
    if [ -n "$fema_key" ]; then
        sed -i.bak "s/your-fema-api-key/$fema_key/g" backend/.env
    fi
    
    # Twilio Configuration
    echo ""
    print_status "Twilio Configuration (for SMS alerts):"
    twilio_sid=$(prompt_input "Twilio Account SID" "" "TWILIO_ACCOUNT_SID")
    if [ -n "$twilio_sid" ]; then
        sed -i.bak "s/your-twilio-account-sid/$twilio_sid/g" backend/.env
    fi
    
    twilio_token=$(prompt_input "Twilio Auth Token" "" "TWILIO_AUTH_TOKEN")
    if [ -n "$twilio_token" ]; then
        sed -i.bak "s/your-twilio-auth-token/$twilio_token/g" backend/.env
    fi
    
    twilio_phone=$(prompt_input "Twilio Phone Number" "" "TWILIO_PHONE_NUMBER")
    if [ -n "$twilio_phone" ]; then
        sed -i.bak "s/\\+1234567890/$twilio_phone/g" backend/.env
    fi
    
    # Database Configuration
    echo ""
    print_status "Database Configuration:"
    db_password=$(prompt_input "PostgreSQL Password" "password" "POSTGRES_PASSWORD")
    sed -i.bak "s/your-database-password/$db_password/g" backend/.env
    
    # Secret Key
    echo ""
    print_status "Security Configuration:"
    secret_key=$(prompt_input "Secret Key (leave empty to generate)" "" "SECRET_KEY")
    if [ -z "$secret_key" ]; then
        secret_key=$(openssl rand -hex 32)
        print_status "Generated secret key: $secret_key"
    fi
    sed -i.bak "s/your-secret-key-here-change-in-production/$secret_key/g" backend/.env
    
    # Clean up backup files
    rm -f backend/.env.bak
    
    print_status "Backend configuration completed!"
fi

# =============================================================================
# FRONTEND CONFIGURATION
# =============================================================================

print_header "Frontend Configuration"

# Check if frontend config exists
if check_file_exists "frontend/.env.local"; then
    print_warning "Frontend .env.local file already exists"
    read -p "Do you want to overwrite it? (y/N): " overwrite_frontend
    if [[ $overwrite_frontend =~ ^[Yy]$ ]]; then
        backup_file "frontend/.env.local"
    else
        print_status "Skipping frontend configuration"
    fi
fi

if [[ ! $overwrite_frontend =~ ^[Nn]$ ]] || [ ! -f "frontend/.env.local" ]; then
    print_status "Setting up frontend environment variables..."
    
    # Copy example file
    if check_file_exists "frontend/config.env.example"; then
        cp frontend/config.env.example frontend/.env.local
        print_status "Created frontend/.env.local from template"
    else
        print_error "Frontend config template not found. Please create frontend/config.env.example first."
        exit 1
    fi
    
    # Use the same API keys for frontend
    if [ -n "$mapbox_token" ]; then
        sed -i.bak "s/your-mapbox-access-token-here/$mapbox_token/g" frontend/.env.local
    fi
    
    if [ -n "$nasa_key" ]; then
        sed -i.bak "s/your-nasa-firms-api-key/$nasa_key/g" frontend/.env.local
    fi
    
    if [ -n "$noaa_key" ]; then
        sed -i.bak "s/your-noaa-api-key/$noaa_key/g" frontend/.env.local
    fi
    
    if [ -n "$emergency_key" ]; then
        sed -i.bak "s/your-emergency-api-key/$emergency_key/g" frontend/.env.local
    fi
    
    if [ -n "$twilio_sid" ]; then
        sed -i.bak "s/your-twilio-account-sid/$twilio_sid/g" frontend/.env.local
    fi
    
    if [ -n "$twilio_token" ]; then
        sed -i.bak "s/your-twilio-auth-token/$twilio_token/g" frontend/.env.local
    fi
    
    if [ -n "$twilio_phone" ]; then
        sed -i.bak "s/\\+1234567890/$twilio_phone/g" frontend/.env.local
    fi
    
    # Clean up backup files
    rm -f frontend/.env.local.bak
    
    print_status "Frontend configuration completed!"
fi

# =============================================================================
# VALIDATION
# =============================================================================

print_header "Configuration Validation"

# Test backend configuration
if check_file_exists "backend/.env"; then
    print_status "Testing backend configuration..."
    cd backend
    if python -c "from config import validate_configuration; validate_configuration()" 2>/dev/null; then
        print_status "Backend configuration is valid!"
    else
        print_warning "Backend configuration has issues. Check backend/.env file."
    fi
    cd ..
fi

# Test frontend configuration
if check_file_exists "frontend/.env.local"; then
    print_status "Testing frontend configuration..."
    cd frontend
    if npm run type-check 2>/dev/null; then
        print_status "Frontend configuration is valid!"
    else
        print_warning "Frontend configuration has issues. Check frontend/.env.local file."
    fi
    cd ..
fi

# =============================================================================
# NEXT STEPS
# =============================================================================

print_header "Setup Complete!"

print_status "Configuration files have been created:"
echo "  - backend/.env"
echo "  - frontend/.env.local"

echo ""
print_status "Next steps:"
echo "1. Review and edit the configuration files if needed"
echo "2. Install dependencies:"
echo "   - Backend: cd backend && pip install -r requirements.txt"
echo "   - Frontend: cd frontend && npm install"
echo "3. Start the development environment:"
echo "   - docker-compose up -d"
echo "   - Or manually:"
echo "     - Backend: cd backend && python run_synthetic_api.py"
echo "     - Frontend: cd frontend && npm run dev"

echo ""
print_warning "Important security notes:"
echo "- Never commit .env files to version control"
echo "- Use strong, unique passwords in production"
echo "- Rotate API keys regularly"
echo "- Enable HTTPS in production"

echo ""
print_status "For production deployment, see COMPREHENSIVE_README.md"

print_header "Setup Complete!"
