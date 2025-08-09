#!/bin/bash

# Test script for Mac setup
# This script validates that the setup-mac.sh script is properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Test 1: Check if setup script exists
test_script_exists() {
    print_status "Testing: Setup script exists"
    
    if [ -f "scripts/setup-mac.sh" ]; then
        print_success "Setup script found"
    else
        print_error "Setup script not found at scripts/setup-mac.sh"
        exit 1
    fi
}

# Test 2: Check if setup script is executable
test_script_executable() {
    print_status "Testing: Setup script is executable"
    
    if [ -x "scripts/setup-mac.sh" ]; then
        print_success "Setup script is executable"
    else
        print_error "Setup script is not executable"
        print_status "Making script executable..."
        chmod +x scripts/setup-mac.sh
        print_success "Made script executable"
    fi
}

# Test 3: Check script syntax
test_script_syntax() {
    print_status "Testing: Setup script syntax"
    
    if bash -n scripts/setup-mac.sh; then
        print_success "Setup script syntax is valid"
    else
        print_error "Setup script has syntax errors"
        exit 1
    fi
}

# Test 4: Check if required files exist
test_required_files() {
    print_status "Testing: Required files exist"
    
    local required_files=(
        "config/docker/docker-compose.yml"
        "scripts/start.sh"
        "backend/Dockerfile"
        "frontend/Dockerfile"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_success "All required files exist"
    else
        print_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
}

# Test 5: Check if script has proper shebang
test_shebang() {
    print_status "Testing: Setup script has proper shebang"
    
    local first_line=$(head -n 1 scripts/setup-mac.sh)
    if [[ "$first_line" == "#!/bin/bash" ]]; then
        print_success "Setup script has proper shebang"
    else
        print_error "Setup script missing proper shebang"
        exit 1
    fi
}

# Test 6: Check if script has proper error handling
test_error_handling() {
    print_status "Testing: Setup script has error handling"
    
    if grep -q "set -e" scripts/setup-mac.sh; then
        print_success "Setup script has error handling (set -e)"
    else
        print_warning "Setup script missing 'set -e' for error handling"
    fi
}

# Test 7: Check if script has colored output
test_colored_output() {
    print_status "Testing: Setup script has colored output"
    
    if grep -q "\\033" scripts/setup-mac.sh; then
        print_success "Setup script has colored output functions"
    else
        print_warning "Setup script missing colored output functions"
    fi
}

# Test 8: Check if script has help/usage information
test_help_info() {
    print_status "Testing: Setup script has usage information"
    
    if grep -q "Usage:" scripts/setup-mac.sh; then
        print_success "Setup script has usage information"
    else
        print_warning "Setup script missing usage information"
    fi
}

# Main test execution
main() {
    print_header "Testing Mac Setup Script"
    echo ""
    
    test_script_exists
    test_script_executable
    test_script_syntax
    test_required_files
    test_shebang
    test_error_handling
    test_colored_output
    test_help_info
    
    echo ""
    print_header "Test Results"
    print_success "All tests passed! The setup script is ready to use."
    echo ""
    print_status "To run the setup script:"
    echo "  ./scripts/setup-mac.sh"
    echo ""
    print_status "For more information, see:"
    echo "  docs/MAC_SETUP_GUIDE.md"
}

# Run main function
main "$@"
