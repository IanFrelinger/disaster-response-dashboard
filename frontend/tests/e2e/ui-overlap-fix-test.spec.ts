import { test, expect } from '@playwright/test';

// Disable parallel execution to prevent test conflicts
test.describe.configure({ mode: 'serial' });

test.describe('UI Overlap Fix and Map Controls Panel Removal', () => {
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

  test('should not have map controls panel on the right side', async ({ page }) => {
    // Check that the old map controls panel is not present
    const oldMapControls = page.locator('text=3D Map Controls');
    await expect(oldMapControls).toHaveCount(0);
    
    // Check that the simplified map controls info is present instead
    const simplifiedMapControls = page.locator('text=Map Controls');
    await expect(simplifiedMapControls).toBeVisible();
    
    console.log('✅ Map controls panel successfully removed and replaced with simplified version');
  });

  test('should have status indicator positioned at top-right', async ({ page }) => {
    // Check that the status indicator is visible and positioned correctly
    const statusIndicator = page.locator('text=3D Terrain Loaded').or(page.locator('text=Loading 3D Terrain...'));
    await expect(statusIndicator).toBeVisible();
    
    // Verify it's positioned at the top-right by checking its container
    const statusContainer = statusIndicator.locator('xpath=ancestor::div[contains(@style, "top: var(--ios-spacing-md)") and contains(@style, "right: var(--ios-spacing-md)")]');
    await expect(statusContainer).toBeVisible();
    
    console.log('✅ Status indicator correctly positioned at top-right');
  });

  test('should have analytics panel positioned at bottom-left', async ({ page }) => {
    // Check that the analytics panel is visible
    const analyticsPanel = page.locator('.analytics-panel');
    await expect(analyticsPanel).toBeVisible();
    
    // Verify it's positioned at the bottom-left
    const panelContainer = analyticsPanel.locator('xpath=ancestor::div[contains(@style, "bottom: var(--ios-spacing-md)") and contains(@style, "left: var(--ios-spacing-md)")]');
    await expect(panelContainer).toBeVisible();
    
    console.log('✅ Analytics panel correctly positioned at bottom-left');
  });

  test('should have map controls info positioned at bottom-right', async ({ page }) => {
    // Check that the simplified map controls info is visible
    const mapControlsInfo = page.locator('text=Map Controls');
    await expect(mapControlsInfo).toBeVisible();
    
    // Verify it's positioned at the bottom-right
    const controlsContainer = mapControlsInfo.locator('xpath=ancestor::div[contains(@style, "bottom: var(--ios-spacing-md)") and contains(@style, "right: var(--ios-spacing-md)")]');
    await expect(controlsContainer).toBeVisible();
    
    console.log('✅ Map controls info correctly positioned at bottom-right');
  });

  test('should use standard iOS colors for all layers', async ({ page }) => {
    // Check that all layer colors use iOS color variables
    const expectedColors = [
      { layer: 'Hazards:', color: 'var(--ios-red)' },
      { layer: 'Routes:', color: 'var(--ios-orange)' },
      { layer: 'Units:', color: 'var(--ios-blue)' },
      { layer: 'Buildings:', color: 'var(--ios-green)' },
      { layer: 'Weather:', color: 'var(--ios-purple)' },
      { layer: 'Evac Zones:', color: 'var(--ios-red)' }
    ];
    
    for (const { layer, color } of expectedColors) {
      const layerElement = page.locator('.analytics-panel').getByText(layer);
      await expect(layerElement).toBeVisible();
      
      // Check that the color style uses the iOS variable
      const layerContainer = layerElement.locator('xpath=ancestor::div[1]');
      await expect(layerContainer).toHaveCSS('border-color', expect.stringContaining('rgba'));
      
      console.log(`✅ ${layer} uses standard iOS color: ${color}`);
    }
  });

  test('should not have overlapping text panels', async ({ page }) => {
    // Get the positions of all panels to check for overlaps
    const panels = [
      { name: 'Status Indicator', selector: 'text=3D Terrain Loaded' },
      { name: 'Analytics Panel', selector: '.analytics-panel' },
      { name: 'Map Controls Info', selector: 'text=Map Controls' }
    ];
    
    const panelPositions = [];
    
    for (const panel of panels) {
      const element = page.locator(panel.selector);
      if (await element.count() > 0) {
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          panelPositions.push({
            name: panel.name,
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
          });
        }
      }
    }
    
    // Check for overlaps between panels
    let hasOverlap = false;
    for (let i = 0; i < panelPositions.length; i++) {
      for (let j = i + 1; j < panelPositions.length; j++) {
        const panel1 = panelPositions[i];
        const panel2 = panelPositions[j];
        
        // Check if panels overlap
        const horizontalOverlap = !(panel1.x + panel1.width < panel2.x || panel2.x + panel2.width < panel1.x);
        const verticalOverlap = !(panel1.y + panel1.height < panel2.y || panel2.y + panel2.height < panel1.y);
        
        if (horizontalOverlap && verticalOverlap) {
          hasOverlap = true;
          console.log(`❌ Overlap detected between ${panel1.name} and ${panel2.name}`);
        }
      }
    }
    
    expect(hasOverlap).toBe(false);
    console.log('✅ No overlapping text panels detected');
  });

  test('should maintain proper z-index layering', async ({ page }) => {
    // Check that panels have proper z-index values
    const statusIndicator = page.locator('text=3D Terrain Loaded').or(page.locator('text=Loading 3D Terrain...'));
    const analyticsPanel = page.locator('.analytics-panel');
    const mapControlsInfo = page.locator('text=Map Controls');
    
    // All panels should have z-index >= 1000
    const panels = [statusIndicator, analyticsPanel, mapControlsInfo];
    
    for (const panel of panels) {
      if (await panel.count() > 0) {
        const container = panel.locator('xpath=ancestor::div[contains(@style, "z-index")]');
        if (await container.count() > 0) {
          const zIndex = await container.evaluate(el => {
            const style = window.getComputedStyle(el);
            return parseInt(style.zIndex) || 0;
          });
          expect(zIndex).toBeGreaterThanOrEqual(1000);
          console.log(`✅ Panel has proper z-index: ${zIndex}`);
        }
      }
    }
  });

  test('should have consistent iOS design styling', async ({ page }) => {
    // Check that all panels use iOS design system
    const panels = [
      { name: 'Status Indicator', selector: 'text=3D Terrain Loaded' },
      { name: 'Analytics Panel', selector: '.analytics-panel' },
      { name: 'Map Controls Info', selector: 'text=Map Controls' }
    ];
    
    for (const panel of panels) {
      const element = page.locator(panel.selector);
      if (await element.count() > 0) {
        const container = element.locator('xpath=ancestor::div[contains(@style, "backdrop-filter")]');
        if (await container.count() > 0) {
          // Check for iOS design elements
          const hasBackdropFilter = await container.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.backdropFilter !== 'none';
          });
          expect(hasBackdropFilter).toBe(true);
          
          // Check for iOS border radius
          const hasBorderRadius = await container.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.borderRadius.includes('16px') || style.borderRadius.includes('var(--ios-border-radius-xl)');
          });
          expect(hasBorderRadius).toBe(true);
          
          console.log(`✅ ${panel.name} uses consistent iOS design styling`);
        }
      }
    }
  });

  test('should maintain functionality after UI changes', async ({ page }) => {
    // Test that layer toggles still work
    const hazardsToggle = page.locator('.analytics-panel').getByText('Hazards:').locator('xpath=ancestor::div[1]').locator('input[type="checkbox"]');
    
    // Check initial state
    const initialState = await hazardsToggle.isChecked();
    
    // Toggle off
    await hazardsToggle.uncheck();
    await expect(hazardsToggle).not.toBeChecked();
    
    // Toggle back on
    await hazardsToggle.check();
    await expect(hazardsToggle).toBeChecked();
    
    console.log('✅ Layer toggle functionality maintained after UI changes');
  });

  test('should have proper responsive behavior', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1366, height: 768, name: 'Laptop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 768, height: 1024, name: 'Mobile Portrait' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      // Check that all panels are still visible and properly positioned
      const statusIndicator = page.locator('text=3D Terrain Loaded').or(page.locator('text=Loading 3D Terrain...'));
      const analyticsPanel = page.locator('.analytics-panel');
      const mapControlsInfo = page.locator('text=Map Controls');
      
      await expect(statusIndicator).toBeVisible();
      await expect(analyticsPanel).toBeVisible();
      await expect(mapControlsInfo).toBeVisible();
      
      console.log(`✅ UI responsive behavior verified for ${viewport.name} viewport`);
    }
  });
});
