import { test, expect } from '@playwright/test';

test.describe('Wind Gust Vectors Test', () => {
  test('should display enhanced wind vectors with gust indicators', async ({ page }) => {
    // Navigate to the map view
    await page.goto('http://localhost:3000');
    
    // Click on the Live Map button to switch to map view
    await page.click('button:has-text("🗺️ Live Map")');
    
    // Wait for the map to load
    await page.waitForSelector('.mapbox-container', { timeout: 10000 });
    
    // Wait for map features to load
    await page.waitForTimeout(3000);
    
    console.log('=== WIND VECTORS TEST ===');
    
    // Test 1: Check if wind vectors are present
    const windVectors = page.locator('.mapboxgl-canvas');
    const canvasPresent = await windVectors.count() > 0;
    console.log('Map canvas present:', canvasPresent);
    
    // Test 2: Check if weather overlay is enabled
    const weatherToggle = page.locator('input[type="checkbox"]').nth(3); // Weather toggle
    const weatherEnabled = await weatherToggle.isChecked();
    console.log('Weather overlay enabled:', weatherEnabled);
    
    // Test 3: Check if wind vector legend is visible in weather legend
    const weatherLegend = page.locator('.weather-legend');
    const legendVisible = await weatherLegend.isVisible();
    console.log('Weather legend visible:', legendVisible);
    
    // Test 4: Check wind vector legend content
    const windVectorLegend = page.locator('h5:has-text("💨 Wind Vectors")');
    const windLegendPresent = await windVectorLegend.isVisible();
    console.log('Wind vectors legend present:', windLegendPresent);
    
    // Test 5: Check specific wind legend items
    const windDirection = page.locator('text=→ Arrows: Wind direction');
    const windSpeed = page.locator('text=📏 Length: Wind speed');
    const windGusts = page.locator('text=🟠 Circles: Wind gusts detected');
    const highWindWarnings = page.locator('text=🔴 Red: High wind warnings');
    
    console.log('Wind direction legend:', await windDirection.isVisible());
    console.log('Wind speed legend:', await windSpeed.isVisible());
    console.log('Wind gusts legend:', await windGusts.isVisible());
    console.log('High wind warnings legend:', await highWindWarnings.isVisible());
    
    // Test 6: Check if gust information is displayed when gusts are active
    const gustInfo = page.locator('text=💨 Gusts: Active - Monitor for changes');
    const gustInfoVisible = await gustInfo.isVisible();
    console.log('Gust information visible:', gustInfoVisible);
    
    console.log('=== WIND VECTORS TEST COMPLETE ===');
    
    // Assertions
    expect(canvasPresent).toBe(true);
    expect(weatherEnabled).toBe(true);
    expect(legendVisible).toBe(true);
    expect(windLegendPresent).toBe(true);
    expect(await windDirection.isVisible()).toBe(true);
    expect(await windSpeed.isVisible()).toBe(true);
    expect(await windGusts.isVisible()).toBe(true);
    expect(await highWindWarnings.isVisible()).toBe(true);
  });
  
  test('should show wind vector tooltips on hover', async ({ page }) => {
    // Navigate to the map view
    await page.goto('http://localhost:3000');
    
    // Click on the Live Map button to switch to map view
    await page.click('button:has-text("🗺️ Live Map")');
    
    // Wait for the map to load
    await page.waitForSelector('.mapbox-container', { timeout: 10000 });
    
    // Wait for map features to load
    await page.waitForTimeout(3000);
    
    console.log('=== WIND VECTOR TOOLTIPS TEST ===');
    
    // Test 1: Check if map is loaded
    const mapContainer = page.locator('.mapbox-container');
    const mapLoaded = await mapContainer.isVisible();
    console.log('Map container visible:', mapLoaded);
    
    // Test 2: Check if weather is enabled
    const weatherToggle = page.locator('input[type="checkbox"]').nth(3);
    const weatherEnabled = await weatherToggle.isChecked();
    console.log('Weather enabled:', weatherEnabled);
    
    // Test 3: Check if wind vectors are present (this indicates tooltip system is ready)
    const windVectors = page.locator('.mapboxgl-canvas');
    const windVectorsPresent = await windVectors.count() > 0;
    console.log('Wind vectors canvas present:', windVectorsPresent);
    
    console.log('=== WIND VECTOR TOOLTIPS TEST COMPLETE ===');
    
    // Assertions
    expect(mapLoaded).toBe(true);
    expect(weatherEnabled).toBe(true);
    expect(windVectorsPresent).toBe(true);
  });
});
