#!/bin/bash

# Simple CodeBuild Setup Validation
# Quick validation before and after running setup-codebuild-role.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROLE_NAME="CodeBuildServiceRole"
POLICY_NAME="CodeBuildServicePolicy"
REGION=${AWS_REGION:-"us-east-2"}

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

# Check if role exists
check_role() {
    if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
        ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
        print_success "IAM role exists: $ROLE_NAME"
        print_info "Role ARN: $ROLE_ARN"
        return 0
    else
        print_error "IAM role does not exist: $ROLE_NAME"
        return 1
    fi
}

# Check if policy exists
check_policy() {
    POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text 2>/dev/null)
    
    if [ -n "$POLICY_ARN" ] && [ "$POLICY_ARN" != "None" ]; then
        print_success "Policy exists: $POLICY_NAME"
        print_info "Policy ARN: $POLICY_ARN"
        return 0
    else
        print_error "Policy does not exist: $POLICY_NAME"
        return 1
    fi
}

# Check if policy is attached to role
check_policy_attachment() {
    ATTACHED_POLICIES=$(aws iam list-attached-role-policies --role-name "$ROLE_NAME" --query "AttachedPolicies[?PolicyName=='$POLICY_NAME'].PolicyArn" --output text 2>/dev/null)
    
    if [ -n "$ATTACHED_POLICIES" ] && [ "$ATTACHED_POLICIES" != "None" ]; then
        print_success "Policy is attached to role"
        return 0
    else
        print_error "Policy is not attached to role"
        return 1
    fi
}

# Check trust policy
check_trust_policy() {
    TRUST_POLICY=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.AssumeRolePolicyDocument' --output json 2>/dev/null)
    
    if echo "$TRUST_POLICY" | jq -e '.Statement[] | select(.Principal.Service == "codebuild.amazonaws.com")' >/dev/null 2>&1; then
        print_success "Trust policy allows CodeBuild service"
        return 0
    else
        print_error "Trust policy does not allow CodeBuild service"
        return 1
    fi
}

# Check AWS CLI and credentials
check_prerequisites() {
    if command -v aws >/dev/null 2>&1; then
        print_success "AWS CLI is installed"
    else
        print_error "AWS CLI is not installed"
        return 1
    fi
    
    if aws sts get-caller-identity >/dev/null 2>&1; then
        ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        print_success "AWS credentials are configured"
        print_info "Account ID: $ACCOUNT_ID"
        return 0
    else
        print_error "AWS credentials are not configured"
        return 1
    fi
}

# Main validation function
main() {
    echo "🔍 CodeBuild Setup Validation"
    echo "============================="
    echo "Role Name: $ROLE_NAME"
    echo "Policy Name: $POLICY_NAME"
    echo "Region: $REGION"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    if ! check_prerequisites; then
        echo ""
        print_error "Prerequisites check failed. Please configure AWS CLI and credentials."
        exit 1
    fi
    
    echo ""
    print_info "Checking IAM resources..."
    
    # Check each component
    ROLE_EXISTS=false
    POLICY_EXISTS=false
    POLICY_ATTACHED=false
    TRUST_POLICY_OK=false
    
    if check_role; then
        ROLE_EXISTS=true
    fi
    
    if check_policy; then
        POLICY_EXISTS=true
    fi
    
    if [ "$ROLE_EXISTS" = true ] && check_policy_attachment; then
        POLICY_ATTACHED=true
    fi
    
    if [ "$ROLE_EXISTS" = true ] && check_trust_policy; then
        TRUST_POLICY_OK=true
    fi
    
    echo ""
    echo "📊 Validation Summary"
    echo "===================="
    echo "✅ IAM Role: $ROLE_EXISTS"
    echo "✅ IAM Policy: $POLICY_EXISTS"
    echo "✅ Policy Attachment: $POLICY_ATTACHED"
    echo "✅ Trust Policy: $TRUST_POLICY_OK"
    echo ""
    
    # Determine status
    if [ "$ROLE_EXISTS" = true ] && [ "$POLICY_EXISTS" = true ] && [ "$POLICY_ATTACHED" = true ] && [ "$TRUST_POLICY_OK" = true ]; then
        print_success "🎉 CodeBuild setup is complete and ready!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Run the CodeBuild deployment:"
        echo "   ./tools/deployment/deploy-codebuild.sh"
        echo ""
        echo "🔧 To clean up later:"
        ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null)
        POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text 2>/dev/null)
        echo "   aws iam detach-role-policy --role-name $ROLE_NAME --policy-arn $POLICY_ARN"
        echo "   aws iam delete-role --role-name $ROLE_NAME"
        echo "   aws iam delete-policy --policy-arn $POLICY_ARN"
        exit 0
    else
        print_warning "⚠️  CodeBuild setup is incomplete."
        echo ""
        echo "📋 To complete setup, run:"
        echo "   ./tools/deployment/setup-codebuild-role.sh"
        echo ""
        echo "🔍 To run detailed validation tests:"
        echo "   ./tools/deployment/test-codebuild-setup.sh"
        exit 1
    fi
}

# Run main function
main "$@"
