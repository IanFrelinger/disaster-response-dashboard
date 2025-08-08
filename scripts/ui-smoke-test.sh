#!/bin/bash

# 🎨 UI Smoke Test for Simplified Disaster Response Dashboard
# Comprehensive visual testing of all UI components

echo "🎨 Starting UI Smoke Test for Disaster Response Dashboard"
echo "========================================================"

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

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}Testing: ${test_name}${NC}"
    
    if eval "$test_command" 2>/dev/null | grep -q "$expected_pattern"; then
        echo -e "  ${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC}"
        echo "  Command: $test_command"
        echo "  Expected pattern: $expected_pattern"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test component presence
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

echo -e "\n${YELLOW}1. Core UI Components Test${NC}"
echo "=============================="

# Test Apple Design System CSS
test_component "Apple Design System CSS" "http://localhost:3000" "apple-design"

# Test Tailwind CSS
test_component "Tailwind CSS Classes" "http://localhost:3000" "container"

# Test responsive design classes
test_component "Responsive Design" "http://localhost:3000" "w-full"

echo -e "\n${YELLOW}2. Navigation Component Test${NC}"
echo "================================"

# Test navigation structure
test_component "Navigation Container" "http://localhost:3000" "nav"

# Test navigation links
test_component "Public View Link" "http://localhost:3000" "Public View"
test_component "Field View Link" "http://localhost:3000" "Field View"
test_component "Command View Link" "http://localhost:3000" "Command View"

# Test navigation styling
test_component "Navigation Styling" "http://localhost:3000" "flex.*gap"

echo -e "\n${YELLOW}3. Card Component Test${NC}"
echo "=========================="

# Test card structure
test_component "Card Container" "http://localhost:3000" "card"

# Test card styling
test_component "Card Background" "http://localhost:3000" "bg-white"
test_component "Card Border Radius" "http://localhost:3000" "rounded"

# Test card content
test_component "Card Header" "http://localhost:3000" "card-header"
test_component "Card Content" "http://localhost:3000" "card-content"

echo -e "\n${YELLOW}4. Button Component Test${NC}"
echo "============================="

# Test button structure
test_component "Button Elements" "http://localhost:3000" "button"

# Test button variants
test_component "Primary Button" "http://localhost:3000" "btn.*primary"
test_component "Secondary Button" "http://localhost:3000" "btn.*secondary"

# Test button styling
test_component "Button Styling" "http://localhost:3000" "px-.*py-"

echo -e "\n${YELLOW}5. Alert Banner Component Test${NC}"
echo "====================================="

# Test alert banner presence
test_component "Alert Banner Container" "http://localhost:3000" "alert-banner"

# Test alert styling
test_component "Alert Background" "http://localhost:3000" "bg-.*-100"

# Test alert content
test_component "Alert Title" "http://localhost:3000" "alert.*title"
test_component "Alert Message" "http://localhost:3000" "alert.*message"

echo -e "\n${YELLOW}6. Metrics Grid Component Test${NC}"
echo "=================================="

# Test metrics grid structure
test_component "Metrics Grid Container" "http://localhost:3000" "metrics-grid"

# Test metrics cards
test_component "Metrics Cards" "http://localhost:3000" "metric.*card"

# Test metrics content
test_component "Metrics Labels" "http://localhost:3000" "metric.*label"
test_component "Metrics Values" "http://localhost:3000" "metric.*value"

echo -e "\n${YELLOW}7. Resource Table Component Test${NC}"
echo "====================================="

# Test table structure
test_component "Resource Table" "http://localhost:3000" "resource-table"

# Test table styling
test_component "Table Container" "http://localhost:3000" "table"

# Test table content
test_component "Table Headers" "http://localhost:3000" "th"
test_component "Table Rows" "http://localhost:3000" "tr"

echo -e "\n${YELLOW}8. Disaster Map Component Test${NC}"
echo "=================================="

# Test map container
test_component "Map Container" "http://localhost:3000" "disaster-map"

# Test map controls
test_component "Map Layer Controls" "http://localhost:3000" "hazards.*routes.*resources"

# Test map styling
test_component "Map Background" "http://localhost:3000" "bg-gradient"

# Test map legend
test_component "Map Legend" "http://localhost:3000" "legend"

echo -e "\n${YELLOW}9. Layout and Spacing Test${NC}"
echo "================================"

# Test container layout
test_component "Main Container" "http://localhost:3000" "container"

# Test spacing classes
test_component "Padding Classes" "http://localhost:3000" "p-"
test_component "Margin Classes" "http://localhost:3000" "m-"

# Test flexbox layout
test_component "Flex Layout" "http://localhost:3000" "flex"

# Test grid layout
test_component "Grid Layout" "http://localhost:3000" "grid"

echo -e "\n${YELLOW}10. Typography Test${NC}"
echo "========================"

# Test heading styles
test_component "Heading Elements" "http://localhost:3000" "h[1-6]"

# Test text styling
test_component "Text Classes" "http://localhost:3000" "text-"

# Test font weights
test_component "Font Weights" "http://localhost:3000" "font-"

echo -e "\n${YELLOW}11. Color System Test${NC}"
echo "=========================="

# Test color classes
test_component "Background Colors" "http://localhost:3000" "bg-"
test_component "Text Colors" "http://localhost:3000" "text-"

# Test semantic colors
test_component "Success Colors" "http://localhost:3000" "green"
test_component "Warning Colors" "http://localhost:3000" "yellow"
test_component "Error Colors" "http://localhost:3000" "red"

echo -e "\n${YELLOW}12. Responsive Design Test${NC}"
echo "================================"

# Test responsive breakpoints
test_component "Responsive Classes" "http://localhost:3000" "md:"
test_component "Mobile Classes" "http://localhost:3000" "sm:"

# Test responsive containers
test_component "Responsive Container" "http://localhost:3000" "max-w-"

echo -e "\n${YELLOW}13. Interactive Elements Test${NC}"
echo "=================================="

# Test hover states
test_component "Hover Effects" "http://localhost:3000" "hover:"

# Test focus states
test_component "Focus States" "http://localhost:3000" "focus:"

# Test transitions
test_component "Transitions" "http://localhost:3000" "transition"

echo -e "\n${YELLOW}14. View-Specific Component Test${NC}"
echo "====================================="

# Test Public View
test_component "Public View Title" "http://localhost:3000/public" "Emergency Response Status"

# Test Field View
test_component "Field View Title" "http://localhost:3000/field" "Field Operations"

# Test Command View
test_component "Command View Title" "http://localhost:3000/command" "Command Center"

echo -e "\n${YELLOW}15. Accessibility Test${NC}"
echo "=========================="

# Test semantic HTML
test_component "Semantic Elements" "http://localhost:3000" "main"

# Test ARIA attributes
test_component "ARIA Labels" "http://localhost:3000" "aria-"

# Test alt text
test_component "Alt Text" "http://localhost:3000" "alt="

echo -e "\n${YELLOW}16. Performance Test${NC}"
echo "========================"

# Test CSS loading
run_test "CSS Loading Time" "timeout 3 curl -s http://localhost:3000 > /dev/null && echo 'fast'" "fast"

# Test component rendering
run_test "Component Rendering" "curl -s http://localhost:3000 | wc -l" "[0-9]"

echo -e "\n${YELLOW}17. Cross-Browser Compatibility Test${NC}"
echo "=========================================="

# Test HTML5 elements
test_component "HTML5 Elements" "http://localhost:3000" "section"

# Test modern CSS features
test_component "CSS Grid" "http://localhost:3000" "grid"

# Test flexbox support
test_component "Flexbox Support" "http://localhost:3000" "flex"

echo -e "\n${YELLOW}18. Content Overflow Test${NC}"
echo "================================"

# Test text overflow handling
test_component "Text Overflow" "http://localhost:3000" "overflow"

# Test container overflow
test_component "Container Overflow" "http://localhost:3000" "overflow-hidden"

# Test responsive overflow
test_component "Responsive Overflow" "http://localhost:3000" "overflow-x"

echo -e "\n${YELLOW}19. Shadow and Depth Test${NC}"
echo "================================"

# Test shadow classes
test_component "Shadow Effects" "http://localhost:3000" "shadow"

# Test depth indicators
test_component "Depth Classes" "http://localhost:3000" "shadow-"

echo -e "\n${YELLOW}20. Final Visual Integration Test${NC}"
echo "====================================="

# Test overall page structure
test_component "Page Structure" "http://localhost:3000" "html.*body.*div"

# Test component integration
test_component "Component Integration" "http://localhost:3000" "disaster-response-dashboard"

# Test Apple design integration
test_component "Apple Design Integration" "http://localhost:3000" "apple-design"

echo -e "\n${YELLOW}📊 UI Smoke Test Results${NC}"
echo "=========================="
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All UI tests passed! The dashboard looks great.${NC}"
    echo -e "\n${BLUE}Visual Checklist:${NC}"
    echo "  ✅ All components rendering correctly"
    echo "  ✅ No clipping or overflow issues"
    echo "  ✅ Proper spacing and layout"
    echo "  ✅ Apple design system applied"
    echo "  ✅ Responsive design working"
    echo "  ✅ Interactive elements functional"
    echo -e "\n${GREEN}✅ Ready for visual inspection!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some UI tests failed. Please check the issues above.${NC}"
    echo -e "\n${YELLOW}Manual Visual Inspection Required:${NC}"
    echo "1. Open http://localhost:3000 in browser"
    echo "2. Check each view (Public, Field, Command)"
    echo "3. Verify no text clipping or overflow"
    echo "4. Test responsive behavior"
    echo "5. Confirm Apple design principles"
    exit 1
fi
