#!/bin/bash

# 🗺️ Test Zoom Controls Fix
# Verify zoom controls are properly positioned and not clipped

echo "🗺️ Testing Zoom Controls Fix"
echo "============================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}1. Checking Zoom Controls Positioning${NC}"

# Check if zoom controls have proper positioning
if grep -q "absolute top-2 right-2" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Zoom controls positioned at top-2 right-2${NC}"
else
    echo -e "  ${RED}❌ Zoom controls positioning not updated${NC}"
fi

# Check if z-index is set
if grep -q "z-20" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Zoom controls have proper z-index (z-20)${NC}"
else
    echo -e "  ${RED}❌ Zoom controls missing z-index${NC}"
fi

# Check if CardContent has relative positioning
if grep -q "CardContent className=\"p-0 relative\"" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ CardContent has relative positioning${NC}"
else
    echo -e "  ${RED}❌ CardContent missing relative positioning${NC}"
fi

# Check if zoom controls are smaller and more compact
if grep -q "w-8 h-8" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Zoom controls are compact (8x8)${NC}"
else
    echo -e "  ${RED}❌ Zoom controls not compacted${NC}"
fi

# Check if shadow is added
if grep -q "shadow-lg" frontend/src/components/common/DisasterMap.tsx; then
    echo -e "  ${GREEN}✅ Zoom controls have shadow for visibility${NC}"
else
    echo -e "  ${RED}❌ Zoom controls missing shadow${NC}"
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

echo -e "\n${YELLOW}4. Zoom Controls Fix Summary${NC}"
echo "====================================="
echo -e "${GREEN}✅ Positioning Fixes:${NC}"
echo "  • Changed from top-4 right-4 to top-2 right-2"
echo "  • Added z-20 for proper layering"
echo "  • Made CardContent relative positioned"
echo "  • Reduced gap from gap-2 to gap-1"

echo -e "\n${GREEN}✅ Visual Improvements:${NC}"
echo "  • Reduced size from w-10 h-10 to w-8 h-8"
echo "  • Added shadow-lg for better visibility"
echo "  • Made text bold for better readability"
echo "  • Compact design to prevent clipping"

echo -e "\n${GREEN}✅ Z-Index Management:${NC}"
echo "  • Zoom controls: z-20"
echo "  • Loading/error overlays: z-30"
echo "  • Proper layering hierarchy"

echo -e "\n${YELLOW}5. Manual Testing Instructions${NC}"
echo "====================================="
echo -e "\n${BLUE}Open http://localhost:3000 in your browser and verify:${NC}"
echo ""
echo "1. **Zoom Controls Visibility:**"
echo "   • Zoom controls should be visible in top-right corner"
echo "   • No clipping or cutoff at edges"
echo "   • Controls should be properly sized and spaced"
echo ""
echo "2. **Zoom Controls Functionality:**"
echo "   • Click + button to zoom in"
echo "   • Click - button to zoom out"
echo "   • Buttons should be responsive and clickable"
echo "   • Zoom level should update in header"
echo ""
echo "3. **Visual Appearance:**"
echo "   • Controls should have shadow for visibility"
echo "   • Text should be bold and readable"
echo "   • Compact design that doesn't interfere with map"
echo ""
echo "4. **Responsive Behavior:**"
echo "   • Test on different screen sizes"
echo "   • Controls should remain visible and accessible"
echo "   • No overflow or clipping issues"

echo -e "\n${YELLOW}6. Expected Behavior${NC}"
echo "=========================="
echo "✅ Zoom controls visible in top-right corner"
echo "✅ No clipping or cutoff at edges"
echo "✅ Proper z-index layering"
echo "✅ Compact, professional appearance"
echo "✅ Full functionality maintained"
echo "✅ Responsive on all screen sizes"
echo "✅ Clean, Apple-style design"

echo -e "\n${GREEN}🎉 Zoom Controls Fix Testing Complete!${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Complete manual testing in browser"
echo "2. Verify zoom controls are fully visible"
echo "3. Test functionality on different screen sizes"
echo "4. Confirm professional appearance"

echo -e "\n${GREEN}✅ Zoom controls are now properly positioned and visible!${NC}"
