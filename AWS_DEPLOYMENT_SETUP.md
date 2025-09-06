# AWS Deployment Setup Guide

## 1. Environment Variables for AWS

### For AWS CodeBuild/ECS/App Runner:

#### Update your production environment file:
```bash
# Edit the production environment file
nano backend/.env.production.final
```

#### AWS-Specific Environment Variables:
```bash
# Core Settings
FLASK_ENV=production
FLASK_DEBUG=false
SECRET_KEY=e8ea7fefb8378ec9cabad1ee4e91de4474bec97c248b3c81397741ebb0370ac6

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=false

# Security
ENABLE_CORS=true
# Update this with your actual AWS domain:
CORS_ORIGINS=https://your-app.elasticbeanstalk.com,https://your-app.us-east-2.elasticbeanstalk.com

# External APIs (keep your existing tokens)
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY21ldW5zZjJuMDh0eDJpcHgwNHhtOTE4aSJ9.2k1N7W2zZovOnRuqlVB9NQ
MAPBOX_STYLE_URL=mapbox://styles/mapbox/dark-v11

# Database (if using AWS RDS)
DATABASE_URL=postgresql://username:password@your-rds-endpoint.us-east-2.rds.amazonaws.com:5432/disaster_response
POSTGRES_HOST=your-rds-endpoint.us-east-2.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=disaster_response
POSTGRES_USER=disaster_user
POSTGRES_PASSWORD=your-secure-database-password

# Redis (if using AWS ElastiCache)
REDIS_URL=redis://your-elasticache-endpoint.us-east-2.cache.amazonaws.com:6379
REDIS_HOST=your-elasticache-endpoint.us-east-2.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password
```

### Common AWS Domain Patterns:

#### For AWS Elastic Beanstalk:
```bash
CORS_ORIGINS=https://your-app.elasticbeanstalk.com,https://your-app.us-east-2.elasticbeanstalk.com
```

#### For AWS App Runner:
```bash
CORS_ORIGINS=https://your-app.us-east-2.awsapprunner.com
```

#### For AWS CloudFront + Custom Domain:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### For AWS Load Balancer:
```bash
CORS_ORIGINS=https://your-alb.us-east-2.elb.amazonaws.com
```

## 2. SSL Certificate Setup for AWS

### Option A: AWS Certificate Manager (ACM) - RECOMMENDED

#### Step 1: Request Certificate
1. Go to AWS Console → Certificate Manager
2. Click "Request a certificate"
3. Enter your domain: `yourdomain.com`
4. Add additional domain: `*.yourdomain.com`
5. Choose **DNS validation** (recommended)
6. Click "Request"

#### Step 2: Validate Certificate
1. Click on your certificate
2. Click "Create records in Route 53" (if using Route 53)
3. Or manually add CNAME records to your DNS provider
4. Wait for validation (usually 5-30 minutes)

#### Step 3: Attach to Your AWS Service

**For Application Load Balancer:**
1. Go to EC2 → Load Balancers
2. Create or edit your load balancer
3. Add HTTPS listener (port 443)
4. Select your ACM certificate
5. Configure security groups to allow port 443

**For CloudFront:**
1. Go to CloudFront
2. Create or edit distribution
3. Set origin to your application
4. Add custom domain
5. Select your ACM certificate

**For Elastic Beanstalk:**
1. Go to Elastic Beanstalk → Your Environment
2. Configuration → Load Balancer
3. Add HTTPS listener
4. Select your ACM certificate

### Option B: Let's Encrypt (if using EC2 directly)

```bash
# Install certbot on your EC2 instance
sudo yum install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 3. CORS Configuration for AWS

### Step 1: Update CORS Origins

Based on your AWS service, update the CORS_ORIGINS in your environment:

```bash
# For Elastic Beanstalk
CORS_ORIGINS=https://your-app.elasticbeanstalk.com

# For App Runner
CORS_ORIGINS=https://your-app.us-east-2.awsapprunner.com

# For CloudFront
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# For Load Balancer
CORS_ORIGINS=https://your-alb.us-east-2.elb.amazonaws.com
```

### Step 2: AWS-Specific CORS Headers

#### For Application Load Balancer:
```json
{
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400"
}
```

#### For CloudFront:
1. Go to CloudFront → Your Distribution
2. Behaviors → Edit
3. Add custom headers:
   - `Access-Control-Allow-Origin`: `https://yourdomain.com`
   - `Access-Control-Allow-Methods`: `GET, POST, PUT, DELETE, OPTIONS`
   - `Access-Control-Allow-Headers`: `Content-Type, Authorization, X-Requested-With`

## 4. AWS Deployment Commands

### For AWS CodeBuild (your current setup):
```bash
# Deploy to CodeBuild
./tools/deployment/deploy-codebuild-simple.sh

# Monitor deployment
aws codebuild batch-get-builds --ids your-build-id --region us-east-2
```

### For AWS ECS:
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-2.amazonaws.com

docker build -t disaster-response .
docker tag disaster-response:latest your-account.dkr.ecr.us-east-2.amazonaws.com/disaster-response:latest
docker push your-account.dkr.ecr.us-east-2.amazonaws.com/disaster-response:latest
```

### For AWS Elastic Beanstalk:
```bash
# Create application
eb init disaster-response --platform python-3.9 --region us-east-2

# Create environment
eb create disaster-response-prod --envvars $(cat backend/.env.production.final | xargs)

# Deploy
eb deploy
```

## 5. AWS Security Configuration

### Security Groups:
```bash
# Allow HTTP (port 80) - redirect to HTTPS
# Allow HTTPS (port 443)
# Allow your application port (8000) - only from load balancer
```

### IAM Roles:
```bash
# Ensure your EC2/ECS instances have proper IAM roles
# For RDS access, ElastiCache access, etc.
```

## 6. Testing Your AWS Deployment

### Test SSL Certificate:
```bash
# Test your domain
curl -I https://yourdomain.com

# Check certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Test CORS:
```bash
# Test from your frontend
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-api-domain.com/api/health
```

### Test API Endpoints:
```bash
# Health check
curl https://your-api-domain.com/api/health

# Dashboard data
curl https://your-api-domain.com/api/dashboard
```

## 7. AWS Monitoring Setup

### CloudWatch Alarms:
1. Go to CloudWatch → Alarms
2. Create alarms for:
   - High CPU usage
   - High memory usage
   - Error rates
   - Response time

### Logs:
1. Configure CloudWatch Logs
2. Set up log retention policies
3. Create log filters for errors

## Quick AWS Deployment Checklist

- [ ] **Environment Variables**: Updated with AWS domain
- [ ] **SSL Certificate**: Requested in ACM
- [ ] **CORS Configuration**: Updated for your domain
- [ ] **Security Groups**: Configured properly
- [ ] **IAM Roles**: Set up for your services
- [ ] **Monitoring**: CloudWatch alarms configured
- [ ] **Logging**: CloudWatch logs enabled

## Next Steps

1. Choose your AWS deployment method
2. Update environment variables with your actual AWS domain
3. Request SSL certificate in ACM
4. Deploy your application
5. Test all endpoints with HTTPS
