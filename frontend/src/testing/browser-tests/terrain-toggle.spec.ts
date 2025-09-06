import { test, expect } from '@playwright/test';

test.describe('Terrain Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map view
    await page.goto('/');
    
    // Wait for the app to be ready
    await page.waitForFunction(() => (window as any).__appIdle === true, { timeout: 10000 });
    
    // Navigate to map view
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to be ready
    await page.waitForFunction(() => (window as any).__mapReady === true, { timeout: 15000 });
  });

  test('terrain toggle truly enables and disables terrain', async ({ page }) => {
    // Get the terrain toggle button
    const terrainToggle = page.getByTestId('toggle-terrain').or(
      page.locator('input[type="checkbox"]').filter({ hasText: /terrain/i })
    );
    
    // Ensure terrain is initially disabled
    await expect(terrainToggle).not.toBeChecked();
    
    // Check that terrain is initially disabled via test API
    const initialTerrainState = await page.evaluate(() => 
      (window as any).__mapTestApi__?.hasTerrain?.() || false
    );
    expect(initialTerrainState).toBe(false);
    
    // Click to enable terrain
    await terrainToggle.click();
    
    // Wait a moment for terrain to be applied
    await page.waitForTimeout(1000);
    
    // Check that terrain is now enabled
    const terrainEnabled = await page.evaluate(() => 
      (window as any).__mapTestApi__?.hasTerrain?.() || false
    );
    expect(terrainEnabled).toBe(true);
    
    // Click to disable terrain
    await terrainToggle.click();
    
    // Wait a moment for terrain to be disabled
    await page.waitForTimeout(1000);
    
    // Check that terrain is now disabled
    const terrainDisabled = await page.evaluate(() => 
      (window as any).__mapTestApi__?.hasTerrain?.() || false
    );
    expect(terrainDisabled).toBe(false);
  });

  test('terrain toggle works with keyboard navigation', async ({ page }) => {
    // Focus on the terrain toggle
    const terrainToggle = page.getByTestId('toggle-terrain').or(
      page.locator('input[type="checkbox"]').filter({ hasText: /terrain/i })
    );
    
    await terrainToggle.focus();
    
    // Use space key to toggle
    await page.keyboard.press('Space');
    
    // Wait for terrain to be applied
    await page.waitForTimeout(1000);
    
    // Check that terrain is enabled
    const terrainEnabled = await page.evaluate(() => 
      (window as any).__mapTestApi__?.hasTerrain?.() || false
    );
    expect(terrainEnabled).toBe(true);
    
    // Use space key to toggle again
    await page.keyboard.press('Space');
    
    // Wait for terrain to be disabled
    await page.waitForTimeout(1000);
    
    // Check that terrain is disabled
    const terrainDisabled = await page.evaluate(() => 
      (window as any).__mapTestApi__?.hasTerrain?.() || false
    );
    expect(terrainDisabled).toBe(false);
  });

  test('terrain elevation query works when terrain is enabled', async ({ page }) => {
    // Enable terrain first
    const terrainToggle = page.getByTestId('toggle-terrain').or(
      page.locator('input[type="checkbox"]').filter({ hasText: /terrain/i })
    );
    
    await terrainToggle.click();
    await page.waitForTimeout(1000);
    
    // Query elevation at a known coordinate (San Francisco)
    const elevation = await page.evaluate(async () => {
      const testApi = (window as any).__mapTestApi__;
      if (testApi?.queryTerrainElevation) {
        return await testApi.queryTerrainElevation(-122.4194, 37.7749);
      }
      return null;
    });
    
    // Should get a finite elevation value
    expect(typeof elevation).toBe('number');
    expect(elevation).toBeGreaterThan(0);
    expect(elevation).toBeLessThan(1000); // San Francisco elevation should be reasonable
  });

  test('terrain toggle maintains state across style changes', async ({ page }) => {
    // Enable terrain
    const terrainToggle = page.getByTestId('toggle-terrain').or(
      page.locator('input[type="checkbox"]').filter({ hasText: /terrain/i })
    );
    
    await terrainToggle.click();
    await page.waitForTimeout(1000);
    
    // Verify terrain is enabled
    let terrainEnabled = await page.evaluate(() => 
      (window as any).__mapTestApi__?.hasTerrain?.() || false
    );
    expect(terrainEnabled).toBe(true);
    
    // Change map style (if style selector exists)
    const styleSelector = page.locator('select[name="style"], [data-testid="style-selector"]');
    if (await styleSelector.isVisible()) {
      await styleSelector.selectOption('satellite');
      await page.waitForTimeout(2000);
      
      // Terrain should still be enabled after style change
      terrainEnabled = await page.evaluate(() => 
        (window as any).__mapTestApi__?.hasTerrain?.() || false
      );
      expect(terrainEnabled).toBe(true);
    }
  });

  test('terrain toggle shows proper visual feedback', async ({ page }) => {
    const terrainToggle = page.getByTestId('toggle-terrain').or(
      page.locator('input[type="checkbox"]').filter({ hasText: /terrain/i })
    );
    
    // Check initial state
    await expect(terrainToggle).not.toBeChecked();
    
    // Toggle and check visual state
    await terrainToggle.click();
    await expect(terrainToggle).toBeChecked();
    
    // Toggle again and check visual state
    await terrainToggle.click();
    await expect(terrainToggle).not.toBeChecked();
  });

  test('terrain toggle works with other layer toggles', async ({ page }) => {
    // Enable terrain
    const terrainToggle = page.getByTestId('toggle-terrain').or(
      page.locator('input[type="checkbox"]').filter({ hasText: /terrain/i })
    );
    
    await terrainToggle.click();
    await page.waitForTimeout(1000);
    
    // Enable other layers
    const buildingsToggle = page.locator('input[type="checkbox"]').filter({ hasText: /buildings/i });
    const hazardsToggle = page.locator('input[type="checkbox"]').filter({ hasText: /hazards/i });
    
    if (await buildingsToggle.isVisible()) {
      await buildingsToggle.click();
    }
    
    if (await hazardsToggle.isVisible()) {
      await hazardsToggle.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Terrain should still be enabled
    const terrainEnabled = await page.evaluate(() => 
      (window as any).__mapTestApi__?.hasTerrain?.() || false
    );
    expect(terrainEnabled).toBe(true);
  });

  test('terrain toggle handles errors gracefully', async ({ page }) => {
    // Mock a terrain error
    await page.evaluate(() => {
      const testApi = (window as any).__mapTestApi__;
      if (testApi) {
        const originalSetTerrain = testApi.setTerrainEnabled;
        testApi.setTerrainEnabled = () => {
          throw new Error('Terrain failed to load');
        };
      }
    });
    
    const terrainToggle = page.getByTestId('toggle-terrain').or(
      page.locator('input[type="checkbox"]').filter({ hasText: /terrain/i })
    );
    
    // Should not crash when clicking toggle
    await terrainToggle.click();
    
    // Wait for any error handling
    await page.waitForTimeout(1000);
    
    // App should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});
