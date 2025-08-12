import { test, expect } from '@playwright/test';

test.describe('Map Debug Tests', () => {
  test('should debug map rendering issues', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    console.log('=== MAP DEBUG START ===');
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Check initial state - should be dashboard view
    const dashboardView = page.locator('.evacuation-dashboard');
    const dashboardExists = await dashboardView.count();
    console.log('Dashboard view exists:', dashboardExists);
    
    // Look for the map navigation button
    const mapButton = page.locator('button:has-text("🗺️ Live Map")');
    const mapButtonExists = await mapButton.count();
    console.log('Map button exists:', mapButtonExists);
    
    if (mapButtonExists > 0) {
      console.log('Found map button, clicking to navigate to map view...');
      
      // Click the map button to switch to map view
      await mapButton.click();
      
      // Wait for the view to change
      await page.waitForTimeout(2000);
      
      console.log('Switched to map view');
      console.log('Current URL:', page.url());
      
      // Now check for map-related elements
      const mapContainer = page.locator('.simple-mapbox-test');
      const mapboxContainer = page.locator('.mapbox-container');
      
      // Check for map-related elements
      const mapElements = await page.locator('[class*="map"]').count();
      const mapboxElements = await page.locator('[class*="mapbox"]').count();
      const simpleMapElements = await page.locator('[class*="simple-mapbox"]').count();
      
      console.log('Map-related elements found:', mapElements);
      console.log('Mapbox-related elements found:', mapboxElements);
      console.log('SimpleMapbox elements found:', simpleMapElements);
      
      // Check if map container exists
      const mapExists = await mapContainer.count();
      const mapboxExists = await mapboxContainer.count();
      
      console.log('Map container exists:', mapExists);
      console.log('Mapbox container exists:', mapboxExists);
      
      if (mapExists > 0) {
        console.log('Map container found!');
        const mapHTML = await mapContainer.innerHTML();
        console.log('Map container HTML:', mapHTML.substring(0, 500) + '...');
        
        // Check container dimensions
        const mapRect = await mapContainer.boundingBox();
        if (mapRect) {
          console.log('Map container dimensions:', mapRect);
        }
      }
      
      if (mapboxExists > 0) {
        console.log('Mapbox container found!');
        const mapboxHTML = await mapboxContainer.innerHTML();
        console.log('Mapbox container HTML:', mapboxHTML.substring(0, 500) + '...');
      }
      
      // Look for any JavaScript errors in console
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
        console.log(`Browser Console [${msg.type()}]:`, msg.text());
      });
      
      // Look for any page errors
      const pageErrors: string[] = [];
      page.on('pageerror', error => {
        pageErrors.push(error.message);
        console.log('Page Error:', error.message);
      });
      
      // Wait a bit more to capture console messages
      await page.waitForTimeout(3000);
      
      console.log('=== CONSOLE MESSAGES ===');
      consoleMessages.forEach(msg => console.log(msg));
      
      console.log('=== PAGE ERRORS ===');
      pageErrors.forEach(error => console.log(error));
      
      // Take a screenshot to see what's actually rendered
      await page.screenshot({ path: 'map-view-screenshot.png', fullPage: true });
      
    } else {
      console.log('Map button not found!');
      // Take a screenshot of the current view
      await page.screenshot({ path: 'no-map-button-screenshot.png', fullPage: true });
    }
    
    console.log('=== MAP DEBUG END ===');
    
    // For now, just log what we found - we'll analyze the output
    expect(true).toBe(true); // Always pass for debugging
  });
});
