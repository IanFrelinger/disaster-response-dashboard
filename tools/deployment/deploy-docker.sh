#!/bin/bash

# Disaster Response Dashboard - Docker Deployment Script
# Deploys to AWS ECS/Fargate using Docker

set -e

# Configuration
SCRIPT_NAME="deploy-docker.sh"
PROJECT_NAME="disaster-response-dashboard"
AWS_REGION=${AWS_REGION:-"us-east-2"}
CLUSTER_NAME="disaster-response-cluster"
SERVICE_NAME="disaster-response-service"
TASK_DEFINITION_NAME="disaster-response-task"
IMAGE_NAME="disaster-response-dashboard"
ECR_REPOSITORY_NAME="disaster-response-dashboard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    echo "============================="
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker not found. Please install Docker."
        exit 1
    fi
    print_success "✓ Docker found"
    
    # Check AWS CLI
    if ! command -v aws >/dev/null 2>&1; then
        print_error "AWS CLI not found. Please install AWS CLI."
        exit 1
    fi
    print_success "✓ AWS CLI found"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not available. Please configure AWS CLI."
        exit 1
    fi
    print_success "✓ AWS credentials available"
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in current directory"
        exit 1
    fi
    print_success "✓ Dockerfile found"
    
    print_success "✓ All prerequisites satisfied"
}

# Function to build Docker image
build_docker_image() {
    print_header "🐳 Building Docker Image"
    echo "==========================="
    
    print_step "Building Docker image..."
    
    # Build the image
    docker build -t "$IMAGE_NAME:latest" .
    
    if [ $? -eq 0 ]; then
        print_success "✓ Docker image built successfully"
    else
        print_error "✗ Docker image build failed"
        exit 1
    fi
}

# Function to create ECR repository
create_ecr_repository() {
    print_header "📦 Creating ECR Repository"
    echo "=============================="
    
    # Check if repository exists
    if aws ecr describe-repositories --repository-names "$ECR_REPOSITORY_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
        print_status "ECR repository already exists"
    else
        print_step "Creating ECR repository..."
        aws ecr create-repository \
            --repository-name "$ECR_REPOSITORY_NAME" \
            --region "$AWS_REGION" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        
        print_success "✓ ECR repository created"
    fi
    
    # Get repository URI
    ECR_REPOSITORY_URI=$(aws ecr describe-repositories \
        --repository-names "$ECR_REPOSITORY_NAME" \
        --region "$AWS_REGION" \
        --query 'repositories[0].repositoryUri' \
        --output text)
    
    print_success "✓ ECR repository URI: $ECR_REPOSITORY_URI"
}

# Function to tag and push Docker image
push_docker_image() {
    print_header "📤 Pushing Docker Image to ECR"
    echo "==================================="
    
    # Get ECR login token
    print_step "Logging in to ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$ECR_REPOSITORY_URI"
    
    # Tag the image
    print_step "Tagging Docker image..."
    docker tag "$IMAGE_NAME:latest" "$ECR_REPOSITORY_URI:latest"
    
    # Push the image
    print_step "Pushing Docker image to ECR..."
    docker push "$ECR_REPOSITORY_URI:latest"
    
    print_success "✓ Docker image pushed to ECR"
}

# Function to create ECS cluster
create_ecs_cluster() {
    print_header "🚀 Creating ECS Cluster"
    echo "==========================="
    
    # Check if cluster exists
    if aws ecs describe-clusters --clusters "$CLUSTER_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
        print_status "ECS cluster already exists"
    else
        print_step "Creating ECS cluster..."
        aws ecs create-cluster \
            --cluster-name "$CLUSTER_NAME" \
            --region "$AWS_REGION" \
            --capacity-providers FARGATE \
            --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
        
        print_success "✓ ECS cluster created"
    fi
}

# Function to create task definition
create_task_definition() {
    print_header "📋 Creating Task Definition"
    echo "==============================="
    
    # Create task definition JSON
    cat > task-definition.json << EOF
{
    "family": "$TASK_DEFINITION_NAME",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "disaster-dashboard",
            "image": "$ECR_REPOSITORY_URI:latest",
            "portMappings": [
                {
                    "containerPort": 8000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "FLASK_ENV",
                    "value": "production"
                },
                {
                    "name": "FLASK_PORT",
                    "value": "8000"
                },
                {
                    "name": "ENVIRONMENT_MODE",
                    "value": "demo"
                },
                {
                    "name": "USE_SYNTHETIC_DATA",
                    "value": "true"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/$TASK_DEFINITION_NAME",
                    "awslogs-region": "$AWS_REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "healthCheck": {
                "command": ["CMD-SHELL", "curl -f http://localhost:8000/ || exit 1"],
                "interval": 30,
                "timeout": 5,
                "retries": 3,
                "startPeriod": 60
            }
        }
    ]
}
EOF
    
    # Register task definition
    print_step "Registering task definition..."
    TASK_DEFINITION_ARN=$(aws ecs register-task-definition \
        --cli-input-json file://task-definition.json \
        --region "$AWS_REGION" \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text)
    
    print_success "✓ Task definition created: $TASK_DEFINITION_ARN"
}

# Function to create ECS service
create_ecs_service() {
    print_header "🔧 Creating ECS Service"
    echo "==========================="
    
    # Check if service exists
    if aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
        print_status "ECS service already exists, updating..."
        
        # Update service
        aws ecs update-service \
            --cluster "$CLUSTER_NAME" \
            --service "$SERVICE_NAME" \
            --task-definition "$TASK_DEFINITION_NAME" \
            --region "$AWS_REGION"
    else
        print_step "Creating ECS service..."
        
        # Create service
        aws ecs create-service \
            --cluster "$CLUSTER_NAME" \
            --service-name "$SERVICE_NAME" \
            --task-definition "$TASK_DEFINITION_NAME" \
            --desired-count 1 \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
            --region "$AWS_REGION"
    fi
    
    print_success "✓ ECS service created/updated"
}

# Function to wait for service to be stable
wait_for_service_stability() {
    print_header "⏳ Waiting for Service Stability"
    echo "===================================="
    
    print_step "Waiting for service to be stable..."
    
    aws ecs wait services-stable \
        --cluster "$CLUSTER_NAME" \
        --services "$SERVICE_NAME" \
        --region "$AWS_REGION"
    
    print_success "✓ Service is stable"
}

# Function to get service URL
get_service_url() {
    print_header "🌐 Getting Service URL"
    echo "=========================="
    
    # Get task ARN
    TASK_ARN=$(aws ecs list-tasks \
        --cluster "$CLUSTER_NAME" \
        --service-name "$SERVICE_NAME" \
        --region "$AWS_REGION" \
        --query 'taskArns[0]' \
        --output text)
    
    if [ "$TASK_ARN" != "None" ] && [ "$TASK_ARN" != "" ]; then
        # Get public IP
        PUBLIC_IP=$(aws ecs describe-tasks \
            --cluster "$CLUSTER_NAME" \
            --tasks "$TASK_ARN" \
            --region "$AWS_REGION" \
            --query 'tasks[0].attachments[0].details[?name==`publicIp`].value' \
            --output text)
        
        if [ "$PUBLIC_IP" != "None" ] && [ "$PUBLIC_IP" != "" ]; then
            SERVICE_URL="http://$PUBLIC_IP:8000"
            print_success "✓ Service URL: $SERVICE_URL"
        else
            print_warning "⚠ Public IP not available yet"
        fi
    else
        print_warning "⚠ Task not running yet"
    fi
}

# Function to display deployment summary
display_summary() {
    print_header "📊 Docker Deployment Summary"
    echo "================================"
    
    echo ""
    print_success "🎉 Docker deployment completed successfully!"
    echo ""
    echo "📋 Deployment Details:"
    echo "  • Cluster: $CLUSTER_NAME"
    echo "  • Service: $SERVICE_NAME"
    echo "  • Task Definition: $TASK_DEFINITION_NAME"
    echo "  • Image: $ECR_REPOSITORY_URI:latest"
    echo "  • Region: $AWS_REGION"
    echo ""
    
    if [ ! -z "$SERVICE_URL" ]; then
        echo "🌐 Service URL: $SERVICE_URL"
        echo ""
        print_success "Your disaster response dashboard is now running!"
    fi
    
    echo "🔧 Management Commands:"
    echo "  • View service: aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"
    echo "  • View logs: aws logs describe-log-groups --log-group-name-prefix '/ecs/$TASK_DEFINITION_NAME' --region $AWS_REGION"
    echo "  • Scale service: aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --desired-count 2 --region $AWS_REGION"
    echo ""
}

# Main execution
main() {
    print_header "🚀 Disaster Response Dashboard - Docker Deployment"
    echo "======================================================="
    echo "This script deploys your app to AWS ECS/Fargate using Docker"
    echo ""
    
    # Run deployment steps
    check_prerequisites
    build_docker_image
    create_ecr_repository
    push_docker_image
    create_ecs_cluster
    create_task_definition
    create_ecs_service
    wait_for_service_stability
    get_service_url
    display_summary
    
    # Cleanup
    rm -f task-definition.json
    
    print_success "🎉 Deployment completed successfully!"
}

# Run main function
main "$@"
