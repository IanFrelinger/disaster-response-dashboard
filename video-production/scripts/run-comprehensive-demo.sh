#!/bin/bash

# Comprehensive Disaster Response Demo Runner
# This script runs the comprehensive demo recorder to showcase all features

set -e

echo "🚀 Starting Comprehensive Disaster Response Demo..."
echo "=================================================="

# Check if frontend is running
echo "📋 Checking frontend status..."
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "❌ Frontend is not running on localhost:5173"
    echo "   Please start the frontend first with: cd frontend && npm run dev"
    exit 1
fi

echo "✅ Frontend is running"

# Check if we're in the right directory
if [ ! -f "scripts/comprehensive-demo-recorder.ts" ]; then
    echo "❌ Please run this script from the video-production directory"
    exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Run the comprehensive demo recorder
echo "🎬 Starting demo recording..."
echo "   This will showcase:"
echo "   - Dashboard Overview & Zone Management"
echo "   - Weather Integration & Fire Weather Index"
echo "   - Building-Level Evacuation Tracking"
echo "   - AI Decision Support (AIP Commander)"
echo "   - Role-Based Route Planning (A* Algorithm)"
echo "   - Unit Management & Drag-and-Drop Assignment"
echo "   - Technical Architecture & Data Flow"
echo "   - Real-Time Updates & System Responsiveness"
echo ""

npx tsx scripts/comprehensive-demo-recorder.ts

echo ""
echo "✅ Comprehensive demo recording completed!"
echo "📸 Screenshots saved in: output/"
echo "🎥 Demo showcases all major features of the disaster response platform"
