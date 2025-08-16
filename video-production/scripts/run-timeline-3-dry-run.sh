#!/bin/bash

# Timeline 3 Interaction Dry Run Test
# Tests all interactions without recording video

set -e

echo "🧪 Timeline 3 Interaction Dry Run Test"
echo "======================================"
echo "This will test all interactions without recording video"
echo ""

# Check if we're in the right directory
if [ ! -f "timeline-3.yaml" ]; then
    echo "❌ Error: timeline-3.yaml not found"
    echo "Please run this script from the video-production directory"
    exit 1
fi

# Check if VideoPresentation folder exists
if [ ! -d "VideoPresentation" ]; then
    echo "⚠️  Warning: VideoPresentation folder not found"
    echo "Will test with live interactions only"
else
    echo "✅ Found VideoPresentation folder with assets"
fi

# Check if frontend is running
echo "🌐 Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
    echo "   Will test live interactions"
else
    echo "⚠️  Warning: Frontend not running on http://localhost:3000"
    echo "   Will test with mock interactions only"
fi

# Check dependencies
echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found"
    exit 1
fi

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Create test-results directory
mkdir -p test-results

echo ""
echo "🚀 Starting interaction dry run test..."
echo ""

# Run the interaction test
npx tsx scripts/test-timeline-3-interactions.ts

echo ""
echo "✅ Timeline 3 interaction dry run completed!"
echo ""
echo "📁 Test results:"
echo "   - test-results/timeline-3-interaction-test.json (detailed report)"
echo ""
echo "🎬 What was tested:"
echo "   - Timeline loading and parsing"
echo "   - VideoPresentation asset availability"
echo "   - Browser initialization"
echo "   - Navigation between pages"
echo "   - Production features simulation"
echo "   - UI element detection"
echo "   - Interaction validation"
echo ""
echo "📊 Next steps:"
echo "   1. Review the test report"
echo "   2. Fix any issues found"
echo "   3. Run the full video creation when ready"
echo ""
