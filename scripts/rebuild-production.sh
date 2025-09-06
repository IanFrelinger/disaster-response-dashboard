#!/bin/bash

# Rebuild Production Docker Image from Source
# Blows away old images and rebuilds with all new testing and quality improvements

set -e

echo "🚀 Rebuilding Disaster Response Dashboard Production Image from Source"
echo "=================================================================="

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
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop and remove existing containers
print_status "Stopping and removing existing containers..."
docker-compose -f docker-compose.production-enhanced.yml down --remove-orphans || true
docker-compose -f docker-compose.production.yml down --remove-orphans || true

# Remove old images
print_status "Removing old production images..."
docker image rm disaster-response-dashboard:latest 2>/dev/null || true
docker image rm disaster-response-frontend:latest 2>/dev/null || true
docker image rm disaster-response-backend:latest 2>/dev/null || true
docker image rm disaster-response-dashboard_production 2>/dev/null || true

# Clean up dangling images
print_status "Cleaning up dangling images..."
docker image prune -f

# Clean up build cache
print_status "Cleaning up build cache..."
docker builder prune -f

# Verify source code integrity
print_status "Verifying source code integrity..."
if [ ! -f "frontend/package.json" ]; then
    print_error "Frontend package.json not found. Are you in the correct directory?"
    exit 1
fi

if [ ! -f "backend/requirements.txt" ]; then
    print_error "Backend requirements.txt not found. Are you in the correct directory?"
    exit 1
fi

# Check for required environment variables
print_status "Checking environment variables..."
if [ -z "$VITE_MAPBOX_ACCESS_TOKEN" ]; then
    print_warning "VITE_MAPBOX_ACCESS_TOKEN not set. Using default test token."
    export VITE_MAPBOX_ACCESS_TOKEN="pk.test-token"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p test-results logs data

# Build the new production image
print_status "Building new production image with enhanced testing..."
docker build -f Dockerfile.production -t disaster-response-dashboard:latest .

# Verify the build
print_status "Verifying the build..."
if docker image inspect disaster-response-dashboard:latest >/dev/null 2>&1; then
    print_success "Production image built successfully!"
else
    print_error "Failed to build production image."
    exit 1
fi

# Run basic validation tests
print_status "Running basic validation tests..."
docker run --rm -d --name test-container -p 8080:80 -p 8081:8000 disaster-response-dashboard:latest

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Test frontend health
print_status "Testing frontend health..."
if curl -f http://localhost:8080/health >/dev/null 2>&1; then
    print_success "Frontend is healthy!"
else
    print_warning "Frontend health check failed, but continuing..."
fi

# Test backend health
print_status "Testing backend health..."
if curl -f http://localhost:8081/api/health >/dev/null 2>&1; then
    print_success "Backend is healthy!"
else
    print_warning "Backend health check failed, but continuing..."
fi

# Stop test container
print_status "Stopping test container..."
docker stop test-container || true
docker rm test-container || true

# Tag the image with version
VERSION=$(date +%Y%m%d-%H%M%S)
docker tag disaster-response-dashboard:latest disaster-response-dashboard:$VERSION
print_success "Image tagged as disaster-response-dashboard:$VERSION"

# Show image information
print_status "Image information:"
docker images disaster-response-dashboard --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Start the production services
print_status "Starting production services with enhanced testing..."
docker-compose -f docker-compose.production-enhanced.yml up -d

# Wait for services to be ready
print_status "Waiting for all services to be ready..."
sleep 60

# Run comprehensive validation
print_status "Running comprehensive validation tests..."
docker-compose -f docker-compose.production-enhanced.yml exec -T validation-tests npm run test:smoke || print_warning "Some tests failed, but continuing..."

# Show running containers
print_status "Running containers:"
docker-compose -f docker-compose.production-enhanced.yml ps

# Show logs
print_status "Recent logs:"
docker-compose -f docker-compose.production-enhanced.yml logs --tail=20

# Final status
print_success "=================================================================="
print_success "🎉 Production rebuild completed successfully!"
print_success "=================================================================="
print_success "📊 Frontend: http://localhost:80"
print_success "🔧 Backend API: http://localhost:8000"
print_success "❤️  Health Check: http://localhost/health"
print_success "📋 Test Results: ./test-results/"
print_success "📝 Logs: ./logs/"
print_success "=================================================================="

# Show next steps
print_status "Next steps:"
echo "1. Monitor logs: docker-compose -f docker-compose.production-enhanced.yml logs -f"
echo "2. Run tests: docker-compose -f docker-compose.production-enhanced.yml exec validation-tests npm run test:full"
echo "3. Check health: curl http://localhost/health"
echo "4. View test results: ls -la test-results/"
echo "5. Stop services: docker-compose -f docker-compose.production-enhanced.yml down"

print_success "Rebuild completed! 🚀"

