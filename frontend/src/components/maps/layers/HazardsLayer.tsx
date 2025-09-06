import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { HazardZone } from '../../../sdk/foundry-sdk';

interface HazardsLayerProps {
  map: mapboxgl.Map | null;
  enabled: boolean;
  hazards: HazardZone[];
  onLayerReady?: () => void;
  onLayerError?: (error: string) => void;
  onHazardClick?: (hazard: HazardZone) => void;
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

export const HazardsLayer: React.FC<HazardsLayerProps> = ({
  map,
  enabled,
  hazards,
  onLayerReady,
  onLayerError,
  onHazardClick
}) => {
  const hazardsSourceId = 'hazards';
  const hazardsLayerId = 'hazards';
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!map) return;

    const addHazardsLayer = () => {
      try {
        console.log('🔍 HazardsLayer: Starting layer initialization', {
          enabled,
          hazardsCount: hazards.length,
          mapReady: map.isStyleLoaded ? map.isStyleLoaded() : false
        });

        // Remove existing hazard layers if they exist
        if (map.getLayer(hazardsLayerId)) {
          console.log('🔍 HazardsLayer: Removing existing layer');
          map.removeLayer(hazardsLayerId);
        }
        if (map.getSource(hazardsSourceId)) {
          console.log('🔍 HazardsLayer: Removing existing source');
          map.removeSource(hazardsSourceId);
        }

        if (!enabled || !hazards.length) {
          console.log('🔍 HazardsLayer: Skipping - enabled:', enabled, 'hazards.length:', hazards.length);
          isInitialized.current = false;
          return;
        }

        console.log('🔍 HazardsLayer: Creating source with', hazards.length, 'hazards');

        // Add hazard zones source
        map.addSource(hazardsSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: hazards.map((hazard: HazardZone) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: h3ToCoordinates(hazard.h3CellId)
              },
              properties: {
                id: hazard.h3CellId,
                riskLevel: hazard.riskLevel,
                riskScore: hazard.riskScore,
                affectedPopulation: hazard.affectedPopulation
              }
            }))
          }
        });

        console.log('🔍 HazardsLayer: Source created successfully');

        // Add hazard zones layer
        map.addLayer({
          id: hazardsLayerId,
          type: 'circle',
          source: hazardsSourceId,
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'riskLevel'], 'critical'], 20,
              ['==', ['get', 'riskLevel'], 'high'], 15,
              ['==', ['get', 'riskLevel'], 'medium'], 10,
              5
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'riskLevel'], 'critical'], '#ff0000',
              ['==', ['get', 'riskLevel'], 'high'], '#ff6600',
              ['==', ['get', 'riskLevel'], 'medium'], '#ffff00',
              '#00ff00'
            ],
            'circle-opacity': 0.7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add click handler with default no-op if callback not provided
        const handleHazardClick = onHazardClick || (() => {});
        map.on('click', hazardsLayerId, (e) => {
          if (e.features && e.features[0]) {
            const hazardId = e.features[0].properties?.id;
            const hazard = hazards.find(h => h.h3CellId === hazardId);
            if (hazard) {
              handleHazardClick(hazard);
            }
          }
        });

        // Change cursor on hover
        map.on('mouseenter', hazardsLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', hazardsLayerId, () => {
          map.getCanvas().style.cursor = '';
        });

        console.log('🔍 HazardsLayer: Layer created successfully');
        isInitialized.current = true;
        onLayerReady?.();
      } catch (error) {
        console.error('Error adding hazards layer:', error);
        onLayerError?.(`Hazards layer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    // Wait for map to be ready
    if (map.isStyleLoaded()) {
      addHazardsLayer();
    } else {
      map.once('style.load', addHazardsLayer);
    }

    // Cleanup function
    return () => {
      if (map && isInitialized.current) {
        try {
          // Remove event listeners
          map.off('click', hazardsLayerId, () => {});
          map.off('mouseenter', hazardsLayerId, () => {});
          map.off('mouseleave', hazardsLayerId, () => {});

          if (map.getLayer(hazardsLayerId)) {
            map.removeLayer(hazardsLayerId);
          }
          if (map.getSource(hazardsSourceId)) {
            map.removeSource(hazardsSourceId);
          }
          isInitialized.current = false;
        } catch (error) {
          console.warn('Error cleaning up hazards layer:', error);
        }
      }
    };
  }, [map, enabled, hazards]);

  // This component doesn't render anything visible
  return null;
};
