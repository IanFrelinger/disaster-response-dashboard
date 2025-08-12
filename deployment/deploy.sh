#!/bin/bash

# Disaster Response Dashboard - Full Deployment Script
# Deploys backend, frontend, and video production services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="deployment/docker-compose.full.yml"
PROJECT_NAME="disaster-response"
ENVIRONMENT=${1:-production}

# Helper functions
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
    echo -e "${PURPLE}🚀 $1${NC}"
    echo -e "${CYAN}$2${NC}"
    echo ""
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check required directories
    local required_dirs=("backend" "frontend" "video-production" "data" "tiles")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_error "Required directory '$dir' not found."
            exit 1
        fi
    done
    
    log_success "Prerequisites check passed!"
}

setup_ssl_certificates() {
    log_info "Setting up SSL certificates..."
    
    local ssl_dir="deployment/ssl"
    mkdir -p "$ssl_dir"
    
    # Generate self-signed certificate for development
    if [ ! -f "$ssl_dir/cert.pem" ] || [ ! -f "$ssl_dir/key.pem" ]; then
        log_info "Generating self-signed SSL certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$ssl_dir/key.pem" \
            -out "$ssl_dir/cert.pem" \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        log_success "SSL certificate generated!"
    else
        log_info "SSL certificates already exist."
    fi
}

setup_monitoring() {
    log_info "Setting up monitoring configuration..."
    
    # Create Grafana provisioning directories
    mkdir -p deployment/grafana/datasources
    mkdir -p deployment/grafana/dashboards
    
    # Create Prometheus datasource for Grafana
    cat > deployment/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://monitoring:9090
    isDefault: true
EOF
    
    log_success "Monitoring configuration created!"
}

build_images() {
    log_info "Building Docker images..."
    
    # Build backend
    log_info "Building backend image..."
    docker build -t disaster-response-backend:latest ./backend
    
    # Build frontend
    log_info "Building frontend image..."
    docker build -t disaster-response-frontend:latest ./frontend
    
    # Build video production
    log_info "Building video production image..."
    docker build -t disaster-response-video:latest ./video-production
    
    log_success "All images built successfully!"
}

deploy_services() {
    log_info "Deploying services..."
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services deployed successfully!"
}

wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    local services=("postgres" "redis" "backend" "frontend" "video-production" "nginx")
    local max_attempts=30
    local attempt=1
    
    for service in "${services[@]}"; do
        log_info "Waiting for $service..."
        while [ $attempt -le $max_attempts ]; do
            if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
                log_success "$service is ready!"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                log_error "$service failed to start within timeout"
                return 1
            fi
            
            sleep 2
            attempt=$((attempt + 1))
        done
        attempt=1
    done
    
    log_success "All services are ready!"
}

run_health_checks() {
    log_info "Running health checks..."
    
    local checks=(
        "http://localhost/api/health"
        "http://localhost"
        "http://localhost/video/"
        "http://localhost:9090"
        "http://localhost:3002"
    )
    
    for check in "${checks[@]}"; do
        log_info "Checking $check..."
        if curl -f -s "$check" > /dev/null; then
            log_success "$check is healthy"
        else
            log_warning "$check is not responding (this might be normal during startup)"
        fi
    done
}

show_deployment_info() {
    log_header "Deployment Complete!" "Disaster Response Dashboard is now running"
    
    echo -e "${BLUE}📊 Service URLs:${NC}"
    echo -e "${GRAY}  • Main Application:${NC} http://localhost"
    echo -e "${GRAY}  • API Documentation:${NC} http://localhost/api/docs"
    echo -e "${GRAY}  • Video Production:${NC} http://localhost/video/"
    echo -e "${GRAY}  • Monitoring:${NC} http://localhost:9090"
    echo -e "${GRAY}  • Grafana Dashboard:${NC} http://localhost:3002 (admin/admin)"
    
    echo ""
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo -e "${GRAY}  • View logs:${NC} docker-compose -f $COMPOSE_FILE logs -f"
    echo -e "${GRAY}  • Stop services:${NC} docker-compose -f $COMPOSE_FILE down"
    echo -e "${GRAY}  • Restart services:${NC} docker-compose -f $COMPOSE_FILE restart"
    echo -e "${GRAY}  • Update services:${NC} ./deployment/deploy.sh update"
    
    echo ""
    echo -e "${BLUE}📁 Important Directories:${NC}"
    echo -e "${GRAY}  • Data:${NC} ./data"
    echo -e "${GRAY}  • Video Output:${NC} ./video-production/output"
    echo -e "${GRAY}  • Logs:${NC} docker-compose -f $COMPOSE_FILE logs"
    
    echo ""
    echo -e "${GREEN}🎉 Deployment successful! The Disaster Response Dashboard is now running.${NC}"
}

update_services() {
    log_info "Updating services..."
    
    # Pull latest changes
    git pull origin main
    
    # Rebuild and restart services
    build_images
    deploy_services
    wait_for_services
    run_health_checks
    
    log_success "Services updated successfully!"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log_success "Cleanup completed!"
}

show_help() {
    log_header "Disaster Response Dashboard - Deployment Script"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy all services (default)"
    echo "  update    - Update existing services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  logs      - Show service logs"
    echo "  status    - Show service status"
    echo "  cleanup   - Clean up unused resources"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 update"
    echo "  $0 logs"
    echo ""
}

# Main deployment function
deploy() {
    log_header "Disaster Response Dashboard" "Full Deployment"
    
    check_prerequisites
    setup_ssl_certificates
    setup_monitoring
    build_images
    deploy_services
    wait_for_services
    run_health_checks
    cleanup
    show_deployment_info
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    update)
        update_services
        ;;
    stop)
        log_info "Stopping services..."
        docker-compose -f "$COMPOSE_FILE" down
        log_success "Services stopped!"
        ;;
    restart)
        log_info "Restarting services..."
        docker-compose -f "$COMPOSE_FILE" restart
        log_success "Services restarted!"
        ;;
    logs)
        log_info "Showing service logs..."
        docker-compose -f "$COMPOSE_FILE" logs -f
        ;;
    status)
        log_info "Service status:"
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
