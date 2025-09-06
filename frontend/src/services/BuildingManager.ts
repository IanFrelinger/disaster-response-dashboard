import type { BuildingFeature, BuildingLayer, BuildingSource, BuildingStyle, BuildingFilter, BuildingMetrics } from '../types/building';

/**
 * Building Manager Service
 * Handles building data management, styling, and interactions
 */
export class BuildingManager {
  private buildings: Map<string, BuildingFeature> = new Map();
  private layers: Map<string, BuildingLayer> = new Map();
  private sources: Map<string, BuildingSource> = new Map();
  private styles: Map<string, BuildingStyle> = new Map();
  private activeFilters: BuildingFilter = {};

  /**
   * Add building features to the manager
   */
  addBuildings(buildings: BuildingFeature[]): void {
    buildings.forEach(building => {
      this.buildings.set(building.id, building);
    });
  }

  /**
   * Remove building features
   */
  removeBuildings(buildingIds: string[]): void {
    buildingIds.forEach(id => {
      this.buildings.delete(id);
    });
  }

  /**
   * Get all buildings
   */
  getAllBuildings(): BuildingFeature[] {
    return Array.from(this.buildings.values());
  }

  /**
   * Get buildings by filter
   */
  getBuildingsByFilter(filter: BuildingFilter): BuildingFeature[] {
    this.activeFilters = { ...this.activeFilters, ...filter };
    
    return Array.from(this.buildings.values()).filter(building => {
      return this.matchesFilter(building, this.activeFilters);
    });
  }

  /**
   * Check if building matches filter criteria
   */
  private matchesFilter(building: BuildingFeature, filter: BuildingFilter): boolean {
    if (filter.buildingTypes && !filter.buildingTypes.includes(building.properties.building_type)) {
      return false;
    }

    if (filter.heightRange) {
      const [min, max] = filter.heightRange;
      if (building.properties.height < min || building.properties.height > max) {
        return false;
      }
    }

    if (filter.emergencyAccess !== undefined && building.properties.emergency_access !== filter.emergencyAccess) {
      return false;
    }

    if (filter.hazardLevel && !filter.hazardLevel.includes(building.properties.hazard_level || 'low')) {
      return false;
    }

    if (filter.populationRange) {
      const [min, max] = filter.populationRange;
      if (building.properties.population_capacity < min || building.properties.population_capacity > max) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create building source for Mapbox
   */
  createBuildingSource(id: string, buildings: BuildingFeature[]): BuildingSource {
    const source: BuildingSource = {
      id,
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: buildings
      },
      cluster: buildings.length > 100, // Enable clustering for large datasets
      clusterMaxZoom: 16,
      clusterRadius: 50
    };

    this.sources.set(id, source);
    return source;
  }

  /**
   * Create building layer for Mapbox
   */
  createBuildingLayer(id: string, sourceId: string, style?: BuildingStyle): BuildingLayer {
    const defaultStyle: BuildingStyle = {
      height: 1,
      color: '#666666',
      opacity: 0.8,
      baseHeight: 0,
      emergencyHighlight: false
    };

    const finalStyle = { ...defaultStyle, ...style };

    const layer: BuildingLayer = {
      id,
      type: 'fill-extrusion',
      source: sourceId,
      paint: {
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'min_height'],
        'fill-extrusion-color': [
          'case',
          ['get', 'emergency_access'], '#ff4444',
          ['get', 'building_type'], '#666666',
          '#999999'
        ] as any,
        'fill-extrusion-opacity': finalStyle.opacity,
        'fill-extrusion-translate': [0, 0],
        'fill-extrusion-translate-anchor': 'map'
      },
      filter: this.buildFilterExpression(),
      layout: {
        visibility: 'visible'
      }
    };

    this.layers.set(id, layer);
    return layer;
  }

  /**
   * Build filter expression for Mapbox layer
   */
  private buildFilterExpression(): any[] {
    const filters: any[] = ['all'];

    if (this.activeFilters.buildingTypes && this.activeFilters.buildingTypes.length > 0) {
      filters.push(['in', 'building_type', ...this.activeFilters.buildingTypes]);
    }

    if (this.activeFilters.emergencyAccess !== undefined) {
      filters.push(['==', 'emergency_access', this.activeFilters.emergencyAccess]);
    }

    if (this.activeFilters.hazardLevel && this.activeFilters.hazardLevel.length > 0) {
      filters.push(['in', 'hazard_level', ...this.activeFilters.hazardLevel]);
    }

    return filters.length > 1 ? filters : [];
  }

  /**
   * Update building style
   */
  updateBuildingStyle(layerId: string, style: Partial<BuildingStyle>): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      const existingStyle = this.styles.get(layerId);
      const mergedStyle: BuildingStyle = {
        height: existingStyle?.height ?? 0,
        color: existingStyle?.color ?? '#8B4513',
        opacity: existingStyle?.opacity ?? 1,
        ...(existingStyle?.baseHeight !== undefined && { baseHeight: existingStyle.baseHeight }),
        ...(existingStyle?.emergencyHighlight !== undefined && { emergencyHighlight: existingStyle.emergencyHighlight }),
        ...(style.height !== undefined && { height: style.height }),
        ...(style.color !== undefined && { color: style.color }),
        ...(style.opacity !== undefined && { opacity: style.opacity }),
        ...(style.baseHeight !== undefined && { baseHeight: style.baseHeight }),
        ...(style.emergencyHighlight !== undefined && { emergencyHighlight: style.emergencyHighlight })
      };
      this.styles.set(layerId, mergedStyle);
    }
  }

  /**
   * Get building metrics
   */
  getBuildingMetrics(): BuildingMetrics {
    const buildings = Array.from(this.buildings.values());
    
    if (buildings.length === 0) {
      return {
        totalBuildings: 0,
        totalHeight: 0,
        averageHeight: 0,
        emergencyAccessCount: 0,
        highHazardCount: 0,
        totalCapacity: 0
      };
    }

    const totalHeight = buildings.reduce((sum, building) => sum + building.properties.height, 0);
    const emergencyAccessCount = buildings.filter(b => b.properties.emergency_access).length;
    const highHazardCount = buildings.filter(b => 
      ['high', 'critical'].includes(b.properties.hazard_level || 'low')
    ).length;
    const totalCapacity = buildings.reduce((sum, building) => sum + building.properties.population_capacity, 0);

    return {
      totalBuildings: buildings.length,
      totalHeight,
      averageHeight: totalHeight / buildings.length,
      emergencyAccessCount,
      highHazardCount,
      totalCapacity
    };
  }

  /**
   * Find buildings by proximity
   */
  findBuildingsByProximity(center: [number, number], radiusKm: number): BuildingFeature[] {
    return Array.from(this.buildings.values()).filter(building => {
      const distance = this.calculateDistance(center, this.getBuildingCenter(building));
      return distance <= radiusKm;
    });
  }

  /**
   * Calculate distance between two points in kilometers
   */
  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get building center point
   */
  private getBuildingCenter(building: BuildingFeature): [number, number] {
    const coordinates = building.geometry.coordinates[0];
    if (!coordinates) {
      throw new Error('Building has no coordinates');
    }
    const centerLng = coordinates.reduce((sum, coord) => sum + (coord[0] ?? 0), 0) / coordinates.length;
    const centerLat = coordinates.reduce((sum, coord) => sum + (coord[1] ?? 0), 0) / coordinates.length;
    return [centerLng, centerLat];
  }

  /**
   * Clear all buildings and layers
   */
  clear(): void {
    this.buildings.clear();
    this.layers.clear();
    this.sources.clear();
    this.styles.clear();
    this.activeFilters = {};
  }

  /**
   * Export buildings to GeoJSON
   */
  exportToGeoJSON(): string {
    const featureCollection = {
      type: 'FeatureCollection',
      features: Array.from(this.buildings.values())
    };
    
    return JSON.stringify(featureCollection, null, 2);
  }

  /**
   * Import buildings from GeoJSON
   */
  importFromGeoJSON(geojson: string): void {
    try {
      const data = JSON.parse(geojson);
      if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
        this.addBuildings(data.features);
      }
    } catch (error) {
      console.error('Error importing GeoJSON:', error);
    }
  }
}
