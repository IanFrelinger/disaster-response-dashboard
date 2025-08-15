import { chromium, Browser, Page } from 'playwright';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFrontendButtons() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Frontend loaded successfully');
    
    // Wait a bit for the page to fully render
    await page.waitForTimeout(3000);
    
    // Check what buttons are visible
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`Button ${i + 1}: "${text?.trim()}" - Visible: ${isVisible}`);
    }
    
    // Try to find specific navigation buttons
    console.log('\n🔍 Looking for specific navigation buttons:');
    
    const operationsButton = await page.$('text=Operations');
    console.log(`Operations button: ${operationsButton ? 'Found' : 'Not found'}`);
    
    const routingButton = await page.$('text=🛣️ Routing');
    console.log(`Routing button: ${routingButton ? 'Found' : 'Not found'}`);
    
    const unitsButton = await page.$('text=🚒 Units');
    console.log(`Units button: ${unitsButton ? 'Found' : 'Not found'}`);
    
    const architectureButton = await page.$('text=🏗️ Architecture');
    console.log(`Architecture button: ${architectureButton ? 'Found' : 'Not found'}`);
    
    const aipButton = await page.$('text=AIP Commander');
    console.log(`AIP Commander button: ${aipButton ? 'Found' : 'Not found'}`);
    
    // Take a screenshot
    await page.screenshot({ path: path.join(__dirname, '..', 'output', 'frontend-test.png'), fullPage: true });
    console.log('📸 Screenshot saved as frontend-test.png');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testFrontendButtons().catch(console.error);
