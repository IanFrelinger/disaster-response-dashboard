import { test, expect } from '@playwright/test';

// Disable parallel execution to prevent test conflicts
test.describe.configure({ mode: 'serial' });

test.describe('UI Overlap Fix Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main application using baseURL from config
    await page.goto('/');
    
    // Wait for the page to load and then navigate to the map view
    await page.waitForSelector('text=🗺️ Live Map', { timeout: 10000 });
    await page.click('text=🗺️ Live Map');
    
    // Wait for the map to load
    await page.waitForSelector('.mapboxgl-map', { timeout: 30000 });
  });

  test('should not have map controls panel', async ({ page }) => {
    // Verify that the "3D Map Controls" text is not present
    const controlsText = page.locator('text=3D Map Controls');
    await expect(controlsText).not.toBeVisible();
    
    // Verify that the "Drag to rotate" text is not present
    const dragText = page.locator('text=Drag to rotate');
    await expect(dragText).not.toBeVisible();
    
    // Verify that the "Zoom in/out" text is not present
    const zoomText = page.locator('text=Zoom in/out');
    await expect(zoomText).not.toBeVisible();
  });

  test('should have analytics panel in correct position', async ({ page }) => {
    // Wait for analytics panel to be visible
    await page.waitForSelector('.analytics-panel', { timeout: 10000 });
    
    // Verify analytics panel is positioned at bottom-left
    const analyticsPanel = page.locator('.analytics-panel');
    const panelBox = await analyticsPanel.boundingBox();
    
    if (panelBox) {
      // Should be near bottom-left (allowing for some margin)
      expect(panelBox.y).toBeGreaterThan(400); // Near bottom
      expect(panelBox.x).toBeLessThan(100); // Near left (allowing for more margin)
    }
  });

  test('should not have overlapping text elements', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check for any obvious text overlaps by examining positioning
    const textElements = page.locator('h1, h2, h3, h4, h5, h6, p, span');
    const count = await textElements.count();
    
    // Verify we have text elements
    expect(count).toBeGreaterThan(0);
    
    // Check that no text elements are positioned at the exact same coordinates
    const positions = new Set();
    for (let i = 0; i < count; i++) {
      const element = textElements.nth(i);
      const box = await element.boundingBox();
      if (box) {
        const pos = `${Math.round(box.x)},${Math.round(box.y)}`;
        expect(positions.has(pos)).toBeFalsy();
        positions.add(pos);
      }
    }
  });

  test('should use iOS color variables', async ({ page }) => {
    // Check that the page has iOS CSS variables loaded
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      return {
        iosRed: computedStyle.getPropertyValue('--ios-red'),
        iosBlue: computedStyle.getPropertyValue('--ios-blue'),
        iosGreen: computedStyle.getPropertyValue('--ios-green'),
        iosOrange: computedStyle.getPropertyValue('--ios-orange')
      };
    });
    
    // Verify iOS color variables are defined
    expect(cssVariables.iosRed).toBeTruthy();
    expect(cssVariables.iosBlue).toBeTruthy();
    expect(cssVariables.iosGreen).toBeTruthy();
    expect(cssVariables.iosOrange).toBeTruthy();
  });

  test('should have proper spacing between UI elements', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check that UI elements have proper spacing
    const uiElements = page.locator('.analytics-panel, .weather-panel, .hazard-tooltip');
    const count = await uiElements.count();
    
    if (count > 1) {
      // Check spacing between elements
      for (let i = 0; i < count - 1; i++) {
        const element1 = uiElements.nth(i);
        const element2 = uiElements.nth(i + 1);
        
        const box1 = await element1.boundingBox();
        const box2 = await element2.boundingBox();
        
        if (box1 && box2) {
          // Elements should not overlap
          const overlap = !(box1.x + box1.width < box2.x || 
                           box2.x + box2.width < box1.x ||
                           box1.y + box1.height < box2.y || 
                           box2.y + box2.height < box1.y);
          
          expect(overlap).toBeFalsy();
        }
      }
    }
  });
});
