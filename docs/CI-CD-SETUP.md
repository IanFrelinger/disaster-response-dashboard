# 🚀 Localhost CI/CD Pipeline Setup

This document describes how to set up and use the localhost-focused CI/CD pipeline for the Disaster Response Dashboard.

## 📋 Overview

The localhost CI/CD pipeline provides:
- **Automated testing** before every deployment
- **Containerized testing** environment
- **Automatic builds** after tests pass
- **Localhost deployment** with health checks
- **Easy rollback** and cleanup

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Test Suite    │───▶│  Build Process  │───▶│  Localhost      │
│                 │    │                 │    │  Deployment    │
│ • Frontend      │    │ • Frontend      │    │ • Frontend      │
│ • Backend       │    │ • Backend       │    │ • Backend       │
│ • Integration   │    │ • Validation    │    │ • Health Checks │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Prerequisites

- Docker Desktop running
- Ports 3000 and 8000 available
- Git repository cloned

### 2. Run Full CI/CD Pipeline

```bash
# Run complete pipeline (test + build + deploy)
make cicd

# Or use the script directly
./scripts/local-cicd.sh
```

### 3. Quick Testing Only

```bash
# Run tests without deployment
make quick-test

# Or run specific test suites
make test-frontend
make test-backend
make test-all
```

## 🛠️ Available Commands

### Using Makefile (Recommended)

```bash
# Show all available commands
make help

# Testing
make test-frontend      # Frontend tests only
make test-backend       # Backend tests only
make test-all          # All tests
make quick-test        # Quick test run

# Building
make build-frontend     # Build frontend container
make build-backend      # Build backend container
make build             # Build both containers

# Deployment
make deploy            # Deploy to localhost
make cicd              # Full CI/CD pipeline

# Development
make dev               # Start development environment
make dev-stop          # Stop development environment
make dev-cycle         # Test + build + deploy cycle

# Cleanup
make clean             # Clean all containers/images
make clean-tests       # Clean test containers only

# Status
make status            # Show service status
make logs              # Show service logs
make coverage          # Generate coverage reports
```

### Using Scripts Directly

```bash
# Full CI/CD pipeline
./scripts/local-cicd.sh

# Quick testing
./scripts/quick-test.sh
```

## 📁 File Structure

```
disaster-response-dashboard/
├── docker-compose.ci.yml          # CI/CD Docker Compose
├── docker-compose.yml             # Production Docker Compose
├── Makefile                       # CI/CD commands
├── scripts/
│   ├── local-cicd.sh             # Full CI/CD pipeline
│   └── quick-test.sh             # Quick testing
├── frontend/
│   ├── Dockerfile                 # Production frontend
│   └── Dockerfile.test            # Test frontend
└── backend/
    ├── Dockerfile                 # Production backend
    └── Dockerfile.test            # Test backend
```

## 🔄 Pipeline Flow

### 1. Pre-flight Checks
- Docker availability
- Port availability
- Required files existence

### 2. Test Execution
- Start test infrastructure (test DB, Redis)
- Run backend tests with timeout
- Run frontend tests with timeout
- Fail fast if any tests fail

### 3. Build Process
- Build backend container
- Build frontend container
- Validate builds

### 4. Deployment
- Stop test infrastructure
- Start production services
- Wait for services to be ready
- Run health checks
- Validate deployment

### 5. Final Validation
- Service status check
- Health endpoint validation
- Success confirmation

## 🧪 Test Environment

### Frontend Testing
- **Container**: `node:18-alpine` with test dependencies
- **Environment**: `NODE_ENV=test`, `CI=true`
- **Command**: `npm run test:ci`
- **Output**: Coverage reports, test results XML

### Backend Testing
- **Container**: `python:3.11-slim` with test dependencies
- **Environment**: `TESTING=true`
- **Command**: `pytest --cov --cov-report=html --cov-report=term`
- **Output**: Coverage reports, test results

### Test Infrastructure
- **Test Database**: PostgreSQL on port 5433
- **Test Redis**: Redis on port 6380
- **Isolation**: Separate volumes for test data

## 📊 Test Results

### Frontend Test Results
- **Location**: Generated in test container
- **Format**: XML, coverage reports
- **Coverage**: HTML and terminal output

### Backend Test Results
- **Location**: Generated in test container
- **Format**: Coverage reports, pytest output
- **Coverage**: HTML and terminal output

## 🚨 Error Handling

### Test Failures
- Pipeline stops immediately
- Test containers cleaned up
- Error details displayed
- Exit code 1 returned

### Build Failures
- Pipeline stops before deployment
- Error details displayed
- Exit code 1 returned

### Deployment Failures
- Health checks fail
- Service logs displayed
- Exit code 1 returned

## 🔧 Customization

### Test Timeout
Modify `TEST_TIMEOUT` in `scripts/local-cicd.sh`:
```bash
TEST_TIMEOUT=600  # 10 minutes
```

### Port Configuration
Modify ports in `scripts/local-cicd.sh`:
```bash
FRONTEND_PORT=3001
BACKEND_PORT=8001
```

### Test Commands
Modify test commands in `docker-compose.ci.yml`:
```yaml
command: npm run test:custom
```

## 📈 Monitoring & Debugging

### Service Status
```bash
make status
docker-compose ps
```

### Service Logs
```bash
make logs
docker-compose logs -f [service-name]
```

### Test Logs
```bash
docker-compose -f docker-compose.ci.yml logs test-runner
docker-compose -f docker-compose.ci.yml logs backend-tests
```

### Coverage Reports
```bash
make coverage
# Reports generated in frontend/coverage/ and backend/htmlcov/
```

## 🔄 Development Workflow

### Daily Development
```bash
# 1. Make changes
# 2. Run tests
make quick-test

# 3. If tests pass, deploy
make deploy

# 4. Or run full cycle
make dev-cycle
```

### Before Committing
```bash
# Run full test suite
make test-all

# Check coverage
make coverage

# Ensure everything works
make dev-cycle
```

### Troubleshooting
```bash
# Clean everything and start fresh
make clean
make cicd

# Check specific service
make status
make logs
```

## 🚀 Production Deployment

The localhost CI/CD pipeline is designed for development and testing. For production deployment:

1. **Use production CI/CD** (GitHub Actions, GitLab CI, etc.)
2. **Deploy to cloud infrastructure** (AWS, GCP, Azure)
3. **Use production databases** and services
4. **Implement proper security** and monitoring

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vitest Testing Framework](https://vitest.dev/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Makefile Tutorial](https://makefiletutorial.com/)

## 🤝 Contributing

To improve the CI/CD pipeline:

1. **Test changes** thoroughly
2. **Update documentation** accordingly
3. **Follow existing patterns** and conventions
4. **Add error handling** for new scenarios
5. **Update Makefile** with new commands

## 📞 Support

For issues with the CI/CD pipeline:

1. Check the logs: `make logs`
2. Verify Docker is running
3. Check port availability
4. Review test output for specific failures
5. Clean and restart: `make clean && make cicd`

