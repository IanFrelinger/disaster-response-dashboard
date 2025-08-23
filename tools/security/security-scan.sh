#!/bin/bash

# Disaster Response Dashboard - Security Scanner
# Scans for vulnerabilities in dependencies and code

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🔍 $1${NC}"
    echo "=================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header "Security Scanner for Disaster Response Dashboard"
echo "Timestamp: $(date)"
echo ""

# Check if required tools are installed
check_dependencies() {
    print_header "1. Checking Security Tools"
    
    # Check for safety (Python security scanner)
    if command -v safety &> /dev/null; then
        print_success "Safety (Python security scanner) is installed"
    else
        print_warning "Safety not installed. Install with: pip install safety"
    fi
    
    # Check for bandit (Python security linter)
    if command -v bandit &> /dev/null; then
        print_success "Bandit (Python security linter) is installed"
    else
        print_warning "Bandit not installed. Install with: pip install bandit"
    fi
    
    # Check for npm audit
    if command -v npm &> /dev/null; then
        print_success "npm is available for frontend security scanning"
    else
        print_warning "npm not found - skipping frontend security scan"
    fi
    
    # Check for git-secrets
    if command -v git-secrets &> /dev/null; then
        print_success "git-secrets is installed"
    else
        print_warning "git-secrets not installed. Install with: brew install git-secrets"
    fi
}

# Scan Python dependencies for vulnerabilities
scan_python_dependencies() {
    print_header "2. Scanning Python Dependencies"
    
    if command -v safety &> /dev/null; then
        echo "Running safety check on Python dependencies..."
        if safety check --json > security-scan-python.json 2>/dev/null; then
            print_success "Python dependency scan completed"
            echo "Results saved to: security-scan-python.json"
        else
            print_warning "Safety check found vulnerabilities - review security-scan-python.json"
        fi
    else
        print_warning "Skipping Python dependency scan - safety not installed"
    fi
}

# Scan Python code for security issues
scan_python_code() {
    print_header "3. Scanning Python Code"
    
    if command -v bandit &> /dev/null; then
        echo "Running bandit security scan on Python code..."
        if bandit -r backend/ -f json -o security-scan-bandit.json >/dev/null 2>&1; then
            print_success "Python code security scan completed"
            echo "Results saved to: security-scan-bandit.json"
        else
            print_warning "Bandit found security issues - review security-scan-bandit.json"
        fi
    else
        print_warning "Skipping Python code scan - bandit not installed"
    fi
}

# Scan frontend dependencies for vulnerabilities
scan_frontend_dependencies() {
    print_header "4. Scanning Frontend Dependencies"
    
    if command -v npm &> /dev/null && [ -f "frontend/package.json" ]; then
        echo "Running npm audit on frontend dependencies..."
        cd frontend
        if npm audit --audit-level=moderate --json > ../security-scan-npm.json 2>/dev/null; then
            print_success "Frontend dependency scan completed"
            echo "Results saved to: security-scan-npm.json"
        else
            print_warning "npm audit found vulnerabilities - review security-scan-npm.json"
        fi
        cd ..
    else
        print_warning "Skipping frontend dependency scan - npm not available or no package.json"
    fi
}

# Check for secrets in git history
scan_git_secrets() {
    print_header "5. Scanning Git History for Secrets"
    
    if command -v git-secrets &> /dev/null; then
        echo "Running git-secrets scan..."
        if git-secrets --scan-history > security-scan-git.json 2>/dev/null; then
            print_success "Git secrets scan completed"
            echo "Results saved to: security-scan-git.json"
        else
            print_warning "git-secrets found potential secrets - review security-scan-git.json"
        fi
    else
        print_warning "Skipping git secrets scan - git-secrets not installed"
    fi
}

# Check for exposed secrets in current code
scan_current_secrets() {
    print_header "6. Scanning Current Code for Secrets"
    
    echo "Checking for potential secrets in current codebase..."
    
    # Check for hardcoded API keys, passwords, etc.
    SECRETS_FOUND=0
    
    # Check for common secret patterns
    if git grep -i "password.*=.*['\"][^'\"]*['\"]" -- "*.py" "*.js" "*.ts" "*.tsx" >/dev/null 2>&1; then
        print_warning "Found potential hardcoded passwords"
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
    fi
    
    if git grep -i "api_key.*=.*['\"][^'\"]*['\"]" -- "*.py" "*.js" "*.ts" "*.tsx" >/dev/null 2>&1; then
        print_warning "Found potential hardcoded API keys"
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
    fi
    
    if git grep -i "secret.*=.*['\"][^'\"]*['\"]" -- "*.py" "*.js" "*.ts" "*.tsx" >/dev/null 2>&1; then
        print_warning "Found potential hardcoded secrets"
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
    fi
    
    if [ $SECRETS_FOUND -eq 0 ]; then
        print_success "No obvious hardcoded secrets found"
    fi
}

# Check security headers
check_security_headers() {
    print_header "7. Checking Security Headers"
    
    # Check if security headers module exists
    if [ -f "backend/security_headers.py" ]; then
        print_success "Security headers module found"
    else
        print_warning "Security headers module not found"
    fi
    
    # Check if input validation module exists
    if [ -f "backend/input_validation.py" ]; then
        print_success "Input validation module found"
    else
        print_warning "Input validation module not found"
    fi
    
    # Check if rate limiting module exists
    if [ -f "backend/rate_limiting.py" ]; then
        print_success "Rate limiting module found"
    else
        print_warning "Rate limiting module not found"
    fi
}

# Check environment configuration
check_environment_config() {
    print_header "8. Checking Environment Configuration"
    
    # Check if .env is ignored
    if git check-ignore backend/.env > /dev/null 2>&1; then
        print_success ".env file is properly ignored by git"
    else
        print_error ".env file is NOT ignored by git"
    fi
    
    # Check if .env.production is ignored
    if git check-ignore backend/.env.production > /dev/null 2>&1; then
        print_success ".env.production file is properly ignored by git"
    else
        print_warning ".env.production file is NOT ignored by git"
    fi
    
    # Check for weak secret keys
    if [ -f "backend/.env" ]; then
        SECRET_KEY=$(grep "SECRET_KEY=" backend/.env | cut -d'=' -f2)
        if [[ "$SECRET_KEY" == *"dev-secret-key"* ]] || [[ "$SECRET_KEY" == *"change-in-production"* ]]; then
            print_error "Weak secret key detected - update SECRET_KEY in .env"
        else
            print_success "Secret key appears to be secure"
        fi
    fi
}

# Generate security report
generate_report() {
    print_header "9. Generating Security Report"
    
    REPORT_FILE="security-scan-report.md"
    
    cat > "$REPORT_FILE" << EOF
# Security Scan Report - Disaster Response Dashboard

**Scan Date:** $(date)
**Scanner Version:** 1.0

## Summary

This report contains the results of automated security scanning for the Disaster Response Dashboard application.

## Scan Results

### 1. Python Dependencies
- **Status:** $(if [ -f "security-scan-python.json" ]; then echo "Scanned"; else echo "Not scanned"; fi)
- **File:** security-scan-python.json

### 2. Python Code Security
- **Status:** $(if [ -f "security-scan-bandit.json" ]; then echo "Scanned"; else echo "Not scanned"; fi)
- **File:** security-scan-bandit.json

### 3. Frontend Dependencies
- **Status:** $(if [ -f "security-scan-npm.json" ]; then echo "Scanned"; else echo "Not scanned"; fi)
- **File:** security-scan-npm.json

### 4. Git History
- **Status:** $(if [ -f "security-scan-git.json" ]; then echo "Scanned"; else echo "Not scanned"; fi)
- **File:** security-scan-git.json

## Security Configuration

### Environment Files
- **.env ignored:** $(if git check-ignore backend/.env > /dev/null 2>&1; then echo "✅ Yes"; else echo "❌ No"; fi)
- **.env.production ignored:** $(if git check-ignore backend/.env.production > /dev/null 2>&1; then echo "✅ Yes"; else echo "❌ No"; fi)

### Security Modules
- **Security Headers:** $(if [ -f "backend/security_headers.py" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **Input Validation:** $(if [ -f "backend/input_validation.py" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)
- **Rate Limiting:** $(if [ -f "backend/rate_limiting.py" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)

## Recommendations

1. **Review all scan results** in the generated JSON files
2. **Update vulnerable dependencies** if any are found
3. **Fix security issues** identified in code scans
4. **Rotate any exposed secrets** immediately
5. **Implement missing security modules** if not present

## Next Steps

1. Run this scan regularly (weekly recommended)
2. Set up automated security scanning in CI/CD
3. Monitor for new vulnerabilities
4. Keep dependencies updated

## Files Generated

- security-scan-python.json - Python dependency vulnerabilities
- security-scan-bandit.json - Python code security issues
- security-scan-npm.json - Frontend dependency vulnerabilities
- security-scan-git.json - Git history secrets
- security-scan-report.md - This report

EOF

    print_success "Security report generated: $REPORT_FILE"
}

# Main execution
main() {
    check_dependencies
    scan_python_dependencies
    scan_python_code
    scan_frontend_dependencies
    scan_git_secrets
    scan_current_secrets
    check_security_headers
    check_environment_config
    generate_report
    
    print_header "Security Scan Complete!"
    echo ""
    print_success "✅ Security scan completed successfully"
    print_success "📋 Review security-scan-report.md for details"
    print_success "🔍 Check generated JSON files for specific issues"
    echo ""
    print_warning "⚠️  Install missing security tools for comprehensive scanning"
    print_warning "⚠️  Run this scan regularly to maintain security"
}

# Run the main function
main "$@"
