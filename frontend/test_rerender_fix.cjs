const { chromium } = require('playwright');

async function testRerenderFix() {
  console.log('🔧 Testing Re-render Fix');
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
    
    await page.waitForTimeout(5000); // Wait longer for map to load
    
    // Monitor console logs
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('\n🎯 Test 1: Check Map Loading');
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
      console.log('Map Info:', mapInfo);
    }
    
    console.log('\n🎯 Test 2: Layer Toggle Interactions');
    console.log('-'.repeat(30));
    
    // Clear console logs
    consoleLogs.length = 0;
    
    // Find and click multiple layer toggles
    const layerToggles = await page.locator('input[type="checkbox"]').all();
    console.log(`Found ${layerToggles.length} layer toggles`);
    
    for (let i = 0; i < Math.min(3, layerToggles.length); i++) {
      console.log(`Clicking layer toggle ${i + 1}...`);
      await layerToggles[i].click();
      await page.waitForTimeout(1000);
    }
    
    // Check for excessive re-render patterns
    const rerenderLogs = consoleLogs.filter(log => 
      log.text.includes('useEffect') || 
      log.text.includes('addFoundryDataLayers') ||
      log.text.includes('addTerrainLayers') ||
      log.text.includes('addBuildingExtrusions') ||
      log.text.includes('re-render')
    );
    
    console.log(`Re-render related logs: ${rerenderLogs.length}`);
    
    console.log('\n🎯 Test 3: Map Style Switching');
    console.log('-'.repeat(30));
    
    // Clear console logs
    consoleLogs.length = 0;
    
    // Find and click style buttons
    const styleButtons = await page.locator('.ios-segment').all();
    console.log(`Found ${styleButtons.length} style buttons`);
    
    for (let i = 0; i < styleButtons.length; i++) {
      console.log(`Clicking style button ${i + 1}...`);
      await styleButtons[i].click();
      await page.waitForTimeout(2000);
    }
    
    // Check for excessive re-render patterns
    const styleRerenderLogs = consoleLogs.filter(log => 
      log.text.includes('useEffect') || 
      log.text.includes('addFoundryDataLayers') ||
      log.text.includes('addTerrainLayers') ||
      log.text.includes('addBuildingExtrusions') ||
      log.text.includes('re-render')
    );
    
    console.log(`Style change re-render logs: ${styleRerenderLogs.length}`);
    
    console.log('\n🎯 Test 4: Location Selector Interactions');
    console.log('-'.repeat(30));
    
    // Clear console logs
    consoleLogs.length = 0;
    
    // Interact with location selector multiple times
    const locationSelect = await page.locator('select.ios-input').first();
    if (await locationSelect.isVisible()) {
      const options = await locationSelect.locator('option').all();
      console.log(`Found ${options.length} location options`);
      
      for (let i = 0; i < Math.min(3, options.length); i++) {
        console.log(`Selecting location option ${i + 1}...`);
        await locationSelect.selectOption({ index: i });
        await page.waitForTimeout(1000);
      }
    }
    
    // Check for excessive re-render patterns
    const locationRerenderLogs = consoleLogs.filter(log => 
      log.text.includes('useEffect') || 
      log.text.includes('addFoundryDataLayers') ||
      log.text.includes('addTerrainLayers') ||
      log.text.includes('addBuildingExtrusions') ||
      log.text.includes('re-render')
    );
    
    console.log(`Location change re-render logs: ${locationRerenderLogs.length}`);
    
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
    
    console.log('\n🎯 Test 6: Final Assessment');
    console.log('-'.repeat(30));
    
    const totalRerenderLogs = rerenderLogs.length + styleRerenderLogs.length + locationRerenderLogs.length;
    
    console.log(`Total Re-render Related Logs: ${totalRerenderLogs}`);
    console.log(`Console Errors: ${errorLogs.length}`);
    console.log(`Map Loaded Successfully: ${mapLoaded}`);
    
    // Assessment
    if (totalRerenderLogs > 20) {
      console.log('\n🚨 HIGH RE-RENDER ACTIVITY - ISSUE NOT FIXED');
      console.log('The component is still re-rendering excessively');
    } else if (totalRerenderLogs > 10) {
      console.log('\n⚠️ MODERATE RE-RENDER ACTIVITY - PARTIAL FIX');
      console.log('Some optimization may still be needed');
    } else {
      console.log('\n✅ LOW RE-RENDER ACTIVITY - ISSUE FIXED');
      console.log('The re-rendering issue has been resolved');
    }
    
    if (errorLogs.length > 0) {
      console.log('\n⚠️ CONSOLE ERRORS PRESENT');
      console.log('These may need attention but are not related to re-rendering');
    }
    
    if (!mapLoaded) {
      console.log('\n❌ MAP NOT LOADED');
      console.log('The map failed to load, which may be a separate issue');
    } else {
      console.log('\n✅ MAP LOADED SUCCESSFULLY');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

// Run the test
testRerenderFix().catch(console.error);
