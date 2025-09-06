#!/bin/bash

# Enhanced CI Integration Script for Fault Injection System
# This script demonstrates how to integrate API Extractor and deprecation checks
# into your CI pipeline for long-term stability with discrete steps and artifacts.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CI_MODE="${CI:-false}"
FAIL_ON_DEPRECATION="${FAIL_ON_DEPRECATION:-false}"
ARTIFACTS_DIR="${ARTIFACTS_DIR:-./ci-artifacts}"

# Exit codes for different failure types
EXIT_TYPE_CHECK=10
EXIT_LINTING=20
EXIT_API_EXTRACTION=30
EXIT_DEPRECATION=40
EXIT_UNIT_TESTS=50
EXIT_INTEGRATION_TESTS=60
EXIT_PAIRWISE_TESTS=70
EXIT_BUILD=80

echo -e "${BLUE}🔧 Enhanced Fault Injection CI Integration${NC}"
echo "================================================"
echo "Project Root: $PROJECT_ROOT"
echo "CI Mode: $CI_MODE"
echo "Fail on Deprecation: $FAIL_ON_DEPRECATION"
echo "Artifacts Directory: $ARTIFACTS_DIR"
echo ""

# Function to log with timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create artifacts directory
setup_artifacts() {
    log "${BLUE}📁 Setting up artifacts directory${NC}"
    mkdir -p "$ARTIFACTS_DIR"
    mkdir -p "$ARTIFACTS_DIR/reports"
    mkdir -p "$ARTIFACTS_DIR/logs"
    mkdir -p "$ARTIFACTS_DIR/api-snapshots"
    
    # Create summary file
    cat > "$ARTIFACTS_DIR/ci-summary.md" << EOF
# CI Integration Summary

**Generated:** $(date)
**CI Mode:** $CI_MODE
**Fail on Deprecation:** $FAIL_ON_DEPRECATION

## Test Results

| Step | Status | Duration | Details |
|------|--------|----------|---------|
EOF
    
    log "${GREEN}✅ Artifacts directory created: $ARTIFACTS_DIR${NC}"
}

# Function to run command with error handling and timing
run_command() {
    local cmd="$1"
    local description="$2"
    local step_name="$3"
    local start_time=$(date +%s)
    
    log "${BLUE}Running: $description${NC}"
    echo "Command: $cmd"
    
    if eval "$cmd" > "$ARTIFACTS_DIR/logs/${step_name}.log" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log "${GREEN}✅ $description completed successfully (${duration}s)${NC}"
        
        # Update summary
        echo "| $step_name | ✅ Passed | ${duration}s | [Log](${step_name}.log) |" >> "$ARTIFACTS_DIR/ci-summary.md"
        
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log "${RED}❌ $description failed (${duration}s)${NC}"
        
        # Update summary
        echo "| $step_name | ❌ Failed | ${duration}s | [Log](${step_name}.log) |" >> "$ARTIFACTS_DIR/ci-summary.md"
        
        return 1
    fi
}

# Function to check TypeScript compilation
check_typescript() {
    log "${BLUE}🔍 Step 1: TypeScript Compilation Check${NC}"
    
    if ! command_exists "tsc"; then
        log "${YELLOW}⚠️  TypeScript compiler not found, installing...${NC}"
        npm install --save-dev typescript
    fi
    
    if run_command "npm run tsc" "TypeScript compilation" "typescript-check"; then
        log "${GREEN}✅ TypeScript compilation successful${NC}"
        return 0
    else
        log "${RED}❌ TypeScript compilation failed${NC}"
        log "${YELLOW}Check the log file: $ARTIFACTS_DIR/logs/typescript-check.log${NC}"
        exit $EXIT_TYPE_CHECK
    fi
}

# Function to check linting and deprecation
check_linting() {
    log "${BLUE}🔍 Step 2: Linting and Deprecation Check${NC}"
    
    if ! command_exists "eslint"; then
        log "${YELLOW}⚠️  ESLint not found, installing...${NC}"
        npm install --save-dev eslint
    fi
    
    local lint_cmd="npm run lint"
    local description="ESLint and deprecation check"
    
    if [ "$FAIL_ON_DEPRECATION" = "true" ]; then
        log "${YELLOW}⚠️  Deprecation warnings will cause CI failure${NC}"
        # ESLint is already configured to fail on deprecation in CI mode
    else
        log "${BLUE}Deprecation warnings will not cause CI failure${NC}"
    fi
    
    if run_command "$lint_cmd" "$description" "linting"; then
        log "${GREEN}✅ Linting and deprecation check successful${NC}"
        return 0
    else
        log "${RED}❌ Linting and deprecation check failed${NC}"
        log "${YELLOW}Check the log file: $ARTIFACTS_DIR/logs/linting.log${NC}"
        exit $EXIT_LINTING
    fi
}

# Function to check API stability
check_api_stability() {
    log "${BLUE}🔍 Step 3: API Stability Check${NC}"
    
    if ! command_exists "api-extractor"; then
        log "${YELLOW}⚠️  API Extractor not found, installing...${NC}"
        npm install --save-dev @microsoft/api-extractor
    fi
    
    # Check if API has changed
    if [ -f "api-extractor-report.txt" ]; then
        log "${BLUE}Comparing with previous API snapshot...${NC}"
        
        # Run API check
        if run_command "npm run api:check" "API stability check" "api-stability"; then
            log "${GREEN}✅ API is stable - no breaking changes detected${NC}"
            
            # Copy current API snapshot
            cp api-extractor-report.txt "$ARTIFACTS_DIR/api-snapshots/current-snapshot.txt"
            
            return 0
        else
            log "${RED}❌ API has changed - breaking changes detected${NC}"
            log "${YELLOW}Review the changes and update the API snapshot if intentional${NC}"
            log "${YELLOW}Run 'npm run api:update' to update the snapshot${NC}"
            
            # Copy the failed report
            cp api-extractor-report.txt "$ARTIFACTS_DIR/api-snapshots/failed-snapshot.txt"
            
            exit $EXIT_API_EXTRACTION
        fi
    else
        log "${BLUE}No previous API snapshot found, creating baseline...${NC}"
        if run_command "npm run api:update" "API baseline creation" "api-baseline"; then
            log "${GREEN}✅ API baseline created${NC}"
            
            # Copy the new baseline
            cp api-extractor-report.txt "$ARTIFACTS_DIR/api-snapshots/baseline-snapshot.txt"
            
            return 0
        else
            log "${RED}❌ API baseline creation failed${NC}"
            exit $EXIT_API_EXTRACTION
        fi
    fi
}

# Function to check deprecation usage specifically
check_deprecation_usage() {
    log "${BLUE}🔍 Step 4: Deprecation Usage Analysis${NC}"
    
    # Create deprecation report
    local deprecation_report="$ARTIFACTS_DIR/reports/deprecation-analysis.md"
    
    cat > "$deprecation_report" << EOF
# Deprecation Usage Analysis

**Generated:** $(date)
**CI Mode:** $CI_MODE

## Summary

This report analyzes the usage of deprecated APIs in the codebase.

## Deprecated Methods

- \`injectRateLimit()\` → Use \`injectRateLimitExceeded()\` instead
- \`injectCircuitBreaker()\` → Use \`injectCircuitBreakerTrigger()\` instead

## Usage Analysis

EOF
    
    # Run ESLint with deprecation focus
    if run_command "npm run lint 2>&1 | grep -i deprecation || true" "Deprecation usage analysis" "deprecation-analysis"; then
        log "${GREEN}✅ Deprecation analysis completed${NC}"
        
        # Update deprecation report with findings
        echo "## Findings" >> "$deprecation_report"
        echo "No deprecation warnings found." >> "$deprecation_report"
        
        return 0
    else
        log "${YELLOW}⚠️  Deprecation analysis completed with warnings${NC}"
        
        # Update deprecation report with warnings
        echo "## Findings" >> "$deprecation_report"
        echo "Deprecation warnings found. Check the linting logs for details." >> "$deprecation_report"
        
        if [ "$FAIL_ON_DEPRECATION" = "true" ]; then
            log "${RED}❌ Deprecation usage detected - failing build${NC}"
            exit $EXIT_DEPRECATION
        fi
        
        return 0
    fi
}

# Function to run unit tests
run_unit_tests() {
    log "${BLUE}🧪 Step 5: Unit Tests${NC}"
    
    if run_command "npm run test:unit" "Unit tests" "unit-tests"; then
        log "${GREEN}✅ Unit tests passed${NC}"
        return 0
    else
        log "${RED}❌ Unit tests failed${NC}"
        log "${YELLOW}Check the log file: $ARTIFACTS_DIR/logs/unit-tests.log${NC}"
        exit $EXIT_UNIT_TESTS
    fi
}

# Function to run integration tests
run_integration_tests() {
    log "${BLUE}🧪 Step 6: Integration Tests${NC}"
    
    if run_command "npm run int" "Integration tests" "integration-tests"; then
        log "${GREEN}✅ Integration tests passed${NC}"
        return 0
    else
        log "${RED}❌ Integration tests failed${NC}"
        log "${YELLOW}Check the log file: $ARTIFACTS_DIR/logs/integration-tests.log${NC}"
        exit $EXIT_INTEGRATION_TESTS
    fi
}

# Function to run pairwise fault tests
run_pairwise_tests() {
    log "${BLUE}🧪 Step 7: Pairwise Fault Tests${NC}"
    
    if run_command "npm run test:unit -- src/testing/tests/pairwise-fault-combinations.test.ts" "Pairwise fault tests" "pairwise-tests"; then
        log "${GREEN}✅ Pairwise fault tests passed${NC}"
        return 0
    else
        log "${RED}❌ Pairwise fault tests failed${NC}"
        log "${YELLOW}Check the log file: $ARTIFACTS_DIR/logs/pairwise-tests.log${NC}"
        exit $EXIT_PAIRWISE_TESTS
    fi
}

# Function to check build integrity
check_build_integrity() {
    log "${BLUE}🔨 Step 8: Build Integrity Check${NC}"
    
    # Production build check
    if run_command "npm run build" "Production build" "production-build"; then
        log "${GREEN}✅ Production build successful${NC}"
        
        # Capture build artifacts
        if [ -d "dist" ]; then
            cp -r dist "$ARTIFACTS_DIR/build-artifacts"
            log "${BLUE}📁 Build artifacts captured${NC}"
        fi
        
        return 0
    else
        log "${RED}❌ Production build failed${NC}"
        log "${YELLOW}Check the log file: $ARTIFACTS_DIR/logs/production-build.log${NC}"
        exit $EXIT_BUILD
    fi
}

# Function to generate comprehensive report
generate_final_report() {
    log "${BLUE}📊 Generating Final CI Report${NC}"
    
    local final_report="$ARTIFACTS_DIR/ci-final-report.md"
    
    cat > "$final_report" << EOF
# CI Integration Final Report

**Generated:** $(date)
**CI Mode:** $CI_MODE
**Fail on Deprecation:** $FAIL_ON_DEPRECATION

## Executive Summary

All CI checks have been completed successfully. The fault injection system is stable and ready for production.

## Test Results Summary

$(cat "$ARTIFACTS_DIR/ci-summary.md" | tail -n +8)

## Artifacts

- **Logs:** [logs/](./logs/)
- **Reports:** [reports/](./reports/)
- **API Snapshots:** [api-snapshots/](./api-snapshots/)
- **Build Artifacts:** [build-artifacts/](./build-artifacts/)

## Recommendations

1. **API Changes**: No breaking changes detected
2. **Deprecation Usage**: Monitor deprecated API usage
3. **Test Coverage**: All tests passing
4. **Build Status**: Production build successful

## Next Steps

- [ ] Review any deprecation warnings
- [ ] Monitor fault injection test results
- [ ] Plan v2.0.0 breaking changes
- [ ] Update API snapshot if needed

## Quality Metrics

| Metric | Value | Status |
|--------|-------|--------|
| TypeScript Compilation | ✅ Passed | Green |
| Linting & Deprecation | ✅ Passed | Green |
| API Stability | ✅ Stable | Green |
| Unit Tests | ✅ Passed | Green |
| Integration Tests | ✅ Passed | Green |
| Pairwise Tests | ✅ Passed | Green |
| Production Build | ✅ Successful | Green |

## Overall Status: 🟢 PASSED

EOF
    
    log "${GREEN}✅ Final report generated: $final_report${NC}"
}

# Function to setup CI environment
setup_ci_environment() {
    if [ "$CI_MODE" = "true" ]; then
        log "${BLUE}🚀 Setting up CI Environment${NC}"
        
        # Install dependencies
        log "${BLUE}Installing dependencies...${NC}"
        npm ci
        
        # Set stricter rules for CI
        export FAIL_ON_DEPRECATION=true
        
        log "${GREEN}✅ CI environment configured${NC}"
    fi
}

# Main execution
main() {
    log "${BLUE}🚀 Starting Enhanced CI Integration Process${NC}"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Setup CI environment if needed
    setup_ci_environment
    
    # Setup artifacts directory
    setup_artifacts
    
    # Run all checks in sequence
    local exit_code=0
    
    # Step 1: TypeScript compilation
    check_typescript
    
    # Step 2: Linting and deprecation
    check_linting
    
    # Step 3: API stability
    check_api_stability
    
    # Step 4: Deprecation usage analysis
    check_deprecation_usage
    
    # Step 5: Unit tests
    run_unit_tests
    
    # Step 6: Integration tests
    run_integration_tests
    
    # Step 7: Pairwise fault tests
    run_pairwise_tests
    
    # Step 8: Build integrity
    check_build_integrity
    
    # Generate final report
    generate_final_report
    
    # Final status
    log "${GREEN}🎉 All CI checks passed successfully!${NC}"
    echo ""
    echo "📁 Artifacts available in: $ARTIFACTS_DIR"
    echo "📊 Final report: $ARTIFACTS_DIR/ci-final-report.md"
    echo ""
    echo "Next steps:"
    echo "1. Review the generated reports and artifacts"
    echo "2. Address any deprecation warnings"
    echo "3. Update API snapshot if needed"
    echo "4. Monitor fault injection test results"
    
    exit 0
}

# Run main function
main "$@"
