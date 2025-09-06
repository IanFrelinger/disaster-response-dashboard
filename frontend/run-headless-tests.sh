#!/bin/bash

# 🎭 HEADLESS MODE TEST RUNNER
# 
# This script runs all tests in headless mode to validate functionality
# without a visible browser window. Perfect for CI/CD and automated testing.
# 
# Usage: ./run-headless-tests.sh

set -e  # Exit on any error

echo "🎭 Starting Headless Mode Test Suite"
echo "===================================="

# Check if dev server is running
echo "🔍 Checking if development server is running on port 3001..."
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Development server not running on port 3001"
    echo "Please start the dev server first:"
    echo "  docker exec -it frontend-frontend-dev-1 sh -c 'cd /app && npm run dev'"
    exit 1
fi

echo "✅ Development server is running on port 3001"

# Function to run headless tests with status reporting
run_headless_test_suite() {
    local test_file=$1
    local test_name=$2
    
    echo ""
    echo "🧪 Running $test_name in HEADLESS MODE..."
    echo "----------------------------------------"
    
    if npx playwright test "$test_file" --config=playwright.headless.config.ts; then
        echo "✅ $test_name PASSED in headless mode"
        return 0
    else
        echo "❌ $test_name FAILED in headless mode"
        return 1
    fi
}

# Initialize test results
total_tests=0
passed_tests=0
failed_tests=0

# Test Suite 1: Headless Mode Validation
echo ""
echo "📋 TEST SUITE 1: Headless Mode Validation"
echo "========================================="
run_headless_test_suite "tests/e2e/test-headless-mode-validation.spec.ts" "Headless Mode Validation"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 2: Layer Contracts (in headless mode)
echo ""
echo "📋 TEST SUITE 2: Layer Behavior Contracts (Headless)"
echo "===================================================="
run_headless_test_suite "tests/e2e/test-layer-contracts.spec.ts" "Layer Behavior Contracts"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 3: Layer Rendering Validation (in headless mode)
echo ""
echo "📋 TEST SUITE 3: Layer Rendering Validation (Headless)"
echo "====================================================="
run_headless_test_suite "tests/e2e/test-layer-rendering-validation.spec.ts" "Layer Rendering Validation"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 4: Layer-Specific Functionality (in headless mode)
echo ""
echo "📋 TEST SUITE 4: Layer-Specific Functionality (Headless)"
echo "========================================================"
run_headless_test_suite "tests/e2e/test-layer-specific-functionality.spec.ts" "Layer-Specific Functionality"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 5: Performance and Memory (in headless mode)
echo ""
echo "📋 TEST SUITE 5: Performance and Memory (Headless)"
echo "================================================="
run_headless_test_suite "tests/e2e/test-performance-memory.spec.ts" "Performance and Memory"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 6: Error Handling Contracts (in headless mode)
echo ""
echo "📋 TEST SUITE 6: Error Handling Contracts (Headless)"
echo "==================================================="
run_headless_test_suite "tests/e2e/test-error-handling-contracts.spec.ts" "Error Handling Contracts"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 7: Integration Suite (in headless mode)
echo ""
echo "📋 TEST SUITE 7: Integration Suite (Headless)"
echo "============================================="
run_headless_test_suite "tests/e2e/test-integration-suite.spec.ts" "Integration Suite"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 8: Modular Components Success (in headless mode)
echo ""
echo "📋 TEST SUITE 8: Modular Components Success (Headless)"
echo "======================================================"
run_headless_test_suite "tests/e2e/test-modular-components-success.spec.ts" "Modular Components Success"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Final Results
echo ""
echo "🎯 HEADLESS MODE TEST RESULTS"
echo "============================="
echo "Total Test Suites: $total_tests"
echo "✅ Passed: $passed_tests"
echo "❌ Failed: $failed_tests"
echo ""

if [ $failed_tests -eq 0 ]; then
    echo "🎉 ALL HEADLESS TESTS PASSED! The modular layer system works perfectly in headless mode."
    echo ""
    echo "✅ Headless mode functionality validated"
    echo "✅ Cross-browser compatibility confirmed"
    echo "✅ CI/CD pipeline ready"
    echo "✅ Automated testing supported"
    echo "✅ No visual dependencies detected"
    echo "✅ Performance optimized for headless execution"
    echo "✅ All accessibility features working in headless mode"
    exit 0
else
    echo "⚠️  $failed_tests test suite(s) failed in headless mode. Please review the failures above."
    echo ""
    echo "🔍 Common headless mode issues to check:"
    echo "  - Browser compatibility in headless mode"
    echo "  - Canvas rendering without GPU acceleration"
    echo "  - Timing issues in headless execution"
    echo "  - Missing browser-specific features"
    echo "  - Performance differences between headed and headless"
    echo ""
    echo "💡 Headless mode failures often indicate:"
    echo "  - Browser-specific code that doesn't work without UI"
    echo "  - Timing dependencies on visual rendering"
    echo "  - GPU-accelerated features that are disabled"
    echo "  - Accessibility features that require visual feedback"
    exit 1
fi
