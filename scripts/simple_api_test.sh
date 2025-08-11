#!/bin/bash

# Simple API Test Script
# Uses curl to test the API without Python dependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local timeout=$2
    local interval=$3
    
    print_status "Waiting for service at $url (timeout: ${timeout}s)..."
    
    local counter=0
    while [ $counter -lt $timeout ]; do
        if curl -f "$url" >/dev/null 2>&1; then
            print_success "Service is ready!"
            return 0
        fi
        sleep $interval
        counter=$((counter + interval))
        echo -n "."
    done
    
    print_error "Service failed to start within ${timeout} seconds"
    return 1
}

# Function to test API endpoint
test_endpoint() {
    local endpoint=$1
    local name=$2
    local base_url="http://localhost:8000"
    
    print_status "Testing $name..."
    
    if curl -f -s "$base_url$endpoint" >/dev/null 2>&1; then
        print_success "$name: OK"
        
        # Get response data for validation
        response=$(curl -s "$base_url$endpoint")
        
        # Basic JSON validation
        if echo "$response" | jq . >/dev/null 2>&1; then
            print_success "  JSON response is valid"
            
            # Check for success field
            if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
                print_success "  Response has success field"
            else
                print_warning "  Response missing success field"
            fi
        else
            print_warning "  Response is not valid JSON"
        fi
        
        return 0
    else
        print_error "$name: Failed"
        return 1
    fi
}

# Function to test API performance
test_performance() {
    local endpoint=$1
    local base_url="http://localhost:8000"
    
    print_status "Testing performance for $endpoint..."
    
    start_time=$(date +%s%N)
    if curl -f -s "$base_url$endpoint" >/dev/null 2>&1; then
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
        
        if [ $response_time -lt 1000 ]; then
            print_success "$endpoint: ${response_time}ms"
        elif [ $response_time -lt 3000 ]; then
            print_info "$endpoint: ${response_time}ms (acceptable)"
        else
            print_warning "$endpoint: ${response_time}ms (slow)"
        fi
    else
        print_error "$endpoint: Failed"
    fi
}

# Main function
main() {
    echo "🧪 Simple API Test (curl-based)"
    echo "==============================="
    
    # Check if we're in the right directory
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found. Run this script from the project root."
        exit 1
    fi
    
    # Check if curl is available
    if ! command_exists curl; then
        print_error "curl is required but not found"
        exit 1
    fi
    print_success "curl is available"
    
    # Check if jq is available (for JSON parsing)
    if ! command_exists jq; then
        print_warning "jq not found - JSON validation will be limited"
    else
        print_success "jq is available"
    fi
    
    # Check if API is already running
    if port_in_use 8000; then
        print_warning "Port 8000 is already in use. Checking if it's our API..."
        
        if curl -f http://localhost:8000/api/health >/dev/null 2>&1; then
            print_success "API is already running!"
        else
            print_error "Port 8000 is in use but not by our API"
            exit 1
        fi
    else
        print_info "API not running, starting it..."
        
        # Start the API server
        if [ -f "scripts/mock_api_server.py" ]; then
            print_status "Starting mock API server..."
            python3 scripts/mock_api_server.py &
            API_PID=$!
            
            # Wait for server to be ready
            if ! wait_for_service "http://localhost:8000/api/health" 30 1; then
                print_error "Failed to start API server"
                kill $API_PID 2>/dev/null || true
                exit 1
            fi
        else
            print_error "Mock API server file not found: scripts/mock_api_server.py"
            exit 1
        fi
    fi
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    
    endpoints=(
        "/api/health:Health Check"
        "/api/info:API Info"
        "/api/dashboard:Dashboard"
        "/api/hazards:Hazards"
        "/api/routes:Routes"
    )
    
    all_success=true
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r endpoint name <<< "$endpoint_info"
        if ! test_endpoint "$endpoint" "$name"; then
            all_success=false
        fi
        echo
    done
    
    if [ "$all_success" = false ]; then
        print_error "Some endpoints failed"
        exit 1
    fi
    
    # Test performance
    echo
    print_status "Testing API performance..."
    
    performance_endpoints=("/api/health" "/api/dashboard" "/api/hazards")
    
    for endpoint in "${performance_endpoints[@]}"; do
        test_performance "$endpoint"
    done
    
    # Show API endpoints
    echo
    print_success "API is working correctly!"
    print_status "API endpoints available:"
    echo "  • Health Check: http://localhost:8000/api/health"
    echo "  • Dashboard: http://localhost:8000/api/dashboard"
    echo "  • Hazards: http://localhost:8000/api/hazards"
    echo "  • Routes: http://localhost:8000/api/routes"
    echo "  • API Info: http://localhost:8000/api/info"
    
    # Cleanup if we started the server
    if [ ! -z "$API_PID" ]; then
        echo
        print_status "Stopping API server..."
        kill $API_PID 2>/dev/null || true
        print_success "API server stopped"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --help      Show this help message"
    echo
    echo "This script tests the API using curl (no Python dependencies required)"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_usage
        exit 0
        ;;
    "")
        main "$@"
        ;;
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
