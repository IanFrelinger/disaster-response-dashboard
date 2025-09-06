import React, { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import type { HazardZone, EmergencyUnit, EvacuationRoute } from '../../../sdk/foundry-sdk';

interface OptimizedLayerManagerProps {
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
}

// Vector tile generation utility
class VectorTileGenerator {
  private static generateVectorTile(features: any[], layerName: string): string {
    // In production, this would use a proper vector tile library like @mapbox/vector-tile
    // For now, we'll create a simplified GeoJSON-based approach
    const geojson = {
      type: 'FeatureCollection',
      features: features.map(feature => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          ...feature.properties,
          _layer: layerName
        }
      }))
    };
    
    // Return a data URL for the vector tile
    return `data:application/json;base64,${btoa(JSON.stringify(geojson))}`;
  }

  static createHazardTiles(hazards: HazardZone[]): string {
    const features = hazards.map(hazard => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: this.h3ToCoordinates(hazard.h3CellId)
      },
      properties: {
        id: hazard.h3CellId,
        riskLevel: hazard.riskLevel,
        riskScore: hazard.riskScore,
        affectedPopulation: hazard.affectedPopulation
      }
    }));
    
    return this.generateVectorTile(features, 'hazards');
  }

  static createUnitTiles(units: EmergencyUnit[]): string {
    const features = units.map(unit => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0] // Will be populated from currentLocation H3 cell
      },
      properties: {
        id: unit.unitId,
        type: unit.unitType,
        status: unit.status,
        capacity: unit.capacity,
        lastLocationUpdate: unit.lastLocationUpdate
      }
    }));
    
    return this.generateVectorTile(features, 'units');
  }

  static createRouteTiles(routes: EvacuationRoute[]): string {
    const features = routes.map(route => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: typeof route.routeGeometry === 'string' 
          ? JSON.parse(route.routeGeometry).coordinates 
          : (route.routeGeometry as any)?.coordinates || []
      },
      properties: {
        id: route.routeId,
        status: route.status,
        capacity: route.capacityPerHour,
        estimatedTime: route.estimatedTimeMinutes,
        lastUpdated: route.lastUpdated
      }
    }));
    
    return this.generateVectorTile(features, 'routes');
  }

  private static h3ToCoordinates(h3CellId: string): [number, number] {
    // Simple conversion for demo - in production, use actual H3 library
    const hash = h3CellId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const lat = 37.7749 + (hash % 1000) / 10000;
    const lng = -122.4194 + (hash % 1000) / 10000;
    return [lng, lat];
  }
}

// Combined data layer for better performance
interface CombinedDataLayer {
  id: string;
  type: 'circle' | 'line' | 'fill-extrusion';
  source: string;
  paint: Record<string, any>;
  layout?: Record<string, any>;
  filter?: any[];
  minzoom?: number;
  maxzoom?: number;
}

export const OptimizedLayerManager: React.FC<OptimizedLayerManagerProps> = ({
  map,
  layerToggles,
  data,
  onLayerReady,
  onLayerError,
  onHazardClick,
  onUnitClick,
  onRouteClick
}) => {
  const isInitialized = useRef(false);
  const layerRefs = useRef<Map<string, boolean>>(new Map());

  // Memoize vector tile data to avoid regeneration on every render
  const vectorTileData = useMemo(() => ({
    hazards: VectorTileGenerator.createHazardTiles(data.hazards),
    units: VectorTileGenerator.createUnitTiles(data.units),
    routes: VectorTileGenerator.createRouteTiles(data.routes)
  }), [data.hazards, data.units, data.routes]);

  // Combined layer definitions for better performance
  const layerDefinitions: Record<string, CombinedDataLayer> = {
    'hazards': {
      id: 'hazards-optimized',
      type: 'circle',
      source: 'hazards-source',
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
      },
      filter: ['==', ['get', '_layer'], 'hazards'],
      minzoom: 10
    },
    'units': {
      id: 'units-optimized',
      type: 'circle',
      source: 'units-source',
      paint: {
        'circle-radius': [
          'case',
          ['==', ['get', 'status'], 'active'], 12,
          ['==', ['get', 'status'], 'standby'], 8,
          6
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'type'], 'fire'], '#ff4444',
          ['==', ['get', 'type'], 'police'], '#4444ff',
          ['==', ['get', 'type'], 'medical'], '#44ff44',
          '#888888'
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      },
      filter: ['==', ['get', '_layer'], 'units'],
      minzoom: 12
    },
    'routes': {
      id: 'routes-optimized',
      type: 'line',
      source: 'routes-source',
      paint: {
        'line-width': [
          'case',
          ['==', ['get', 'status'], 'active'], 4,
          ['==', ['get', 'status'], 'blocked'], 2,
          3
        ],
        'line-color': [
          'case',
          ['==', ['get', 'status'], 'active'], '#00ff00',
          ['==', ['get', 'status'], 'blocked'], '#ff0000',
          '#ffff00'
        ],
        'line-opacity': 0.8
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      filter: ['==', ['get', '_layer'], 'routes'],
      minzoom: 8
    }
  };

  const handleLayerReady = (layerName: string) => {
    layerRefs.current.set(layerName, true);
    onLayerReady?.(layerName);
  };

  const handleLayerError = (layerName: string, error: string) => {
    console.error(`Layer ${layerName} error:`, error);
    onLayerError?.(layerName, error);
  };

  // Initialize combined data sources
  useEffect(() => {
    if (!map) return;

    const initializeDataSources = () => {
      try {
        // Remove existing sources
        ['hazards-source', 'units-source', 'routes-source'].forEach(sourceId => {
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        });

        // Add combined data sources
        if (layerToggles.hazards && data.hazards.length > 0) {
          const hazardsData = (vectorTileData.hazards as string).split(',')[1];
          if (hazardsData) {
            map.addSource('hazards-source', {
              type: 'geojson',
              data: JSON.parse(atob(hazardsData)) as any
            });
          }
        }

        if (layerToggles.units && data.units.length > 0) {
          const unitsData = (vectorTileData.units as string).split(',')[1];
          if (unitsData) {
            map.addSource('units-source', {
              type: 'geojson',
              data: JSON.parse(atob(unitsData)) as any
            });
          }
        }

        if (layerToggles.routes && data.routes.length > 0) {
          const routesData = (vectorTileData.routes as string).split(',')[1];
          if (routesData) {
            map.addSource('routes-source', {
              type: 'geojson',
              data: JSON.parse(atob(routesData)) as any
            });
          }
        }

        isInitialized.current = true;
      } catch (error) {
        console.error('Error initializing data sources:', error);
        handleLayerError('data-sources', `Data sources failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    if (map.isStyleLoaded()) {
      initializeDataSources();
    } else {
      map.once('style.load', initializeDataSources);
    }
  }, [map, vectorTileData, layerToggles, data]);

  // Manage layer visibility and interactions
  useEffect(() => {
    if (!map || !isInitialized.current) return;

    const manageLayers = () => {
      try {
        // Remove existing layers
        Object.values(layerDefinitions).forEach(layer => {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
        });

        // Add layers based on toggles
        if (layerToggles.hazards && data.hazards.length > 0) {
          const layer = layerDefinitions.hazards;
          map.addLayer(layer as any);
          
          // Add click handler
          if (layer) {
            map.on('click', layer.id, (e) => {
            if (e.features && e.features[0]) {
              const hazardId = e.features[0].properties?.id;
              const hazard = data.hazards.find(h => h.h3CellId === hazardId);
              if (hazard) {
                onHazardClick?.(hazard);
              }
            }
          });

          // Add hover effects
          map.on('mouseenter', layer.id, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layer.id, () => {
            map.getCanvas().style.cursor = '';
          });
          }

          handleLayerReady('hazards');
        }

        if (layerToggles.units && data.units.length > 0) {
          const layer = layerDefinitions.units;
          map.addLayer(layer as any);
          
          // Add click handler
          if (layer) {
            map.on('click', layer.id, (e) => {
            if (e.features && e.features[0]) {
              const unitId = e.features[0].properties?.id;
              const unit = data.units.find(u => u.unitId === unitId);
              if (unit) {
                onUnitClick?.(unit);
              }
            }
          });

          // Add hover effects
          map.on('mouseenter', layer.id, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layer.id, () => {
            map.getCanvas().style.cursor = '';
          });
          }

          handleLayerReady('units');
        }

        if (layerToggles.routes && data.routes.length > 0) {
          const layer = layerDefinitions.routes;
          map.addLayer(layer as any);
          
          // Add click handler
          if (layer) {
            map.on('click', layer.id, (e) => {
            if (e.features && e.features[0]) {
              const routeId = e.features[0].properties?.id;
              const route = data.routes.find(r => r.routeId === routeId);
              if (route) {
                onRouteClick?.(route);
              }
            }
          });

          // Add hover effects
          map.on('mouseenter', layer.id, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layer.id, () => {
            map.getCanvas().style.cursor = '';
          });
          }

          handleLayerReady('routes');
        }

      } catch (error) {
        console.error('Error managing layers:', error);
        handleLayerError('layer-management', `Layer management failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    if (map.isStyleLoaded()) {
      manageLayers();
    } else {
      map.once('style.load', manageLayers);
    }

    // Cleanup function
    return () => {
      if (map) {
        try {
          // Remove event listeners safely
          Object.values(layerDefinitions).forEach(layer => {
            try {
              map.off('click', layer.id, () => {});
              map.off('mouseenter', layer.id, () => {});
              map.off('mouseleave', layer.id, () => {});
            } catch (e) {
              // Ignore event listener errors
            }
            
            try {
              if (map.getLayer && map.getLayer(layer.id)) {
                map.removeLayer(layer.id);
              }
            } catch (e) {
              // Ignore layer removal errors
            }
          });

          // Remove sources safely
          ['hazards-source', 'units-source', 'routes-source'].forEach(sourceId => {
            try {
              if (map.getSource && map.getSource(sourceId)) {
                map.removeSource(sourceId);
              }
            } catch (e) {
              // Ignore source removal errors
            }
          });

          isInitialized.current = false;
        } catch (error) {
          console.warn('Error cleaning up optimized layers:', error);
        }
      }
    };
  }, [map, layerToggles, data, onHazardClick, onUnitClick, onRouteClick]);

  // Terrain layer (unchanged for now)
  useEffect(() => {
    if (!map) return;

    const manageTerrain = () => {
      try {
        const terrainLayerId = '3d-terrain';
        
        if (map.getLayer(terrainLayerId)) {
          map.removeLayer(terrainLayerId);
        }

        if (!layerToggles.terrain) {
          return;
        }

        // Add terrain source
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        });

        // Add terrain layer
        map.addLayer({
          id: terrainLayerId,
          type: 'raster',
          source: 'mapbox-dem',
          paint: {
            'raster-opacity': 0.8
          }
        } as any);

        // Enable terrain
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        handleLayerReady('terrain');
      } catch (error) {
        console.error('Error managing terrain:', error);
        handleLayerError('terrain', `Terrain failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    if (map.isStyleLoaded()) {
      manageTerrain();
    } else {
      map.once('style.load', manageTerrain);
    }
  }, [map, layerToggles.terrain]);

  // Buildings layer (unchanged for now)
  useEffect(() => {
    if (!map) return;

    const manageBuildings = () => {
      try {
        const buildingsLayerId = '3d-buildings';
        
        if (map.getLayer(buildingsLayerId)) {
          map.removeLayer(buildingsLayerId);
        }

        if (!layerToggles.buildings) {
          return;
        }

        map.addLayer({
          id: buildingsLayerId,
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });

        handleLayerReady('buildings');
      } catch (error) {
        console.error('Error managing buildings:', error);
        handleLayerError('buildings', `Buildings failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    if (map.isStyleLoaded()) {
      manageBuildings();
    } else {
      map.once('style.load', manageBuildings);
    }
  }, [map, layerToggles.buildings]);

  return null;
};

