# Frontend AWS Deployment Guide

This guide provides step-by-step instructions for deploying the Disaster Response Dashboard frontend to AWS.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Docker installed and running
- Node.js 18+ installed
- Access to AWS ECR, ECS, and CodeDeploy services

## Architecture Overview

The frontend is deployed using:
- **AWS ECR**: Container registry for Docker images
- **AWS ECS Fargate**: Container orchestration service
- **AWS CodeBuild**: Automated build and testing
- **AWS CodeDeploy**: Automated deployment
- **Application Load Balancer**: Traffic distribution and SSL termination

## 1. Environment Setup

### 1.1 Configure Environment Variables

Copy the production environment file:
```bash
cp env.production .env.production
```

Update the following variables in `.env.production`:
- `VITE_API_BASE_URL`: Your production API endpoint
- `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token
- `VITE_NASA_FIRMS_API_KEY`: Your NASA FIRMS API key
- `VITE_NOAA_API_KEY`: Your NOAA API key

### 1.2 AWS Configuration

Set your AWS region and account ID:
```bash
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCOUNT_ID=your-account-id
```

## 2. Build and Test Locally

### 2.1 Production Build

Run the production build script:
```bash
./scripts/build-production.sh
```

This will:
- Install production dependencies
- Build the application
- Create production artifacts
- Generate a deployment package

### 2.2 Test Production Container

Test the production container locally:
```bash
docker-compose -f docker-compose.production.yml up --build
```

Verify the application is accessible at `http://localhost:8080`

## 3. AWS Infrastructure Setup

### 3.1 Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name disaster-response-frontend \
  --region $AWS_DEFAULT_REGION
```

### 3.2 Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name disaster-response-cluster \
  --region $AWS_DEFAULT_REGION
```

### 3.3 Create IAM Roles

#### ECS Task Execution Role
```bash
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

#### ECS Task Role
```bash
aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document file://trust-policy.json

# Attach necessary policies for your application
aws iam attach-role-policy \
  --role-name ecsTaskRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

### 3.4 Create Security Groups

```bash
aws ec2 create-security-group \
  --group-name disaster-response-frontend-sg \
  --description "Security group for frontend container" \
  --vpc-id vpc-xxxxxxxxx

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0
```

## 4. Build and Deploy

### 4.1 Build with CodeBuild

The `buildspec.yml` file is configured to:
- Install dependencies
- Build the frontend application
- Build and push Docker images to ECR
- Generate deployment artifacts

### 4.2 Deploy with CodeDeploy

The `appspec.yml` file is configured to:
- Deploy to ECS Fargate
- Update the service with the new task definition
- Handle traffic shifting and rollback

## 5. Monitoring and Health Checks

### 5.1 Health Check Endpoint

The application exposes a health check at `/health` that returns:
- HTTP 200 with "healthy" response
- Used by ECS, ALB, and monitoring tools

### 5.2 CloudWatch Logs

ECS task logs are automatically sent to CloudWatch:
- Log group: `/ecs/disaster-response-frontend`
- Stream prefix: `ecs`

### 5.3 Metrics

Monitor key metrics:
- Container health status
- Response times
- Error rates
- Resource utilization

## 6. Security Considerations

### 6.1 Container Security
- Non-root user execution
- Minimal base image (Alpine Linux)
- Security updates applied
- No unnecessary packages

### 6.2 Network Security
- VPC isolation
- Security group restrictions
- HTTPS enforcement
- Rate limiting

### 6.3 Secrets Management
- API keys stored in AWS Secrets Manager
- Environment variables for non-sensitive config
- No hardcoded secrets in code

## 7. Troubleshooting

### 7.1 Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are available
- Check build logs for specific errors

#### Deployment Failures
- Verify ECR repository exists
- Check IAM role permissions
- Verify security group configuration
- Check ECS service logs

#### Runtime Issues
- Check container logs in CloudWatch
- Verify health check endpoint
- Check network connectivity
- Verify environment variables

### 7.2 Debug Commands

```bash
# Check container status
docker ps -a

# View container logs
docker logs <container-id>

# Test health endpoint
curl -v http://localhost:8080/health

# Check ECS service status
aws ecs describe-services \
  --cluster disaster-response-cluster \
  --services disaster-response-frontend
```

## 8. Scaling and Performance

### 8.1 Auto Scaling

Configure ECS service auto-scaling:
- CPU utilization target: 70%
- Memory utilization target: 80%
- Minimum capacity: 1
- Maximum capacity: 10

### 8.2 Performance Optimization

- Gzip compression enabled
- Static asset caching (1 year)
- Code splitting for JavaScript bundles
- Image optimization
- CDN integration

## 9. Backup and Recovery

### 9.1 Backup Strategy
- ECR images are versioned
- Task definitions are versioned
- Configuration stored in version control
- Database backups (if applicable)

### 9.2 Recovery Procedures
- Rollback to previous ECS task definition
- Restore from ECR image
- Update environment variables
- Verify health checks

## 10. Cost Optimization

### 10.1 Resource Sizing
- Start with minimal CPU/memory
- Monitor usage and adjust as needed
- Use Spot instances for non-critical workloads

### 10.2 Monitoring
- Set up CloudWatch alarms for costs
- Monitor ECS service metrics
- Track ECR storage costs

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review CloudWatch logs
3. Check AWS service status
4. Contact the development team

## Version History

- v1.0.0: Initial AWS deployment configuration
- Added production Dockerfile
- Added CodeBuild buildspec
- Added CodeDeploy appspec
- Added ECS task definition
