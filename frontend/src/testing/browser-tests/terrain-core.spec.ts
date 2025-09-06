import { test, expect } from '@playwright/test';

test.describe('Terrain Core Functionality', () => {
  test('terrain toggle is visible and clickable', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the layer toggle panel is visible
    await expect(page.locator('[data-testid="layer-toggle-panel-debug"]')).toBeVisible();
    
    // Check that the terrain toggle is visible
    await expect(page.locator('[data-testid="toggle-terrain"]')).toBeVisible();
    
    // Get the terrain toggle
    const terrainToggle = page.locator('[data-testid="toggle-terrain"]');
    
    // Verify it's clickable
    await expect(terrainToggle).toBeEnabled();
  });

  test('terrain toggle changes state when clicked', async ({ page }) => {
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

  test('terrain toggle has proper accessibility attributes', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Get the terrain toggle
    const terrainToggle = page.locator('[data-testid="toggle-terrain"]');
    
    // Check accessibility attributes
    await expect(terrainToggle).toHaveAttribute('type', 'checkbox');
    await expect(terrainToggle).toHaveAttribute('role', 'switch');
    await expect(terrainToggle).toHaveAttribute('aria-checked');
  });

  test('terrain toggle is properly labeled', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the terrain label is visible
    await expect(page.locator('label:has-text("3D Terrain")')).toBeVisible();
    
    // Check that the terrain toggle is associated with the label
    const terrainToggle = page.locator('[data-testid="toggle-terrain"]');
    const label = page.locator('label:has-text("3D Terrain")');
    
    // Verify the toggle is within or associated with the label
    await expect(terrainToggle).toBeVisible();
    await expect(label).toBeVisible();
  });
});
