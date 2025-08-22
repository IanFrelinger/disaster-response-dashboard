#!/bin/bash

# AWS Deployment Script for Disaster Response Dashboard

set -e

echo "🚀 Deploying Disaster Response Dashboard to AWS"
echo "==============================================="
echo "Region: us-east-2"
echo "Account: 910230629863"
echo ""

# Check if environment file exists
if [ ! -f "backend/.env.production.final" ]; then
    echo "❌ Production environment file not found!"
    echo "Run: ./tools/deployment/setup-aws-config.sh first"
    exit 1
fi

echo "✅ Production environment file found"

# Deploy to CodeBuild
echo "📦 Deploying to AWS CodeBuild..."
./tools/deployment/deploy-codebuild-simple.sh

echo ""
echo "🎉 Deployment initiated!"
echo "========================="
echo "Next steps:"
echo "1. Monitor the build: Check the CodeBuild console"
echo "2. Set up ElastiCache: ./tools/deployment/setup-elasticache.sh"
echo "3. Update environment with ElastiCache details"
echo "4. Test your deployed application"
