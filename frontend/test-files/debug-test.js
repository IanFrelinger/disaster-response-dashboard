import { chromium } from 'playwright';

async function debugReactApp() {
  console.log('🔍 Debugging React App Loading...');
  
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 
    });
    
    page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', (msg) => {
      console.log(`📝 Console [${msg.type()}]: ${msg.text()}`);
    });
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      console.log(`❌ Page Error: ${error.message}`);
    });
    
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:3000', { timeout: 30000 });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    
    // Check if root element exists
    const rootElement = await page.locator('#root');
    const rootExists = await rootElement.count() > 0;
    console.log(`🏗️ Root element exists: ${rootExists}`);
    
    if (rootExists) {
      const rootVisible = await rootElement.isVisible();
      console.log(`👁️ Root element visible: ${rootVisible}`);
      
      // Check root content
      const rootHTML = await rootElement.innerHTML();
      console.log(`📄 Root HTML content: "${rootHTML.substring(0, 200)}..."`);
    }
    
    // Wait for React to potentially load
    console.log('⏳ Waiting for React to load...');
    await page.waitForTimeout(5000);
    
    // Check again after waiting
    const rootElementAfter = await page.locator('#root');
    const rootHTMLAfter = await rootElementAfter.innerHTML();
    console.log(`📄 Root HTML after wait: "${rootHTMLAfter.substring(0, 200)}..."`);
    
    // Check for any script errors
    const scripts = await page.locator('script');
    const scriptCount = await scripts.count();
    console.log(`📜 Script elements found: ${scriptCount}`);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-test.png', fullPage: true });
    console.log('📸 Debug screenshot saved: debug-test.png');
    
    // Check if any React-related elements are present
    const reactElements = await page.locator('[data-reactroot], [class*="react"], [class*="app"]');
    const reactCount = await reactElements.count();
    console.log(`⚛️ React-related elements: ${reactCount}`);
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    if (page) {
      await page.screenshot({ path: 'debug-error.png' });
      console.log('📸 Error screenshot saved: debug-error.png');
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

debugReactApp().catch(console.error);
