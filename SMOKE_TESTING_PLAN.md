# Smoke Testing Plan: TypeScript Frontend

## 🎯 Overview
Comprehensive smoke testing strategy to ensure the TypeScript frontend works correctly across all critical user paths and edge cases.

## 🧪 Testing Pyramid

### 1. Unit Tests (Foundation)
- **Coverage Target**: 100%
- **Tools**: Vitest + React Testing Library
- **Scope**: Individual components, hooks, utilities

### 2. Integration Tests (Component Interactions)
- **Coverage Target**: 90%
- **Tools**: Vitest + React Testing Library
- **Scope**: Component interactions, API integration

### 3. E2E Tests (User Workflows)
- **Coverage Target**: Critical paths only
- **Tools**: Playwright
- **Scope**: Complete user journeys

### 4. Smoke Tests (Production Readiness)
- **Coverage Target**: All critical features
- **Tools**: Playwright + Custom scripts
- **Scope**: Production deployment validation

## 📋 Smoke Test Scenarios

### Critical Path 1: Public Emergency Information
```typescript
describe('Public View Smoke Tests', () => {
  test('should load emergency information without errors', async ({ page }) => {
    await page.goto('/public')
    await expect(page.locator('body')).not.toHaveText('Error')
    await expect(page.locator('[data-testid="status-card"]')).toBeVisible()
  })

  test('should handle location check workflow', async ({ page }) => {
    await page.goto('/public')
    await page.fill('[data-testid="address-input"]', '123 Elm St')
    await page.click('[data-testid="check-status"]')
    await expect(page.locator('[data-testid="status-card"]')).toHaveText('EVACUATE NOW')
  })

  test('should update checklist progress', async ({ page }) => {
    await page.goto('/public')
    await page.click('[data-testid="checklist-item-1"]')
    await expect(page.locator('[data-testid="progress"]')).toHaveText('1/6')
  })

  test('should handle API failures gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('/api/dashboard', route => route.abort())
    await page.goto('/public')
    await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="fallback-content"]')).toBeVisible()
  })
})
```

### Critical Path 2: Field Response Operations
```typescript
describe('Field View Smoke Tests', () => {
  test('should load tactical map without errors', async ({ page }) => {
    await page.goto('/field')
    await expect(page.locator('[data-testid="tactical-map"]')).toBeVisible()
    await expect(page.locator('[data-testid="current-position"]')).toBeVisible()
  })

  test('should handle emergency alert workflow', async ({ page }) => {
    await page.goto('/field')
    await page.click('[data-testid="emergency-btn"]')
    await expect(page.locator('[data-testid="alert-confirmation"]')).toBeVisible()
  })

  test('should update resource status in real-time', async ({ page }) => {
    await page.goto('/field')
    await expect(page.locator('[data-testid="resource-status"]')).toBeVisible()
    // Wait for real-time update
    await page.waitForTimeout(2000)
    await expect(page.locator('[data-testid="resource-status"]')).not.toHaveText('Loading...')
  })

  test('should work offline', async ({ page }) => {
    await page.goto('/field')
    await page.context().setOffline(true)
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="tactical-map"]')).toBeVisible()
  })
})
```

### Critical Path 3: Command Center Operations
```typescript
describe('Command View Smoke Tests', () => {
  test('should load dashboard metrics without errors', async ({ page }) => {
    await page.goto('/command')
    await expect(page.locator('[data-testid="metrics-grid"]')).toBeVisible()
    await expect(page.locator('[data-testid="population-risk"]')).toBeVisible()
  })

  test('should handle evacuation order workflow', async ({ page }) => {
    await page.goto('/command')
    await page.click('[data-testid="evacuation-order-btn"]')
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible()
  })

  test('should update communication log in real-time', async ({ page }) => {
    await page.goto('/command')
    const initialLogCount = await page.locator('[data-testid="comm-entry"]').count()
    await page.waitForTimeout(5000)
    const updatedLogCount = await page.locator('[data-testid="comm-entry"]').count()
    expect(updatedLogCount).toBeGreaterThan(initialLogCount)
  })

  test('should handle resource allocation updates', async ({ page }) => {
    await page.goto('/command')
    await expect(page.locator('[data-testid="resource-table"]')).toBeVisible()
    await expect(page.locator('[data-testid="fire-engines"]')).toBeVisible()
  })
})
```

## 🔄 Automated Smoke Test Suite

### Pre-deployment Smoke Tests
```bash
#!/bin/bash
# scripts/smoke-test.sh

echo "🚀 Running Pre-deployment Smoke Tests"
echo "====================================="

# Start backend API
docker-compose up -d backend
sleep 10

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
sleep 10

# Run smoke tests
npm run test:smoke

# Check results
if [ $? -eq 0 ]; then
    echo "✅ All smoke tests passed"
    exit 0
else
    echo "❌ Smoke tests failed"
    exit 1
fi

# Cleanup
kill $FRONTEND_PID
cd ..
docker-compose down
```

### Continuous Integration Smoke Tests
```yaml
# .github/workflows/smoke-tests.yml
name: Smoke Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd frontend && npm ci
    
    - name: Start backend
      run: docker-compose up -d backend
    
    - name: Wait for backend
      run: sleep 15
    
    - name: Run smoke tests
      run: |
        cd frontend
        npm run test:smoke
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: smoke-test-results
        path: frontend/test-results/
```

## 📊 Performance Smoke Tests

### Load Testing
```typescript
// tests/smoke/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Smoke Tests', () => {
  test('should load public view within 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/public')
    await expect(page.locator('[data-testid="status-card"]')).toBeVisible()
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(2000)
  })

  test('should handle concurrent users', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ])
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    )
    
    await Promise.all(
      pages.map(page => page.goto('/public'))
    )
    
    await Promise.all(
      pages.map(page => 
        expect(page.locator('[data-testid="status-card"]')).toBeVisible()
      )
    )
    
    await Promise.all(contexts.map(context => context.close()))
  })
})
```

### Memory Leak Testing
```typescript
// tests/smoke/memory.spec.ts
test('should not have memory leaks during navigation', async ({ page }) => {
  const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0)
  
  // Navigate between views multiple times
  for (let i = 0; i < 10; i++) {
    await page.goto('/public')
    await page.goto('/field')
    await page.goto('/command')
  }
  
  const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0)
  const memoryIncrease = finalMemory - initialMemory
  
  // Memory increase should be less than 10MB
  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
})
```

## 🚨 Error Handling Smoke Tests

### Network Failure Scenarios
```typescript
test.describe('Network Failure Smoke Tests', () => {
  test('should handle API timeout', async ({ page }) => {
    await page.route('/api/dashboard', route => 
      route.fulfill({ status: 408, body: 'Timeout' })
    )
    await page.goto('/public')
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should handle malformed API response', async ({ page }) => {
    await page.route('/api/dashboard', route => 
      route.fulfill({ status: 200, body: 'Invalid JSON' })
    )
    await page.goto('/public')
    await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible()
  })

  test('should retry failed requests', async ({ page }) => {
    let requestCount = 0
    await page.route('/api/health', route => {
      requestCount++
      if (requestCount === 1) {
        route.abort()
      } else {
        route.fulfill({ status: 200, body: JSON.stringify({ status: 'healthy' }) })
      }
    })
    
    await page.goto('/public')
    await expect(page.locator('[data-testid="status-card"]')).toBeVisible()
  })
})
```

## 📱 Cross-Platform Smoke Tests

### Browser Compatibility
```typescript
test.describe('Cross-Browser Smoke Tests', () => {
  test('should work in Chrome', async ({ page }) => {
    await page.goto('/public')
    await expect(page.locator('[data-testid="status-card"]')).toBeVisible()
  })

  test('should work in Firefox', async ({ page }) => {
    await page.goto('/public')
    await expect(page.locator('[data-testid="status-card"]')).toBeVisible()
  })

  test('should work in Safari', async ({ page }) => {
    await page.goto('/public')
    await expect(page.locator('[data-testid="status-card"]')).toBeVisible()
  })
})
```

### Mobile Device Testing
```typescript
test.describe('Mobile Smoke Tests', () => {
  test('should work on mobile Chrome', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/field')
    await expect(page.locator('[data-testid="tactical-map"]')).toBeVisible()
  })

  test('should handle touch interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/field')
    await page.touchscreen.tap(200, 300)
    await expect(page.locator('[data-testid="map-interaction"]')).toBeVisible()
  })
})
```

## 🔍 Visual Regression Smoke Tests

### Screenshot Comparison
```typescript
test.describe('Visual Regression Smoke Tests', () => {
  test('public view should match baseline', async ({ page }) => {
    await page.goto('/public')
    await expect(page).toHaveScreenshot('public-view.png')
  })

  test('field view should match baseline', async ({ page }) => {
    await page.goto('/field')
    await expect(page).toHaveScreenshot('field-view.png')
  })

  test('command view should match baseline', async ({ page }) => {
    await page.goto('/command')
    await expect(page).toHaveScreenshot('command-view.png')
  })
})
```

## 📈 Smoke Test Metrics

### Success Criteria
- **Test Coverage**: 100% of critical paths
- **Pass Rate**: > 99% in CI/CD
- **Performance**: < 2s load time for all views
- **Reliability**: < 1% flaky tests
- **Accessibility**: WCAG 2.1 AA compliance

### Monitoring Dashboard
```typescript
// Smoke test results tracking
interface SmokeTestResults {
  timestamp: Date
  totalTests: number
  passedTests: number
  failedTests: number
  performanceMetrics: {
    averageLoadTime: number
    memoryUsage: number
    errorRate: number
  }
  browserCompatibility: {
    chrome: boolean
    firefox: boolean
    safari: boolean
  }
}
```

## 🚀 Implementation Timeline

### Week 1: Foundation
- [ ] Set up Playwright test framework
- [ ] Create basic smoke test structure
- [ ] Implement critical path tests

### Week 2: Coverage
- [ ] Add error handling tests
- [ ] Implement performance tests
- [ ] Create cross-browser tests

### Week 3: Automation
- [ ] Set up CI/CD pipeline
- [ ] Implement automated reporting
- [ ] Create monitoring dashboard

### Week 4: Optimization
- [ ] Optimize test performance
- [ ] Reduce flaky tests
- [ ] Implement visual regression testing

## 🎯 Success Metrics

### Immediate Goals
- [ ] 100% critical path coverage
- [ ] < 5 minute smoke test execution time
- [ ] Zero false positives in CI/CD

### Long-term Goals
- [ ] Automated smoke test deployment validation
- [ ] Real-time performance monitoring
- [ ] Predictive failure detection

This smoke testing plan ensures our TypeScript frontend is production-ready with comprehensive validation of all critical user workflows and edge cases.
