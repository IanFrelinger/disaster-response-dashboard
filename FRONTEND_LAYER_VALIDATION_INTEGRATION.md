# Frontend Layer Validation Integration Guide

This guide explains how to integrate the automated frontend layer validation into your CI/CD pipeline.

## 🎯 Overview

The frontend layer validation system automatically tests that all map layers are rendering correctly in the 3D disaster response dashboard. It validates:

- ✅ **6/6 layers successful** (terrain, buildings, hazards, units, routes, enhanced routing)
- ⏱️ **Performance metrics** (load time, render time, memory usage)
- 🖼️ **Visual validation** (screenshots for debugging)
- 📊 **Detailed reporting** (JSON results, console logs)

## 🚀 Quick Start

### Local Development
```bash
# Run validation on local development server
cd frontend
pnpm validate:layers

# Run with custom URL
FRONTEND_URL=http://localhost:3002 pnpm validate:layers
```

### CI/CD Pipeline
```bash
# Run validation in CI environment
cd frontend
pnpm validate:layers:ci
```

## 📁 File Structure

```
frontend/
├── scripts/
│   └── run-layer-validation.js          # Main validation script
├── test-results/                        # Generated results
│   ├── layer-validation-results.json    # Detailed results
│   └── layer-validation.png            # Screenshot
└── package.json                        # Added validation scripts

scripts/
└── validate-frontend-layers.sh         # Shell wrapper for CI

.github/workflows/
└── frontend-layer-validation.yml       # GitHub Actions workflow

Makefile                               # Updated with validation targets
```

## 🔧 Integration Options

### 1. Makefile Integration (Recommended)

The validation is already integrated into your existing Makefile:

```bash
# Run complete validation including frontend layers
make validate

# Run only frontend layer validation
make frontend-layer-validation
```

### 2. GitHub Actions Integration

A dedicated workflow is provided at `.github/workflows/frontend-layer-validation.yml`:

```yaml
# Triggers on:
# - Push to main/develop branches
# - Pull requests affecting frontend
# - Manual workflow dispatch
```

**Features:**
- ✅ Automatic PR comments with results
- 📊 Artifact uploads (screenshots, results)
- 🔄 Retry logic for flaky tests
- 📈 Performance metrics tracking

### 3. Docker Integration

For containerized environments, use the shell script:

```bash
# Run validation in Docker
./scripts/validate-frontend-layers.sh

# With custom configuration
FRONTEND_URL=http://frontend:3000 HEADLESS=true ./scripts/validate-frontend-layers.sh
```

### 4. Custom CI Integration

For other CI systems, use the Node.js script directly:

```bash
# Install dependencies
cd frontend
pnpm install

# Install Playwright browsers
pnpm exec playwright install --with-deps chromium

# Run validation
FRONTEND_URL=http://your-frontend-url CI=true pnpm validate:layers:ci
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_URL` | `http://localhost:3002` | URL of the frontend application |
| `CI` | `false` | Enable CI mode (headless, stricter timeouts) |
| `HEADLESS` | `false` | Run browser in headless mode |
| `SCREENSHOT_PATH` | `test-results/layer-validation.png` | Screenshot output path |
| `RESULTS_PATH` | `test-results/layer-validation-results.json` | Results output path |
| `VALIDATION_TIMEOUT` | `60000` | Maximum validation timeout (ms) |

### Validation Thresholds

The validation enforces these thresholds:

```javascript
const THRESHOLDS = {
  minSuccessRate: 100,    // 100% of layers must be successful
  maxLoadTime: 10000,     // 10 seconds max load time
  maxRenderTime: 5000     // 5 seconds max render time
};
```

## 📊 Results Format

### JSON Results Structure

```json
{
  "timestamp": "2025-01-06T01:08:35.324Z",
  "success": true,
  "overall": {
    "successfulLayers": 6,
    "totalLayers": 6,
    "successRate": 100,
    "errors": []
  },
  "layers": {
    "terrain": {
      "success": true,
      "enabled": false,
      "rendered": false,
      "interactive": false,
      "disabled": true,
      "notRendered": true,
      "static": true
    },
    "buildings": {
      "success": true,
      "enabled": true,
      "rendered": true,
      "interactive": false,
      "disabled": false,
      "notRendered": false,
      "static": true
    }
    // ... other layers
  },
  "performance": {
    "loadTime": 3240,
    "renderTime": 1200,
    "memoryUsage": 45678912
  },
  "environment": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "ci": true
  }
}
```

### Exit Codes

- `0` - Validation passed (100% success rate)
- `1` - Validation failed (any layer failed or errors occurred)

## 🔄 CI/CD Pipeline Examples

### GitHub Actions

```yaml
name: Frontend Layer Validation
on: [push, pull_request]

jobs:
  validate-layers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: |
          cd frontend
          pnpm install
          pnpm build
          pnpm preview --port 3000 &
          sleep 10
          pnpm validate:layers:ci
```

### GitLab CI

```yaml
frontend-layer-validation:
  stage: test
  image: node:18
  before_script:
    - cd frontend
    - npm install -g pnpm
    - pnpm install
    - pnpm exec playwright install --with-deps chromium
  script:
    - pnpm build
    - pnpm preview --port 3000 &
    - sleep 10
    - pnpm validate:layers:ci
  artifacts:
    paths:
      - frontend/test-results/
    expire_in: 1 week
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    stages {
        stage('Frontend Layer Validation') {
            steps {
                sh '''
                    cd frontend
                    pnpm install
                    pnpm build
                    pnpm preview --port 3000 &
                    sleep 10
                    pnpm validate:layers:ci
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'frontend/test-results/**/*'
                }
            }
        }
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Frontend not ready**
   ```bash
   # Check if frontend is running
   curl -f http://localhost:3000
   
   # Increase wait time
   sleep 15
   ```

2. **Playwright browser issues**
   ```bash
   # Install browsers
   pnpm exec playwright install --with-deps chromium
   
   # Run with system dependencies
   pnpm exec playwright install --with-deps
   ```

3. **Timeout issues**
   ```bash
   # Increase timeout
   VALIDATION_TIMEOUT=120000 pnpm validate:layers
   ```

4. **Memory issues**
   ```bash
   # Run with more memory
   NODE_OPTIONS="--max-old-space-size=4096" pnpm validate:layers
   ```

### Debug Mode

Run validation in debug mode to see browser:

```bash
HEADLESS=false pnpm validate:layers
```

### Verbose Logging

Enable detailed logging:

```bash
DEBUG=playwright* pnpm validate:layers
```

## 📈 Performance Monitoring

The validation tracks key performance metrics:

- **Load Time**: Time to load the frontend application
- **Render Time**: Time to render all map layers
- **Memory Usage**: JavaScript heap usage during validation
- **Success Rate**: Percentage of layers that validate successfully

### Performance Budgets

| Metric | Threshold | Action |
|--------|-----------|--------|
| Load Time | < 10s | Warning if exceeded |
| Render Time | < 5s | Warning if exceeded |
| Success Rate | 100% | Failure if not met |
| Memory Usage | < 100MB | Warning if exceeded |

## 🔄 Continuous Improvement

### Adding New Layers

When adding new map layers, update the validation script:

1. Add layer name to `layerNames` array in `run-layer-validation.js`
2. Update validation logic if needed
3. Test with `pnpm validate:layers`

### Custom Validation Rules

Extend validation by modifying `run-layer-validation.js`:

```javascript
// Add custom validation logic
const customValidation = await page.evaluate(() => {
  // Your custom validation code
  return { customMetric: value };
});
```

### Integration with Monitoring

Send results to monitoring systems:

```javascript
// Example: Send to monitoring service
if (process.env.MONITORING_URL) {
  await fetch(process.env.MONITORING_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(this.results)
  });
}
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [CI/CD Integration Patterns](https://docs.github.com/en/actions/learn-github-actions)

## 🤝 Contributing

To improve the validation system:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `pnpm validate:layers`
5. Submit a pull request

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the logs in `test-results/`
3. Create an issue with validation results
4. Include screenshots and error logs
