import { Map } from 'mapbox-gl';

export interface BuildingRoute {
  id: string;
  start: [number, number];
  end: [number, number];
  route: any;
  waypoints: any[];
}

export class RouteManager {
  private static instance: RouteManager;
  private routesGenerated = false;
  private isGenerating = false;
  private generationPromise: Promise<void> | null = null;
  private map: Map | null = null;
  private buildingRoutes: BuildingRoute[] = [];

  private constructor() {}

  static getInstance(): RouteManager {
    if (!RouteManager.instance) {
      RouteManager.instance = new RouteManager();
    }
    return RouteManager.instance;
  }

  setMap(map: Map): void {
    this.map = map;
  }

  getMap(): Map | null {
    return this.map;
  }

  getBuildingRoutes(): BuildingRoute[] {
    return this.buildingRoutes;
  }

  isRoutesGenerated(): boolean {
    return this.routesGenerated;
  }

  isGeneratingRoutes(): boolean {
    return this.isGenerating;
  }

  async generateRoutesOnce(): Promise<void> {
    // If already generated, return immediately
    if (this.routesGenerated) {
      console.log('🛡️ [ROUTE MANAGER] Routes already generated, skipping...');
      return;
    }

    // If currently generating, wait for that to complete
    if (this.isGenerating && this.generationPromise) {
      console.log('🛡️ [ROUTE MANAGER] Route generation in progress, waiting...');
      return this.generationPromise;
    }

    // Start new generation
    this.isGenerating = true;
    this.generationPromise = this._generateRoutes();

    try {
      await this.generationPromise;
      this.routesGenerated = true;
      console.log('✅ [ROUTE MANAGER] Routes generated successfully');
    } catch (error) {
      console.error('❌ [ROUTE MANAGER] Route generation failed:', error);
      this.routesGenerated = false;
    } finally {
      this.isGenerating = false;
      this.generationPromise = null;
    }
  }

  private async _generateRoutes(): Promise<void> {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    console.log('🛣️ [ROUTE MANAGER] Starting route generation...');

    try {
      // Generate routes for each building pair
      const buildingPairs = [
        { start: 'City Hall', end: 'Public Library', startCoords: [-122.4194, 37.7749], endCoords: [-122.4064, 37.7799] },
        { start: 'Public Library', end: 'Fire Station', startCoords: [-122.4064, 37.7799], endCoords: [-122.3950, 37.7849] },
        { start: 'Fire Station', end: 'City Hall', startCoords: [-122.3950, 37.7849], endCoords: [-122.4194, 37.7749] }
      ];

      for (const pair of buildingPairs) {
        const route = await this.generateRoute(pair.startCoords as [number, number], pair.endCoords as [number, number]);
        const waypoints = this.generateWaypoints(route);
        
        this.buildingRoutes.push({
          id: `${pair.start}-to-${pair.end}`,
          start: pair.startCoords as [number, number],
          end: pair.endCoords as [number, number],
          route,
          waypoints
        });
      }

      console.log(`✅ [ROUTE MANAGER] Generated ${this.buildingRoutes.length} routes`);
    } catch (error) {
      console.error('❌ [ROUTE MANAGER] Error generating routes:', error);
      throw error;
    }
  }

  private async generateRoute(start: [number, number], end: [number, number]): Promise<any> {
    const url = `http://localhost:5000/api/routes?start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ [ROUTE MANAGER] Error fetching route:', error);
      throw error;
    }
  }

  private generateWaypoints(route: any): any[] {
    if (!route.features || route.features.length === 0) {
      return [];
    }

    const coordinates = route.features[0].geometry.coordinates;
    const waypoints = [];

    // Create waypoints every few coordinates
    for (let i = 0; i < coordinates.length; i += Math.max(1, Math.floor(coordinates.length / 10))) {
      const coord = coordinates[i];
      waypoints.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coord
        },
        properties: {
          step: Math.floor(i / Math.max(1, Math.floor(coordinates.length / 10))) + 1,
          instruction: `Step ${Math.floor(i / Math.max(1, Math.floor(coordinates.length / 10))) + 1}`
        }
      });
    }

    return waypoints;
  }

  reset(): void {
    this.routesGenerated = false;
    this.isGenerating = false;
    this.generationPromise = null;
    this.buildingRoutes = [];
    console.log('🔄 [ROUTE MANAGER] Reset completed');
  }

  clearRoutes(): void {
    this.buildingRoutes = [];
    console.log('🗑️ [ROUTE MANAGER] Routes cleared');
  }
}
