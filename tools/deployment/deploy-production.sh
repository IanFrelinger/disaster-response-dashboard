#!/usr/bin/env bash
set -Eeuo pipefail

echo "🚀 Production Deployment - Disaster Response"
echo "============================================"

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

# 1) Get the latest image with Gunicorn
echo "📦 Getting latest ECR image..."
REPO_URI=$(aws ecr describe-repositories --region "$REGION" \
  --repository-names disaster-response \
  --query 'repositories[0].repositoryUri' --output text)
[ -z "$REPO_URI" ] || [ "$REPO_URI" = "None" ] && \
  REPO_URI=910230629863.dkr.ecr.us-east-2.amazonaws.com/disaster-response

# Get the latest digest (should be the one with Gunicorn)
DIGEST=$(aws ecr describe-images --region "$REGION" \
  --repository-name disaster-response --image-ids imageTag=latest \
  --query 'imageDetails[0].imageDigest' --output text)

echo "✅ REPO_URI=$REPO_URI"
echo "✅ DIGEST=$DIGEST"

# 2) Ensure CloudWatch log group exists
echo "📊 Ensuring CloudWatch log group exists..."
aws logs create-log-group --log-group-name "/ecs/${CONTAINER_NAME}" --region "$REGION" 2>/dev/null || true

# 3) Export current task definition
echo "📋 Exporting current task definition..."
aws ecs describe-task-definition --task-definition "$FAMILY" --region "$REGION" \
  --query 'taskDefinition' > td.json

# 4) Production start command with Gunicorn
echo "🔧 Building production start command..."
CMD="gunicorn -w 2 -k gthread -t 120 --bind 0.0.0.0:${PORT} backend.app:app"
echo "✅ Production command: $CMD"

# 5) Patch the task definition for production
echo "🔧 Patching task definition for production..."
jq --arg img  "$REPO_URI@$DIGEST" \
   --arg name "$CONTAINER_NAME" \
   --arg cmd  "$CMD" \
   --arg reg  "$REGION" \
   --argjson port "$PORT" '
  (.containerDefinitions[] | select(.name==$name) | .image)          = $img
| (.containerDefinitions[] | select(.name==$name) | .command)        = ["sh","-c",$cmd]
| (.containerDefinitions[] | select(.name==$name) | .portMappings)   = [ { "containerPort": $port, "protocol":"tcp" } ]
| (.containerDefinitions[] | select(.name==$name) | .logConfiguration)= {
    "logDriver":"awslogs",
    "options":{
      "awslogs-group":("/ecs/"+$name),
      "awslogs-region":$reg,
      "awslogs-stream-prefix":"ecs"
    }
  }
| del(.taskDefinitionArn,.revision,.requiresAttributes,.compatibilities,.registeredAt,.registeredBy,.status,.taskRoleArn)
' td.json > td-new.json

echo "✅ Task definition patched for production"

# 6) Register new task definition
echo "🚀 Registering new production task definition..."
NEW_TD=$(aws ecs register-task-definition --cli-input-json file://td-new.json \
  --region "$REGION" --query 'taskDefinition.taskDefinitionArn' --output text)
echo "✅ New task def: $NEW_TD"

# 7) Update service with production configuration
echo "🔄 Updating service for production..."
aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --task-definition "$NEW_TD" \
  --deployment-configuration 'deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=100' \
  --enable-execute-command \
  --region "$REGION" >/dev/null

echo "✅ Service updated with production settings"

# 8) Wait for service to stabilize
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable --cluster "$CLUSTER" --services "$SERVICE" --region "$REGION" || true

# 9) Show service status
echo ""
echo "📊 Production Service Status:"
aws ecs describe-services --cluster "$CLUSTER" --services "$SERVICE" --region "$REGION" \
  --query 'services[0].{status:status,desired:desiredCount,running:runningCount,events:events[0:3].message}' --output table

# 10) Test health endpoint
echo ""
echo "🧪 Testing health endpoint..."
TASK_ARN=$(aws ecs list-tasks --cluster "$CLUSTER" --service-name "$SERVICE" --region "$REGION" --query 'taskArns[0]' --output text)
ENI=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" --region "$REGION" --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$ENI" --region "$REGION" --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo "🌐 Testing endpoints at: $PUBLIC_IP"
echo "   Health: http://${PUBLIC_IP}:${PORT}/health"
echo "   Root:   http://${PUBLIC_IP}:${PORT}/"

# Test health endpoint
if curl -fsS "http://${PUBLIC_IP}:${PORT}/health" >/dev/null 2>&1; then
  echo "✅ Health endpoint working!"
else
  echo "❌ Health endpoint failed - check logs"
fi

# 11) Set log retention
echo ""
echo "📊 Setting CloudWatch log retention..."
aws logs put-retention-policy --log-group-name "/ecs/${CONTAINER_NAME}" --retention-in-days 14 --region "$REGION" 2>/dev/null || true
echo "✅ Log retention set to 14 days"

# Clean up temp files
rm -f td.json td-new.json

echo ""
echo "🎉 Production Deployment Complete!"
echo "=================================="
echo ""
echo "🔗 Next Steps:"
echo "1. Test your app: http://${PUBLIC_IP}:${PORT}"
echo "2. Monitor logs: aws logs tail /ecs/${CONTAINER_NAME} --region $REGION --follow"
echo "3. Scale if needed: aws ecs update-service --cluster $CLUSTER --service $SERVICE --desired-count 2 --region $REGION"
echo ""
echo "🚀 Your disaster response app is now running in production with Gunicorn!"
