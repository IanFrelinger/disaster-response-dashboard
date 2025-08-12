#!/bin/bash

# Disaster Response Dashboard - Video Production Docker Runner
# Convenient script for managing the video production environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="disaster-response-video"
COMPOSE_FILE="docker-compose.yml"
IMAGE_NAME="disaster-response-video-production"

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${PURPLE}🎬 $1${NC}"
    echo -e "${CYAN}$2${NC}"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

build_image() {
    log_info "Building video production Docker image..."
    
    # Build with development target by default
    local target=${1:-development}
    
    docker build \
        --target $target \
        -t $IMAGE_NAME:$target \
        --build-arg NODE_ENV=development \
        .
    
    log_success "Docker image built successfully!"
}

start_container() {
    log_info "Starting video production environment..."
    
    # Create necessary directories
    mkdir -p output temp assets
    
    # Start the container
    docker-compose up -d
    
    log_success "Video production environment started!"
    log_info "Container name: $CONTAINER_NAME"
    log_info "Access the environment with: docker exec -it $CONTAINER_NAME bash"
}

stop_container() {
    log_info "Stopping video production environment..."
    
    docker-compose down
    
    log_success "Video production environment stopped!"
}

restart_container() {
    log_info "Restarting video production environment..."
    
    stop_container
    start_container
}

run_command() {
    local command=$1
    log_info "Running command in container: $command"
    
    docker exec -it $CONTAINER_NAME $command
}

run_pipeline() {
    log_info "Running complete video production pipeline..."
    
    docker exec -it $CONTAINER_NAME npm run build
    
    log_success "Video production pipeline completed!"
    log_info "Check the output/ directory for generated files."
}

run_tests() {
    log_info "Running video production environment tests..."
    
    docker exec -it $CONTAINER_NAME npm run test
    
    log_success "Tests completed!"
}

show_status() {
    log_header "Video Production Environment Status"
    
    if docker ps | grep -q $CONTAINER_NAME; then
        log_success "Container is running"
        docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        log_warning "Container is not running"
    fi
    
    echo ""
    log_info "Available commands:"
    echo "  build    - Build Docker image"
    echo "  start    - Start container"
    echo "  stop     - Stop container"
    echo "  restart  - Restart container"
    echo "  shell    - Open shell in container"
    echo "  dev      - Run development tools"
    echo "  test     - Run tests"
    echo "  pipeline - Run complete video pipeline"
    echo "  logs     - Show container logs"
    echo "  clean    - Clean up containers and images"
}

show_logs() {
    log_info "Showing container logs..."
    docker-compose logs -f
}

clean_up() {
    log_warning "Cleaning up containers and images..."
    
    # Stop and remove containers
    docker-compose down --rmi all --volumes --remove-orphans
    
    # Remove images
    docker rmi $IMAGE_NAME:development $IMAGE_NAME:production 2>/dev/null || true
    
    log_success "Cleanup completed!"
}

show_help() {
    log_header "Disaster Response Dashboard - Video Production Docker Runner"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     - Build Docker image"
    echo "  start     - Start video production environment"
    echo "  stop      - Stop video production environment"
    echo "  restart   - Restart video production environment"
    echo "  shell     - Open shell in container"
    echo "  dev       - Run development tools"
    echo "  test      - Run environment tests"
    echo "  pipeline  - Run complete video production pipeline"
    echo "  narrate   - Generate voiceover only"
    echo "  assemble  - Create rough cut only"
    echo "  final     - Create final video only"
    echo "  status    - Show environment status"
    echo "  logs      - Show container logs"
    echo "  clean     - Clean up containers and images"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 start"
    echo "  $0 shell"
    echo "  $0 pipeline"
    echo ""
}

# Main script logic
main() {
    check_docker
    check_docker_compose
    
    case "${1:-help}" in
        build)
            build_image ${2:-development}
            ;;
        start)
            start_container
            ;;
        stop)
            stop_container
            ;;
        restart)
            restart_container
            ;;
        shell)
            run_command "bash"
            ;;
        dev)
            run_command "npm run dev"
            ;;
        test)
            run_tests
            ;;
        pipeline)
            run_pipeline
            ;;
        narrate)
            run_command "npm run narrate"
            ;;
        assemble)
            run_command "npm run assemble"
            ;;
        final)
            run_command "npm run final"
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        clean)
            clean_up
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
