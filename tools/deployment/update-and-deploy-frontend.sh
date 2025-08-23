#!/usr/bin/env bash
set -Eeuo pipefail

# =============================================
# One-Shot: Update & Deploy Frontend
# =============================================
# What it does:
# 1. Pull latest changes from git
# 2. Update Mapbox token in .env.production
# 3. Deploy frontend to S3 + CloudFront
#
# Usage: ./tools/deployment/update-and-deploy-frontend.sh
# =============================================

echo "🚀 Disaster Response Frontend - Update & Deploy"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "tools/deployment" ]; then
    print_error "Please run this script from the repository root directory"
    exit 1
fi

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed or not in PATH"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Run 'aws configure' first"
    exit 1
fi

print_status "Checking current git status..."
CURRENT_BRANCH=$(git branch --show-current)
print_success "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes:"
    git status --short
    echo
    read -p "Do you want to stash these changes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stashing uncommitted changes..."
        git stash push -m "Auto-stash before frontend deployment"
        print_success "Changes stashed"
    else
        print_error "Please commit or stash your changes before deploying"
        exit 1
    fi
fi

# Pull latest changes
print_status "Pulling latest changes from origin/$CURRENT_BRANCH..."
if git pull origin "$CURRENT_BRANCH"; then
    print_success "Git pull successful"
else
    print_error "Git pull failed"
    exit 1
fi

# Check if .env.production exists and has Mapbox token
print_status "Checking Mapbox token configuration..."
if [ ! -f "frontend/.env.production" ]; then
    print_warning "frontend/.env.production not found. Creating with placeholder..."
    cat > frontend/.env.production << EOF
VITE_API_URL=http://18.220.78.249:8000
VITE_WEBSOCKET_URL=http://18.220.78.249:8000
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
EOF
    print_warning "Please update VITE_MAPBOX_TOKEN in frontend/.env.production with your real token"
    print_warning "Then run this script again"
    exit 1
fi

# Check if Mapbox token is still placeholder
if grep -q "pk.your_mapbox_token_here" frontend/.env.production; then
    print_warning "Mapbox token is still a placeholder in frontend/.env.production"
    print_warning "Please update it with your real token and run this script again"
    exit 1
fi

print_success "Mapbox token configured"

# Check if deploy script exists
if [ ! -f "tools/deployment/deploy-frontend-s3-cloudfront.sh" ]; then
    print_error "Deployment script not found: tools/deployment/deploy-frontend-s3-cloudfront.sh"
    exit 1
fi

# Make sure deploy script is executable
chmod +x tools/deployment/deploy-frontend-s3-cloudfront.sh

print_success "All checks passed! Starting frontend deployment..."
echo

# Run the deployment script
print_status "🚀 Deploying frontend to S3 + CloudFront..."
if ./tools/deployment/deploy-frontend-s3-cloudfront.sh; then
    echo
    print_success "🎉 Frontend deployment completed successfully!"
    print_success "Your Disaster Response Dashboard is now live on AWS!"
    
    # Get the CloudFront URL from the deployment output
    echo
    print_status "📋 Next steps:"
    echo "1. Test your deployed frontend"
    echo "2. Update backend CORS if needed"
    echo "3. Consider setting up a custom domain"
    
else
    print_error "Frontend deployment failed"
    exit 1
fi

# Restore stashed changes if any
if git stash list | grep -q "Auto-stash before frontend deployment"; then
    echo
    read -p "Do you want to restore your stashed changes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restoring stashed changes..."
        git stash pop
        print_success "Changes restored"
    else
        print_warning "Stashed changes remain available. Use 'git stash list' to see them"
    fi
fi

echo
print_success "🎯 Update & Deploy complete!"
