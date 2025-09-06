import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { DEM_SOURCE_ID, DEM_URL, DEM_TILESIZE, DEM_MAXZOOM } from '../../../services/map-provider';

export interface TerrainLayerProps {
  map: mapboxgl.Map | null;
  enabled: boolean;
  exaggeration?: number;
  onLayerReady?: () => void;
  onLayerError?: (error: string) => void;
  addSky?: boolean;
}

export const TerrainLayer: React.FC<TerrainLayerProps> = ({
  map,
  enabled,
  exaggeration = 1.5,
  onLayerReady,
  onLayerError,
  addSky = true
}) => {
  useEffect(() => {
    if (!map) return;

    const applyTerrain = () => {
      try {
        if (enabled) {
          // Ensure DEM source exists
          if (!map.getSource(DEM_SOURCE_ID)) {
            map.addSource(DEM_SOURCE_ID, {
              type: 'raster-dem',
              url: DEM_URL,
              tileSize: DEM_TILESIZE,
              maxzoom: DEM_MAXZOOM,
            } as any);
          }
          
          // Set terrain with exaggeration
          map.setTerrain({ source: DEM_SOURCE_ID, exaggeration });
          
          // Add sky layer for better visuals (optional)
          if (addSky && !map.getLayer('sky')) {
            map.addLayer({
              id: 'sky',
              type: 'sky',
              paint: {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun-intensity': 15
              }
            } as any);
          }
        } else {
          // Disable terrain
          map.setTerrain(null);
        }
        
        onLayerReady?.();
      } catch (error: any) {
        const errorMessage = String(error?.message ?? error);
        console.error('TerrainLayer error:', errorMessage);
        onLayerError?.(errorMessage);
      }
    };

    // Apply terrain immediately if style is ready
    if (map.isStyleLoaded()) {
      applyTerrain();
    }

    // Re-apply terrain when style changes (styles reset terrain)
    const handleStyleLoad = () => {
      applyTerrain();
    };

    map.on('style.load', handleStyleLoad);

    return () => {
      map.off('style.load', handleStyleLoad);
      // Note: We don't remove the DEM source here as it's safer to leave it
      // The terrain is already disabled when enabled=false
    };
  }, [map, enabled, exaggeration, addSky]);

  return null;
};
