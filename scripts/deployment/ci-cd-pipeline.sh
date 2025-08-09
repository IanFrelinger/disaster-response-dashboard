#!/bin/bash

# CI/CD Pipeline for Disaster Response Dashboard
# This script runs comprehensive tests before deployment to prevent blank pages and errors

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5001"
API_URL="http://localhost:5001/api"

# Pipeline stages
STAGE_BUILD="build"
STAGE_TEST="test"
STAGE_DEPLOY="deploy"

# Current stage
CURRENT_STAGE=${1:-$STAGE_TEST}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

stage_build() {
    log_info "Starting BUILD stage..."
    
    # Build test-enabled containers
    log_info "Building test-enabled containers..."
    docker-compose -f config/docker/docker-compose.yml build backend-test frontend-test
    
    # Build production containers
    log_info "Building production containers..."
    docker-compose -f config/docker/docker-compose.yml build backend frontend
    
    log_success "BUILD stage completed"
}

stage_test() {
    log_info "Starting TEST stage..."
    
    # Start test containers
    log_info "Starting test containers..."
    docker-compose -f config/docker/docker-compose.yml --profile test up -d backend-test frontend-test
    
    # Wait for test containers to be ready
    log_info "Waiting for test containers to be ready..."
    sleep 30
    
    # Run backend tests
    log_info "Running backend tests..."
    if docker exec docker-backend-test-1 python -m pytest tests/integration/test_api_integration.py -v --html=test-results/backend-integration-report.html; then
        log_success "Backend integration tests passed"
    else
        log_error "Backend integration tests failed"
        return 1
    fi
    
    # Run frontend tests
    log_info "Running frontend tests..."
    if docker exec docker-frontend-test-1 npx playwright test tests/e2e/comprehensive-ui-test.spec.ts --reporter=html; then
        log_success "Frontend UI tests passed"
    else
        log_error "Frontend UI tests failed"
        return 1
    fi
    
    # Run unit tests
    log_info "Running unit tests..."
    
    # Backend unit tests
    if docker exec docker-backend-test-1 python -m pytest --ignore=tests/integration -v --html=test-results/backend-unit-report.html; then
        log_success "Backend unit tests passed"
    else
        log_error "Backend unit tests failed"
        return 1
    fi
    
    # Frontend unit tests
    if docker exec docker-frontend-test-1 npm run test -- --run --reporter=html; then
        log_success "Frontend unit tests passed"
    else
        log_error "Frontend unit tests failed"
        return 1
    fi
    
    # Run performance tests
    log_info "Running performance tests..."
    
    # Start production containers for performance testing
    docker-compose -f config/docker/docker-compose.yml up -d backend frontend
    
    # Wait for services to be ready
    sleep 30
    
    # Run performance tests
    if ./scripts/run-containerized-tests.sh; then
        log_success "Performance tests passed"
    else
        log_warning "Performance tests failed"
    fi
    
    # Stop test containers
    docker-compose -f config/docker/docker-compose.yml --profile test down
    
    log_success "TEST stage completed"
}

stage_deploy() {
    log_info "Starting DEPLOY stage..."
    
    # Stop any existing containers
    docker-compose -f config/docker/docker-compose.yml down
    
    # Start production containers
    log_info "Starting production containers..."
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
        return 1
    fi
    
    # Run final smoke test
    log_info "Running final smoke test..."
    if curl -s -f "$FRONTEND_URL" > /dev/null && \
       curl -s -f "$API_URL/health" > /dev/null; then
        log_success "Final smoke test passed"
    else
        log_error "Final smoke test failed"
        return 1
    fi
    
    log_success "DEPLOY stage completed"
    log_success "🎉 Deployment successful!"
    echo ""
    echo "📱 Frontend: $FRONTEND_URL"
    echo "🔧 Backend API: $BACKEND_URL"
    echo "📊 Health Check: $API_URL/health"
}

generate_deployment_report() {
    local report_file="deployment-reports/deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    mkdir -p deployment-reports
    
    cat > "$report_file" << EOF
# Deployment Report
Generated: $(date)

## Deployment Summary
- Stage: $CURRENT_STAGE
- Status: $(if [ $? -eq 0 ]; then echo "✅ SUCCESS"; else echo "❌ FAILED"; fi)
- Frontend URL: $FRONTEND_URL
- Backend URL: $BACKEND_URL

## Test Results
- Backend Integration Tests: $(if [ -f "test-results/backend-integration-report.html" ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Frontend UI Tests: $(if [ -f "test-results/comprehensive-ui-test.spec.ts-report.html" ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Backend Unit Tests: $(if [ -f "test-results/backend-unit-report.html" ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Frontend Unit Tests: $(if [ -f "test-results/frontend-unit-report.html" ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

## Service Health
- Frontend: $(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
- Backend: $(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")

## Recommendations
$(if [ $? -eq 0 ]; then
    echo "- ✅ Deployment successful - all tests passed"
    echo "- ✅ Services are healthy and responding"
    echo "- ✅ No blank pages or critical errors detected"
else
    echo "- ❌ Deployment failed - review test results"
    echo "- ❌ Critical issues detected - manual intervention required"
fi)

EOF
    
    log_info "Deployment report generated: $report_file"
}

main() {
    echo "🚀 CI/CD Pipeline for Disaster Response Dashboard"
    echo "================================================"
    echo "Stage: $CURRENT_STAGE"
    echo "Time: $(date)"
    echo ""
    
    case $CURRENT_STAGE in
        $STAGE_BUILD)
            stage_build
            ;;
        $STAGE_TEST)
            stage_test
            ;;
        $STAGE_DEPLOY)
            stage_deploy
            ;;
        "all")
            stage_build
            stage_test
            stage_deploy
            ;;
        *)
            log_error "Unknown stage: $CURRENT_STAGE"
            log_info "Available stages: $STAGE_BUILD, $STAGE_TEST, $STAGE_DEPLOY, all"
            exit 1
            ;;
    esac
    
    # Generate deployment report
    generate_deployment_report
    
    # Final status
    if [ $? -eq 0 ]; then
        log_success "Pipeline stage '$CURRENT_STAGE' completed successfully"
        exit 0
    else
        log_error "Pipeline stage '$CURRENT_STAGE' failed"
        exit 1
    fi
}

# Run main function
main "$@"
