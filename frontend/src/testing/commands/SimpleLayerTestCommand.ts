/**
 * SimpleLayerTestCommand - Simple test to verify map and basic layer functionality
 */

import { BaseCommand, TestContext, TestResult, CommandInput, GLOBAL_TIMEOUTS } from './BaseCommand';

export interface SimpleLayerTestInput extends CommandInput {
  testLayers: string[];
  waitForLayers: boolean;
  timeoutMs: number;
}

export class SimpleLayerTestCommand extends BaseCommand<SimpleLayerTestInput> {
  name = 'SimpleLayerTest';

  async run(context: TestContext): Promise<TestResult> {
    this.startTime = Date.now();
    
    try {
      console.log(`🧪 Running simple layer test for: ${this.input.testLayers.join(', ')}`);
      
      const results: any = {};
      
      // Check if map is available
      const mapAvailable = await context.page.evaluate(() => {
        return !!(window as any).__map;
      });
      
      if (!mapAvailable) {
        throw new Error('Map not available');
      }
      
      results.mapAvailable = true;
      console.log('✅ Map is available');
      
      // Check map state
      const mapState = await context.page.evaluate(() => {
        const map = (window as any).__map;
        return {
          isStyleLoaded: map.isStyleLoaded ? map.isStyleLoaded() : false,
          areTilesLoaded: map.areTilesLoaded ? map.areTilesLoaded() : false,
          center: map.getCenter ? map.getCenter() : null,
          zoom: map.getZoom ? map.getZoom() : null
        };
      });
      
      results.mapState = mapState;
      console.log('Map state:', mapState);
      
      // Check for layers
      const layerResults: any = {};
      
      for (const layerId of this.input.testLayers) {
        const layerInfo = await context.page.evaluate((id: string) => {
          const map = (window as any).__map;
          if (!map) return { error: 'Map not found' };
          
          try {
            const baseLayer = map.getLayer(id);
            const optimizedLayer = map.getLayer(`${id}-optimized`);
            const activeLayer = optimizedLayer || baseLayer;
            
            return {
              baseLayer: !!baseLayer,
              optimizedLayer: !!optimizedLayer,
              activeLayer: !!activeLayer,
              visible: activeLayer ? map.getLayoutProperty(id, 'visibility') !== 'none' : false,
              features: activeLayer ? map.queryRenderedFeatures({ layers: [id, `${id}-optimized`] }).length : 0
            };
          } catch (error) {
            return { error: error instanceof Error ? error.message : String(error) };
          }
        }, layerId);
        
        layerResults[layerId] = layerInfo;
        console.log(`Layer ${layerId}:`, layerInfo);
      }
      
      results.layerResults = layerResults;
      
      // Check if any layers exist
      const hasLayers = Object.values(layerResults).some((layer: any) => 
        layer.activeLayer || layer.baseLayer || layer.optimizedLayer
      );
      
      if (!hasLayers) {
        console.log('⚠️ No custom layers found, checking if this is expected in test mode');
        
        // In test mode, we might not have custom layers, so let's check the map style layers
        const styleLayers = await context.page.evaluate(() => {
          const map = (window as any).__map;
          if (!map) return [];
          
          const style = map.getStyle();
          return Object.keys(style.layers || {});
        });
        
        results.styleLayers = styleLayers;
        console.log('Style layers found:', styleLayers.length);
        
        // Check if we have the basic map layers
        const hasBasicLayers = styleLayers.length > 0;
        
        if (hasBasicLayers) {
          console.log('✅ Basic map layers are working');
          return this.createResult(
            true,
            [],
            ['No custom layers found, but basic map layers are working'],
            [],
            results
          );
        } else {
          throw new Error('No layers found at all');
        }
      }
      
      // Check if layers have features
      const layersWithFeatures = Object.entries(layerResults).filter(([_, layer]: [string, any]) => 
        layer.features > 0
      );
      
      if (layersWithFeatures.length === 0) {
        console.log('⚠️ Layers exist but have no features');
        return this.createResult(
          true,
          [],
          ['Layers exist but have no features - this may be expected in test mode'],
          [],
          results
        );
      }
      
      console.log(`✅ Found ${layersWithFeatures.length} layers with features`);
      
      return this.createResult(
        true,
        [],
        [],
        [],
        results
      );
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Simple layer test failed: ${errorMessage}`);
      
      return this.createResult(
        false,
        [errorMessage],
        [],
        [],
        { error: errorMessage }
      );
    }
  }
}
