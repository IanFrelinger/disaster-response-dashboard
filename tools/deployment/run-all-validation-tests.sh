#!/bin/bash

# Master Validation Test Runner
# Runs all validation tests for the CodeBuild setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
REGION=${AWS_REGION:-"us-east-2"}
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Print functions
print_header() {
    echo -e "${PURPLE}$1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

# Test runner function
run_test() {
    local test_name="$1"
    local test_script="$2"
    local description="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo ""
    print_header "🧪 Running: $test_name"
    echo "Description: $description"
    echo "Script: $test_script"
    echo "=================================================="
    
    if [ -f "$test_script" ]; then
        if [ -x "$test_script" ]; then
            if bash "$test_script" 2>&1; then
                print_success "Test passed: $test_name"
            else
                print_error "Test failed: $test_name"
            fi
        else
            print_warning "Test script not executable: $test_script"
            print_info "Making executable and running..."
            chmod +x "$test_script"
            if bash "$test_script" 2>&1; then
                print_success "Test passed: $test_name"
            else
                print_error "Test failed: $test_name"
            fi
        fi
    else
        print_error "Test script not found: $test_script"
    fi
}

# Check prerequisites
check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    echo "=================================================="
    
    # Check AWS CLI
    if command -v aws >/dev/null 2>&1; then
        print_success "AWS CLI is installed"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "AWS CLI is not installed"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Check AWS credentials
    if aws sts get-caller-identity >/dev/null 2>&1; then
        ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        print_success "AWS credentials are configured"
        print_info "Account ID: $ACCOUNT_ID"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "AWS credentials are not configured"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Check jq
    if command -v jq >/dev/null 2>&1; then
        print_success "jq is installed"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_warning "jq is not installed (some tests may fail)"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
    
    # Check region
    if [ -n "$REGION" ]; then
        print_success "AWS region is set: $REGION"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "AWS region is not set"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Run all validation tests
run_all_tests() {
    print_header "🚀 Running All Validation Tests"
    echo "=================================================="
    
    # Run simple validation
    run_test "Simple Validation" \
        "tools/deployment/validate-codebuild-setup.sh" \
        "Quick validation of CodeBuild setup status"
    
    # Run comprehensive tests
    run_test "Comprehensive Tests" \
        "tools/deployment/test-codebuild-setup.sh" \
        "Detailed validation of all IAM components and permissions"
    
    # Run deployment script validation
    run_test "Deployment Script Validation" \
        "tools/deployment/test-deployment-script.sh" \
        "Validation of the CodeBuild deployment script"
    
    # Run Docker validation (if available)
    if [ -f "tools/deployment/test-docker-local.sh" ]; then
        run_test "Docker Local Validation" \
            "tools/deployment/test-docker-local.sh" \
            "Local Docker build and test validation"
    fi
}

# Generate test report
generate_report() {
    echo ""
    print_header "📊 Test Results Summary"
    echo "=================================================="
    echo "Total Tests: $TOTAL_TESTS"
    echo "✅ Passed: $PASSED_TESTS"
    echo "❌ Failed: $FAILED_TESTS"
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
        echo "📈 Success Rate: ${SUCCESS_RATE}%"
    fi
    
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_success "🎉 All tests passed! Your setup is ready for deployment."
        echo ""
        echo "📋 Next steps:"
        echo "1. Run the CodeBuild setup (if not done):"
        echo "   ./tools/deployment/setup-codebuild-role.sh"
        echo ""
        echo "2. Deploy using CodeBuild:"
        echo "   ./tools/deployment/deploy-codebuild.sh"
        echo ""
        echo "3. Or deploy using App Runner (if fixed):"
        echo "   ./tools/deployment/deploy-cloudshell.sh"
        exit 0
    else
        print_warning "⚠️  Some tests failed. Please review the errors above."
        echo ""
        echo "🔧 Recommended actions:"
        echo "1. Fix any prerequisite issues (AWS CLI, credentials, etc.)"
        echo "2. Run the CodeBuild setup:"
        echo "   ./tools/deployment/setup-codebuild-role.sh"
        echo ""
        echo "3. Re-run validation:"
        echo "   ./tools/deployment/validate-codebuild-setup.sh"
        exit 1
    fi
}

# Main function
main() {
    echo "🧪 Master Validation Test Runner"
    echo "================================="
    echo "Region: $REGION"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check prerequisites first
    check_prerequisites
    
    # Run all tests
    run_all_tests
    
    # Generate report
    generate_report
}

# Run main function
main "$@"
