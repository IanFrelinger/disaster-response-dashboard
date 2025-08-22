#!/bin/bash

# CodeBuild IAM Role Setup Validation Tests
# Tests the setup-codebuild-role.sh script and validates the created resources

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
TESTS_PASSED=0
TESTS_FAILED=0

# Print functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_test_header() {
    echo ""
    echo "🧪 $1"
    echo "=================================================="
}

print_test_footer() {
    echo ""
    echo "📊 Test Results Summary"
    echo "======================="
    echo "✅ Tests Passed: $TESTS_PASSED"
    echo "❌ Tests Failed: $TESTS_FAILED"
    echo "📈 Success Rate: $(( (TESTS_PASSED * 100) / (TESTS_PASSED + TESTS_FAILED) ))%"
    echo ""
}

# Test 1: Prerequisites Check
test_prerequisites() {
    print_test_header "Testing Prerequisites"
    
    # Check AWS CLI
    if command -v aws >/dev/null 2>&1; then
        print_success "AWS CLI is installed"
    else
        print_error "AWS CLI is not installed"
        return 1
    fi
    
    # Check AWS credentials
    if aws sts get-caller-identity >/dev/null 2>&1; then
        print_success "AWS credentials are configured"
        ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        print_info "Account ID: $ACCOUNT_ID"
    else
        print_error "AWS credentials are not configured"
        return 1
    fi
    
    # Check jq
    if command -v jq >/dev/null 2>&1; then
        print_success "jq is installed"
    else
        print_warning "jq is not installed (some tests may fail)"
    fi
    
    # Check region
    if [ -n "$REGION" ]; then
        print_success "AWS region is set: $REGION"
    else
        print_error "AWS region is not set"
        return 1
    fi
}

# Test 2: Script Existence and Syntax
test_script_validation() {
    print_test_header "Testing Script Validation"
    
    SCRIPT_PATH="tools/deployment/setup-codebuild-role.sh"
    
    # Check if script exists
    if [ -f "$SCRIPT_PATH" ]; then
        print_success "Setup script exists: $SCRIPT_PATH"
    else
        print_error "Setup script not found: $SCRIPT_PATH"
        return 1
    fi
    
    # Check if script is executable
    if [ -x "$SCRIPT_PATH" ]; then
        print_success "Setup script is executable"
    else
        print_warning "Setup script is not executable (run: chmod +x $SCRIPT_PATH)"
    fi
    
    # Check script syntax
    if bash -n "$SCRIPT_PATH" 2>/dev/null; then
        print_success "Setup script has valid syntax"
    else
        print_error "Setup script has syntax errors"
        return 1
    fi
    
    # Check for required functions
    if grep -q "create_trust_policy" "$SCRIPT_PATH"; then
        print_success "Script contains create_trust_policy function"
    else
        print_error "Script missing create_trust_policy function"
    fi
    
    if grep -q "create_policy" "$SCRIPT_PATH"; then
        print_success "Script contains create_policy function"
    else
        print_error "Script missing create_policy function"
    fi
    
    if grep -q "create_role" "$SCRIPT_PATH"; then
        print_success "Script contains create_role function"
    else
        print_error "Script missing create_role function"
    fi
}

# Test 3: IAM Role Creation
test_iam_role_creation() {
    print_test_header "Testing IAM Role Creation"
    
    # Check if role exists
    if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
        print_success "IAM role exists: $ROLE_NAME"
        
        # Get role details
        ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
        print_info "Role ARN: $ROLE_ARN"
        
        # Check role path
        ROLE_PATH=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Path' --output text)
        if [ "$ROLE_PATH" = "/" ]; then
            print_success "Role has correct path: $ROLE_PATH"
        else
            print_warning "Role has unexpected path: $ROLE_PATH"
        fi
        
        # Check role description
        ROLE_DESC=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Description' --output text)
        if [ "$ROLE_DESC" = "Service role for CodeBuild" ]; then
            print_success "Role has correct description"
        else
            print_warning "Role has unexpected description: $ROLE_DESC"
        fi
    else
        print_error "IAM role does not exist: $ROLE_NAME"
        return 1
    fi
}

# Test 4: Trust Policy Validation
test_trust_policy() {
    print_test_header "Testing Trust Policy"
    
    # Get trust policy
    TRUST_POLICY=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.AssumeRolePolicyDocument' --output json 2>/dev/null)
    
    if [ -n "$TRUST_POLICY" ]; then
        print_success "Trust policy exists"
        
        # Check if CodeBuild service is allowed
        if echo "$TRUST_POLICY" | jq -e '.Statement[] | select(.Principal.Service == "codebuild.amazonaws.com")' >/dev/null 2>&1; then
            print_success "Trust policy allows CodeBuild service"
        else
            print_error "Trust policy does not allow CodeBuild service"
        fi
        
        # Check if sts:AssumeRole action is allowed
        if echo "$TRUST_POLICY" | jq -e '.Statement[] | select(.Action == "sts:AssumeRole")' >/dev/null 2>&1; then
            print_success "Trust policy allows sts:AssumeRole action"
        else
            print_error "Trust policy does not allow sts:AssumeRole action"
        fi
        
        # Display trust policy (formatted)
        print_info "Trust Policy:"
        echo "$TRUST_POLICY" | jq '.' 2>/dev/null || echo "$TRUST_POLICY"
    else
        print_error "Trust policy not found"
        return 1
    fi
}

# Test 5: Policy Creation and Attachment
test_policy_attachment() {
    print_test_header "Testing Policy Attachment"
    
    # Check if policy exists
    POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text 2>/dev/null)
    
    if [ -n "$POLICY_ARN" ] && [ "$POLICY_ARN" != "None" ]; then
        print_success "Policy exists: $POLICY_NAME"
        print_info "Policy ARN: $POLICY_ARN"
        
        # Check if policy is attached to role
        ATTACHED_POLICIES=$(aws iam list-attached-role-policies --role-name "$ROLE_NAME" --query "AttachedPolicies[?PolicyName=='$POLICY_NAME'].PolicyArn" --output text 2>/dev/null)
        
        if [ -n "$ATTACHED_POLICIES" ] && [ "$ATTACHED_POLICIES" != "None" ]; then
            print_success "Policy is attached to role"
        else
            print_error "Policy is not attached to role"
        fi
    else
        print_error "Policy does not exist: $POLICY_NAME"
        return 1
    fi
}

# Test 6: Policy Permissions Validation
test_policy_permissions() {
    print_test_header "Testing Policy Permissions"
    
    # Get policy document
    POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text 2>/dev/null)
    
    if [ -n "$POLICY_ARN" ] && [ "$POLICY_ARN" != "None" ]; then
        POLICY_VERSION=$(aws iam get-policy --policy-arn "$POLICY_ARN" --query 'Policy.DefaultVersionId' --output text 2>/dev/null)
        POLICY_DOC=$(aws iam get-policy-version --policy-arn "$POLICY_ARN" --version-id "$POLICY_VERSION" --query 'PolicyVersion.Document' --output json 2>/dev/null)
        
        if [ -n "$POLICY_DOC" ]; then
            print_success "Policy document retrieved"
            
            # Check for required permissions
            REQUIRED_PERMISSIONS=(
                "logs:CreateLogGroup"
                "logs:CreateLogStream"
                "logs:PutLogEvents"
                "ecr:GetAuthorizationToken"
                "ecr:BatchCheckLayerAvailability"
                "ecr:GetDownloadUrlForLayer"
                "ecr:BatchGetImage"
                "ecr:PutImage"
                "s3:GetObject"
                "s3:GetObjectVersion"
                "s3:PutObject"
            )
            
            for permission in "${REQUIRED_PERMISSIONS[@]}"; do
                if echo "$POLICY_DOC" | jq -e ".Statement[] | select(.Action[]? | contains(\"$permission\"))" >/dev/null 2>&1; then
                    print_success "Policy includes permission: $permission"
                else
                    print_error "Policy missing permission: $permission"
                fi
            done
            
            # Display policy document (formatted)
            print_info "Policy Document:"
            echo "$POLICY_DOC" | jq '.' 2>/dev/null || echo "$POLICY_DOC"
        else
            print_error "Could not retrieve policy document"
        fi
    else
        print_error "Policy not found"
    fi
}

# Test 7: Role Assumption Test
test_role_assumption() {
    print_test_header "Testing Role Assumption"
    
    # Get role ARN
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null)
    
    if [ -n "$ROLE_ARN" ]; then
        print_info "Testing role assumption for: $ROLE_ARN"
        
        # Try to assume the role (this will fail in CloudShell, but we can test the trust policy)
        if aws sts assume-role --role-arn "$ROLE_ARN" --role-session-name "test-session" --duration-seconds 900 >/dev/null 2>&1; then
            print_success "Role assumption test passed"
        else
            print_warning "Role assumption test failed (expected in CloudShell)"
            print_info "This is normal in CloudShell - the role can still be used by CodeBuild"
        fi
    else
        print_error "Could not get role ARN"
    fi
}

# Test 8: CodeBuild Integration Test
test_codebuild_integration() {
    print_test_header "Testing CodeBuild Integration"
    
    # Test if CodeBuild can use the role
    TEST_PROJECT_NAME="test-codebuild-project-$(date +%s)"
    
    # Create a minimal buildspec for testing
    cat > test-buildspec.yml << EOF
version: 0.2
phases:
  build:
    commands:
      - echo "Hello World"
artifacts:
  files:
    - '**/*'
EOF
    
    # Try to create a test CodeBuild project
    if aws codebuild create-project \
        --name "$TEST_PROJECT_NAME" \
        --region "$REGION" \
        --source type=GITHUB,location=https://github.com/IanFrelinger/disaster-response-dashboard.git,buildspec=test-buildspec.yml \
        --artifacts type=NO_ARTIFACTS \
        --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_SMALL,privilegedMode=true \
        --service-role "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$ROLE_NAME" >/dev/null 2>&1; then
        
        print_success "CodeBuild project creation test passed"
        
        # Clean up test project
        aws codebuild delete-project --name "$TEST_PROJECT_NAME" --region "$REGION" >/dev/null 2>&1 || true
        print_info "Test project cleaned up"
    else
        print_error "CodeBuild project creation test failed"
        print_info "This may indicate permission issues with the role"
    fi
    
    # Clean up test file
    rm -f test-buildspec.yml
}

# Test 9: Resource Cleanup Validation
test_cleanup_validation() {
    print_test_header "Testing Cleanup Validation"
    
    # Check if cleanup commands would work
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null)
    POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text 2>/dev/null)
    
    if [ -n "$ROLE_ARN" ] && [ -n "$POLICY_ARN" ]; then
        print_success "Cleanup commands are available:"
        print_info "Detach policy: aws iam detach-role-policy --role-name $ROLE_NAME --policy-arn $POLICY_ARN"
        print_info "Delete role: aws iam delete-role --role-name $ROLE_NAME"
        print_info "Delete policy: aws iam delete-policy --policy-arn $POLICY_ARN"
    else
        print_warning "Could not generate cleanup commands"
    fi
}

# Main test runner
main() {
    echo "🧪 CodeBuild IAM Role Setup Validation Tests"
    echo "============================================="
    echo "Role Name: $ROLE_NAME"
    echo "Policy Name: $POLICY_NAME"
    echo "Region: $REGION"
    echo "Timestamp: $(date)"
    echo ""
    
    # Run all tests
    test_prerequisites
    test_script_validation
    test_iam_role_creation
    test_trust_policy
    test_policy_attachment
    test_policy_permissions
    test_role_assumption
    test_codebuild_integration
    test_cleanup_validation
    
    # Print results
    print_test_footer
    
    # Exit with appropriate code
    if [ $TESTS_FAILED -eq 0 ]; then
        echo "🎉 All tests passed! The CodeBuild setup is ready."
        exit 0
    else
        echo "⚠️  Some tests failed. Please review the errors above."
        exit 1
    fi
}

# Run main function
main "$@"
