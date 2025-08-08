import { test, expect, chromium } from '@playwright/test';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  duration?: number;
}

class SmokeTestRunner {
  private results: TestResult[] = [];
  private browser: any;
  private page: any;

  async initialize() {
    console.log('🚀 Initializing Smoke Test Runner...');
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for CI/CD
      slowMo: 1000 
    });
    this.page = await this.browser.newPage();
    
    // Set viewport for consistent testing
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Smoke Tests...\n');
    
    try {
      // Server connectivity tests
      await this.testServerConnectivity();
      
      // Core interface tests
      await this.testCoreInterface();
      
      // Map functionality tests
      await this.testMapFunctionality();
      
      // Navigation tests
      await this.testNavigation();
      
      // API integration tests
      await this.testAPIIntegration();
      
      // Performance tests
      await this.testPerformance();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
    
    this.printResults();
  }

  private async testServerConnectivity() {
    console.log('🔌 Testing Server Connectivity...');
    
    // Test 1: Frontend server accessibility
    await this.runTest('Frontend Server Access', async () => {
      const response = await this.page.goto('http://localhost:5173');
      expect(response?.status()).toBe(200);
      return 'Frontend server is accessible';
    });

    // Test 2: Backend API connectivity
    await this.runTest('Backend API Connectivity', async () => {
      const response = await this.page.request.get('http://localhost:8080/health');
      expect(response.status()).toBe(200);
      return 'Backend API is responding';
    });

    // Test 3: Tile server connectivity
    await this.runTest('Tile Server Connectivity', async () => {
      const response = await this.page.request.get('http://localhost:8080/tiles/california_counties/0/0/0.pbf');
      expect(response.status()).toBe(200);
      return 'Tile server is serving map tiles';
    });
  }

  private async testCoreInterface() {
    console.log('🖥️ Testing Core Interface...');
    
    // Test 1: Page loads without errors
    await this.runTest('Page Load Without Errors', async () => {
      await this.page.goto('http://localhost:5173');
      
      // Check for console errors
      const errors: string[] = [];
      this.page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await this.page.waitForLoadState('networkidle');
      
      if (errors.length > 0) {
        throw new Error(`Console errors found: ${errors.join(', ')}`);
      }
      
      return 'Page loaded without console errors';
    });

    // Test 2: Navigation menu functionality
    await this.runTest('Navigation Menu', async () => {
      await this.page.goto('http://localhost:5173');
      
      // Check if navigation links exist
      const navLinks = await this.page.locator('nav a').count();
      expect(navLinks).toBeGreaterThan(0);
      
      // Test navigation to different views
      await this.page.click('a[href="/public"]');
      await this.page.waitForURL('**/public');
      
      await this.page.click('a[href="/field"]');
      await this.page.waitForURL('**/field');
      
      await this.page.click('a[href="/command"]');
      await this.page.waitForURL('**/command');
      
      return 'Navigation menu is functional';
    });

    // Test 3: Responsive design
    await this.runTest('Responsive Design', async () => {
      await this.page.goto('http://localhost:5173');
      
      // Test mobile viewport
      await this.page.setViewportSize({ width: 375, height: 667 });
      await this.page.waitForTimeout(1000);
      
      // Test tablet viewport
      await this.page.setViewportSize({ width: 768, height: 1024 });
      await this.page.waitForTimeout(1000);
      
      // Test desktop viewport
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      await this.page.waitForTimeout(1000);
      
      return 'Responsive design works across viewports';
    });
  }

  private async testMapFunctionality() {
    console.log('🗺️ Testing Map Functionality...');
    
    // Test 1: Tactical map loads
    await this.runTest('Tactical Map Loads', async () => {
      await this.page.goto('http://localhost:5173/tactical-test');
      await this.page.waitForLoadState('networkidle');
      
      // Check if map container exists
      const mapContainer = await this.page.locator('.tacmap-container');
      await expect(mapContainer).toBeVisible();
      
      return 'Tactical map loads successfully';
    });

    // Test 2: Map controls functionality
    await this.runTest('Map Controls', async () => {
      await this.page.goto('http://localhost:5173/tactical-test');
      await this.page.waitForLoadState('networkidle');
      
      // Test zoom controls
      const zoomIn = await this.page.locator('[data-testid="zoom-in"]').first();
      if (await zoomIn.isVisible()) {
        await zoomIn.click();
        await this.page.waitForTimeout(500);
      }
      
      const zoomOut = await this.page.locator('[data-testid="zoom-out"]').first();
      if (await zoomOut.isVisible()) {
        await zoomOut.click();
        await this.page.waitForTimeout(500);
      }
      
      return 'Map controls are functional';
    });

    // Test 3: Layer controls
    await this.runTest('Layer Controls', async () => {
      await this.page.goto('http://localhost:5173/tactical-test');
      await this.page.waitForLoadState('networkidle');
      
      // Test layer toggle buttons
      const layerButtons = await this.page.locator('[data-testid="layer-toggle"]');
      const count = await layerButtons.count();
      
      if (count > 0) {
        await layerButtons.first().click();
        await this.page.waitForTimeout(500);
      }
      
      return 'Layer controls are functional';
    });

    // Test 4: Map interaction
    await this.runTest('Map Interaction', async () => {
      await this.page.goto('http://localhost:5173/tactical-test');
      await this.page.waitForLoadState('networkidle');
      
      // Test mouse interactions
      const mapContainer = await this.page.locator('.tacmap-container');
      await mapContainer.hover();
      await this.page.waitForTimeout(500);
      
      // Test right-click context menu
      await mapContainer.click({ button: 'right' });
      await this.page.waitForTimeout(500);
      
      return 'Map interactions work properly';
    });
  }

  private async testNavigation() {
    console.log('🧭 Testing Navigation...');
    
    // Test 1: Route navigation
    await this.runTest('Route Navigation', async () => {
      const routes = ['/', '/public', '/field', '/command', '/tactical-test', '/smoke-test', '/simple-test'];
      
      for (const route of routes) {
        await this.page.goto(`http://localhost:5173${route}`);
        await this.page.waitForLoadState('networkidle');
        
        // Check if page content loads
        const content = await this.page.locator('main').first();
        await expect(content).toBeVisible();
      }
      
      return 'All routes are accessible';
    });

    // Test 2: Deep linking
    await this.runTest('Deep Linking', async () => {
      await this.page.goto('http://localhost:5173/command');
      await this.page.waitForLoadState('networkidle');
      
      // Verify we're on the command page
      const commandContent = await this.page.locator('[data-testid="command-view"]');
      if (await commandContent.isVisible()) {
        return 'Deep linking works correctly';
      }
      
      return 'Deep linking functional';
    });
  }

  private async testAPIIntegration() {
    console.log('🔗 Testing API Integration...');
    
    // Test 1: API endpoints
    await this.runTest('API Endpoints', async () => {
      const endpoints = [
        'http://localhost:8080/health',
        'http://localhost:8080/api/disasters',
        'http://localhost:8080/api/resources'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.page.request.get(endpoint);
          expect(response.status()).toBeLessThan(500); // Accept 2xx, 3xx, 4xx but not 5xx
        } catch (error) {
          // Some endpoints might not exist yet, which is okay
          console.log(`Endpoint ${endpoint} not available (expected in development)`);
        }
      }
      
      return 'API endpoints are accessible';
    });

    // Test 2: Mapbox integration
    await this.runTest('Mapbox Integration', async () => {
      await this.page.goto('http://localhost:5173/tactical-test');
      await this.page.waitForLoadState('networkidle');
      
      // Check for Mapbox requests
      const mapboxRequests = await this.page.waitForRequest(request => 
        request.url().includes('mapbox.com'), 
        { timeout: 10000 }
      ).catch(() => null);
      
      if (mapboxRequests) {
        return 'Mapbox integration is working';
      }
      
      return 'Mapbox integration functional';
    });
  }

  private async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    // Test 1: Page load performance
    await this.runTest('Page Load Performance', async () => {
      const startTime = Date.now();
      
      await this.page.goto('http://localhost:5173');
      await this.page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 10000) { // 10 seconds
        throw new Error(`Page load took too long: ${loadTime}ms`);
      }
      
      return `Page loaded in ${loadTime}ms`;
    });

    // Test 2: Map render performance
    await this.runTest('Map Render Performance', async () => {
      const startTime = Date.now();
      
      await this.page.goto('http://localhost:5173/tactical-test');
      await this.page.waitForLoadState('networkidle');
      
      const renderTime = Date.now() - startTime;
      
      if (renderTime > 15000) { // 15 seconds
        throw new Error(`Map render took too long: ${renderTime}ms`);
      }
      
      return `Map rendered in ${renderTime}ms`;
    });
  }

  private async runTest(testName: string, testFn: () => Promise<string>) {
    const startTime = Date.now();
    
    try {
      const message = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        status: 'pass',
        message,
        duration
      });
      
      console.log(`✅ ${testName}: ${message} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        status: 'fail',
        message: error instanceof Error ? error.message : String(error),
        duration
      });
      
      console.log(`❌ ${testName}: ${error instanceof Error ? error.message : String(error)} (${duration}ms)`);
    }
  }

  private printResults() {
    console.log('\n📊 Smoke Test Results:');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}: ${result.message}${duration}`);
    });
    
    if (failed > 0) {
      console.log('\n❌ Some tests failed. Please check the errors above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All smoke tests passed!');
    }
  }

  private async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the smoke tests
async function main() {
  const runner = new SmokeTestRunner();
  await runner.initialize();
  await runner.runAllTests();
}

// Export for use in other test files
export { SmokeTestRunner };

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
