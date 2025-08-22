#!/usr/bin/env bash
set -Eeuo pipefail

REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-2}}"
PROJECT="disaster-response-codebuild-demo"

echo "🚀 Starting Fresh CodeBuild Deployment"
echo "======================================"
echo "Region: $REGION"
echo "Project: $PROJECT"
echo ""

# Start a new build
echo "📦 Starting new build..."
BUILD_ID=$(aws codebuild start-build --project-name "$PROJECT" --region "$REGION" --query 'build.id' --output text)
echo "✅ Build started: $BUILD_ID"
echo ""

# Get log details
echo "📋 Getting log details..."
GROUP=$(aws codebuild batch-get-builds --ids "$BUILD_ID" --region "$REGION" --query 'builds[0].logs.groupName' --output text)
STREAM=$(aws codebuild batch-get-builds --ids "$BUILD_ID" --region "$REGION" --query 'builds[0].logs.streamName' --output text)
echo "📊 Log Group: $GROUP"
echo "📊 Log Stream: $STREAM"
echo ""

# Show build status
echo "🔍 Current build status:"
aws codebuild batch-get-builds --ids "$BUILD_ID" --region "$REGION" \
  --query 'builds[0].{id:id, status:buildStatus, currentPhase:currentPhase, startTime:startTime}' \
  --output table

echo ""
echo "📺 Starting live log tail (Ctrl+C to stop)..."
echo "=============================================="

# Tail logs live
aws logs tail "$GROUP" --log-stream-names "$STREAM" --region "$REGION" --follow
