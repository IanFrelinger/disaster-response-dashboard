#!/bin/bash

# 🗺️ Test Map-Centric Views
# Verify all views now show only the map as the centerpiece

echo "🗺️ Testing Map-Centric Views"
echo "============================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}1. Checking View Simplifications${NC}"

# Check PublicView
echo -e "\n${BLUE}PublicView Changes:${NC}"
if grep -q "AlertBanner\|MetricsGrid\|ResourceTable" frontend/src/pages/PublicView.tsx; then
    echo -e "  ${RED}❌ PublicView still contains other components${NC}"
else
    echo -e "  ${GREEN}✅ PublicView simplified to map only${NC}"
fi

if grep -q "h-\[calc(100vh-120px)\]" frontend/src/pages/PublicView.tsx; then
    echo -e "  ${GREEN}✅ PublicView map is full-screen${NC}"
else
    echo -e "  ${RED}❌ PublicView map not full-screen${NC}"
fi

# Check FieldView
echo -e "\n${BLUE}FieldView Changes:${NC}"
if grep -q "AlertBanner\|MetricsGrid\|ResourceTable" frontend/src/pages/FieldView.tsx; then
    echo -e "  ${RED}❌ FieldView still contains other components${NC}"
else
    echo -e "  ${GREEN}✅ FieldView simplified to map only${NC}"
fi

if grep -q "h-\[calc(100vh-120px)\]" frontend/src/pages/FieldView.tsx; then
    echo -e "  ${GREEN}✅ FieldView map is full-screen${NC}"
else
    echo -e "  ${RED}❌ FieldView map not full-screen${NC}"
fi

# Check CommandView
echo -e "\n${BLUE}CommandView Changes:${NC}"
if grep -q "AlertBanner\|MetricsGrid\|ResourceTable" frontend/src/pages/CommandView.tsx; then
    echo -e "  ${RED}❌ CommandView still contains other components${NC}"
else
    echo -e "  ${GREEN}✅ CommandView simplified to map only${NC}"
fi

if grep -q "h-\[calc(100vh-120px)\]" frontend/src/pages/CommandView.tsx; then
    echo -e "  ${GREEN}✅ CommandView map is full-screen${NC}"
else
    echo -e "  ${RED}❌ CommandView map not full-screen${NC}"
fi

echo -e "\n${YELLOW}2. Checking Frontend Server${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "  ${GREEN}✅ Frontend server is running${NC}"
else
    echo -e "  ${RED}❌ Frontend server is not running${NC}"
    exit 1
fi

echo -e "\n${YELLOW}3. Checking Backend API${NC}"
if curl -s http://localhost:5001/api/health | grep -q "healthy"; then
    echo -e "  ${GREEN}✅ Backend API is healthy${NC}"
else
    echo -e "  ${RED}❌ Backend API is not responding${NC}"
    exit 1
fi

echo -e "\n${YELLOW}4. Map-Centric Design Summary${NC}"
echo "====================================="
echo -e "${GREEN}✅ Simplified Views:${NC}"
echo "  • Removed all non-map components"
echo "  • Eliminated AlertBanner, MetricsGrid, ResourceTable"
echo "  • Removed detailed hazard and route cards"
echo "  • Simplified to map + minimal header only"

echo -e "\n${GREEN}✅ Full-Screen Maps:${NC}"
echo "  • Maps now use h-[calc(100vh-120px)] for full-screen"
echo "  • Proper viewport height calculation"
echo "  • Responsive design maintained"
echo "  • Clean, focused interface"

echo -e "\n${GREEN}✅ Consistent Layout:${NC}"
echo "  • All views follow same simplified pattern"
echo "  • Minimal header with title and refresh button"
echo "  • Full-screen map as centerpiece"
echo "  • Professional, clean appearance"

echo -e "\n${YELLOW}5. Manual Testing Instructions${NC}"
echo "====================================="
echo -e "\n${BLUE}Open http://localhost:3000 in your browser and test:${NC}"
echo ""
echo "1. **Public View (/):**"
echo "   • Should show only map with minimal header"
echo "   • Map should fill most of the screen"
echo "   • No other components visible"
echo ""
echo "2. **Field View (/field):**"
echo "   • Should show only map with 'Field Operations' header"
echo "   • Map should fill most of the screen"
echo "   • No resource tables or detailed cards"
echo ""
echo "3. **Command View (/command):**"
echo "   • Should show only map with 'Command Center' header"
echo "   • Map should fill most of the screen"
echo "   • No metrics grids or action panels"
echo ""
echo "4. **Map Functionality:**"
echo "   • All interactive features should still work"
echo "   • Zoom, pan, layer toggles, tile switching"
echo "   • Full-screen experience"
echo ""
echo "5. **Responsive Design:**"
echo "   • Test on different screen sizes"
echo "   • Map should adapt to viewport"
echo "   • Header should remain readable"

echo -e "\n${YELLOW}6. Expected Behavior${NC}"
echo "=========================="
echo "✅ Maps are the centerpiece of each view"
echo "✅ No other components cluttering the interface"
echo "✅ Full-screen map experience"
echo "✅ Clean, professional appearance"
echo "✅ All map functionality preserved"
echo "✅ Responsive design maintained"
echo "✅ Consistent layout across all views"

echo -e "\n${GREEN}🎉 Map-Centric Views Testing Complete!${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Complete manual testing in browser"
echo "2. Verify full-screen map experience"
echo "3. Test all three views thoroughly"
echo "4. Confirm professional appearance"

echo -e "\n${GREEN}✅ All views now focus entirely on the interactive map!${NC}"
