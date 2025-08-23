#!/bin/bash

# AWS Configuration Setup Script
# For CodeBuild deployment in us-east-2 with ElastiCache

set -e

echo "🔧 Setting up AWS Configuration for Disaster Response Dashboard"
echo "================================================================"
echo "Region: us-east-2"
echo "Account: 910230629863"
echo "Deployment: AWS CodeBuild"
echo "Caching: ElastiCache (Redis)"
echo "Database: None (local storage)"
echo ""

# Create production environment file
echo "📝 Creating production environment file..."
cat > backend/.env.production.final << 'EOF'
# Production Environment Variables for AWS CodeBuild Deployment
# Region: us-east-2
# Account: 910230629863

# Core Flask Settings
FLASK_ENV=production
FLASK_DEBUG=false
SECRET_KEY=e8ea7fefb8378ec9cabad1ee4e91de4474bec97c248b3c81397741ebb0370ac6

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=false

# Security
ENABLE_CORS=true
# Using AWS CodeBuild default domain - update if you get a custom domain later
CORS_ORIGINS=https://*.us-east-2.elasticbeanstalk.com,https://*.us-east-2.awsapprunner.com

# External APIs
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY21lbXRqYXI5MHdjdjJpcHRnYXpmOHZlbyJ9.89NobMdR1h0QuukKth0RBA
MAPBOX_STYLE_URL=mapbox://styles/mapbox/dark-v11

# AWS ElastiCache Configuration (Redis)
# Update these with your actual ElastiCache endpoint when you create it
REDIS_URL=redis://your-elasticache-endpoint.us-east-2.cache.amazonaws.com:6379
REDIS_HOST=your-elasticache-endpoint.us-east-2.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password
REDIS_DB=0

# AWS Region
AWS_REGION=us-east-2
AWS_ACCOUNT_ID=910230629863

# Logging
LOG_LEVEL=INFO
ENABLE_STRUCTURED_LOGGING=true

# Performance
ENABLE_CACHING=true
CACHE_TTL=3600
MAX_CONNECTIONS=100

# Security Headers
ENABLE_SECURITY_HEADERS=true
ENABLE_RATE_LIMITING=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900
EOF

echo "✅ Production environment file created: backend/.env.production.final"

# Create ElastiCache setup script
echo "📝 Creating ElastiCache setup script..."
cat > tools/deployment/setup-elasticache.sh << 'EOF'
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
EOF

chmod +x tools/deployment/setup-elasticache.sh
echo "✅ ElastiCache setup script created: tools/deployment/setup-elasticache.sh"

# Create AWS deployment script
echo "📝 Creating AWS deployment script..."
cat > tools/deployment/deploy-aws.sh << 'EOF'
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
EOF

chmod +x tools/deployment/deploy-aws.sh
echo "✅ AWS deployment script created: tools/deployment/deploy-aws.sh"

# Create AWS monitoring script
echo "📝 Creating AWS monitoring script..."
cat > tools/deployment/monitor-aws.sh << 'EOF'
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
EOF

chmod +x tools/deployment/monitor-aws.sh
echo "✅ AWS monitoring script created: tools/deployment/monitor-aws.sh"

echo ""
echo "🎉 AWS Configuration Setup Complete!"
echo "===================================="
echo ""
echo "📋 Next Steps:"
echo "1. Set up ElastiCache: ./tools/deployment/setup-elasticache.sh"
echo "2. Deploy to AWS: ./tools/deployment/deploy-aws.sh"
echo "3. Monitor deployment: ./tools/deployment/monitor-aws.sh"
echo ""
echo "📁 Files created:"
echo "- backend/.env.production.final (production environment)"
echo "- tools/deployment/setup-elasticache.sh (ElastiCache setup)"
echo "- tools/deployment/deploy-aws.sh (AWS deployment)"
echo "- tools/deployment/monitor-aws.sh (AWS monitoring)"
echo ""
echo "🔒 Security Note: Update the Redis password in .env.production.final"
echo "   after running the ElastiCache setup script."
