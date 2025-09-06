import { test, expect } from '@playwright/test';

test.describe('Debug useLayerToggles Tests', () => {
  test('check if useLayerToggles data is visible in debug component', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('button:has-text("Live Map")');
    
    // Click the Live Map button to switch to map view
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await liveMapButton.click();
    
    // Wait for the view to switch
    await page.waitForTimeout(3000);
    
    // Look for the debug component
    const debugComponent = page.locator('div:has-text("DEBUG: useLayerToggles Test")');
    const debugComponentCount = await debugComponent.count();
    console.log(`Found ${debugComponentCount} debug components`);
    
    if (debugComponentCount > 0) {
      await expect(debugComponent.first()).toBeVisible();
      console.log('SUCCESS: Debug component is visible');
      
      // Look for the toggles data
      const togglesData = page.locator('div:has-text("Toggles:")');
      const toggleDescriptorsData = page.locator('div:has-text("Toggle Descriptors:")');
      
      console.log(`Toggles data found: ${await togglesData.count() > 0}`);
      console.log(`Toggle descriptors data found: ${await toggleDescriptorsData.count() > 0}`);
      
      // If debug component is visible, the issue is with LayerTogglePanel component
      console.log('CONCLUSION: useLayerToggles hook is working, issue is with LayerTogglePanel component');
    } else {
      console.log('FAILURE: Debug component not found - there is still a rendering issue');
      
      // Look for any elements with blue borders
      const blueBorderElements = page.locator('[style*="border: 2px solid blue"]');
      const blueBorderCount = await blueBorderElements.count();
      console.log(`Found ${blueBorderCount} elements with blue borders`);
      
      // Look for any elements with lightblue backgrounds
      const lightblueBackgroundElements = page.locator('[style*="background-color: lightblue"]');
      const lightblueBackgroundCount = await lightblueBackgroundElements.count();
      console.log(`Found ${lightblueBackgroundCount} elements with lightblue backgrounds`);
      
      // Look for any elements containing "DEBUG" text
      const debugTextElements = page.locator('*:has-text("DEBUG")');
      const debugTextCount = await debugTextElements.count();
      console.log(`Found ${debugTextCount} elements containing "DEBUG" text`);
    }
    
    // The test should pass if we can navigate to the map view
    expect(debugComponentCount).toBeGreaterThan(0);
  });
});
