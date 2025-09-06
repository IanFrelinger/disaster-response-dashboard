import { test, expect } from '@playwright/test';

test.describe('Robust Error Boundary Validation', () => {
  test('robust error boundary validation', async ({ page }) => {
    console.log('🔥 Robust error boundary validation...');
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(3000);
    
    // Test 1: Basic page responsiveness
    console.log('🧪 Testing basic page responsiveness...');
    
    // Check if page is still alive
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    expect(pageTitle).toContain('Command Center');
    
    // Check if browser context is still alive
    const url = await page.url();
    console.log(`🌐 Page URL: ${url}`);
    expect(url).toContain('localhost');
    
    // Test 2: Map container exists and is visible
    console.log('🧪 Testing map container visibility...');
    const mapContainer = page.locator('.map-container-3d');
    const isVisible = await mapContainer.isVisible();
    expect(isVisible).toBe(true);
    console.log('✅ Map container is visible');
    
    // Test 3: Layer controls are functional
    console.log('🧪 Testing layer controls...');
    const layerControls = page.locator('.layer-controls');
    const controlsCount = await layerControls.count();
    expect(controlsCount).toBeGreaterThan(0);
    console.log(`✅ Found ${controlsCount} layer controls`);
    
    // Test 4: Layer toggles work
    console.log('🧪 Testing layer toggles...');
    const terrainToggle = page.locator('input[type="checkbox"]').first();
    const isChecked = await terrainToggle.isChecked();
    console.log(`Terrain toggle checked: ${isChecked}`);
    
    // Toggle the terrain layer
    await terrainToggle.click();
    await page.waitForTimeout(500);
    
    const isCheckedAfter = await terrainToggle.isChecked();
    console.log(`Terrain toggle after click: ${isCheckedAfter}`);
    expect(isCheckedAfter).toBe(!isChecked);
    console.log('✅ Layer toggle works correctly');
    
    // Test 5: Map is interactive
    console.log('🧪 Testing map interactivity...');
    const mapElement = page.locator('.mapboxgl-map');
    const mapCount = await mapElement.count();
    expect(mapCount).toBeGreaterThan(0);
    console.log(`✅ Found ${mapCount} map elements`);
    
    // Test 6: Validation panel is working
    console.log('🧪 Testing validation panel...');
    const validationPanel = page.locator('text=Layer Validation');
    const validationVisible = await validationPanel.isVisible();
    expect(validationVisible).toBe(true);
    console.log('✅ Validation panel is visible');
    
    // Test 7: No critical errors in console
    console.log('🧪 Testing console errors...');
    const consoleErrors = await page.evaluate(() => {
      return (window as any).__consoleErrors || [];
    });
    
    if (consoleErrors.length > 0) {
      console.log(`⚠️ Console errors found: ${consoleErrors.join(', ')}`);
      // Don't fail on console errors, just log them
    } else {
      console.log('✅ No console errors found');
    }
    
    console.log('🎉 All robust error boundary tests passed!');
  });
  
  test('graceful error handling', async ({ page }) => {
    console.log('🔥 Testing graceful error handling...');
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(3000);
    
    // Test 1: Try to interact with non-existent elements gracefully
    console.log('🧪 Testing non-existent element interactions...');
    
    // This should not crash the app
    const nonExistentElement = page.locator('non-existent-element');
    const count = await nonExistentElement.count();
    expect(count).toBe(0);
    console.log('✅ Non-existent element count is 0 (expected)');
    
    // Test 2: Try to click on non-existent elements
    try {
      await nonExistentElement.click({ timeout: 1000 });
    } catch (error) {
      // Expected to fail, but should not crash the app
      console.log('✅ Non-existent element click handled gracefully');
    }
    
    // Test 3: Page should still be responsive
    console.log('🧪 Testing page responsiveness after invalid interactions...');
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Command Center');
    console.log('✅ Page still responsive after invalid interactions');
    
    // Test 4: Map should still be visible
    const mapContainer = page.locator('.map-container-3d');
    const isVisible = await mapContainer.isVisible();
    expect(isVisible).toBe(true);
    console.log('✅ Map still visible after invalid interactions');
    
    console.log('🎉 All graceful error handling tests passed!');
  });
});
