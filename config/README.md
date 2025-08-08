# Configuration Directory

This directory contains configuration files for deployment and Docker services.

## 📁 Directory Structure

### 🐳 **docker/**
Contains Docker Compose configuration files:
- `docker-compose.yml` - Main production configuration
- `docker-compose.demo.yml` - Demo environment with tile system
- `docker-compose.tiles.yml` - Tile server only configuration

### 🚀 **deployment/**
Contains deployment configuration and scripts:
- `quick_validate.sh` - Quick validation script for deployment

## 🎯 **Usage Examples**

### Start Demo Environment
```bash
docker-compose -f config/docker/docker-compose.demo.yml up -d
```

### Start Production Environment
```bash
docker-compose -f config/docker/docker-compose.yml up -d
```

### Start Tile Server Only
```bash
docker-compose -f config/docker/docker-compose.tiles.yml up -d
```

### Quick Validation
```bash
./config/deployment/quick_validate.sh
```

## 📋 **Configuration Files**

### **docker-compose.yml**
Main production configuration with:
- Backend API service
- Frontend application
- Database services
- Production networking

### **docker-compose.demo.yml**
Demo environment configuration with:
- Backend API with synthetic data
- Frontend with tile integration
- Tile server for map data
- Development frontend (optional)
- PMTiles server (optional)

### **docker-compose.tiles.yml**
Tile server only configuration for:
- Standalone tile serving
- Development and testing
- Lightweight deployment

## 🔧 **Environment Variables**

Configuration files use environment variables from:
- `.env` files in respective service directories
- System environment variables
- Docker secrets for sensitive data

## 🚨 **Troubleshooting**

### Common Issues
1. **Port Conflicts**: Ensure ports are not already in use
2. **Volume Mounts**: Check file paths and permissions
3. **Network Issues**: Verify Docker network configuration
4. **Environment Variables**: Ensure all required variables are set

### Getting Help
- Check individual service logs
- Review Docker Compose documentation
- Consult service-specific README files
