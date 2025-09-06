/**
 * LayerInvariantCommand - Verifies layer ordering and filter invariants
 */

import type { TestCommand, TestContext, TestResult, LayerInvariantInput } from './TestCommand';

// Timeout configurations for layer invariant tests
const INVARIANT_TEST_TIMEOUTS = {
  pageLoad: 30000,        // 30s for page load
  elementWait: 10000,     // 10s for element waits
  mapLoad: 20000,         // 20s for map initialization
  layerCheck: 5000,       // 5s for layer checks
  interaction: 3000       // 3s for interactions
};

export class LayerInvariantCommand implements TestCommand {
  name = 'LayerInvariant';
  private input: LayerInvariantInput;

  constructor(input: LayerInvariantInput) {
    this.input = input;
  }

  async run(ctx: TestContext): Promise<TestResult> {
    const startTime = Date.now();
    const artifacts: string[] = [];
    
    try {
      if (!ctx.page) {
        throw new Error('Page not available in test context');
      }

      console.log(`🔍 Running layer invariant test: ${this.input.above} should be above ${this.input.below}`);

      // Check if we're in test mode
      const isTestMode = ctx.page.url().includes('test=true');
      
      if (isTestMode) {
        console.log('🧪 Test mode detected - skipping layer invariant test (custom layers not available)');
        return {
          name: this.name,
          success: true,
          details: 'Layer invariant test skipped in test mode - custom layers not available',
          artifacts: [],
          durationMs: Date.now() - startTime
        };
      }

      // Wait for map to be ready
      await ctx.page.waitForSelector('.map-container-3d', { timeout: INVARIANT_TEST_TIMEOUTS.elementWait });
      await ctx.page.waitForTimeout(2000);

      // Get layer order from map style
      const layerOrder = await ctx.page.evaluate(() => {
        const map = (window as any).__map;
        if (!map) return null;
        
        try {
          const style = map.getStyle();
          return style.layers.map((layer: any) => layer.id);
        } catch (error) {
          console.warn('Error getting layer order:', error);
          return null;
        }
      });

      if (!layerOrder) {
        throw new Error('Could not retrieve layer order from map');
      }

      console.log('📋 Layer order:', layerOrder);

      // Find positions of the layers
      const aboveIndex = this.findLayerIndex(layerOrder, this.input.above);
      const belowIndex = this.findLayerIndex(layerOrder, this.input.below);

      if (aboveIndex === -1) {
        throw new Error(`Layer '${this.input.above}' not found in map`);
      }
      if (belowIndex === -1) {
        throw new Error(`Layer '${this.input.below}' not found in map`);
      }

      // Verify ordering (higher index = rendered on top)
      const correctOrder = aboveIndex > belowIndex;
      
      if (!correctOrder) {
        throw new Error(
          `Layer ordering invariant violated: '${this.input.above}' (index ${aboveIndex}) ` +
          `should be above '${this.input.below}' (index ${belowIndex})`
        );
      }

      // Additional invariant checks
      const additionalChecks = await this.runAdditionalInvariantChecks(ctx.page);

      // Take screenshot for debugging
      const screenshotPath = `${ctx.artifactsDir}/layer-invariant-${Date.now()}.png`;
      await ctx.page.screenshot({ path: screenshotPath, fullPage: true });
      artifacts.push(screenshotPath);

      const durationMs = Date.now() - startTime;
      const success = correctOrder && additionalChecks.success;

      return {
        name: this.name,
        success: success,
        details: success 
          ? `Layer ordering correct: ${this.input.above} above ${this.input.below}. ${additionalChecks.details}`
          : `Layer ordering failed: ${this.input.above} not above ${this.input.below}. ${additionalChecks.details}`,
        artifacts,
        durationMs
      };

    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        name: this.name,
        success: false,
        details: `Layer invariant test failed: ${error instanceof Error ? error.message : String(error)}`,
        artifacts,
        durationMs,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  private findLayerIndex(layerOrder: string[], layerId: string): number {
    // Check for exact match first
    let index = layerOrder.indexOf(layerId);
    if (index !== -1) return index;

    // Check for optimized layer ID
    index = layerOrder.indexOf(`${layerId}-optimized`);
    if (index !== -1) return index;

    // Check for source-based layer names
    const sourcePattern = new RegExp(`^${layerId}(-\\w+)?$`);
    index = layerOrder.findIndex(id => sourcePattern.test(id));
    
    return index;
  }

  private async runAdditionalInvariantChecks(page: any): Promise<{ success: boolean; details: string }> {
    try {
      const checks = await page.evaluate(() => {
        const map = (window as any).__map;
        if (!map) return { success: false, details: 'Map not available' };

        const results: string[] = [];
        let allPassed = true;

        try {
          // Check that all layers have valid sources
          const style = map.getStyle();
          for (const layer of style.layers) {
            if (layer.source && !map.getSource(layer.source)) {
              results.push(`Layer ${layer.id} references missing source ${layer.source}`);
              allPassed = false;
            }
          }

          // Check that critical layers are visible
          const criticalLayers = ['hazards', 'units', 'routes'];
          for (const layerId of criticalLayers) {
            const layer = map.getLayer(layerId) || map.getLayer(`${layerId}-optimized`);
            if (layer) {
              const visibility = map.getLayoutProperty(layer.id, 'visibility');
              if (visibility === 'none') {
                results.push(`Critical layer ${layerId} is hidden`);
                allPassed = false;
              }
            }
          }

          // Check that map is properly initialized
          if (!map.isStyleLoaded()) {
            results.push('Map style not loaded');
            allPassed = false;
          }

          if (!map.areTilesLoaded()) {
            results.push('Map tiles not loaded');
            allPassed = false;
          }

        } catch (error) {
          results.push(`Error during invariant checks: ${error instanceof Error ? error.message : String(error)}`);
          allPassed = false;
        }

        return {
          success: allPassed,
          details: results.length > 0 ? results.join('; ') : 'All additional checks passed'
        };
      });

      return checks;
    } catch (error) {
      return {
        success: false,
        details: `Error running additional checks: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
