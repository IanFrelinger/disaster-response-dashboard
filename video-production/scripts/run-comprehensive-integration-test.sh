#!/bin/bash

# Comprehensive Integration Test Runner
# This script provides additional testing capabilities and options for the headless automation system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_SCRIPT="tests/integration-test-comprehensive-headless-automation.ts"
TEST_RESULTS_DIR="$PROJECT_ROOT/test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Test modes
MODE_FULL="full"
MODE_QUICK="quick"
MODE_STRESS="stress"
MODE_VALIDATION="validation"

# Default values
MODE=$MODE_FULL
VERBOSE=false
CLEAN_BEFORE=false
GENERATE_REPORT=true
TIMEOUT=1800  # 30 minutes default

# Function to print usage
print_usage() {
    echo "🧪 Comprehensive Integration Test Runner"
    echo "========================================"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE        Test mode: full, quick, stress, validation (default: full)"
    echo "  -v, --verbose          Enable verbose output"
    echo "  -c, --clean            Clean test artifacts before running"
    echo "  -r, --no-report        Skip report generation"
    echo "  -t, --timeout SECONDS  Test timeout in seconds (default: 1800)"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Test Modes:"
    echo "  full        - Complete integration test suite (default)"
    echo "  quick       - Fast validation of core functionality"
    echo "  stress      - Stress testing with multiple iterations"
    echo "  validation  - Basic system validation only"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run full integration test"
    echo "  $0 -m quick -v              # Run quick test with verbose output"
    echo "  $0 -m stress -t 3600        # Run stress test with 1 hour timeout"
    echo "  $0 -c -r                    # Clean and run without report generation"
}

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
    esac
}

# Function to validate environment
validate_environment() {
    print_status "INFO" "Validating test environment..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        print_status "ERROR" "Not in project root directory. Please run from video-production folder."
        exit 1
    fi
    
    # Check required dependencies
    if ! command -v node &> /dev/null; then
        print_status "ERROR" "Node.js is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_status "ERROR" "npm is not installed or not in PATH"
        exit 1
    fi
    
    # Check if test script exists
    if [[ ! -f "$PROJECT_ROOT/$TEST_SCRIPT" ]]; then
        print_status "ERROR" "Test script not found: $TEST_SCRIPT"
        exit 1
    fi
    
    print_status "SUCCESS" "Environment validation passed"
}

# Function to clean test artifacts
clean_test_artifacts() {
    if [[ "$CLEAN_BEFORE" == true ]]; then
        print_status "INFO" "Cleaning test artifacts..."
        
        # Clean captures directory
        if [[ -d "$PROJECT_ROOT/captures" ]]; then
            find "$PROJECT_ROOT/captures" -name "*.webm" -o -name "*.png" | xargs rm -f 2>/dev/null || true
            print_status "INFO" "Cleaned captures directory"
        fi
        
        # Clean temp directory
        if [[ -d "$PROJECT_ROOT/temp" ]]; then
            rm -rf "$PROJECT_ROOT/temp"/*
            print_status "INFO" "Cleaned temp directory"
        fi
        
        # Clean test results
        if [[ -d "$TEST_RESULTS_DIR" ]]; then
            rm -rf "$TEST_RESULTS_DIR"/*
            print_status "INFO" "Cleaned test results directory"
        fi
        
        print_status "SUCCESS" "Test artifacts cleaned"
    fi
}

# Function to setup test mode
setup_test_mode() {
    print_status "INFO" "Setting up test mode: $MODE"
    
    case $MODE in
        "$MODE_FULL")
            print_status "INFO" "Running complete integration test suite"
            ;;
        "$MODE_QUICK")
            print_status "INFO" "Running quick validation test"
            export QUICK_TEST_MODE=true
            ;;
        "$MODE_STRESS")
            print_status "INFO" "Running stress test with multiple iterations"
            export STRESS_TEST_MODE=true
            export STRESS_ITERATIONS=5
            ;;
        "$MODE_VALIDATION")
            print_status "INFO" "Running basic system validation"
            export VALIDATION_ONLY_MODE=true
            ;;
        *)
            print_status "ERROR" "Unknown test mode: $MODE"
            exit 1
            ;;
    esac
}

# Function to run the test
run_test() {
    print_status "INFO" "Starting comprehensive integration test..."
    print_status "INFO" "Project Root: $PROJECT_ROOT"
    print_status "INFO" "Test Script: $TEST_SCRIPT"
    print_status "INFO" "Test Mode: $MODE"
    print_status "INFO" "Timeout: ${TIMEOUT}s"
    
    # Create test results directory
    mkdir -p "$TEST_RESULTS_DIR"
    
    # Run the test with timeout
    cd "$PROJECT_ROOT"
    
    if [[ "$VERBOSE" == true ]]; then
        print_status "INFO" "Running test with verbose output..."
        timeout "$TIMEOUT" npx ts-node "$TEST_SCRIPT" 2>&1 | tee "$TEST_RESULTS_DIR/test-run-$TIMESTAMP.log"
    else
        print_status "INFO" "Running test..."
        timeout "$TIMEOUT" npx ts-node "$TEST_SCRIPT" > "$TEST_RESULTS_DIR/test-run-$TIMESTAMP.log" 2>&1
    fi
    
    local exit_code=$?
    
    if [[ $exit_code -eq 124 ]]; then
        print_status "ERROR" "Test timed out after ${TIMEOUT} seconds"
        return 1
    elif [[ $exit_code -ne 0 ]]; then
        print_status "ERROR" "Test failed with exit code $exit_code"
        return 1
    fi
    
    print_status "SUCCESS" "Test completed successfully"
    return 0
}

# Function to generate additional reports
generate_additional_reports() {
    if [[ "$GENERATE_REPORT" == false ]]; then
        return 0
    fi
    
    print_status "INFO" "Generating additional test reports..."
    
    # Generate test summary
    if [[ -f "$TEST_RESULTS_DIR/comprehensive-integration-test-report.json" ]]; then
        print_status "INFO" "Test report generated: comprehensive-integration-test-report.json"
    fi
    
    # Generate test summary text
    if [[ -f "$TEST_RESULTS_DIR/integration-test-summary.txt" ]]; then
        print_status "INFO" "Test summary generated: integration-test-summary.txt"
    fi
    
    # Generate performance metrics
    if [[ -f "$TEST_RESULTS_DIR/test-run-$TIMESTAMP.log" ]]; then
        print_status "INFO" "Test log generated: test-run-$TIMESTAMP.log"
    fi
    
    print_status "SUCCESS" "Additional reports generated"
}

# Function to display test results
display_test_results() {
    print_status "INFO" "Test Results Summary:"
    echo ""
    
    if [[ -f "$TEST_RESULTS_DIR/comprehensive-integration-test-report.json" ]]; then
        # Extract and display key metrics
        local total_tests=$(jq -r '.summary.totalTests' "$TEST_RESULTS_DIR/comprehensive-integration-test-report.json" 2>/dev/null || echo "N/A")
        local passed=$(jq -r '.summary.passed' "$TEST_RESULTS_DIR/comprehensive-integration-test-report.json" 2>/dev/null || echo "N/A")
        local failed=$(jq -r '.summary.failed' "$TEST_RESULTS_DIR/comprehensive-integration-test-report.json" 2>/dev/null || echo "N/A")
        local success_rate=$(jq -r '.summary.successRate' "$TEST_RESULTS_DIR/comprehensive-integration-test-report.json" 2>/dev/null || echo "N/A")
        local duration=$(jq -r '.summary.totalDuration' "$TEST_RESULTS_DIR/comprehensive-integration-test-report.json" 2>/dev/null || echo "N/A")
        
        echo "📊 Test Metrics:"
        echo "   Total Tests: $total_tests"
        echo "   Passed: $passed"
        echo "   Failed: $failed"
        echo "   Success Rate: $success_rate"
        echo "   Duration: $duration"
        echo ""
    fi
    
    echo "📁 Test artifacts saved to: $TEST_RESULTS_DIR"
    echo "📋 Detailed results available in:"
    echo "   - comprehensive-integration-test-report.json (JSON format)"
    echo "   - integration-test-summary.txt (Text format)"
    echo "   - test-run-$TIMESTAMP.log (Execution log)"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--clean)
            CLEAN_BEFORE=true
            shift
            ;;
        -r|--no-report)
            GENERATE_REPORT=false
            shift
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            print_status "ERROR" "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo ""
    print_status "INFO" "🧪 Comprehensive Integration Test Runner"
    print_status "INFO" "========================================"
    echo ""
    
    # Validate environment
    validate_environment
    
    # Setup test mode
    setup_test_mode
    
    # Clean if requested
    clean_test_artifacts
    
    # Run the test
    if run_test; then
        print_status "SUCCESS" "Integration test completed successfully!"
        
        # Generate additional reports
        generate_additional_reports
        
        # Display results
        display_test_results
        
        echo ""
        print_status "SUCCESS" "🎉 All tests passed! The headless automation system is fully operational."
        exit 0
    else
        print_status "ERROR" "Integration test failed!"
        
        echo ""
        print_status "WARNING" "Some tests may have failed. Check the test results for details."
        echo "📁 Test artifacts and logs available in: $TEST_RESULTS_DIR"
        
        exit 1
    fi
}

# Run main function
main "$@"
