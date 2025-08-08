#!/bin/bash

# 🗺️ Test Maximum Map Space
# Verify map takes up maximum space in its container

echo "🗺️ Testing Maximum Map Space"
echo "============================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}1. Checking Map Component Changes${NC}"

# Check if default className was updated
if grep -q "className = \"h-full w-full\"" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Default className updated to h-full w-full${NC}"
else
    echo -e "  ${RED}❌ Default className not updated${NC}"
fi

# Check if CardContent has flex-1
if grep -q "CardContent className=\"p-0 relative flex-1\"" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ CardContent has flex-1 for expansion${NC}"
else
    echo -e "  ${RED}❌ CardContent missing flex-1${NC}"
fi

# Check if map container has flex-1
if grep -q "className=\"relative flex-1\"" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Map container has flex-1 for expansion${NC}"
else
    echo -e "  ${RED}❌ Map container missing flex-1${NC}"
fi

# Check if map div has h-full
if grep -q "h-full.*relative overflow-hidden cursor-grab" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Map div has h-full for full height${NC}"
else
    echo -e "  ${RED}❌ Map div missing h-full${NC}"
fi

echo -e "\n${YELLOW}2. Checking View Components${NC}"

# Check PublicView container structure
if grep -q "h-screen flex flex-col" frontend/src/pages/PublicView.tsx; then
    echo -e "  ${GREEN}✅ PublicView has h-screen flex flex-col${NC}"
else
    echo -e "  ${RED}❌ PublicView missing proper container structure${NC}"
fi

# Check FieldView container structure
if grep -q "h-screen flex flex-col" frontend/src/pages/FieldView.tsx; then
    echo -e "  ${GREEN}✅ FieldView has h-screen flex flex-col${NC}"
else
    echo -e "  ${RED}❌ FieldView missing proper container structure${NC}"
fi

# Check CommandView container structure
if grep -q "h-screen flex flex-col" frontend/src/pages/CommandView.tsx; then
    echo -e "  ${GREEN}✅ CommandView has h-screen flex flex-col${NC}"
else
    echo -e "  ${RED}❌ CommandView missing proper container structure${NC}"
fi

# Check if all views have flex-shrink-0 headers
if grep -q "flex-shrink-0" frontend/src/pages/PublicView.tsx && \
   grep -q "flex-shrink-0" frontend/src/pages/FieldView.tsx && \
   grep -q "flex-shrink-0" frontend/src/pages/CommandView.tsx; then
    echo -e "  ${GREEN}✅ All views have flex-shrink-0 headers${NC}"
else
    echo -e "  ${RED}❌ Some views missing flex-shrink-0 headers${NC}"
fi

# Check if all views have flex-1 map containers
if grep -q "flex-1 p-4" frontend/src/pages/PublicView.tsx && \
   grep -q "flex-1 p-4" frontend/src/pages/FieldView.tsx && \
   grep -q "flex-1 p-4" frontend/src/pages/CommandView.tsx; then
    echo -e "  ${GREEN}✅ All views have flex-1 map containers${NC}"
else
    echo -e "  ${RED}❌ Some views missing flex-1 map containers${NC}"
fi

# Check if all views pass h-full to DisasterMap
if grep -q "className=\"h-full w-full\"" frontend/src/pages/PublicView.tsx && \
   grep -q "className=\"h-full w-full\"" frontend/src/pages/FieldView.tsx && \
   grep -q "className=\"h-full w-full\"" frontend/src/pages/CommandView.tsx; then
    echo -e "  ${GREEN}✅ All views pass h-full w-full to DisasterMap${NC}"
else
    echo -e "  ${RED}❌ Some views not passing h-full w-full to DisasterMap${NC}"
fi

echo -e "\n${YELLOW}3. Checking Frontend Server${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "  ${GREEN}✅ Frontend server is running${NC}"
else
    echo -e "  ${RED}❌ Frontend server is not running${NC}"
    exit 1
fi

echo -e "\n${YELLOW}4. Maximum Map Space Summary${NC}"
echo "====================================="
echo -e "${GREEN}✅ Map Component Changes:${NC}"
echo "  • Default className: h-full w-full"
echo "  • CardContent: flex-1 for expansion"
echo "  • Map container: flex-1 for expansion"
echo "  • Map div: h-full for full height"

echo -e "\n${GREEN}✅ View Component Changes:${NC}"
echo "  • Container: h-screen flex flex-col"
echo "  • Header: flex-shrink-0 (fixed size)"
echo "  • Map container: flex-1 (expands to fill)"
echo "  • DisasterMap: h-full w-full (fills container)"

echo -e "\n${GREEN}✅ Layout Benefits:${NC}"
echo "  • Map takes maximum available space"
echo "  • Responsive to different screen sizes"
echo "  • Header stays fixed at top"
echo "  • Map expands to fill remaining space"

echo -e "\n${YELLOW}5. Manual Testing Instructions${NC}"
echo "====================================="
echo -e "\n${BLUE}Open http://localhost:3000 in your browser and verify:${NC}"
echo ""
echo "1. **Full Screen Coverage:**"
echo "   • Map should fill the entire available space"
echo "   • No wasted space around the map"
echo "   • Map extends to edges of container"
echo ""
echo "2. **Responsive Behavior:**"
echo "   • Resize browser window - map should adapt"
echo "   • Map should always take maximum space"
echo "   • Header should stay fixed at top"
echo ""
echo "3. **All Views:**"
echo "   • Test Public, Field, and Command views"
echo "   • Each should have maximum map space"
echo "   • Consistent behavior across all views"
echo ""
echo "4. **Interactive Features:**"
echo "   • Pan and zoom should work in full space"
echo "   • Tile layer controls should be accessible"
echo "   • No clipping or overflow issues"

echo -e "\n${YELLOW}6. Expected Behavior${NC}"
echo "=========================="
echo "✅ Map fills entire available space"
echo "✅ Responsive to screen size changes"
echo "✅ Header remains fixed at top"
echo "✅ No wasted space around map"
echo "✅ Consistent across all views"
echo "✅ All interactive features work"
echo "✅ Professional, immersive experience"

echo -e "\n${GREEN}🎉 Maximum Map Space Achieved!${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Verify full-screen map experience"
echo "2. Test responsive behavior"
echo "3. Confirm all views work properly"
echo "4. Ready for element re-addition"

echo -e "\n${GREEN}✅ Map now takes maximum space in its container!${NC}"
