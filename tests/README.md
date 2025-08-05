# Backend Test Suite

This directory contains comprehensive tests for the disaster response dashboard backend components.

## 🧪 Test Structure

```
tests/
├── __init__.py              # Test package initialization
├── conftest.py              # Shared fixtures and configuration
├── test_ingestion.py        # Tests for data ingestion transforms
├── test_routing.py          # Tests for safe route calculation
├── test_compute_modules.py  # Tests for containerized compute modules
├── test_functions.py        # Tests for Foundry Functions API
├── test_sync_script.py      # Tests for Foundry sync script
└── README.md               # This file
```

## 🚀 Quick Start

### Run All Tests
```bash
# Using the test runner script
python run_tests.py

# Using pytest directly
pytest tests/

# With coverage
python run_tests.py --coverage
```

### Run Specific Test Suites
```bash
# Run only ingestion tests
python run_tests.py --suite ingestion

# Run only routing tests
python run_tests.py --suite routing

# Run only compute module tests
python run_tests.py --suite compute

# Run only API function tests
python run_tests.py --suite functions

# Run only sync script tests
python run_tests.py --suite sync
```

### Run Individual Test Files
```bash
# Run specific test file
python run_tests.py --path tests/test_ingestion.py

# Run with verbose output
python run_tests.py --path tests/test_routing.py --verbose
```

## 📋 Test Categories

### 1. Ingestion Tests (`test_ingestion.py`)
Tests for wildfire feed ingestion and processing:

- **Risk Score Computation**: Tests for multi-factor risk scoring
- **Temporal Analysis**: Tests for time-based risk assessment
- **Spatial Indexing**: Tests for H3 hexagonal grid indexing
- **Data Validation**: Tests for input data validation and error handling
- **Transform Functions**: Tests for Foundry transform decorators

**Key Test Cases:**
- `test_compute_risk_scores_basic`: Basic risk scoring functionality
- `test_compute_risk_scores_temporal_factor`: Time-based risk factors
- `test_compute_hazard_zones_transform`: Main transform function
- `test_compute_hazard_zones_h3_indexing`: Spatial indexing

### 2. Routing Tests (`test_routing.py`)
Tests for safe route calculation and path-finding:

- **Safe Route Calculator**: Tests for the main routing class
- **Network Loading**: Tests for OSM road network integration
- **Hazard Avoidance**: Tests for hazard-aware path finding
- **A* Algorithm**: Tests for path-finding algorithm implementation
- **Weight Calculation**: Tests for hazard proximity penalties

**Key Test Cases:**
- `test_safe_route_calculator_initialization`: Class initialization
- `test_compute_safe_route_success`: Successful route computation
- `test_apply_hazard_weights`: Hazard weight application
- `test_route_avoids_hazards`: Hazard avoidance verification

### 3. Compute Module Tests (`test_compute_modules.py`)
Tests for containerized compute tasks:

- **Risk Processor**: Tests for the main risk processing class
- **Configuration Management**: Tests for config file handling
- **Data Processing**: Tests for hazard data processing pipeline
- **Risk Factors**: Tests for temporal, spatial, and weather risk factors
- **Container Integration**: Tests for Docker container execution

**Key Test Cases:**
- `test_risk_processor_initialization`: Processor setup
- `test_process_hazard_data_basic`: Basic data processing
- `test_compute_temporal_risk`: Temporal risk computation
- `test_apply_risk_thresholds`: Risk threshold application

### 4. API Function Tests (`test_functions.py`)
Tests for Foundry Functions API endpoints:

- **Hazard Summary**: Tests for hazard summary generation
- **GeoJSON Generation**: Tests for spatial data serialization
- **Route Retrieval**: Tests for evacuation route endpoints
- **Risk Assessment**: Tests for location-based risk assessment
- **Error Handling**: Tests for API error scenarios

**Key Test Cases:**
- `test_get_hazard_summary`: Summary endpoint testing
- `test_get_hazard_zones_geojson`: GeoJSON generation
- `test_get_evacuation_routes_with_coordinates`: Route retrieval
- `test_get_risk_assessment_with_hazards`: Risk assessment

### 5. Sync Script Tests (`test_sync_script.py`)
Tests for Foundry synchronization script:

- **CLI Interface**: Tests for command-line interface
- **Repository Management**: Tests for repository operations
- **Error Handling**: Tests for sync error scenarios
- **Dry Run Mode**: Tests for preview functionality
- **Environment Support**: Tests for different environments

**Key Test Cases:**
- `test_sync_transforms_basic`: Basic sync functionality
- `test_sync_transforms_dry_run`: Dry run mode
- `test_list_repositories`: Repository listing
- `test_sync_transforms_error_handling`: Error scenarios

## 🔧 Test Configuration

### Shared Fixtures (`conftest.py`)
Common test data and mocks used across all test files:

- `sample_wildfire_data`: Sample wildfire feed data
- `sample_hazard_zones`: Sample hazard zone geometries
- `sample_safe_routes`: Sample evacuation routes
- `mock_foundry_client`: Mock Foundry client
- `mock_road_network`: Mock OSM road network
- `sample_risk_assessment`: Sample risk assessment data

### Test Markers
Pytest markers for test categorization:

- `@pytest.mark.slow`: Slow-running tests
- `@pytest.mark.integration`: Integration tests
- `@pytest.mark.unit`: Unit tests

### Coverage Configuration
Coverage is configured in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "--strict-markers",
    "--strict-config",
    "--verbose",
]
```

## 🎯 Testing Strategy

### 1. Unit Testing
Each component is tested in isolation with mocked dependencies:

- **Transforms**: Tested with mock input/output datasets
- **Functions**: Tested with mock Foundry datasets
- **Compute Modules**: Tested with mock configuration and data
- **Sync Script**: Tested with mock Foundry client

### 2. Integration Testing
End-to-end testing of component interactions:

- **Data Pipeline**: Test complete data flow from ingestion to API
- **Error Propagation**: Test error handling across components
- **Configuration Integration**: Test config file loading and validation

### 3. Edge Case Testing
Comprehensive testing of edge cases and error conditions:

- **Empty Data**: Test behavior with empty datasets
- **Invalid Input**: Test error handling for invalid data
- **Missing Columns**: Test graceful handling of missing data
- **Extreme Values**: Test behavior with extreme coordinate values

### 4. Performance Testing
Tests for performance characteristics:

- **Large Datasets**: Test with larger sample datasets
- **Memory Usage**: Monitor memory consumption
- **Processing Time**: Measure processing performance

## 🚨 Error Handling

### Expected Failures
Tests verify proper error handling for:

- **Network Errors**: OSM API failures
- **Data Validation**: Invalid input data
- **Configuration Errors**: Missing or invalid config files
- **Foundry Errors**: API failures and timeouts

### Error Recovery
Tests ensure graceful error recovery:

- **Partial Failures**: Continue processing when possible
- **Fallback Behavior**: Use default values when appropriate
- **Logging**: Proper error logging and reporting

## 📊 Test Metrics

### Coverage Goals
- **Line Coverage**: >90% for all backend modules
- **Branch Coverage**: >85% for critical paths
- **Function Coverage**: 100% for public APIs

### Performance Benchmarks
- **Test Execution**: <30 seconds for full test suite
- **Memory Usage**: <500MB peak during testing
- **API Response**: <2 seconds for API function tests

## 🔄 Continuous Integration

### Automated Testing
Tests are designed to run in CI/CD pipelines:

- **Dependency Isolation**: Minimal external dependencies
- **Deterministic Results**: Consistent test outcomes
- **Fast Execution**: Optimized for CI time constraints
- **Clear Reporting**: Structured test output

### Test Environment
Tests run in isolated environments:

- **Virtual Environment**: Python virtual environment
- **Mock Dependencies**: External services mocked
- **Clean State**: Fresh test data for each run
- **Parallel Execution**: Support for parallel test execution

## 🛠️ Debugging Tests

### Common Issues
1. **Import Errors**: Ensure virtual environment is activated
2. **Mock Issues**: Check mock setup and return values
3. **Geometry Errors**: Verify CRS and coordinate systems
4. **Timing Issues**: Use appropriate timeouts for async tests

### Debug Commands
```bash
# Run single test with debug output
pytest tests/test_ingestion.py::TestWildfireFeedIngestion::test_compute_risk_scores_basic -v -s

# Run with detailed error reporting
pytest tests/ --tb=long

# Run with coverage and show missing lines
pytest tests/ --cov=backend --cov-report=term-missing
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

---

**For questions about the test suite, refer to the main project documentation or contact the development team.** 