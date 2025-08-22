#!/bin/bash

# Check CodeBuild Status
# Simple script to check build status

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
    echo "📊 CodeBuild Status Check"
    echo "========================="
    echo "Region: ${REGION}"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check if build ID was provided
    if [ -z "$1" ]; then
        print_error "Please provide a build ID"
        echo ""
        echo "Usage: $0 <build-id>"
        echo "Example: $0 disaster-response-codebuild-demo:5f903822-ce5e-4cd7-9a0c-762e97b21fa8"
        echo ""
        echo "Or to list recent builds:"
        echo "aws codebuild list-builds-for-project --project-name disaster-response-codebuild-demo --region ${REGION}"
        exit 1
    fi
    
    BUILD_ID="$1"
    
    print_info "Checking build: ${BUILD_ID}"
    echo ""
    
    # Get build status
    BUILD_INFO=$(aws codebuild batch-get-builds --ids "${BUILD_ID}" --region "${REGION}" --output json 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        print_error "Failed to get build information"
        exit 1
    fi
    
    STATUS=$(echo "$BUILD_INFO" | jq -r '.builds[0].buildStatus // "UNKNOWN"')
    PHASE=$(echo "$BUILD_INFO" | jq -r '.builds[0].currentPhase // "UNKNOWN"')
    START_TIME=$(echo "$BUILD_INFO" | jq -r '.builds[0].startTime // "UNKNOWN"')
    END_TIME=$(echo "$BUILD_INFO" | jq -r '.builds[0].endTime // "UNKNOWN"')
    LOGS_URL=$(echo "$BUILD_INFO" | jq -r '.builds[0].logs.deepLink // "UNKNOWN"')
    
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
    
    # Provide status-specific information
    case "$STATUS" in
        "SUCCEEDED")
            print_success "🎉 Build completed successfully!"
            echo ""
            echo "📋 Next steps:"
            echo "1. The Docker image is now available in ECR"
            echo "2. You can deploy it to ECS or other services"
            echo "3. View the logs at: ${LOGS_URL}"
            ;;
        "FAILED")
            print_error "❌ Build failed!"
            echo ""
            echo "🔧 Troubleshooting:"
            echo "1. View the logs at: ${LOGS_URL}"
            echo "2. Run the debugger: ./tools/deployment/debug-codebuild-failure.sh ${BUILD_ID}"
            echo "3. Check the build configuration"
            ;;
        "IN_PROGRESS")
            print_info "⏳ Build is still in progress..."
            echo ""
            echo "📋 Current phase: ${PHASE}"
            echo "Check back in a few minutes or view logs at: ${LOGS_URL}"
            ;;
        "STOPPED")
            print_warning "⚠️ Build was stopped"
            ;;
        *)
            print_warning "Unknown status: ${STATUS}"
            ;;
    esac
}

# Run main function
main "$@"
