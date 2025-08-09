# Local Testing Guide

This guide shows you how to run comprehensive automated testing locally without relying on GitHub Actions. This ensures you never walk into blank pages or errors upon deployment.

## 🚀 Quick Start

### 1. Start Your Services
```bash
# Start the services if they're not already running
docker-compose -f config/docker/docker-compose.yml up -d
```

### 2. Run Quick Tests
```bash
# Run essential tests only (fastest)
./scripts/local-testing-suite.sh --quick
```

### 3. Run Full Test Suite
```bash
# Run all test categories
./scripts/local-testing-suite.sh
```

## 📋 Test Categories

### Essential Tests (--quick)
- **Smoke Tests**: Basic connectivity and health checks
- **Backend Tests**: API and backend functionality  
- **Frontend Tests**: UI and frontend functionality

### Full Test Suite
- **Integration Tests**: Frontend-backend communication
- **Performance Tests**: Response time and load testing
- **Security Tests**: Security vulnerability checks
- **Accessibility Tests**: Accessibility compliance
- **Visual Tests**: Visual regression testing

## 🛠️ Usage Examples

### Run Specific Test Categories
```bash
# Test only backend functionality
./scripts/local-testing-suite.sh backend

# Test only performance
./scripts/local-testing-suite.sh performance

# Test multiple categories
./scripts/local-testing-suite.sh smoke backend frontend
```

### Run with Options
```bash
# Quick tests only (essential tests)
./scripts/local-testing-suite.sh --quick

# Full test suite
./scripts/local-testing-suite.sh --full

# Verbose output
./scripts/local-testing-suite.sh -v
```

## 🚀 Local Deployment with Testing

### Full Deployment with Tests
```bash
# Deploy with comprehensive testing
./scripts/local-deploy.sh
```

### Quick Deployment
```bash
# Deploy with quick tests only
./scripts/local-deploy.sh --quick-tests
```

### Deploy Without Tests (not recommended)
```bash
# Skip testing (use only for development)
./scripts/local-deploy.sh --skip-tests
```

## 📊 Test Reports

After running tests, you'll find detailed reports in:

- **Test Results**: `test-results/local-test-report-YYYYMMDD-HHMMSS.md`
- **Deployment Reports**: `deployment-reports/local-deployment-report-YYYYMMDD-HHMMSS.md`

## 🔍 What Gets Tested

### Smoke Tests
- ✅ Frontend accessibility (prevents blank pages)
- ✅ Backend API health
- ✅ Basic content loading
- ✅ Error log analysis

### Backend Tests
- ✅ API integration tests
- ✅ Unit tests
- ✅ Endpoint accessibility
- ✅ Performance validation

### Frontend Tests
- ✅ Content loading validation
- ✅ JavaScript error detection
- ✅ Responsive design testing
- ✅ UI element validation

### Integration Tests
- ✅ Frontend-backend communication
- ✅ CORS configuration
- ✅ Data flow validation

### Performance Tests
- ✅ Page load time (< 5 seconds)
- ✅ API response time (< 2 seconds)
- ✅ Concurrent request handling

### Security Tests
- ✅ Security headers validation
- ✅ SQL injection protection
- ✅ XSS protection testing

### Accessibility Tests
- ✅ Heading structure validation
- ✅ Image alt text checking
- ✅ Semantic HTML verification

## 🚨 Troubleshooting

### Services Not Running
```bash
# Check if services are running
docker-compose -f config/docker/docker-compose.yml ps

# Start services if needed
docker-compose -f config/docker/docker-compose.yml up -d
```

### Tests Failing
```bash
# Check service health
curl http://localhost:5001/api/health
curl http://localhost:3000

# View container logs
docker-compose -f config/docker/docker-compose.yml logs -f
```

### Docker Issues
```bash
# Check Docker status
docker info

# Restart Docker if needed
# (On macOS: restart Docker Desktop)
```

## 📈 Monitoring

### Health Checks
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api/health

### Performance Metrics
- **Frontend Load Time**: < 5 seconds
- **API Response Time**: < 2 seconds
- **Error Rate**: < 1%

## 🎯 Best Practices

### Before Deployment
1. **Always run tests**: `./scripts/local-testing-suite.sh`
2. **Check test reports**: Review generated reports
3. **Fix any failures**: Don't deploy with test failures
4. **Monitor logs**: Watch for any errors

### During Development
1. **Run quick tests**: `./scripts/local-testing-suite.sh --quick`
2. **Test specific features**: Run individual test categories
3. **Monitor performance**: Check response times
4. **Validate changes**: Ensure no regressions

### After Deployment
1. **Verify deployment**: Check all services are healthy
2. **Run post-deployment tests**: Ensure everything works
3. **Monitor for issues**: Watch logs and metrics
4. **Document any issues**: Update test cases if needed

## 🔧 Customization

### Adding New Tests
```bash
# Backend tests: Add to backend/tests/integration/test_api_integration.py
# Frontend tests: Add to frontend/tests/e2e/comprehensive-ui-test.spec.ts
# Custom scripts: Create new scripts in scripts/ directory
```

### Modifying Test Categories
Edit `scripts/local-testing-suite.sh` to:
- Add new test categories
- Modify test thresholds
- Change test behavior

## 📞 Support

If you encounter issues:

1. **Check the logs**: `docker-compose -f config/docker/docker-compose.yml logs`
2. **Review test reports**: Check generated markdown reports
3. **Run individual tests**: Test specific categories to isolate issues
4. **Check prerequisites**: Ensure Docker and curl are available

---

This local testing setup ensures you have confidence in every deployment and never walk into blank pages or errors again! 🚀
