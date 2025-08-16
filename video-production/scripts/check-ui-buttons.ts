import { chromium, Browser, BrowserContext, Page } from 'playwright';

async function checkUIButtons() {
  console.log('🔍 Checking available UI buttons and elements...');
  
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
    
    // Check buttons on main page
    console.log('\n📋 Buttons on main page:');
    const mainButtons = await page.$$eval('button', buttons => 
      buttons.map(btn => ({
        text: btn.textContent?.trim(),
        className: btn.className,
        id: btn.id
      }))
    );
    mainButtons.forEach(btn => console.log(`  - "${btn.text}" (class: ${btn.className}, id: ${btn.id})`));
    
    // Switch to Live Map
    await page.click('button:has-text("Live Map")');
    await page.waitForTimeout(3000);
    console.log('\n✅ Switched to Live Map');
    
    // Check buttons on map page
    console.log('\n📋 Buttons on map page:');
    const mapButtons = await page.$$eval('button', buttons => 
      buttons.map(btn => ({
        text: btn.textContent?.trim(),
        className: btn.className,
        id: btn.id
      }))
    );
    mapButtons.forEach(btn => console.log(`  - "${btn.text}" (class: ${btn.className}, id: ${btn.id})`));
    
    // Check for any layer controls or toggles
    console.log('\n🔍 Looking for layer controls:');
    const layerElements = await page.$$eval('[class*="layer"], [class*="toggle"], [class*="control"], [class*="switch"]', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        text: el.textContent?.trim(),
        className: el.className,
        id: el.id
      }))
    );
    layerElements.forEach(el => console.log(`  - ${el.tagName}: "${el.text}" (class: ${el.className}, id: ${el.id})`));
    
    // Check for any divs with relevant text
    console.log('\n🔍 Looking for divs with layer-related text:');
    const relevantDivs = await page.$$eval('div', divs => 
      divs
        .filter(div => {
          const text = div.textContent?.toLowerCase() || '';
          return text.includes('hazard') || text.includes('weather') || text.includes('zone') || 
                 text.includes('layer') || text.includes('toggle') || text.includes('control');
        })
        .map(div => ({
          text: div.textContent?.trim(),
          className: div.className,
          id: div.id
        }))
    );
    relevantDivs.forEach(div => console.log(`  - "${div.text}" (class: ${div.className}, id: ${div.id})`));
    
    // Take a screenshot
    await page.screenshot({ path: 'ui-check.png', fullPage: true });
    console.log('\n📸 Screenshot saved as ui-check.png');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    // Clean up
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

// Run the check
checkUIButtons().catch(console.error);
