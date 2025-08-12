# 🚀 Disaster Response Dashboard - Full Deployment Guide

Complete deployment solution for backend, frontend, and video production services with monitoring and production-ready configuration.

## 🎯 Overview

This deployment system provides a complete containerized solution that includes:

- **Backend API** (Flask/Python) - Disaster response data processing
- **Frontend** (React/TypeScript) - 3D visualization dashboard
- **Video Production** (Node.js) - Automated video generation
- **Database** (PostgreSQL) - Data persistence
- **Cache** (Redis) - Performance optimization
- **Reverse Proxy** (Nginx) - Load balancing and SSL
- **Monitoring** (Prometheus + Grafana) - System observability

## 🚀 Quick Start

### **One-Command Deployment**

```bash
# Deploy all services
./deployment/deploy.sh deploy

# Check status
./deployment/deploy.sh status

# View logs
./deployment/deploy.sh logs
```

### **Manual Deployment**

```bash
# Build and start all services
docker-compose -f deployment/docker-compose.full.yml up -d

# Check service status
docker-compose -f deployment/docker-compose.full.yml ps
```

## 📊 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Video Production│
│   (React)       │    │   (Flask)       │    │   (Node.js)     │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Nginx       │
                    │  Reverse Proxy  │
                    │   Port: 80/443  │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   Monitoring    │
│   Port: 5432    │    │   Port: 6379    │    │  Port: 9090     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Service Details

### **Backend API Service**
- **Technology**: Flask/Python
- **Port**: 5001
- **Features**: 
  - Disaster data processing
  - Real-time hazard monitoring
  - Route optimization
  - Foundry integration
- **Health Check**: `http://localhost/api/health`

### **Frontend Application**
- **Technology**: React/TypeScript
- **Port**: 3000
- **Features**:
  - 3D terrain visualization
  - Real-time data display
  - Interactive maps
  - Responsive design
- **Health Check**: `http://localhost`

### **Video Production Service**
- **Technology**: Node.js
- **Port**: 3001
- **Features**:
  - Automated video generation
  - Text-to-speech
  - Video processing
  - Professional output
- **Health Check**: `http://localhost/video/`

### **Database (PostgreSQL)**
- **Port**: 5432
- **Features**:
  - Data persistence
  - Geospatial support
  - Backup and recovery
- **Credentials**: postgres/password

### **Cache (Redis)**
- **Port**: 6379
- **Features**:
  - Session storage
  - Performance caching
  - Real-time data

### **Reverse Proxy (Nginx)**
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**:
  - Load balancing
  - SSL termination
  - Rate limiting
  - Security headers

### **Monitoring Stack**
- **Prometheus**: Port 9090
- **Grafana**: Port 3002 (admin/admin)
- **Features**:
  - Metrics collection
  - Performance monitoring
  - Alerting
  - Dashboards

## 📁 Directory Structure

```
disaster-response-dashboard/
├── deployment/
│   ├── docker-compose.full.yml    # Main deployment configuration
│   ├── nginx.conf                 # Nginx reverse proxy config
│   ├── prometheus.yml             # Monitoring configuration
│   ├── deploy.sh                  # Deployment script
│   ├── ssl/                       # SSL certificates
│   └── grafana/                   # Grafana provisioning
├── backend/                       # Flask API
├── frontend/                      # React application
├── video-production/              # Video generation service
├── data/                          # Persistent data
└── tiles/                         # Map tiles
```

## 🚀 Deployment Commands

### **Full Deployment**
```bash
# Deploy everything
./deployment/deploy.sh deploy

# Update existing deployment
./deployment/deploy.sh update

# Stop all services
./deployment/deploy.sh stop

# Restart services
./deployment/deploy.sh restart
```

### **Service Management**
```bash
# View service status
./deployment/deploy.sh status

# View logs
./deployment/deploy.sh logs

# Clean up resources
./deployment/deploy.sh cleanup
```

### **Docker Compose Commands**
```bash
# Start all services
docker-compose -f deployment/docker-compose.full.yml up -d

# Stop all services
docker-compose -f deployment/docker-compose.full.yml down

# View logs
docker-compose -f deployment/docker-compose.full.yml logs -f

# Scale services
docker-compose -f deployment/docker-compose.full.yml up -d --scale backend=3
```

## 🌐 Access URLs

### **Main Application**
- **Frontend**: http://localhost
- **API**: http://localhost/api
- **Video Production**: http://localhost/video/

### **Monitoring**
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin)

### **Direct Service Access**
- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:3000
- **Video Production**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔒 Security Features

### **SSL/TLS**
- Automatic SSL certificate generation
- HTTPS enforcement
- Secure headers

### **Rate Limiting**
- API rate limiting (10 req/s)
- Video production rate limiting (5 req/s)
- DDoS protection

### **Security Headers**
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy
- Strict-Transport-Security

### **Network Security**
- Isolated Docker networks
- Non-root containers
- Minimal attack surface

## 📊 Monitoring & Observability

### **Metrics Collection**
- Service health metrics
- Performance indicators
- Resource utilization
- Error rates

### **Grafana Dashboards**
- System overview
- Service performance
- Error tracking
- Custom metrics

### **Alerting**
- Service down alerts
- Performance degradation
- Resource exhaustion
- Security events

## 🔧 Configuration

### **Environment Variables**
```bash
# Backend
FLASK_ENV=production
DATABASE_URL=postgresql://postgres:password@postgres:5432/disaster_response
REDIS_URL=redis://redis:6379

# Frontend
REACT_APP_API_URL=http://localhost:5001
REACT_APP_ENVIRONMENT=production

# Video Production
NODE_ENV=production
FFMPEG_BINARY=/usr/bin/ffmpeg
```

### **Custom Configuration**
1. **Nginx**: Edit `deployment/nginx.conf`
2. **Prometheus**: Edit `deployment/prometheus.yml`
3. **Grafana**: Add dashboards to `deployment/grafana/`

## 🚨 Troubleshooting

### **Common Issues**

#### **Services Not Starting**
```bash
# Check Docker status
docker info

# Check service logs
./deployment/deploy.sh logs

# Check service status
./deployment/deploy.sh status
```

#### **Port Conflicts**
```bash
# Check port usage
lsof -i :80
lsof -i :3000
lsof -i :5001

# Stop conflicting services
sudo lsof -ti:80 | xargs kill -9
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL logs
docker-compose -f deployment/docker-compose.full.yml logs postgres

# Test database connection
docker exec -it disaster-response-postgres psql -U postgres -d disaster_response
```

#### **SSL Certificate Issues**
```bash
# Regenerate SSL certificates
rm -rf deployment/ssl/*
./deployment/deploy.sh deploy
```

### **Performance Optimization**

#### **Resource Limits**
```yaml
# In docker-compose.full.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

#### **Scaling Services**
```bash
# Scale backend
docker-compose -f deployment/docker-compose.full.yml up -d --scale backend=3

# Scale frontend
docker-compose -f deployment/docker-compose.full.yml up -d --scale frontend=2
```

## 🔄 CI/CD Integration

### **GitHub Actions Example**
```yaml
name: Deploy Disaster Response Dashboard

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        ./deployment/deploy.sh deploy
```

### **Production Deployment**
```bash
# Set production environment
export ENVIRONMENT=production

# Deploy with production config
./deployment/deploy.sh deploy

# Verify deployment
./deployment/deploy.sh status
```

## 📈 Scaling & Performance

### **Horizontal Scaling**
- Multiple backend instances
- Load balancer configuration
- Database connection pooling
- Redis clustering

### **Performance Monitoring**
- Response time tracking
- Throughput monitoring
- Resource utilization
- Error rate tracking

### **Optimization Tips**
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Monitor database performance

## 🔄 Backup & Recovery

### **Database Backup**
```bash
# Create backup
docker exec disaster-response-postgres pg_dump -U postgres disaster_response > backup.sql

# Restore backup
docker exec -i disaster-response-postgres psql -U postgres disaster_response < backup.sql
```

### **Volume Backup**
```bash
# Backup volumes
docker run --rm -v disaster-response_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v disaster-response_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 📚 Additional Resources

### **Documentation**
- [Backend API Documentation](backend/README.md)
- [Frontend Development Guide](frontend/README.md)
- [Video Production Guide](video-production/README.md)

### **Support**
- Check service logs: `./deployment/deploy.sh logs`
- Monitor system: http://localhost:3002
- View metrics: http://localhost:9090

---

**Ready to deploy your Disaster Response Dashboard!** 🚀

The deployment system provides a complete, production-ready solution with monitoring, security, and scalability features.
