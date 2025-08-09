#!/bin/bash

# Disaster Response Dashboard - Mac Setup Script
# This script sets up and starts the disaster response dashboard on macOS
# Usage: ./scripts/setup-mac.sh

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for user input
wait_for_user() {
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read -r
}

# Function to install Homebrew if not present
install_homebrew() {
    if ! command_exists brew; then
        print_step "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for current session
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [[ -f "/usr/local/bin/brew" ]]; then
            eval "$(/usr/local/bin/brew shellenv)"
        fi
        
        print_success "Homebrew installed successfully!"
    else
        print_success "Homebrew is already installed"
    fi
}

# Function to install Docker Desktop
install_docker() {
    if ! command_exists docker; then
        print_step "Installing Docker Desktop..."
        
        if ! command_exists brew; then
            print_error "Homebrew is required to install Docker Desktop"
            exit 1
        fi
        
        # Install Docker Desktop
        brew install --cask docker
        
        print_warning "Docker Desktop has been installed. Please:"
        echo "  1. Open Docker Desktop from Applications"
        echo "  2. Complete the initial setup"
        echo "  3. Ensure Docker is running (you'll see the whale icon in the menu bar)"
        echo "  4. Come back and press Enter to continue"
        
        wait_for_user
        
        # Verify Docker is running
        if ! docker info >/dev/null 2>&1; then
            print_error "Docker is not running. Please start Docker Desktop and try again."
            exit 1
        fi
        
        print_success "Docker Desktop is running!"
    else
        print_success "Docker is already installed"
        
        # Check if Docker is running
        if ! docker info >/dev/null 2>&1; then
            print_warning "Docker is installed but not running. Please start Docker Desktop."
            wait_for_user
            
            if ! docker info >/dev/null 2>&1; then
                print_error "Docker is still not running. Please start Docker Desktop and try again."
                exit 1
            fi
        fi
    fi
}

# Function to check and install Node.js
check_nodejs() {
    if ! command_exists node; then
        print_step "Installing Node.js..."
        brew install node
        
        # Verify installation
        if ! command_exists node; then
            print_error "Failed to install Node.js"
            exit 1
        fi
        
        print_success "Node.js installed successfully!"
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_warning "Node.js version is $NODE_VERSION. Updating to latest version..."
            brew upgrade node
        else
            print_success "Node.js version $(node --version) is compatible"
        fi
    fi
}

# Function to check and install Python
check_python() {
    if ! command_exists python3; then
        print_step "Installing Python..."
        brew install python
        
        # Verify installation
        if ! command_exists python3; then
            print_error "Failed to install Python"
            exit 1
        fi
        
        print_success "Python installed successfully!"
    else
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        print_success "Python version $PYTHON_VERSION is available"
    fi
}

# Function to check ports
check_ports() {
    print_step "Checking if required ports are available..."
    
    local ports=(3000 5001 5002)
    local ports_in_use=()
    
    for port in "${ports[@]}"; do
        if port_in_use $port; then
            ports_in_use+=($port)
        fi
    done
    
    if [ ${#ports_in_use[@]} -gt 0 ]; then
        print_warning "The following ports are already in use:"
        for port in "${ports_in_use[@]}"; do
            echo "  - Port $port"
        done
        echo ""
        echo "This might cause conflicts. You can:"
        echo "  1. Stop the services using these ports"
        echo "  2. Continue anyway (the script will try to stop existing containers)"
        echo ""
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Setup cancelled by user"
            exit 1
        fi
    else
        print_success "All required ports are available"
    fi
}

# Function to stop existing containers
stop_existing_containers() {
    print_step "Stopping any existing containers..."
    
    # Change to the docker-compose directory
    cd "$(dirname "$0")/../config/docker"
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down --remove-orphans >/dev/null 2>&1 || true
        print_success "Existing containers stopped"
    fi
    
    # Return to original directory
    cd - >/dev/null
}

# Function to start the application
start_application() {
    print_step "Starting the Disaster Response Dashboard..."
    
    # Change to the project root
    cd "$(dirname "$0")/.."
    
    # Make sure the start script is executable
    chmod +x scripts/start.sh
    
    # Run the start script
    ./scripts/start.sh
}

# Function to show final instructions
show_final_instructions() {
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
}

# Main execution
main() {
    print_header "Disaster Response Dashboard - Mac Setup"
    echo ""
    print_status "This script will set up and start the Disaster Response Dashboard on your Mac."
    echo ""
    print_status "What this script will do:"
    echo "  1. Check and install prerequisites (Homebrew, Docker, Node.js, Python)"
    echo "  2. Verify Docker is running"
    echo "  3. Check for port conflicts"
    echo "  4. Stop any existing containers"
    echo "  5. Start the application"
    echo ""
    
    # Confirm with user
    read -p "Do you want to continue? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_error "Setup cancelled by user"
        exit 1
    fi
    
    echo ""
    
    # Step 1: Install Homebrew
    print_header "Step 1: Installing Homebrew"
    install_homebrew
    echo ""
    
    # Step 2: Install Docker
    print_header "Step 2: Installing Docker Desktop"
    install_docker
    echo ""
    
    # Step 3: Check Node.js
    print_header "Step 3: Checking Node.js"
    check_nodejs
    echo ""
    
    # Step 4: Check Python
    print_header "Step 4: Checking Python"
    check_python
    echo ""
    
    # Step 5: Check ports
    print_header "Step 5: Checking Port Availability"
    check_ports
    echo ""
    
    # Step 6: Stop existing containers
    print_header "Step 6: Preparing Environment"
    stop_existing_containers
    echo ""
    
    # Step 7: Start application
    print_header "Step 7: Starting Application"
    start_application
    echo ""
    
    # Step 8: Show final instructions
    show_final_instructions
}

# Run main function
main "$@"
