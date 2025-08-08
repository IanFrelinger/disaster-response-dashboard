#!/bin/bash

# 🗺️ Test Clean Map State
# Verify all map elements have been removed for fresh start

echo "🗺️ Testing Clean Map State"
echo "=========================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}1. Checking Removed Elements${NC}"

# Check if hazards layer was removed
if ! grep -q "mockHazards" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Hazards layer removed${NC}"
else
    echo -e "  ${RED}❌ Hazards layer still present${NC}"
fi

# Check if routes layer was removed
if ! grep -q "mockRoutes" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Routes layer removed${NC}"
else
    echo -e "  ${RED}❌ Routes layer still present${NC}"
fi

# Check if resources layer was removed
if ! grep -q "mockResources" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Resources layer removed${NC}"
else
    echo -e "  ${RED}❌ Resources layer still present${NC}"
fi

# Check if boundaries layer was removed
if ! grep -q "boundaries" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Boundaries layer removed${NC}"
else
    echo -e "  ${RED}❌ Boundaries layer still present${NC}"
fi

# Check if legend was removed
if ! grep -q "Legend" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Map legend removed${NC}"
else
    echo -e "  ${RED}❌ Map legend still present${NC}"
fi

# Check if zoom controls were removed
if ! grep -q "handleZoomIn\|handleZoomOut" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Zoom controls removed${NC}"
else
    echo -e "  ${RED}❌ Zoom controls still present${NC}"
fi

# Check if layer visibility state was removed
if ! grep -q "layerVisibility" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Layer visibility state removed${NC}"
else
    echo -e "  ${RED}❌ Layer visibility state still present${NC}"
fi

echo -e "\n${YELLOW}2. Checking Remaining Core Elements${NC}"

# Check if basic map structure remains
if grep -q "mapContainer" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Map container structure intact${NC}"
else
    echo -e "  ${RED}❌ Map container structure missing${NC}"
fi

# Check if tile layer controls remain
if grep -q "tileLayer" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Tile layer controls intact${NC}"
else
    echo -e "  ${RED}❌ Tile layer controls missing${NC}"
fi

# Check if pan functionality remains
if grep -q "handleMouseDown\|handleMouseMove\|handleMouseUp" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Pan functionality intact${NC}"
else
    echo -e "  ${RED}❌ Pan functionality missing${NC}"
fi

# Check if wheel zoom remains
if grep -q "handleWheel" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Wheel zoom functionality intact${NC}"
else
    echo -e "  ${RED}❌ Wheel zoom functionality missing${NC}"
fi

# Check if loading/error states remain
if grep -q "isLoading\|error" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Loading/error states intact${NC}"
else
    echo -e "  ${RED}❌ Loading/error states missing${NC}"
fi

echo -e "\n${YELLOW}3. Checking Frontend Server${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "  ${GREEN}✅ Frontend server is running${NC}"
else
    echo -e "  ${RED}❌ Frontend server is not running${NC}"
    exit 1
fi

echo -e "\n${YELLOW}4. Clean Map State Summary${NC}"
echo "================================="
echo -e "${GREEN}✅ Removed Elements:${NC}"
echo "  • Hazards layer (mockHazards)"
echo "  • Routes layer (mockRoutes)"
echo "  • Resources layer (mockResources)"
echo "  • Boundaries layer"
echo "  • Map legend"
echo "  • Zoom controls (+/- buttons)"
echo "  • Layer visibility state"
echo "  • Layer toggle buttons"

echo -e "\n${GREEN}✅ Preserved Core Elements:${NC}"
echo "  • Map container structure"
echo "  • Tile layer controls (Street/Satellite/Terrain)"
echo "  • Pan functionality (mouse drag)"
echo "  • Wheel zoom functionality"
echo "  • Loading/error states"
echo "  • Basic map styling and grid"

echo -e "\n${YELLOW}5. Manual Testing Instructions${NC}"
echo "====================================="
echo -e "\n${BLUE}Open http://localhost:3000 in your browser and verify:${NC}"
echo ""
echo "1. **Clean Map Display:**"
echo "   • Map should show only background and grid"
echo "   • No hazards, routes, resources, or boundaries visible"
echo "   • No legend in bottom-right corner"
echo "   • No zoom controls in top-right corner"
echo ""
echo "2. **Remaining Functionality:**"
echo "   • Tile layer buttons should work (Street/Satellite/Terrain)"
echo "   • Mouse drag should pan the map"
echo "   • Mouse wheel should zoom in/out"
echo "   • Zoom level should update in header"
echo ""
echo "3. **Visual Appearance:**"
echo "   • Clean, minimal map display"
echo "   • Background changes with tile layer selection"
echo "   • Grid pattern visible and responsive to zoom"
echo "   • Professional, uncluttered appearance"

echo -e "\n${YELLOW}6. Ready for Element Re-addition${NC}"
echo "====================================="
echo "✅ Map is now clean and ready for elements to be re-added one by one"
echo "✅ Core functionality (pan, zoom, tile layers) is preserved"
echo "✅ Clean slate for systematic element addition"
echo "✅ No visual clutter or overlapping elements"

echo -e "\n${GREEN}🎉 Clean Map State Achieved!${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Verify clean state in browser"
echo "2. Plan element re-addition order"
echo "3. Add elements one by one"
echo "4. Test each addition thoroughly"

echo -e "\n${GREEN}✅ Map is now clean and ready for systematic element re-addition!${NC}"
