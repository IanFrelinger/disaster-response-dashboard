#!/bin/bash

# Disaster Response Dashboard - AWS IAM Setup Script
# Creates IAM user with proper permissions for deployment
# Run this with your root/admin AWS credentials

set -e

# Configuration
SCRIPT_NAME="setup-aws-iam.sh"
IAM_USER_NAME="disaster-dashboard-deployer"
POLICY_NAME="DisasterDashboardDeploymentPolicy"
AWS_REGION=${AWS_REGION:-"us-east-1"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking AWS CLI setup prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws >/dev/null 2>&1; then
        print_error "AWS CLI is not installed. Please install it first."
        print_error "Run: brew install awscli"
        exit 1
    fi
    print_success "AWS CLI found"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    print_success "AWS credentials configured"
    
    # Check if we have admin/root access
    local caller_identity=$(aws sts get-caller-identity --query 'Arn' --output text)
    print_status "Current AWS identity: $caller_identity"
    
    # Check if we can create IAM resources
    if ! aws iam list-users --max-items 1 >/dev/null 2>&1; then
        print_error "Insufficient permissions. You need IAM permissions to create users and policies."
        print_error "Please ensure your AWS credentials have IAM:CreateUser, IAM:CreatePolicy, etc."
        exit 1
    fi
    print_success "IAM permissions confirmed"
    
    print_success "All prerequisites satisfied"
}

# Function to create custom policy
create_custom_policy() {
    print_header "Creating Custom IAM Policy"
    echo "================================="
    
    print_status "Creating custom policy for disaster dashboard deployment..."
    
    # Create policy document
    cat > disaster-dashboard-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "apprunner:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:CreateRepository",
                "ecr:DescribeRepositories",
                "ecr:ListRepositories"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": "arn:aws:iam::*:role/ecsTaskExecutionRole"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:PutRetentionPolicy"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:PutDashboard",
                "cloudwatch:DeleteDashboards",
                "cloudwatch:GetDashboard"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sns:CreateTopic",
                "sns:Subscribe",
                "sns:ListTopics"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "budgets:CreateBudget",
                "budgets:DescribeBudgets"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sts:GetCallerIdentity"
            ],
            "Resource": "*"
        }
    ]
}
EOF
    
    # Create the policy
    if aws iam create-policy \
        --policy-name "$POLICY_NAME" \
        --policy-document file://disaster-dashboard-policy.json \
        --description "Policy for disaster response dashboard deployment" >/dev/null 2>&1; then
        print_success "Custom policy created: $POLICY_NAME"
    else
        print_warning "Policy may already exist, checking..."
        if aws iam get-policy --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$POLICY_NAME" >/dev/null 2>&1; then
            print_success "Policy already exists: $POLICY_NAME"
        else
            print_error "Failed to create policy"
            exit 1
        fi
    fi
    
    # Clean up policy file
    rm -f disaster-dashboard-policy.json
    
    print_success "Custom policy setup complete"
}

# Function to create IAM user
create_iam_user() {
    print_header "Creating IAM User"
    echo "======================"
    
    print_status "Creating IAM user: $IAM_USER_NAME"
    
    # Check if user already exists
    if aws iam get-user --user-name "$IAM_USER_NAME" >/dev/null 2>&1; then
        print_warning "User $IAM_USER_NAME already exists"
        read -p "Do you want to continue with existing user? (yes/no): " continue_existing
        
        if [ "$continue_existing" != "yes" ]; then
            print_status "Exiting. You can manually delete the user and run again."
            exit 0
        fi
    else
        # Create the user
        if aws iam create-user --user-name "$IAM_USER_NAME" >/dev/null 2>&1; then
            print_success "IAM user created: $IAM_USER_NAME"
        else
            print_error "Failed to create IAM user"
            exit 1
        fi
    fi
    
    print_success "IAM user setup complete"
}

# Function to attach policies
attach_policies() {
    print_header "Attaching Policies to User"
    echo "================================="
    
    print_status "Attaching policies to user: $IAM_USER_NAME"
    
    # Get account ID
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local policy_arn="arn:aws:iam::$account_id:policy/$POLICY_NAME"
    
    # Attach custom policy
    print_status "Attaching custom policy..."
    if aws iam attach-user-policy \
        --user-name "$IAM_USER_NAME" \
        --policy-arn "$policy_arn" >/dev/null 2>&1; then
        print_success "Custom policy attached"
    else
        print_warning "Policy may already be attached"
    fi
    
    print_success "Policy attachment complete"
}

# Function to create access keys
create_access_keys() {
    print_header "Creating Access Keys"
    echo "========================="
    
    print_status "Creating access keys for user: $IAM_USER_NAME"
    
    # Create access key
    local access_key_output=$(aws iam create-access-key --user-name "$IAM_USER_NAME" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Extract credentials
        local access_key_id=$(echo "$access_key_output" | jq -r '.AccessKey.AccessKeyId')
        local secret_access_key=$(echo "$access_key_output" | jq -r '.AccessKey.SecretAccessKey')
        
        if [ "$access_key_id" != "null" ] && [ "$secret_access_key" != "null" ]; then
            print_success "Access keys created successfully"
            
            # Save credentials to file
            cat > .aws-credentials.txt << EOF
# Disaster Dashboard Deployment Credentials
# Generated on: $(date)
# User: $IAM_USER_NAME

AWS_ACCESS_KEY_ID=$access_key_id
AWS_SECRET_ACCESS_KEY=$secret_access_key
AWS_DEFAULT_REGION=$AWS_REGION

# Configure with: aws configure --profile disaster-dashboard
# Or set environment variables:
# export AWS_ACCESS_KEY_ID=$access_key_id
# export AWS_SECRET_ACCESS_KEY=$secret_access_key
# export AWS_DEFAULT_REGION=$AWS_REGION
EOF
            
            print_success "Credentials saved to .aws-credentials.txt"
            print_warning "Keep this file secure and don't commit it to version control!"
            
            # Show next steps
            echo ""
            print_header "Next Steps"
            echo "==========="
            echo "1. Configure AWS CLI with new credentials:"
            echo "   aws configure --profile disaster-dashboard"
            echo ""
            echo "2. Or set environment variables:"
            echo "   export AWS_ACCESS_KEY_ID=$access_key_id"
            echo "   export AWS_SECRET_ACCESS_KEY=$secret_access_key"
            echo "   export AWS_DEFAULT_REGION=$AWS_REGION"
            echo ""
            echo "3. Test the setup:"
            echo "   aws sts get-caller-identity --profile disaster-dashboard"
            echo ""
            echo "4. Deploy your dashboard:"
            echo "   ./tools/deployment/deploy-friends-demo.sh"
            
        else
            print_error "Failed to extract access key information"
            exit 1
        fi
    else
        print_error "Failed to create access keys"
        exit 1
    fi
}

# Function to show security recommendations
show_security_recommendations() {
    print_header "Security Recommendations"
    echo "============================="
    
    echo ""
    echo "🔒 Security Best Practices:"
    echo "==========================="
    echo ""
    echo "✅ Use the new IAM user instead of root credentials"
    echo "✅ Keep .aws-credentials.txt secure and local only"
    echo "✅ Never commit credentials to version control"
    echo "✅ Consider using AWS SSO for production environments"
    echo "✅ Regularly rotate access keys"
    echo "✅ Monitor usage in AWS CloudTrail"
    echo ""
    echo "🚨 Important:"
    echo "   - Delete .aws-credentials.txt when done"
    echo "   - Use 'aws configure --profile disaster-dashboard' for isolation"
    echo "   - The IAM user has minimal required permissions only"
    echo ""
}

# Main execution
main() {
    echo "🔐 Disaster Response Dashboard - AWS IAM Setup"
    echo "=============================================="
    echo "This script will create an IAM user with proper permissions"
    echo "Script: $SCRIPT_NAME"
    echo "Region: $AWS_REGION"
    echo "Timestamp: $(date)"
    echo ""
    
    print_warning "IMPORTANT: This script requires AWS credentials with IAM permissions!"
    print_warning "If you're using root credentials, consider creating an admin user first."
    echo ""
    
    read -p "Continue with IAM setup? (yes/no): " confirm_setup
    
    if [ "$confirm_setup" != "yes" ]; then
        print_status "Setup cancelled"
        exit 0
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Create resources
    create_custom_policy
    create_iam_user
    attach_policies
    create_access_keys
    
    # Show recommendations
    show_security_recommendations
    
    print_success "AWS IAM setup complete! 🎉"
    print_status "You can now deploy your disaster response dashboard safely."
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --region)
            AWS_REGION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--region REGION]"
            echo "  --region REGION  AWS region (default: us-east-1)"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
