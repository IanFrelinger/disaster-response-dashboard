#!/bin/bash

# Disaster Response Dashboard - Docker CloudShell Deployment
# Optimized for CloudShell space constraints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="disaster-response-docker-demo"
REGION=${AWS_REGION:-"us-east-2"}
ECR_REPO_NAME="disaster-response-dashboard"
IMAGE_TAG="latest"

# Print functions
print_info() {
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

# Check CloudShell environment
check_cloudshell() {
    print_info "Checking CloudShell environment..."
    
    if [[ -n "$AWS_CLOUDSHELL" ]]; then
        print_success "Running in AWS CloudShell"
    else
        print_warning "Not running in CloudShell - this script is optimized for CloudShell"
    fi
    
    # Check available disk space
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    if [ "$AVAILABLE_SPACE" -lt 1000000 ]; then
        print_error "Insufficient disk space. Available: ${AVAILABLE_SPACE}KB"
        print_info "Cleaning up Docker..."
        docker system prune -f
        docker builder prune -f
        AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
        print_info "After cleanup: ${AVAILABLE_SPACE}KB available"
    fi
}

# Clean up Docker to free space
cleanup_docker() {
    print_info "Cleaning up Docker to free space..."
    docker system prune -f || true
    docker builder prune -f || true
    docker image prune -f || true
}

# Build Docker image with space optimization
build_image() {
    print_info "Building Docker image with space optimization..."
    
    # Clean up first
    cleanup_docker
    
    # Build with no cache and space optimization
    docker build \
        --no-cache \
        --progress=plain \
        --tag "${ECR_REPO_NAME}:${IMAGE_TAG}" \
        . || {
        print_error "Docker build failed. Trying with more aggressive cleanup..."
        cleanup_docker
        docker system prune -af || true
        docker build \
            --no-cache \
            --progress=plain \
            --tag "${ECR_REPO_NAME}:${IMAGE_TAG}" \
            . || {
            print_error "Docker build failed even after cleanup"
            exit 1
        }
    }
    
    print_success "Docker image built successfully"
}

# Create ECR repository
create_ecr_repo() {
    print_info "Creating ECR repository..."
    
    # Check if repository exists
    if aws ecr describe-repositories --repository-names "${ECR_REPO_NAME}" --region "${REGION}" >/dev/null 2>&1; then
        print_info "ECR repository already exists"
    else
        aws ecr create-repository \
            --repository-name "${ECR_REPO_NAME}" \
            --region "${REGION}" \
            --image-scanning-configuration scanOnPush=true
        print_success "ECR repository created"
    fi
}

# Get ECR login token and push image
push_to_ecr() {
    print_info "Pushing image to ECR..."
    
    # Get ECR login token
    aws ecr get-login-password --region "${REGION}" | \
        docker login --username AWS --password-stdin \
        "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com"
    
    # Tag image for ECR
    ECR_URI="$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO_NAME}"
    docker tag "${ECR_REPO_NAME}:${IMAGE_TAG}" "${ECR_URI}:${IMAGE_TAG}"
    
    # Push image
    docker push "${ECR_URI}:${IMAGE_TAG}"
    print_success "Image pushed to ECR"
    
    echo "${ECR_URI}:${IMAGE_TAG}"
}

# Create ECS cluster
create_ecs_cluster() {
    print_info "Creating ECS cluster..."
    
    CLUSTER_NAME="${SERVICE_NAME}-cluster"
    
    # Check if cluster exists
    if aws ecs describe-clusters --clusters "${CLUSTER_NAME}" --region "${REGION}" --query 'clusters[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
        print_info "ECS cluster already exists"
    else
        aws ecs create-cluster \
            --cluster-name "${CLUSTER_NAME}" \
            --region "${REGION}"
        print_success "ECS cluster created"
    fi
    
    echo "${CLUSTER_NAME}"
}

# Create task definition
create_task_definition() {
    print_info "Creating ECS task definition..."
    
    CLUSTER_NAME="$1"
    ECR_URI="$2"
    
    # Create task definition JSON
    cat > task-definition.json << EOF
{
    "family": "${SERVICE_NAME}-task",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "${SERVICE_NAME}-container",
            "image": "${ECR_URI}:${IMAGE_TAG}",
            "portMappings": [
                {
                    "containerPort": 8000,
                    "protocol": "tcp"
                }
            ],
            "essential": true,
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/${SERVICE_NAME}",
                    "awslogs-region": "${REGION}",
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
    aws ecs register-task-definition \
        --cli-input-json file://task-definition.json \
        --region "${REGION}"
    
    print_success "Task definition created"
    
    # Clean up
    rm -f task-definition.json
}

# Create ECS service
create_ecs_service() {
    print_info "Creating ECS service..."
    
    CLUSTER_NAME="$1"
    ECR_URI="$2"
    
    # Create log group
    aws logs create-log-group \
        --log-group-name "/ecs/${SERVICE_NAME}" \
        --region "${REGION}" 2>/dev/null || true
    
    # Get default VPC and subnets
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text --region "${REGION}")
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --query 'Subnets[0:2].SubnetId' --output text --region "${REGION}" | tr '\t' ',')
    
    # Create security group
    SG_NAME="${SERVICE_NAME}-sg"
    SG_ID=$(aws ec2 create-security-group \
        --group-name "${SG_NAME}" \
        --description "Security group for ${SERVICE_NAME}" \
        --vpc-id "${VPC_ID}" \
        --region "${REGION}" \
        --query 'GroupId' --output text 2>/dev/null || \
        aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${SG_NAME}" \
        --query 'SecurityGroups[0].GroupId' --output text --region "${REGION}")
    
    # Add ingress rule
    aws ec2 authorize-security-group-ingress \
        --group-id "${SG_ID}" \
        --protocol tcp \
        --port 8000 \
        --cidr 0.0.0.0/0 \
        --region "${REGION}" 2>/dev/null || true
    
    # Create service
    aws ecs create-service \
        --cluster "${CLUSTER_NAME}" \
        --service-name "${SERVICE_NAME}" \
        --task-definition "${SERVICE_NAME}-task" \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS}],securityGroups=[${SG_ID}],assignPublicIp=ENABLED}" \
        --region "${REGION}"
    
    print_success "ECS service created"
}

# Wait for service to be stable
wait_for_service() {
    print_info "Waiting for service to be stable..."
    
    CLUSTER_NAME="$1"
    
    for i in {1..30}; do
        STATUS=$(aws ecs describe-services \
            --cluster "${CLUSTER_NAME}" \
            --services "${SERVICE_NAME}" \
            --region "${REGION}" \
            --query 'services[0].status' --output text)
        
        if [ "$STATUS" = "ACTIVE" ]; then
            print_success "Service is now ACTIVE"
            break
        fi
        
        print_info "Service status: ${STATUS} (attempt ${i}/30)"
        sleep 30
    done
}

# Get service URL
get_service_url() {
    print_info "Getting service URL..."
    
    CLUSTER_NAME="$1"
    
    # Get task ARN
    TASK_ARN=$(aws ecs list-tasks \
        --cluster "${CLUSTER_NAME}" \
        --service-name "${SERVICE_NAME}" \
        --region "${REGION}" \
        --query 'taskArns[0]' --output text)
    
    if [ "$TASK_ARN" = "None" ]; then
        print_error "No tasks found for service"
        return 1
    fi
    
    # Get public IP
    PUBLIC_IP=$(aws ecs describe-tasks \
        --cluster "${CLUSTER_NAME}" \
        --tasks "${TASK_ARN}" \
        --region "${REGION}" \
        --query 'tasks[0].attachments[0].details[?name==`publicIp`].value' --output text)
    
    if [ "$PUBLIC_IP" = "None" ]; then
        print_error "No public IP found for task"
        return 1
    fi
    
    SERVICE_URL="http://${PUBLIC_IP}:8000"
    print_success "Service URL: ${SERVICE_URL}"
    echo "${SERVICE_URL}"
}

# Main deployment function
main() {
    echo "🚀 Disaster Response Dashboard - Docker CloudShell Deployment"
    echo "=============================================================="
    echo "Service: ${SERVICE_NAME}"
    echo "Region: ${REGION}"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check environment
    check_cloudshell
    
    # Build and deploy
    build_image
    ECR_URI=$(push_to_ecr)
    CLUSTER_NAME=$(create_ecs_cluster)
    create_task_definition "${CLUSTER_NAME}" "${ECR_URI}"
    create_ecs_service "${CLUSTER_NAME}" "${ECR_URI}"
    wait_for_service "${CLUSTER_NAME}"
    SERVICE_URL=$(get_service_url "${CLUSTER_NAME}")
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================"
    echo "Service URL: ${SERVICE_URL}"
    echo "ECS Cluster: ${CLUSTER_NAME}"
    echo "ECR Repository: ${ECR_REPO_NAME}"
    echo ""
    echo "📊 Monitor your service:"
    echo "AWS Console > ECS > Clusters > ${CLUSTER_NAME}"
    echo ""
    echo "🔧 Management commands:"
    echo "aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --region ${REGION}"
    echo "aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --desired-count 0 --region ${REGION}"
}

# Run main function
main "$@"
