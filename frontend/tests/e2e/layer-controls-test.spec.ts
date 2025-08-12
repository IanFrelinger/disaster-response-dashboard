import { test, expect } from '@playwright/test';

test.describe('Layer Controls Test', () => {
  test('should display and control toggleable map layers', async ({ page }) => {
    // Navigate to the map view
    await page.goto('http://localhost:3000');
    
    // Click on the Live Map button to switch to map view
    await page.click('button:has-text("🗺️ Live Map")');
    
    // Wait for the map to load
    await page.waitForSelector('.mapbox-container', { timeout: 10000 });
    
    // Wait for map features to load
    await page.waitForTimeout(3000);
    
    console.log('=== LAYER CONTROLS TEST ===');
    
    // Test 1: Check if layer controls panel exists
    const layerControls = page.locator('.layer-controls');
    const controlsVisible = await layerControls.isVisible();
    console.log('Layer controls panel visible:', controlsVisible);
    
    // Test 2: Check if all layer toggles are present
    const hazardToggle = page.locator('input[type="checkbox"]').nth(0);
    const routesToggle = page.locator('input[type="checkbox"]').nth(1);
    const unitsToggle = page.locator('input[type="checkbox"]').nth(2);
    const weatherToggle = page.locator('input[type="checkbox"]').nth(3);
    const evacZonesToggle = page.locator('input[type="checkbox"]').nth(4);
    
    console.log('Hazard toggle found:', await hazardToggle.count() > 0);
    console.log('Routes toggle found:', await routesToggle.count() > 0);
    console.log('Units toggle found:', await unitsToggle.count() > 0);
    console.log('Weather toggle found:', await weatherToggle.count() > 0);
    console.log('Evac zones toggle found:', await evacZonesToggle.count() > 0);
    
    // Test 3: Check initial state of toggles
    const hazardChecked = await hazardToggle.isChecked();
    const routesChecked = await routesToggle.isChecked();
    const unitsChecked = await unitsToggle.isChecked();
    const weatherChecked = await weatherToggle.isChecked();
    const evacZonesChecked = await evacZonesToggle.isChecked();
    
    console.log('Initial toggle states:');
    console.log('  Hazards:', hazardChecked);
    console.log('  Routes:', routesChecked);
    console.log('  Units:', unitsChecked);
    console.log('  Weather:', weatherChecked);
    console.log('  Evac Zones:', evacZonesChecked);
    
    // Test 4: Test toggle functionality
    console.log('Testing toggle functionality...');
    
    // Toggle hazards off
    await hazardToggle.click();
    await page.waitForTimeout(500);
    const hazardAfterToggle = await hazardToggle.isChecked();
    console.log('Hazards after toggle:', hazardAfterToggle);
    
    // Toggle hazards back on
    await hazardToggle.click();
    await page.waitForTimeout(500);
    const hazardAfterToggleBack = await hazardToggle.isChecked();
    console.log('Hazards after toggle back:', hazardAfterToggleBack);
    
    // Test 5: Check if buildings are always visible (no toggle)
    const buildingsSection = page.locator('text=Buildings:');
    const buildingsVisible = await buildingsSection.isVisible();
    console.log('Buildings section visible:', buildingsVisible);
    
    // Test 6: Check active features counter
    const activeFeatures = page.locator('text=/\\d+\\/6/');
    const counterVisible = await activeFeatures.isVisible();
    console.log('Active features counter visible:', counterVisible);
    
    console.log('=== LAYER CONTROLS TEST COMPLETE ===');
    
    // Assertions
    expect(controlsVisible).toBe(true);
    expect(await hazardToggle.count()).toBeGreaterThan(0);
    expect(await routesToggle.count()).toBeGreaterThan(0);
    expect(await unitsToggle.count()).toBeGreaterThan(0);
    expect(await weatherToggle.count()).toBeGreaterThan(0);
    expect(await evacZonesToggle.count()).toBeGreaterThan(0);
    expect(buildingsVisible).toBe(true);
    expect(counterVisible).toBe(true);
  });
});
