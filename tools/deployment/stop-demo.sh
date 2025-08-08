#!/bin/bash

echo "🛑 Stopping Disaster Response Dashboard Demo"
echo "============================================"

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop frontend processes
print_status "Stopping frontend processes..."
pkill -f "npm run dev:demo" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
print_success "Frontend processes stopped"

# Stop Docker containers
print_status "Stopping Docker containers..."
docker stop disaster-demo-backend 2>/dev/null || true
docker stop disaster-backend 2>/dev/null || true
print_success "Docker containers stopped"

# Remove Docker containers
print_status "Removing Docker containers..."
docker rm disaster-demo-backend 2>/dev/null || true
docker rm disaster-backend 2>/dev/null || true
print_success "Docker containers removed"

# Remove Docker network
print_status "Removing Docker network..."
docker network rm disaster-demo-network 2>/dev/null || true
print_success "Docker network removed"

# Kill any remaining processes on demo ports
print_status "Cleaning up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
print_success "Ports cleaned up"

echo ""
echo "✅ Demo environment stopped successfully!"
echo ""
echo "📊 Status:"
echo "  🛑 Frontend: Stopped"
echo "  🛑 Backend: Stopped"
echo "  🛑 Docker: Cleaned up"
echo "  🛑 Ports: Freed"
echo ""
echo "🚀 To restart the demo, run: ./deploy-demo.sh"
