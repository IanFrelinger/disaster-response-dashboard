import mapboxgl from 'mapbox-gl';

// Timeout configurations for validation
export const VALIDATION_TIMEOUTS = {
  layerCheck: 5000,        // 5s for checking if layer exists
  renderWait: 10000,       // 10s for waiting for layer to render
  interactionWait: 3000,   // 3s for interaction tests
  performanceCheck: 2000,  // 2s for performance measurements
  mapReady: 15000,         // 15s for map to be ready
  sourceLoad: 8000,        // 8s for source to load
  layerLoad: 5000          // 5s for layer to load
};

// Helper function to add timeout to async operations
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${errorMessage} (timeout after ${timeoutMs}ms)`)), timeoutMs)
    )
  ]);
}

// Helper function to wait for map to be ready
export function waitForMapReady(map: mapboxgl.Map, timeoutMs: number = VALIDATION_TIMEOUTS.mapReady): Promise<void> {
  return new Promise((resolve, reject) => {
    if (map.isStyleLoaded() && map.areTilesLoaded()) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error(`Map not ready after ${timeoutMs}ms`));
    }, timeoutMs);

    const checkReady = () => {
      if (map.isStyleLoaded() && map.areTilesLoaded()) {
        clearTimeout(timeout);
        resolve();
      }
    };

    map.on('style.load', checkReady);
    map.on('data', checkReady);
  });
}

export interface LayerValidationResult {
  name: string;
  success: boolean;
  enabled: boolean;
  rendered: boolean;
  interactive: boolean;
  errors: string[];
  performance: {
    renderTime: number;
    memoryUsage?: number;
  };
}

export interface LayerValidationResults {
  terrain: LayerValidationResult;
  buildings: LayerValidationResult;
  hazards: LayerValidationResult;
  units: LayerValidationResult;
  routes: LayerValidationResult;
  enhancedRouting: LayerValidationResult;
  overall: {
    success: boolean;
    totalLayers: number;
    successfulLayers: number;
    errors: string[];
  };
}

export function createEmptyValidationResults(): LayerValidationResults {
  const emptyResult: LayerValidationResult = {
    name: '',
    success: false,
    enabled: false,
    rendered: false,
    interactive: false,
    errors: ['Layer not initialized'],
    performance: {
      renderTime: 0
    }
  };

  return {
    terrain: { ...emptyResult, name: 'terrain' },
    buildings: { ...emptyResult, name: 'buildings' },
    hazards: { ...emptyResult, name: 'hazards' },
    units: { ...emptyResult, name: 'units' },
    routes: { ...emptyResult, name: 'routes' },
    enhancedRouting: { ...emptyResult, name: 'enhancedRouting' },
    overall: {
      success: false,
      totalLayers: 6,
      successfulLayers: 0,
      errors: ['No layers validated']
    }
  };
}

export async function validateTerrainLayer(map: mapboxgl.Map): Promise<LayerValidationResult> {
  const startTime = performance.now();
  const errors: string[] = [];
  
  try {
    // Wait for map to be ready with timeout
    await withTimeout(
      waitForMapReady(map),
      VALIDATION_TIMEOUTS.mapReady,
      'Map not ready for terrain validation'
    );
    
    // Check if terrain is enabled
    const terrain = map.getTerrain();
    const enabled = terrain !== null;
    
    // Check if DEM source exists
    const demSource = map.getSource('mapbox-dem');
    const hasSource = demSource !== undefined;
    
    // Also check if terrain layer exists
    const terrainLayer = map.getLayer('3d-terrain');
    const hasTerrainLayer = terrainLayer !== undefined;
    
    if (!hasSource && enabled) {
      errors.push('DEM source not found');
    }
    
    if (!hasTerrainLayer && enabled) {
      errors.push('Terrain layer not found');
    }
    
    // Check if sky layer exists (optional)
    const skyLayer = map.getLayer('sky');
    const hasSky = skyLayer !== undefined;
    
    // Test terrain elevation query with timeout
    let elevationQueryWorks = false;
    try {
      if (map.queryTerrainElevation) {
        const elevationTest = withTimeout(
          map.queryTerrainElevation([-122.4194, 37.7749], { exaggerated: false }),
          VALIDATION_TIMEOUTS.interactionWait,
          'Terrain elevation query timeout'
        );
        
        const elevation = await elevationTest;
        elevationQueryWorks = typeof elevation === 'number' && !isNaN(elevation);
      }
    } catch (error) {
      errors.push(`Terrain elevation query failed: ${error}`);
    }
    
    const renderTime = performance.now() - startTime;
    
    return {
      name: 'terrain',
      success: enabled ? (hasSource && hasTerrainLayer && elevationQueryWorks && errors.length === 0) : (errors.length === 0),
      enabled,
      rendered: enabled && hasSource && hasTerrainLayer,
      interactive: enabled && elevationQueryWorks,
      errors,
      performance: {
        renderTime: Math.max(renderTime, 0.1), // Ensure minimum measurable time
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  } catch (error) {
    return {
      name: 'terrain',
      success: false,
      enabled: false,
      rendered: false,
      interactive: false,
      errors: [`Terrain validation failed: ${error}`],
      performance: {
        renderTime: performance.now() - startTime
      }
    };
  }
}

export async function validateBuildingsLayer(map: mapboxgl.Map): Promise<LayerValidationResult> {
  const startTime = performance.now();
  const errors: string[] = [];
  
  try {
    // Check if buildings layer exists
    const buildingsLayer = map.getLayer('3d-buildings');
    const rendered = buildingsLayer !== undefined;
    
    // Check if layer is visible
    const visibility = rendered ? map.getLayoutProperty('3d-buildings', 'visibility') : 'none';
    const enabled = visibility !== 'none';
    
    // Check if source exists
    const source = map.getSource('composite');
    const hasSource = source !== undefined;
    
    if (!hasSource) {
      errors.push('Composite source not found');
    }
    
    // Test layer interaction
    let interactive = false;
    try {
      if (rendered) {
        // Check if layer can be queried
        const features = map.queryRenderedFeatures({ layers: ['3d-buildings'] } as any);
        interactive = true; // If no error thrown, layer is interactive
      }
    } catch (error) {
      errors.push(`Buildings layer interaction failed: ${error}`);
    }
    
    const renderTime = performance.now() - startTime;
    
    return {
      name: 'buildings',
      success: rendered && hasSource && interactive && errors.length === 0,
      enabled,
      rendered,
      interactive,
      errors,
      performance: {
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  } catch (error) {
    return {
      name: 'buildings',
      success: false,
      enabled: false,
      rendered: false,
      interactive: false,
      errors: [`Buildings validation failed: ${error}`],
      performance: {
        renderTime: performance.now() - startTime
      }
    };
  }
}

export async function validateHazardsLayer(map: mapboxgl.Map): Promise<LayerValidationResult> {
  const startTime = performance.now();
  const errors: string[] = [];
  
  try {
    // Check for both individual and optimized layer IDs
    const hazardsLayer = map.getLayer('hazards');
    const hazardsOptimizedLayer = map.getLayer('hazards-optimized');
    const rendered = hazardsLayer !== undefined || hazardsOptimizedLayer !== undefined;
    
    // Check if layer is visible (check both possible layer IDs)
    const activeLayerId = hazardsOptimizedLayer ? 'hazards-optimized' : 'hazards';
    const visibility = rendered ? map.getLayoutProperty(activeLayerId, 'visibility') : 'none';
    const enabled = visibility !== 'none';
    
    // Check for both individual and optimized source IDs
    const source = map.getSource('hazards');
    const optimizedSource = map.getSource('hazards-source');
    const hasSource = source !== undefined || optimizedSource !== undefined;
    
    if (!hasSource && enabled) {
      errors.push('Hazards source not found');
    }
    
    // Test layer interaction
    let interactive = false;
    try {
      if (rendered) {
        const features = map.queryRenderedFeatures({ layers: [activeLayerId] } as any);
        interactive = true;
      }
    } catch (error) {
      errors.push(`Hazards layer interaction failed: ${error}`);
    }
    
    const renderTime = performance.now() - startTime;
    
    return {
      name: 'hazards',
      success: rendered && hasSource && interactive && errors.length === 0,
      enabled,
      rendered,
      interactive,
      errors,
      performance: {
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  } catch (error) {
    return {
      name: 'hazards',
      success: false,
      enabled: false,
      rendered: false,
      interactive: false,
      errors: [`Hazards validation failed: ${error}`],
      performance: {
        renderTime: performance.now() - startTime
      }
    };
  }
}

export async function validateUnitsLayer(map: mapboxgl.Map): Promise<LayerValidationResult> {
  const startTime = performance.now();
  const errors: string[] = [];
  
  try {
    // Check for both individual and optimized layer IDs
    const unitsLayer = map.getLayer('units');
    const unitsOptimizedLayer = map.getLayer('units-optimized');
    const rendered = unitsLayer !== undefined || unitsOptimizedLayer !== undefined;
    
    // Check if layer is visible (check both possible layer IDs)
    const activeLayerId = unitsOptimizedLayer ? 'units-optimized' : 'units';
    const visibility = rendered ? map.getLayoutProperty(activeLayerId, 'visibility') : 'none';
    const enabled = visibility !== 'none';
    
    // Check for both individual and optimized source IDs
    const source = map.getSource('units');
    const optimizedSource = map.getSource('units-source');
    const hasSource = source !== undefined || optimizedSource !== undefined;
    
    if (!hasSource && enabled) {
      errors.push('Units source not found');
    }
    
    // Test layer interaction
    let interactive = false;
    try {
      if (rendered) {
        const features = map.queryRenderedFeatures({ layers: [activeLayerId] } as any);
        interactive = true;
      }
    } catch (error) {
      errors.push(`Units layer interaction failed: ${error}`);
    }
    
    const renderTime = performance.now() - startTime;
    
    return {
      name: 'units',
      success: rendered && hasSource && interactive && errors.length === 0,
      enabled,
      rendered,
      interactive,
      errors,
      performance: {
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  } catch (error) {
    return {
      name: 'units',
      success: false,
      enabled: false,
      rendered: false,
      interactive: false,
      errors: [`Units validation failed: ${error}`],
      performance: {
        renderTime: performance.now() - startTime
      }
    };
  }
}

export async function validateRoutesLayer(map: mapboxgl.Map): Promise<LayerValidationResult> {
  const startTime = performance.now();
  const errors: string[] = [];
  
  try {
    // Check for both individual and optimized layer IDs
    const routesLayer = map.getLayer('routes');
    const routesOptimizedLayer = map.getLayer('routes-optimized');
    const rendered = routesLayer !== undefined || routesOptimizedLayer !== undefined;
    
    // Check if layer is visible (check both possible layer IDs)
    const activeLayerId = routesOptimizedLayer ? 'routes-optimized' : 'routes';
    const visibility = rendered ? map.getLayoutProperty(activeLayerId, 'visibility') : 'none';
    const enabled = visibility !== 'none';
    
    // Check for both individual and optimized source IDs
    const source = map.getSource('routes');
    const optimizedSource = map.getSource('routes-source');
    const hasSource = source !== undefined || optimizedSource !== undefined;
    
    if (!hasSource && enabled) {
      errors.push('Routes source not found');
    }
    
    // Test layer interaction
    let interactive = false;
    try {
      if (rendered) {
        const features = map.queryRenderedFeatures({ layers: [activeLayerId] } as any);
        interactive = true;
      }
    } catch (error) {
      errors.push(`Routes layer interaction failed: ${error}`);
    }
    
    const renderTime = performance.now() - startTime;
    
    return {
      name: 'routes',
      success: rendered && hasSource && interactive && errors.length === 0,
      enabled,
      rendered,
      interactive,
      errors,
      performance: {
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  } catch (error) {
    return {
      name: 'routes',
      success: false,
      enabled: false,
      rendered: false,
      interactive: false,
      errors: [`Routes validation failed: ${error}`],
      performance: {
        renderTime: performance.now() - startTime
      }
    };
  }
}

export async function validateEnhancedRoutingLayer(map: mapboxgl.Map): Promise<LayerValidationResult> {
  const startTime = performance.now();
  const errors: string[] = [];
  
  try {
    // Check if enhanced routing layers exist
    const enhancedRoutesLayer = map.getLayer('enhanced-routes');
    const terrainAnalysisLayer = map.getLayer('terrain-analysis');
    const obstacleAnalysisLayer = map.getLayer('obstacle-analysis');
    
    const rendered = enhancedRoutesLayer !== undefined;
    
    // Check if layer is visible
    const visibility = rendered ? map.getLayoutProperty('enhanced-routes', 'visibility') : 'none';
    const enabled = visibility !== 'none';
    
    // Check if sources exist
    const enhancedRoutesSource = map.getSource('enhanced-routes');
    const terrainSource = map.getSource('terrain-analysis');
    const obstaclesSource = map.getSource('obstacle-analysis');
    
    const hasEnhancedRoutesSource = enhancedRoutesSource !== undefined;
    const hasTerrainSource = terrainSource !== undefined;
    const hasObstaclesSource = obstaclesSource !== undefined;
    
    // Enhanced routing sources are only created when there's actual route data
    // If the layer is disabled or no routes have been calculated, sources won't exist
    // This is expected behavior, so we don't treat missing sources as errors when disabled
    if (enabled && !hasEnhancedRoutesSource) {
      errors.push('Enhanced routes source not found');
    }
    
    // Test layer interaction
    let interactive = false;
    try {
      if (rendered) {
        // Check if layer can be queried
        const features = map.queryRenderedFeatures({ layers: ['enhanced-routes'] } as any);
        interactive = true; // If no error thrown, layer is interactive
      }
    } catch (error) {
      errors.push(`Enhanced routing layer interaction failed: ${error}`);
    }
    
    // Check terrain analysis functionality
    let terrainAnalysisWorks = false;
    try {
      if (map.queryTerrainElevation) {
        const elevation = await map.queryTerrainElevation([-122.4194, 37.7749], { exaggerated: false });
        terrainAnalysisWorks = typeof elevation === 'number' && !isNaN(elevation);
      }
    } catch (error) {
      errors.push(`Terrain analysis failed: ${error}`);
    }
    
    const renderTime = performance.now() - startTime;
    
    // For enhanced routing, success means either:
    // 1. Layer is disabled (expected state) - no errors
    // 2. Layer is enabled and has sources and is interactive - no errors
    const success = enabled ? (hasEnhancedRoutesSource && interactive && terrainAnalysisWorks && errors.length === 0) : (errors.length === 0);
    
    return {
      name: 'enhancedRouting',
      success,
      enabled,
      rendered,
      interactive: interactive && terrainAnalysisWorks,
      errors,
      performance: {
        renderTime: Math.max(renderTime, 0.1),
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      }
    };
  } catch (error) {
    return {
      name: 'enhancedRouting',
      success: false,
      enabled: false,
      rendered: false,
      interactive: false,
      errors: [`Enhanced routing validation failed: ${error}`],
      performance: {
        renderTime: performance.now() - startTime
      }
    };
  }
}
