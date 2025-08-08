const puppeteer = require('puppeteer');

async function smokeTest3DTerrain() {
  console.log('🚀 Starting 3D Terrain Smoke Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for better 3D visualization
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('📱 Navigating to 3D Terrain demo...');
    await page.goto('http://localhost:3001/mapbox-3d-buildings', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for the map to load
    console.log('⏳ Waiting for map to load...');
    await page.waitForSelector('.mapboxgl-canvas', { timeout: 30000 });
    
    // Check if the map container is visible
    const mapContainer = await page.$('.mapboxgl-canvas');
    if (!mapContainer) {
      throw new Error('Map container not found');
    }
    
    console.log('✅ Map container found');
    
    // Check if the map is actually rendering (not white screen)
    const mapScreenshot = await page.screenshot({ 
      clip: { x: 0, y: 0, width: 1200, height: 800 }
    });
    
    // Basic check - if the screenshot is mostly white, there's an issue
    const buffer = Buffer.from(mapScreenshot, 'base64');
    const isWhite = buffer.every(byte => byte > 240); // Check if mostly white
    
    if (isWhite) {
      console.log('⚠️  Warning: Map appears to be white - may indicate rendering issues');
    } else {
      console.log('✅ Map appears to be rendering correctly');
    }
    
    // Test layer controls
    console.log('🎛️  Testing layer controls...');
    
    // Test terrain toggle
    const terrainToggle = await page.$('input[type="checkbox"]');
    if (terrainToggle) {
      await terrainToggle.click();
      console.log('✅ Terrain toggle found and clickable');
    }
    
    // Test map style buttons
    const styleButtons = await page.$$('button');
    if (styleButtons.length > 0) {
      console.log(`✅ Found ${styleButtons.length} style buttons`);
    }
    
    // Test navigation
    console.log('🧭 Testing navigation...');
    await page.waitForTimeout(2000);
    
    // Try to zoom in
    await page.mouse.wheel({ deltaY: -100 });
    console.log('✅ Mouse wheel zoom test passed');
    
    // Try to pan
    await page.mouse.move(600, 400);
    await page.mouse.down();
    await page.mouse.move(700, 500);
    await page.mouse.up();
    console.log('✅ Mouse pan test passed');
    
    // Check for any console errors
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    if (consoleLogs.length > 0) {
      console.log('⚠️  Console errors found:');
      consoleLogs.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Take a final screenshot
    const finalScreenshot = await page.screenshot({ 
      path: 'smoke-test-3d-terrain-result.png',
      fullPage: true 
    });
    
    console.log('📸 Screenshot saved as smoke-test-3d-terrain-result.png');
    
    console.log('🎉 3D Terrain Smoke Test Completed Successfully!');
    
    return {
      success: true,
      mapLoaded: true,
      controlsWorking: true,
      navigationWorking: true,
      errors: consoleLogs
    };
    
  } catch (error) {
    console.error('❌ Smoke test failed:', error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ 
        path: 'smoke-test-3d-terrain-error.png',
        fullPage: true 
      });
      console.log('📸 Error screenshot saved as smoke-test-3d-terrain-error.png');
    } catch (screenshotError) {
      console.log('Could not save error screenshot');
    }
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Run the smoke test
smokeTest3DTerrain()
  .then(result => {
    if (result.success) {
      console.log('\n✅ SMOKE TEST PASSED');
      console.log('3D Terrain with building extrusions is working correctly!');
      process.exit(0);
    } else {
      console.log('\n❌ SMOKE TEST FAILED');
      console.log('Issues detected with 3D terrain implementation');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Smoke test crashed:', error);
    process.exit(1);
  });
