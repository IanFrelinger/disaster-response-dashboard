# Mac Rebuild from Source Scripts

This directory contains robust scripts for completely rebuilding the Disaster Response Dashboard from source on any Mac environment.

## 🚀 Quick Start

### 1. Test Your Environment First
```bash
# Run from project root (disaster-response-dashboard/)
./tools/deployment/test-environment.sh
```

### 2. Run the Complete Rebuild
```bash
# Run from project root (disaster-response-dashboard/)
./tools/deployment/mac-rebuild-from-source-robust.sh
```

## 📋 Scripts Overview

### **`test-environment.sh`** - Environment Validation
- ✅ Tests all prerequisites
- ✅ Validates project structure
- ✅ Checks tool versions
- ✅ Verifies port availability
- ✅ Safe to run anytime

### **`mac-rebuild-from-source-robust.sh`** - Complete Rebuild
- 🔥 **Nuclear option** - removes everything and rebuilds from scratch
- 🛡️ **Robust error handling** with retry logic
- 🔄 **Docker connectivity management** with wait loops
- ✅ **Comprehensive validation** of all services
- 🧹 **Automatic cleanup** on exit or failure

## 🔧 What Gets Rebuilt

### **Complete Cleanup (Phase 1)**
- ❌ Stops and removes ALL existing disaster-response containers
- ❌ Removes ALL existing disaster-response images
- ❌ Removes ALL existing disaster-response networks
- 🧹 Cleans up Docker system completely

### **Source Rebuild (Phase 2)**
- 🏗️ **Backend**: Python application with `--no-cache --pull`
- 🏗️ **Frontend**: React app with fresh `npm ci` and `npm run build`
- 🏗️ **Tile Server**: Map tiles with `--no-cache --pull`

### **Deployment (Phase 3)**
- 📦 Fresh containers with new networking
- ⚙️ Environment-specific configuration
- 🌐 Port mapping and volume mounting

### **Validation (Phase 4)**
- 🏥 Health checks for all services
- 🔄 Retry logic with 30 attempts
- 📊 Service status verification

## 🎯 Prerequisites

### **Required Tools**
- **Docker Desktop** (version 20.10+)
- **Node.js** (version 18+)
- **npm** (comes with Node.js)
- **Python 3** (version 3.11+)
- **curl** (usually pre-installed on Mac)

### **Installation Commands**
```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# Install Node.js
brew install node

# Install Python 3
brew install python

# Install curl (if needed)
brew install curl
```

## 🚨 Safety Features

### **Confirmation & Validation**
- ✅ **Prerequisite validation** before any destructive actions
- ✅ **Port conflict resolution** with automatic process killing
- ✅ **Docker connectivity management** with wait loops
- ✅ **Service health validation** after deployment

### **Error Handling**
- 🛡️ **Retry logic** for Docker operations (3 attempts)
- 🛡️ **Graceful cleanup** on exit or failure
- 🛡️ **Comprehensive logging** of all operations
- 🛡️ **Safe Docker command execution** with error checking

### **Cleanup Protection**
- 🧹 **Automatic cleanup** of new containers on script failure
- 🧹 **Network isolation** with unique naming
- 🧹 **Volume mounting** for persistent data

## 🔄 Usage Workflow

### **Development Environment Reset**
```bash
# 1. Test environment
./tools/deployment/test-environment.sh

# 2. Run complete rebuild
./tools/deployment/mac-rebuild-from-source-robust.sh

# 3. Verify services
curl http://localhost:5001/api/health
curl http://localhost:3000
curl http://localhost:8080
```

### **Troubleshooting**
```bash
# Check running containers
docker ps --filter name=disaster-mac-robust

# View logs
docker logs disaster-mac-robust-backend
docker logs disaster-mac-robust-frontend
docker logs disaster-mac-robust-tileserver

# Stop all services
docker stop disaster-mac-robust-* && docker rm disaster-mac-robust-*
```

## 📍 Service Endpoints

After successful rebuild:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Tile Server**: http://localhost:8080
- **Health Check**: http://localhost:5001/api/health

## 🚨 Troubleshooting

### **Common Issues**

#### **Docker Not Running**
```bash
# Start Docker Desktop
open -a Docker

# Wait for it to fully start
sleep 30

# Test connectivity
docker info
```

#### **Port Conflicts**
```bash
# Check what's using ports
lsof -i :3000 :5001 :8080

# Kill processes manually if needed
sudo lsof -ti:3000 | xargs kill -9
```

#### **Build Failures**
```bash
# Check Docker logs
docker system info

# Clear Docker cache
docker system prune -a -f

# Restart Docker Desktop
```

#### **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions (if needed)
sudo usermod -aG docker $USER
```

### **Recovery Commands**
```bash
# Stop all disaster-response containers
docker stop $(docker ps -q --filter "name=disaster-response")

# Remove all disaster-response containers
docker rm $(docker ps -aq --filter "name=disaster-response")

# Remove all disaster-response images
docker images | grep disaster-response | awk '{print $3}' | xargs docker rmi -f

# Clean up networks
docker network prune -f
```

## 📚 Script Details

### **Environment Detection**
- 🔍 **Project root validation** with required files/directories
- 🔍 **Tool availability checking** with helpful error messages
- 🔍 **Version compatibility** verification
- 🔍 **Port availability** testing

### **Docker Management**
- 🐳 **Connectivity waiting** with exponential backoff
- 🐳 **Safe command execution** with retry logic
- 🐳 **Network isolation** for clean deployments
- 🐳 **Volume management** for persistent data

### **Build Process**
- 🏗️ **Source-based builds** with `--no-cache --pull`
- 🏗️ **Dependency management** with fresh installs
- 🏗️ **Multi-stage validation** with health checks
- 🏗️ **Error recovery** with graceful fallbacks

## 🎉 Success Indicators

### **Complete Success**
- ✅ All containers running and healthy
- ✅ All services responding to health checks
- ✅ All ports accessible
- ✅ Fresh builds from source code

### **Partial Success**
- ⚠️ Some services may have warnings
- ⚠️ Check logs for any issues
- ⚠️ Verify all endpoints are accessible

### **Failure Recovery**
- 🚨 Script will attempt cleanup
- 🚨 Check error messages for specific issues
- 🚨 Run environment test to verify setup
- 🚨 Check Docker Desktop status

## 🔧 Customization

### **Port Configuration**
Edit the script to change default ports:
```bash
# Port configuration
FRONTEND_PORT=3000      # Change if needed
BACKEND_PORT=5001       # Change if needed
TILE_SERVER_PORT=8080   # Change if needed
```

### **Container Names**
Edit the script to change container naming:
```bash
# Container naming
BACKEND_TAG="disaster-response-backend"
FRONTEND_TAG="disaster-response-frontend"
TILESERVER_TAG="disaster-tileserver"
```

### **Network Configuration**
Edit the script to change network settings:
```bash
# Network configuration
NETWORK_NAME="disaster-mac-robust-network"
```

## 📞 Support

### **Before Asking for Help**
1. ✅ Run `./tools/deployment/test-environment.sh`
2. ✅ Check Docker Desktop is running
3. ✅ Verify all prerequisites are installed
4. ✅ Check script output for specific error messages

### **Common Solutions**
- **Docker issues**: Restart Docker Desktop
- **Port conflicts**: Kill processes using required ports
- **Permission issues**: Fix file ownership and Docker permissions
- **Build failures**: Clear Docker cache and restart

### **Script Logs**
The script provides detailed logging for troubleshooting:
- 🔵 **Info messages** for status updates
- 🟢 **Success messages** for completed steps
- 🟡 **Warning messages** for non-critical issues
- 🔴 **Error messages** for failures

## 🚀 Ready to Rebuild?

```bash
# 1. Test your environment
./tools/deployment/test-environment.sh

# 2. Run the complete rebuild
./tools/deployment/mac-rebuild-from-source-robust.sh

# 3. Enjoy your fresh disaster response dashboard!
```

**Remember**: This script will completely remove and rebuild everything from source. Make sure you have your source code committed and backed up before running!
