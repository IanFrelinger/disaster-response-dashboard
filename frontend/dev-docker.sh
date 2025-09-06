#!/bin/bash

# Development Docker Script for React App
# This script manages the containerized development environment
# The dev server runs on port 3001 on the host (mapped from container port 3000)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Build the development image
build_image() {
    print_status "Building development Docker image..."
    docker-compose -f docker-compose.dev.yml build
    print_success "Development image built successfully"
}

# Start the development server
start_dev() {
    print_status "Starting development server on port 3001..."
    docker-compose -f docker-compose.dev.yml up
}

# Stop the development server
stop_dev() {
    print_status "Stopping development server..."
    docker-compose -f docker-compose.dev.yml down
    print_success "Development server stopped"
}

# Show logs
show_logs() {
    print_status "Showing development server logs..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# Clean up containers and images
cleanup() {
    print_status "Cleaning up development environment..."
    docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
    print_success "Cleanup completed"
}

# Show status
show_status() {
    print_status "Development environment status:"
    docker-compose -f docker-compose.dev.yml ps
}

# Main script logic
case "${1:-start}" in
    "start")
        check_docker
        build_image
        start_dev
        ;;
    "stop")
        stop_dev
        ;;
    "restart")
        stop_dev
        sleep 2
        start_dev
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "build")
        check_docker
        build_image
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|cleanup|build}"
        echo ""
        echo "Commands:"
        echo "  start    - Build and start the development server"
        echo "  stop     - Stop the development server"
        echo "  restart  - Restart the development server"
        echo "  logs     - Show development server logs"
        echo "  status   - Show development environment status"
        echo "  cleanup  - Clean up containers, images, and volumes"
        echo "  build    - Build the development image only"
        echo ""
        echo "Default action: start"
        echo ""
        echo "Note: The development server runs on port 3001"
        exit 1
        ;;
esac
