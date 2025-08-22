#!/bin/bash

# Disaster Response Dashboard Deployment Script
# Deploys backend, frontend, and core services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${BLUE}🔧 $1${NC}"
}

# Configuration
PROJECT_NAME="disaster-response-dashboard"
COMPOSE_FILE="docker-compose.yml"

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Check required directories
check_directories() {
    local required_dirs=("backend" "frontend" "data" "tiles")
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_error "Required directory '$dir' not found"
            exit 1
        fi
    done
    
    log_success "All required directories found"
}

# Build images
build_images() {
    log_header "Building Docker images..."
    
    # Build backend
    log_info "Building backend image..."
    docker build -t disaster-response-backend:latest ./backend
    
    # Build frontend
    log_info "Building frontend image..."
    docker build -t disaster-response-frontend:latest ./frontend
    
    log_success "All images built successfully"
}

# Start services
start_services() {
    log_header "Starting services..."
    
    # Stop existing services
    docker-compose down --remove-orphans
    
    # Start services
    docker-compose up -d
    
    log_success "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    log_header "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps | grep -q "Up"; then
            log_success "Services are ready"
            return 0
        fi
        
        log_info "Waiting for services... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    log_error "Services failed to start within expected time"
    return 1
}

# Check service health
check_health() {
    log_header "Checking service health..."
    
    local services=("postgres" "redis" "backend" "frontend" "nginx")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "$service is running"
        else
            log_error "$service is not running"
            return 1
        fi
    done
    
    log_success "All services are healthy"
}

# Show service status
show_status() {
    log_header "Service Status"
    
    echo -e "${GRAY}Services:${NC}"
    docker-compose ps
    
    echo -e "\n${GRAY}Access URLs:${NC}"
    echo -e "${GRAY}  • Frontend:${NC} http://localhost"
    echo -e "${GRAY}  • Backend API:${NC} http://localhost:5000"
    echo -e "${GRAY}  • Database:${NC} localhost:5432"
    echo -e "${GRAY}  • Redis:${NC} localhost:6379"
    
    echo -e "\n${GRAY}Logs:${NC}"
    echo -e "${GRAY}  • View logs:${NC} docker-compose logs -f"
    echo -e "${GRAY}  • Backend logs:${NC} docker-compose logs -f backend"
    echo -e "${GRAY}  • Frontend logs:${NC} docker-compose logs -f frontend"
}

# Stop services
stop_services() {
    log_header "Stopping services..."
    docker-compose down
    log_success "Services stopped"
}

# Clean up
cleanup() {
    log_header "Cleaning up..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    log_success "Cleanup completed"
}

# Main deployment function
deploy() {
    log_header "Starting deployment..."
    
    check_docker
    check_directories
    build_images
    start_services
    wait_for_services
    check_health
    show_status
    
    log_success "Deployment completed successfully!"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "start")
        start_services
        wait_for_services
        show_status
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        start_services
        wait_for_services
        show_status
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  start    - Start services"
        echo "  stop     - Stop services"
        echo "  restart  - Restart services"
        echo "  status   - Show service status"
        echo "  cleanup  - Stop and clean up everything"
        echo "  help     - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
