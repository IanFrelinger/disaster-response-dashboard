#!/bin/bash

# Comprehensive 11-Segment Disaster Response Demo Runner
# This script runs a complete demo covering ALL features of the platform

set -e

echo "🚀 Starting Comprehensive 11-Segment Disaster Response Demo..."
echo "================================================================"
echo ""
echo "🎯 This demo covers ALL major features:"
echo "   ✅ Commander Dashboard Overview (20s)"
echo "   ✅ Hazard Detection & Triage (25s)"
echo "   ✅ Weather Integration & Risk Scoring (20s)"
echo "   ✅ Zone Definition & Priority Management (25s)"
echo "   ✅ Building-Level Evacuation Tracking (20s)"
echo "   ✅ Route Planning with A* Star Algorithm (30s)"
echo "   ✅ Unit Assignment & Management (25s)"
echo "   ✅ AI Decision Support & Recommendations (30s)"
echo "   ✅ Technical Architecture Overview (20s)"
echo "   ✅ Foundry Integration & Data Fusion (20s)"
echo "   ✅ Real-Time Updates & Progress Metrics (20s)"
echo "   ✅ Live Map Integration & Situational Awareness (15s)"
echo ""
echo "📊 Total Duration: 4 minutes 20 seconds"
echo "🎬 Professional narration script included for each segment"
echo "📸 High-quality screenshots captured for video production"
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
if [ ! -f "scripts/comprehensive-11-segment-demo.ts" ]; then
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

# Run the comprehensive 11-segment demo
echo ""
echo "🎬 Starting comprehensive 11-segment demo recording..."
echo "   This will showcase ALL features with professional narration"
echo "   Total duration: 4 minutes 20 seconds across 11 segments"
echo ""
echo "📹 Demo segments with business value:"
echo "   1. Commander Dashboard Overview (20s) - Centralized emergency response management"
echo "   2. Hazard Detection & Triage (25s) - Proactive threat detection saves lives"
echo "   3. Weather Integration & Risk Scoring (20s) - Weather-aware operations improve safety"
echo "   4. Zone Definition & Priority Management (25s) - Strategic zone management optimizes efficiency"
echo "   5. Building-Level Evacuation Tracking (20s) - Granular tracking ensures no one left behind"
echo "   6. Route Planning with A* Star Algorithm (30s) - Intelligent routing reduces response time"
echo "   7. Unit Assignment & Management (25s) - Efficient unit management maximizes effectiveness"
echo "   8. AI Decision Support & Recommendations (30s) - AI-powered decisions improve outcomes"
echo "   9. Technical Architecture Overview (20s) - Modern architecture ensures scalability"
echo "   10. Foundry Integration & Data Fusion (20s) - Advanced data fusion provides awareness"
echo "   11. Real-Time Updates & Progress Metrics (20s) - Data-driven decision making"
echo "   12. Live Map Integration & Situational Awareness (15s) - Geographic visualization improves coordination"
echo ""

npx tsx scripts/comprehensive-11-segment-demo.ts

echo ""
echo "✅ Comprehensive 11-segment demo recording completed!"
echo "📸 Screenshots saved in: output/"
echo "🎥 This demo covers ALL major features with professional narration"
echo ""
echo "🎯 Next steps for video production:"
echo "   1. Review all 22 screenshots (before/after for each segment)"
echo "   2. Add professional narration using the provided scripts"
echo "   3. Create professional transitions and graphics"
echo "   4. Include lower thirds and callouts for each feature"
echo "   5. Apply color grading and LUTs for polished look"
echo "   6. Add branded titles and strong conclusion"
echo ""
echo "🚀 The platform is now ready for comprehensive professional video production!"
echo "📊 Business value and technical capabilities fully demonstrated across all segments"
