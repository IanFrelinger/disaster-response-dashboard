import { test, expect, Page } from '@playwright/test';

/**
 * Automated Validation Checks Test
 * Tests the new automated validation system and console logging
 */

test.describe('Automated Validation Checks', () => {
  test('verify automated validation checks and console logging', async ({ page }) => {
    const consoleLogs: string[] = [];
    const consoleWarnings: string[] = [];
    
    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'log') {
        consoleLogs.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to fully initialize and validation to run
    await page.waitForTimeout(12000);
    
    // Check for validation console logs
    const validationLogs = consoleLogs.filter(log => 
      log.includes('🔍 3D Map Validation Results:') || 
      log.includes('✅ 3D Map Validation: All checks passed!')
    );
    
    const validationWarnings = consoleWarnings.filter(warning => 
      warning.includes('🚨 3D Map Validation Issues Detected:')
    );
    
    console.log('🔍 Validation Console Logs Found:', validationLogs.length);
    console.log('⚠️ Validation Warnings Found:', validationWarnings.length);
    
    // Check for detailed validation results in console
    const detailedValidationLog = consoleLogs.find(log => 
      log.includes('🔍 3D Map Validation Results:')
    );
    
    if (detailedValidationLog) {
      console.log('📊 Detailed Validation Log Found:');
      console.log(detailedValidationLog);
    }
    
    // Check for validation issues warnings
    if (validationWarnings.length > 0) {
      console.log('🚨 Validation Issues Detected:');
      validationWarnings.forEach(warning => console.log(warning));
    }
    
    // Verify the enhanced validation overlay is visible
    const validationOverlay = page.locator('text=Layer Validation');
    const isOverlayVisible = await validationOverlay.isVisible();
    
    if (isOverlayVisible) {
      // Check for enhanced UI elements
      const overallStatus = page.locator('text=Overall:');
      const automatedChecks = page.locator('text=🔍 Automated Checks:');
      const layerDetails = page.locator('text=🟢 Enabled').first();
      
      const hasOverallStatus = await overallStatus.isVisible();
      const hasAutomatedChecks = await automatedChecks.isVisible();
      const hasLayerDetails = await layerDetails.isVisible();
      
      console.log('🎨 Enhanced UI Elements:');
      console.log(`  Overall Status: ${hasOverallStatus ? '✅' : '❌'}`);
      console.log(`  Automated Checks: ${hasAutomatedChecks ? '✅' : '❌'}`);
      console.log(`  Layer Details: ${hasLayerDetails ? '✅' : '❌'}`);
      
      // Get the automated checks summary
      const checksSummary = await automatedChecks.locator('..').textContent();
      console.log('🔍 Automated Checks Summary:', checksSummary);
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/automated-validation-checks.png', fullPage: true });
    
    // Assertions
    expect(isOverlayVisible).toBe(true);
    expect(validationLogs.length).toBeGreaterThan(0);
    
    // Should have success logs and no warnings (since we fixed the validation logic)
    const hasSuccessLog = validationLogs.some(log => log.includes('All checks passed'));
    const hasWarningLog = validationWarnings.length > 0;
    
    expect(hasSuccessLog).toBe(true); // Should have success logs
    expect(hasWarningLog).toBe(false); // Should not have warnings after fix
    
    console.log('✅ Automated validation checks test completed successfully');
  });
  
  test('verify validation API exposes automated checks', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to fully initialize
    await page.waitForTimeout(10000);
    
    // Test the validation API
    const apiResults = await page.evaluate(async () => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { error: 'API not available' };
      }
      
      try {
        const results = await api.validateLayers();
        return {
          success: true,
          results: results,
          hasAutomatedChecks: true
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('🔍 API Validation Results:');
    console.log(JSON.stringify(apiResults, null, 2));
    
    // Verify API results
    expect(apiResults.success).toBe(true);
    expect(apiResults.results).toBeDefined();
    expect(apiResults.results.overall).toBeDefined();
    expect(apiResults.results.overall.totalLayers).toBe(5);
    expect(apiResults.results.overall.successfulLayers).toBe(5);
    
    console.log('✅ Validation API test completed successfully');
  });
});
