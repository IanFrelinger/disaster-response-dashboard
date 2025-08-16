import { chromium, Browser, BrowserContext, Page } from 'playwright';

async function testHoverInteraction() {
  console.log('🧪 Testing hover interaction directly...');
  
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
    
    // Switch to Live Map
    await page.click('button:has-text("Live Map")');
    await page.waitForTimeout(3000);
    console.log('✅ Switched to Live Map');
    
    // Wait for map markers
    console.log('🔧 Waiting for map markers...');
    await page.waitForSelector('.mapboxgl-canvas', { timeout: 10000 });
    console.log('✅ Map canvas found');
    
    await page.waitForFunction(() => {
      const markers = document.querySelectorAll('.mapboxgl-marker');
      console.log(`Found ${markers.length} map markers`);
      return markers.length > 0;
    }, { timeout: 15000 });
    console.log('✅ Map markers found');
    
    await page.waitForTimeout(2000);
    
    // Test the hover interaction using our improved JavaScript approach
    console.log('🔧 Testing hover interaction...');
    const result = await page.evaluate(() => {
      // Method 1: Try to find and hover over any map marker
      const markers = document.querySelectorAll('.mapboxgl-marker');
      if (markers.length > 0) {
        console.log(`Found ${markers.length} map markers, hovering over first one`);
        const firstMarker = markers[0] as HTMLElement;
        const hoverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
        firstMarker.dispatchEvent(hoverEvent);
        return 'hovered-marker';
      }
      
      // Method 2: Try to find hazard-related elements
      const hazardElements = document.querySelectorAll('[class*="hazard"], [class*="marker"], [class*="fire"]');
      if (hazardElements.length > 0) {
        console.log(`Found ${hazardElements.length} hazard elements, hovering over first one`);
        const firstHazard = hazardElements[0] as HTMLElement;
        const hoverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
        firstHazard.dispatchEvent(hoverEvent);
        return 'hovered-hazard';
      }
      
      // Method 3: Simulate a hover event at coordinates
      const canvas = document.querySelector('.mapboxgl-canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const hoverEvent = new MouseEvent('mouseover', {
          clientX: rect.left + 960,
          clientY: rect.top + 540,
          bubbles: true,
          cancelable: true
        });
        canvas.dispatchEvent(hoverEvent);
        return 'dispatched-hover';
      }
      
      return 'no-hover-possible';
    });
    
    console.log(`✅ Hover result: ${result}`);
    
    // Wait a bit to see if any tooltips appear
    await page.waitForTimeout(3000);
    
    // Take a screenshot to see the result
    await page.screenshot({ path: 'hover-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved as hover-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take a screenshot on error
    if (page) {
      await page.screenshot({ path: 'hover-test-error.png', fullPage: true });
      console.log('📸 Error screenshot saved as hover-test-error.png');
    }
  } finally {
    // Clean up
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

// Run the test
testHoverInteraction().catch(console.error);
