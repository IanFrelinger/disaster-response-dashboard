# 🐳 Docker Deployment Guide

## Overview

This guide provides a **Docker-based deployment solution** for the Disaster Response Dashboard as an alternative to AWS App Runner. Docker deployment offers better reliability, consistency, and debugging capabilities.

## 🎯 **Why Docker vs App Runner?**

| **Aspect** | **App Runner** | **Docker** |
|------------|----------------|------------|
| **Dependencies** | ❌ Build-time failures | ✅ Pre-built image |
| **Environment** | ❌ Different Python versions | ✅ Consistent runtime |
| **Debugging** | ❌ Limited access | ✅ Full container access |
| **Port Conflicts** | ❌ Complex configuration | ✅ Simple port mapping |
| **Private Packages** | ❌ Build failures | ✅ Multi-stage builds |
| **Deployment** | ❌ Complex AWS CLI | ✅ Simple `docker run` |

## 📁 **Docker Files Structure**

```
disaster-response-dashboard/
├── Dockerfile                          # Production Docker image
├── docker-compose.yml                  # Local development
├── tools/deployment/
│   ├── deploy-docker.sh               # AWS ECS deployment
│   └── test-docker-local.sh           # Local testing
└── docs/
    └── DOCKER_DEPLOYMENT_GUIDE.md     # This guide
```

## 🚀 **Quick Start**

### **1. Local Testing**

```bash
# Test Docker setup locally
./tools/deployment/test-docker-local.sh
```

### **2. Local Development**

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f disaster-dashboard

# Stop services
docker-compose down
```

### **3. AWS Deployment**

```bash
# Deploy to AWS ECS/Fargate
./tools/deployment/deploy-docker.sh
```

## 🐳 **Dockerfile Details**

### **Multi-Stage Build**

```dockerfile
# Stage 1: Build stage
FROM python:3.9-slim as builder
# Install build dependencies and create virtual environment

# Stage 2: Production stage  
FROM python:3.9-slim as production
# Copy virtual environment and run application
```

### **Security Features**

- ✅ **Non-root user** (`appuser`)
- ✅ **Minimal base image** (python:3.9-slim)
- ✅ **Health checks** for monitoring
- ✅ **Environment variables** for configuration

### **Optimizations**

- ✅ **Multi-stage build** reduces image size
- ✅ **Virtual environment** for dependency isolation
- ✅ **No build tools** in production image
- ✅ **Cached layers** for faster builds

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Production
FLASK_ENV=production
FLASK_PORT=8000
ENVIRONMENT_MODE=demo
USE_SYNTHETIC_DATA=true

# Development
FLASK_ENV=development
FLASK_DEBUG=true
```

### **Port Configuration**

```yaml
# docker-compose.yml
ports:
  - "8000:8000"  # Host:Container
```

## 🧪 **Testing**

### **Local Docker Test**

```bash
# Run comprehensive local test
./tools/deployment/test-docker-local.sh
```

**What it tests:**
- ✅ Docker image builds successfully
- ✅ Container starts and runs
- ✅ Application responds to requests
- ✅ Health checks pass
- ✅ All endpoints work

### **Manual Testing**

```bash
# Build image
docker build -t disaster-dashboard .

# Run container
docker run -d -p 8000:8000 disaster-dashboard

# Test endpoints
curl http://localhost:8000/
curl http://localhost:8000/api/health
curl http://localhost:8000/api/synthetic-data

# View logs
docker logs <container_id>

# Stop container
docker stop <container_id>
```

## 🚀 **AWS Deployment**

### **ECS/Fargate Deployment**

```bash
# Deploy to AWS
./tools/deployment/deploy-docker.sh
```

**What it does:**
1. ✅ Builds Docker image
2. ✅ Creates ECR repository
3. ✅ Pushes image to ECR
4. ✅ Creates ECS cluster
5. ✅ Creates task definition
6. ✅ Creates ECS service
7. ✅ Waits for stability
8. ✅ Provides service URL

### **AWS Resources Created**

- **ECR Repository**: `disaster-response-dashboard`
- **ECS Cluster**: `disaster-response-cluster`
- **ECS Service**: `disaster-response-service`
- **Task Definition**: `disaster-response-task`
- **CloudWatch Logs**: `/ecs/disaster-response-task`

## 📊 **Monitoring & Logs**

### **CloudWatch Logs**

```bash
# View service logs
aws logs describe-log-groups \
  --log-group-name-prefix "/ecs/disaster-response-task" \
  --region us-east-2

# Get recent logs
aws logs get-log-events \
  --log-group-name "/ecs/disaster-response-task/ecs/disaster-dashboard" \
  --log-stream-name <stream-name> \
  --region us-east-2
```

### **ECS Service Monitoring**

```bash
# Check service status
aws ecs describe-services \
  --cluster disaster-response-cluster \
  --services disaster-response-service \
  --region us-east-2

# Scale service
aws ecs update-service \
  --cluster disaster-response-cluster \
  --service disaster-response-service \
  --desired-count 2 \
  --region us-east-2
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Build Failures**

```bash
# Check Dockerfile syntax
docker build --no-cache -t disaster-dashboard .

# View build logs
docker build -t disaster-dashboard . 2>&1 | tee build.log
```

#### **2. Container Won't Start**

```bash
# Check container logs
docker logs <container_id>

# Run interactively
docker run -it disaster-dashboard /bin/bash
```

#### **3. Port Conflicts**

```bash
# Check if port is in use
lsof -i :8000

# Use different port
docker run -p 8001:8000 disaster-dashboard
```

#### **4. AWS Deployment Issues**

```bash
# Check ECS service events
aws ecs describe-services \
  --cluster disaster-response-cluster \
  --services disaster-response-service \
  --region us-east-2 \
  --query 'services[0].events[0:5]'

# Check task definition
aws ecs describe-task-definition \
  --task-definition disaster-response-task \
  --region us-east-2
```

## 🛠 **Management Commands**

### **Local Management**

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Clean up
docker-compose down -v
docker system prune -f
```

### **AWS Management**

```bash
# Update service
aws ecs update-service \
  --cluster disaster-response-cluster \
  --service disaster-response-service \
  --force-new-deployment \
  --region us-east-2

# Scale service
aws ecs update-service \
  --cluster disaster-response-cluster \
  --service disaster-response-service \
  --desired-count 3 \
  --region us-east-2

# Delete service
aws ecs delete-service \
  --cluster disaster-response-cluster \
  --service disaster-response-service \
  --force \
  --region us-east-2
```

## 📈 **Scaling**

### **Horizontal Scaling**

```bash
# Scale to 3 instances
aws ecs update-service \
  --cluster disaster-response-cluster \
  --service disaster-response-service \
  --desired-count 3 \
  --region us-east-2
```

### **Auto Scaling**

```yaml
# Add to ECS service configuration
autoScalingPolicies:
  - policyName: cpu-scaling
    targetTrackingScalingPolicyConfiguration:
      targetValue: 70.0
      scaleInCooldown: 300
      scaleOutCooldown: 300
```

## 🔒 **Security**

### **Best Practices**

- ✅ **Non-root user** in container
- ✅ **Minimal base image**
- ✅ **No secrets in image**
- ✅ **Health checks enabled**
- ✅ **Resource limits set**

### **Network Security**

```yaml
# Security group configuration
securityGroups:
  - sg-12345678  # Allow inbound 8000
  - sg-87654321  # Allow outbound traffic
```

## 💰 **Cost Optimization**

### **Fargate Spot**

```bash
# Use Fargate Spot for cost savings
aws ecs create-service \
  --cluster disaster-response-cluster \
  --service-name disaster-response-service-spot \
  --task-definition disaster-response-task \
  --capacity-provider-strategy capacityProvider=FARGATE_SPOT,weight=1 \
  --region us-east-2
```

### **Resource Optimization**

```json
{
  "cpu": "256",      // 0.25 vCPU
  "memory": "512"    // 512 MB RAM
}
```

## 🎯 **Comparison: Docker vs App Runner**

| **Feature** | **App Runner** | **Docker** |
|-------------|----------------|------------|
| **Setup Complexity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Reliability** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Debugging** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scaling** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Customization** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🚀 **Next Steps**

1. **Test locally**: `./tools/deployment/test-docker-local.sh`
2. **Deploy to AWS**: `./tools/deployment/deploy-docker.sh`
3. **Monitor**: Check CloudWatch logs and ECS metrics
4. **Scale**: Adjust service capacity as needed

## 📚 **Additional Resources**

- [Docker Documentation](https://docs.docker.com/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**🎉 Docker deployment provides a more reliable and maintainable solution for your disaster response dashboard!**
