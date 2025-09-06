import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface BuildingsLayerProps {
  map: mapboxgl.Map | null;
  enabled: boolean;
  minZoom?: number;
  onLayerReady?: () => void;
  onLayerError?: (error: string) => void;
}

export const BuildingsLayer: React.FC<BuildingsLayerProps> = ({
  map,
  enabled,
  minZoom = 15,
  onLayerReady,
  onLayerError
}) => {
  const buildingsLayerId = '3d-buildings';
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!map) return;

    const addBuildingExtrusions = () => {
      try {
        // Remove existing building layers if they exist
        if (map.getLayer(buildingsLayerId)) {
          map.removeLayer(buildingsLayerId);
        }

        if (!enabled) {
          isInitialized.current = false;
          return;
        }

        // Use composite source instead of dedicated building source to avoid createBucket issues
        map.addLayer({
          id: buildingsLayerId,
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: minZoom,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              minZoom,
              0,
              minZoom + 0.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              minZoom,
              0,
              minZoom + 0.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });

        console.log('Building extrusions added successfully');
        isInitialized.current = true;
        onLayerReady?.();
      } catch (error) {
        console.error('Error adding building extrusions:', error);
        onLayerError?.(`Building extrusions failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Don't throw error, just log it and continue
        console.warn('Building extrusions failed, continuing without buildings...');
      }
    };

    // Wait for map to be ready
    if (map.isStyleLoaded()) {
      addBuildingExtrusions();
    } else {
      map.once('style.load', addBuildingExtrusions);
    }

    // Cleanup function
    return () => {
      if (map && isInitialized.current) {
        try {
          if (map.getLayer(buildingsLayerId)) {
            map.removeLayer(buildingsLayerId);
          }
          isInitialized.current = false;
        } catch (error) {
          console.warn('Error cleaning up building layers:', error);
        }
      }
    };
  }, [map, enabled, minZoom]);

  // This component doesn't render anything visible
  return null;
};
