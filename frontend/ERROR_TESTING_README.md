# Error Testing Playbook - Disaster Response Dashboard

## Overview

This playbook implements a comprehensive error testing strategy that makes "potential errors" first-class, repeatable test fixtures across your entire pipeline. The goal is to ensure failures surface early and deterministically, rather than appearing as surprises in production.

## 🎯 Core Principles

1. **Fail-Fast**: Any client-side error becomes a test failure
2. **Fault Injection**: Deterministic, controlled error simulation
3. **Phase-Based Testing**: Systematic coverage across all TDD phases
4. **Comprehensive Coverage**: All error paths are tested, not just happy paths

## 🏗️ Architecture

### Error Catalog (`src/testing/error-catalog.ts`)
- **Single source of truth** for all possible fault types
- **Typed fault definitions** across all system boundaries
- **Phase-based categorization** for systematic testing
- **Severity levels** for prioritization

### Fault Injection System (`src/testing/fault-injection.ts`)
- **Global test API** (`window.__testFaults__`) during test builds
- **Category-based injection** (API, Map, Data, UI, Env, Perf, Integration)
- **Helper functions** for common fault scenarios
- **Automatic cleanup** between tests

### Fail-Fast Test Setup
- **Vitest**: Console errors and unhandled rejections fail tests
- **Playwright**: Page errors, console errors, and resource failures fail tests
- **Custom matchers** for fault injection validation

## 📋 Fault Categories

### API Layer Faults
- HTTP status codes (400, 401, 403, 404, 408, 409, 429, 500, 502, 503)
- Timeouts, invalid JSON, schema mismatches
- Network errors, CORS issues, rate limiting

### Map Layer Faults
- WebGL unavailability, style loading failures
- Tile errors, duplicate layer IDs, missing sprites
- Font loading failures, geolocation errors
- 3D terrain failures, building data corruption

### Data Layer Faults
- Invalid GeoJSON, degenerate geometry
- Coordinate out-of-range, extreme density
- Empty datasets, malformed features
- Type mismatches, circular references, memory overflow

### UI Layer Faults
- Unhandled promises, error boundary triggers
- Lazy chunk failures, i18n missing keys
- Component render failures, state corruption
- Event listener leaks, memory leaks, focus trap failures

### Environment Faults
- Missing Mapbox token, invalid API endpoints
- SSL certificate errors, feature flag mismatches
- Configuration corruption, missing environment variables

### Performance Faults
- Frame rate drops, memory spikes, CPU overload
- Network latency, render blocking, large bundle sizes

### Integration Faults
- Service discovery failures, circuit breaker triggers
- Fallback service unavailability, data sync conflicts
- Version mismatches, dependency resolution failures

## 🚀 Phase-Based Testing

### Phase 1: Foundation & Basic Functionality
**Goal**: App initializes sanely or fails loudly with friendly UI

```bash
npm run test:errors:phase1
```

**Tests**:
- Environment configuration faults
- WebGL and map initialization
- Basic network connectivity
- Component rendering failures

### Phase 2: Visual Effects & Styling
**Goal**: Style builders never create invalid styles; invalid inputs are rejected early

```bash
npm run test:errors:phase2
```

**Tests**:
- Map layer and style faults
- Data validation (GeoJSON, geometry)
- UI component styling failures
- Style builder validation

### Phase 3: Interactive Elements
**Goal**: Input chaos doesn't crash handlers; error boundaries work properly

```bash
npm run test:errors:phase3
```

**Tests**:
- Event handling faults
- Error boundary activation
- Map interaction failures
- Data type validation
- User input stress testing

### Phase 4: Advanced Integration & Performance
**Goal**: API + state sync failures are handled; backpressure works

```bash
npm run test:errors:phase4
```

**Tests**:
- HTTP API fault matrix
- API response faults (timeouts, invalid JSON)
- Performance degradation
- Integration service faults
- Offline and network scenarios

### Phase 5: Stress & Edge Cases
**Goal**: Extremes don't melt the UI; graceful degradation works

```bash
npm run test:errors:phase5
```

**Tests**:
- Data density and volume faults
- Advanced map faults
- Performance stress testing
- UI stress and recovery
- System resource limits
- Data validation edge cases

## 🛠️ Usage

### Running All Error Tests
```bash
# Run complete error testing playbook
npm run test:errors

# Run specific phase
npm run test:errors:phase1
npm run test:errors:phase2
npm run test:errors:phase3
npm run test:errors:phase4
npm run test:errors:phase5

# Run all phases sequentially
npm run test:errors:all
```

### Fault Injection in Unit Tests
```typescript
import { useFaultInjection } from '../testing/fault-injection';

test('handles API timeout gracefully', () => {
  // Inject API timeout fault
  useFaultInjection.api.injectTimeout();
  
  // Test that timeout is handled properly
  render(<ApiComponent />);
  expect(screen.getByText('Request timed out')).toBeInTheDocument();
});
```

### Fault Injection in Component Tests
```typescript
import { useFaultInjection } from '../testing/fault-injection';

test('shows fallback when WebGL unavailable', () => {
  // Inject WebGL unavailability fault
  useFaultInjection.map.injectWebglUnavailable();
  
  // Test fallback UI
  render(<MapComponent />);
  expect(screen.getByText('Map unavailable')).toBeInTheDocument();
});
```

### Fault Injection in Playwright Tests
```typescript
import { test, faultInjection, networkFaults } from '../tests/playwright-setup';

test('handles HTTP 503 error', async ({ page }) => {
  // Inject HTTP 503 fault
  await faultInjection.setFault(page, 'api', { kind: 'http', status: 503 });
  
  // Or use network fault injection
  await networkFaults.injectHttpError(page, '**/api/**', 503);
  
  // Navigate and verify error handling
  await page.goto('/');
  await expect(page.getByText('Service unavailable')).toBeVisible();
});
```

### Custom Fault Injection
```typescript
// Inject custom fault
window.__testFaults__?.setFault('api', { kind: 'custom-error', code: 'MY_ERROR' });

// Check if fault is active
if (window.__testFaults__?.config.api?.kind === 'custom-error') {
  // Handle custom error case
}

// Reset all faults
window.__testFaults__?.reset();
```

## 🔧 Implementation Examples

### API Client with Fault Injection
```typescript
class ApiClient {
  async request(url: string) {
    // Check for injected API faults
    if (window.__testFaults__?.config.api) {
      const fault = window.__testFaults__.config.api;
      
      if (fault.kind === 'timeout') {
        throw new Error('Request timeout');
      }
      
      if (fault.kind === 'http') {
        throw new HttpError(fault.status, `HTTP ${fault.status} error`);
      }
    }
    
    // Normal API request logic
    return fetch(url);
  }
}
```

### Map Provider with Fault Injection
```typescript
class MapProvider {
  addLayer(layer: Layer) {
    // Check for injected map faults
    if (window.__testFaults__?.config.map?.kind === 'duplicate-layer-id') {
      // Simulate duplicate layer ID error
      if (this.layers.has(layer.id)) {
        throw new Error('Duplicate layer ID');
      }
    }
    
    // Normal layer addition logic
    this.layers.set(layer.id, layer);
  }
}
```

### Error Boundary with Fault Injection
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    // Check for injected UI faults
    if (window.__testFaults__?.config.ui?.kind === 'error-boundary-trigger') {
      // Simulate error boundary behavior
      this.setState({ hasError: true, error });
    }
  }
}
```

## 📊 Test Coverage

### Required Coverage Thresholds
- **Error paths**: 100% coverage required
- **Catch blocks**: All must be tested
- **Error boundaries**: All components wrapped
- **Fallback UI**: All error states have user-friendly messages

### Coverage Tags
```typescript
// Tag critical error handling code
try {
  // @error-path
  riskyOperation();
} catch (error) {
  // @error-path
  handleError(error);
}
```

### Mutation Testing
Consider using StrykerJS to ensure error handling code is actually effective:
```bash
npm install --save-dev @stryker-mutator/core
npx stryker run
```

## 🚨 Fail-Fast Configuration

### Vitest Configuration
```typescript
// src/test-setup.ts
beforeAll(() => {
  // Capture console errors
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    consoleErrors.push(args.join(' '));
  });
  
  // Capture unhandled rejections
  process.on('unhandledRejection', (reason) => {
    unhandledRejections.push(reason);
  });
});

afterEach(() => {
  // FAIL-FAST: Throw error if any console errors occurred
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors during test:\n${consoleErrors.join('\n')}`);
  }
  
  // FAIL-FAST: Throw error if any unhandled rejections occurred
  if (unhandledRejections.length > 0) {
    throw new Error(`Unhandled rejections during test:\n${unhandledRejections.join('\n')}`);
  }
});
```

### Playwright Configuration
```typescript
// tests/playwright-setup.ts
export const test = base.extend({
  page: async ({ page }, use) => {
    // FAIL-FAST: Fail test on console errors
    page.on('console', (message) => {
      if (message.type() === 'error') {
        throw new Error(`Console error: ${message.text()}`);
      }
    });
    
    // FAIL-FAST: Fail test on page errors
    page.on('pageerror', (error) => {
      throw new Error(`Page error: ${error.message}`);
    });
    
    await use(page);
  }
});
```

## 🔍 Debugging Fault Injection

### Enable Debug Logging
```typescript
// Set environment variable for debug output
process.env.DEBUG_FAULT_INJECTION = 'true';
```

### Check Active Faults
```typescript
// In browser console or test
console.log('Active faults:', window.__testFaults__?.getActiveFaults());

// In Playwright test
const activeFaults = await faultInjection.getActiveFaults(page);
console.log('Active faults:', activeFaults);
```

### Fault Injection State
```typescript
// Check specific fault category
if (window.__testFaults__?.hasApiFault()) {
  console.log('API fault active:', window.__testFaults__?.getApiFault());
}

// Reset specific category
window.__testFaults__?.setFault('api', null);
```

## 📈 Continuous Integration

### CI Pipeline Integration
```yaml
# .github/workflows/error-testing.yml
name: Error Testing
on: [push, pull_request]

jobs:
  error-testing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run error testing playbook
        run: npm run test:errors
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: error-test-results
          path: test-results/
```

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:errors:phase1 && npm run test:errors:phase2"
    }
  }
}
```

## 🎯 Best Practices

### 1. Test Error Paths, Not Just Happy Paths
```typescript
// ❌ Don't just test success
test('loads data successfully', async () => {
  const data = await loadData();
  expect(data).toBeDefined();
});

// ✅ Also test error scenarios
test('handles data loading failure', async () => {
  useFaultInjection.api.injectHttpError(500);
  
  await expect(loadData()).rejects.toThrow('Failed to load data');
});
```

### 2. Use Fault Injection for Deterministic Testing
```typescript
// ❌ Don't rely on external failures
test('handles network timeout', async () => {
  // This might not always timeout
  await expect(slowRequest()).rejects.toThrow();
});

// ✅ Use fault injection for consistent behavior
test('handles network timeout', async () => {
  useFaultInjection.api.injectTimeout();
  
  await expect(slowRequest()).rejects.toThrow('Request timeout');
});
```

### 3. Test Error Recovery
```typescript
test('recovers from error boundary', async () => {
  // Trigger error
  useFaultInjection.ui.injectErrorBoundary();
  render(<ComponentWithError />);
  
  // Verify error state
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  
  // Test recovery
  fireEvent.click(screen.getByText('Try again'));
  expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
});
```

### 4. Test Performance Under Error Conditions
```typescript
test('maintains performance under memory pressure', async () => {
  useFaultInjection.perf.injectMemoryPressure();
  
  const startTime = performance.now();
  render(<HeavyComponent />);
  const renderTime = performance.now() - startTime;
  
  // Should still render within acceptable time
  expect(renderTime).toBeLessThan(1000);
});
```

## 🔮 Future Enhancements

### 1. Automated Error Scenario Generation
- Use property-based testing (fast-check) for data fault generation
- Automatically generate edge cases for coordinates and geometry
- Create stress test scenarios with varying data densities

### 2. Error Pattern Analysis
- Track common error patterns across test runs
- Identify error handling gaps automatically
- Generate error handling recommendations

### 3. Performance Regression Testing
- Baseline performance under normal conditions
- Track performance degradation under error conditions
- Alert on significant performance regressions

### 4. Error Boundary Coverage Analysis
- Track which components are wrapped in error boundaries
- Identify components that need error boundary protection
- Measure error boundary effectiveness

## 📚 Additional Resources

- [Error Testing Playbook Original](docs/ERROR_TESTING_PLAYBOOK.md)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## 🤝 Contributing

When adding new error scenarios:

1. **Add to error catalog** with proper typing
2. **Implement fault injection** for the new scenario
3. **Add tests** for all phases where applicable
4. **Update documentation** with examples
5. **Ensure fail-fast behavior** works correctly

## 📞 Support

For questions about the error testing system:

1. Check the error catalog for available fault types
2. Review existing test examples
3. Consult the phase-based testing strategy
4. Use the debugging tools for fault injection issues

---

**Remember**: The goal is to make errors predictable, testable, and manageable. With this system, "potential errors" become first-class citizens in your testing strategy, ensuring robust error handling across your entire application.
