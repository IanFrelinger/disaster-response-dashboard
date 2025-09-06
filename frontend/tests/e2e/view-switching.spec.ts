import { test, expect } from '@playwright/test';

test.describe('View Switching Tests', () => {
  test('view switching works correctly', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('button:has-text("Live Map")');
    
    // Check initial state - should be on dashboard
    const dashboardButton = page.locator('button:has-text("Commander Dashboard")');
    const liveMapButton = page.locator('button:has-text("Live Map")');
    
    // Check button states
    const dashboardBackground = await dashboardButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.background;
    });
    const liveMapBackground = await liveMapButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.background;
    });
    
    console.log(`Dashboard button background: ${dashboardBackground}`);
    console.log(`Live Map button background: ${liveMapBackground}`);
    
    // Dashboard should be active initially
    expect(dashboardBackground).toContain('linear-gradient');
    expect(liveMapBackground).not.toContain('linear-gradient');
    
    // Click the Live Map button
    await liveMapButton.click();
    
    // Wait for the view to switch
    await page.waitForTimeout(2000);
    
    // Check button states after click
    const dashboardBackgroundAfter = await dashboardButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.background;
    });
    const liveMapBackgroundAfter = await liveMapButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.background;
    });
    
    console.log(`Dashboard button background after click: ${dashboardBackgroundAfter}`);
    console.log(`Live Map button background after click: ${liveMapBackgroundAfter}`);
    
    // Live Map should be active after click
    expect(liveMapBackgroundAfter).toContain('linear-gradient');
    expect(dashboardBackgroundAfter).not.toContain('linear-gradient');
    
    // Check if the view content changed
    const pageContent = await page.content();
    console.log(`Page content length: ${pageContent.length}`);
    
    // Look for any map-related content
    const mapContent = page.locator('.ios-card, [class*="map"], [class*="control"]');
    const mapContentCount = await mapContent.count();
    console.log(`Found ${mapContentCount} map-related elements after view switch`);
    
    // The test should pass if the view switching works
    expect(mapContentCount).toBeGreaterThan(0);
  });
});
