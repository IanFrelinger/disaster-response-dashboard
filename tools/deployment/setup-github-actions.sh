#!/bin/bash

# GitHub Actions Pipeline Setup Script
# This script helps you set up the automated CI/CD pipeline

set -e

echo "🚀 Setting up GitHub Actions Pipeline for AWS Deployment..."
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "This script must be run from a git repository root!"
    exit 1
fi

# Get repository information
REPO_URL=$(git remote get-url origin)
REPO_NAME=$(basename -s .git "$REPO_URL")

print_success "Repository: $REPO_NAME"
print_success "Repository URL: $REPO_URL"

# Check if GitHub Actions directory exists
if [ ! -d ".github/workflows" ]; then
    print_status "Creating GitHub Actions directory..."
    mkdir -p .github/workflows
    print_success "Created .github/workflows directory"
fi

# Check if workflow files exist
FRONTEND_WORKFLOW=".github/workflows/deploy-frontend.yml"
BACKEND_WORKFLOW=".github/workflows/deploy-backend.yml"

if [ ! -f "$FRONTEND_WORKFLOW" ]; then
    print_error "Frontend workflow file not found: $FRONTEND_WORKFLOW"
    print_status "Please ensure the workflow files are in place before running this script."
    exit 1
fi

if [ ! -f "$BACKEND_WORKFLOW" ]; then
    print_error "Backend workflow file not found: $BACKEND_WORKFLOW"
    print_status "Please ensure the workflow files are in place before running this script."
    exit 1
fi

print_success "All workflow files are present!"

# Create AWS IAM user setup script
print_status "Creating AWS IAM user setup script..."
cat > setup-aws-iam.sh << 'EOF'
#!/bin/bash

# AWS IAM User Setup for GitHub Actions
echo "🔐 Setting up AWS IAM user for GitHub Actions..."

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"

# Create IAM user
echo "Creating IAM user: github-actions-deployer"
aws iam create-user --user-name github-actions-deployer

# Create access keys
echo "Creating access keys..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name github-actions-deployer)
ACCESS_KEY_ID=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')

echo "✅ IAM user created successfully!"
echo ""
echo "📋 IMPORTANT: Save these credentials securely!"
echo "Access Key ID: $ACCESS_KEY_ID"
echo "Secret Access Key: $SECRET_ACCESS_KEY"
echo ""

# Attach required policies
echo "Attaching required policies..."
aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS-FullAccess

aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess

aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

echo "✅ Policies attached successfully!"
echo ""
echo "🔑 Next steps:"
echo "1. Add these credentials to GitHub Secrets:"
echo "   - AWS_ACCESS_KEY_ID: $ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY: $SECRET_ACCESS_KEY"
echo "   - AWS_REGION: us-east-2 (or your preferred region)"
echo ""
echo "2. Push your code to trigger the first workflow run"
echo "3. Monitor the Actions tab in your GitHub repository"
EOF

chmod +x setup-aws-iam.sh

# Create GitHub secrets setup guide
print_status "Creating GitHub secrets setup guide..."
cat > GITHUB_SECRETS_SETUP.md << EOF
# GitHub Secrets Setup Guide

## 🔑 Required Secrets

Add these secrets to your GitHub repository:

1. Go to: \`https://github.com/$(echo $REPO_URL | sed 's/.*github\.com[:/]//' | sed 's/\.git$//')/settings/secrets/actions\`

2. Click "New repository secret" and add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| \`AWS_ACCESS_KEY_ID\` | \`AKIA...\` | AWS Access Key ID |
| \`AWS_SECRET_ACCESS_KEY\` | \`wJalr...\` | AWS Secret Access Key |
| \`AWS_REGION\` | \`us-east-2\` | AWS Region |

## 🚀 How to Add Secrets

1. **Navigate to your repository**
2. **Click Settings tab**
3. **Click Secrets and variables → Actions**
4. **Click "New repository secret"**
5. **Add each secret above**

## ✅ Verification

After adding secrets:
1. Make a small change to your code
2. Push to trigger the workflow
3. Check the Actions tab for progress
4. Monitor AWS ECR and ECS for deployment

## 🆘 Troubleshooting

- **Permission denied**: Check IAM user policies
- **ECR login failed**: Verify ECR repository exists
- **ECS update failed**: Check ECS service configuration
- **Build failed**: Review workflow logs in Actions tab
EOF

print_success "Created setup-aws-iam.sh script"
print_success "Created GITHUB_SECRETS_SETUP.md guide"

# Create quick test script
print_status "Creating quick test script..."
cat > test-pipeline.sh << 'EOF'
#!/bin/bash

# Quick Pipeline Test Script
echo "🧪 Testing GitHub Actions Pipeline..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository!"
    exit 1
fi

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 You have uncommitted changes. Committing them..."
    git add .
    git commit -m "test: Trigger pipeline test"
fi

# Push to trigger workflow
echo "🚀 Pushing to trigger workflow..."
git push

echo "✅ Push completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://github.com/$(git remote get-url origin | sed 's/.*github\.com[:/]//' | sed 's/\.git$//')/actions"
echo "2. Monitor the workflow run"
echo "3. Check AWS ECR for new images"
echo "4. Verify ECS service updates"
EOF

chmod +x test-pipeline.sh

# Summary
echo ""
echo "=================================================================="
print_success "GitHub Actions Pipeline Setup Complete!"
echo "=================================================================="
echo ""
echo "📋 What was created:"
echo "✅ setup-aws-iam.sh - Script to create AWS IAM user"
echo "✅ GITHUB_SECRETS_SETUP.md - Guide for GitHub secrets"
echo "✅ test-pipeline.sh - Script to test the pipeline"
echo ""
echo "🚀 Next steps:"
echo "1. Run: ./setup-aws-iam.sh (to create AWS IAM user)"
echo "2. Follow: GITHUB_SECRETS_SETUP.md (to add GitHub secrets)"
echo "3. Test: ./test-pipeline.sh (to trigger first deployment)"
echo ""
echo "📚 Documentation:"
echo "- docs/GITHUB_ACTIONS_SETUP.md - Complete setup guide"
echo "- .github/workflows/deploy-frontend.yml - Frontend workflow"
echo "- .github/workflows/deploy-backend.yml - Backend workflow"
echo ""
print_success "Your automated CI/CD pipeline is ready to deploy to AWS!"
