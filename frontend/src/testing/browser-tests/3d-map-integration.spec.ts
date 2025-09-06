import { test, expect, Page } from '@playwright/test';

/**
 * 3D Map Integration Tests
 * Comprehensive testing of 3D terrain integration with all layers
 */

test.describe('3D Map Integration', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for map to be ready
    await page.waitForFunction(() => (window as any).__mapReady3D === true, { timeout: 30000 });
  });

  test('3D map initializes with terrain enabled', async () => {
    console.log('🧪 Testing 3D map initialization with terrain');
    
    // Check if 3D map API is available
    const hasMapAPI = await page.evaluate(() => {
      return typeof (window as any).__mapTestApi3D__ !== 'undefined';
    });
    expect(hasMapAPI).toBe(true);

    // Check if terrain is enabled
    const hasTerrain = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.hasTerrain();
    });
    expect(hasTerrain).toBe(true);

    // Test terrain elevation query
    const elevation = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.queryTerrainElevation(-122.4194, 37.7749);
    });
    expect(elevation).toBeDefined();
    expect(typeof elevation).toBe('number');
  });

  test('terrain can be toggled on and off', async () => {
    console.log('🧪 Testing terrain toggle functionality');
    
    // Disable terrain
    await page.evaluate(() => {
      (window as any).__mapTestApi3D__.setTerrainEnabled(false);
    });
    
    await page.waitForTimeout(1000);
    
    const terrainDisabled = await page.evaluate(() => {
      return !(window as any).__mapTestApi3D__.hasTerrain();
    });
    expect(terrainDisabled).toBe(true);

    // Re-enable terrain
    await page.evaluate(() => {
      (window as any).__mapTestApi3D__.setTerrainEnabled(true);
    });
    
    await page.waitForTimeout(1000);
    
    const terrainEnabled = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.hasTerrain();
    });
    expect(terrainEnabled).toBe(true);
  });

  test('layer validation system works correctly', async () => {
    console.log('🧪 Testing layer validation system');
    
    // Wait for validation to complete
    await page.waitForTimeout(3000);
    
    // Get validation results
    const validationResults = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.getValidationResults();
    });
    
    expect(validationResults).toBeDefined();
    expect(validationResults.overall).toBeDefined();
    expect(validationResults.overall.totalLayers).toBe(5);
    expect(validationResults.overall.successfulLayers).toBeGreaterThan(0);
    
    // Check individual layer results
    expect(validationResults.terrain).toBeDefined();
    expect(validationResults.buildings).toBeDefined();
    expect(validationResults.hazards).toBeDefined();
    expect(validationResults.units).toBeDefined();
    expect(validationResults.routes).toBeDefined();
    
    console.log('Validation results:', validationResults);
  });

  test('terrain layer validation passes', async () => {
    console.log('🧪 Testing terrain layer validation');
    
    // Run validation
    const validationResults = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.validateLayers();
    });
    
    await page.waitForTimeout(2000);
    
    const results = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.getValidationResults();
    });
    
    expect(results.terrain).toBeDefined();
    expect(results.terrain.name).toBe('terrain');
    expect(results.terrain.enabled).toBe(true);
    expect(results.terrain.rendered).toBe(true);
    expect(results.terrain.interactive).toBe(true);
    expect(results.terrain.performance.renderTime).toBeGreaterThan(0);
    expect(results.terrain.errors.length).toBe(0);
  });

  test('buildings layer renders in 3D', async () => {
    console.log('🧪 Testing 3D buildings layer');
    
    // Wait for buildings to load
    await page.waitForTimeout(2000);
    
    // Check if buildings layer exists
    const buildingsLayerExists = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      return map.getLayer('3d-buildings') !== undefined;
    });
    
    expect(buildingsLayerExists).toBe(true);
    
    // Check if buildings are visible
    const buildingsVisible = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      const layer = map.getLayer('3d-buildings');
      return layer && map.getLayoutProperty('3d-buildings', 'visibility') !== 'none';
    });
    
    expect(buildingsVisible).toBe(true);
  });

  test('hazards layer integrates with 3D terrain', async () => {
    console.log('🧪 Testing hazards layer 3D integration');
    
    // Wait for hazards to load
    await page.waitForTimeout(2000);
    
    // Check if hazards source exists
    const hazardsSourceExists = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      return map.getSource('hazards-source') !== undefined;
    });
    
    expect(hazardsSourceExists).toBe(true);
    
    // Check if hazards layer exists
    const hazardsLayerExists = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      return map.getLayer('hazards-layer') !== undefined;
    });
    
    expect(hazardsLayerExists).toBe(true);
  });

  test('units layer integrates with 3D terrain', async () => {
    console.log('🧪 Testing units layer 3D integration');
    
    // Wait for units to load
    await page.waitForTimeout(2000);
    
    // Check if units source exists
    const unitsSourceExists = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      return map.getSource('units-source') !== undefined;
    });
    
    expect(unitsSourceExists).toBe(true);
    
    // Check if units layer exists
    const unitsLayerExists = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      return map.getLayer('units-layer') !== undefined;
    });
    
    expect(unitsLayerExists).toBe(true);
  });

  test('routes layer integrates with 3D terrain', async () => {
    console.log('🧪 Testing routes layer 3D integration');
    
    // Wait for routes to load
    await page.waitForTimeout(2000);
    
    // Check if routes source exists
    const routesSourceExists = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      return map.getSource('routes-source') !== undefined;
    });
    
    expect(routesSourceExists).toBe(true);
    
    // Check if routes layer exists
    const routesLayerExists = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      return map.getLayer('routes-layer') !== undefined;
    });
    
    expect(routesLayerExists).toBe(true);
  });

  test('layer interactions work in 3D mode', async () => {
    console.log('🧪 Testing layer interactions in 3D mode');
    
    // Wait for all layers to load
    await page.waitForTimeout(3000);
    
    // Test clicking on hazards
    const hazardsClickable = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      try {
        const features = map.queryRenderedFeatures({ layers: ['hazards-layer'] });
        return features.length > 0;
      } catch (error) {
        return false;
      }
    });
    
    expect(hazardsClickable).toBe(true);
    
    // Test clicking on units
    const unitsClickable = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      try {
        const features = map.queryRenderedFeatures({ layers: ['units-layer'] });
        return features.length > 0;
      } catch (error) {
        return false;
      }
    });
    
    expect(unitsClickable).toBe(true);
    
    // Test clicking on routes
    const routesClickable = await page.evaluate(() => {
      const map = (window as any).__mapTestApi3D__.getMapInstance();
      try {
        const features = map.queryRenderedFeatures({ layers: ['routes-layer'] });
        return features.length > 0;
      } catch (error) {
        return false;
      }
    });
    
    expect(routesClickable).toBe(true);
  });

  test('3D map performance is acceptable', async () => {
    console.log('🧪 Testing 3D map performance');
    
    // Wait for map to stabilize
    await page.waitForTimeout(3000);
    
    // Get validation results to check performance
    const validationResults = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.getValidationResults();
    });
    
    expect(validationResults).toBeDefined();
    
    // Check that render times are reasonable (less than 5 seconds)
    Object.entries(validationResults).forEach(([layerName, result]) => {
      if (layerName !== 'overall' && typeof result === 'object' && result !== null) {
        const layerResult = result as any;
        if (layerResult.performance && layerResult.performance.renderTime) {
          expect(layerResult.performance.renderTime).toBeLessThan(5000);
          console.log(`${layerName} render time: ${layerResult.performance.renderTime}ms`);
        }
      }
    });
  });

  test('3D map handles layer toggles correctly', async () => {
    console.log('🧪 Testing 3D map layer toggles');
    
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Get initial layer states
    const initialStates = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.getLayerStates();
    });
    
    console.log('Initial layer states:', initialStates);
    
    // Toggle terrain off and on
    await page.evaluate(() => {
      (window as any).__mapTestApi3D__.setTerrainEnabled(false);
    });
    
    await page.waitForTimeout(1000);
    
    const terrainDisabled = await page.evaluate(() => {
      return !(window as any).__mapTestApi3D__.hasTerrain();
    });
    expect(terrainDisabled).toBe(true);
    
    await page.evaluate(() => {
      (window as any).__mapTestApi3D__.setTerrainEnabled(true);
    });
    
    await page.waitForTimeout(1000);
    
    const terrainEnabled = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.hasTerrain();
    });
    expect(terrainEnabled).toBe(true);
  });

  test('3D map validation overlay displays correctly', async () => {
    console.log('🧪 Testing 3D map validation overlay');
    
    // Wait for validation to complete
    await page.waitForTimeout(3000);
    
    // Check if validation overlay is visible
    const overlayVisible = await page.locator('text=Layer Validation').isVisible();
    expect(overlayVisible).toBe(true);
    
    // Check if overall status is displayed
    const overallStatusVisible = await page.locator('text=Overall:').isVisible();
    expect(overallStatusVisible).toBe(true);
    
    // Check if individual layer statuses are displayed
    const terrainStatusVisible = await page.locator('text=terrain:').isVisible();
    expect(terrainStatusVisible).toBe(true);
    
    const buildingsStatusVisible = await page.locator('text=buildings:').isVisible();
    expect(buildingsStatusVisible).toBe(true);
  });

  test('3D map handles errors gracefully', async () => {
    console.log('🧪 Testing 3D map error handling');
    
    // Try to disable terrain and check for errors
    await page.evaluate(() => {
      (window as any).__mapTestApi3D__.setTerrainEnabled(false);
    });
    
    await page.waitForTimeout(1000);
    
    // Check that map still functions
    const mapInstance = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.getMapInstance();
    });
    
    expect(mapInstance).toBeDefined();
    
    // Re-enable terrain
    await page.evaluate(() => {
      (window as any).__mapTestApi3D__.setTerrainEnabled(true);
    });
    
    await page.waitForTimeout(1000);
    
    // Check that terrain is working again
    const terrainWorking = await page.evaluate(() => {
      return (window as any).__mapTestApi3D__.hasTerrain();
    });
    
    expect(terrainWorking).toBe(true);
  });
});
