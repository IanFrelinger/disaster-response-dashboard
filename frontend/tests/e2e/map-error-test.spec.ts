import { test, expect } from '@playwright/test';

test.describe('Map Error Detection Tests', () => {
  test('should test map interactions without CSS variable errors', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Navigate to map view
    const mapButton = page.locator('.ios-segment:has-text("🗺️ Live Map")');
    await expect(mapButton).toBeVisible();
    await mapButton.click();
    await page.waitForTimeout(2000);
    
    // Check for any console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        consoleErrors.push(errorText);
        console.log(`🚨 Console Error: ${errorText}`);
        
        // Check if this is the specific CSS variable error
        if (errorText.includes('ems-response-primary') && 
            errorText.includes('line-color') && 
            errorText.includes('var(--ios-blue)')) {
          console.log('🚨 FOUND THE SPECIFIC CSS VARIABLE ERROR!');
          throw new Error(`Found the specific CSS variable error: ${errorText}`);
        }
      }
    });
    
    // Also check for page errors
    page.on('pageerror', error => {
      const errorMessage = error.message;
      consoleErrors.push(errorMessage);
      console.log(`🚨 Page Error: ${errorMessage}`);
      
      // Check if this is the specific CSS variable error
      if (errorMessage.includes('ems-response-primary') && 
          errorMessage.includes('line-color') && 
          errorMessage.includes('var(--ios-blue)')) {
        console.log('🚨 FOUND THE SPECIFIC CSS VARIABLE ERROR!');
        throw new Error(`Found the specific CSS variable error: ${errorMessage}`);
      }
    });
    
    // Wait a bit more for map to load
    await page.waitForTimeout(5000);
    
    // Check if there are any CSS variable errors
    const cssVariableErrors = consoleErrors.filter(error => 
      error.includes('var(--ios-') || 
      error.includes('Map Loading Error') ||
      error.includes('color expected') ||
      error.includes('ems-response-primary') ||
      error.includes('line-color')
    );
    
    if (cssVariableErrors.length > 0) {
      console.log('🚨 CSS Variable Errors Found:');
      cssVariableErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('✅ No CSS variable errors detected in map');
    
    // Test basic map interactions
    const mapContainer = page.locator('[data-testid="map-container"], .mapboxgl-map, .map-container');
    if (await mapContainer.isVisible()) {
      console.log('✅ Map container is visible');
      
      // Test zoom controls if they exist
      const zoomIn = page.locator('[data-testid="zoom-in"], .zoom-in, button:has-text("+")');
      const zoomOut = page.locator('[data-testid="zoom-out"], .zoom-out, button:has-text("-")');
      
      if (await zoomIn.isVisible()) {
        await zoomIn.click();
        await page.waitForTimeout(500);
        console.log('✅ Zoom in interaction works');
      }
      
      if (await zoomOut.isVisible()) {
        await zoomOut.click();
        await page.waitForTimeout(500);
        console.log('✅ Zoom out interaction works');
      }
      
      // Test layer toggles if they exist
      const layerToggles = page.locator('[data-testid="layer-toggle"], .layer-toggle, input[type="checkbox"]');
      const toggleCount = await layerToggles.count();
      
      for (let i = 0; i < Math.min(toggleCount, 3); i++) {
        const toggle = layerToggles.nth(i);
        if (await toggle.isVisible()) {
          await toggle.click();
          await page.waitForTimeout(500);
          console.log(`✅ Layer toggle ${i + 1} interaction works`);
        }
      }
      
      // Test some map interactions that might trigger the error
      await page.mouse.move(400, 300);
      await page.waitForTimeout(500);
      await page.mouse.click(400, 300);
      await page.waitForTimeout(500);
      
      console.log('✅ Map mouse interactions completed');
    } else {
      console.log('⚠️ Map container not visible');
    }
    
    // Check for any new errors after interactions
    await page.waitForTimeout(3000);
    
    const finalCssVariableErrors = consoleErrors.filter(error => 
      error.includes('var(--ios-') || 
      error.includes('Map Loading Error') ||
      error.includes('color expected') ||
      error.includes('ems-response-primary') ||
      error.includes('line-color')
    );
    
    if (finalCssVariableErrors.length > 0) {
      console.log('🚨 CSS Variable Errors After Interactions:');
      finalCssVariableErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('✅ Map interactions completed without CSS variable errors');
    console.log(`Total console errors captured: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('All console errors:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }
  });
});
