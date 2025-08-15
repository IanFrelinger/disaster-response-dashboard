#!/bin/bash
set -e

echo "🎬 Disaster Response Dashboard - Realistic Production Recorder"
echo "=============================================================="
echo "This will create a realistic demo using actual UI components and interactions"
echo ""

# Check if frontend is running
echo "🔍 Checking if frontend is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend is not running on http://localhost:3000"
    echo "   Please start the frontend first with: npm run dev"
    exit 1
fi
echo "✅ Frontend is running"

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo "❌ tsx is not installed"
    echo "   Please install it with: npm install -g tsx"
    exit 1
fi
echo "✅ tsx is available"

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed"
    echo "   Please install it with: brew install ffmpeg"
    exit 1
fi
echo "✅ ffmpeg is available"

# Create output directories
echo "📁 Creating output directories..."
mkdir -p output captures

# Clean up any old files
echo "🧹 Cleaning up old files..."
rm -f output/*.webm output/*.mp4
rm -f captures/realistic-*.png

echo ""
echo "🚀 Starting realistic production recording..."
echo "   This will record 7 realistic beats showing:"
echo "   - Introduction & Dashboard Overview"
echo "   - Zone Management & Interactive Cards"
echo "   - Live Map with Hazard Visualization"
echo "   - Map Interaction & Hazard Investigation"
echo "   - Dashboard Return & Status Updates"
echo "   - Navigation & View Switching"
echo "   - Conclusion & System Capabilities"
echo ""

# Run the realistic production recorder
tsx scripts/realistic-production-recorder.ts

echo ""
echo "🎬 Realistic Production Recording completed!"
echo ""
echo "📁 Output files:"
echo "   - Video: output/disaster-response-realistic-production.mp4"
echo "   - Screenshots: captures/realistic-*.png"
echo ""
echo "🎯 What this production accomplishes:"
echo "   ✅ Uses actual UI components that exist in the application"
echo "   ✅ Shows real interactions with zone cards and map layers"
echo "   ✅ Demonstrates navigation between dashboard and map views"
echo "   ✅ Includes strategic pauses for viewer absorption"
echo "   ✅ Provides professional narration for each beat"
echo "   ✅ Captures realistic workflow and user experience"
echo "   ✅ Shows the system's actual capabilities and value"
echo ""
echo "🎬 Next steps:"
echo "   1. Review the generated video for quality and flow"
echo "   2. Check that all interactions work smoothly"
echo "   3. Verify the narration aligns with the visuals"
echo "   4. Use this as your foundation for final production"
echo "   5. Add graphics, transitions, and final polish as needed"
