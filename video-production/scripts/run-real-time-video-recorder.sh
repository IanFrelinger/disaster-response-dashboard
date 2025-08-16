#!/bin/bash

# Real-Time Video Recorder for Disaster Response Demo
# This script captures actual user interactions with the system

set -e

echo "🎬 Starting Real-Time Video Recording..."
echo "======================================="
echo ""
echo "🎯 This will create a video showing:"
echo "   👤 Real user interactions with the system"
echo "   🖱️  Natural mouse movements and clicks"
echo "   ⌨️  Actual typing and form interactions"
echo "   🔍 Natural exploration behavior"
echo "   📱 Realistic user experience"
echo ""
echo "📹 Video Segments:"
echo "   1. Discovery (15s) - User explores the interface"
echo "   2. Operations Exploration (20s) - Discovers evacuation zones"
echo "   3. Weather Integration (18s) - Explores weather features"
echo "   4. Asset Management (16s) - Explores building data"
echo "   5. AI Experience (22s) - Interacts with AI system"
echo "   6. Live Map Exploration (14s) - Explores map features"
echo "   7. Comprehensive Overview (12s) - Final understanding"
echo ""
echo "📊 Total Duration: 117 seconds (~2 minutes)"
echo "🎭 Natural user behavior and interactions"
echo "📹 Ready for professional video production"
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
if [ ! -f "scripts/real-time-video-recorder.ts" ]; then
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

# Run the real-time video recorder
echo ""
echo "🎬 Starting real-time video recording..."
echo "   This will capture actual user interactions"
echo "   Natural mouse movements and clicks"
echo "   Realistic exploration behavior"
echo ""

npx tsx scripts/real-time-video-recorder.ts

echo ""
echo "✅ Real-time video recording completed!"
echo "🎥 This demo shows actual user interactions with the system"
echo "👤 User behavior is natural and realistic"
echo ""
echo "🎯 Next steps for video production:"
echo "   1. The recorded interactions are now ready for video editing"
echo "   2. Add professional narration using the provided scripts"
echo "   3. Include lower thirds and callouts"
echo "   4. Apply professional transitions and graphics"
echo "   5. The result will be a compelling, realistic user experience video"
echo ""
echo "🚀 The platform is now ready for realistic video production!"
echo "📹 Real user interactions captured for authentic presentation"
