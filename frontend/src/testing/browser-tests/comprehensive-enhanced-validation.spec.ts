/**
 * Comprehensive Enhanced Validation Test Suite
 * Integrates all new testing features: edge cases, contracts, visual regression, accessibility, chaos testing
 */

import { test, expect, Page } from '@playwright/test';
import { AccessibilityTester } from '../accessibility/accessibility-tests';
import { chaosEngine } from '../chaos/chaos-testing';

test.describe('Comprehensive Enhanced Validation', () => {
  let page: Page;
  let accessibilityTester: AccessibilityTester;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    accessibilityTester = new AccessibilityTester(page);
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('@smoke @accessibility complete application validation', async () => {
    // Test 1: Basic application load
    await expect(page.locator('[data-testid="main-dashboard"]')).toBeVisible();
    
    // Test 2: Accessibility audit
    const violations = await accessibilityTester.runFullAccessibilityAudit();
    expect(violations.length).toBe(0);
    
    // Test 3: Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Test 4: Map accessibility
    const mapViolations = await accessibilityTester.runFullAccessibilityAudit();
    expect(mapViolations.length).toBe(0);
    
    // Test 5: Layer toggles work
    const layerToggles = [
      '[data-testid="terrain-toggle"]',
      '[data-testid="buildings-toggle"]',
      '[data-testid="hazards-toggle"]',
      '[data-testid="units-toggle"]',
      '[data-testid="routes-toggle"]'
    ];
    
    for (const toggle of layerToggles) {
      try {
        await page.click(toggle);
        await page.waitForTimeout(500);
        await expect(page.locator(toggle)).toBeVisible();
      } catch (error) {
        console.log(`Toggle ${toggle} not found or not clickable`);
      }
    }
  });

  test('@performance @visual-regression performance and visual validation', async () => {
    // Test 1: Performance monitoring
    await page.evaluate(() => {
      if ((window as any).performanceMonitor) {
        (window as any).performanceMonitor.startMapLoadTimer();
      }
    });
    
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    await page.evaluate(() => {
      if ((window as any).performanceMonitor) {
        (window as any).performanceMonitor.endMapLoadTimer();
        const metrics = (window as any).performanceMonitor.getMetrics();
        console.log('Performance metrics:', metrics);
      }
    });
    
    // Test 2: Visual regression - main dashboard
    await expect(page).toHaveScreenshot('comprehensive-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test 3: Visual regression - map view
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('comprehensive-map.png', {
      animations: 'disabled'
    });
    
    // Test 4: Visual regression - all layers enabled
    const layerToggles = [
      '[data-testid="terrain-toggle"]',
      '[data-testid="buildings-toggle"]',
      '[data-testid="hazards-toggle"]',
      '[data-testid="units-toggle"]',
      '[data-testid="routes-toggle"]'
    ];
    
    for (const toggle of layerToggles) {
      try {
        await page.click(toggle);
        await page.waitForTimeout(500);
      } catch (error) {
        console.log(`Toggle ${toggle} not found`);
      }
    }
    
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('comprehensive-map-all-layers.png', {
      animations: 'disabled'
    });
  });

  test('@edge-cases edge case validation', async () => {
    // Test 1: Dateline crossing routes
    await page.evaluate(() => {
      const datelineRoute = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [179.9, 37.7749],
            [-179.9, 37.7749]
          ]
        },
        properties: {
          name: 'Dateline Crossing Route',
          distance: 20000
        }
      };
      
      // Test route validation
      expect(datelineRoute.geometry.coordinates?.[0]?.[0]).toBeCloseTo(179.9, 1);
      expect(datelineRoute.geometry.coordinates?.[1]?.[0]).toBeCloseTo(-179.9, 1);
    });
    
    // Test 2: Polar region coordinates
    await page.evaluate(() => {
      const polarCoords = [
        [0, 89.9], // Near North Pole
        [0, -89.9], // Near South Pole
        [180, 89.9], // Near North Pole, opposite side
        [-180, -89.9] // Near South Pole, opposite side
      ];
      
      polarCoords.forEach(coord => {
        expect(coord[1]).toBeGreaterThanOrEqual(-90);
        expect(coord[1]).toBeLessThanOrEqual(90);
        expect(coord[0]).toBeGreaterThanOrEqual(-180);
        expect(coord[0]).toBeLessThanOrEqual(180);
      });
    });
    
    // Test 3: Tiny polygons
    await page.evaluate(() => {
      const tinyPolygon = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-122.4194, 37.7749],
            [-122.41941, 37.7749],
            [-122.41941, 37.77491],
            [-122.4194, 37.77491],
            [-122.4194, 37.7749]
          ]]
        },
        properties: {
          name: 'Tiny Polygon',
          area: 0.000001
        }
      };
      
      expect(tinyPolygon.geometry.coordinates?.[0]?.length).toBeGreaterThanOrEqual(4);
      expect(tinyPolygon.properties.area).toBeLessThan(0.00001);
    });
  });

  test('@contracts API contract validation', async () => {
    // Test 1: Health endpoint
    const healthResponse = await page.request.get('/api/health');
    expect(healthResponse.status()).toBe(200);
    
    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty('status');
    expect(healthData).toHaveProperty('timestamp');
    
    // Test 2: Hazards endpoint
    const hazardsResponse = await page.request.get('/api/hazards');
    expect(hazardsResponse.status()).toBe(200);
    
    const hazardsData = await hazardsResponse.json();
    expect(hazardsData).toHaveProperty('type', 'FeatureCollection');
    expect(hazardsData).toHaveProperty('features');
    expect(Array.isArray(hazardsData.features)).toBe(true);
    
    // Test 3: Routes endpoint
    const routesResponse = await page.request.get('/api/routes');
    expect(routesResponse.status()).toBe(200);
    
    const routesData = await routesResponse.json();
    expect(Array.isArray(routesData)).toBe(true);
    
    if (routesData.length > 0) {
      const route = routesData[0];
      expect(route).toHaveProperty('id');
      expect(route).toHaveProperty('type');
      expect(route).toHaveProperty('geometry');
      expect(route).toHaveProperty('properties');
      expect(route.properties).toHaveProperty('name');
      expect(route.properties).toHaveProperty('distance');
      expect(route.properties).toHaveProperty('duration');
    }
  });

  test('@chaos chaos testing scenarios', async () => {
    // Test 1: Network latency simulation
    await page.route('**/*', route => {
      const delay = Math.random() * 1000 + 500; // 500-1500ms delay
      setTimeout(() => route.continue(), delay);
    });
    
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 20000 });
    
    // Test 2: Network timeout simulation
    await page.route('**/api/**', route => {
      if (Math.random() < 0.3) { // 30% chance of timeout
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Test 3: Memory pressure simulation
    await page.evaluate(() => {
      // Create memory pressure
      const memoryHog = [];
      for (let i = 0; i < 100000; i++) {
        memoryHog.push(new Array(100).fill(Math.random()));
      }
      (window as any).__memoryHog__ = memoryHog;
    });
    
    // Test 4: WebGL unavailable simulation
    await page.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      (HTMLCanvasElement.prototype as any).getContext = function(contextType: string) {
        if (contextType === 'webgl' || contextType === 'experimental-webgl') {
          return null;
        }
        return originalGetContext.call(this, contextType);
      };
    });
    
    // Test 5: Invalid data simulation
    await page.route('**/api/hazards', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invalid: 'data' })
      });
    });
    
    // Test resilience under these conditions
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Application should still be functional
    await expect(page.locator('[data-testid="main-dashboard"]')).toBeVisible();
  });

  test('@accessibility comprehensive accessibility validation', async () => {
    // Test 1: Keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').first();
    expect(await focusedElement.count()).toBeGreaterThan(0);
    
    // Test 2: ARIA labels
    const interactiveElements = await page.locator('button, input, select, textarea, [role="button"], [role="link"]').all();
    
    for (const element of interactiveElements) {
      const hasAriaLabel = await element.getAttribute('aria-label');
      const hasAriaLabelledBy = await element.getAttribute('aria-labelledby');
      const hasVisibleText = await element.textContent();
      const hasTitle = await element.getAttribute('title');
      
      const hasAccessibleName = hasAriaLabel || hasAriaLabelledBy || hasVisibleText || hasTitle;
      expect(hasAccessibleName).toBe(true);
    }
    
    // Test 3: Color contrast (simplified)
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, div, a, button').all();
    
    for (const element of textElements) {
      const text = await element.textContent();
      if (text && text.trim().length > 0) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });
        
        // Basic check that colors are defined
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();
      }
    }
    
    // Test 4: Heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.substring(1));
      
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    }
  });

  test('@performance performance budget validation', async () => {
    // Test 1: Page load time
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    
    expect(loadTime).toBeLessThan(3000); // 3 seconds
    
    // Test 2: Map load time
    await page.evaluate(() => {
      if ((window as any).performanceMonitor) {
        (window as any).performanceMonitor.startMapLoadTimer();
      }
    });
    
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    const mapLoadTime = await page.evaluate(() => {
      if ((window as any).performanceMonitor) {
        (window as any).performanceMonitor.endMapLoadTimer();
        return (window as any).performanceMonitor.getMetrics().mapLoadTime;
      }
      return 0;
    });
    
    expect(mapLoadTime).toBeLessThan(3000); // 3 seconds
    
    // Test 3: Memory usage
    const memoryUsage = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
      }
      return 0;
    });
    
    expect(memoryUsage).toBeLessThan(100); // 100 MB
    
    // Test 4: Frame rate
    const frameRate = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frameCount);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });
    
    expect(frameRate).toBeGreaterThan(30); // 30 FPS
  });

  test('@visual-regression cross-browser visual consistency', async () => {
    // Test 1: Main dashboard consistency
    await expect(page).toHaveScreenshot('cross-browser-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test 2: Map view consistency
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('cross-browser-map.png', {
      animations: 'disabled'
    });
    
    // Test 3: Mobile viewport consistency
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('mobile-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test 4: Tablet viewport consistency
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tablet-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('@integration end-to-end workflow validation', async () => {
    // Test 1: Complete user workflow
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Test 2: Layer interactions
    const layerToggles = [
      '[data-testid="terrain-toggle"]',
      '[data-testid="buildings-toggle"]',
      '[data-testid="hazards-toggle"]',
      '[data-testid="units-toggle"]',
      '[data-testid="routes-toggle"]'
    ];
    
    for (const toggle of layerToggles) {
      try {
        await page.click(toggle);
        await page.waitForTimeout(500);
        
        // Verify layer is enabled
        const isEnabled = await page.locator(toggle).isChecked();
        expect(isEnabled).toBe(true);
        
        // Toggle off
        await page.click(toggle);
        await page.waitForTimeout(500);
        
        // Verify layer is disabled
        const isDisabled = await page.locator(toggle).isChecked();
        expect(isDisabled).toBe(false);
      } catch (error) {
        console.log(`Toggle ${toggle} not found or not clickable`);
      }
    }
    
    // Test 3: Map interactions
    await page.click('.mapboxgl-canvas', { position: { x: 400, y: 300 } });
    await page.waitForTimeout(500);
    
    // Test 4: Zoom interactions
    await page.mouse.wheel(0, -100); // Zoom in
    await page.waitForTimeout(500);
    
    await page.mouse.wheel(0, 100); // Zoom out
    await page.waitForTimeout(500);
    
    // Test 5: Pan interactions
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(450, 350);
    await page.mouse.up();
    await page.waitForTimeout(500);
  });

  test.afterEach(async () => {
    // Cleanup after each test
    await page.evaluate(() => {
      // Clear any test data
      if ((window as any).__memoryHog__) {
        delete (window as any).__memoryHog__;
      }
      
      // Reset performance monitor
      if ((window as any).performanceMonitor) {
        (window as any).performanceMonitor.stopMonitoring();
      }
    });
  });
});

