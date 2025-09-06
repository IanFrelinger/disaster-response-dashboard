#!/bin/bash

# Simple Deployment Script for Disaster Response Dashboard
# This script builds and deploys containers without running tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="disaster-response-dashboard"
FRONTEND_PORT=3000
BACKEND_PORT=8000

echo -e "${BLUE}🚀 Starting Simple Deployment${NC}"
echo "=================================================="

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Pre-flight checks
print_status "Step 1: Pre-flight checks"
echo "----------------------------------------"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi
print_success "Docker is running"

# Check if ports are available
if lsof -i :$FRONTEND_PORT >/dev/null 2>&1; then
    print_warning "Port $FRONTEND_PORT is in use. Stopping existing service..."
    docker-compose down 2>/dev/null || true
fi

if lsof -i :$BACKEND_PORT >/dev/null 2>&1; then
    print_warning "Port $BACKEND_PORT is in use. Stopping existing service..."
    docker-compose down 2>/dev/null || true
fi

print_success "Ports are available"

# Step 2: Clean up existing containers
print_status "Step 2: Cleaning up existing containers"
echo "----------------------------------------"

docker-compose down --volumes --remove-orphans 2>/dev/null || true
docker system prune -f >/dev/null 2>&1 || true
print_success "Cleanup completed"

# Step 3: Build production containers
print_status "Step 3: Building production containers"
echo "----------------------------------------"

# Build backend
print_status "Building backend container..."
if ! docker build --no-cache -t ${PROJECT_NAME}-backend:latest ./backend; then
    print_error "Backend build failed"
    exit 1
fi
print_success "Backend built successfully"

# Build frontend
print_status "Building frontend container..."
if ! docker build --no-cache -t ${PROJECT_NAME}-frontend:latest ./frontend; then
    print_error "Frontend build failed"
    exit 1
fi
print_success "Frontend built successfully"

# Step 4: Deploy to localhost
print_status "Step 4: Deploying to localhost"
echo "----------------------------------------"

# Start production services
print_status "Starting production services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 15

# Health checks
print_status "Running health checks..."

# Backend health check
if curl -f http://localhost:$BACKEND_PORT/api/health >/dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_error "Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Frontend health check
if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_error "Frontend health check failed"
    docker-compose logs frontend
    exit 1
fi

# Step 5: Final validation
print_status "Step 5: Final validation"
echo "----------------------------------------"

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    print_success "All services are running"
else
    print_error "Some services are not running"
    docker-compose ps
    exit 1
fi

# Display service status
echo ""
print_status "Service Status:"
docker-compose ps

echo ""
print_success "🎉 Simple Deployment Completed Successfully!"
echo ""
echo "🌐 Services Available:"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Backend:  http://localhost:$BACKEND_PORT"
echo ""
echo "🔄 To redeploy:"
echo "   ./scripts/simple-deploy.sh"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"

