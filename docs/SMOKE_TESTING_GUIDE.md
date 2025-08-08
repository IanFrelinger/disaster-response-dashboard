# Smoke Testing Guide

This guide explains how to use the automated smoke tests to validate your Disaster Response Dashboard installation.

## Overview

The smoke testing system provides multiple levels of testing:

1. **Quick Smoke Test** - Basic connectivity checks
2. **Simple Smoke Test** - Node.js-based comprehensive testing
3. **Full Smoke Test** - Playwright-based browser automation
4. **Comprehensive Smoke Test** - Complete system validation

## Quick Start

### 1. Quick Smoke Test (Recommended for daily use)

```bash
# From project root
./scripts/quick-smoke-test.sh
```

This runs basic connectivity tests:
- ✅ Frontend server (localhost:5173)
- ✅ Backend server (localhost:8080)
- ✅ Mapbox token validation
- ✅ Tile server connectivity

### 2. Frontend-Only Smoke Test

```bash
# From frontend directory
cd frontend
npm run smoke-test
```

This runs the Node.js-based smoke test that validates:
- Server connectivity
- API endpoints
- Mapbox integration
- Tile server functionality

### 3. Full Browser-Based Smoke Test

```bash
# From frontend directory
cd frontend
npm run smoke-test:full
```

This runs Playwright-based tests that validate:
- Page loading without errors
- Navigation functionality
- Map interactions
- Responsive design
- Performance metrics

### 4. Comprehensive System Test

```bash
# From project root
./scripts/comprehensive-smoke-test.sh
```

This runs a complete system validation including:
- Environment configuration
- Build system
- Docker containers
- All server endpoints
- Mapbox integration
- Tile server functionality

## Test Categories

### 🔌 Server Connectivity Tests

Validates that all required services are running:

- **Frontend Server** (localhost:5173)
- **Backend API** (localhost:8080)
- **Tile Server** (localhost:8080/tiles/*)

### 🗺️ Mapbox Integration Tests

Validates Mapbox configuration:

- **Token Validity** - Tests if your Mapbox token is working
- **API Access** - Verifies geocoding API access
- **Map Loading** - Checks if maps render properly

### 🖥️ Interface Tests

Validates user interface functionality:

- **Page Loading** - Ensures pages load without errors
- **Navigation** - Tests routing between views
- **Responsive Design** - Validates mobile/tablet/desktop layouts
- **Map Controls** - Tests zoom, pan, layer controls

### 🔗 API Integration Tests

Validates backend API functionality:

- **Health Check** - `/health` endpoint
- **Disaster API** - `/api/disasters` endpoint
- **Resources API** - `/api/resources` endpoint
- **Synthetic API** - `/api/synthetic` endpoint

### ⚡ Performance Tests

Validates system performance:

- **Page Load Time** - Ensures pages load within acceptable time
- **Map Render Time** - Validates map rendering performance
- **API Response Time** - Checks API response times

## Running Tests in Different Environments

### Development Environment

```bash
# Start your development servers first
cd frontend && npm run dev &
cd backend && python app.py &

# Then run smoke tests
./scripts/quick-smoke-test.sh
```

### Production Environment

```bash
# Run comprehensive tests
./scripts/comprehensive-smoke-test.sh
```

### CI/CD Pipeline

```bash
# Install Playwright browsers
cd frontend && npx playwright install

# Run full test suite
cd frontend && npm run smoke-test:full
```

## Interpreting Results

### ✅ Passed Tests
- Service is accessible and functioning correctly
- No action required

### ⚠️ Warning Tests
- Service is accessible but may have issues
- Review logs for potential problems
- May be expected in development environment

### ❌ Failed Tests
- Service is not accessible or has critical issues
- Check server status and configuration
- Review error messages for specific problems

## Common Issues and Solutions

### Frontend Server Not Accessible

**Symptoms:**
- Quick smoke test shows "❌ FAILED" for frontend
- Browser shows connection refused

**Solutions:**
```bash
# Start frontend development server
cd frontend
npm run dev
```

### Backend Server Not Accessible

**Symptoms:**
- Quick smoke test shows "❌ FAILED" for backend
- API calls return connection errors

**Solutions:**
```bash
# Start backend server
cd backend
python app.py
```

### Mapbox Token Issues

**Symptoms:**
- Mapbox integration tests fail
- Maps don't load properly

**Solutions:**
1. Check your Mapbox token in `frontend/.env.local`
2. Verify token has proper permissions
3. Ensure token is not expired

### Tile Server Issues

**Symptoms:**
- Tile server tests fail
- Maps show missing tiles

**Solutions:**
```bash
# Start tile server
cd tiles
docker-compose up -d
```

## Test Configuration

### Environment Variables

The tests use these default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Tile Server: `http://localhost:8080`

### Customizing Test URLs

Edit the configuration in the test scripts:

```bash
# In scripts/comprehensive-smoke-test.sh
FRONTEND_URL="http://your-frontend-url"
BACKEND_URL="http://your-backend-url"
TILE_SERVER_URL="http://your-tile-server-url"
```

### Timeout Settings

Adjust timeout values for slower environments:

```bash
# In scripts/comprehensive-smoke-test.sh
TIMEOUT=30  # Increase for slower connections
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Smoke Tests
on: [push, pull_request]

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          cd frontend
          npm install
          npm run build
          npm run smoke-test:full
```

### Docker Compose Integration

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  smoke-test:
    build: .
    command: ./scripts/comprehensive-smoke-test.sh
    depends_on:
      - frontend
      - backend
      - tile-server
```

## Troubleshooting

### Test Scripts Not Executable

```bash
chmod +x scripts/*.sh
```

### Playwright Browsers Not Installed

```bash
cd frontend
npx playwright install
```

### Node.js Dependencies Missing

```bash
cd frontend
npm install
```

### Python Dependencies Missing

```bash
cd backend
pip install -r requirements.txt
```

## Best Practices

1. **Run Quick Tests Daily** - Use `./scripts/quick-smoke-test.sh` for daily validation
2. **Run Full Tests Before Deployments** - Use comprehensive tests before production deployments
3. **Monitor Test Results** - Track test results over time to identify trends
4. **Customize for Your Environment** - Adjust URLs and timeouts for your specific setup
5. **Integrate with Monitoring** - Use test results in your monitoring and alerting systems

## Support

If you encounter issues with the smoke tests:

1. Check the troubleshooting section above
2. Review the test output for specific error messages
3. Verify your environment configuration
4. Check server logs for additional details
5. Open an issue with detailed error information
