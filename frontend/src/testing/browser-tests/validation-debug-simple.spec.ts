import { test, expect, Page } from '@playwright/test';

/**
 * Simple validation debug test to trace the exact issue
 */

test.describe('Validation Debug Simple', () => {
  test('trace validation API availability and calls', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    // Capture console logs
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(5000);

    // Check if the validation API is available
    const apiCheck = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      return {
        hasApi: !!api,
        hasValidateLayers: !!(api && api.validateLayers),
        hasGetMapInstance: !!(api && api.getMapInstance),
        apiKeys: api ? Object.keys(api) : []
      };
    });
    
    console.log('🔍 API Check:', JSON.stringify(apiCheck, null, 2));
    
    // Try to call validateLayers and see what happens
    const validationCall = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { error: 'API not available' };
      }
      
      try {
        console.log('🚀 About to call validateLayers...');
        const result = api.validateLayers();
        console.log('✅ validateLayers returned:', result);
        return { success: true, result };
      } catch (error) {
        console.log('❌ validateLayers threw error:', error);
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    console.log('🔍 Validation Call Result:', JSON.stringify(validationCall, null, 2));
    
    // Check if we can see the debug logs
    console.log('🔍 Console Logs Captured:', consoleLogs.length);
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    expect(true).toBe(true);
  });
});
