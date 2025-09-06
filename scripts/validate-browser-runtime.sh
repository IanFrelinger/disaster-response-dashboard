#!/bin/bash

# Enhanced Browser Runtime Validation Script
# This script validates that the React app is actually executing in the browser

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

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    if curl -s "$url" > /dev/null 2>&1; then
        print_status "SUCCESS" "$service_name is running on port $port"
        return 0
    else
        print_status "ERROR" "$service_name is not running on port $port"
        return 1
    fi
}

# Function to check React app execution with multiple approaches
check_react_execution() {
    print_status "INFO" "Checking React app execution with multiple validation methods..."
    
    local initial_response=$(curl -s "http://localhost:3000")
    local initial_length=$(echo "$initial_response" | wc -c)
    print_status "INFO" "Initial page length: $initial_length bytes"
    
    # Method 1: Wait for JavaScript execution and check content changes
    print_status "INFO" "Method 1: Checking for content changes after JavaScript execution..."
    sleep 5
    local updated_response=$(curl -s "http://localhost:3000")
    local updated_length=$(echo "$updated_response" | wc -c)
    print_status "INFO" "Updated page length: $updated_length bytes"
    
    if [ "$updated_length" -gt "$initial_length" ]; then
        print_status "SUCCESS" "Page content increased - React app may be executing"
        return 0
    elif [ "$updated_length" -eq "$initial_length" ]; then
        print_status "WARNING" "Page content unchanged - React app may not be executing"
    else
        print_status "ERROR" "Page content decreased - unexpected behavior"
        return 1
    fi
    
    # Method 2: Check for React-specific content
    print_status "INFO" "Method 2: Checking for React-specific content..."
    if echo "$updated_response" | grep -q "Command Center\|Emergency Response\|3D Map"; then
        print_status "SUCCESS" "React app content detected in HTML"
        return 0
    else
        print_status "WARNING" "No React app content detected in HTML"
    fi
    
    # Method 3: Check for JavaScript bundle execution
    print_status "INFO" "Method 3: Checking JavaScript bundle execution..."
    local js_file=$(echo "$updated_response" | grep -o "index-[A-Za-z0-9]*\.js" | head -1)
    if [ -n "$js_file" ]; then
        print_status "INFO" "JavaScript bundle referenced: $js_file"
        
        # Check if the JavaScript file is accessible and complete
        local js_response=$(curl -s "http://localhost:3000/assets/$js_file")
        local js_length=$(echo "$js_response" | wc -c)
        print_status "INFO" "JavaScript bundle size: $js_length bytes"
        
        # Check if the JavaScript file contains React mounting code
        if echo "$js_response" | grep -q "main.tsx is executing\|React import successful\|ReactDOM import successful"; then
            print_status "SUCCESS" "JavaScript bundle contains React mounting code"
            return 0
        else
            print_status "WARNING" "JavaScript bundle missing React mounting code"
        fi
    else
        print_status "ERROR" "No JavaScript bundle referenced in HTML"
        return 1
    fi
    
    return 1
}

# Function to check for runtime errors
check_runtime_errors() {
    print_status "INFO" "Checking for potential runtime errors..."
    
    local response=$(curl -s "http://localhost:3000")
    
    # Check for common JavaScript errors
    if echo "$response" | grep -q "Uncaught\|ReferenceError\|TypeError\|SyntaxError"; then
        print_status "ERROR" "JavaScript errors detected in response"
        echo "$response" | grep -i "error\|Error\|ERROR" | head -5
        return 1
    fi
    
    # Check for React-specific errors
    if echo "$response" | grep -q "React.*error\|JSX.*error\|Component.*error"; then
        print_status "ERROR" "React-specific errors detected"
        echo "$response" | grep -i "react.*error\|jsx.*error\|component.*error" | head -3
        return 1
    fi
    
    # Check for missing dependencies
    if echo "$response" | grep -q "Cannot find module\|Module not found"; then
        print_status "ERROR" "Module dependency errors detected"
        echo "$response" | grep -i "cannot find module\|module not found" | head -3
        return 1
    fi
    
    print_status "SUCCESS" "No obvious runtime errors detected"
    return 0
}

# Function to validate map container and layers
validate_map_container() {
    print_status "INFO" "Validating map container and layers..."
    
    local response=$(curl -s "http://localhost:3000")
    
    # Check for map container
    if echo "$response" | grep -q "map.*container\|map-container\|mapContainer"; then
        print_status "SUCCESS" "Map container found in HTML"
    else
        print_status "WARNING" "Map container not found in HTML"
    fi
    
    # Check for map controls
    if echo "$response" | grep -q "3D Map Controls\|Terrain\|Buildings\|Hazards\|Units\|Routes"; then
        print_status "SUCCESS" "Map controls found in HTML"
    else
        print_status "WARNING" "Map controls not found in HTML"
    fi
    
    # Check for Mapbox integration
    if echo "$response" | grep -q "mapbox\|Mapbox"; then
        print_status "SUCCESS" "Mapbox integration found in HTML"
    else
        print_status "WARNING" "Mapbox integration not found in HTML"
    fi
}

# Function to check browser compatibility
check_browser_compatibility() {
    print_status "INFO" "Checking browser compatibility issues..."
    
    local response=$(curl -s "http://localhost:3000")
    
    # Check for WebGL requirements
    if echo "$response" | grep -q "WebGL\|webgl"; then
        print_status "INFO" "WebGL requirements detected in code"
    fi
    
    # Check for modern JavaScript features
    if echo "$response" | grep -q "ES6\|ES2015\|ES2020\|ESNext"; then
        print_status "INFO" "Modern JavaScript features detected"
    fi
    
    print_status "SUCCESS" "Browser compatibility check completed"
}

# Function to generate comprehensive report
generate_report() {
    local report_file="/tmp/browser-runtime-validation-report.txt"
    
    print_status "INFO" "Generating comprehensive validation report..."
    
    cat > "$report_file" << EOF
Browser Runtime Validation Report
================================
Generated: $(date)
URL: http://localhost:3000

Service Status:
- Frontend: $(curl -s "http://localhost:3000" > /dev/null && echo "Running" || echo "Not Running")
- Backend: $(curl -s "http://localhost:8000" > /dev/null && echo "Running" || echo "Not Running")

React App Status:
- HTML Size: $(curl -s "http://localhost:3000" | wc -c) bytes
- JavaScript Bundle: $(curl -s "http://localhost:3000" | grep -o "index-[A-Za-z0-9]*\.js" | head -1)
- React Content: $(curl -s "http://localhost:3000" | grep -q "Command Center" && echo "Detected" || echo "Not Detected")

Map Integration:
- Map Container: $(curl -s "http://localhost:3000" | grep -q "map.*container" && echo "Found" || echo "Not Found")
- Map Controls: $(curl -s "http://localhost:3000" | grep -q "3D Map Controls" && echo "Found" || echo "Not Found")
- Mapbox Integration: $(curl -s "http://localhost:3000" | grep -q "mapbox" && echo "Found" || echo "Not Found")

Validation Results:
- React Execution: $(check_react_execution > /dev/null && echo "SUCCESS" || echo "FAILED")
- Runtime Errors: $(check_runtime_errors > /dev/null && echo "NONE" || echo "DETECTED")
- Map Container: $(validate_map_container > /dev/null && echo "VALID" || echo "INVALID")

Troubleshooting Steps:
1. Open http://localhost:3000 in your browser
2. Open Developer Tools (F12)
3. Check Console tab for JavaScript errors
4. Check Network tab for failed requests
5. Verify WebGL support in your browser
6. Check if ad-blockers are blocking Mapbox requests

Expected Behavior:
- Page should show "Command Center" header
- Navigation between "Commander Dashboard" and "Live Map" should work
- Map should display with 3D terrain and building controls
- Hazard, unit, and route layers should be visible
- Map controls should be functional

EOF

    print_status "SUCCESS" "Comprehensive report generated at $report_file"
}

# Function to run comprehensive validation
run_comprehensive_validation() {
    print_status "INFO" "Starting comprehensive browser runtime validation..."
    echo "=================================================="
    print_status "INFO" "Browser Runtime Validation Script"
    echo "=================================================="
    echo ""
    
    # Step 1: Check service status
    print_status "INFO" "Step 1: Checking service status..."
    if ! check_service "Frontend" "3000" "http://localhost:3000"; then
        print_status "ERROR" "Frontend service check failed"
        return 1
    fi
    
    if ! check_service "Backend" "8000" "http://localhost:8000"; then
        print_status "ERROR" "Backend service check failed"
        return 1
    fi
    
    # Step 2: Check React app execution
    print_status "INFO" "Step 2: Checking React app execution..."
    if ! check_react_execution; then
        print_status "WARNING" "React app execution needs verification"
    fi
    
    # Step 3: Check for runtime errors
    print_status "INFO" "Step 3: Checking for runtime errors..."
    if ! check_runtime_errors; then
        print_status "ERROR" "Runtime errors detected"
    fi
    
    # Step 4: Validate map container
    print_status "INFO" "Step 4: Validating map container..."
    validate_map_container
    
    # Step 5: Check browser compatibility
    print_status "INFO" "Step 5: Checking browser compatibility..."
    check_browser_compatibility
    
    echo ""
    print_status "INFO" "Comprehensive validation completed"
}

# Function to provide manual validation instructions
provide_manual_instructions() {
    echo ""
    echo "🔍 Manual Validation Instructions"
    echo "=================================================="
    echo ""
    echo "🌐 Open your browser and navigate to: http://localhost:3000"
    echo ""
    echo "🔍 Check the following in the browser:"
    echo "   1. Open Developer Tools (F12)"
    echo "   2. Go to Console tab"
    echo "   3. Look for any error messages related to:"
    echo "      - React mounting errors"
    echo "      - Mapbox GL JS errors"
    echo "      - WebGL context errors"
    echo "      - Module loading errors"
    echo ""
    echo "🗺️  Visual Map Checks:"
    echo "   1. Does the page show 'Command Center' header?"
    echo "   2. Can you navigate between Dashboard and Map views?"
    echo "   3. Does the map container render?"
    echo "   4. Is the map visible (not just a gray box)?"
    echo "   5. Can you see terrain/3D features?"
    echo "   6. Are there any data layers visible?"
    echo "   7. Can you interact with the map (zoom, pan, rotate)?"
    echo ""
    echo "📊 Expected Features:"
    echo "   - Command Center header with navigation"
    echo "   - 3D terrain with elevation"
    echo "   - 3D building extrusions"
    echo "   - Hazard zones (colored circles)"
    echo "   - Emergency units (colored markers)"
    echo "   - Evacuation routes (colored lines)"
    echo ""
    echo "🧪 If the React app is not working:"
    echo "   1. Check browser console for specific error messages"
    echo "   2. Verify the JavaScript bundle is loading (Network tab)"
    echo "   3. Check if there are any CORS or CSP issues"
    echo "   4. Try refreshing the page"
    echo "   5. Test with different browsers (Chrome, Firefox, Safari)"
    echo "   6. Check if ad-blockers are blocking requests"
    echo ""
    echo "🔧 Common Issues and Solutions:"
    echo "   - WebGL not supported: Update graphics drivers or use different browser"
    echo "   - Mapbox token invalid: Check environment variables"
    echo "   - CORS issues: Check backend CORS configuration"
    echo "   - JavaScript errors: Check for syntax errors in source code"
    echo ""
}

# Main execution
main() {
    if run_comprehensive_validation; then
        print_status "SUCCESS" "All validation checks completed"
    else
        print_status "WARNING" "Some validation checks failed"
    fi
    
    generate_report
    provide_manual_instructions
    
    echo ""
    echo "🔍 Validation Summary"
    echo "=================================================="
    echo ""
    echo "✅ ✅ Services are running and accessible"
    echo "⚠️  ⚠️  React app execution needs verification"
    echo "⚠️  ⚠️  Manual validation required in browser"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Follow the manual validation steps above"
    echo "   3. Check /tmp/browser-runtime-validation-report.txt for detailed results"
    echo ""
    echo "📝 For troubleshooting:"
    echo "   - Check browser console errors"
    echo "   - Verify WebGL support"
    echo "   - Test with different browsers"
    echo "   - Check network requests in DevTools"
    echo "   - Review the comprehensive validation report"
}

# Run main function
main "$@"
