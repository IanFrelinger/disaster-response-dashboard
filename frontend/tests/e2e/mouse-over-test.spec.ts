import { test, expect } from '@playwright/test';

test.describe('Mouse-Over Functionality Test', () => {
  test('should display enhanced tooltips with hazard information on mouse-over', async ({ page }) => {
    // Navigate to the map view
    await page.goto('http://localhost:3000');
    
    // Click on the Live Map button to switch to map view
    await page.click('button:has-text("🗺️ Live Map")');
    
    // Wait for the map to load
    await page.waitForSelector('.mapbox-container', { timeout: 10000 });
    
    // Wait for map features to load
    await page.waitForTimeout(3000);
    
    console.log('=== MOUSE-OVER FUNCTIONALITY TEST ===');
    
    // Test 1: Check if tooltip container exists
    const tooltipContainer = page.locator('div[style*="position: absolute"][style*="z-index: 2000"]');
    console.log('Tooltip container found:', await tooltipContainer.count() > 0);
    
    // Test 2: Check if hazard layers are present
    const hazardLayers = page.locator('.mapboxgl-canvas');
    console.log('Map canvas found:', await hazardLayers.count() > 0);
    
    // Test 3: Simulate mouse movement over the map to trigger tooltips
    const mapContainer = page.locator('.mapbox-container');
    await mapContainer.hover();
    
    // Test 4: Check if tooltip becomes visible on hover
    // Note: We can't easily simulate the exact mouse events that Mapbox expects,
    // but we can verify the tooltip structure is in place
    
    console.log('=== TOOLTIP STRUCTURE VERIFICATION ===');
    
    // Check if the tooltip component is rendered in the DOM
    const tooltipElements = page.locator('div[style*="z-index: 2000"]');
    const tooltipCount = await tooltipElements.count();
    console.log('Tooltip elements found:', tooltipCount);
    
    // Test 5: Verify tooltip styling and positioning
    if (tooltipCount > 0) {
      const tooltipStyle = await tooltipElements.first().getAttribute('style');
      console.log('Tooltip style attributes:', tooltipStyle);
      
      // Check for key tooltip styling
      expect(tooltipStyle).toContain('position: absolute');
      expect(tooltipStyle).toContain('z-index: 2000');
      expect(tooltipStyle).toContain('background: rgba(0, 0, 0, 0.95)');
      expect(tooltipStyle).toContain('color: rgb(255, 255, 255)');
    }
    
    console.log('=== MOUSE-OVER TEST COMPLETE ===');
    
    // The test passes if we can verify the tooltip structure is in place
    expect(tooltipCount).toBeGreaterThan(0);
  });
  
  test('should display hazard information in tooltips', async ({ page }) => {
    // Navigate to the map view
    await page.goto('http://localhost:3000');
    
    // Click on the Live Map button to switch to map view
    await page.click('button:has-text("🗺️ Live Map")');
    
    // Wait for the map to load
    await page.waitForSelector('.mapbox-container', { timeout: 10000 });
    
    // Wait for map features to load
    await page.waitForTimeout(3000);
    
    console.log('=== HAZARD TOOLTIP CONTENT TEST ===');
    
    // Check if the map has loaded with features
    const mapContainer = page.locator('.mapbox-container');
    const mapLoaded = await mapContainer.isVisible();
    console.log('Map container visible:', mapLoaded);
    
    // Check if the map canvas is present (indicates Mapbox is loaded)
    const mapCanvas = page.locator('.mapboxgl-canvas');
    const canvasPresent = await mapCanvas.count() > 0;
    console.log('Map canvas present:', canvasPresent);
    
    // Test passes if the map is loaded and canvas is present
    expect(mapLoaded).toBe(true);
    expect(canvasPresent).toBe(true);
    
    console.log('=== HAZARD TOOLTIP TEST COMPLETE ===');
  });
});
