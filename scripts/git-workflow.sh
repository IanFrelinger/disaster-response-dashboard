#!/bin/bash

# Git Workflow Script for Disaster Response Dashboard
# This script integrates git push as part of the general development workflow

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

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from the project root."
        exit 1
    fi
}

# Function to check if there are uncommitted changes
check_uncommitted_changes() {
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes. Please commit or stash them first."
        git status --short
        return 1
    fi
    return 0
}

# Function to run tests before pushing
run_tests() {
    print_status "Running tests before push..."
    
    # Run backend tests
    if [ -d "backend" ]; then
        print_status "Running backend tests..."
        cd backend
        if [ -f "requirements.txt" ]; then
            python -m pip install -r requirements.txt -q
        fi
        if [ -f "requirements-test.txt" ]; then
            python -m pip install -r requirements-test.txt -q
        fi
        python -m pytest tests/ -v --tb=short || {
            print_error "Backend tests failed. Please fix them before pushing."
            cd ..
            return 1
        }
        cd ..
        print_success "Backend tests passed"
    fi
    
    # Run frontend tests
    if [ -d "frontend" ]; then
        print_status "Running frontend tests..."
        cd frontend
        if [ -f "package.json" ]; then
            # Install dependencies if needed
            if [ ! -d "node_modules" ]; then
                print_status "Installing frontend dependencies..."
                pnpm install
            fi
            
            # Run type checking
            print_status "Running type checking..."
            pnpm typecheck || {
                print_error "Frontend type checking failed. Please fix them before pushing."
                cd ..
                return 1
            }
            
            # Run linting
            print_status "Running linting..."
            pnpm lint || {
                print_error "Frontend linting failed. Please fix them before pushing."
                cd ..
                return 1
            }
            
            # Run unit tests
            print_status "Running unit tests..."
            pnpm test -- --run --coverage || {
                print_error "Frontend unit tests failed. Please fix them before pushing."
                cd ..
                return 1
            }
        fi
        cd ..
        print_success "Frontend tests passed"
    fi
    
    print_success "All tests passed!"
    return 0
}

# Function to push changes
push_changes() {
    local branch=$(git branch --show-current)
    local remote="origin"
    
    print_status "Pushing changes to $remote/$branch..."
    
    # Check if remote exists
    if ! git remote get-url $remote > /dev/null 2>&1; then
        print_error "Remote '$remote' not found. Please add it first:"
        print_error "git remote add origin <repository-url>"
        return 1
    fi
    
    # Push changes
    git push $remote $branch || {
        print_error "Push failed. Please check your connection and permissions."
        return 1
    }
    
    print_success "Successfully pushed to $remote/$branch"
}

# Function to show help
show_help() {
    echo "Git Workflow Script for Disaster Response Dashboard"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -t, --test-only         Run tests only, don't push"
    echo "  -f, --force             Force push (skip tests)"
    echo "  -m, --message MESSAGE   Commit message for staged changes"
    echo "  -a, --all               Stage all changes before committing"
    echo ""
    echo "Examples:"
    echo "  $0                      # Run tests and push current branch"
    echo "  $0 --test-only          # Run tests only"
    echo "  $0 --force              # Push without running tests"
    echo "  $0 --message 'Fix bug'  # Commit with message and push"
    echo "  $0 --all --message 'Update features'  # Stage all, commit, and push"
}

# Main function
main() {
    local test_only=false
    local force=false
    local commit_message=""
    local stage_all=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -t|--test-only)
                test_only=true
                shift
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -m|--message)
                commit_message="$2"
                shift 2
                ;;
            -a|--all)
                stage_all=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check if we're in a git repository
    check_git_repo
    
    # Stage all changes if requested
    if [ "$stage_all" = true ]; then
        print_status "Staging all changes..."
        git add .
    fi
    
    # Commit changes if message provided
    if [ -n "$commit_message" ]; then
        print_status "Committing changes with message: '$commit_message'"
        git commit -m "$commit_message"
    fi
    
    # Check for uncommitted changes (unless force or test-only)
    if [ "$force" = false ] && [ "$test_only" = false ]; then
        if ! check_uncommitted_changes; then
            print_error "Please commit or stash your changes before pushing."
            exit 1
        fi
    fi
    
    # Run tests unless force mode
    if [ "$force" = false ]; then
        if ! run_tests; then
            print_error "Tests failed. Use --force to skip tests (not recommended)."
            exit 1
        fi
    else
        print_warning "Skipping tests (force mode)"
    fi
    
    # Push changes unless test-only mode
    if [ "$test_only" = false ]; then
        push_changes
    else
        print_success "Tests completed successfully (test-only mode)"
    fi
}

# Run main function with all arguments
main "$@"
