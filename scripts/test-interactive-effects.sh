#!/bin/bash

# Interactive Effects Validation Script
# Tests all mouse over effects and interactive feedback

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3001"
CSS_URL="http://localhost:3001/src/styles/apple-design.css"

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

echo "🎯 Interactive Effects Validation"
echo "================================"
echo ""

# Test 0: Frontend Accessibility
echo "0. Frontend Accessibility Test"
echo "=============================="
test_frontend_accessible
echo ""

# Test 1: Enhanced Interactive Shadows
echo "1. Enhanced Interactive Shadows Test"
echo "===================================="
test_css_pattern "Hover shadow" "--shadow-hover: 0 8px 25px rgba(0, 0, 0, 0.15)"
test_css_pattern "Active shadow" "--shadow-active: 0 4px 12px rgba(0, 0, 0, 0.2)"
test_css_pattern "Focus shadow" "--shadow-focus: 0 0 0 3px rgba(0, 122, 255, 0.3)"
echo ""

# Test 2: Interactive Transitions
echo "2. Interactive Transitions Test"
echo "==============================="
test_css_pattern "Hover transition" "--transition-hover: 0.2s cubic-bezier"
test_css_pattern "Press transition" "--transition-press: 0.1s cubic-bezier"
test_css_pattern "Lift transition" "--transition-lift: 0.3s cubic-bezier"
echo ""

# Test 3: Button Interactive Effects
echo "3. Button Interactive Effects Test"
echo "=================================="
test_css_pattern "Button hover transform" "\.btn:hover.*transform: translateY(-2px)"
test_css_pattern "Button active transform" "\.btn:active.*transform: translateY(0)"
test_css_pattern "Button focus shadow" "\.btn:focus.*box-shadow: var(--shadow-focus)"
test_css_pattern "Button hover overlay" "\.btn::before.*background: rgba(255, 255, 255, 0.1)"
test_css_pattern "Primary button hover" "\.btn-primary:hover.*transform: translateY(-3px)"
test_css_pattern "Secondary button hover" "\.btn-secondary:hover.*transform: translateY(-3px)"
test_css_pattern "Ghost button hover" "\.btn-ghost:hover.*transform: translateY(-2px)"
test_css_pattern "Icon button hover" "\.btn-icon:hover.*transform: translateY(-2px) scale(1.05)"
echo ""

# Test 4: Card Interactive Effects
echo "4. Card Interactive Effects Test"
echo "================================"
test_css_pattern "Card hover transform" "\.card:hover.*transform: translateY(-4px)"
test_css_pattern "Card active transform" "\.card:active.*transform: translateY(-2px)"
test_css_pattern "Card focus shadow" "\.card:focus.*box-shadow: var(--shadow-focus)"
test_css_pattern "Card hover shadow" "\.card:hover.*box-shadow: var(--shadow-hover)"
test_css_pattern "Card elevated hover" "\.card-elevated:hover.*transform: translateY(-6px)"
test_css_pattern "Card cursor pointer" "\.card.*cursor: pointer"
echo ""

# Test 5: Location Preset Interactive Effects
echo "5. Location Preset Interactive Effects Test"
echo "==========================================="
test_css_pattern "Location preset class" "\.location-preset"
test_css_pattern "Location preset hover" "\.location-preset:hover.*transform: translateY(-3px)"
test_css_pattern "Location preset active" "\.location-preset:active.*transform: translateY(-1px)"
test_css_pattern "Location preset selected" "\.location-preset\.selected"
test_css_pattern "Location preset gradient" "\.location-preset::before.*linear-gradient"
test_css_pattern "Location preset hover border" "\.location-preset:hover.*border-color: var(--accent-blue)"
echo ""

# Test 6: Badge Interactive Effects
echo "6. Badge Interactive Effects Test"
echo "=================================="
test_css_pattern "Badge hover transform" "\.badge:hover.*transform: translateY(-1px)"
test_css_pattern "Badge hover shadow" "\.badge:hover.*box-shadow: var(--shadow-sm)"
test_css_pattern "Badge success hover" "\.badge-success:hover.*background: var(--accent-green)"
test_css_pattern "Badge warning hover" "\.badge-warning:hover.*background: var(--accent-orange)"
test_css_pattern "Badge error hover" "\.badge-error:hover.*background: var(--accent-red)"
test_css_pattern "Badge info hover" "\.badge-info:hover.*background: var(--accent-blue)"
echo ""

# Test 7: Alert Interactive Effects
echo "7. Alert Interactive Effects Test"
echo "=================================="
test_css_pattern "Alert hover transform" "\.alert:hover.*transform: translateY(-2px)"
test_css_pattern "Alert active transform" "\.alert:active.*transform: translateY(0)"
test_css_pattern "Alert hover shadow" "\.alert:hover.*box-shadow: var(--shadow-hover)"
test_css_pattern "Alert info hover" "\.alert-info:hover.*background: var(--accent-blue)"
test_css_pattern "Alert success hover" "\.alert-success:hover.*background: var(--accent-green)"
test_css_pattern "Alert warning hover" "\.alert-warning:hover.*background: var(--accent-orange)"
test_css_pattern "Alert error hover" "\.alert-error:hover.*background: var(--accent-red)"
test_css_pattern "Alert text color transition" "\.alert.*\.alert-title.*transition: color"
echo ""

# Test 8: Slider Interactive Effects
echo "8. Slider Interactive Effects Test"
echo "==================================="
test_css_pattern "Slider hover height" "input.*range.*slider:hover.*height: 8px"
test_css_pattern "Slider hover scale" "input.*range.*slider:hover.*transform: scaleY(1.2)"
test_css_pattern "Slider focus shadow" "input.*range.*slider:focus.*box-shadow: var(--shadow-focus)"
test_css_pattern "Slider thumb hover" "slider-thumb:hover.*transform: scale(1.2)"
test_css_pattern "Slider thumb active" "slider-thumb:active.*transform: scale(1.1)"
test_css_pattern "Slider track hover" "slider-track:hover.*background: var(--warm-gray-300)"
echo ""

# Test 9: Feature Item Interactive Effects
echo "9. Feature Item Interactive Effects Test"
echo "========================================"
test_css_pattern "Feature item class" "\.feature-item"
test_css_pattern "Feature item hover" "\.feature-item:hover.*transform: translateX(4px)"
test_css_pattern "Feature item active" "\.feature-item:active.*transform: translateX(2px)"
test_css_pattern "Feature dot class" "\.feature-dot"
test_css_pattern "Feature dot hover" "\.feature-item:hover .feature-dot.*transform: scale(1.3)"
test_css_pattern "Feature dot color change" "\.feature-item:hover .feature-dot.*background: var(--accent-green-dark)"
echo ""

# Test 10: Control Instruction Interactive Effects
echo "10. Control Instruction Interactive Effects Test"
echo "================================================"
test_css_pattern "Control instruction class" "\.control-instruction"
test_css_pattern "Control instruction hover" "\.control-instruction:hover.*transform: translateX(2px)"
test_css_pattern "Control instruction active" "\.control-instruction:active.*transform: translateX(1px)"
test_css_pattern "Control bullet class" "\.control-bullet"
test_css_pattern "Control bullet hover" "\.control-instruction:hover .control-bullet.*transform: scale(1.2)"
test_css_pattern "Control bullet color change" "\.control-instruction:hover .control-bullet.*color: var(--accent-blue-dark)"
echo ""

# Test 11: Focus Management
echo "11. Focus Management Test"
echo "========================="
test_css_pattern "Focus ring shadow" "\.focus-ring:focus.*box-shadow: var(--shadow-focus)"
test_css_pattern "Focus ring small" "\.focus-ring-sm:focus.*box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3)"
test_css_pattern "Button focus outline" "\.btn:focus.*outline: none"
test_css_pattern "Card focus outline" "\.card:focus.*outline: none"
test_css_pattern "Slider focus outline" "input.*range.*slider:focus.*outline: none"
echo ""

# Test 12: Mobile Responsive Interactions
echo "12. Mobile Responsive Interactions Test"
echo "======================================="
test_css_pattern "Mobile hover reduction" "\.btn:hover.*\.card:hover.*\.location-preset:hover.*transform: none"
test_css_pattern "Mobile active scaling" "\.btn:active.*\.card:active.*\.location-preset:active.*transform: scale(0.98)"
test_css_pattern "Mobile media query" "@media.*max-width: 768px"
test_css_pattern "Small screen media query" "@media.*max-width: 480px"
echo ""

# Test 13: Transition Timing
echo "13. Transition Timing Test"
echo "=========================="
test_css_pattern "Hover transition timing" "transition: all var(--transition-hover)"
test_css_pattern "Press transition timing" "transition: all var(--transition-press)"
test_css_pattern "Lift transition timing" "transition: all var(--transition-lift)"
test_css_pattern "Fast transition timing" "transition:.*var(--transition-fast)"
echo ""

# Test 14: Cursor States
echo "14. Cursor States Test"
echo "======================"
test_css_pattern "Button cursor pointer" "\.btn.*cursor: pointer"
test_css_pattern "Card cursor pointer" "\.card.*cursor: pointer"
test_css_pattern "Location preset cursor" "\.location-preset.*cursor: pointer"
test_css_pattern "Alert cursor pointer" "\.alert.*cursor: pointer"
test_css_pattern "Feature item cursor" "\.feature-item.*cursor: pointer"
test_css_pattern "Control instruction cursor" "\.control-instruction.*cursor: pointer"
test_css_pattern "Slider cursor pointer" "input.*range.*slider.*cursor: pointer"
test_css_pattern "Badge cursor default" "\.badge.*cursor: default"
echo ""

# Test 15: Interactive State Combinations
echo "15. Interactive State Combinations Test"
echo "======================================="
test_css_pattern "Hover and focus states" ":hover.*:focus"
test_css_pattern "Active and focus states" ":active.*:focus"
test_css_pattern "Transform and shadow combinations" "transform.*box-shadow"
test_css_pattern "Background and color transitions" "background.*color.*transition"
test_css_pattern "Border and shadow interactions" "border.*box-shadow"
echo ""

# Summary
echo ""
echo "📊 Interactive Effects Validation Results"
echo "========================================"
echo "Total Tests: $((PASSED + FAILED + WARNINGS))"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Warnings: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All interactive effects are properly implemented!"
    echo ""
    echo "Interactive Features Validated:"
    echo "• Enhanced hover shadows and transforms"
    echo "• Smooth transition timing with cubic-bezier curves"
    echo "• Button lift effects and overlay feedback"
    echo "• Card elevation and shadow interactions"
    echo "• Location preset gradient overlays and selection states"
    echo "• Badge color transitions and hover effects"
    echo "• Alert background and text color changes"
    echo "• Slider thumb scaling and track highlighting"
    echo "• Feature item slide effects and dot animations"
    echo "• Control instruction bullet scaling and color changes"
    echo "• Focus management with clear visual indicators"
    echo "• Mobile-responsive interaction adjustments"
    echo "• Proper cursor states for all interactive elements"
    echo ""
    echo "The interface provides clear feedback across:"
    echo "• Hover states with lift and shadow effects"
    echo "• Active states with press feedback"
    echo "• Focus states with accessibility indicators"
    echo "• Selection states with visual confirmation"
    echo "• Mobile interactions with touch-friendly feedback"
else
    echo "⚠️  Some interactive effects need attention. Please review the failed tests above."
fi

echo ""
echo "🌐 Open http://localhost:3001 to test the interactive effects manually!"
echo ""
echo "🔍 Manual Testing Checklist:"
echo "1. Hover over buttons to see lift effects"
echo "2. Click buttons to see active state feedback"
echo "3. Tab through elements to see focus indicators"
echo "4. Hover over location presets to see gradient overlays"
echo "5. Select different locations to see selection states"
echo "6. Hover over feature items to see slide effects"
echo "7. Interact with the elevation slider"
echo "8. Hover over badges and alerts"
echo "9. Test on mobile for responsive interactions"
echo "10. Verify smooth transitions and animations"
