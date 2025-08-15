#!/bin/bash
set -e

echo "🎬 Disaster Response Dashboard - Realistic Demo Recorder"
echo "========================================================"
echo "This will create a comprehensive demo video using real UI interactions"
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

# Check if say command is available (macOS TTS)
if ! command -v say &> /dev/null; then
    echo "❌ say command is not available (macOS TTS)"
    echo "   This script requires macOS for TTS generation"
    exit 1
fi
echo "✅ say command is available"

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed"
    echo "   Please install it with: brew install ffmpeg"
    exit 1
fi
echo "✅ ffmpeg is available"

# Create output directories
echo "📁 Creating output directories..."
mkdir -p output captures audio

# Clean up any old files
echo "🧹 Cleaning up old files..."
rm -f output/*.webm output/*.mp4
rm -f captures/demo-*.png
rm -f audio/audio-*.mp3

echo ""
echo "🚀 Starting realistic demo recording..."
echo "   This will record 10 comprehensive beats showing:"
echo "   - Dashboard overview and zone status"
echo "   - Zone investigation and progress tracking"
echo "   - Tab navigation between operational views"
echo "   - Map transition and geographic visualization"
echo "   - Map layer management and controls"
echo "   - Map interaction and location selection"
echo "   - Return to dashboard for decision making"
echo "   - Operational decision making using data"
echo "   - AIP Commander AI decision support"
echo "   - Comprehensive system overview and value"
echo ""

# Run the realistic demo recorder
tsx scripts/realistic-demo-recorder.ts

echo ""
echo "🎬 Realistic Demo Recording completed!"
echo ""
echo "📁 Output files:"
echo "   - Video: output/disaster-response-realistic-demo.mp4"
echo "   - Screenshots: captures/demo-*.png"
echo "   - Audio: audio/audio-*.mp3"
echo ""
echo "🎯 What this demo accomplishes:"
echo "   ✅ Shows real UI interactions (not static screenshots)"
echo "   ✅ Demonstrates the complete golden path"
echo "   ✅ Includes professional narration for each beat"
echo "   ✅ Covers all major system capabilities"
echo "   ✅ Uses validated UI selectors and interactions"
echo "   ✅ Provides authentic user workflow demonstration"
echo ""
echo "🎬 Next steps:"
echo "   1. Review the generated video for quality"
echo "   2. Check that all interactions are captured properly"
echo "   3. Verify the narration aligns with the visuals"
echo "   4. Use this as the foundation for your final presentation"
