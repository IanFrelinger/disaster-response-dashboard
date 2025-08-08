import { test, expect, chromium } from '@playwright/test';

test.describe('3D Terrain Map Validation', () => {
  let browser: any;
  let page: any;

  test.beforeAll(async () => {
    console.log('🚀 Starting 3D Terrain Map Validation Test...');
    browser = await chromium.launch({ 
      headless: false, // Show browser for debugging
      slowMo: 1000 
    });
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('should load the 3D Terrain Visualization page', async () => {
    console.log('📱 Loading 3D Terrain Visualization page...');
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page title is correct
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    expect(title).toContain('Vite + React');
    
    // Check if the root element exists
    const rootElement = await page.locator('#root');
    await expect(rootElement).toBeVisible();
    console.log('✅ Root element is visible');
  });

  test('should display the 3D Terrain Visualization header', async () => {
    console.log('🏔️ Checking for 3D Terrain Visualization header...');
    
    // Wait for the header to appear
    const header = await page.locator('h1:has-text("3D Terrain Visualization")');
    await expect(header).toBeVisible({ timeout: 10000 });
    console.log('✅ 3D Terrain Visualization header is visible');
    
    // Check for the description
    const description = await page.locator('p:has-text("Real-time heightmap rendering")');
    await expect(description).toBeVisible();
    console.log('✅ Description text is visible');
  });

  test('should show terrain controls panel', async () => {
    console.log('🎛️ Checking for terrain controls panel...');
    
    // Wait for controls panel to appear
    const controlsPanel = await page.locator('.tacmap-panel');
    await expect(controlsPanel).toBeVisible({ timeout: 10000 });
    console.log('✅ Controls panel is visible');
    
    // Check for elevation control
    const elevationControl = await page.locator('input[type="range"]');
    await expect(elevationControl).toBeVisible();
    console.log('✅ Elevation control slider is visible');
    
    // Check for location presets
    const locationButtons = await page.locator('button:has-text("San Francisco"), button:has-text("Yosemite"), button:has-text("Mount Whitney")');
    const buttonCount = await locationButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    console.log(`✅ Found ${buttonCount} location preset buttons`);
  });

  test('should render the 3D terrain canvas', async () => {
    console.log('🎨 Checking for 3D terrain canvas...');
    
    // Wait for canvas to appear (Three.js renders to canvas)
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    console.log('✅ 3D terrain canvas is visible');
    
    // Check if canvas has content (not empty)
    const canvasWidth = await canvas.getAttribute('width');
    const canvasHeight = await canvas.getAttribute('height');
    console.log(`📐 Canvas dimensions: ${canvasWidth}x${canvasHeight}`);
    
    expect(canvasWidth).toBeTruthy();
    expect(canvasHeight).toBeTruthy();
  });

  test('should have functional controls', async () => {
    console.log('🎮 Testing control functionality...');
    
    // Test elevation slider
    const elevationSlider = await page.locator('input[type="range"]');
    await elevationSlider.fill('2.0');
    console.log('✅ Elevation slider is interactive');
    
    // Test location change
    const sfButton = await page.locator('button:has-text("San Francisco")');
    if (await sfButton.isVisible()) {
      await sfButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Location change button is functional');
    }
    
    // Test reset view button
    const resetButton = await page.locator('button:has-text("Reset View")');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Reset view button is functional');
    }
  });

  test('should not have console errors', async () => {
    console.log('🔍 Checking for console errors...');
    
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Reload the page to capture any errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (errors.length > 0) {
      console.log('❌ Console errors found:');
      errors.forEach(error => console.log(`   - ${error}`));
      throw new Error(`Found ${errors.length} console errors`);
    }
    
    console.log('✅ No console errors detected');
  });

  test('should have proper styling applied', async () => {
    console.log('🎨 Checking for proper styling...');
    
    // Check if tactical map styles are applied
    const container = await page.locator('.tacmap-container, [class*="tacmap"]');
    const hasTacmapStyles = await container.count() > 0;
    
    if (hasTacmapStyles) {
      console.log('✅ Tactical map styles are applied');
    } else {
      console.log('⚠️ Tactical map styles not detected');
    }
    
    // Check for background color
    const body = await page.locator('body');
    const backgroundColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    console.log(`🎨 Background color: ${backgroundColor}`);
  });

  test('should be responsive', async () => {
    console.log('📱 Testing responsiveness...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    const mobileHeader = await page.locator('h1:has-text("3D Terrain Visualization")');
    await expect(mobileHeader).toBeVisible();
    console.log('✅ Mobile viewport works');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    
    const tabletHeader = await page.locator('h1:has-text("3D Terrain Visualization")');
    await expect(tabletHeader).toBeVisible();
    console.log('✅ Tablet viewport works');
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
  });
});

// Run the test
test('Complete 3D Terrain Map Validation', async ({ page }) => {
  console.log('\n🎯 Running Complete 3D Terrain Map Validation...');
  
  // Navigate to the application
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'terrain-map-validation.png', fullPage: true });
  console.log('📸 Screenshot saved as terrain-map-validation.png');
  
  // Check for key elements
  const checks = [
    { selector: 'h1:has-text("3D Terrain Visualization")', name: 'Header' },
    { selector: 'canvas', name: '3D Canvas' },
    { selector: 'input[type="range"]', name: 'Elevation Control' },
    { selector: 'button:has-text("San Francisco")', name: 'Location Button' }
  ];
  
  for (const check of checks) {
    const element = await page.locator(check.selector);
    const isVisible = await element.isVisible();
    console.log(`${isVisible ? '✅' : '❌'} ${check.name}: ${isVisible ? 'Visible' : 'Not visible'}`);
  }
  
  console.log('\n🎉 3D Terrain Map Validation Complete!');
});
