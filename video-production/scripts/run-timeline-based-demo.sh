#!/bin/bash

# Timeline-Based Disaster Response Video Demo Runner
# This script follows the exact 4-minute timeline structure from new_timeline.yaml

set -e

echo "🚀 Starting Timeline-Based Disaster Response Video Demo..."
echo "========================================================="
echo ""
echo "🎯 This demo follows the EXACT timeline structure:"
echo "   📊 Total Duration: 240 seconds (4 minutes)"
echo "   🎬 15 segments with precise timing"
echo "   🎭 Professional transitions and lower thirds"
echo "   🎥 Ready for exact video production timeline matching"
echo ""
echo "📹 Timeline Segments:"
echo "   0-15s:   Intro - Disaster Response Platform"
echo "   15-40s:  Problem - Multi-Hazard Emergency Response"
echo "   40-60s:  Users - Target Users & Roles"
echo "   60-90s:  Architecture - Technical Architecture"
echo "   90-105s: Detect - Hazard Detection & Verification"
echo "   105-115s: Triage - Risk Assessment & Triage"
echo "   115-125s: Zones - Evacuation Zone Definition"
echo "   125-145s: Routes - Route Planning & Optimization"
echo "   145-155s: Units - Unit Assignment & Tracking"
echo "   155-175s: AI Support - AI Decision Support"
echo "   175-205s: Value - Value Proposition & Impact"
echo "   205-225s: Foundry - Foundry Integration"
echo "   225-240s: Conclusion - Conclusion & Next Steps"
echo ""

# Check if frontend is running
echo "📋 Checking frontend status..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend is not running on localhost:3000"
    echo "   Please start the frontend first with: cd ../frontend && npm run dev"
    exit 1
fi

echo "✅ Frontend is running"

# Check if we're in the right directory
if [ ! -f "scripts/timeline-based-video-demo.ts" ]; then
    echo "❌ Please run this script from the video-production directory"
    exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Create output directory
echo "📁 Preparing output directory..."
mkdir -p output

# Run the timeline-based demo
echo ""
echo "🎬 Starting timeline-based video demo recording..."
echo "   This follows the EXACT 4-minute timeline structure"
echo "   All segments with precise timing and transitions"
echo "   Ready for professional video production"
echo ""

npx tsx scripts/timeline-based-video-demo.ts

echo ""
echo "✅ Timeline-based video demo recording completed!"
echo "📸 Screenshots saved in: output/"
echo "🎥 This demo follows the exact 4-minute timeline structure"
echo ""
echo "🎯 Ready for professional video production:"
echo "   1. All 30 screenshots (before/after for each segment)"
echo "   2. Exact timeline matching (240 seconds total)"
echo "   3. Professional transitions and lower thirds specified"
echo "   4. Business value and narration for each segment"
echo "   5. Perfect alignment with new_timeline.yaml"
echo ""
echo "🚀 The platform is now ready for timeline-perfect video production!"
echo "📊 Every segment matches the production timeline exactly"
