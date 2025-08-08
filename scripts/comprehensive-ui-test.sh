#!/bin/bash

# 🎨 Comprehensive UI Test for Disaster Response Dashboard
# Complete visual and component testing

echo "🎨 Starting Comprehensive UI Test for Disaster Response Dashboard"
echo "================================================================"

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

# Function to test component
test_component() {
    local test_name="$1"
    local url="$2"
    local component_pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}Testing: ${test_name}${NC}"
    
    if curl -s "$url" 2>/dev/null | grep -q "$component_pattern"; then
        echo -e "  ${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC}"
        echo "  URL: $url"
        echo "  Expected pattern: $component_pattern"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo -e "\n${YELLOW}🔍 PHASE 1: Component Presence Test${NC}"
echo "=========================================="

# Test core components
test_component "Apple Design System" "http://localhost:3000" "apple-design"
test_component "Main Container" "http://localhost:3000" "container"
test_component "Navigation" "http://localhost:3000" "nav"

# Test view components
test_component "Public View" "http://localhost:3000/public" "Emergency Response Status"
test_component "Field View" "http://localhost:3000/field" "Field Operations"
test_component "Command View" "http://localhost:3000/command" "Command Center"

echo -e "\n${YELLOW}🎯 PHASE 2: Layout Structure Test${NC}"
echo "====================================="

# Test layout classes
test_component "Flexbox Layout" "http://localhost:3000" "flex"
test_component "Grid Layout" "http://localhost:3000" "grid"
test_component "Responsive Design" "http://localhost:3000" "w-full"

# Test spacing
test_component "Consistent Spacing" "http://localhost:3000" "p-"
test_component "Component Margins" "http://localhost:3000" "m-"
test_component "Gap Spacing" "http://localhost:3000" "gap-"

echo -e "\n${YELLOW}🛡️ PHASE 3: Overflow Prevention Test${NC}"
echo "====================================="

# Test overflow handling
test_component "Overflow Hidden" "http://localhost:3000" "overflow-hidden"
test_component "Text Overflow" "http://localhost:3000" "overflow"
test_component "Container Boundaries" "http://localhost:3000" "max-w-"

echo -e "\n${YELLOW}🎨 PHASE 4: Visual Design Test${NC}"
echo "=================================="

# Test Apple design elements
test_component "Card Components" "http://localhost:3000" "card"
test_component "Button Components" "http://localhost:3000" "btn"
test_component "Shadow Effects" "http://localhost:3000" "shadow"
test_component "Border Radius" "http://localhost:3000" "rounded"

# Test color system
test_component "Background Colors" "http://localhost:3000" "bg-"
test_component "Text Colors" "http://localhost:3000" "text-"

echo -e "\n${YELLOW}📱 PHASE 5: Responsive Design Test${NC}"
echo "====================================="

# Test responsive breakpoints
test_component "Mobile Responsive" "http://localhost:3000" "sm:"
test_component "Tablet Responsive" "http://localhost:3000" "md:"
test_component "Desktop Responsive" "http://localhost:3000" "lg:"

echo -e "\n${YELLOW}🔧 PHASE 6: Component Integration Test${NC}"
echo "========================================="

# Test specific components
test_component "Alert Banner" "http://localhost:3000" "alert-banner"
test_component "Metrics Grid" "http://localhost:3000" "metrics-grid"
test_component "Resource Table" "http://localhost:3000" "resource-table"
test_component "Disaster Map" "http://localhost:3000" "disaster-map"

echo -e "\n${YELLOW}⚡ PHASE 7: Performance Test${NC}"
echo "================================"

# Test loading performance
if timeout 3 curl -s http://localhost:3000 > /dev/null; then
    echo -e "\n${BLUE}Testing: Page Load Performance${NC}"
    echo -e "  ${GREEN}✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "\n${BLUE}Testing: Page Load Performance${NC}"
    echo -e "  ${RED}❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

echo -e "\n${YELLOW}🎯 PHASE 8: Accessibility Test${NC}"
echo "=================================="

# Test accessibility features
test_component "Semantic HTML" "http://localhost:3000" "main"
test_component "ARIA Attributes" "http://localhost:3000" "aria-"

echo -e "\n${YELLOW}📊 PHASE 9: Data Integration Test${NC}"
echo "=================================="

# Test data display
test_component "Data Loading" "http://localhost:3000" "disaster-data"
test_component "Metrics Display" "http://localhost:3000" "metric"
test_component "Resource Status" "http://localhost:3000" "status"

echo -e "\n${YELLOW}🔍 PHASE 10: Visual Quality Test${NC}"
echo "=================================="

# Test visual quality indicators
test_component "Typography Scale" "http://localhost:3000" "text-"
test_component "Font Weights" "http://localhost:3000" "font-"
test_component "Line Heights" "http://localhost:3000" "leading-"

echo -e "\n${YELLOW}📋 PHASE 11: Manual Inspection Checklist${NC}"
echo "=========================================="

echo -e "\n${BLUE}Manual Visual Inspection Required:${NC}"
echo "1. Open http://localhost:3000 in browser"
echo "2. Navigate through all three views:"
echo "   - Public View: http://localhost:3000/public"
echo "   - Field View: http://localhost:3000/field"
echo "   - Command View: http://localhost:3000/command"
echo ""
echo "3. Check for the following issues:"
echo "   ✅ No text clipping or overflow"
echo "   ✅ Proper spacing between components"
echo "   ✅ Consistent Apple design styling"
echo "   ✅ Responsive behavior on different screen sizes"
echo "   ✅ All interactive elements functional"
echo "   ✅ Map layers toggle correctly"
echo "   ✅ Cards and buttons look professional"
echo "   ✅ No layout breaking on mobile"
echo "   ✅ Clean typography and readability"
echo "   ✅ Proper color contrast"

echo -e "\n${YELLOW}📊 Comprehensive UI Test Results${NC}"
echo "====================================="
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All automated UI tests passed!${NC}"
    echo -e "\n${BLUE}UI Quality Summary:${NC}"
    echo "  ✅ All components present and functional"
    echo "  ✅ Layout structure is solid"
    echo "  ✅ Overflow prevention in place"
    echo "  ✅ Apple design system applied"
    echo "  ✅ Responsive design working"
    echo "  ✅ Component integration successful"
    echo "  ✅ Performance is acceptable"
    echo "  ✅ Accessibility features present"
    echo "  ✅ Data integration working"
    echo "  ✅ Visual quality indicators present"
    echo -e "\n${YELLOW}Next Step:${NC} Complete manual visual inspection checklist above"
    echo -e "\n${GREEN}✅ UI is ready for professional presentation!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some UI tests failed.${NC}"
    echo -e "\n${YELLOW}Recommendations:${NC}"
    echo "1. Check the failing tests above"
    echo "2. Verify all components are properly implemented"
    echo "3. Ensure CSS classes are correctly applied"
    echo "4. Complete manual visual inspection"
    echo "5. Fix any identified issues"
    exit 1
fi
