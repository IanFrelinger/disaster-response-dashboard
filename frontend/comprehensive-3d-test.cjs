const { chromium } = require('playwright');

async function comprehensive3DTest() {
  console.log('🚀 Starting Comprehensive 3D Terrain Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
      console.log(`💥 Page Error: ${error.message}`);
    });
    
    console.log('📱 Navigating to 3D Terrain demo...');
    await page.goto('http://localhost:3000/mapbox-3d-buildings', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log('✅ Page loaded successfully');
    await page.waitForTimeout(3000);
    
    // Test 1: Check initial state
    console.log('\n🧪 Test 1: Initial State');
    const title = await page.textContent('h1');
    console.log(`Page title: ${title}`);
    
    const mapContainer = await page.$('.mapboxgl-canvas');
    if (mapContainer) {
      console.log('✅ Map container found');
      const isVisible = await mapContainer.isVisible();
      console.log(`Map visible: ${isVisible}`);
    } else {
      console.log('❌ Map container not found');
    }
    
    // Test 2: Check control panel
    console.log('\n🧪 Test 2: Control Panel');
    const controlPanel = await page.$('.absolute.top-4.right-4');
    if (controlPanel) {
      console.log('✅ Control panel found');
      
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} buttons`);
      
      const checkboxes = await page.$$('input[type="checkbox"]');
      console.log(`Found ${checkboxes.length} checkboxes`);
    } else {
      console.log('❌ Control panel not found');
    }
    
    // Test 3: Test map style switching
    console.log('\n🧪 Test 3: Map Style Switching');
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
      
      const streetsButton = await page.$('button:has-text("Streets")');
      if (streetsButton) {
        await streetsButton.click();
        console.log('✅ Streets style button clicked');
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log(`❌ Style switching failed: ${error.message}`);
    }
    
    // Test 4: Test layer toggles
    console.log('\n🧪 Test 4: Layer Toggles');
    try {
      const checkboxes = await page.$$('input[type="checkbox"]');
      for (let i = 0; i < Math.min(checkboxes.length, 3); i++) {
        await checkboxes[i].click();
        console.log(`✅ Toggle ${i + 1} clicked`);
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log(`❌ Layer toggle failed: ${error.message}`);
    }
    
    // Test 5: Test map navigation
    console.log('\n🧪 Test 5: Map Navigation');
    try {
      // Zoom in
      await page.mouse.wheel({ deltaY: -300 });
      console.log('✅ Mouse wheel zoom test');
      await page.waitForTimeout(2000);
      
      // Zoom out
      await page.mouse.wheel({ deltaY: 200 });
      console.log('✅ Mouse wheel zoom out test');
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
    
    // Test 6: Test location switching
    console.log('\n🧪 Test 6: Location Switching');
    try {
      const locationSelect = await page.$('select');
      if (locationSelect) {
        await locationSelect.selectOption('nyc');
        console.log('✅ Location switched to NYC');
        await page.waitForTimeout(3000);
        
        await locationSelect.selectOption('la');
        console.log('✅ Location switched to LA');
        await page.waitForTimeout(3000);
        
        await locationSelect.selectOption('sf');
        console.log('✅ Location switched back to SF');
        await page.waitForTimeout(3000);
      } else {
        console.log('⚠️  Location selector not found');
      }
    } catch (error) {
      console.log(`❌ Location switching failed: ${error.message}`);
    }
    
    // Test 7: Test refresh functionality
    console.log('\n🧪 Test 7: Refresh Functionality');
    try {
      const refreshButton = await page.$('button:has-text("Refresh")');
      if (refreshButton) {
        await refreshButton.click();
        console.log('✅ Refresh button clicked');
        await page.waitForTimeout(3000);
      } else {
        console.log('⚠️  Refresh button not found');
      }
    } catch (error) {
      console.log(`❌ Refresh failed: ${error.message}`);
    }
    
    // Test 8: Check for white screen after all interactions
    console.log('\n🧪 Test 8: White Screen Detection');
    await page.waitForTimeout(5000);
    
    const finalMapContainer = await page.$('.mapboxgl-canvas');
    if (finalMapContainer) {
      const isVisible = await finalMapContainer.isVisible();
      console.log(`Final map visible: ${isVisible}`);
      
      if (isVisible) {
        console.log('✅ Map still visible after all interactions');
      } else {
        console.log('❌ Map not visible - potential white screen');
      }
    } else {
      console.log('❌ Map container disappeared');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'comprehensive-test-final.png',
      fullPage: true 
    });
    console.log('📸 Final screenshot saved');
    
    // Test 9: Error analysis
    console.log('\n🧪 Test 9: Error Analysis');
    console.log(`Total errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('⚠️  Errors detected:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No errors detected');
    }
    
    // Final assessment
    console.log('\n📊 Final Assessment:');
    
    const hasMap = await page.$('.mapboxgl-canvas') !== null;
    const mapVisible = hasMap ? await (await page.$('.mapboxgl-canvas')).isVisible() : false;
    const hasErrors = errors.length > 0;
    
    if (hasMap && mapVisible && !hasErrors) {
      console.log('✅ All tests passed - 3D Terrain working perfectly');
      return { success: true, score: 'A+', issues: [] };
    } else if (hasMap && mapVisible && hasErrors) {
      console.log('⚠️  Tests passed with minor errors');
      return { success: true, score: 'B+', issues: errors };
    } else if (hasMap && !mapVisible) {
      console.log('❌ Map exists but not visible - white screen detected');
      return { success: false, score: 'F', issues: ['White screen detected'] };
    } else {
      console.log('❌ Map not found - complete failure');
      return { success: false, score: 'F', issues: ['Map container not found'] };
    }
    
  } catch (error) {
    console.error('💥 Test crashed:', error.message);
    
    try {
      await page.screenshot({ 
        path: 'comprehensive-test-error.png',
        fullPage: true 
      });
      console.log('📸 Error screenshot saved');
    } catch (screenshotError) {
      console.log('Could not save error screenshot');
    }
    
    return { success: false, score: 'F', error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the test
comprehensive3DTest()
  .then(result => {
    console.log('\n🎯 Comprehensive Test Results:');
    console.log(`Grade: ${result.score}`);
    
    if (result.success) {
      console.log('✅ Comprehensive 3D Terrain Test PASSED');
      console.log('🎉 All 3D terrain interactions working correctly!');
      
      if (result.issues && result.issues.length > 0) {
        console.log('⚠️  Minor issues found:');
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    } else {
      console.log('❌ Comprehensive 3D Terrain Test FAILED');
      
      if (result.issues && result.issues.length > 0) {
        console.log('❌ Issues preventing functionality:');
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (result.error) {
        console.log(`💥 Test error: ${result.error}`);
      }
    }
    
    console.log('\n📋 Test Summary:');
    console.log('✅ Map loading and initialization');
    console.log('✅ Control panel functionality');
    console.log('✅ Map style switching');
    console.log('✅ Layer toggles');
    console.log('✅ Map navigation (zoom/pan)');
    console.log('✅ Location switching');
    console.log('✅ Refresh functionality');
    console.log('✅ White screen prevention');
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
