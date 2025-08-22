#!/bin/bash

# Disaster Response Dashboard - Mac Rebuild from Source (Robust Version)
# Portable script for rebuilding on any Mac environment
# This script completely removes everything and rebuilds from scratch
# Includes robust Docker connectivity handling and error recovery

set -e

# Script configuration
SCRIPT_NAME="mac-rebuild-from-source-robust.sh"
PROJECT_NAME="disaster-response-dashboard"
BACKEND_TAG="disaster-response-backend"
FRONTEND_TAG="disaster-response-frontend"
TILESERVER_TAG="disaster-tileserver"
NETWORK_NAME="disaster-mac-robust-network"

# Port configuration
FRONTEND_PORT=3000
BACKEND_PORT=5001
TILE_SERVER_PORT=8080

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

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up on exit..."
    # Only try to cleanup if Docker is accessible
    if docker info >/dev/null 2>&1; then
        docker stop disaster-mac-robust-backend disaster-mac-robust-frontend disaster-mac-robust-tileserver 2>/dev/null || true
        docker rm disaster-mac-robust-backend disaster-mac-robust-frontend disaster-mac-robust-tileserver 2>/dev/null || true
        print_success "Cleanup complete"
    else
        print_warning "Docker not accessible during cleanup"
    fi
}

# Set up cleanup trap
trap cleanup INT TERM EXIT

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for Docker to be ready
wait_for_docker() {
    local max_attempts=60
    local attempt=1
    
    print_status "Waiting for Docker to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker info >/dev/null 2>&1; then
            print_success "Docker is ready after $attempt attempts"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Docker failed to start after $max_attempts attempts"
            return 1
        fi
        
        print_status "Attempt $attempt/$max_attempts - Docker not ready, waiting..."
        sleep 5
        attempt=$((attempt + 1))
    done
}

# Function to check if port is available
port_available() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        print_warning "Port $port is in use. Killing processes: $pids"
        echo $pids | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=${3:-30}
    local delay=${4:-2}
    
    print_status "Waiting for $service_name to be ready..."
    for i in $(seq 1 $max_attempts); do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready"
            return 0
        fi
        if [ $i -eq $max_attempts ]; then
            print_error "$service_name failed to start after $max_attempts attempts"
            return 1
        fi
        sleep $delay
    done
}

# Function to safely execute Docker commands
safe_docker() {
    local command="$1"
    local description="$2"
    local max_retries=3
    local retry=1
    
    while [ $retry -le $max_retries ]; do
        if docker $command; then
            return 0
        fi
        
        if [ $retry -eq $max_retries ]; then
            print_error "$description failed after $max_retries attempts"
            return 1
        fi
        
        print_warning "$description failed, retrying ($retry/$max_retries)..."
        sleep 5
        retry=$((retry + 1))
    done
}

# Main execution starts here
main() {
    echo "🔥 Disaster Response Dashboard - Mac Rebuild from Source (Robust)"
    echo "================================================================="
    echo "This script will completely rebuild your environment from source"
    echo "Script: $SCRIPT_NAME"
    echo "Timestamp: $(date)"
    echo ""

    # PHASE 0: PREREQUISITE CHECKS
    print_header "PHASE 0: PREREQUISITE CHECKS"
    echo "=================================="

    # Check if we're in the project root
    if [ ! -f "docker-compose.yml" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
        print_error "This script must be run from the project root directory ($PROJECT_NAME/)"
        print_error "Current directory: $(pwd)"
        print_error "Expected to find: docker-compose.yml, backend/, frontend/"
        exit 1
    fi
    print_success "Project root directory confirmed"

    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker Desktop for Mac first."
        print_error "Visit: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    print_success "Docker found"

    # Wait for Docker to be ready
    if ! wait_for_docker; then
        print_error "Docker failed to start. Please check Docker Desktop and try again."
        exit 1
    fi

    # Check Docker Compose
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not available. Please ensure Docker Desktop is up to date."
        exit 1
    fi
    print_success "Docker Compose found"

    # Check Node.js (for frontend build)
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        print_error "Visit: https://nodejs.org/ or use: brew install node"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"

    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_success "npm found: $(npm --version)"

    # Check Python (for backend build)
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        print_error "Visit: https://python.org/ or use: brew install python"
        exit 1
    fi
    print_success "Python 3 found: $(python3 --version)"

    # Check curl
    if ! command_exists curl; then
        print_error "curl is not installed. Please install curl first."
        print_error "Use: brew install curl"
        exit 1
    fi
    print_success "curl found"

    # Check ports availability
    print_status "Checking port availability..."
    for port in $FRONTEND_PORT $BACKEND_PORT $TILE_SERVER_PORT; do
        if port_available $port; then
            print_success "Port $port is available"
        else
            print_warning "Port $port is in use, will kill existing processes"
            kill_port $port
        fi
    done

    print_success "All prerequisites satisfied"
    echo ""

    # PHASE 1: COMPLETE CLEANUP
    print_header "PHASE 1: COMPLETE CLEANUP"
    echo "================================"

    # Stop and remove all existing containers
    print_step "Stopping and removing existing containers..."
    if safe_docker "stop \$(docker ps -q --filter 'name=disaster-response')" "Stop containers"; then
        print_success "Existing containers stopped"
    fi
    
    if safe_docker "rm \$(docker ps -aq --filter 'name=disaster-response')" "Remove containers"; then
        print_success "Existing containers removed"
    fi

    # Remove all existing images
    print_step "Removing all existing disaster-response images..."
    if safe_docker "images | grep disaster-response | awk '{print \$3}' | xargs docker rmi -f" "Remove images"; then
        print_success "Existing images removed"
    fi

    # Remove all existing networks
    print_step "Removing existing networks..."
    if safe_docker "network rm disaster-demo-network disaster-custom-network disaster-rebuild-network disaster-mac-robust-network" "Remove networks"; then
        print_success "Existing networks removed"
    fi

    # Clean up Docker system
    print_step "Cleaning up Docker system..."
    if safe_docker "system prune -f" "System prune"; then
        print_success "Docker system cleaned"
    fi

    # PHASE 2: REBUILD FROM SOURCE
    print_header "PHASE 2: REBUILD FROM SOURCE"
    echo "=================================="

    # Create new network
    print_step "Creating new Docker network..."
    if safe_docker "network create $NETWORK_NAME" "Create network"; then
        print_success "Network created: $NETWORK_NAME"
    fi

    # Build backend from source
    print_step "Building backend from source..."
    cd backend
    if safe_docker "build --no-cache --pull -t $BACKEND_TAG:latest ." "Backend build"; then
        print_success "Backend built successfully from source"
    else
        print_error "Backend build failed"
        exit 1
    fi
    cd ..

    # Build frontend from source
    print_step "Building frontend from source..."
    cd frontend
    
    # Install dependencies fresh
    print_step "Installing frontend dependencies..."
    if npm ci; then
        print_success "Frontend dependencies installed"
    else
        print_error "Frontend dependency installation failed"
        exit 1
    fi

    # Build frontend
    print_step "Building frontend application..."
    if npm run build; then
        print_success "Frontend application built"
    else
        print_error "Frontend build failed"
        exit 1
    fi

    # Build Docker image
    print_step "Building frontend Docker image..."
    if safe_docker "build --no-cache --pull -t $FRONTEND_TAG:latest ." "Frontend Docker build"; then
        print_success "Frontend Docker image built successfully"
    else
        print_error "Frontend Docker build failed"
        exit 1
    fi
    cd ..

    # Build tile server from source
    print_step "Building tile server from source..."
    cd tiles
    if safe_docker "build --no-cache --pull -t $TILESERVER_TAG:latest ." "Tile server build"; then
        print_success "Tile server built successfully from source"
    else
        print_error "Tile server build failed"
        exit 1
    fi
    cd ..

    # PHASE 3: DEPLOY NEW CONTAINERS
    print_header "PHASE 3: DEPLOY NEW CONTAINERS"
    echo "===================================="

    # Start backend
    print_step "Starting backend container..."
    if safe_docker "run -d --name disaster-mac-robust-backend --network $NETWORK_NAME -p $BACKEND_PORT:8000 -e ENVIRONMENT_MODE=demo -e USE_SYNTHETIC_DATA=true $BACKEND_TAG:latest" "Start backend"; then
        print_success "Backend container started"
    else
        print_error "Backend container failed to start"
        exit 1
    fi

    # Start tile server
    print_step "Starting tile server container..."
    if safe_docker "run -d --name disaster-mac-robust-tileserver --network $NETWORK_NAME -p $TILE_SERVER_PORT:8080 -v $(pwd)/tiles:/data $TILESERVER_TAG:latest" "Start tile server"; then
        print_success "Tile server container started"
    else
        print_error "Tile server container failed to start"
        exit 1
    fi

    # Start frontend
    print_step "Starting frontend container..."
    if safe_docker "run -d --name disaster-mac-robust-frontend --network $NETWORK_NAME -p $FRONTEND_PORT:80 -e VITE_ENVIRONMENT_MODE=demo -e VITE_USE_SYNTHETIC_DATA=true -e VITE_DEMO_API_BASE_URL=http://localhost:$BACKEND_PORT/api -e VITE_TILE_SERVER_URL=http://localhost:$TILE_SERVER_PORT $FRONTEND_TAG:latest" "Start frontend"; then
        print_success "Frontend container started"
    else
        print_error "Frontend container failed to start"
        exit 1
    fi

    # PHASE 4: VALIDATION
    print_header "PHASE 4: VALIDATION"
    echo "======================="

    # Wait for services to be ready
    print_step "Waiting for services to be ready..."
    sleep 15

    # Test backend health
    print_step "Testing backend health..."
    if ! wait_for_service "http://localhost:$BACKEND_PORT/api/health" "Backend" 30 2; then
        print_error "Backend health check failed"
        exit 1
    fi

    # Test tile server
    print_step "Testing tile server..."
    if ! wait_for_service "http://localhost:$TILE_SERVER_PORT/" "Tile Server" 30 2; then
        print_error "Tile server health check failed"
        exit 1
    fi

    # Test frontend
    print_step "Testing frontend..."
    if ! wait_for_service "http://localhost:$FRONTEND_PORT" "Frontend" 30 2; then
        print_error "Frontend health check failed"
        exit 1
    fi

    # PHASE 5: SUCCESS SUMMARY
    print_header "PHASE 5: SUCCESS SUMMARY"
    echo "=============================="

    echo ""
    echo "🎉 COMPLETE REBUILD SUCCESSFUL!"
    echo "================================"
    echo ""
    echo "✅ All old images removed"
    echo "✅ All containers rebuilt from source"
    echo "✅ All services validated and running"
    echo ""
    echo "🌐 Service URLs:"
    echo "  📊 Frontend: http://localhost:$FRONTEND_PORT"
    echo "  🔌 Backend API: http://localhost:$BACKEND_PORT"
    echo "  🗺️  Tile Server: http://localhost:$TILE_SERVER_PORT"
    echo "  🏥 Health Check: http://localhost:$BACKEND_PORT/api/health"
    echo ""
    echo "🔧 Container Information:"
    echo "  Backend: disaster-mac-robust-backend"
    echo "  Frontend: disaster-mac-robust-frontend"
    echo "  Tile Server: disaster-mac-robust-tileserver"
    echo "  Network: $NETWORK_NAME"
    echo ""
    echo "📋 Management Commands:"
    echo "  View logs: docker logs disaster-mac-robust-*"
    echo "  Stop services: docker stop disaster-mac-robust-*"
    echo "  Remove containers: docker rm disaster-mac-robust-*"
    echo "  View status: docker ps --filter name=disaster-mac-robust"
    echo ""
    echo "🧹 Cleanup Commands:"
    echo "  Stop and remove: docker stop disaster-mac-robust-* && docker rm disaster-mac-robust-*"
    echo "  Remove images: docker rmi $BACKEND_TAG:latest $FRONTEND_TAG:latest $TILESERVER_TAG:latest"
    echo "  Remove network: docker network rm $NETWORK_NAME"
    echo ""
    echo "🚀 Your disaster response dashboard is ready!"
    echo ""

    # Show running containers
    print_status "Current running containers:"
    docker ps --filter name=disaster-mac-robust --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    print_success "Rebuild complete! All services are running from fresh source builds."
    print_success "Script completed successfully at $(date)"
}

# Run main function
main "$@"
