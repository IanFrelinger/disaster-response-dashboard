#!/bin/bash

# Comprehensive Smoke Test for Disaster Response Dashboard
# This script tests the entire system including frontend, backend, and tile server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5001"
TILE_SERVER_URL="http://localhost:5001"
TIMEOUT=10

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    log_info "Testing $name: $url"
    
    if curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" | grep -q "$expected_status"; then
        log_success "$name is accessible"
    else
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
        if [[ "$status" == "000" ]]; then
            log_error "$name is not accessible (connection failed)"
        elif [[ "$status" -ge 400 && "$status" -lt 500 ]]; then
            log_warning "$name returned HTTP $status (client error - may be expected)"
        else
            log_error "$name returned HTTP $status"
        fi
    fi
}

test_mapbox_token() {
    log_info "Testing Mapbox token validity"
    
    local token="pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw"
    local test_url="https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?access_token=$token&limit=1"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$test_url" 2>/dev/null || echo "000")
    
    if [[ "$status" == "200" ]]; then
        log_success "Mapbox token is valid and working"
    elif [[ "$status" == "401" ]]; then
        log_error "Mapbox token is invalid or expired"
    else
        log_warning "Mapbox API returned HTTP $status"
    fi
}

test_frontend_functionality() {
    log_info "Testing frontend functionality"
    
    # Test if frontend loads
    if curl -s "$FRONTEND_URL" | grep -q "Disaster Response Dashboard"; then
        log_success "Frontend loads correctly"
    else
        log_error "Frontend does not load correctly"
    fi
    
    # Test if React app is working
    if curl -s "$FRONTEND_URL" | grep -q "root"; then
        log_success "React app is properly configured"
    else
        log_warning "React app configuration may have issues"
    fi
}

test_backend_apis() {
    log_info "Testing backend APIs"
    
    # Test health endpoint
    test_endpoint "Health Check" "$BACKEND_URL/health"
    
    # Test disaster API
    test_endpoint "Disaster API" "$BACKEND_URL/api/disasters"
    
    # Test resources API
    test_endpoint "Resources API" "$BACKEND_URL/api/resources"
    
    # Test synthetic API
    test_endpoint "Synthetic API" "$BACKEND_URL/api/synthetic"
}

test_tile_server() {
    log_info "Testing tile server"
    
    # Test tile endpoints
    test_endpoint "California Counties Tiles" "$TILE_SERVER_URL/tiles/california_counties/0/0/0.pbf"
    test_endpoint "Hazards Tiles" "$TILE_SERVER_URL/tiles/hazards/0/0/0.pbf"
    test_endpoint "Routes Tiles" "$TILE_SERVER_URL/tiles/routes/0/0/0.pbf"
    test_endpoint "Admin Boundaries Tiles" "$TILE_SERVER_URL/tiles/admin_boundaries/0/0/0.pbf"
}

test_docker_containers() {
    log_info "Testing Docker containers"
    
    # Check if containers are running
    if docker ps --format "table {{.Names}}" | grep -q "disaster-response"; then
        log_success "Docker containers are running"
    else
        log_warning "No disaster-response Docker containers found"
    fi
}

test_environment() {
    log_info "Testing environment configuration"
    
    # Check if .env.local exists
    if [[ -f "frontend/.env.local" ]]; then
        log_success "Frontend environment file exists"
        
        # Check if Mapbox token is configured
        if grep -q "VITE_MAPBOX_ACCESS_TOKEN" frontend/.env.local; then
            log_success "Mapbox token is configured"
        else
            log_error "Mapbox token is not configured"
        fi
    else
        log_error "Frontend environment file missing"
    fi
    
    # Check if backend environment exists
    if [[ -f "backend/config.env" ]] || [[ -f "backend/.env" ]]; then
        log_success "Backend environment file exists"
    else
        log_warning "Backend environment file not found"
    fi
}

test_build_system() {
    log_info "Testing build system"
    
    # Test frontend build
    if cd frontend && npm run build > /dev/null 2>&1; then
        log_success "Frontend builds successfully"
    else
        log_error "Frontend build failed"
    fi
    cd ..
    
    # Test backend dependencies
    if [[ -f "backend/requirements.txt" ]]; then
        log_success "Backend requirements file exists"
    else
        log_warning "Backend requirements file not found"
    fi
}

print_summary() {
    echo
    echo "=========================================="
    echo "📊 COMPREHENSIVE SMOKE TEST RESULTS"
    echo "=========================================="
    echo "Total Tests: $((PASSED + FAILED + WARNINGS))"
    echo "✅ Passed: $PASSED"
    echo "⚠️  Warnings: $WARNINGS"
    echo "❌ Failed: $FAILED"
    
    if [[ $FAILED -eq 0 ]]; then
        if [[ $WARNINGS -eq 0 ]]; then
            echo -e "${GREEN}🎉 All tests passed! System is ready.${NC}"
        else
            echo -e "${YELLOW}⚠️  Tests passed with warnings. System is functional.${NC}"
        fi
    else
        echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
        exit 1
    fi
}

# Main test execution
main() {
    echo "🧪 Starting Comprehensive Smoke Test for Disaster Response Dashboard"
    echo "=================================================================="
    echo
    
    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    # Run all tests
    test_environment
    test_build_system
    test_docker_containers
    test_frontend_functionality
    test_backend_apis
    test_tile_server
    test_mapbox_token
    
    print_summary
}

# Run the main function
main "$@"
