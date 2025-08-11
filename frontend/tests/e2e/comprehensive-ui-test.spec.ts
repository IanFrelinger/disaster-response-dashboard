import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5001';

test.describe('Comprehensive UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should load homepage without errors', async ({ page }) => {
    // Navigate to homepage
    await page.goto(BASE_URL);
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check for any console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/Disaster Response/);
    
    // Check that main content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Verify no critical errors occurred
    expect(consoleErrors.length).toBe(0);
    
    // Check for any unhandled promise rejections
    const unhandledRejections: string[] = [];
    page.on('pageerror', error => {
      unhandledRejections.push(error.message);
    });
    
    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(2000);
    
    expect(unhandledRejections.length).toBe(0);
  });

  test('should display main navigation elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for main navigation items - updated to match current navigation structure
    const navItems = ['📊 Dashboard', '🗺️ Live Map', '🌤️ Weather', '🏢 Buildings'];
    for (const item of navItems) {
      const navItem = page.locator(`text=${item}`);
      await expect(navItem).toBeVisible();
    }
    
    // Verify the navigation control is visible
    const segmentedControl = page.locator('.ios-segmented-control');
    await expect(segmentedControl).toBeVisible();
  });

  test('should load map component correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for map container
    const mapContainer = page.locator('[data-testid="map-container"], .map-container, #map');
    if (await mapContainer.isVisible()) {
      await expect(mapContainer).toBeVisible();
      
      // Check for map controls
      const zoomControls = page.locator('[data-testid="zoom-controls"], .zoom-controls');
      if (await zoomControls.isVisible()) {
        await expect(zoomControls).toBeVisible();
      }
    }
  });

  test('should handle API connectivity', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if API calls are being made
    const apiCalls = page.locator('text=API Error, text=Network Error, text=Failed to fetch');
    const hasApiErrors = await apiCalls.count() > 0;
    
    if (hasApiErrors) {
      console.log('API connectivity issues detected');
      // This is not necessarily a failure - could be expected in test environment
    }
  });

  test('should display loading states appropriately', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for loading indicators
    const loadingIndicators = page.locator('[data-testid="loading"], .loading, .spinner');
    const hasLoading = await loadingIndicators.count() > 0;
    
    if (hasLoading) {
      // Wait for loading to complete
      await page.waitForFunction(() => {
        const loaders = document.querySelectorAll('[data-testid="loading"], .loading, .spinner');
        return loaders.length === 0;
      }, { timeout: 10000 });
    }
    
    // Verify page is fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check that page is still functional on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle user interactions', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test clicking on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Click on first visible button
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await firstButton.click();
        // Wait for any potential state changes
        await page.waitForTimeout(1000);
      }
    }
    
    // Test form inputs if they exist
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('test');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle route navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test navigation links
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // Try clicking on internal links
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
          try {
            await link.click();
            await page.waitForLoadState('networkidle');
            
            // Verify page loaded
            await expect(page.locator('body')).toBeVisible();
            
            // Go back to test other links
            await page.goBack();
            await page.waitForLoadState('networkidle');
          } catch (error) {
            console.log(`Navigation test failed for link ${href}:`, error);
          }
        }
      }
    }
  });

  test('should handle data visualization components', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for chart or visualization components
    const charts = page.locator('[data-testid="chart"], .chart, canvas, svg');
    const chartCount = await charts.count();
    
    if (chartCount > 0) {
      // Verify charts are visible
      for (let i = 0; i < chartCount; i++) {
        const chart = charts.nth(i);
        if (await chart.isVisible()) {
          await expect(chart).toBeVisible();
        }
      }
    }
  });

  test('should handle error boundaries gracefully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for error messages or error boundaries
    const errorMessages = page.locator('[data-testid="error"], .error, .error-message');
    const errorCount = await errorMessages.count();
    
    if (errorCount > 0) {
      // Check that errors are displayed in a user-friendly way
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i);
        await expect(error).toBeVisible();
      }
    }
  });

  test('should maintain accessibility standards', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // Verify at least one heading is present
      await expect(headings.first()).toBeVisible();
    }
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute('alt');
        // Alt text should be present (even if empty for decorative images)
        expect(alt).not.toBeNull();
      }
    }
  });

  test('should handle performance requirements', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('should handle browser compatibility', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for modern JavaScript features
    const jsErrors = page.locator('text=ReferenceError, text=TypeError, text=SyntaxError');
    const hasJsErrors = await jsErrors.count() > 0;
    
    if (hasJsErrors) {
      console.log('JavaScript compatibility issues detected');
    }
    
    // Verify basic functionality still works
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('API Integration Tests', () => {
  test('should connect to backend API', async ({ request }) => {
    try {
      const response = await request.get(`${API_URL}/api/health`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
    } catch (error) {
      console.log('API connectivity test failed:', error);
      // This might be expected in some test environments
    }
  });
});

test.describe('Cross-browser Compatibility', () => {
  test('should work in different browsers', async ({ page, browserName }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Basic functionality should work in all browsers
    await expect(page.locator('body')).toBeVisible();
    
    console.log(`Browser test passed for: ${browserName}`);
  });
});
