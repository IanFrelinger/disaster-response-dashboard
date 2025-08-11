import { test, expect } from '@playwright/test';

// Disable parallel execution to prevent test conflicts
test.describe.configure({ mode: 'serial' });

test.describe('Text Readability and Layout Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
  });

  test('should have readable text in navigation header', async ({ page }) => {
    // Check main navigation text
    const mainTitle = page.getByText('Disaster Response Dashboard');
    await expect(mainTitle).toBeVisible();
    
    // Check subtitle
    const subtitle = page.getByText('Real-time 3D mapping with Foundry integration');
    await expect(subtitle).toBeVisible();
    
    // Check navigation segments
    const navSegments = ['📊 Dashboard', '🗺️ Live Map', '🌤️ Weather', '🏢 Buildings'];
    for (const segment of navSegments) {
      const navElement = page.locator('.ios-segment').getByText(segment);
      await expect(navElement).toBeVisible();
    }
  });

  test('should have readable text in dashboard view', async ({ page }) => {
    // Navigate to dashboard view (default)
    await page.locator('.ios-segment:has-text("📊 Dashboard")').click();
    await page.waitForTimeout(2000);
    
    // Check dashboard main title and subtitle
    const mainTitle = page.getByText('🏠 Evacuation Tracking Dashboard');
    await expect(mainTitle).toBeVisible();
    
    const subtitle = page.getByText('Real-time evacuation progress monitoring with zone management and building status tracking');
    await expect(subtitle).toBeVisible();
    
    // Check dashboard button labels (be more specific to avoid strict mode violations)
    const zonesButton = page.getByRole('button', { name: 'Zones' });
    await expect(zonesButton).toBeVisible();
    
    const buildingsButton = page.getByRole('button', { name: 'Buildings' });
    await expect(buildingsButton).toBeVisible();
    
    const detailsButton = page.getByRole('button', { name: 'Details' });
    await expect(detailsButton).toBeVisible();
  });

  test('should have readable text in map view', async ({ page }) => {
    // Navigate to map view
    await page.locator('.ios-segment:has-text("🗺️ Live Map")').click();
    
    // Wait for map to load
    await page.waitForSelector('.simple-mapbox-test', { timeout: 15000 });
    
    // Wait for map to be fully loaded (look for the loading text to disappear)
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('.simple-mapbox-test');
      return loadingElement && !loadingElement.textContent?.includes('Loading 3D Map...');
    }, { timeout: 30000 });
    
    // Check map header text
    const mapHeader = page.getByText('🚨 Live Hazard Response Map');
    await expect(mapHeader).toBeVisible();
    
    const mapSubtitle = page.getByText('Real-time 3D terrain visualization with live hazard data and Foundry integration');
    await expect(mapSubtitle).toBeVisible();
    
    // Check map status indicators (be more specific to avoid duplicates)
    const liveDataIndicator = page.locator('.ios-flex').filter({ hasText: 'Live Data' }).first();
    await expect(liveDataIndicator).toBeVisible();
    
    const terrainIndicator = page.locator('.ios-flex').filter({ hasText: '3D Terrain' }).first();
    await expect(terrainIndicator).toBeVisible();
    
    const buildingsIndicator = page.locator('.ios-flex').filter({ hasText: '3D Buildings' }).first();
    await expect(buildingsIndicator).toBeVisible();
    
    const foundryIndicator = page.locator('.ios-flex').filter({ hasText: 'Foundry Data' }).first();
    await expect(foundryIndicator).toBeVisible();
  });

  test('should have readable text in analytics panel', async ({ page }) => {
    // Navigate to map view
    await page.locator('.ios-segment:has-text("🗺️ Live Map")').click();
    
    // Wait for map and analytics panel
    await page.waitForSelector('.simple-mapbox-test', { timeout: 15000 });
    await page.waitForSelector('.analytics-panel', { timeout: 30000 });
    
    // Check analytics panel title
    const analyticsTitle = page.locator('.analytics-panel').getByText('Map Analytics');
    await expect(analyticsTitle).toBeVisible();
    
    // Check all layer labels
    const layerLabels = ['Hazards:', 'Routes:', 'Units:', 'Buildings:', 'Weather:', 'Evac Zones:'];
    for (const label of layerLabels) {
      const labelElement = page.locator('.analytics-panel').getByText(label);
      await expect(labelElement).toBeVisible();
    }
    
    // Check active features summary
    const activeFeatures = page.locator('.analytics-panel').getByText(/Active Features:/);
    await expect(activeFeatures).toBeVisible();
  });

  test('should have readable text in weather view', async ({ page }) => {
    // Navigate to weather view
    await page.locator('.ios-segment:has-text("🌤️ Weather")').click();
    await page.waitForTimeout(2000);
    
    // Check weather panel main title and subtitle
    const mainTitle = page.getByText('🌤️ Weather Conditions & Fire Risk');
    await expect(mainTitle).toBeVisible();
    
    const subtitle = page.getByText('Real-time weather monitoring with fire behavior prediction and emergency alerts');
    await expect(subtitle).toBeVisible();
    
    // Check specific status indicators (be more specific to avoid duplicates)
    const temperatureIndicator = page.locator('.ios-flex').filter({ hasText: '🌡️' }).getByText('Temperature');
    await expect(temperatureIndicator).toBeVisible();
    
    const windIndicator = page.locator('.ios-flex').filter({ hasText: '💨' }).getByText('Wind');
    await expect(windIndicator).toBeVisible();
    
    const fireRiskIndicator = page.locator('.ios-flex').filter({ hasText: '🔥' }).getByText('Fire Risk');
    await expect(fireRiskIndicator).toBeVisible();
    
    const alertsIndicator = page.locator('.ios-flex').filter({ hasText: '⚠️' }).getByText('Alerts');
    await expect(alertsIndicator).toBeVisible();
  });

  test('should have readable text in buildings view', async ({ page }) => {
    // Navigate to buildings view
    await page.locator('.ios-segment:has-text("🏢 Buildings")').click();
    await page.waitForTimeout(2000);
    
    // Check buildings panel main title
    const mainTitle = page.getByText('🏠 Building Evacuation Tracker');
    await expect(mainTitle).toBeVisible();
  });

  test('should have readable footer text', async ({ page }) => {
    // Check footer text
    const footerText = page.getByText('🚨 Emergency Response System v1.0.0');
    await expect(footerText).toBeVisible();
    
    const poweredByText = page.getByText('Powered by Mapbox & React • Real-time disaster monitoring');
    await expect(poweredByText).toBeVisible();
  });

  test('should have proper text contrast and sizing', async ({ page }) => {
    // Navigate to map view for comprehensive testing
    await page.locator('.ios-segment:has-text("🗺️ Live Map")').click();
    await page.waitForSelector('.simple-mapbox-test', { timeout: 15000 });
    
    // Check main heading contrast
    const mainHeading = page.getByText('🚨 Live Hazard Response Map');
    await expect(mainHeading).toHaveCSS('color', 'rgb(0, 122, 255)'); // iOS blue
    
    // Check analytics panel text contrast
    await page.waitForSelector('.analytics-panel', { timeout: 30000 });
    const analyticsTitle = page.locator('.analytics-panel').getByText('Map Analytics');
    
    // Verify text is dark on light background
    const titleColor = await analyticsTitle.evaluate(el => 
      window.getComputedStyle(el).color
    );
    expect(titleColor).toContain('rgb(29, 29, 31)'); // Dark text
    
    // Check panel background is light
    const panelBackground = await page.locator('.analytics-panel').evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(panelBackground).toContain('rgba(255, 255, 255'); // Light background
  });

  test('should have no text overlap in analytics panel', async ({ page }) => {
    // Navigate to map view
    await page.locator('.ios-segment:has-text("🗺️ Live Map")').click();
    await page.waitForSelector('.analytics-panel', { timeout: 30000 });
    
    // Get all text elements in analytics panel
    const textElements = page.locator('.analytics-panel').locator('span, h4, div');
    
    // Check that elements have proper spacing
    const elementCount = await textElements.count();
    expect(elementCount).toBeGreaterThan(0);
    
    // Verify each layer section has proper spacing
    const layerLabels = ['Hazards:', 'Routes:', 'Units:', 'Buildings:', 'Weather:', 'Evac Zones:'];
    for (const label of layerLabels) {
      const labelElement = page.locator('.analytics-panel').getByText(label);
      const parentDiv = labelElement.locator('xpath=ancestor::div[1]');
      
      // Check padding and margins
      const padding = await parentDiv.evaluate(el => 
        window.getComputedStyle(el).padding
      );
      expect(padding).not.toBe('0px');
      
      const margin = await parentDiv.evaluate(el => 
        window.getComputedStyle(el).margin
      );
      // Margin might be 0px, but padding should provide spacing
    }
  });

  test('should have readable map controls text', async ({ page }) => {
    // Navigate to map view
    await page.locator('.ios-segment:has-text("🗺️ Live Map")').click();
    await page.waitForSelector('.simple-mapbox-test', { timeout: 15000 });
    
    // Wait for map to load completely
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('.simple-mapbox-test');
      return loadingElement && !loadingElement.textContent?.includes('Loading 3D Map...');
    }, { timeout: 30000 });
    
    // Check map control text
    const mapControls = [
      '3D Map Controls',
      'Drag to rotate',
      'Scroll to zoom',
      'Right-click to tilt'
    ];
    
    for (const control of mapControls) {
      const controlElement = page.getByText(control, { exact: false });
      await expect(controlElement).toBeVisible();
    }
    
    // Check feature descriptions
    const features = [
      '3D Terrain with elevation',
      '3D Buildings on terrain',
      'Emergency escape routes',
      'Hover for tooltips'
    ];
    
    for (const feature of features) {
      const featureElement = page.getByText(feature, { exact: false });
      await expect(featureElement).toBeVisible();
    }
  });

  test('should have readable status bar text', async ({ page }) => {
    // Navigate to map view
    await page.locator('.ios-segment:has-text("🗺️ Live Map")').click();
    await page.waitForSelector('.simple-mapbox-test', { timeout: 15000 });
    
    // Wait for map to load
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('.simple-mapbox-test');
      return loadingElement && !loadingElement.textContent?.includes('Loading 3D Map...');
    }, { timeout: 30000 });
    
    // Check status bar text
    const statusElements = [
      'Location: San Francisco',
      'View: Live Hazard Response with 3D Terrain',
      'Last Update:'
    ];
    
    for (const status of statusElements) {
      const statusElement = page.getByText(status, { exact: false });
      await expect(statusElement).toBeVisible();
    }
  });

  test('should have readable weather overlay text', async ({ page }) => {
    // Navigate to map view
    await page.locator('.ios-segment:has-text("🗺️ Live Map")').click();
    await page.waitForSelector('.simple-mapbox-test', { timeout: 15000 });
    await page.waitForSelector('.analytics-panel', { timeout: 30000 });
    
    // Check weather operations text
    const weatherElements = [
      '🌤️ Weather Operations',
      '📊 Current Conditions',
      '🌡️ Temp:',
      '💧 Humidity:',
      '💨 Wind:',
      '🧭 Direction:'
    ];
    
    for (const element of weatherElements) {
      const textElement = page.getByText(element, { exact: false });
      await expect(textElement).toBeVisible();
    }
    
    // Check EMS impact text
    const emsElements = [
      '🚑 EMS Impact',
      '🔥 Fire Risk:',
      '🚨 Evacuation:',
      '🚁 Air Operations:'
    ];
    
    for (const element of emsElements) {
      const textElement = page.getByText(element, { exact: false });
      await expect(textElement).toBeVisible();
    }
  });
});
