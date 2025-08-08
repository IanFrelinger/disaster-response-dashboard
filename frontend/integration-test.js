import puppeteer from 'puppeteer';

async function runIntegrationTest() {
  console.log('🔍 Running Terrain3D Integration Test...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the Foundry 3D Demo page
    console.log('🌐 Navigating to Foundry 3D Demo...');
    await page.goto('http://localhost:3001/foundry-terrain', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for the 3D terrain to load
    console.log('⏳ Waiting for 3D terrain to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if the canvas is present and has content
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { hasCanvas: false };
      
      return {
        hasCanvas: true,
        width: canvas.width,
        height: canvas.height,
        displayWidth: canvas.style.width,
        displayHeight: canvas.style.height
      };
    });
    
    console.log('📊 Canvas Information:');
    console.log('  Has canvas:', canvasInfo.hasCanvas);
    if (canvasInfo.hasCanvas) {
      console.log('  Canvas size:', canvasInfo.width, 'x', canvasInfo.height);
      console.log('  Display size:', canvasInfo.displayWidth, 'x', canvasInfo.displayHeight);
    }
    
    // Check for loading overlay
    const loadingOverlay = await page.evaluate(() => {
      const overlay = document.querySelector('.absolute.inset-0.bg-black');
      return overlay ? overlay.style.display !== 'none' : false;
    });
    
    console.log('📋 Loading overlay visible:', loadingOverlay);
    
    // Check for console errors
    const consoleErrors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    console.log('📋 Console errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('  Errors:', consoleErrors);
    }
    
    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'integration-test-result.png',
      fullPage: true 
    });
    
    // Test results
    const testPassed = canvasInfo.hasCanvas && !loadingOverlay && consoleErrors.length === 0;
    
    if (testPassed) {
      console.log('✅ Integration test PASSED!');
      console.log('   Terrain3D component is working correctly');
      console.log('   Canvas is present and rendering');
      console.log('   No loading overlay (terrain loaded)');
      console.log('   No console errors');
    } else {
      console.log('❌ Integration test FAILED!');
      if (!canvasInfo.hasCanvas) console.log('   - Canvas not found');
      if (loadingOverlay) console.log('   - Loading overlay still visible');
      if (consoleErrors.length > 0) console.log('   - Console errors present');
    }
    
    return testPassed;
    
  } catch (error) {
    console.error('❌ Integration test failed with error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
runIntegrationTest().then(passed => {
  process.exit(passed ? 0 : 1);
});
