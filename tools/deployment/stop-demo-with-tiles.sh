#!/bin/bash

echo "🛑 Stopping Disaster Response Dashboard Demo with Tile System"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop all demo services
print_status "Stopping demo services..."
docker-compose -f ../../config/docker/docker-compose.demo.yml down

# Remove demo network
print_status "Cleaning up demo network..."
docker network rm disaster-demo-network 2>/dev/null || true

# Stop any remaining containers
print_status "Stopping any remaining containers..."
docker stop disaster-demo-frontend disaster-demo-backend disaster-demo-tileserver 2>/dev/null || true
docker rm disaster-demo-frontend disaster-demo-backend disaster-demo-tileserver 2>/dev/null || true

# Kill any processes on demo ports
print_status "Cleaning up demo ports..."
for port in 3000 5001 8080; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

print_success "Demo with tile system stopped successfully!"
echo ""
echo "🧹 Cleanup complete"
echo "📊 All services stopped"
echo "🗺️ Tile server stopped"
echo "🌐 Network cleaned up"
