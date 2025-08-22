#!/bin/bash

# CodeBuild Debug Script for CloudShell
# This script helps troubleshoot build failures

set -e

echo "🔍 CodeBuild Debug Script for CloudShell"
echo "========================================"
echo ""

# Check if build ID was provided
if [ -z "$1" ]; then
    echo "❌ Please provide a build ID"
    echo "Usage: ./debug-build-cloudshell.sh <build-id>"
    echo "Example: ./debug-build-cloudshell.sh disaster-response-codebuild-demo:3f3dfc1f-3689-45ad-bd7b-a7cbe438d94d"
    exit 1
fi

BUILD_ID="$1"
echo "🔍 Debugging build: $BUILD_ID"
echo ""

# Get build details
echo "📊 Build Details:"
echo "=================="
aws codebuild batch-get-builds --ids "$BUILD_ID" --region us-east-2 --query 'builds[0].{Status:buildStatus,Phase:currentPhase,PhaseStatus:currentPhaseStatus,StartTime:startTime,EndTime:endTime,Source:source.location}' --output table

echo ""

# Get build logs link
echo "📖 Build Logs:"
echo "=============="
LOG_LINK=$(aws codebuild batch-get-builds --ids "$BUILD_ID" --region us-east-2 --query 'builds[0].logs.deepLink' --output text)
echo "Logs URL: $LOG_LINK"

echo ""

# Check if build failed and get error details
BUILD_STATUS=$(aws codebuild batch-get-builds --ids "$BUILD_ID" --region us-east-2 --query 'builds[0].buildStatus' --output text)

if [ "$BUILD_STATUS" = "FAILED" ]; then
    echo "❌ Build Failed - Common Issues and Solutions:"
    echo "=============================================="
    echo ""
    echo "1. 🔐 ECR Authentication Issues:"
    echo "   - Check if CodeBuild role has ECR permissions"
    echo "   - Verify ECR repository exists"
    echo ""
    echo "2. 🐳 Docker Build Issues:"
    echo "   - Check if Dockerfile.simple exists"
    echo "   - Verify all dependencies in requirements.txt"
    echo "   - Check for system package installation issues"
    echo ""
    echo "3. 📦 Resource Issues:"
    echo "   - Build timeout (default: 60 minutes)"
    - Memory/CPU constraints
    echo ""
    echo "4. 🌐 Network Issues:"
    echo "   - VPC configuration problems"
    echo "   - Security group restrictions"
    echo ""
    echo "🔧 Quick Fixes to Try:"
    echo "======================="
    echo ""
    echo "1. Check the build logs at the URL above"
    echo "2. Verify ECR repository exists:"
    echo "   aws ecr describe-repositories --repository-names disaster-response-dashboard --region us-east-2"
    echo ""
    echo "3. Check CodeBuild project configuration:"
    echo "   aws codebuild batch-get-projects --names disaster-response-codebuild-demo --region us-east-2"
    echo ""
    echo "4. Try rebuilding with:"
    echo "   ./tools/deployment/deploy-aws.sh"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. View the build logs at the URL above"
echo "2. Look for specific error messages"
echo "3. Check if it's a dependency, permission, or resource issue"
echo "4. Fix the issue and redeploy"
