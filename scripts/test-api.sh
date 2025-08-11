#!/bin/bash

# Disaster Response Dashboard - API Setup and Testing Script
# This script sets up and tests the API following a layer-by-layer approach

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

# Main function
main() {
    echo "🚀 Disaster Response Dashboard - API Setup and Testing"
    echo "======================================================"
    
    # Check if we're in the right directory
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found. Run this script from the project root."
        exit 1
    fi
    
    # Check Python version
    if command_exists python3; then
        PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
        print_success "Python $PYTHON_VERSION found"
    else
        print_error "Python 3 is required but not found"
        exit 1
    fi
    
    # Check if API is already running
    if port_in_use 8000; then
        print_warning "Port 8000 is already in use. Checking if it's our API..."
        
        if curl -f http://localhost:8000/api/health >/dev/null 2>&1; then
            print_success "API is already running!"
            
            # Run quick test
            print_status "Running quick API test..."
            if python3 scripts/quick_api_test.py; then
                print_success "API is working correctly!"
                exit 0
            else
                print_error "API test failed"
                exit 1
            fi
        else
            print_error "Port 8000 is in use but not by our API"
            exit 1
        fi
    fi
    
    # Check if we should run full setup or quick test
    if [ "$1" = "--quick" ]; then
        print_status "Running quick API test only..."
        if python3 scripts/quick_api_test.py; then
            print_success "Quick test passed!"
            exit 0
        else
            print_error "Quick test failed"
            exit 1
        fi
    fi
    
    # Check if we should run minimal test
    if [ "$1" = "--minimal" ]; then
        print_status "Running minimal API test..."
        if python3 scripts/minimal_api_test.py; then
            print_success "Minimal test passed!"
            exit 0
        else
            print_error "Minimal test failed"
            exit 1
        fi
    fi
    
    # Run full setup and testing
    print_status "Running comprehensive API setup and testing..."
    
    if python3 scripts/setup_and_test_api.py; then
        print_success "API setup and testing completed successfully!"
        
        # Show API endpoints
        echo
        print_status "API endpoints available:"
        echo "  • Health Check: http://localhost:8000/api/health"
        echo "  • Dashboard: http://localhost:8000/api/dashboard"
        echo "  • Hazards: http://localhost:8000/api/hazards"
        echo "  • Routes: http://localhost:8000/api/routes"
        echo "  • API Info: http://localhost:8000/api/info"
        
        # Show next steps
        echo
        print_status "Next steps:"
        echo "  • Frontend can now connect to the API"
        echo "  • Run: scripts/test-api.sh --quick (for quick tests)"
        echo "  • Run: scripts/start.sh (for full application)"
        
        exit 0
    else
        print_error "API setup and testing failed"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --quick     Run quick API test only (skip full setup)"
    echo "  --minimal   Run minimal API test (minimal dependencies)"
    echo "  --help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0           # Run full setup and testing"
    echo "  $0 --quick   # Run quick test only"
    echo "  $0 --minimal # Run minimal test (recommended for first run)"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_usage
        exit 0
        ;;
    --quick)
        main "$@"
        ;;
    --minimal)
        main "$@"
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
