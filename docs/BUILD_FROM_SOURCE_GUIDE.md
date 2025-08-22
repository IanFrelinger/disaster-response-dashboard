# Building Disaster Response Dashboard from Source

This guide provides step-by-step instructions for building and running the disaster response dashboard containers directly from source code using command-line tools.

## Project Structure

```
disaster-response-dashboard/
├── backend/                 # Python backend application
├── frontend/               # React frontend application  
├── tiles/                  # Map tile server
├── config/
│   └── docker/            # Docker Compose files
├── tools/
│   └── deployment/        # Deployment scripts
└── docs/                  # Documentation
```

**Important**: Most commands should be run from the **project root** (`disaster-response-dashboard/`). Individual container builds require navigating to specific directories.

## Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Node.js** (version 18+)
- **Python** (version 3.11+)
- **Git** (for cloning the repository)

## Quick Start

### 1. Clone and Navigate to Project

```bash
git clone <repository-url>
cd disaster-response-dashboard
```

**Important**: All commands in this guide assume you're running from the **project root directory** (`disaster-response-dashboard/`).

### 2. Build and Run with Docker Compose

```bash
# Build all containers from source (run from project root)
docker-compose -f config/docker/docker-compose.demo.yml build

# Start all services (run from project root)
docker-compose -f config/docker/docker-compose.demo.yml up -d

# View logs (run from project root)
docker-compose -f config/docker/docker-compose.demo.yml logs -f
```

## Manual Build Process

### **Directory Navigation Pattern**

Most commands follow this pattern:
1. **Start from project root** for Docker Compose and orchestration
2. **Navigate to specific directories** for individual container builds
3. **Return to project root** when done with individual builds

### Backend Container

#### Option 1: Direct Docker Build

```bash
# Navigate to backend directory
cd backend

# Build the container
docker build -t disaster-response-backend:latest .

# Run the container
docker run -d \
  --name disaster-backend \
  -p 5001:8000 \
  -e ENVIRONMENT_MODE=demo \
  -e USE_SYNTHETIC_DATA=true \
  disaster-response-backend:latest

# Check if running
curl http://localhost:5001/api/health

# Return to project root when done
cd ..
```

#### Option 2: Build with Custom Tags

```bash
cd backend

# Build with specific version
docker build -t disaster-response-backend:v1.0.0 .

# Build with demo environment
docker build \
  --build-arg ENVIRONMENT=demo \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t disaster-response-backend:demo .

# Return to project root when done
cd ..
```

### Frontend Container

#### Option 1: Build and Serve Locally

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Build Docker container
docker build -t disaster-response-frontend:latest .

# Run the container
docker run -d \
  --name disaster-frontend \
  -p 3000:80 \
  -e VITE_ENVIRONMENT_MODE=demo \
  -e VITE_USE_SYNTHETIC_DATA=true \
  disaster-response-frontend:latest

# Return to project root when done
cd ..
```

#### Option 2: Development Mode

```bash
cd frontend

# Install dependencies
npm ci

# Start development server
npm run dev:demo

# In another terminal, build container
docker build \
  --target development \
  -t disaster-response-frontend:dev .

# Return to project root when done
cd ..
```

### Tile Server Container

```bash
# Navigate to tiles directory
cd tiles

# Build tile server
docker build -t disaster-tileserver:latest .

# Run tile server
docker run -d \
  --name disaster-tileserver \
  -p 8080:8080 \
  -v $(pwd):/data \
  disaster-tileserver:latest

# Return to project root when done
cd ..
```

## Advanced Build Options

### Multi-Stage Builds

```bash
# Backend with development and production stages
cd backend
docker build \
  --target development \
  -t disaster-response-backend:dev .

docker build \
  --target production \
  -t disaster-response-backend:prod .
```

### Build with BuildKit

```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Build with BuildKit
docker build \
  --progress=plain \
  --no-cache \
  -t disaster-response-backend:latest .
```

### Build with Cache Optimization

```bash
cd backend

# Build with layer caching
docker build \
  --cache-from disaster-response-backend:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t disaster-response-backend:latest .
```

## Environment-Specific Builds

### Demo Environment

```bash
# Backend for demo
cd backend
docker build \
  --build-arg ENVIRONMENT=demo \
  --build-arg USE_SYNTHETIC_DATA=true \
  -t disaster-response-backend:demo .

# Frontend for demo
cd ../frontend
docker build \
  --build-arg NODE_ENV=demo \
  --build-arg VITE_ENVIRONMENT_MODE=demo \
  -t disaster-response-frontend:demo .
```

### Production Environment

```bash
# Backend for production
cd backend
docker build \
  --build-arg ENVIRONMENT=production \
  --build-arg USE_SYNTHETIC_DATA=false \
  -t disaster-response-backend:prod .

# Frontend for production
cd ../frontend
docker build \
  --build-arg NODE_ENV=production \
  --build-arg VITE_ENVIRONMENT_MODE=production \
  -t disaster-response-frontend:prod .
```

## Network Configuration

### Create Custom Network

```bash
# Create network for services
docker network create disaster-network

# Run containers on custom network
docker run -d \
  --name disaster-backend \
  --network disaster-network \
  -p 5001:8000 \
  disaster-response-backend:latest

docker run -d \
  --name disaster-frontend \
  --network disaster-network \
  -p 3000:80 \
  disaster-response-frontend:latest
```

## Validation and Testing

### Health Checks

```bash
# Backend health
curl -f http://localhost:5001/api/health

# Frontend health
curl -f http://localhost:3000/health

# Tile server health
curl -f http://localhost:8080/
```

### Container Status

```bash
# Check running containers
docker ps

# Check container logs
docker logs disaster-backend
docker logs disaster-frontend
docker logs disaster-tileserver

# Check container resources
docker stats
```

## Troubleshooting

### Common Build Issues

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t disaster-response-backend:latest .

# Check Docker daemon logs
docker system info
```

### Port Conflicts

```bash
# Check what's using ports
lsof -i :5001
lsof -i :3000
lsof -i :8080

# Kill processes using ports
sudo lsof -ti:5001 | xargs kill -9
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
```

## Image Cleanup Options

### **Default Behavior (No Cleanup)**
The build scripts **do NOT automatically remove old images** by default. This preserves your Docker cache and allows for faster incremental builds.

### **When to Clean Old Images**
- **Development iterations** - When you want to ensure fresh builds
- **Dependency changes** - After updating requirements.txt or package.json
- **Cache issues** - When builds behave unexpectedly
- **Storage cleanup** - To free up disk space

### **Cleanup Commands**

#### **Remove Specific Images**
```bash
# Remove specific containers
docker rmi disaster-response-backend:latest
docker rmi disaster-response-frontend:latest
docker rmi disaster-response-tileserver:latest

# Remove all project images
docker images | grep disaster-response | awk '{print $3}' | xargs docker rmi
```

#### **Clean All Unused Images**
```bash
# Remove dangling images (recommended)
docker image prune -f

# Remove all unused images (more aggressive)
docker image prune -a -f

# Full system cleanup (use with caution)
docker system prune -a -f
```

#### **Force Rebuild Without Cache**
```bash
# Build without using cache
docker build --no-cache -t disaster-response-backend:latest .

# Pull latest base images and rebuild
docker build --pull --no-cache -t disaster-response-backend:latest .
```

## **Complete Rebuild Script (Nuclear Option)**

### **`tools/deployment/rebuild-from-source.sh`** - Complete Clean Slate

This script is the **nuclear option** that completely removes everything and rebuilds from scratch:

```bash
# Make executable (run from project root)
chmod +x tools/deployment/rebuild-from-source.sh

# Run the complete rebuild
./tools/deployment/rebuild-from-source.sh
```

#### **What This Script Does:**

🔥 **PHASE 1: COMPLETE CLEANUP**
- ❌ Stops and removes ALL existing disaster-response containers
- ❌ Removes ALL existing disaster-response images  
- ❌ Removes ALL existing disaster-response networks
- 🧹 Cleans up Docker system completely

🔄 **PHASE 2: REBUILD FROM SOURCE**
- 🏗️ Builds backend with `--no-cache --pull`
- 🏗️ Installs frontend dependencies fresh with `npm ci`
- 🏗️ Builds frontend application with `npm run build`
- 🏗️ Builds frontend Docker image with `--no-cache --pull`
- 🏗️ Builds tile server with `--no-cache --pull`

🚀 **PHASE 3: DEPLOY NEW CONTAINERS**
- 📦 Starts all services with fresh containers
- 🌐 Creates new network for isolation
- ⚙️ Configures environment variables

✅ **PHASE 4: VALIDATION**
- 🏥 Health checks for all services
- 🔄 Retry logic with 30 attempts
- 📊 Service status verification

🎉 **PHASE 5: SUCCESS SUMMARY**
- 📋 Complete service information
- 🔧 Management commands
- 🧹 Cleanup instructions

#### **Usage Examples:**

```bash
# Complete rebuild (requires confirmation)
./tools/deployment/rebuild-from-source.sh

# The script will ask for confirmation:
# "Are you sure you want to continue? (yes/no): yes"
```

#### **When to Use This Script:**

- 🚨 **Major dependency changes** (Python requirements, npm packages)
- 🚨 **Cache corruption** or build issues
- 🚨 **Complete reset** for troubleshooting
- 🚨 **Fresh deployment** from source
- 🚨 **Development environment** reset

#### **Safety Features:**

- ✅ **Confirmation prompt** before destructive actions
- ✅ **Error handling** with cleanup on exit
- ✅ **Health validation** after deployment
- ✅ **Comprehensive logging** of all operations
- ✅ **Cleanup trap** for graceful exit handling

---

## Complete Build Script

```bash
#!/bin/bash

set -e

echo "🚀 Building Disaster Response Dashboard from Source"
echo "=================================================="

# Configuration
BACKEND_TAG="disaster-response-backend:custom"
FRONTEND_TAG="disaster-response-frontend:custom"
TILESERVER_TAG="disaster-tileserver:custom"
NETWORK_NAME="disaster-custom-network"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse command line arguments
CLEAN_IMAGES=false
FORCE_REBUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_IMAGES=true
            shift
            ;;
        --force)
            FORCE_REBUILD=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--clean] [--force]"
            echo "  --clean     Remove old images before building"
            echo "  --force     Force rebuild without cache"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Clean old images if requested
if [ "$CLEAN_IMAGES" = true ]; then
    print_status "Cleaning old images..."
    docker rmi $BACKEND_TAG $FRONTEND_TAG $TILESERVER_TAG 2>/dev/null || true
    docker image prune -f
    print_success "Old images cleaned"
fi

# Build backend
print_status "Building backend..."
cd backend
if [ "$FORCE_REBUILD" = true ]; then
    docker build --no-cache -t $BACKEND_TAG .
else
    docker build -t $BACKEND_TAG .
fi
print_success "Backend built successfully"

# Build frontend
print_status "Building frontend..."
cd ../frontend
if [ "$FORCE_REBUILD" = true ]; then
    docker build --no-cache -t $FRONTEND_TAG .
else
    docker build -t $FRONTEND_TAG .
fi
print_success "Frontend built successfully"

# Build tile server
print_status "Building tile server..."
cd ../tiles
if [ "$FORCE_REBUILD" = true ]; then
    docker build --no-cache -t $TILESERVER_TAG .
else
    docker build -t $TILESERVER_TAG .
fi
print_success "Tile server built successfully"

# Create network
print_status "Creating network..."
docker network create $NETWORK_NAME 2>/dev/null || true
print_success "Network created"

# Start services
print_status "Starting services..."
docker run -d \
  --name disaster-backend-custom \
  --network $NETWORK_NAME \
  -p 5001:8000 \
  $BACKEND_TAG

docker run -d \
  --name disaster-tileserver-custom \
  --network $NETWORK_NAME \
  -p 8080:8080 \
  -v $(pwd):/data \
  $TILESERVER_TAG

docker run -d \
  --name disaster-frontend-custom \
  --network $NETWORK_NAME \
  -p 3000:80 \
  $FRONTEND_TAG

print_success "All services started!"

echo ""
echo "🎉 Custom build complete!"
echo "========================="
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo "Tile Server: http://localhost:8080"
echo ""
echo "Stop services: docker stop disaster-*-custom"
echo "Remove containers: docker rm disaster-*-custom"
echo ""
echo "Build options used:"
echo "  Clean images: $CLEAN_IMAGES"
echo "  Force rebuild: $FORCE_REBUILD"
```

Make it executable and run:

```bash
chmod +x build-custom.sh

# Basic build (preserves cache)
./build-custom.sh

# Clean old images before building
./build-custom.sh --clean

# Force rebuild without cache
./build-custom.sh --force

# Clean and force rebuild
./build-custom.sh --clean --force

# Show help
./build-custom.sh --help
```

### **Usage Examples**

#### **Development Workflow (Preserve Cache)**
```bash
# Fast incremental builds
./build-custom.sh
```

#### **Clean Build After Dependencies Change**
```bash
# Remove old images and rebuild
./build-custom.sh --clean
```

#### **Force Fresh Build for Testing**
```bash
# Ensure completely fresh build
./build-custom.sh --force
```

#### **Complete Clean Slate**
```bash
# Remove old images and force rebuild
./build-custom.sh --clean --force
```

## Summary

This guide covers:

- ✅ **Direct Docker builds** from source code
- ✅ **Environment-specific configurations**
- ✅ **Network setup** for container communication
- ✅ **Health checks** and validation
- ✅ **Troubleshooting** common issues
- ✅ **Custom build scripts** for automation

The containers are built directly from your source code, ensuring you're running the latest version with all your changes included.

## **Directory Usage Summary**

### **🏠 Project Root Commands** (run from `disaster-response-dashboard/`)
- Docker Compose operations
- Deployment scripts
- Project-wide orchestration
- Health checks and validation

### **📁 Subdirectory Commands** (require `cd` navigation)
- Individual container builds
- Dependency installation
- Source code compilation
- **Always return to project root** when done

### **🔄 Navigation Pattern**
```bash
# Start from project root
cd disaster-response-dashboard

# For orchestration (stay in root)
docker-compose -f config/docker/docker-compose.demo.yml up -d

# For individual builds (navigate, build, return)
cd backend
docker build -t disaster-response-backend:latest .
cd ..

cd frontend  
npm ci && npm run build
docker build -t disaster-response-frontend:latest .
cd ..

# Back to project root for next operations
```
