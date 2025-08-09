const { chromium } = require('playwright');

async function debugMapRerenderIssue() {
  console.log('🔍 Debugging Map Re-render Issue');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('📍 Loading application...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);
    
    // Set up monitoring
    const consoleLogs = [];
    const networkRequests = [];
    let domChanges = [];
    
    // Monitor console logs
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Monitor network requests
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Monitor DOM changes
    await page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            window.domChanges = window.domChanges || [];
            window.domChanges.push({
              type: mutation.type,
              target: mutation.target.tagName,
              timestamp: new Date().toISOString()
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    });
    
    console.log('\n🎯 Test 1: Initial State Analysis');
    console.log('-'.repeat(40));
    
    // Check initial map state
    const initialMapSources = await page.evaluate(() => {
      const map = window.mapboxgl?.Map?.instances?.[0];
      if (!map) return null;
      
      return {
        sources: Object.keys(map.getStyle().sources || {}),
        layers: map.getStyle().layers?.length || 0,
        style: map.getStyle().name || 'unknown'
      };
    });
    
    console.log('Initial Map State:', initialMapSources);
    
    console.log('\n🎯 Test 2: Layer Toggle Interaction');
    console.log('-'.repeat(40));
    
    // Clear previous logs
    consoleLogs.length = 0;
    networkRequests.length = 0;
    
    // Find and click a layer toggle
    const layerToggles = await page.locator('input[type="checkbox"]').all();
    console.log(`Found ${layerToggles.length} layer toggles`);
    
    if (layerToggles.length > 0) {
      console.log('Clicking first layer toggle...');
      await layerToggles[0].click();
      await page.waitForTimeout(2000);
      
      // Check map state after toggle
      const afterToggleState = await page.evaluate(() => {
        const map = window.mapboxgl?.Map?.instances?.[0];
        if (!map) return null;
        
        return {
          sources: Object.keys(map.getStyle().sources || {}),
          layers: map.getStyle().layers?.length || 0,
          style: map.getStyle().name || 'unknown'
        };
      });
      
      console.log('After Toggle State:', afterToggleState);
    }
    
    console.log('\n🎯 Test 3: Map Style Switching');
    console.log('-'.repeat(40));
    
    // Clear previous logs
    consoleLogs.length = 0;
    networkRequests.length = 0;
    
    // Find and click map style buttons
    const styleButtons = await page.locator('.ios-segment').all();
    console.log(`Found ${styleButtons.length} style buttons`);
    
    if (styleButtons.length > 1) {
      console.log('Clicking second style button...');
      await styleButtons[1].click();
      await page.waitForTimeout(3000);
      
      // Check map state after style change
      const afterStyleState = await page.evaluate(() => {
        const map = window.mapboxgl?.Map?.instances?.[0];
        if (!map) return null;
        
        return {
          sources: Object.keys(map.getStyle().sources || {}),
          layers: map.getStyle().layers?.length || 0,
          style: map.getStyle().name || 'unknown'
        };
      });
      
      console.log('After Style Change State:', afterStyleState);
    }
    
    console.log('\n🎯 Test 4: Location Selector Interaction');
    console.log('-'.repeat(40));
    
    // Clear previous logs
    consoleLogs.length = 0;
    networkRequests.length = 0;
    
    // Interact with location selector
    const locationSelect = await page.locator('select.ios-input').first();
    if (await locationSelect.isVisible()) {
      console.log('Changing location selector...');
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }
    
    console.log('\n🎯 Test 5: Console Log Analysis');
    console.log('-'.repeat(40));
    
    // Analyze console logs for patterns
    const errorLogs = consoleLogs.filter(log => log.type === 'error');
    const warningLogs = consoleLogs.filter(log => log.type === 'warn');
    const infoLogs = consoleLogs.filter(log => log.type === 'log');
    
    console.log(`Total Console Logs: ${consoleLogs.length}`);
    console.log(`Errors: ${errorLogs.length}`);
    console.log(`Warnings: ${warningLogs.length}`);
    console.log(`Info: ${infoLogs.length}`);
    
    // Look for specific patterns
    const rerenderPatterns = consoleLogs.filter(log => 
      log.text.includes('re-render') || 
      log.text.includes('useEffect') || 
      log.text.includes('addFoundryDataLayers') ||
      log.text.includes('addTerrainLayers') ||
      log.text.includes('addBuildingExtrusions')
    );
    
    console.log(`\nRe-render Related Logs: ${rerenderPatterns.length}`);
    rerenderPatterns.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.type}] ${log.text}`);
    });
    
    console.log('\n🎯 Test 6: Network Request Analysis');
    console.log('-'.repeat(40));
    
    // Analyze network requests
    const mapboxRequests = networkRequests.filter(req => 
      req.url.includes('mapbox') || 
      req.url.includes('tiles') ||
      req.url.includes('terrain')
    );
    
    console.log(`Total Network Requests: ${networkRequests.length}`);
    console.log(`Mapbox/Tile Requests: ${mapboxRequests.length}`);
    
    // Group by URL pattern
    const requestPatterns = {};
    mapboxRequests.forEach(req => {
      const url = req.url;
      const pattern = url.split('?')[0]; // Remove query params
      requestPatterns[pattern] = (requestPatterns[pattern] || 0) + 1;
    });
    
    console.log('\nRequest Patterns:');
    Object.entries(requestPatterns).forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count} requests`);
    });
    
    console.log('\n🎯 Test 7: DOM Change Analysis');
    console.log('-'.repeat(40));
    
    // Get DOM changes
    domChanges = await page.evaluate(() => window.domChanges || []);
    console.log(`Total DOM Changes: ${domChanges.length}`);
    
    // Group by type
    const domChangeTypes = {};
    domChanges.forEach(change => {
      domChangeTypes[change.type] = (domChangeTypes[change.type] || 0) + 1;
    });
    
    console.log('\nDOM Change Types:');
    Object.entries(domChangeTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} changes`);
    });
    
    console.log('\n🎯 Test 8: React Component Analysis');
    console.log('-'.repeat(40));
    
    // Check for React component re-renders
    const reactRenders = await page.evaluate(() => {
      const renderCounts = {};
      
      // Look for React DevTools data
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('React DevTools available');
      }
      
      // Check for common React patterns in console
      return renderCounts;
    });
    
    console.log('React Analysis:', reactRenders);
    
    console.log('\n🎯 Test 9: Mapbox Instance Analysis');
    console.log('-'.repeat(40));
    
    // Analyze Mapbox instances
    const mapboxAnalysis = await page.evaluate(() => {
      const map = window.mapboxgl?.Map?.instances?.[0];
      if (!map) return 'No Mapbox instance found';
      
      return {
        isLoaded: map.isStyleLoaded(),
        hasTerrain: !!map.getTerrain(),
        sources: Object.keys(map.getStyle().sources || {}),
        layers: map.getStyle().layers?.length || 0,
        style: map.getStyle().name || 'unknown',
        center: map.getCenter(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing()
      };
    });
    
    console.log('Mapbox Analysis:', mapboxAnalysis);
    
    console.log('\n🎯 Test 10: Performance Monitoring');
    console.log('-'.repeat(40));
    
    // Monitor performance during interactions
    const performanceMetrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('measure');
      const navigationEntries = performance.getEntriesByType('navigation');
      
      return {
        measures: perfEntries.length,
        navigation: navigationEntries.length > 0 ? navigationEntries[0] : null,
        memory: performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null
      };
    });
    
    console.log('Performance Metrics:', performanceMetrics);
    
    // Final Analysis
    console.log('\n🔍 Issue Analysis Summary');
    console.log('='.repeat(50));
    
    const hasRerenderIssues = rerenderPatterns.length > 5;
    const hasExcessiveRequests = mapboxRequests.length > 20;
    const hasExcessiveDOMChanges = domChanges.length > 100;
    const hasErrors = errorLogs.length > 0;
    
    console.log(`Re-render Patterns: ${hasRerenderIssues ? '❌ HIGH' : '✅ Normal'} (${rerenderPatterns.length})`);
    console.log(`Network Requests: ${hasExcessiveRequests ? '❌ HIGH' : '✅ Normal'} (${mapboxRequests.length})`);
    console.log(`DOM Changes: ${hasExcessiveDOMChanges ? '❌ HIGH' : '✅ Normal'} (${domChanges.length})`);
    console.log(`Console Errors: ${hasErrors ? '❌ PRESENT' : '✅ None'} (${errorLogs.length})`);
    
    if (hasRerenderIssues || hasExcessiveRequests || hasExcessiveDOMChanges || hasErrors) {
      console.log('\n🚨 POTENTIAL ISSUES DETECTED:');
      
      if (hasRerenderIssues) {
        console.log('• Excessive re-renders detected in React components');
        console.log('• Check useEffect dependencies and state management');
      }
      
      if (hasExcessiveRequests) {
        console.log('• Too many Mapbox tile requests');
        console.log('• Check for unnecessary style changes or layer updates');
      }
      
      if (hasExcessiveDOMChanges) {
        console.log('• Excessive DOM mutations detected');
        console.log('• Check for unnecessary component re-renders');
      }
      
      if (hasErrors) {
        console.log('• Console errors present');
        console.log('• Check error logs above for specific issues');
      }
    } else {
      console.log('\n✅ No obvious issues detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

// Run the test
debugMapRerenderIssue().catch(console.error);
