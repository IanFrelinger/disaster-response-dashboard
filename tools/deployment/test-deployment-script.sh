#!/bin/bash

# Disaster Response Dashboard - Deployment Script Validator
# Tests the deployment script and configuration before running in CloudShell

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_step "Testing: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        print_success "✓ $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "✗ $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to run a test with output
run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_step "Testing: $test_name"
    
    if output=$(eval "$test_command" 2>&1); then
        print_success "✓ $test_name"
        echo "  Output: $output"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "✗ $test_name"
        echo "  Error: $output"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Main validation function
validate_deployment() {
    print_header "🚀 Disaster Response Dashboard - Deployment Validator"
    echo "========================================================"
    echo "This script validates your deployment configuration before running in CloudShell"
    echo ""
    
    # Test 1: Check if deployment script exists
    run_test "Deployment script exists" "[ -f 'tools/deployment/deploy-cloudshell.sh' ]"
    
    # Test 2: Check if deployment script is executable
    run_test "Deployment script is executable" "[ -x 'tools/deployment/deploy-cloudshell.sh' ]"
    
    # Test 3: Validate deployment script syntax
    run_test "Deployment script syntax is valid" "bash -n tools/deployment/deploy-cloudshell.sh"
    
    # Test 4: Check if backend requirements.txt exists
    run_test "Backend requirements.txt exists" "[ -f 'backend/requirements.txt' ]"
    
    # Test 5: Validate Python requirements syntax
    run_test "Python requirements syntax is valid" "pip check -r backend/requirements.txt"
    
    # Test 6: Check if backend directory exists
    run_test "Backend directory exists" "[ -d 'backend' ]"
    
    # Test 7: Check if run_synthetic_api.py exists
    run_test "run_synthetic_api.py exists" "[ -f 'backend/run_synthetic_api.py' ]"
    
    # Test 8: Validate Python syntax of main files
    run_test "run_synthetic_api.py syntax is valid" "python -m py_compile backend/run_synthetic_api.py"
    
    # Test 9: Check if synthetic_api.py exists
    if [ -f 'backend/functions/synthetic_api.py' ]; then
        run_test "synthetic_api.py syntax is valid" "python -m py_compile backend/functions/synthetic_api.py"
    else
        print_warning "synthetic_api.py not found, skipping syntax check"
    fi
    
    # Test 10: Check if Git repository is properly configured
    run_test "Git repository is configured" "git remote get-url origin >/dev/null 2>&1"
    
    # Test 11: Validate GitHub repository URL format
    run_test_with_output "GitHub repository URL is valid" "git remote get-url origin | grep -E '^https://github\.com/[^/]+/[^/]+\.git$'"
    
    # Test 12: Check if AWS CLI is available
    run_test "AWS CLI is available" "command -v aws >/dev/null 2>&1"
    
    # Test 13: Check if jq is available (for JSON parsing)
    run_test "jq is available" "command -v jq >/dev/null 2>&1"
    
    # Test 14: Validate deployment script configuration
    print_step "Validating deployment script configuration..."
    
    # Check if the script uses the correct region
    if grep -q 'export AWS_REGION="us-east-2"' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ AWS Region is set to us-east-2"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_error "✗ AWS Region is not set to us-east-2"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Check if the script uses backend/requirements.txt
    if grep -q 'backend/requirements.txt' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ Using backend/requirements.txt"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_error "✗ Not using backend/requirements.txt"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Check if the script uses the correct connection ARN
    if grep -q 'IanConnection' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ Using IanConnection ARN"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_error "✗ IanConnection ARN not found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 15: Check for potential issues in requirements
    print_step "Checking for potential issues in requirements..."
    
    # Check for private/enterprise packages
    if grep -q "palantir-foundry\|foundry-sdk" backend/requirements.txt; then
        print_error "✗ Private/enterprise packages found in backend/requirements.txt"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    else
        print_success "✓ No private packages in backend/requirements.txt"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 16: Validate Flask app configuration
    print_step "Validating Flask app configuration..."
    
    # Check if Flask app has proper port configuration
    if grep -q "port=8000\|port = 8000" backend/run_synthetic_api.py; then
        print_success "✓ Flask app configured for port 8000"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "⚠ Flask app port configuration not found"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 17: Check for required environment variables
    print_step "Checking for required environment variables..."
    
    # Check if FLASK_PORT is handled
    if grep -q "FLASK_PORT" backend/run_synthetic_api.py; then
        print_success "✓ FLASK_PORT environment variable handled"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "⚠ FLASK_PORT environment variable not found"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test 18: Validate App Runner configuration
    print_step "Validating App Runner configuration..."
    
    # Check if BuildCommand is correct
    if grep -q 'BuildCommand.*backend/requirements.txt' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ BuildCommand uses backend/requirements.txt"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_error "✗ BuildCommand not configured correctly"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Check if StartCommand is correct
    if grep -q 'StartCommand.*run_synthetic_api.py' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ StartCommand uses run_synthetic_api.py"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_error "✗ StartCommand not configured correctly"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Check if Port is set to 8000
    if grep -q 'Port.*8000' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ Port is set to 8000"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_error "✗ Port not set to 8000"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to display test summary
display_summary() {
    echo ""
    print_header "📊 Validation Summary"
    echo "========================"
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "🎉 All tests passed! Your deployment script is ready for CloudShell."
        echo ""
        print_header "🚀 Ready to Deploy!"
        echo "====================="
        echo "Your deployment configuration looks good. You can now:"
        echo "1. Push your changes to GitHub"
        echo "2. Run the deployment script in CloudShell"
        echo "3. Monitor the deployment progress"
        echo ""
        print_success "Deployment script: ./tools/deployment/deploy-cloudshell.sh"
        return 0
    else
        print_error "❌ Some tests failed. Please fix the issues before deploying."
        echo ""
        print_header "🔧 Issues to Fix:"
        echo "==================="
        echo "Please address the failed tests above before running the deployment script."
        echo ""
        print_warning "Fix the issues and run this validator again."
        return 1
    fi
}

# Function to provide recommendations
provide_recommendations() {
    echo ""
    print_header "💡 Recommendations"
    echo "===================="
    echo "1. Always run this validator before deploying to CloudShell"
    echo "2. Keep backend/requirements.txt clean (no private packages)"
    echo "3. Test your Flask app locally before deploying"
    echo "4. Monitor CloudWatch logs during deployment"
    echo "5. Use the same region (us-east-2) for all AWS resources"
    echo ""
}

# Main execution
main() {
    validate_deployment
    display_summary
    provide_recommendations
    
    # Exit with appropriate code
    if [ $TESTS_FAILED -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
