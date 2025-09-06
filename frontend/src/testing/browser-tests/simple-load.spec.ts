import { test, expect } from '@playwright/test';

test.describe('Simple App Loading', () => {
  test('app loads and shows content', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the app is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check that we can see some content
    await expect(page.locator('h1:has-text("Command Center Dashboard")')).toBeVisible();
  });

  test('can see layer toggle panel', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the layer toggle panel is visible
    await expect(page.locator('[data-testid="layer-toggle-panel-debug"]')).toBeVisible();
  });
});
