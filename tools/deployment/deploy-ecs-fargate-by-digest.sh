#!/usr/bin/env bash
set -Eeuo pipefail

# Configuration
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-2}}"
ACCOUNT_ID="${AWS_ACCOUNT_ID:-910230629863}"
REPO_NAME="disaster-response"
CLUSTER_NAME="dr-cluster"
SERVICE_NAME="dr-service"
CONTAINER_NAME="disaster-response"
CONTAINER_PORT=8000
TASK_DEFINITION_NAME="disaster-response-task"
SECURITY_GROUP_NAME="disaster-response-sg"

echo "🚀 Deploying Disaster Response to ECS Fargate"
echo "=============================================="
echo "Region: $REGION"
echo "Account: $ACCOUNT_ID"
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo "Container Port: $CONTAINER_PORT"
echo ""

# Get the latest image digest from ECR
echo "📦 Getting latest image digest from ECR..."
IMAGE_URI="$(aws ecr describe-images --repository-name $REPO_NAME --region $REGION --query 'imageDetails[0].imageUri' --output text)"
IMAGE_DIGEST="$(aws ecr describe-images --repository-name $REPO_NAME --region $REGION --query 'imageDetails[0].imageDigest' --output text)"
FULL_IMAGE_URI="$IMAGE_URI@$IMAGE_DIGEST"

echo "✅ Image: $FULL_IMAGE_URI"
echo ""

# Create/use default VPC
echo "🌐 Setting up VPC and networking..."
VPC_ID=$(aws ec2 describe-vpcs --region $REGION --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text)
echo "VPC: $VPC_ID"

# Get public subnets
SUBNET_IDS=$(aws ec2 describe-subnets --region $REGION --filters "Name=vpc-id,Values=$VPC_ID" "Name=map-public-ip-on-launch,Values=true" --query 'Subnets[].SubnetId' --output text)
SUBNET_IDS_ARRAY=($SUBNET_IDS)
echo "Public Subnets: ${SUBNET_IDS_ARRAY[0]}, ${SUBNET_IDS_ARRAY[1]}"
echo ""

# Create security group
echo "🔒 Creating security group..."
SG_ID=$(aws ec2 create-security-group --group-name $SECURITY_GROUP_NAME --description "Security group for disaster response app" --vpc-id $VPC_ID --region $REGION --query 'GroupId' --output text 2>/dev/null || \
        aws ec2 describe-security-groups --region $REGION --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" --query 'SecurityGroups[0].GroupId' --output text)

# Add inbound rule for app port
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port $CONTAINER_PORT --cidr 0.0.0.0/0 --region $REGION 2>/dev/null || true
echo "Security Group: $SG_ID (port $CONTAINER_PORT open)"
echo ""

# Create ECS cluster
echo "🏗️ Creating ECS cluster..."
CLUSTER_STATUS=$(aws ecs describe-clusters --clusters $CLUSTER_NAME --region $REGION --query 'clusters[0].status' --output text 2>/dev/null || echo "INACTIVE")

if [[ "$CLUSTER_STATUS" != "ACTIVE" ]]; then
  echo "🆕 Creating new cluster..."
  aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $REGION --capacity-providers FARGATE --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 >/dev/null
else
  echo "✅ Using existing cluster..."
fi
echo "Cluster: $CLUSTER_NAME"
echo ""

# Create task execution role
echo "👤 Creating task execution role..."
TASK_EXECUTION_ROLE_ARN=$(aws iam get-role --role-name ecsTaskExecutionRole --query 'Role.Arn' --output text 2>/dev/null || \
                          aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}' --query 'Role.Arn' --output text)

# Attach required policies
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || true
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly 2>/dev/null || true

echo "Task Execution Role: $TASK_EXECUTION_ROLE_ARN"
echo ""

# Create task definition
echo "📋 Creating task definition..."
TASK_DEF_JSON=$(cat <<EOF
{
  "family": "$TASK_DEFINITION_NAME",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$TASK_EXECUTION_ROLE_ARN",
  "containerDefinitions": [
    {
      "name": "$CONTAINER_NAME",
      "image": "$FULL_IMAGE_URI",
      "portMappings": [
        {
          "containerPort": $CONTAINER_PORT,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$TASK_DEFINITION_NAME",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "FLASK_ENV",
          "value": "production"
        },
        {
          "name": "API_HOST",
          "value": "0.0.0.0"
        },
        {
          "name": "API_PORT",
          "value": "$CONTAINER_PORT"
        }
      ]
    }
  ]
}
EOF
)

# Register task definition
TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json "$TASK_DEF_JSON" --region $REGION --query 'taskDefinition.taskDefinitionArn' --output text)
echo "Task Definition: $TASK_DEF_ARN"
echo ""

# Create log group
aws logs create-log-group --log-group-name "/ecs/$TASK_DEFINITION_NAME" --region $REGION 2>/dev/null || true

# Create service
echo "🚀 Creating ECS service..."

# Check if service exists
SERVICE_EXISTS=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION --query 'length(services) > `0`' --output text 2>/dev/null || echo "False")

if [[ "$SERVICE_EXISTS" == "True" ]]; then
  echo "📝 Updating existing service..."
  SERVICE_ARN=$(aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $TASK_DEF_ARN \
    --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS_ARRAY[0]},${SUBNET_IDS_ARRAY[1]}],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
    --region $REGION \
    --query 'service.serviceArn' \
    --output text)
else
  echo "🆕 Creating new service..."
  SERVICE_ARN=$(aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name $SERVICE_NAME \
    --task-definition $TASK_DEF_ARN \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS_ARRAY[0]},${SUBNET_IDS_ARRAY[1]}],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
    --region $REGION \
    --query 'service.serviceArn' \
    --output text)
fi

echo "Service: $SERVICE_ARN"
echo ""

# Wait for service to stabilize
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION
echo "✅ Service is stable!"
echo ""

# Get task details and public IP
echo "🔍 Getting task details..."
TASK_ARN=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[0]' --output text)
ENI_ID=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $REGION --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --region $REGION --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "Public IP: $PUBLIC_IP"
echo "Test URL: http://$PUBLIC_IP:$CONTAINER_PORT"
echo ""
echo "📊 Service Status:"
aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output table
echo ""
echo "🔗 Useful Commands:"
echo "View logs: aws logs tail /ecs/$TASK_DEFINITION_NAME --region $REGION --follow"
echo "Check service: aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION"
echo "Scale service: aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --desired-count 2 --region $REGION"
