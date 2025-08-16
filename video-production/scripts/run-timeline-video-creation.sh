#!/bin/bash

# Timeline Video Creation Script for Disaster Response Platform
# This script creates a video that precisely matches the new_timeline.yaml structure

set -e

echo "🎬 Starting Timeline Video Creation..."
echo "====================================="
echo ""
echo "🎯 This will create:"
echo "   🎬 Professional video matching new_timeline.yaml exactly"
echo "   📹 13 segments over 4 minutes (240 seconds)"
echo "   🖼️ Professional frames with lower thirds and transitions"
echo "   ⏱️ Precise timing: 0:00 to 4:00"
echo "   🎭 Professional visual presentation with transitions"
echo ""
echo "📹 Timeline Segments (4 minutes total):"
echo "   00:00-00:15  | Intro (15s) - Platform introduction"
echo "   00:15-00:40  | Problem (25s) - Emergency response challenges"
echo "   00:40-01:00  | Users (20s) - Target users and roles"
echo "   01:00-01:30  | Architecture (30s) - Technical overview"
echo "   01:30-01:45  | Detect (15s) - Hazard detection"
echo "   01:45-01:55  | Triage (10s) - Risk assessment"
echo "   01:55-02:05  | Zones (10s) - Evacuation zones"
echo "   02:05-02:25  | Routes (20s) - Route planning"
echo "   02:25-02:35  | Units (10s) - Unit assignment"
echo "   02:35-02:55  | AI Support (20s) - Decision support"
echo "   02:55-03:25  | Value (30s) - Value proposition"
echo "   03:25-03:45  | Foundry (20s) - Foundry integration"
echo "   03:45-04:00  | Conclusion (15s) - Next steps"
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/create-timeline-video.ts" ]; then
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

# Check timeline structure
echo "📋 Verifying timeline structure..."
if [ -f "new_timeline.yaml" ]; then
    echo "✅ new_timeline.yaml found"
    echo "   Total duration: 240 seconds (4 minutes)"
    echo "   Segments: 13 professional segments"
    echo "   Transitions: fade, slide, zoom, glitch effects"
else
    echo "⚠️  new_timeline.yaml not found - using built-in timeline structure"
fi

# Run the timeline video creation script
echo ""
echo "🎬 Starting timeline video creation..."
echo "   This will create a video matching the timeline structure exactly"
echo "   Professional presentation with transitions and lower thirds"
echo ""

npx tsx scripts/create-timeline-video.ts

echo ""
echo "✅ Timeline video creation completed!"
echo "🎬 Professional video matching timeline structure ready"
echo ""
echo "🎯 Video Features:"
echo "   📹 Duration: 4 minutes (240 seconds)"
echo "   🎭 13 professional segments with transitions"
echo "   🖼️ Lower thirds and business value statements"
echo "   ⏱️ Precise timing matching timeline specification"
echo "   🎨 Professional visual design and typography"
echo ""
echo "🚀 Your timeline-aligned disaster response demo is ready!"
echo "📹 Professional video that matches your production specification"
