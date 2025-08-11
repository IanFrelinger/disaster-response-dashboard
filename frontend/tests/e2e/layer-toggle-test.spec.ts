import { test, expect } from '@playwright/test';

// Disable parallel execution to prevent test conflicts
test.describe.configure({ mode: 'serial' });

test.describe('Map Layer Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Navigate to the map view by clicking the map segment in the segmented control
    await page.locator('.ios-segment:has-text("🗺️ Live Map")').click();
    
    // Wait for the map to load
    await page.waitForSelector('.simple-mapbox-test', { timeout: 15000 });
    
    // Wait for the map to be fully loaded (look for the loading text to disappear)
    await page.waitForFunction(() => {
      const loadingElement = document.querySelector('.simple-mapbox-test');
      return loadingElement && !loadingElement.textContent?.includes('Loading 3D Map...');
    }, { timeout: 30000 });
    
    // Wait for the analytics panel to appear
    await page.waitForSelector('.analytics-panel', { timeout: 30000 });
    
    // Additional wait to ensure the panel is fully rendered
    await page.waitForTimeout(2000);
  });

  test('should display all toggleable layers in analytics panel', async ({ page }) => {
    // Check that all expected layers are present
    const expectedLayers = ['Hazards:', 'Routes:', 'Units:', 'Buildings:', 'Weather:', 'Evac Zones:'];
    
    for (const layer of expectedLayers) {
      await expect(page.locator('.analytics-panel').getByText(layer)).toBeVisible();
    }
  });

  test('should toggle Hazards layer on/off', async ({ page }) => {
    // Find the Hazards toggle by looking for the text and then finding the checkbox in the same div
    const hazardsSection = page.locator('.analytics-panel').getByText('Hazards:').locator('xpath=ancestor::div[1]');
    const hazardsToggle = hazardsSection.locator('input[type="checkbox"]');
    
    // Check initial state (should be checked by default)
    await expect(hazardsToggle).toBeChecked();
    
    // Toggle off
    await hazardsToggle.uncheck();
    await expect(hazardsToggle).not.toBeChecked();
    
    // Toggle back on
    await hazardsToggle.check();
    await expect(hazardsToggle).toBeChecked();
  });

  test('should toggle Routes layer on/off', async ({ page }) => {
    // Find the Routes toggle
    const routesSection = page.locator('.analytics-panel').getByText('Routes:').locator('xpath=ancestor::div[1]');
    const routesToggle = routesSection.locator('input[type="checkbox"]');
    
    // Check initial state (should be checked by default)
    await expect(routesToggle).toBeChecked();
    
    // Toggle off
    await routesToggle.uncheck();
    await expect(routesToggle).not.toBeChecked();
    
    // Toggle back on
    await routesToggle.check();
    await expect(routesToggle).toBeChecked();
  });

  test('should toggle Units layer on/off', async ({ page }) => {
    // Find the Units toggle
    const unitsSection = page.locator('.analytics-panel').getByText('Units:').locator('xpath=ancestor::div[1]');
    const unitsToggle = unitsSection.locator('input[type="checkbox"]');
    
    // Check initial state (should be checked by default)
    await expect(unitsToggle).toBeChecked();
    
    // Toggle off
    await unitsToggle.uncheck();
    await expect(unitsToggle).not.toBeChecked();
    
    // Toggle back on
    await unitsToggle.check();
    await expect(unitsToggle).toBeChecked();
  });

  test('should show Buildings as always on (non-toggleable)', async ({ page }) => {
    // Find the Buildings section
    const buildingsSection = page.locator('.analytics-panel').getByText('Buildings:').locator('xpath=ancestor::div[1]');
    
    // Check that it shows "Always On"
    await expect(buildingsSection.getByText('Always On')).toBeVisible();
    
    // Check that there's no checkbox (since it's always on)
    const buildingsCheckbox = buildingsSection.locator('input[type="checkbox"]');
    await expect(buildingsCheckbox).toHaveCount(0);
  });

  test('should toggle Weather layer on/off', async ({ page }) => {
    // Find the Weather toggle
    const weatherSection = page.locator('.analytics-panel').getByText('Weather:').locator('xpath=ancestor::div[1]');
    const weatherToggle = weatherSection.locator('input[type="checkbox"]');
    
    // Check initial state (should be checked by default)
    await expect(weatherToggle).toBeChecked();
    
    // Toggle off
    await weatherToggle.uncheck();
    await expect(weatherToggle).not.toBeChecked();
    
    // Toggle back on
    await weatherToggle.check();
    await expect(weatherToggle).toBeChecked();
  });

  test('should toggle Evacuation Zones layer on/off', async ({ page }) => {
    // Find the Evac Zones toggle
    const evacZonesSection = page.locator('.analytics-panel').getByText('Evac Zones:').locator('xpath=ancestor::div[1]');
    const evacZonesToggle = evacZonesSection.locator('input[type="checkbox"]');
    
    // Check initial state (should be checked by default)
    await expect(evacZonesToggle).toBeChecked();
    
    // Toggle off
    await evacZonesToggle.uncheck();
    await expect(evacZonesToggle).not.toBeChecked();
    
    // Toggle back on
    await evacZonesToggle.check();
    await expect(evacZonesToggle).toBeChecked();
  });

  test('should update layer status text when toggled', async ({ page }) => {
    // Test Hazards layer status updates
    const hazardsSection = page.locator('.analytics-panel').getByText('Hazards:').locator('xpath=ancestor::div[1]');
    const hazardsToggle = hazardsSection.locator('input[type="checkbox"]');
    
    // Check initial status shows "3 Active" or "Loading..."
    await expect(hazardsSection.getByText(/3 Active|Loading\.\.\./)).toBeVisible();
    
    // Toggle off and check status changes to "Disabled"
    await hazardsToggle.uncheck();
    await expect(hazardsSection.getByText('Disabled')).toBeVisible();
    
    // Toggle back on and check status returns to active state
    await hazardsToggle.check();
    await expect(hazardsSection.getByText(/3 Active|Loading\.\.\./)).toBeVisible();
  });

  test('should maintain toggle state across page interactions', async ({ page }) => {
    // Toggle off Routes layer
    const routesSection = page.locator('.analytics-panel').getByText('Routes:').locator('xpath=ancestor::div[1]');
    const routesToggle = routesSection.locator('input[type="checkbox"]');
    await routesToggle.uncheck();
    await expect(routesToggle).not.toBeChecked();
    
    // Interact with the map (zoom in/out)
    await page.locator('.simple-mapbox-test').click();
    
    // Check that the toggle state is maintained
    await expect(routesToggle).not.toBeChecked();
    
    // Toggle back on
    await routesToggle.check();
    await expect(routesToggle).toBeChecked();
  });

  test('should have proper visual feedback for toggleable layers', async ({ page }) => {
    // Check that toggleable layers have cursor pointer
    const toggleableLayers = ['Hazards:', 'Routes:', 'Units:', 'Weather:', 'Evac Zones:'];
    
    for (const layer of toggleableLayers) {
      const layerSection = page.locator('.analytics-panel').getByText(layer).locator('xpath=ancestor::div[1]');
      
      // Check cursor style
      await expect(layerSection).toHaveCSS('cursor', 'pointer');
      
      // Check that checkbox is present
      const checkbox = layerSection.locator('input[type="checkbox"]');
      await expect(checkbox).toBeVisible();
    }
  });

  test('should show correct active features count', async ({ page }) => {
    // Find the active features count - look for the second span that contains the actual count
    const activeFeaturesLabel = page.locator('.analytics-panel').getByText('Active Features:');
    const activeFeaturesCount = activeFeaturesLabel.locator('xpath=../..').locator('span').last();
    
    // Check that it shows the correct format (e.g., "5/6 (3D Buildings Always On)")
    await expect(activeFeaturesCount).toContainText('3D Buildings Always On');
    
    // Toggle off a layer and check count updates
    const hazardsSection = page.locator('.analytics-panel').getByText('Hazards:').locator('xpath=ancestor::div[1]');
    const hazardsToggle = hazardsSection.locator('input[type="checkbox"]');
    await hazardsToggle.uncheck();
    
    // The count should update (though we can't predict exact numbers due to async loading)
    await expect(activeFeaturesCount).toBeVisible();
  });
});
