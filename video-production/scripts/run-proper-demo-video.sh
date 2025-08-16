#!/bin/bash

# Proper Demo Video Creation Script
# This script creates a 5-minute demonstration video showing the actual application

set -e

echo "🎬 Starting Proper Demo Video Creation"
echo "📹 This will create a 5-minute demonstration with real product interactions"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the video-production directory"
    exit 1
fi

# Check dependencies
echo "🔍 Checking dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed"
    echo "Please install ffmpeg: brew install ffmpeg (macOS) or apt-get install ffmpeg (Ubuntu)"
    exit 1
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Check if frontend is running
echo "🌐 Checking if frontend is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Warning: Frontend is not running on http://localhost:3000"
    echo "Please start the frontend with: cd ../frontend && npm start"
    echo "Continuing anyway - the script will show overlays if frontend is not available..."
fi

# Check if backend is running
echo "🔧 Checking if backend is running..."
if ! curl -s http://localhost:5000 > /dev/null; then
    echo "⚠️  Warning: Backend is not running on http://localhost:5000"
    echo "Please start the backend with: cd ../backend && python -m flask run"
    echo "Continuing anyway - the script will show overlays if backend is not available..."
fi

# Create output directory
echo "📁 Creating output directory..."
mkdir -p output

# Run the proper demo video creation
echo "🎬 Running proper demo video creation..."
echo "This will take approximately 5 minutes to record..."
echo ""

npx tsx scripts/create-proper-demo-video.ts

echo ""
echo "✅ Proper demo video creation completed!"
echo ""
echo "📹 Output files:"
echo "   • output/proper-demo-video-final.mp4 - Final 5-minute demonstration video"
echo ""
echo "🎯 This video includes:"
echo "   • Introduction and problem statement (30s)"
echo "   • Commander Dashboard demonstration (45s)"
echo "   • Live Map with hazard interactions (60s)"
echo "   • AI Support system (45s)"
echo "   • Technical architecture overview (45s)"
echo "   • Conclusion and call to action (45s)"
echo ""
echo "🎬 Total duration: 5 minutes"
echo ""
echo "📋 The video demonstrates:"
echo "   • Real application navigation"
echo "   • Dashboard interactions"
echo "   • Map layer toggles"
echo "   • Hazard detection and analysis"
echo "   • AI recommendations"
echo "   • Technical architecture"
echo "   • Professional callouts and overlays"
echo ""
echo "🎉 Ready for submission!"
