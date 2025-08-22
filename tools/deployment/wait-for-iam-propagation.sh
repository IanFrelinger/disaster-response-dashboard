#!/bin/bash

# Wait for IAM Propagation and Test CodeBuild
# Waits for IAM changes to propagate and tests CodeBuild deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROLE_NAME="CodeBuildServiceRole"
REGION="us-east-2"

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

# Test CodeBuild project creation
test_codebuild_creation() {
    local project_name="test-project-$(date +%s)"
    
    print_info "Testing CodeBuild project creation..."
    
    if aws codebuild create-project \
        --name "${project_name}" \
        --source type=NO_SOURCE \
        --artifacts type=NO_ARTIFACTS \
        --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_SMALL \
        --service-role "${ROLE_NAME}" \
        --region "${REGION}" &>/dev/null; then
        
        print_success "CodeBuild project creation successful!"
        
        # Clean up
        aws codebuild delete-project --name "${project_name}" --region "${REGION}" &>/dev/null
        return 0
    else
        return 1
    fi
}

# Main function
main() {
    echo "⏳ Waiting for IAM Propagation"
    echo "=============================="
    echo "Role Name: ${ROLE_NAME}"
    echo "Region: ${REGION}"
    echo "Timestamp: $(date)"
    echo ""
    
    print_info "IAM changes can take 2-5 minutes to propagate..."
    print_info "Testing every 30 seconds..."
    echo ""
    
    # Test for up to 10 minutes (20 attempts)
    for attempt in {1..20}; do
        print_info "Attempt ${attempt}/20 - Testing CodeBuild project creation..."
        
        if test_codebuild_creation; then
            echo ""
            print_success "🎉 IAM propagation complete!"
            print_success "CodeBuild is now ready for deployment"
            echo ""
            echo "📋 Next step:"
            echo "   ./tools/deployment/deploy-codebuild.sh"
            exit 0
        else
            print_warning "Still waiting for IAM propagation..."
            
            if [ $attempt -lt 20 ]; then
                print_info "Waiting 30 seconds before next attempt..."
                sleep 30
            fi
        fi
    done
    
    echo ""
    print_error "❌ IAM propagation timeout after 10 minutes"
    print_error "This might indicate a deeper issue with the role configuration"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "1. Run the diagnostic script:"
    echo "   ./tools/deployment/diagnose-codebuild-role.sh"
    echo ""
    echo "2. Try the fix script again:"
    echo "   ./tools/deployment/fix-codebuild-trust-policy.sh"
    echo ""
    echo "3. Or recreate the role:"
    echo "   ./tools/deployment/setup-codebuild-role.sh"
    exit 1
}

# Run main function
main "$@"
