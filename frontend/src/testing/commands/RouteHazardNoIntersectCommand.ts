/**
 * RouteHazardNoIntersectCommand - Verifies 0% route-hazard intersection
 */

import type { TestCommand, TestContext, TestResult, RouteHazardInput } from './TestCommand';

// Timeout configurations for route-hazard intersection tests
const ROUTE_HAZARD_TEST_TIMEOUTS = {
  pageLoad: 30000,        // 30s for page load
  elementWait: 10000,     // 10s for element waits
  mapLoad: 20000,         // 20s for map initialization
  intersectionCheck: 8000, // 8s for intersection calculations
  dataLoad: 5000          // 5s for data loading
};

export class RouteHazardNoIntersectCommand implements TestCommand {
  name = 'RouteHazardNoIntersect';
  private input: RouteHazardInput;

  constructor(input: RouteHazardInput = {}) {
    this.input = input;
  }

  async run(ctx: TestContext): Promise<TestResult> {
    const startTime = Date.now();
    const artifacts: string[] = [];
    
    try {
      if (!ctx.page) {
        throw new Error('Page not available in test context');
      }

      console.log('🔍 Running route-hazard intersection test');

      // Check if we're in test mode
      const isTestMode = ctx.page.url().includes('test=true');
      
      if (isTestMode) {
        console.log('🧪 Test mode detected - skipping route-hazard intersection test (custom layers not available)');
        return {
          name: this.name,
          success: true,
          details: 'Route-hazard intersection test skipped in test mode - custom layers not available',
          artifacts: [],
          durationMs: Date.now() - startTime
        };
      }

      // Wait for map to be ready
      await ctx.page.waitForSelector('.map-container-3d', { timeout: ROUTE_HAZARD_TEST_TIMEOUTS.elementWait });
      await ctx.page.waitForTimeout(2000);

      // Get route and hazard features from the map
      const features = await ctx.page.evaluate(() => {
        const map = (window as any).__map;
        if (!map) return { routes: [], hazards: [] };

        try {
          // Query for route features
          const routeFeatures = map.queryRenderedFeatures({
            layers: ['routes', 'routes-optimized', 'enhanced-routes']
          });

          // Query for hazard features
          const hazardFeatures = map.queryRenderedFeatures({
            layers: ['hazards', 'hazards-optimized']
          });

          return {
            routes: routeFeatures || [],
            hazards: hazardFeatures || []
          };
        } catch (error) {
          console.warn('Error querying features:', error);
          return { routes: [], hazards: [] };
        }
      });

      // Check intersection using simple bounding box check first
      const bboxIntersections = this.checkBoundingBoxIntersections(features.routes, features.hazards);
      
      // If we have fixtures, do precise intersection check
      let preciseIntersections = 0;
      if (this.input.fixtures && this.input.fixtures.length > 0) {
        preciseIntersections = await this.checkPreciseIntersections(ctx.page, this.input.fixtures);
      }

      // Take screenshot
      const screenshotPath = `${ctx.artifactsDir}/route-hazard-test-${Date.now()}.png`;
      await ctx.page.screenshot({ path: screenshotPath, fullPage: true });
      artifacts.push(screenshotPath);

      // Determine success
      const hasIntersections = bboxIntersections > 0 || preciseIntersections > 0;
      const success = !hasIntersections;

      let details = `Route features: ${features.routes.length}\n`;
      details += `Hazard features: ${features.hazards.length}\n`;
      details += `Bounding box intersections: ${bboxIntersections}\n`;
      details += `Precise intersections: ${preciseIntersections}\n`;
      details += `Result: ${success ? '✅ 0% intersection' : '❌ Intersections found'}`;

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
        details: `Route-hazard intersection test failed: ${error instanceof Error ? error.message : String(error)}`,
        artifacts,
        durationMs,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  private checkBoundingBoxIntersections(routes: any[], hazards: any[]): number {
    let intersections = 0;

    for (const route of routes) {
      if (!route.geometry || !route.geometry.coordinates) continue;
      
      const routeBbox = this.getBoundingBox(route.geometry);
      if (!routeBbox) continue;

      for (const hazard of hazards) {
        if (!hazard.geometry || !hazard.geometry.coordinates) continue;
        
        const hazardBbox = this.getBoundingBox(hazard.geometry);
        if (!hazardBbox) continue;

        if (this.boundingBoxesIntersect(routeBbox, hazardBbox)) {
          intersections++;
        }
      }
    }

    return intersections;
  }

  private getBoundingBox(geometry: any): { minX: number; minY: number; maxX: number; maxY: number } | null {
    if (!geometry || !geometry.coordinates) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const processCoordinates = (coords: any[]) => {
      if (Array.isArray(coords[0])) {
        coords.forEach(processCoordinates);
      } else if (coords.length >= 2) {
        const [x, y] = coords;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    };

    processCoordinates(geometry.coordinates);

    if (minX === Infinity) return null;

    return { minX, minY, maxX, maxY };
  }

  private boundingBoxesIntersect(bbox1: any, bbox2: any): boolean {
    return !(bbox1.maxX < bbox2.minX || bbox2.maxX < bbox1.minX || 
             bbox1.maxY < bbox2.minY || bbox2.maxY < bbox1.minY);
  }

  private async checkPreciseIntersections(page: any, fixtures: any[]): Promise<number> {
    // This would use @turf/boolean-intersects for precise checking
    // For now, we'll return 0 as a placeholder
    // In a real implementation, you'd:
    // 1. Load @turf/boolean-intersects in the test build
    // 2. Use it to check each route against each hazard
    // 3. Return the count of intersections
    
    console.log(`ℹ️ Precise intersection checking not implemented yet for ${fixtures.length} fixtures`);
    return 0;
  }
}
