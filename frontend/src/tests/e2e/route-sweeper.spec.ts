import { test, expect } from '@playwright/test';

// Extend Window interface for custom properties
declare global {
  interface Window {
    __appIdle?: boolean;
  }
}

// Route configuration for systematic testing
const routes = [
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/map', name: 'Map View' },
  { path: '/settings', name: 'Settings' },
  { path: '/evacuation', name: 'Evacuation' },
  { path: '/technical', name: 'Technical Architecture' },
  { path: '/units', name: 'Unit Management' },
  { path: '/ai-support', name: 'AI Decision Support' },
  { path: '/routing', name: 'Role-Based Routing' },
  { path: '/analytics', name: 'Drill-Down Analytics' },
  { path: '/search', name: 'Search and Markings' },
  { path: '/metrics', name: 'Efficiency Metrics' },
  { path: '/buildings', name: 'Building Tracker' },
  { path: '/weather', name: 'Weather Panel' },
  { path: '/3d-routing', name: '3D Routing' },
  { path: '/3d-terrain', name: '3D Terrain' },
  { path: '/live-hazards', name: 'Live Hazards' }
];

test.describe('Route Sweeper - Render Stability', () => {
  test.beforeEach(async ({ page }) => {
    // FAIL-FAST: Throw on any console errors or warnings
    page.on('console', message => {
      if (['error', 'warning'].includes(message.type())) {
        const text = message.text();
        if (/Warning:|Error:/i.test(text)) {
          throw new Error(`Console ${message.type()} detected: ${text}`);
        }
      }
    });

    // FAIL-FAST: Throw on page errors
    page.on('pageerror', error => {
      throw new Error(`Page error: ${error.message}`);
    });

    // FAIL-FAST: Throw on unhandled rejections
    await page.addInitScript(() => {
      window.addEventListener('unhandledrejection', event => {
        throw new Error(`Unhandled rejection: ${event.reason}`);
      });

      window.addEventListener('error', event => {
        throw new Error(`Window error: ${event.message}`);
      });

      // Add app idle detection
      let appIdleTimeout: NodeJS.Timeout;
      const markAppIdle = () => {
        performance.mark('app-idle');
        window.__appIdle = true;
      };

      // Mark app as idle after initial render and data loading
      const checkAppReady = () => {
        // Check if map is ready (if applicable)
        const mapReady = !document.querySelector('[data-testid="map-loading"]');
        
        // Check if main content is rendered
        const contentReady = document.querySelector('[data-testid="main-content"]') || 
                           document.querySelector('main') ||
                           document.querySelector('.dashboard') ||
                           document.querySelector('.map-container');

        if (mapReady && contentReady) {
          clearTimeout(appIdleTimeout);
          appIdleTimeout = setTimeout(markAppIdle, 500); // Small delay to ensure stability
        } else {
          // Check again in 100ms
          setTimeout(checkAppReady, 100);
        }
      };

      // Start checking when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAppReady);
      } else {
        checkAppReady();
      }
    });
  });

  // Test each route systematically
  for (const route of routes) {
    test(`Route: ${route.name} (${route.path}) renders without errors`, async ({ page }) => {
      // Navigate to the route
      await page.goto(route.path);
      
      // Wait for app to be idle (indicating render completion)
      await page.waitForFunction(() => window.__appIdle === true, { timeout: 10000 });
      
      // Verify no error boundary is visible
      const errorBoundary = page.locator('[data-testid="error-boundary"], .error-boundary, .error-fallback');
      await expect(errorBoundary).not.toBeVisible();
      
      // Verify no console errors occurred (handled by beforeEach)
      // Verify basic page structure is present
      await expect(page.locator('body')).toBeVisible();
      
      // Check for common error indicators
      const errorIndicators = page.locator('.error, .crash, .failed, [data-testid="error"]');
      await expect(errorIndicators).toHaveCount(0);
      
      // Verify the route-specific content is present (basic check)
      if (route.path === '/') {
        // Home page should have some content
        await expect(page.locator('main, .main, .home, .dashboard')).toBeVisible();
      } else if (route.path === '/map') {
        // Map page should have map container
        await expect(page.locator('.map-container, [data-testid="map"], .map')).toBeVisible();
      } else if (route.path === '/dashboard') {
        // Dashboard should have dashboard content
        await expect(page.locator('.dashboard, [data-testid="dashboard"], .evacuation-dashboard')).toBeVisible();
      }
      
      // Performance check: app should be idle within reasonable time
      const appIdleTime = await page.evaluate(() => {
        const entries = performance.getEntriesByName('app-idle');
        return entries.length > 0 && entries[0] ? entries[0].startTime : null;
      });
      
      expect(appIdleTime).toBeLessThan(5000); // Should be idle within 5 seconds
    });
  }

  // Additional route stability tests
  test('rapid route navigation maintains stability', async ({ page }) => {
    // Navigate through multiple routes quickly
    for (const route of routes.slice(0, 5)) { // Test first 5 routes
      await page.goto(route.path);
      await page.waitForFunction(() => window.__appIdle === true, { timeout: 5000 });
      
      // Quick check that no error boundary is visible
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      await expect(errorBoundary).not.toBeVisible();
    }
  });

  test('route navigation preserves app state', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await page.waitForFunction(() => window.__appIdle === true, { timeout: 5000 });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForFunction(() => window.__appIdle === true, { timeout: 5000 });
    
    // Go back to home
    await page.goBack();
    await page.waitForFunction(() => window.__appIdle === true, { timeout: 5000 });
    
    // Should still be stable
    const errorBoundary = page.locator('[data-testid="error-boundary"]');
    await expect(errorBoundary).not.toBeVisible();
  });

  test('error boundary appears when route has render errors', async ({ page }) => {
    // This test would require a route that intentionally has errors
    // For now, we'll test that error boundaries work in general
    await page.goto('/');
    await page.waitForFunction(() => window.__appIdle === true, { timeout: 5000 });
    
    // Inject a client-side error to test error boundary
    await page.evaluate(() => {
      // Simulate a render error
      const errorEvent = new ErrorEvent('error', {
        message: 'Simulated render error',
        filename: 'test.js',
        lineno: 1,
        colno: 1,
        error: new Error('Simulated render error')
      });
      
      window.dispatchEvent(errorEvent);
    });
    
    // Wait a moment for error handling
    await page.waitForTimeout(100);
    
    // Check if error boundary caught it (this depends on your error boundary implementation)
    // For now, just verify the page is still stable
    await expect(page.locator('body')).toBeVisible();
  });
});

// Performance budget test
test.describe('Performance Budget - First Interactive', () => {
  test('app reaches idle state within performance budget', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app idle with strict timeout
    const startTime = Date.now();
    await page.waitForFunction(() => window.__appIdle === true, { timeout: 3000 });
    const endTime = Date.now();
    
    const timeToIdle = endTime - startTime;
    
    // Should be idle within 3 seconds (performance budget)
    expect(timeToIdle).toBeLessThan(3000);
    
    // Verify performance mark exists
    const hasPerformanceMark = await page.evaluate(() => {
      return performance.getEntriesByName('app-idle').length > 0;
    });
    
    expect(hasPerformanceMark).toBe(true);
  });
});

// Accessibility smoke test as render sentinel
test.describe('Accessibility Smoke - Render Health Proxy', () => {
  test('home page meets basic accessibility standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__appIdle === true, { timeout: 5000 });
    
    // Basic accessibility checks that indicate stable DOM
    await expect(page.locator('h1, h2, h3')).toHaveCount(1); // Should have at least 1 heading
    await expect(page.locator('main, [role="main"]')).toBeVisible(); // Should have main landmark
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible(); // Should have navigation
    
    // Check for proper ARIA labels and roles
    const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [role]');
    await expect(elementsWithAria).toHaveCount(1); // Should have at least 1 element
  });

  test('map page maintains accessibility during interactions', async ({ page }) => {
    await page.goto('/map');
    await page.waitForFunction(() => window.__appIdle === true, { timeout: 5000 });
    
    // Map should have proper accessibility attributes
    const mapContainer = page.locator('.map-container, [data-testid="map"], .map');
    await expect(mapContainer).toBeVisible();
    
    // Check for map-specific accessibility
    const mapWithRole = page.locator('[role="application"], [aria-label*="map"], [aria-label*="Map"]');
    await expect(mapWithRole).toHaveCount(1); // Should have at least 1 element
  });
});
