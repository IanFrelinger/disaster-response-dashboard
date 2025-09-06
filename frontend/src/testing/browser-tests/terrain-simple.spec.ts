import { test, expect } from '@playwright/test';

test.describe('Terrain Toggle - Simple', () => {
  test('can see terrain toggle in layer panel', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the layer toggle panel is visible
    await expect(page.locator('[data-testid="layer-toggle-panel-debug"]')).toBeVisible();
    
    // Check that the terrain toggle is visible
    await expect(page.locator('[data-testid="toggle-terrain"]')).toBeVisible();
    
    // Check that the terrain toggle is visible (state may vary)
    await expect(page.locator('[data-testid="toggle-terrain"]')).toBeVisible();
  });

  test('can toggle terrain on and off', async ({ page }) => {
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
    
    // Check that terrain state has changed
    await expect(terrainToggle).toBeChecked({ checked: !initialState });
    
    // Click to toggle terrain again
    await terrainToggle.click();
    
    // Check that terrain state has changed back
    await expect(terrainToggle).toBeChecked({ checked: initialState });
  });

  test('terrain toggle works with keyboard', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Get the terrain toggle
    const terrainToggle = page.locator('[data-testid="toggle-terrain"]');
    
    // Get initial state
    const initialState = await terrainToggle.isChecked();
    
    // Focus on the terrain toggle
    await terrainToggle.focus();
    
    // Wait a moment for focus to be established
    await page.waitForTimeout(100);
    
    // Use space key to toggle
    await page.keyboard.press('Space');
    
    // Wait for state change
    await page.waitForTimeout(200);
    
    // Check that terrain state has changed
    const newState = await terrainToggle.isChecked();
    expect(newState).toBe(!initialState);
    
    // Use space key to toggle again
    await page.keyboard.press('Space');
    
    // Wait for state change
    await page.waitForTimeout(200);
    
    // Check that terrain state has changed back
    const finalState = await terrainToggle.isChecked();
    expect(finalState).toBe(initialState);
  });
});
