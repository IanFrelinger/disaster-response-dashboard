/**
 * Debug Foundry Pages
 * Check what's actually happening on the failing Foundry pages
 */

import puppeteer from 'puppeteer';

async function debugFoundryPages() {
  console.log('🔍 Debugging Foundry Pages...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages and errors
    const consoleMessages = [];
    const pageErrors = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Test Foundry 3D Demo page
    console.log('\n🌐 Testing Foundry 3D Demo page...');
    await page.goto('http://localhost:3001/foundry-terrain', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check page content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log(`📄 Body text length: ${bodyText?.length || 0}`);
    console.log(`📄 Body text preview: ${bodyText?.substring(0, 200)}...`);
    
    // Check for specific elements
    const hasH1 = await page.evaluate(() => document.querySelectorAll('h1').length);
    const hasH2 = await page.evaluate(() => document.querySelectorAll('h2').length);
    const hasDiv = await page.evaluate(() => document.querySelectorAll('div').length);
    
    console.log(`📦 Elements found: H1=${hasH1}, H2=${hasH2}, Div=${hasDiv}`);
    
    // Check for React root content
    const reactRoot = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.length : 0;
    });
    console.log(`⚛️ React root content length: ${reactRoot}`);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-foundry-3d-demo.png', fullPage: true });
    
    // Test Foundry Test page
    console.log('\n🌐 Testing Foundry Test page...');
    await page.goto('http://localhost:3001/foundry-test', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const bodyText2 = await page.evaluate(() => document.body.textContent);
    console.log(`📄 Body text length: ${bodyText2?.length || 0}`);
    console.log(`📄 Body text preview: ${bodyText2?.substring(0, 200)}...`);
    
    const hasH1_2 = await page.evaluate(() => document.querySelectorAll('h1').length);
    const hasH2_2 = await page.evaluate(() => document.querySelectorAll('h2').length);
    const hasDiv_2 = await page.evaluate(() => document.querySelectorAll('div').length);
    
    console.log(`📦 Elements found: H1=${hasH1_2}, H2=${hasH2_2}, Div=${hasDiv_2}`);
    
    const reactRoot2 = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.length : 0;
    });
    console.log(`⚛️ React root content length: ${reactRoot2}`);
    
    await page.screenshot({ path: 'debug-foundry-test.png', fullPage: true });
    
    // Check for errors
    console.log('\n📋 Console messages:');
    consoleMessages.forEach(msg => {
      console.log(`  ${msg.type.toUpperCase()}: ${msg.text}`);
    });
    
    console.log('\n❌ Page errors:');
    pageErrors.forEach(error => {
      console.log(`  ERROR: ${error}`);
    });
    
    // Check for loading states or error states
    const loadingElements = await page.evaluate(() => {
      const loading = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
      const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
      return {
        loading: loading.length,
        errors: errorElements.length
      };
    });
    
    console.log(`\n🔄 Loading elements: ${loadingElements.loading}`);
    console.log(`❌ Error elements: ${loadingElements.errors}`);
    
    if (pageErrors.length > 0) {
      console.log('\n🚨 FOUND ERRORS! These are likely causing the page issues:');
      pageErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('\n✅ No JavaScript errors found');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugFoundryPages();
