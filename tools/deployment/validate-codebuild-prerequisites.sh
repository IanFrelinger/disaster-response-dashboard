#!/bin/bash

# Validate CodeBuild Prerequisites
# Checks all requirements for CodeBuild deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROLE_NAME="CodeBuildServiceRole"
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

# Check AWS CLI configuration
check_aws_cli() {
    print_info "Checking AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        return 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        return 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_success "AWS CLI configured for account: ${ACCOUNT_ID}"
    return 0
}

# Check IAM role exists
check_iam_role() {
    print_info "Checking IAM role: ${ROLE_NAME}"
    
    if ! aws iam get-role --role-name "${ROLE_NAME}" &> /dev/null; then
        print_error "IAM role ${ROLE_NAME} does not exist"
        return 1
    fi
    
    ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text)
    print_success "IAM role exists: ${ROLE_ARN}"
    return 0
}

# Check trust policy
check_trust_policy() {
    print_info "Checking trust policy..."
    
    TRUST_POLICY=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.AssumeRolePolicyDocument' --output json)
    
    if echo "$TRUST_POLICY" | grep -q "codebuild.amazonaws.com"; then
        print_success "Trust policy allows CodeBuild service"
    else
        print_error "Trust policy does not allow CodeBuild service"
        return 1
    fi
    
    return 0
}

# Check attached policies
check_attached_policies() {
    print_info "Checking attached policies..."
    
    ATTACHED_POLICIES=$(aws iam list-attached-role-policies --role-name "${ROLE_NAME}" --query 'AttachedPolicies[].PolicyName' --output text)
    
    if echo "$ATTACHED_POLICIES" | grep -q "CodeBuildServicePolicy"; then
        print_success "CodeBuildServicePolicy is attached"
    else
        print_error "CodeBuildServicePolicy is not attached"
        return 1
    fi
    
    return 0
}

# Check ECR repository
check_ecr_repository() {
    print_info "Checking ECR repository..."
    
    REPO_NAME="disaster-response-dashboard"
    
    if aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${REGION}" &> /dev/null; then
        print_success "ECR repository exists: ${REPO_NAME}"
    else
        print_warning "ECR repository does not exist (will be created during deployment)"
    fi
    
    return 0
}

# Check CodeBuild permissions
check_codebuild_permissions() {
    print_info "Checking CodeBuild permissions..."
    
    # Test if we can create a temporary CodeBuild project
    TEMP_PROJECT_NAME="temp-validation-project-$(date +%s)"
    
    # Create temporary buildspec
    cat > temp-buildspec.yml << EOF
version: 0.2
phases:
  build:
    commands:
      - echo "Validation test"
EOF
    
    # Try to create temporary project
    if aws codebuild create-project \
        --name "${TEMP_PROJECT_NAME}" \
        --source type=NO_SOURCE \
        --artifacts type=NO_ARTIFACTS \
        --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_SMALL \
        --service-role "${ROLE_NAME}" \
        --region "${REGION}" &> /dev/null; then
        
        print_success "CodeBuild permissions verified"
        
        # Clean up temporary project
        aws codebuild delete-project --name "${TEMP_PROJECT_NAME}" --region "${REGION}" &> /dev/null
    else
        print_error "CodeBuild permissions check failed"
        return 1
    fi
    
    # Clean up
    rm -f temp-buildspec.yml
    
    return 0
}

# Main validation function
main() {
    echo "🔍 Validating CodeBuild Prerequisites"
    echo "====================================="
    echo "Role Name: ${ROLE_NAME}"
    echo "Region: ${REGION}"
    echo "Timestamp: $(date)"
    echo ""
    
    local all_checks_passed=true
    
    # Run all checks
    check_aws_cli || all_checks_passed=false
    echo ""
    
    check_iam_role || all_checks_passed=false
    echo ""
    
    check_trust_policy || all_checks_passed=false
    echo ""
    
    check_attached_policies || all_checks_passed=false
    echo ""
    
    check_ecr_repository || all_checks_passed=false
    echo ""
    
    check_codebuild_permissions || all_checks_passed=false
    echo ""
    
    if [ "$all_checks_passed" = true ]; then
        echo "🎉 All prerequisites validated successfully!"
        echo "============================================="
        echo ""
        echo "📋 Ready to deploy:"
        echo "   ./tools/deployment/deploy-codebuild.sh"
        echo ""
    else
        echo "❌ Some prerequisites failed validation"
        echo "======================================"
        echo ""
        echo "🔧 Fix issues and run validation again:"
        echo "   ./tools/deployment/validate-codebuild-prerequisites.sh"
        echo ""
        echo "🛠️  Or run the setup script:"
        echo "   ./tools/deployment/setup-codebuild-role.sh"
        echo ""
        exit 1
    fi
}

# Run main function
main "$@"
