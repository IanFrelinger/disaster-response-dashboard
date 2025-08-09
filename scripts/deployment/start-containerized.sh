#!/bin/bash

# Disaster Response Dashboard - Containerized Startup Script
# This script builds and starts the full application using Docker Compose

set -e

echo "🚀 Starting Disaster Response Dashboard (Containerized)"

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Change to the docker-compose directory
cd config/docker

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans

# Build the images
print_status "Building Docker images..."
docker-compose build --no-cache

# Start the services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."

# Wait for backend
print_status "Waiting for backend to be ready..."
timeout=120
counter=0
while [ $counter -lt $timeout ]; do
    if docker-compose exec -T backend curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
        print_success "Backend is healthy!"
        break
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done

if [ $counter -eq $timeout ]; then
    print_error "Backend failed to become healthy within $timeout seconds"
    docker-compose logs backend
    exit 1
fi

# Wait for frontend
print_status "Waiting for frontend to be ready..."
counter=0
while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Frontend is healthy!"
        break
    fi
    sleep 2
    counter=$((counter + 2))
    echo -n "."
done

if [ $counter -eq $timeout ]; then
    print_error "Frontend failed to become healthy within $timeout seconds"
    docker-compose logs frontend
    exit 1
fi

# Show service status
print_status "Service Status:"
docker-compose ps

# Show URLs
echo ""
print_success "🎉 Disaster Response Dashboard is now running!"
echo ""
echo "📱 Frontend (Public View): http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo "📊 API Health: http://localhost:5001/api/health"
echo ""
echo "📋 Useful Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  View service status: docker-compose ps"
echo ""

# Check if curl is available for health check
if command -v curl &> /dev/null; then
    print_status "Testing API health..."
    if curl -s http://localhost:5001/api/health | grep -q "healthy"; then
        print_success "API health check passed!"
    else
        print_warning "API health check failed or returned unexpected response"
    fi
fi

print_success "Containerized startup complete! 🚀"
