# AWS Deployment Guide for Disaster Response Dashboard

This guide covers multiple approaches to deploy the disaster response dashboard to AWS, from simple container deployments to fully managed services.

## 🚀 Quick Start Options

### **Option 1: AWS ECS (Elastic Container Service) - Recommended**
- **Best for**: Production workloads, auto-scaling, managed containers
- **Complexity**: Medium
- **Cost**: Pay-per-use container instances

### **Option 2: AWS App Runner**
- **Best for**: Simple container deployments, managed CI/CD
- **Complexity**: Low
- **Cost**: Pay-per-request + compute time

### **Option 3: AWS EKS (Elastic Kubernetes Service)**
- **Best for**: Kubernetes-native deployments, advanced orchestration
- **Complexity**: High
- **Cost**: Control plane + worker nodes

### **Option 4: EC2 with Docker**
- **Best for**: Full control, custom configurations
- **Complexity**: Medium
- **Cost**: EC2 instance costs

## 🎯 **Option 1: AWS ECS Deployment (Recommended)**

### **Prerequisites**
- AWS CLI installed and configured
- Docker images built and pushed to Amazon ECR
- IAM permissions for ECS, ECR, and related services

### **Step 1: Set Up ECR Repositories**

```bash
# Create ECR repositories
aws ecr create-repository --repository-name disaster-response-backend
aws ecr create-repository --repository-name disaster-response-frontend
aws ecr create-repository --repository-name disaster-response-tileserver

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### **Step 2: Build and Push Images**

```bash
# Build images with ECR tags
docker build -t disaster-response-backend:latest backend/
docker build -t disaster-response-frontend:latest frontend/
docker build -t disaster-response-tileserver:latest tiles/

# Tag for ECR
docker tag disaster-response-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/disaster-response-backend:latest
docker tag disaster-response-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/disaster-response-frontend:latest
docker tag disaster-response-tileserver:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/disaster-response-tileserver:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/disaster-response-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/disaster-response-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/disaster-response-tileserver:latest
```

### **Step 3: Create ECS Cluster**

```bash
# Create cluster
aws ecs create-cluster --cluster-name disaster-response-cluster

# Create task execution role
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

# Attach required policies
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### **Step 4: Create Task Definitions**

#### **Backend Task Definition** (`backend-task-definition.json`):
```json
{
  "family": "disaster-response-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/disaster-response-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT_MODE",
          "value": "production"
        },
        {
          "name": "USE_SYNTHETIC_DATA",
          "value": "false"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/disaster-response-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### **Frontend Task Definition** (`frontend-task-definition.json`):
```json
{
  "family": "disaster-response-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/disaster-response-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "VITE_ENVIRONMENT_MODE",
          "value": "production"
        },
        {
          "name": "VITE_USE_SYNTHETIC_DATA",
          "value": "false"
        },
        {
          "name": "VITE_API_BASE_URL",
          "value": "https://api.yourdomain.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/disaster-response-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### **Step 5: Register Task Definitions**

```bash
# Register task definitions
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```

### **Step 6: Create ECS Services**

```bash
# Create backend service
aws ecs create-service \
  --cluster disaster-response-cluster \
  --service-name disaster-response-backend \
  --task-definition disaster-response-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}"

# Create frontend service
aws ecs create-service \
  --cluster disaster-response-cluster \
  --service-name disaster-response-frontend \
  --task-definition disaster-response-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

## 🚀 **Option 2: AWS App Runner (Simplest)**

### **Prerequisites**
- GitHub repository with the project
- Docker images or source code

### **Step 1: Prepare Repository**

```bash
# Ensure you have a Dockerfile in the root
# Or use build commands in apprunner.yaml
```

### **Step 2: Create App Runner Service**

```bash
# Create service from source
aws apprunner create-service \
  --source-configuration '{
    "RepositoryUrl": "https://github.com/yourusername/disaster-response-dashboard",
    "SourceCodeVersion": {
      "Type": "BRANCH",
      "Value": "main"
    },
    "CodeConfiguration": {
      "ConfigurationSource": "API",
      "CodeConfigurationValues": {
        "Runtime": "DOCKER",
        "BuildCommand": "docker build -t disaster-response .",
        "StartCommand": "docker run -p 8080:80 disaster-response"
      }
    }
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }'
```

## 🐳 **Option 3: EC2 with Docker**

### **Step 1: Launch EC2 Instance**

```bash
# Launch instance with user data script
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-12345 \
  --subnet-id subnet-12345 \
  --user-data file://ec2-setup.sh
```

### **Step 2: EC2 Setup Script** (`ec2-setup.sh`):

```bash
#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone https://github.com/yourusername/disaster-response-dashboard.git
cd disaster-response-dashboard

# Build and run
docker-compose -f config/docker/docker-compose.production.yml up -d
```

## 🔧 **Production Configuration**

### **Environment Variables**

```bash
# Backend
ENVIRONMENT_MODE=production
USE_SYNTHETIC_DATA=false
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/disaster
REDIS_URL=redis://redis-endpoint:6379

# Frontend
VITE_ENVIRONMENT_MODE=production
VITE_USE_SYNTHETIC_DATA=false
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_TILE_SERVER_URL=https://tiles.yourdomain.com
```

### **Load Balancer Configuration**

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name disaster-response-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345

# Create target groups
aws elbv2 create-target-group \
  --name disaster-response-backend-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-12345 \
  --target-type ip

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/disaster-response-alb/1234567890abcdef0 \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/disaster-response-backend-tg/1234567890abcdef0
```

## 📊 **Monitoring and Logging**

### **CloudWatch Logs**

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/disaster-response-backend
aws logs create-log-group --log-group-name /ecs/disaster-response-frontend

# Set retention policy
aws logs put-retention-policy --log-group-name /ecs/disaster-response-backend --retention-in-days 30
```

### **CloudWatch Metrics**

```bash
# Create custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name DisasterResponseDashboard \
  --dashboard-body file://dashboard.json
```

## 🔒 **Security Best Practices**

### **IAM Policies**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

### **Security Groups**

```bash
# Backend security group
aws ec2 create-security-group \
  --group-name disaster-response-backend-sg \
  --description "Security group for disaster response backend"

# Allow inbound from ALB
aws ec2 authorize-security-group-ingress \
  --group-id sg-backend123 \
  --protocol tcp \
  --port 8000 \
  --source-group sg-alb123
```

## 🚀 **CI/CD Pipeline**

### **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          docker build -t $ECR_REGISTRY/disaster-response-backend:${{ github.sha }} backend/
          docker build -t $ECR_REGISTRY/disaster-response-frontend:${{ github.sha }} frontend/
          docker push $ECR_REGISTRY/disaster-response-backend:${{ github.sha }}
          docker push $ECR_REGISTRY/disaster-response-frontend:${{ github.sha }}
      
      - name: Update ECS services
        run: |
          aws ecs update-service --cluster disaster-response-cluster --service disaster-response-backend --force-new-deployment
          aws ecs update-service --cluster disaster-response-cluster --service disaster-response-frontend --force-new-deployment
```

## 💰 **Cost Optimization**

### **ECS Fargate Spot**

```bash
# Use spot instances for cost savings
aws ecs create-service \
  --cluster disaster-response-cluster \
  --service-name disaster-response-backend \
  --task-definition disaster-response-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --capacity-provider-strategy '[
    {
      "capacityProvider": "FARGATE_SPOT",
      "weight": 1
    }
  ]'
```

### **Auto Scaling**

```bash
# Create auto scaling policy
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/disaster-response-cluster/disaster-response-backend \
  --min-capacity 1 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/disaster-response-cluster/disaster-response-backend \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }'
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **ECS Service Won't Start**
```bash
# Check service events
aws ecs describe-services \
  --cluster disaster-response-cluster \
  --services disaster-response-backend

# Check task definition
aws ecs describe-task-definition \
  --task-definition disaster-response-backend:1
```

#### **Container Health Checks Failing**
```bash
# Check container logs
aws logs get-log-events \
  --log-group-name /ecs/disaster-response-backend \
  --log-stream-name ecs/backend/container-id
```

#### **Network Connectivity Issues**
```bash
# Check security groups
aws ec2 describe-security-groups \
  --group-ids sg-12345

# Check VPC configuration
aws ec2 describe-vpcs \
  --vpc-ids vpc-12345
```

## 📚 **Next Steps**

1. **Choose deployment option** based on your needs
2. **Set up AWS infrastructure** (VPC, subnets, security groups)
3. **Build and push Docker images** to ECR
4. **Deploy services** using your chosen method
5. **Configure monitoring** and alerting
6. **Set up CI/CD pipeline** for automated deployments

## 🆘 **Getting Help**

- **AWS Documentation**: [ECS](https://docs.aws.amazon.com/ecs/), [App Runner](https://docs.aws.amazon.com/apprunner/)
- **AWS Support**: Available with paid support plans
- **Community**: AWS Developer Forums, Stack Overflow

## 🎯 **Recommended Approach for Production**

1. **Start with ECS Fargate** for managed container orchestration
2. **Use Application Load Balancer** for traffic distribution
3. **Implement auto-scaling** based on CPU/memory usage
4. **Set up CloudWatch monitoring** and alerting
5. **Use GitHub Actions** for CI/CD automation
6. **Implement blue-green deployments** for zero-downtime updates

This approach provides the best balance of manageability, scalability, and cost-effectiveness for production workloads.
