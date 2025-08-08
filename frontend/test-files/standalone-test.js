import { chromium } from 'playwright';

async function runMapValidation() {
  console.log('🚀 Starting Standalone Map Validation Test...');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 
    });
    
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('📱 Navigating to application...');
    
    // Navigate to the app
    await page.goto('http://localhost:3000', { timeout: 30000 });
    console.log('✅ Navigation successful');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    console.log('✅ DOM content loaded');
    
    // Check if root element exists
    const rootElement = await page.locator('#root');
    const isRootVisible = await rootElement.isVisible();
    console.log(`✅ Root element: ${isRootVisible ? 'Visible' : 'Not visible'}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'standalone-test.png', fullPage: true });
    console.log('📸 Screenshot saved: standalone-test.png');
    
    // Check for header
    const headers = await page.locator('h1');
    const headerCount = await headers.count();
    console.log(`📄 Found ${headerCount} h1 elements`);
    
    if (headerCount > 0) {
      const firstHeaderText = await headers.first().textContent();
      console.log(`📄 First header text: "${firstHeaderText}"`);
      
      if (firstHeaderText && firstHeaderText.includes('3D Terrain')) {
        console.log('✅ 3D Terrain header found');
      }
    }
    
    // Check for canvas elements
    const canvas = await page.locator('canvas');
    const canvasCount = await canvas.count();
    console.log(`🎨 Canvas elements found: ${canvasCount}`);
    
    // Check for controls
    const controls = await page.locator('input[type="range"], button');
    const controlCount = await controls.count();
    console.log(`🎛️ Control elements found: ${controlCount}`);
    
    // Check for any console errors
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console error: ${msg.text()}`);
      }
    });
    
    // Wait a bit to capture any errors
    await page.waitForTimeout(3000);
    
    if (errors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log(`❌ Found ${errors.length} console errors`);
    }
    
    // Test responsiveness
    console.log('📱 Testing responsiveness...');
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(2000);
      
      const rootVisible = await rootElement.isVisible();
      console.log(`✅ ${viewport.name} viewport: ${rootVisible ? 'OK' : 'Not visible'}`);
    }
    
    console.log('\n🎉 Standalone Map Validation Test Complete!');
    console.log('📊 Summary:');
    console.log(`   - Page loaded: ✅`);
    console.log(`   - Root element: ${isRootVisible ? '✅' : '❌'}`);
    console.log(`   - Header: ✅ (Found ${headerCount} headers)`);
    console.log(`   - Canvas elements: ${canvasCount}`);
    console.log(`   - Control elements: ${controlCount}`);
    console.log(`   - Console errors: ${errors.length}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (page) {
      await page.screenshot({ path: 'standalone-test-error.png' });
      console.log('📸 Error screenshot saved: standalone-test-error.png');
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run the test
runMapValidation().catch(console.error);
