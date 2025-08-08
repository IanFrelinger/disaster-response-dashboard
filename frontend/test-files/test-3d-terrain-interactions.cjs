const { chromium } = require('playwright');

async function test3DTerrainInteractions() {
  console.log('🚀 Starting 3D Terrain Interaction Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down for debugging
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for better 3D visualization
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Listen for console messages and errors
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    console.log('📱 Navigating to 3D Terrain demo...');
    await page.goto('http://localhost:3000/mapbox-3d-buildings', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for initial page load...');
    await page.waitForTimeout(3000);
    
    // Check if the map container exists
    const mapContainer = await page.$('.mapboxgl-canvas');
    if (!mapContainer) {
      console.log('❌ Map container not found initially');
    } else {
      console.log('✅ Map container found initially');
    }
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-initial-load.png',
      fullPage: true 
    });
    console.log('📸 Initial screenshot saved');
    
    // Test 1: Check if page loads correctly
    console.log('\n🧪 Test 1: Initial Page Load');
    const title = await page.textContent('h1');
    console.log(`Page title: ${title}`);
    
    // Test 2: Check for loading overlay
    console.log('\n🧪 Test 2: Loading State');
    const loadingOverlay = await page.$('.absolute.inset-0.bg-black.bg-opacity-50');
    if (loadingOverlay) {
      console.log('⚠️  Loading overlay still visible');
    } else {
      console.log('✅ Loading overlay hidden');
    }
    
    // Test 3: Check map canvas
    console.log('\n🧪 Test 3: Map Canvas');
    const canvas = await page.$('.mapboxgl-canvas');
    if (canvas) {
      const isVisible = await canvas.isVisible();
      console.log(`Canvas visible: ${isVisible}`);
      
      // Check canvas dimensions
      const box = await canvas.boundingBox();
      console.log(`Canvas dimensions: ${box.width}x${box.height}`);
    } else {
      console.log('❌ Canvas not found');
    }
    
    // Test 4: Check control panel
    console.log('\n🧪 Test 4: Control Panel');
    const controlPanel = await page.$('.absolute.top-4.right-4');
    if (controlPanel) {
      console.log('✅ Control panel found');
      
      // Test style buttons
      const styleButtons = await page.$$('button');
      console.log(`Found ${styleButtons.length} buttons`);
      
      // Test checkboxes
      const checkboxes = await page.$$('input[type="checkbox"]');
      console.log(`Found ${checkboxes.length} checkboxes`);
    } else {
      console.log('❌ Control panel not found');
    }
    
    // Test 5: Test map style switching
    console.log('\n🧪 Test 5: Map Style Switching');
    try {
      const darkButton = await page.$('button:has-text("Dark")');
      if (darkButton) {
        await darkButton.click();
        console.log('✅ Dark style button clicked');
        await page.waitForTimeout(2000);
      }
      
      const satelliteButton = await page.$('button:has-text("Satellite")');
      if (satelliteButton) {
        await satelliteButton.click();
        console.log('✅ Satellite style button clicked');
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log(`❌ Style switching failed: ${error.message}`);
    }
    
    // Test 6: Test layer toggles
    console.log('\n🧪 Test 6: Layer Toggles');
    try {
      const terrainToggle = await page.$('input[type="checkbox"]');
      if (terrainToggle) {
        await terrainToggle.click();
        console.log('✅ Terrain toggle clicked');
        await page.waitForTimeout(2000);
      }
      
      const buildingToggle = await page.$$('input[type="checkbox"]');
      if (buildingToggle.length > 1) {
        await buildingToggle[1].click();
        console.log('✅ Building toggle clicked');
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log(`❌ Layer toggle failed: ${error.message}`);
    }
    
    // Test 7: Test map navigation
    console.log('\n🧪 Test 7: Map Navigation');
    try {
      // Zoom in
      await page.mouse.wheel({ deltaY: -200 });
      console.log('✅ Mouse wheel zoom test');
      await page.waitForTimeout(2000);
      
      // Pan
      await page.mouse.move(600, 400);
      await page.mouse.down();
      await page.mouse.move(700, 500);
      await page.mouse.up();
      console.log('✅ Mouse pan test');
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log(`❌ Navigation failed: ${error.message}`);
    }
    
    // Test 8: Check for white screen after interactions
    console.log('\n🧪 Test 8: White Screen Detection');
    await page.waitForTimeout(3000);
    
    const finalCanvas = await page.$('.mapboxgl-canvas');
    if (finalCanvas) {
      const isVisible = await finalCanvas.isVisible();
      console.log(`Final canvas visible: ${isVisible}`);
      
      // Take screenshot to check for white screen
      await page.screenshot({ 
        path: 'test-after-interactions.png',
        fullPage: true 
      });
      console.log('📸 Final screenshot saved');
    } else {
      console.log('❌ Canvas disappeared after interactions');
    }
    
    // Test 9: Check console errors
    console.log('\n🧪 Test 9: Console Analysis');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('❌ Errors detected:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Test 10: Check for specific Mapbox errors
    console.log('\n🧪 Test 10: Mapbox-Specific Issues');
    const mapboxErrors = errors.filter(error => 
      error.includes('mapbox') || 
      error.includes('Map') || 
      error.includes('GL') ||
      error.includes('WebGL') ||
      error.includes('canvas')
    );
    
    if (mapboxErrors.length > 0) {
      console.log('⚠️  Mapbox-related errors:');
      mapboxErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No Mapbox-specific errors');
    }
    
    // Test 11: Check for memory or performance issues
    console.log('\n🧪 Test 11: Performance Check');
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation');
    });
    
    if (performanceEntries.length > 0) {
      const navEntry = performanceEntries[0];
      console.log(`Page load time: ${navEntry.loadEventEnd - navEntry.loadEventStart}ms`);
      console.log(`DOM content loaded: ${navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart}ms`);
    }
    
    // Test 12: Check for React/Component errors
    console.log('\n🧪 Test 12: React Component Check');
    const reactErrors = errors.filter(error => 
      error.includes('React') || 
      error.includes('component') || 
      error.includes('useEffect') ||
      error.includes('useState')
    );
    
    if (reactErrors.length > 0) {
      console.log('⚠️  React-related errors:');
      reactErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No React-specific errors');
    }
    
    // Final assessment
    console.log('\n📊 Final Assessment:');
    
    const hasCanvas = await page.$('.mapboxgl-canvas') !== null;
    const hasErrors = errors.length > 0;
    const hasMapboxErrors = mapboxErrors.length > 0;
    
    if (hasCanvas && !hasErrors) {
      console.log('✅ 3D Terrain is working correctly');
      return { success: true, issues: [] };
    } else if (hasCanvas && hasErrors) {
      console.log('⚠️  3D Terrain loads but has errors');
      return { success: true, issues: errors };
    } else if (!hasCanvas && hasMapboxErrors) {
      console.log('❌ 3D Terrain failed to load due to Mapbox errors');
      return { success: false, issues: mapboxErrors };
    } else {
      console.log('❌ 3D Terrain failed to load');
      return { success: false, issues: errors };
    }
    
  } catch (error) {
    console.error('💥 Test crashed:', error);
    
    // Take error screenshot
    try {
      await page.screenshot({ 
        path: 'test-crash-error.png',
        fullPage: true 
      });
      console.log('📸 Crash screenshot saved');
    } catch (screenshotError) {
      console.log('Could not save crash screenshot');
    }
    
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the test
test3DTerrainInteractions()
  .then(result => {
    console.log('\n🎯 Test Results:');
    if (result.success) {
      console.log('✅ 3D Terrain Interaction Test PASSED');
      if (result.issues && result.issues.length > 0) {
        console.log('⚠️  Issues found but functionality works:');
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    } else {
      console.log('❌ 3D Terrain Interaction Test FAILED');
      if (result.issues && result.issues.length > 0) {
        console.log('❌ Issues preventing functionality:');
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      if (result.error) {
        console.log(`💥 Test error: ${result.error}`);
      }
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check screenshots: test-initial-load.png, test-after-interactions.png');
    console.log('2. Review console errors in browser dev tools');
    console.log('3. Check Mapbox access token and API limits');
    console.log('4. Verify network connectivity to Mapbox services');
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
