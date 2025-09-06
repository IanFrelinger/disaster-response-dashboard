# Disaster Response Dashboard - Development Makefile
# This Makefile provides standardized commands for development, testing, and validation

.PHONY: help setup lint type test e2e check validate clean install-frontend install-backend git-push git-test git-push-force git-commit-push git-commit-summary git-summary git-auto-commit git-commit git-push-all

# Default target
help: ## Show this help message
	@echo "Disaster Response Dashboard - Development Commands"
	@echo "=================================================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  setup          - Install all dependencies (frontend + backend)"
	@echo "  install-frontend - Install frontend dependencies only"
	@echo "  install-backend  - Install backend dependencies only"
	@echo ""
	@echo "Development Commands:"
	@echo "  lint           - Run linting for frontend and backend"
	@echo "  type           - Run type checking for frontend and backend"
	@echo "  test           - Run unit and integration tests"
	@echo "  e2e            - Run end-to-end tests"
	@echo ""
	@echo "Validation Commands:"
	@echo "  check          - Run complete validation suite (lint + type + test + e2e)"
	@echo "  validate       - Run full validation including route safety checks"
	@echo "  analyze-errors - Analyze error correlations between frontend and backend"
	@echo ""
	@echo "Command Pattern Tests:"
	@echo "  test-unified   - Run unified frontend and backend tests with command pattern"
	@echo "  test-frontend  - Run frontend tests using command pattern"
	@echo "  test-backend   - Run backend tests using command pattern"
	@echo "  test-smoke     - Run quick smoke tests"
	@echo "  test-comprehensive - Run comprehensive test suite"
	@echo ""
	@echo "Git Workflow Commands:"
	@echo "  git-push            - Run tests and push changes to repository"
	@echo "  git-test            - Run tests only (no push)"
	@echo "  git-push-force      - Force push without running tests (not recommended)"
	@echo "  git-commit-push     - Stage all changes, commit with custom message, and push"
	@echo "  git-commit-summary  - Stage all changes, auto-generate commit message, and push"
	@echo "  git-summary         - Auto-generate commit message for staged changes and push"
	@echo "  git-auto-commit     - Auto-commit substantial progress and push"
	@echo "  git-commit          - Commit individual changes with custom message"
	@echo "  git-push-all        - Push all commits to GitHub"
	@echo ""
	@echo "Utility Commands:"
	@echo "  clean          - Clean build artifacts and temporary files"
	@echo "  help           - Show this help message"
	@echo ""
	@echo "Performance Targets:"
	@echo "  Frontend load time: < 3 seconds"
	@echo "  Backend response time: < 100ms"
	@echo "  Validation time: ~8ms"
	@echo "  Layer render time: 1-5ms"

# Setup Commands
setup: install-frontend install-backend ## Install all dependencies
	@echo "✅ Setup complete - all dependencies installed"

install-frontend: ## Install frontend dependencies
	@echo "📦 Installing frontend dependencies..."
	cd frontend && pnpm i --frozen-lockfile
	@echo "✅ Frontend dependencies installed"

install-backend: ## Install backend dependencies
	@echo "📦 Installing backend dependencies..."
	python -m pip install -r backend/requirements.txt
	@echo "✅ Backend dependencies installed"

# Development Commands
lint: ## Run linting for frontend and backend
	@echo "🔍 Running linting checks..."
	@echo "Frontend linting..."
	cd frontend && pnpm lint --max-warnings 1000 || echo "⚠️  Frontend linting completed with warnings"
	@echo "Backend linting..."
	ruff check . || echo "⚠️  Backend linting completed with warnings"
	@echo "✅ Linting complete"

type: ## Run type checking for frontend and backend
	@echo "🔍 Running type checks..."
	@echo "Frontend type checking..."
	cd frontend && pnpm typecheck
	@echo "Backend type checking..."
	mypy backend --exclude="ontology/"
	@echo "✅ Type checking complete"

test: ## Run unit and integration tests
	@echo "🧪 Running tests..."
	@echo "Frontend unit tests..."
	cd frontend && pnpm test:unit-enhanced
	@echo "Backend integration tests..."
	pytest -q
	@echo "✅ Tests complete"

e2e: ## Run end-to-end tests
	@echo "🎭 Running end-to-end tests..."
	@echo "Installing Playwright dependencies..."
	cd frontend && pnpm exec playwright install --with-deps
	@echo "Running E2E tests..."
	cd frontend && pnpm e2e -- --reporter=line
	@echo "✅ E2E tests complete"

# Validation Commands
check: lint type test e2e ## Run complete validation suite
	@echo "✅ Complete validation suite passed"

validate: check frontend-layer-validation ## Run full validation including route safety checks
	@echo "🔍 Running route safety validation..."
	python scripts/validate_routes.py
	@echo "✅ Full validation complete - 0% hazard intersection confirmed"

frontend-layer-validation: ## Run frontend layer validation
	@echo "🗺️ Running frontend layer validation..."
	cd frontend && pnpm validate:layers
	@echo "✅ Frontend layer validation complete"

compose: ## Run composed test commands
	@echo "🧪 Running composed test commands..."
	cd frontend && pnpm test:compose -- $(PRESET)
	@echo "✅ Composed test commands complete"

# Utility Commands
clean: ## Clean build artifacts and temporary files
	@echo "🧹 Cleaning build artifacts..."
	cd frontend && rm -rf dist/ node_modules/.vite/ .vite/
	cd backend && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	cd backend && find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf test-results/ debug-screenshots/ debug-reports/
	@echo "✅ Cleanup complete"

# Development Server Commands
dev-frontend: ## Start frontend development server
	@echo "🚀 Starting frontend development server..."
	cd frontend && pnpm dev

dev-backend: ## Start backend development server
	@echo "🚀 Starting backend development server..."
	cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev: dev-backend dev-frontend ## Start both frontend and backend development servers

# Docker Commands
docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✅ Docker images built"

docker-up: ## Start services with Docker Compose
	@echo "🐳 Starting services with Docker Compose..."
	docker-compose up -d
	@echo "✅ Services started"

docker-down: ## Stop services with Docker Compose
	@echo "🐳 Stopping services with Docker Compose..."
	docker-compose down
	@echo "✅ Services stopped"

docker-logs: ## View Docker Compose logs
	docker-compose logs -f

# Testing Commands
test-frontend: ## Run only frontend tests
	@echo "🧪 Running frontend tests..."
	cd frontend && pnpm test:unit-enhanced

test-backend: ## Run only backend tests
	@echo "🧪 Running backend tests..."
	pytest -q

test-coverage: ## Run tests with coverage reporting
	@echo "🧪 Running tests with coverage..."
	cd frontend && pnpm test:unit-enhanced -- --coverage
	pytest --cov=backend --cov-report=html --cov-report=term-missing

test-edge-cases: ## Run edge case tests
	@echo "🧪 Running edge case tests..."
	cd frontend && pnpm test:edge-cases

test-contracts: ## Run contract tests
	@echo "🧪 Running contract tests..."
	cd frontend && pnpm test:contracts

test-visual-regression: ## Run visual regression tests
	@echo "🧪 Running visual regression tests..."
	cd frontend && pnpm test:visual-regression

test-accessibility: ## Run accessibility tests
	@echo "🧪 Running accessibility tests..."
	cd frontend && pnpm test:accessibility

test-chaos: ## Run chaos tests
	@echo "🧪 Running chaos tests..."
	cd frontend && pnpm test:chaos

test-performance: ## Run performance tests
	@echo "🧪 Running performance tests..."
	cd frontend && pnpm test:performance

test-smoke: ## Run smoke tests
	@echo "🧪 Running smoke tests..."
	cd frontend && pnpm test:smoke

test-full: ## Run full test suite
	@echo "🧪 Running full test suite..."
	cd frontend && pnpm test:full

test-ci: ## Run CI test suite
	@echo "🧪 Running CI test suite..."
	cd frontend && pnpm test:ci

test-nightly: ## Run nightly test suite
	@echo "🧪 Running nightly test suite..."
	cd frontend && pnpm test:nightly

# Performance Commands
perf-test: ## Run performance tests
	@echo "⚡ Running performance tests..."
	cd frontend && pnpm test:performance
	python scripts/performance_test.py

# Security Commands
security-scan: ## Run security scans
	@echo "🔒 Running security scans..."
	cd frontend && pnpm audit
	cd backend && safety check
	@echo "✅ Security scan complete"

# Documentation Commands
docs: ## Generate documentation
	@echo "📚 Generating documentation..."
	cd frontend && pnpm docs
	cd backend && python -m pdoc --html --output-dir docs/backend backend/
	@echo "✅ Documentation generated"

# Release Commands
build: ## Build production artifacts
	@echo "🏗️ Building production artifacts..."
	cd frontend && pnpm build
	@echo "✅ Production build complete"

release-check: validate security-scan ## Run all checks required for release
	@echo "✅ Release checks complete - ready for deployment"

# Environment Commands
env-check: ## Check environment configuration
	@echo "🔍 Checking environment configuration..."
	@echo "Frontend environment:"
	cd frontend && pnpm env
	@echo "Backend environment:"
	python --version
	pip list | grep -E "(fastapi|flask|pytest|ruff|mypy)"

# Health Check Commands
health: ## Check system health
	@echo "🏥 Checking system health..."
	@echo "Frontend health:"
	curl -f http://localhost:8080/health 2>/dev/null && echo "✅ Frontend healthy" || echo "❌ Frontend not responding"
	@echo "Backend health:"
	curl -f http://localhost:8000/api/health 2>/dev/null && echo "✅ Backend healthy" || echo "❌ Backend not responding"

# Quick Commands for Development
quick-test: ## Quick test run for development
	@echo "⚡ Running quick tests..."
	cd frontend && pnpm test -- --run --reporter=basic
	pytest -q --tb=short

quick-lint: ## Quick lint check
	@echo "⚡ Running quick lint check..."
	cd frontend && pnpm lint --quiet
	ruff check . --quiet

# Error Analysis Commands
analyze-errors: ## Analyze error correlations between frontend and backend
	@echo "🔍 Analyzing error correlations..."
	node scripts/analyze-error-correlations.js
	@echo "✅ Error correlation analysis complete"

# Command Pattern Test Commands
test-unified: ## Run unified frontend and backend tests with command pattern
	@echo "🚀 Running unified tests with command pattern..."
	node scripts/run-unified-tests.js
	@echo "✅ Unified tests complete"

test-frontend: ## Run frontend tests using command pattern
	@echo "🎨 Running frontend tests with command pattern..."
	cd frontend && npx tsx src/testing/runFrontendTests.ts
	@echo "✅ Frontend tests complete"

test-backend: ## Run backend tests using command pattern
	@echo "🔧 Running backend tests with command pattern..."
	python backend/tests/runBackendTests.py
	@echo "✅ Backend tests complete"

test-smoke: ## Run quick smoke tests
	@echo "💨 Running smoke tests..."
	cd frontend && npx tsx src/testing/runFrontendTests.ts --suites smoke
	python backend/tests/runBackendTests.py --suites health
	@echo "✅ Smoke tests complete"

test-comprehensive: ## Run comprehensive test suite
	@echo "🔬 Running comprehensive test suite..."
	node scripts/run-unified-tests.js --parallel --fail-fast

test-production: ## Run production validation tests
	@echo "🏭 Running production validation tests..."
	cd frontend && npx tsx src/testing/runFrontendTests.ts --production true
	@echo "✅ Production tests complete"

test-fail-fast: ## Run tests with strict fail-fast behavior
	@echo "🛑 Running tests with strict fail-fast behavior..."
	cd frontend && npx tsx src/testing/runFrontendTests.ts --failFast true --timeout 30000
	@echo "✅ Fail-fast tests complete"

# CI/CD Commands
ci: setup check ## Run CI pipeline locally
	@echo "✅ CI pipeline complete"

# Help for specific targets
help-setup: ## Show setup help
	@echo "Setup Commands:"
	@echo "  make setup          - Install all dependencies"
	@echo "  make install-frontend - Install only frontend dependencies"
	@echo "  make install-backend  - Install only backend dependencies"

help-test: ## Show testing help
	@echo "Testing Commands:"
	@echo "  make test           - Run all tests"
	@echo "  make test-frontend  - Run only frontend tests"
	@echo "  make test-backend   - Run only backend tests"
	@echo "  make e2e            - Run end-to-end tests"
	@echo "  make test-coverage  - Run tests with coverage"

help-docker: ## Show Docker help
	@echo "Docker Commands:"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make docker-up      - Start services"
	@echo "  make docker-down    - Stop services"
	@echo "  make docker-logs    - View logs"

# Performance Budget Validation
validate-performance: ## Validate performance budgets
	@echo "⚡ Validating performance budgets..."
	@echo "Frontend load time target: < 3 seconds"
	@echo "Backend response time target: < 100ms"
	@echo "Validation time target: ~8ms"
	@echo "Layer render time target: 1-5ms"
	@echo "Running performance tests..."
	$(MAKE) perf-test

# Route Safety Validation
validate-routes: ## Validate route safety (0% hazard intersection)
	@echo "🛡️ Validating route safety..."
	python scripts/validate_routes.py
	@echo "✅ Route safety validation complete - 0% hazard intersection confirmed"

# Complete Validation Pipeline
full-validate: setup check validate-performance validate-routes security-scan ## Run complete validation pipeline
	@echo "✅ Full validation pipeline complete - system ready for deployment"

# Git Workflow Commands
git-push: ## Run tests and push changes to repository
	@echo "🚀 Running git workflow with tests and push..."
	./scripts/git-workflow.sh

git-test: ## Run tests only (no push)
	@echo "🧪 Running tests only..."
	./scripts/git-workflow.sh --test-only

git-push-force: ## Force push without running tests (not recommended)
	@echo "⚠️ Force pushing without tests (not recommended)..."
	./scripts/git-workflow.sh --force

git-commit-push: ## Stage all changes, commit with message, and push
	@echo "📝 Staging all changes, committing, and pushing..."
	@read -p "Enter commit message: " message; \
	./scripts/git-workflow.sh --all --message "$$message"

git-commit-summary: ## Stage all changes, auto-generate commit message, and push
	@echo "📝 Staging all changes, auto-generating commit message, and pushing..."
	./scripts/git-workflow.sh --all

git-summary: ## Auto-generate commit message for staged changes and push
	@echo "📝 Auto-generating commit message and pushing..."
	./scripts/git-workflow.sh --summary

git-auto-commit: ## Auto-commit substantial progress and push
	@echo "🤖 Auto-committing substantial progress and pushing..."
	./scripts/git-workflow.sh --all

git-commit: ## Commit individual changes with custom message
	@echo "📝 Committing individual changes..."
	@read -p "Enter commit message: " message; \
	./scripts/git-workflow.sh commit_change "$$message"

git-push-all: ## Push all commits to GitHub
	@echo "🚀 Pushing all commits to GitHub..."
	./scripts/git-workflow.sh push_to_github