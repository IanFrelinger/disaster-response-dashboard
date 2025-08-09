const { chromium } = require('playwright');

async function simpleMapDebug() {
  console.log('🔍 Simple Map Re-render Debug');
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
    
    console.log('\n🎯 Test 1: Initial Map State');
    console.log('-'.repeat(30));
    
    // Check if map is loaded
    const mapLoaded = await page.evaluate(() => {
      return !!window.mapboxgl?.Map?.instances?.[0];
    });
    
    console.log(`Map Loaded: ${mapLoaded}`);
    
    if (mapLoaded) {
      const mapInfo = await page.evaluate(() => {
        const map = window.mapboxgl.Map.instances[0];
        return {
          sources: Object.keys(map.getStyle().sources || {}),
          layers: map.getStyle().layers?.length || 0,
          style: map.getStyle().name || 'unknown'
        };
      });
      console.log('Initial Map Info:', mapInfo);
    }
    
    console.log('\n🎯 Test 2: Layer Toggle Test');
    console.log('-'.repeat(30));
    
    // Clear console logs
    consoleLogs.length = 0;
    
    // Find layer toggles
    const layerToggles = await page.locator('input[type="checkbox"]').all();
    console.log(`Found ${layerToggles.length} layer toggles`);
    
    if (layerToggles.length > 0) {
      console.log('Clicking first layer toggle...');
      await layerToggles[0].click();
      await page.waitForTimeout(2000);
      
      // Check for re-render patterns
      const rerenderLogs = consoleLogs.filter(log => 
        log.text.includes('useEffect') || 
        log.text.includes('addFoundryDataLayers') ||
        log.text.includes('addTerrainLayers') ||
        log.text.includes('addBuildingExtrusions') ||
        log.text.includes('re-render')
      );
      
      console.log(`Re-render related logs: ${rerenderLogs.length}`);
      rerenderLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. [${log.type}] ${log.text}`);
      });
    }
    
    console.log('\n🎯 Test 3: Map Style Test');
    console.log('-'.repeat(30));
    
    // Clear console logs
    consoleLogs.length = 0;
    
    // Find style buttons
    const styleButtons = await page.locator('.ios-segment').all();
    console.log(`Found ${styleButtons.length} style buttons`);
    
    if (styleButtons.length > 1) {
      console.log('Clicking second style button...');
      await styleButtons[1].click();
      await page.waitForTimeout(3000);
      
      // Check for re-render patterns
      const styleRerenderLogs = consoleLogs.filter(log => 
        log.text.includes('useEffect') || 
        log.text.includes('addFoundryDataLayers') ||
        log.text.includes('addTerrainLayers') ||
        log.text.includes('addBuildingExtrusions') ||
        log.text.includes('re-render')
      );
      
      console.log(`Style change re-render logs: ${styleRerenderLogs.length}`);
      styleRerenderLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. [${log.type}] ${log.text}`);
      });
    }
    
    console.log('\n🎯 Test 4: Location Selector Test');
    console.log('-'.repeat(30));
    
    // Clear console logs
    consoleLogs.length = 0;
    
    // Find location selector
    const locationSelect = await page.locator('select.ios-input').first();
    if (await locationSelect.isVisible()) {
      console.log('Changing location selector...');
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      // Check for re-render patterns
      const locationRerenderLogs = consoleLogs.filter(log => 
        log.text.includes('useEffect') || 
        log.text.includes('addFoundryDataLayers') ||
        log.text.includes('addTerrainLayers') ||
        log.text.includes('addBuildingExtrusions') ||
        log.text.includes('re-render')
      );
      
      console.log(`Location change re-render logs: ${locationRerenderLogs.length}`);
      locationRerenderLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. [${log.type}] ${log.text}`);
      });
    }
    
    console.log('\n🎯 Test 5: Error Analysis');
    console.log('-'.repeat(30));
    
    const errorLogs = consoleLogs.filter(log => log.type === 'error');
    const warningLogs = consoleLogs.filter(log => log.type === 'warn');
    
    console.log(`Total Console Logs: ${consoleLogs.length}`);
    console.log(`Errors: ${errorLogs.length}`);
    console.log(`Warnings: ${warningLogs.length}`);
    
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
    
    console.log('\n🎯 Test 6: Map State After Interactions');
    console.log('-'.repeat(30));
    
    if (mapLoaded) {
      const finalMapInfo = await page.evaluate(() => {
        const map = window.mapboxgl.Map.instances[0];
        return {
          sources: Object.keys(map.getStyle().sources || {}),
          layers: map.getStyle().layers?.length || 0,
          style: map.getStyle().name || 'unknown',
          center: map.getCenter(),
          zoom: map.getZoom(),
          pitch: map.getPitch()
        };
      });
      console.log('Final Map Info:', finalMapInfo);
    }
    
    // Final Analysis
    console.log('\n🔍 Issue Analysis');
    console.log('='.repeat(40));
    
    const totalRerenderLogs = consoleLogs.filter(log => 
      log.text.includes('useEffect') || 
      log.text.includes('addFoundryDataLayers') ||
      log.text.includes('addTerrainLayers') ||
      log.text.includes('addBuildingExtrusions') ||
      log.text.includes('re-render')
    ).length;
    
    console.log(`Total Re-render Related Logs: ${totalRerenderLogs}`);
    console.log(`Console Errors: ${errorLogs.length}`);
    console.log(`Console Warnings: ${warningLogs.length}`);
    
    if (totalRerenderLogs > 10) {
      console.log('\n🚨 HIGH RE-RENDER ACTIVITY DETECTED');
      console.log('This suggests excessive component re-renders');
    } else if (totalRerenderLogs > 5) {
      console.log('\n⚠️ MODERATE RE-RENDER ACTIVITY DETECTED');
      console.log('Some optimization may be needed');
    } else {
      console.log('\n✅ NORMAL RE-RENDER ACTIVITY');
    }
    
    if (errorLogs.length > 0) {
      console.log('\n🚨 CONSOLE ERRORS PRESENT');
      console.log('These may be causing the re-rendering issues');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

// Run the test
simpleMapDebug().catch(console.error);
