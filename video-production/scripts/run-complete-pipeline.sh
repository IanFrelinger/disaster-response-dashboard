#!/bin/bash

# Complete Demo Video Pipeline Runner
# This script runs the full pipeline: record actions, generate VO, assemble video

set -e

echo "🎬 Complete Demo Video Pipeline"
echo "================================"
echo ""
echo "This will create a complete 5:40 demo video with:"
echo "• Screen recording with precise interactions"
echo "• AI-generated voice-over narration"
echo "• Synchronized audio/video assembly"
echo "• Professional final output"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Check if the app is running
echo "🔍 Checking if the disaster response app is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Warning: App doesn't appear to be running on localhost:3000"
    echo "   Please start the frontend app first:"
    echo "   cd ../frontend && npm run dev"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check for required tools
echo "🔧 Checking required tools..."
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is required but not installed"
    echo "   Install with: brew install ffmpeg (macOS) or apt install ffmpeg (Ubuntu)"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is required but not installed"
    exit 1
fi

# Check Python dependencies
echo "🐍 Checking Python dependencies..."
if ! python3 -c "import yaml" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip3 install pyyaml python-dotenv
fi

# Create necessary directories
echo "📁 Creating output directories..."
mkdir -p output captures audio/vo

echo ""
echo "🚀 Starting complete video production pipeline..."
echo "   This will take approximately 8-10 minutes to complete"
echo "   The browser will open and execute the precise timeline"
echo ""

# Run the complete pipeline
npx tsx scripts/complete-demo-pipeline.ts

echo ""
echo "✅ Complete pipeline finished successfully!"
echo "📹 Final video ready in output/ directory"
echo ""

# List output files
if [ -d "output" ]; then
    echo "📁 Generated files:"
    ls -la output/
fi

# Show final video info
if [ -f "output/complete-demo-final.mp4" ]; then
    echo ""
    echo "🎬 Final video details:"
    ls -lh output/complete-demo-final.mp4
    
    # Get video duration
    duration=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 output/complete-demo-final.mp4 2>/dev/null || echo "unknown")
    echo "⏱️  Duration: ${duration}s"
fi

echo ""
echo "🎉 Complete demo video production finished!"
echo "📹 Ready for review and submission"
