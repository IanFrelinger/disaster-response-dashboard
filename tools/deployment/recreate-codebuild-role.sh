#!/bin/bash

# Recreate CodeBuild Role from Scratch
# Completely removes and recreates the CodeBuild service role

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

# Remove existing role and policy
cleanup_existing() {
    print_info "Cleaning up existing role and policy..."
    
    # Detach policy from role if it exists
    if aws iam list-attached-role-policies --role-name "${ROLE_NAME}" --query 'AttachedPolicies[?PolicyName==`CodeBuildServicePolicy`].PolicyArn' --output text 2>/dev/null | grep -q "arn:"; then
        POLICY_ARN=$(aws iam list-attached-role-policies --role-name "${ROLE_NAME}" --query 'AttachedPolicies[?PolicyName==`CodeBuildServicePolicy`].PolicyArn' --output text)
        print_info "Detaching policy: ${POLICY_ARN}"
        aws iam detach-role-policy --role-name "${ROLE_NAME}" --policy-arn "${POLICY_ARN}" 2>/dev/null || true
    fi
    
    # Delete role if it exists
    if aws iam get-role --role-name "${ROLE_NAME}" &>/dev/null; then
        print_info "Deleting existing role: ${ROLE_NAME}"
        aws iam delete-role --role-name "${ROLE_NAME}" 2>/dev/null || true
    fi
    
    # Delete policy if it exists
    if aws iam list-policies --scope Local --query 'Policies[?PolicyName==`CodeBuildServicePolicy`].Arn' --output text 2>/dev/null | grep -q "arn:"; then
        POLICY_ARN=$(aws iam list-policies --scope Local --query 'Policies[?PolicyName==`CodeBuildServicePolicy`].Arn' --output text)
        print_info "Deleting existing policy: ${POLICY_ARN}"
        aws iam delete-policy --policy-arn "${POLICY_ARN}" 2>/dev/null || true
    fi
    
    print_success "Cleanup completed"
}

# Create new role and policy
create_new_role() {
    print_info "Creating new CodeBuild role and policy..."
    
    # Create trust policy
    create_trust_policy
    
    # Create the role
    aws iam create-role \
        --role-name "${ROLE_NAME}" \
        --assume-role-policy-document file://trust-policy.json \
        --description "Service role for CodeBuild"
    
    print_success "Role created: ${ROLE_NAME}"
    
    # Create policy document
    create_policy
    
    # Create the policy
    POLICY_ARN=$(aws iam create-policy \
        --policy-name "CodeBuildServicePolicy" \
        --policy-document file://codebuild-policy.json \
        --query 'Policy.Arn' --output text)
    
    print_success "Policy created: ${POLICY_ARN}"
    
    # Attach policy to role
    aws iam attach-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-arn "${POLICY_ARN}"
    
    print_success "Policy attached to role"
    
    # Clean up temporary files
    rm -f trust-policy.json codebuild-policy.json
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

# Test the new role
test_role() {
    print_info "Testing the new role..."
    
    # Test role assumption
    ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text)
    
    if aws sts assume-role --role-arn "${ROLE_ARN}" --role-session-name "test-session" --duration-seconds 900 &>/dev/null; then
        print_success "Role assumption test passed"
    else
        print_error "Role assumption test failed"
        return 1
    fi
    
    # Test CodeBuild project creation
    TEMP_PROJECT="test-recreate-$(date +%s)"
    
    if aws codebuild create-project \
        --name "${TEMP_PROJECT}" \
        --source type=NO_SOURCE \
        --artifacts type=NO_ARTIFACTS \
        --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_SMALL \
        --service-role "${ROLE_NAME}" \
        --region "${REGION}" &>/dev/null; then
        
        print_success "CodeBuild project creation test passed"
        
        # Clean up
        aws codebuild delete-project --name "${TEMP_PROJECT}" --region "${REGION}" &>/dev/null
        return 0
    else
        print_error "CodeBuild project creation test failed"
        return 1
    fi
}

# Main function
main() {
    echo "🔄 Recreating CodeBuild Role from Scratch"
    echo "========================================="
    echo "Role Name: ${ROLE_NAME}"
    echo "Region: ${REGION}"
    echo "Timestamp: $(date)"
    echo ""
    
    print_warning "This will completely remove and recreate the CodeBuild role"
    print_warning "Any existing CodeBuild projects using this role will need to be updated"
    echo ""
    
    cleanup_existing
    echo ""
    
    create_new_role
    echo ""
    
    wait_for_role
    echo ""
    
    if test_role; then
        echo ""
        echo "🎉 CodeBuild Role Recreation Complete!"
        echo "====================================="
        echo "Role Name: ${ROLE_NAME}"
        echo "Role ARN: arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/${ROLE_NAME}"
        echo ""
        echo "📋 Next steps:"
        echo "1. Run the CodeBuild deployment script:"
        echo "   ./tools/deployment/deploy-codebuild.sh"
        echo ""
    else
        echo ""
        print_error "❌ Role testing failed"
        print_error "There may be a deeper issue with AWS permissions"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "1. Check your AWS credentials and permissions"
        echo "2. Ensure you have IAM and CodeBuild permissions"
        echo "3. Try running the diagnostic script:"
        echo "   ./tools/deployment/diagnose-codebuild-role.sh"
        exit 1
    fi
}

# Run main function
main "$@"
