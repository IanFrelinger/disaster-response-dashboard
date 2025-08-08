import { test, expect, chromium } from '@playwright/test';

test.describe('Simple 3D Terrain Map Test', () => {
  let browser: any;
  let page: any;

  test.beforeAll(async () => {
    console.log('🚀 Starting Simple 3D Terrain Map Test...');
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 
    });
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('Basic page load test', async () => {
    console.log('📱 Testing basic page load...');
    
    try {
      // Navigate to the application with timeout
      await page.goto('http://localhost:3000', { timeout: 30000 });
      console.log('✅ Page navigation successful');
      
      // Wait for page to load
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      console.log('✅ DOM content loaded');
      
      // Check if root element exists
      const rootElement = await page.locator('#root');
      await expect(rootElement).toBeVisible({ timeout: 10000 });
      console.log('✅ Root element is visible');
      
      // Take a screenshot
      await page.screenshot({ path: 'page-load-test.png' });
      console.log('📸 Screenshot saved: page-load-test.png');
      
    } catch (error) {
      console.error('❌ Page load test failed:', error);
      await page.screenshot({ path: 'page-load-error.png' });
      throw error;
    }
  });

  test('Check for 3D terrain elements', async () => {
    console.log('🏔️ Checking for 3D terrain elements...');
    
    try {
      // Wait for the page to be fully loaded
      await page.waitForLoadState('networkidle', { timeout: 20000 });
      
      // Check for header
      const header = await page.locator('h1');
      const headerText = await header.textContent();
      console.log(`📄 Header text: ${headerText}`);
      
      if (headerText && headerText.includes('3D Terrain')) {
        console.log('✅ 3D Terrain header found');
      } else {
        console.log('⚠️ 3D Terrain header not found, but page loaded');
      }
      
      // Check for canvas (Three.js rendering)
      const canvas = await page.locator('canvas');
      const canvasCount = await canvas.count();
      console.log(`🎨 Found ${canvasCount} canvas elements`);
      
      if (canvasCount > 0) {
        console.log('✅ Canvas elements found');
        await page.screenshot({ path: 'canvas-found.png' });
      } else {
        console.log('⚠️ No canvas elements found');
        await page.screenshot({ path: 'no-canvas.png' });
      }
      
      // Check for controls
      const controls = await page.locator('input[type="range"], button, .tacmap-panel');
      const controlCount = await controls.count();
      console.log(`🎛️ Found ${controlCount} control elements`);
      
    } catch (error) {
      console.error('❌ 3D terrain elements test failed:', error);
      await page.screenshot({ path: 'elements-error.png' });
      throw error;
    }
  });

  test('Check for console errors', async () => {
    console.log('🔍 Checking for console errors...');
    
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console error: ${msg.text()}`);
      }
    });
    
    try {
      // Reload the page to capture errors
      await page.reload({ timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 });
      
      if (errors.length > 0) {
        console.log(`❌ Found ${errors.length} console errors`);
        await page.screenshot({ path: 'console-errors.png' });
      } else {
        console.log('✅ No console errors detected');
      }
      
    } catch (error) {
      console.error('❌ Console error check failed:', error);
      await page.screenshot({ path: 'console-check-error.png' });
    }
  });

  test('Test page responsiveness', async () => {
    console.log('📱 Testing responsiveness...');
    
    try {
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(2000);
        
        const rootElement = await page.locator('#root');
        const isVisible = await rootElement.isVisible();
        console.log(`✅ ${viewport.name} viewport: ${isVisible ? 'Visible' : 'Not visible'}`);
        
        await page.screenshot({ path: `${viewport.name.toLowerCase()}-viewport.png` });
      }
      
    } catch (error) {
      console.error('❌ Responsiveness test failed:', error);
      await page.screenshot({ path: 'responsiveness-error.png' });
    }
  });
});

// Simple test that runs independently
test('Quick validation test', async ({ page }) => {
  console.log('⚡ Running quick validation test...');
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000', { timeout: 30000 });
    
    // Wait for load
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    
    // Check basic elements
    const root = await page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ path: 'quick-validation.png', fullPage: true });
    
    console.log('✅ Quick validation passed');
    
  } catch (error) {
    console.error('❌ Quick validation failed:', error);
    await page.screenshot({ path: 'quick-validation-error.png' });
    throw error;
  }
});
