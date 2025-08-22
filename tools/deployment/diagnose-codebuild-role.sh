#!/bin/bash

# Diagnose CodeBuild Role Issues
# Checks the exact state of the CodeBuild service role

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROLE_NAME="CodeBuildServiceRole"

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
    echo "🔍 Diagnosing CodeBuild Role Issues"
    echo "==================================="
    echo "Role Name: ${ROLE_NAME}"
    echo "Timestamp: $(date)"
    echo ""
    
    # Get account ID
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_info "AWS Account ID: ${ACCOUNT_ID}"
    echo ""
    
    # Check if role exists
    print_info "1. Checking if role exists..."
    if aws iam get-role --role-name "${ROLE_NAME}" &>/dev/null; then
        print_success "Role exists"
        ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
        print_info "Role ARN: ${ROLE_ARN}"
    else
        print_error "Role does not exist"
        echo ""
        echo "❌ SOLUTION: Run the setup script first:"
        echo "   ./tools/deployment/setup-codebuild-role.sh"
        exit 1
    fi
    echo ""
    
    # Check trust policy
    print_info "2. Checking trust policy..."
    TRUST_POLICY=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.AssumeRolePolicyDocument' --output json)
    echo "Current trust policy:"
    echo "$TRUST_POLICY" | jq '.'
    echo ""
    
    if echo "$TRUST_POLICY" | grep -q "codebuild.amazonaws.com"; then
        print_success "Trust policy allows CodeBuild service"
    else
        print_error "Trust policy does NOT allow CodeBuild service"
        echo ""
        echo "❌ SOLUTION: Run the fix script:"
        echo "   ./tools/deployment/fix-codebuild-trust-policy.sh"
    fi
    echo ""
    
    # Check attached policies
    print_info "3. Checking attached policies..."
    ATTACHED_POLICIES=$(aws iam list-attached-role-policies --role-name "${ROLE_NAME}" --query 'AttachedPolicies[].PolicyName' --output text)
    echo "Attached policies: ${ATTACHED_POLICIES}"
    
    if echo "$ATTACHED_POLICIES" | grep -q "CodeBuildServicePolicy"; then
        print_success "CodeBuildServicePolicy is attached"
    else
        print_error "CodeBuildServicePolicy is NOT attached"
        echo ""
        echo "❌ SOLUTION: Run the setup script:"
        echo "   ./tools/deployment/setup-codebuild-role.sh"
    fi
    echo ""
    
    # Test role assumption
    print_info "4. Testing role assumption..."
    if aws sts assume-role --role-arn "${ROLE_ARN}" --role-session-name "diagnostic-test" --duration-seconds 900 &>/dev/null; then
        print_success "Role can be assumed successfully"
    else
        print_error "Role cannot be assumed"
        echo ""
        echo "❌ SOLUTION: Wait 2-3 minutes for IAM propagation, then try again"
    fi
    echo ""
    
    # Check if we can create a CodeBuild project
    print_info "5. Testing CodeBuild project creation..."
    TEMP_PROJECT="temp-diagnostic-$(date +%s)"
    
    if aws codebuild create-project \
        --name "${TEMP_PROJECT}" \
        --source type=NO_SOURCE \
        --artifacts type=NO_ARTIFACTS \
        --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_SMALL \
        --service-role "${ROLE_NAME}" \
        --region "${AWS_REGION:-us-east-2}" &>/dev/null; then
        
        print_success "CodeBuild project creation test passed"
        
        # Clean up
        aws codebuild delete-project --name "${TEMP_PROJECT}" --region "${AWS_REGION:-us-east-2}" &>/dev/null
    else
        print_error "CodeBuild project creation test failed"
        echo ""
        echo "❌ This confirms the trust policy issue"
        echo "SOLUTION: Run the fix script and wait for propagation:"
        echo "   ./tools/deployment/fix-codebuild-trust-policy.sh"
        echo "   # Wait 2-3 minutes, then try deployment again"
    fi
    echo ""
    
    echo "📋 Summary:"
    echo "==========="
    echo "If all checks passed: ✅ Ready to deploy"
    echo "If any failed: ❌ Run the suggested solutions above"
    echo ""
    echo "🚀 Next step:"
    echo "   ./tools/deployment/deploy-codebuild.sh"
}

# Run main function
main "$@"
