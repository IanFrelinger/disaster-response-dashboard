import { test, expect, Page } from '@playwright/test';

/**
 * Brute Force Layer Testing
 * Systematically tests all possible input combinations and captures error logs
 */

interface TestResult {
  testName: string;
  success: boolean;
  errors: string[];
  warnings: string[];
  consoleLogs: string[];
  networkErrors: string[];
  mapErrors: string[];
  layerStates: any;
  performance: any;
}

test.describe('Brute Force Layer Testing', () => {
  let testResults: TestResult[] = [];

  test.beforeEach(async ({ page }) => {
    // Clear previous results
    testResults = [];
    
    // Set up comprehensive error logging
    const errors: string[] = [];
    const warnings: string[] = [];
    const consoleLogs: string[] = [];
    const networkErrors: string[] = [];
    const mapErrors: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      consoleLogs.push(`[${type.toUpperCase()}] ${text}`);
      
      if (type === 'error') {
        errors.push(text);
      } else if (type === 'warning') {
        warnings.push(text);
      }
      
      // Check for map-specific errors
      if (text.toLowerCase().includes('map') || 
          text.toLowerCase().includes('mapbox') || 
          text.toLowerCase().includes('layer') ||
          text.toLowerCase().includes('terrain') ||
          text.toLowerCase().includes('source')) {
        mapErrors.push(text);
      }
    });

    // Capture network errors
    page.on('requestfailed', request => {
      const error = `Network Error: ${request.url()} - ${request.failure()?.errorText}`;
      networkErrors.push(error);
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error instanceof Error ? error.message : String(error)}`);
    });

    // Store error collectors for later use
    (page as any).__errorCollectors = {
      errors, warnings, consoleLogs, networkErrors, mapErrors
    };
  });

  test('systematic layer toggle combinations', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to initialize
    await page.waitForTimeout(5000);
    
    // Get error collectors
    const errorCollectors = (page as any).__errorCollectors;
    
    // Test all possible combinations of layer toggles
    const layerNames = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
    const totalCombinations = Math.pow(2, layerNames.length);
    
    console.log(`🧪 Testing ${totalCombinations} layer toggle combinations...`);
    
    for (let i = 0; i < totalCombinations; i++) {
      // Clear error collectors for this test
      errorCollectors.errors.length = 0;
      errorCollectors.warnings.length = 0;
      errorCollectors.consoleLogs.length = 0;
      errorCollectors.networkErrors.length = 0;
      errorCollectors.mapErrors.length = 0;
      
      // Generate combination
      const combination = i.toString(2).padStart(layerNames.length, '0');
      const testName = `Combination ${i + 1}/${totalCombinations}: ${combination}`;
      
      console.log(`🔍 Testing: ${testName}`);
      
      // Apply layer toggles based on combination
      for (let j = 0; j < layerNames.length; j++) {
        const layerName = layerNames[j];
        const shouldEnable = combination[j] === '1';
        
        try {
          // Find and click the layer toggle
          const toggleSelector = `input[type="checkbox"][data-layer="${layerName}"], input[type="checkbox"][id*="${layerName}"], label:has-text("${layerName}") input[type="checkbox"]`;
          const toggle = page.locator(toggleSelector).first();
          
          if (await toggle.isVisible()) {
            const isChecked = await toggle.isChecked();
            if (shouldEnable && !isChecked) {
              await toggle.click();
              await page.waitForTimeout(500);
            } else if (!shouldEnable && isChecked) {
              await toggle.click();
              await page.waitForTimeout(500);
            }
          }
        } catch (error) {
          errorCollectors.errors.push(`Toggle error for ${layerName}: ${error}`);
        }
      }
      
      // Wait for layers to stabilize
      await page.waitForTimeout(2000);
      
      // Capture current state
      const layerStates = await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (!api) return null;
        
        try {
          const map = api.getMapInstance();
          if (!map) return null;
          
          return {
            mapReady: map.isStyleLoaded() && (map.isLoaded ? map.isLoaded() : true),
            styleLoaded: map.isStyleLoaded(),
            sources: Object.keys(map.getStyle().sources || {}),
            layers: (map.getStyle().layers || []).map((layer: any) => layer.id),
            customLayers: ['hazards', 'units', 'routes', '3d-buildings'].map(id => ({
              id,
              exists: map.getLayer(id) !== undefined,
              visible: map.getLayoutProperty(id, 'visibility') !== 'none'
            }))
          };
        } catch (error) {
          return { error: error instanceof Error ? error.message : String(error) };
        }
      });
      
      // Capture performance metrics
      const performance = await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (!api) return null;
        
        try {
          return api.validateLayers ? 'API available' : 'API not available';
        } catch (error) {
          return { error: error instanceof Error ? error.message : String(error) };
        }
      });
      
      // Store test result
      const result: TestResult = {
        testName,
        success: errorCollectors.errors.length === 0 && errorCollectors.networkErrors.length === 0,
        errors: [...errorCollectors.errors],
        warnings: [...errorCollectors.warnings],
        consoleLogs: [...errorCollectors.consoleLogs],
        networkErrors: [...errorCollectors.networkErrors],
        mapErrors: [...errorCollectors.mapErrors],
        layerStates,
        performance
      };
      
      testResults.push(result);
      
      // Log significant issues
      if (result.errors.length > 0 || result.networkErrors.length > 0) {
        console.log(`❌ ${testName} - ${result.errors.length} errors, ${result.networkErrors.length} network errors`);
        result.errors.forEach(error => console.log(`  Error: ${error}`));
        result.networkErrors.forEach(error => console.log(`  Network: ${error}`));
      }
    }
    
    // Analyze results
    const failedTests = testResults.filter(r => !r.success);
    const totalErrors = testResults.reduce((sum, r) => sum + r.errors.length, 0);
    const totalNetworkErrors = testResults.reduce((sum, r) => sum + r.networkErrors.length, 0);
    const totalMapErrors = testResults.reduce((sum, r) => sum + r.mapErrors.length, 0);
    
    console.log('\n📊 BRUTE FORCE TESTING RESULTS:');
    console.log(`Total Tests: ${testResults.length}`);
    console.log(`Failed Tests: ${failedTests.length}`);
    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Network Errors: ${totalNetworkErrors}`);
    console.log(`Total Map Errors: ${totalMapErrors}`);
    
    // Show most problematic combinations
    const mostErrors = testResults
      .sort((a, b) => (b.errors.length + b.networkErrors.length) - (a.errors.length + a.networkErrors.length))
      .slice(0, 5);
    
    if (mostErrors.length > 0) {
      console.log('\n🚨 MOST PROBLEMATIC COMBINATIONS:');
      mostErrors.forEach((result, index) => {
        console.log(`${index + 1}. ${result.testName}`);
        console.log(`   Errors: ${result.errors.length}, Network: ${result.networkErrors.length}, Map: ${result.mapErrors.length}`);
      });
    }
    
    // Show unique error patterns
    const allErrors = testResults.flatMap(r => r.errors);
    const uniqueErrors = [...new Set(allErrors)];
    
    if (uniqueErrors.length > 0) {
      console.log('\n🔍 UNIQUE ERROR PATTERNS:');
      uniqueErrors.forEach((error, index) => {
        const count = allErrors.filter(e => e === error).length;
        console.log(`${index + 1}. [${count}x] ${error}`);
      });
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/brute-force-final-state.png', fullPage: true });
    
    // Basic assertions
    expect(testResults.length).toBe(totalCombinations);
    
    // Log summary for debugging
    console.log('\n✅ Brute force testing completed');
  });

  test('stress test layer interactions', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to initialize
    await page.waitForTimeout(5000);
    
    const errorCollectors = (page as any).__errorCollectors;
    
    console.log('🔥 Starting stress test with rapid layer toggles...');
    
    // Rapid toggle stress test
    const layerNames = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
    const stressCycles = 20;
    
    for (let cycle = 0; cycle < stressCycles; cycle++) {
      console.log(`🔄 Stress cycle ${cycle + 1}/${stressCycles}`);
      
      // Clear errors for this cycle
      errorCollectors.errors.length = 0;
      errorCollectors.warnings.length = 0;
      errorCollectors.mapErrors.length = 0;
      
      // Rapidly toggle each layer
      for (const layerName of layerNames) {
        try {
          const toggleSelector = `input[type="checkbox"][data-layer="${layerName}"], input[type="checkbox"][id*="${layerName}"], label:has-text("${layerName}") input[type="checkbox"]`;
          const toggle = page.locator(toggleSelector).first();
          
          if (await toggle.isVisible()) {
            // Toggle on
            await toggle.click();
            await page.waitForTimeout(100);
            
            // Toggle off
            await toggle.click();
            await page.waitForTimeout(100);
          }
        } catch (error) {
          errorCollectors.errors.push(`Stress test error for ${layerName}: ${error}`);
        }
      }
      
      // Check for errors after each cycle
      if (errorCollectors.errors.length > 0) {
        console.log(`❌ Cycle ${cycle + 1} produced ${errorCollectors.errors.length} errors`);
        errorCollectors.errors.forEach((error: any) => console.log(`  ${error}`));
      }
    }
    
    // Final state check
    const finalState = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api) return null;
      
      try {
        const map = api.getMapInstance();
        if (!map) return null;
        
        return {
          mapReady: map.isStyleLoaded() && (map.isLoaded ? map.isLoaded() : true),
          sources: Object.keys(map.getStyle().sources || {}),
          layers: (map.getStyle().layers || []).map((layer: any) => layer.id)
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    console.log('🏁 Stress test completed');
    console.log(`Final state: ${JSON.stringify(finalState, null, 2)}`);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/stress-test-final.png', fullPage: true });
  });

  test('map interaction stress test', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to initialize
    await page.waitForTimeout(5000);
    
    const errorCollectors = (page as any).__errorCollectors;
    
    console.log('🎯 Starting map interaction stress test...');
    
    // Get map container
    const mapContainer = page.locator('.map-container-3d');
    await expect(mapContainer).toBeVisible();
    
    // Stress test map interactions
    const interactions = [
      { name: 'Pan', action: async () => {
        await mapContainer.hover();
        await page.mouse.move(100, 100);
        await page.mouse.down();
        await page.mouse.move(200, 200);
        await page.mouse.up();
      }},
      { name: 'Zoom In', action: async () => {
        await mapContainer.hover();
        try {
          await page.mouse.wheel(0, -100);
        } catch (error) {
          // Skip on platforms that don't support mouse wheel
        }
      }},
      { name: 'Zoom Out', action: async () => {
        await mapContainer.hover();
        try {
          await page.mouse.wheel(0, 100);
        } catch (error) {
          // Skip on platforms that don't support mouse wheel
        }
      }},
      { name: 'Click', action: async () => {
        await mapContainer.click({ position: { x: 300, y: 300 } });
      }}
    ];
    
    // Perform each interaction multiple times
    for (let round = 0; round < 5; round++) {
      console.log(`🎮 Interaction round ${round + 1}/5`);
      
      for (const interaction of interactions) {
        try {
          await interaction.action();
          await page.waitForTimeout(200);
        } catch (error) {
          errorCollectors.errors.push(`Interaction error (${interaction.name}): ${error}`);
        }
      }
    }
    
    // Check for errors
    if (errorCollectors.errors.length > 0) {
      console.log(`❌ Map interactions produced ${errorCollectors.errors.length} errors`);
      errorCollectors.errors.forEach((error: any) => console.log(`  ${error}`));
    }
    
    console.log('🎯 Map interaction stress test completed');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/map-interaction-stress.png', fullPage: true });
  });
});
