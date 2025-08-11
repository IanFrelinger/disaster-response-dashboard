import { test, expect } from '@playwright/test';

test.describe('Navigation Test - 3D Terrain Removed', () => {
  test('should have correct navigation segments without 3D Terrain', async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('=== NAVIGATION TEST - 3D TERRAIN REMOVED ===');
    
    // Check that 3D Terrain button is NOT present
    const terrainButton = page.locator('text=🏗️ 3D Terrain');
    const terrainButtonCount = await terrainButton.count();
    expect(terrainButtonCount).toBe(0);
    console.log('✅ 3D Terrain button successfully removed');
    
    // Check that other navigation segments are present
    const expectedSegments = [
      '📊 Dashboard',
      '🗺️ Live Map', 
      '🌤️ Weather',
      '🏢 Buildings'
    ];
    
    for (const segmentText of expectedSegments) {
      const segment = page.locator(`text=${segmentText}`);
      await expect(segment).toBeVisible();
      console.log(`✅ Navigation segment found: ${segmentText}`);
    }
    
    // Test navigation to each remaining view
    for (const segmentText of expectedSegments) {
      const segment = page.locator(`text=${segmentText}`);
      await segment.click();
      await page.waitForTimeout(1000);
      
      // Verify the segment is now active
      const activeSegment = page.locator('.ios-segment.active');
      const activeText = await activeSegment.textContent();
      expect(activeText).toContain(segmentText.replace(/[📊🗺️🌤️🏢]/g, '').trim());
      console.log(`✅ Navigation to ${segmentText} working correctly`);
    }
    
    console.log('✅ All navigation tests passed - 3D Terrain successfully removed');
  });
});
