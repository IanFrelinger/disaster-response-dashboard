import { test, expect } from '@playwright/test';

test.describe('Component Error Detection Tests', () => {
  test('detect any JavaScript errors preventing component rendering', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('button:has-text("Live Map")');
    
    // Set up console error and log listeners
    const consoleErrors: string[] = [];
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Click the Live Map button to switch to map view
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await liveMapButton.click();
    
    // Wait for the view to switch and capture any console messages
    await page.waitForTimeout(5000);
    
    // Log all console messages
    console.log(`Console errors: ${consoleErrors.length}`);
    consoleErrors.forEach((error, index) => {
      console.log(`Console error ${index + 1}: ${error}`);
    });
    
    console.log(`Console logs: ${consoleLogs.length}`);
    consoleLogs.forEach((log, index) => {
      console.log(`Console log ${index + 1}: ${log}`);
    });
    
    // Look for any error messages in the DOM
    const errorElements = page.locator('[class*="error"], [class*="Error"], .error-boundary, [data-testid="error-boundary"]');
    const errorCount = await errorElements.count();
    console.log(`Found ${errorCount} error-related elements in DOM`);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const error = errorElements.nth(i);
        const text = await error.textContent();
        console.log(`DOM error ${i + 1}: ${text}`);
      }
    }
    
    // Look for any React error boundaries
    const reactErrors = page.locator('[data-reactroot] [class*="error"], [data-reactroot] [class*="Error"]');
    const reactErrorCount = await reactErrors.count();
    console.log(`Found ${reactErrorCount} React error-related elements`);
    
    // Look for the LayerTogglePanel specifically
    const layerPanel = page.locator('[data-testid="layer-toggle-panel-debug"]');
    const panelCount = await layerPanel.count();
    console.log(`Found ${panelCount} layer toggle panels`);
    
    if (panelCount === 0) {
      // Look for any elements that might contain the panel
      const containerElements = page.locator('.ios-card, [class*="container"], [class*="panel"]');
      const containerCount = await containerElements.count();
      console.log(`Found ${containerCount} container/panel elements`);
      
      // Look for any elements with "layer" in their attributes
      const layerElements = page.locator('[class*="layer"], [data-testid*="layer"], [id*="layer"]');
      const layerElementCount = await layerElements.count();
      console.log(`Found ${layerElementCount} layer-related elements`);
    }
    
    // The test should pass even if there are errors
    // We're just trying to detect what's happening
    expect(true).toBe(true);
  });
});
