// Automated browser test to check layer validation
import { chromium } from 'playwright';

async function checkLayerValidation() {
  console.log('🔍 Starting automated layer validation check...');
  
  const browser = await chromium.launch({ 
    headless: false, // Set to true for headless mode
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
      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-no-button.png' });
      console.log('📸 Debug screenshot saved as debug-no-button.png');
      return;
    }
    
    // Wait for map to load
    console.log('⏳ Waiting for map to load...');
    await page.waitForTimeout(8000); // Increased wait time
    
    // Check if map container exists
    const mapContainer = await page.$('.map-container-3d');
    console.log('✅ Map container found:', !!mapContainer);
    
    // Check for validation overlay
    const validationOverlay = await page.$('text=Layer Validation');
    console.log('✅ Validation overlay found:', !!validationOverlay);
    
    if (validationOverlay) {
      // Get validation results text
      const validationText = await page.evaluate(() => {
        // Look for validation overlay by text content
        const elements = Array.from(document.querySelectorAll('*'));
        const overlay = elements.find(el => el.textContent?.includes('Layer Validation'));
        if (overlay) {
          return overlay.textContent;
        }
        return null;
      });
      console.log('📊 Validation Results Text:', validationText);
      
      // Look for the specific validation status
      const overallStatus = await page.evaluate(() => {
        const text = document.body.textContent;
        const match = text.match(/Overall:\s*(\d+)\/(\d+)\s*layers successful/);
        if (match) {
          return {
            successful: parseInt(match[1]),
            total: parseInt(match[2]),
            successRate: (parseInt(match[1]) / parseInt(match[2])) * 100
          };
        }
        return null;
      });
      
      if (overallStatus) {
        console.log('📊 Layer Validation Status:', overallStatus);
        console.log(`✅ Success Rate: ${overallStatus.successRate.toFixed(1)}%`);
        
        if (overallStatus.successRate === 100) {
          console.log('🎉 SUCCESS: All layers are validating correctly!');
        } else {
          console.log(`⚠️  WARNING: Only ${overallStatus.successful}/${overallStatus.total} layers are successful`);
        }
      }
    }
    
    // Check console messages for layer validation
    const layerMessages = consoleMessages.filter(msg => 
      msg.text.includes('Layer Validation') || 
      msg.text.includes('layers successful') ||
      msg.text.includes('total errors') ||
      msg.text.includes('3D Map Validation Results')
    );
    
    console.log('📊 Layer-related console messages:');
    layerMessages.forEach(msg => {
      console.log(`  [${msg.type}] ${msg.text}`);
    });
    
    // Check for any errors
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    if (errorMessages.length > 0) {
      console.log('❌ Console errors found:');
      errorMessages.forEach(msg => {
        console.log(`  ${msg.text}`);
      });
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'layer-validation-check.png' });
    console.log('📸 Screenshot saved as layer-validation-check.png');
    
    // Check if the map is actually rendering
    const mapElement = await page.$('.mapboxgl-map');
    console.log('✅ Mapbox map element found:', !!mapElement);
    
    if (mapElement) {
      // Check if map has loaded
      const mapLoaded = await page.evaluate(() => {
        const map = window.mapboxgl?.Map?.getMap?.();
        return !!map && map.isStyleLoaded();
      });
      console.log('✅ Map style loaded:', mapLoaded);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    // Take screenshot on error
    try {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('📸 Error screenshot saved as error-screenshot.png');
    } catch (e) {
      console.log('Could not take error screenshot:', e.message);
    }
  } finally {
    await browser.close();
  }
}

checkLayerValidation().catch(console.error);
