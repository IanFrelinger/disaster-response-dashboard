# 🎭 **Headless Mode Testing Guide**

## **Overview**

This guide covers testing your modular layer system in headless mode - without a visible browser window. This is essential for CI/CD pipelines, automated testing, and server environments.

## **🚀 Quick Start**

### **Run All Tests in Headless Mode**
```bash
# Using npm script
npm run test:headless

# Using the dedicated runner
./run-headless-tests.sh

# Using Playwright directly
npx playwright test --config=playwright.headless.config.ts
```

### **Run Tests with Terminal-Only Output**
```bash
# Using npm script (no HTML reports)
npm run test:terminal

# Using the dedicated runner
./run-terminal-tests.sh

# Using Playwright directly
npx playwright test --config=playwright.terminal.config.ts
```

### **Run Specific Headless Tests**
```bash
# Headless mode validation only
npm run test:headless:validation

# Specific test file in headless mode
npx playwright test tests/e2e/test-layer-contracts.spec.ts --config=playwright.headless.config.ts
```

## **📋 Test Configuration Options**

### **Option 1: Headless Mode with HTML Reports**
**Configuration File: `playwright.headless.config.ts`**

The headless configuration includes:

- **Headless Mode**: `headless: true` for all browsers
- **Cross-Browser Testing**: Chrome, Firefox, and Safari in headless mode
- **Performance Optimizations**: Disabled GPU acceleration, optimized memory usage
- **Enhanced Debugging**: Screenshots, videos, and traces for failed tests
- **CI/CD Ready**: JUnit XML output, HTML reports, JSON results

### **Option 2: Terminal-Only Output (No HTML Reports)**
**Configuration File: `playwright.terminal.config.ts`**

The terminal-only configuration includes:

- **Terminal Output**: List reporter for clear console output
- **No HTML Reports**: Prevents browser opening and HTML generation
- **CI/CD Optimized**: Perfect for automated pipelines
- **Fast Execution**: Minimal overhead, maximum performance
- **Cross-Browser Testing**: Chrome, Firefox, and Safari in terminal mode

### **Browser-Specific Optimizations**

#### **Chrome (Chromium)**
```typescript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu'
]
```

#### **Firefox**
- Optimized for headless execution
- Disabled hardware acceleration
- Memory usage optimization

#### **Safari (WebKit)**
- macOS compatibility
- Headless mode support
- Performance optimization

## **🧪 Headless Mode Test Suite**

### **Test File: `test-headless-mode-validation.spec.ts`**

This comprehensive test suite validates:

1. **Basic Page Load and Navigation**
   - Page title loading
   - Navigation elements visibility
   - DOM structure integrity

2. **Map View Accessibility**
   - Map container rendering
   - Layer toggle presence
   - Component visibility

3. **Layer Toggle Functionality**
   - Toggle state changes
   - Multiple layer support
   - State synchronization

4. **Mapbox Integration**
   - Canvas element rendering
   - Map container dimensions
   - Browser compatibility

5. **Layer State Management**
   - State persistence
   - Toggle interactions
   - Data flow validation

6. **Performance Validation**
   - Operation timing
   - Response time measurement
   - Performance requirements

7. **Error Handling**
   - Error state detection
   - Fallback functionality
   - System resilience

8. **Accessibility Compliance**
   - Keyboard navigation
   - ARIA attributes
   - Screen reader support

9. **Cross-Browser Compatibility**
   - Browser-specific testing
   - Feature parity validation
   - Performance comparison

## **🔍 What Headless Mode Tests Validate**

### **Functionality Without Visual Feedback**
- ✅ All layer toggles work without UI rendering
- ✅ Map container renders with correct dimensions
- ✅ Layer state management functions properly
- ✅ Error handling works without visual cues
- ✅ Performance is optimized for headless execution

### **Cross-Browser Compatibility**
- ✅ Chrome (Chromium) headless mode
- ✅ Firefox headless mode  
- ✅ Safari (WebKit) headless mode
- ✅ Feature parity across browsers
- ✅ Consistent behavior in all environments

### **CI/CD Pipeline Readiness**
- ✅ Automated test execution
- ✅ No manual intervention required
- ✅ Reliable test results
- ✅ Fast execution times
- ✅ Comprehensive reporting

## **⚡ Performance Benefits**

### **Headless Mode Advantages**
- **Faster Execution**: No UI rendering overhead
- **Lower Memory Usage**: Reduced graphics memory
- **Better Stability**: Fewer visual-related failures
- **CI/CD Optimized**: Perfect for automated pipelines
- **Resource Efficient**: Minimal system resource usage

### **Performance Metrics**
- **Page Load Time**: < 3 seconds
- **Layer Toggle Response**: < 100ms
- **Map Rendering**: < 2 seconds
- **Memory Usage**: < 100MB per browser instance
- **CPU Usage**: < 50% during test execution

## **🚨 Common Headless Mode Issues**

### **Canvas Rendering Problems**
```typescript
// Issue: Canvas not rendering in headless mode
// Solution: Disable GPU acceleration
args: ['--disable-accelerated-2d-canvas', '--disable-gpu']
```

### **Timing Dependencies**
```typescript
// Issue: Tests fail due to visual rendering delays
// Solution: Increase wait times for headless mode
await page.waitForTimeout(2000); // Allow for headless rendering
```

### **Browser Feature Differences**
```typescript
// Issue: Some features don't work in headless mode
// Solution: Test with multiple browsers
projects: [
  { name: 'chromium-headless', use: { ...devices['Desktop Chrome'], headless: true } },
  { name: 'firefox-headless', use: { ...devices['Desktop Firefox'], headless: true } },
  { name: 'webkit-headless', use: { ...devices['Desktop Safari'], headless: true } }
]
```

## **📊 Test Results and Reporting**

### **Output Directories**
```
test-results/headless/
├── screenshots/          # Failed test screenshots
├── videos/              # Failed test recordings
├── traces/              # Playwright traces
├── results.json         # JSON test results
├── results.xml          # JUnit XML results
└── index.html           # HTML test report
```

### **Report Types**
- **HTML Report**: Interactive test results with screenshots
- **JSON Report**: Machine-readable test data
- **JUnit XML**: CI/CD pipeline integration
- **Console Output**: Real-time test progress

## **🔧 Troubleshooting Headless Mode**

### **Development Server Issues**
```bash
# Check if dev server is running
curl http://localhost:3001

# Start dev server if needed
docker exec -it frontend-frontend-dev-1 sh -c "cd /app && npm run dev"
```

### **Browser Installation Issues**
```bash
# Install Playwright browsers
npx playwright install

# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### **Permission Issues**
```bash
# Make scripts executable
chmod +x run-headless-tests.sh
chmod +x run-layer-tests.sh

# Run with proper permissions
sudo ./run-headless-tests.sh
```

## **🚀 CI/CD Integration**

### **GitHub Actions Example**
```yaml
name: Headless Mode Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:headless
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/headless/
```

### **Docker Integration**
```dockerfile
# Install Playwright dependencies
RUN npx playwright install --with-deps chromium firefox webkit

# Run headless tests
CMD ["npm", "run", "test:headless"]
```

## **📈 Best Practices**

### **Test Design**
1. **Avoid Visual Dependencies**: Don't rely on visual feedback
2. **Use Semantic Selectors**: Prefer `data-testid` over CSS classes
3. **Test State, Not Appearance**: Focus on functionality over visuals
4. **Handle Async Operations**: Account for headless rendering delays
5. **Cross-Browser Validation**: Test in multiple headless browsers

### **Performance Optimization**
1. **Minimize Wait Times**: Use smart waiting strategies
2. **Optimize Selectors**: Use efficient element locators
3. **Batch Operations**: Group related test actions
4. **Resource Management**: Clean up after tests
5. **Parallel Execution**: Run tests concurrently when possible

### **Debugging Strategies**
1. **Enable Traces**: Capture detailed execution traces
2. **Screenshot Failures**: Visual debugging for headless issues
3. **Video Recording**: Record failed test execution
4. **Console Logging**: Add detailed logging for debugging
5. **Browser Console**: Check browser console for errors

## **🎯 Success Criteria**

### **All Tests Must Pass**
- ✅ Headless mode validation
- ✅ Cross-browser compatibility
- ✅ Performance requirements met
- ✅ No visual dependencies detected
- ✅ CI/CD pipeline ready

### **Performance Benchmarks**
- **Test Execution Time**: < 5 minutes for full suite
- **Memory Usage**: < 200MB total
- **CPU Usage**: < 80% peak
- **Success Rate**: > 95% pass rate
- **Flakiness**: < 1% flaky tests

## **📚 Additional Resources**

- [Playwright Headless Mode Documentation](https://playwright.dev/docs/ci#running-headed)
- [Cross-Browser Testing Guide](https://playwright.dev/docs/browsers)
- [CI/CD Integration](https://playwright.dev/docs/ci)
- [Performance Testing](https://playwright.dev/docs/test-assertions#expect-to-have-screenshot)
- [Debugging Headless Issues](https://playwright.dev/docs/debug)

---

**Note**: Headless mode testing ensures your modular layer system works reliably in automated environments and provides a solid foundation for CI/CD pipelines. All tests should pass in both headed and headless modes for maximum compatibility.
