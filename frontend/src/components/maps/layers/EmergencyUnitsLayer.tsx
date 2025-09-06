import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { EmergencyUnit } from '../../../sdk/foundry-sdk';

interface EmergencyUnitsLayerProps {
  map: mapboxgl.Map | null;
  enabled: boolean;
  units: EmergencyUnit[];
  onLayerReady?: () => void;
  onLayerError?: (error: string) => void;
  onUnitClick?: (unit: EmergencyUnit) => void;
}

// Convert H3 cell ID to coordinates
const h3ToCoordinates = (h3CellId: string): [number, number] => {
  // Simple conversion for demo - in production, use actual H3 library
  const hash = h3CellId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const lat = 37.7749 + (hash % 1000) / 10000;
  const lng = -122.4194 + (hash % 1000) / 10000;
  return [lng, lat];
};

export const EmergencyUnitsLayer: React.FC<EmergencyUnitsLayerProps> = ({
  map,
  enabled,
  units,
  onLayerReady,
  onLayerError,
  onUnitClick
}) => {
  const unitsSourceId = 'units';
  const unitsLayerId = 'units';
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!map) return;

    const addUnitsLayer = () => {
      try {
        // Remove existing unit layers if they exist
        if (map.getLayer(unitsLayerId)) {
          map.removeLayer(unitsLayerId);
        }
        if (map.getSource(unitsSourceId)) {
          map.removeSource(unitsSourceId);
        }

        if (!enabled || !units.length) {
          isInitialized.current = false;
          return;
        }

        // Add emergency units source
        map.addSource(unitsSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: units.map((unit: EmergencyUnit) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: h3ToCoordinates(unit.currentLocation)
              },
              properties: {
                id: unit.unitId,
                type: unit.unitType,
                status: unit.status
              }
            }))
          }
        });

        // Add emergency units layer
        map.addLayer({
          id: unitsLayerId,
          type: 'circle',
          source: unitsSourceId,
          paint: {
            'circle-radius': 8,
            'circle-color': [
              'case',
              ['==', ['get', 'type'], 'fire_engine'], '#ff4444',
              ['==', ['get', 'type'], 'ambulance'], '#44ff44',
              ['==', ['get', 'type'], 'police'], '#4444ff',
              '#888888'
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add click handler if callback provided
        if (onUnitClick) {
          map.on('click', unitsLayerId, (e: any) => {
            if (e.features && e.features[0]) {
              const unitId = e.features[0].properties?.id;
              const unit = units.find(u => u.unitId === unitId);
              if (unit) {
                onUnitClick(unit);
              }
            }
          });

          // Change cursor on hover
          map.on('mouseenter', unitsLayerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', unitsLayerId, () => {
            map.getCanvas().style.cursor = '';
          });
        }

        console.log('Emergency units layer added successfully');
        isInitialized.current = true;
        onLayerReady?.();
      } catch (error) {
        console.error('Error adding emergency units layer:', error);
        onLayerError?.(`Emergency units layer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    // Wait for map to be ready
    if (map.isStyleLoaded()) {
      addUnitsLayer();
    } else {
      map.once('style.load', addUnitsLayer);
    }

    // Cleanup function
    return () => {
      if (map && isInitialized.current) {
        try {
          // Remove event listeners
          map.off('click', unitsLayerId, () => {});
          map.off('mouseenter', unitsLayerId, () => {});
          map.off('mouseleave', unitsLayerId, () => {});

          if (map.getLayer(unitsLayerId)) {
            map.removeLayer(unitsLayerId);
          }
          if (map.getSource(unitsSourceId)) {
            map.removeSource(unitsSourceId);
          }
          isInitialized.current = false;
        } catch (error) {
          console.warn('Error cleaning up emergency units layer:', error);
        }
      }
    };
  }, [map, enabled, units]);

  // This component doesn't render anything visible
  return null;
};
