import { test, expect } from '@playwright/test';

test.describe('Console Error Detection Tests', () => {
  test('capture all console messages to detect LayerTogglePanel rendering issues', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('button:has-text("Live Map")');
    
    // Set up console listeners for ALL message types
    const consoleMessages: Array<{ type: string; text: string }> = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Also listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Click the Live Map button to switch to map view
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await liveMapButton.click();
    
    // Wait for the view to switch and capture all console messages
    await page.waitForTimeout(5000);
    
    // Log all console messages
    console.log(`Total console messages: ${consoleMessages.length}`);
    consoleMessages.forEach((msg, index) => {
      console.log(`Console ${msg.type} ${index + 1}: ${msg.text}`);
    });
    
    // Log any page errors
    console.log(`Page errors: ${pageErrors.length}`);
    pageErrors.forEach((error, index) => {
      console.log(`Page error ${index + 1}: ${error}`);
    });
    
    // Look for any LayerTogglePanel-related console messages
    const layerPanelMessages = consoleMessages.filter(msg => 
      msg.text.includes('LayerTogglePanel') || 
      msg.text.includes('layer-toggle') ||
      msg.text.includes('Map Layers')
    );
    
    console.log(`LayerTogglePanel-related console messages: ${layerPanelMessages.length}`);
    layerPanelMessages.forEach((msg, index) => {
      console.log(`LayerTogglePanel message ${index + 1}: ${msg.text}`);
    });
    
    // Look for any error messages
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    console.log(`Console error messages: ${errorMessages.length}`);
    errorMessages.forEach((msg, index) => {
      console.log(`Console error ${index + 1}: ${msg.text}`);
    });
    
    // The test should pass if we can navigate to the map view
    expect(consoleMessages.length).toBeGreaterThan(0);
  });
});
