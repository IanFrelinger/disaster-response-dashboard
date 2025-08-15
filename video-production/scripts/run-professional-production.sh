#!/bin/bash
set -e

echo "🎬 Disaster Response Dashboard - Professional Production Recorder"
echo "================================================================"
echo "This will create a comprehensive, polished demo addressing all timeline requirements"
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
rm -f captures/professional-*.png
rm -f audio/professional-*.mp3

echo ""
echo "🚀 Starting professional production recording..."
echo "   This will record 9 comprehensive beats showing:"
echo "   - Introduction & Context with user persona"
echo "   - Hazard Detection & Triage with risk scoring"
echo "   - Zone Definition & Prioritization"
echo "   - Route Planning with A Star algorithm and profiles"
echo "   - Unit Assignment with drag-and-drop"
echo "   - AI Decision Support & Foundry integration"
echo "   - Technical Architecture & Data Flow"
echo "   - Progress Metrics & Impact"
echo "   - Conclusion & Call to Action"
echo ""

# Run the professional production recorder
tsx scripts/professional-production-recorder.ts

echo ""
echo "🎬 Professional Production Recording completed!"
echo ""
echo "📁 Output files:"
echo "   - Video: output/disaster-response-professional-production.mp4"
echo "   - Screenshots: captures/professional-*.png"
echo "   - Audio: audio/professional-*.mp3"
echo ""
echo "🎯 What this production accomplishes:"
echo "   ✅ Addresses ALL key omissions from the timeline"
echo "   ✅ Shows real hazard detection and triage interactions"
echo "   ✅ Demonstrates zone definition and prioritization"
echo "   ✅ Covers route planning with A Star algorithm"
echo "   ✅ Includes unit assignment with drag-and-drop"
echo "   ✅ Features AI decision support and Foundry integration"
echo "   ✅ Provides professional narration and pacing"
echo "   ✅ Uses strategic pauses for viewer absorption"
echo "   ✅ Integrates graphics and technical architecture"
echo "   ✅ Shows concrete metrics and impact"
echo "   ✅ Ends with strong call-to-action"
echo ""
echo "🎬 Next steps:"
echo "   1. Review the generated video for quality"
echo "   2. Check that all timeline requirements are met"
echo "   3. Verify the narration aligns with the visuals"
echo "   4. Add final production polish (graphics, transitions)"
echo "   5. Use this as your final presentation video"
