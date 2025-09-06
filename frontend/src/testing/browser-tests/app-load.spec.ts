import { test, expect } from '@playwright/test';

test.describe('App Loading', () => {
  test('app loads successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to be ready
    await page.waitForFunction(() => (window as any).__appIdle === true, { timeout: 10000 });
    
    // Check that the app is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check that we can see the dashboard
    await expect(page.locator('h1:has-text("Command Center Dashboard")')).toBeVisible();
  });

  test('can navigate to map view', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to be ready
    await page.waitForFunction(() => (window as any).__appIdle === true, { timeout: 10000 });
    
    // Click the map button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to be ready
    await page.waitForFunction(() => (window as any).__mapReady === true, { timeout: 15000 });
    
    // Check that the map container is visible
    await expect(page.locator('.map-container')).toBeVisible();
  });
});
