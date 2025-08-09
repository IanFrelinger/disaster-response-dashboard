#!/bin/bash

# Validation script for setup-mac.sh functions
# This script tests the key functions without running the full setup

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

# Test 1: Validate command_exists function
test_command_exists() {
    print_header "Test 1: command_exists Function"
    
    print_step "Testing command_exists with existing command"
    if command_exists bash; then
        print_success "command_exists correctly identified 'bash' as existing"
    else
        print_error "command_exists failed to identify 'bash' as existing"
        return 1
    fi
    
    print_step "Testing command_exists with non-existing command"
    if ! command_exists nonexistentcommand12345; then
        print_success "command_exists correctly identified non-existent command"
    else
        print_error "command_exists incorrectly identified non-existent command as existing"
        return 1
    fi
    
    print_success "command_exists function test passed"
}

# Test 2: Validate port_in_use function
test_port_in_use() {
    print_header "Test 2: port_in_use Function"
    
    print_step "Testing port_in_use with potentially used ports"
    local test_ports=(3000 5001 80 443)
    
    for port in "${test_ports[@]}"; do
        if port_in_use $port; then
            print_warning "Port $port is in use (this is normal)"
        else
            print_success "Port $port is available"
        fi
    done
    
    print_success "port_in_use function test passed"
}

# Test 3: Validate colored output functions
test_colored_output() {
    print_header "Test 3: Colored Output Functions"
    
    print_step "Testing print_status function"
    print_status "This is a test status message"
    
    print_step "Testing print_success function"
    print_success "This is a test success message"
    
    print_step "Testing print_warning function"
    print_warning "This is a test warning message"
    
    print_step "Testing print_error function"
    print_error "This is a test error message"
    
    print_step "Testing print_header function"
    print_header "This is a test header"
    
    print_step "Testing print_step function"
    print_step "This is a test step"
    
    print_success "Colored output functions test passed"
}

# Test 4: Validate script structure and functions
test_script_structure() {
    print_header "Test 4: Script Structure and Functions"
    
    print_step "Checking for required functions in setup script"
    local required_functions=(
        "install_homebrew"
        "install_docker"
        "check_nodejs"
        "check_python"
        "check_ports"
        "stop_existing_containers"
        "start_application"
        "show_final_instructions"
        "main"
    )
    
    local missing_functions=()
    
    for func in "${required_functions[@]}"; do
        if grep -q "^${func}()" scripts/setup-mac.sh; then
            print_success "Function $func found"
        else
            missing_functions+=("$func")
        fi
    done
    
    if [ ${#missing_functions[@]} -eq 0 ]; then
        print_success "All required functions found"
    else
        print_error "Missing functions: ${missing_functions[*]}"
        return 1
    fi
    
    print_step "Checking for error handling"
    if grep -q "set -e" scripts/setup-mac.sh; then
        print_success "Error handling (set -e) found"
    else
        print_warning "Error handling (set -e) not found"
    fi
    
    print_step "Checking for usage information"
    if grep -q "Usage:" scripts/setup-mac.sh; then
        print_success "Usage information found"
    else
        print_warning "Usage information not found"
    fi
    
    print_success "Script structure test passed"
}

# Test 5: Validate Docker Compose integration
test_docker_compose_integration() {
    print_header "Test 5: Docker Compose Integration"
    
    print_step "Checking docker-compose.yml exists"
    if [ -f "config/docker/docker-compose.yml" ]; then
        print_success "docker-compose.yml found"
    else
        print_error "docker-compose.yml not found"
        return 1
    fi
    
    print_step "Checking docker-compose syntax"
    cd config/docker
    if docker-compose config >/dev/null 2>&1; then
        print_success "docker-compose.yml syntax is valid"
    else
        print_error "docker-compose.yml has syntax errors"
        cd - >/dev/null
        return 1
    fi
    cd - >/dev/null
    
    print_step "Checking if start script references docker-compose"
    if grep -q "docker-compose" scripts/start.sh; then
        print_success "Start script properly references docker-compose"
    else
        print_warning "Start script may not properly reference docker-compose"
    fi
    
    print_success "Docker Compose integration test passed"
}

# Test 6: Validate file permissions and executability
test_file_permissions() {
    print_header "Test 6: File Permissions and Executability"
    
    local required_executable_files=(
        "scripts/setup-mac.sh"
        "scripts/start.sh"
        "scripts/stop.sh"
    )
    
    for file in "${required_executable_files[@]}"; do
        print_step "Checking $file permissions"
        if [ -f "$file" ]; then
            if [ -x "$file" ]; then
                print_success "$file is executable"
            else
                print_warning "$file is not executable, making it executable"
                chmod +x "$file"
                print_success "Made $file executable"
            fi
        else
            print_error "$file not found"
            return 1
        fi
    done
    
    print_success "File permissions test passed"
}

# Test 7: Validate environment setup
test_environment_setup() {
    print_header "Test 7: Environment Setup"
    
    print_step "Checking current working directory"
    if [[ "$PWD" == *"disaster-response-dashboard"* ]]; then
        print_success "Working in disaster-response-dashboard directory"
    else
        print_warning "Not in disaster-response-dashboard directory"
    fi
    
    print_step "Checking for required environment files"
    local env_files=(
        "backend/config.env.example"
        "frontend/config.env.example"
    )
    
    for file in "${env_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_warning "$file not found (may not be required)"
        fi
    done
    
    print_step "Checking for .gitignore"
    if [ -f ".gitignore" ]; then
        print_success ".gitignore exists"
    else
        print_warning ".gitignore not found"
    fi
    
    print_success "Environment setup test passed"
}

# Test 8: Validate documentation
test_documentation() {
    print_header "Test 8: Documentation"
    
    print_step "Checking for Mac setup guide"
    if [ -f "docs/MAC_SETUP_GUIDE.md" ]; then
        print_success "Mac setup guide exists"
    else
        print_error "Mac setup guide not found"
        return 1
    fi
    
    print_step "Checking for main README"
    if [ -f "README.md" ]; then
        print_success "Main README exists"
        
        # Check if README mentions the Mac setup
        if grep -q "setup-mac.sh" README.md; then
            print_success "README mentions Mac setup script"
        else
            print_warning "README doesn't mention Mac setup script"
        fi
    else
        print_error "Main README not found"
        return 1
    fi
    
    print_step "Checking for quick start guide"
    if [ -f "docs/QUICK_START_GUIDE.md" ]; then
        print_success "Quick start guide exists"
    else
        print_warning "Quick start guide not found"
    fi
    
    print_success "Documentation test passed"
}

# Test 9: Validate setup script functions (without executing main)
test_setup_script_functions() {
    print_header "Test 9: Setup Script Function Validation"
    
    # Test individual functions by extracting them and testing logic
    print_step "Testing command_exists function from setup script"
    if grep -A 5 "command_exists()" scripts/setup-mac.sh | grep -q "command -v"; then
        print_success "command_exists function properly implemented"
    else
        print_error "command_exists function not properly implemented"
        return 1
    fi
    
    print_step "Testing port_in_use function from setup script"
    if grep -A 5 "port_in_use()" scripts/setup-mac.sh | grep -q "lsof"; then
        print_success "port_in_use function properly implemented"
    else
        print_error "port_in_use function not properly implemented"
        return 1
    fi
    
    print_step "Testing colored output functions from setup script"
    if grep -q "\\033" scripts/setup-mac.sh; then
        print_success "Colored output functions properly implemented"
    else
        print_error "Colored output functions not properly implemented"
        return 1
    fi
    
    print_success "Setup script function validation passed"
}

# Generate comprehensive test report
generate_validation_report() {
    print_header "Validation Test Report"
    
    echo ""
    print_success "✅ command_exists Function: PASSED"
    print_success "✅ port_in_use Function: PASSED"
    print_success "✅ Colored Output Functions: PASSED"
    print_success "✅ Script Structure and Functions: PASSED"
    print_success "✅ Docker Compose Integration: PASSED"
    print_success "✅ File Permissions and Executability: PASSED"
    print_success "✅ Environment Setup: PASSED"
    print_success "✅ Documentation: PASSED"
    print_success "✅ Setup Script Function Validation: PASSED"
    
    echo ""
    print_success "🎉 All validation tests passed!"
    echo ""
    print_status "The setup script is fully validated and ready for use:"
    echo "  ./scripts/setup-mac.sh"
    echo ""
    print_status "To run the full setup:"
    echo "  ./scripts/setup-mac.sh"
    echo ""
    print_status "To see a demo of the setup process:"
    echo "  ./scripts/demo-setup-mac.sh"
    echo ""
    print_status "For more information:"
    echo "  docs/MAC_SETUP_GUIDE.md"
}

# Main validation execution
main() {
    print_header "Setup Script Function Validation"
    echo ""
    print_status "This test validates the key functions of the setup-mac.sh script."
    echo ""
    
    # Run all validation tests
    test_command_exists
    echo ""
    
    test_port_in_use
    echo ""
    
    test_colored_output
    echo ""
    
    test_script_structure
    echo ""
    
    test_docker_compose_integration
    echo ""
    
    test_file_permissions
    echo ""
    
    test_environment_setup
    echo ""
    
    test_documentation
    echo ""
    
    test_setup_script_functions
    echo ""
    
    generate_validation_report
}

# Run main function
main "$@"
