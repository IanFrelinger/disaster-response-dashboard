#!/bin/bash

# ElastiCache Setup Script for Disaster Response Dashboard

set -e

echo "🔧 Setting up ElastiCache for Disaster Response Dashboard"
echo "========================================================="
echo "Region: us-east-2"
echo "Account: 910230629863"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

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
aws elasticache create-cache-subnet-group \
    --cache-subnet-group-name "$SUBNET_GROUP_NAME" \
    --cache-subnet-group-description "Subnet group for disaster response cache" \
    --subnet-ids $SUBNET_IDS \
    --region us-east-2 || echo "Subnet group may already exist"

echo "✅ Subnet group created/verified"

# Create ElastiCache cluster
echo "📝 Creating ElastiCache cluster..."
CLUSTER_NAME="disaster-response-cache"

aws elasticache create-cache-cluster \
    --cache-cluster-id "$CLUSTER_NAME" \
    --engine redis \
    --cache-node-type cache.t3.micro \
    --num-cache-nodes 1 \
    --cache-subnet-group-name "$SUBNET_GROUP_NAME" \
    --port 6379 \
    --region us-east-2 || echo "Cluster may already exist"

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
    --show-cache-node-info \
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
echo "📝 Update your backend/.env.production.final with:"
echo "REDIS_HOST=$ENDPOINT"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo ""
echo "🔒 Store the password securely - it won't be shown again!"
