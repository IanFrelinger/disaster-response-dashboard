import { test, expect } from '@playwright/test';

test.describe('Integrated Dashboard Test', () => {
  test('should display integrated dashboard with all view modes', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3000');
    
    // Wait for the dashboard to load
    await page.waitForSelector('.evacuation-dashboard', { timeout: 10000 });
    
    console.log('=== INTEGRATED DASHBOARD TEST ===');
    
    // Test 1: Check if dashboard is loaded
    const dashboard = page.locator('.evacuation-dashboard');
    const dashboardVisible = await dashboard.isVisible();
    console.log('Dashboard visible:', dashboardVisible);
    
    // Test 2: Check if all view mode buttons are present
    const zonesButton = page.locator('button:has-text("🏘️ Zones")');
    const buildingsButton = page.locator('button:has-text("🏢 Buildings")');
    const detailsButton = page.locator('button:has-text("📋 Details")');
    const weatherButton = page.locator('button:has-text("🌤️ Weather")');
    const buildingOverviewButton = page.locator('button:has-text("🏗️ Building Overview")');
    
    console.log('Zones button present:', await zonesButton.isVisible());
    console.log('Buildings button present:', await buildingsButton.isVisible());
    console.log('Details button present:', await detailsButton.isVisible());
    console.log('Weather button present:', await weatherButton.isVisible());
    console.log('Building Overview button present:', await buildingOverviewButton.isVisible());
    
    // Test 3: Check if zones view is displayed by default
    const zonesView = page.locator('.zones-overview');
    const zonesViewVisible = await zonesView.isVisible();
    console.log('Zones view visible by default:', zonesViewVisible);
    
    // Test 4: Test weather view
    await weatherButton.click();
    await page.waitForTimeout(1000);
    
    const weatherView = page.locator('.weather-view');
    const weatherViewVisible = await weatherView.isVisible();
    console.log('Weather view visible after click:', weatherViewVisible);
    
    if (weatherViewVisible) {
      // Check weather content
      const currentConditions = page.locator('text=📊 Current Conditions');
      const emsImpact = page.locator('text=🚑 EMS Impact Assessment');
      const forecast = page.locator('text=📅 Forecast & Alerts');
      
      console.log('Current conditions section:', await currentConditions.isVisible());
      console.log('EMS impact section:', await emsImpact.isVisible());
      console.log('Forecast section:', await forecast.isVisible());
    }
    
    // Test 5: Test building overview view
    await buildingOverviewButton.click();
    await page.waitForTimeout(1000);
    
    const buildingOverviewView = page.locator('.building-overview-view');
    const buildingOverviewVisible = await buildingOverviewView.isVisible();
    console.log('Building overview view visible after click:', buildingOverviewVisible);
    
    if (buildingOverviewVisible) {
      // Check building overview content
      const overallStats = page.locator('text=📊 Overall Statistics');
      const zoneSummary = page.locator('text=🏘️ Zone Summary');
      
      console.log('Overall stats section:', await overallStats.isVisible());
      console.log('Zone summary section:', await zoneSummary.isVisible());
    }
    
    // Test 6: Test zones view
    await zonesButton.click();
    await page.waitForTimeout(1000);
    
    const zonesViewAfterClick = page.locator('.zones-overview');
    const zonesViewVisibleAfterClick = await zonesViewAfterClick.isVisible();
    console.log('Zones view visible after click:', zonesViewVisibleAfterClick);
    
    console.log('=== INTEGRATED DASHBOARD TEST COMPLETE ===');
    
    // Assertions
    expect(dashboardVisible).toBe(true);
    expect(await zonesButton.isVisible()).toBe(true);
    expect(await buildingsButton.isVisible()).toBe(true);
    expect(await detailsButton.isVisible()).toBe(true);
    expect(await weatherButton.isVisible()).toBe(true);
    expect(await buildingOverviewButton.isVisible()).toBe(true);
    expect(zonesViewVisible).toBe(true);
    expect(weatherViewVisible).toBe(true);
    expect(buildingOverviewVisible).toBe(true);
    expect(zonesViewVisibleAfterClick).toBe(true);
  });
  
  test('should navigate between different view modes correctly', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3000');
    
    // Wait for the dashboard to load
    await page.waitForSelector('.evacuation-dashboard', { timeout: 10000 });
    
    console.log('=== VIEW MODE NAVIGATION TEST ===');
    
    // Test 1: Start with zones view
    const zonesButton = page.locator('button:has-text("🏘️ Zones")');
    const zonesView = page.locator('.zones-overview');
    
    await zonesButton.click();
    await page.waitForTimeout(1000);
    
    let zonesViewVisible = await zonesView.isVisible();
    console.log('Zones view visible after zones button click:', zonesViewVisible);
    
    // Test 2: Switch to weather view
    const weatherButton = page.locator('button:has-text("🌤️ Weather")');
    const weatherView = page.locator('.weather-view');
    
    await weatherButton.click();
    await page.waitForTimeout(1000);
    
    let weatherViewVisible = await weatherView.isVisible();
    let zonesViewHidden = !(await zonesView.isVisible());
    console.log('Weather view visible after weather button click:', weatherViewVisible);
    console.log('Zones view hidden after weather button click:', zonesViewHidden);
    
    // Test 3: Switch to building overview view
    const buildingOverviewButton = page.locator('button:has-text("🏗️ Building Overview")');
    const buildingOverviewView = page.locator('.building-overview-view');
    
    await buildingOverviewButton.click();
    await page.waitForTimeout(1000);
    
    let buildingOverviewVisible = await buildingOverviewView.isVisible();
    let weatherViewHidden = !(await weatherView.isVisible());
    console.log('Building overview visible after building overview button click:', buildingOverviewVisible);
    console.log('Weather view hidden after building overview button click:', weatherViewHidden);
    
    // Test 4: Return to zones view
    await zonesButton.click();
    await page.waitForTimeout(1000);
    
    zonesViewVisible = await zonesView.isVisible();
    let buildingOverviewHidden = !(await buildingOverviewView.isVisible());
    console.log('Zones view visible after return to zones:', zonesViewVisible);
    console.log('Building overview hidden after return to zones:', buildingOverviewHidden);
    
    console.log('=== VIEW MODE NAVIGATION TEST COMPLETE ===');
    
    // Assertions
    expect(zonesViewVisible).toBe(true);
    expect(weatherViewVisible).toBe(true);
    expect(buildingOverviewVisible).toBe(true);
    expect(zonesViewHidden).toBe(true);
    expect(weatherViewHidden).toBe(true);
    expect(buildingOverviewHidden).toBe(true);
  });
});
