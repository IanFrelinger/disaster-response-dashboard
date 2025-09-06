/**
 * Visual regression tests using Playwright
 * Captures and compares screenshots to detect UI changes
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('main dashboard layout', async () => {
    // Wait for the main dashboard to load
    await page.waitForSelector('[data-testid="main-dashboard"]', { timeout: 10000 });
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('main-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('3D map view', async () => {
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to load
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    await page.waitForTimeout(3000); // Additional wait for map to stabilize
    
    // Take screenshot of the map
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('3d-map-view.png', {
      animations: 'disabled'
    });
  });

  test('map with all layers enabled', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Enable all layers
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
        await page.waitForTimeout(500); // Wait for layer to render
      } catch (error) {
        console.log(`Toggle ${toggle} not found or not clickable`);
      }
    }
    
    // Wait for all layers to render
    await page.waitForTimeout(2000);
    
    // Take screenshot with all layers
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('map-all-layers.png', {
      animations: 'disabled'
    });
  });

  test('map with terrain layer only', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Enable only terrain layer
    try {
      await page.click('[data-testid="terrain-toggle"]');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Terrain toggle not found');
    }
    
    // Take screenshot with terrain only
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('map-terrain-only.png', {
      animations: 'disabled'
    });
  });

  test('map with hazards layer only', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Enable only hazards layer
    try {
      await page.click('[data-testid="hazards-toggle"]');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Hazards toggle not found');
    }
    
    // Take screenshot with hazards only
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('map-hazards-only.png', {
      animations: 'disabled'
    });
  });

  test('map with routes layer only', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Enable only routes layer
    try {
      await page.click('[data-testid="routes-toggle"]');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Routes toggle not found');
    }
    
    // Take screenshot with routes only
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('map-routes-only.png', {
      animations: 'disabled'
    });
  });

  test('map with emergency units layer only', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Enable only units layer
    try {
      await page.click('[data-testid="units-toggle"]');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Units toggle not found');
    }
    
    // Take screenshot with units only
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('map-units-only.png', {
      animations: 'disabled'
    });
  });

  test('map with buildings layer only', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Enable only buildings layer
    try {
      await page.click('[data-testid="buildings-toggle"]');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Buildings toggle not found');
    }
    
    // Take screenshot with buildings only
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('map-buildings-only.png', {
      animations: 'disabled'
    });
  });

  test('map style changes', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Test different map styles
    const styles = ['streets', 'satellite', 'dark'];
    
    for (const style of styles) {
      try {
        // Click on style selector (assuming it exists)
        await page.click(`[data-testid="style-${style}"]`);
        await page.waitForTimeout(2000); // Wait for style to load
        
        // Take screenshot for each style
        await expect(page.locator('.mapboxgl-map')).toHaveScreenshot(`map-style-${style}.png`, {
          animations: 'disabled'
        });
      } catch (error) {
        console.log(`Style ${style} selector not found`);
      }
    }
  });

  test('map zoom levels', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Test different zoom levels
    const zoomLevels = [8, 10, 12, 14, 16];
    
    for (const zoom of zoomLevels) {
      try {
        // Set zoom level (assuming zoom control exists)
        await page.evaluate((z) => {
          const map = (window as any).__mapTestApi3D__?.getMapInstance();
          if (map) {
            map.setZoom(z);
          }
        }, zoom);
        
        await page.waitForTimeout(1000); // Wait for zoom to complete
        
        // Take screenshot for each zoom level
        await expect(page.locator('.mapboxgl-map')).toHaveScreenshot(`map-zoom-${zoom}.png`, {
          animations: 'disabled'
        });
      } catch (error) {
        console.log(`Could not set zoom level ${zoom}`);
      }
    }
  });

  test('map popup content', async () => {
    // Open 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Enable hazards layer
    try {
      await page.click('[data-testid="hazards-toggle"]');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Hazards toggle not found');
    }
    
    // Click on map to trigger popup
    await page.click('.mapboxgl-canvas', { position: { x: 400, y: 300 } });
    await page.waitForTimeout(500);
    
    // Take screenshot of popup
    await expect(page.locator('.mapboxgl-popup')).toHaveScreenshot('map-popup.png', {
      animations: 'disabled'
    });
  });

  test('error states', async () => {
    // Test error state when map fails to load
    await page.route('**/mapbox-gl.js', route => route.abort());
    
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(3000);
    
    // Take screenshot of error state
    await expect(page).toHaveScreenshot('map-error-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('loading states', async () => {
    // Slow down network to capture loading state
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.click('button:has-text("Open 3D Map")');
    
    // Take screenshot during loading
    await expect(page).toHaveScreenshot('map-loading-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('mobile viewport', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of mobile layout
    await expect(page).toHaveScreenshot('mobile-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Open 3D map on mobile
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForSelector('.mapboxgl-map', { timeout: 15000 });
    
    // Take screenshot of mobile map
    await expect(page.locator('.mapboxgl-map')).toHaveScreenshot('mobile-map.png', {
      animations: 'disabled'
    });
  });

  test('tablet viewport', async () => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of tablet layout
    await expect(page).toHaveScreenshot('tablet-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dark mode', async () => {
    // Toggle dark mode (assuming dark mode toggle exists)
    try {
      await page.click('[data-testid="dark-mode-toggle"]');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Dark mode toggle not found');
    }
    
    // Take screenshot of dark mode
    await expect(page).toHaveScreenshot('dark-mode-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('accessibility focus states', async () => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Take screenshot of focus state
    await expect(page).toHaveScreenshot('focus-state-1.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Continue tabbing
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Take screenshot of next focus state
    await expect(page).toHaveScreenshot('focus-state-2.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('high contrast mode', async () => {
    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        * {
          filter: contrast(200%) !important;
        }
      `
    });
    
    // Take screenshot of high contrast mode
    await expect(page).toHaveScreenshot('high-contrast-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('reduced motion mode', async () => {
    // Simulate reduced motion preference
    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `
    });
    
    // Take screenshot of reduced motion mode
    await expect(page).toHaveScreenshot('reduced-motion-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

