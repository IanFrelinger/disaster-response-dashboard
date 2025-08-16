#!/bin/bash

# Detailed Demo Video Runner
# This script runs the precise 5:40 demo timeline with exact interactions

set -e

echo "🎬 Disaster Response - Detailed Demo Video Creator"
echo "=================================================="
echo ""
echo "This will create a 5:40 demo video with exact step-by-step interactions"
echo "Resolution: 1920x1080, 30fps, 110% zoom for readability"
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

# Create output directory
mkdir -p output

echo ""
echo "🚀 Starting detailed demo video creation..."
echo "   This will take approximately 6 minutes to complete"
echo "   The browser will open and execute the precise timeline"
echo ""

# Run the detailed demo script
npx tsx scripts/playwright-detailed-demo.ts

echo ""
echo "✅ Detailed demo video creation completed!"
echo "📹 Check the output/ directory for the final video"
echo ""

# List output files
if [ -d "output" ]; then
    echo "📁 Generated files:"
    ls -la output/
fi

echo ""
echo "🎬 Demo video ready for review and editing!"
