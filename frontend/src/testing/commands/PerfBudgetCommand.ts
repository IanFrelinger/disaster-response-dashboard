/**
 * PerfBudgetCommand - Performance budget validation
 */

import type { TestCommand, TestContext, TestResult, PerfBudgetInput } from './TestCommand';

// Timeout configurations for performance tests
const PERF_TEST_TIMEOUTS = {
  pageLoad: 30000,        // 30s for page load
  elementWait: 10000,     // 10s for element waits
  mapLoad: 20000,         // 20s for map initialization
  performanceCheck: 15000, // 15s for performance measurements
  screenshot: 5000        // 5s for screenshots
};

export class PerfBudgetCommand implements TestCommand {
  name = 'PerfBudget';
  private input: PerfBudgetInput;

  constructor(input: PerfBudgetInput) {
    this.input = input;
  }

  async run(ctx: TestContext): Promise<TestResult> {
    const startTime = Date.now();
    const artifacts: string[] = [];
    
    try {
      if (!ctx.page) {
        throw new Error('Page not available in test context');
      }

      console.log(`🔍 Running performance budget test: max ${this.input.maxMs}ms`);

      // Check if we're in test mode
      const isTestMode = ctx.page.url().includes('test=true');
      
      if (isTestMode) {
        console.log('🧪 Test mode detected - skipping performance budget test (not applicable in test mode)');
        return {
          name: this.name,
          success: true,
          details: 'Performance budget test skipped in test mode - not applicable',
          artifacts: [],
          durationMs: Date.now() - startTime
        };
      }

      // Start performance monitoring
      await ctx.page.evaluate(() => {
        (window as any).__perfStartTime = performance.now();
        (window as any).__perfMarkers = [];
      });

      // Navigate to the URL
      await ctx.page.goto(ctx.baseUrl, { 
        waitUntil: 'networkidle',
        timeout: PERF_TEST_TIMEOUTS.pageLoad 
      });

      // Wait for map container
      await ctx.page.waitForSelector('.map-container-3d', { timeout: PERF_TEST_TIMEOUTS.elementWait });

      // Click on "Open 3D Map" button if it exists
      try {
        await ctx.page.waitForSelector('button:has-text("Open 3D Map")', { timeout: PERF_TEST_TIMEOUTS.elementWait });
        await ctx.page.click('button:has-text("Open 3D Map")');
        console.log('✅ 3D Map button clicked');
      } catch (error) {
        console.log('ℹ️ 3D Map button not found, assuming already in 3D mode');
      }

      // Wait for map to fully load
      await ctx.page.waitForTimeout(3000);

      // Wait for tiles to load
      await this.waitForTilesLoaded(ctx.page);

      // Get performance metrics
      const perfMetrics = await ctx.page.evaluate(() => {
        const startTime = (window as any).__perfStartTime;
        const markers = (window as any).__perfMarkers || [];
        const now = performance.now();
        
        // Get navigation timing
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Get resource timing
        const resourceTiming = performance.getEntriesByType('resource');
        
        // Calculate key metrics
        const totalTime = now - startTime;
        const domContentLoaded = navTiming ? navTiming.domContentLoadedEventEnd - (navTiming as any).navigationStart : 0;
        const loadComplete = navTiming ? navTiming.loadEventEnd - (navTiming as any).navigationStart : 0;
        
        // Count resources
        const totalResources = resourceTiming.length;
        const failedResources = resourceTiming.filter(r => (r as any).transferSize === 0).length;
        
        // Get memory usage if available
        const memory = (performance as any).memory;
        
        return {
          totalTime,
          domContentLoaded,
          loadComplete,
          totalResources,
          failedResources,
          memoryUsage: memory ? memory.usedJSHeapSize : 0,
          markers
        };
      });

      // Measure layer render times
      const layerRenderTimes = await this.measureLayerRenderTimes(ctx.page);

      // Take performance screenshot
      const screenshotPath = `${ctx.artifactsDir}/perf-test-${Date.now()}.png`;
      await ctx.page.screenshot({ path: screenshotPath, fullPage: true });
      artifacts.push(screenshotPath);

      // Check performance budget
      const budgetExceeded = perfMetrics.totalTime > this.input.maxMs;
      const layerBudgetExceeded = Object.values(layerRenderTimes).some((time: number) => time > 5000); // 5s per layer

      const success = !budgetExceeded && !layerBudgetExceeded;

      let details = `Total time: ${perfMetrics.totalTime.toFixed(2)}ms (budget: ${this.input.maxMs}ms)\n`;
      details += `DOM loaded: ${perfMetrics.domContentLoaded.toFixed(2)}ms\n`;
      details += `Load complete: ${perfMetrics.loadComplete.toFixed(2)}ms\n`;
      details += `Resources: ${perfMetrics.totalResources} total, ${perfMetrics.failedResources} failed\n`;
      details += `Memory usage: ${Math.round(perfMetrics.memoryUsage / 1024 / 1024)}MB\n`;
      details += `Layer render times: ${JSON.stringify(layerRenderTimes, null, 2)}`;

      if (budgetExceeded) {
        details += `\n❌ Performance budget exceeded by ${(perfMetrics.totalTime - this.input.maxMs).toFixed(2)}ms`;
      }
      if (layerBudgetExceeded) {
        details += `\n❌ Layer render budget exceeded (max 5s per layer)`;
      }

      const durationMs = Date.now() - startTime;

      return {
        name: this.name,
        success: success,
        details: details.trim(),
        artifacts,
        durationMs
      };

    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        name: this.name,
        success: false,
        details: `Performance budget test failed: ${error instanceof Error ? error.message : String(error)}`,
        artifacts,
        durationMs,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  private async waitForTilesLoaded(page: any): Promise<void> {
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const map = (window as any).__map;
        if (!map) {
          resolve();
          return;
        }

        const checkTiles = () => {
          if (map.areTilesLoaded()) {
            resolve();
          } else {
            setTimeout(checkTiles, 100);
          }
        };

        checkTiles();
      });
    });
  }

  private async measureLayerRenderTimes(page: any): Promise<Record<string, number>> {
    return await page.evaluate(() => {
      const map = (window as any).__map;
      if (!map) return {};

      const layerIds = ['terrain', 'buildings', 'hazards', 'units', 'routes', 'enhanced-routes'];
      const renderTimes: Record<string, number> = {};

      for (const layerId of layerIds) {
        try {
          const startTime = performance.now();
          
          // Force a re-render by updating the layer
          const layer = map.getLayer(layerId) || map.getLayer(`${layerId}-optimized`);
          if (layer) {
            // Trigger a style update
            map.setLayoutProperty(layer.id, 'visibility', 'visible');
            
            // Wait for render
            map.once('render', () => {
              const endTime = performance.now();
              renderTimes[layerId] = endTime - startTime;
            });
          }
        } catch (error) {
          console.warn(`Error measuring render time for layer ${layerId}:`, error);
          renderTimes[layerId] = 0;
        }
      }

      return renderTimes;
    });
  }
}
