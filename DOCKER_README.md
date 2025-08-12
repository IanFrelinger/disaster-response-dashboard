# 🐳 Docker Video Production Environment

Complete Docker container for video production with all dependencies pre-installed and configured.

## 🚀 Quick Start

### **Option 1: Using the Docker Runner Script (Recommended)**

```bash
# Build the Docker image
./scripts/docker-run.sh build

# Start the video production environment
./scripts/docker-run.sh start

# Open shell in container
./scripts/docker-run.sh shell

# Run the complete video pipeline
./scripts/docker-run.sh pipeline
```

### **Option 2: Using Docker Compose Directly**

```bash
# Build and start
docker-compose up -d

# Access the container
docker exec -it disaster-response-video bash

# Run video production
npm run build
```

### **Option 3: Using Docker Commands**

```bash
# Build the image
docker build -t disaster-response-video-production .

# Run the container
docker run -it --rm \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/assets:/app/assets \
  -v $(pwd)/narration.yaml:/app/narration.yaml \
  disaster-response-video-production
```

## 🏗️ Docker Image Features

### **Multi-Stage Build**
- **Base Stage**: Core dependencies (Node.js, FFmpeg, Python)
- **Development Stage**: Full development environment with tools
- **Production Stage**: Optimized for production use

### **Pre-Installed Dependencies**

#### **System Dependencies**
- **Node.js 18** with npm
- **FFmpeg** with full codec support
- **Python 3** with pip
- **Git** for version control
- **Bash** for scripting

#### **Python Packages**
- **opencv-python** - Computer vision and image processing
- **numpy** - Numerical computing
- **pillow** - Image processing
- **matplotlib** - Plotting and visualization
- **scipy** - Scientific computing
- **moviepy** - Video editing
- **imageio** - Image I/O
- **imageio-ffmpeg** - FFmpeg integration

#### **Development Tools (Development Stage)**
- **vim** and **nano** - Text editors
- **htop** - System monitoring
- **pytest** - Testing framework
- **black** - Code formatting
- **flake8** - Linting
- **jupyter** - Interactive development
- **ipython** - Enhanced Python shell

## 📁 Volume Mounts

### **Required Mounts**
```yaml
volumes:
  - ./output:/app/output          # Generated video files
  - ./assets:/app/assets          # Background music, images
  - ./narration.yaml:/app/narration.yaml  # Video script
```

### **Development Mounts (Optional)**
```yaml
volumes:
  - .:/app                        # Full source code mount
  - /app/node_modules             # Preserve node_modules
  - /System/Library/Speech/Voices:/System/Library/Speech/Voices:ro  # macOS TTS
  - /System/Library/Fonts:/System/Library/Fonts:ro                  # macOS fonts
```

## 🎯 Usage Examples

### **Complete Video Production Pipeline**

```bash
# 1. Build the image
./scripts/docker-run.sh build

# 2. Start the environment
./scripts/docker-run.sh start

# 3. Run the complete pipeline
./scripts/docker-run.sh pipeline

# 4. Check the output
ls -la output/
```

### **Step-by-Step Production**

```bash
# Start container
./scripts/docker-run.sh start

# Generate voiceover only
./scripts/docker-run.sh narrate

# Create rough cut only
./scripts/docker-run.sh assemble

# Create final video only
./scripts/docker-run.sh final
```

### **Development Workflow**

```bash
# Start development environment
./scripts/docker-run.sh start

# Open shell for development
./scripts/docker-run.sh shell

# Inside container:
npm run dev          # Interactive development tools
npm run test         # Run all tests
npm run narrate      # Test narration generation
```

### **Testing the Environment**

```bash
# Run comprehensive tests
./scripts/docker-run.sh test

# Check environment status
./scripts/docker-run.sh status

# View container logs
./scripts/docker-run.sh logs
```

## 🔧 Configuration

### **Environment Variables**

```bash
# Development
NODE_ENV=development
DISPLAY=${DISPLAY}
FFMPEG_BINARY=/usr/bin/ffmpeg
PYTHONPATH=/app

# Production
NODE_ENV=production
FFMPEG_BINARY=/usr/bin/ffmpeg
```

### **Docker Compose Profiles**

```bash
# Development (default)
docker-compose up -d

# Production
docker-compose --profile production up -d

# Testing
docker-compose --profile testing up -d
```

## 🧪 Testing

### **Automated Test Suite**

The container includes a comprehensive test suite that validates:

- ✅ **System Dependencies** - Node.js, FFmpeg, Python
- ✅ **FFmpeg Installation** - Codecs, formats, processing
- ✅ **Python Environment** - Packages, imports, functionality
- ✅ **Canvas Support** - Image generation and manipulation
- ✅ **TTS Capabilities** - Text-to-speech functionality
- ✅ **Video Processing** - End-to-end video creation
- ✅ **Configuration Files** - YAML validation
- ✅ **Output Directories** - File system access
- ✅ **Integration Pipeline** - Complete workflow

### **Running Tests**

```bash
# Run all tests
./scripts/docker-run.sh test

# Or inside container
docker exec -it disaster-response-video npm run test
```

## 🚀 Production Deployment

### **Optimized Production Image**

```bash
# Build production image
docker build --target production -t disaster-response-video-production:prod .

# Run production container
docker run -d \
  --name disaster-response-video-prod \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/assets:/app/assets \
  -v $(pwd)/narration.yaml:/app/narration.yaml \
  disaster-response-video-production:prod
```

### **Production Features**
- **Non-root user** for security
- **Minimal image size** (optimized layers)
- **Health checks** for monitoring
- **Resource limits** for stability
- **Read-only file system** where possible

## 🔍 Troubleshooting

### **Common Issues**

#### **FFmpeg Not Found**
```bash
# Check FFmpeg installation
docker exec -it disaster-response-video ffmpeg -version

# Rebuild with FFmpeg
docker build --no-cache -t disaster-response-video-production .
```

#### **TTS Not Working**
```bash
# Test TTS inside container
docker exec -it disaster-response-video say "Hello world"

# Check volume mounts
docker exec -it disaster-response-video ls -la /System/Library/Speech/Voices/
```

#### **Canvas Issues**
```bash
# Rebuild canvas
docker exec -it disaster-response-video npm rebuild canvas

# Check dependencies
docker exec -it disaster-response-video npm list canvas
```

#### **Memory Issues**
```bash
# Increase memory limit
docker run -it --memory=4g disaster-response-video-production

# Or in docker-compose.yml
services:
  video-production:
    deploy:
      resources:
        limits:
          memory: 4G
```

### **Performance Optimization**

#### **Build Optimization**
```bash
# Use build cache
docker build --build-arg BUILDKIT_INLINE_CACHE=1 .

# Parallel builds
DOCKER_BUILDKIT=1 docker build .
```

#### **Runtime Optimization**
```bash
# Use GPU acceleration (if available)
docker run --gpus all disaster-response-video-production

# Optimize for CPU
docker run --cpus=4 disaster-response-video-production
```

## 📊 Monitoring

### **Health Checks**
```bash
# Check container health
docker inspect disaster-response-video | grep Health -A 10

# Manual health check
docker exec disaster-response-video node -e "console.log('Healthy')"
```

### **Resource Usage**
```bash
# Monitor resource usage
docker stats disaster-response-video

# Check disk usage
docker exec disaster-response-video df -h
```

## 🔄 CI/CD Integration

### **GitHub Actions Example**

```yaml
name: Video Production Pipeline

on:
  push:
    branches: [main]

jobs:
  build-video:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t disaster-response-video-production .
    
    - name: Run video production
      run: |
        docker run --rm \
          -v ${{ github.workspace }}/output:/app/output \
          -v ${{ github.workspace }}/assets:/app/assets \
          -v ${{ github.workspace }}/narration.yaml:/app/narration.yaml \
          disaster-response-video-production npm run build
    
    - name: Upload video artifact
      uses: actions/upload-artifact@v3
      with:
        name: disaster-response-demo
        path: output/disaster-response-demo.mp4
```

## 📚 Additional Resources

### **Docker Commands Reference**

```bash
# Build specific target
docker build --target development -t disaster-response-video:dev .

# Run with custom command
docker run -it disaster-response-video npm run dev

# Execute command in running container
docker exec -it disaster-response-video bash

# Copy files from container
docker cp disaster-response-video:/app/output ./local-output

# View container logs
docker logs -f disaster-response-video
```

### **Docker Compose Commands**

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d video-production

# View logs
docker-compose logs -f video-production

# Scale services
docker-compose up -d --scale video-production=2

# Stop and remove
docker-compose down --volumes --remove-orphans
```

---

**Ready to create professional videos in a containerized environment!** 🎬🐳
