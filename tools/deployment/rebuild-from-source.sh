#!/bin/bash

# Disaster Response Dashboard - Complete Rebuild from Source
# This script completely removes old images and rebuilds everything from scratch

set -e

echo "🔥 Disaster Response Dashboard - Complete Rebuild from Source"
echo "============================================================"
echo "This will REMOVE ALL existing images and rebuild from source"
echo ""

# Configuration
BACKEND_TAG="disaster-response-backend"
FRONTEND_TAG="disaster-response-frontend"
TILESERVER_TAG="disaster-tileserver"
NETWORK_NAME="disaster-rebuild-network"

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

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up on exit..."
    # Stop any running containers
    docker stop disaster-rebuild-backend disaster-rebuild-frontend disaster-rebuild-tileserver 2>/dev/null || true
    docker rm disaster-rebuild-backend disaster-rebuild-frontend disaster-rebuild-tileserver 2>/dev/null || true
    print_success "Cleanup complete"
}

# Set up cleanup trap
trap cleanup INT TERM EXIT

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if we're in the project root
if [ ! -f "docker-compose.yml" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    print_error "This script must be run from the project root directory (disaster-response-dashboard/)"
    print_error "Current directory: $(pwd)"
    exit 1
fi

print_success "Prerequisites check passed"

# Confirm destructive action
echo ""
print_warning "⚠️  DESTRUCTIVE ACTION CONFIRMATION ⚠️"
echo "This script will:"
echo "  ❌ Remove ALL existing disaster-response containers"
echo "  ❌ Remove ALL existing disaster-response images"
echo "  ❌ Remove ALL existing disaster-response networks"
echo "  🔄 Rebuild everything from source code"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_status "Rebuild cancelled by user"
    exit 0
fi

echo ""

# PHASE 1: COMPLETE CLEANUP
print_header "PHASE 1: COMPLETE CLEANUP"
echo "================================"

# Stop and remove all existing containers
print_status "Stopping and removing existing containers..."
docker stop $(docker ps -q --filter "name=disaster-response") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=disaster-response") 2>/dev/null || true
print_success "Existing containers removed"

# Remove all existing images
print_status "Removing all existing disaster-response images..."
docker images | grep disaster-response | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
print_success "Existing images removed"

# Remove all existing networks
print_status "Removing existing networks..."
docker network rm disaster-demo-network disaster-custom-network disaster-rebuild-network 2>/dev/null || true
print_success "Existing networks removed"

# Clean up Docker system
print_status "Cleaning up Docker system..."
docker system prune -f
print_success "Docker system cleaned"

# PHASE 2: REBUILD FROM SOURCE
print_header "PHASE 2: REBUILD FROM SOURCE"
echo "=================================="

# Create new network
print_status "Creating new Docker network..."
docker network create $NETWORK_NAME
print_success "Network created: $NETWORK_NAME"

# Build backend from source
print_status "Building backend from source..."
cd backend
docker build --no-cache --pull -t $BACKEND_TAG:latest .
if [ $? -ne 0 ]; then
    print_error "Backend build failed"
    exit 1
fi
print_success "Backend built successfully from source"
cd ..

# Build frontend from source
print_status "Building frontend from source..."
cd frontend
# Install dependencies fresh
print_status "Installing frontend dependencies..."
npm ci
if [ $? -ne 0 ]; then
    print_error "Frontend dependency installation failed"
    exit 1
fi

# Build frontend
print_status "Building frontend application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

# Build Docker image
print_status "Building frontend Docker image..."
docker build --no-cache --pull -t $FRONTEND_TAG:latest .
if [ $? -ne 0 ]; then
    print_error "Frontend Docker build failed"
    exit 1
fi
print_success "Frontend built successfully from source"
cd ..

# Build tile server from source
print_status "Building tile server from source..."
cd tiles
docker build --no-cache --pull -t $TILESERVER_TAG:latest .
if [ $? -ne 0 ]; then
    print_error "Tile server build failed"
    exit 1
fi
print_success "Tile server built successfully from source"
cd ..

# PHASE 3: DEPLOY NEW CONTAINERS
print_header "PHASE 3: DEPLOY NEW CONTAINERS"
echo "===================================="

# Start backend
print_status "Starting backend container..."
docker run -d \
    --name disaster-rebuild-backend \
    --network $NETWORK_NAME \
    -p 5001:8000 \
    -e ENVIRONMENT_MODE=demo \
    -e USE_SYNTHETIC_DATA=true \
    $BACKEND_TAG:latest

if [ $? -ne 0 ]; then
    print_error "Backend container failed to start"
    exit 1
fi
print_success "Backend container started"

# Start tile server
print_status "Starting tile server container..."
docker run -d \
    --name disaster-rebuild-tileserver \
    --network $NETWORK_NAME \
    -p 8080:8080 \
    -v $(pwd)/tiles:/data \
    $TILESERVER_TAG:latest

if [ $? -ne 0 ]; then
    print_error "Tile server container failed to start"
    exit 1
fi
print_success "Tile server container started"

# Start frontend
print_status "Starting frontend container..."
docker run -d \
    --name disaster-rebuild-frontend \
    --network $NETWORK_NAME \
    -p 3000:80 \
    -e VITE_ENVIRONMENT_MODE=demo \
    -e VITE_USE_SYNTHETIC_DATA=true \
    -e VITE_DEMO_API_BASE_URL=http://localhost:5001/api \
    -e VITE_TILE_SERVER_URL=http://localhost:8080 \
    $FRONTEND_TAG:latest

if [ $? -ne 0 ]; then
    print_error "Frontend container failed to start"
    exit 1
fi
print_success "Frontend container started"

# PHASE 4: VALIDATION
print_header "PHASE 4: VALIDATION"
echo "======================="

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 15

# Test backend health
print_status "Testing backend health..."
for i in {1..30}; do
    if curl -s -f http://localhost:5001/api/health > /dev/null; then
        print_success "Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend health check failed after 30 attempts"
        exit 1
    fi
    sleep 2
done

# Test tile server
print_status "Testing tile server..."
for i in {1..30}; do
    if curl -s -f http://localhost:8080/ > /dev/null; then
        print_success "Tile server is responding"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Tile server health check failed after 30 attempts"
        exit 1
    fi
    sleep 2
done

# Test frontend
print_status "Testing frontend..."
for i in {1..30}; do
    if curl -s -f http://localhost:3000 > /dev/null; then
        print_success "Frontend is responding"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Frontend health check failed after 30 attempts"
        exit 1
    fi
    sleep 2
done

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
echo "  📊 Frontend: http://localhost:3000"
echo "  🔌 Backend API: http://localhost:5001"
echo "  🗺️  Tile Server: http://localhost:8080"
echo "  🏥 Health Check: http://localhost:5001/api/health"
echo ""
echo "🔧 Container Information:"
echo "  Backend: disaster-rebuild-backend"
echo "  Frontend: disaster-rebuild-frontend"
echo "  Tile Server: disaster-rebuild-tileserver"
echo "  Network: $NETWORK_NAME"
echo ""
echo "📋 Management Commands:"
echo "  View logs: docker logs disaster-rebuild-*"
echo "  Stop services: docker stop disaster-rebuild-*"
echo "  Remove containers: docker rm disaster-rebuild-*"
echo "  View status: docker ps --filter name=disaster-rebuild"
echo ""
echo "🧹 Cleanup Commands:"
echo "  Stop and remove: docker stop disaster-rebuild-* && docker rm disaster-rebuild-*"
echo "  Remove images: docker rmi $BACKEND_TAG:latest $FRONTEND_TAG:latest $TILESERVER_TAG:latest"
echo "  Remove network: docker network rm $NETWORK_NAME"
echo ""
echo "🚀 Your disaster response dashboard is ready!"
echo ""

# Show running containers
print_status "Current running containers:"
docker ps --filter name=disaster-rebuild --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
print_success "Rebuild complete! All services are running from fresh source builds."
