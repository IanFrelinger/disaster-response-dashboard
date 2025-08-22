#!/usr/bin/env bash
set -Eeuo pipefail

echo "🔧 Fixing ECR Permissions for CodeBuild"
echo "========================================"

# Check current attached policies
echo "📋 Current attached policies:"
aws iam list-attached-role-policies --role-name CodeBuildServiceRole \
  --query 'AttachedPolicies[].PolicyName' --output table

# Attach ECR PowerUser policy if not already attached
echo ""
echo "🔗 Attaching AmazonEC2ContainerRegistryPowerUser policy..."
aws iam attach-role-policy \
  --role-name CodeBuildServiceRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

# Verify the policy was attached
echo ""
echo "✅ Verifying policy attachment:"
aws iam list-attached-role-policies --role-name CodeBuildServiceRole \
  --query 'AttachedPolicies[].PolicyName' --output table

echo ""
echo "🎉 ECR permissions fixed! You can now start a new build."
echo ""
echo "📋 Next steps:"
echo "1. Start a new build: ./tools/deployment/deploy-aws.sh"
echo "2. Monitor the build: ./tools/deployment/monitor-aws.sh"
