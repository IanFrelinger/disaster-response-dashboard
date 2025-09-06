import { test, expect, Page } from '@playwright/test';

/**
 * Detailed validation debug test to capture specific layer validation errors
 */

test.describe('Detailed Validation Debug', () => {
  test('capture detailed validation results and errors', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    
    // Wait for map to fully initialize
    await page.waitForTimeout(8000);
    
    // Get detailed validation results
    const validationResults = await page.evaluate(async () => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { error: 'Validation API not available' };
      }
      
      try {
        const results = await api.validateLayers();
        return {
          success: true,
          results: results
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    console.log('🔍 Detailed Validation Results:');
    console.log('================================');
    console.log(JSON.stringify(validationResults, null, 2));
    
    // Check each layer individually
    if (validationResults.success && validationResults.results) {
      const results = validationResults.results;
      
      console.log('\n📊 Layer-by-Layer Analysis:');
      console.log('============================');
      
      // Terrain layer
      if (results.terrain) {
        console.log('\n🗻 TERRAIN LAYER:');
        console.log(`  Success: ${results.terrain.success}`);
        console.log(`  Enabled: ${results.terrain.enabled}`);
        console.log(`  Rendered: ${results.terrain.rendered}`);
        console.log(`  Interactive: ${results.terrain.interactive}`);
        console.log(`  Errors: ${JSON.stringify(results.terrain.errors)}`);
        console.log(`  Performance: ${JSON.stringify(results.terrain.performance)}`);
      }
      
      // Buildings layer
      if (results.buildings) {
        console.log('\n🏢 BUILDINGS LAYER:');
        console.log(`  Success: ${results.buildings.success}`);
        console.log(`  Enabled: ${results.buildings.enabled}`);
        console.log(`  Rendered: ${results.buildings.rendered}`);
        console.log(`  Interactive: ${results.buildings.interactive}`);
        console.log(`  Errors: ${JSON.stringify(results.buildings.errors)}`);
        console.log(`  Performance: ${JSON.stringify(results.buildings.performance)}`);
      }
      
      // Hazards layer
      if (results.hazards) {
        console.log('\n⚠️ HAZARDS LAYER:');
        console.log(`  Success: ${results.hazards.success}`);
        console.log(`  Enabled: ${results.hazards.enabled}`);
        console.log(`  Rendered: ${results.hazards.rendered}`);
        console.log(`  Interactive: ${results.hazards.interactive}`);
        console.log(`  Errors: ${JSON.stringify(results.hazards.errors)}`);
        console.log(`  Performance: ${JSON.stringify(results.hazards.performance)}`);
      }
      
      // Units layer
      if (results.units) {
        console.log('\n🚑 UNITS LAYER:');
        console.log(`  Success: ${results.units.success}`);
        console.log(`  Enabled: ${results.units.enabled}`);
        console.log(`  Rendered: ${results.units.rendered}`);
        console.log(`  Interactive: ${results.units.interactive}`);
        console.log(`  Errors: ${JSON.stringify(results.units.errors)}`);
        console.log(`  Performance: ${JSON.stringify(results.units.performance)}`);
      }
      
      // Routes layer
      if (results.routes) {
        console.log('\n🛣️ ROUTES LAYER:');
        console.log(`  Success: ${results.routes.success}`);
        console.log(`  Enabled: ${results.routes.enabled}`);
        console.log(`  Rendered: ${results.routes.rendered}`);
        console.log(`  Interactive: ${results.routes.interactive}`);
        console.log(`  Errors: ${JSON.stringify(results.routes.errors)}`);
        console.log(`  Performance: ${JSON.stringify(results.routes.performance)}`);
      }
      
      // Overall results
      if (results.overall) {
        console.log('\n📈 OVERALL RESULTS:');
        console.log(`  Success: ${results.overall.success}`);
        console.log(`  Total Layers: ${results.overall.totalLayers}`);
        console.log(`  Successful Layers: ${results.overall.successfulLayers}`);
        console.log(`  Errors: ${JSON.stringify(results.overall.errors)}`);
      }
    }
    
    // Also check the map state directly
    const mapState = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api) return { error: 'API not available' };
      
      try {
        const map = api.getMapInstance();
        if (!map) return { error: 'Map not available' };
        
        const style = map.getStyle();
        const sources = Object.keys(style.sources || {});
        const layers = (style.layers || []).map((layer: any) => layer.id);
        
        return {
          mapReady: map.isStyleLoaded() && (map.isLoaded ? map.isLoaded() : true),
          styleLoaded: map.isStyleLoaded(),
          sources: sources,
          layers: layers,
          customSources: ['hazards', 'units', 'routes'].map(id => ({
            id,
            exists: sources.includes(id),
            source: map.getSource(id) ? 'available' : 'null'
          })),
          customLayers: ['hazards', 'units', 'routes', '3d-buildings'].map(id => ({
            id,
            exists: layers.includes(id),
            layer: map.getLayer(id) ? 'available' : 'null'
          }))
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });
    
    console.log('\n🗺️ MAP STATE ANALYSIS:');
    console.log('========================');
    console.log(JSON.stringify(mapState, null, 2));
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'test-results/detailed-validation-debug.png', fullPage: true });
    
    // Basic assertions
    expect(validationResults.success).toBe(true);
    expect(validationResults.results).toBeDefined();
    expect(mapState.mapReady).toBe(true);
  });
});
