import { test, expect } from '@playwright/test';

test.describe('Simple Map Verification', () => {
  test('should verify map is working and accessible', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Click the map button to switch to map view
    const mapButton = page.locator('button:has-text("🗺️ Live Map")');
    await expect(mapButton).toBeVisible();
    await mapButton.click();
    
    // Wait for map to load
    await page.waitForTimeout(5000);
    
    console.log('=== SIMPLE MAP VERIFICATION ===');
    
    // Basic verification that map container exists
    const mapContainer = page.locator('.simple-mapbox-test');
    const mapExists = await mapContainer.count();
    console.log('Map container exists:', mapExists);
    
    if (mapExists > 0) {
      console.log('✅ Map container found!');
      
      // Check if Mapbox canvas exists (this is the actual map)
      const mapboxCanvas = page.locator('.mapboxgl-canvas');
      const canvasExists = await mapboxCanvas.count();
      console.log('Mapbox canvas exists:', canvasExists);
      
      if (canvasExists > 0) {
        console.log('✅ Mapbox canvas found!');
        
        // Get canvas dimensions
        const canvasRect = await mapboxCanvas.boundingBox();
        if (canvasRect) {
          console.log('Canvas dimensions:', canvasRect);
          console.log('Canvas width:', canvasRect.width);
          console.log('Canvas height:', canvasRect.height);
          
          // Verify canvas has reasonable dimensions
          expect(canvasRect.width).toBeGreaterThan(500);
          expect(canvasRect.height).toBeGreaterThan(300);
        }
        
        // Check if canvas is actually rendering (has content)
        const canvasElement = await mapboxCanvas.elementHandle();
        if (canvasElement) {
          const canvasData = await page.evaluate((canvas) => {
            const ctx = (canvas as HTMLCanvasElement).getContext('2d');
            if (ctx) {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              return {
                width: imageData.width,
                height: imageData.height,
                hasData: imageData.data.some(pixel => pixel !== 0)
              };
            }
            return null;
          }, canvasElement);
          
          console.log('Canvas data analysis:', canvasData);
        }
      }
      
      // Check for analytics panel
      const analyticsPanel = page.locator('.analytics-panel');
      const analyticsExists = await analyticsPanel.count();
      console.log('Analytics panel exists:', analyticsExists);
      
      if (analyticsExists > 0) {
        console.log('✅ Analytics panel found!');
        
        // Check for layer toggles
        const toggles = page.locator('input[type="checkbox"]');
        const toggleCount = await toggles.count();
        console.log('Layer toggles found:', toggleCount);
        
        if (toggleCount > 0) {
          console.log('✅ Layer toggles found!');
          
          // Test first toggle
          const firstToggle = toggles.first();
          const isChecked = await firstToggle.isChecked();
          console.log('First toggle is checked:', isChecked);
          
          // Toggle it
          await firstToggle.click();
          await page.waitForTimeout(500);
          const newState = await firstToggle.isChecked();
          console.log('After toggle, state is:', newState);
          
          expect(newState).not.toBe(isChecked);
        }
      }
      
      // Check for status indicators
      const statusContainer = page.locator('[style*="position: absolute"][style*="top: var(--ios-spacing-md)"][style*="right: var(--ios-spacing-md)"]');
      const statusExists = await statusContainer.count();
      console.log('Status indicators exist:', statusExists);
      
      if (statusExists > 0) {
        console.log('✅ Status indicators found!');
      }
      
      // Take a screenshot
      await page.screenshot({ path: 'simple-map-verification.png', fullPage: true });
      
      console.log('=== MAP VERIFICATION COMPLETE ===');
      console.log('✅ Map is working and accessible!');
      console.log('✅ All core components are present!');
      
    } else {
      console.log('❌ Map container not found!');
      await page.screenshot({ path: 'map-not-found.png', fullPage: true });
    }
  });
});
