import { test, expect } from '@playwright/test';

test.describe('iOS Color Standardization Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main application using baseURL from config
    await page.goto('/');
    
    // Wait for the page to load and then navigate to the map view
    await page.waitForSelector('text=🗺️ Live Map', { timeout: 10000 });
    await page.click('text=🗺️ Live Map');
    
    // Wait for the map to load
    await page.waitForSelector('.mapboxgl-map', { timeout: 30000 });
    
    // Wait for analytics panel to be visible
    await page.waitForSelector('.analytics-panel', { timeout: 10000 });
  });

  test('should use iOS color variables for hazard severity indicators', async ({ page }) => {
    // Check that hazard severity colors use iOS variables
    const hazardElements = page.locator('.analytics-panel').locator('text=Hazards:');
    await expect(hazardElements).toBeVisible();
    
    // Verify the hazard section uses iOS colors
    const hazardSection = hazardElements.locator('xpath=ancestor::div[1]');
    const backgroundColor = await hazardSection.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should use iOS red background (rgba(255, 59, 48, 0.05))
    expect(backgroundColor).toContain('rgba(255, 59, 48');
  });

  test('should use iOS color variables for route indicators', async ({ page }) => {
    // Check that route colors use iOS variables
    const routeElements = page.locator('.analytics-panel').locator('text=Routes:');
    await expect(routeElements).toBeVisible();
    
    // Verify the route section uses iOS colors
    const routeSection = routeElements.locator('xpath=ancestor::div[1]');
    const backgroundColor = await routeSection.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should use iOS orange background (rgba(255, 149, 0, 0.05))
    expect(backgroundColor).toContain('rgba(255, 149, 0');
  });

  test('should use iOS color variables for weather panel', async ({ page }) => {
    // Wait for weather panel to be visible
    await page.waitForSelector('text=🌤️ Weather Operations', { timeout: 10000 });
    
    // Check that weather headings use iOS blue
    const weatherHeading = page.locator('text=🌤️ Weather Operations');
    const headingColor = await weatherHeading.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Should use iOS blue (rgb(0, 122, 255))
    expect(headingColor).toContain('rgb(0, 122, 255)');
  });

  test('should use iOS color variables for EMS impact indicators', async ({ page }) => {
    // Check that EMS impact colors use iOS variables
    const emsHeading = page.locator('text=🚑 EMS Impact');
    await expect(emsHeading).toBeVisible();
    
    // Verify the EMS section uses iOS colors
    const emsSection = emsHeading.locator('xpath=ancestor::div[1]');
    const backgroundColor = await emsSection.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should use iOS red background (rgba(255, 59, 48, 0.05))
    expect(backgroundColor).toContain('rgba(255, 59, 48');
  });

  test('should use iOS color variables for forecast indicators', async ({ page }) => {
    // Check that forecast colors use iOS variables
    const forecastHeading = page.locator('text=📅 Forecast');
    await expect(forecastHeading).toBeVisible();
    
    // Verify the forecast section uses iOS colors
    const forecastSection = forecastHeading.locator('xpath=ancestor::div[1]');
    const backgroundColor = await forecastSection.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should use iOS purple background (rgba(88, 86, 214, 0.05))
    expect(backgroundColor).toContain('rgba(88, 86, 214');
  });

  test('should have consistent iOS design styling across all panels', async ({ page }) => {
    // Check that all panels follow iOS design principles
    
    // Analytics panel should have iOS styling
    const analyticsPanel = page.locator('.analytics-panel');
    const panelStyle = await analyticsPanel.evaluate(el => 
      window.getComputedStyle(el)
    );
    
    // Verify iOS design compliance
    expect(panelStyle.borderRadius).toContain('16px'); // iOS border radius
    expect(panelStyle.backdropFilter).toContain('blur(20px)'); // iOS backdrop filter
    expect(panelStyle.fontFamily).toContain('SF Pro Display'); // iOS font
    
    // Check that panels use iOS spacing
    expect(panelStyle.padding).toContain('20px'); // iOS spacing
  });

  test('should use iOS color variables for all interactive elements', async ({ page }) => {
    // Check that checkboxes use iOS accent colors
    const checkboxes = page.locator('.analytics-panel input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify that checkboxes use iOS accent colors
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      const accentColor = await checkbox.evaluate(el => 
        window.getComputedStyle(el).accentColor
      );
      
      // Should use iOS colors (red, orange, blue, green, etc.)
      // Browser resolves CSS variables to actual RGB values
      expect(accentColor).toMatch(/rgb\(255, 59, 48\)|rgb\(255, 149, 0\)|rgb\(0, 122, 255\)|rgb\(52, 199, 89\)|rgb\(255, 204, 0\)|rgb\(175, 82, 222\)/);
    }
  });

  test('should maintain accessibility with iOS color contrast', async ({ page }) => {
    // Check that text has proper contrast against backgrounds
    
    // Analytics panel text should be readable
    const analyticsText = page.locator('.analytics-panel h4');
    const textColor = await analyticsText.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Should use dark text for readability
    expect(textColor).toContain('rgb(29, 29, 31)'); // iOS primary text color
    
    // Check that background provides good contrast
    const panelBackground = await page.locator('.analytics-panel').evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should use light background with good contrast
    expect(panelBackground).toContain('rgba(255, 255, 255');
  });
});
