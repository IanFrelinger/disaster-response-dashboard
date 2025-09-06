import { Map } from 'mapbox-gl';
import { RouteManager } from './RouteManager';
import { BuildingRoute } from './RouteManager';

export class MapRenderer {
  private map: Map | null = null;
  private routeManager: RouteManager;
  private routesRendered = false;
  private waypointsRendered = false;

  constructor() {
    this.routeManager = RouteManager.getInstance();
  }

  setMap(map: Map): void {
    this.map = map;
  }

  async renderRoutes(): Promise<void> {
    if (!this.map) {
      console.log('🛡️ [RENDERER] Map not initialized, skipping route rendering...');
      return;
    }

    if (this.routesRendered) {
      console.log('🛡️ [RENDERER] Routes already rendered, skipping...');
      return;
    }

    console.log('🗺️ [RENDERER] Starting route rendering...');

    try {
      const buildingRoutes = this.routeManager.getBuildingRoutes();
      
      if (buildingRoutes.length === 0) {
        console.log('🛡️ [RENDERER] No routes to render, waiting for generation...');
        return;
      }

      // Clear any existing route layers first
      this.clearExistingRouteLayers();

      // Add the building routes source
      this.addBuildingRoutesSource(buildingRoutes);

      // Add route layers
      this.addRouteLayers();

      // Add waypoints
      this.addWaypoints(buildingRoutes);

      this.routesRendered = true;
      console.log('✅ [RENDERER] Routes rendered successfully');
    } catch (error) {
      console.error('❌ [RENDERER] Error rendering routes:', error);
    }
  }

  private clearExistingRouteLayers(): void {
    if (!this.map) return;

    const layersToRemove = [
      'building-routes',
      'building-routes-outline',
      'building-routes-labels',
      'route-waypoint-glow',
      'route-waypoint-markers',
      'route-waypoint-labels',
      'route-instructions'
    ];

    layersToRemove.forEach(layerId => {
      if (this.map!.getLayer(layerId)) {
        console.log(`🗑️ [RENDERER] Removing existing layer: ${layerId}`);
        this.map!.removeLayer(layerId);
      }
    });

    // Remove sources
    if (this.map.getSource('building-routes')) {
      console.log('🗑️ [RENDERER] Removing building-routes source');
      this.map.removeSource('building-routes');
    }

    if (this.map.getSource('route-waypoints')) {
      console.log('🗑️ [RENDERER] Removing route-waypoints source');
      this.map.removeSource('route-waypoints');
    }
  }

  private addBuildingRoutesSource(buildingRoutes: BuildingRoute[]): void {
    if (!this.map) return;

          const routeFeatures: any[] = buildingRoutes.map(route => ({
        type: 'Feature' as const,
        geometry: route.route.features[0].geometry,
        properties: {
          id: route.id,
          start: route.start,
          end: route.end
        }
      }));

          const routeSource: any = {
        type: 'FeatureCollection',
        features: routeFeatures
      };

      this.map.addSource('building-routes', {
        type: 'geojson',
        data: routeSource
      });

    console.log('✅ [RENDERER] Added building-routes source');
  }

  private addRouteLayers(): void {
    if (!this.map) return;

    // Add route outline
    this.map.addLayer({
      id: 'building-routes-outline',
      type: 'line',
      source: 'building-routes',
      paint: {
        'line-color': '#1e40af',
        'line-width': 8,
        'line-opacity': 0.8
      }
    });

    // Add main route line
    this.map.addLayer({
      id: 'building-routes',
      type: 'line',
      source: 'building-routes',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 6,
        'line-opacity': 1
      }
    });

    // Add route labels
    this.map.addLayer({
      id: 'building-routes-labels',
      type: 'symbol',
      source: 'building-routes',
      layout: {
        'text-field': ['get', 'id'],
        'text-size': 12,
        'text-offset': [0, -1.5],
        'text-anchor': 'center',
        'text-allow-overlap': true,
        'symbol-placement': 'line'
      },
      paint: {
        'text-color': '#1e3a8a',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });

    console.log('✅ [RENDERER] Added route layers');
  }

  private addWaypoints(buildingRoutes: BuildingRoute[]): void {
    if (!this.map) return;

    // Collect all waypoints from all routes
    const allWaypoints = buildingRoutes.flatMap(route => 
      route.waypoints.map(waypoint => ({
        ...waypoint,
        properties: {
          ...waypoint.properties,
          routeId: route.id
        }
      }))
    );

    if (allWaypoints.length === 0) {
      console.log('🛡️ [RENDERER] No waypoints to render');
      return;
    }

    // Add waypoints source
    this.map.addSource('route-waypoints', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: allWaypoints
      }
    });

    // Add waypoint glow effect
    this.map.addLayer({
      id: 'route-waypoint-glow',
      type: 'circle',
      source: 'route-waypoints',
      paint: {
        'circle-radius': 25,
        'circle-color': '#fbbf24',
        'circle-opacity': 0.3,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#f59e0b'
      }
    });

    // Add waypoint markers
    this.map.addLayer({
      id: 'route-waypoint-markers',
      type: 'circle',
      source: 'route-waypoints',
      paint: {
        'circle-radius': 20,
        'circle-color': '#fbbf24',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#d97706'
      }
    });

    // Add waypoint labels
    this.map.addLayer({
      id: 'route-waypoint-labels',
      type: 'symbol',
      source: 'route-waypoints',
      layout: {
        'text-field': ['get', 'instruction'],
        'text-size': 14,
        'text-offset': [0, -2],
        'text-anchor': 'center',
        'text-allow-overlap': true,
        'symbol-placement': 'point'
      },
      paint: {
        'text-color': '#92400e',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    // Add step instructions
    this.map.addLayer({
      id: 'route-instructions',
      type: 'symbol',
      source: 'route-waypoints',
      layout: {
        'text-field': ['concat', 'Step ', ['get', 'step']],
        'text-size': 16,
        'text-offset': [0, 2.5],
        'text-anchor': 'center',
        'text-allow-overlap': true,
        'symbol-placement': 'point'
      },
      paint: {
        'text-color': '#1f2937',
        'text-halo-color': '#ffffff',
        'text-halo-width': 3
      }
    });

    this.waypointsRendered = true;
    console.log(`✅ [RENDERER] Added ${allWaypoints.length} waypoints`);
  }

  // Public method to check if routes are rendered
  areRoutesRendered(): boolean {
    return this.routesRendered;
  }

  // Public method to check if waypoints are rendered
  areWaypointsRendered(): boolean {
    return this.waypointsRendered;
  }

  // Reset render state
  reset(): void {
    this.routesRendered = false;
    this.waypointsRendered = false;
    console.log('🔄 [RENDERER] Reset completed');
  }

  // Get current render state
  getRenderState() {
    return {
      routesRendered: this.routesRendered,
      waypointsRendered: this.waypointsRendered
    };
  }
}
