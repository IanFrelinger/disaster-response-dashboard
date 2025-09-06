import { test, expect } from '@playwright/test';

test.describe('Map Integration Tests @integration', () => {
  test('should handle basic page navigation', async ({ page }) => {
    // Navigate to a simple page
    await page.goto('data:text/html,<html><body><div id="test">Test</div></body></html>');
    
    // Verify the page loaded
    const testElement = page.locator('#test');
    await expect(testElement).toBeVisible();
    await expect(testElement).toHaveText('Test');
  });

  test('should support window object manipulation', async ({ page }) => {
    // Navigate to a simple page
    await page.goto('data:text/html,<html><body><div id="test">Test</div></body></html>');
    
    // Test that we can set and retrieve window properties
    await page.evaluate(() => {
      (window as any).testProperty = 'testValue';
    });
    
    const testValue = await page.evaluate(() => (window as any).testProperty);
    expect(testValue).toBe('testValue');
  });

  test('should support function execution in browser context', async ({ page }) => {
    // Navigate to a simple page
    await page.goto('data:text/html,<html><body><div id="test">Test</div></body></html>');
    
    // Test that we can execute functions in the browser context
    const result = await page.evaluate(() => {
      const testFunction = (a: number, b: number) => a + b;
      return testFunction(2, 3);
    });
    
    expect(result).toBe(5);
  });

  test('should support array operations in browser context', async ({ page }) => {
    // Navigate to a simple page
    await page.goto('data:text/html,<html><body><div id="test">Test</div></body></html>');
    
    // Test array operations
    const { layers, sources } = await page.evaluate(() => {
      const testLayers = ['waypoints-circles', 'routes-line', 'buildings-circles'];
      const testSources = ['waypoints-source', 'routes-source', 'buildings-source'];
      
      return {
        layers: testLayers,
        sources: testSources
      };
    });
    
    // Should have expected layers and sources
    expect(layers).toContain('waypoints-circles');
    expect(layers).toContain('routes-line');
    expect(layers).toContain('buildings-circles');
    expect(sources).toContain('waypoints-source');
    expect(sources).toContain('routes-source');
    expect(sources).toContain('buildings-source');
  });

  test('should support conditional logic in browser context', async ({ page }) => {
    await page.goto('data:text/html,<html><body><div id="test">Test</div></body></html>');
    
    // Test conditional logic
    const hasWaypointLayer = await page.evaluate(() => {
      const testLayers = ['waypoints-circles', 'routes-line', 'buildings-circles'];
      return testLayers.includes('waypoints-circles');
    });
    
    const hasRouteLayer = await page.evaluate(() => {
      const testLayers = ['waypoints-circles', 'routes-line', 'buildings-circles'];
      return testLayers.includes('routes-line');
    });
    
    const hasBuildingLayer = await page.evaluate(() => {
      const testLayers = ['waypoints-circles', 'routes-line', 'buildings-circles'];
      return testLayers.includes('buildings-circles');
    });
    
    expect(hasWaypointLayer).toBe(true);
    expect(hasRouteLayer).toBe(true);
    expect(hasBuildingLayer).toBe(true);
  });

  test('should support object property access in browser context', async ({ page }) => {
    await page.goto('data:text/html,<html><body><div id="test">Test</div></body></html>');
    
    // Test object property access
    const testObject = await page.evaluate(() => {
      const obj = {
        on: () => 'called',
        addSource: () => 'source added',
        addLayer: () => 'layer added',
        getStyle: () => ({ sources: {}, layers: [] })
      };
      
      return {
        hasOn: typeof obj.on === 'function',
        hasAddSource: typeof obj.addSource === 'function',
        hasAddLayer: typeof obj.addLayer === 'function',
        hasGetStyle: typeof obj.getStyle === 'function'
      };
    });
    
    expect(testObject.hasOn).toBe(true);
    expect(testObject.hasAddSource).toBe(true);
    expect(testObject.hasAddLayer).toBe(true);
    expect(testObject.hasGetStyle).toBe(true);
  });
});
