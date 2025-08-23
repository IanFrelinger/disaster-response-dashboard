# GitHub Actions Pipeline Setup Guide

This guide walks you through setting up automated CI/CD deployment to AWS using GitHub Actions.

## 🚀 Overview

The GitHub Actions pipeline provides:
- **Automated testing** on every push and pull request
- **Docker image building** and pushing to ECR
- **ECS deployment** with zero-downtime updates
- **Security scanning** with Trivy
- **Manual deployment triggers** for staging/production

## 📋 Prerequisites

1. **GitHub Repository** with your code
2. **AWS Account** with appropriate permissions
3. **AWS IAM User** with programmatic access
4. **ECR Repositories** for frontend and backend
5. **ECS Cluster** and services configured

## 🔐 Step 1: Create AWS IAM User

### 1.1 Create IAM User
```bash
aws iam create-user --user-name github-actions-deployer
```

### 1.2 Create Access Keys
```bash
aws iam create-access-key --user-name github-actions-deployer
```

**Save the Access Key ID and Secret Access Key!**

### 1.3 Attach Required Policies
```bash
# Attach the AWS managed policy for ECS deployment
aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS-FullAccess

# Attach the AWS managed policy for ECR access
aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess

# Attach the AWS managed policy for CloudWatch Logs
aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
```

### 1.4 Create Custom Policy for ECS Service Updates
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:ListTasks",
        "ecs:DescribeTasks"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🔑 Step 2: Configure GitHub Secrets

### 2.1 Navigate to Repository Settings
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**

### 2.2 Add Required Secrets
Add these secrets to your repository:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS Region | `us-east-2` |

### 2.3 Add Optional Secrets
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `MAPBOX_ACCESS_TOKEN` | Mapbox API token | `pk.eyJ1IjoieW91...` |
| `NASA_FIRMS_API_KEY` | NASA FIRMS API key | `your-nasa-key` |
| `NOAA_API_KEY` | NOAA Weather API key | `your-noaa-key` |

## 🏗️ Step 3: Configure AWS Infrastructure

### 3.1 Create ECR Repositories
```bash
# Frontend repository
aws ecr create-repository \
  --repository-name disaster-response-frontend \
  --region us-east-2

# Backend repository
aws ecr create-repository \
  --repository-name disaster-response-backend \
  --region us-east-2
```

### 3.2 Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name disaster-response-cluster \
  --region us-east-2
```

### 3.3 Create ECS Services
```bash
# Frontend service
aws ecs create-service \
  --cluster disaster-response-cluster \
  --service-name disaster-response-frontend \
  --task-definition disaster-response-frontend:2 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxx],securityGroups=[sg-xxxxxxxxx],assignPublicIp=ENABLED}" \
  --region us-east-2

# Backend service (if you have a backend task definition)
aws ecs create-service \
  --cluster disaster-response-cluster \
  --service-name disaster-response-backend \
  --task-definition disaster-response-backend:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxx],securityGroups=[sg-xxxxxxxxx],assignPublicIp=ENABLED}" \
  --region us-east-2
```

## 🚀 Step 4: Trigger the Pipeline

### 4.1 Automatic Triggers
The pipeline automatically runs on:
- **Push to main/master branch** (with frontend/backend changes)
- **Pull requests** (runs tests only)

### 4.2 Manual Triggers
1. Go to **Actions** tab in your repository
2. Select **Deploy Frontend to AWS** workflow
3. Click **Run workflow**
4. Choose environment (staging/production)
5. Click **Run workflow**

## 📊 Step 5: Monitor Deployments

### 5.1 GitHub Actions
- View workflow runs in the **Actions** tab
- Check logs for each step
- Monitor deployment status

### 5.2 AWS Console
- **ECR**: Check for new images
- **ECS**: Monitor service updates
- **CloudWatch**: View logs and metrics

### 5.3 Useful Commands
```bash
# Check ECS service status
aws ecs describe-services \
  --cluster disaster-response-cluster \
  --services disaster-response-frontend \
  --region us-east-2

# View recent task definitions
aws ecs describe-task-definition \
  --task-definition disaster-response-frontend \
  --region us-east-2

# Check ECR images
aws ecr describe-images \
  --repository-name disaster-response-frontend \
  --region us-east-2
```

## 🔧 Step 6: Customize the Pipeline

### 6.1 Environment-Specific Configurations
Update the workflow files to match your:
- AWS region
- ECR repository names
- ECS cluster and service names
- Environment variables

### 6.2 Add Custom Steps
Common additions:
- **Slack notifications** on deployment
- **Performance testing** before deployment
- **Database migrations** for backend
- **CDN invalidation** for frontend

### 6.3 Example: Slack Notification
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Permission Denied Errors**
```bash
# Check IAM user permissions
aws iam get-user --user-name github-actions-deployer

# Verify policy attachments
aws iam list-attached-user-policies --user-name github-actions-deployer
```

#### 2. **ECR Login Failures**
```bash
# Test ECR access manually
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com
```

#### 3. **ECS Service Update Failures**
```bash
# Check service status
aws ecs describe-services \
  --cluster disaster-response-cluster \
  --services disaster-response-frontend \
  --region us-east-2

# Check task definition
aws ecs describe-task-definition \
  --task-definition disaster-response-frontend \
  --region us-east-2
```

#### 4. **Build Failures**
- Check Dockerfile syntax
- Verify dependencies in package.json/requirements.txt
- Check for large files that might exceed GitHub limits

### Debug Commands
```bash
# Test AWS credentials
aws sts get-caller-identity

# Test ECR access
aws ecr describe-repositories --region us-east-2

# Test ECS access
aws ecs describe-clusters --region us-east-2
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [GitHub Actions for AWS](https://github.com/aws-actions)

## 🎯 Next Steps

1. **Test the pipeline** with a small change
2. **Monitor deployments** and logs
3. **Set up alerts** for failures
4. **Optimize build times** with caching
5. **Add security scanning** and compliance checks

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Verify AWS permissions and configuration
4. Check the GitHub Actions marketplace for alternative actions
5. Consult AWS and GitHub documentation

The pipeline is now ready to automatically deploy your application to AWS on every push! 🚀
