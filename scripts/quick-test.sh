#!/bin/bash

# Quick Test Script for Disaster Response Dashboard
# Runs tests quickly without full deployment

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Quick Test Suite${NC}"
echo "========================"

# Function to print status
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Frontend Tests
print_status "Running Frontend Tests..."
cd frontend
if npm run test:unit; then
    print_success "Frontend tests passed"
else
    print_error "Frontend tests failed"
    exit 1
fi

# Step 2: Backend Tests
print_status "Running Backend Tests..."
cd ../backend
if source venv/bin/activate && python -m pytest --tb=short; then
    print_success "Backend tests passed"
else
    print_error "Backend tests failed"
    exit 1
fi

# Step 3: Summary
echo ""
print_success "🎉 All tests passed!"
echo ""
echo "📊 Test Summary:"
echo "   Frontend: ✅ Tests passed"
echo "   Backend:  ✅ Tests passed"
echo ""
echo "🚀 Ready for deployment!"

