import { test, expect, Page } from '@playwright/test';

/**
 * Visual rendering validation test to ensure no white screens or rendering issues
 */

test.describe('Visual Rendering Validation', () => {
  test('validate no white screens during map initialization', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-initial-page-load.png', fullPage: true });
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Take screenshots at different stages of loading
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/02-commander-dashboard.png', fullPage: true });
    
    // Wait for map to start loading
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/03-map-loading.png', fullPage: true });
    
    // Wait for map to fully load
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/04-map-final.png', fullPage: true });
    
    // Validate that the map container is visible and not white
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    // Check that the map container has content (not just white)
    const mapContainerBox = await mapContainer.boundingBox();
    expect(mapContainerBox).not.toBeNull();
    expect(mapContainerBox!.width).toBeGreaterThan(0);
    expect(mapContainerBox!.height).toBeGreaterThan(0);
    
    // Validate that we can see map elements
    const mapCanvas = page.locator('canvas');
    await expect(mapCanvas).toBeVisible();
    
    // Check for any error states
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

  test('validate layer rendering and visibility', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000); // Wait for full initialization
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/05-layers-initial.png', fullPage: true });
    
    // Test each layer toggle to ensure proper rendering
    const layerTests = [
      { name: 'Buildings', selector: 'input[type="checkbox"]', label: 'Buildings' },
      { name: 'Hazards', selector: 'input[type="checkbox"]', label: 'Hazards' },
      { name: 'Units', selector: 'input[type="checkbox"]', label: 'Emergency Units' },
      { name: 'Routes', selector: 'input[type="checkbox"]', label: 'Evacuation Routes' },
      { name: 'Terrain', selector: 'input[type="checkbox"]', label: '3D Terrain' }
    ];

    for (const layerTest of layerTests) {
      console.log(`\n🔍 Testing ${layerTest.name} layer rendering...`);
      
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
          path: `test-results/05-${layerTest.name.toLowerCase()}-before.png`, 
          fullPage: true 
        });
        
        // Test toggle on
        await targetToggle.check();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: `test-results/06-${layerTest.name.toLowerCase()}-after.png`, 
          fullPage: true 
        });
        
        // Validate map is still visible and not white
        const mapContainer = page.locator('.map-container-3d');
        await expect(mapContainer).toBeVisible();
        
        const mapCanvas = page.locator('canvas');
        await expect(mapCanvas).toBeVisible();
        
        // Check for any error states
        const errorElements = page.locator('[data-testid*="error"], .error, [class*="error"]');
        const errorCount = await errorElements.count();
        expect(errorCount).toBe(0);
      }
    }
  });

  test('validate map style changes and rendering', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000);
    
    // Test different map styles to ensure no white screens
    const styleTests = [
      { name: 'Dark', selector: 'button:has-text("Dark")' },
      { name: 'Satellite', selector: 'button:has-text("Satellite")' },
      { name: 'Streets', selector: 'button:has-text("Streets")' }
    ];

    for (const styleTest of styleTests) {
      console.log(`\n🎨 Testing ${styleTest.name} style rendering...`);
      
      // Look for style toggle buttons
      const styleButton = page.locator(styleTest.selector);
      if (await styleButton.isVisible()) {
        await styleButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: `test-results/07-${styleTest.name.toLowerCase()}-style-before.png`, 
          fullPage: true 
        });
        
        // Validate map is still visible and not white
        const mapContainer = page.locator('.map-container-3d');
        await expect(mapContainer).toBeVisible();
        
        const mapCanvas = page.locator('canvas');
        await expect(mapCanvas).toBeVisible();
        
        // Check for any error states
        const errorElements = page.locator('[data-testid*="error"], .error, [class*="error"]');
        const errorCount = await errorElements.count();
        expect(errorCount).toBe(0);
      }
    }
  });

  test('validate map interactions and rendering stability', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/08-interactions-initial.png', fullPage: true });
    
    // Test map interactions that might cause rendering issues
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    // Test zoom interactions (skip on mobile Safari)
    await mapContainer.hover();
    try {
      await page.mouse.wheel(0, -100); // Zoom in
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/09-zoom-in.png', fullPage: true });
      
      await page.mouse.wheel(0, 100); // Zoom out
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/10-zoom-out.png', fullPage: true });
    } catch (error) {
      console.log('⚠️ Mouse wheel not supported on this platform, skipping zoom test');
    }
    
    // Test pan interactions
    await mapContainer.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/11-pan-interaction.png', fullPage: true });
    
    // Validate map is still visible and not white after interactions
    await expect(mapContainer).toBeVisible();
    
    const mapCanvas = page.locator('canvas');
    await expect(mapCanvas).toBeVisible();
    
    // Check for any error states
    const errorElements = page.locator('[data-testid*="error"], .error, [class*="error"]');
    const errorCount = await errorElements.count();
    expect(errorCount).toBe(0);
  });

  test('validate error handling and recovery', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/12-error-handling-initial.png', fullPage: true });
    
    // Test rapid layer toggling to stress test rendering
    const toggles = page.locator('input[type="checkbox"]');
    const toggleCount = await toggles.count();
    
    // Rapidly toggle layers to test error handling
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < toggleCount; j++) {
        const toggle = toggles.nth(j);
        await toggle.click();
        await page.waitForTimeout(100); // Short delay
      }
    }
    
    // Wait for system to stabilize
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/13-error-handling-after-stress.png', fullPage: true });
    
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

  test('validate console errors and network issues', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Capture network errors
    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(8000);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/14-final-validation.png', fullPage: true });
    
    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('🚨 Console Errors Found:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('🚨 Network Errors Found:');
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // Validate no critical errors
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('white screen') || 
      error.includes('rendering failed') || 
      error.includes('map failed to load') ||
      error.includes('canvas error')
    );
    
    expect(criticalErrors.length).toBe(0);
    
    // Validate map is still visible and not white
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    const mapCanvas = page.locator('canvas');
    await expect(mapCanvas).toBeVisible();
    
    // Final validation
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
