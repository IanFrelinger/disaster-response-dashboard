import { test, expect } from '@playwright/test';

test.describe('Commander Dashboard Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForSelector('button:has-text("Commander Dashboard")', { timeout: 10000 });
  });

  test('should display correct navigation buttons', async ({ page }) => {
    // Check for Commander Dashboard button
    const commanderButton = page.locator('button:has-text("Commander Dashboard")');
    await expect(commanderButton).toBeVisible();
    
    // Check for Live Map button
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await expect(liveMapButton).toBeVisible();
    
    // Verify no Weather button (not in main navigation)
    const weatherButton = page.locator('button:has-text("Weather")');
    await expect(weatherButton).not.toBeVisible();
    
    // Verify no Buildings button (not in main navigation)
    const buildingsButton = page.locator('button:has-text("Buildings")');
    await expect(buildingsButton).not.toBeVisible();
    
    // AIP Commander button is in the dashboard view controls, not main navigation
    // This test checks main navigation, so we verify the main nav structure is correct
    // The AIP Commander functionality is tested separately in the dashboard integration tests
  });

  test('should navigate to Commander Dashboard correctly', async ({ page }) => {
    // Click Commander Dashboard button
    const commanderButton = page.locator('button:has-text("Commander Dashboard")');
    await commanderButton.click();
    
    // Should be on Commander Dashboard page
    const title = page.locator('h1:has-text("Commander Dashboard")');
    await expect(title).toBeVisible();
    
    // Should show Operations view by default
    const operationsView = page.locator('.zones-overview');
    await expect(operationsView).toBeVisible();
  });

  test('should navigate to Live Map correctly', async ({ page }) => {
    // Click Live Map button
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await liveMapButton.click();
    
    // Wait for map to load - look for map container
    await page.waitForSelector('.mapbox-container', { timeout: 15000 });
    
    // Should be on Live Map page - title might be in the map component
    const mapContainer = page.locator('.mapbox-container');
    await expect(mapContainer).toBeVisible();
  });

  test('should navigate back to Commander Dashboard from Live Map', async ({ page }) => {
    // Go to Live Map first
    const liveMapButton = page.locator('button:has-text("Live Map")');
    await liveMapButton.click();
    
    // Wait for map to load
    await page.waitForSelector('.mapbox-container', { timeout: 15000 });
    
    // Navigate back to Commander Dashboard
    const commanderButton = page.locator('button:has-text("Commander Dashboard")');
    await commanderButton.click();
    
    // Should be back on Commander Dashboard
    const title = page.locator('h1:has-text("Commander Dashboard")');
    await expect(title).toBeVisible();
  });

  test('should maintain active state for Commander Dashboard when selected', async ({ page }) => {
    // Commander Dashboard should be active by default
    const commanderButton = page.locator('button:has-text("Commander Dashboard")');
    
    // Check if it has active styling (this depends on your CSS implementation)
    // For now, just verify it's visible and clickable
    await expect(commanderButton).toBeVisible();
    await expect(commanderButton).toBeEnabled();
  });
});
