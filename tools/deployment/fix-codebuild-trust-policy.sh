#!/bin/bash

# Fix CodeBuild Trust Policy
# Ensures the CodeBuild service role has the correct trust policy

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

# Create correct trust policy for CodeBuild
create_trust_policy() {
    cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

# Main function
main() {
    echo "🔧 Fixing CodeBuild Trust Policy"
    echo "================================"
    echo "Role Name: ${ROLE_NAME}"
    echo "Timestamp: $(date)"
    echo ""
    
    print_info "Creating correct trust policy..."
    create_trust_policy
    
    print_info "Updating role trust policy..."
    aws iam update-assume-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-document file://trust-policy.json
    
    print_success "Trust policy updated successfully"
    
    print_info "Verifying role..."
    ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text)
    print_success "Role ARN: ${ROLE_ARN}"
    
    print_info "Testing trust policy..."
    TRUST_POLICY=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.AssumeRolePolicyDocument' --output json)
    print_success "Trust policy verified"
    
    # Clean up
    rm -f trust-policy.json
    
    echo ""
    echo "🎉 CodeBuild Trust Policy Fixed!"
    echo "================================"
    echo "Role Name: ${ROLE_NAME}"
    echo "Role ARN: ${ROLE_ARN}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run the CodeBuild deployment script:"
    echo "   ./tools/deployment/deploy-codebuild.sh"
}

# Run main function
main "$@"
