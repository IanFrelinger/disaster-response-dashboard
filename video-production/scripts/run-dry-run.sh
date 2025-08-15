#!/bin/bash

# Dry Run Recorder Script
# This script runs a dry run of the presentation recording without text-to-speech

set -e

echo "🎬 Disaster Response Dashboard - Dry Run Recorder"
echo "=================================================="

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

# Create captures directory if it doesn't exist
mkdir -p captures

# Run the dry run recorder
echo "🚀 Starting dry run recording..."
echo "   This will open a browser window and record the presentation interactions"
echo "   No text-to-speech will be generated"
echo ""

tsx scripts/dry-run-recorder.ts

echo ""
echo "✅ Dry run completed!"
echo "📁 Check the 'captures' directory for recorded videos and screenshots"
echo "📊 Check 'captures/dry-run-report.json' for detailed results"
