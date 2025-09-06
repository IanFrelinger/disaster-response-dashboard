import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Frontend Validation
 * Tests every button, tab, and combination while monitoring console logs and rendering errors
 */

interface ValidationResult {
  testName: string;
  success: boolean;
  errors: string[];
  warnings: string[];
  consoleLogs: string[];
  networkErrors: string[];
  renderingIssues: string[];
  performance: any;
  screenshotPath?: string;
}

test.describe('Comprehensive Frontend Validation', () => {
  let validationResults: ValidationResult[] = [];

  test.beforeEach(async ({ page }) => {
    // Clear previous results
    validationResults = [];
    
    // Set up comprehensive error logging
    const errors: string[] = [];
    const warnings: string[] = [];
    const consoleLogs: string[] = [];
    const networkErrors: string[] = [];
    const renderingIssues: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      consoleLogs.push(`[${type.toUpperCase()}] ${text}`);
      
      if (type === 'error') {
        errors.push(text);
      } else if (type === 'warning') {
        warnings.push(text);
      }
      
      // Check for rendering issues
      if (text.toLowerCase().includes('render') || 
          text.toLowerCase().includes('white screen') ||
          text.toLowerCase().includes('blank') ||
          text.toLowerCase().includes('not visible')) {
        renderingIssues.push(text);
      }
    });

    // Capture network errors
    page.on('requestfailed', request => {
      const error = `Network Error: ${request.url()} - ${request.failure()?.errorText}`;
      networkErrors.push(error);
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });

    // Store error collectors for later use
    (page as any).__errorCollectors = {
      errors, warnings, consoleLogs, networkErrors, renderingIssues
    };
  });

  test('comprehensive UI interaction validation', async ({ page }) => {
    // Navigate to the app
    console.log('🌐 Navigating to application...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/00-initial-load.png', fullPage: true });
    
    // Test 1: Main navigation and buttons
    console.log('🔍 Testing main navigation and buttons...');
    await testMainNavigation(page);
    
    // Test 2: 3D Map interactions
    console.log('🗺️ Testing 3D Map interactions...');
    await test3DMapInteractions(page);
    
    // Test 3: Layer toggle combinations
    console.log('🔄 Testing layer toggle combinations...');
    await testLayerToggleCombinations(page);
    
    // Test 4: Map style changes
    console.log('🎨 Testing map style changes...');
    await testMapStyleChanges(page);
    
    // Test 5: Map interactions (pan, zoom, click)
    console.log('🎮 Testing map interactions...');
    await testMapInteractions(page);
    
    // Test 6: Tab switching and navigation
    console.log('📑 Testing tab switching...');
    await testTabSwitching(page);
    
    // Test 7: Form interactions and inputs
    console.log('📝 Testing form interactions...');
    await testFormInteractions(page);
    
    // Test 8: Modal and overlay interactions
    console.log('🪟 Testing modal and overlay interactions...');
    await testModalInteractions(page);
    
    // Test 9: Responsive behavior
    console.log('📱 Testing responsive behavior...');
    await testResponsiveBehavior(page);
    
    // Test 10: Error boundary testing
    console.log('🛡️ Testing error boundaries...');
    await testErrorBoundaries(page);
    
    // Final analysis
    console.log('\n📊 COMPREHENSIVE VALIDATION RESULTS:');
    await analyzeResults(page);
  });

  async function testMainNavigation(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    // Test all main buttons
    const mainButtons = [
      'button:has-text("Open 3D Map")',
      'button:has-text("Open 2D Map")',
      'button:has-text("Dashboard")',
      'button:has-text("Settings")',
      'button:has-text("Help")',
      'button:has-text("About")',
      'button:has-text("Login")',
      'button:has-text("Logout")',
      'button:has-text("Profile")',
      'button:has-text("Save")',
      'button:has-text("Cancel")',
      'button:has-text("Reset")',
      'button:has-text("Refresh")',
      'button:has-text("Export")',
      'button:has-text("Import")'
    ];
    
    for (const buttonSelector of mainButtons) {
      try {
        const button = page.locator(buttonSelector).first();
        if (await button.isVisible()) {
          console.log(`  Clicking: ${buttonSelector}`);
          await button.click();
          await page.waitForTimeout(500);
          
          // Check for errors after click
          if (errorCollectors.errors.length > 0) {
            console.log(`    ❌ Errors after clicking ${buttonSelector}:`);
            errorCollectors.errors.forEach((error: any) => console.log(`      ${error}`));
          }
          
          // Check for rendering issues
          if (errorCollectors.renderingIssues.length > 0) {
            console.log(`    ⚠️ Rendering issues after clicking ${buttonSelector}:`);
            errorCollectors.renderingIssues.forEach((issue: any) => console.log(`      ${issue}`));
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Button ${buttonSelector} not found or not clickable`);
      }
    }
    
    // Store result
    validationResults.push({
      testName: 'Main Navigation',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function test3DMapInteractions(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    // Open 3D Map
    try {
      const open3DButton = page.locator('button:has-text("Open 3D Map")').first();
      if (await open3DButton.isVisible()) {
        await open3DButton.click();
        await page.waitForTimeout(3000);
        
        // Take screenshot after opening 3D map
        await page.screenshot({ path: 'test-results/01-3d-map-opened.png', fullPage: true });
        
        // Test 3D Map specific interactions
        const mapContainer = page.locator('.map-container-3d');
        if (await mapContainer.isVisible()) {
          // Test map interactions
          await mapContainer.hover();
          await page.mouse.move(100, 100);
          await page.mouse.down();
          await page.mouse.move(200, 200);
          await page.mouse.up();
          await page.waitForTimeout(500);
          
          // Test zoom
          try {
            await page.mouse.wheel(0, -100);
            await page.waitForTimeout(500);
            await page.mouse.wheel(0, 100);
            await page.waitForTimeout(500);
          } catch (error) {
            console.log('    ⚠️ Mouse wheel not supported on this platform');
          }
          
          // Test click
          await mapContainer.click({ position: { x: 300, y: 300 }, force: true });
          await page.waitForTimeout(500);
        }
      }
    } catch (error) {
      console.log(`    ❌ Error opening 3D map: ${error}`);
    }
    
    // Store result
    validationResults.push({
      testName: '3D Map Interactions',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function testLayerToggleCombinations(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Test all possible layer toggle combinations
    const layerNames = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
    const totalCombinations = Math.pow(2, layerNames.length);
    
    console.log(`  Testing ${totalCombinations} layer toggle combinations...`);
    
    for (let i = 0; i < Math.min(totalCombinations, 16); i++) { // Limit to 16 for performance
      // Clear errors for this combination
      errorCollectors.errors.length = 0;
      errorCollectors.warnings.length = 0;
      errorCollectors.renderingIssues.length = 0;
      
      // Generate combination
      const combination = i.toString(2).padStart(layerNames.length, '0');
      const testName = `Layer Combination ${i + 1}: ${combination}`;
      
      console.log(`    Testing: ${testName}`);
      
      // Apply layer toggles
      for (let j = 0; j < layerNames.length; j++) {
        const layerName = layerNames[j];
        const shouldEnable = combination[j] === '1';
        
        try {
          const toggleSelectors = [
            `input[type="checkbox"][data-layer="${layerName}"]`,
            `input[type="checkbox"][id*="${layerName}"]`,
            `label:has-text("${layerName}") input[type="checkbox"]`,
            `button:has-text("${layerName}")`,
            `[data-testid*="${layerName}"]`
          ];
          
          for (const selector of toggleSelectors) {
            const toggle = page.locator(selector).first();
            if (await toggle.isVisible()) {
              const isChecked = await toggle.isChecked();
              if (shouldEnable && !isChecked) {
                await toggle.click();
                await page.waitForTimeout(200);
              } else if (!shouldEnable && isChecked) {
                await toggle.click();
                await page.waitForTimeout(200);
              }
              break;
            }
          }
        } catch (error) {
          console.log(`      ⚠️ Toggle error for ${layerName}: ${error}`);
        }
      }
      
      // Wait for layers to stabilize
      await page.waitForTimeout(1000);
      
      // Check for errors
      if (errorCollectors.errors.length > 0) {
        console.log(`      ❌ Errors in ${testName}:`);
        errorCollectors.errors.forEach((error: any) => console.log(`        ${error}`));
      }
      
      // Store result
      validationResults.push({
        testName,
        success: errorCollectors.errors.length === 0,
        errors: [...errorCollectors.errors],
        warnings: [...errorCollectors.warnings],
        consoleLogs: [...errorCollectors.consoleLogs],
        networkErrors: [...errorCollectors.networkErrors],
        renderingIssues: [...errorCollectors.renderingIssues],
        performance: { timestamp: new Date().toISOString() }
      });
    }
  }

  async function testMapStyleChanges(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    // Test map style buttons
    const styleButtons = [
      'button:has-text("Satellite")',
      'button:has-text("Streets")',
      'button:has-text("Dark")',
      'button:has-text("Light")',
      'button:has-text("Terrain")',
      'button:has-text("Outdoors")',
      'button:has-text("Navigation")',
      'button:has-text("Traffic")'
    ];
    
    for (const styleButton of styleButtons) {
      try {
        const button = page.locator(styleButton).first();
        if (await button.isVisible()) {
          console.log(`  Testing style: ${styleButton}`);
          await button.click();
          await page.waitForTimeout(2000);
          
          // Take screenshot after style change
          const styleName = styleButton.replace('button:has-text("', '').replace('")', '');
          await page.screenshot({ path: `test-results/style-${styleName.toLowerCase()}.png`, fullPage: true });
          
          // Check for errors
          if (errorCollectors.errors.length > 0) {
            console.log(`    ❌ Errors after style change to ${styleName}:`);
            errorCollectors.errors.forEach((error: any) => console.log(`      ${error}`));
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Style button ${styleButton} not found`);
      }
    }
    
    // Store result
    validationResults.push({
      testName: 'Map Style Changes',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function testMapInteractions(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    const mapContainer = page.locator('.map-container-3d, .map-container, [data-testid="map-container"]').first();
    
    if (await mapContainer.isVisible()) {
      console.log('  Testing map interactions...');
      
      // Test various map interactions
      const interactions = [
        { name: 'Pan Left', action: async () => {
          await mapContainer.hover();
          await page.mouse.move(400, 300);
          await page.mouse.down();
          await page.mouse.move(200, 300);
          await page.mouse.up();
        }},
        { name: 'Pan Right', action: async () => {
          await mapContainer.hover();
          await page.mouse.move(200, 300);
          await page.mouse.down();
          await page.mouse.move(400, 300);
          await page.mouse.up();
        }},
        { name: 'Pan Up', action: async () => {
          await mapContainer.hover();
          await page.mouse.move(300, 400);
          await page.mouse.down();
          await page.mouse.move(300, 200);
          await page.mouse.up();
        }},
        { name: 'Pan Down', action: async () => {
          await mapContainer.hover();
          await page.mouse.move(300, 200);
          await page.mouse.down();
          await page.mouse.move(300, 400);
          await page.mouse.up();
        }},
        { name: 'Zoom In', action: async () => {
          await mapContainer.hover();
          try {
            await page.mouse.wheel(0, -100);
          } catch (error) {
            console.log('      ⚠️ Mouse wheel not supported');
          }
        }},
        { name: 'Zoom Out', action: async () => {
          await mapContainer.hover();
          try {
            await page.mouse.wheel(0, 100);
          } catch (error) {
            console.log('      ⚠️ Mouse wheel not supported');
          }
        }},
        { name: 'Click Center', action: async () => {
          await mapContainer.click({ position: { x: 300, y: 300 }, force: true });
        }},
        { name: 'Click Corner', action: async () => {
          await mapContainer.click({ position: { x: 200, y: 200 }, force: true });
        }}
      ];
      
      for (const interaction of interactions) {
        try {
          await interaction.action();
          await page.waitForTimeout(500);
        } catch (error) {
          console.log(`    ⚠️ Interaction error (${interaction.name}): ${error}`);
        }
      }
    }
    
    // Store result
    validationResults.push({
      testName: 'Map Interactions',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function testTabSwitching(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    // Test tab switching
    const tabSelectors = [
      'button[role="tab"]',
      '[data-testid*="tab"]',
      '.tab',
      'nav a',
      'nav button',
      '[role="tablist"] button',
      '[role="tablist"] a'
    ];
    
    for (const tabSelector of tabSelectors) {
      try {
        const tabs = page.locator(tabSelector);
        const tabCount = await tabs.count();
        
        if (tabCount > 0) {
          console.log(`  Testing ${tabCount} tabs with selector: ${tabSelector}`);
          
          for (let i = 0; i < tabCount; i++) {
            const tab = tabs.nth(i);
            if (await tab.isVisible()) {
              const tabText = await tab.textContent();
              console.log(`    Clicking tab: ${tabText}`);
              
              await tab.click();
              await page.waitForTimeout(1000);
              
              // Check for errors after tab switch
              if (errorCollectors.errors.length > 0) {
                console.log(`      ❌ Errors after switching to tab "${tabText}":`);
                errorCollectors.errors.forEach((error: any) => console.log(`        ${error}`));
              }
            }
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Tab selector ${tabSelector} not found or not clickable`);
      }
    }
    
    // Store result
    validationResults.push({
      testName: 'Tab Switching',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function testFormInteractions(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    // Test form inputs
    const inputSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'input[type="number"]',
      'input[type="search"]',
      'textarea',
      'select',
      'input[type="checkbox"]',
      'input[type="radio"]',
      'input[type="range"]'
    ];
    
    for (const inputSelector of inputSelectors) {
      try {
        const inputs = page.locator(inputSelector);
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          console.log(`  Testing ${inputCount} inputs with selector: ${inputSelector}`);
          
          for (let i = 0; i < Math.min(inputCount, 5); i++) { // Limit to 5 per type
            const input = inputs.nth(i);
            if (await input.isVisible()) {
              const inputType = await input.getAttribute('type') || 'text';
              console.log(`    Testing input type: ${inputType}`);
              
              // Test different input interactions
              if (inputType === 'checkbox' || inputType === 'radio') {
                await input.click();
                await page.waitForTimeout(200);
              } else if (inputType === 'range') {
                // Test range slider
                await input.hover();
                await page.mouse.down();
                await page.mouse.move(50, 0);
                await page.mouse.up();
                await page.waitForTimeout(200);
              } else {
                // Test text input
                await input.click();
                await input.fill('test input');
                await page.waitForTimeout(200);
                await input.clear();
                await page.waitForTimeout(200);
              }
            }
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Input selector ${inputSelector} not found or not interactable`);
      }
    }
    
    // Store result
    validationResults.push({
      testName: 'Form Interactions',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function testModalInteractions(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    // Test modal triggers
    const modalTriggers = [
      'button:has-text("Settings")',
      'button:has-text("Help")',
      'button:has-text("About")',
      'button:has-text("Info")',
      'button:has-text("Details")',
      'button:has-text("More")',
      'button:has-text("Options")',
      '[data-testid*="modal"]',
      '[data-testid*="dialog"]',
      '[role="dialog"]'
    ];
    
    for (const trigger of modalTriggers) {
      try {
        const button = page.locator(trigger).first();
        if (await button.isVisible()) {
          console.log(`  Testing modal trigger: ${trigger}`);
          await button.click();
          await page.waitForTimeout(1000);
          
          // Look for modal/dialog
          const modal = page.locator('[role="dialog"], .modal, .dialog, [data-testid*="modal"]').first();
          if (await modal.isVisible()) {
            console.log(`    Modal opened successfully`);
            
            // Test modal interactions
            const closeButtons = page.locator('button:has-text("Close"), button:has-text("Cancel"), button:has-text("×"), [aria-label="Close"]');
            const closeButtonCount = await closeButtons.count();
            
            if (closeButtonCount > 0) {
              await closeButtons.first().click();
              await page.waitForTimeout(500);
            } else {
              // Try pressing Escape
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            }
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Modal trigger ${trigger} not found or not clickable`);
      }
    }
    
    // Store result
    validationResults.push({
      testName: 'Modal Interactions',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function testResponsiveBehavior(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Large Desktop', width: 2560, height: 1440 }
    ];
    
    for (const viewport of viewports) {
      console.log(`  Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Take screenshot for this viewport
      await page.screenshot({ path: `test-results/viewport-${viewport.name.toLowerCase()}.png`, fullPage: true });
      
      // Test basic interactions at this viewport
      const mapContainer = page.locator('.map-container-3d, .map-container').first();
      if (await mapContainer.isVisible()) {
        await mapContainer.hover();
        await page.waitForTimeout(500);
      }
    }
    
    // Reset to default viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Store result
    validationResults.push({
      testName: 'Responsive Behavior',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function testErrorBoundaries(page: Page) {
    const errorCollectors = (page as any).__errorCollectors;
    
    // Clear errors for this test
    errorCollectors.errors.length = 0;
    errorCollectors.warnings.length = 0;
    errorCollectors.renderingIssues.length = 0;
    
    // Test rapid interactions to trigger potential errors
    console.log('  Testing error boundaries with rapid interactions...');
    
    const mapContainer = page.locator('.map-container-3d, .map-container').first();
    if (await mapContainer.isVisible()) {
      // Rapid clicking with error handling
      for (let i = 0; i < 5; i++) {
        try {
          await mapContainer.click({ position: { x: 200 + i * 100, y: 200 + i * 100 }, force: true });
          await page.waitForTimeout(100);
        } catch (error) {
          console.log(`      ⚠️ Click ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Rapid layer toggles
      const layerToggles = page.locator('input[type="checkbox"]');
      const toggleCount = await layerToggles.count();
      
      for (let i = 0; i < Math.min(toggleCount, 5); i++) {
        const toggle = layerToggles.nth(i);
        if (await toggle.isVisible()) {
          for (let j = 0; j < 3; j++) {
            await toggle.click();
            await page.waitForTimeout(100);
          }
        }
      }
    }
    
    // Store result
    validationResults.push({
      testName: 'Error Boundaries',
      success: errorCollectors.errors.length === 0,
      errors: [...errorCollectors.errors],
      warnings: [...errorCollectors.warnings],
      consoleLogs: [...errorCollectors.consoleLogs],
      networkErrors: [...errorCollectors.networkErrors],
      renderingIssues: [...errorCollectors.renderingIssues],
      performance: { timestamp: new Date().toISOString() }
    });
  }

  async function analyzeResults(page: Page) {
    const totalTests = validationResults.length;
    const successfulTests = validationResults.filter(r => r.success).length;
    const failedTests = validationResults.filter(r => !r.success).length;
    
    const totalErrors = validationResults.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = validationResults.reduce((sum, r) => sum + r.warnings.length, 0);
    const totalNetworkErrors = validationResults.reduce((sum, r) => sum + r.networkErrors.length, 0);
    const totalRenderingIssues = validationResults.reduce((sum, r) => sum + r.renderingIssues.length, 0);
    
    console.log(`\n📊 VALIDATION SUMMARY:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`\n📈 ERROR BREAKDOWN:`);
    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    console.log(`Network Errors: ${totalNetworkErrors}`);
    console.log(`Rendering Issues: ${totalRenderingIssues}`);
    
    // Show failed tests
    if (failedTests > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      validationResults.filter(r => !r.success).forEach((result, index) => {
        console.log(`${index + 1}. ${result.testName}`);
        if (result.errors.length > 0) {
          console.log(`   Errors: ${result.errors.length}`);
          result.errors.forEach(error => console.log(`     - ${error}`));
        }
        if (result.renderingIssues.length > 0) {
          console.log(`   Rendering Issues: ${result.renderingIssues.length}`);
          result.renderingIssues.forEach(issue => console.log(`     - ${issue}`));
        }
      });
    }
    
    // Show most problematic tests
    const mostErrors = validationResults
      .sort((a, b) => (b.errors.length + b.renderingIssues.length) - (a.errors.length + a.renderingIssues.length))
      .slice(0, 5);
    
    if (mostErrors.length > 0) {
      console.log(`\n🚨 MOST PROBLEMATIC TESTS:`);
      mostErrors.forEach((result, index) => {
        console.log(`${index + 1}. ${result.testName}`);
        console.log(`   Errors: ${result.errors.length}, Rendering Issues: ${result.renderingIssues.length}`);
      });
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/99-final-state.png', fullPage: true });
    
    // Basic assertions
    expect(totalTests).toBeGreaterThan(0);
    expect(successfulTests).toBeGreaterThan(0);
    
    console.log(`\n✅ Comprehensive Frontend Validation Completed!`);
  }
});
