#!/usr/bin/env bash
set -Eeuo pipefail

echo "🔧 Fixing ECS Task Definition - Disaster Response"
echo "=================================================="

# Vars
export REGION=us-east-2
export CLUSTER=dr-cluster
export SERVICE=dr-service
export FAMILY=disaster-response-task
export CONTAINER_NAME=disaster-response
export PORT=8000

echo "Region: $REGION"
echo "Cluster: $CLUSTER"
echo "Service: $SERVICE"
echo "Container: $CONTAINER_NAME"
echo "Port: $PORT"
echo ""

# 1) Get the correct ECR repo URI (fallback if query returns 'None')
echo "📦 Getting ECR repository URI..."
REPO_URI=$(aws ecr describe-repositories \
  --region $REGION --repository-names disaster-response \
  --query 'repositories[0].repositoryUri' --output text)
[ -z "$REPO_URI" ] || [ "$REPO_URI" = "None" ] && \
  REPO_URI=910230629863.dkr.ecr.us-east-2.amazonaws.com/disaster-response
echo "✅ REPO_URI=$REPO_URI"

# 2) Get the latest digest
echo "🔍 Getting latest image digest..."
DIGEST=$(aws ecr describe-images --region $REGION \
  --repository-name disaster-response --image-ids imageTag=latest \
  --query 'imageDetails[0].imageDigest' --output text)
echo "✅ DIGEST=$DIGEST"

# 3) Make sure the CloudWatch log group exists
echo "📊 Creating CloudWatch log group..."
aws logs create-log-group --log-group-name "/ecs/${CONTAINER_NAME}" --region $REGION 2>/dev/null || true
echo "✅ Log group ready: /ecs/${CONTAINER_NAME}"

# 4) Export current task def and patch: image, command, port, logs
echo "📋 Exporting current task definition..."
aws ecs describe-task-definition \
  --task-definition $FAMILY --region $REGION \
  --query 'taskDefinition' > td.json

echo "🔧 Patching task definition..."
jq --arg img "$REPO_URI@$DIGEST" \
   --arg name "$CONTAINER_NAME" \
   --arg region "$REGION" \
   --argjson port $PORT '
  (.containerDefinitions[] | select(.name==$name) | .image) = $img
  | (.containerDefinitions[] | select(.name==$name) | .command)
      = ["sh","-c",
         "gunicorn -w 2 -k gthread -t 120 --bind 0.0.0.0:" + ($port|tostring) + " app:app \
          || gunicorn -w 2 -k gthread -t 120 --bind 0.0.0.0:" + ($port|tostring) + " backend.app:app \
          || FLASK_APP=app flask run --host 0.0.0.0 --port " + ($port|tostring)]
  | (.containerDefinitions[] | select(.name==$name) | .portMappings)
      = [ { "containerPort": $port, "protocol": "tcp" } ]
  | (.containerDefinitions[] | select(.name==$name) | .logConfiguration)
      = { "logDriver": "awslogs",
          "options": { "awslogs-group": "/ecs/" + $name,
                       "awslogs-region": $region,
                       "awslogs-stream-prefix": "ecs" } }
  | del(.taskDefinitionArn,.revision,.requiresAttributes,.compatibilities,.registeredAt,.registeredBy,.status)
' td.json > td-new.json

echo "✅ Task definition patched"

# 5) Register new revision and roll the service
echo "🚀 Registering new task definition..."
NEW_TD=$(aws ecs register-task-definition --cli-input-json file://td-new.json \
  --region $REGION --query 'taskDefinition.taskDefinitionArn' --output text)
echo "✅ New task def: $NEW_TD"

echo "🔄 Updating service..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE \
  --task-definition "$NEW_TD" --region $REGION >/dev/null
echo "✅ Service updated"

# 6) Wait & show status (if it times out, we'll read the stop reason again)
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE --region $REGION || true

echo ""
echo "📊 Service Status:"
aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION \
  --query 'services[0].{status:status,desired:desiredCount,running:runningCount,events:events[0:3].message}' --output table

# Clean up temp files
rm -f td.json td-new.json

echo ""
echo "🎉 Task definition fix complete!"
echo "================================"
echo ""
echo "🔍 If service is not RUNNING, check the stop reason:"
echo "aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE --region $REGION --desired-status STOPPED"
echo "aws ecs describe-tasks --cluster $CLUSTER --tasks <TASK_ARN> --region $REGION --query 'tasks[0].{stoppedReason:stoppedReason,containers:containers[].{exitCode:exitCode,reason:reason}}' --output json"
