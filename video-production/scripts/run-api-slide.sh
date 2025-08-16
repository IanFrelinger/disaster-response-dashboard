#!/bin/bash

# API Slide Creation Script
# Creates a static slide showing API endpoint information

set -e

echo "📊 Creating API Endpoints Information Slide"
echo "=========================================="
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

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Create output directory
echo "📁 Creating output directory..."
mkdir -p output

# Run the API slide creation
echo "🎨 Generating API endpoints slide..."
echo "This will create a comprehensive slide showing all API endpoints and technical details"
echo ""

npx tsx scripts/create-api-slide.ts

echo ""
echo "✅ API slide creation completed!"
echo ""
echo "📄 Output files:"
echo "   • output/api_endpoints_slide.html - Interactive HTML slide"
echo "   • output/api_endpoints_slide.png - Screenshot of the slide"
echo ""
echo "🎯 Slide features:"
echo "   • Complete API endpoint documentation"
echo "   • Technical architecture overview"
echo "   • Data flow pipeline visualization"
echo "   • Foundry integration details"
echo "   • ML and AI capabilities"
echo "   • Performance specifications"
echo ""
echo "📋 The slide includes:"
echo "   • 16+ API endpoints with descriptions"
echo "   • Technical architecture components"
echo "   • Data flow from ingestion to delivery"
echo "   • Foundry integration highlights"
echo "   • Real-time processing capabilities"
echo "   • Spatial indexing and ML features"
echo ""
echo "🎉 Ready for use in presentations!"
