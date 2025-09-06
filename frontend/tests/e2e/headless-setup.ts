/**
 * HEADLESS MODE GLOBAL SETUP
 * 
 * This file sets up the environment for headless mode testing.
 * It ensures the development server is running and validates the setup.
 */

import { chromium, firefox, webkit } from '@playwright/test';

async function globalSetup() {
  console.log('🚀 Setting up headless mode testing environment...');
  
  // Check if dev server is accessible
  const devServerUrl = 'http://localhost:3001';
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!serverReady && attempts < maxAttempts) {
    try {
      const response = await fetch(devServerUrl);
      if (response.ok) {
        serverReady = true;
        console.log('✅ Development server is accessible');
      }
    } catch (error) {
      attempts++;
      console.log(`⏳ Waiting for dev server... (attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!serverReady) {
    throw new Error(`Development server not accessible after ${maxAttempts} attempts`);
  }
  
  // Validate browser compatibility in headless mode
  console.log('🔍 Validating browser compatibility in headless mode...');
  
  // Test Chromium headless
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Test basic navigation
    await page.goto(devServerUrl);
    await page.waitForLoadState('networkidle');
    
    // Check if page title is set
    const title = await page.title();
    console.log(`✅ Chromium headless: Page title "${title}"`);
    
    await context.close();
    await browser.close();
  } catch (error) {
    console.error('❌ Chromium headless test failed:', error);
    throw error;
  }
  
  // Test Firefox headless
  try {
    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(devServerUrl);
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log(`✅ Firefox headless: Page title "${title}"`);
    
    await context.close();
    await browser.close();
  } catch (error) {
    console.error('❌ Firefox headless test failed:', error);
    throw error;
  }
  
  // Test WebKit headless
  try {
    const browser = await webkit.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(devServerUrl);
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log(`✅ WebKit headless: Page title "${title}"`);
    
    await context.close();
    await browser.close();
  } catch (error) {
    console.error('❌ WebKit headless test failed:', error);
    throw error;
  }
  
  console.log('🎯 Headless mode testing environment ready!');
  console.log('📋 All browsers validated for headless operation');
}

export default globalSetup;
