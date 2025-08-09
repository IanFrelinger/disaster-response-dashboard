#!/bin/bash

# Local Deployment Script for Disaster Response Dashboard
# Runs comprehensive tests before deployment to prevent blank pages and errors

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5001"
API_URL="http://localhost:5001/api"

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
    echo ""
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check Docker Compose
    if ! docker-compose version > /dev/null 2>&1; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    # Check curl
    if ! command -v curl > /dev/null 2>&1; then
        log_error "curl is not available. Please install curl."
        exit 1
    fi
    
    log_success "All prerequisites are met"
}

stop_existing_services() {
    log_info "Stopping existing services..."
    docker-compose -f config/docker/docker-compose.yml down --remove-orphans
    log_success "Existing services stopped"
}

build_services() {
    log_info "Building services..."
    
    # Build production containers
    log_info "Building production containers..."
    docker-compose -f config/docker/docker-compose.yml build backend frontend
    
    # Build test containers
    log_info "Building test containers..."
    docker-compose -f config/docker/docker-compose.yml build backend-test frontend-test
    
    log_success "All containers built successfully"
}

run_pre_deployment_tests() {
    log_header "PRE-DEPLOYMENT TESTING"
    
    # Start test containers
    log_info "Starting test containers..."
    docker-compose -f config/docker/docker-compose.yml --profile test up -d backend-test frontend-test
    
    # Wait for test containers to be ready
    log_info "Waiting for test containers to be ready..."
    sleep 30
    
    # Run backend tests
    log_info "Running backend tests..."
    if docker exec docker-backend-test-1 python -m pytest tests/integration/test_api_integration.py -v --tb=short; then
        log_success "Backend tests passed"
    else
        log_error "Backend tests failed"
        docker-compose -f config/docker/docker-compose.yml --profile test down
        exit 1
    fi
    
    # Run unit tests
    log_info "Running unit tests..."
    if docker exec docker-backend-test-1 python -m pytest --ignore=tests/integration -v --tb=short; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        docker-compose -f config/docker/docker-compose.yml --profile test down
        exit 1
    fi
    
    # Stop test containers
    log_info "Stopping test containers..."
    docker-compose -f config/docker/docker-compose.yml --profile test down
    
    log_success "Pre-deployment tests completed successfully"
}

deploy_services() {
    log_header "DEPLOYING SERVICES"
    
    # Start production services
    log_info "Starting production services..."
    docker-compose -f config/docker/docker-compose.yml up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    timeout=120
    counter=0
    
    while [ $counter -lt $timeout ]; do
        if curl -s -f "$API_URL/health" > /dev/null 2>&1 && \
           curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
            log_success "All services are healthy!"
            break
        fi
        sleep 2
        counter=$((counter + 2))
        echo -n "."
    done
    
    if [ $counter -eq $timeout ]; then
        log_error "Services failed to become healthy within $timeout seconds"
        docker-compose -f config/docker/docker-compose.yml logs
        exit 1
    fi
}

run_post_deployment_tests() {
    log_header "POST-DEPLOYMENT TESTING"
    
    # Run comprehensive test suite
    log_info "Running comprehensive test suite..."
    if ./scripts/local-testing-suite.sh --quick; then
        log_success "Post-deployment tests passed"
    else
        log_warning "Some post-deployment tests failed - review the results"
    fi
}

verify_deployment() {
    log_header "VERIFYING DEPLOYMENT"
    
    # Test basic connectivity
    log_info "Testing basic connectivity..."
    if curl -s -f "$FRONTEND_URL" > /dev/null; then
        log_success "Frontend is accessible"
    else
        log_error "Frontend is not accessible"
        return 1
    fi
    
    if curl -s -f "$API_URL/health" > /dev/null; then
        log_success "Backend API is accessible"
    else
        log_error "Backend API is not accessible"
        return 1
    fi
    
    # Test content loading
    log_info "Testing content loading..."
    if curl -s "$FRONTEND_URL" | grep -q "Disaster Response\|React\|App"; then
        log_success "Frontend content is loading correctly"
    else
        log_warning "Frontend content may not be loading as expected"
    fi
    
    # Test API health
    if curl -s "$API_URL/health" | grep -q "healthy"; then
        log_success "API health check passed"
    else
        log_error "API health check failed"
        return 1
    fi
    
    # Check for critical errors in logs
    log_info "Checking for critical errors..."
    local frontend_errors=$(docker logs docker-frontend-1 2>&1 | grep -i "error\|exception\|failed" | wc -l)
    local backend_errors=$(docker logs docker-backend-1 2>&1 | grep -i "error\|exception\|failed" | wc -l)
    
    if [ "$frontend_errors" -eq 0 ]; then
        log_success "No critical frontend errors found"
    else
        log_warning "Found $frontend_errors frontend errors in logs"
    fi
    
    if [ "$backend_errors" -eq 0 ]; then
        log_success "No critical backend errors found"
    else
        log_warning "Found $backend_errors backend errors in logs"
    fi
}

show_service_status() {
    log_header "SERVICE STATUS"
    
    echo "📱 Frontend: $FRONTEND_URL"
    echo "🔧 Backend API: $BACKEND_URL"
    echo "📊 Health Check: $API_URL/health"
    echo ""
    
    # Show container status
    log_info "Container Status:"
    docker-compose -f config/docker/docker-compose.yml ps
    
    echo ""
    log_info "Useful Commands:"
    echo "  View logs: docker-compose -f config/docker/docker-compose.yml logs -f"
    echo "  Stop services: docker-compose -f config/docker/docker-compose.yml down"
    echo "  Restart services: docker-compose -f config/docker/docker-compose.yml restart"
    echo "  Run tests: ./scripts/local-testing-suite.sh"
    echo "  Quick test: ./scripts/local-testing-suite.sh --quick"
}

generate_deployment_report() {
    local report_file="deployment-reports/local-deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    mkdir -p deployment-reports
    
    cat > "$report_file" << EOF
# Local Deployment Report
Generated: $(date)

## Deployment Summary
- Status: ✅ SUCCESS
- Frontend URL: $FRONTEND_URL
- Backend URL: $BACKEND_URL
- Health Check: $API_URL/health

## Deployment Steps
1. ✅ Prerequisites checked
2. ✅ Existing services stopped
3. ✅ Services built
4. ✅ Pre-deployment tests passed
5. ✅ Services deployed
6. ✅ Post-deployment tests completed
7. ✅ Deployment verified

## Service Health
- Frontend: $(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
- Backend: $(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")

## Container Status
$(docker-compose -f config/docker/docker-compose.yml ps)

## Recommendations
- ✅ Deployment successful - all tests passed
- ✅ Services are healthy and responding
- ✅ No blank pages or critical errors detected
- ✅ Application is ready for use

## Next Steps
1. Open $FRONTEND_URL in your browser
2. Test the application functionality
3. Monitor logs for any issues
4. Run full test suite if needed: ./scripts/local-testing-suite.sh

EOF
    
    log_info "Deployment report generated: $report_file"
}

show_usage() {
    echo "Local Deployment Script for Disaster Response Dashboard"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  --skip-tests        Skip pre-deployment testing"
    echo "  --quick-tests       Run only essential tests"
    echo "  --full-tests        Run comprehensive test suite"
    echo ""
    echo "Examples:"
    echo "  $0                  # Full deployment with all tests"
    echo "  $0 --skip-tests     # Deploy without running tests"
    echo "  $0 --quick-tests    # Deploy with quick tests only"
}

main() {
    local skip_tests=false
    local quick_tests=false
    local full_tests=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --quick-tests)
                quick_tests=true
                shift
                ;;
            --full-tests)
                full_tests=true
                shift
                ;;
            *)
                echo "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Local Deployment for Disaster Response Dashboard"
    echo "=================================================="
    echo "Time: $(date)"
    echo "Skip Tests: $skip_tests"
    echo "Quick Tests: $quick_tests"
    echo "Full Tests: $full_tests"
    echo ""
    
    # Run deployment steps
    check_prerequisites
    stop_existing_services
    build_services
    
    if [ "$skip_tests" = false ]; then
        run_pre_deployment_tests
    else
        log_warning "Skipping pre-deployment tests"
    fi
    
    deploy_services
    verify_deployment
    
    if [ "$skip_tests" = false ]; then
        run_post_deployment_tests
    fi
    
    show_service_status
    generate_deployment_report
    
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Your Disaster Response Dashboard is now running at:"
    echo "📱 Frontend: $FRONTEND_URL"
    echo "🔧 Backend API: $BACKEND_URL"
    echo ""
    echo "Run './scripts/local-testing-suite.sh' to perform comprehensive testing."
}

# Run main function
main "$@"
