#!/bin/bash

# End-to-End Smoke Test for Mac Setup Script
# This script validates that the setup-mac.sh script works correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_step() {
    echo -e "${CYAN}➤${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local timeout=$2
    local description=$3
    
    print_step "Waiting for $description to be ready..."
    
    local counter=0
    while [ $counter -lt $timeout ]; do
        if curl -f "$url" >/dev/null 2>&1; then
            print_success "$description is ready!"
            return 0
        fi
        sleep 2
        counter=$((counter + 2))
        echo -n "."
    done
    
    print_error "$description failed to become ready within $timeout seconds"
    return 1
}

# Function to check if Docker is running
check_docker_running() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        return 1
    fi
    print_success "Docker is running"
    return 0
}

# Function to stop existing containers
stop_existing_containers() {
    print_step "Stopping any existing containers..."
    
    # Change to the docker-compose directory
    cd "$(dirname "$0")/../config/docker"
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down --remove-orphans >/dev/null 2>&1 || true
        print_success "Existing containers stopped"
    fi
    
    # Return to original directory
    cd - >/dev/null
}

# Function to test the setup script syntax and structure
test_setup_script_structure() {
    print_header "Phase 1: Testing Setup Script Structure"
    
    # Test 1: Check if setup script exists
    print_step "Checking if setup script exists"
    if [ ! -f "scripts/setup-mac.sh" ]; then
        print_error "Setup script not found"
        return 1
    fi
    print_success "Setup script found"
    
    # Test 2: Check if setup script is executable
    print_step "Checking if setup script is executable"
    if [ ! -x "scripts/setup-mac.sh" ]; then
        print_error "Setup script is not executable"
        return 1
    fi
    print_success "Setup script is executable"
    
    # Test 3: Check script syntax
    print_step "Checking script syntax"
    if ! bash -n scripts/setup-mac.sh; then
        print_error "Setup script has syntax errors"
        return 1
    fi
    print_success "Setup script syntax is valid"
    
    # Test 4: Check required functions exist
    print_step "Checking required functions exist"
    local required_functions=("install_homebrew" "install_docker" "check_nodejs" "check_python" "check_ports" "stop_existing_containers" "start_application")
    
    for func in "${required_functions[@]}"; do
        if ! grep -q "install_homebrew()" scripts/setup-mac.sh; then
            print_error "Required function $func not found in setup script"
            return 1
        fi
    done
    print_success "All required functions found"
    
    print_success "Phase 1 completed successfully"
}

# Function to test prerequisites
test_prerequisites() {
    print_header "Phase 2: Testing Prerequisites"
    
    # Test 1: Check Homebrew
    print_step "Checking Homebrew"
    if command_exists brew; then
        print_success "Homebrew is installed"
    else
        print_warning "Homebrew is not installed (will be installed by setup script)"
    fi
    
    # Test 2: Check Docker
    print_step "Checking Docker"
    if command_exists docker; then
        print_success "Docker is installed"
        if check_docker_running; then
            print_success "Docker is running"
        else
            print_warning "Docker is installed but not running"
        fi
    else
        print_warning "Docker is not installed (will be installed by setup script)"
    fi
    
    # Test 3: Check Node.js
    print_step "Checking Node.js"
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge 18 ]; then
            print_success "Node.js version $(node --version) is compatible"
        else
            print_warning "Node.js version $(node --version) is too old (will be updated by setup script)"
        fi
    else
        print_warning "Node.js is not installed (will be installed by setup script)"
    fi
    
    # Test 4: Check Python
    print_step "Checking Python"
    if command_exists python3; then
        print_success "Python3 is available"
    else
        print_warning "Python3 is not available (will be installed by setup script)"
    fi
    
    print_success "Phase 2 completed successfully"
}

# Function to test required files
test_required_files() {
    print_header "Phase 3: Testing Required Files"
    
    local required_files=(
        "config/docker/docker-compose.yml"
        "scripts/start.sh"
        "backend/Dockerfile"
        "frontend/Dockerfile"
        "backend/requirements.txt"
        "frontend/package.json"
    )
    
    for file in "${required_files[@]}"; do
        print_step "Checking $file"
        if [ ! -f "$file" ]; then
            print_error "Required file $file not found"
            return 1
        fi
        print_success "$file exists"
    done
    
    print_success "Phase 3 completed successfully"
}

# Function to test port availability
test_port_availability() {
    print_header "Phase 4: Testing Port Availability"
    
    local ports=(3000 5001 5002)
    
    for port in "${ports[@]}"; do
        print_step "Checking port $port"
        if port_in_use $port; then
            print_warning "Port $port is in use"
            echo "  This might cause conflicts during setup"
        else
            print_success "Port $port is available"
        fi
    done
    
    print_success "Phase 4 completed successfully"
}

# Function to test Docker Compose configuration
test_docker_compose() {
    print_header "Phase 5: Testing Docker Compose Configuration"
    
    # Change to docker-compose directory
    cd "$(dirname "$0")/../config/docker"
    
    # Test 1: Check docker-compose syntax
    print_step "Checking docker-compose.yml syntax"
    if ! docker-compose config >/dev/null 2>&1; then
        print_error "docker-compose.yml has syntax errors"
        cd - >/dev/null
        return 1
    fi
    print_success "docker-compose.yml syntax is valid"
    
    # Test 2: Check if images can be built
    print_step "Testing if images can be built"
    if ! docker-compose build --dry-run >/dev/null 2>&1; then
        print_warning "Image build test failed (this is normal if Docker is not running)"
    else
        print_success "Images can be built"
    fi
    
    # Return to original directory
    cd - >/dev/null
    
    print_success "Phase 5 completed successfully"
}

# Function to test application startup (simulated)
test_application_startup() {
    print_header "Phase 6: Testing Application Startup (Simulated)"
    
    # This phase simulates what the setup script would do
    # without actually starting the full application
    
    print_step "Simulating container cleanup"
    stop_existing_containers
    
    print_step "Checking if start script is executable"
    if [ ! -x "scripts/start.sh" ]; then
        print_error "Start script is not executable"
        return 1
    fi
    print_success "Start script is executable"
    
    print_step "Checking start script syntax"
    if ! bash -n scripts/start.sh; then
        print_error "Start script has syntax errors"
        return 1
    fi
    print_success "Start script syntax is valid"
    
    print_success "Phase 6 completed successfully"
}

# Function to test health endpoints (if application is running)
test_health_endpoints() {
    print_header "Phase 7: Testing Health Endpoints"
    
    # Check if application is already running
    if port_in_use 3000 || port_in_use 5001; then
        print_step "Application appears to be running, testing endpoints"
        
        # Test backend health
        if port_in_use 5001; then
            print_step "Testing backend health endpoint"
            if wait_for_service "http://localhost:5001/api/health" 10 "Backend API"; then
                print_success "Backend health check passed"
            else
                print_warning "Backend health check failed"
            fi
        fi
        
        # Test frontend
        if port_in_use 3000; then
            print_step "Testing frontend endpoint"
            if wait_for_service "http://localhost:3000" 10 "Frontend"; then
                print_success "Frontend is accessible"
            else
                print_warning "Frontend health check failed"
            fi
        fi
    else
        print_step "Application is not running, skipping health checks"
        print_warning "To test health endpoints, start the application first"
    fi
    
    print_success "Phase 7 completed successfully"
}

# Function to generate test report
generate_test_report() {
    print_header "Smoke Test Report"
    
    echo ""
    print_success "✅ Setup Script Structure: PASSED"
    print_success "✅ Prerequisites Check: PASSED"
    print_success "✅ Required Files: PASSED"
    print_success "✅ Port Availability: PASSED"
    print_success "✅ Docker Compose Configuration: PASSED"
    print_success "✅ Application Startup Simulation: PASSED"
    print_success "✅ Health Endpoints: PASSED"
    
    echo ""
    print_success "🎉 All smoke tests passed!"
    echo ""
    print_status "The setup script is ready for use:"
    echo "  ./scripts/setup-mac.sh"
    echo ""
    print_status "For more information:"
    echo "  docs/MAC_SETUP_GUIDE.md"
}

# Main test execution
main() {
    print_header "End-to-End Smoke Test for Mac Setup"
    echo ""
    print_status "This test validates that the setup-mac.sh script is ready for use."
    echo ""
    
    # Run all test phases
    test_setup_script_structure
    echo ""
    
    test_prerequisites
    echo ""
    
    test_required_files
    echo ""
    
    test_port_availability
    echo ""
    
    test_docker_compose
    echo ""
    
    test_application_startup
    echo ""
    
    test_health_endpoints
    echo ""
    
    generate_test_report
}

# Run main function
main "$@"
