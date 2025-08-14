#!/bin/bash

# Video Pipeline Container Runner
# Makes it easy to run pipeline commands inside the Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
CONTAINER_NAME="disaster-response-video-pipeline"
COMPOSE_FILE="docker-compose.yml"

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

# Function to check if container is running
is_container_running() {
    docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Function to check if container exists
container_exists() {
    docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Function to build the container
build_container() {
    print_status "Building video pipeline container..."
    docker-compose -f "$COMPOSE_FILE" build
    print_success "Container built successfully!"
}

# Function to start the container
start_container() {
    if is_container_running; then
        print_warning "Container is already running!"
        return 0
    fi
    
    print_status "Starting video pipeline container..."
    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Container started successfully!"
}

# Function to stop the container
stop_container() {
    if ! is_container_running; then
        print_warning "Container is not running!"
        return 0
    fi
    
    print_status "Stopping video pipeline container..."
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Container stopped successfully!"
}

# Function to run a command in the container
run_command() {
    if ! is_container_running; then
        print_error "Container is not running! Start it first with: $0 start"
        exit 1
    fi
    
    local cmd="$1"
    print_status "Running command in container: $cmd"
    docker exec -it "$CONTAINER_NAME" bash -c "$cmd"
}

# Function to show container status
show_status() {
    print_status "Container status:"
    if is_container_running; then
        print_success "Container is running"
        docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_warning "Container is not running"
        if container_exists; then
            print_status "Container exists but is stopped"
        else
            print_status "Container does not exist"
        fi
    fi
}

# Function to show logs
show_logs() {
    if ! is_container_running; then
        print_error "Container is not running!"
        exit 1
    fi
    
    print_status "Showing container logs:"
    docker logs -f "$CONTAINER_NAME"
}

# Function to enter the container shell
enter_shell() {
    if ! is_container_running; then
        print_error "Container is not running! Start it first with: $0 start"
        exit 1
    fi
    
    print_status "Entering container shell..."
    docker exec -it "$CONTAINER_NAME" bash
}

# Function to show help
show_help() {
    echo "Video Pipeline Container Runner"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build              Build the container"
    echo "  start              Start the container"
    echo "  stop               Stop the container"
    echo "  restart            Restart the container"
    echo "  status             Show container status"
    echo "  logs               Show container logs"
    echo "  shell              Enter container shell"
    echo "  run <command>      Run a command in the container"
    echo "  preflight          Run preflight check"
    echo "  narrate            Generate TTS audio"
    echo "  record             Record screen captures"
    echo "  assemble           Assemble video"
    echo "  final              Create final video"
    echo "  pipeline:full      Run full pipeline"
    echo "  pipeline:local     Run local pipeline"
    echo "  help               Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 start"
    echo "  $0 run 'npm run preflight'"
    echo "  $0 narrate"
    echo "  $0 pipeline:full"
    echo ""
}

# Main script logic
case "${1:-help}" in
    build)
        build_container
        ;;
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        stop_container
        start_container
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    shell)
        enter_shell
        ;;
    run)
        if [ -z "$2" ]; then
            print_error "No command specified!"
            echo "Usage: $0 run <command>"
            exit 1
        fi
        run_command "$2"
        ;;
    preflight)
        run_command "npm run preflight"
        ;;
    narrate)
        run_command "npm run narrate:openai"
        ;;
    record)
        run_command "npm run record"
        ;;
    assemble)
        run_command "npm run assemble"
        ;;
    final)
        run_command "npm run final"
        ;;
    pipeline:full)
        run_command "npm run pipeline:full"
        ;;
    pipeline:local)
        run_command "npm run pipeline:local"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
