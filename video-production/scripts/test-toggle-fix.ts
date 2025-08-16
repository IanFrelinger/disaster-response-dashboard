import { chromium, Browser, BrowserContext, Page } from 'playwright';

async function testToggleFix() {
  console.log('🧪 Testing toggle interactions...');
  
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
    
    // Wait for layer controls to appear
    await page.waitForSelector('.layer-controls', { timeout: 10000 });
    console.log('✅ Layer controls found');
    
    // Test hazards toggle using JavaScript
    console.log('\n🔧 Testing hazards toggle with JavaScript...');
    const hazardsResult = await page.evaluate(() => {
      // Find elements containing "Hazards"
      const elements = Array.from(document.querySelectorAll('*'));
      const hazardsElements = elements.filter(el => 
        el.textContent && el.textContent.includes('Hazards')
      );
      
      if (hazardsElements.length > 0) {
        const firstHazard = hazardsElements[0] as HTMLElement;
        console.log(`Found hazards element: "${firstHazard.textContent?.trim()}"`);
        firstHazard.click();
        return 'clicked-hazards';
      }
      
      // Try clicking on layer controls
      const layerControls = document.querySelector('.layer-controls');
      if (layerControls) {
        (layerControls as HTMLElement).click();
        return 'clicked-layer-controls';
      }
      
      return 'no-hazards-found';
    });
    console.log(`✅ Hazards result: ${hazardsResult}`);
    
    await page.waitForTimeout(2000);
    
    // Test weather toggle using JavaScript
    console.log('\n🔧 Testing weather toggle with JavaScript...');
    const weatherResult = await page.evaluate(() => {
      // Find elements containing "Weather"
      const elements = Array.from(document.querySelectorAll('*'));
      const weatherElements = elements.filter(el => 
        el.textContent && el.textContent.includes('Weather')
      );
      
      if (weatherElements.length > 0) {
        const firstWeather = weatherElements[0] as HTMLElement;
        console.log(`Found weather element: "${firstWeather.textContent?.trim()}"`);
        firstWeather.click();
        return 'clicked-weather';
      }
      
      return 'no-weather-found';
    });
    console.log(`✅ Weather result: ${weatherResult}`);
    
    await page.waitForTimeout(2000);
    
    // Test evac zones toggle using JavaScript
    console.log('\n🔧 Testing evac zones toggle with JavaScript...');
    const evacResult = await page.evaluate(() => {
      // Find elements containing "Evac Zones"
      const elements = Array.from(document.querySelectorAll('*'));
      const evacElements = elements.filter(el => 
        el.textContent && el.textContent.includes('Evac Zones')
      );
      
      if (evacElements.length > 0) {
        const firstEvac = evacElements[0] as HTMLElement;
        console.log(`Found evac zones element: "${firstEvac.textContent?.trim()}"`);
        firstEvac.click();
        return 'clicked-evac-zones';
      }
      
      return 'no-evac-zones-found';
    });
    console.log(`✅ Evac zones result: ${evacResult}`);
    
    await page.waitForTimeout(2000);
    
    // Take a screenshot
    await page.screenshot({ path: 'toggle-test-result.png', fullPage: true });
    console.log('\n📸 Screenshot saved as toggle-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take a screenshot on error
    if (page) {
      await page.screenshot({ path: 'toggle-test-error.png', fullPage: true });
      console.log('📸 Error screenshot saved as toggle-test-error.png');
    }
  } finally {
    // Clean up
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

// Run the test
testToggleFix().catch(console.error);
