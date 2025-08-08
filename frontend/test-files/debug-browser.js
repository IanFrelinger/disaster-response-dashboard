/**
 * Debug Browser Console Errors
 * Simple script to check what's causing the white screen
 */

import puppeteer from 'puppeteer';

async function debugBrowser() {
  console.log('🔍 Starting browser debug...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    // Listen for page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    console.log('🌐 Navigating to http://localhost:3001/...');
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    
    console.log('📋 Console messages:');
    consoleMessages.forEach(msg => {
      console.log(`  ${msg.type.toUpperCase()}: ${msg.text}`);
    });
    
    console.log('❌ Page errors:');
    pageErrors.forEach(error => {
      console.log(`  ERROR: ${error}`);
    });
    
    // Check page content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log(`📄 Body text length: ${bodyText?.length || 0}`);
    
    const hasContent = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3, p, div');
      return elements.length;
    });
    console.log(`📦 Content elements found: ${hasContent}`);
    
    // Check for React root
    const reactRoot = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.length : 0;
    });
    console.log(`⚛️ React root content length: ${reactRoot}`);
    
    if (pageErrors.length > 0) {
      console.log('\n🚨 FOUND ERRORS! These are likely causing the white screen:');
      pageErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('\n✅ No JavaScript errors found');
    }
    
    // Wait a bit to see if anything loads
    console.log('⏳ Waiting 5 seconds to see if content loads...');
    await page.waitForTimeout(5000);
    
    // Take another screenshot
    await page.screenshot({ path: 'debug-homepage-after-wait.png', fullPage: true });
    
    console.log('✅ Debug complete! Check the screenshots for visual confirmation.');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugBrowser();
