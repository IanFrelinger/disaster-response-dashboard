#!/bin/bash

# Demo script for Mock Geo-Tiles
# Shows the complete workflow from setup to viewing tiles

echo "🎬 Disaster Response Dashboard - Mock Tiles Demo"
echo "================================================"
echo ""

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

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the disaster-response-dashboard root directory"
    exit 1
fi

print_status "Starting Mock Tiles Demo..."
echo ""

# Step 1: Check if tiles are already set up
if [ ! -f "./tiles/admin_boundaries.mbtiles" ]; then
    print_warning "Tiles not found. Setting up mock tiles..."
    echo ""
    
    if [ ! -f "./scripts/setup-mock-tiles.sh" ]; then
        print_error "Setup script not found. Please ensure setup-mock-tiles.sh exists."
        exit 1
    fi
    
    print_status "Running tile setup..."
    ./scripts/setup-mock-tiles.sh
    
    if [ $? -ne 0 ]; then
        print_error "Tile setup failed. Please check the error messages above."
        exit 1
    fi
    
    print_success "Tile setup completed!"
else
    print_success "Tiles already exist. Skipping setup."
fi

echo ""

# Step 2: Start tile services
print_status "Starting tile services..."
./scripts/start-tiles.sh

if [ $? -ne 0 ]; then
    print_error "Failed to start tile services."
    exit 1
fi

print_success "Tile services started!"
echo ""

# Step 3: Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 5

# Step 4: Test the services
print_status "Testing tile services..."
./scripts/test-tiles.sh

if [ $? -ne 0 ]; then
    print_warning "Some tile services may not be responding. This is normal if PMTiles server is not running."
fi

echo ""

# Step 5: Show demo information
print_success "🎉 Demo setup complete!"
echo ""
echo "📊 Available Services:"
echo "   • Tileserver-GL: http://localhost:8080/"
echo "   • PMTiles Server: http://localhost:8081/ (if started with --pmtiles)"
echo ""
echo "🗺️  Tile Endpoints:"
echo "   • Admin Boundaries: http://localhost:8080/data/admin_boundaries.json"
echo "   • California Counties: http://localhost:8080/data/california_counties.json"
echo "   • Hazard Zones: http://localhost:8080/data/hazards.json"
echo "   • Evacuation Routes: http://localhost:8080/data/routes.json"
echo ""
echo "🎨 Map Styles:"
echo "   • Disaster Response Style: http://localhost:8080/styles/disaster-response.json"
echo ""
echo "🔧 Frontend Integration:"
echo "   • Import DisasterMap component: frontend/src/components/common/DisasterMap.tsx"
echo "   • Use TileService: frontend/src/services/tileService.ts"
echo ""
echo "🧪 Next Steps:"
echo "   1. Open http://localhost:8080/ in your browser to view the tile server"
echo "   2. Start your frontend: cd frontend && npm run dev"
echo "   3. Use the DisasterMap component in your React app"
echo "   4. Test layer visibility controls"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.tiles.yml down"
echo ""
print_status "Demo completed successfully! 🚀"
