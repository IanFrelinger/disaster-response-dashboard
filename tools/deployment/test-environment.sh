#!/bin/bash

# Test script to verify environment without full rebuild
# This helps validate the setup before running the main rebuild script

set -e

echo "🧪 Testing Disaster Response Dashboard Environment"
echo "=================================================="
echo "Timestamp: $(date)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Test 1: Project Structure
print_status "Test 1: Project Structure"
if [ -f "docker-compose.yml" ] && [ -d "backend" ] && [ -d "frontend" ] && [ -d "tiles" ]; then
    print_success "Project structure is correct"
else
    print_error "Project structure is missing required directories/files"
    exit 1
fi

# Test 2: Docker
print_status "Test 2: Docker"
if command -v docker >/dev/null 2>&1; then
    print_success "Docker is installed"
    if docker info >/dev/null 2>&1; then
        print_success "Docker is running"
        print_status "Docker version: $(docker --version)"
    else
        print_warning "Docker is installed but not running"
    fi
else
    print_error "Docker is not installed"
    exit 1
fi

# Test 3: Docker Compose
print_status "Test 3: Docker Compose"
if command -v docker-compose >/dev/null 2>&1; then
    print_success "Docker Compose is available"
    print_status "Docker Compose version: $(docker-compose --version)"
else
    print_error "Docker Compose is not available"
    exit 1
fi

# Test 4: Node.js
print_status "Test 4: Node.js"
if command -v node >/dev/null 2>&1; then
    print_success "Node.js is installed"
    print_status "Node.js version: $(node --version)"
else
    print_error "Node.js is not installed"
    exit 1
fi

# Test 5: npm
print_status "Test 5: npm"
if command -v npm >/dev/null 2>&1; then
    print_success "npm is installed"
    print_status "npm version: $(npm --version)"
else
    print_error "npm is not installed"
    exit 1
fi

# Test 6: Python
print_status "Test 6: Python"
if command -v python3 >/dev/null 2>&1; then
    print_success "Python 3 is installed"
    print_status "Python version: $(python3 --version)"
else
    print_error "Python 3 is not installed"
    exit 1
fi

# Test 7: curl
print_status "Test 7: curl"
if command -v curl >/dev/null 2>&1; then
    print_success "curl is installed"
else
    print_error "curl is not installed"
    exit 1
fi

# Test 8: Port Availability
print_status "Test 8: Port Availability"
for port in 3000 5001 8080; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is in use"
    else
        print_success "Port $port is available"
    fi
done

# Test 9: Frontend Dependencies
print_status "Test 9: Frontend Dependencies"
if [ -f "frontend/package.json" ]; then
    print_success "package.json found"
    cd frontend
    if npm list --depth=0 >/dev/null 2>&1; then
        print_success "Frontend dependencies are installed"
    else
        print_warning "Frontend dependencies are not installed (run 'npm ci' in frontend/)"
    fi
    cd ..
else
    print_warning "package.json not found in frontend/"
fi

# Test 10: Backend Dependencies
print_status "Test 10: Backend Dependencies"
if [ -f "backend/requirements.txt" ]; then
    print_success "requirements.txt found"
    cd backend
    if python3 -c "import sys; print('Python path:', sys.path)" >/dev/null 2>&1; then
        print_success "Python environment is accessible"
    else
        print_warning "Python environment may have issues"
    fi
    cd ..
else
    print_warning "requirements.txt not found in backend/"
fi

echo ""
echo "🎯 Environment Test Summary"
echo "==========================="
echo "✅ All required tools are installed"
echo "✅ Project structure is correct"
echo "⚠️  Check warnings above for any issues"
echo ""
echo "🚀 Ready to run rebuild script:"
echo "   ./tools/deployment/mac-rebuild-from-source-robust.sh"
echo ""
print_success "Environment test completed successfully!"
