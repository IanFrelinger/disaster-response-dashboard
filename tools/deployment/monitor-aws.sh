#!/bin/bash

# AWS Monitoring Script for Disaster Response Dashboard

set -e

echo "📊 Monitoring AWS Deployment"
echo "============================"
echo "Region: us-east-2"
echo ""

# Check CodeBuild status
echo "🔍 Checking CodeBuild status..."
LATEST_BUILD=$(aws codebuild list-builds-for-project \
    --project-name disaster-response-codebuild-demo \
    --region us-east-2 \
    --query 'ids[0]' \
    --output text)

if [ "$LATEST_BUILD" != "None" ]; then
    echo "Latest build: $LATEST_BUILD"
    
    BUILD_STATUS=$(aws codebuild batch-get-builds \
        --ids "$LATEST_BUILD" \
        --region us-east-2 \
        --query 'builds[0].buildStatus' \
        --output text)
    
    echo "Build status: $BUILD_STATUS"
    
    if [ "$BUILD_STATUS" = "SUCCEEDED" ]; then
        echo "✅ Build successful!"
        
        # Get ECR image info
        echo "📦 ECR Image Information:"
        aws ecr describe-images \
            --repository-name disaster-response-dashboard \
            --region us-east-2 \
            --query 'imageDetails[0].{ImageTag:imageTags[0],PushedAt:imagePushedAt,Size:imageSizeInBytes}' \
            --output table
    else
        echo "❌ Build status: $BUILD_STATUS"
        echo "View logs: https://console.aws.amazon.com/cloudwatch/home?region=us-east-2#logsV2:log-groups/log-group/\$252Faws\$252Fcodebuild\$252Fdisaster-response-codebuild-demo"
    fi
else
    echo "No builds found"
fi

# Check ElastiCache status
echo ""
echo "🔍 Checking ElastiCache status..."
CLUSTER_NAME="disaster-response-cache"

if aws elasticache describe-cache-clusters \
    --cache-cluster-id "$CLUSTER_NAME" \
    --region us-east-2 > /dev/null 2>&1; then
    
    CLUSTER_STATUS=$(aws elasticache describe-cache-clusters \
        --cache-cluster-id "$CLUSTER_NAME" \
        --region us-east-2 \
        --query 'CacheClusters[0].CacheClusterStatus' \
        --output text)
    
    echo "ElastiCache status: $CLUSTER_STATUS"
    
    if [ "$CLUSTER_STATUS" = "available" ]; then
        ENDPOINT=$(aws elasticache describe-cache-clusters \
            --cache-cluster-id "$CLUSTER_NAME" \
            --show-cache-node-info \
            --region us-east-2 \
            --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' \
            --output text)
        echo "✅ ElastiCache available at: $ENDPOINT"
    fi
else
    echo "❌ ElastiCache cluster not found"
    echo "Run: ./tools/deployment/setup-elasticache.sh"
fi

echo ""
echo "📋 Quick Commands:"
echo "Deploy: ./tools/deployment/deploy-aws.sh"
echo "Setup ElastiCache: ./tools/deployment/setup-elasticache.sh"
echo "View CodeBuild: https://console.aws.amazon.com/codesuite/codebuild/projects/disaster-response-codebuild-demo/history?region=us-east-2"
