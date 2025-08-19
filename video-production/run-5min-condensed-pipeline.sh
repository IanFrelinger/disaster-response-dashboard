#!/bin/bash

# 5-Minute Condensed Technical Video Production Pipeline
# This script creates a focused, technically deep demo video

set -e  # Exit on any error

echo "🎬 5-Minute Condensed Technical Video Production Pipeline"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_tech() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

# Step 1: Check prerequisites
echo "Step 1: Checking Prerequisites"
echo "-------------------------------"
log "Checking if FFmpeg is available..."
if command -v ffmpeg &> /dev/null; then
    log_success "FFmpeg is available"
else
    log_error "FFmpeg is not available. Please install it first."
    exit 1
fi

log "Checking if Node.js and ts-node are available..."
if command -v node &> /dev/null && command -v npx &> /dev/null; then
    log_success "Node.js and npx are available"
else
    log_error "Node.js or npx are not available. Please install them first."
    exit 1
fi

log "Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log_success "Frontend is running on localhost:3000"
else
    log_warning "Frontend is not running on localhost:3000"
    log "Please start the frontend before running this pipeline"
    log "You can start it with: cd ../frontend && npm run dev"
    exit 1
fi

echo ""

# Step 2: Generate 5-minute condensed video segments
echo "Step 2: Generating 5-Minute Condensed Video Segments"
echo "----------------------------------------------------"
log_tech "Starting condensed video generation with focused content..."
if npx ts-node scripts/generate-5min-condensed.ts; then
    log_success "5-minute condensed video segments generated successfully"
else
    log_error "Failed to generate 5-minute condensed video segments"
    exit 1
fi

echo ""

# Step 3: Assemble 5-minute condensed video
echo "Step 3: Assembling 5-Minute Condensed Video"
echo "--------------------------------------------"
log_tech "Starting 5-minute condensed video assembly..."
if npx ts-node scripts/assemble-5min-condensed.ts; then
    log_success "5-minute condensed video assembled successfully"
else
    log_error "Failed to assemble 5-minute condensed video"
    exit 1
fi

echo ""

# Step 4: Generate condensed pipeline summary
echo "Step 4: Condensed Pipeline Summary"
echo "----------------------------------"
log_tech "Generating comprehensive condensed summary..."

# Check outputs
if [ -f "output/final_5min_condensed_demo.mp4" ]; then
    log_success "Final 5-minute condensed video: output/final_5min_condensed_demo.mp4"
    
    # Get file size
    file_size=$(du -h "output/final_5min_condensed_demo.mp4" | cut -f1)
    log_tech "File size: $file_size"
    
    # Get duration using ffprobe
    if command -v ffprobe &> /dev/null; then
        duration=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "output/final_5min_condensed_demo.mp4" 2>/dev/null)
        if [ ! -z "$duration" ]; then
            duration_min=$(echo "scale=1; $duration/60" | bc -l 2>/dev/null || echo "unknown")
            log_tech "Duration: ${duration_min} minutes"
        fi
    fi
else
    log_error "5-minute condensed video not found"
    exit 1
fi

if [ -f "output/5min_condensed_assembly_summary.json" ]; then
    log_success "Condensed assembly summary: output/5min_condensed_assembly_summary.json"
fi

if [ -f "output/video_list_5min_condensed.txt" ]; then
    log_success "Condensed video list: output/video_list_5min_condensed.txt"
fi

# Check individual segments
echo ""
log_tech "Checking 5-minute condensed video segments..."
segment_count=0
for i in {01..10}; do
    segment_file="captures/${i}_*.webm"
    if ls $segment_file 1> /dev/null 2>&1; then
        segment_count=$((segment_count + 1))
        log_success "Segment $i found"
    else
        log_warning "Segment $i missing"
    fi
done

log_tech "Total segments found: $segment_count/10"

echo ""
echo "🎉 5-Minute Condensed Pipeline completed successfully!"
echo "======================================================"
echo ""
echo "Condensed Video Output:"
echo "  - Final video: output/final_5min_condensed_demo.mp4"
echo "  - Video segments: captures/*.webm"
echo "  - Condensed summary: output/5min_condensed_assembly_summary.json"
echo "  - Video list: output/video_list_5min_condensed.txt"
echo ""
echo "Condensed Content Highlights:"
echo "  🔧 Personal introduction and mission (15s)"
echo "  🔧 User persona definition (20s)"
echo "  🔧 Technical architecture & Foundry integration (40s)"
echo "  🔧 Platform capabilities & hazard interaction (40s)"
echo "  🔧 Dynamic zone management & building status (30s)"
echo "  🔧 AI-powered routing (30s)"
echo "  🔧 AI decision support (30s)"
echo "  🔧 Service layer, reliability & security (40s)"
echo "  🔧 Integration & performance (30s)"
echo "  🔧 Impact & call to action (25s)"
echo ""
echo "The focused 5-minute condensed technical demo video is ready for use!"
echo "This version provides essential technical insights in a concise format."
