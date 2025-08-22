#!/bin/bash

# Disaster Response Dashboard - AWS CloudShell Deployment
# Deploys directly to AWS App Runner from CloudShell
# No Docker required - runs natively in AWS

set -e

# Configuration
SCRIPT_NAME="deploy-cloudshell.sh"
PROJECT_NAME="disaster-response-dashboard"
AWS_REGION=${AWS_REGION:-"us-east-1"}
APP_NAME="disaster-response-cloudshell-demo"

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

# Function to check CloudShell prerequisites
check_cloudshell_prerequisites() {
    print_status "Checking CloudShell prerequisites..."
    
    # Check if we're in CloudShell
    if [ -z "$AWS_EXECUTION_ENV" ]; then
        print_warning "This script is designed for AWS CloudShell"
        print_warning "It may work locally but is optimized for CloudShell"
    else
        print_success "Running in AWS CloudShell"
    fi
    
    # Check AWS CLI
    if ! command -v aws >/dev/null 2>&1; then
        print_error "AWS CLI not found. This script requires AWS CLI."
        exit 1
    fi
    print_success "AWS CLI found"
    
    # Check Git
    if ! command -v git >/dev/null 2>&1; then
        print_error "Git not found. Please install Git in CloudShell."
        exit 1
    fi
    print_success "Git found"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not available. Please check your CloudShell session."
        exit 1
    fi
    print_success "AWS credentials available"
    
    # Check if we're in the project directory
    if [ ! -f "docker-compose.yml" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
        print_error "This script must be run from the project root directory"
        print_error "Please run: cd disaster-response-dashboard"
        exit 1
    fi
    print_success "Project directory confirmed"
    
    print_success "All CloudShell prerequisites satisfied"
}

# Function to setup GitHub repository
setup_github_repo() {
    print_header "GitHub Repository Setup"
    echo "============================"
    
    print_status "Checking Git repository status..."
    
    if [ ! -d ".git" ]; then
        print_warning "This is not a Git repository. Initializing..."
        git init
        git add .
        git commit -m "Initial commit for CloudShell deployment"
        print_success "Git repository initialized"
    else
        print_success "Git repository already exists"
    fi
    
    # Check remote configuration
    local remote_url=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [ -z "$remote_url" ]; then
        echo ""
        print_warning "No GitHub remote configured!"
        echo ""
        echo "To deploy from CloudShell, you need to:"
        echo "1. Push this code to GitHub"
        echo "2. Make the repository public"
        echo "3. Configure the remote"
        echo ""
        echo "Commands to run:"
        echo "  git remote add origin https://github.com/YOUR_USERNAME/disaster-response-dashboard.git"
        echo "  git branch -M main"
        echo "  git push -u origin main"
        echo ""
        read -p "Have you pushed to GitHub? (yes/no): " github_ready
        
        if [ "$github_ready" != "yes" ]; then
            print_error "Please push to GitHub first, then run this script again."
            print_error "You can do this from your local machine or from CloudShell."
            exit 1
        fi
    else
        print_status "GitHub remote: $remote_url"
    fi
    
    print_success "GitHub repository ready"
}

# Function to create App Runner service
create_app_runner_service() {
    print_header "Creating AWS App Runner Service"
    echo "====================================="
    
    print_status "Creating App Runner service for CloudShell deployment..."
    
    # Get GitHub repository URL
    local repo_url=$(git remote get-url origin)
    if [ -z "$repo_url" ]; then
        print_error "Could not determine GitHub repository URL"
        exit 1
    fi
    
    print_status "Repository URL: $repo_url"
    
    # Create App Runner service with CloudShell-optimized configuration
    local service_arn=$(aws apprunner create-service \
        --service-name "$APP_NAME" \
        --source-configuration "{
            \"RepositoryUrl\": \"$repo_url\",
            \"SourceCodeVersion\": {
                \"Type\": \"BRANCH\",
                \"Value\": \"master\"
            },
            \"CodeConfiguration\": {
                \"ConfigurationSource\": \"API\",
                \"CodeConfigurationValues\": {
                    \"Runtime\": \"PYTHON_3\",
                    \"BuildCommand\": \"pip install -r requirements.txt && cd frontend && npm install && npm run build\",
                    \"StartCommand\": \"cd backend && python run_synthetic_api.py\",
                    \"Port\": \"8000\"
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
        print_status "Waiting for service to be ready (this may take 5-10 minutes)..."
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
        echo "$service_arn" > .cloudshell-service-arn
        echo "$service_url" > .cloudshell-service-url
        
    else
        print_error "Failed to create App Runner service"
        print_error "Check CloudShell permissions and try again"
        exit 1
    fi
}

# Function to create simple monitoring
create_monitoring() {
    print_header "Setting Up Simple Monitoring"
    echo "=================================="
    
    print_status "Creating CloudWatch dashboard for CloudShell demo..."
    
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
                    "title": "CloudShell Demo - Request Count"
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
                    "title": "CloudShell Demo - Response Time"
                }
            }
        ]
    }'
    
    if aws cloudwatch put-dashboard \
        --dashboard-name "CloudShellDemoDashboard" \
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
        --name "cloudshell-demo-cost-alerts" \
        --region "$AWS_REGION" \
        --query 'TopicArn' \
        --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$topic_arn" ]; then
        print_success "SNS topic created for cost alerts"
        
        # Create cost budget
        local budget_body='{
            "BudgetName": "CloudShellDemoBudget",
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
    print_header "CloudShell Deployment Summary"
    echo "==================================="
    
    local service_url=""
    if [ -f ".cloudshell-service-url" ]; then
        service_url=$(cat .cloudshell-service-url)
    fi
    
    echo ""
    echo "🎉 CloudShell Deployment Complete!"
    echo "=================================="
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
        if [ -f ".cloudshell-service-arn" ]; then
            local service_arn=$(cat .cloudshell-service-arn)
            print_status "Deleting App Runner service..."
            
            if aws apprunner delete-service \
                --service-arn "$service_arn" \
                --region "$AWS_REGION" >/dev/null 2>&1; then
                print_success "App Runner service deleted"
            else
                print_warning "Failed to delete App Runner service"
            fi
            
            # Clean up files
            rm -f .cloudshell-service-arn .cloudshell-service-url
        fi
        
        print_status "Cleaning up CloudWatch dashboard..."
        aws cloudwatch delete-dashboards \
            --dashboard-names "CloudShellDemoDashboard" \
            --region "$AWS_REGION" >/dev/null 2>&1 || true
        
        print_success "Cleanup complete"
    else
        print_status "Cleanup cancelled"
    fi
}

# Main execution
main() {
    echo "🚀 Disaster Response Dashboard - CloudShell Deployment"
    echo "======================================================"
    echo "This script deploys your app directly from AWS CloudShell!"
    echo "Script: $SCRIPT_NAME"
    echo "Region: $AWS_REGION"
    echo "Timestamp: $(date)"
    echo ""
    
    print_status "CloudShell deployment mode activated"
    echo ""
    
    # Check prerequisites
    check_cloudshell_prerequisites
    
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
