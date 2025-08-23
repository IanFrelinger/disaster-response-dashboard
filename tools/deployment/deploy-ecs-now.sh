#!/usr/bin/env bash
set -Eeuo pipefail

echo "🚀 One-Shot ECS Deployment - Disaster Response"
echo "================================================"
echo "Region: us-east-2"
echo "Account: 910230629863"
echo ""

# Configuration
CLUSTER_NAME="dr-cluster"
SERVICE_NAME="dr-service"
REGION="us-east-2"
ACCOUNT_ID="910230629863"

# 1) Create the cluster (idempotent)
echo "🏗️ Creating ECS cluster..."
aws ecs create-cluster \
  --cluster-name $CLUSTER_NAME \
  --region $REGION >/dev/null
echo "✅ Cluster ready: $CLUSTER_NAME"

# 2) Check if service exists and create/update accordingly
echo "🔍 Checking if service exists..."
SERVICE_EXISTS=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION --query 'length(services) > `0`' --output text 2>/dev/null || echo "False")

if [[ "$SERVICE_EXISTS" == "True" ]]; then
  echo "📝 Updating existing service..."
  aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition arn:aws:ecs:$REGION:$ACCOUNT_ID:task-definition/disaster-response-task:1 \
    --network-configuration 'awsvpcConfiguration={subnets=["subnet-0c7394a0ebc87ae08","subnet-0f523e647659aa297"],securityGroups=["sg-07a03f8049f6e3bf5"],assignPublicIp="ENABLED"}' \
    --region $REGION >/dev/null
  echo "✅ Service updated: $SERVICE_NAME"
else
  echo "🚀 Creating new service..."
  aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name $SERVICE_NAME \
    --task-definition arn:aws:ecs:$REGION:$ACCOUNT_ID:task-definition/disaster-response-task:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration 'awsvpcConfiguration={subnets=["subnet-0c7394a0ebc87ae08","subnet-0f523e647659aa297"],securityGroups=["sg-07a03f8049f6e3bf5"],assignPublicIp="ENABLED"}' \
    --region $REGION >/dev/null
  echo "✅ Service created: $SERVICE_NAME"
fi

# 3) Wait for it to stabilize
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION
echo "✅ Service is stable!"

# 4) Get the public IP to test
echo "🔍 Getting public IP..."
TASK_ARN=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --region $REGION --query 'taskArns[0]' --output text)
ENI=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks "$TASK_ARN" --region $REGION --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$ENI" --region $REGION --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "Public IP: $PUBLIC_IP"
echo "Test URL: http://${PUBLIC_IP}:8000"
echo ""
echo "📊 Service Status:"
aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output table
echo ""
echo "🔗 Useful Commands:"
echo "View logs: aws logs tail /ecs/disaster-response-task --region $REGION --follow"
echo "Check service: aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION"
echo "Scale service: aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --desired-count 2 --region $REGION"
