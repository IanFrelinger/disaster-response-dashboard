#!/bin/bash

# Disaster Response Dashboard - Comprehensive Validation Test Runner
# Runs all validation tests to ensure deployment readiness

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

# Function to run a test suite
run_test_suite() {
    local suite_name="$1"
    local test_command="$2"
    
    print_header "🧪 Running $suite_name Tests"
    echo "=================================="
    
    if eval "$test_command"; then
        print_success "✓ $suite_name tests passed"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "✗ $suite_name tests failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    echo "============================="
    
    local missing_tools=()
    
    # Check for required tools
    if ! command -v python3 >/dev/null 2>&1; then
        missing_tools+=("python3")
    fi
    
    if ! command -v pip >/dev/null 2>&1; then
        missing_tools+=("pip")
    fi
    
    if ! command -v bash >/dev/null 2>&1; then
        missing_tools+=("bash")
    fi
    
    if ! command -v git >/dev/null 2>&1; then
        missing_tools+=("git")
    fi
    
    if [ ${#missing_tools[@]} -eq 0 ]; then
        print_success "✓ All required tools are available"
        return 0
    else
        print_error "✗ Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools before running validation tests"
        return 1
    fi
}

# Function to run deployment script validation
run_deployment_validation() {
    print_header "📋 Deployment Script Validation"
    echo "===================================="
    
    if [ -f "tools/deployment/test-deployment-script.sh" ]; then
        if [ -x "tools/deployment/test-deployment-script.sh" ]; then
            ./tools/deployment/test-deployment-script.sh
            return $?
        else
            print_error "✗ test-deployment-script.sh is not executable"
            chmod +x tools/deployment/test-deployment-script.sh
            ./tools/deployment/test-deployment-script.sh
            return $?
        fi
    else
        print_error "✗ test-deployment-script.sh not found"
        return 1
    fi
}

# Function to run Flask app validation
run_flask_validation() {
    print_header "🐍 Flask App Validation"
    echo "=========================="
    
    if [ -f "tools/deployment/test-flask-app.py" ]; then
        python3 tools/deployment/test-flask-app.py
        return $?
    else
        print_error "✗ test-flask-app.py not found"
        return 1
    fi
}

# Function to run quick syntax checks
run_syntax_checks() {
    print_header "🔧 Syntax Validation"
    echo "======================"
    
    local syntax_errors=0
    
    # Check deployment script syntax
    if bash -n tools/deployment/deploy-cloudshell.sh 2>/dev/null; then
        print_success "✓ deploy-cloudshell.sh syntax is valid"
    else
        print_error "✗ deploy-cloudshell.sh has syntax errors"
        syntax_errors=$((syntax_errors + 1))
    fi
    
    # Check Python files syntax
    if python3 -m py_compile backend/run_synthetic_api.py 2>/dev/null; then
        print_success "✓ run_synthetic_api.py syntax is valid"
    else
        print_error "✗ run_synthetic_api.py has syntax errors"
        syntax_errors=$((syntax_errors + 1))
    fi
    
    if [ -f "backend/functions/synthetic_api.py" ]; then
        if python3 -m py_compile backend/functions/synthetic_api.py 2>/dev/null; then
            print_success "✓ synthetic_api.py syntax is valid"
        else
            print_error "✗ synthetic_api.py has syntax errors"
            syntax_errors=$((syntax_errors + 1))
        fi
    fi
    
    # Check requirements.txt syntax
    if pip install -r backend/requirements.txt --dry-run >/dev/null 2>&1; then
        print_success "✓ backend/requirements.txt syntax is valid"
    else
        print_error "✗ backend/requirements.txt has syntax errors"
        syntax_errors=$((syntax_errors + 1))
    fi
    
    if [ $syntax_errors -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Function to run configuration validation
run_config_validation() {
    print_header "⚙️  Configuration Validation"
    echo "==============================="
    
    local config_errors=0
    
    # Check AWS region configuration
    if grep -q 'export AWS_REGION="us-east-2"' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ AWS Region is set to us-east-2"
    else
        print_error "✗ AWS Region is not set to us-east-2"
        config_errors=$((config_errors + 1))
    fi
    
    # Check GitHub connection ARN
    if grep -q 'IanConnection' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ GitHub connection ARN is configured"
    else
        print_error "✗ GitHub connection ARN is not configured"
        config_errors=$((config_errors + 1))
    fi
    
    # Check backend requirements path
    if grep -q 'backend/requirements.txt' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ Using backend/requirements.txt"
    else
        print_error "✗ Not using backend/requirements.txt"
        config_errors=$((config_errors + 1))
    fi
    
    # Check port configuration
    if grep -q 'Port.*8000' tools/deployment/deploy-cloudshell.sh; then
        print_success "✓ Port is set to 8000"
    else
        print_error "✗ Port is not set to 8000"
        config_errors=$((config_errors + 1))
    fi
    
    # Check for private packages
    if grep -q "palantir-foundry\|foundry-sdk" backend/requirements.txt; then
        print_error "✗ Private packages found in backend/requirements.txt"
        config_errors=$((config_errors + 1))
    else
        print_success "✓ No private packages in backend/requirements.txt"
    fi
    
    if [ $config_errors -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Function to display comprehensive summary
display_summary() {
    echo ""
    print_header "📊 Comprehensive Validation Summary"
    echo "========================================"
    echo "Total Test Suites: $TOTAL_TESTS"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "🎉 All validation tests passed!"
        echo ""
        print_header "🚀 Ready for CloudShell Deployment!"
        echo "======================================="
        echo "Your deployment configuration is fully validated and ready."
        echo ""
        echo "Next steps:"
        echo "1. Commit and push your changes to GitHub"
        echo "2. Run the deployment script in CloudShell:"
        echo "   ./tools/deployment/deploy-cloudshell.sh"
        echo "3. Monitor the deployment progress"
        echo ""
        print_success "Deployment should work successfully! 🚀"
        return 0
    else
        print_error "❌ Some validation tests failed."
        echo ""
        print_header "🔧 Issues to Address:"
        echo "======================="
        echo "Please fix the failed tests above before deploying to CloudShell."
        echo ""
        print_warning "Run this validation again after fixing the issues."
        return 1
    fi
}

# Function to provide detailed recommendations
provide_recommendations() {
    echo ""
    print_header "💡 Deployment Recommendations"
    echo "================================"
    echo "1. ✅ Always run validation tests before deploying"
    echo "2. ✅ Keep backend/requirements.txt clean (no private packages)"
    echo "3. ✅ Test Flask app locally before deploying"
    echo "4. ✅ Monitor CloudWatch logs during deployment"
    echo "5. ✅ Use consistent region (us-east-2) for all AWS resources"
    echo "6. ✅ Ensure GitHub connection is AVAILABLE in AWS Console"
    echo "7. ✅ Check App Runner service logs for detailed error messages"
    echo "8. ✅ Use this validation script before each deployment"
    echo ""
}

# Main execution function
main() {
    print_header "🚀 Disaster Response Dashboard - Comprehensive Validation"
    echo "============================================================="
    echo "This script runs all validation tests to ensure deployment readiness"
    echo ""
    
    # Check prerequisites first
    if ! check_prerequisites; then
        print_error "Prerequisites check failed. Please install missing tools."
        exit 1
    fi
    
    # Run all test suites
    TOTAL_TESTS=4  # We have 4 main test suites
    
    # Test 1: Syntax validation
    if run_syntax_checks; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Test 2: Configuration validation
    if run_config_validation; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Test 3: Deployment script validation
    if run_deployment_validation; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Test 4: Flask app validation
    if run_flask_validation; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Display results
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
