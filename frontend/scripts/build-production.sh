#!/bin/bash

# Production Build Script for AWS Deployment
set -e

echo "🚀 Starting production build for AWS deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist node_modules/.vite

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Set production environment
export NODE_ENV=production
export VITE_APP_ENV=production
export VITE_DEBUG_MODE=false

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh dist | cut -f1)
echo "✅ Build completed successfully! Size: $BUILD_SIZE"

# Create production artifacts
echo "📦 Creating production artifacts..."
mkdir -p production-artifacts
cp -r dist/* production-artifacts/
cp Dockerfile production-artifacts/
cp nginx.conf production-artifacts/
cp taskdef.json production-artifacts/
cp appspec.yml production-artifacts/

# Create deployment package
tar -czf frontend-production-$(date +%Y%m%d-%H%M%S).tar.gz production-artifacts/

echo "🎉 Production build completed successfully!"
echo "📁 Build artifacts are in: production-artifacts/"
echo "📦 Deployment package: frontend-production-*.tar.gz"
echo ""
echo "Next steps:"
echo "1. Push the Docker image to ECR"
echo "2. Update the ECS task definition"
echo "3. Deploy using AWS CodeDeploy"
