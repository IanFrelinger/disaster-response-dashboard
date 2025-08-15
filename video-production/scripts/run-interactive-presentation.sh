#!/bin/bash

# Interactive Presentation Recorder Script
# This script runs an interactive presentation recording with real UI interactions

set -e

echo "🎬 Disaster Response Dashboard - Interactive Presentation Recorder"
echo "=================================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Check if frontend is running
echo "🔍 Checking if frontend is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Warning: Frontend doesn't appear to be running on localhost:3000"
    echo "   You may need to start the frontend first:"
    echo "   cd ../frontend && npm run dev"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if required dependencies are installed
echo "🔍 Checking dependencies..."
if ! command -v tsx &> /dev/null; then
    echo "❌ Error: tsx is not installed. Please install it:"
    echo "   npm install -g tsx"
    exit 1
fi

# Check if macOS say command is available (for TTS)
if ! command -v say &> /dev/null; then
    echo "⚠️  Warning: macOS 'say' command not found. TTS may not work."
    echo "   This script uses macOS built-in text-to-speech."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create output directories
mkdir -p captures
mkdir -p audio

# Run the interactive presentation recorder
echo "🚀 Starting interactive presentation recording..."
echo "   This will:"
echo "   - Open a browser window and record real UI interactions"
echo "   - Demonstrate the complete golden path with actual clicks and actions"
echo "   - Show hazard detection, zone drawing, route planning, unit assignment"
echo "   - Generate text-to-speech audio for each beat"
echo "   - Create screenshots for each section"
echo "   - Total duration: ~4 minutes"
echo ""

tsx scripts/interactive-presentation-recorder.ts

echo ""
echo "✅ Interactive presentation recording finished!"
echo "📁 Check the 'captures' directory for recorded videos and screenshots"
echo "🎤 Check the 'audio' directory for generated TTS audio files"
echo "📊 Check 'captures/interactive-presentation-report.json' for detailed results"
echo ""
echo "🎬 Next Steps:"
echo "1. Review the recorded interactive video in the captures directory"
echo "2. Check the generated audio files in the audio directory"
echo "3. Use video editing software to combine video and audio"
echo "4. Add any additional graphics or overlays as needed"
