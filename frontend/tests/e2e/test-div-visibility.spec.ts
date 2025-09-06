import { test, expect } from '@playwright/test';

test.describe('Test Div Visibility Tests', () => {
  test('check if test div is visible to determine rendering issue', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('button:has-text("Live Map")');
    
    // Click the Live Map button to switch to map view
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await liveMapButton.click();
    
    // Wait for the view to switch
    await page.waitForTimeout(3000);
    
    // Look for the test div
    const testDiv = page.locator('div:has-text("TEST: LayerTogglePanel Debug Container")');
    const testDivCount = await testDiv.count();
    console.log(`Found ${testDivCount} test divs`);
    
    if (testDivCount > 0) {
      await expect(testDiv.first()).toBeVisible();
      console.log('SUCCESS: Test div is visible - rendering is working');
      
      // Look for the test content
      const testContent1 = page.locator('div:has-text("This is a test div to see if rendering works")');
      const testContent2 = page.locator('div:has-text("If you see this, rendering is working")');
      const testContent3 = page.locator('div:has-text("If you don\'t see this, there\'s a rendering issue")');
      
      console.log(`Test content 1 found: ${await testContent1.count() > 0}`);
      console.log(`Test content 2 found: ${await testContent2.count() > 0}`);
      console.log(`Test content 3 found: ${await testContent3.count() > 0}`);
      
      // If test div is visible, the issue is with LayerTogglePanel component
      console.log('CONCLUSION: Rendering is working, issue is with LayerTogglePanel component');
    } else {
      console.log('FAILURE: Test div not found - there is a broader rendering issue');
      
      // Look for any elements with red borders
      const redBorderElements = page.locator('[style*="border: 2px solid red"]');
      const redBorderCount = await redBorderElements.count();
      console.log(`Found ${redBorderCount} elements with red borders`);
      
      // Look for any elements with yellow backgrounds
      const yellowBackgroundElements = page.locator('[style*="background-color: yellow"]');
      const yellowBackgroundCount = await yellowBackgroundElements.count();
      console.log(`Found ${yellowBackgroundCount} elements with yellow backgrounds`);
      
      // Look for any elements containing "TEST" text
      const testTextElements = page.locator('*:has-text("TEST")');
      const testTextCount = await testTextElements.count();
      console.log(`Found ${testTextCount} elements containing "TEST" text`);
    }
    
    // The test should pass if we can navigate to the map view
    expect(testDivCount).toBeGreaterThan(0);
  });
});
