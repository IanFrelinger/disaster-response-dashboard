# Map Validation Tests - Anti-Flashing and Stability

## Overview

This document describes the comprehensive map validation test suite designed to catch and prevent map flashing, excessive re-rendering, and performance issues in the `Mapbox3DTerrain` component.

## 🎯 Purpose

The map validation tests were created to address the specific issue where the map was flashing/flickering due to:
- Excessive re-renders from data fusion service updates
- Unstable useEffect dependencies causing map re-initialization
- Rapid successive updates without proper debouncing
- Memory leaks from rapid state changes

## 🧪 Test Suites

### 1. Map Stability Tests (`map-stability.test.tsx`)

**Purpose**: Ensures the map component maintains visual stability during data updates.

**Key Tests**:
- **Re-render Prevention**: Tracks render counts to detect excessive re-renders
- **Map Instance Stability**: Ensures map isn't re-created unnecessarily
- **Container Dimension Consistency**: Validates stable container sizing
- **Event Listener Stability**: Prevents excessive event binding/unbinding

**What It Catches**:
- Map flashing due to rapid re-renders
- Unnecessary map re-initialization
- Visual glitches from unstable containers
- Memory leaks from event handling

### 2. Map Performance Tests (`map-performance.test.tsx`)

**Purpose**: Validates performance benchmarks and prevents performance regressions.

**Key Tests**:
- **Render Time Budgets**: Ensures initial render completes within 500ms
- **Prop Change Efficiency**: Validates prop changes complete within 50ms
- **Performance Consistency**: Prevents performance degradation over time
- **Large Dataset Handling**: Tests performance with 100+ data points
- **Memory Leak Prevention**: Detects memory issues during rapid updates

**What It Catches**:
- Performance regressions
- Memory leaks from rapid updates
- UI responsiveness issues
- Excessive processing during updates

### 3. Map Validation Tests (`map-validation.test.tsx`)

**Purpose**: Comprehensive validation of the specific fixes implemented for map flashing.

**Key Tests**:
- **Anti-Flashing Validation**: Specifically tests scenarios that caused flashing
- **Debouncing Verification**: Ensures rapid updates are properly debounced
- **Visual State Consistency**: Maintains stable visual appearance
- **Cascading Loop Prevention**: Detects infinite re-render loops
- **Smooth Transitions**: Validates smooth state changes

**What It Catches**:
- The exact flashing scenarios we fixed
- Re-render loops
- Visual inconsistencies
- Performance bottlenecks

## 🚀 Running the Tests

### Quick Validation
```bash
# Run all map validation tests
make test-map

# Or use the dedicated script
./scripts/validate-map-stability.sh
```

### Individual Test Suites
```bash
cd frontend

# Map stability tests
npm run test:map-stability

# Map performance tests  
npm run test:map-performance

# Comprehensive validation tests
npm run test:map-validation
```

### CI/CD Integration
```bash
# Run full CI/CD pipeline including map validation
make cicd

# Run just the test suite
make test
```

## 🔍 What the Tests Validate

### ✅ Anti-Flashing Measures
- **Debounced Updates**: 300ms debounce on map layer updates
- **Stable Map Instance**: Map only initializes once
- **Memoized Data**: Prevents unnecessary re-renders
- **Change Detection**: Only updates when data actually changes

### ✅ Performance Benchmarks
- **Initial Render**: < 500ms
- **Prop Changes**: < 50ms
- **Data Updates**: < 50ms
- **Style Changes**: < 100ms

### ✅ Stability Metrics
- **Re-render Count**: Linear growth, not exponential
- **Memory Usage**: No leaks during rapid updates
- **Visual Consistency**: Stable container dimensions
- **Event Handling**: Stable event listeners

## 🛠️ Test Configuration

### Test Environment
- **Framework**: Vitest with jsdom
- **Mocking**: Comprehensive mocks for Mapbox GL JS, data fusion service
- **Performance**: Mocked performance API for consistent timing
- **Data Simulation**: Dynamic mock data that changes between renders

### Test Setup
```typescript
// Mock data fusion service with changing data
let mockDataCounter = 0;
const createMockData = () => ({
  hazards: { /* ... */ },
  units: { /* ... */ },
  routes: { /* ... */ }
});

vi.mock('../../services/foundryDataFusion', () => ({
  useDataFusion: vi.fn(() => {
    mockDataCounter++;
    return createMockData();
  }),
}));
```

## 📊 Test Results Interpretation

### ✅ Passing Tests
- Map renders without flashing
- Performance benchmarks met
- No memory leaks detected
- Stable visual state maintained

### ❌ Failing Tests
- **Excessive Re-renders**: Render count too high
- **Performance Issues**: Benchmarks not met
- **Memory Leaks**: Console errors or warnings
- **Visual Glitches**: Container instability

### 🔧 Common Issues and Fixes

#### Issue: High Render Count
**Symptoms**: Test fails with "Should not have excessive re-renders"
**Causes**: Unstable useEffect dependencies, missing memoization
**Fixes**: 
- Add `useMemo` for expensive calculations
- Stabilize `useCallback` dependencies
- Remove unnecessary state updates

#### Issue: Performance Regression
**Symptoms**: Test fails with "Should complete within Xms"
**Causes**: Expensive operations in render, missing optimizations
**Fixes**:
- Move heavy operations to `useEffect`
- Implement proper debouncing
- Add performance optimizations

#### Issue: Memory Leaks
**Symptoms**: Test fails with "Should not see memory-related errors"
**Causes**: Missing cleanup, event listener leaks
**Fixes**:
- Add proper cleanup in `useEffect` return
- Remove event listeners on unmount
- Clear timers and intervals

## 🔄 Continuous Integration

### CI/CD Pipeline
The map validation tests are integrated into the localhost CI/CD pipeline:

1. **Backend Tests**: Core functionality validation
2. **Frontend Tests**: Basic React functionality
3. **Map Validation Tests**: Anti-flashing and stability validation
4. **Build & Deploy**: Production container creation

### Automated Validation
```yaml
# docker-compose.ci.yml
test-runner:
  command: npm run test:map-validation
  profiles: [ci]
```

### Pre-commit Validation
```bash
# Run before committing changes
make validate-map

# Or run the full validation suite
make validate-all
```

## 📈 Monitoring and Maintenance

### Regular Validation
- **Daily**: Run `make test-map` during development
- **Pre-deploy**: Full validation before production deployment
- **CI/CD**: Automatic validation on every pipeline run

### Performance Tracking
- Monitor render time trends
- Track memory usage patterns
- Alert on performance regressions

### Test Maintenance
- Update benchmarks as performance improves
- Add new test cases for discovered issues
- Maintain mock data relevance

## 🎯 Success Criteria

A successful map validation run means:

1. **No Flashing**: Map renders smoothly without visual disruption
2. **Stable Performance**: All benchmarks met consistently
3. **Memory Safe**: No leaks or excessive resource usage
4. **Visual Consistency**: Stable appearance during updates
5. **Responsive UI**: Smooth interactions and transitions

## 🚨 Troubleshooting

### Test Failures
1. **Check render counts**: Look for excessive re-renders
2. **Verify performance**: Ensure benchmarks are met
3. **Inspect console**: Look for errors or warnings
4. **Review dependencies**: Check useEffect and useCallback stability

### Common Fixes
1. **Add memoization**: Use `useMemo` for expensive operations
2. **Stabilize callbacks**: Fix `useCallback` dependencies
3. **Implement debouncing**: Add proper update throttling
4. **Clean up resources**: Add proper cleanup functions

## 📚 Related Documentation

- [CI/CD Setup Guide](./CI-CD-SETUP.md)
- [Frontend Testing Guide](./FRONTEND-TESTING.md)
- [Performance Optimization Guide](./PERFORMANCE-OPTIMIZATION.md)
- [Map Component Architecture](./MAP-ARCHITECTURE.md)

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: Development Team

