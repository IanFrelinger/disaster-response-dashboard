#!/usr/bin/env ts-node

import { chromium } from 'playwright';

async function debugFrontendDetailed() {
  console.log('🔍 Detailed frontend debugging...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Navigating to frontend...');
    await page.goto('http://localhost:3000', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded successfully');
    
    // Get all text content to see what's available
    const allText = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0)
        .slice(0, 20); // First 20 text elements
    });
    
    console.log('📝 Available text elements:');
    allText.forEach((text, i) => console.log(`  ${i + 1}. "${text}"`));
    
    // Look for specific elements that the script tries to interact with
    const selectors = [
      'text=Commander Dashboard',
      'text=Dashboard',
      'text=Live Map',
      'text=Main',
      'text=Overview',
      '[class*="main"]',
      '[class*="overview"]',
      '[class*="dashboard"]',
      '[class*="nav"]',
      '[class*="menu"]'
    ];
    
    console.log('\n🔍 Testing selectors:');
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`  ${selector}: ${elements.length} elements found`);
        if (elements.length > 0) {
          const text = await elements[0].textContent();
          console.log(`    Text: "${text?.trim()}"`);
        }
      } catch (error) {
        console.log(`  ${selector}: Error - ${error}`);
      }
    }
    
    // Try to click on elements that might be available
    console.log('\n🖱️ Testing clicks:');
    
    // Try clicking on any clickable element
    const clickableElements = await page.$$('button, a, [role="button"], [tabindex]');
    console.log(`Found ${clickableElements.length} potentially clickable elements`);
    
    if (clickableElements.length > 0) {
      const firstElement = clickableElements[0];
      const tagName = await firstElement.evaluate(el => el.tagName);
      const text = await firstElement.textContent();
      console.log(`First clickable element: <${tagName}> "${text?.trim()}"`);
      
      try {
        await firstElement.click();
        console.log('✅ Successfully clicked first element');
        await page.waitForTimeout(2000);
      } catch (error) {
        console.log(`❌ Click failed: ${error}`);
      }
    }
    
    // Take another screenshot after interaction
    await page.screenshot({ path: './debug-after-click.png', fullPage: true });
    console.log('📸 Screenshot after click saved');
    
    // Wait for manual inspection
    console.log('\n⏳ Waiting 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugFrontendDetailed().catch(console.error);
