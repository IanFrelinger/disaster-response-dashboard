#!/bin/bash
# Frontend Layer Validation Script for CI/CD Pipeline
# This script runs the frontend layer validation in a containerized environment

set -e

# Configuration
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
TIMEOUT=${VALIDATION_TIMEOUT:-60}
HEADLESS=${HEADLESS:-true}
RESULTS_DIR=${RESULTS_DIR:-"test-results"}

echo "🔍 Starting Frontend Layer Validation"
echo "====================================="
echo "Frontend URL: $FRONTEND_URL"
echo "Timeout: ${TIMEOUT}s"
echo "Headless: $HEADLESS"
echo "Results Dir: $RESULTS_DIR"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to check if frontend is ready
wait_for_frontend() {
    echo "⏳ Waiting for frontend to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$FRONTEND_URL" > /dev/null 2>&1; then
            echo "✅ Frontend is ready"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: Frontend not ready, waiting 2s..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Frontend failed to start within timeout"
    return 1
}

# Function to run validation
run_validation() {
    echo "🗺️ Running layer validation..."
    
    cd frontend
    
    # Set environment variables
    export FRONTEND_URL="$FRONTEND_URL"
    export CI="true"
    export HEADLESS="$HEADLESS"
    export SCREENSHOT_PATH="../$RESULTS_DIR/layer-validation.png"
    export RESULTS_PATH="../$RESULTS_DIR/layer-validation-results.json"
    
    # Run validation
    if pnpm validate:layers:ci; then
        echo "✅ Layer validation completed successfully"
        return 0
    else
        echo "❌ Layer validation failed"
        return 1
    fi
}

# Function to generate summary report
generate_summary() {
    local results_file="$RESULTS_DIR/layer-validation-results.json"
    
    if [ -f "$results_file" ]; then
        echo ""
        echo "📊 VALIDATION SUMMARY"
        echo "===================="
        
        # Extract key metrics using jq if available, otherwise use basic parsing
        if command -v jq > /dev/null 2>&1; then
            local success_rate=$(jq -r '.overall.successRate' "$results_file")
            local successful_layers=$(jq -r '.overall.successfulLayers' "$results_file")
            local total_layers=$(jq -r '.overall.totalLayers' "$results_file")
            local load_time=$(jq -r '.performance.loadTime' "$results_file")
            local render_time=$(jq -r '.performance.renderTime' "$results_file")
            local memory_usage=$(jq -r '.performance.memoryUsage' "$results_file")
            
            echo "Success Rate: ${success_rate}% (${successful_layers}/${total_layers} layers)"
            echo "Load Time: ${load_time}ms"
            echo "Render Time: ${render_time}ms"
            echo "Memory Usage: $(echo "scale=1; $memory_usage / 1024 / 1024" | bc)MB"
            
            # Check if validation passed
            local success=$(jq -r '.success' "$results_file")
            if [ "$success" = "true" ]; then
                echo "Status: ✅ PASSED"
            else
                echo "Status: ❌ FAILED"
            fi
        else
            echo "Results saved to: $results_file"
            echo "Install 'jq' for detailed summary parsing"
        fi
    else
        echo "❌ No results file found at $results_file"
    fi
}

# Main execution
main() {
    # Wait for frontend to be ready
    if ! wait_for_frontend; then
        echo "❌ Frontend validation failed: Frontend not ready"
        exit 1
    fi
    
    # Run validation
    if ! run_validation; then
        echo "❌ Frontend validation failed: Layer validation failed"
        generate_summary
        exit 1
    fi
    
    # Generate summary
    generate_summary
    
    echo ""
    echo "🎉 Frontend layer validation completed successfully!"
    exit 0
}

# Run main function
main "$@"
