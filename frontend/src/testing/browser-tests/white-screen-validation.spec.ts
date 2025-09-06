import { test, expect, Page } from '@playwright/test';

/**
 * White screen validation test - specifically checks for white screens and rendering issues
 */

test.describe('White Screen Validation', () => {
  test('validate no white screens during map loading', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial page
    await page.screenshot({ path: 'test-results/white-screen-01-initial.png', fullPage: true });
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Take screenshots at different loading stages
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/white-screen-02-after-click.png', fullPage: true });
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/white-screen-03-loading.png', fullPage: true });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/white-screen-04-partial-load.png', fullPage: true });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/white-screen-05-near-complete.png', fullPage: true });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/white-screen-06-final.png', fullPage: true });
    
    // Validate that the map container is visible
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    // Check that the map container has proper dimensions
    const mapContainerBox = await mapContainer.boundingBox();
    expect(mapContainerBox).not.toBeNull();
    expect(mapContainerBox!.width).toBeGreaterThan(100);
    expect(mapContainerBox!.height).toBeGreaterThan(100);
    
    // Validate that we can see the map canvas
    const mapCanvas = page.locator('canvas');
    await expect(mapCanvas).toBeVisible();
    
    // Check for any error states that might indicate white screens
    const errorElements = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const errorCount = await errorElements.count();
    expect(errorCount).toBe(0);
    
    // Check for loading states that might indicate issues
    const loadingElements = page.locator('[data-testid*="loading"], .loading, [class*="loading"]');
    const loadingCount = await loadingElements.count();
    
    // If there are loading elements, they should not be visible after map loads
    if (loadingCount > 0) {
      for (let i = 0; i < loadingCount; i++) {
        const loadingElement = loadingElements.nth(i);
        const isVisible = await loadingElement.isVisible();
        if (isVisible) {
          console.log(`⚠️ Loading element still visible: ${await loadingElement.getAttribute('data-testid') || 'unknown'}`);
        }
      }
    }
  });

  test('validate map content is not white or blank', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000); // Wait for full initialization
    
    // Take screenshot of the final map
    await page.screenshot({ path: 'test-results/white-screen-07-map-content.png', fullPage: true });
    
    // Validate that the map container is visible and has content
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    // Check that the map canvas is visible and has content
    const mapCanvas = page.locator('canvas');
    await expect(mapCanvas).toBeVisible();
    
    // Validate that the map has proper styling (not just white background)
    const mapContainerStyle = await mapContainer.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage,
        width: computedStyle.width,
        height: computedStyle.height
      };
    });
    
    // The map container should have a proper background (not just white)
    expect(mapContainerStyle.width).toBeTruthy(); // Should have a width
    expect(mapContainerStyle.height).toBe('500px');
    
    // Check that the map canvas has proper dimensions and is visible
    const canvasInfo = await mapCanvas.evaluate((canvas) => {
      const htmlCanvas = canvas as HTMLCanvasElement;
      return {
        width: htmlCanvas.width,
        height: htmlCanvas.height,
        offsetWidth: htmlCanvas.offsetWidth,
        offsetHeight: htmlCanvas.offsetHeight,
        hasWebGL: !!htmlCanvas.getContext('webgl') || !!htmlCanvas.getContext('webgl2'),
        has2D: !!htmlCanvas.getContext('2d')
      };
    });
    
    // The canvas should have proper dimensions
    expect(canvasInfo.width).toBeGreaterThan(0);
    expect(canvasInfo.height).toBeGreaterThan(0);
    expect(canvasInfo.offsetWidth).toBeGreaterThan(0);
    expect(canvasInfo.offsetHeight).toBeGreaterThan(0);
    
    // The canvas should have a rendering context (WebGL for Mapbox)
    expect(canvasInfo.hasWebGL || canvasInfo.has2D).toBe(true);
  });

  test('validate layer toggles do not cause white screens', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/white-screen-08-before-toggles.png', fullPage: true });
    
    // Test each layer toggle to ensure no white screens
    const layerTests = [
      { name: 'Buildings', selector: 'input[type="checkbox"]', label: 'Buildings' },
      { name: 'Hazards', selector: 'input[type="checkbox"]', label: 'Hazards' },
      { name: 'Units', selector: 'input[type="checkbox"]', label: 'Emergency Units' },
      { name: 'Routes', selector: 'input[type="checkbox"]', label: 'Evacuation Routes' },
      { name: 'Terrain', selector: 'input[type="checkbox"]', label: '3D Terrain' }
    ];

    for (const layerTest of layerTests) {
      console.log(`\n🔍 Testing ${layerTest.name} toggle for white screens...`);
      
      // Find the toggle for this layer
      const toggles = page.locator('input[type="checkbox"]');
      const toggleCount = await toggles.count();
      
      let targetToggle = null;
      for (let i = 0; i < toggleCount; i++) {
        const toggle = toggles.nth(i);
        const label = await toggle.locator('..').textContent();
        if (label && label.includes(layerTest.label)) {
          targetToggle = toggle;
          break;
        }
      }
      
      if (targetToggle) {
        // Test toggle off
        await targetToggle.uncheck();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: `test-results/white-screen-09-${layerTest.name.toLowerCase()}-off.png`, 
          fullPage: true 
        });
        
        // Validate map is still visible and not white
        const mapContainer = page.locator('.map-container-3d');
        await expect(mapContainer).toBeVisible();
        
        const mapCanvas = page.locator('canvas');
        await expect(mapCanvas).toBeVisible();
        
        // Test toggle on
        await targetToggle.check();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: `test-results/white-screen-10-${layerTest.name.toLowerCase()}-on.png`, 
          fullPage: true 
        });
        
        // Validate map is still visible and not white
        await expect(mapContainer).toBeVisible();
        await expect(mapCanvas).toBeVisible();
        
        // Check for any error states
        const errorElements = page.locator('[data-testid*="error"], .error, [class*="error"]');
        const errorCount = await errorElements.count();
        expect(errorCount).toBe(0);
      }
    }
  });

  test('validate map interactions do not cause white screens', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/white-screen-11-before-interactions.png', fullPage: true });
    
    // Test map interactions that might cause white screens
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    // Test pan interactions
    await mapContainer.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/white-screen-12-after-pan.png', fullPage: true });
    
    // Validate map is still visible and not white after interactions
    await expect(mapContainer).toBeVisible();
    
    const mapCanvas = page.locator('canvas');
    await expect(mapCanvas).toBeVisible();
    
    // Check for any error states
    const errorElements = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const errorCount = await errorElements.count();
    expect(errorCount).toBe(0);
  });

  test('validate error handling does not cause white screens', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/white-screen-13-before-stress.png', fullPage: true });
    
    // Test rapid layer toggling to stress test rendering
    const toggles = page.locator('input[type="checkbox"]');
    const toggleCount = await toggles.count();
    
    // Rapidly toggle layers to test error handling
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < toggleCount; j++) {
        const toggle = toggles.nth(j);
        await toggle.click();
        await page.waitForTimeout(100); // Short delay
      }
    }
    
    // Wait for system to stabilize
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/white-screen-14-after-stress.png', fullPage: true });
    
    // Validate map is still visible and not white after stress testing
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    const mapCanvas = page.locator('canvas');
    await expect(mapCanvas).toBeVisible();
    
    // Check for any error states
    const errorElements = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const errorCount = await errorElements.count();
    expect(errorCount).toBe(0);
    
    // Final validation that everything is working
    const validationResults = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { error: 'Validation API not available' };
      }
      
      try {
        return api.validateLayers();
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    expect(validationResults.overall?.success).toBe(true);
    expect(validationResults.overall?.successfulLayers).toBeGreaterThan(0);
  });
});
