#!/bin/bash

# ElastiCache Setup Script for CloudShell
# No AWS CLI configuration needed - uses CloudShell's built-in AWS access

set -e

echo "🔧 Setting up ElastiCache for Disaster Response Dashboard (CloudShell)"
echo "====================================================================="
echo "Region: us-east-2"
echo "Account: 910230629863"
echo "Environment: CloudShell"
echo ""

# Verify we're in CloudShell
if [ -z "$AWS_DEFAULT_REGION" ]; then
    export AWS_DEFAULT_REGION=us-east-2
    echo "📝 Setting AWS region to us-east-2"
fi

echo "✅ AWS region: $AWS_DEFAULT_REGION"

# Create ElastiCache subnet group
echo "📝 Creating ElastiCache subnet group..."
SUBNET_GROUP_NAME="disaster-response-cache-subnet-group"

# Get default VPC subnets
echo "🔍 Getting default VPC subnets..."
DEFAULT_VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text --region us-east-2)
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$DEFAULT_VPC_ID" --query 'Subnets[0:2].SubnetId' --output text --region us-east-2)

echo "Default VPC: $DEFAULT_VPC_ID"
echo "Subnets: $SUBNET_IDS"

# Create subnet group
echo "Creating subnet group..."
aws elasticache create-cache-subnet-group \
    --cache-subnet-group-name "$SUBNET_GROUP_NAME" \
    --cache-subnet-group-description "Subnet group for disaster response cache" \
    --subnet-ids $SUBNET_IDS \
    --region us-east-2 2>/dev/null || echo "✅ Subnet group already exists"

echo "✅ Subnet group ready"

# Create ElastiCache cluster
echo "📝 Creating ElastiCache cluster..."
CLUSTER_NAME="disaster-response-cache"

echo "Creating ElastiCache cluster..."
aws elasticache create-cache-cluster \
    --cache-cluster-id "$CLUSTER_NAME" \
    --engine redis \
    --cache-node-type cache.t3.micro \
    --num-cache-nodes 1 \
    --cache-subnet-group-name "$SUBNET_GROUP_NAME" \
    --port 6379 \
    --region us-east-2 2>/dev/null || echo "✅ Cluster already exists"

echo "✅ ElastiCache cluster created/verified"

# Wait for cluster to be available
echo "⏳ Waiting for cluster to be available..."
aws elasticache wait cache-cluster-available \
    --cache-cluster-id "$CLUSTER_NAME" \
    --region us-east-2

# Get cluster endpoint
echo "🔍 Getting cluster endpoint..."
ENDPOINT=$(aws elasticache describe-cache-clusters \
    --cache-cluster-id "$CLUSTER_NAME" \
    --region us-east-2 \
    --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' \
    --output text)

echo "✅ ElastiCache endpoint: $ENDPOINT"

# Generate Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)

echo ""
echo "🎉 ElastiCache Setup Complete!"
echo "=============================="
echo "Cluster Name: $CLUSTER_NAME"
echo "Endpoint: $ENDPOINT"
echo "Port: 6379"
echo "Password: $REDIS_PASSWORD"
echo ""

# Update the production environment file
echo "📝 Updating production environment file..."
sed -i "s|REDIS_HOST=your-elasticache-endpoint.us-east-2.cache.amazonaws.com|REDIS_HOST=$ENDPOINT|g" backend/.env.production.final
sed -i "s|REDIS_PASSWORD=your-secure-redis-password|REDIS_PASSWORD=$REDIS_PASSWORD|g" backend/.env.production.final

echo "✅ Environment file updated with ElastiCache details"

# Show the updated Redis configuration
echo ""
echo "📋 Updated Redis Configuration:"
grep -E "REDIS_(HOST|PASSWORD)" backend/.env.production.final

echo ""
echo "🔒 Password stored in backend/.env.production.final"
echo "⚠️  Keep this file secure and never commit it to git!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy to AWS: ./tools/deployment/deploy-aws.sh"
echo "2. Monitor deployment: ./tools/deployment/monitor-aws.sh"
echo "3. Test your deployed application"
