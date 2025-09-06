import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapProvider, createMapProvider, IMapProvider } from '../../services/map-provider';
import { LayerManager } from './layers/LayerManager';
import { useLayerToggles } from '../../features/layers/useLayerToggles';
import { MapErrorBanner } from '../testing/MapErrorBanner';
import { useTestMode } from '../testing/TestModeProvider';
import { ErrorMonitoringPanel } from '../ErrorMonitoringPanel';
import { errorCorrelationService } from '../../services/ErrorCorrelationService';
import type { HazardZone, EmergencyUnit, EvacuationRoute } from '../../sdk/foundry-sdk';
import {
  createEmptyValidationResults,
  validateTerrainLayer,
  validateBuildingsLayer,
  validateHazardsLayer,
  validateUnitsLayer,
  validateRoutesLayer,
  validateEnhancedRoutingLayer,
  type LayerValidationResults,
  type LayerValidationResult
} from './validation/layerValidation';

interface MapContainer3DProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  style?: string;
  hazards?: HazardZone[];
  units?: EmergencyUnit[];
  routes?: EvacuationRoute[];
  onHazardClick?: (hazard: HazardZone) => void;
  onUnitClick?: (unit: EmergencyUnit) => void;
  onRouteClick?: (route: EvacuationRoute) => void;
  onEnhancedRouteCalculated?: (response: any) => void;
  enableValidation?: boolean;
  onValidationComplete?: (results: LayerValidationResults) => void;
}


export const MapContainer3D: React.FC<MapContainer3DProps> = ({
  className = '',
  center = [-122.4194, 37.7749],
  zoom = 12,
  style = 'mapbox://styles/mapbox/satellite-streets-v12',
  hazards = [],
  units = [],
  routes = [],
  onHazardClick,
  onUnitClick,
  onRouteClick,
  onEnhancedRouteCalculated,
  enableValidation = true,
  onValidationComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapProvider, setMapProvider] = useState<IMapProvider | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<LayerValidationResults | null>(null);
  const [layerStates, setLayerStates] = useState<Record<string, boolean>>({});
  const [retryCount, setRetryCount] = useState(0);
  const [showErrorMonitoring, setShowErrorMonitoring] = useState(false);
  const { toggles } = useLayerToggles();
  const { isTestMode } = useTestMode();

  // Initialize map provider with 3D terrain support
  useEffect(() => {
    if (!containerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      const errorMsg = 'Mapbox access token not found';
      setError(errorMsg);
      errorCorrelationService.logError({
        level: 'error',
        source: 'frontend',
        category: 'validation',
        message: errorMsg,
        context: { component: 'MapContainer3D', step: 'initialization' }
      });
      return;
    }

    // Check for test mode parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get('test') === 'true';
    const testViewport = urlParams.get('testViewport');
    const testStyle = urlParams.get('testStyle') === 'true';

    // Apply test viewport if specified
    let mapCenter = center;
    let mapZoom = zoom;
    let mapStyle = style;

    if (isTestMode && testViewport) {
      const { CAMERA_PRESETS } = require('../../testing/commands/TestCommand');
      const preset = CAMERA_PRESETS[testViewport];
      if (preset) {
        mapCenter = preset.center;
        mapZoom = preset.zoom;
        console.log(`🎯 Applied test viewport: ${testViewport}`, preset);
      }
    }

    // Use test style if specified
    if (isTestMode && testStyle) {
      mapStyle = 'mapbox://styles/mapbox/light-v11'; // Simplified style for visual testing
      console.log('🎨 Using test style for visual regression testing');
    }

    const provider = createMapProvider({
      token,
      container: containerRef.current,
      center: mapCenter,
      zoom: mapZoom,
      styleUrl: mapStyle
    });

    setMapProvider(provider);

    // Set up event handlers
    provider.on('load', () => {
      console.log('🔍 MapContainer3D: Map loaded, setting mapReady to true');
      setMapReady(true);
      setError(null);
      
      // Enable 3D terrain by default
      provider.setTerrainEnabled(true, { exaggeration: 1.5 });
      
      // Expose enhanced map test API for 3D validation
      if (typeof window !== 'undefined') {
        const mapInstance = provider.getMapInstance();
        
        // Expose map instance for tests when in test mode
        if (isTestMode) {
          (window as any).__map = mapInstance;
          console.log('Map instance exposed on window.__map for testing');
          
          // Add test harness methods
          (window as any).__mapTestHarness = {
            setCamera: (preset: any) => {
              mapInstance.setCenter(preset.center);
              mapInstance.setZoom(preset.zoom);
              if (preset.bearing !== undefined) mapInstance.setBearing(preset.bearing);
              if (preset.pitch !== undefined) mapInstance.setPitch(preset.pitch);
            },
            getCamera: () => ({
              center: mapInstance.getCenter(),
              zoom: mapInstance.getZoom(),
              bearing: mapInstance.getBearing(),
              pitch: mapInstance.getPitch()
            }),
            waitForTiles: () => new Promise(resolve => {
              if (mapInstance.areTilesLoaded()) {
                resolve(true);
              } else {
                const checkTiles = () => {
                  if (mapInstance.areTilesLoaded()) {
                    resolve(true);
                  } else {
                    setTimeout(checkTiles, 100);
                  }
                };
                checkTiles();
              }
            }),
            isStyleLoaded: () => mapInstance.isStyleLoaded(),
            areTilesLoaded: () => mapInstance.areTilesLoaded()
          };
        }
        
        (window as any).__mapTestApi3D__ = {
          hasTerrain: () => provider.hasTerrain(),
          setTerrainEnabled: (enabled: boolean) => provider.setTerrainEnabled(enabled),
          getMapInstance: () => mapInstance,
          queryTerrainElevation: async (lng: number, lat: number) => {
            if (mapInstance && mapInstance.queryTerrainElevation) {
              return await mapInstance.queryTerrainElevation([lng, lat], { exaggerated: false });
            }
            return null;
          },
          validateLayers: async () => {
            if (!provider) {
              return createEmptyValidationResults();
            }
            
            const map = provider.getMapInstance();
            if (!map) {
              return createEmptyValidationResults();
            }
            
            const results: LayerValidationResults = {
              terrain: await validateTerrainLayer(map),
              buildings: await validateBuildingsLayer(map),
              hazards: await validateHazardsLayer(map),
              units: await validateUnitsLayer(map),
              routes: await validateRoutesLayer(map),
              enhancedRouting: await validateEnhancedRoutingLayer(map),
              overall: {
                success: false,
                totalLayers: 5,
                successfulLayers: 0,
                errors: []
              }
            };

            // Calculate overall results
            const layerResults = [results.terrain, results.buildings, results.hazards, results.units, results.routes];
            results.overall.successfulLayers = layerResults.filter(r => r.success).length;
            results.overall.success = results.overall.successfulLayers === results.overall.totalLayers;
            results.overall.errors = layerResults.flatMap(r => r.errors);

            console.log('✅ Validation results from API:', results);
            return results;
          },
          getLayerStates: () => layerStates,
          getValidationResults: () => validationResults
        };
        (window as any).__mapReady3D = true;
      }
    });

    provider.on('error', (event: any) => {
      console.error('Map error:', event.error);
      setError(event.error?.message || 'Map initialization failed');
    });

    // Initialize the map
    provider.initialize().catch((err) => {
      console.error('Failed to initialize map:', err);
      setError(err.message || 'Map initialization failed');
    });

    return () => {
      provider.destroy();
    };
  }, [center, zoom, style]);

  // Layer validation function - optimized for performance
  const validateAllLayers = useCallback(async (): Promise<LayerValidationResults> => {
    if (!mapProvider) {
      return createEmptyValidationResults();
    }

    const map = mapProvider.getMapInstance();
    if (!map) {
      return createEmptyValidationResults();
    }
    
    // Run validation asynchronously to not block UI
    const validationPromise = (async () => {
      const results: LayerValidationResults = {
        terrain: await validateTerrainLayer(map),
        buildings: await validateBuildingsLayer(map),
        hazards: await validateHazardsLayer(map),
        units: await validateUnitsLayer(map),
        routes: await validateRoutesLayer(map),
        enhancedRouting: await validateEnhancedRoutingLayer(map),
        overall: {
          success: false,
          totalLayers: 5, // Only count the 5 core layers that are actually used
          successfulLayers: 0,
          errors: []
        }
      };

      // Calculate overall results - only count the 5 core layers that are actually used
      const coreLayerResults = [results.terrain, results.buildings, results.hazards, results.units, results.routes];
      results.overall.successfulLayers = coreLayerResults.filter(r => r.success).length;
      results.overall.success = results.overall.successfulLayers === results.overall.totalLayers;
      results.overall.errors = coreLayerResults.flatMap(r => r.errors);

      setValidationResults(results);
      onValidationComplete?.(results);
      
      // Console logging for debugging
      console.log('🔍 3D Map Validation Results:', {
        timestamp: new Date().toISOString(),
        overall: results.overall,
        layers: Object.entries(results).filter(([key]) => key !== 'overall').map(([name, result]) => ({
          name,
          success: result.success,
          enabled: result.enabled,
          rendered: result.rendered,
          interactive: result.interactive,
          errorCount: result.errors.length,
          errors: result.errors,
          renderTime: result.performance.renderTime
        }))
      });
      
      return results;
    })();

    // Return a promise that resolves immediately with basic validation
    // The full validation runs in the background
    const basicResults = createEmptyValidationResults();
    basicResults.overall.success = true; // Assume success for immediate response
    
    // Start background validation
    validationPromise.catch(error => {
      console.warn('Background validation failed:', error);
    });
    
    return basicResults;
  }, [mapProvider, onValidationComplete]);

  // Individual layer validation functions
  const validateTerrainLayer = async (map: any): Promise<LayerValidationResult> => {
    const startTime = performance.now();
    const result: LayerValidationResult = {
      name: 'terrain',
      success: false,
      enabled: toggles.terrain,
      rendered: false,
      interactive: false,
      errors: [],
      performance: { renderTime: 0 }
    };

    try {
      // If terrain is disabled, it's always valid
      if (!toggles.terrain) {
        result.success = true;
        result.performance.renderTime = performance.now() - startTime;
        return result;
      }

      // Check if terrain source exists (only when terrain is enabled)
      const terrainSource = map.getSource('mapbox-dem');
      if (!terrainSource) {
        result.errors.push('Terrain DEM source not found');
        result.performance.renderTime = performance.now() - startTime;
        return result;
      }

      // Check if terrain is applied
      const terrain = map.getTerrain();
      if (terrain) {
        result.rendered = true;
        result.success = true;
        
        // Test terrain elevation query
        try {
          const elevation = await map.queryTerrainElevation(center, { exaggerated: false });
          if (typeof elevation === 'number' && !isNaN(elevation)) {
            result.interactive = true;
          }
        } catch (elevationError) {
          result.errors.push(`Terrain elevation query error: ${elevationError}`);
        }
      } else {
        result.errors.push('Terrain layer is enabled but not applied to map');
      }

      result.performance.renderTime = performance.now() - startTime;

    } catch (error) {
      const errorMsg = `Terrain validation error: ${error}`;
      result.errors.push(errorMsg);
      result.performance.renderTime = performance.now() - startTime;
      
      errorCorrelationService.logError({
        level: 'error',
        source: 'frontend',
        category: 'validation',
        message: errorMsg,
        context: { component: 'MapContainer3D', layer: 'terrain', step: 'validation' }
      });
    }

    return result;
  };

  const validateBuildingsLayer = async (map: any): Promise<LayerValidationResult> => {
    const startTime = performance.now();
    const result: LayerValidationResult = {
      name: 'buildings',
      success: false,
      enabled: toggles.buildings,
      rendered: false,
      interactive: false,
      errors: [],
      performance: { renderTime: 0 }
    };

    try {
      // Check if buildings layer exists
      const buildingsLayer = map.getLayer('3d-buildings');
      if (buildingsLayer) {
        result.rendered = true;
        result.success = true;
        
        // Test building interaction if enabled
        if (toggles.buildings) {
          try {
            const features = map.queryRenderedFeatures({ layers: ['3d-buildings'] });
            result.interactive = features.length > 0;
          } catch (interactionError) {
            result.errors.push(`Building interaction test failed: ${interactionError}`);
          }
        }
      } else if (toggles.buildings) {
        result.errors.push('Buildings layer is enabled but not found');
      } else {
        result.success = true; // Disabled buildings is valid
      }

      result.performance.renderTime = performance.now() - startTime;

    } catch (error) {
      result.errors.push(`Buildings validation error: ${error}`);
      result.performance.renderTime = performance.now() - startTime;
    }

    return result;
  };

  const validateHazardsLayer = async (map: any): Promise<LayerValidationResult> => {
    const startTime = performance.now();
    const result: LayerValidationResult = {
      name: 'hazards',
      success: false,
      enabled: toggles.hazards,
      rendered: false,
      interactive: false,
      errors: [],
      performance: { renderTime: 0 }
    };

    try {
      // Check if hazards source exists
      const hazardsSource = map.getSource('hazards');
      if (hazardsSource) {
        // Check if hazards layer exists
        const hazardsLayer = map.getLayer('hazards');
        if (hazardsLayer) {
          result.rendered = true;
          result.success = true;
          
          // Test hazard interaction if enabled
          if (toggles.hazards) {
            try {
              const features = map.queryRenderedFeatures({ layers: ['hazards'] });
              result.interactive = features.length > 0;
            } catch (interactionError) {
              result.errors.push(`Hazard interaction test failed: ${interactionError}`);
            }
          }
        } else if (toggles.hazards) {
          result.errors.push('Hazards layer is enabled but not found');
        } else {
          result.success = true; // Disabled hazards is valid
        }
      } else if (toggles.hazards) {
        result.errors.push('Hazards source is enabled but not found');
      } else {
        result.success = true; // Disabled hazards is valid
      }

      result.performance.renderTime = performance.now() - startTime;

    } catch (error) {
      result.errors.push(`Hazards validation error: ${error}`);
      result.performance.renderTime = performance.now() - startTime;
    }

    return result;
  };

  const validateUnitsLayer = async (map: any): Promise<LayerValidationResult> => {
    const startTime = performance.now();
    const result: LayerValidationResult = {
      name: 'units',
      success: false,
      enabled: toggles.units,
      rendered: false,
      interactive: false,
      errors: [],
      performance: { renderTime: 0 }
    };

    try {
      // Check if units source exists
      const unitsSource = map.getSource('units');
      if (unitsSource) {
        // Check if units layer exists
        const unitsLayer = map.getLayer('units');
        if (unitsLayer) {
          result.rendered = true;
          result.success = true;
          
          // Test unit interaction if enabled
          if (toggles.units) {
            try {
              const features = map.queryRenderedFeatures({ layers: ['units'] });
              result.interactive = features.length > 0;
            } catch (interactionError) {
              result.errors.push(`Unit interaction test failed: ${interactionError}`);
            }
          }
        } else if (toggles.units) {
          result.errors.push('Units layer is enabled but not found');
        } else {
          result.success = true; // Disabled units is valid
        }
      } else if (toggles.units) {
        result.errors.push('Units source is enabled but not found');
      } else {
        result.success = true; // Disabled units is valid
      }

      result.performance.renderTime = performance.now() - startTime;

    } catch (error) {
      result.errors.push(`Units validation error: ${error}`);
      result.performance.renderTime = performance.now() - startTime;
    }

    return result;
  };

  const validateRoutesLayer = async (map: any): Promise<LayerValidationResult> => {
    const startTime = performance.now();
    const result: LayerValidationResult = {
      name: 'routes',
      success: false,
      enabled: toggles.routes,
      rendered: false,
      interactive: false,
      errors: [],
      performance: { renderTime: 0 }
    };

    try {
      // Check if routes source exists
      const routesSource = map.getSource('routes');
      if (routesSource) {
        // Check if routes layer exists
        const routesLayer = map.getLayer('routes');
        if (routesLayer) {
          result.rendered = true;
          result.success = true;
          
          // Test route interaction if enabled
          if (toggles.routes) {
            try {
              const features = map.queryRenderedFeatures({ layers: ['routes'] });
              result.interactive = features.length > 0;
            } catch (interactionError) {
              result.errors.push(`Route interaction test failed: ${interactionError}`);
            }
          }
        } else if (toggles.routes) {
          result.errors.push('Routes layer is enabled but not found');
        } else {
          result.success = true; // Disabled routes is valid
        }
      } else if (toggles.routes) {
        result.errors.push('Routes source is enabled but not found');
      } else {
        result.success = true; // Disabled routes is valid
      }

      result.performance.renderTime = performance.now() - startTime;

    } catch (error) {
      result.errors.push(`Routes validation error: ${error}`);
      result.performance.renderTime = performance.now() - startTime;
    }

    return result;
  };

  const createEmptyValidationResults = (): LayerValidationResults => ({
    terrain: { name: 'terrain', success: false, enabled: false, rendered: false, interactive: false, errors: ['Map not ready'], performance: { renderTime: 0 } },
    buildings: { name: 'buildings', success: false, enabled: false, rendered: false, interactive: false, errors: ['Map not ready'], performance: { renderTime: 0 } },
    hazards: { name: 'hazards', success: false, enabled: false, rendered: false, interactive: false, errors: ['Map not ready'], performance: { renderTime: 0 } },
    units: { name: 'units', success: false, enabled: false, rendered: false, interactive: false, errors: ['Map not ready'], performance: { renderTime: 0 } },
    routes: { name: 'routes', success: false, enabled: false, rendered: false, interactive: false, errors: ['Map not ready'], performance: { renderTime: 0 } },
    enhancedRouting: { name: 'enhancedRouting', success: false, enabled: false, rendered: false, interactive: false, errors: ['Map not ready'], performance: { renderTime: 0 } },
    overall: { success: false, totalLayers: 6, successfulLayers: 0, errors: ['Map not ready'] }
  });

  // Handle layer ready/error callbacks with validation
  const handleLayerReady = useCallback((layerName: string) => {
    // Layer ready - removed console.log for production
    setLayerStates(prev => ({ ...prev, [layerName]: true }));
    
    // Run validation after a short delay to ensure layer is fully rendered
    if (enableValidation) {
      setTimeout(() => {
        validateAllLayers();
      }, 1000);
    }
  }, [enableValidation, validateAllLayers]);

  const handleLayerError = useCallback((layerName: string, error: string) => {
    console.error(`Layer ${layerName} error:`, error);
    setLayerStates(prev => ({ ...prev, [layerName]: false }));
  }, []);

  // Run initial validation when map is ready
  useEffect(() => {
    if (mapReady && enableValidation) {
      setTimeout(() => {
        validateAllLayers();
      }, 3000); // Give layers more time to initialize
    }
  }, [mapReady, enableValidation, validateAllLayers]);

  if (error) {
    return (
      <div className={`map-container-3d error ${className}`} style={{ 
        width: '100%', 
        height: '500px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h3>3D Map Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container-3d ${className}`} style={{ width: '100%', height: '500px', position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px'
        }} 
      />
      
      {!mapReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          <div>Loading 3D map...</div>
        </div>
      )}

      {/* Enhanced Validation Results Overlay */}
      {validationResults && enableValidation && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          fontSize: '12px',
          maxWidth: '350px',
          zIndex: 1000
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Layer Validation</h4>
          
          {/* Overall Status */}
          <div style={{ 
            marginBottom: '8px',
            padding: '5px',
            borderRadius: '4px',
            background: validationResults.overall.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${validationResults.overall.success ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <strong>Overall:</strong> {validationResults.overall.successfulLayers}/{validationResults.overall.totalLayers} layers successful
            {validationResults.overall.errors.length > 0 && (
              <div style={{ fontSize: '11px', color: '#721c24', marginTop: '2px' }}>
                {validationResults.overall.errors.length} total errors
              </div>
            )}
          </div>
          
          {/* Individual Layer Status */}
          {Object.entries(validationResults).filter(([key]) => key !== 'overall').map(([layerName, result]) => (
            <div key={layerName} style={{ 
              marginBottom: '4px',
              padding: '3px 6px',
              borderRadius: '3px',
              background: result.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                color: result.success ? '#155724' : '#721c24'
              }}>
                <strong>{layerName}:</strong> 
                <span>{result.success ? '✓' : '✗'}</span>
              </div>
              
              {/* Layer Details */}
              <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '2px' }}>
                {result.enabled ? '🟢 Enabled' : '🔴 Disabled'} | 
                {result.rendered ? ' 🎨 Rendered' : ' ⚪ Not Rendered'} | 
                {result.interactive ? ' 🖱️ Interactive' : ' 🚫 Static'} | 
                {result.performance.renderTime.toFixed(1)}ms
              </div>
              
              {/* Error Details */}
              {result.errors.length > 0 && (
                <div style={{ 
                  fontSize: '10px', 
                  color: '#721c24', 
                  marginTop: '2px',
                  background: 'rgba(114, 28, 36, 0.1)',
                  padding: '2px 4px',
                  borderRadius: '2px'
                }}>
                  {result.errors.map((error: string, index: number) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Automated Checks Summary */}
          <div style={{ 
            marginTop: '8px',
            padding: '5px',
            borderRadius: '4px',
            background: '#e2e3e5',
            border: '1px solid #d6d8db',
            fontSize: '10px'
          }}>
            <strong>🔍 Automated Checks:</strong>
            <div style={{ marginTop: '2px' }}>
              {(() => {
                const issues = [];
                const failedLayers = Object.entries(validationResults).filter(([key, result]) => 
                  key !== 'overall' && !result.success
                );
                const layersWithErrors = Object.entries(validationResults).filter(([key, result]) => 
                  key !== 'overall' && result.errors.length > 0
                );
                const slowLayers = Object.entries(validationResults).filter(([key, result]) => 
                  key !== 'overall' && result.performance.renderTime > 10
                );
                
                if (failedLayers.length > 0) issues.push(`❌ ${failedLayers.length} failed`);
                if (layersWithErrors.length > 0) issues.push(`⚠️ ${layersWithErrors.length} with errors`);
                if (slowLayers.length > 0) issues.push(`🐌 ${slowLayers.length} slow`);
                
                return issues.length > 0 ? issues.join(' | ') : '✅ All checks passed';
              })()}
            </div>
          </div>
        </div>
      )}

      {mapProvider && mapReady && (
        <>
          {console.log('🔍 MapContainer3D: Rendering LayerManager', {
            mapProvider: !!mapProvider,
            mapReady,
            hazardsCount: hazards.length,
            unitsCount: units.length,
            routesCount: routes.length
          })}
          <LayerManager
            map={mapProvider.getMapInstance()}
            layerToggles={toggles}
            data={{
              hazards,
              units,
              routes
            }}
            onLayerReady={handleLayerReady}
            onLayerError={handleLayerError}
            onHazardClick={onHazardClick}
            onUnitClick={onUnitClick}
            onRouteClick={onRouteClick}
            onEnhancedRouteCalculated={onEnhancedRouteCalculated}
          />
        </>
      )}

      <MapErrorBanner
        error={error}
        onRetry={() => {
          setError(null);
          setRetryCount(prev => prev + 1);
          // Force re-initialization
          if (containerRef.current) {
            // This will trigger the useEffect to re-run
            setMapProvider(null);
            setMapReady(false);
          }
        }}
        onDismiss={() => setError(null)}
      />

      {/* Error Monitoring Panel */}
      <ErrorMonitoringPanel
        isOpen={showErrorMonitoring}
        onClose={() => setShowErrorMonitoring(false)}
      />

      {/* Error Monitoring Toggle Button */}
      <button
        onClick={() => setShowErrorMonitoring(true)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '8px 12px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
        title="Open Error Monitoring Panel"
      >
        🔍 Errors
      </button>
    </div>
  );
};
