#!/bin/bash

# Disaster Response Dashboard Demo Automation Runner
# Runs within the Docker container and integrates with the video production pipeline

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CAPTURES_DIR="$PROJECT_ROOT/captures"
OUTPUT_DIR="$PROJECT_ROOT/out"
LOGS_DIR="$PROJECT_ROOT/logs"

# Create necessary directories
mkdir -p "$CAPTURES_DIR" "$OUTPUT_DIR" "$LOGS_DIR"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if the frontend application is running
check_frontend() {
    log "Checking if frontend application is running..."
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend application is running on localhost:3000"
        return 0
    else
        error "Frontend application is not running on localhost:3000"
        error "Please start the frontend application before running the demo automation"
        return 1
    fi
}

# Function to validate environment
validate_environment() {
    log "Validating environment..."
    
    # Check if we're in the Docker container
    if [ -f /.dockerenv ]; then
        success "Running in Docker container"
    else
        warning "Not running in Docker container - some features may not work correctly"
    fi
    
    # Check for required tools
    if command -v node > /dev/null 2>&1; then
        success "Node.js is available"
    else
        error "Node.js is not available"
        return 1
    fi
    
    if command -v npx > /dev/null 2>&1; then
        success "npx is available"
    else
        error "npx is not available"
        return 1
    fi
    
    if command -v ffmpeg > /dev/null 2>&1; then
        success "FFmpeg is available"
    else
        error "FFmpeg is not available"
        return 1
    fi
    
    if command -v ffprobe > /dev/null 2>&1; then
        success "FFprobe is available"
    else
        error "FFprobe is not available"
        return 1
    fi
    
    # Check Playwright installation
    if npx playwright --version > /dev/null 2>&1; then
        success "Playwright is available"
    else
        error "Playwright is not available"
        return 1
    fi
    
    return 0
}

# Function to clean up previous recordings
cleanup_previous_recordings() {
    log "Cleaning up previous recordings..."
    
    if [ -d "$CAPTURES_DIR" ]; then
        rm -f "$CAPTURES_DIR"/*.webm "$CAPTURES_DIR"/*.mp4
        success "Previous recordings cleaned up"
    fi
    
    if [ -d "$OUTPUT_DIR" ]; then
        rm -f "$OUTPUT_DIR"/recording-validation.png "$OUTPUT_DIR"/recording-validation-report.json
        success "Previous validation files cleaned up"
    fi
}

# Function to run the demo automation
run_demo_automation() {
    log "Starting demo automation..."
    
    cd "$PROJECT_ROOT"
    
    # Run the TypeScript demo automation
    if npx ts-node scripts/demo-automation.ts; then
        success "Demo automation completed successfully"
        return 0
    else
        error "Demo automation failed"
        return 1
    fi
}

# Function to validate recordings
validate_recordings() {
    log "Validating recordings..."
    
    cd "$PROJECT_ROOT"
    
    # Run the recording validator
    if npx ts-node scripts/recording-validator.ts; then
        success "Recording validation completed successfully"
        return 0
    else
        error "Recording validation failed"
        return 1
    fi
}

# Function to generate summary report
generate_summary_report() {
    log "Generating summary report..."
    
    local report_file="$OUTPUT_DIR/demo-automation-summary.md"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    
    cat > "$report_file" << EOF
# Demo Automation Summary Report

**Generated:** $timestamp

## Overview
This report summarizes the automated demo recording session for the Disaster Response Dashboard.

## Files Generated

### Video Captures
EOF
    
    if [ -d "$CAPTURES_DIR" ]; then
        for video_file in "$CAPTURES_DIR"/*.webm "$CAPTURES_DIR"/*.mp4; do
            if [ -f "$video_file" ]; then
                local file_size=$(du -h "$video_file" | cut -f1)
                local file_name=$(basename "$video_file")
                echo "- \`$file_name\` ($file_size)" >> "$report_file"
            fi
        done
    fi
    
    cat >> "$report_file" << EOF

### Validation Reports
- \`recording-validation-report.json\` - Detailed validation results
- \`recording-validation.png\` - Screenshot for validation

## Next Steps
1. Review the generated video files in the \`captures\` directory
2. Check the validation report for any issues
3. If recordings are valid, proceed with video post-production
4. If issues are detected, check the logs and re-run the automation

## Troubleshooting
- If colored bars are detected, check browser rendering in container
- If files are too small, check if the application loaded correctly
- If validation fails, ensure all dependencies are properly installed
EOF
    
    success "Summary report generated: $report_file"
}

# Function to display help
show_help() {
    cat << EOF
Disaster Response Dashboard Demo Automation Runner

Usage: $0 [OPTIONS]

Options:
    -h, --help          Show this help message
    -c, --check-only    Only check environment and frontend (don't run automation)
    -v, --validate-only Only validate existing recordings (don't run automation)
    -f, --force         Force run even if validation fails
    --cleanup           Clean up previous recordings before running

Examples:
    $0                    # Run full automation
    $0 --check-only       # Only check environment
    $0 --validate-only    # Only validate existing recordings
    $0 --cleanup          # Clean up and run automation
    $0 --force            # Force run even with warnings

Environment Variables:
    DISABLE_FRONTEND_CHECK    Skip frontend availability check
    SKIP_VALIDATION          Skip recording validation
    LOG_LEVEL               Set logging level (DEBUG, INFO, WARN, ERROR)
EOF
}

# Main execution
main() {
    local check_only=false
    local validate_only=false
    local force_run=false
    local cleanup_first=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--check-only)
                check_only=true
                shift
                ;;
            -v|--validate-only)
                validate_only=true
                shift
                ;;
            -f|--force)
                force_run=true
                shift
                ;;
            --cleanup)
                cleanup_first=true
                shift
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log "🎬 Disaster Response Dashboard Demo Automation"
    log "=============================================="
    
    # Validate environment
    if ! validate_environment; then
        if [ "$force_run" = true ]; then
            warning "Environment validation failed, but continuing due to --force flag"
        else
            error "Environment validation failed. Use --force to continue anyway."
            exit 1
        fi
    fi
    
    # Check frontend if not disabled
    if [ -z "$DISABLE_FRONTEND_CHECK" ]; then
        if ! check_frontend; then
            if [ "$force_run" = true ]; then
                warning "Frontend check failed, but continuing due to --force flag"
            else
                error "Frontend application is not available. Use --force to continue anyway."
                exit 1
            fi
        fi
    fi
    
    # If only checking, exit here
    if [ "$check_only" = true ]; then
        success "Environment check completed successfully"
        exit 0
    fi
    
    # Clean up if requested
    if [ "$cleanup_first" = true ]; then
        cleanup_previous_recordings
    fi
    
    # If only validating, skip automation
    if [ "$validate_only" = true ]; then
        validate_recordings
        generate_summary_report
        exit 0
    fi
    
    # Run the full automation
    log "Starting full demo automation pipeline..."
    
    if run_demo_automation; then
        success "Demo automation completed"
        
        # Validate recordings unless disabled
        if [ -z "$SKIP_VALIDATION" ]; then
            if validate_recordings; then
                success "All recordings passed validation"
            else
                warning "Some recordings failed validation - check the report for details"
            fi
        else
            warning "Recording validation skipped"
        fi
        
        generate_summary_report
        success "Demo automation pipeline completed successfully!"
        
    else
        error "Demo automation failed"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
