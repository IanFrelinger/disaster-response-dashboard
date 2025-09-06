// Simple test script to check layer validation
import puppeteer from 'puppeteer';

async function testLayerValidation() {
  console.log('🔍 Starting layer validation test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Navigate to the app
    console.log('🌐 Navigating to http://localhost:3002/...');
    await page.goto('http://localhost:3002/', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Look for the "Open 3D Map" button and click it
    console.log('🔍 Looking for 3D Map button...');
    try {
      await page.waitForSelector('button:has-text("Open 3D Map")', { timeout: 10000 });
      await page.click('button:has-text("Open 3D Map")');
      console.log('✅ Clicked 3D Map button');
    } catch (error) {
      console.log('❌ Could not find or click 3D Map button:', error.message);
    }
    
    // Wait for map to load
    console.log('⏳ Waiting for map to load...');
    await page.waitForTimeout(5000);
    
    // Check if map container exists
    const mapContainer = await page.$('.map-container-3d');
    console.log('✅ Map container found:', !!mapContainer);
    
    // Check for validation overlay
    const validationOverlay = await page.$('text=Layer Validation');
    console.log('✅ Validation overlay found:', !!validationOverlay);
    
    if (validationOverlay) {
      // Get validation results
      const validationText = await page.evaluate(() => {
        const overlay = document.querySelector('text=Layer Validation');
        if (overlay) {
          return overlay.parentElement.textContent;
        }
        return null;
      });
      console.log('📊 Validation Results:', validationText);
    }
    
    // Check console messages for layer validation
    const layerMessages = consoleMessages.filter(msg => 
      msg.text.includes('Layer Validation') || 
      msg.text.includes('layers successful') ||
      msg.text.includes('total errors')
    );
    
    console.log('📊 Layer-related console messages:');
    layerMessages.forEach(msg => {
      console.log(`  [${msg.type}] ${msg.text}`);
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'layer-validation-test.png' });
    console.log('📸 Screenshot saved as layer-validation-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testLayerValidation().catch(console.error);
