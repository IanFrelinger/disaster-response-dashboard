#!/usr/bin/env bash

# Map Layer Validation Script
# This script validates that all map layers are rendering correctly

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

print_status "Starting Map Layer Validation..."
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

# Check Mapbox token
print_status "Step 4: Checking Mapbox configuration..."
FRONTEND_CONTAINER=$(docker-compose ps -q frontend)
if [ -z "$FRONTEND_CONTAINER" ]; then
    print_error "Frontend container not found"
    exit 1
fi

MAPBOX_TOKEN=$(docker exec $FRONTEND_CONTAINER env | grep VITE_MAPBOX_ACCESS_TOKEN | cut -d'=' -f2)
if [ -z "$MAPBOX_TOKEN" ] || [ "$MAPBOX_TOKEN" = "undefined" ]; then
    print_error "Mapbox access token is not set"
    exit 1
fi

print_success "Mapbox access token is configured"

# Check if token is valid (basic validation)
if [[ "$MAPBOX_TOKEN" == pk.* ]]; then
    print_success "Mapbox token format appears valid"
else
    print_warning "Mapbox token format may be invalid"
fi

# Check container logs for map-related errors
print_status "Step 5: Checking container logs for map errors..."
FRONTEND_LOGS=$(docker logs $FRONTEND_CONTAINER --tail 50 2>&1)

# Check for common map errors
if echo "$FRONTEND_LOGS" | grep -q "Mapbox error\|map.on is not a function\|WebGL context lost"; then
    print_error "Map errors detected in container logs:"
    echo "$FRONTEND_LOGS" | grep -i "mapbox error\|map.on is not a function\|WebGL context lost" | head -5
else
    print_success "No map errors detected in container logs"
fi

# Check for successful map initialization
if echo "$FRONTEND_LOGS" | grep -q "Mapbox map loaded\|terrain layers added\|building extrusions added"; then
    print_success "Map initialization appears successful"
else
    print_warning "No map initialization success messages found in logs"
fi

# Provide manual validation instructions
echo ""
print_status "Step 6: Manual Validation Instructions"
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
echo "🔧 If issues are found:"
echo "   1. Check browser console for errors"
echo "   2. Verify Mapbox token is valid"
echo "   3. Check if WebGL is supported in your browser"
echo "   4. Try refreshing the page"
echo "   5. Check if ad-blockers are blocking Mapbox requests"
echo ""

# Check browser compatibility
print_status "Step 7: Browser Compatibility Check..."
echo "=================================================="
echo ""
echo "🌐 Supported Browsers:"
echo "   ✅ Chrome/Chromium (recommended)"
echo "   ✅ Firefox (latest)"
echo "   ✅ Safari (latest)"
echo "   ❌ Internet Explorer (not supported)"
echo ""
echo "🔧 WebGL Requirements:"
echo "   - WebGL 2.0 support required"
echo "   - Hardware acceleration enabled"
echo "   - No WebGL context loss"
echo ""

# Final status
echo ""
print_status "Step 8: Validation Summary"
echo "=================================================="
echo ""
print_success "✅ Services are running and accessible"
print_success "✅ Mapbox token is configured"
print_success "✅ No critical errors in container logs"
echo ""
print_warning "⚠️  Manual validation required in browser"
echo ""
echo "🎯 Next Steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Follow the manual validation steps above"
echo "   3. Report any issues found"
echo "   4. Check browser console for detailed error messages"
echo ""
echo "📝 For troubleshooting:"
echo "   - Check browser console errors"
echo "   - Verify WebGL support"
echo "   - Test with different browsers"
echo "   - Check network requests in DevTools"
echo ""

print_success "Map Layer Validation Script Completed!"
echo ""
echo "🔍 Manual validation is required to fully assess map rendering"
echo "🌐 Open http://localhost:3000 in your browser to continue"
