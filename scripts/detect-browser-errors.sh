#!/bin/bash

# Browser Error Detection Script
# This script attempts to detect browser runtime errors that prevent React app execution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    local level=$1
    local message=$2
    case $level in
        "INFO")
            echo -e "${BLUE}🔍${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}❌${NC} $message"
            ;;
    esac
}

# Function to check for common browser error patterns
check_browser_error_patterns() {
    print_status "INFO" "Checking for common browser error patterns..."
    
    local response=$(curl -s "http://localhost:3000")
    local js_file=$(echo "$response" | grep -o "index-[A-Za-z0-9]*\.js" | head -1)
    
    if [ -z "$js_file" ]; then
        print_status "ERROR" "No JavaScript bundle found in HTML"
        return 1
    fi
    
    print_status "INFO" "JavaScript bundle: $js_file"
    
    # Check JavaScript bundle for common error patterns
    local js_content=$(curl -s "http://localhost:3000/assets/$js_file")
    
    # Check for syntax errors
    if echo "$js_content" | grep -q "SyntaxError\|ParseError"; then
        print_status "ERROR" "JavaScript syntax errors detected"
        echo "$js_content" | grep -i "syntaxerror\|parseerror" | head -3
        return 1
    fi
    
    # Check for module loading errors
    if echo "$js_content" | grep -q "Cannot find module\|Module not found"; then
        print_status "ERROR" "Module loading errors detected"
        echo "$js_content" | grep -i "cannot find module\|module not found" | head -3
        return 1
    fi
    
    # Check for React mounting issues
    if echo "$js_content" | grep -q "React.*error\|JSX.*error"; then
        print_status "ERROR" "React-specific errors detected"
        echo "$js_content" | grep -i "react.*error\|jsx.*error" | head -3
        return 1
    fi
    
    print_status "SUCCESS" "No obvious JavaScript syntax errors detected"
    return 0
}

# Function to check for network/loading issues
check_network_issues() {
    print_status "INFO" "Checking for network and loading issues..."
    
    # Check if all required assets are accessible
    local response=$(curl -s "http://localhost:3000")
    local js_file=$(echo "$response" | grep -o "index-[A-Za-z0-9]*\.js" | head -1)
    local css_file=$(echo "$response" | grep -o "index-[A-Za-z0-9]*\.css" | head -1)
    
    if [ -n "$js_file" ]; then
        local js_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/assets/$js_file")
        if [ "$js_status" = "200" ]; then
            print_status "SUCCESS" "JavaScript bundle accessible (HTTP $js_status)"
        else
            print_status "ERROR" "JavaScript bundle not accessible (HTTP $js_status)"
            return 1
        fi
    fi
    
    if [ -n "$css_file" ]; then
        local css_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/assets/$js_file")
        if [ "$css_status" = "200" ]; then
            print_status "SUCCESS" "CSS file accessible (HTTP $css_status)"
        else
            print_status "ERROR" "CSS file not accessible (HTTP $css_status)"
            return 1
        fi
    fi
    
    return 0
}

# Function to check for CORS/CSP issues
check_cors_csp_issues() {
    print_status "INFO" "Checking for CORS and CSP issues..."
    
    # Check response headers for CORS/CSP
    local headers=$(curl -s -I "http://localhost:3000")
    
    if echo "$headers" | grep -q "Access-Control-Allow-Origin"; then
        print_status "INFO" "CORS headers detected"
    else
        print_status "WARNING" "No CORS headers detected"
    fi
    
    if echo "$headers" | grep -q "Content-Security-Policy"; then
        print_status "INFO" "CSP headers detected"
        echo "$headers" | grep "Content-Security-Policy"
    else
        print_status "WARNING" "No CSP headers detected"
    fi
    
    return 0
}

# Function to check for WebGL/Mapbox specific issues
check_webgl_mapbox_issues() {
    print_status "INFO" "Checking for WebGL and Mapbox specific issues..."
    
    local js_content=$(curl -s "http://localhost:3000/assets/$(curl -s "http://localhost:3000" | grep -o "index-[A-Za-z0-9]*\.js" | head -1)")
    
    # Check for WebGL context errors
    if echo "$js_content" | grep -q "WebGL.*error\|webgl.*error\|getContext.*error"; then
        print_status "WARNING" "WebGL context error handling detected in code"
    fi
    
    # Check for Mapbox initialization errors
    if echo "$js_content" | grep -q "Mapbox.*error\|mapbox.*error\|Map.*error"; then
        print_status "WARNING" "Mapbox error handling detected in code"
    fi
    
    # Check for Mapbox token issues
    if echo "$js_content" | grep -q "pk\."; then
        print_status "SUCCESS" "Mapbox access token found in code"
    else
        print_status "WARNING" "No Mapbox access token found in code"
    fi
    
    return 0
}

# Function to simulate browser-like behavior
simulate_browser_behavior() {
    print_status "INFO" "Simulating browser-like behavior..."
    
    # Check if page content changes after multiple requests (simulating JavaScript execution)
    local initial_response=$(curl -s "http://localhost:3000")
    local initial_length=$(echo "$initial_response" | wc -c)
    
    print_status "INFO" "Initial page length: $initial_length bytes"
    
    # Wait and check again
    sleep 3
    local updated_response=$(curl -s "http://localhost:3000")
    local updated_length=$(echo "$updated_response" | wc -c)
    
    print_status "INFO" "Updated page length: $updated_length bytes"
    
    if [ "$updated_length" -gt "$initial_length" ]; then
        print_status "SUCCESS" "Page content increased - React app may be executing"
        return 0
    elif [ "$updated_length" -eq "$initial_length" ]; then
        print_status "WARNING" "Page content unchanged - React app not executing"
        
        # Check if React app content is present but not executing
        if echo "$updated_response" | grep -q "Command Center\|Emergency Response"; then
            print_status "INFO" "React app content detected but not executing"
        else
            print_status "WARNING" "No React app content detected"
        fi
    else
        print_status "ERROR" "Page content decreased - unexpected behavior"
        return 1
    fi
    
    return 1
}

# Function to check for specific error messages in HTML
check_html_error_messages() {
    print_status "INFO" "Checking HTML for error messages..."
    
    local response=$(curl -s "http://localhost:3000")
    
    # Check for React error boundaries
    if echo "$response" | grep -q "React Mount Error\|Root Element Error"; then
        print_status "ERROR" "React error boundary messages detected in HTML"
        echo "$response" | grep -A 2 -B 2 "React Mount Error\|Root Element Error"
        return 1
    fi
    
    # Check for JavaScript error messages
    if echo "$response" | grep -q "JavaScript error\|Script error\|Error loading"; then
        print_status "ERROR" "JavaScript error messages detected in HTML"
        echo "$response" | grep -A 2 -B 2 "JavaScript error\|Script error\|Error loading"
        return 1
    fi
    
    # Check for missing element errors
    if echo "$response" | grep -q "Element not found\|Container not found"; then
        print_status "ERROR" "Missing element error messages detected in HTML"
        echo "$response" | grep -A 2 -B 2 "Element not found\|Container not found"
        return 1
    fi
    
    print_status "SUCCESS" "No error messages detected in HTML"
    return 0
}

# Function to generate detailed error report
generate_error_report() {
    local report_file="/tmp/browser-error-detection-report.txt"
    
    print_status "INFO" "Generating detailed error detection report..."
    
    cat > "$report_file" << EOF
Browser Error Detection Report
==============================
Generated: $(date)
URL: http://localhost:3000

Page Analysis:
- HTML Size: $(curl -s "http://localhost:3000" | wc -c) bytes
- JavaScript Bundle: $(curl -s "http://localhost:3000" | grep -o "index-[A-Za-z0-9]*\.js" | head -1)
- CSS File: $(curl -s "http://localhost:3000" | grep -o "index-[A-Za-z0-9]*\.css" | head -1)

Error Detection Results:
- JavaScript Syntax Errors: $(check_browser_error_patterns > /dev/null && echo "NONE" || echo "DETECTED")
- Network Issues: $(check_network_issues > /dev/null && echo "NONE" || echo "DETECTED")
- CORS/CSP Issues: $(check_cors_csp_issues > /dev/null && echo "NONE" || echo "DETECTED")
- WebGL/Mapbox Issues: $(check_webgl_mapbox_issues > /dev/null && echo "NONE" || echo "DETECTED")
- HTML Error Messages: $(check_html_error_messages > /dev/null && echo "NONE" || echo "DETECTED")

React App Status:
- Content Present: $(curl -s "http://localhost:3000" | grep -q "Command Center" && echo "YES" || echo "NO")
- Execution Status: $(simulate_browser_behavior > /dev/null && echo "EXECUTING" || echo "NOT EXECUTING")

Troubleshooting Steps:
1. Open http://localhost:3000 in your browser
2. Open Developer Tools (F12)
3. Check Console tab for JavaScript errors
4. Check Network tab for failed requests
5. Check for CORS errors in console
6. Verify WebGL support in your browser
7. Check if ad-blockers are blocking requests

Common Browser Issues:
- WebGL not supported: Update graphics drivers or use different browser
- CORS issues: Check backend CORS configuration
- CSP blocking: Check Content Security Policy headers
- Module loading: Check for dynamic import failures
- React mounting: Check for component initialization errors

EOF

    print_status "SUCCESS" "Detailed error report generated at $report_file"
}

# Function to provide specific debugging instructions
provide_debugging_instructions() {
    echo ""
    echo "🔍 Specific Browser Error Debugging Instructions"
    echo "=================================================="
    echo ""
    echo "🌐 Open http://localhost:3000 in your browser"
    echo ""
    echo "🔍 Step-by-Step Debugging:"
    echo "   1. Open Developer Tools (F12)"
    echo "   2. Go to Console tab"
    echo "   3. Look for these specific error types:"
    echo ""
    echo "   🚨 JavaScript Errors:"
    echo "      - ReferenceError: Variable not defined"
    echo "      - TypeError: Function not found"
    echo "      - SyntaxError: Invalid JavaScript"
    echo "      - Module not found errors"
    echo ""
    echo "   🚨 React Errors:"
    echo "      - React mounting errors"
    echo "      - Component initialization errors"
    echo "      - Hook usage errors"
    echo ""
    echo "   🚨 Network Errors:"
    echo "      - CORS errors (Cross-Origin Request Blocked)"
    echo "      - Failed to load resource"
    echo "      - 404 Not Found errors"
    echo ""
    echo "   🚨 WebGL/Mapbox Errors:"
    echo "      - WebGL context lost"
    echo "      - Mapbox initialization failed"
    echo "      - Access token invalid"
    echo ""
    echo "🔧 Quick Fixes to Try:"
    echo "   1. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)"
    echo "   2. Clear browser cache and cookies"
    echo "   3. Try a different browser (Chrome, Firefox, Safari)"
    echo "   4. Check if ad-blockers are blocking Mapbox requests"
    echo "   5. Verify your browser supports WebGL"
    echo ""
    echo "📱 Test with Different Browsers:"
    echo "   - Chrome: Best WebGL support, detailed error messages"
    echo "   - Firefox: Good WebGL support, different error handling"
    echo "   - Safari: May have different WebGL behavior"
    echo ""
}

# Main execution
main() {
    echo "🔍 Starting Browser Error Detection..."
    echo "=================================================="
    echo ""
    
    # Run all error detection checks
    print_status "INFO" "Running comprehensive browser error detection..."
    
    check_browser_error_patterns
    check_network_issues
    check_cors_csp_issues
    check_webgl_mapbox_issues
    check_html_error_messages
    simulate_browser_behavior
    
    echo ""
    print_status "INFO" "Browser error detection completed"
    
    # Generate report
    generate_error_report
    
    # Provide debugging instructions
    provide_debugging_instructions
    
    echo ""
    echo "🔍 Error Detection Summary"
    echo "=================================================="
    echo ""
    echo "✅ ✅ All error detection checks completed"
    echo "📊 📊 Detailed report generated at /tmp/browser-error-detection-report.txt"
    echo "🌐 🌐 Manual browser validation required"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Follow the debugging instructions above"
    echo "   3. Check the detailed error report"
    echo "   4. Look for specific error messages in browser console"
    echo ""
    echo "📝 Key Things to Check:"
    echo "   - Browser console errors (F12 → Console)"
    echo "   - Network request failures (F12 → Network)"
    echo "   - WebGL support in your browser"
    echo "   - CORS/CSP policy issues"
    echo "   - Module loading failures"
}

# Run main function
main "$@"
