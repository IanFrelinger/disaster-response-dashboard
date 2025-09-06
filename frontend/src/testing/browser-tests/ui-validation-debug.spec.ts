import { test, expect, Page } from '@playwright/test';

/**
 * UI Validation Debug - Check what the UI is actually displaying
 */

test.describe('UI Validation Debug', () => {
  test('check UI validation display vs API results', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to fully initialize
    await page.waitForTimeout(10000);
    
    // Check if validation overlay is visible
    const validationOverlay = page.locator('text=Layer Validation');
    const isOverlayVisible = await validationOverlay.isVisible();
    
    console.log('🔍 Validation Overlay Visible:', isOverlayVisible);
    
    if (isOverlayVisible) {
      // Get the text content of the validation overlay
      const overlayText = await validationOverlay.locator('..').textContent();
      console.log('📋 Validation Overlay Text:');
      console.log(overlayText);
      
      // Check for specific validation text
      const overallText = await page.locator('text=Overall:').textContent();
      console.log('📊 Overall Text:', overallText);
      
      // Check individual layer statuses
      const layerStatuses = await page.locator('div').filter({ hasText: /terrain:|buildings:|hazards:|units:|routes:/ }).allTextContents();
      console.log('🔍 Layer Statuses:');
      layerStatuses.forEach((status, index) => {
        console.log(`${index + 1}. ${status}`);
      });
    }
    
    // Also get the API validation results
    const apiResults = await page.evaluate(async () => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { error: 'API not available' };
      }
      
      try {
        const results = await api.validateLayers();
        return {
          success: true,
          results: results
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('🔍 API Validation Results:');
    console.log('==========================');
    console.log(JSON.stringify(apiResults, null, 2));
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/ui-validation-debug.png', fullPage: true });
    
    // Basic assertions
    expect(isOverlayVisible).toBe(true);
    expect(apiResults.success).toBe(true);
  });
});
