#!/bin/bash

# Simple Presentation Recorder Script
# This script runs a simple presentation recording without TTS complexity

set -e

echo "🎬 Disaster Response Dashboard - Simple Presentation Recorder"
echo "============================================================="

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

# Create output directory
mkdir -p captures

# Run the simple presentation recorder
echo "🚀 Starting simple presentation recording..."
echo "   This will:"
echo "   - Open a browser window and record the presentation interactions"
echo "   - Create screenshots for each section"
echo "   - Total duration: ~4 minutes"
echo "   - No text-to-speech (simplified version)"
echo ""

tsx scripts/simple-presentation-recorder.ts

echo ""
echo "✅ Simple presentation recording finished!"
echo "📁 Check the 'captures' directory for recorded videos and screenshots"
echo "📊 Check 'captures/simple-presentation-report.json' for detailed results"
echo ""
echo "🎬 Next Steps:"
echo "1. Review the recorded video in the captures directory"
echo "2. Add text-to-speech narration separately if needed"
echo "3. Use video editing software to combine video and audio"
echo "4. Add any additional graphics or overlays as needed"
