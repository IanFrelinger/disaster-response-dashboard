#!/usr/bin/env bash

# CI Pipeline Validation Script
# This script validates that all CI pipeline commands work locally
# Run this before pushing to ensure CI will pass

set -e  # Exit on any error

echo "🚀 Validating CI Pipeline Commands..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a command and check its exit status
run_command() {
    local name="$1"
    local command="$2"
    
    echo -e "\n${YELLOW}Testing: $name${NC}"
    echo "Command: $command"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $name: PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: FAILED${NC}"
        return 1
    fi
}

# Track overall success
overall_success=true

echo -e "\n${YELLOW}Phase 1: Type Safety & Code Quality${NC}"
echo "----------------------------------------"

if run_command "Type Check" "npm run type-check"; then
    echo "✅ Type checking passed"
else
    overall_success=false
fi

if run_command "Lint" "npm run lint"; then
    echo "✅ Linting passed"
else
    overall_success=false
fi

echo -e "\n${YELLOW}Phase 2: Render Stability${NC}"
echo "---------------------------"

if run_command "Render Gauntlet" "npm run test:render-gauntlet"; then
    echo "✅ Component render tests passed"
else
    overall_success=false
fi

echo -e "\n${YELLOW}Phase 3: Route Stability${NC}"
echo "---------------------------"

# Check if dev server can start
echo -e "\n${YELLOW}Starting dev server for route tests...${NC}"
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to start
echo "Waiting for dev server to start..."
sleep 10

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Dev server started successfully"
    
    if run_command "Route Sweeper" "npm run test:route-sweeper"; then
        echo "✅ Route stability tests passed"
    else
        overall_success=false
    fi
    
    # Stop dev server
    kill $DEV_PID 2>/dev/null || true
    echo "✅ Dev server stopped"
else
    echo -e "${RED}❌ Dev server failed to start${NC}"
    overall_success=false
    kill $DEV_PID 2>/dev/null || true
fi

echo -e "\n${YELLOW}Phase 4: Concurrency & Resilience${NC}"
echo "----------------------------------------"

if run_command "Concurrency Tests" "npm run test:concurrency"; then
    echo "✅ Concurrency tests passed"
else
    overall_success=false
fi

echo -e "\n${YELLOW}Phase 5: Integration & 3D Tests${NC}"
echo "----------------------------------------"

if run_command "Integration Tests" "npm run test:integration"; then
    echo "✅ Integration tests passed"
else
    overall_success=false
fi

echo -e "\n${YELLOW}Phase 6: Cross-Browser Tests${NC}"
echo "----------------------------------------"

if run_command "Cross-Browser Tests" "npm run test:cross-browser"; then
    echo "✅ Cross-browser tests passed"
else
    overall_success=false
fi

echo -e "\n${YELLOW}Phase 7: Performance & Accessibility${NC}"
echo "----------------------------------------"

if run_command "Quality Gates" "npm run test:quality-gates"; then
    echo "✅ Performance & accessibility tests passed"
else
    overall_success=false
fi

echo -e "\n${YELLOW}Phase 8: Build Validation${NC}"
echo "----------------------------------------"

if run_command "Build Production" "npm run build"; then
    echo "✅ Production build successful"
    
    # Check build artifacts
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        echo "✅ Build artifacts verified"
    else
        echo -e "${RED}❌ Build artifacts missing${NC}"
        overall_success=false
    fi
else
    overall_success=false
fi

echo -e "\n${YELLOW}======================================"
echo "           CI PIPELINE VALIDATION"
echo "======================================"

if [ "$overall_success" = true ]; then
    echo -e "${GREEN}🎉 ALL CI PIPELINE COMMANDS VALIDATED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}✅ Your CI pipeline is ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push this code to GitHub"
    echo "2. Set up branch protection rules (see docs/CI_SETUP_GUIDE.md)"
    echo "3. Verify GitHub Actions run successfully"
    exit 0
else
    echo -e "${RED}❌ SOME CI PIPELINE COMMANDS FAILED VALIDATION${NC}"
    echo -e "${RED}⚠️  Please fix the failing commands before pushing${NC}"
    echo ""
    echo "Failed commands:"
    echo "- Check the output above for specific failures"
    echo "- Run individual commands to debug issues"
    echo "- Ensure all dependencies are installed"
    exit 1
fi
