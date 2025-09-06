import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive layer initialization test to debug why custom layers aren't being detected
 */

test.describe('Layer Initialization Comprehensive', () => {
  test('debug layer initialization timing and data flow', async ({ page }) => {
    const consoleLogs: string[] = [];
    const networkRequests: string[] = [];
    
    // Capture console logs
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Capture network requests
    page.on('request', request => {
      networkRequests.push(`${request.method()} ${request.url()}`);
    });

    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to load
    await page.waitForTimeout(8000);

    // Check layer initialization logs
    const layerLogs = consoleLogs.filter(log => 
      log.includes('Layer') || 
      log.includes('layer') || 
      log.includes('ready') ||
      log.includes('added successfully')
    );
    
    console.log('🔍 Layer Initialization Logs:');
    layerLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });

    // Check if layers are being created
    const layerCreationLogs = consoleLogs.filter(log => 
      log.includes('added successfully') || 
      log.includes('Layer') && log.includes('ready')
    );
    
    console.log('🔍 Layer Creation Logs:');
    layerCreationLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });

    // Check map state after initialization
    const mapState = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.getMapInstance) {
        return { error: 'API not available' };
      }
      
      const map = api.getMapInstance();
      if (!map) {
        return { error: 'Map not available' };
      }

      // Get all sources and layers
      const style = map.getStyle();
      const sources = Object.keys(style.sources || {});
      const layers = (style.layers || []).map((layer: any) => layer.id);
      
      // Check specific layer sources
      const customSources = ['hazards', 'units', 'routes'];
      const customLayers = ['hazards', 'units', 'routes', '3d-buildings'];
      
      const sourceStatus = customSources.map(sourceId => ({
        id: sourceId,
        exists: sources.includes(sourceId),
        source: map.getSource(sourceId) ? 'available' : 'null'
      }));
      
      const layerStatus = customLayers.map(layerId => ({
        id: layerId,
        exists: layers.includes(layerId),
        layer: map.getLayer(layerId) ? 'available' : 'null'
      }));

      return {
        allSources: sources,
        allLayers: layers,
        customSourceStatus: sourceStatus,
        customLayerStatus: layerStatus,
        mapReady: map.isStyleLoaded() && (map.isLoaded ? map.isLoaded() : true),
        styleLoaded: map.isStyleLoaded(),
        mapLoaded: map.isLoaded ? map.isLoaded() : true
      };
    });
    
    console.log('🗺️ Map State Analysis:');
    console.log(JSON.stringify(mapState, null, 2));

    // Check if mock data is being passed correctly
    const dataCheck = await page.evaluate(() => {
      // Try to access the component state or props
      const reactRoot = document.querySelector('#root');
      if (!reactRoot) {
        return { error: 'React root not found' };
      }
      
      // Check if we can find any evidence of mock data
      return {
        hasReactRoot: !!reactRoot,
        rootChildren: reactRoot.children.length,
        // This is a bit of a hack, but we can check if the data is being processed
        dataProcessing: 'Mock data should be passed via props'
      };
    });
    
    console.log('📊 Data Check:');
    console.log(JSON.stringify(dataCheck, null, 2));

    // Run validation to see current state
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
    
    console.log('🔍 Validation Results:');
    console.log(JSON.stringify(validationResults, null, 2));

    // Check toggle states
    const toggleStates = await page.evaluate(() => {
      // Try to find toggle elements and their states
      const toggles = document.querySelectorAll('input[type="checkbox"]');
      const toggleStates: Record<string, boolean> = {};
      
      toggles.forEach((toggle, index) => {
        const label = toggle.closest('label')?.textContent || `toggle-${index}`;
        toggleStates[label.trim()] = (toggle as HTMLInputElement).checked;
      });
      
      return toggleStates;
    });
    
    console.log('🔘 Toggle States:');
    console.log(JSON.stringify(toggleStates, null, 2));

    expect(true).toBe(true);
  });

  test('test layer creation with different toggle combinations', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(5000);

    // Test different toggle combinations
    const toggleCombinations = [
      { name: 'All ON', toggles: { terrain: true, buildings: true, hazards: true, units: true, routes: true } },
      { name: 'All OFF', toggles: { terrain: false, buildings: false, hazards: false, units: false, routes: false } },
      { name: 'Only Hazards', toggles: { terrain: false, buildings: false, hazards: true, units: false, routes: false } },
      { name: 'Only Units', toggles: { terrain: false, buildings: false, hazards: false, units: true, routes: false } },
      { name: 'Only Routes', toggles: { terrain: false, buildings: false, hazards: false, units: false, routes: true } },
    ];

    for (const combination of toggleCombinations) {
      console.log(`\n🔧 Testing combination: ${combination.name}`);
      
      // Set toggle states
      for (const [toggleName, enabled] of Object.entries(combination.toggles)) {
        const toggle = page.locator(`input[type="checkbox"]`).filter({ hasText: toggleName });
        if (await toggle.isVisible()) {
          if (enabled) {
            await toggle.check();
          } else {
            await toggle.uncheck();
          }
        }
      }
      
      // Wait for changes to take effect
      await page.waitForTimeout(2000);
      
      // Check map state
      const mapState = await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (!api || !api.getMapInstance) {
          return { error: 'API not available' };
        }
        
        const map = api.getMapInstance();
        if (!map) {
          return { error: 'Map not available' };
        }

        const style = map.getStyle();
        const sources = Object.keys(style.sources || {});
        const layers = (style.layers || []).map((layer: any) => layer.id);
        
        return {
          sources: sources,
          layers: layers,
          customSources: ['hazards', 'units', 'routes'].map(id => ({
            id,
            exists: sources.includes(id)
          })),
          customLayers: ['hazards', 'units', 'routes', '3d-buildings'].map(id => ({
            id,
            exists: layers.includes(id)
          }))
        };
      });
      
      console.log(`📊 Map State for ${combination.name}:`);
      console.log(JSON.stringify(mapState, null, 2));
    }

    expect(true).toBe(true);
  });
});
