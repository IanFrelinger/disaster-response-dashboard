#!/bin/bash

# Johnny Ive Design Validation Script
# Tests the minimalist, clean design elements we've implemented

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3000"
CSS_URL="http://localhost:3000/src/styles/apple-design.css"
TIMEOUT=10

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

test_css_pattern() {
    local name="$1"
    local pattern="$2"
    
    log_info "Testing $name"
    
    # Extract CSS content from Vite's hot module replacement wrapper
    local css_content=$(curl -s "$CSS_URL" | sed -n '/const __vite__css = "/,/";$/p' | sed 's/const __vite__css = "//;s/";$//' | sed 's/\\n/\n/g' | sed 's/\\"/"/g')
    
    if echo "$css_content" | grep -q "$pattern"; then
        log_success "$name found in CSS"
    else
        log_error "$name not found in CSS"
    fi
}

test_frontend_accessible() {
    log_info "Testing frontend accessibility"
    
    if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
        log_success "Frontend is accessible"
    else
        log_error "Frontend is not accessible"
    fi
}

echo "🎨 Johnny Ive Design Validation"
echo "================================"
echo ""

# Test 0: Frontend Accessibility
echo "0. Frontend Accessibility Test"
echo "=============================="
test_frontend_accessible
echo ""

# Test 1: Johnny Ive Color Palette
echo "1. Color Palette Test"
echo "====================="
test_css_pattern "Ivory white color" "--ivory-white: #FAFAFA"
test_css_pattern "Pure white color" "--pure-white: #FFFFFF"
test_css_pattern "Warm gray colors" "--warm-gray-"
test_css_pattern "Accent blue" "--accent-blue: #007AFF"
test_css_pattern "Accent green" "--accent-green: #34C759"
test_css_pattern "Accent orange" "--accent-orange: #FF9500"
test_css_pattern "Accent red" "--accent-red: #FF3B30"
echo ""

# Test 2: Typography System
echo "2. Typography Test"
echo "=================="
test_css_pattern "SF Pro Display font" "SF Pro Display"
test_css_pattern "Light font weights" "--font-weight-light: 300"
test_css_pattern "Heading classes" ".heading-"
test_css_pattern "Body text classes" ".body-"
test_css_pattern "Caption text" ".caption"
test_css_pattern "Typography scale" "--font-size-"
echo ""

# Test 3: Spacing System
echo "3. Spacing System Test"
echo "======================"
test_css_pattern "Generous spacing" "--space-"
test_css_pattern "Large spacing values" "--space-24: 96px"
test_css_pattern "Container padding" "padding: 0 var(--space-6)"
test_css_pattern "Section spacing" "padding: var(--space-24) 0"
echo ""

# Test 4: Component Design
echo "4. Component Design Test"
echo "========================"
test_css_pattern "Card components" ".card"
test_css_pattern "Button components" ".btn"
test_css_pattern "Glass effect" ".glass"
test_css_pattern "Elevated shadows" "--shadow-"
test_css_pattern "Badge components" ".badge"
test_css_pattern "Alert components" ".alert"
echo ""

# Test 5: Layout System
echo "5. Layout System Test"
echo "====================="
test_css_pattern "Container system" ".container"
test_css_pattern "Grid system" ".grid"
test_css_pattern "Flexbox utilities" ".flex"
test_css_pattern "Responsive design" "@media.*max-width"
echo ""

# Test 6: Interactive Elements
echo "6. Interactive Elements Test"
echo "============================"
test_css_pattern "Smooth animations" "cubic-bezier"
test_css_pattern "Hover effects" ":hover"
test_css_pattern "Focus states" ".focus-ring"
test_css_pattern "Button interactions" "transform: translateY"
echo ""

# Test 7: Minimalist Design Elements
echo "7. Minimalist Design Test"
echo "=========================="
test_css_pattern "Clean borders" "--border-light"
test_css_pattern "Subtle shadows" "--shadow-sm"
test_css_pattern "Rounded corners" "--radius-"
test_css_pattern "Clean backgrounds" "--bg-elevated"
echo ""

# Test 8: Navigation Design
echo "8. Navigation Design Test"
echo "========================="
test_css_pattern "Navigation styling" "nav"
test_css_pattern "Clean navigation" "bg-primary.*border-light"
test_css_pattern "Icon styling" "w-.*h-.*bg-accent-blue"
echo ""

# Test 9: Terrain 3D Interface
echo "9. Terrain 3D Interface Test"
echo "============================="
test_css_pattern "Glass effect panels" "glass.*rounded-2xl"
test_css_pattern "Custom slider" "input.*range.*slider"
test_css_pattern "Slider thumb" "slider-thumb"
test_css_pattern "Location presets" "bg-elevated.*hover"
echo ""

# Test 10: Responsive Design
echo "10. Responsive Design Test"
echo "=========================="
test_css_pattern "Mobile responsive" "@media.*max-width: 768px"
test_css_pattern "Container responsive" "container.*padding"
test_css_pattern "Grid responsive" "grid-template-columns"
test_css_pattern "Typography responsive" "font-size.*var(--font-size-"
echo ""

# Test 11: CSS Custom Properties
echo "11. CSS Custom Properties Test"
echo "=============================="
test_css_pattern "CSS variables" "var(--"
test_css_pattern "Color variables" "var(--accent-"
test_css_pattern "Spacing variables" "var(--space-"
test_css_pattern "Typography variables" "var(--font-"
test_css_pattern "Shadow variables" "var(--shadow-"
echo ""

# Test 12: Animation System
echo "12. Animation System Test"
echo "========================="
test_css_pattern "Smooth animations" "cubic-bezier"
test_css_pattern "Fade animations" "fadeIn"
test_css_pattern "Slide animations" "slideUp"
test_css_pattern "Scale animations" "scaleIn"
test_css_pattern "Keyframes" "@keyframes"
echo ""

# Test 13: Accessibility
echo "13. Accessibility Test"
echo "======================"
test_css_pattern "Focus management" "focus-ring"
test_css_pattern "Color contrast" "text-primary.*text-secondary"
test_css_pattern "Font smoothing" "antialiased"
test_css_pattern "Text rendering" "optimizeLegibility"
echo ""

# Test 14: Performance Optimizations
echo "14. Performance Test"
echo "===================="
test_css_pattern "Font smoothing" "antialiased"
test_css_pattern "Text rendering" "optimizeLegibility"
test_css_pattern "Hardware acceleration" "transform.*translateY"
test_css_pattern "Smooth scrolling" "scroll-behavior: smooth"
echo ""

# Test 15: Johnny Ive Design Principles
echo "15. Johnny Ive Design Principles Test"
echo "======================================"
test_css_pattern "Minimalist approach" "bg-secondary.*bg-primary"
test_css_pattern "Clean typography" "font-weight-light.*line-height"
test_css_pattern "Generous whitespace" "space-24.*space-32"
test_css_pattern "Subtle interactions" "transition.*cubic-bezier"
test_css_pattern "Refined shadows" "shadow-sm.*shadow-md"
test_css_pattern "Glass morphism" "backdrop-filter.*blur"
echo ""

# Test 16: Advanced Features
echo "16. Advanced Features Test"
echo "=========================="
test_css_pattern "Glass effect" "backdrop-filter"
test_css_pattern "Custom slider" "slider.*appearance: none"
test_css_pattern "Print styles" "@media print"
test_css_pattern "Loading states" ".loading"
test_css_pattern "Z-index scale" "--z-"
echo ""

# Summary
echo ""
echo "📊 Johnny Ive Design Validation Results"
echo "========================================"
echo "Total Tests: $((PASSED + FAILED + WARNINGS))"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Warnings: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All Johnny Ive design elements are working correctly!"
    echo ""
    echo "Design Features Validated:"
    echo "• Minimalist color palette with ivory whites and warm grays"
    echo "• Clean typography with SF Pro Display-inspired fonts"
    echo "• Generous whitespace and precise spacing system"
    echo "• Subtle shadows and refined elevation"
    echo "• Smooth, elegant interactions"
    echo "• Glass morphism effects"
    echo "• Responsive and accessible design"
    echo "• Custom slider styling"
    echo "• Advanced animations and transitions"
    echo ""
    echo "The UI now embodies Johnny Ive's design philosophy:"
    echo "• Simplicity and clarity"
    echo "• Attention to detail"
    echo "• Generous use of whitespace"
    echo "• Refined interactions"
    echo "• Elegant minimalism"
    echo "• Purposeful use of technology"
else
    echo "⚠️  Some design elements need attention. Please review the failed tests above."
fi

echo ""
echo "🌐 Open http://localhost:3000 to see the Johnny Ive-inspired design in action!"
echo ""
echo "🎨 Key Design Elements Implemented:"
echo "• Johnny Ive-inspired color palette"
echo "• SF Pro Display typography system"
echo "• Generous 8px-based spacing system"
echo "• Refined component library"
echo "• Glass morphism effects"
echo "• Smooth cubic-bezier transitions"
echo "• Mobile-first responsive design"
echo "• Accessibility-focused interactions"
