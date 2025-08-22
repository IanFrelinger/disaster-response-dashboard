#!/bin/bash

# Debug CodeBuild Failure
# Analyzes build failures and provides solutions

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

# Get build logs
get_build_logs() {
    local build_id="$1"
    
    print_info "Fetching build logs for: ${build_id}"
    
    # Get the log group and stream
    BUILD_INFO=$(aws codebuild batch-get-builds --ids "${build_id}" --region "${REGION}" --output json 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        print_error "Failed to get build information"
        return 1
    fi
    
    LOG_GROUP=$(echo "$BUILD_INFO" | jq -r '.builds[0].logs.groupName // empty')
    LOG_STREAM=$(echo "$BUILD_INFO" | jq -r '.builds[0].logs.streamName // empty')
    
    if [ -z "$LOG_GROUP" ] || [ -z "$LOG_STREAM" ]; then
        print_error "Could not find log group or stream"
        return 1
    fi
    
    print_info "Log Group: ${LOG_GROUP}"
    print_info "Log Stream: ${LOG_STREAM}"
    echo ""
    
    # Get the logs
    aws logs get-log-events \
        --log-group-name "${LOG_GROUP}" \
        --log-stream-name "${LOG_STREAM}" \
        --region "${REGION}" \
        --query 'events[*].message' \
        --output text 2>/dev/null || {
        print_error "Failed to fetch logs"
        return 1
    }
}

# Analyze common failure patterns
analyze_failure() {
    local logs="$1"
    
    echo "🔍 Analyzing build failure..."
    echo ""
    
    # Check for common failure patterns
    if echo "$logs" | grep -q "fiona.*error"; then
        print_error "FIONA/Geopandas build error detected"
        echo ""
        echo "🔧 SOLUTION:"
        echo "The Dockerfile needs GDAL and C++ compiler dependencies."
        echo "This should already be fixed in the current Dockerfile."
        echo ""
        echo "Try rebuilding with:"
        echo "   ./tools/deployment/deploy-codebuild-simple.sh"
        return 1
    fi
    
    if echo "$logs" | grep -q "gcc.*not found\|g\+\+.*not found"; then
        print_error "C++ compiler missing error detected"
        echo ""
        echo "🔧 SOLUTION:"
        echo "The Dockerfile needs gcc and g++ packages."
        echo "This should already be fixed in the current Dockerfile."
        echo ""
        echo "Try rebuilding with:"
        echo "   ./tools/deployment/deploy-codebuild-simple.sh"
        return 1
    fi
    
    if echo "$logs" | grep -q "libgdal.*not found\|GDAL.*not found"; then
        print_error "GDAL library missing error detected"
        echo ""
        echo "🔧 SOLUTION:"
        echo "The Dockerfile needs libgdal-dev package."
        echo "This should already be fixed in the current Dockerfile."
        echo ""
        echo "Try rebuilding with:"
        echo "   ./tools/deployment/deploy-codebuild-simple.sh"
        return 1
    fi
    
    if echo "$logs" | grep -q "Permission denied\|Access denied"; then
        print_error "Permission/Access denied error detected"
        echo ""
        echo "🔧 SOLUTION:"
        echo "This might be an IAM permission issue."
        echo "Check that the CodeBuild role has proper permissions."
        echo ""
        echo "Try recreating the role:"
        echo "   ./tools/deployment/setup-codebuild-role-cloudshell.sh"
        return 1
    fi
    
    if echo "$logs" | grep -q "Repository.*not found\|404"; then
        print_error "Repository not found error detected"
        echo ""
        echo "🔧 SOLUTION:"
        echo "The GitHub repository might not be accessible."
        echo "Check the repository URL and permissions."
        echo ""
        echo "Verify repository:"
        echo "   https://github.com/IanFrelinger/disaster-response-dashboard"
        return 1
    fi
    
    # If no specific pattern found, show the last few lines
    print_warning "No specific error pattern detected"
    echo ""
    echo "📋 Last 20 lines of build output:"
    echo "$logs" | tail -20
    echo ""
    echo "🔧 GENERAL TROUBLESHOOTING:"
    echo "1. Check the full logs at the provided URL"
    echo "2. Verify the Dockerfile is correct"
    echo "3. Check that all dependencies are properly specified"
    echo "4. Try rebuilding: ./tools/deployment/deploy-codebuild-simple.sh"
}

# Main function
main() {
    echo "🔍 CodeBuild Failure Debugger"
    echo "============================="
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
    
    # Get build logs
    LOGS=$(get_build_logs "${BUILD_ID}")
    
    if [ $? -ne 0 ]; then
        print_error "Failed to get build logs"
        echo ""
        echo "🔧 Manual troubleshooting:"
        echo "1. Go to AWS CodeBuild console"
        echo "2. Find the build: ${BUILD_ID}"
        echo "3. Click on the build to view logs"
        echo "4. Look for error messages in the build output"
        exit 1
    fi
    
    # Analyze the failure
    analyze_failure "$LOGS"
}

# Run main function
main "$@"
