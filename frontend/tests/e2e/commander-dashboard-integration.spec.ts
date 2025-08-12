import { test, expect } from '@playwright/test';

test.describe('Commander Dashboard Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Commander Dashboard")', { timeout: 10000 });
  });

  test('should display Commander Dashboard with correct title and subtitle', async ({ page }) => {
    // Check the main title
    const title = page.locator('h1:has-text("Commander Dashboard")');
    await expect(title).toBeVisible();
    
    // Check the subtitle
    const subtitle = page.locator('p:has-text("Command center for emergency response operations with real-time situational awareness")');
    await expect(subtitle).toBeVisible();
  });

  test('should display commander-focused interface', async ({ page }) => {
    // Check that the Commander Dashboard has a clean, focused interface
    const title = page.locator('h1:has-text("Commander Dashboard")');
    await expect(title).toBeVisible();
    
    const subtitle = page.locator('p:has-text("Command center for emergency response operations with real-time situational awareness")');
    await expect(subtitle).toBeVisible();
    
    // Verify the interface is clean without status indicator clutter
    const statusIndicators = page.locator('span:has-text("Critical"), span:has-text("Real-time"), span:has-text("Response"), span:has-text("Command")');
    await expect(statusIndicators).toHaveCount(0);
  });

  test('should display updated view mode buttons', async ({ page }) => {
    // Check for the new view mode buttons
    const operationsButton = page.locator('button:has-text("Operations")');
    await expect(operationsButton).toBeVisible();
    
    const conditionsButton = page.locator('button:has-text("Conditions")');
    await expect(conditionsButton).toBeVisible();
    
    const assetsButton = page.locator('button:has-text("Assets")');
    await expect(assetsButton).toBeVisible();
  });

  test('should navigate between view modes correctly', async ({ page }) => {
    // Start in Operations view (default)
    const operationsView = page.locator('.zones-overview');
    await expect(operationsView).toBeVisible();
    
    // Navigate to Conditions view
    const conditionsButton = page.locator('button:has-text("Conditions")');
    await conditionsButton.click();
    
    const conditionsView = page.locator('.weather-view');
    await expect(conditionsView).toBeVisible();
    
    // Check the updated header
    const conditionsHeader = page.locator('h3:has-text("Environmental Conditions")');
    await expect(conditionsHeader).toBeVisible();
    
    // Navigate to Assets view
    const assetsButton = page.locator('button:has-text("Assets")');
    await assetsButton.click();
    
    const assetsView = page.locator('.building-overview-view');
    await expect(assetsView).toBeVisible();
    
    // Check the updated header
    const assetsHeader = page.locator('h3:has-text("Asset Management & Status")');
    await expect(assetsHeader).toBeVisible();
    
    // Navigate back to Operations view
    const operationsButton = page.locator('button:has-text("Operations")');
    await operationsButton.click();
    
    await expect(operationsView).toBeVisible();
  });

  test('should display evacuation zones in Operations view', async ({ page }) => {
    // Ensure we're in Operations view
    const operationsView = page.locator('.zones-overview');
    await expect(operationsView).toBeVisible();
    
    // Check for zone cards
    const zoneCards = page.locator('.zone-card');
    await expect(zoneCards).toHaveCount(3); // Should have 3 zones
    
    // Check first zone details
    const firstZone = zoneCards.first();
    await expect(firstZone.locator('h3')).toBeVisible();
    await expect(firstZone.locator('.priority-badge')).toBeVisible();
    await expect(firstZone.locator('.zone-stats')).toBeVisible();
  });

  test('should display weather information in Conditions view', async ({ page }) => {
    // Navigate to Conditions view
    const conditionsButton = page.locator('button:has-text("Conditions")');
    await conditionsButton.click();
    
    // Wait for conditions view to load
    const conditionsView = page.locator('.weather-view');
    await expect(conditionsView).toBeVisible();
    
    // Check for weather components
    const currentConditions = page.locator('h4:has-text("Current Conditions")');
    await expect(currentConditions).toBeVisible();
    
    const emsImpact = page.locator('h4:has-text("EMS Impact")');
    await expect(emsImpact).toBeVisible();
    
    const forecast = page.locator('h4:has-text("Forecast")');
    await expect(forecast).toBeVisible();
  });

  test('should display building assets in Assets view', async ({ page }) => {
    // Navigate to Assets view
    const assetsButton = page.locator('button:has-text("Assets")');
    await assetsButton.click();
    
    // Wait for assets view to load
    const assetsView = page.locator('.building-overview-view');
    await expect(assetsView).toBeVisible();
    
    // Check for asset components
    const overallStats = page.locator('h4:has-text("Overall Statistics")');
    await expect(overallStats).toBeVisible();
    
    const zoneSummary = page.locator('h4:has-text("Zone Summary")');
    await expect(zoneSummary).toBeVisible();
  });

  test('should maintain iOS styling throughout', async ({ page }) => {
    // Check that iOS classes are applied
    const dashboard = page.locator('.evacuation-dashboard');
    await expect(dashboard).toHaveClass(/evacuation-dashboard/);
    
    // Check for iOS button styling - now 4 buttons including AIP Commander
    const buttons = page.locator('.ios-button');
    await expect(buttons).toHaveCount(4); // Operations, Conditions, Assets, AIP Commander
    
    // Check for iOS container styling - use first to avoid strict mode violation
    const firstContainer = page.locator('.ios-container').first();
    await expect(firstContainer).toBeVisible();
  });

  test('should display AIP Commander functionality', async ({ page }) => {
    // Verify AIP Commander button is present
    const aipButton = page.locator('button:has-text("AIP Commander")');
    await expect(aipButton).toBeVisible();
    
    // Click on AIP Commander button
    await aipButton.click();
    
    // Verify AIP view is accessible
    const aipView = page.locator('.aip-view');
    await expect(aipView).toBeVisible();
    
    // Verify AIP component elements are displayed
    const aipTitle = page.locator('h3:has-text("AIP-Powered Decision Support")');
    await expect(aipTitle).toBeVisible();
    
    const aipSubtitle = page.locator('p:has-text("Natural language command interface with explainable AI decisions for disaster response")');
    await expect(aipSubtitle).toBeVisible();
  });

  test('should handle zone selection correctly', async ({ page }) => {
    // Ensure we're in Operations view
    const operationsView = page.locator('.zones-overview');
    await expect(operationsView).toBeVisible();
    
    // Click on first zone
    const firstZone = page.locator('.zone-card').first();
    await firstZone.click();
    
    // Should remain in Operations view (no navigation to buildings view)
    await expect(operationsView).toBeVisible();
  });

  test('should display correct navigation in main header', async ({ page }) => {
    // Check main navigation buttons
    const commanderDashboardButton = page.locator('button:has-text("Commander Dashboard")');
    await expect(commanderDashboardButton).toBeVisible();
    
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await expect(liveMapButton).toBeVisible();
    
    // Verify AIP Commander button is present in dashboard view controls
    const aipButton = page.locator('button:has-text("AIP Commander")');
    await expect(aipButton).toBeVisible();
  });
});
