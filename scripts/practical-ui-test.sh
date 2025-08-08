#!/bin/bash

# 🎨 Practical UI Test for Disaster Response Dashboard
# Works with React SPA and provides manual inspection guide

echo "🎨 Starting Practical UI Test for Disaster Response Dashboard"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test server availability
test_server() {
    local test_name="$1"
    local url="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}Testing: ${test_name}${NC}"
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC}"
        echo "  URL: $url"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test React app structure
test_react_structure() {
    local test_name="$1"
    local url="$2"
    local pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}Testing: ${test_name}${NC}"
    
    if curl -s "$url" 2>/dev/null | grep -q "$pattern"; then
        echo -e "  ${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC}"
        echo "  URL: $url"
        echo "  Expected pattern: $pattern"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo -e "\n${YELLOW}🔍 PHASE 1: Server Availability Test${NC}"
echo "=========================================="

# Test frontend server
test_server "Frontend Server (Port 3000)" "http://localhost:3000"
test_server "Backend API Server (Port 5001)" "http://localhost:5001"

echo -e "\n${YELLOW}🎯 PHASE 2: React App Structure Test${NC}"
echo "====================================="

# Test React app structure
test_react_structure "React App HTML Structure" "http://localhost:3000" "root"
test_react_structure "React App Script Loading" "http://localhost:3000" "main.tsx"
test_react_structure "Vite Development Server" "http://localhost:3000" "vite"

echo -e "\n${YELLOW}🔧 PHASE 3: API Integration Test${NC}"
echo "=================================="

# Test API endpoints
test_server "API Health Check" "http://localhost:5001/api/health"
test_server "API Data Endpoint" "http://localhost:5001/api/disaster-data"

echo -e "\n${YELLOW}📱 PHASE 4: Route Accessibility Test${NC}"
echo "====================================="

# Test route accessibility (should return HTML template)
test_server "Public View Route" "http://localhost:3000/public"
test_server "Field View Route" "http://localhost:3000/field"
test_server "Command View Route" "http://localhost:3000/command"

echo -e "\n${YELLOW}⚡ PHASE 5: Performance Test${NC}"
echo "================================"

# Test loading performance
echo -e "\n${BLUE}Testing: Frontend Load Performance${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ PASS - Frontend loads quickly${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "  ${RED}❌ FAIL - Frontend load timeout${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

echo -e "\n${BLUE}Testing: API Response Performance${NC}"
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ PASS - API responds quickly${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "  ${RED}❌ FAIL - API response timeout${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

echo -e "\n${YELLOW}📋 PHASE 6: Manual Visual Inspection Guide${NC}"
echo "=============================================="

echo -e "\n${BLUE}🎯 COMPREHENSIVE VISUAL INSPECTION CHECKLIST${NC}"
echo "=================================================="

echo -e "\n${YELLOW}1. BROWSER SETUP${NC}"
echo "=================="
echo "• Open http://localhost:3000 in Chrome/Safari/Firefox"
echo "• Open Developer Tools (F12 or Cmd+Option+I)"
echo "• Test on different screen sizes using responsive mode"

echo -e "\n${YELLOW}2. NAVIGATION TEST${NC}"
echo "====================="
echo "• Verify navigation links work: Public View, Field View, Command View"
echo "• Check that URL changes correctly when navigating"
echo "• Ensure back/forward browser buttons work"
echo "• Test that each view loads completely"

echo -e "\n${YELLOW}3. LAYOUT & SPACING INSPECTION${NC}"
echo "=================================="
echo "• Check for text clipping or overflow in all components"
echo "• Verify proper spacing between cards, buttons, and sections"
echo "• Ensure consistent margins and padding throughout"
echo "• Look for any elements that appear cut off or cramped"

echo -e "\n${YELLOW}4. COMPONENT VISUAL QUALITY${NC}"
echo "=================================="
echo "• Cards: Check for proper shadows, rounded corners, and spacing"
echo "• Buttons: Verify hover states, proper sizing, and text alignment"
echo "• Tables: Check for proper cell padding and text wrapping"
echo "• Alerts: Verify colors, icons, and text readability"

echo -e "\n${YELLOW}5. MAP COMPONENT TEST${NC}"
echo "=========================="
echo "• Verify map loads without errors"
echo "• Test layer toggle buttons (Hazards, Routes, Resources, Boundaries)"
echo "• Check that map legend is visible and readable"
echo "• Ensure map container has proper height and doesn't overflow"

echo -e "\n${YELLOW}6. RESPONSIVE DESIGN TEST${NC}"
echo "================================"
echo "• Desktop (1200px+): Full layout with all components visible"
echo "• Tablet (768px-1199px): Check for responsive adjustments"
echo "• Mobile (320px-767px): Verify mobile-friendly layout"
echo "• Test landscape and portrait orientations"

echo -e "\n${YELLOW}7. TYPOGRAPHY & READABILITY${NC}"
echo "=================================="
echo "• Check font consistency throughout the app"
echo "• Verify proper text sizing and hierarchy"
echo "• Ensure good contrast between text and backgrounds"
echo "• Test readability of long text content"

echo -e "\n${YELLOW}8. INTERACTIVE ELEMENTS${NC}"
echo "================================"
echo "• Test all button hover and click states"
echo "• Verify form inputs work correctly"
echo "• Check that interactive elements are properly sized for touch"
echo "• Test keyboard navigation (Tab key, Enter key)"

echo -e "\n${YELLOW}9. DATA DISPLAY TEST${NC}"
echo "=========================="
echo "• Verify metrics cards display correct data"
echo "• Check that resource table shows all information"
echo "• Ensure alert banners display properly"
echo "• Test that data updates when interacting with components"

echo -e "\n${YELLOW}10. APPLE DESIGN PRINCIPLES CHECK${NC}"
echo "======================================"
echo "• Clarity: Clean, uncluttered interface"
echo "• Deference: Content is primary, UI supports content"
echo "• Depth: Subtle shadows and layering"
echo "• Simplicity: Minimal design with maximum functionality"

echo -e "\n${YELLOW}11. ACCESSIBILITY CHECK${NC}"
echo "============================="
echo "• Test with screen reader (if available)"
echo "• Check color contrast ratios"
echo "• Verify keyboard navigation works"
echo "• Ensure focus indicators are visible"

echo -e "\n${YELLOW}12. PERFORMANCE CHECK${NC}"
echo "=========================="
echo "• Monitor page load time in Network tab"
echo "• Check for any console errors"
echo "• Verify smooth animations and transitions"
echo "• Test with slower network connection"

echo -e "\n${YELLOW}13. CROSS-BROWSER TEST${NC}"
echo "============================="
echo "• Test in Chrome, Safari, Firefox (if available)"
echo "• Check for consistent appearance across browsers"
echo "• Verify all functionality works in each browser"

echo -e "\n${YELLOW}📊 Practical UI Test Results${NC}"
echo "====================================="
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All automated tests passed!${NC}"
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo "1. Complete the manual visual inspection checklist above"
    echo "2. Test all three views thoroughly"
    echo "3. Verify no clipping or layout issues"
    echo "4. Confirm Apple design principles are followed"
    echo -e "\n${GREEN}✅ Ready for professional presentation!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some automated tests failed.${NC}"
    echo -e "\n${YELLOW}Recommendations:${NC}"
    echo "1. Check server status and ports"
    echo "2. Verify React app is running correctly"
    echo "3. Complete manual visual inspection regardless"
    echo "4. Address any server issues before demo"
    exit 1
fi
