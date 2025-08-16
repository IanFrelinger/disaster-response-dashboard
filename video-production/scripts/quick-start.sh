#!/bin/bash

# Enhanced Video Pipeline - Quick Start Script
# This script provides a simple way to run the enhanced video pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🎬 Enhanced Video Pipeline - Quick Start${NC}"
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command_exists node; then
    print_error "Node.js not found. Please install Node.js 18+ to continue."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi
print_status "Node.js $(node --version) found"

# Check npm
if ! command_exists npm; then
    print_error "npm not found. Please install npm to continue."
    exit 1
fi
print_status "npm $(npm --version) found"

# Check FFmpeg
if ! command_exists ffmpeg; then
    print_warning "FFmpeg not found. Video processing will fail."
    print_warning "Install FFmpeg: brew install ffmpeg (macOS) or sudo apt install ffmpeg (Ubuntu)"
else
    print_status "FFmpeg $(ffmpeg -version | head -n1 | cut -d' ' -f3) found"
fi

# Check if we're in the right directory
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    print_error "package.json not found. Please run this script from the video-production directory."
    exit 1
fi

# Install dependencies if needed
echo ""
echo "📦 Installing dependencies..."
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    npm install
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Check if Playwright browsers are installed
echo ""
echo "🌐 Checking Playwright browsers..."
if [ ! -d "$PROJECT_DIR/node_modules/.cache/ms-playwright" ]; then
    echo "Installing Playwright browsers..."
    npx playwright install chromium
    print_status "Playwright browsers installed"
else
    print_status "Playwright browsers already installed"
fi

# Check configuration
echo ""
echo "⚙️  Checking configuration..."

if [ ! -f "$PROJECT_DIR/config.env" ]; then
    print_warning "config.env not found. Creating from example..."
    if [ -f "$PROJECT_DIR/config.env.example" ]; then
        cp "$PROJECT_DIR/config.env.example" "$PROJECT_DIR/config.env"
        print_status "config.env created from example"
    else
        print_warning "config.env.example not found. Using default configuration."
    fi
else
    print_status "Configuration file found"
fi

# Check required assets
echo ""
echo "🖼️  Checking assets..."

REQUIRED_ASSETS=(
    "assets/diagrams/api_data_flow.png"
    "assets/diagrams/operational_overview.png"
    "assets/diagrams/route_concept_overlay.png"
    "assets/slides/impact_value.png"
    "assets/art/conclusion.png"
)

MISSING_ASSETS=()
for asset in "${REQUIRED_ASSETS[@]}"; do
    if [ ! -f "$PROJECT_DIR/$asset" ]; then
        MISSING_ASSETS+=("$asset")
    fi
done

if [ ${#MISSING_ASSETS[@]} -eq 0 ]; then
    print_status "All required assets found"
else
    print_warning "Some assets are missing:"
    for asset in "${MISSING_ASSETS[@]}"; do
        echo "  - $asset"
    done
    print_warning "Video may not display correctly without these assets"
fi

# Check if app is running
echo ""
echo "🌐 Checking if target application is running..."

APP_URL=$(grep "^APP_URL=" "$PROJECT_DIR/config.env" 2>/dev/null | cut -d'=' -f2 || echo "http://localhost:3000")

if curl -s "$APP_URL" > /dev/null 2>&1; then
    print_status "Target application is accessible at $APP_URL"
else
    print_warning "Target application is not accessible at $APP_URL"
    print_warning "Please start your application before running the pipeline"
fi

# Create output directory
echo ""
echo "📁 Setting up output directory..."
OUTPUT_DIR=$(grep "^OUTPUT_DIR=" "$PROJECT_DIR/config.env" 2>/dev/null | cut -d'=' -f2 || echo "./output")
mkdir -p "$PROJECT_DIR/$OUTPUT_DIR"
print_status "Output directory ready: $OUTPUT_DIR"

# Menu for pipeline selection
echo ""
echo "🎯 Choose your pipeline:"
echo "1) Enhanced Demo Video Pipeline (Recommended)"
echo "2) Production Pipeline"
echo "3) Test Suite"
echo "4) Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Enhanced Demo Video Pipeline..."
        echo "This will create a professional demo video with overlays and effects."
        echo "Duration: ~5 minutes"
        echo ""
        read -p "Press Enter to continue..."
        
        cd "$PROJECT_DIR"
        npx tsx scripts/create-proper-demo-video.ts
        ;;
    2)
        echo ""
        echo "🏭 Starting Production Pipeline..."
        echo "This will create a production-quality video with monitoring and reporting."
        echo "Duration: ~5 minutes"
        echo ""
        read -p "Press Enter to continue..."
        
        cd "$PROJECT_DIR"
        npx tsx scripts/run-production-pipeline.ts
        ;;
    3)
        echo ""
        echo "🧪 Running Test Suite..."
        echo "This will validate all pipeline components."
        echo ""
        read -p "Press Enter to continue..."
        
        cd "$PROJECT_DIR"
        npx tsx scripts/test-enhanced-pipeline.ts
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Pipeline execution completed!"
echo ""
echo "📁 Output files are in: $OUTPUT_DIR"
echo "📊 Check test-results/ for detailed reports"
echo ""
echo "📚 For more information, see: ENHANCED_PIPELINE_README.md"
echo ""
echo "Happy video creation! 🎬"
