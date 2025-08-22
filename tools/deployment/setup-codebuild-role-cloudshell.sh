#!/bin/bash

# Setup CodeBuild IAM Role for CloudShell
# Creates the necessary IAM role and policies for CodeBuild

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

# Create trust policy for CodeBuild
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

# Create policy for CodeBuild permissions
create_policy() {
    cat > codebuild-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
    },
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ]
    },
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "ecr:PutImage"
      ]
    },
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion",
        "s3:PutObject"
      ]
    }
  ]
}
EOF
}

# Create IAM role
create_role() {
    print_info "Creating IAM role for CodeBuild..."
    
    # Create trust policy
    create_trust_policy
    
    # Create the role
    aws iam create-role \
        --role-name "${ROLE_NAME}" \
        --assume-role-policy-document file://trust-policy.json \
        --description "Service role for CodeBuild" 2>/dev/null || {
        print_info "Role already exists, updating trust policy..."
        aws iam update-assume-role-policy \
            --role-name "${ROLE_NAME}" \
            --policy-document file://trust-policy.json
    }
    
    print_success "IAM role created/updated"
    
    # Clean up
    rm -f trust-policy.json
}

# Create and attach policy
create_and_attach_policy() {
    print_info "Creating and attaching policy to role..."
    
    # Create policy document
    create_policy
    
    # Create the policy
    POLICY_ARN=$(aws iam create-policy \
        --policy-name "CodeBuildServicePolicy" \
        --policy-document file://codebuild-policy.json \
        --query 'Policy.Arn' --output text 2>/dev/null || \
        aws iam list-policies --scope Local --query 'Policies[?PolicyName==`CodeBuildServicePolicy`].Arn' --output text)
    
    print_success "Policy created/found: ${POLICY_ARN}"
    
    # Attach policy to role
    aws iam attach-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-arn "${POLICY_ARN}" 2>/dev/null || {
        print_info "Policy already attached to role"
    }
    
    print_success "Policy attached to role"
    
    # Clean up
    rm -f codebuild-policy.json
}

# Wait for role to be available
wait_for_role() {
    print_info "Waiting for role to be available..."
    
    for i in {1..30}; do
        if aws iam get-role --role-name "${ROLE_NAME}" >/dev/null 2>&1; then
            print_success "Role is available"
            break
        fi
        
        print_info "Waiting for role to propagate... (attempt ${i}/30)"
        sleep 10
    done
}

# Main function
main() {
    echo "🔧 Setting up CodeBuild IAM Role for CloudShell"
    echo "=============================================="
    echo "Role Name: ${ROLE_NAME}"
    echo "Region: ${REGION}"
    echo "Timestamp: $(date)"
    echo ""
    
    # Verify AWS credentials
    print_info "Verifying AWS credentials..."
    if ! aws sts get-caller-identity &>/dev/null; then
        print_error "AWS credentials not available"
        print_error "Please ensure you're logged into CloudShell with proper permissions"
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_success "AWS credentials verified for account: ${ACCOUNT_ID}"
    echo ""
    
    create_role
    create_and_attach_policy
    wait_for_role
    
    echo ""
    echo "🎉 CodeBuild IAM Role Setup Complete!"
    echo "====================================="
    echo "Role Name: ${ROLE_NAME}"
    echo "Role ARN: arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run the CodeBuild deployment script:"
    echo "   ./tools/deployment/deploy-codebuild-simple.sh"
    echo ""
    echo "🔧 If you need to delete the role later:"
    echo "   aws iam detach-role-policy --role-name ${ROLE_NAME} --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/CodeBuildServicePolicy"
    echo "   aws iam delete-role --role-name ${ROLE_NAME}"
}

# Run main function
main "$@"
