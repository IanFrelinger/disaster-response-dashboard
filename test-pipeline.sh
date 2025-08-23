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
