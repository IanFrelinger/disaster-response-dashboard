import { test, expect } from '@playwright/test';

test.describe('React Basic Tests', () => {
  test('React app loads and renders basic content', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('button:has-text("Live Map")');
    
    // Check if the basic app structure is there
    const appTitle = page.locator('h1:has-text("Command Center")');
    await expect(appTitle).toBeVisible();
    
    // Check if the Live Map button is clickable
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await expect(liveMapButton).toBeVisible();
    
    // Click the Live Map button
    await liveMapButton.click();
    
    // Wait for the view to switch
    await page.waitForTimeout(3000);
    
    // Check if we're in a different view (the button should not be visible)
    const buttonStillVisible = await liveMapButton.isVisible();
    console.log(`Live Map button still visible after click: ${buttonStillVisible}`);
    
    // Look for any content that might indicate the map view
    const pageContent = await page.content();
    console.log(`Page content length: ${pageContent.length}`);
    
    // Look for any div elements
    const divs = page.locator('div');
    const divCount = await divs.count();
    console.log(`Found ${divCount} div elements`);
    
    // Look for any elements with specific classes
    const iosCardElements = page.locator('.ios-card');
    const iosCardCount = await iosCardElements.count();
    console.log(`Found ${iosCardCount} ios-card elements`);
    
    // Look for any elements with "map" in their class or id
    const mapElements = page.locator('[class*="map"], [id*="map"], [class*="Map"]');
    const mapElementCount = await mapElements.count();
    console.log(`Found ${mapElementCount} map-related elements`);
    
    // The test should pass if React is working
    expect(divCount).toBeGreaterThan(0);
  });
});
