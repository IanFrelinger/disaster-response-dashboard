# Frontend Test Suite

This directory contains comprehensive tests for the disaster response dashboard frontend components.

## 🧪 Test Structure

```
src/__tests__/
├── __init__.py              # Test package initialization
├── setup.ts                 # Test setup and global mocks
├── test-utils.tsx           # Test utilities and custom renderers
├── components/
│   └── HazardMap.test.tsx   # Tests for HazardMap component
├── hooks/
│   └── useHazardData.test.ts # Tests for custom hooks
├── services/
│   └── api.test.ts          # Tests for API service layer
├── utils/
│   └── validation.test.ts   # Tests for utility functions
└── README.md               # This file
```

## 🚀 Quick Start

### Run All Tests
```bash
# Using the test runner script
cd frontend
node run-tests.js

# Using vitest directly
npm test

# With coverage
npm test -- --coverage
```

### Run Specific Test Categories
```bash
# Run only component tests
node run-tests.js components

# Run only hook tests
node run-tests.js hooks

# Run only service tests
node run-tests.js services

# Run only utility tests
node run-tests.js utils
```

### Run with Options
```bash
# Watch mode
node run-tests.js all --watch

# With coverage
node run-tests.js components --coverage

# Verbose output
node run-tests.js hooks --verbose

# Combine options
node run-tests.js all --watch --coverage --verbose
```

## 📋 Test Categories

### 1. Component Tests (`components/`)
Tests for React components:

- **HazardMap**: Tests for the main map visualization component
- **Rendering**: Tests for component rendering and display
- **Props**: Tests for prop handling and configuration
- **Interaction**: Tests for user interactions and events
- **Edge Cases**: Tests for error conditions and edge cases
- **Accessibility**: Tests for accessibility features

**Key Test Cases:**
- `test_renders_the_map_component`: Basic component rendering
- `test_displays_correct_number_of_hazard_zones`: Data display verification
- `test_calls_onLocationClick_when_map_is_clicked`: Interaction testing
- `test_handles_empty_hazard_zones_array`: Edge case handling

### 2. Hook Tests (`hooks/`)
Tests for custom React hooks:

- **useHazardData**: Tests for hazard data fetching and state management
- **useRiskAssessment**: Tests for risk assessment data fetching
- **Loading States**: Tests for loading state management
- **Error Handling**: Tests for error state management
- **Data Refetching**: Tests for data refresh functionality
- **Concurrent Requests**: Tests for multiple simultaneous API calls

**Key Test Cases:**
- `test_returns_initial_loading_state`: Initial state verification
- `test_loads_hazard_data_successfully`: Successful data loading
- `test_handles_API_errors_gracefully`: Error handling
- `test_refetches_data_when_refetch_is_called`: Data refresh

### 3. Service Tests (`services/`)
Tests for API service layer:

- **API Calls**: Tests for HTTP requests to backend
- **Response Handling**: Tests for API response processing
- **Error Handling**: Tests for network and API errors
- **Parameter Validation**: Tests for request parameter validation
- **Concurrent Requests**: Tests for multiple simultaneous requests
- **Response Validation**: Tests for response data validation

**Key Test Cases:**
- `test_fetches_hazard_zones_successfully`: Successful API calls
- `test_handles_API_errors`: Error handling
- `test_handles_network_errors`: Network error handling
- `test_handles_multiple_concurrent_API_calls`: Concurrent requests

### 4. Utility Tests (`utils/`)
Tests for utility functions and validation:

- **Coordinate Validation**: Tests for geographic coordinate validation
- **Data Validation**: Tests for data structure validation
- **Risk Level Validation**: Tests for risk level validation
- **Geometry Validation**: Tests for geometric data validation
- **Distance Calculation**: Tests for geographic distance calculations
- **Data Transformation**: Tests for data format transformations

**Key Test Cases:**
- `test_validates_valid_latitude_values`: Coordinate validation
- `test_validates_valid_risk_levels`: Risk level validation
- `test_calculates_distance_between_coordinates`: Distance calculation
- `test_validates_complete_hazard_zone_objects`: Object validation

## 🔧 Test Configuration

### Setup (`setup.ts`)
Global test configuration and mocks:

- **Environment Variables**: Mock environment variables
- **Map Libraries**: Mock mapbox-gl, react-map-gl, deck.gl
- **Geospatial Libraries**: Mock h3-js, @turf/turf
- **UI Libraries**: Mock lucide-react icons
- **HTTP Client**: Mock axios for API calls
- **Browser APIs**: Mock ResizeObserver, IntersectionObserver

### Test Utilities (`test-utils.tsx`)
Custom testing utilities:

- **Custom Renderer**: Enhanced render function with providers
- **Mock Data Generators**: Functions to generate test data
- **Event Simulators**: Functions to simulate user interactions
- **Async Helpers**: Utilities for async testing
- **API Mock Helpers**: Functions to mock API responses

### Mock Data
Comprehensive mock data for testing:

- `mockHazardZone()`: Hazard zone test data
- `mockSafeRoute()`: Safe route test data
- `mockRiskAssessment()`: Risk assessment test data
- `mockHazardSummary()`: Hazard summary test data

## 🎯 Testing Strategy

### 1. Component Testing
Each component is tested in isolation:

- **Rendering**: Verify components render correctly
- **Props**: Test prop handling and validation
- **State**: Test component state management
- **Events**: Test user interaction handling
- **Styling**: Test CSS class application
- **Accessibility**: Test ARIA attributes and keyboard navigation

### 2. Hook Testing
Custom hooks are tested with React Testing Library:

- **State Management**: Test state updates and side effects
- **API Integration**: Test data fetching and caching
- **Error Handling**: Test error state management
- **Performance**: Test hook performance characteristics
- **Dependencies**: Test hook dependency management

### 3. Service Testing
API services are tested with mocked HTTP calls:

- **Request Formation**: Test correct request URLs and parameters
- **Response Processing**: Test response data handling
- **Error Scenarios**: Test various error conditions
- **Authentication**: Test authentication handling
- **Rate Limiting**: Test rate limiting behavior

### 4. Utility Testing
Utility functions are tested with various inputs:

- **Valid Inputs**: Test with expected valid data
- **Invalid Inputs**: Test with malformed or invalid data
- **Edge Cases**: Test boundary conditions
- **Performance**: Test function performance
- **Type Safety**: Test TypeScript type safety

## 🚨 Error Handling

### Expected Failures
Tests verify proper error handling for:

- **Network Errors**: API call failures
- **Data Validation**: Invalid input data
- **Component Errors**: React component errors
- **Hook Errors**: Custom hook errors
- **Service Errors**: API service errors

### Error Recovery
Tests ensure graceful error recovery:

- **Fallback UI**: Display fallback content on errors
- **Error Boundaries**: React error boundary handling
- **Retry Logic**: Automatic retry mechanisms
- **User Feedback**: Clear error messages to users

## 📊 Test Metrics

### Coverage Goals
- **Line Coverage**: >90% for all frontend modules
- **Branch Coverage**: >85% for critical paths
- **Function Coverage**: 100% for public APIs
- **Component Coverage**: 100% for React components

### Performance Benchmarks
- **Test Execution**: <30 seconds for full test suite
- **Memory Usage**: <500MB peak during testing
- **Component Rendering**: <100ms for component tests
- **Hook Execution**: <50ms for hook tests

## 🔄 Continuous Integration

### Automated Testing
Tests are designed to run in CI/CD pipelines:

- **Fast Execution**: Optimized for CI time constraints
- **Deterministic Results**: Consistent test outcomes
- **Parallel Execution**: Support for parallel test execution
- **Clear Reporting**: Structured test output

### Test Environment
Tests run in isolated environments:

- **JSDOM**: Browser-like environment for component testing
- **Mock Dependencies**: External services mocked
- **Clean State**: Fresh test data for each run
- **Isolated Context**: No shared state between tests

## 🛠️ Debugging Tests

### Common Issues
1. **Mock Issues**: Check mock setup and return values
2. **Async Timing**: Use appropriate waitFor and timeouts
3. **Component Rendering**: Verify component props and state
4. **Event Handling**: Check event simulation and handlers

### Debug Commands
```bash
# Run single test with debug output
npm test -- --reporter=verbose HazardMap.test.tsx

# Run with detailed error reporting
npm test -- --reporter=verbose

# Run with coverage and show missing lines
npm test -- --coverage --reporter=verbose
```

## 📚 Best Practices

### Test Writing Guidelines
1. **Descriptive Names**: Use clear, descriptive test names
2. **Single Responsibility**: Each test should test one thing
3. **Arrange-Act-Assert**: Follow AAA pattern for test structure
4. **Meaningful Assertions**: Assert specific, meaningful conditions
5. **Clean Setup**: Use fixtures for test data setup

### Maintenance Guidelines
1. **Keep Tests Updated**: Update tests when code changes
2. **Review Coverage**: Regularly review coverage reports
3. **Refactor Tests**: Refactor tests for clarity and maintainability
4. **Document Changes**: Document test changes in commit messages

## 🎨 UI Testing

### Visual Testing
- **Component Rendering**: Test component visual output
- **Responsive Design**: Test component responsiveness
- **Theme Integration**: Test theme and styling
- **Accessibility**: Test accessibility features

### Interaction Testing
- **User Events**: Test click, hover, focus events
- **Form Handling**: Test form input and validation
- **Navigation**: Test routing and navigation
- **State Changes**: Test component state updates

---

**For questions about the test suite, refer to the main project documentation or contact the development team.** 