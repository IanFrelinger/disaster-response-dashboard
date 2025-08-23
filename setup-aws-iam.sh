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
