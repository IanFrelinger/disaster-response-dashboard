import { test, expect } from '@playwright/test';

test.describe('Debug Component Test', () => {
  test('check if blue debug component is visible', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('button:has-text("Live Map")');
    
    // Click the Live Map button to switch to map view
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await liveMapButton.click();
    
    // Wait for the view to switch
    await page.waitForTimeout(3000);
    
    // Look for the blue debug component
    const debugComponent = page.locator('div:has-text("DEBUG: LayerTogglePanel Test")');
    const debugComponentCount = await debugComponent.count();
    console.log(`Found ${debugComponentCount} debug components`);
    
    if (debugComponentCount > 0) {
      await expect(debugComponent.first()).toBeVisible();
      console.log('SUCCESS: Blue debug component is visible');
      
      // Look for the debug content
      const titleContent = page.locator('div:has-text("Title: Map Layers")');
      const togglesContent = page.locator('div:has-text("Toggles:")');
      const toggleDescriptorsContent = page.locator('div:has-text("ToggleDescriptors:")');
      const workingContent = page.locator('div:has-text("If you see this, the issue is with LayerTogglePanel component")');
      
      console.log(`Title content found: ${await titleContent.count() > 0}`);
      console.log(`Toggles content found: ${await togglesContent.count() > 0}`);
      console.log(`ToggleDescriptors content found: ${await toggleDescriptorsContent.count() > 0}`);
      console.log(`Working content found: ${await workingContent.count() > 0}`);
      
      // If debug component is visible, the issue is with LayerTogglePanel component
      console.log('CONCLUSION: Blue debug component is working, issue is with LayerTogglePanel component');
    } else {
      console.log('FAILURE: Blue debug component not found - there is still a rendering issue');
      
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
