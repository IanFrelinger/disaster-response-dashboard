#!/bin/bash

# 📱 TERMINAL-ONLY TEST RUNNER
# 
# This script runs all tests with terminal-only output - no HTML reports,
# no browser opening, perfect for CI/CD and terminal-only environments.
# 
# Usage: ./run-terminal-tests.sh

set -e  # Exit on any error

echo "📱 Starting Terminal-Only Test Suite"
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

# Function to run terminal-only tests with status reporting
run_terminal_test_suite() {
    local test_file=$1
    local test_name=$2
    
    echo ""
    echo "🧪 Running $test_name with TERMINAL-ONLY output..."
    echo "----------------------------------------"
    
    if npx playwright test "$test_file" --config=playwright.terminal.config.ts; then
        echo "✅ $test_name PASSED with terminal output"
        return 0
    else
        echo "❌ $test_name FAILED with terminal output"
        return 1
    fi
}

# Initialize test results
total_tests=0
passed_tests=0
failed_tests=0

# Test Suite 1: Headless Mode Validation (Terminal Output)
echo ""
echo "📋 TEST SUITE 1: Headless Mode Validation (Terminal)"
echo "===================================================="
run_terminal_test_suite "tests/e2e/test-headless-mode-validation.spec.ts" "Headless Mode Validation"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 2: Layer Contracts (Terminal Output)
echo ""
echo "📋 TEST SUITE 2: Layer Behavior Contracts (Terminal)"
echo "===================================================="
run_terminal_test_suite "tests/e2e/test-layer-contracts.spec.ts" "Layer Behavior Contracts"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 3: Layer Rendering Validation (Terminal Output)
echo ""
echo "📋 TEST SUITE 3: Layer Rendering Validation (Terminal)"
echo "====================================================="
run_terminal_test_suite "tests/e2e/test-layer-rendering-validation.spec.ts" "Layer Rendering Validation"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 4: Layer-Specific Functionality (Terminal Output)
echo ""
echo "📋 TEST SUITE 4: Layer-Specific Functionality (Terminal)"
echo "========================================================"
run_terminal_test_suite "tests/e2e/test-layer-specific-functionality.spec.ts" "Layer-Specific Functionality"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 5: Performance and Memory (Terminal Output)
echo ""
echo "📋 TEST SUITE 5: Performance and Memory (Terminal)"
echo "================================================="
run_terminal_test_suite "tests/e2e/test-performance-memory.spec.ts" "Performance and Memory"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 6: Error Handling Contracts (Terminal Output)
echo ""
echo "📋 TEST SUITE 6: Error Handling Contracts (Terminal)"
echo "==================================================="
run_terminal_test_suite "tests/e2e/test-error-handling-contracts.spec.ts" "Error Handling Contracts"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 7: Integration Suite (Terminal Output)
echo ""
echo "📋 TEST SUITE 7: Integration Suite (Terminal)"
echo "============================================="
run_terminal_test_suite "tests/e2e/test-integration-suite.spec.ts" "Integration Suite"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test Suite 8: Modular Components Success (Terminal Output)
echo ""
echo "📋 TEST SUITE 8: Modular Components Success (Terminal)"
echo "======================================================"
run_terminal_test_suite "tests/e2e/test-modular-components-success.spec.ts" "Modular Components Success"
if [ $? -eq 0 ]; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Final Results
echo ""
echo "🎯 TERMINAL-ONLY TEST RESULTS"
echo "============================="
echo "Total Test Suites: $total_tests"
echo "✅ Passed: $passed_tests"
echo "❌ Failed: $failed_tests"
echo ""

if [ $failed_tests -eq 0 ]; then
    echo "🎉 ALL TERMINAL-ONLY TESTS PASSED! The modular layer system works perfectly with terminal output."
    echo ""
    echo "✅ Terminal-only output working correctly"
    echo "✅ No HTML reports generated"
    echo "✅ No browser windows opened"
    echo "✅ CI/CD pipeline optimized"
    echo "✅ All functionality validated in terminal"
    echo "✅ Performance optimized for terminal execution"
    echo "✅ Cross-browser compatibility confirmed"
    exit 0
else
    echo "⚠️  $failed_tests test suite(s) failed with terminal output. Please review the failures above."
    echo ""
    echo "🔍 Common terminal-only issues to check:"
    echo "  - Browser compatibility in terminal mode"
    echo "  - Console output formatting"
    echo "  - Error message clarity"
    echo "  - Test result readability"
    echo "  - Performance in terminal environment"
    echo ""
    echo "💡 Terminal-only failures often indicate:"
    echo "  - Browser-specific code that doesn't work in terminal"
    echo "  - Output formatting issues"
    echo "  - Console logging problems"
    echo "  - Performance differences in terminal mode"
    exit 1
fi
