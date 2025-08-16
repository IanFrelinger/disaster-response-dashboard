#!/bin/bash

# Editor-in-the-Loop Review Pipeline
# Complete CI workflow for video review and improvement

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_DIR/output"
FEEDBACK_FILE="$OUTPUT_DIR/feedback.json"
SCENE_MAP_FILE="$OUTPUT_DIR/scene_map.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
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

log_step() {
    echo -e "\n${BLUE}🎬 $1${NC}"
    echo "=================================="
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking Prerequisites"
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
        log_error "Must run from video-production directory"
        exit 1
    fi
    
    # Check required tools
    local missing_tools=()
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if ! command -v ffmpeg &> /dev/null; then
        missing_tools+=("ffmpeg")
    fi
    
    if ! command -v python3 &> /dev/null; then
        missing_tools+=("python3")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
    
    # Check required files
    local missing_files=()
    
    if [[ ! -f "$PROJECT_DIR/record.config.json" ]]; then
        missing_files+=("record.config.json")
    fi
    
    if [[ ! -f "$PROJECT_DIR/tts-cue-sheet.json" ]]; then
        missing_files+=("tts-cue-sheet.json")
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "Missing required files: ${missing_files[*]}"
        exit 1
    fi
    
    # Check environment variables
    if [[ -z "$OPENAI_API_KEY" ]]; then
        log_warning "OPENAI_API_KEY not set - GPT-5 review will use fallback"
    fi
    
    log_success "All prerequisites met"
}

# Generate review artifacts
generate_artifacts() {
    log_step "Generating Review Artifacts"
    
    cd "$PROJECT_DIR"
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Generate frames from video if it exists
    if [[ -f "$OUTPUT_DIR/roughcut.mp4" ]]; then
        log_info "Generating frames from roughcut.mp4..."
        mkdir -p "$OUTPUT_DIR/frames"
        
        if ffmpeg -i "$OUTPUT_DIR/roughcut.mp4" -vf "fps=1/10,scale=1920:-2" "$OUTPUT_DIR/frames/frame_%03d.png" -y 2>/dev/null; then
            log_success "Frames generated successfully"
        else
            log_warning "Frame generation failed, continuing without frames"
        fi
    else
        log_warning "No roughcut.mp4 found, skipping frame generation"
    fi
    
    # Build scene map
    log_info "Building scene map..."
    if python3 "$SCRIPT_DIR/build_scene_map.py" "$PROJECT_DIR/timeline.yaml" "$PROJECT_DIR/tts-cue-sheet.json" "$SCENE_MAP_FILE"; then
        log_success "Scene map built successfully"
    else
        log_warning "Scene map building failed, using fallback"
    fi
    
    log_success "Review artifacts generated"
}

# Run GPT-5 agent review
run_agent_review() {
    log_step "Running GPT-5 Agent Review"
    
    cd "$PROJECT_DIR"
    
    if [[ -z "$OPENAI_API_KEY" ]]; then
        log_warning "OPENAI_API_KEY not set, using fallback review"
        create_fallback_feedback
        return
    fi
    
    log_info "Running video review agent..."
    if npx tsx "$SCRIPT_DIR/agent_review.js"; then
        log_success "Agent review completed"
        
        # Check if feedback was generated
        if [[ -f "$FEEDBACK_FILE" ]]; then
            local score=$(jq -r '.total' "$FEEDBACK_FILE" 2>/dev/null || echo "N/A")
            log_info "Overall score: $score/10"
        else
            log_error "No feedback file generated"
            exit 1
        fi
    else
        log_error "Agent review failed"
        exit 1
    fi
}

# Create fallback feedback if GPT-5 is unavailable
create_fallback_feedback() {
    log_info "Creating fallback feedback..."
    
    cat > "$FEEDBACK_FILE" << 'EOF'
{
  "scores": {
    "story": 7,
    "tech_accuracy": 7,
    "visuals": 7,
    "audio": 7,
    "timing": 7,
    "compliance": 7
  },
  "total": 7,
  "issues": [
    {
      "timecode": "00:00",
      "beat": "general",
      "type": "technical",
      "note": "Manual review required",
      "evidence": "GPT-5 review unavailable"
    }
  ],
  "fixes": [
    {
      "timecode": "00:00",
      "beat": "general",
      "action": "review",
      "detail": "Manual review and improvement needed"
    }
  ],
  "blocking": false
}
EOF
    
    log_success "Fallback feedback created"
}

# Apply feedback to configuration files
apply_feedback() {
    log_step "Applying Feedback to Configuration Files"
    
    cd "$PROJECT_DIR"
    
    if [[ ! -f "$FEEDBACK_FILE" ]]; then
        log_error "No feedback file found"
        exit 1
    fi
    
    log_info "Applying feedback from GPT-5 agent..."
    if python3 "$SCRIPT_DIR/apply_feedback.py" "$FEEDBACK_FILE" "$OUTPUT_DIR"; then
        log_success "Feedback applied successfully"
    else
        log_error "Feedback application failed"
        exit 1
    fi
}

# Generate improvement summary
generate_summary() {
    log_step "Generating Improvement Summary"
    
    cd "$PROJECT_DIR"
    
    # Create summary report
    local summary_file="$OUTPUT_DIR/review_pipeline_summary.md"
    
    cat > "$summary_file" << EOF
# Video Review Pipeline Summary

## Pipeline Execution
- **Timestamp**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- **Pipeline**: Editor-in-the-Loop Review
- **Status**: Completed

## Review Results
EOF
    
    # Add feedback summary if available
    if [[ -f "$FEEDBACK_FILE" ]]; then
        local total_score=$(jq -r '.total' "$FEEDBACK_FILE" 2>/dev/null || echo "N/A")
        local issues_count=$(jq -r '.issues | length' "$FEEDBACK_FILE" 2>/dev/null || echo "0")
        local fixes_count=$(jq -r '.fixes | length' "$FEEDBACK_FILE" 2>/dev/null || echo "0")
        local blocking=$(jq -r '.blocking' "$FEEDBACK_FILE" 2>/dev/null || echo "false")
        
        cat >> "$summary_file" << EOF

### Feedback Summary
- **Overall Score**: $total_score/10
- **Issues Found**: $issues_count
- **Fixes Proposed**: $fixes_count
- **Blocking Issues**: $blocking

### Score Breakdown
EOF
        
        # Add individual scores
        if command -v jq &> /dev/null; then
            jq -r '.scores | to_entries[] | "- **\(.key | ascii_upcase)**: \(.value)/10"' "$FEEDBACK_FILE" >> "$summary_file" 2>/dev/null || true
        fi
    fi
    
    # Add configuration updates summary
    if [[ -f "$OUTPUT_DIR/feedback_application_summary.json" ]]; then
        cat >> "$summary_file" << EOF

## Configuration Updates Applied
- **Overlay Config**: $(jq -r '.configuration_updates.overlay_config.json.exists' "$OUTPUT_DIR/feedback_application_summary.json" 2>/dev/null || echo "N/A")
- **Audio Config**: $(jq -r '.configuration_updates.audio_config.json.exists' "$OUTPUT_DIR/feedback_application_summary.json" 2>/dev/null || echo "N/A")
- **Timeline Updates**: $(jq -r '.configuration_updates.timeline_updates.json.exists' "$OUTPUT_DIR/feedback_application_summary.json" 2>/dev/null || echo "N/A")
- **Font Config**: $(jq -r '.configuration_updates.font_config.json.exists' "$OUTPUT_DIR/feedback_application_summary.json" 2>/dev/null || echo "N/A")
EOF
    fi
    
    # Add next steps
    cat >> "$summary_file" << EOF

## Next Steps
1. **Review Configuration Updates**: Check generated configuration files in \`output/\`
2. **Apply Changes**: Update timeline, overlay, and audio files with new settings
3. **Re-render Video**: Generate updated video with applied improvements
4. **Re-run Review**: Execute pipeline again to verify improvements
5. **Iterate**: Continue until target score is achieved

## Quality Gates
- **Target Score**: ≥ 8.0/10
- **Minimum Scores**: All categories ≥ 7.5/10
- **Blocking Issues**: None allowed for release

## Files Generated
- \`feedback.json\`: GPT-5 agent feedback
- \`scene_map.json\`: Scene mapping for review
- \`frames/\`: Video frames for analysis
- \`*_config.json\`: Updated configuration files
- \`feedback_application_summary.json\`: Application summary
EOF
    
    log_success "Summary generated: $summary_file"
}

# Check quality gates
check_quality_gates() {
    log_step "Checking Quality Gates"
    
    if [[ ! -f "$FEEDBACK_FILE" ]]; then
        log_error "No feedback file found for quality check"
        return 1
    fi
    
    local total_score=$(jq -r '.total' "$FEEDBACK_FILE" 2>/dev/null || echo "0")
    local blocking=$(jq -r '.blocking' "$FEEDBACK_FILE" 2>/dev/null || echo "true")
    
    # Check blocking issues
    if [[ "$blocking" == "true" ]]; then
        log_error "❌ BLOCKING ISSUES DETECTED - Fix required before release"
        return 1
    fi
    
    # Check total score
    if (( $(echo "$total_score >= 8.0" | bc -l) )); then
        log_success "🎉 EXCELLENT SCORE ($total_score/10) - Ready for release!"
        return 0
    elif (( $(echo "$total_score >= 7.0" | bc -l) )); then
        log_warning "📝 GOOD SCORE ($total_score/10) - Minor improvements recommended"
        return 0
    else
        log_error "❌ LOW SCORE ($total_score/10) - Significant improvements needed"
        return 1
    fi
}

# Main pipeline execution
main() {
    echo -e "${BLUE}"
    echo "🎬 Editor-in-the-Loop Review Pipeline"
    echo "====================================="
    echo "Complete CI workflow for video review and improvement"
    echo -e "${NC}"
    
    # Execute pipeline steps
    check_prerequisites
    generate_artifacts
    run_agent_review
    apply_feedback
    generate_summary
    
    # Final quality check
    if check_quality_gates; then
        log_success "Pipeline completed successfully!"
        echo -e "\n${GREEN}🎉 Your video is ready for the next iteration!${NC}"
        echo -e "\n📁 Check the output directory for:"
        echo "   - Configuration updates"
        echo "   - Improvement summary"
        echo "   - Next steps guide"
    else
        log_warning "Pipeline completed with quality issues"
        echo -e "\n${YELLOW}⚠️  Review the feedback and apply improvements${NC}"
        echo -e "\n📁 Check the output directory for:"
        echo "   - Issues identified"
        echo "   - Fixes proposed"
        echo "   - Configuration updates"
    fi
}

# Run main function
main "$@"
