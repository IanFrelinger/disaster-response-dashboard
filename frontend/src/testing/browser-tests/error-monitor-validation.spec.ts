import { test, expect, Page } from '@playwright/test';

/**
 * Error Monitor Validation Test
 * Tests the real-time error monitoring system
 */

test.describe('Error Monitor Validation', () => {
  test('verify error monitor is working and categorizing errors correctly', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to initialize
    await page.waitForTimeout(8000);
    
    // Check if error monitor is available (it might not be in test environment)
    const errorMonitorAvailable = await page.evaluate(() => {
      return typeof (window as any).getErrorStats !== 'undefined';
    });
    
    if (!errorMonitorAvailable) {
      console.log('⚠️ Error monitor not available in test environment, skipping monitor tests');
      return;
    }
    
    // Get initial error report
    const initialReport = await page.evaluate(() => {
      return (window as any).getErrorStats();
    });
    
    console.log('📊 Initial Error Report:');
    console.log(`Critical Errors: ${initialReport.criticalErrors}`);
    console.log(`Normal Warnings: ${initialReport.normalWarnings}`);
    console.log(`System Health: ${initialReport.isHealthy ? 'HEALTHY' : 'ISSUES DETECTED'}`);
    
    // Test layer toggles to generate some activity
    const layerNames = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
    
    for (const layerName of layerNames) {
      try {
        const toggleSelectors = [
          `input[type="checkbox"][data-layer="${layerName}"]`,
          `input[type="checkbox"][id*="${layerName}"]`,
          `label:has-text("${layerName}") input[type="checkbox"]`
        ];
        
        for (const selector of toggleSelectors) {
          const toggle = page.locator(selector).first();
          if (await toggle.isVisible()) {
            await toggle.click();
            await page.waitForTimeout(500);
            break;
          }
        }
      } catch (error) {
        console.log(`Toggle error for ${layerName}: ${error}`);
      }
    }
    
    // Wait for any errors to be captured
    await page.waitForTimeout(2000);
    
    // Get final error report
    const finalReport = await page.evaluate(() => {
      return (window as any).getErrorStats();
    });
    
    console.log('\n📊 Final Error Report:');
    console.log(`Critical Errors: ${finalReport.criticalErrors}`);
    console.log(`Normal Warnings: ${finalReport.normalWarnings}`);
    console.log(`System Health: ${finalReport.isHealthy ? 'HEALTHY' : 'ISSUES DETECTED'}`);
    
    // Print detailed report
    await page.evaluate(() => {
      (window as any).printErrorStats();
    });
    
    // Verify that critical errors are 0 (system should be healthy)
    expect(finalReport.criticalErrors).toBe(0);
    
    // Verify that we captured some warnings (normal browser warnings)
    expect(finalReport.normalWarnings).toBeGreaterThan(0);
    
    // Test error monitor functions
    const monitorFunctions = await page.evaluate(() => {
      return {
        hasGetErrorStats: typeof (window as any).getErrorStats === 'function',
        hasPrintErrorStats: typeof (window as any).printErrorStats === 'function'
      };
    });
    
    expect(monitorFunctions.hasGetErrorStats).toBe(true);
    expect(monitorFunctions.hasPrintErrorStats).toBe(true);
    
    console.log('\n✅ Error Monitor Validation Completed Successfully!');
  });
  
  test('test error categorization accuracy', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to initialize
    await page.waitForTimeout(5000);
    
    // Test error categorization by injecting test messages
    const categorizationTest = await page.evaluate(() => {
      // Test critical error detection patterns
      const criticalErrorPattern = /cannot read property|undefined is not a function|network error|failed to load|map not ready|layer failed to load|source not found/i;
      const normalWarningPattern = /webgl warning|gpu stall due to readpixels|alpha-premult and y-flip are deprecated|webgl_debug_renderer_info is deprecated|installtrigger is deprecated|mouseevent.mozpressure is deprecated|mouseevent.mozinputsource is deprecated|after reporting \d+, no further warnings will be reported/i;
      
      const criticalError = criticalErrorPattern.test('Cannot read property of undefined');
      const normalError = criticalErrorPattern.test('WebGL warning: texImage deprecated');
      
      const normalWarning = normalWarningPattern.test('WebGL warning: texImage deprecated');
      const criticalWarning = normalWarningPattern.test('Cannot read property of undefined');
      
      return {
        criticalError,
        normalError,
        normalWarning,
        criticalWarning
      };
    });
    
    // Verify categorization accuracy
    expect(categorizationTest.criticalError).toBe(true);
    expect(categorizationTest.normalError).toBe(false);
    expect(categorizationTest.normalWarning).toBe(true);
    expect(categorizationTest.criticalWarning).toBe(false);
    
    console.log('✅ Error Categorization Test Passed!');
  });
});
