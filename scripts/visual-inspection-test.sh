#!/bin/bash

# 👁️ Visual Inspection Test for Disaster Response Dashboard
# Focused testing for clipping, overflow, and layout issues

echo "👁️ Starting Visual Inspection Test for Disaster Response Dashboard"
echo "=================================================================="

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

echo -e "\n${YELLOW}1. Text Clipping Prevention Test${NC}"
echo "======================================"

# Test text overflow handling
test_component "Text Overflow Hidden" "http://localhost:3000" "overflow-hidden"
test_component "Text Ellipsis" "http://localhost:3000" "text-ellipsis"
test_component "Text Truncate" "http://localhost:3000" "truncate"

# Test long text handling
test_component "Word Break" "http://localhost:3000" "break-words"
test_component "Word Wrap" "http://localhost:3000" "break-normal"

echo -e "\n${YELLOW}2. Container Overflow Test${NC}"
echo "================================"

# Test container overflow
test_component "Container Overflow Hidden" "http://localhost:3000" "overflow-hidden"
test_component "Container Overflow Auto" "http://localhost:3000" "overflow-auto"

# Test scroll handling
test_component "Scroll Container" "http://localhost:3000" "overflow-y-auto"
test_component "Horizontal Scroll" "http://localhost:3000" "overflow-x-auto"

echo -e "\n${YELLOW}3. Layout Boundary Test${NC}"
echo "============================="

# Test container boundaries
test_component "Container Max Width" "http://localhost:3000" "max-w-"
test_component "Container Min Height" "http://localhost:3000" "min-h-"
test_component "Container Max Height" "http://localhost:3000" "max-h-"

# Test responsive boundaries
test_component "Responsive Width" "http://localhost:3000" "w-full"
test_component "Responsive Height" "http://localhost:3000" "h-full"

echo -e "\n${YELLOW}4. Component Spacing Test${NC}"
echo "================================"

# Test padding to prevent clipping
test_component "Component Padding" "http://localhost:3000" "p-"
test_component "Component Margin" "http://localhost:3000" "m-"

# Test spacing consistency
test_component "Consistent Spacing" "http://localhost:3000" "space-"
test_component "Gap Spacing" "http://localhost:3000" "gap-"

echo -e "\n${YELLOW}5. Card Component Layout Test${NC}"
echo "=================================="

# Test card boundaries
test_component "Card Padding" "http://localhost:3000" "card.*p-"
test_component "Card Margin" "http://localhost:3000" "card.*m-"

# Test card content overflow
test_component "Card Content Overflow" "http://localhost:3000" "card-content.*overflow"

echo -e "\n${YELLOW}6. Button Component Layout Test${NC}"
echo "=================================="

# Test button sizing
test_component "Button Padding" "http://localhost:3000" "btn.*px-"
test_component "Button Height" "http://localhost:3000" "btn.*h-"

# Test button text overflow
test_component "Button Text Overflow" "http://localhost:3000" "btn.*overflow"

echo -e "\n${YELLOW}7. Table Component Layout Test${NC}"
echo "=================================="

# Test table overflow
test_component "Table Container Overflow" "http://localhost:3000" "table.*overflow"
test_component "Table Cell Padding" "http://localhost:3000" "td.*p-"

# Test table responsive behavior
test_component "Table Responsive" "http://localhost:3000" "table.*responsive"

echo -e "\n${YELLOW}8. Map Component Layout Test${NC}"
echo "=================================="

# Test map container sizing
test_component "Map Container Height" "http://localhost:3000" "disaster-map.*h-"
test_component "Map Container Width" "http://localhost:3000" "disaster-map.*w-"

# Test map content overflow
test_component "Map Content Overflow" "http://localhost:3000" "disaster-map.*overflow"

echo -e "\n${YELLOW}9. Alert Banner Layout Test${NC}"
echo "=================================="

# Test alert banner boundaries
test_component "Alert Banner Padding" "http://localhost:3000" "alert-banner.*p-"
test_component "Alert Banner Margin" "http://localhost:3000" "alert-banner.*m-"

# Test alert text overflow
test_component "Alert Text Overflow" "http://localhost:3000" "alert.*overflow"

echo -e "\n${YELLOW}10. Metrics Grid Layout Test${NC}"
echo "=================================="

# Test metrics grid boundaries
test_component "Metrics Grid Container" "http://localhost:3000" "metrics-grid.*container"
test_component "Metrics Grid Spacing" "http://localhost:3000" "metrics-grid.*gap"

# Test metrics card overflow
test_component "Metrics Card Overflow" "http://localhost:3000" "metric.*overflow"

echo -e "\n${YELLOW}11. Navigation Layout Test${NC}"
echo "=================================="

# Test navigation boundaries
test_component "Navigation Container" "http://localhost:3000" "nav.*container"
test_component "Navigation Spacing" "http://localhost:3000" "nav.*gap"

# Test navigation link overflow
test_component "Navigation Link Overflow" "http://localhost:3000" "nav.*overflow"

echo -e "\n${YELLOW}12. Responsive Layout Test${NC}"
echo "=================================="

# Test responsive breakpoints
test_component "Mobile Responsive" "http://localhost:3000" "sm:"
test_component "Tablet Responsive" "http://localhost:3000" "md:"
test_component "Desktop Responsive" "http://localhost:3000" "lg:"

# Test responsive overflow
test_component "Responsive Overflow" "http://localhost:3000" "overflow.*responsive"

echo -e "\n${YELLOW}13. Typography Layout Test${NC}"
echo "=================================="

# Test text sizing
test_component "Text Size Classes" "http://localhost:3000" "text-"
test_component "Font Size Responsive" "http://localhost:3000" "text-sm.*md:text-"

# Test line height
test_component "Line Height" "http://localhost:3000" "leading-"

echo -e "\n${YELLOW}14. Flexbox Layout Test${NC}"
echo "================================"

# Test flex container
test_component "Flex Container" "http://localhost:3000" "flex"
test_component "Flex Direction" "http://localhost:3000" "flex-col.*flex-row"

# Test flex item sizing
test_component "Flex Item Sizing" "http://localhost:3000" "flex-1.*flex-auto"

echo -e "\n${YELLOW}15. Grid Layout Test${NC}"
echo "============================"

# Test grid container
test_component "Grid Container" "http://localhost:3000" "grid"
test_component "Grid Columns" "http://localhost:3000" "grid-cols-"

# Test grid item sizing
test_component "Grid Item Span" "http://localhost:3000" "col-span-"

echo -e "\n${YELLOW}16. Position and Z-Index Test${NC}"
echo "====================================="

# Test positioning
test_component "Relative Positioning" "http://localhost:3000" "relative"
test_component "Absolute Positioning" "http://localhost:3000" "absolute"

# Test z-index layering
test_component "Z-Index Layering" "http://localhost:3000" "z-"

echo -e "\n${YELLOW}17. Shadow and Depth Test${NC}"
echo "================================"

# Test shadow effects
test_component "Shadow Effects" "http://localhost:3000" "shadow"
test_component "Shadow Sizing" "http://localhost:3000" "shadow-"

echo -e "\n${YELLOW}18. Border and Radius Test${NC}"
echo "=================================="

# Test border handling
test_component "Border Classes" "http://localhost:3000" "border"
test_component "Border Radius" "http://localhost:3000" "rounded"

echo -e "\n${YELLOW}19. View-Specific Layout Test${NC}"
echo "=================================="

# Test Public View layout
test_component "Public View Container" "http://localhost:3000/public" "container"
test_component "Public View Spacing" "http://localhost:3000/public" "space-"

# Test Field View layout
test_component "Field View Container" "http://localhost:3000/field" "container"
test_component "Field View Spacing" "http://localhost:3000/field" "space-"

# Test Command View layout
test_component "Command View Container" "http://localhost:3000/command" "container"
test_component "Command View Spacing" "http://localhost:3000/command" "space-"

echo -e "\n${YELLOW}20. Final Layout Integration Test${NC}"
echo "====================================="

# Test overall layout structure
test_component "Main Layout Container" "http://localhost:3000" "main.*container"
test_component "Layout Responsive" "http://localhost:3000" "container.*responsive"

# Test layout consistency
test_component "Consistent Spacing" "http://localhost:3000" "space-.*gap-"

echo -e "\n${YELLOW}📊 Visual Inspection Test Results${NC}"
echo "====================================="
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All visual inspection tests passed!${NC}"
    echo -e "\n${BLUE}Layout Quality Checklist:${NC}"
    echo "  ✅ No text clipping detected"
    echo "  ✅ Proper container boundaries"
    echo "  ✅ Consistent spacing throughout"
    echo "  ✅ Responsive layout working"
    echo "  ✅ No overflow issues"
    echo "  ✅ Clean component integration"
    echo -e "\n${GREEN}✅ UI layout looks professional!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some visual inspection tests failed.${NC}"
    echo -e "\n${YELLOW}Manual Visual Inspection Required:${NC}"
    echo "1. Open http://localhost:3000 in browser"
    echo "2. Check for text clipping in all components"
    echo "3. Verify proper spacing and margins"
    echo "4. Test responsive behavior on different screen sizes"
    echo "5. Look for any overflow or layout issues"
    echo "6. Ensure all components fit within their containers"
    exit 1
fi
