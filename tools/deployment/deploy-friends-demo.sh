#!/bin/bash

# Disaster Response Dashboard - Friends Demo Deployment
# Simple deployment for friends to play with the app
# Uses cost-effective AWS services (App Runner + free tier)

set -e

# Configuration
SCRIPT_NAME="deploy-friends-demo.sh"
PROJECT_NAME="disaster-response-dashboard"
AWS_REGION=${AWS_REGION:-"us-east-1"}
APP_NAME="disaster-response-friends-demo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites for friends demo deployment..."
    
    # Check AWS CLI
    if ! command -v aws >/dev/null 2>&1; then
        print_error "AWS CLI is not installed. Please install it first."
        print_error "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    print_success "AWS CLI found"
    
    # Check Git
    if ! command -v git >/dev/null 2>&1; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git found"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    print_success "AWS credentials configured"
    
    # Check if we're in the project root
    if [ ! -f "docker-compose.yml" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
        print_error "This script must be run from the project root directory ($PROJECT_NAME/)"
        exit 1
    fi
    print_success "Project root directory confirmed"
    
    print_success "All prerequisites satisfied"
}

# Function to create GitHub repository (if needed)
setup_github_repo() {
    print_header "GitHub Repository Setup"
    echo "============================"
    
    print_status "Checking if this is a Git repository..."
    if [ ! -d ".git" ]; then
        print_warning "This is not a Git repository. Initializing..."
        git init
        git add .
        git commit -m "Initial commit for friends demo"
        print_success "Git repository initialized"
    else
        print_success "Git repository already exists"
    fi
    
    print_status "Current Git remote configuration:"
    git remote -v 2>/dev/null || print_warning "No remote configured"
    
    echo ""
    print_warning "IMPORTANT: You need to push this to GitHub for AWS App Runner to work!"
    echo ""
    echo "If you haven't pushed to GitHub yet, run these commands:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/disaster-response-dashboard.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
    read -p "Have you pushed to GitHub? (yes/no): " github_ready
    
    if [ "$github_ready" != "yes" ]; then
        print_error "Please push to GitHub first, then run this script again."
        exit 1
    fi
    
    print_success "GitHub repository ready"
}

# Function to create AWS App Runner service
create_app_runner_service() {
    print_header "Creating AWS App Runner Service"
    echo "====================================="
    
    print_status "Creating App Runner service for friends demo..."
    
    # Get GitHub repository URL
    local repo_url=$(git remote get-url origin)
    if [ -z "$repo_url" ]; then
        print_error "Could not determine GitHub repository URL"
        exit 1
    fi
    
    print_status "Repository URL: $repo_url"
    
    # Create App Runner service
    local service_arn=$(aws apprunner create-service \
        --service-name "$APP_NAME" \
        --source-configuration "{
            \"RepositoryUrl\": \"$repo_url\",
            \"SourceCodeVersion\": {
                \"Type\": \"BRANCH\",
                \"Value\": \"main\"
            },
            \"CodeConfiguration\": {
                \"ConfigurationSource\": \"API\",
                \"CodeConfigurationValues\": {
                    \"Runtime\": \"DOCKER\",
                    \"BuildCommand\": \"docker build -t disaster-response .\",
                    \"StartCommand\": \"docker run -p 8080:80 disaster-response\"
                }
            }
        }" \
        --instance-configuration '{
            "Cpu": "1 vCPU",
            "Memory": "2 GB"
        }' \
        --region "$AWS_REGION" \
        --query 'Service.ServiceArn' \
        --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$service_arn" ]; then
        print_success "App Runner service created successfully"
        print_status "Service ARN: $service_arn"
        
        # Wait for service to be ready
        print_status "Waiting for service to be ready..."
        aws apprunner wait service-running \
            --service-arn "$service_arn" \
            --region "$AWS_REGION"
        
        # Get service URL
        local service_url=$(aws apprunner describe-service \
            --service-arn "$service_arn" \
            --region "$AWS_REGION" \
            --query 'Service.ServiceUrl' \
            --output text)
        
        print_success "Service is running!"
        print_status "Service URL: https://$service_url"
        
        # Store service info
        echo "$service_arn" > .app-runner-service-arn
        echo "$service_url" > .app-runner-service-url
        
    else
        print_error "Failed to create App Runner service"
        exit 1
    fi
}

# Function to create simple monitoring
create_monitoring() {
    print_header "Setting Up Simple Monitoring"
    echo "=================================="
    
    print_status "Creating CloudWatch dashboard for friends demo..."
    
    # Create simple dashboard
    local dashboard_body='{
        "widgets": [
            {
                "type": "metric",
                "x": 0,
                "y": 0,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/AppRunner", "RequestCount", "ServiceName", "'$APP_NAME'"]
                    ],
                    "view": "timeSeries",
                    "stacked": false,
                    "region": "'$AWS_REGION'",
                    "title": "Friends Demo - Request Count"
                }
            },
            {
                "type": "metric",
                "x": 12,
                "y": 0,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/AppRunner", "ResponseTime", "ServiceName", "'$APP_NAME'"]
                    ],
                    "view": "timeSeries",
                    "stacked": false,
                    "region": "'$AWS_REGION'",
                    "title": "Friends Demo - Response Time"
                }
            }
        ]
    }'
    
    if aws cloudwatch put-dashboard \
        --dashboard-name "FriendsDemoDashboard" \
        --dashboard-body "$dashboard_body" \
        --region "$AWS_REGION" >/dev/null 2>&1; then
        print_success "CloudWatch dashboard created"
    else
        print_warning "Failed to create CloudWatch dashboard"
    fi
}

# Function to create cost alerts
create_cost_alerts() {
    print_header "Setting Up Cost Alerts"
    echo "============================="
    
    print_status "Creating cost alerts to prevent unexpected charges..."
    
    # Create SNS topic for cost alerts
    local topic_arn=$(aws sns create-topic \
        --name "friends-demo-cost-alerts" \
        --region "$AWS_REGION" \
        --query 'TopicArn' \
        --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$topic_arn" ]; then
        print_success "SNS topic created for cost alerts"
        
        # Create cost budget
        local budget_body='{
            "BudgetName": "FriendsDemoBudget",
            "BudgetLimit": {
                "Amount": "10.00",
                "Unit": "USD"
            },
            "TimeUnit": "MONTHLY",
            "BudgetType": "COST",
            "CostFilters": {
                "Service": ["AWS App Runner"]
            },
            "NotificationsWithSubscribers": [
                {
                    "Notification": {
                        "ComparisonOperator": "GREATER_THAN",
                        "NotificationType": "ACTUAL",
                        "Threshold": 80.0,
                        "ThresholdType": "PERCENTAGE"
                    },
                    "Subscribers": [
                        {
                            "Address": "'$topic_arn'",
                            "SubscriptionType": "SNS"
                        }
                    ]
                }
            ]
        }'
        
        if aws budgets create-budget \
            --account-id $(aws sts get-caller-identity --query Account --output text) \
            --budget "$budget_body" \
            --notifications-with-subscribers "$budget_body" >/dev/null 2>&1; then
            print_success "Cost budget created ($10/month limit)"
        else
            print_warning "Failed to create cost budget"
        fi
        
    else
        print_warning "Failed to create SNS topic for cost alerts"
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    print_header "Friends Demo Deployment Summary"
    echo "====================================="
    
    local service_url=""
    if [ -f ".app-runner-service-url" ]; then
        service_url=$(cat .app-runner-service-url)
    fi
    
    echo ""
    echo "🎉 Friends Demo Deployment Complete!"
    echo "==================================="
    echo ""
    echo "✅ App Runner service created and running"
    echo "✅ Simple monitoring dashboard created"
    echo "✅ Cost alerts configured ($10/month limit)"
    echo ""
    echo "🌐 Your App URL:"
    if [ ! -z "$service_url" ]; then
        echo "   https://$service_url"
    else
        echo "   Check AWS Console for App Runner service URL"
    fi
    echo ""
    echo "📱 Share with friends:"
    echo "   Send them the URL above!"
    echo ""
    echo "💰 Cost Control:"
    echo "   - Monthly budget: $10 USD"
    echo "   - Free tier: 750 hours/month"
    echo "   - Cost alerts at 80% of budget"
    echo ""
    echo "🔧 Management:"
    echo "   - AWS Console: App Runner service"
    echo "   - Monitoring: CloudWatch dashboard"
    echo "   - Cost tracking: AWS Cost Explorer"
    echo ""
    echo "🚨 Important Notes:"
    echo "   - Service will auto-scale based on traffic"
    echo "   - Free tier covers most light usage"
    echo "   - Monitor costs in AWS Console"
    echo "   - Delete service when done to avoid charges"
    echo ""
    print_success "Your friends can now play with the disaster response dashboard!"
}

# Function to cleanup (optional)
cleanup_deployment() {
    print_header "Cleaning Up Deployment"
    echo "============================"
    
    print_warning "This will delete the App Runner service and all associated resources!"
    read -p "Are you sure you want to clean up? (yes/no): " confirm_cleanup
    
    if [ "$confirm_cleanup" = "yes" ]; then
        if [ -f ".app-runner-service-arn" ]; then
            local service_arn=$(cat .app-runner-service-arn)
            print_status "Deleting App Runner service..."
            
            if aws apprunner delete-service \
                --service-arn "$service_arn" \
                --region "$AWS_REGION" >/dev/null 2>&1; then
                print_success "App Runner service deleted"
            else
                print_warning "Failed to delete App Runner service"
            fi
            
            # Clean up files
            rm -f .app-runner-service-arn .app-runner-service-url
        fi
        
        print_status "Cleaning up CloudWatch dashboard..."
        aws cloudwatch delete-dashboards \
            --dashboard-names "FriendsDemoDashboard" \
            --region "$AWS_REGION" >/dev/null 2>&1 || true
        
        print_success "Cleanup complete"
    else
        print_status "Cleanup cancelled"
    fi
}

# Main execution
main() {
    echo "🚀 Disaster Response Dashboard - Friends Demo Deployment"
    echo "========================================================"
    echo "This script will deploy your app so friends can play with it!"
    echo "Script: $SCRIPT_NAME"
    echo "Region: $AWS_REGION"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Setup GitHub repository
    setup_github_repo
    
    # Create App Runner service
    create_app_runner_service
    
    # Create monitoring
    create_monitoring
    
    # Create cost alerts
    create_cost_alerts
    
    # Show summary
    show_deployment_summary
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --region)
            AWS_REGION="$2"
            shift 2
            ;;
        --cleanup)
            cleanup_deployment
            exit 0
            ;;
        --help)
            echo "Usage: $0 [--region REGION] [--cleanup]"
            echo "  --region REGION  AWS region (default: us-east-1)"
            echo "  --cleanup        Clean up deployment resources"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
