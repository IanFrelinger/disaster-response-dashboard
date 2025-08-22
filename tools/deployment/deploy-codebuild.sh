#!/bin/bash

# Disaster Response Dashboard - CodeBuild Deployment
# Uses AWS CodeBuild to avoid CloudShell space constraints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="disaster-response-codebuild-demo"
REGION=${AWS_REGION:-"us-east-2"}
ECR_REPO_NAME="disaster-response-dashboard"
IMAGE_TAG="latest"
PROJECT_NAME="disaster-response-build"

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

# Create CodeBuild project
create_codebuild_project() {
    print_info "Creating CodeBuild project..."
    
    # Get ECR URI
    ECR_URI="$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com"
    
    # Create buildspec.yml
    cat > buildspec.yml << EOF
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_URI}
      - REPOSITORY_URI=${ECR_URI}/${ECR_REPO_NAME}
      - IMAGE_TAG=${IMAGE_TAG}
  build:
    commands:
      - echo Build started on \`date\`
      - echo Building the Docker image...
      - docker build -t \$REPOSITORY_URI:\$IMAGE_TAG .
      - echo Build completed on \`date\`
  post_build:
    commands:
      - echo Pushing the Docker image...
      - docker push \$REPOSITORY_URI:\$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"container","imageUri":"%s"}]' \$REPOSITORY_URI:\$IMAGE_TAG > imagedefinitions.json
artifacts:
  files:
    - imagedefinitions.json
EOF
    
    # Create CodeBuild project
    aws codebuild create-project \
        --name "${PROJECT_NAME}" \
        --region "${REGION}" \
        --source type=GITHUB,location=https://github.com/IanFrelinger/disaster-response-dashboard.git,buildspec=buildspec.yml \
        --artifacts type=NO_ARTIFACTS \
        --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_SMALL,privilegedMode=true \
        --service-role "AWSCodeBuildServiceRole" 2>/dev/null || {
        print_info "CodeBuild project already exists, updating..."
        aws codebuild update-project \
            --name "${PROJECT_NAME}" \
            --region "${REGION}" \
            --source type=GITHUB,location=https://github.com/IanFrelinger/disaster-response-dashboard.git,buildspec=buildspec.yml \
            --artifacts type=NO_ARTIFACTS \
            --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_SMALL,privilegedMode=true \
            --service-role "AWSCodeBuildServiceRole"
    }
    
    print_success "CodeBuild project created"
    
    # Clean up
    rm -f buildspec.yml
}

# Start CodeBuild
start_codebuild() {
    print_info "Starting CodeBuild..."
    
    BUILD_ID=$(aws codebuild start-build \
        --project-name "${PROJECT_NAME}" \
        --region "${REGION}" \
        --query 'build.id' --output text)
    
    print_success "Build started with ID: ${BUILD_ID}"
    echo "${BUILD_ID}"
}

# Wait for build to complete
wait_for_build() {
    print_info "Waiting for build to complete..."
    
    BUILD_ID="$1"
    
    for i in {1..60}; do
        STATUS=$(aws codebuild batch-get-builds \
            --ids "${BUILD_ID}" \
            --region "${REGION}" \
            --query 'builds[0].buildStatus' --output text)
        
        if [ "$STATUS" = "SUCCEEDED" ]; then
            print_success "Build completed successfully"
            break
        elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "FAULT" ] || [ "$STATUS" = "STOPPED" ] || [ "$STATUS" = "TIMED_OUT" ]; then
            print_error "Build failed with status: ${STATUS}"
            return 1
        fi
        
        print_info "Build status: ${STATUS} (attempt ${i}/60)"
        sleep 30
    done
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
    ECR_URI="$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com"
    
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
            "image": "${ECR_URI}/${ECR_REPO_NAME}:${IMAGE_TAG}",
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
    echo "🚀 Disaster Response Dashboard - CodeBuild Deployment"
    echo "====================================================="
    echo "Service: ${SERVICE_NAME}"
    echo "Region: ${REGION}"
    echo "Timestamp: $(date)"
    echo ""
    
    # Build and deploy
    create_ecr_repo
    create_codebuild_project
    BUILD_ID=$(start_codebuild)
    wait_for_build "${BUILD_ID}"
    CLUSTER_NAME=$(create_ecs_cluster)
    create_task_definition "${CLUSTER_NAME}"
    create_ecs_service "${CLUSTER_NAME}"
    wait_for_service "${CLUSTER_NAME}"
    SERVICE_URL=$(get_service_url "${CLUSTER_NAME}")
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================"
    echo "Service URL: ${SERVICE_URL}"
    echo "ECS Cluster: ${CLUSTER_NAME}"
    echo "ECR Repository: ${ECR_REPO_NAME}"
    echo "CodeBuild Project: ${PROJECT_NAME}"
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
