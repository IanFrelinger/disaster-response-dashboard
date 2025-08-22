# Disaster Response Dashboard - Deployment Guide

This guide covers deploying the Disaster Response Dashboard to various environments, from local development to production.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd disaster-response-dashboard

# Start all services
./deployment/deploy.sh

# Access the application
open http://localhost
```

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

## Local Development

### Directory Structure

```
disaster-response-dashboard/
├── backend/                    # Python Flask API
├── frontend/                   # React application
├── data/                       # Geographic data files
├── tiles/                      # Map tile files
├── deployment/                 # Deployment configurations
│   ├── docker-compose.yml      # Local development
│   ├── docker-compose.full.yml # Full production stack
│   ├── nginx.conf             # Reverse proxy configuration
│   ├── prometheus.yml         # Monitoring configuration
│   └── grafana/               # Dashboard configurations
├── config/                     # Environment configurations
└── tools/                      # Utility scripts
```

### Starting Services

```bash
# Start core services (backend, frontend, database)
docker-compose up -d

# Start full stack with monitoring
docker-compose -f deployment/docker-compose.full.yml up -d

# View logs
docker-compose logs -f
```

### Service URLs

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **Monitoring**: http://localhost:9090 (Prometheus)
- **Grafana**: http://localhost:3002 (admin/admin)

## Production Deployment

### Environment Variables

Create a `.env` file in the deployment directory:

```bash
# Database
POSTGRES_DB=disaster_response
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password_here

# Backend
FLASK_ENV=production
SECRET_KEY=your_secret_key_here

# Frontend
REACT_APP_API_URL=https://your-domain.com/api
NODE_ENV=production
```

### SSL Configuration

1. Place your SSL certificates in `deployment/ssl/`
2. Update nginx configuration if needed
3. Ensure ports 80 and 443 are open

### Deployment Commands

```bash
# Full deployment
./deployment/deploy.sh deploy

# Start services only
./deployment/deploy.sh start

# Check status
./deployment/deploy.sh status

# Stop services
./deployment/deploy.sh stop
```

## Monitoring & Observability

### Prometheus Metrics

The application exposes metrics at `/metrics` endpoints:

- **Backend**: http://localhost:5000/metrics
- **Frontend**: http://localhost:3000/metrics

### Grafana Dashboards

Pre-configured dashboards are available in `deployment/grafana/dashboards/`:

- System overview
- API performance
- Database metrics
- Application health

### Health Checks

```bash
# Application health
curl http://localhost/health

# API health
curl http://localhost:5000/api/health

# Database connectivity
docker-compose exec postgres pg_isready -U postgres
```

## Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check Docker status
docker info

# View detailed logs
docker-compose logs

# Check resource usage
docker stats
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose exec postgres psql -U postgres -d disaster_response

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Frontend Build Issues

```bash
# Clear node modules
cd frontend
rm -rf node_modules package-lock.json
npm install

# Rebuild container
docker-compose build frontend
```

### Log Analysis

```bash
# View all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f backend
docker-compose logs -f frontend

# Search for errors
docker-compose logs | grep -i error
```

## Security Considerations

### Production Hardening

1. **Change default passwords** for all services
2. **Use strong secrets** for Flask and database
3. **Enable SSL/TLS** for all external communication
4. **Restrict network access** using Docker networks
5. **Regular security updates** for base images

### Network Security

```bash
# Check exposed ports
docker-compose ps

# Verify network isolation
docker network ls
docker network inspect disaster-response-network
```

### Data Protection

- Database backups are stored in Docker volumes
- Sensitive data should be encrypted at rest
- Regular backup testing is recommended

## Performance Tuning

### Resource Limits

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Load balancer configuration
# Update nginx.conf for multiple backend instances
```

## Backup & Recovery

### Database Backups

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres disaster_response > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres disaster_response < backup.sql
```

### Volume Backups

```bash
# Backup volumes
docker run --rm -v disaster-response_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v disaster-response_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## Support

For deployment issues:

1. Check the troubleshooting section above
2. Review Docker and service logs
3. Verify system requirements
4. Check network connectivity
5. Review configuration files

## Contributing

When adding new services:

1. Update `docker-compose.yml`
2. Add health checks
3. Configure monitoring
4. Update documentation
5. Test deployment process
