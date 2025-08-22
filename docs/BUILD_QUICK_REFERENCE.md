# Build Quick Reference

## 🚀 Essential Commands

**Note**: Run from **project root** (`disaster-response-dashboard/`) unless specified otherwise.

### Build All Services
```bash
# Build from docker-compose (from project root)
docker-compose -f config/docker/docker-compose.demo.yml build

# Build and start (from project root)
docker-compose -f config/docker/docker-compose.demo.yml up -d
```

### Individual Container Builds

#### Backend
```bash
cd backend
docker build -t disaster-response-backend:latest .
docker run -d --name disaster-backend -p 5001:8000 disaster-response-backend:latest
cd ..  # Return to project root
```

#### Frontend
```bash
cd frontend
npm ci && npm run build
docker build -t disaster-response-frontend:latest .
docker run -d --name disaster-frontend -p 3000:80 disaster-response-frontend:latest
cd ..  # Return to project root
```

#### Tile Server
```bash
cd tiles
docker build -t disaster-tileserver:latest .
docker run -d --name disaster-tileserver -p 8080:8080 -v $(pwd):/data disaster-tileserver:latest
cd ..  # Return to project root
```

## 🔧 Common Operations

### Check Status
```bash
# Running containers
docker ps

# Health checks
curl http://localhost:5001/api/health
curl http://localhost:3000/health
curl http://localhost:8080/
```

### Stop Services
```bash
# Stop all
docker-compose -f config/docker/docker-compose.demo.yml down

# Stop individual
docker stop disaster-backend disaster-frontend disaster-tileserver
```

### View Logs
```bash
# All services
docker-compose -f config/docker/docker-compose.demo.yml logs -f

# Individual containers
docker logs disaster-backend
docker logs disaster-frontend
docker logs disaster-tileserver
```

## 🎯 Environment-Specific Builds

### Demo Mode
```bash
# Backend
docker build --build-arg ENVIRONMENT=demo -t disaster-response-backend:demo .

# Frontend
docker build --build-arg NODE_ENV=demo -t disaster-response-frontend:demo .
```

### Production Mode
```bash
# Backend
docker build --build-arg ENVIRONMENT=production -t disaster-response-backend:prod .

# Frontend
docker build --build-arg NODE_ENV=production -t disaster-response-frontend:prod .
```

## 🚨 Troubleshooting

### Port Conflicts
```bash
# Check ports
lsof -i :5001 :3000 :8080

# Kill processes
sudo lsof -ti:5001 | xargs kill -9
```

### Rebuild Everything
```bash
# Clean and rebuild
docker system prune -a
docker-compose -f config/docker/docker-compose.demo.yml build --no-cache

# Remove specific project images
docker images | grep disaster-response | awk '{print $3}' | xargs docker rmi

# Force rebuild without cache
docker build --no-cache -t disaster-response-backend:latest backend/
```

### **Nuclear Option - Complete Rebuild from Source**
```bash
# Complete clean slate rebuild (requires confirmation)
./tools/deployment/rebuild-from-source.sh

# This script will:
# ❌ Remove ALL existing containers/images/networks
# 🔄 Rebuild everything from source with --no-cache --pull
# ✅ Validate all services are running
```

### Network Issues
```bash
# Create custom network
docker network create disaster-network

# Run on custom network
docker run --network disaster-network [container-options]
```

## 📍 Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Tile Server**: http://localhost:8080
- **Health Check**: http://localhost:5001/api/health

## 🔄 Development Workflow

```bash
# 1. Make code changes
# 2. Rebuild affected container
docker build -t disaster-response-backend:latest backend/

# 3. Restart container
docker restart disaster-backend

# 4. Test changes
curl http://localhost:5001/api/health
```
