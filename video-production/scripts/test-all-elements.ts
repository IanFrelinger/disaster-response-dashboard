import { chromium, Browser, BrowserContext, Page } from 'playwright';

interface ElementTest {
  name: string;
  selector: string;
  type: 'button' | 'input' | 'div' | 'canvas' | 'text';
  expectedText?: string;
  action?: 'click' | 'type' | 'scroll' | 'wait';
  coordinates?: [number, number];
}

async function testAllElements() {
  console.log('🧪 Testing all elements used in Extended Narrative Recorder...');
  
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  
  try {
    // Initialize browser
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#root');
    console.log('✅ App loaded');
    
    // Define all elements to test
    const elementsToTest: ElementTest[] = [
      // Main navigation buttons
      { name: 'Commander Dashboard Button', selector: 'button:has-text("Commander Dashboard")', type: 'button', action: 'click' },
      { name: 'Live Map Button', selector: 'button:has-text("Live Map")', type: 'button', action: 'click' },
      { name: 'Operations Button', selector: 'button:has-text("Operations")', type: 'button', action: 'click' },
      { name: 'Conditions Button', selector: 'button:has-text("Conditions")', type: 'button', action: 'click' },
      { name: 'Assets Button', selector: 'button:has-text("Assets")', type: 'button', action: 'click' },
      { name: 'AIP Commander Button', selector: 'button:has-text("AIP Commander")', type: 'button', action: 'click' },
      
      // Map elements
      { name: 'Map Canvas', selector: '.mapboxgl-canvas', type: 'canvas', action: 'click', coordinates: [960, 540] },
      
      // Layer controls
      { name: 'Layer Controls Container', selector: '.layer-controls', type: 'div', action: 'click' },
      
      // AIP interface elements
      { name: 'AIP Tab', selector: 'button:has-text("AIP")', type: 'button', action: 'click' },
      { name: 'Text Input', selector: 'input[type="text"]', type: 'input', action: 'type' },
      { name: 'Ask Commander Button', selector: 'button:has-text("Ask Commander")', type: 'button', action: 'click' },
      
      // Zone elements (if they exist)
      { name: 'Zone Progress Bar', selector: '.zone-progress-bar', type: 'div', action: 'click' },
      
      // Building elements (if they exist)
      { name: 'Building Card', selector: '.building-card', type: 'div', action: 'click' },
      
      // Route elements (if they exist)
      { name: 'Civilian Evacuation Button', selector: 'button:has-text("CIVILIAN_EVACUATION")', type: 'button', action: 'click' },
      { name: 'EMS Response Button', selector: 'button:has-text("EMS_RESPONSE")', type: 'button', action: 'click' },
      { name: 'Route Card', selector: '.route-card', type: 'div', action: 'click' },
      { name: 'View on Map Button', selector: 'button:has-text("View on Map")', type: 'button', action: 'click' },
      { name: 'Optimize Route Button', selector: 'button:has-text("🔧 Optimize Route")', type: 'button', action: 'click' },
      
      // Unit elements (if they exist)
      { name: 'Fire Engine Unit', selector: '.mapboxgl-canvas', type: 'canvas', action: 'click', coordinates: [850, 450] },
      { name: 'Ambulance Unit', selector: '.mapboxgl-canvas', type: 'canvas', action: 'click', coordinates: [900, 500] },
      
      // Status buttons (if they exist)
      { name: 'Evacuated Button', selector: 'button:has-text("✓ Evacuated")', type: 'button', action: 'click' },
      { name: 'Not Evacuated Button', selector: 'button:has-text("⏳ Not Evacuated")', type: 'button', action: 'click' },
      { name: 'Close Button', selector: 'button:has-text("×")', type: 'button', action: 'click' },
      
      // Foundry elements (if they exist)
      { name: 'Foundry Integration Tab', selector: 'button:has-text("Foundry")', type: 'button', action: 'click' },
      { name: 'Data Fusion Panel', selector: '.foundry-panel', type: 'div', action: 'click' },
      
      // Real-time elements (if they exist)
      { name: 'Real-time Updates Panel', selector: '.real-time-panel', type: 'div', action: 'click' },
      { name: 'WebSocket Status', selector: '.websocket-status', type: 'div', action: 'click' },
      
      // 3D elements (if they exist)
      { name: '3D Buildings Toggle', selector: 'button:has-text("3D Buildings")', type: 'button', action: 'click' },
      { name: 'Terrain Toggle', selector: 'button:has-text("Terrain")', type: 'button', action: 'click' }
    ];
    
    console.log(`\n📋 Testing ${elementsToTest.length} elements...`);
    
    // Test elements on main page first
    console.log('\n🔍 Testing elements on main page...');
    for (const element of elementsToTest) {
      if (element.type === 'button' || element.type === 'input' || element.type === 'div') {
        await testElement(page, element, 'main');
      }
    }
    
    // Switch to Live Map to test map elements
    console.log('\n🔍 Testing elements on Live Map...');
    await page.click('button:has-text("Live Map")');
    await page.waitForTimeout(3000);
    
    // Wait for map to load
    await page.waitForSelector('.mapboxgl-canvas', { timeout: 10000 });
    console.log('✅ Map loaded');
    
    // Test map-specific elements
    for (const element of elementsToTest) {
      if (element.selector.includes('mapboxgl') || element.coordinates) {
        await testElement(page, element, 'map');
      }
    }
    
    // Test layer controls
    await page.waitForSelector('.layer-controls', { timeout: 10000 });
    console.log('✅ Layer controls loaded');
    
    // Test layer toggle elements
    const layerElements = ['Hazards', 'Weather', 'Evac Zones'];
    for (const layer of layerElements) {
      await testLayerElement(page, layer);
    }
    
    // Switch back to dashboard to test other elements
    console.log('\n🔍 Testing elements on Commander Dashboard...');
    await page.click('button:has-text("Commander Dashboard")');
    await page.waitForTimeout(2000);
    
    // Test dashboard elements
    for (const element of elementsToTest) {
      if (element.selector.includes('Commander') || element.selector.includes('AIP') || element.selector.includes('input')) {
        await testElement(page, element, 'dashboard');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'all-elements-test-result.png', fullPage: true });
    console.log('\n📸 Final screenshot saved as all-elements-test-result.png');
    
    console.log('\n🎉 All elements test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take a screenshot on error
    if (page) {
      await page.screenshot({ path: 'all-elements-test-error.png', fullPage: true });
      console.log('📸 Error screenshot saved as all-elements-test-error.png');
    }
  } finally {
    // Clean up
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

async function testElement(page: Page, element: ElementTest, context: string) {
  try {
    const elementHandle = await page.$(element.selector);
    if (elementHandle) {
      console.log(`  ✅ ${element.name} - Found on ${context}`);
      
      // Test interaction if specified
      if (element.action === 'click') {
        try {
          await elementHandle.click();
          console.log(`    ✅ Click successful`);
        } catch (clickError) {
          console.log(`    ⚠️ Click failed: ${clickError.message}`);
        }
      } else if (element.action === 'type' && element.type === 'input') {
        try {
          await elementHandle.fill('Test input');
          console.log(`    ✅ Type successful`);
        } catch (typeError) {
          console.log(`    ⚠️ Type failed: ${typeError.message}`);
        }
      }
    } else {
      console.log(`  ❌ ${element.name} - NOT FOUND on ${context}`);
    }
  } catch (error) {
    console.log(`  ❌ ${element.name} - ERROR testing: ${error.message}`);
  }
}

async function testLayerElement(page: Page, layerName: string) {
  try {
    const result = await page.evaluate((layer) => {
      const elements = Array.from(document.querySelectorAll('*'));
      const layerElements = elements.filter(el => 
        el.textContent && el.textContent.includes(layer)
      );
      
      if (layerElements.length > 0) {
        const firstElement = layerElements[0] as HTMLElement;
        firstElement.click();
        return `clicked-${layer.toLowerCase()}`;
      }
      return `no-${layer.toLowerCase()}-found`;
    }, layerName);
    
    console.log(`  ✅ ${layerName} layer: ${result}`);
  } catch (error) {
    console.log(`  ❌ ${layerName} layer test failed: ${error.message}`);
  }
}

// Run the test
testAllElements().catch(console.error);
