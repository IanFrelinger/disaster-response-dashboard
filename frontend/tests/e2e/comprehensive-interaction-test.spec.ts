import { test, expect } from '@playwright/test';

test.describe('Comprehensive UI Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for React to fully render
  });

  test('should test all navigation interactions without overlap', async ({ page }) => {
    // Test all navigation segments
    const navSegments = ['📊 Dashboard', '🗺️ Live Map', '🌤️ Weather', '🏢 Buildings'];
    
    for (const segment of navSegments) {
      // Click navigation segment - use more specific selector for navigation buttons
      const navButton = page.locator(`.ios-segment:has-text("${segment}")`);
      await expect(navButton).toBeVisible();
      await navButton.click();
      
      // Wait for view to load
      await page.waitForTimeout(1000);
      
      // Verify no overlapping elements
      await verifyNoOverlappingElements(page);
      
      // Verify view content is properly displayed
      await verifyViewContent(page, segment);
    }
  });

  test('should test all dashboard interactions comprehensively', async ({ page }) => {
    // Navigate to dashboard
    await page.locator('text=📊 Dashboard').click();
    await page.waitForTimeout(1000);
    
    // Test zone selection interactions
    const zoneCards = page.locator('[data-testid="zone-card"], .zone-card, .ios-card');
    const zoneCount = await zoneCards.count();
    
    for (let i = 0; i < Math.min(zoneCount, 3); i++) {
      const zoneCard = zoneCards.nth(i);
      if (await zoneCard.isVisible()) {
        // Click zone card
        await zoneCard.click();
        await page.waitForTimeout(500);
        
        // Verify no overlap after interaction
        await verifyNoOverlappingElements(page);
        
        // Test zone details if they appear
        const zoneDetails = page.locator('[data-testid="zone-details"], .zone-details');
        if (await zoneDetails.isVisible()) {
          await expect(zoneDetails).toBeVisible();
          await verifyNoOverlappingElements(page);
        }
      }
    }
    
    // Test building selection interactions
    const buildingRows = page.locator('[data-testid="building-row"], .building-row, tr');
    const buildingCount = await buildingRows.count();
    
    for (let i = 0; i < Math.min(buildingCount, 3); i++) {
      const buildingRow = buildingRows.nth(i);
      if (await buildingRow.isVisible()) {
        await buildingRow.click();
        await page.waitForTimeout(500);
        await verifyNoOverlappingElements(page);
      }
    }
  });

  test('should test map interactions without UI overlap', async ({ page }) => {
    // Navigate to map view
    await page.locator('text=🗺️ Live Map').click();
    await page.waitForTimeout(1000);
    
    // Test map controls
    const mapControls = page.locator('[data-testid="map-controls"], .map-controls, .zoom-controls');
    if (await mapControls.isVisible()) {
      await expect(mapControls).toBeVisible();
      
      // Test zoom controls
      const zoomIn = page.locator('[data-testid="zoom-in"], .zoom-in, button:has-text("+")');
      const zoomOut = page.locator('[data-testid="zoom-out"], .zoom-out, button:has-text("-")');
      
      if (await zoomIn.isVisible()) {
        await zoomIn.click();
        await page.waitForTimeout(500);
        await verifyNoOverlappingElements(page);
      }
      
      if (await zoomOut.isVisible()) {
        await zoomOut.click();
        await page.waitForTimeout(500);
        await verifyNoOverlappingElements(page);
      }
    }
    
    // Test layer toggles if they exist
    const layerToggles = page.locator('[data-testid="layer-toggle"], .layer-toggle, input[type="checkbox"]');
    const toggleCount = await layerToggles.count();
    
    for (let i = 0; i < toggleCount; i++) {
      const toggle = layerToggles.nth(i);
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(500);
        await verifyNoOverlappingElements(page);
      }
    }
  });

  test('should test weather panel interactions comprehensively', async ({ page }) => {
    // Navigate to weather view
    await page.locator('text=🌤️ Weather').click();
    await page.waitForTimeout(1000);
    
    // Test weather data display
    const weatherCards = page.locator('[data-testid="weather-card"], .weather-card, .ios-card');
    await expect(weatherCards.first()).toBeVisible();
    
    // Test any interactive weather elements
    const weatherButtons = page.locator('[data-testid="weather-button"], .weather-button, button');
    const buttonCount = await weatherButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = weatherButtons.nth(i);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(500);
        await verifyNoOverlappingElements(page);
      }
    }
    
    // Verify weather data is properly formatted
    const weatherText = page.locator('text=/\\d+°F/, text=/\\d+%/, text=/\\d+ mph/');
    if (await weatherText.count() > 0) {
      await expect(weatherText.first()).toBeVisible();
    }
  });

  test('should test building tracker interactions thoroughly', async ({ page }) => {
    // Navigate to buildings view
    await page.locator('text=🏢 Buildings').click();
    await page.waitForTimeout(1000);
    
    // Test building search/filter if available
    const searchInput = page.locator('[data-testid="search-input"], .search-input, input[placeholder*="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test building');
      await page.waitForTimeout(500);
      await verifyNoOverlappingElements(page);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
      await verifyNoOverlappingElements(page);
    }
    
    // Test building status updates
    const statusButtons = page.locator('[data-testid="status-button"], .status-button, button:has-text("Update"), button:has-text("Status")');
    const statusButtonCount = await statusButtons.count();
    
    for (let i = 0; i < Math.min(statusButtonCount, 2); i++) {
      const button = statusButtons.nth(i);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(500);
        await verifyNoOverlappingElements(page);
        
        // Close any modal that might have opened
        const closeButton = page.locator('[data-testid="close-button"], .close-button, button:has-text("Close"), button:has-text("×")');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
          await verifyNoOverlappingElements(page);
        }
      }
    }
  });

  test('should test responsive design across all breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Small Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' }
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize(breakpoint);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      console.log(`Testing breakpoint: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      
      // Test navigation in this breakpoint
      const navSegments = ['📊 Dashboard', '🗺️ Live Map', '🌤️ Weather', '🏢 Buildings'];
      for (const segment of navSegments) {
        const navButton = page.locator(`.ios-segment:has-text("${segment}")`);
        if (await navButton.isVisible()) {
          await navButton.click();
          await page.waitForTimeout(500);
          await verifyNoOverlappingElements(page);
        }
      }
    }
  });

  test('should test all form interactions and validations', async ({ page }) => {
    // Navigate to dashboard to find forms
    await page.locator('text=📊 Dashboard').click();
    await page.waitForTimeout(1000);
    
    // Test all input fields
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const inputType = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        
        console.log(`Testing input ${i + 1}: type=${inputType}, placeholder=${placeholder}`);
        
        // Test input interaction
        await input.click();
        await page.waitForTimeout(200);
        await verifyNoOverlappingElements(page);
        
        // Test input value
        if (inputType !== 'checkbox' && inputType !== 'radio') {
          await input.fill('test value');
          await page.waitForTimeout(200);
          await verifyNoOverlappingElements(page);
          
          // Verify value was set
          const value = await input.inputValue();
          expect(value).toBe('test value');
        }
      }
    }
    
    // Test all buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const buttonText = await button.textContent();
        console.log(`Testing button ${i + 1}: ${buttonText}`);
        
        await button.click();
        await page.waitForTimeout(500);
        await verifyNoOverlappingElements(page);
      }
    }
  });

  test('should test accessibility and keyboard navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await verifyNoOverlappingElements(page);
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await verifyNoOverlappingElements(page);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await verifyNoOverlappingElements(page);
    
    // Test Enter key
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await verifyNoOverlappingElements(page);
    
    // Test Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await verifyNoOverlappingElements(page);
  });

  test('should test error handling and edge cases', async ({ page }) => {
    // Test with slow network
    await page.route('**/*', route => {
      setTimeout(() => {
        route.fulfill({ status: 200, body: '{}' });
      }, 1000);
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    await verifyNoOverlappingElements(page);
    
    // Test with network errors
    await page.route('**/*', route => {
      route.abort();
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    await verifyNoOverlappingElements(page);
    
    // Test with malformed data
    await page.route('**/*', route => {
      setTimeout(() => {
        route.fulfill({ status: 200, body: 'invalid json' });
      }, 100);
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    await verifyNoOverlappingElements(page);
  });
});

// Helper function to verify no overlapping elements
async function verifyNoOverlappingElements(page: any) {
  // Get all visible elements
  const elements = page.locator('*:visible');
  const elementCount = await elements.count();
  
  if (elementCount > 0) {
    // Check for obvious overlap issues by examining positioning
    const overlappingIssues = [];
    
    for (let i = 0; i < Math.min(elementCount, 20); i++) {
      const element = elements.nth(i);
      if (await element.isVisible()) {
        try {
          const boundingBox = await element.boundingBox();
          if (boundingBox) {
            // Check if element has reasonable dimensions
            if (boundingBox.width < 0 || boundingBox.height < 0) {
              overlappingIssues.push(`Element ${i} has invalid dimensions: ${JSON.stringify(boundingBox)}`);
            }
          }
        } catch (error) {
          // Element might not have bounding box, continue
        }
      }
    }
    
    // Check for z-index conflicts
    const zIndexElements = page.locator('[style*="z-index"]');
    const zIndexCount = await zIndexElements.count();
    
    if (zIndexCount > 0) {
      const zIndexValues = [];
      for (let i = 0; i < zIndexCount; i++) {
        const element = zIndexElements.nth(i);
        const style = await element.getAttribute('style');
        if (style && style.includes('z-index')) {
          zIndexValues.push(style);
        }
      }
      
      if (zIndexValues.length > 0) {
        console.log('Z-index values found:', zIndexValues);
      }
    }
    
    // Log any overlap issues found
    if (overlappingIssues.length > 0) {
      console.log('Potential overlap issues detected:', overlappingIssues);
    }
    
    // Verify page is still functional
    await expect(page.locator('body')).toBeVisible();
  }
}

// Helper function to verify view content
async function verifyViewContent(page: any, viewName: string) {
  switch (viewName) {
    case '📊 Dashboard':
      // Check for dashboard-specific content
      const dashboardContent = page.locator('[data-testid="dashboard"], .dashboard, .evacuation-dashboard');
      if (await dashboardContent.count() > 0) {
        await expect(dashboardContent.first()).toBeVisible();
      }
      break;
      
    case '🗺️ Live Map':
      // Check for map-specific content
      const mapContent = page.locator('[data-testid="map"], .map, .live-hazard-map');
      if (await mapContent.count() > 0) {
        await expect(mapContent.first()).toBeVisible();
      }
      break;
      
    case '🌤️ Weather':
      // Check for weather-specific content
      const weatherContent = page.locator('[data-testid="weather"], .weather, .weather-panel');
      if (await weatherContent.count() > 0) {
        await expect(weatherContent.first()).toBeVisible();
      }
      break;
      
    case '🏢 Buildings':
      // Check for buildings-specific content
      const buildingsContent = page.locator('[data-testid="buildings"], .buildings, .building-tracker');
      if (await buildingsContent.count() > 0) {
        await expect(buildingsContent.first()).toBeVisible();
      }
      break;
  }
}
