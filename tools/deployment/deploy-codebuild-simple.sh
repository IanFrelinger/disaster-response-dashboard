#!/bin/bash

# Simple CodeBuild Deployment
# Deploys CodeBuild without role assumption tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="disaster-response-codebuild-demo"
REGION="us-east-2"
ROLE_NAME="CodeBuildServiceRole"

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

# Main function
main() {
    echo "🚀 Disaster Response Dashboard - Simple CodeBuild Deployment"
    echo "=========================================================="
    echo "Service: ${SERVICE_NAME}"
    echo "Region: ${REGION}"
    echo "Role: ${ROLE_NAME}"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check if role exists
    print_info "Checking if CodeBuild role exists..."
    if ! aws iam get-role --role-name "${ROLE_NAME}" &>/dev/null; then
        print_error "Role ${ROLE_NAME} does not exist"
        echo ""
        echo "🔧 Please run the setup script first:"
        echo "   ./tools/deployment/setup-codebuild-role.sh"
        exit 1
    fi
    
    ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text)
    print_success "Role exists: ${ROLE_ARN}"
    echo ""
    
    # Create ECR repository
    print_info "Creating ECR repository..."
    if aws ecr describe-repositories --repository-names "disaster-response-dashboard" --region "${REGION}" &>/dev/null; then
        print_info "ECR repository already exists"
    else
        aws ecr create-repository --repository-name "disaster-response-dashboard" --region "${REGION}"
        print_success "ECR repository created"
    fi
    echo ""
    
    # Get ECR repository URI
    ECR_URI=$(aws ecr describe-repositories --repository-names "disaster-response-dashboard" --region "${REGION}" --query 'repositories[0].repositoryUri' --output text)
    print_info "ECR Repository URI: ${ECR_URI}"
    echo ""
    
    # Create buildspec
    print_info "Creating buildspec.yml..."
    cat > buildspec.yml << EOF
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_URI}
      - REPOSITORY_URI=${ECR_URI}
      - IMAGE_TAG=latest
  build:
    commands:
      - echo Build started on \`date\`
      - echo Building the Docker image...
      - docker build -t \$REPOSITORY_URI:\$IMAGE_TAG .
  post_build:
    commands:
      - echo Build completed on \`date\`
      - echo Pushing the Docker image...
      - docker push \$REPOSITORY_URI:\$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"disaster-response-dashboard","imageUri":"%s"}]' \$REPOSITORY_URI:\$IMAGE_TAG > imagedefinitions.json
artifacts:
  files:
    - imagedefinitions.json
    - appspec.yml
    - taskdef.json
EOF
    
    print_success "buildspec.yml created"
    echo ""
    
    # Create appspec.yml
    print_info "Creating appspec.yml..."
    cat > appspec.yml << EOF
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: <TASK_DEFINITION>
        LoadBalancerInfo:
          ContainerName: "disaster-response-dashboard"
          ContainerPort: 8000
EOF
    
    print_success "appspec.yml created"
    echo ""
    
    # Create taskdef.json
    print_info "Creating taskdef.json..."
    cat > taskdef.json << EOF
{
  "family": "disaster-response-dashboard",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "disaster-response-dashboard",
      "image": "${ECR_URI}:latest",
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
          "awslogs-group": "/ecs/disaster-response-dashboard",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF
    
    print_success "taskdef.json created"
    echo ""
    
    # Create CodeBuild project
    print_info "Creating CodeBuild project..."
    
    if aws codebuild create-project \
        --name "${SERVICE_NAME}" \
        --source type=GITHUB,location=https://github.com/IanFrelinger/disaster-response-dashboard.git \
        --artifacts type=NO_ARTIFACTS \
        --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_SMALL,privilegedMode=true \
        --service-role "${ROLE_NAME}" \
        --region "${REGION}" &>/dev/null; then
        
        print_success "CodeBuild project created"
    else
        print_info "CodeBuild project already exists or creation failed"
    fi
    echo ""
    
    # Start build
    print_info "Starting CodeBuild..."
    BUILD_ID=$(aws codebuild start-build --project-name "${SERVICE_NAME}" --region "${REGION}" --query 'build.id' --output text)
    print_success "Build started: ${BUILD_ID}"
    echo ""
    
    # Clean up temporary files
    rm -f buildspec.yml appspec.yml taskdef.json
    
    echo "🎉 CodeBuild Deployment Complete!"
    echo "================================"
    echo "Service Name: ${SERVICE_NAME}"
    echo "Build ID: ${BUILD_ID}"
    echo "ECR Repository: ${ECR_URI}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Monitor the build:"
    echo "   aws codebuild batch-get-builds --ids ${BUILD_ID} --region ${REGION}"
    echo ""
    echo "2. View build logs:"
    echo "   aws codebuild batch-get-builds --ids ${BUILD_ID} --region ${REGION} --query 'builds[0].logs.deepLink' --output text"
    echo ""
    echo "3. Once build completes, the Docker image will be available in ECR"
}

# Run main function
main "$@"
