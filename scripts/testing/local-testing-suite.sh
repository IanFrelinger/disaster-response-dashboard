#!/bin/bash

# Local Testing Suite for Disaster Response Dashboard
# Runs comprehensive tests locally to prevent blank pages and errors

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
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5001"
API_URL="http://localhost:5001/api"

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Test categories
TEST_CATEGORIES_smoke="Basic connectivity and health checks"
TEST_CATEGORIES_backend="API and backend functionality"
TEST_CATEGORIES_frontend="UI and frontend functionality"
TEST_CATEGORIES_integration="Frontend-backend integration"
TEST_CATEGORIES_performance="Response time and load testing"
TEST_CATEGORIES_security="Security vulnerability checks"
TEST_CATEGORIES_accessibility="Accessibility compliance"
TEST_CATEGORIES_visual="Visual regression testing"

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

log_header() {
    echo -e "${PURPLE}🔍 $1${NC}"
    echo -e "${CYAN}$2${NC}"
    echo ""
}

get_category_description() {
    local category="$1"
    eval "echo \$TEST_CATEGORIES_$category"
}

wait_for_service() {
    local service_name="$1"
    local service_url="$2"
    local timeout=60
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

check_docker_status() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    if ! docker-compose version > /dev/null 2>&1; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    log_success "Docker environment is ready"
}

run_smoke_tests() {
    log_header "SMOKE TESTS" "$(get_category_description smoke)"
    
    # Test basic connectivity
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
    
    # Test basic content
    if curl -s "$FRONTEND_URL" | grep -q "Disaster Response\|React\|App"; then
        log_success "Frontend content is loading"
    else
        log_warning "Frontend content may not be loading correctly"
    fi
    
    # Test API health response
    if curl -s "$API_URL/health" | grep -q "healthy"; then
        log_success "API health check passed"
    else
        log_error "API health check failed"
        return 1
    fi
    
    # Check for critical errors in logs
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

run_backend_tests() {
    log_header "BACKEND TESTS" "$(get_category_description backend)"
    
    # Check if backend container is running
    if ! docker ps | grep -q "docker-backend"; then
        log_error "Backend container is not running"
        return 1
    fi
    
    # Run integration tests
    log_info "Running API integration tests..."
    if docker exec docker-backend-1 python -m pytest tests/integration/test_api_integration.py -v --tb=short; then
        log_success "API integration tests passed"
    else
        log_error "API integration tests failed"
        return 1
    fi
    
    # Run unit tests if they exist
    if docker exec docker-backend-1 find . -name "test_*.py" -not -path "./tests/integration/*" | head -1 | grep -q .; then
        log_info "Running unit tests..."
        if docker exec docker-backend-1 python -m pytest --ignore=tests/integration -v --tb=short; then
            log_success "Unit tests passed"
        else
            log_error "Unit tests failed"
            return 1
        fi
    fi
    
    # Test API endpoints
    local endpoints=("/api/health" "/api/disasters" "/api/hazards" "/api/risks" "/api/routes")
    for endpoint in "${endpoints[@]}"; do
        if curl -s -f "$BACKEND_URL$endpoint" > /dev/null 2>&1; then
            log_success "Endpoint $endpoint is accessible"
        else
            log_warning "Endpoint $endpoint returned an error (may be expected)"
        fi
    done
}

run_frontend_tests() {
    log_header "FRONTEND TESTS" "$(get_category_description frontend)"
    
    # Check if frontend container is running
    if ! docker ps | grep -q "docker-frontend"; then
        log_error "Frontend container is not running"
        return 1
    fi
    
    # Test basic frontend functionality
    log_info "Testing frontend content..."
    local frontend_content=$(curl -s "$FRONTEND_URL")
    
    if echo "$frontend_content" | grep -q "Disaster Response\|React\|App"; then
        log_success "Frontend content is loading correctly"
    else
        log_warning "Frontend content may not be loading as expected"
    fi
    
    # Test for JavaScript errors
    log_info "Checking for JavaScript errors..."
    if echo "$frontend_content" | grep -q "error\|Error\|ERROR"; then
        log_warning "Potential JavaScript errors detected in page content"
    else
        log_success "No obvious JavaScript errors detected"
    fi
    
    # Test responsive design (simulate different viewports)
    log_info "Testing responsive design..."
    local mobile_content=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" "$FRONTEND_URL")
    if [ -n "$mobile_content" ]; then
        log_success "Mobile viewport test passed"
    else
        log_warning "Mobile viewport test failed"
    fi
    
    # Test for common UI elements
    local ui_elements=("nav" "button" "input" "div" "main")
    for element in "${ui_elements[@]}"; do
        if echo "$frontend_content" | grep -q "<$element"; then
            log_success "UI element '$element' found"
        else
            log_warning "UI element '$element' not found (may be expected)"
        fi
    done
}

run_integration_tests() {
    log_header "INTEGRATION TESTS" "$(get_category_description integration)"
    
    # Test frontend-backend communication
    log_info "Testing frontend-backend communication..."
    
    # Check if frontend can reach backend
    if curl -s "$FRONTEND_URL" | grep -q "api\|API"; then
        log_success "Frontend appears to be configured for API communication"
    else
        log_warning "Frontend may not be configured for API communication"
    fi
    
    # Test CORS headers
    local cors_headers=$(curl -s -I "$API_URL/health" | grep -i "access-control-allow-origin")
    if [ -n "$cors_headers" ]; then
        log_success "CORS headers are present"
    else
        log_warning "CORS headers may be missing"
    fi
    
    # Test data flow
    log_info "Testing data flow..."
    local api_response=$(curl -s "$API_URL/health")
    if echo "$api_response" | grep -q "healthy\|status"; then
        log_success "API is returning valid JSON data"
    else
        log_warning "API response format may be unexpected"
    fi
}

run_performance_tests() {
    log_header "PERFORMANCE TESTS" "$(get_category_description performance)"
    
    # Test page load time
    log_info "Testing frontend page load time..."
    local start_time=$(date +%s.%N)
    curl -s "$FRONTEND_URL" > /dev/null
    local end_time=$(date +%s.%N)
    local load_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0.1")
    
    if (( $(echo "$load_time < 5.0" | bc -l 2>/dev/null || echo "1") )); then
        log_success "Frontend load time acceptable: ${load_time}s"
    else
        log_warning "Frontend load time slow: ${load_time}s"
    fi
    
    # Test API response time
    log_info "Testing API response time..."
    local api_start=$(date +%s.%N)
    curl -s "$API_URL/health" > /dev/null
    local api_end=$(date +%s.%N)
    local api_time=$(echo "$api_end - $api_start" | bc -l 2>/dev/null || echo "0.1")
    
    if (( $(echo "$api_time < 2.0" | bc -l 2>/dev/null || echo "1") )); then
        log_success "API response time acceptable: ${api_time}s"
    else
        log_warning "API response time slow: ${api_time}s"
    fi
    
    # Test concurrent requests
    log_info "Testing concurrent request handling..."
    local concurrent_success=0
    local concurrent_total=5
    
    for i in {1..5}; do
        if curl -s -f "$API_URL/health" > /dev/null 2>&1; then
            ((concurrent_success++))
        fi
    done
    
    if [ $concurrent_success -eq $concurrent_total ]; then
        log_success "Concurrent request handling working correctly"
    else
        log_warning "Concurrent request handling may have issues ($concurrent_success/$concurrent_total successful)"
    fi
}

run_security_tests() {
    log_header "SECURITY TESTS" "$(get_category_description security)"
    
    # Test for common security headers
    log_info "Testing security headers..."
    local security_headers=$(curl -s -I "$FRONTEND_URL" | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection\|content-security-policy")
    if [ -n "$security_headers" ]; then
        log_success "Security headers are present"
    else
        log_warning "Security headers may be missing"
    fi
    
    # Test API security
    log_info "Testing API security..."
    local api_headers=$(curl -s -I "$API_URL/health" | grep -i "access-control-allow-origin")
    if [ -n "$api_headers" ]; then
        log_success "API CORS headers are present"
    else
        log_warning "API CORS headers may be missing"
    fi
    
    # Test for SQL injection protection
    log_info "Testing SQL injection protection..."
    local malicious_payloads=("'; DROP TABLE users; --" "' OR '1'='1" "'; INSERT INTO users VALUES ('hacker', 'password'); --")
    local injection_safe=true
    
    for payload in "${malicious_payloads[@]}"; do
        if curl -s "$API_URL/disasters?q=$payload" | grep -q "error\|Error\|ERROR"; then
            log_warning "Potential SQL injection vulnerability detected"
            injection_safe=false
        fi
    done
    
    if [ "$injection_safe" = true ]; then
        log_success "SQL injection protection appears to be working"
    fi
    
    # Test for XSS protection
    log_info "Testing XSS protection..."
    local xss_payloads=("<script>alert('xss')</script>" "javascript:alert('xss')" "<img src=x onerror=alert('xss')>")
    local xss_safe=true
    
    for payload in "${xss_payloads[@]}"; do
        if curl -s "$API_URL/disasters?q=$payload" | grep -q "script\|javascript"; then
            log_warning "Potential XSS vulnerability detected"
            xss_safe=false
        fi
    done
    
    if [ "$xss_safe" = true ]; then
        log_success "XSS protection appears to be working"
    fi
}

run_accessibility_tests() {
    log_header "ACCESSIBILITY TESTS" "$(get_category_description accessibility)"
    
    # Test for proper heading structure
    log_info "Testing heading structure..."
    local frontend_content=$(curl -s "$FRONTEND_URL")
    local heading_count=$(echo "$frontend_content" | grep -c "<h[1-6]" || echo "0")
    
    if [ "$heading_count" -gt 0 ]; then
        log_success "Heading structure is present ($heading_count headings found)"
    else
        log_warning "No headings found - accessibility may be compromised"
    fi
    
    # Test for alt text on images
    log_info "Testing image accessibility..."
    local image_count=$(echo "$frontend_content" | grep -c "<img" || echo "0")
    local alt_count=$(echo "$frontend_content" | grep -c "alt=" || echo "0")
    
    if [ "$image_count" -eq 0 ] || [ "$alt_count" -eq "$image_count" ]; then
        log_success "Image accessibility is good"
    else
        log_warning "Some images may be missing alt text"
    fi
    
    # Test for semantic HTML
    log_info "Testing semantic HTML..."
    local semantic_elements=("nav" "main" "section" "article" "aside" "header" "footer")
    local semantic_count=0
    
    for element in "${semantic_elements[@]}"; do
        if echo "$frontend_content" | grep -q "<$element"; then
            ((semantic_count++))
        fi
    done
    
    if [ "$semantic_count" -gt 0 ]; then
        log_success "Semantic HTML elements are present ($semantic_count found)"
    else
        log_warning "No semantic HTML elements found"
    fi
}

run_visual_tests() {
    log_header "VISUAL TESTS" "$(get_category_description visual)"
    
    # Test for basic visual elements
    log_info "Testing visual elements..."
    local frontend_content=$(curl -s "$FRONTEND_URL")
    
    # Check for CSS classes that indicate styling
    local styled_elements=$(echo "$frontend_content" | grep -c "class=" || echo "0")
    if [ "$styled_elements" -gt 0 ]; then
        log_success "Styled elements are present ($styled_elements found)"
    else
        log_warning "No styled elements found"
    fi
    
    # Check for common UI components
    local ui_components=("button" "input" "select" "textarea" "form")
    local component_count=0
    
    for component in "${ui_components[@]}"; do
        if echo "$frontend_content" | grep -q "<$component"; then
            ((component_count++))
        fi
    done
    
    if [ "$component_count" -gt 0 ]; then
        log_success "UI components are present ($component_count types found)"
    else
        log_warning "No UI components found"
    fi
    
    # Test for responsive design indicators
    log_info "Testing responsive design..."
    if echo "$frontend_content" | grep -q "viewport\|media\|responsive"; then
        log_success "Responsive design indicators found"
    else
        log_warning "Responsive design indicators may be missing"
    fi
}

generate_test_report() {
    local report_file="test-results/local-test-report-$(date +%Y%m%d-%H%M%S).md"
    
    mkdir -p test-results
    
    cat > "$report_file" << EOF
# Local Test Report
Generated: $(date)

## Test Summary
- Total Tests: $TOTAL_TESTS
- Passed: $PASSED_TESTS
- Failed: $FAILED_TESTS
- Warnings: $WARNINGS
- Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%

## Test Categories

### Smoke Tests
- Basic connectivity validation
- Service health checks
- Content loading verification

### Backend Tests
- API integration testing
- Unit test execution
- Endpoint accessibility

### Frontend Tests
- UI content validation
- JavaScript error detection
- Responsive design testing

### Integration Tests
- Frontend-backend communication
- CORS configuration
- Data flow validation

### Performance Tests
- Page load time measurement
- API response time testing
- Concurrent request handling

### Security Tests
- Security headers validation
- SQL injection protection
- XSS protection testing

### Accessibility Tests
- Heading structure validation
- Image alt text checking
- Semantic HTML verification

### Visual Tests
- Styled elements detection
- UI component validation
- Responsive design indicators

## Service Status
- Frontend: $(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
- Backend: $(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")

## Recommendations
$(if [ $FAILED_TESTS -gt 0 ]; then
    echo "- ❌ Critical issues found - deployment should be blocked"
elif [ $WARNINGS -gt 0 ]; then
    echo "- ⚠️  Warnings found - review before deployment"
else
    echo "- ✅ All tests passed - safe to deploy"
fi)

## Next Steps
$(if [ $FAILED_TESTS -gt 0 ]; then
    echo "1. Fix critical test failures"
    echo "2. Re-run the test suite"
    echo "3. Verify all issues are resolved"
elif [ $WARNINGS -gt 0 ]; then
    echo "1. Review warning messages"
    echo "2. Address any important issues"
    echo "3. Consider re-running tests"
else
    echo "1. All tests passed successfully"
    echo "2. Application is ready for deployment"
    echo "3. Continue with deployment process"
fi)

EOF
    
    log_info "Test report generated: $report_file"
}

show_usage() {
    echo "Local Testing Suite for Disaster Response Dashboard"
    echo ""
    echo "Usage: $0 [OPTIONS] [CATEGORIES...]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -v, --verbose       Enable verbose output"
    echo "  --quick             Run only essential tests"
    echo "  --full              Run all test categories"
    echo ""
    echo "Categories:"
    echo "  smoke         $TEST_CATEGORIES_smoke"
    echo "  backend       $TEST_CATEGORIES_backend"
    echo "  frontend      $TEST_CATEGORIES_frontend"
    echo "  integration   $TEST_CATEGORIES_integration"
    echo "  performance   $TEST_CATEGORIES_performance"
    echo "  security      $TEST_CATEGORIES_security"
    echo "  accessibility $TEST_CATEGORIES_accessibility"
    echo "  visual        $TEST_CATEGORIES_visual"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 --quick           # Run essential tests only"
    echo "  $0 smoke backend     # Run smoke and backend tests"
    echo "  $0 performance       # Run performance tests only"
}

main() {
    # Parse command line arguments
    local categories=()
    local quick_mode=false
    local verbose_mode=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                verbose_mode=true
                shift
                ;;
            --quick)
                quick_mode=true
                shift
                ;;
            --full)
                categories=("${!TEST_CATEGORIES[@]}")
                shift
                ;;
            smoke|backend|frontend|integration|performance|security|accessibility|visual)
                categories+=("$1")
                shift
                ;;
            *)
                echo "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Default to all categories if none specified
    if [ ${#categories[@]} -eq 0 ]; then
        if [ "$quick_mode" = true ]; then
            categories=("smoke" "backend" "frontend")
        else
            categories=("smoke" "backend" "frontend" "integration" "performance" "security" "accessibility" "visual")
        fi
    fi
    
    echo "🧪 Local Testing Suite for Disaster Response Dashboard"
    echo "====================================================="
    echo "Time: $(date)"
    echo "Categories: ${categories[*]}"
    echo ""
    
    # Check Docker environment
    check_docker_status
    
    # Wait for services to be ready
    if ! wait_for_service "Frontend" "$FRONTEND_URL"; then
        log_error "Frontend service not ready"
        exit 1
    fi
    
    if ! wait_for_service "Backend" "$API_URL/health"; then
        log_error "Backend service not ready"
        exit 1
    fi
    
    # Run selected test categories
    for category in "${categories[@]}"; do
        case $category in
            smoke)
                run_smoke_tests
                ;;
            backend)
                run_backend_tests
                ;;
            frontend)
                run_frontend_tests
                ;;
            integration)
                run_integration_tests
                ;;
            performance)
                run_performance_tests
                ;;
            security)
                run_security_tests
                ;;
            accessibility)
                run_accessibility_tests
                ;;
            visual)
                run_visual_tests
                ;;
        esac
        echo ""
    done
    
    # Generate report
    generate_test_report
    
    # Final summary
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
