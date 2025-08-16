#!/bin/bash

# Enhanced Timeline 3 Video Creation Script
# Uses both live interactions and VideoPresentation assets

set -e

echo "🎬 Enhanced Timeline 3 Video Creation"
echo "======================================"
echo "This script creates a video using:"
echo "- Timeline from timeline-3.yaml"
echo "- VideoPresentation assets when available"
echo "- Live frontend interactions as fallback"
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
    echo "Will use live interactions only"
else
    echo "✅ Found VideoPresentation folder with assets"
fi

# Check if frontend is running
echo "🌐 Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "⚠️  Warning: Frontend not running on http://localhost:3000"
    echo "Live interactions will be limited"
fi

# Check dependencies
echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg not found"
    echo "Please install ffmpeg for video generation"
    exit 1
fi

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Create output directory
mkdir -p output

echo ""
echo "🚀 Starting enhanced video creation..."
echo ""

# Run the enhanced timeline video creation
npx tsx scripts/create-timeline-3-video-enhanced.ts

echo ""
echo "✅ Enhanced Timeline 3 video creation completed!"
echo ""
echo "📁 Output files:"
echo "   - output/timeline-3-enhanced-final.mp4 (final video)"
echo "   - output/*.webm (individual segments)"
echo "   - output/*.png (fallback screenshots)"
echo ""
echo "🎬 The enhanced video combines:"
echo "   - VideoPresentation assets for professional visuals"
echo "   - Live frontend interactions for dynamic content"
echo "   - Timeline-3.yaml for precise timing and narration"
echo ""
echo "📊 Video details:"
echo "   - Duration: ~2:07 (127 seconds)"
echo "   - Resolution: 1920x1080"
echo "   - FPS: 30"
echo ""
