#!/usr/bin/env ts-node

import { chromium } from 'playwright';

async function debugFrontend() {
  console.log('🔍 Debugging frontend navigation...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './debug-captures' }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Navigating to frontend...');
    await page.goto('http://localhost:3000', { timeout: 15000 });
    console.log('✅ Navigation successful');
    
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('✅ Page loaded');
    
    // Wait for React to render
    await page.waitForTimeout(5000);
    console.log('✅ Waited for React render');
    
    // Take a screenshot to see what's actually there
    await page.screenshot({ path: './debug-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved');
    
    // Check what elements are available
    const elements = await page.$$('*');
    console.log(`🔍 Found ${elements.length} elements on page`);
    
    // Look for specific elements
    const textElements = await page.$$('text=/.*/');
    console.log(`📝 Found ${textElements.length} text elements`);
    
    // Check for React root
    const root = await page.$('#root');
    if (root) {
      console.log('✅ React root found');
      const rootContent = await root.innerHTML();
      console.log('📄 Root content length:', rootContent.length);
    } else {
      console.log('❌ React root not found');
    }
    
    // Try to find navigation elements
    const navElements = await page.$$('[class*="nav"], [class*="menu"], [class*="dashboard"]');
    console.log(`🧭 Found ${navElements.length} navigation elements`);
    
    // Wait for user to see the page
    console.log('⏳ Waiting 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error during navigation:', error);
  } finally {
    await browser.close();
  }
}

debugFrontend().catch(console.error);
