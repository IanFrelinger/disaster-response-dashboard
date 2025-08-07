#!/bin/bash

# Disaster Response Dashboard - Containerized Stop Script
# This script stops and cleans up the containerized application

set -e

echo "🛑 Stopping Disaster Response Dashboard (Containerized)"

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

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed."
    exit 1
fi

# Stop and remove containers
print_status "Stopping containers..."
docker-compose down --remove-orphans

# Remove volumes (optional - uncomment if you want to clear data)
# print_status "Removing volumes..."
# docker-compose down -v

# Remove images (optional - uncomment if you want to clear images)
# print_status "Removing images..."
# docker-compose down --rmi all

print_success "🎉 Disaster Response Dashboard stopped successfully!"

# Show what's still running
print_status "Checking for any remaining containers..."
if docker ps -a --filter "name=disaster-response" --format "table {{.Names}}\t{{.Status}}" | grep -q .; then
    print_warning "Some containers may still be running:"
    docker ps -a --filter "name=disaster-response" --format "table {{.Names}}\t{{.Status}}"
else
    print_success "All containers stopped and removed."
fi

echo ""
print_success "Containerized shutdown complete! 🛑"
