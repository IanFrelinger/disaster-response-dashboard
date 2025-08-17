#!/bin/bash

# Unified Video Production Pipeline
# Supports static, live, and hybrid video generation modes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default configuration
MODE="hybrid"
INCLUDE_STATIC=true
INCLUDE_LIVE=true
LIVE_URL="http://localhost:3000"
OUTPUT_FORMAT="mp4"
QUALITY="high"

# Function to show usage
show_usage() {
    echo "🎬 Unified Video Production Pipeline"
    echo "===================================="
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE          Pipeline mode: static, live, or hybrid (default: hybrid)"
    echo "  -s, --static             Include static video segments"
    echo "  -l, --live               Include live interactive segments"
    echo "  -u, --url URL            Live demo URL (default: http://localhost:3000)"
    echo "  -f, --format FORMAT      Output format: mp4 or webm (default: mp4)"
    echo "  -q, --quality QUALITY    Video quality: high, medium, or low (default: high)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --mode static                    # Generate static videos only"
    echo "  $0 --mode live --url http://demo    # Generate live videos only"
    echo "  $0 --mode hybrid                    # Generate both static and live (default)"
    echo "  $0 --static --live                 # Explicitly enable both modes"
    echo ""
}

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

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -s|--static)
            INCLUDE_STATIC=true
            shift
            ;;
        -l|--live)
            INCLUDE_LIVE=true
            shift
            ;;
        -u|--url)
            LIVE_URL="$2"
            shift 2
            ;;
        -f|--format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate mode
if [[ "$MODE" != "static" && "$MODE" != "live" && "$MODE" != "hybrid" ]]; then
    log_error "Invalid mode: $MODE. Must be 'static', 'live', or 'hybrid'"
    exit 1
fi

# Adjust configuration based on mode
case $MODE in
    "static")
        INCLUDE_STATIC=true
        INCLUDE_LIVE=false
        log "Mode set to STATIC - generating static video segments only"
        ;;
    "live")
        INCLUDE_STATIC=false
        INCLUDE_LIVE=true
        log "Mode set to LIVE - generating live interactive segments only"
        ;;
    "hybrid")
        INCLUDE_STATIC=true
        INCLUDE_LIVE=true
        log "Mode set to HYBRID - generating both static and live segments"
        ;;
esac

# Display configuration
echo ""
log_success "Pipeline Configuration:"
echo "  Mode: $MODE"
echo "  Include Static: $INCLUDE_STATIC"
echo "  Include Live: $INCLUDE_LIVE"
echo "  Live URL: $LIVE_URL"
echo "  Output Format: $OUTPUT_FORMAT"
echo "  Quality: $QUALITY"
echo ""

# Check prerequisites
log "Checking prerequisites..."
if ! command -v ffmpeg &> /dev/null; then
    log_error "FFmpeg is not available. Please install it first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_error "Node.js is not available. Please install it first."
    exit 1
fi

if ! command -v npx &> /dev/null; then
    log_error "npx is not available. Please install it first."
    exit 1
fi

log_success "All prerequisites are available"

# Check if we're in the right directory
if [[ ! -f "scripts/run-unified-pipeline.ts" ]]; then
    log_error "Please run this script from the video-production directory"
    exit 1
fi

# Run the unified pipeline
log "Starting unified video production pipeline..."
log_tech "Executing: npx ts-node scripts/run-unified-pipeline.ts"

# Create a temporary configuration file
cat > temp_config.json << EOF
{
  "mode": "$MODE",
  "includeStatic": $INCLUDE_STATIC,
  "includeLive": $INCLUDE_LIVE,
  "liveUrl": "$LIVE_URL",
  "outputFormat": "$OUTPUT_FORMAT",
  "quality": "$QUALITY"
}
EOF

# Run the pipeline
if npx ts-node scripts/run-unified-pipeline.ts; then
    log_success "Unified pipeline completed successfully!"
    
    # Show output summary
    echo ""
    log_success "Pipeline Outputs:"
    if [[ -f "output/final_unified_demo.mp4" ]]; then
        echo "  🎬 Final Video: output/final_unified_demo.mp4"
        file_size=$(du -h "output/final_unified_demo.mp4" | cut -f1)
        echo "  📊 File Size: $file_size"
    fi
    
    if [[ -f "output/unified_pipeline_summary.json" ]]; then
        echo "  📋 Summary: output/unified_pipeline_summary.json"
    fi
    
    echo ""
    log_success "🎉 Video production pipeline completed successfully!"
    
else
    log_error "Pipeline failed. Check the output above for details."
    exit 1
fi

# Cleanup
rm -f temp_config.json

echo ""
log_success "Pipeline execution completed!"
