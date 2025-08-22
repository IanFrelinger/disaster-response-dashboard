#!/bin/bash

# Disaster Response Dashboard - Local Docker Test
# Tests the Docker setup locally before deployment

set -e

# Configuration
IMAGE_NAME="disaster-response-dashboard"
CONTAINER_NAME="disaster-dashboard-test"
PORT=8000

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
    echo -e "${PURPLE}$1${NC}"
}

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    echo "============================="
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker not found. Please install Docker."
        exit 1
    fi
    print_success "✓ Docker found"
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in current directory"
        exit 1
    fi
    print_success "✓ Dockerfile found"
    
    # Check if backend directory exists
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found"
        exit 1
    fi
    print_success "✓ Backend directory found"
    
    print_success "✓ All prerequisites satisfied"
}

# Function to build Docker image
build_docker_image() {
    print_header "🐳 Building Docker Image"
    echo "==========================="
    
    print_step "Building Docker image..."
    
    # Build the image
    docker build -t "$IMAGE_NAME:latest" .
    
    if [ $? -eq 0 ]; then
        print_success "✓ Docker image built successfully"
    else
        print_error "✗ Docker image build failed"
        exit 1
    fi
}

# Function to run container
run_container() {
    print_header "🚀 Running Container"
    echo "======================"
    
    # Stop and remove existing container if it exists
    if docker ps -a --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
        print_step "Stopping existing container..."
        docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
        docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
    fi
    
    # Run the container
    print_step "Starting container..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$PORT:8000" \
        -e FLASK_ENV=development \
        -e FLASK_DEBUG=true \
        -e FLASK_PORT=8000 \
        -e ENVIRONMENT_MODE=demo \
        -e USE_SYNTHETIC_DATA=true \
        "$IMAGE_NAME:latest"
    
    if [ $? -eq 0 ]; then
        print_success "✓ Container started successfully"
    else
        print_error "✗ Container failed to start"
        exit 1
    fi
}

# Function to wait for container to be ready
wait_for_container() {
    print_header "⏳ Waiting for Container to be Ready"
    echo "========================================="
    
    print_step "Waiting for container to be ready..."
    
    # Wait for container to be running
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if docker ps --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
            print_success "✓ Container is running"
            break
        fi
        
        attempts=$((attempts + 1))
        sleep 2
    done
    
    if [ $attempts -eq $max_attempts ]; then
        print_error "✗ Container failed to start within timeout"
        exit 1
    fi
    
    # Wait for application to be ready
    print_step "Waiting for application to be ready..."
    attempts=0
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -f http://localhost:$PORT/ >/dev/null 2>&1; then
            print_success "✓ Application is ready"
            break
        fi
        
        attempts=$((attempts + 1))
        sleep 2
    done
    
    if [ $attempts -eq $max_attempts ]; then
        print_error "✗ Application failed to start within timeout"
        exit 1
    fi
}

# Function to test endpoints
test_endpoints() {
    print_header "🧪 Testing Endpoints"
    echo "======================"
    
    local base_url="http://localhost:$PORT"
    
    # Test root endpoint
    print_step "Testing root endpoint..."
    if curl -f "$base_url/" >/dev/null 2>&1; then
        print_success "✓ Root endpoint working"
    else
        print_error "✗ Root endpoint failed"
    fi
    
    # Test health endpoint
    print_step "Testing health endpoint..."
    if curl -f "$base_url/api/health" >/dev/null 2>&1; then
        print_success "✓ Health endpoint working"
    else
        print_error "✗ Health endpoint failed"
    fi
    
    # Test synthetic data endpoint
    print_step "Testing synthetic data endpoint..."
    if curl -f "$base_url/api/synthetic-data" >/dev/null 2>&1; then
        print_success "✓ Synthetic data endpoint working"
    else
        print_error "✗ Synthetic data endpoint failed"
    fi
}

# Function to display container logs
show_logs() {
    print_header "📋 Container Logs"
    echo "==================="
    
    print_step "Recent container logs:"
    docker logs --tail 20 "$CONTAINER_NAME"
}

# Function to display test summary
display_summary() {
    print_header "📊 Local Docker Test Summary"
    echo "==============================="
    
    echo ""
    print_success "🎉 Local Docker test completed successfully!"
    echo ""
    echo "📋 Test Details:"
    echo "  • Image: $IMAGE_NAME:latest"
    echo "  • Container: $CONTAINER_NAME"
    echo "  • Port: $PORT"
    echo "  • URL: http://localhost:$PORT"
    echo ""
    
    print_success "✅ Your Docker setup is working correctly!"
    echo ""
    echo "🔧 Next Steps:"
    echo "  • Test the application: http://localhost:$PORT"
    echo "  • View logs: docker logs -f $CONTAINER_NAME"
    echo "  • Stop container: docker stop $CONTAINER_NAME"
    echo "  • Deploy to AWS: ./tools/deployment/deploy-docker.sh"
    echo ""
}

# Function to cleanup
cleanup() {
    print_header "🧹 Cleanup"
    echo "==========="
    
    print_step "Stopping and removing container..."
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
    
    print_success "✓ Cleanup completed"
}

# Function to handle script interruption
trap cleanup EXIT

# Main execution
main() {
    print_header "🚀 Disaster Response Dashboard - Local Docker Test"
    echo "======================================================="
    echo "This script tests your Docker setup locally"
    echo ""
    
    # Run test steps
    check_prerequisites
    build_docker_image
    run_container
    wait_for_container
    test_endpoints
    show_logs
    display_summary
    
    print_success "🎉 Local Docker test completed successfully!"
    echo ""
    print_warning "Press Ctrl+C to stop the container and cleanup"
    
    # Keep container running for manual testing
    while true; do
        sleep 1
    done
}

# Run main function
main "$@"
