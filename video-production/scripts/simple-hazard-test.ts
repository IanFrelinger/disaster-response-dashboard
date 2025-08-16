import { chromium, Browser, BrowserContext, Page } from 'playwright';

async function testHazardBeat() {
  console.log('🧪 Testing hazard beat interactions...');
  
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
    
    // Test click on hazard marker
    console.log('🔧 Testing click on hazard marker...');
    const clickResult = await page.evaluate(() => {
      // Method 1: Try to find and click on any map marker
      const markers = document.querySelectorAll('.mapboxgl-marker');
      if (markers.length > 0) {
        console.log(`Found ${markers.length} map markers, clicking first one`);
        const firstMarker = markers[0] as HTMLElement;
        firstMarker.click();
        return 'clicked-marker';
      }
      return 'no-markers-found';
    });
    console.log(`✅ Click result: ${clickResult}`);
    
    await page.waitForTimeout(2000);
    
    // Test hover over hazard
    console.log('🔧 Testing hover over hazard...');
    const hoverResult = await page.evaluate(() => {
      // Method 1: Try to find and hover over any map marker
      const markers = document.querySelectorAll('.mapboxgl-marker');
      if (markers.length > 0) {
        console.log(`Found ${markers.length} map markers, hovering over first one`);
        const firstMarker = markers[0] as HTMLElement;
        const hoverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
        firstMarker.dispatchEvent(hoverEvent);
        return 'hovered-marker';
      }
      return 'no-markers-found';
    });
    console.log(`✅ Hover result: ${hoverResult}`);
    
    await page.waitForTimeout(2000);
    
    // Test layer toggles
    console.log('🔧 Testing layer toggles...');
    const toggleResults = await page.evaluate(() => {
      const results = [];
      
      // Test hazards toggle
      const hazardsElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('Hazards')
      );
      if (hazardsElements.length > 0) {
        (hazardsElements[0] as HTMLElement).click();
        results.push('hazards-clicked');
      } else {
        results.push('hazards-not-found');
      }
      
      // Test weather toggle
      const weatherElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('Weather')
      );
      if (weatherElements.length > 0) {
        (weatherElements[0] as HTMLElement).click();
        results.push('weather-clicked');
      } else {
        results.push('weather-not-found');
      }
      
      // Test evac zones toggle
      const evacElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('Evac Zones')
      );
      if (evacElements.length > 0) {
        (evacElements[0] as HTMLElement).click();
        results.push('evac-zones-clicked');
      } else {
        results.push('evac-zones-not-found');
      }
      
      return results;
    });
    console.log(`✅ Toggle results: ${toggleResults.join(', ')}`);
    
    await page.waitForTimeout(2000);
    
    // Take a screenshot
    await page.screenshot({ path: 'hazard-test-result.png', fullPage: true });
    console.log('\n📸 Screenshot saved as hazard-test-result.png');
    
    console.log('\n🎉 Hazard beat test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take a screenshot on error
    if (page) {
      await page.screenshot({ path: 'hazard-test-error.png', fullPage: true });
      console.log('📸 Error screenshot saved as hazard-test-error.png');
    }
  } finally {
    // Clean up
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

// Run the test
testHazardBeat().catch(console.error);
