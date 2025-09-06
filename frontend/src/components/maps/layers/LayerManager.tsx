import React from 'react';
import mapboxgl from 'mapbox-gl';
import { BuildingsLayer } from './BuildingsLayer';
import { HazardsLayer } from './HazardsLayer';
import { EmergencyUnitsLayer } from './EmergencyUnitsLayer';
import { EvacuationRoutesLayer } from './EvacuationRoutesLayer';
import { TerrainLayer } from './TerrainLayer';
import { EnhancedRoutingLayer } from './EnhancedRoutingLayer';
import { OptimizedLayerManager } from './OptimizedLayerManager';
import type { HazardZone, EmergencyUnit, EvacuationRoute } from '../../../sdk/foundry-sdk';

interface LayerManagerProps {
  map: mapboxgl.Map | null;
  layerToggles: {
    terrain: boolean;
    buildings: boolean;
    hazards: boolean;
    units: boolean;
    routes: boolean;
    enhancedRouting: boolean;
  };
  data: {
    hazards: HazardZone[];
    units: EmergencyUnit[];
    routes: EvacuationRoute[];
  };
  onLayerReady?: (layerName: string) => void;
  onLayerError?: (layerName: string, error: string) => void;
  onHazardClick?: (hazard: HazardZone) => void;
  onUnitClick?: (unit: EmergencyUnit) => void;
  onRouteClick?: (route: EvacuationRoute) => void;
  onEnhancedRouteCalculated?: (response: any) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  map,
  layerToggles,
  data,
  onLayerReady,
  onLayerError,
  onHazardClick,
  onUnitClick,
  onRouteClick,
  onEnhancedRouteCalculated
}) => {
  const handleLayerReady = (layerName: string) => {
    // Layer ready - removed console.log for production
    onLayerReady?.(layerName);
  };

  const handleLayerError = (layerName: string, error: string) => {
    console.error(`Layer ${layerName} error:`, error);
    onLayerError?.(layerName, error);
  };

  // Use optimized layer manager for better performance
  // In test mode, always use individual components for better debugging
  const isTestMode = typeof window !== 'undefined' && window.location.search.includes('test=true');
  const useOptimizedLayers = !isTestMode && (
    process.env.NODE_ENV === 'production' || 
    (data.hazards.length > 100 || data.units.length > 50 || data.routes.length > 20)
  );

  console.log('🔍 LayerManager: Debug info', {
    isTestMode,
    useOptimizedLayers,
    hazardsCount: data.hazards.length,
    unitsCount: data.units.length,
    routesCount: data.routes.length,
    nodeEnv: process.env.NODE_ENV
  });

  if (useOptimizedLayers) {
    return (
      <>
        <OptimizedLayerManager
          map={map}
          layerToggles={layerToggles}
          data={data}
          onLayerReady={handleLayerReady}
          onLayerError={handleLayerError}
          onHazardClick={onHazardClick}
          onUnitClick={onUnitClick}
          onRouteClick={onRouteClick}
        />
        
        {/* Enhanced Routing Layer (always use individual component) */}
        <EnhancedRoutingLayer
          map={map}
          enabled={layerToggles.enhancedRouting}
          onRouteCalculated={onEnhancedRouteCalculated}
          onLayerReady={() => handleLayerReady('enhancedRouting')}
          onLayerError={(error) => handleLayerError('enhancedRouting', error)}
        />
      </>
    );
  }

  // Fallback to individual layer components for development or small datasets
  return (
    <>
      {/* Terrain Layer */}
      <TerrainLayer
        map={map}
        enabled={layerToggles.terrain}
        exaggeration={1.5}
        onLayerReady={() => handleLayerReady('terrain')}
        onLayerError={(error) => handleLayerError('terrain', error)}
      />

      {/* Buildings Layer */}
      <BuildingsLayer
        map={map}
        enabled={layerToggles.buildings}
        minZoom={15}
        onLayerReady={() => handleLayerReady('buildings')}
        onLayerError={(error) => handleLayerError('buildings', error)}
      />

      {/* Hazards Layer */}
      <HazardsLayer
        map={map}
        enabled={layerToggles.hazards}
        hazards={data.hazards}
        onLayerReady={() => handleLayerReady('hazards')}
        onLayerError={(error) => handleLayerError('hazards', error)}
        onHazardClick={onHazardClick}
      />

      {/* Emergency Units Layer */}
      <EmergencyUnitsLayer
        map={map}
        enabled={layerToggles.units}
        units={data.units}
        onLayerReady={() => handleLayerReady('units')}
        onLayerError={(error) => handleLayerError('units', error)}
        onUnitClick={onUnitClick}
      />

      {/* Evacuation Routes Layer */}
      <EvacuationRoutesLayer
        map={map}
        enabled={layerToggles.routes}
        routes={data.routes}
        onLayerReady={() => handleLayerReady('routes')}
        onLayerError={(error) => handleLayerError('routes', error)}
        onRouteClick={onRouteClick}
      />

      {/* Enhanced Routing Layer */}
      <EnhancedRoutingLayer
        map={map}
        enabled={layerToggles.enhancedRouting}
        onLayerReady={() => handleLayerReady('enhancedRouting')}
        onLayerError={(error) => handleLayerError('enhancedRouting', error)}
        onRouteCalculated={onEnhancedRouteCalculated}
      />
    </>
  );
};
