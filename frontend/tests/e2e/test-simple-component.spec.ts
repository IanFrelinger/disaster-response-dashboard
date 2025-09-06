import { test, expect } from '@playwright/test';

test.describe('Simple Component Test', () => {
  test('check if simple test component is visible', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('button:has-text("Live Map")');
    
    // Click the Live Map button to switch to map view
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await liveMapButton.click();
    
    // Wait for the view to switch
    await page.waitForTimeout(3000);
    
    // Look for the simple test component
    const testComponent = page.locator('div:has-text("TEST: Simple LayerTogglePanel Replacement")');
    const testComponentCount = await testComponent.count();
    console.log(`Found ${testComponentCount} test components`);
    
    if (testComponentCount > 0) {
      await expect(testComponent.first()).toBeVisible();
      console.log('SUCCESS: Simple test component is visible');
      
      // Look for the test content
      const titleContent = page.locator('div:has-text("Title:")');
      const togglesContent = page.locator('div:has-text("Toggles count:")');
      const workingContent = page.locator('div:has-text("If you see this, simple rendering is working")');
      
      console.log(`Title content found: ${await titleContent.count() > 0}`);
      console.log(`Toggles content found: ${await togglesContent.count() > 0}`);
      console.log(`Working content found: ${await workingContent.count() > 0}`);
      
      // If test component is visible, the issue is with LayerTogglePanel component
      console.log('CONCLUSION: Simple rendering is working, issue is with LayerTogglePanel component');
    } else {
      console.log('FAILURE: Simple test component not found - there is still a rendering issue');
      
      // Look for any elements with green borders
      const greenBorderElements = page.locator('[style*="border: 2px solid green"]');
      const greenBorderCount = await greenBorderElements.count();
      console.log(`Found ${greenBorderCount} elements with green borders`);
      
      // Look for any elements with lightgreen backgrounds
      const lightgreenBackgroundElements = page.locator('[style*="background-color: lightgreen"]');
      const lightgreenBackgroundCount = await lightgreenBackgroundElements.count();
      console.log(`Found ${lightgreenBackgroundCount} elements with lightgreen backgrounds`);
      
      // Look for any elements containing "TEST" text
      const testTextElements = page.locator('*:has-text("TEST")');
      const testTextCount = await testTextElements.count();
      console.log(`Found ${testTextCount} elements containing "TEST" text`);
    }
    
    // The test should pass if we can navigate to the map view
    expect(testComponentCount).toBeGreaterThan(0);
  });
});
