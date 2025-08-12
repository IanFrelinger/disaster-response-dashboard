import { test, expect } from '@playwright/test';

test.describe('Map Functionality Tests', () => {
  test('should render map correctly and show all features', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Click the map button to switch to map view
    const mapButton = page.locator('button:has-text("🗺️ Live Map")');
    await expect(mapButton).toBeVisible();
    await mapButton.click();
    
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    // Verify map container exists and has correct dimensions
    const mapContainer = page.locator('.simple-mapbox-test');
    await expect(mapContainer).toBeVisible();
    
    const mapboxContainer = page.locator('.mapbox-container');
    await expect(mapboxContainer).toBeVisible();
    
    // Check map dimensions
    const mapRect = await mapContainer.boundingBox();
    expect(mapRect).toBeTruthy();
    expect(mapRect!.width).toBeGreaterThan(1000); // Should be wide
    expect(mapRect!.height).toBeGreaterThan(500);  // Should be tall
    
    // Verify Mapbox canvas is present
    const mapboxCanvas = page.locator('.mapboxgl-canvas');
    await expect(mapboxCanvas).toBeVisible();
    
    // Check if the map has loaded by looking for Mapbox-specific elements
    const canaryElement = page.locator('.mapboxgl-canary');
    await expect(canaryElement).toBeVisible();
    
    // Verify the map is interactive (has touch/pan/zoom classes)
    const canvasContainer = page.locator('.mapboxgl-canvas-container');
    await expect(canvasContainer).toBeVisible();
    
    // Check for expected CSS classes that indicate Mapbox is working
    const containerClasses = await canvasContainer.getAttribute('class');
    expect(containerClasses).toContain('mapboxgl-interactive');
    expect(containerClasses).toContain('mapboxgl-touch-drag-pan');
    expect(containerClasses).toContain('mapboxgl-touch-zoom-rotate');
    
    // Verify analytics panel is visible
    const analyticsPanel = page.locator('.analytics-panel');
    await expect(analyticsPanel).toBeVisible();
    
    // Verify status indicators are visible
    const statusIndicators = page.locator('[style*="position: absolute"][style*="top: var(--ios-spacing-md)"][style*="right: var(--ios-spacing-md)"]');
    await expect(statusIndicators).toBeVisible();
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'map-functionality-test.png', fullPage: true });
    
    console.log('✅ Map is rendering correctly with all expected elements!');
    console.log('✅ Mapbox canvas is visible and interactive');
    console.log('✅ Analytics panel is visible');
    console.log('✅ Status indicators are visible');
    console.log('✅ Map dimensions are correct:', mapRect);
  });
  
  test('should show map controls and allow layer toggling', async ({ page }) => {
    // Navigate to map view
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const mapButton = page.locator('button:has-text("🗺️ Live Map")');
    await mapButton.click();
    await page.waitForTimeout(3000);
    
    // Check that analytics panel controls are working
    const hazardsToggle = page.locator('input[type="checkbox"]').first();
    await expect(hazardsToggle).toBeVisible();
    
    // Verify the toggle is checked by default
    const isChecked = await hazardsToggle.isChecked();
    expect(isChecked).toBe(true);
    
    // Test toggling hazards off and on
    await hazardsToggle.click();
    await page.waitForTimeout(500);
    expect(await hazardsToggle.isChecked()).toBe(false);
    
    await hazardsToggle.click();
    await page.waitForTimeout(500);
    expect(await hazardsToggle.isChecked()).toBe(true);
    
    console.log('✅ Map controls are working correctly!');
    console.log('✅ Layer toggles are functional');
  });
});
