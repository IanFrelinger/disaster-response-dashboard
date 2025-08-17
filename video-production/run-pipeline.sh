#!/bin/bash

# Disaster Response Video Production Pipeline
# This script runs the complete pipeline step by step

set -e  # Exit on any error

echo "🎬 Disaster Response Video Production Pipeline"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log "Checking if HTML captures exist..."
if [ -d "captures" ] && [ "$(ls -A captures/*.html 2>/dev/null | wc -l)" -gt 0 ]; then
    log_success "HTML captures found"
else
    log_error "No HTML captures found. Please generate them first."
    exit 1
fi

echo ""

# Step 2: Generate video segments
echo "Step 2: Generating Video Segments"
echo "---------------------------------"
log "Starting video generation from HTML captures..."
if npx ts-node scripts/generate-video-simple.ts; then
    log_success "Video segments generated successfully"
else
    log_error "Failed to generate video segments"
    exit 1
fi

echo ""

# Step 3: Assemble final video
echo "Step 3: Assembling Final Video"
echo "-------------------------------"
log "Starting video assembly..."
if npx ts-node scripts/assemble-final-video.ts; then
    log_success "Final video assembled successfully"
else
    log_error "Failed to assemble final video"
    exit 1
fi

echo ""

# Step 4: Generate summary
echo "Step 4: Pipeline Summary"
echo "------------------------"
log "Generating pipeline summary..."

# Check outputs
if [ -f "output/final_enhanced_demo.mp4" ]; then
    log_success "Final video: output/final_enhanced_demo.mp4"
    
    # Get file size
    file_size=$(du -h "output/final_enhanced_demo.mp4" | cut -f1)
    log "File size: $file_size"
    
    # Get duration using ffprobe
    if command -v ffprobe &> /dev/null; then
        duration=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "output/final_enhanced_demo.mp4" 2>/dev/null)
        if [ ! -z "$duration" ]; then
            duration_min=$(echo "scale=1; $duration/60" | bc -l 2>/dev/null || echo "unknown")
            log "Duration: ${duration_min} minutes"
        fi
    fi
else
    log_error "Final video not found"
    exit 1
fi

if [ -f "output/video_assembly_summary.json" ]; then
    log_success "Assembly summary: output/video_assembly_summary.json"
fi

if [ -f "output/pipeline_summary.json" ]; then
    log_success "Pipeline summary: output/pipeline_summary.json"
fi

echo ""
echo "🎉 Pipeline completed successfully!"
echo "=================================="
echo ""
echo "Output files:"
echo "  - Final video: output/final_enhanced_demo.mp4"
echo "  - Video segments: out/*.mp4"
echo "  - Assembly summary: output/video_assembly_summary.json"
echo ""
echo "The enhanced demo video is ready for use!"
