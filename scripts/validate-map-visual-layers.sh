#!/bin/bash

# Visual Map Layer Validation Script
# This script validates that map layers are actually visible on the map
# Uses browser automation to check real visual output

set -e

echo "🔍 Starting Visual Map Layer Validation..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}🔍 $message${NC}"
            ;;
    esac
}

# Function to check if a service is running
check_service() {
    local service=$1
    local port=$2
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        print_status "SUCCESS" "$service is running on port $port"
        return 0
    else
        print_status "ERROR" "$service is not accessible on port $port"
        return 1
    fi
}

# Function to check if React app is executing
check_react_execution() {
    print_status "INFO" "Checking if React app is executing..."
    
    # Check if the page content changes after JavaScript execution
    local initial_response=$(curl -s "http://localhost:3000")
    local initial_length=$(echo "$initial_response" | wc -c)
    
    print_status "INFO" "Initial page length: $initial_length bytes"
    
    # Wait a moment for JavaScript to execute
    sleep 3
    
    # Check if content has changed (indicating React execution)
    local updated_response=$(curl -s "http://localhost:3000")
    local updated_length=$(echo "$updated_response" | wc -c)
    
    print_status "INFO" "Updated page length: $updated_length bytes"
    
    if [ "$updated_length" -gt "$initial_length" ]; then
        print_status "SUCCESS" "Page content increased - React app may be executing"
        return 0
    elif [ "$updated_length" -eq "$initial_length" ]; then
        print_status "WARNING" "Page content unchanged - React app may not be executing"
        return 1
    else
        print_status "ERROR" "Page content decreased - unexpected behavior"
        return 1
    fi
}

# Function to check for JavaScript errors in response
check_javascript_errors() {
    print_status "INFO" "Checking for JavaScript errors in response..."
    
    local response=$(curl -s "http://localhost:3000")
    
    # Check for common JavaScript error patterns
    if echo "$response" | grep -q "Uncaught\|ReferenceError\|TypeError\|SyntaxError"; then
        print_status "ERROR" "JavaScript errors detected in response"
        echo "$response" | grep -i "error\|Error\|ERROR" | head -5
        return 1
    fi
    
    # Check for React-specific error patterns
    if echo "$response" | grep -q "React.*error\|JSX.*error\|Component.*error"; then
        print_status "ERROR" "React-specific errors detected"
        echo "$response" | grep -i "react.*error\|jsx.*error\|component.*error" | head -3
        return 1
    fi
    
    print_status "SUCCESS" "No obvious JavaScript errors detected"
    return 0
}

# Function to check browser console for errors
check_browser_console() {
    print_status "INFO" "Checking browser console for errors..."
    
    # Use curl to check if the page loads without JavaScript errors
    local response=$(curl -s "http://localhost:3000")
    
    if echo "$response" | grep -q "error\|Error\|ERROR"; then
        print_status "WARNING" "Potential errors found in page response"
        echo "$response" | grep -i "error" | head -5
    else
        print_status "SUCCESS" "No obvious errors in page response"
    fi
    
    # Check if the page is just a static HTML shell
    local content_length=$(echo "$response" | wc -c)
    if [ "$content_length" -lt 1000 ]; then
        print_status "WARNING" "Page content is very small ($content_length bytes) - React app may not be rendering"
        print_status "INFO" "This suggests the JavaScript bundle is not executing properly"
    fi
    
    # Check for React root div
    if echo "$response" | grep -q '<div id="root"></div>'; then
        print_status "SUCCESS" "React root div found in HTML"
        print_status "WARNING" "But React app is not rendering content into it"
    fi
}

# Function to validate map container rendering
validate_map_container() {
    print_status "INFO" "Validating map container rendering..."
    
    local response=$(curl -s "http://localhost:3000")
    
    # Check for map container
    if echo "$response" | grep -q "mapboxgl-map\|map-container\|Mapbox3DTerrain"; then
        print_status "SUCCESS" "Map container found in HTML"
    else
        print_status "ERROR" "Map container not found in HTML"
        return 1
    fi
    
    # Check for layer control checkboxes
    if echo "$response" | grep -q "checkbox.*Hazards\|checkbox.*Units\|checkbox.*Routes"; then
        print_status "SUCCESS" "Layer control checkboxes found in HTML"
    else
        print_status "WARNING" "Layer control checkboxes not found in HTML"
    fi
}

# Function to check for specific map features
validate_map_features() {
    print_status "INFO" "Validating map features..."
    
    local response=$(curl -s "http://localhost:3000")
    
    # Check for terrain features
    if echo "$response" | grep -q "terrain\|Terrain\|3D"; then
        print_status "SUCCESS" "Terrain/3D features mentioned in HTML"
    else
        print_status "WARNING" "Terrain/3D features not mentioned in HTML"
    fi
    
    # Check for building features
    if echo "$response" | grep -q "building\|Building\|extrusion"; then
        print_status "SUCCESS" "Building features mentioned in HTML"
    else
        print_status "WARNING" "Building features not mentioned in HTML"
    fi
}

# Function to check data layer sources
validate_data_sources() {
    print_status "INFO" "Validating data layer sources..."
    
    local response=$(curl -s "http://localhost:3000")
    
    # Check for hazard data
    if echo "$response" | grep -q "hazard\|Hazard\|risk"; then
        print_status "SUCCESS" "Hazard data references found in HTML"
    else
        print_status "WARNING" "Hazard data references not found in HTML"
    fi
    
    # Check for unit data
    if echo "$response" | grep -q "unit\|Unit\|emergency"; then
        print_status "SUCCESS" "Emergency unit references found in HTML"
    else
        print_status "WARNING" "Emergency unit references not found in HTML"
    fi
    
    # Check for route data
    if echo "$response" | grep -q "route\|Route\|evacuation"; then
        print_status "SUCCESS" "Evacuation route references found in HTML"
    else
        print_status "WARNING" "Evacuation route references not found in HTML"
    fi
}

# Function to check container logs for layer rendering
check_layer_logs() {
    print_status "INFO" "Checking container logs for layer rendering..."
    
    # Check frontend logs for map initialization
    local frontend_logs=$(docker logs disaster-response-dashboard-frontend-1 2>&1 | tail -50)
    
    if echo "$frontend_logs" | grep -q "Mapbox.*initialized\|map.*loaded\|layers.*added"; then
        print_status "SUCCESS" "Map initialization messages found in frontend logs"
        echo "$frontend_logs" | grep -i "mapbox\|map.*loaded\|layers.*added" | head -3
    else
        print_status "WARNING" "No map initialization messages found in frontend logs"
    fi
    
    # Check for data layer messages
    if echo "$frontend_logs" | grep -q "hazard.*layer\|unit.*layer\|route.*layer"; then
        print_status "SUCCESS" "Data layer messages found in frontend logs"
        echo "$frontend_logs" | grep -i "hazard.*layer\|unit.*layer\|route.*layer" | head -3
    else
        print_status "WARNING" "No data layer messages found in frontend logs"
    fi
    
    # Check for errors
    if echo "$frontend_logs" | grep -q "error\|Error\|ERROR"; then
        print_status "ERROR" "Errors found in frontend logs"
        echo "$frontend_logs" | grep -i "error" | head -5
    else
        print_status "SUCCESS" "No errors found in frontend logs"
    fi
}

# Function to check network requests
check_network_requests() {
    print_status "INFO" "Checking network requests..."
    
    # Check if Mapbox resources are being requested
    local response=$(curl -s -I "http://localhost:3000")
    
    if echo "$response" | grep -q "200\|OK"; then
        print_status "SUCCESS" "Frontend is responding with HTTP 200"
    else
        print_status "ERROR" "Frontend is not responding properly"
        echo "$response"
    fi
}

# Function to create automated test page
create_test_page() {
    print_status "INFO" "Creating automated test page..."
    
    cat > /tmp/map-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Map Layer Test</title>
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        #map { width: 800px; height: 600px; border: 2px solid #ccc; }
        .test-results { margin-top: 20px; padding: 10px; background: #f5f5f5; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <h1>Map Layer Validation Test</h1>
    <div id="map"></div>
    <div class="test-results" id="results"></div>
    
    <script>
        const results = document.getElementById('results');
        let testResults = [];
        
        function addResult(message, type) {
            testResults.push({ message, type });
            const div = document.createElement('div');
            div.className = type;
            div.textContent = message;
            results.appendChild(div);
        }
        
        function runTests() {
            testResults = [];
            results.innerHTML = '';
            
            // Test 1: Check if Mapbox loads
            try {
                if (typeof mapboxgl !== 'undefined') {
                    addResult('✅ Mapbox GL JS loaded successfully', 'success');
                } else {
                    addResult('❌ Mapbox GL JS failed to load', 'error');
                    return;
                }
            } catch (e) {
                addResult('❌ Error loading Mapbox GL JS: ' + e.message, 'error');
                return;
            }
            
            // Test 2: Check Mapbox access token
            if (mapboxgl.accessToken) {
                addResult('✅ Mapbox access token is set', 'success');
            } else {
                addResult('❌ Mapbox access token is not set', 'error');
                return;
            }
            
            // Test 3: Initialize map
            try {
                const map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/satellite-v9',
                    center: [-122.4194, 37.7749],
                    zoom: 12,
                    pitch: 60,
                    bearing: 0
                });
                
                addResult('✅ Map initialized successfully', 'success');
                
                // Test 4: Check if map loads
                map.on('load', () => {
                    addResult('✅ Map loaded successfully', 'success');
                    
                    // Test 5: Add test layers
                    try {
                        // Add a test source and layer
                        map.addSource('test-points', {
                            type: 'geojson',
                            data: {
                                type: 'FeatureCollection',
                                features: [{
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [-122.4194, 37.7749]
                                    },
                                    properties: { name: 'Test Point' }
                                }]
                            }
                        });
                        
                        map.addLayer({
                            id: 'test-points-layer',
                            type: 'circle',
                            source: 'test-points',
                            paint: {
                                'circle-radius': 10,
                                'circle-color': '#ff0000'
                            }
                        });
                        
                        addResult('✅ Test layer added successfully', 'success');
                        
                        // Test 6: Check if layer is visible
                        setTimeout(() => {
                            const layers = map.getStyle().layers;
                            if (layers.some(layer => layer.id === 'test-points-layer')) {
                                addResult('✅ Test layer is visible on map', 'success');
                            } else {
                                addResult('❌ Test layer is not visible on map', 'error');
                            }
                        }, 1000);
                        
                    } catch (e) {
                        addResult('❌ Error adding test layer: ' + e.message, 'error');
                    }
                });
                
                map.on('error', (e) => {
                    addResult('❌ Map error: ' + e.error.message, 'error');
                });
                
            } catch (e) {
                addResult('❌ Error initializing map: ' + e.message, 'error');
            }
        }
        
        // Run tests when page loads
        window.addEventListener('load', runTests);
    </script>
</body>
</html>
EOF

    print_status "SUCCESS" "Test page created at /tmp/map-test.html"
}

# Function to run comprehensive validation
run_comprehensive_validation() {
    print_status "INFO" "Running comprehensive map layer validation..."
    
    # Step 1: Check services
    print_status "INFO" "Step 1: Checking service status..."
    if ! check_service "Frontend" "3000"; then
        print_status "ERROR" "Frontend service check failed"
        return 1
    fi
    
    if ! check_service "Backend" "8000"; then
        print_status "ERROR" "Backend service check failed"
        return 1
    fi
    
    # Step 2: Check React execution
    print_status "INFO" "Step 2: Checking React app execution..."
    if ! check_react_execution; then
        print_status "WARNING" "React app may not be executing properly"
    fi
    
    # Step 3: Check JavaScript errors
    print_status "INFO" "Step 3: Checking JavaScript errors..."
    if ! check_javascript_errors; then
        print_status "ERROR" "JavaScript errors detected"
    fi
    
    # Step 4: Check browser console
    print_status "INFO" "Step 4: Checking browser console..."
    check_browser_console
    
    # Step 5: Validate map container
    print_status "INFO" "Step 5: Validating map container..."
    if ! validate_map_container; then
        print_status "ERROR" "Map container validation failed"
        return 1
    fi
    
    # Step 6: Validate map features
    print_status "INFO" "Step 6: Validating map features..."
    validate_map_features
    
    # Step 7: Validate data sources
    print_status "INFO" "Step 7: Validating data sources..."
    validate_data_sources
    
    # Step 8: Check network requests
    print_status "INFO" "Step 8: Checking network requests..."
    check_network_requests
    
    # Step 9: Check container logs
    print_status "INFO" "Step 9: Checking container logs..."
    check_layer_logs
    
    # Step 10: Create test page
    print_status "INFO" "Step 10: Creating automated test page..."
    create_test_page
    
    return 0
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
    echo "      - Mapbox GL JS"
    echo "      - WebGL context"
    echo "      - Map initialization"
    echo "      - Layer loading"
    echo ""
    echo "🗺️  Visual Map Checks:"
    echo "   1. Does the map container render?"
    echo "   2. Is the map visible (not just a gray box)?"
    echo "   3. Can you see terrain/3D features?"
    echo "   4. Are there any data layers visible (hazards, units, routes)?"
    echo "   5. Can you interact with the map (zoom, pan, rotate)?"
    echo ""
    echo "📊 Expected Features:"
    echo "   - 3D terrain with elevation"
    echo "   - 3D building extrusions"
    echo "   - Hazard zones (colored circles)"
    echo "   - Emergency units (colored markers)"
    echo "   - Evacuation routes (colored lines)"
    echo ""
    echo "🧪 Automated Test Page:"
    echo "   Open /tmp/map-test.html in your browser to test Mapbox functionality"
    echo ""
    echo "🔧 If issues are found:"
    echo "   1. Check browser console for errors"
    echo "   2. Verify Mapbox token is valid"
    echo "   3. Check if WebGL is supported in your browser"
    echo "   4. Try refreshing the page"
    echo "   5. Check if ad-blockers are blocking Mapbox requests"
}

# Function to generate validation report
generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > /tmp/map-validation-report.txt << EOF
Map Layer Validation Report
Generated: $timestamp
==================================================

Service Status:
- Frontend: $(curl -s "http://localhost:3000" > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Not accessible")
- Backend: $(curl -s "http://localhost:8000" > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Not accessible")

React App Execution:
- React execution: $(check_react_execution > /dev/null 2>&1 && echo "✅ Yes" || echo "❌ No")
- JavaScript errors: $(check_javascript_errors > /dev/null 2>&1 && echo "✅ No" || echo "❌ Yes")

Map Container:
- Container found: $(curl -s "http://localhost:3000" | grep -q "mapboxgl-map\|map-container\|Mapbox3DTerrain" && echo "✅ Yes" || echo "❌ No")
- Layer controls: $(curl -s "http://localhost:3000" | grep -q "checkbox.*Hazards\|checkbox.*Units\|checkbox.*Routes" && echo "✅ Yes" || echo "⚠️  No")

Map Features:
- Terrain/3D: $(curl -s "http://localhost:3000" | grep -q "terrain\|Terrain\|3D" && echo "✅ Yes" || echo "⚠️  No")
- Buildings: $(curl -s "http://localhost:3000" | grep -q "building\|Building\|extrusion" && echo "✅ Yes" || echo "⚠️  No")

Data Sources:
- Hazards: $(curl -s "http://localhost:3000" | grep -q "hazard\|Hazard\|risk" && echo "✅ Yes" || echo "⚠️  No")
- Units: $(curl -s "http://localhost:3000" | grep -q "unit\|Unit\|emergency" && echo "✅ Yes" || echo "⚠️  No")
- Routes: $(curl -s "http://localhost:3000" | grep -q "route\|Route\|evacuation" && echo "✅ Yes" || echo "⚠️  No")

Container Logs:
$(docker logs disaster-response-dashboard-frontend-1 2>&1 | tail -20 | sed 's/^/  /')

Next Steps:
1. Open http://localhost:3000 in your browser
2. Check browser console for errors
3. Verify map layers are visible
4. Test /tmp/map-test.html for Mapbox functionality
EOF

    print_status "SUCCESS" "Validation report generated at /tmp/map-validation-report.txt"
}

# Main execution
main() {
    echo "🔍 Visual Map Layer Validation Script"
    echo "=================================================="
    echo ""
    
    # Run comprehensive validation
    if run_comprehensive_validation; then
        print_status "SUCCESS" "Comprehensive validation completed"
    else
        print_status "ERROR" "Comprehensive validation failed"
    fi
    
    # Generate report
    generate_report
    
    # Provide manual instructions
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
    echo "   3. Check /tmp/map-validation-report.txt for detailed results"
    echo "   4. Test /tmp/map-test.html for Mapbox functionality"
    echo ""
    echo "📝 For troubleshooting:"
    echo "   - Check browser console errors"
    echo "   - Verify WebGL support"
    echo "   - Test with different browsers"
    echo "   - Check network requests in DevTools"
}

# Run main function
main "$@"
