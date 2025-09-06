import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { EvacuationRoute } from '../../../sdk/foundry-sdk';

interface EvacuationRoutesLayerProps {
  map: mapboxgl.Map | null;
  enabled: boolean;
  routes: EvacuationRoute[];
  onLayerReady?: () => void;
  onLayerError?: (error: string) => void;
  onRouteClick?: (route: EvacuationRoute) => void;
}

export const EvacuationRoutesLayer: React.FC<EvacuationRoutesLayerProps> = ({
  map,
  enabled,
  routes,
  onLayerReady,
  onLayerError,
  onRouteClick
}) => {
  const routesSourceId = 'routes';
  const routesLayerId = 'routes';
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!map) return;

    const addRoutesLayer = () => {
      try {
        // Remove existing route layers if they exist
        if (map.getLayer(routesLayerId)) {
          map.removeLayer(routesLayerId);
        }
        if (map.getSource(routesSourceId)) {
          map.removeSource(routesSourceId);
        }

        if (!enabled || !routes.length) {
          isInitialized.current = false;
          return;
        }

        // Add evacuation routes source
        map.addSource(routesSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: routes.map((route: EvacuationRoute) => ({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: typeof route.routeGeometry === 'string' 
                  ? JSON.parse(route.routeGeometry) 
                  : (route.routeGeometry as any)?.coordinates || []
              },
              properties: {
                id: route.routeId,
                distance: route.distanceKm,
                estimatedTime: route.estimatedTimeMinutes
              }
            }))
          }
        });

        // Add evacuation routes layer
        map.addLayer({
          id: routesLayerId,
          type: 'line',
          source: routesSourceId,
          paint: {
            'line-color': '#ffaa00',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        // Add click handler if callback provided
        if (onRouteClick) {
          map.on('click', routesLayerId, (e) => {
            if (e.features && e.features[0]) {
              const routeId = e.features[0].properties?.id;
              const route = routes.find(r => r.routeId === routeId);
              if (route) {
                onRouteClick(route);
              }
            }
          });

          // Change cursor on hover
          map.on('mouseenter', routesLayerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', routesLayerId, () => {
            map.getCanvas().style.cursor = '';
          });
        }

        console.log('Evacuation routes layer added successfully');
        isInitialized.current = true;
        onLayerReady?.();
      } catch (error) {
        console.error('Error adding evacuation routes layer:', error);
        onLayerError?.(`Evacuation routes layer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    // Wait for map to be ready
    if (map.isStyleLoaded()) {
      addRoutesLayer();
    } else {
      map.once('style.load', addRoutesLayer);
    }

    // Cleanup function
    return () => {
      if (map && isInitialized.current) {
        try {
          // Remove event listeners
          map.off('click', routesLayerId, () => {});
          map.off('mouseenter', routesLayerId, () => {});
          map.off('mouseleave', routesLayerId, () => {});

          if (map.getLayer(routesLayerId)) {
            map.removeLayer(routesLayerId);
          }
          if (map.getSource(routesSourceId)) {
            map.removeSource(routesSourceId);
          }
          isInitialized.current = false;
        } catch (error) {
          console.warn('Error cleaning up evacuation routes layer:', error);
        }
      }
    };
  }, [map, enabled, routes]);

  // This component doesn't render anything visible
  return null;
};
