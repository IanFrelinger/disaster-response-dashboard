#!/usr/bin/env bash

# Data Layer Debugging Script
# This script helps debug why hazards, units, and routing layers aren't showing on the map

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_status() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting Data Layer Debugging..."
echo "=================================================="

# Check if services are running
print_status "Step 1: Checking service status..."
if ! docker-compose ps | grep -q "Up"; then
    print_error "Services are not running. Please start them first with 'make deploy'"
    exit 1
fi

print_success "Services are running"

# Check frontend accessibility
print_status "Step 2: Checking frontend accessibility..."
if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
    print_error "Frontend is not accessible at http://localhost:3000"
    exit 1
fi

print_success "Frontend is accessible"

# Check backend API
print_status "Step 3: Checking backend API..."
if ! curl -f http://localhost:8000/api/health >/dev/null 2>&1; then
    print_error "Backend API is not accessible at http://localhost:8000"
    exit 1
fi

print_success "Backend API is accessible"

# Check container logs for data-related errors
print_status "Step 4: Checking container logs for data layer issues..."
FRONTEND_CONTAINER=$(docker-compose ps -q frontend)
if [ -z "$FRONTEND_CONTAINER" ]; then
    print_error "Frontend container not found"
    exit 1
fi

FRONTEND_LOGS=$(docker logs $FRONTEND_CONTAINER --tail 100 2>&1)

# Check for data layer specific errors
print_status "Step 5: Analyzing data layer logs..."

# Check for Foundry data fusion errors
if echo "$FRONTEND_LOGS" | grep -q "Foundry\|foundry\|data fusion\|DataFusion"; then
    print_warning "Foundry data fusion messages found:"
    echo "$FRONTEND_LOGS" | grep -i "foundry\|data fusion" | head -5
else
    print_warning "No Foundry data fusion messages found in logs"
fi

# Check for data layer addition messages
if echo "$FRONTEND_LOGS" | grep -q "hazards\|units\|routes\|Foundry data layers"; then
    print_success "Data layer messages found in logs:"
    echo "$FRONTEND_LOGS" | grep -i "hazards\|units\|routes\|Foundry data layers" | head -5
else
    print_error "No data layer messages found in logs - this suggests layers aren't being added"
fi

# Check for Mapbox errors
if echo "$FRONTEND_LOGS" | grep -q "Mapbox error\|mapbox error\|addSource\|addLayer"; then
    print_error "Mapbox layer errors found:"
    echo "$FRONTEND_LOGS" | grep -i "Mapbox error\|mapbox error\|addSource\|addLayer" | head -5
else
    print_success "No Mapbox layer errors found"
fi

# Check for data structure issues
if echo "$FRONTEND_LOGS" | grep -q "undefined\|null\|error\|Error"; then
    print_warning "Potential data structure errors found:"
    echo "$FRONTEND_LOGS" | grep -i "undefined\|null\|error\|Error" | head -5
else
    print_success "No obvious data structure errors found"
fi

# Check for successful map initialization
if echo "$FRONTEND_LOGS" | grep -q "Mapbox map loaded\|terrain layers added\|building extrusions added"; then
    print_success "Map initialization appears successful"
else
    print_warning "No map initialization success messages found in logs"
fi

# Check for data layer success messages
if echo "$FRONTEND_LOGS" | grep -q "Foundry data layers added successfully"; then
    print_success "Data layers were added successfully"
else
    print_error "Data layers were NOT added successfully - this is the likely issue!"
fi

# Check for specific layer success messages
if echo "$FRONTEND_LOGS" | grep -q "hazards.*added\|units.*added\|routes.*added"; then
    print_success "Individual layer success messages found:"
    echo "$FRONTEND_LOGS" | grep -i "hazards.*added\|units.*added\|routes.*added" | head -3
else
    print_error "No individual layer success messages found"
fi

# Check for data availability
print_status "Step 6: Checking data availability..."
if echo "$FRONTEND_LOGS" | grep -q "active.*hazards\|available.*units\|safe.*routes"; then
    print_success "Data availability messages found:"
    echo "$FRONTEND_LOGS" | grep -i "active.*hazards\|available.*units\|safe.*routes" | head -3
else
    print_warning "No data availability messages found - checking mock data..."
fi

# Check for mock data usage
if echo "$FRONTEND_LOGS" | grep -q "Mock API call\|mock data\|Mock endpoint"; then
    print_success "Mock data is being used (expected in development)"
    echo "$FRONTEND_LOGS" | grep -i "Mock API call\|mock data\|Mock endpoint" | head -3
else
    print_warning "No mock data usage detected - this might indicate a problem"
fi

# Check for data structure validation
print_status "Step 7: Checking data structure validation..."
if echo "$FRONTEND_LOGS" | grep -q "FeatureCollection\|geojson\|coordinates"; then
    print_success "GeoJSON data structure messages found:"
    echo "$FRONTEND_LOGS" | grep -i "FeatureCollection\|geojson\|coordinates" | head -3
else
    print_warning "No GeoJSON data structure messages found"
fi

# Check for coordinate conversion issues
if echo "$FRONTEND_LOGS" | grep -q "h3ToCoordinates\|coordinate\|lat\|lng"; then
    print_success "Coordinate conversion messages found:"
    echo "$FRONTEND_LOGS" | grep -i "h3ToCoordinates\|coordinate\|lat\|lng" | head -3
else
    print_warning "No coordinate conversion messages found"
fi

# Check for layer visibility issues
print_status "Step 8: Checking layer visibility settings..."
if echo "$FRONTEND_LOGS" | grep -q "showHazards\|showUnits\|showRoutes\|localShow"; then
    print_success "Layer visibility settings found in logs:"
    echo "$FRONTEND_LOGS" | grep -i "showHazards\|showUnits\|showRoutes\|localShow" | head -3
else
    print_warning "No layer visibility settings found in logs"
fi

# Check for conditional layer addition
if echo "$FRONTEND_LOGS" | grep -q "if.*localShow\|conditional.*layer\|layer.*condition"; then
    print_success "Conditional layer logic found in logs:"
    echo "$FRONTEND_LOGS" | grep -i "if.*localShow\|conditional.*layer\|layer.*condition" | head -3
else
    print_warning "No conditional layer logic found in logs"
fi

# Provide debugging instructions
echo ""
print_status "Step 9: Debugging Instructions"
echo "=================================================="
echo ""
echo "🔍 Based on the log analysis above, here are the likely issues:"
echo ""

# Determine most likely issue based on log analysis
if echo "$FRONTEND_LOGS" | grep -q "Foundry data layers added successfully"; then
    print_success "✅ Data layers are being added to the map"
    echo "   - The issue might be with layer visibility or styling"
    echo "   - Check if layers are hidden behind other layers"
    echo "   - Verify layer opacity and zoom levels"
else
    print_error "❌ Data layers are NOT being added to the map"
    echo "   - This is the root cause of the problem"
    echo "   - Check the data fusion service and mock data"
    echo "   - Verify the useDataFusion hook is working"
fi

if echo "$FRONTEND_LOGS" | grep -q "Mock API call"; then
    print_success "✅ Mock data is being used"
    echo "   - Mock data should provide test hazards, units, and routes"
    echo "   - Check if mock data structure matches expected format"
else
    print_warning "⚠️  Mock data usage not detected"
    echo "   - This might indicate a problem with the data fusion service"
    echo "   - Check if the service is properly initialized"
fi

echo ""
echo "🌐 Next Steps for Manual Debugging:"
echo "=================================================="
echo ""
echo "1. Open http://localhost:3000 in your browser"
echo "2. Open Developer Tools (F12)"
echo "3. Go to Console tab"
echo "4. Look for these specific messages:"
echo "   - 'Foundry data layers added successfully'"
echo "   - 'Mock API call to: /api/ontology/hazard-zones'"
echo "   - 'Mock API call to: /api/ontology/emergency-units'"
echo "   - 'Mock API call to: /api/ontology/evacuation-routes'"
echo "5. Check for any error messages related to:"
echo "   - Data fusion service"
echo "   - Mapbox addSource/addLayer calls"
echo "   - Coordinate conversion"
echo "   - Data structure validation"
echo ""
echo "🔧 Common Issues and Solutions:"
echo "=================================================="
echo ""
echo "Issue 1: Data layers not being added"
echo "  - Check if useDataFusion hook is returning data"
echo "  - Verify mock data structure matches expected format"
echo "  - Check if addFoundryDataLayers function is being called"
echo ""
echo "Issue 2: Data layers added but not visible"
echo "  - Check layer opacity and zoom levels"
echo "  - Verify layers aren't hidden behind other layers"
echo "  - Check if coordinate conversion is working correctly"
echo ""
echo "Issue 3: Mock data not loading"
echo "  - Check if Foundry SDK mock methods are working"
echo "  - Verify data fusion service is properly initialized"
echo "  - Check for any console errors in the browser"
echo ""

# Final debugging summary
echo ""
print_status "Step 10: Debugging Summary"
echo "=================================================="
echo ""
echo "🎯 Most Likely Issues:"
echo ""

if echo "$FRONTEND_LOGS" | grep -q "Foundry data layers added successfully"; then
    echo "✅ Data layers are being added to the map"
    echo "   - Issue is likely with visibility or styling"
    echo "   - Check browser console for layer rendering issues"
else
    echo "❌ Data layers are NOT being added to the map"
    echo "   - This is the primary issue to fix"
    echo "   - Check data fusion service and mock data"
fi

if echo "$FRONTEND_LOGS" | grep -q "Mock API call"; then
    echo "✅ Mock data system is working"
else
    echo "❌ Mock data system may have issues"
fi

echo ""
echo "🔍 Recommended Debugging Actions:"
echo "1. Check browser console for detailed error messages"
echo "2. Verify useDataFusion hook is returning expected data"
echo "3. Check if addFoundryDataLayers function is being called"
echo "4. Verify mock data structure matches component expectations"
echo "5. Test individual layer visibility settings"
echo ""

print_success "Data Layer Debugging Script Completed!"
echo ""
echo "🎯 Use the information above to identify and fix the data layer issue"
echo "🌐 Open http://localhost:3000 in your browser to continue debugging"
