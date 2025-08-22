#!/bin/bash

# Check AWS Permissions and Credentials
# Diagnoses AWS credential and permission issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    
    print_success "AWS CLI is installed"
    return 0
}

# Check AWS credentials
check_credentials() {
    print_info "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity &>/dev/null; then
        print_error "AWS credentials not configured or invalid"
        return 1
    fi
    
    IDENTITY=$(aws sts get-caller-identity)
    ACCOUNT_ID=$(echo "$IDENTITY" | jq -r '.Account')
    USER_ARN=$(echo "$IDENTITY" | jq -r '.Arn')
    USER_ID=$(echo "$IDENTITY" | jq -r '.UserId')
    
    print_success "AWS credentials are valid"
    print_info "Account ID: ${ACCOUNT_ID}"
    print_info "User ARN: ${USER_ARN}"
    print_info "User ID: ${USER_ID}"
    
    return 0
}

# Check IAM permissions
check_iam_permissions() {
    print_info "Checking IAM permissions..."
    
    # Test basic IAM operations
    if ! aws iam list-roles --max-items 1 &>/dev/null; then
        print_error "No IAM permissions - cannot list roles"
        return 1
    fi
    
    if ! aws iam list-policies --scope Local --max-items 1 &>/dev/null; then
        print_error "No IAM permissions - cannot list policies"
        return 1
    fi
    
    print_success "Basic IAM permissions confirmed"
    return 0
}

# Check CodeBuild permissions
check_codebuild_permissions() {
    print_info "Checking CodeBuild permissions..."
    
    if ! aws codebuild list-projects --max-items 1 &>/dev/null; then
        print_error "No CodeBuild permissions - cannot list projects"
        return 1
    fi
    
    print_success "CodeBuild permissions confirmed"
    return 0
}

# Check if we can create IAM roles
check_role_creation_permissions() {
    print_info "Checking IAM role creation permissions..."
    
    # Test if we can create a temporary role
    TEMP_ROLE_NAME="temp-test-role-$(date +%s)"
    
    # Create temporary trust policy
    cat > temp-trust.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
    
    if aws iam create-role --role-name "${TEMP_ROLE_NAME}" --assume-role-policy-document file://temp-trust.json &>/dev/null; then
        print_success "Can create IAM roles"
        
        # Clean up
        aws iam delete-role --role-name "${TEMP_ROLE_NAME}" &>/dev/null
        rm -f temp-trust.json
        return 0
    else
        print_error "Cannot create IAM roles"
        rm -f temp-trust.json
        return 1
    fi
}

# Check if we can assume roles
check_assume_role_permissions() {
    print_info "Checking assume role permissions..."
    
    # Try to assume the CodeBuild role
    ROLE_ARN="arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/CodeBuildServiceRole"
    
    if aws sts assume-role --role-arn "${ROLE_ARN}" --role-session-name "permission-test" --duration-seconds 900 &>/dev/null; then
        print_success "Can assume CodeBuild role"
        return 0
    else
        print_error "Cannot assume CodeBuild role"
        print_info "This might be expected if the role doesn't exist or has issues"
        return 1
    fi
}

# Check AWS region
check_region() {
    print_info "Checking AWS region..."
    
    REGION=$(aws configure get region 2>/dev/null || echo "not set")
    
    if [ "$REGION" = "not set" ]; then
        print_warning "AWS region not configured"
        print_info "Setting region to us-east-2"
        export AWS_DEFAULT_REGION=us-east-2
        export AWS_REGION=us-east-2
    else
        print_success "AWS region: ${REGION}"
    fi
}

# Main function
main() {
    echo "🔍 Checking AWS Permissions and Credentials"
    echo "==========================================="
    echo "Timestamp: $(date)"
    echo ""
    
    local all_checks_passed=true
    
    # Run all checks
    check_aws_cli || all_checks_passed=false
    echo ""
    
    check_credentials || all_checks_passed=false
    echo ""
    
    check_region
    echo ""
    
    check_iam_permissions || all_checks_passed=false
    echo ""
    
    check_codebuild_permissions || all_checks_passed=false
    echo ""
    
    check_role_creation_permissions || all_checks_passed=false
    echo ""
    
    check_assume_role_permissions || {
        print_warning "Assume role test failed - this might be expected"
        print_info "Continuing with other checks..."
    }
    echo ""
    
    if [ "$all_checks_passed" = true ]; then
        echo "🎉 All AWS permissions and credentials are valid!"
        echo "================================================"
        echo ""
        echo "📋 Next steps:"
        echo "1. Try the role recreation script:"
        echo "   ./tools/deployment/recreate-codebuild-role.sh"
        echo ""
        echo "2. Or try the deployment directly:"
        echo "   ./tools/deployment/deploy-codebuild.sh"
        echo ""
    else
        echo "❌ Some AWS permissions or credentials are invalid"
        echo "================================================"
        echo ""
        echo "🔧 Solutions:"
        echo "1. In CloudShell, ensure you're logged in with proper permissions"
        echo "2. Check that your AWS account has IAM and CodeBuild access"
        echo "3. Try refreshing your CloudShell session"
        echo "4. Contact your AWS administrator for proper permissions"
        echo ""
        exit 1
    fi
}

# Run main function
main "$@"
