import { test, expect, Page } from '@playwright/test';

/**
 * Simple 3D Map Integration Tests
 * Basic testing of 3D terrain integration
 */

test.describe('3D Map Simple Integration', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(2000);
  });

  test('3D map page loads successfully', async () => {
    console.log('🧪 Testing 3D map page load');
    
    // Check if the 3D map title is visible
    await expect(page.locator('h1:has-text("3D Disaster Response Map")')).toBeVisible();
    
    // Check if the map container is visible
    await expect(page.locator('.map-container-3d')).toBeVisible();
    
    // Check if layer controls are visible
    await expect(page.locator('text=3D Map Layer Controls')).toBeVisible();
  });

  test('3D map container has correct styling', async () => {
    console.log('🧪 Testing 3D map container styling');
    
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    // Check if the container has the expected height
    const height = await mapContainer.evaluate(el => getComputedStyle(el).height);
    expect(height).toBe('500px');
  });

  test('layer toggle panel is visible', async () => {
    console.log('🧪 Testing layer toggle panel visibility');
    
    // Check if the layer toggle panel is visible
    await expect(page.locator('text=3D Map Layer Controls')).toBeVisible();
    
    // Check if terrain toggle is present
    await expect(page.locator('[data-testid="toggle-terrain"]')).toBeVisible();
  });

  test('map loads without errors', async () => {
    console.log('🧪 Testing map loads without errors');
    
    // Wait for the map to load (look for loading text to disappear)
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('div');
      if (!loadingText) return true;
      const textContent = loadingText.textContent || '';
      return !textContent.includes('Loading 3D map...') || loadingText.offsetParent === null;
    }, { timeout: 30000 });
    
    // Check that there are no error messages
    const errorMessage = page.locator('text=3D Map Error');
    await expect(errorMessage).not.toBeVisible();
  });

  test('terrain toggle is functional', async () => {
    console.log('🧪 Testing terrain toggle functionality');
    
    // Wait for the map to load
    await page.waitForTimeout(3000);
    
    // Find the terrain toggle
    const terrainToggle = page.locator('[data-testid="toggle-terrain"]');
    await expect(terrainToggle).toBeVisible();
    
    // Check if it's clickable
    await expect(terrainToggle).toBeEnabled();
    
    // Click the toggle
    await terrainToggle.click();
    await page.waitForTimeout(1000);
    
    // Click it again to toggle back
    await terrainToggle.click();
    await page.waitForTimeout(1000);
  });

  test('validation overlay appears when enabled', async () => {
    console.log('🧪 Testing validation overlay');
    
    // Wait for the map to load and validation to complete
    await page.waitForTimeout(5000);
    
    // Check if validation overlay is visible
    const validationOverlay = page.locator('text=Layer Validation');
    await expect(validationOverlay).toBeVisible();
    
    // Check if overall status is displayed
    await expect(page.locator('text=Overall:')).toBeVisible();
  });

  test('all layer toggles are present', async () => {
    console.log('🧪 Testing all layer toggles are present');
    
    // Wait for the layer toggle panel to load
    await page.waitForTimeout(2000);
    
    // Check for all expected layer toggles
    const expectedToggles = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
    
    for (const toggle of expectedToggles) {
      const toggleElement = page.locator(`[data-testid="toggle-${toggle}"]`);
      await expect(toggleElement).toBeVisible();
    }
  });

  test('map container has proper dimensions', async () => {
    console.log('🧪 Testing map container dimensions');
    
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    // Check the container dimensions
    const boundingBox = await mapContainer.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(300); // More flexible for mobile devices
    expect(boundingBox!.height).toBeGreaterThan(400); // More flexible for mobile devices
  });

  test('page navigation works correctly', async () => {
    console.log('🧪 Testing page navigation');
    
    // Go back to dashboard
    await page.click('button:has-text("Dashboard")');
    await page.waitForTimeout(1000);
    
    // Check that we're back on the dashboard
    await expect(page.locator('h1:has-text("Command Center Dashboard")')).toBeVisible();
    
    // Go back to 3D map
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(1000);
    
    // Check that we're back on the 3D map
    await expect(page.locator('h1:has-text("3D Disaster Response Map")')).toBeVisible();
  });
});
