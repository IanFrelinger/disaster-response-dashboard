#!/usr/bin/env bash
set -Eeuo pipefail

echo "🚀 Fix and Deploy Flask - Disaster Response"
echo "==========================================="

# Config
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

# Ensure logs group exists
echo "📊 Ensuring CloudWatch log group exists..."
aws logs create-log-group --log-group-name "/ecs/${CONTAINER_NAME}" --region "$REGION" 2>/dev/null || true
echo "✅ Log group ready: /ecs/${CONTAINER_NAME}"

# Export current task def
echo "📋 Exporting current task definition..."
aws ecs describe-task-definition --task-definition "$FAMILY" --region "$REGION" \
  --query 'taskDefinition' > td.json
echo "✅ Current task definition exported"

# Fallback start cmd (no gunicorn needed)
echo "🔧 Building Flask start command..."
CMD="python -m flask --app backend.app:app run --host 0.0.0.0 --port ${PORT} \
 || python -m flask --app app:app run --host 0.0.0.0 --port ${PORT}"
echo "✅ Start command: $CMD"

# Patch just command/ports/logs; keep image as-is
echo "🔧 Patching task definition..."
jq --arg name "$CONTAINER_NAME" \
   --arg cmd  "$CMD" \
   --arg reg  "$REGION" \
   --argjson port "$PORT" '
  (.containerDefinitions[] | select(.name==$name) | .command)        = ["sh","-c",$cmd]
| (.containerDefinitions[] | select(.name==$name) | .portMappings)   = [ { "containerPort": $port, "protocol":"tcp" } ]
| (.containerDefinitions[] | select(.name==$name) | .logConfiguration)= {
    "logDriver":"awslogs",
    "options":{
      "awslogs-group":("/ecs/"+$name),
      "awslogs-region":$reg,
      "awslogs-stream-prefix":"ecs"
    }
  }
| del(.taskDefinitionArn,.revision,.requiresAttributes,.compatibilities,.registeredAt,.registeredBy,.status)
' td.json > td-flask.json

echo "✅ Task definition patched"

# Register new task definition
echo "🚀 Registering new Flask task definition..."
NEW_TD=$(aws ecs register-task-definition --cli-input-json file://td-flask.json \
  --region "$REGION" --query 'taskDefinition.taskDefinitionArn' --output text)
echo "✅ New task definition: $NEW_TD"

# Update service
echo "🔄 Updating service..."
aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE" \
  --task-definition "$NEW_TD" --region "$REGION"
echo "✅ Service updated"

# Wait & show status (OK if waiter times out; we'll still read status)
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable --cluster "$CLUSTER" --services "$SERVICE" --region "$REGION" || true

echo ""
echo "📊 Service Status:"
aws ecs describe-services --cluster "$CLUSTER" --services "$SERVICE" --region "$REGION" \
  --query 'services[0].{status:status,desired:desiredCount,running:runningCount,events:events[0:3].message}' --output table

# Get a public URL to test
echo ""
echo "🔍 Getting public IP..."
TASK_ARN=$(aws ecs list-tasks --cluster "$CLUSTER" --service-name "$SERVICE" --region "$REGION" --query 'taskArns[0]' --output text)
ENI=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" --region "$REGION" --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$ENI" --region "$REGION" --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo ""
echo "🎉 Fix and Deploy Complete!"
echo "==========================="
echo "🌐 Your app should now be running at:"
echo "   http://${PUBLIC_IP}:${PORT}"
echo ""
echo "🧪 Test endpoints:"
echo "   Health: http://${PUBLIC_IP}:${PORT}/health"
echo "   Root:   http://${PUBLIC_IP}:${PORT}/"

# Clean up temp files
rm -f td.json td-flask.json

echo ""
echo "🔍 If service is not RUNNING, check the stop reason:"
echo "aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE --region $REGION --desired-status STOPPED"
echo "aws ecs describe-tasks --cluster $CLUSTER --tasks <TASK_ARN> --region $REGION --query 'tasks[0].{stoppedReason:stoppedReason,containers:containers[].{exitCode:exitCode,reason:reason}}' --output json"
