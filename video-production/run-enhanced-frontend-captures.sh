#!/bin/bash

# Enhanced Frontend Captures with Validation
# This script runs the enhanced frontend capture generator with comprehensive validation and timeout protection

set -e

echo "🎬 Enhanced Frontend Captures with Validation"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the video-production directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Warning: node_modules not found. Installing dependencies..."
    npm install
fi

# Check if Playwright is available
if ! npx playwright --version > /dev/null 2>&1; then
    echo "⚠️  Warning: Playwright not found. Installing Playwright..."
    npx playwright install
fi

# Clear old captures
echo "🧹 Clearing old captures..."
rm -rf captures/*
mkdir -p captures/screenshots captures/videos

# Run the enhanced frontend captures
echo "🚀 Running enhanced frontend captures with validation..."
echo "   - Global timeout: 10 minutes"
echo "   - Step timeout: 30 seconds"
echo "   - Browser health monitoring enabled"
echo "   - Automatic cleanup on completion"
echo ""

npm run enhanced-frontend-captures

echo ""
echo "✅ Enhanced frontend captures completed!"
echo ""
echo "Generated files:"
echo "  - captures/01_personal_intro.webm"
echo "  - captures/02_user_persona.webm"
echo ""
echo "For more information, see:"
echo "  - scripts/enhanced-frontend-captures-with-validation.ts - Implementation"
echo "  - captures/ - Generated video files"
echo "  - SMOKE_TEST_README.md - Testing documentation"
