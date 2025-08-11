# API Setup and Testing Guide

## Overview

This guide provides comprehensive instructions for setting up and testing the Disaster Response Dashboard API. The API provides real-time access to disaster data, hazard zones, evacuation routes, and emergency response metrics.

## Quick Start

### Option 1: Simple Test (Recommended for first run)

The simplest way to test the API is using the curl-based test script that requires no additional dependencies:

```bash
./scripts/simple_api_test.sh
```

This will:
- Start a mock API server using only Python standard library
- Test all major endpoints
- Validate JSON responses
- Check performance
- Clean up automatically

### Option 2: Minimal Python Test

For a more comprehensive test with Python:

```bash
./scripts/test-api.sh --minimal
```

This requires the `requests` module to be installed.

### Option 3: Full Setup and Testing

For complete setup with all dependencies:

```bash
./scripts/test-api.sh
```

This will:
- Set up a Python virtual environment
- Install all required dependencies
- Start the full API server
- Run comprehensive tests

## API Endpoints

The API provides the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/info` | GET | API information |
| `/api/dashboard` | GET | Complete dashboard data |
| `/api/hazards` | GET | Hazard zones data |
| `/api/routes` | GET | Safe evacuation routes |
| `/api/hazard-summary` | GET | Hazard summary statistics |
| `/api/evacuation-routes` | GET | Detailed evacuation routes |
| `/api/risk-assessment` | GET | Risk assessment for location |

### Example Usage

```bash
# Health check
curl http://localhost:8000/api/health

# Dashboard data
curl http://localhost:8000/api/dashboard

# Hazards with count parameter
curl "http://localhost:8000/api/hazards?count=5"

# Risk assessment for specific location
curl "http://localhost:8000/api/risk-assessment?lat=37.7749&lng=-122.4194"
```

## Testing Scripts

### 1. Simple API Test (`scripts/simple_api_test.sh`)

**Requirements:** curl, jq (optional)
**Dependencies:** None (uses Python standard library)

This is the recommended starting point. It uses a mock API server that doesn't require any external dependencies.

**Features:**
- ✅ No Python dependencies required
- ✅ Uses curl for HTTP requests
- ✅ Validates JSON responses
- ✅ Performance testing
- ✅ Automatic cleanup

**Usage:**
```bash
./scripts/simple_api_test.sh
```

### 2. Minimal API Test (`scripts/minimal_api_test.py`)

**Requirements:** Python 3.8+, requests module
**Dependencies:** requests

A Python-based test that requires minimal dependencies.

**Features:**
- ✅ Minimal Python dependencies
- ✅ Comprehensive endpoint testing
- ✅ Performance analysis
- ✅ Automatic server management

**Usage:**
```bash
python3 scripts/minimal_api_test.py
```

### 3. Comprehensive Setup (`scripts/setup_and_test_api.py`)

**Requirements:** Python 3.8+, all dependencies in requirements.txt
**Dependencies:** Flask, pandas, numpy, h3, shapely, etc.

Full setup and testing with all features.

**Features:**
- ✅ Complete environment setup
- ✅ Virtual environment creation
- ✅ All dependency installation
- ✅ Layer-by-layer testing
- ✅ Full API functionality

**Usage:**
```bash
python3 scripts/setup_and_test_api.py
```

### 4. Quick API Test (`scripts/quick_api_test.py`)

**Requirements:** Python 3.8+, requests module
**Dependencies:** requests

Quick test for when the API is already running.

**Features:**
- ✅ Fast testing
- ✅ No server startup
- ✅ Basic validation

**Usage:**
```bash
python3 scripts/quick_api_test.py
```

## API Server Options

### 1. Mock API Server (`scripts/mock_api_server.py`)

**Requirements:** Python 3.8+ (standard library only)
**Features:**
- ✅ No external dependencies
- ✅ Realistic mock data
- ✅ All major endpoints
- ✅ CORS support
- ✅ JSON responses

**Usage:**
```bash
python3 scripts/mock_api_server.py
```

### 2. Full API Server (`backend/run_synthetic_api.py`)

**Requirements:** All dependencies in requirements.txt
**Features:**
- ✅ Full Flask application
- ✅ Advanced data processing
- ✅ Real synthetic data generation
- ✅ Complete API functionality

**Usage:**
```bash
cd backend
python3 run_synthetic_api.py
```

## Testing Approaches

### Layer-by-Layer Testing

The comprehensive setup follows a layer-by-layer approach to ensure no errors:

1. **Layer 1: System Prerequisites**
   - Python version check
   - Project structure validation
   - Docker availability check

2. **Layer 2: Python Environment Setup**
   - Virtual environment creation
   - Dependency installation
   - Environment configuration

3. **Layer 3: Configuration Validation**
   - Configuration file validation
   - Environment variable setup
   - Settings verification

4. **Layer 4: Import Validation**
   - Core library imports
   - API module imports
   - Utility module imports

5. **Layer 5: Data Generation Test**
   - Synthetic data generation
   - Hazard zones creation
   - Route generation

6. **Layer 6: Server Startup**
   - API server initialization
   - Health check validation
   - Service readiness

7. **Layer 7: Endpoint Testing**
   - All API endpoints
   - Response validation
   - Error handling

8. **Layer 8: Functionality Testing**
   - Data completeness
   - Parameter handling
   - Business logic

9. **Layer 9: Performance Testing**
   - Response times
   - Concurrent requests
   - Load testing

### Response Validation

All tests validate:

- **HTTP Status Codes:** 200 for success
- **JSON Structure:** Valid JSON responses
- **Success Field:** Presence of `success: true`
- **Data Completeness:** Required fields present
- **Performance:** Response times under thresholds

## Troubleshooting

### Common Issues

1. **Port 8000 Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000
   
   # Kill the process if needed
   kill -9 <PID>
   ```

2. **Python Dependencies Missing**
   ```bash
   # Install requests for minimal testing
   pip install requests
   
   # Or use the simple test that requires no dependencies
   ./scripts/simple_api_test.sh
   ```

3. **Permission Denied**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   ```

4. **API Server Won't Start**
   ```bash
   # Check if the server file exists
   ls -la scripts/mock_api_server.py
   
   # Try running it directly
   python3 scripts/mock_api_server.py
   ```

### Debug Mode

For debugging, you can run the mock server directly:

```bash
python3 scripts/mock_api_server.py
```

This will show detailed server logs and help identify issues.

## Integration with Frontend

Once the API is tested and working, the frontend can connect to it:

1. **Set API Base URL:** Configure frontend to use `http://localhost:8000`
2. **Test Endpoints:** Verify all required endpoints are accessible
3. **CORS:** Ensure CORS is enabled for frontend integration
4. **Error Handling:** Implement proper error handling for API failures

## Production Deployment

For production deployment:

1. **Use Full API Server:** Switch from mock to full API server
2. **Environment Variables:** Configure production settings
3. **Security:** Implement authentication and authorization
4. **Monitoring:** Add health checks and logging
5. **Scaling:** Consider load balancing and caching

## API Documentation

For detailed API documentation, see:
- [API Documentation](API_DOCUMENTATION.md)
- [Endpoint Reference](API_DOCUMENTATION.md#endpoints)
- [Response Formats](API_DOCUMENTATION.md#response-format)

## Next Steps

After successful API testing:

1. **Frontend Integration:** Connect frontend to the API
2. **Data Sources:** Integrate real data sources
3. **Authentication:** Add user authentication
4. **Monitoring:** Implement API monitoring
5. **Deployment:** Deploy to production environment

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the error messages carefully
3. Try the simple test first: `./scripts/simple_api_test.sh`
4. Check the API documentation for endpoint details
5. Verify all prerequisites are met

