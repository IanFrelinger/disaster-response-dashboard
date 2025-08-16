#!/bin/bash

# Demo Video Creation Script for Disaster Response Platform
# This script creates a professional video combining screenshots and narration

set -e

echo "🎬 Starting Demo Video Creation..."
echo "=================================="
echo ""
echo "🎯 This will create:"
echo "   🎬 Professional demo video with narration"
echo "   📹 7 segments with exact timing"
echo "   🖼️ Screenshots and text overlays"
echo "   ⏱️ Total duration: 117 seconds (~2 minutes)"
echo "   🎭 Professional visual presentation"
echo ""
echo "📹 Video Segments:"
echo "   1. Discovery (15s) - Platform introduction"
echo "   2. Operations Exploration (20s) - Evacuation zones"
echo "   3. Weather Integration (18s) - Risk assessment"
echo "   4. Asset Management (16s) - Building data"
echo "   5. AI Experience (22s) - Decision support"
echo "   6. Live Map Exploration (14s) - Geographic features"
echo "   7. Comprehensive Overview (12s) - Final summary"
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/create-demo-video.ts" ]; then
    echo "❌ Please run this script from the video-production directory"
    exit 1
fi

# Check for required tools
echo "🔧 Checking required tools..."

# Check for FFmpeg
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg found: $(ffmpeg -version | head -n1)"
else
    echo "⚠️  FFmpeg not found - will use fallback methods"
    echo "   Install FFmpeg for best video quality:"
    echo "   brew install ffmpeg  # macOS"
    echo "   sudo apt install ffmpeg  # Ubuntu/Debian"
fi

# Check for ImageMagick (fallback)
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick found: $(convert -version | head -n1)"
else
    echo "⚠️  ImageMagick not found - limited fallback options"
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

# Check for available screenshots
echo "🖼️ Checking available screenshots..."
screenshot_count=$(find output -name "*.png" | wc -l | tr -d ' ')
echo "   Found $screenshot_count screenshot files"

if [ $screenshot_count -eq 0 ]; then
    echo "⚠️  No screenshots found - will create text-based video"
    echo "   This will still create a professional presentation"
else
    echo "✅ Screenshots available for video creation"
fi

# Run the video creation script
echo ""
echo "🎬 Starting video creation..."
echo "   This will combine screenshots and narration text"
echo "   Creating professional demo video..."
echo ""

npx tsx scripts/create-demo-video.ts

echo ""
echo "✅ Video creation completed!"
echo "🎬 Professional demo video ready for distribution"
echo ""
echo "🎯 Next steps:"
echo "   1. Review the created video in output/"
echo "   2. Add professional voiceover if desired"
echo "   3. Share with stakeholders and recruiters"
echo "   4. Use for presentations and demonstrations"
echo ""
echo "🚀 Your disaster response platform demo is now ready!"
echo "📹 Professional video showcasing real user interactions"
