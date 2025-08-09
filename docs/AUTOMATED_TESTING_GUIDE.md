# Automated Testing Guide

This guide covers the comprehensive automated testing setup for the Disaster Response Dashboard that prevents blank pages, errors, and ensures deployment quality.

## 🎯 Testing Goals

- **Prevent Blank Pages**: Ensure the frontend always loads correctly
- **Prevent API Errors**: Validate all backend endpoints work properly
- **Ensure Performance**: Maintain acceptable response times
- **Security Validation**: Check for common vulnerabilities
- **Cross-browser Compatibility**: Test in multiple browsers
- **Accessibility Compliance**: Ensure the app is accessible

## 🏗️ Testing Architecture

### Containerized Testing
- **Backend Test Container**: `backend/Dockerfile.test`
- **Frontend Test Container**: `frontend/Dockerfile.test`
- **Test Profiles**: Docker Compose profiles for isolated testing

### Test Types

#### 1. Backend Tests
- **Integration Tests**: API endpoint validation
- **Unit Tests**: Individual function testing
- **Performance Tests**: Response time validation
- **Security Tests**: SQL injection, XSS protection

#### 2. Frontend Tests
- **UI Tests**: Playwright-based end-to-end testing
- **Unit Tests**: Component and function testing
- **Accessibility Tests**: WCAG compliance
- **Cross-browser Tests**: Multiple browser validation

#### 3. Integration Tests
- **Service Connectivity**: Frontend-backend communication
- **Data Flow**: End-to-end data validation
- **Error Handling**: Graceful failure management

#### 4. Performance Tests
- **Page Load Time**: Frontend performance
- **API Response Time**: Backend performance
- **Concurrent Requests**: Load handling

#### 5. Security Tests
- **Security Headers**: XSS protection, frame options
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Malicious payload protection

## 🚀 Quick Start

### 1. Run All Tests Locally
```bash
# Make scripts executable
chmod +x scripts/run-containerized-tests.sh scripts/ci-cd-pipeline.sh

# Run comprehensive test suite
./scripts/run-containerized-tests.sh
```

### 2. Run Specific Test Stages
```bash
# Build stage only
./scripts/ci-cd-pipeline.sh build

# Test stage only
./scripts/ci-cd-pipeline.sh test

# Deploy stage only
./scripts/ci-cd-pipeline.sh deploy

# All stages
./scripts/ci-cd-pipeline.sh all
```

### 3. Run Individual Test Types
```bash
# Backend tests only
docker exec docker-backend-1 python -m pytest tests/integration/test_api_integration.py -v

# Frontend tests only
docker exec docker-frontend-1 npx playwright test tests/e2e/comprehensive-ui-test.spec.ts

# Performance tests only
docker exec docker-backend-1 python -c "
import requests
import time
start = time.time()
requests.get('http://localhost:8000/api/health')
print(f'Response time: {time.time() - start:.2f}s')
"
```

## 📋 Test Suites

### Backend Test Suite (`backend/tests/integration/test_api_integration.py`)

#### API Integration Tests
- **Health Endpoint**: Validates service health
- **API Root**: Checks API accessibility
- **Data Endpoints**: Tests disaster/hazard/risk/route endpoints
- **Data Validation**: Ensures correct response structure
- **Error Handling**: Validates graceful error responses
- **CORS Headers**: Checks cross-origin support
- **Response Time**: Performance validation
- **Concurrent Requests**: Load testing
- **Data Consistency**: State validation

#### Performance Tests
- **Load Handling**: 10 concurrent requests
- **Response Time**: Average < 2 seconds
- **Throughput**: Requests per second validation

#### Security Tests
- **SQL Injection Protection**: Malicious query handling
- **XSS Protection**: Script injection prevention
- **Input Validation**: Malicious payload handling

### Frontend Test Suite (`frontend/tests/e2e/comprehensive-ui-test.spec.ts`)

#### UI Tests
- **Homepage Loading**: No blank pages or errors
- **Navigation Elements**: Menu and routing validation
- **Map Component**: 3D terrain visualization
- **API Connectivity**: Frontend-backend communication
- **Loading States**: Proper loading indicators
- **Responsive Design**: Mobile/tablet/desktop validation
- **User Interactions**: Button clicks, form inputs
- **Route Navigation**: Internal link testing
- **Data Visualization**: Chart and graph components
- **Error Boundaries**: Graceful error handling

#### Accessibility Tests
- **Heading Structure**: Proper document outline
- **Alt Text**: Image accessibility
- **Focus Management**: Keyboard navigation
- **Color Contrast**: Visual accessibility

#### Performance Tests
- **Page Load Time**: < 10 seconds
- **JavaScript Errors**: No console errors
- **Browser Compatibility**: Cross-browser validation

## 🔧 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

#### Jobs
1. **Comprehensive Testing**: Runs all test suites
2. **Deploy to Production**: Automatic deployment on main branch
3. **Security Scan**: Vulnerability scanning with Trivy
4. **Performance Testing**: Load and response time validation

#### Triggers
- **Push to main/develop**: Full test suite
- **Pull Requests**: Test validation before merge
- **Main branch push**: Automatic deployment

### Pipeline Stages

#### Build Stage
```bash
# Build test-enabled containers
docker-compose -f config/docker/docker-compose.yml build backend-test frontend-test

# Build production containers
docker-compose -f config/docker/docker-compose.yml build backend frontend
```

#### Test Stage
```bash
# Start test containers
docker-compose -f config/docker/docker-compose.yml --profile test up -d

# Run backend tests
docker exec docker-backend-test-1 python -m pytest tests/ -v

# Run frontend tests
docker exec docker-frontend-test-1 npx playwright test tests/e2e/ -v

# Run performance tests
./scripts/run-containerized-tests.sh
```

#### Deploy Stage
```bash
# Start production containers
docker-compose -f config/docker/docker-compose.yml up -d

# Health checks
curl -f http://localhost:5001/api/health
curl -f http://localhost:3000

# Final smoke test
./scripts/run-containerized-tests.sh
```

## 📊 Test Reports

### Generated Reports
- **Backend Integration Report**: `test-results/backend-integration-report.html`
- **Backend Unit Report**: `test-results/backend-unit-report.html`
- **Frontend UI Report**: `playwright-reports/index.html`
- **Performance Report**: `test-results/performance-report.md`
- **Deployment Report**: `deployment-reports/deployment-report-*.md`

### Report Contents
- **Test Results**: Pass/fail status for each test
- **Performance Metrics**: Response times and load handling
- **Error Details**: Specific failure information
- **Recommendations**: Action items for failed tests
- **Service Health**: Current system status

## 🛠️ Customization

### Adding New Tests

#### Backend Tests
```python
# Add to backend/tests/integration/test_api_integration.py
def test_new_endpoint(self):
    """Test new API endpoint"""
    response = requests.get(f"{API_BASE}/new-endpoint", timeout=TIMEOUT)
    assert response.status_code == 200
    data = response.json()
    assert "expected_field" in data
```

#### Frontend Tests
```typescript
// Add to frontend/tests/e2e/comprehensive-ui-test.spec.ts
test('should handle new feature', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.click('[data-testid="new-feature"]');
  await expect(page.locator('.new-feature-content')).toBeVisible();
});
```

### Custom Test Scripts
```bash
# Create custom test script
#!/bin/bash
# scripts/custom-test.sh

echo "Running custom tests..."
# Your custom test logic here
```

## 🚨 Troubleshooting

### Common Issues

#### Test Container Won't Start
```bash
# Check Docker daemon
docker info

# Check container logs
docker logs docker-backend-test-1
docker logs docker-frontend-test-1

# Rebuild containers
docker-compose -f config/docker/docker-compose.yml build --no-cache
```

#### Tests Failing
```bash
# Check service health
curl http://localhost:5001/api/health
curl http://localhost:3000

# Check container status
docker-compose -f config/docker/docker-compose.yml ps

# View test logs
docker exec docker-backend-test-1 python -m pytest tests/ -v -s
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor logs in real-time
docker-compose -f config/docker/docker-compose.yml logs -f

# Run performance profiling
docker exec docker-backend-test-1 python -m pytest tests/ -v --durations=10
```

### Debug Mode
```bash
# Run tests with debug output
DEBUG=1 ./scripts/run-containerized-tests.sh

# Run specific test with verbose output
docker exec docker-backend-test-1 python -m pytest tests/integration/test_api_integration.py::TestAPIIntegration::test_health_endpoint -v -s
```

## 📈 Monitoring

### Health Checks
- **API Health**: `GET /api/health`
- **Frontend Health**: `GET /` (200 status)
- **Container Health**: Docker health checks

### Metrics
- **Response Time**: < 2s for API, < 5s for frontend
- **Error Rate**: < 1% of requests
- **Uptime**: > 99.9% availability

### Alerts
- **Test Failures**: Immediate notification
- **Performance Degradation**: Response time > 5s
- **Service Unavailable**: Health check failures

## 🎯 Best Practices

### Test Development
1. **Write Tests First**: TDD approach for new features
2. **Test Edge Cases**: Include error scenarios
3. **Mock External Dependencies**: Isolate unit tests
4. **Use Descriptive Names**: Clear test purpose
5. **Keep Tests Fast**: < 30s for full suite

### Deployment
1. **Always Run Tests**: Never skip test stage
2. **Monitor Results**: Review test reports
3. **Rollback on Failure**: Automatic rollback for failed deployments
4. **Gradual Rollout**: Canary deployments for major changes

### Maintenance
1. **Update Dependencies**: Regular security updates
2. **Review Test Coverage**: Maintain > 80% coverage
3. **Optimize Performance**: Regular performance testing
4. **Document Changes**: Update test documentation

## 🔗 Resources

- **Playwright Documentation**: https://playwright.dev/
- **Pytest Documentation**: https://docs.pytest.org/
- **Docker Testing**: https://docs.docker.com/develop/dev-best-practices/
- **GitHub Actions**: https://docs.github.com/en/actions

---

This testing setup ensures that you never walk into a blank page or error upon deployment. The comprehensive test suite validates every aspect of the application before it reaches production.
