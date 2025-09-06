import { test, expect, Page } from '@playwright/test';

/**
 * Layer Validation Debug Tests
 * Comprehensive testing to identify actual layer loading errors
 */

test.describe('Layer Validation Debug', () => {
  let page: Page;
  let consoleErrors: string[] = [];
  let networkErrors: string[] = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    consoleErrors = [];
    networkErrors = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('🚨 Console Error:', msg.text());
      }
    });

    // Capture network errors
    page.on('response', response => {
      if (!response.ok()) {
        const error = `${response.status()} ${response.url()}`;
        networkErrors.push(error);
        console.log('🚨 Network Error:', error);
      }
    });

    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(3000);
  });

  test('capture all console errors during map load', async () => {
    console.log('🔍 Capturing console errors during map load...');
    
    // Wait for map to potentially load
    await page.waitForTimeout(5000);
    
    // Log all console errors
    console.log('📊 Console Errors Found:', consoleErrors.length);
    consoleErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    // Log all network errors
    console.log('📊 Network Errors Found:', networkErrors.length);
    networkErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    // Check for specific layer-related errors
    const layerErrors = consoleErrors.filter(error => 
      error.includes('layer') || 
      error.includes('source') || 
      error.includes('terrain') ||
      error.includes('mapbox') ||
      error.includes('DEM')
    );
    
    console.log('🗺️ Layer-related errors:', layerErrors.length);
    layerErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    // This test is for debugging, so we don't fail it
    expect(true).toBe(true);
  });

  test('check map container and basic elements', async () => {
    console.log('🔍 Checking map container and basic elements...');
    
    // Check if 3D map title is visible
    const titleVisible = await page.locator('h1:has-text("3D Disaster Response Map")').isVisible();
    console.log('✅ 3D Map Title Visible:', titleVisible);
    
    // Check if map container exists
    const mapContainer = page.locator('.map-container-3d');
    const containerVisible = await mapContainer.isVisible();
    console.log('✅ Map Container Visible:', containerVisible);
    
    // Check if layer controls are visible
    const layerControlsVisible = await page.locator('text=3D Map Layer Controls').isVisible();
    console.log('✅ Layer Controls Visible:', layerControlsVisible);
    
    // Check for loading state
    const loadingVisible = await page.locator('text=Loading 3D map...').isVisible();
    console.log('⏳ Loading State Visible:', loadingVisible);
    
    // Check for error state
    const errorVisible = await page.locator('text=3D Map Error').isVisible();
    console.log('❌ Error State Visible:', errorVisible);
    
    if (errorVisible) {
      const errorText = await page.locator('text=3D Map Error').textContent();
      console.log('❌ Error Text:', errorText);
    }
    
    expect(true).toBe(true);
  });

  test('check layer toggle elements', async () => {
    console.log('🔍 Checking layer toggle elements...');
    
    const expectedToggles = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
    
    for (const toggle of expectedToggles) {
      const toggleElement = page.locator(`[data-testid="toggle-${toggle}"]`);
      const isVisible = await toggleElement.isVisible();
      const isEnabled = await toggleElement.isEnabled();
      console.log(`✅ Toggle ${toggle}: Visible=${isVisible}, Enabled=${isEnabled}`);
      
      if (isVisible) {
        const isChecked = await toggleElement.isChecked();
        console.log(`   Checked: ${isChecked}`);
      }
    }
    
    expect(true).toBe(true);
  });

  test('check map API availability', async () => {
    console.log('🔍 Checking map API availability...');
    
    // Check if 3D map API is available
    const hasMapAPI = await page.evaluate(() => {
      return typeof (window as any).__mapTestApi3D__ !== 'undefined';
    });
    console.log('✅ 3D Map API Available:', hasMapAPI);
    
    if (hasMapAPI) {
      // Check if map instance is available
      const hasMapInstance = await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        return api && typeof api.getMapInstance === 'function';
      });
      console.log('✅ Map Instance Available:', hasMapInstance);
      
      // Check if terrain methods are available
      const hasTerrainMethods = await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        return api && typeof api.hasTerrain === 'function' && typeof api.setTerrainEnabled === 'function';
      });
      console.log('✅ Terrain Methods Available:', hasTerrainMethods);
    }
    
    expect(true).toBe(true);
  });

  test('check validation overlay', async () => {
    console.log('🔍 Checking validation overlay...');
    
    // Wait for validation to potentially complete
    await page.waitForTimeout(5000);
    
    // Check if validation overlay is visible
    const overlayVisible = await page.locator('text=Layer Validation').isVisible();
    console.log('✅ Validation Overlay Visible:', overlayVisible);
    
    if (overlayVisible) {
      // Check overall status
      const overallStatus = await page.locator('text=Overall:').isVisible();
      console.log('✅ Overall Status Visible:', overallStatus);
      
      // Check individual layer statuses
      const layerStatuses = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
      for (const layer of layerStatuses) {
        const statusVisible = await page.locator(`text=${layer}:`).isVisible();
        console.log(`✅ ${layer} Status Visible:`, statusVisible);
      }
    }
    
    expect(true).toBe(true);
  });

  test('check map sources and layers via API', async () => {
    console.log('🔍 Checking map sources and layers via API...');
    
    // Wait for map to load
    await page.waitForTimeout(5000);
    
    const mapInfo = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.getMapInstance) {
        return { error: 'Map API not available' };
      }
      
      try {
        const map = api.getMapInstance();
        if (!map) {
          return { error: 'Map instance not available' };
        }
        
        // Check sources
        const sources = [];
        const expectedSources = ['mapbox-dem', 'hazards', 'units', 'routes'];
        for (const sourceId of expectedSources) {
          try {
            const source = map.getSource(sourceId);
            sources.push({ id: sourceId, exists: !!source, type: source?.type });
          } catch (error) {
            sources.push({ id: sourceId, exists: false, error: error instanceof Error ? error.message : String(error) });
          }
        }
        
        // Check layers
        const layers = [];
        const expectedLayers = ['3d-buildings', 'hazards', 'units', 'routes'];
        for (const layerId of expectedLayers) {
          try {
            const layer = map.getLayer(layerId);
            layers.push({ id: layerId, exists: !!layer, type: layer?.type });
          } catch (error) {
            layers.push({ id: layerId, exists: false, error: error instanceof Error ? error.message : String(error) });
          }
        }
        
        // Check terrain
        let terrain = null;
        try {
          terrain = map.getTerrain();
        } catch (error) {
          terrain = { error: error instanceof Error ? error.message : String(error) };
        }
        
        return { sources, layers, terrain };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    console.log('🗺️ Map Info:', JSON.stringify(mapInfo, null, 2));
    
    expect(true).toBe(true);
  });

  test('run layer validation and capture results', async () => {
    console.log('🔍 Running layer validation...');
    
    // Wait for map to load
    await page.waitForTimeout(5000);
    
    const validationResults = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { error: 'Validation API not available' };
      }
      
      try {
        return api.validateLayers();
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    console.log('📊 Validation Results:', JSON.stringify(validationResults, null, 2));
    
    // Wait a bit more for validation to complete
    await page.waitForTimeout(2000);
    
    const finalResults = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.getValidationResults) {
        return { error: 'Validation results API not available' };
      }
      
      try {
        return api.getValidationResults();
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    console.log('📊 Final Validation Results:', JSON.stringify(finalResults, null, 2));
    
    expect(true).toBe(true);
  });
});
