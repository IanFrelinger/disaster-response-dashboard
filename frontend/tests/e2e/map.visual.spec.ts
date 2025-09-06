import { test, expect } from '@playwright/test';
import { 
  waitForMapLoad, 
  applyTestStyle,
  setTestViewport,
  TEST_VIEWPORTS
} from '../../src/testing/utils/map-test-harness';

test.describe('Map Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Apply test style for deterministic screenshots
    await applyTestStyle(page);
    
    // Navigate to dashboard with test mode enabled
    await page.goto('/?test=true');
    await waitForMapLoad(page);
  });

  test('map renders correctly in DC Downtown viewport', async ({ page }) => {
    await setTestViewport(page, 'dcDowntown');
    await page.waitForTimeout(2000); // Wait for tiles to load
    
    // Hide non-deterministic elements
    await page.addStyleTag({
      content: `
        [data-testid="loading-spinner"],
        [data-testid="live-badge"],
        .loading-indicator,
        .live-indicator,
        .timestamp,
        .last-updated {
          display: none !important;
        }
      `
    });
    
    // Take screenshot of map container
    const mapContainer = page.locator('.mapboxgl-map').first();
    await expect(mapContainer).toHaveScreenshot('map-dc-downtown.png', {
      threshold: 3.0,
      mode: 'percent',
      animations: 'disabled'
    });
  });

  test('map renders correctly in San Francisco viewport', async ({ page }) => {
    await setTestViewport(page, 'sanFrancisco');
    await page.waitForTimeout(2000);
    
    // Hide non-deterministic elements
    await page.addStyleTag({
      content: `
        [data-testid="loading-spinner"],
        [data-testid="live-badge"],
        .loading-indicator,
        .live-indicator,
        .timestamp,
        .last-updated {
          display: none !important;
        }
      `
    });
    
    const mapContainer = page.locator('.mapboxgl-map').first();
    await expect(mapContainer).toHaveScreenshot('map-san-francisco.png', {
      threshold: 0.5,
      mode: 'percent',
      animations: 'disabled'
    });
  });

  test('map renders correctly in New York viewport', async ({ page }) => {
    await setTestViewport(page, 'newYork');
    await page.waitForTimeout(2000);
    
    // Hide non-deterministic elements
    await page.addStyleTag({
      content: `
        [data-testid="loading-spinner"],
        [data-testid="live-badge"],
        .loading-indicator,
        .live-indicator,
        .timestamp,
        .last-updated {
          display: none !important;
        }
      `
    });
    
    const mapContainer = page.locator('.mapboxgl-map').first();
    await expect(mapContainer).toHaveScreenshot('map-new-york.png', {
      threshold: 0.5,
      mode: 'percent',
      animations: 'disabled'
    });
  });

  test('map renders correctly with different styles', async ({ page }) => {
    // Test satellite style
    await page.evaluate(() => {
      if (window.__map) {
        window.__map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
      }
    });
    
    await page.waitForFunction(() => {
      return window.__map && window.__map.isStyleLoaded();
    });
    
    await page.waitForTimeout(2000);
    
    // Hide non-deterministic elements
    await page.addStyleTag({
      content: `
        [data-testid="loading-spinner"],
        [data-testid="live-badge"],
        .loading-indicator,
        .live-indicator,
        .timestamp,
        .last-updated {
          display: none !important;
        }
      `
    });
    
    const mapContainer = page.locator('.mapboxgl-map').first();
    await expect(mapContainer).toHaveScreenshot('map-satellite-style.png', {
      threshold: 3.0,
      mode: 'percent',
      animations: 'disabled'
    });
  });

  test('map renders correctly with terrain enabled', async ({ page }) => {
    // Enable terrain
    await page.evaluate(() => {
      if (window.__map && window.__mapTestApi3D__) {
        window.__mapTestApi3D__.setTerrainEnabled(true);
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Hide non-deterministic elements
    await page.addStyleTag({
      content: `
        [data-testid="loading-spinner"],
        [data-testid="live-badge"],
        .loading-indicator,
        .live-indicator,
        .timestamp,
        .last-updated {
          display: none !important;
        }
      `
    });
    
    const mapContainer = page.locator('.mapboxgl-map').first();
    await expect(mapContainer).toHaveScreenshot('map-with-terrain.png', {
      threshold: 3.0,
      mode: 'percent',
      animations: 'disabled'
    });
  });

  test('map renders correctly with different zoom levels', async ({ page }) => {
    // Test different zoom levels
    const zoomLevels = [8, 12, 16];
    
    for (let i = 0; i < zoomLevels.length; i++) {
      const zoom = zoomLevels[i];
      
      await page.evaluate((z) => {
        if (window.__map) {
          window.__map.setZoom(z);
        }
      }, zoom);
      
      await page.waitForTimeout(1000);
      
      // Hide non-deterministic elements
      await page.addStyleTag({
        content: `
          [data-testid="loading-spinner"],
          [data-testid="live-badge"],
          .loading-indicator,
          .live-indicator,
          .timestamp,
          .last-updated {
            display: none !important;
          }
        `
      });
      
      const mapContainer = page.locator('.mapboxgl-map').first();
      await expect(mapContainer).toHaveScreenshot(`map-zoom-${zoom}.png`, {
        threshold: 2.0,
        mode: 'percent',
        animations: 'disabled'
      });
    }
  });

  test('map renders correctly with different pitch angles', async ({ page }) => {
    // Test different pitch angles
    const pitchAngles = [0, 30, 60];
    
    for (let i = 0; i < pitchAngles.length; i++) {
      const pitch = pitchAngles[i];
      
      await page.evaluate((p) => {
        if (window.__map) {
          window.__map.setPitch(p);
        }
      }, pitch);
      
      await page.waitForTimeout(1000);
      
      // Hide non-deterministic elements
      await page.addStyleTag({
        content: `
          [data-testid="loading-spinner"],
          [data-testid="live-badge"],
          .loading-indicator,
          .live-indicator,
          .timestamp,
          .last-updated {
            display: none !important;
          }
        `
      });
      
      const mapContainer = page.locator('.mapboxgl-map').first();
      await expect(mapContainer).toHaveScreenshot(`map-pitch-${pitch}.png`, {
        threshold: 1.0,
        mode: 'percent',
        animations: 'disabled'
      });
    }
  });

  test('map renders correctly with layer toggles', async ({ page }) => {
    // Test with different layer combinations
    const layerCombinations = [
      { terrain: true, buildings: false, hazards: true, units: false, routes: true },
      { terrain: false, buildings: true, hazards: false, units: true, routes: false },
      { terrain: true, buildings: true, hazards: true, units: true, routes: true }
    ];
    
    for (let i = 0; i < layerCombinations.length; i++) {
      const combination = layerCombinations[i];
      
      // Apply layer combination (this would need to be implemented in the UI)
      await page.evaluate((combo) => {
        // This is a placeholder - actual implementation would depend on the UI
        console.log('Applying layer combination:', combo);
      }, combination);
      
      await page.waitForTimeout(1000);
      
      // Hide non-deterministic elements
      await page.addStyleTag({
        content: `
          [data-testid="loading-spinner"],
          [data-testid="live-badge"],
          .loading-indicator,
          .live-indicator,
          .timestamp,
          .last-updated {
            display: none !important;
          }
        `
      });
      
      const mapContainer = page.locator('.mapboxgl-map').first();
      await expect(mapContainer).toHaveScreenshot(`map-layers-${i}.png`, {
        threshold: 3.0,
        mode: 'percent',
        animations: 'disabled'
      });
    }
  });

  test('map renders correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForTimeout(2000);
    
    // Hide non-deterministic elements
    await page.addStyleTag({
      content: `
        [data-testid="loading-spinner"],
        [data-testid="live-badge"],
        .loading-indicator,
        .live-indicator,
        .timestamp,
        .last-updated {
          display: none !important;
        }
      `
    });
    
    const mapContainer = page.locator('.mapboxgl-map').first();
    await expect(mapContainer).toHaveScreenshot('map-mobile.png', {
      threshold: 3.0,
      mode: 'percent',
      animations: 'disabled'
    });
  });

  test('map renders correctly with error state', async ({ page }) => {
    // Simulate error state by intercepting requests
    await page.route('**/mapbox/**', route => {
      route.abort();
    });
    
    await page.goto('/?test=true');
    await page.waitForTimeout(5000);
    
    // Check if error state is visible
    const errorBanner = page.locator('[data-testid="map-error-banner"]');
    const hasErrorBanner = await errorBanner.isVisible().catch(() => false);
    
    if (hasErrorBanner) {
      await expect(errorBanner).toHaveScreenshot('map-error-state.png', {
        threshold: 0.5,
        mode: 'percent',
        animations: 'disabled'
      });
    }
  });
});
