#!/bin/bash

# Quick AWS Deployment Script
set -e

echo "🚀 Starting AWS deployment for Disaster Response Frontend..."

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install and configure AWS CLI first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Set default values
AWS_REGION=${AWS_DEFAULT_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
ECR_REPO_NAME="disaster-response-frontend"
CLUSTER_NAME="disaster-response-cluster"
SERVICE_NAME="disaster-response-frontend"

# Validate AWS configuration
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "❌ AWS_ACCOUNT_ID not set. Please set it in your environment or .env.production file."
    exit 1
fi

echo "📍 AWS Region: $AWS_REGION"
echo "🏢 AWS Account: $AWS_ACCOUNT_ID"

# Build the application
echo "🔨 Building production application..."
./scripts/build-production.sh

# Build and tag Docker image
echo "🐳 Building Docker image..."
docker build -t $ECR_REPO_NAME:latest .

# Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Tag and push to ECR
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"
echo "📤 Pushing image to ECR: $ECR_URI"
docker tag $ECR_REPO_NAME:latest $ECR_URI:latest
docker push $ECR_URI:latest

# Update ECS service (if it exists)
echo "🔄 Updating ECS service..."
if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION &> /dev/null; then
    echo "📋 Updating ECS service..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $AWS_REGION
    
    echo "⏳ Waiting for service to stabilize..."
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION
    
    echo "✅ ECS service updated successfully!"
else
    echo "⚠️  ECS service not found. Please create it first using the AWS console or CLI."
    echo "   Use the taskdef.json and appspec.yml files as templates."
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Verify the service is running: aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"
echo "2. Check the service logs in CloudWatch"
echo "3. Test the health endpoint"
echo "4. Monitor the application performance"
