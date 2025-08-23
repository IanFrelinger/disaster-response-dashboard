#!/bin/bash

# AWS Deployment Setup Script for Disaster Response Frontend
# Run this script to set up your AWS environment for deployment

set -e

echo "🚀 Setting up AWS deployment environment for Disaster Response Frontend..."
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not found. Please install AWS CLI first:"
    echo "  https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker first:"
    echo "  https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ first:"
    echo "  https://nodejs.org/"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm first."
    exit 1
fi

print_success "All prerequisites are installed!"

# AWS Configuration
print_status "Configuring AWS environment..."

# Get AWS region
read -p "Enter your AWS region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

# Get AWS account ID
read -p "Enter your AWS account ID: " AWS_ACCOUNT_ID
if [ -z "$AWS_ACCOUNT_ID" ]; then
    print_error "AWS account ID is required!"
    exit 1
fi

# Set environment variables
export AWS_DEFAULT_REGION=$AWS_REGION
export AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID

print_success "AWS region: $AWS_REGION"
print_success "AWS account ID: $AWS_ACCOUNT_ID"

# Verify AWS credentials
print_status "Verifying AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured or invalid!"
    echo "Please run: aws configure"
    exit 1
fi

print_success "AWS credentials verified!"

# Navigate to frontend directory
print_status "Navigating to frontend directory..."
cd "$(dirname "$0")/../../frontend" || {
    print_error "Failed to navigate to frontend directory!"
    exit 1
}

print_success "Working in: $(pwd)"

# Create production environment file
print_status "Setting up production environment..."

if [ ! -f ".env.production" ]; then
    cp env.production .env.production
    print_success "Created .env.production from template"
else
    print_warning ".env.production already exists, skipping..."
fi

# Update environment file with AWS configuration
sed -i.bak "s/REGION/$AWS_REGION/g" .env.production 2>/dev/null || sed -i '' "s/REGION/$AWS_REGION/g" .env.production
sed -i.bak "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" .env.production 2>/dev/null || sed -i '' "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" .env.production

print_success "Updated .env.production with AWS configuration"

# Create AWS infrastructure
print_status "Creating AWS infrastructure..."

# Create ECR repository
print_status "Creating ECR repository..."
if aws ecr describe-repositories --repository-names disaster-response-frontend --region $AWS_REGION &> /dev/null; then
    print_warning "ECR repository 'disaster-response-frontend' already exists"
else
    aws ecr create-repository \
        --repository-name disaster-response-frontend \
        --region $AWS_REGION
    print_success "ECR repository created successfully"
fi

# Create ECS cluster
print_status "Creating ECS cluster..."
if aws ecs describe-clusters --clusters disaster-response-cluster --region $AWS_REGION &> /dev/null; then
    print_warning "ECS cluster 'disaster-response-cluster' already exists"
else
    aws ecs create-cluster \
        --cluster-name disaster-response-cluster \
        --region $AWS_REGION
    print_success "ECS cluster created successfully"
fi

# Create IAM roles
print_status "Setting up IAM roles..."

# Create trust policy file
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create ECS Task Execution Role
if aws iam get-role --role-name ecsTaskExecutionRole &> /dev/null; then
    print_warning "IAM role 'ecsTaskExecutionRole' already exists"
else
    aws iam create-role \
        --role-name ecsTaskExecutionRole \
        --assume-role-policy-document file://trust-policy.json
    
    aws iam attach-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    
    print_success "ECS Task Execution Role created successfully"
fi

# Create ECS Task Role
if aws iam get-role --role-name ecsTaskRole &> /dev/null; then
    print_warning "IAM role 'ecsTaskRole' already exists"
else
    aws iam create-role \
        --role-name ecsTaskRole \
        --assume-role-policy-document file://trust-policy.json
    
    # Attach basic policies (customize as needed)
    aws iam attach-role-policy \
        --role-name ecsTaskRole \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
    
    print_success "ECS Task Role created successfully"
fi

# Clean up temporary files
rm -f trust-policy.json

# Update task definition with actual values
print_status "Updating task definition..."
sed -i.bak "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" taskdef.json 2>/dev/null || sed -i '' "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" taskdef.json
sed -i.bak "s/REGION/$AWS_REGION/g" taskdef.json 2>/dev/null || sed -i '' "s/REGION/$AWS_REGION/g" taskdef.json

print_success "Task definition updated with AWS configuration"

# Test local production build
print_status "Testing local production build..."
if [ -f "scripts/build-production.sh" ]; then
    chmod +x scripts/build-production.sh
    ./scripts/build-production.sh
    print_success "Local production build completed successfully!"
else
    print_error "Production build script not found!"
    exit 1
fi

# Test production container
print_status "Testing production container..."
if [ -f "docker-compose.production.yml" ]; then
    print_status "Starting production container for testing..."
    docker-compose -f docker-compose.production.yml up -d --build
    
    # Wait for container to be ready
    print_status "Waiting for container to be ready..."
    sleep 30
    
    # Test health endpoint
    if curl -f http://localhost:8080/health &> /dev/null; then
        print_success "Production container is healthy!"
    else
        print_warning "Health check failed, but container is running"
    fi
    
    # Stop container
    docker-compose -f docker-compose.production.yml down
else
    print_error "Production Docker Compose file not found!"
    exit 1
fi

# Create deployment script
print_status "Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

# Quick deployment script
set -e

echo "🚀 Deploying to AWS..."

# Load environment variables
source .env.production

# Build and deploy
./scripts/deploy-aws.sh

echo "✅ Deployment completed!"
EOF

chmod +x deploy.sh

print_success "Deployment script created: ./deploy.sh"

# Summary
echo ""
echo "=================================================================="
print_success "AWS deployment environment setup completed!"
echo "=================================================================="
echo ""
echo "📋 Next steps:"
echo "1. Update your .env.production file with actual API keys and secrets"
echo "2. Create secrets in AWS Secrets Manager for sensitive data"
echo "3. Set up your VPC and security groups"
echo "4. Configure your load balancer"
echo "5. Run deployment: ./deploy.sh"
echo ""
echo "📚 Documentation:"
echo "- AWS_DEPLOYMENT_GUIDE.md - Complete deployment guide"
echo "- AWS_DEPLOYMENT_SUMMARY.md - Implementation summary"
echo ""
echo "🛠️  Useful commands:"
echo "- Test production build: ./scripts/build-production.sh"
echo "- Test container locally: docker-compose -f docker-compose.production.yml up --build"
echo "- Deploy to AWS: ./deploy.sh"
echo "- Check ECS status: aws ecs describe-services --cluster disaster-response-cluster --services disaster-response-frontend"
echo ""
print_success "Setup complete! Your frontend is ready for AWS deployment."
