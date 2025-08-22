#!/bin/bash

# Monitor CodeBuild Progress
# Monitors the progress of a CodeBuild build

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGION="us-east-2"

# Set region explicitly for CloudShell
export AWS_DEFAULT_REGION="${REGION}"
export AWS_REGION="${REGION}"

# Print functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Main function
main() {
    echo "📊 CodeBuild Build Monitor"
    echo "=========================="
    echo "Region: ${REGION}"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check if build ID was provided
    if [ -z "$1" ]; then
        print_error "Please provide a build ID"
        echo ""
        echo "Usage: $0 <build-id>"
        echo "Example: $0 disaster-response-codebuild-demo:4d145e8a-c0f2-43c2-a401-48e6e16ba010"
        echo ""
        echo "Or to list recent builds:"
        echo "aws codebuild list-builds-for-project --project-name disaster-response-codebuild-demo --region ${REGION}"
        exit 1
    fi
    
    BUILD_ID="$1"
    
    print_info "Monitoring build: ${BUILD_ID}"
    echo ""
    
    # Monitor the build
    while true; do
        # Get build status
        BUILD_INFO=$(aws codebuild batch-get-builds --ids "${BUILD_ID}" --region "${REGION}" --query 'builds[0]' --output json 2>/dev/null)
        
        if [ $? -ne 0 ]; then
            print_error "Failed to get build information"
            break
        fi
        
        STATUS=$(echo "$BUILD_INFO" | jq -r '.buildStatus // "UNKNOWN"')
        PHASE=$(echo "$BUILD_INFO" | jq -r '.currentPhase // "UNKNOWN"')
        START_TIME=$(echo "$BUILD_INFO" | jq -r '.startTime // "UNKNOWN"')
        END_TIME=$(echo "$BUILD_INFO" | jq -r '.endTime // "UNKNOWN"')
        LOGS_URL=$(echo "$BUILD_INFO" | jq -r '.logs.deepLink // "UNKNOWN"')
        
        echo "🔄 Build Status: ${STATUS}"
        echo "📋 Current Phase: ${PHASE}"
        echo "⏰ Start Time: ${START_TIME}"
        
        if [ "$END_TIME" != "UNKNOWN" ]; then
            echo "🏁 End Time: ${END_TIME}"
        fi
        
        if [ "$LOGS_URL" != "UNKNOWN" ]; then
            echo "📖 Logs URL: ${LOGS_URL}"
        fi
        
        echo ""
        
        # Check if build is complete
        if [ "$STATUS" = "SUCCEEDED" ]; then
            print_success "🎉 Build completed successfully!"
            echo ""
            echo "📋 Next steps:"
            echo "1. The Docker image is now available in ECR"
            echo "2. You can deploy it to ECS or other services"
            echo "3. View the logs at: ${LOGS_URL}"
            break
        elif [ "$STATUS" = "FAILED" ]; then
            print_error "❌ Build failed!"
            echo ""
            echo "🔧 Troubleshooting:"
            echo "1. View the logs at: ${LOGS_URL}"
            echo "2. Check the build configuration"
            echo "3. Verify the Dockerfile and dependencies"
            break
        elif [ "$STATUS" = "STOPPED" ]; then
            print_warning "⚠️ Build was stopped"
            break
        fi
        
        print_info "Waiting 30 seconds before next check..."
        sleep 30
        echo ""
    done
}

# Run main function
main "$@"
