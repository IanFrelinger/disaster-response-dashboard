# Browser Testing for White Screen Detection

This document outlines the comprehensive browser testing system designed to catch white screen issues before they reach production.

## 🎯 Overview

White screens in production are often caused by:
- JavaScript errors during component rendering
- Missing environment variables
- API failures
- Bundle loading issues
- Production build optimizations
- Memory leaks
- Network failures

Our browser testing system simulates these conditions in development to catch issues early.

## 🧪 Test Suites

### 1. **Component Rendering Tests** (`component-rendering.spec.ts`)
Tests basic component functionality and rendering:
- ✅ Main page rendering without white screen
- ✅ Map component rendering
- ✅ Layer controls functionality
- ✅ JavaScript error handling
- ✅ Responsive design across screen sizes
- ✅ Network error handling
- ✅ Memory leak detection

### 2. **White Screen Detection Tests** (`white-screen-detection.spec.ts`)
Specifically targets white screen causes:
- ✅ Initial load white screen detection
- ✅ Missing environment variable handling
- ✅ API failure graceful degradation
- ✅ JavaScript bundle loading failure handling
- ✅ CSS loading failure handling
- ✅ Mapbox GL JS loading failure handling
- ✅ Rapid navigation stability
- ✅ Memory pressure handling

### 3. **Production Environment Simulation Tests** (`production-simulation.spec.ts`)
Simulates production conditions:
- ✅ Production build optimizations
- ✅ Minified code handling
- ✅ Disabled source maps
- ✅ Tree-shaking compatibility
- ✅ Code splitting stability
- ✅ Bundle size optimizations
- ✅ Hot reload disabled
- ✅ Error boundary functionality
- ✅ Production logging disabled

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
npx playwright install
```

### Run All Browser Tests
```bash
npm run test:browser:all
```

### Run Specific Test Suites
```bash
# Component rendering tests
npm run test:components

# White screen detection tests
npm run test:white-screen

# Production simulation tests
npm run test:production

# All browser tests
npm run test:browser
```

### Interactive Testing
```bash
# Run with UI
npm run test:browser:ui

# Run in headed mode (visible browser)
npm run test:browser:headed

# Run in debug mode
npm run test:browser:debug
```

## 🔍 What the Tests Check

### **White Screen Prevention**
- **Content Verification**: Ensures page has meaningful content
- **React Mounting**: Verifies React app is properly mounted
- **Error Boundaries**: Tests error handling and fallback UI
- **Console Monitoring**: Catches JavaScript errors in real-time
- **Network Simulation**: Tests offline/API failure scenarios

### **Production Readiness**
- **Build Optimizations**: Tests minified, tree-shaken code
- **Environment Variables**: Tests missing config handling
- **Bundle Loading**: Tests JavaScript/CSS loading failures
- **Memory Management**: Tests for memory leaks
- **Performance**: Tests under various load conditions

### **Cross-Browser Compatibility**
- **Chromium**: Chrome/Edge compatibility
- **Firefox**: Firefox-specific issues
- **WebKit**: Safari compatibility
- **Mobile**: Mobile browser testing
- **Responsive**: Different screen sizes

## 📊 Test Results

### **Success Indicators**
- ✅ All test suites pass
- ✅ No critical JavaScript errors
- ✅ Components render correctly
- ✅ Error boundaries work
- ✅ Fallback content displays
- ✅ Memory usage stable

### **Failure Indicators**
- ❌ White screen detected
- ❌ Critical JavaScript errors
- ❌ Components fail to render
- ❌ Error boundaries don't work
- ❌ No fallback content
- ❌ Memory leaks detected

## 🛠️ Troubleshooting

### **Common Issues**

#### **Tests Fail with White Screen**
1. Check browser console for JavaScript errors
2. Verify all dependencies are loaded
3. Check environment variables
4. Verify API endpoints are accessible
5. Check for CSS/JavaScript loading failures

#### **Component Rendering Issues**
1. Check React component lifecycle
2. Verify prop passing
3. Check for missing dependencies
4. Verify error boundaries are in place

#### **Production Build Issues**
1. Check build configuration
2. Verify tree-shaking isn't too aggressive
3. Check code splitting configuration
4. Verify minification settings

### **Debug Commands**
```bash
# Run tests with verbose output
npx playwright test --reporter=verbose

# Run specific test with debugging
npx playwright test --debug component-rendering.spec.ts

# Run tests and show browser
npx playwright test --headed
```

## 📈 Continuous Integration

### **GitHub Actions Integration**
```yaml
- name: Run Browser Tests
  run: |
    npm run test:browser:all
    npm run test:white-screen:comprehensive
```

### **Pre-commit Hooks**
```bash
# Add to package.json scripts
"precommit": "npm run test:white-screen:comprehensive"
```

### **Daily Monitoring**
```bash
# Run comprehensive tests daily
npm run test:browser:all > browser-test-report.log 2>&1
```

## 🔧 Customization

### **Adding New Tests**
1. Create test file in `src/testing/browser-tests/`
2. Follow existing test patterns
3. Add test to test runner script
4. Update package.json scripts

### **Test Configuration**
- Modify `playwright.config.ts` for browser settings
- Adjust timeouts in individual tests
- Customize error detection patterns
- Add new browser targets

### **Error Detection**
- Add new error patterns to filter
- Customize critical error detection
- Add new fallback content checks
- Extend memory leak detection

## 📚 Best Practices

### **Test Design**
- **Isolation**: Each test should be independent
- **Realistic**: Simulate real-world conditions
- **Comprehensive**: Cover all failure scenarios
- **Fast**: Keep tests under 30 seconds each

### **Error Handling**
- **Graceful Degradation**: Always show fallback content
- **User-Friendly**: Clear error messages
- **Recovery**: Provide retry mechanisms
- **Logging**: Comprehensive error logging

### **Performance**
- **Memory Management**: Prevent memory leaks
- **Bundle Optimization**: Minimize bundle size
- **Lazy Loading**: Implement code splitting
- **Caching**: Use appropriate caching strategies

## 🎯 Next Steps

1. **Run Initial Tests**: Execute `npm run test:browser:all`
2. **Fix Issues**: Address any failing tests
3. **Add Error Boundaries**: Implement error boundaries in components
4. **Monitor Production**: Set up production error monitoring
5. **Automate**: Add tests to CI/CD pipeline

## 📞 Support

For issues with the browser testing system:
1. Check test output for specific errors
2. Review browser console logs
3. Verify Playwright installation
4. Check test configuration
5. Review component error handling

---

**Remember**: The goal is to catch white screen issues in development, not just in production. Regular testing with this system will significantly reduce production issues.

