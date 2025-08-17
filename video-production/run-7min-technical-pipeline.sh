#!/bin/bash

# 7-Minute Technical Video Production Pipeline
# This script creates a comprehensive, technically focused demo video

set -e  # Exit on any error

echo "🎬 7-Minute Technical Video Production Pipeline"
echo "================================================"
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

log "Checking if HTML captures exist..."
if [ -d "captures" ] && [ "$(ls -A captures/*.html 2>/dev/null | wc -l)" -gt 0 ]; then
    log_success "HTML captures found"
else
    log_error "No HTML captures found. Please generate them first."
    exit 1
fi

echo ""

# Step 2: Generate 7-minute technical video segments
echo "Step 2: Generating 7-Minute Technical Video Segments"
echo "---------------------------------------------------"
log_tech "Starting technical video generation with extended content..."
if npx ts-node scripts/generate-7min-technical.ts; then
    log_success "7-minute technical video segments generated successfully"
else
    log_error "Failed to generate 7-minute technical video segments"
    exit 1
fi

echo ""

# Step 3: Assemble 7-minute technical video
echo "Step 3: Assembling 7-Minute Technical Video"
echo "--------------------------------------------"
log_tech "Starting 7-minute technical video assembly..."
if npx ts-node scripts/assemble-7min-technical.ts; then
    log_success "7-minute technical video assembled successfully"
else
    log_error "Failed to assemble 7-minute technical video"
    exit 1
fi

echo ""

# Step 4: Generate technical pipeline summary
echo "Step 4: Technical Pipeline Summary"
echo "----------------------------------"
log_tech "Generating comprehensive technical summary..."

# Check outputs
if [ -f "output/final_7min_technical_demo.mp4" ]; then
    log_success "Final 7-minute technical video: output/final_7min_technical_demo.mp4"
    
    # Get file size
    file_size=$(du -h "output/final_7min_technical_demo.mp4" | cut -f1)
    log_tech "File size: $file_size"
    
    # Get duration using ffprobe
    if command -v ffprobe &> /dev/null; then
        duration=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "output/final_7min_technical_demo.mp4" 2>/dev/null)
        if [ ! -z "$duration" ]; then
            duration_min=$(echo "scale=1; $duration/60" | bc -l 2>/dev/null || echo "unknown")
            log_tech "Duration: ${duration_min} minutes"
        fi
    fi
else
    log_error "7-minute technical video not found"
    exit 1
fi

if [ -f "output/7min_technical_assembly_summary.json" ]; then
    log_success "Technical assembly summary: output/7min_technical_assembly_summary.json"
fi

if [ -f "output/video_list_7min_technical.txt" ]; then
    log_success "Technical video list: output/video_list_7min_technical.txt"
fi

# Check individual segments
echo ""
log_tech "Checking 7-minute technical video segments..."
segment_count=0
for i in {01..10}; do
    segment_file="out/${i}_*_7min.mp4"
    if ls $segment_file 1> /dev/null 2>&1; then
        segment_count=$((segment_count + 1))
        log_success "Segment $i found"
    else
        log_warning "Segment $i missing"
    fi
done

log_tech "Total segments found: $segment_count/10"

echo ""
echo "🎉 7-Minute Technical Pipeline completed successfully!"
echo "======================================================"
echo ""
echo "Technical Video Output:"
echo "  - Final video: output/final_7min_technical_demo.mp4"
echo "  - Video segments: out/*_7min.mp4"
echo "  - Technical summary: output/7min_technical_assembly_summary.json"
echo "  - Video list: output/video_list_7min_technical.txt"
echo ""
echo "Technical Content Highlights:"
echo "  🔧 Personal introduction and mission statement"
echo "  🔧 User persona definition and technical requirements"
echo "  🔧 Foundry platform architecture deep dive (60s)"
echo "  🔧 Platform capabilities and feature overview"
echo "  🔧 Hazard management system details"
echo "  🔧 Evacuation routing algorithms"
echo "  🔧 AI decision support systems"
echo "  🔧 Technical implementation details"
echo "  🔧 Integration scenarios and deployment"
echo "  🔧 Strong technical call-to-action"
echo ""
echo "The comprehensive 7-minute technical demo video is ready for use!"
echo "This version provides deep technical insights for technical audiences."
