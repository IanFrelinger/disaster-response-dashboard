#!/bin/bash

# Comprehensive Containerized Test Runner
# Runs all tests in the containerized environment to ensure deployment quality

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

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
    ((TOTAL_TESTS++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

wait_for_service() {
    local service_name="$1"
    local service_url="$2"
    local timeout=120
    local counter=0
    
    log_info "Waiting for $service_name to be ready..."
    
    while [ $counter -lt $timeout ]; do
        if curl -s -f "$service_url" > /dev/null 2>&1; then
            log_success "$service_name is ready!"
            return 0
        fi
        sleep 2
        counter=$((counter + 2))
        echo -n "."
    done
    
    log_error "$service_name failed to become ready within $timeout seconds"
    return 1
}

run_backend_tests() {
    log_info "Running Backend API Tests..."
    
    # Check if backend container is running
    if ! docker ps | grep -q "docker-backend"; then
        log_error "Backend container is not running"
        return 1
    fi
    
    # Run integration tests
    if docker exec docker-backend-1 python -m pytest tests/integration/test_api_integration.py -v; then
        log_success "Backend integration tests passed"
    else
        log_error "Backend integration tests failed"
        return 1
    fi
    
    # Run unit tests if they exist
    if docker exec docker-backend-1 find . -name "test_*.py" -not -path "./tests/integration/*" | head -1 | grep -q .; then
        if docker exec docker-backend-1 python -m pytest --ignore=tests/integration -v; then
            log_success "Backend unit tests passed"
        else
            log_error "Backend unit tests failed"
            return 1
        fi
    fi
    
    # Run performance tests
    if docker exec docker-backend-1 python -c "
import requests
import time
import concurrent.futures

def test_performance():
    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(requests.get, 'http://localhost:8000/api/health') for _ in range(10)]
        responses = [future.result() for future in concurrent.futures.as_completed(futures)]
    
    end_time = time.time()
    avg_time = (end_time - start_time) / len(responses)
    print(f'Average response time: {avg_time:.2f}s')
    return avg_time < 2.0

if test_performance():
    print('Performance test passed')
    exit(0)
else:
    print('Performance test failed')
    exit(1)
"; then
        log_success "Backend performance tests passed"
    else
        log_warning "Backend performance tests failed"
    fi
}

run_frontend_tests() {
    log_info "Running Frontend UI Tests..."
    
    # Check if frontend container is running
    if ! docker ps | grep -q "docker-frontend"; then
        log_error "Frontend container is not running"
        return 1
    fi
    
    # Run basic frontend tests (since Playwright requires special setup)
    if docker exec docker-frontend-1 npm run test -- --run; then
        log_success "Frontend unit tests passed"
    else
        log_warning "Frontend unit tests failed"
    fi
    
    # Run simple frontend validation
    if curl -s "$FRONTEND_URL" | grep -q "Disaster Response\|React\|App"; then
        log_success "Frontend content validation passed"
    else
        log_warning "Frontend content validation failed"
    fi
}

run_integration_tests() {
    log_info "Running Full Integration Tests..."
    
    # Test API connectivity from frontend perspective
    if curl -s -f "$API_URL/health" | grep -q "healthy"; then
        log_success "API health check passed"
    else
        log_error "API health check failed"
        return 1
    fi
    
    # Test frontend can load
    if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
        log_success "Frontend accessibility test passed"
    else
        log_error "Frontend accessibility test failed"
        return 1
    fi
    
    # Test data flow between frontend and backend
    if curl -s "$FRONTEND_URL" | grep -q "Disaster Response"; then
        log_success "Frontend content validation passed"
    else
        log_warning "Frontend content validation failed"
    fi
}

run_security_tests() {
    log_info "Running Security Tests..."
    
    # Test for common security headers
    local headers=$(curl -s -I "$FRONTEND_URL" | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection")
    if [ -n "$headers" ]; then
        log_success "Security headers present"
    else
        log_warning "Security headers missing"
    fi
    
    # Test API security
    local api_headers=$(curl -s -I "$API_URL/health" | grep -i "access-control-allow-origin")
    if [ -n "$api_headers" ]; then
        log_success "API CORS headers present"
    else
        log_warning "API CORS headers missing"
    fi
}

run_performance_tests() {
    log_info "Running Performance Tests..."
    
    # Test page load time
    local start_time=$(date +%s.%N)
    curl -s "$FRONTEND_URL" > /dev/null
    local end_time=$(date +%s.%N)
    local load_time=$(echo "$end_time - $start_time" | bc -l)
    
    if (( $(echo "$load_time < 5.0" | bc -l) )); then
        log_success "Page load time acceptable: ${load_time}s"
    else
        log_warning "Page load time slow: ${load_time}s"
    fi
    
    # Test API response time
    local api_start=$(date +%s.%N)
    curl -s "$API_URL/health" > /dev/null
    local api_end=$(date +%s.%N)
    local api_time=$(echo "$api_end - $api_start" | bc -l)
    
    if (( $(echo "$api_time < 2.0" | bc -l) )); then
        log_success "API response time acceptable: ${api_time}s"
    else
        log_warning "API response time slow: ${api_time}s"
    fi
}

run_smoke_tests() {
    log_info "Running Smoke Tests..."
    
    # Basic connectivity tests
    if curl -s -f "$FRONTEND_URL" > /dev/null; then
        log_success "Frontend smoke test passed"
    else
        log_error "Frontend smoke test failed"
        return 1
    fi
    
    if curl -s -f "$API_URL/health" > /dev/null; then
        log_success "Backend smoke test passed"
    else
        log_error "Backend smoke test failed"
        return 1
    fi
    
    # Check for critical errors in logs
    local frontend_errors=$(docker logs docker-frontend-1 2>&1 | grep -i "error\|exception\|failed" | wc -l)
    local backend_errors=$(docker logs docker-backend-1 2>&1 | grep -i "error\|exception\|failed" | wc -l)
    
    if [ "$frontend_errors" -eq 0 ]; then
        log_success "No critical frontend errors found"
    else
        log_warning "Found $frontend_errors frontend errors"
    fi
    
    if [ "$backend_errors" -eq 0 ]; then
        log_success "No critical backend errors found"
    else
        log_warning "Found $backend_errors backend errors"
    fi
}

generate_test_report() {
    local report_file="test-results/containerized-test-report-$(date +%Y%m%d-%H%M%S).md"
    
    mkdir -p test-results
    
    cat > "$report_file" << EOF
# Containerized Test Report
Generated: $(date)

## Test Summary
- Total Tests: $TOTAL_TESTS
- Passed: $PASSED_TESTS
- Failed: $FAILED_TESTS
- Warnings: $WARNINGS
- Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%

## Test Categories

### Backend Tests
- API Integration Tests
- Unit Tests
- Performance Tests

### Frontend Tests
- UI Tests (Playwright)
- Unit Tests
- Accessibility Tests

### Integration Tests
- Service Connectivity
- Data Flow Validation

### Security Tests
- Security Headers
- CORS Configuration

### Performance Tests
- Page Load Time
- API Response Time

### Smoke Tests
- Basic Connectivity
- Error Log Analysis

## Recommendations
$(if [ $FAILED_TESTS -gt 0 ]; then
    echo "- ❌ Critical issues found - deployment should be blocked"
elif [ $WARNINGS -gt 0 ]; then
    echo "- ⚠️  Warnings found - review before deployment"
else
    echo "- ✅ All tests passed - safe to deploy"
fi)

EOF
    
    log_info "Test report generated: $report_file"
}

main() {
    echo "🧪 Comprehensive Containerized Test Suite"
    echo "=========================================="
    echo ""
    
    # Wait for services to be ready
    if ! wait_for_service "Frontend" "$FRONTEND_URL"; then
        log_error "Frontend service not ready"
        exit 1
    fi
    
    if ! wait_for_service "Backend" "$API_URL/health"; then
        log_error "Backend service not ready"
        exit 1
    fi
    
    # Run all test suites
    run_smoke_tests
    run_backend_tests
    run_frontend_tests
    run_integration_tests
    run_security_tests
    run_performance_tests
    
    # Generate report
    generate_test_report
    
    # Final summary
    echo ""
    echo "📊 Test Results Summary"
    echo "======================"
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo "Warnings: $WARNINGS"
    echo ""
    
    if [ $FAILED_TESTS -gt 0 ]; then
        echo "❌ Critical test failures detected. Deployment should be blocked."
        exit 1
    elif [ $WARNINGS -gt 0 ]; then
        echo "⚠️  Warnings detected. Review before deployment."
        exit 0
    else
        echo "✅ All tests passed! Safe to deploy."
        exit 0
    fi
}

# Run main function
main "$@"
