#!/usr/bin/env bash
set -Eeuo pipefail

echo "🔧 Fixing Invalid taskRoleArn - Disaster Response"
echo "================================================="

# Config
export REGION=us-east-2
export FAMILY=disaster-response-task
export CLUSTER=dr-cluster
export SERVICE=dr-service

echo "Region: $REGION"
echo "Family: $FAMILY"
echo "Cluster: $CLUSTER"
echo "Service: $SERVICE"
echo ""

# Export the current (broken) TD
echo "📋 Exporting current task definition..."
aws ecs describe-task-definition --task-definition ${FAMILY}:4 --region $REGION \
  --query 'taskDefinition' > td.json

echo "✅ Current task definition exported"

# Delete the bad taskRoleArn and AWS-managed fields, keep everything else
echo "🔧 Fixing task definition..."
jq 'del(.taskRoleArn,.taskDefinitionArn,.revision,.requiresAttributes,.compatibilities,.registeredAt,.registeredBy,.status)' \
  td.json > td-fixed.json

echo "✅ Invalid fields removed"

# Register new revision and roll the service
echo "🚀 Registering fixed task definition..."
NEW_TD=$(aws ecs register-task-definition --cli-input-json file://td-fixed.json --region $REGION \
  --query 'taskDefinition.taskDefinitionArn' --output text)
echo "✅ New task definition: $NEW_TD"

echo "🔄 Updating service..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE \
  --task-definition "$NEW_TD" --region $REGION

echo "✅ Service updated"

# Wait for service to stabilize
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE --region $REGION || true

echo ""
echo "📊 Service Status:"
aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION \
  --query 'services[0].{status:status,desired:desiredCount,running:runningCount,events:events[0:3].message}' --output table

# Clean up temp files
rm -f td.json td-fixed.json

echo ""
echo "🎉 Task Role Fix Complete!"
echo "========================="
echo ""
echo "🔍 If service is not RUNNING, check the stop reason:"
echo "aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE --region $REGION --desired-status STOPPED"
echo "aws ecs describe-tasks --cluster $CLUSTER --tasks <TASK_ARN> --region $REGION --query 'tasks[0].{stoppedReason:stoppedReason,containers:containers[].{exitCode:exitCode,reason:reason}}' --output json"
