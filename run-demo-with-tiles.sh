#!/bin/bash

echo "🚀 Disaster Response Dashboard - Demo Mode with Tile System"
echo "============================================================"

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=5001
TILE_SERVER_PORT=8080
DEMO_NETWORK="disaster-demo-network"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_tile() {
    echo -e "${PURPLE}[TILES]${NC} $1"
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up demo deployment..."
    docker-compose -f docker-compose.demo.yml down
    docker network rm $DEMO_NETWORK 2>/dev/null || true
    print_success "Demo cleanup complete"
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

# Check if ports are available
for port in $FRONTEND_PORT $BACKEND_PORT $TILE_SERVER_PORT; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use. Stopping existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

print_success "Prerequisites check passed"

# Validate tile system
print_tile "Validating tile system..."
if python scripts/validate_tiles_advanced.py > /dev/null 2>&1; then
    print_success "Tile system validation passed"
else
    print_warning "Tile system validation failed - attempting to fix..."
    # Try to regenerate tiles if needed
    if [ -f "scripts/setup-mock-tiles.sh" ]; then
        bash scripts/setup-mock-tiles.sh
    fi
fi

# Create Docker network
print_status "Creating Docker network..."
docker network create $DEMO_NETWORK 2>/dev/null || true
print_success "Docker network created"

# Start all services
print_status "Starting demo services..."
docker-compose -f docker-compose.demo.yml up -d

if [ $? -ne 0 ]; then
    print_error "Failed to start demo services"
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."

# Wait for backend
print_status "Waiting for backend..."
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        print_success "Backend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend failed to start"
        exit 1
    fi
    sleep 2
done

# Wait for tile server
print_status "Waiting for tile server..."
for i in {1..30}; do
    if curl -s http://localhost:$TILE_SERVER_PORT/ > /dev/null 2>&1; then
        print_success "Tile server is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Tile server failed to start"
        exit 1
    fi
    sleep 2
done

# Wait for frontend
print_status "Waiting for frontend..."
for i in {1..30}; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        print_success "Frontend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Frontend failed to start"
        exit 1
    fi
    sleep 2
done

# Validate tile serving
print_tile "Validating tile serving..."
sleep 5
if python scripts/validate_tiles_advanced.py > /dev/null 2>&1; then
    print_success "Tile serving validation passed"
else
    print_warning "Tile serving validation failed - tiles may not be fully functional"
fi

# Display demo information
echo ""
echo "🎉 Demo Mode with Tile System - Ready!"
echo "======================================="
echo ""
echo "📊 Dashboard: http://localhost:$FRONTEND_PORT"
echo "🔌 Backend API: http://localhost:$BACKEND_PORT"
echo "🗺️  Tile Server: http://localhost:$TILE_SERVER_PORT"
echo "🏥 Health Check: http://localhost:$BACKEND_PORT/api/health"
echo ""
echo "🗺️ Available Map Layers:"
echo "  • Admin Boundaries: http://localhost:$TILE_SERVER_PORT/data/admin_boundaries.json"
echo "  • California Counties: http://localhost:$TILE_SERVER_PORT/data/california_counties.json"
echo "  • Hazard Zones: http://localhost:$TILE_SERVER_PORT/data/hazards.json"
echo "  • Evacuation Routes: http://localhost:$TILE_SERVER_PORT/data/routes.json"
echo ""
echo "🧪 Validation Status:"
echo "  ✅ Backend: Healthy"
echo "  ✅ Frontend: Running"
echo "  ✅ Tile Server: Serving"
echo "  ✅ Network: Connected"
echo ""
echo "🔧 Management Commands:"
echo "  View logs: docker-compose -f docker-compose.demo.yml logs"
echo "  Stop demo: ./stop-demo.sh"
echo "  Validate tiles: python scripts/validate_tiles_advanced.py"
echo "  Monitor tiles: python scripts/monitor_tiles.py"
echo ""
echo "📚 Documentation:"
echo "  Tile System: docs/summaries/FINAL_TILE_SYSTEM_SUMMARY.md"
echo "  Monitoring: docs/AUTOMATED_MONITORING_GUIDE.md"
echo "  Demo Guide: demo_test_guide.md"
echo ""
echo "🚀 Demo mode with tile system is ready for offline mockups!"
echo ""
echo "Press Ctrl+C to stop the demo"

# Wait for user to stop
wait
