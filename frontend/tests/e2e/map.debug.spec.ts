import { test, expect } from '@playwright/test';

test.describe('Map Debug Tests', () => {
  test('debug map loading', async ({ page }) => {
    // Navigate to dashboard with test mode enabled
    await page.goto('/?test=true');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if test mode is detected
    const testModeDetected = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             window.location.search.includes('test=true');
    });
    
    console.log('Test mode detected:', testModeDetected);
    
    // Check if Mapbox token is available
    const mapboxToken = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             window.location.search.includes('test=true');
    });
    
    console.log('Mapbox token available:', !!mapboxToken);
    
    // Check what's actually being rendered
    const pageContent = await page.content();
    console.log('Page content includes map:', pageContent.includes('map-container'));
    console.log('Page content includes MapContainer3D:', pageContent.includes('MapContainer3D'));
    
    // Check if map container exists
    const mapContainer = page.locator('.mapboxgl-map').first();
    const containerExists = await mapContainer.isVisible().catch(() => false);
    
    console.log('Map container exists:', containerExists);
    
    // Check if any map-related elements exist
    const mapElements = await page.locator('[class*="map"], [id*="map"]').count();
    console.log('Map elements count:', mapElements);
    
    // Check for Mapbox GL elements
    const mapboxElements = await page.locator('.mapboxgl-map, .mapboxgl-canvas').count();
    console.log('Mapbox elements count:', mapboxElements);
    
    // Check if map is actually visible
    const mapVisible = await page.locator('.mapboxgl-map').isVisible().catch(() => false);
    console.log('Mapbox map visible:', mapVisible);
    
    // Check for console errors
    const consoleErrors = await page.evaluate(() => {
      return (window as any).__consoleErrors || [];
    });
    
    console.log('Console errors:', consoleErrors);
    
    // Check if map instance is exposed
    const mapInstance = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             typeof window.__map !== 'undefined';
    });
    
    console.log('Map instance exposed:', mapInstance);
    
    // Check if map is loaded
    const mapLoaded = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             window.__map && 
             window.__map.isStyleLoaded && 
             window.__map.isStyleLoaded();
    });
    
    console.log('Map style loaded:', mapLoaded);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/debug-map-loading.png' });
    
    // Basic assertions
    expect(testModeDetected).toBe(true);
    expect(!!mapboxToken).toBe(true);
    expect(containerExists).toBe(true);
  });
  
  test('debug map provider initialization', async ({ page }) => {
    await page.goto('/?test=true');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if map provider is created
    const mapProviderExists = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             typeof window.__mapTestApi3D__ !== 'undefined';
    });
    
    console.log('Map provider exists:', mapProviderExists);
    
    // Check map provider methods
    const mapProviderMethods = await page.evaluate(() => {
      if (typeof window !== 'undefined' && window.__mapTestApi3D__) {
        return Object.keys(window.__mapTestApi3D__);
      }
      return [];
    });
    
    console.log('Map provider methods:', mapProviderMethods);
    
    // Check if map is ready
    const mapReady = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             window.__mapReady3D === true;
    });
    
    console.log('Map ready:', mapReady);
    
    // Wait a bit more for map to potentially load
    await page.waitForTimeout(5000);
    
    // Check again if map is loaded
    const mapLoadedAfterWait = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             window.__map && 
             window.__map.isStyleLoaded && 
             window.__map.isStyleLoaded();
    });
    
    console.log('Map loaded after wait:', mapLoadedAfterWait);
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/debug-map-provider.png' });
  });
});
