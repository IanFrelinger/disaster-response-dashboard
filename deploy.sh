#!/bin/bash

# Disaster Response Dashboard Local Deployment Script
# This script deploys both backend and frontend with street data integration

set -e

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! docker-compose --version > /dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to create environment file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating .env file with default values..."
        cat > .env << EOF
# Disaster Response Dashboard Environment Variables

# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
VITE_MAPBOX_STYLE_URL=mapbox://styles/mapbox/satellite-streets-v12

# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Build Configuration
VITE_DEBUG_MODE=false
VITE_BUILD_ENV=production

# Street Data Configuration
REACT_APP_STREET_DATA_CACHE_TTL=300000
REACT_APP_STREET_DATA_MAX_RADIUS=50000
EOF
        print_warning "Created .env file with default values. Please update with your actual Mapbox token."
    else
        print_success ".env file already exists"
    fi
}

# Function to create data directories
create_data_directories() {
    print_status "Creating data directories..."
    
    mkdir -p data/street_network
    mkdir -p data/hazards
    mkdir -p data/routes
    
    # Create sample street data if it doesn't exist
    if [ ! -f data/street_network/sample_streets.geojson ]; then
        print_status "Creating sample street data..."
        cat > data/street_network/sample_streets.geojson << EOF
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "osm_id": "12345",
        "name": "Sample Street",
        "highway": "primary",
        "maxspeed": 50,
        "lanes": 2,
        "oneway": false,
        "surface": "paved",
        "width": 3.5,
        "maxweight": 3500,
        "maxheight": 4.0,
        "maxwidth": 2.5,
        "bridge": false,
        "tunnel": false,
        "access": "yes",
        "emergency_access": true,
        "evacuation_route": false,
        "traffic_signals": true,
        "stop_signs": false,
        "yield_signs": false,
        "roundabout": false,
        "traffic_calming": false,
        "lit": true,
        "sidewalk": true,
        "bicycle": false,
        "bus_lane": false,
        "hov_lane": false,
        "toll": false,
        "seasonal": false,
        "condition": "good"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-122.4194, 37.7749],
          [-122.4195, 37.7750]
        ]
      }
    }
  ]
}
EOF
        print_success "Created sample street data"
    fi
}

# Function to build and start services
deploy_services() {
    local compose_file=${1:-docker-compose.core.yml}
    
    print_status "Building and starting services using $compose_file..."
    
    # Stop any existing containers
    print_status "Stopping existing containers..."
    docker-compose -f $compose_file down --remove-orphans
    
    # Build and start services
    print_status "Building containers..."
    docker-compose -f $compose_file build --no-cache
    
    print_status "Starting services..."
    docker-compose -f $compose_file up -d
    
    print_success "Services started successfully!"
}

# Function to check service health
check_services() {
    print_status "Checking service health..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed, but service may still be starting..."
    fi
    
    # Check frontend health
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed, but service may still be starting..."
    fi
}

# Function to show service URLs
show_urls() {
    echo ""
    print_success "Deployment completed! Services are available at:"
    echo ""
    echo -e "${GREEN}Frontend Dashboard:${NC} http://localhost:8080"
    echo -e "${GREEN}Backend API:${NC} http://localhost:8000"
    echo -e "${GREEN}API Health Check:${NC} http://localhost:8000/api/health"
    echo ""
    echo -e "${YELLOW}Note:${NC} If you haven't set up your Mapbox token, please:"
    echo "1. Get a free token from https://www.mapbox.com/"
    echo "2. Update the .env file with your token"
    echo "3. Restart the services with: ./deploy.sh"
    echo ""
}

# Function to show logs
show_logs() {
    local compose_file=${1:-docker-compose.core.yml}
    print_status "Showing service logs..."
    docker-compose -f $compose_file logs -f
}

# Function to stop services
stop_services() {
    local compose_file=${1:-docker-compose.core.yml}
    print_status "Stopping services..."
    docker-compose -f $compose_file down
    print_success "Services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up containers and images..."
    docker-compose -f docker-compose.core.yml down --volumes --remove-orphans
    docker-compose -f docker-compose.full.yml down --volumes --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Main script logic
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Disaster Response Dashboard${NC}"
    echo -e "${BLUE}  Local Deployment Script${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_docker
            check_docker_compose
            create_env_file
            create_data_directories
            deploy_services
            check_services
            show_urls
            ;;
        "deploy-full")
            check_docker
            check_docker_compose
            create_env_file
            create_data_directories
            deploy_services docker-compose.full.yml
            check_services
            show_urls
            ;;
        "logs")
            show_logs
            ;;
        "logs-full")
            show_logs docker-compose.full.yml
            ;;
        "stop")
            stop_services
            ;;
        "stop-full")
            stop_services docker-compose.full.yml
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  deploy      - Deploy core services (backend + frontend)"
            echo "  deploy-full - Deploy all services (including monitoring)"
            echo "  logs        - Show logs for core services"
            echo "  logs-full   - Show logs for all services"
            echo "  stop        - Stop core services"
            echo "  stop-full   - Stop all services"
            echo "  cleanup     - Clean up containers and images"
            echo "  help        - Show this help message"
            echo ""
            echo "Default: deploy"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
