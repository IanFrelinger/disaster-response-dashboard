import { test, expect } from '@playwright/test';

test.describe('Terrain Toggle - Final Validation', () => {
  test('terrain toggle is visible and functional', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the layer toggle panel is visible
    await expect(page.locator('[data-testid="layer-toggle-panel-debug"]')).toBeVisible();
    
    // Check that the terrain toggle is visible
    await expect(page.locator('[data-testid="toggle-terrain"]')).toBeVisible();
  });

  test('terrain toggle can be clicked to change state', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Get the terrain toggle
    const terrainToggle = page.locator('[data-testid="toggle-terrain"]');
    
    // Get initial state
    const initialState = await terrainToggle.isChecked();
    
    // Click to toggle terrain
    await terrainToggle.click();
    
    // Wait for state change
    await page.waitForTimeout(200);
    
    // Check that terrain state has changed
    const newState = await terrainToggle.isChecked();
    expect(newState).toBe(!initialState);
    
    // Click to toggle terrain again
    await terrainToggle.click();
    
    // Wait for state change
    await page.waitForTimeout(200);
    
    // Check that terrain state has changed back
    const finalState = await terrainToggle.isChecked();
    expect(finalState).toBe(initialState);
  });

  test('terrain toggle works in map view', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click the map button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to load
    await page.waitForTimeout(2000);
    
    // Check that the map container is visible
    await expect(page.locator('.map-container')).toBeVisible();
    
    // Check that the terrain toggle is still visible
    await expect(page.locator('[data-testid="toggle-terrain"]')).toBeVisible();
    
    // Get the terrain toggle
    const terrainToggle = page.locator('[data-testid="toggle-terrain"]');
    
    // Get initial state
    const initialState = await terrainToggle.isChecked();
    
    // Click to toggle terrain
    await terrainToggle.click();
    
    // Wait for state change
    await page.waitForTimeout(500);
    
    // Check that terrain state has changed
    const newState = await terrainToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('terrain toggle maintains state across view changes', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Get the terrain toggle in dashboard view
    const terrainToggle = page.locator('[data-testid="toggle-terrain"]');
    
    // Get initial state
    const initialState = await terrainToggle.isChecked();
    
    // Toggle terrain in dashboard view
    await terrainToggle.click();
    await page.waitForTimeout(200);
    
    // Navigate to map view
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(2000);
    
    // Check that terrain toggle state is maintained
    const mapTerrainToggle = page.locator('[data-testid="toggle-terrain"]');
    const mapState = await mapTerrainToggle.isChecked();
    expect(mapState).toBe(!initialState);
  });
});
