import { test, expect } from '@playwright/test';

test.describe('Setup Verification Tests', () => {
  test('should verify Playwright is working correctly', async ({ page }) => {
    // Simple test to verify Playwright setup
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Basic verification that page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Check if we can find basic elements
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    
    console.log('✅ Playwright setup verification passed');
  });

  test('should verify basic page structure', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check for basic HTML structure
    await expect(page.locator('html')).toBeVisible();
    // Note: head element is not visible by design
    await expect(page.locator('body')).toBeVisible();
    
    // Check for title
    const title = await page.title();
    expect(title).toBeTruthy();
    
    console.log(`✅ Page title: ${title}`);
    console.log('✅ Basic page structure verification passed');
  });

  test('should verify viewport handling', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Verify page is still functional at this viewport
      await expect(page.locator('body')).toBeVisible();
      
      console.log(`✅ Viewport ${viewport.name} (${viewport.width}x${viewport.height}) working`);
    }
  });
});
