#!/bin/bash

# 🧪 LAYER TEST RUNNER SCRIPT
# 
# This script runs all the layer-related tests in the development server
# to ensure comprehensive validation of the modular layer system.

set -e  # Exit on any error

echo "🚀 Starting Comprehensive Layer Test Suite"
echo "=========================================="

# Check if dev server is running
echo "🔍 Checking if development server is running on port 3001..."
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Development server not running on port 3001"
    echo "Please start the dev server first:"
    echo "  docker exec -it frontend-frontend-dev-1 sh -c 'cd /app && npm run dev'"
    exit 1
fi

echo "✅ Development server is running on port 3001"

# Function to run tests with status reporting
run_test_suite() {
    local test_file=$1
    local test_name=$2
    
    echo ""
    echo "🧪 Running $test_name..."
    echo "----------------------------------------"
    
    if npm run test:e2e -- "$test_file"; then
        echo "✅ $test_name PASSED"
        return 0
    else
        echo "❌ $test_name FAILED"
        return 1
    fi
}

# Initialize test results
total_tests=0
passed_tests=0
failed_tests=0

# Test Suite 1: Layer Contracts
echo ""
echo "📋 TEST SUITE 1: Layer Behavior Contracts"
echo "=========================================="
run_test_suite "tests/e2e/test-layer-contracts.spec.ts" "Layer Behavior Contracts"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 2: Layer Rendering Validation
echo ""
echo "📋 TEST SUITE 2: Layer Rendering Validation"
echo "==========================================="
run_test_suite "tests/e2e/test-layer-rendering-validation.spec.ts" "Layer Rendering Validation"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 3: Layer-Specific Functionality
echo ""
echo "📋 TEST SUITE 3: Layer-Specific Functionality"
echo "============================================="
run_test_suite "tests/e2e/test-layer-specific-functionality.spec.ts" "Layer-Specific Functionality"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 4: Performance and Memory
echo ""
echo "📋 TEST SUITE 4: Performance and Memory"
echo "======================================="
run_test_suite "tests/e2e/test-performance-memory.spec.ts" "Performance and Memory"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 5: Error Handling Contracts
echo ""
echo "📋 TEST SUITE 5: Error Handling Contracts"
echo "========================================="
run_test_suite "tests/e2e/test-error-handling-contracts.spec.ts" "Error Handling Contracts"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 6: Integration Suite
echo ""
echo "📋 TEST SUITE 6: Integration Suite"
echo "=================================="
run_test_suite "tests/e2e/test-integration-suite.spec.ts" "Integration Suite"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 7: Modular Components Success (existing test)
echo ""
echo "📋 TEST SUITE 7: Modular Components Success"
echo "==========================================="
run_test_suite "tests/e2e/test-modular-components-success.spec.ts" "Modular Components Success"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 8: Headless Mode Validation
echo ""
echo "📋 TEST SUITE 8: Headless Mode Validation"
echo "========================================="
run_test_suite "tests/e2e/test-headless-mode-validation.spec.ts" "Headless Mode Validation"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Final Results
echo ""
echo "🎯 COMPREHENSIVE TEST RESULTS"
echo "============================="
echo "Total Test Suites: $total_tests"
echo "✅ Passed: $passed_tests"
echo "❌ Failed: $failed_tests"
echo ""

if [ $failed_tests -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! The modular layer system is working correctly."
    echo ""
    echo "✅ Layer toggles are functional"
    echo "✅ Map container renders properly"
    echo "✅ Layer state synchronization works"
    echo "✅ Performance meets requirements"
    echo "✅ Error handling is robust"
    echo "✅ Accessibility compliance verified"
    echo "✅ Integration between components successful"
    exit 0
else
    echo "⚠️  $failed_tests test suite(s) failed. Please review the failures above."
    echo ""
    echo "🔍 Common issues to check:"
    echo "  - Development server is running and accessible"
    echo "  - All layer components are properly imported"
    echo "  - CSS styles are applied correctly"
    echo "  - Mapbox integration is working"
    echo "  - Layer toggles are properly wired"
    exit 1
fi
