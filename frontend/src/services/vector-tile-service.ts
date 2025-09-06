/**
 * Vector Tile Service for optimized map layer rendering
 * 
 * This service provides utilities for converting GeoJSON data to vector tiles
 * and managing tile-based rendering for better performance.
 */

import type { HazardZone, EmergencyUnit, EvacuationRoute } from '../sdk/foundry-sdk';

export interface VectorTileOptions {
  maxZoom: number;
  minZoom: number;
  buffer: number;
  tolerance: number;
}

export interface VectorTileLayer {
  name: string;
  version: number;
  extent: number;
  features: VectorTileFeature[];
}

export interface VectorTileFeature {
  id: number;
  type: 'Point' | 'LineString' | 'Polygon';
  geometry: number[][];
  properties: Record<string, any>;
}

export class VectorTileService {
  private static readonly DEFAULT_OPTIONS: VectorTileOptions = {
    maxZoom: 14,
    minZoom: 0,
    buffer: 64,
    tolerance: 3
  };

  /**
   * Convert H3 cell ID to coordinates
   * In production, this would use the actual H3 library
   */
  private static h3ToCoordinates(h3CellId: string): [number, number] {
    const hash = h3CellId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const lat = 37.7749 + (hash % 1000) / 10000;
    const lng = -122.4194 + (hash % 1000) / 10000;
    return [lng, lat];
  }

  /**
   * Generate vector tiles for hazard zones
   */
  static generateHazardTiles(
    hazards: HazardZone[], 
    options: Partial<VectorTileOptions> = {}
  ): Map<string, VectorTileLayer> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const tiles = new Map<string, VectorTileLayer>();

    hazards.forEach((hazard, index) => {
      const coords = this.h3ToCoordinates(hazard.h3CellId);
      const tileKey = this.getTileKey(coords, opts.maxZoom);
      
      if (!tiles.has(tileKey)) {
        tiles.set(tileKey, {
          name: 'hazards',
          version: 2,
          extent: 4096,
          features: []
        });
      }

      const tile = tiles.get(tileKey)!;
      tile.features.push({
        id: index,
        type: 'Point',
        geometry: [coords],
        properties: {
          id: hazard.h3CellId,
          riskLevel: hazard.riskLevel,
          riskScore: hazard.riskScore,
          affectedPopulation: hazard.affectedPopulation,
          _layer: 'hazards'
        }
      });
    });

    return tiles;
  }

  /**
   * Generate vector tiles for emergency units
   */
  static generateUnitTiles(
    units: EmergencyUnit[], 
    options: Partial<VectorTileOptions> = {}
  ): Map<string, VectorTileLayer> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const tiles = new Map<string, VectorTileLayer>();

    units.forEach((unit, index) => {
      // For now, use a default location since EmergencyUnit uses H3 cells
      const coords: [number, number] = [0, 0]; // TODO: Convert H3 cell to lat/lng
      const tileKey = this.getTileKey(coords, opts.maxZoom);
      
      if (!tiles.has(tileKey)) {
        tiles.set(tileKey, {
          name: 'units',
          version: 2,
          extent: 4096,
          features: []
        });
      }

      const tile = tiles.get(tileKey)!;
      tile.features.push({
        id: index,
        type: 'Point',
        geometry: [coords],
        properties: {
          id: unit.unitId,
          type: unit.unitType,
          status: unit.status,
          capacity: unit.capacity,
          lastUpdated: unit.lastLocationUpdate,
          _layer: 'units'
        }
      });
    });

    return tiles;
  }

  /**
   * Generate vector tiles for evacuation routes
   */
  static generateRouteTiles(
    routes: EvacuationRoute[], 
    options: Partial<VectorTileOptions> = {}
  ): Map<string, VectorTileLayer> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const tiles = new Map<string, VectorTileLayer>();

    routes.forEach((route, index) => {
      // Split route coordinates into tiles
      let routeCoords: [number, number][] = [];
      try {
        const geometry = JSON.parse(route.routeGeometry);
        routeCoords = geometry.coordinates || [];
      } catch {
        // If parsing fails, use empty array
        routeCoords = [];
      }
      const tileKeys = new Set<string>();
      
      routeCoords.forEach((coord: [number, number]) => {
        const tileKey = this.getTileKey(coord, opts.maxZoom);
        tileKeys.add(tileKey);
      });

      tileKeys.forEach(tileKey => {
        if (!tiles.has(tileKey)) {
          tiles.set(tileKey, {
            name: 'routes',
            version: 2,
            extent: 4096,
            features: []
          });
        }

        const tile = tiles.get(tileKey)!;
        tile.features.push({
          id: index,
          type: 'LineString',
          geometry: routeCoords,
          properties: {
            id: route.routeId,
            name: `Route ${route.routeId}`,
            status: route.status,
            capacity: route.capacityPerHour,
            estimatedTime: route.estimatedTimeMinutes,
            hazardIntersection: route.hazardZones.length > 0,
            _layer: 'routes'
          }
        });
      });
    });

    return tiles;
  }

  /**
   * Get tile key for given coordinates and zoom level
   */
  private static getTileKey(coords: [number, number], zoom: number): string {
    const x = Math.floor((coords[0] + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(coords[1] * Math.PI / 180) + 1 / Math.cos(coords[1] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return `${zoom}/${x}/${y}`;
  }

  /**
   * Convert vector tile to GeoJSON for fallback rendering
   */
  static vectorTileToGeoJSON(tile: VectorTileLayer): any {
    return {
      type: 'FeatureCollection',
      features: tile.features.map(feature => ({
        type: 'Feature',
        geometry: {
          type: feature.type,
          coordinates: feature.geometry
        },
        properties: feature.properties
      }))
    };
  }

  /**
   * Create optimized Mapbox source configuration
   */
  static createMapboxSource(tiles: Map<string, VectorTileLayer>): any {
    const sources: Record<string, any> = {};

    // Group tiles by layer name
    const layerGroups = new Map<string, VectorTileLayer[]>();
    tiles.forEach(tile => {
      if (!layerGroups.has(tile.name)) {
        layerGroups.set(tile.name, []);
      }
      layerGroups.get(tile.name)!.push(tile);
    });

    // Create sources for each layer
    layerGroups.forEach((tileList, layerName) => {
      const geojson = {
        type: 'FeatureCollection',
        features: tileList.flatMap(tile => 
          tile.features.map(feature => ({
            type: 'Feature',
            geometry: {
              type: feature.type,
              coordinates: feature.geometry
            },
            properties: feature.properties
          }))
        )
      };

      sources[`${layerName}-source`] = {
        type: 'geojson',
        data: geojson,
        cluster: layerName === 'hazards' || layerName === 'units', // Enable clustering for point layers
        clusterMaxZoom: 14,
        clusterRadius: 50
      };
    });

    return sources;
  }

  /**
   * Create optimized layer configurations
   */
  static createOptimizedLayers(): Record<string, any> {
    return {
      'hazards-optimized': {
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
      'hazards-cluster': {
        id: 'hazards-cluster',
        type: 'circle',
        source: 'hazards-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>', ['get', 'point_count'], 100], '#ff0000',
            ['>', ['get', 'point_count'], 50], '#ff6600',
            ['>', ['get', 'point_count'], 10], '#ffff00',
            '#00ff00'
          ],
          'circle-radius': [
            'case',
            ['>', ['get', 'point_count'], 100], 25,
            ['>', ['get', 'point_count'], 50], 20,
            ['>', ['get', 'point_count'], 10], 15,
            10
          ],
          'circle-opacity': 0.8
        }
      },
      'hazards-cluster-count': {
        id: 'hazards-cluster-count',
        type: 'symbol',
        source: 'hazards-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      },
      'units-optimized': {
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
      'routes-optimized': {
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
  }
}

