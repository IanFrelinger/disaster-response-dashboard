#!/bin/bash

# Demo script for Mac setup
# This script shows what the setup process would look like without actually running it

set -e

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
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_step() {
    echo -e "${CYAN}➤${NC} $1"
}

# Function to simulate a delay
simulate_delay() {
    local seconds=$1
    for ((i=1; i<=seconds; i++)); do
        echo -n "."
        sleep 0.5
    done
    echo ""
}

# Demo the setup process
demo_setup() {
    print_header "Disaster Response Dashboard - Mac Setup Demo"
    echo ""
    print_status "This is a demo of what the setup process would look like."
    print_status "The actual setup script will perform these steps automatically."
    echo ""
    
    # Step 1: Install Homebrew
    print_header "Step 1: Installing Homebrew"
    print_step "Checking if Homebrew is installed..."
    simulate_delay 2
    print_success "Homebrew is already installed"
    echo ""
    
    # Step 2: Install Docker
    print_header "Step 2: Installing Docker Desktop"
    print_step "Checking if Docker is installed..."
    simulate_delay 2
    print_success "Docker is already installed"
    print_step "Checking if Docker is running..."
    simulate_delay 1
    print_success "Docker Desktop is running!"
    echo ""
    
    # Step 3: Check Node.js
    print_header "Step 3: Checking Node.js"
    print_step "Checking Node.js version..."
    simulate_delay 1
    print_success "Node.js version v18.17.0 is compatible"
    echo ""
    
    # Step 4: Check Python
    print_header "Step 4: Checking Python"
    print_step "Checking Python version..."
    simulate_delay 1
    print_success "Python version 3.11.5 is available"
    echo ""
    
    # Step 5: Check ports
    print_header "Step 5: Checking Port Availability"
    print_step "Checking if required ports are available..."
    simulate_delay 2
    print_success "All required ports are available"
    echo ""
    
    # Step 6: Stop existing containers
    print_header "Step 6: Preparing Environment"
    print_step "Stopping any existing containers..."
    simulate_delay 2
    print_success "Existing containers stopped"
    echo ""
    
    # Step 7: Start application
    print_header "Step 7: Starting Application"
    print_step "Building Docker images..."
    simulate_delay 3
    print_success "Images built successfully"
    print_step "Starting services..."
    simulate_delay 2
    print_success "Services started successfully"
    print_step "Waiting for services to be healthy..."
    simulate_delay 4
    print_success "Backend is healthy!"
    simulate_delay 2
    print_success "Frontend is healthy!"
    echo ""
    
    # Final instructions
    print_header "🎉 Setup Complete!"
    echo ""
    print_success "Your Disaster Response Dashboard is now running!"
    echo ""
    echo "📱 Access your application:"
    echo "  • Frontend (Public View): http://localhost:3000"
    echo "  • Backend API: http://localhost:5001"
    echo "  • Health Check: http://localhost:5001/api/health"
    echo ""
    echo "📋 Useful Commands:"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • Restart services: docker-compose restart"
    echo "  • View service status: docker-compose ps"
    echo ""
    echo "🔧 Development Commands:"
    echo "  • Run tests: ./scripts/test.sh"
    echo "  • Quick tests: ./scripts/test.sh --quick"
    echo "  • Stop everything: ./scripts/stop.sh"
    echo ""
    echo "📚 Documentation:"
    echo "  • Quick Start: docs/QUICK_START_GUIDE.md"
    echo "  • Local Testing: docs/LOCAL_TESTING_README.md"
    echo "  • Configuration: docs/CONFIGURATION_GUIDE.md"
    echo ""
    print_success "Happy coding! 🚀"
    echo ""
    print_warning "This was a demo. To actually run the setup:"
    echo "  ./scripts/setup-mac.sh"
}

# Show usage information
show_usage() {
    echo "Usage: $0 [demo|help]"
    echo ""
    echo "Commands:"
    echo "  demo    - Show a demo of the setup process (default)"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0        # Run the demo"
    echo "  $0 demo   # Run the demo"
    echo "  $0 help   # Show help"
    echo ""
    echo "To run the actual setup:"
    echo "  ./scripts/setup-mac.sh"
}

# Main execution
main() {
    case "${1:-demo}" in
        "demo")
            demo_setup
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
