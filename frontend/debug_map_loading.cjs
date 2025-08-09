const { chromium } = require('playwright');

async function debugMapLoading() {
  console.log('🗺️ Debugging Map Loading Issue');
  console.log('='.repeat(40));
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('📍 Loading application...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    await page.waitForTimeout(3000);
    
    // Monitor console logs
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('\n🎯 Test 1: Check Mapbox Library');
    console.log('-'.repeat(30));
    
    const mapboxAvailable = await page.evaluate(() => {
      return {
        mapboxgl: !!window.mapboxgl,
        Map: !!window.mapboxgl?.Map,
        accessToken: window.mapboxgl?.accessToken ? 'Set' : 'Not Set'
      };
    });
    
    console.log('Mapbox Status:', mapboxAvailable);
    
    console.log('\n🎯 Test 2: Check Map Container');
    console.log('-'.repeat(30));
    
    const containerStatus = await page.evaluate(() => {
      const container = document.querySelector('[ref="containerRef"]') || 
                      document.querySelector('.mapboxgl-canvas-container') ||
                      document.querySelector('div[style*="minHeight"]');
      
      return {
        containerFound: !!container,
        containerId: container?.id || 'none',
        containerClasses: container?.className || 'none',
        containerStyle: container?.style?.cssText || 'none'
      };
    });
    
    console.log('Container Status:', containerStatus);
    
    console.log('\n🎯 Test 3: Check Map Instance');
    console.log('-'.repeat(30));
    
    const mapInstanceStatus = await page.evaluate(() => {
      const instances = window.mapboxgl?.Map?.instances || [];
      return {
        instancesCount: instances.length,
        firstInstance: instances[0] ? {
          isLoaded: instances[0].isStyleLoaded ? instances[0].isStyleLoaded() : 'unknown',
          style: instances[0].getStyle ? instances[0].getStyle().name : 'unknown',
          center: instances[0].getCenter ? instances[0].getCenter() : 'unknown',
          zoom: instances[0].getZoom ? instances[0].getZoom() : 'unknown'
        } : null
      };
    });
    
    console.log('Map Instance Status:', mapInstanceStatus);
    
    console.log('\n🎯 Test 4: Check Console Errors');
    console.log('-'.repeat(30));
    
    const errorLogs = consoleLogs.filter(log => log.type === 'error');
    const warningLogs = consoleLogs.filter(log => log.type === 'warn');
    const infoLogs = consoleLogs.filter(log => log.type === 'log');
    
    console.log(`Total Console Logs: ${consoleLogs.length}`);
    console.log(`Errors: ${errorLogs.length}`);
    console.log(`Warnings: ${warningLogs.length}`);
    console.log(`Info: ${infoLogs.length}`);
    
    if (errorLogs.length > 0) {
      console.log('\nError Logs:');
      errorLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.text}`);
      });
    }
    
    if (warningLogs.length > 0) {
      console.log('\nWarning Logs:');
      warningLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.text}`);
      });
    }
    
    console.log('\n🎯 Test 5: Check Network Requests');
    console.log('-'.repeat(30));
    
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        status: 'pending'
      });
    });
    
    page.on('response', response => {
      const request = networkRequests.find(req => req.url === response.url());
      if (request) {
        request.status = response.status();
      }
    });
    
    await page.waitForTimeout(2000);
    
    const mapboxRequests = networkRequests.filter(req => 
      req.url.includes('mapbox') || 
      req.url.includes('tiles') ||
      req.url.includes('terrain')
    );
    
    console.log(`Total Network Requests: ${networkRequests.length}`);
    console.log(`Mapbox Requests: ${mapboxRequests.length}`);
    
    if (mapboxRequests.length > 0) {
      console.log('\nMapbox Request Details:');
      mapboxRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url} - ${req.status}`);
      });
    }
    
    console.log('\n🎯 Test 6: Check Environment Variables');
    console.log('-'.repeat(30));
    
    const envCheck = await page.evaluate(() => {
      return {
        hasEnv: typeof window !== 'undefined',
        hasMeta: typeof window !== 'undefined',
        hasEnvVar: typeof window !== 'undefined',
        mapboxToken: 'Check in browser console'
      };
    });
    
    console.log('Environment Check:', envCheck);
    
    console.log('\n🎯 Test 7: Manual Map Creation Test');
    console.log('-'.repeat(30));
    
    const manualMapTest = await page.evaluate(() => {
      try {
        if (!window.mapboxgl?.Map) {
          return { success: false, error: 'Mapbox Map not available' };
        }
        
        // Try to create a simple map
        const testContainer = document.createElement('div');
        testContainer.style.width = '100px';
        testContainer.style.height = '100px';
        testContainer.style.position = 'absolute';
        testContainer.style.top = '-1000px';
        document.body.appendChild(testContainer);
        
        const testMap = new window.mapboxgl.Map({
          container: testContainer,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-122.4194, 37.7749],
          zoom: 10
        });
        
        return { success: true, map: 'Created successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Manual Map Test:', manualMapTest);
    
    // Final Analysis
    console.log('\n🔍 Map Loading Analysis');
    console.log('='.repeat(40));
    
    const hasMapboxLibrary = mapboxAvailable.mapboxgl;
    const hasMapClass = mapboxAvailable.Map;
    const hasAccessToken = mapboxAvailable.accessToken === 'Set';
    const hasContainer = containerStatus.containerFound;
    const hasMapInstance = mapInstanceStatus.instancesCount > 0;
    const hasErrors = errorLogs.length > 0;
    
    console.log(`Mapbox Library: ${hasMapboxLibrary ? '✅' : '❌'}`);
    console.log(`Map Class: ${hasMapClass ? '✅' : '❌'}`);
    console.log(`Access Token: ${hasAccessToken ? '✅' : '❌'}`);
    console.log(`Container: ${hasContainer ? '✅' : '❌'}`);
    console.log(`Map Instance: ${hasMapInstance ? '✅' : '❌'}`);
    console.log(`Console Errors: ${hasErrors ? '❌' : '✅'}`);
    
    if (!hasMapboxLibrary) {
      console.log('\n🚨 ISSUE: Mapbox library not loaded');
    } else if (!hasMapClass) {
      console.log('\n🚨 ISSUE: Mapbox Map class not available');
    } else if (!hasAccessToken) {
      console.log('\n🚨 ISSUE: Mapbox access token not set');
    } else if (!hasContainer) {
      console.log('\n🚨 ISSUE: Map container not found');
    } else if (!hasMapInstance) {
      console.log('\n🚨 ISSUE: Map instance not created');
    } else if (hasErrors) {
      console.log('\n⚠️ ISSUE: Console errors preventing map loading');
    } else {
      console.log('\n✅ Map should be loading correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

// Run the test
debugMapLoading().catch(console.error);
