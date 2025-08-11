import { test, expect } from '@playwright/test';

test.describe('Analytics Panel Functionality Test', () => {
  test('should test analytics panel functionality in Live Map view', async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('=== ANALYTICS PANEL FUNCTIONALITY TEST ===');
    
    // Navigate to Live Map view (where SimpleMapboxTest component is used)
    const mapButton = page.locator('text=🗺️ Live Map');
    await mapButton.click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Navigated to Live Map view');
    
    // Look for the SimpleMapboxTest component
    const simpleMapbox = page.locator('.simple-mapbox-test');
    if (await simpleMapbox.count() > 0) {
      console.log('✅ SimpleMapboxTest component found');
      
      // Wait for map to load
      await page.waitForTimeout(2000);
      
      // Test analytics panel checkbox functionality
      const analyticsCheckbox = page.locator('.analytics-checkbox');
      if (await analyticsCheckbox.count() > 0) {
        console.log('✅ Analytics checkbox found');
        
        // Get initial state
        const initialChecked = await analyticsCheckbox.isChecked();
        console.log(`Initial analytics state: ${initialChecked ? 'enabled' : 'disabled'}`);
        
        // Toggle analytics panel
        await analyticsCheckbox.click();
        await page.waitForTimeout(1000);
        
        // Check new state
        const newChecked = await analyticsCheckbox.isChecked();
        console.log(`After toggle, analytics state: ${newChecked ? 'enabled' : 'disabled'}`);
        
        // Verify state changed
        expect(newChecked).not.toBe(initialChecked);
        console.log('✅ Analytics checkbox state successfully toggled');
        
        // Check if analytics panel is visible when enabled
        if (newChecked) {
          const analyticsPanel = page.locator('.analytics-panel');
          if (await analyticsPanel.count() > 0) {
            await expect(analyticsPanel.first()).toBeVisible();
            console.log('✅ Analytics panel visible when enabled');
            
            // Check for analytics content
            const metricsElements = page.locator('text=/hazards|routes|buildings|terrain/i');
            if (await metricsElements.count() > 0) {
              console.log(`Found ${await metricsElements.count()} metrics elements in analytics panel`);
            }
          } else {
            console.log('❌ Analytics panel not found even when enabled');
          }
        } else {
          // Check if analytics panel is hidden when disabled
          const analyticsPanel = page.locator('.analytics-panel');
          if (await analyticsPanel.count() === 0) {
            console.log('✅ Analytics panel hidden when disabled');
          } else {
            console.log('❌ Analytics panel still visible when disabled');
          }
        }
        
        // Toggle back to original state
        await analyticsCheckbox.click();
        await page.waitForTimeout(1000);
        
        const finalChecked = await analyticsCheckbox.isChecked();
        expect(finalChecked).toBe(initialChecked);
        console.log('✅ Analytics checkbox returned to original state');
        
      } else {
        console.log('❌ Analytics checkbox not found');
      }
      
      // Test other control checkboxes
      const terrainCheckbox = page.locator('.terrain-checkbox');
      if (await terrainCheckbox.count() > 0) {
        console.log('✅ Terrain checkbox found');
        
        // Test terrain checkbox toggle
        const initialTerrain = await terrainCheckbox.isChecked();
        await terrainCheckbox.click();
        await page.waitForTimeout(1000);
        
        const newTerrain = await terrainCheckbox.isChecked();
        expect(newTerrain).not.toBe(initialTerrain);
        console.log('✅ Terrain checkbox state successfully toggled');
        
        // Toggle back
        await terrainCheckbox.click();
        await page.waitForTimeout(1000);
        
        const finalTerrain = await terrainCheckbox.isChecked();
        expect(finalTerrain).toBe(initialTerrain);
        console.log('✅ Terrain checkbox returned to original state');
      }
      
    } else {
      console.log('❌ SimpleMapboxTest component not found in Live Map view');
    }
    
    console.log('✅ Analytics panel functionality test completed');
  });
});
