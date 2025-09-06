import React, { useEffect, useRef, useState } from 'react';
import { MapProvider, createMapProvider, IMapProvider } from '../../services/map-provider';
import { LayerManager } from './layers/LayerManager';
import { useLayerToggles } from '../../features/layers/useLayerToggles';
import type { HazardZone, EmergencyUnit, EvacuationRoute } from '../../sdk/foundry-sdk';

interface MapContainerProps {
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
}

export const MapContainer: React.FC<MapContainerProps> = ({
  className = '',
  center = [-122.4194, 37.7749],
  zoom = 12,
  style = 'mapbox://styles/mapbox/streets-v12',
  hazards = [],
  units = [],
  routes = [],
  onHazardClick,
  onUnitClick,
  onRouteClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapProvider, setMapProvider] = useState<IMapProvider | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggles } = useLayerToggles();

  // Initialize map provider
  useEffect(() => {
    if (!containerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setError('Mapbox access token not found');
      return;
    }

    const provider = createMapProvider({
      token,
      container: containerRef.current,
      center,
      zoom,
      styleUrl: style
    });

    setMapProvider(provider);

    // Set up event handlers
    provider.on('load', () => {
      setMapReady(true);
      setError(null);
      
      // Expose map test API for E2E testing
      if (typeof window !== 'undefined') {
        const mapInstance = provider.getMapInstance();
        (window as any).__mapTestApi__ = {
          hasTerrain: () => provider.hasTerrain(),
          setTerrainEnabled: (enabled: boolean) => provider.setTerrainEnabled(enabled),
          getMapInstance: () => mapInstance,
          queryTerrainElevation: async (lng: number, lat: number) => {
            if (mapInstance && mapInstance.queryTerrainElevation) {
              return await mapInstance.queryTerrainElevation([lng, lat], { exaggerated: false });
            }
            return null;
          }
        };
        (window as any).__mapReady = true;
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

  // Handle layer ready/error callbacks
  const handleLayerReady = (layerName: string) => {
    console.log(`Layer ${layerName} ready`);
  };

  const handleLayerError = (layerName: string, error: string) => {
    console.error(`Layer ${layerName} error:`, error);
  };

  if (error) {
    return (
      <div className={`map-container error ${className}`} style={{ 
        width: '100%', 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h3>Map Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`} style={{ width: '100%', height: '400px', position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#f0f0f0'
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
          <div>Loading map...</div>
        </div>
      )}

      {mapProvider && mapReady && (
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
        />
      )}
    </div>
  );
};
