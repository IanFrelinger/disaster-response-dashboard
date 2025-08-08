const { chromium } = require('playwright');

async function simple3DTest() {
  console.log('🚀 Starting Simple 3D Terrain Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
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
    
    // Try to navigate with a simpler approach
    await page.goto('http://localhost:3000/mapbox-3d-buildings', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait a bit for React to render
    await page.waitForTimeout(3000);
    
    // Check if the page title is correct
    const title = await page.textContent('h1');
    console.log(`📄 Page title: ${title}`);
    
    // Check if map container exists
    const mapContainer = await page.$('.mapboxgl-canvas');
    if (mapContainer) {
      console.log('✅ Map container found');
      
      // Check if it's visible
      const isVisible = await mapContainer.isVisible();
      console.log(`👁️  Map container visible: ${isVisible}`);
      
      // Take a screenshot
      await page.screenshot({ 
        path: 'simple-test-result.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved as simple-test-result.png');
      
    } else {
      console.log('❌ Map container not found');
      
      // Take a screenshot anyway
      await page.screenshot({ 
        path: 'simple-test-no-map.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved as simple-test-no-map.png');
    }
    
    // Check for any errors
    if (errors.length > 0) {
      console.log(`\n⚠️  Found ${errors.length} errors:`);
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ No errors detected');
    }
    
    // Wait a bit more to see if white screen appears
    console.log('\n⏳ Waiting 10 seconds to check for white screen...');
    await page.waitForTimeout(10000);
    
    // Take another screenshot
    await page.screenshot({ 
      path: 'simple-test-after-wait.png',
      fullPage: true 
    });
    console.log('📸 Final screenshot saved as simple-test-after-wait.png');
    
    // Check if map is still there
    const finalMapContainer = await page.$('.mapboxgl-canvas');
    if (finalMapContainer) {
      const isVisible = await finalMapContainer.isVisible();
      console.log(`👁️  Final map container visible: ${isVisible}`);
      
      if (isVisible) {
        console.log('✅ Map is still visible after wait - no white screen detected');
        return { success: true, whiteScreen: false };
      } else {
        console.log('⚠️  Map container exists but not visible - potential white screen');
        return { success: false, whiteScreen: true, errors };
      }
    } else {
      console.log('❌ Map container disappeared - white screen confirmed');
      return { success: false, whiteScreen: true, errors };
    }
    
  } catch (error) {
    console.error('💥 Test crashed:', error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ 
        path: 'simple-test-error.png',
        fullPage: true 
      });
      console.log('📸 Error screenshot saved as simple-test-error.png');
    } catch (screenshotError) {
      console.log('Could not save error screenshot');
    }
    
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the test
simple3DTest()
  .then(result => {
    console.log('\n🎯 Test Results:');
    if (result.success) {
      console.log('✅ Simple 3D Test PASSED');
      console.log('✅ No white screen detected');
    } else {
      console.log('❌ Simple 3D Test FAILED');
      if (result.whiteScreen) {
        console.log('❌ White screen detected!');
        console.log('\n🔧 Potential fixes:');
        console.log('1. Check Mapbox access token');
        console.log('2. Check browser WebGL support');
        console.log('3. Check for memory leaks in React components');
        console.log('4. Check for infinite re-renders');
        console.log('5. Check for Mapbox API rate limits');
      }
      if (result.error) {
        console.log(`💥 Test error: ${result.error}`);
      }
      if (result.errors && result.errors.length > 0) {
        console.log('\n❌ Errors found:');
        result.errors.forEach(error => console.log(`   - ${error}`));
      }
    }
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
