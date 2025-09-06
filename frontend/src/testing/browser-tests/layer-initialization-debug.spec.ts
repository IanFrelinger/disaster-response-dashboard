import { test, expect, Page } from '@playwright/test';

/**
 * Layer Initialization Debug Tests
 * Test to see if layers are being initialized at all
 */

test.describe('Layer Initialization Debug', () => {
  let page: Page;
  let consoleLogs: string[] = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    consoleLogs = [];

    // Capture all console logs
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(5000);
  });

  test('check if layer components are being called', async () => {
    console.log('🔍 Checking if layer components are being called...');
    
    // Look for layer initialization logs
    const layerLogs = consoleLogs.filter(log => 
      log.includes('Layer') || 
      log.includes('Building') || 
      log.includes('Hazard') || 
      log.includes('Unit') || 
      log.includes('Route') ||
      log.includes('Terrain')
    );
    
    console.log('📊 Layer-related logs found:', layerLogs.length);
    layerLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Check for specific layer ready messages
    const layerReadyLogs = consoleLogs.filter(log => 
      log.includes('Layer') && log.includes('ready')
    );
    
    console.log('✅ Layer ready logs:', layerReadyLogs.length);
    layerReadyLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Check for layer error messages
    const layerErrorLogs = consoleLogs.filter(log => 
      log.includes('Layer') && log.includes('error')
    );
    
    console.log('❌ Layer error logs:', layerErrorLogs.length);
    layerErrorLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    expect(true).toBe(true);
  });

  test('check layer toggle states and data', async () => {
    console.log('🔍 Checking layer toggle states and data...');
    
    const layerInfo = await page.evaluate(() => {
      // Check if the layer toggles hook is working
      const toggles = (window as any).__layerToggles__;
      
      // Check if the mock data is available
      const mockData = (window as any).__mockData__;
      
      return {
        toggles,
        mockData,
        hasLayerToggles: typeof toggles !== 'undefined',
        hasMockData: typeof mockData !== 'undefined'
      };
    });
    
    console.log('📊 Layer Info:', JSON.stringify(layerInfo, null, 2));
    
    // Check if we can access the layer toggles from the DOM
    const toggleStates = await page.evaluate(() => {
      const toggles: Record<string, any> = {};
      const expectedToggles = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
      
      expectedToggles.forEach(toggle => {
        const element = document.querySelector(`[data-testid="toggle-${toggle}"]`) as HTMLInputElement;
        if (element) {
          toggles[toggle] = {
            exists: true,
            checked: element.checked,
            disabled: element.disabled
          };
        } else {
          toggles[toggle] = { exists: false };
        }
      });
      
      return toggles;
    });
    
    console.log('📊 Toggle States:', JSON.stringify(toggleStates, null, 2));
    
    expect(true).toBe(true);
  });

  test('check if map is ready and layers should initialize', async () => {
    console.log('🔍 Checking if map is ready and layers should initialize...');
    
    const mapStatus = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api) {
        return { error: 'Map API not available' };
      }
      
      const map = api.getMapInstance();
      if (!map) {
        return { error: 'Map instance not available' };
      }
      
      return {
        isStyleLoaded: map.isStyleLoaded(),
        isLoaded: map.loaded(),
        hasTerrain: api.hasTerrain(),
        mapCenter: map.getCenter(),
        mapZoom: map.getZoom(),
        mapPitch: map.getPitch(),
        mapBearing: map.getBearing()
      };
    });
    
    console.log('📊 Map Status:', JSON.stringify(mapStatus, null, 2));
    
    // Check if the LayerManager component is rendered
    const layerManagerStatus = await page.evaluate(() => {
      // Look for any React components that might be the LayerManager
      const reactElements = document.querySelectorAll('[data-reactroot]');
      const layerElements = document.querySelectorAll('[class*="layer"]');
      
      return {
        reactElementsCount: reactElements.length,
        layerElementsCount: layerElements.length,
        hasLayerManager: document.querySelector('[class*="LayerManager"]') !== null
      };
    });
    
    console.log('📊 Layer Manager Status:', JSON.stringify(layerManagerStatus, null, 2));
    
    expect(true).toBe(true);
  });

  test('force layer initialization and check results', async () => {
    console.log('🔍 Force layer initialization and check results...');
    
    // Try to manually trigger layer initialization
    const manualInitResult = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.getMapInstance) {
        return { error: 'Map API not available' };
      }
      
      const map = api.getMapInstance();
      if (!map) {
        return { error: 'Map instance not available' };
      }
      
      // Try to manually add a test layer
      try {
        map.addSource('test-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-122.4194, 37.7749]
              },
              properties: {}
            }]
          }
        });
        
        map.addLayer({
          id: 'test-layer',
          type: 'circle',
          source: 'test-source',
          paint: {
            'circle-color': '#ff0000',
            'circle-radius': 10
          }
        });
        
        return {
          success: true,
          testSourceExists: !!map.getSource('test-source'),
          testLayerExists: !!map.getLayer('test-layer')
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('📊 Manual Init Result:', JSON.stringify(manualInitResult, null, 2));
    
    // Wait a bit and check if the test layer is visible
    await page.waitForTimeout(2000);
    
    const testLayerStatus = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.getMapInstance) {
        return { error: 'Map API not available' };
      }
      
      const map = api.getMapInstance();
      if (!map) {
        return { error: 'Map instance not available' };
      }
      
      try {
        const features = map.queryRenderedFeatures({ layers: ['test-layer'] });
        return {
          testLayerExists: !!map.getLayer('test-layer'),
          testSourceExists: !!map.getSource('test-source'),
          renderedFeatures: features.length
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('📊 Test Layer Status:', JSON.stringify(testLayerStatus, null, 2));
    
    expect(true).toBe(true);
  });
});
