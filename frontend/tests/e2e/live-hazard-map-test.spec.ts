import { test, expect } from '@playwright/test';

test.describe('Live Hazard Response Map Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main application
    await page.goto('http://localhost:3000/');
    
    // Wait for the page to load and then navigate to the map view
    await page.waitForSelector('text=🗺️ Live Map', { timeout: 10000 });
    await page.click('text=🗺️ Live Map');
    
    // Wait for the map to load
    await page.waitForSelector('.mapboxgl-map', { timeout: 30000 });
    
    // Wait for the map title to appear
    await page.waitForSelector('text=🚨 Live Hazard Response Map', { timeout: 10000 });
  });

  test('should display the Live Hazard Response Map title and description', async ({ page }) => {
    // Verify the main heading
    const mainHeading = page.locator('text=🚨 Live Hazard Response Map');
    await expect(mainHeading).toBeVisible();
    
    // Verify the description
    const description = page.locator('text=Real-time 3D terrain visualization with live hazard data and Foundry integration');
    await expect(description).toBeVisible();
  });

  test('should show map control toggles', async ({ page }) => {
    // Check for the control toggles - use first() to handle multiple instances
    const liveDataToggle = page.locator('text=Live Data').first();
    const terrainToggle = page.locator('text=3D Terrain').first();
    const buildingsToggle = page.locator('text=3D Buildings').first();
    const foundryToggle = page.locator('text=Foundry Data').first();
    
    await expect(liveDataToggle).toBeVisible();
    await expect(terrainToggle).toBeVisible();
    await expect(buildingsToggle).toBeVisible();
    await expect(foundryToggle).toBeVisible();
  });

  test('should display weather operations panel', async ({ page }) => {
    // Wait for weather panel to be visible
    await page.waitForSelector('text=🌤️ Weather Operations', { timeout: 10000 });
    
    // Check weather panel components
    const weatherHeading = page.locator('text=🌤️ Weather Operations');
    const currentConditions = page.locator('text=📊 Current Conditions');
    const emsImpact = page.locator('text=🚑 EMS Impact');
    const forecast = page.locator('text=📅 Forecast');
    
    await expect(weatherHeading).toBeVisible();
    await expect(currentConditions).toBeVisible();
    await expect(emsImpact).toBeVisible();
    await expect(forecast).toBeVisible();
  });

  test('should show current weather conditions', async ({ page }) => {
    // Wait for weather data to load
    await page.waitForSelector('text=🌡️ Temp:', { timeout: 10000 });
    
    // Check that temperature is displayed
    const temperature = page.locator('text=🌡️ Temp:');
    const humidity = page.locator('text=💧 Humidity:');
    const wind = page.locator('text=💨 Wind:');
    const direction = page.locator('text=🧭 Direction:');
    
    await expect(temperature).toBeVisible();
    await expect(humidity).toBeVisible();
    await expect(wind).toBeVisible();
    await expect(direction).toBeVisible();
  });

  test('should display EMS impact assessment', async ({ page }) => {
    // Wait for EMS impact section
    await page.waitForSelector('text=🚑 EMS Impact', { timeout: 10000 });
    
    // Check EMS impact components
    const fireRisk = page.locator('text=🔥 Fire Risk:');
    const evacuation = page.locator('text=🚨 Evacuation:');
    const airOps = page.locator('text=🚁 Air Operations:');
    
    await expect(fireRisk).toBeVisible();
    await expect(evacuation).toBeVisible();
    await expect(airOps).toBeVisible();
  });

  test('should show forecast information', async ({ page }) => {
    // Wait for forecast section
    await page.waitForSelector('text=📅 Forecast', { timeout: 10000 });
    
    // Check forecast components
    const forecastHeading = page.locator('text=📅 Forecast');
    await expect(forecastHeading).toBeVisible();
    
    // Check for time-based forecasts - check each individually
    const time18 = page.locator('text=18:00:').first();
    const timeOvernight = page.locator('text=Overnight:').first();
    const time22 = page.locator('text=22:00:').first();
    
    // At least one should be visible
    const hasTimeForecasts = await time18.isVisible() || await timeOvernight.isVisible() || await time22.isVisible();
    expect(hasTimeForecasts).toBe(true);
  });

  test('should display map analytics panel', async ({ page }) => {
    // Wait for analytics panel
    await page.waitForSelector('text=Map Analytics', { timeout: 10000 });
    
    // Check analytics components
    const analyticsHeading = page.locator('text=Map Analytics');
    const hazards = page.locator('text=Hazards:');
    const routes = page.locator('text=Routes:');
    const units = page.locator('text=Units:');
    const buildings = page.locator('text=Buildings:');
    
    await expect(analyticsHeading).toBeVisible();
    await expect(hazards).toBeVisible();
    await expect(routes).toBeVisible();
    await expect(units).toBeVisible();
    await expect(buildings).toBeVisible();
  });

  test('should show active features status', async ({ page }) => {
    // Wait for active features to load
    await page.waitForSelector('text=Active Features:', { timeout: 15000 });
    
    // Check active features display
    const activeFeatures = page.locator('text=Active Features:');
    await expect(activeFeatures).toBeVisible();
    
    // Wait for loading to complete - look for "Loaded" status instead of "Loading..."
    await page.waitForSelector('text=3D Terrain Loaded', { timeout: 30000 });
    
    // Check that features are marked as loaded
    const terrainLoaded = page.locator('text=3D Terrain Loaded').first();
    const buildingsLoaded = page.locator('text=3D Buildings Loaded').first();
    const hazardsLoaded = page.locator('text=Hazards Loaded').first();
    
    // All should be visible after loading completes
    await expect(terrainLoaded).toBeVisible();
    await expect(buildingsLoaded).toBeVisible();
    await expect(hazardsLoaded).toBeVisible();
  });

  test('should display hazard legend', async ({ page }) => {
    // Wait for hazard legend
    await page.waitForSelector('text=Hazard Legend', { timeout: 15000 });
    
    // Check hazard legend components
    const legendHeading = page.locator('text=Hazard Legend');
    const highRisk = page.locator('text=High Risk');
    const mediumRisk = page.locator('text=Medium Risk');
    const lowRisk = page.locator('text=Low Risk');
    
    await expect(legendHeading).toBeVisible();
    await expect(highRisk).toBeVisible();
    await expect(mediumRisk).toBeVisible();
    await expect(lowRisk).toBeVisible();
  });

  test('should show location and view information', async ({ page }) => {
    // Wait for location info
    await page.waitForSelector('text=Location:', { timeout: 15000 });
    
    // Check location and view info
    const location = page.locator('text=Location:');
    const view = page.locator('text=View:');
    const lastUpdate = page.locator('text=Last Update:');
    
    await expect(location).toBeVisible();
    await expect(view).toBeVisible();
    await expect(lastUpdate).toBeVisible();
  });

  test('should display live data status', async ({ page }) => {
    // Wait for live data status
    await page.waitForSelector('text=Live Data', { timeout: 15000 });
    
    // Check live data indicator - use first() to handle multiple instances
    const liveData = page.locator('text=Live Data').first();
    await expect(liveData).toBeVisible();
    
    // Check that the map shows it's actively updating
    const updateInfo = page.locator('text=Last Update:');
    await expect(updateInfo).toBeVisible();
  });

  test('should have functional map controls', async ({ page }) => {
    // Check that the map is interactive
    const mapElement = page.locator('.mapboxgl-map');
    await expect(mapElement).toBeVisible();
    
    // Verify map container has proper dimensions
    const mapBox = await mapElement.boundingBox();
    expect(mapBox).toBeTruthy();
    expect(mapBox.width).toBeGreaterThan(100);
    expect(mapBox.height).toBeGreaterThan(100);
  });

  test('should display footer information', async ({ page }) => {
    // Check footer content
    const footer = page.locator('text=Live Hazard Response Map • Real-time 3D terrain visualization with Foundry data integration');
    const builtWith = page.locator('text=Built with Mapbox GL JS, React, and Palantir Foundry Data Fusion');
    
    await expect(footer).toBeVisible();
    await expect(builtWith).toBeVisible();
  });

  test('should handle map interactions without errors', async ({ page }) => {
    // Wait for map to be fully loaded
    await page.waitForTimeout(3000);
    
    // Try to interact with the map (this should not throw errors)
    const mapElement = page.locator('.mapboxgl-map');
    
    // Click on the map (should not cause layer errors)
    await mapElement.click();
    
    // Check that no error messages are displayed
    const errorMessages = page.locator('text=Map error:').or(page.locator('text=Error:'));
    await expect(errorMessages).not.toBeVisible();
  });
});
