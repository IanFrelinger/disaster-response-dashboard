/**
 * Map Test Harness Utilities
 * 
 * Provides utilities for testing map rendering, layer validation, and visual regression testing.
 */

import { TEST_VIEWPORTS, TEST_PERFORMANCE_THRESHOLDS } from '../fixtures/test-data';

// Extend Window interface to include __map for testing
declare global {
  interface Window {
    __map?: any;
  }
}

export interface TestViewport {
  name: string;
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface LayerValidationResult {
  layerId: string;
  exists: boolean;
  visible: boolean;
  featureCount: number;
  hasErrors: boolean;
  errors: string[];
}

export interface MapTestState {
  isLoaded: boolean;
  tilesLoaded: boolean;
  styleLoaded: boolean;
  layers: LayerValidationResult[];
  errors: string[];
  performance: {
    loadTime: number;
    renderTime: number;
  };
}

/**
 * Wait for map to be fully loaded
 */
export async function waitForMapLoad(page: any, timeout = 30000): Promise<boolean> {
  try {
    // First wait for the map element to be visible
    await page.waitForSelector('.mapboxgl-map', { timeout: 10000 });
    
    // Then wait for the map instance to be ready
    await page.waitForFunction(() => {
      return typeof window !== 'undefined' && 
             window.__map && 
             window.__map.isStyleLoaded() && 
             window.__map.areTilesLoaded();
    }, { timeout });
    return true;
  } catch (error) {
    console.error('Map load timeout:', error);
    return false;
  }
}

/**
 * Get map test state
 */
export async function getMapTestState(page: any): Promise<MapTestState> {
  return await page.evaluate(() => {
    if (!window.__map) {
      return {
        isLoaded: false,
        tilesLoaded: false,
        styleLoaded: false,
        layers: [],
        errors: ['Map instance not available'],
        performance: { loadTime: 0, renderTime: 0 }
      };
    }

    const map = window.__map;
    let style;
    let layers = [];
    
    try {
      style = map.getStyle();
      layers = style.layers.map((layer: any) => ({
        layerId: layer.id,
        exists: true,
        visible: layer.layout?.visibility !== 'none',
        featureCount: 0, // Will be calculated separately
        hasErrors: false,
        errors: []
      }));
    } catch (error) {
      console.warn('Could not get map style:', error);
      layers = [];
    }

    return {
      isLoaded: map.isStyleLoaded() && map.areTilesLoaded(),
      tilesLoaded: map.areTilesLoaded(),
      styleLoaded: map.isStyleLoaded(),
      layers,
      errors: [],
      performance: {
        loadTime: performance.now(),
        renderTime: 0
      }
    };
  });
}

/**
 * Validate layer z-order
 */
export function validateLayerZOrder(layers: LayerValidationResult[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const layerIds = layers.map(l => l.layerId);
  
  // Expected order: terrain (bottom) -> buildings -> hazards -> units -> routes (top)
  const expectedOrder = ['terrain', 'buildings', 'hazards', 'units', 'routes'];
  const actualOrder = layerIds.filter(id => expectedOrder.includes(id));
  
  for (let i = 0; i < expectedOrder.length - 1; i++) {
    const currentLayer = expectedOrder[i];
    const nextLayer = expectedOrder[i + 1];
    
    const currentIndex = actualOrder.indexOf(currentLayer!);
    const nextIndex = actualOrder.indexOf(nextLayer!);
    
    if (currentIndex !== -1 && nextIndex !== -1 && currentIndex > nextIndex) {
      errors.push(`Layer ${currentLayer} should be below ${nextLayer} in z-order`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Apply test style for deterministic visual testing
 */
export async function applyTestStyle(page: any): Promise<void> {
  await page.addStyleTag({
    content: `
      /* Hide non-deterministic UI elements */
      [data-testid="loading-spinner"],
      [data-testid="live-badge"],
      .loading-indicator,
      .live-indicator {
        display: none !important;
      }
      
      /* Use solid colors for layers in test mode */
      .mapboxgl-map[data-test-mode="true"] .mapboxgl-canvas {
        filter: contrast(1.2) saturate(0.8);
      }
      
      /* Ensure consistent font rendering */
      * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
    `
  });
}

/**
 * Set test viewport
 */
export async function setTestViewport(page: any, viewportName: string): Promise<void> {
  const viewport = TEST_VIEWPORTS[viewportName as keyof typeof TEST_VIEWPORTS];
  if (!viewport) {
    throw new Error(`Unknown viewport: ${viewportName}`);
  }

  await page.evaluate((vp: any) => {
    if (window.__map) {
      window.__map.setCenter(vp.center);
      window.__map.setZoom(vp.zoom);
      if (vp.pitch !== undefined) window.__map.setPitch(vp.pitch);
      if (vp.bearing !== undefined) window.__map.setBearing(vp.bearing);
    }
  }, viewport);
}

/**
 * Check if performance is within thresholds
 */
export function checkPerformanceThresholds(metrics: {
  loadTime?: number;
  renderTime?: number;
  memoryUsage?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (metrics.loadTime && metrics.loadTime > TEST_PERFORMANCE_THRESHOLDS.mapLoadTime) {
    errors.push(`Load time ${metrics.loadTime}ms exceeds threshold ${TEST_PERFORMANCE_THRESHOLDS.mapLoadTime}ms`);
  }
  
  if (metrics.renderTime && metrics.renderTime > TEST_PERFORMANCE_THRESHOLDS.layerRenderTime) {
    errors.push(`Render time ${metrics.renderTime}ms exceeds threshold ${TEST_PERFORMANCE_THRESHOLDS.layerRenderTime}ms`);
  }
  
  if (metrics.memoryUsage && metrics.memoryUsage > TEST_PERFORMANCE_THRESHOLDS.memoryUsage) {
    errors.push(`Memory usage ${metrics.memoryUsage} bytes exceeds threshold ${TEST_PERFORMANCE_THRESHOLDS.memoryUsage} bytes`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Count rendered features in viewport
 */
export async function countRenderedFeatures(page: any, layerId: string): Promise<number> {
  return await page.evaluate((layerId: string) => {
    if (!window.__map) return 0;
    
    const map = window.__map;
    const bounds = map.getBounds();
    const features = map.queryRenderedFeatures({
      layers: [layerId],
      filter: undefined
    });
    
    return features.length;
  }, layerId);
}

/**
 * Check for console errors
 */
export async function getConsoleErrors(page: any): Promise<string[]> {
  return await page.evaluate(() => {
    return (window as any).__consoleErrors || [];
  });
}

/**
 * Setup console error tracking
 */
export async function setupConsoleErrorTracking(page: any): Promise<void> {
  await page.evaluate(() => {
    (window as any).__consoleErrors = [];
    const originalError = console.error;
    console.error = (...args) => {
      (window as any).__consoleErrors.push(args.join(' '));
      originalError.apply(console, args);
    };
  });
}

/**
 * Validate hazard-route intersections
 */
export async function validateHazardRouteIntersections(page: any): Promise<{ valid: boolean; intersections: any[] }> {
  return await page.evaluate(() => {
    if (!window.__map) {
      return { valid: false, intersections: ['Map not available'] };
    }

    const map = window.__map;
    const bounds = map.getBounds();
    
    // Query hazard and route features
    const hazardFeatures = map.queryRenderedFeatures({
      layers: ['hazards'],
      filter: undefined
    });
    
    const routeFeatures = map.queryRenderedFeatures({
      layers: ['routes'],
      filter: undefined
    });

    // Simple bbox intersection check
    const intersections: any[] = [];
    
    for (const hazard of hazardFeatures) {
      for (const route of routeFeatures) {
        if (hazard.geometry && route.geometry) {
          // Basic bbox check - in a real implementation, you'd use Turf.js
          const hazardBbox = hazard.bbox || [0, 0, 0, 0];
          const routeBbox = route.bbox || [0, 0, 0, 0];
          
          const intersects = !(
            hazardBbox[2] < routeBbox[0] || // hazard right < route left
            hazardBbox[0] > routeBbox[2] || // hazard left > route right
            hazardBbox[3] < routeBbox[1] || // hazard bottom < route top
            hazardBbox[1] > routeBbox[3]    // hazard top > route bottom
          );
          
          if (intersects) {
            intersections.push({
              hazardId: hazard.properties?.id,
              routeId: route.properties?.id,
              type: 'bbox_intersection'
            });
          }
        }
      }
    }

    return {
      valid: intersections.length === 0,
      intersections
    };
  });
}
