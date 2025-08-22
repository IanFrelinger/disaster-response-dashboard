#!/bin/bash

# Disaster Response Dashboard - AWS Deployment Script
# This script helps deploy the dashboard to AWS using various methods

set -e

# Configuration
SCRIPT_NAME="deploy-to-aws.sh"
PROJECT_NAME="disaster-response-dashboard"
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking AWS deployment prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws >/dev/null 2>&1; then
        print_error "AWS CLI is not installed. Please install it first."
        print_error "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    print_success "AWS CLI found"
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker found"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    print_success "AWS credentials configured"
    
    # Get AWS account ID if not set
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        print_status "Detected AWS Account ID: $AWS_ACCOUNT_ID"
    fi
    
    print_success "All prerequisites satisfied"
}

# Function to create ECR repositories
create_ecr_repositories() {
    print_header "Creating ECR Repositories"
    echo "================================="
    
    local repositories=("disaster-response-backend" "disaster-response-frontend" "disaster-response-tileserver")
    
    for repo in "${repositories[@]}"; do
        print_status "Creating ECR repository: $repo"
        if aws ecr create-repository --repository-name "$repo" --region "$AWS_REGION" >/dev/null 2>&1; then
            print_success "Repository $repo created"
        else
            print_warning "Repository $repo may already exist"
        fi
    done
    
    print_success "ECR repositories setup complete"
}

# Function to build and push Docker images
build_and_push_images() {
    print_header "Building and Pushing Docker Images"
    echo "========================================="
    
    # Login to ECR
    print_status "Logging in to Amazon ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # Build images
    print_status "Building Docker images..."
    
    # Backend
    print_status "Building backend image..."
    cd backend
    docker build -t disaster-response-backend:latest .
    docker tag disaster-response-backend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-backend:latest"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-backend:latest"
    print_success "Backend image built and pushed"
    cd ..
    
    # Frontend
    print_status "Building frontend image..."
    cd frontend
    docker build -t disaster-response-frontend:latest .
    docker tag disaster-response-frontend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-frontend:latest"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-frontend:latest"
    print_success "Frontend image built and pushed"
    cd ..
    
    # Tile Server
    print_status "Building tile server image..."
    cd tiles
    docker build -t disaster-response-tileserver:latest .
    docker tag disaster-response-tileserver:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-tileserver:latest"
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-tileserver:latest"
    print_success "Tile server image built and pushed"
    cd ..
    
    print_success "All images built and pushed to ECR"
}

# Function to create ECS cluster
create_ecs_cluster() {
    print_header "Creating ECS Cluster"
    echo "=========================="
    
    print_status "Creating ECS cluster..."
    if aws ecs create-cluster --cluster-name disaster-response-cluster --region "$AWS_REGION" >/dev/null 2>&1; then
        print_success "ECS cluster created"
    else
        print_warning "ECS cluster may already exist"
    fi
    
    print_success "ECS cluster setup complete"
}

# Function to create IAM roles
create_iam_roles() {
    print_header "Creating IAM Roles"
    echo "========================"
    
    # Create task execution role
    print_status "Creating ECS task execution role..."
    
    # Check if role exists
    if ! aws iam get-role --role-name ecsTaskExecutionRole >/dev/null 2>&1; then
        aws iam create-role \
            --role-name ecsTaskExecutionRole \
            --assume-role-policy-document '{
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
            }'
        
        # Attach required policies
        aws iam attach-role-policy \
            --role-name ecsTaskExecutionRole \
            --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
        
        print_success "ECS task execution role created"
    else
        print_warning "ECS task execution role already exists"
    fi
    
    print_success "IAM roles setup complete"
}

# Function to create task definitions
create_task_definitions() {
    print_header "Creating Task Definitions"
    echo "=============================="
    
    # Create backend task definition
    print_status "Creating backend task definition..."
    cat > backend-task-definition.json << EOF
{
  "family": "disaster-response-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT_MODE",
          "value": "production"
        },
        {
          "name": "USE_SYNTHETIC_DATA",
          "value": "false"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/disaster-response-backend",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF
    
    # Create frontend task definition
    print_status "Creating frontend task definition..."
    cat > frontend-task-definition.json << EOF
{
  "family": "disaster-response-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "VITE_ENVIRONMENT_MODE",
          "value": "production"
        },
        {
          "name": "VITE_USE_SYNTHETIC_DATA",
          "value": "false"
        },
        {
          "name": "VITE_API_BASE_URL",
          "value": "https://api.yourdomain.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/disaster-response-frontend",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF
    
    # Register task definitions
    print_status "Registering task definitions..."
    aws ecs register-task-definition --cli-input-json file://backend-task-definition.json --region "$AWS_REGION"
    aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json --region "$AWS_REGION"
    
    print_success "Task definitions created and registered"
}

# Function to create CloudWatch log groups
create_log_groups() {
    print_header "Creating CloudWatch Log Groups"
    echo "===================================="
    
    local log_groups=("/ecs/disaster-response-backend" "/ecs/disaster-response-frontend")
    
    for log_group in "${log_groups[@]}"; do
        print_status "Creating log group: $log_group"
        if aws logs create-log-group --log-group-name "$log_group" --region "$AWS_REGION" >/dev/null 2>&1; then
            print_success "Log group $log_group created"
        else
            print_warning "Log group $log_group may already exist"
        fi
        
        # Set retention policy
        aws logs put-retention-policy --log-group-name "$log_group" --retention-in-days 30 --region "$AWS_REGION"
    done
    
    print_success "CloudWatch log groups setup complete"
}

# Function to show deployment summary
show_deployment_summary() {
    print_header "AWS Deployment Summary"
    echo "==========================="
    
    echo ""
    echo "🎉 AWS deployment setup complete!"
    echo "================================"
    echo ""
    echo "✅ ECR repositories created"
    echo "✅ Docker images built and pushed"
    echo "✅ ECS cluster created"
    echo "✅ IAM roles configured"
    echo "✅ Task definitions registered"
    echo "✅ CloudWatch log groups created"
    echo ""
    echo "🔧 Next Steps:"
    echo "  1. Create VPC and subnets (if not exists)"
    echo "  2. Create security groups"
    echo "  3. Create ECS services"
    echo "  4. Configure load balancer"
    echo "  5. Set up auto-scaling"
    echo ""
    echo "📚 Documentation:"
    echo "  - AWS Deployment Guide: docs/AWS_DEPLOYMENT_GUIDE.md"
    echo "  - ECS Service Creation: See AWS console or CLI"
    echo ""
    echo "🌐 ECR Image URLs:"
    echo "  Backend: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-backend:latest"
    echo "  Frontend: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-frontend:latest"
    echo "  Tile Server: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disaster-response-tileserver:latest"
    echo ""
    echo "🚀 Ready to create ECS services!"
}

# Main execution
main() {
    echo "🚀 Disaster Response Dashboard - AWS Deployment"
    echo "==============================================="
    echo "This script will set up the AWS infrastructure for deployment"
    echo "Script: $SCRIPT_NAME"
    echo "Region: $AWS_REGION"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Create AWS resources
    create_ecr_repositories
    build_and_push_images
    create_ecs_cluster
    create_iam_roles
    create_task_definitions
    create_log_groups
    
    # Show summary
    show_deployment_summary
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --region)
            AWS_REGION="$2"
            shift 2
            ;;
        --account-id)
            AWS_ACCOUNT_ID="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--region REGION] [--account-id ACCOUNT_ID]"
            echo "  --region REGION       AWS region (default: us-east-1)"
            echo "  --account-id ACCOUNT_ID  AWS account ID (auto-detected if not provided)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
