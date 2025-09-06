# Production Rebuild Guide

## 🚀 Quick Start

To blow away the old production image and rebuild from source with all new testing and quality improvements:

```bash
# Run the rebuild script
./scripts/rebuild-production.sh
```

## 📋 What This Does

### 1. **Cleanup Phase**
- Stops and removes all existing containers
- Removes old production images
- Cleans up Docker build cache
- Removes dangling images

### 2. **Build Phase**
- Builds new production image with enhanced testing
- Includes all new testing frameworks (Vitest, Playwright, etc.)
- Integrates performance monitoring and resilience features
- Adds accessibility testing and visual regression
- Includes chaos testing and contract validation

### 3. **Validation Phase**
- Runs basic health checks
- Validates frontend and backend services
- Executes smoke tests
- Performs accessibility validation
- Runs performance tests

### 4. **Deployment Phase**
- Starts production services with enhanced monitoring
- Runs comprehensive validation suite
- Sets up log aggregation
- Enables security scanning
- Configures chaos testing

## 🏗️ New Production Features

### Enhanced Testing
- **Vitest**: Modern unit testing with 90%+ coverage
- **Playwright**: Cross-browser E2E testing
- **Visual Regression**: UI consistency validation
- **Accessibility**: WCAG compliance testing
- **Chaos Testing**: Resilience under failure conditions
- **Contract Tests**: API schema validation
- **Edge Cases**: Dateline crossing, polar regions, etc.

### Performance Monitoring
- **RUM**: Real User Monitoring for map load times
- **Frame Rate**: Real-time FPS tracking
- **Memory Usage**: Heap size monitoring
- **Network Latency**: API response time tracking
- **Performance Budgets**: Automated threshold validation

### Resilience Features
- **Circuit Breakers**: Automatic failure detection
- **Rate Limiting**: Request throttling and backoff
- **Adaptive Caching**: LRU, FIFO, TTL strategies
- **Offline Support**: Service worker with caching
- **Back-pressure**: Queue management under load

### Security & Compliance
- **Vulnerability Scanning**: Automated security audits
- **Secret Detection**: Credential scanning
- **Accessibility**: WCAG AA compliance
- **Browser Security**: Cross-platform validation

## 🔧 Manual Commands

If you prefer to run commands manually:

```bash
# 1. Stop existing services
docker-compose -f docker-compose.production-enhanced.yml down --remove-orphans

# 2. Remove old images
docker image rm disaster-response-dashboard:latest 2>/dev/null || true
docker image prune -f

# 3. Build new image
docker build -f Dockerfile.production -t disaster-response-dashboard:latest .

# 4. Start services
docker-compose -f docker-compose.production-enhanced.yml up -d

# 5. Run validation
docker-compose -f docker-compose.production-enhanced.yml exec validation-tests npm run test:smoke
```

## 📊 Monitoring & Validation

### Health Checks
- **Frontend**: http://localhost/health
- **Backend**: http://localhost:8000/api/health
- **Combined**: Both services must be healthy

### Test Results
- **Location**: `./test-results/`
- **Types**: Smoke, accessibility, performance, visual regression
- **Format**: JSON, HTML, screenshots

### Logs
- **Location**: `./logs/`
- **Services**: Frontend, backend, validation, monitoring
- **Format**: Structured JSON logs

## 🎯 Quality Metrics

### Performance Targets
- **Frontend Load**: < 3 seconds
- **Backend Response**: < 100ms
- **Map Load Time**: < 3 seconds
- **Frame Rate**: > 30 FPS
- **Memory Usage**: < 100MB

### Test Coverage
- **Unit Tests**: >90% coverage
- **E2E Tests**: All user workflows
- **Accessibility**: WCAG AA compliance
- **Visual Regression**: Cross-browser consistency
- **Chaos Testing**: 15+ failure scenarios

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check Docker is running
   docker info
   
   # Clean up and retry
   docker system prune -f
   ./scripts/rebuild-production.sh
   ```

2. **Services Won't Start**
   ```bash
   # Check logs
   docker-compose -f docker-compose.production-enhanced.yml logs
   
   # Check health
   curl http://localhost/health
   curl http://localhost:8000/api/health
   ```

3. **Tests Fail**
   ```bash
   # Run individual test suites
   docker-compose -f docker-compose.production-enhanced.yml exec validation-tests npm run test:smoke
   docker-compose -f docker-compose.production-enhanced.yml exec validation-tests npm run test:accessibility
   ```

4. **Performance Issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Monitor logs
   docker-compose -f docker-compose.production-enhanced.yml logs -f performance-monitor
   ```

### Debug Mode

To run in debug mode:

```bash
# Set debug environment
export VITE_DEBUG_MODE=true
export VITE_BUILD_ENV=development

# Rebuild with debug
./scripts/rebuild-production.sh
```

## 📈 Next Steps

After successful rebuild:

1. **Monitor Performance**: Check metrics and logs
2. **Run Full Tests**: Execute comprehensive test suite
3. **Security Scan**: Review vulnerability reports
4. **Accessibility Audit**: Verify WCAG compliance
5. **Load Testing**: Test under production load
6. **Documentation**: Update deployment docs

## 🎉 Success Indicators

You'll know the rebuild was successful when:

- ✅ All containers are running and healthy
- ✅ Frontend loads in < 3 seconds
- ✅ Backend responds in < 100ms
- ✅ All smoke tests pass
- ✅ Accessibility tests pass
- ✅ Performance tests meet budgets
- ✅ Visual regression tests pass
- ✅ No critical security vulnerabilities

## 📞 Support

If you encounter issues:

1. Check the logs: `./logs/`
2. Review test results: `./test-results/`
3. Run health checks: `curl http://localhost/health`
4. Check container status: `docker-compose ps`
5. Review this guide for troubleshooting steps

The enhanced production system now includes enterprise-grade testing, monitoring, and quality assurance capabilities! 🚀

