# Testing Strategy: Layered Testing Pyramid

This document outlines the comprehensive testing strategy implemented to transform the E2E-heavy testing approach into a fast, maintainable, and reliable testing pyramid.

## Overview

The new testing strategy follows the **Testing Pyramid** principle:
- **60% Unit Tests** - Fast, focused, no browser
- **25% Component Tests** - Fast, isolated, with FakeMapProvider
- **10% Integration Tests** - Browser-based, network-mocked
- **5% E2E Tests** - Full browser, real scenarios, performance testing

## Key Benefits

1. **Speed**: Unit tests run in milliseconds, component tests in seconds
2. **Reliability**: Eliminates flaky E2E tests through deterministic APIs
3. **Maintainability**: Clear separation of concerns and test responsibilities
4. **Developer Experience**: Fast feedback loop for development
5. **CI Efficiency**: Stratified test runs (fast on PR, full on nightly)

## Architecture Components

### 1. MapProvider Abstraction

The `MapProvider` interface abstracts map functionality, allowing:
- **Production**: Real Mapbox implementation
- **Testing**: Fake implementation with in-memory storage

```typescript
export interface MapHandle {
  on(event: string, cb: (...args: any[]) => void): void;
  addSource(id: string, src: any): void;
  addLayer(layer: any): void;
  getStyle(): any;
  getLayer(id: string): any;
  // ... more methods
}

export interface MapProvider {
  create(container: HTMLElement, options: any): MapHandle;
}
```

### 2. Test API (`window.__mapTestApi__`)

Exposes deterministic testing hooks:
```typescript
window.__mapTestApi__ = {
  ready: () => boolean,
  layers: () => string[],
  hasLayer: (id: string) => boolean,
  sources: () => string[],
  hasSource: (id: string) => boolean,
  getMapHandle: () => MapHandle
};
```

### 3. Scenario Builder

Generates consistent test data:
```typescript
const scenario = new ScenarioBuilder(42) // Fixed seed
  .withWaypoint('start', 'start', [-122.4194, 37.7749])
  .withRoute('evac', [[-122.4194, 37.7749], [-122.4083, 37.7879]])
  .withBuilding('hq', [-122.4194, 37.7749], 50)
  .freeze();
```

### 4. Network Mocking (MSW)

- **Unit/Component**: MSW Node for API mocking
- **Integration/E2E**: Playwright route interception
- **Fixtures**: Shared test data across all test levels

## Test Structure

### Unit Tests (`src/utils/__tests__/`)

**Purpose**: Test pure functions and utilities
**Tools**: Vitest + JSDOM
**Speed**: Milliseconds
**Examples**:
- Scenario Builder logic
- Geometry calculations
- Color/opacity rules
- Data transformations

```bash
npm run test:unit        # Run once
npm run test:unit:watch  # Watch mode
```

### Component Tests (`src/components/__tests__/`)

**Purpose**: Test React components in isolation
**Tools**: Vitest + React Testing Library + FakeMapProvider
**Speed**: Seconds
**Examples**:
- Component rendering
- Props handling
- Event interactions
- Map layer/source creation

```bash
npm run test:ct          # Playwright Component Testing
```

### Integration Tests (`tests/integration/`)

**Purpose**: Test component interactions and wiring
**Tools**: Playwright + Network mocking
**Speed**: 10-30 seconds
**Examples**:
- Map feature integration
- API interactions
- State management
- Error handling

```bash
npm run test:int         # Run integration tests
```

### E2E Tests (`tests/e2e/`)

**Purpose**: End-to-end user workflows
**Tools**: Playwright + Full browser
**Speed**: 30 seconds - 2 minutes
**Examples**:
- Complete user journeys
- Cross-browser compatibility
- Performance testing
- Visual regression

```bash
npm run test:e2e:smoke  # Fast smoke tests
npm run test:e2e:full   # Full E2E suite
```

## Test Scripts

### Development Workflow

```bash
# Fast feedback loop (on save/commit)
npm run test:fast        # Unit + Component + Smoke E2E

# Watch mode for development
npm run test:unit:watch  # Unit tests in watch mode
npm run test:ct          # Component tests with UI
```

### CI Pipeline

```bash
# Pull Request (fast)
npm run test:ci          # Unit + Integration + Smoke E2E

# Nightly (comprehensive)
npm run test:nightly     # Full E2E suite + Performance
```

### Legacy Support

```bash
# Existing scripts still work
npm run test:3d-terrain:phase1
npm run test:3d-terrain:all
npm run smoke-test
```

## Test Data Management

### Fixtures (`fixtures/scenarios/`)

- **simple.json**: Basic test scenario
- **evacuation.json**: Evacuation workflow
- **custom.json**: Generated scenarios

### Scenario Builder

```typescript
import { scenarios } from '@/utils/ScenarioBuilder';

// Pre-built scenarios
const simple = scenarios.simple();
const evacuation = scenarios.evacuation();
const multiHazard = scenarios.multiHazard();

// Custom scenarios
const custom = scenarios.custom(123)
  .withWaypoint('custom', 'start', [0, 0])
  .freeze();
```

## Network Isolation

### MSW Setup

```typescript
// src/mocks/handlers.ts
export const mapboxHandlers = [
  http.get('**/v1/directions/**', () => {
    return HttpResponse.json(mockDirections);
  })
];

// src/mocks/node.ts
export const server = setupServer(...handlers);
```

### Playwright Route Interception

```typescript
await page.route('**/v1/directions/**', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify(mockDirections)
  });
});
```

## Performance Testing

### Test Budgets

- **Unit Tests**: < 100ms total
- **Component Tests**: < 5s per test
- **Integration Tests**: < 30s per test
- **E2E Tests**: < 2min per test

### Performance Markers

```typescript
// In tests
performance.mark('map-ready-start');
await page.waitForFunction(() => window.__mapReady);
performance.mark('map-ready-end');

const measure = performance.measure('map-ready', 'map-ready-start', 'map-ready-end');
expect(measure.duration).toBeLessThan(5000); // 5s budget
```

## Debugging and Troubleshooting

### Common Issues

1. **Test API not available**: Check `NODE_ENV=test`
2. **Network requests failing**: Verify MSW setup
3. **Map not loading**: Check FakeMapProvider implementation
4. **Flaky tests**: Use deterministic seeds and wait for `__mapReady`

### Debug Commands

```bash
# Run tests with verbose output
npm run test:unit -- --reporter=verbose

# Debug specific test
npm run test:unit -- --grep="ScenarioBuilder"

# Run tests with UI
npm run test:ui
npm run test:ct
```

### Test Environment Variables

```bash
# Enable test mode
NODE_ENV=test

# Enable test API
VITE_ENABLE_TEST_API=true

# Set test seed for deterministic results
VITEST_SEED=42
```

## Migration Guide

### From Old E2E Tests

1. **Extract logic** into unit tests
2. **Use FakeMapProvider** for component tests
3. **Mock network calls** with MSW
4. **Replace visual assertions** with test API calls

### Example Migration

**Before (E2E)**:
```typescript
await page.waitForSelector('.simple-mapbox-test');
await page.screenshot({ path: 'map-loaded.png' });
```

**After (Component Test)**:
```typescript
render(<SimpleMapboxTest />);
const mapHandle = screen.getByTestId('map-container');
expect(mapHandle).toBeInTheDocument();
```

**After (Integration Test)**:
```typescript
await page.waitForFunction(() => window.__mapReady);
const layers = await page.evaluate(() => window.__mapTestApi__.layers());
expect(layers).toContain('route-line-primary');
```

## Best Practices

### Test Organization

1. **Group by feature**, not by test type
2. **Use descriptive test names** that explain the scenario
3. **Keep tests independent** and isolated
4. **Use test data builders** for complex scenarios

### Performance

1. **Mock heavy operations** (network, file I/O)
2. **Use deterministic data** with fixed seeds
3. **Avoid unnecessary waits** - use test APIs
4. **Batch assertions** when possible

### Maintainability

1. **Extract common test utilities**
2. **Use consistent naming conventions**
3. **Document complex test scenarios**
4. **Regular test cleanup and refactoring**

## Future Enhancements

### Planned Features

1. **Visual Regression Testing**: Golden screenshots with budgets
2. **Contract Testing**: OpenAPI validation between frontend/backend
3. **Performance Budgets**: Automated performance regression detection
4. **Test Analytics**: Coverage and performance metrics

### Integration Opportunities

1. **GitHub Actions**: Stratified CI pipeline
2. **Code Coverage**: Automated coverage reporting
3. **Test Reporting**: Rich test result visualization
4. **Performance Monitoring**: Continuous performance tracking

## Conclusion

This testing strategy transforms the development experience from slow, flaky E2E tests to a fast, reliable, and maintainable testing pyramid. The key is leveraging the right tool for each testing need:

- **Unit tests** for logic and calculations
- **Component tests** for UI behavior
- **Integration tests** for feature workflows
- **E2E tests** for user journeys and performance

By implementing this strategy, developers get:
- **Faster feedback** during development
- **More reliable tests** with fewer flaky failures
- **Better debugging** through deterministic test APIs
- **Improved CI efficiency** with stratified test runs

The investment in this testing infrastructure pays dividends in development velocity, code quality, and team confidence.

