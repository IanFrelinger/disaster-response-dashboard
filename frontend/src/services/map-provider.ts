

// Map provider configuration
interface MapProviderConfig {
  token: string;
  styleUrl?: string;
  container: string | HTMLElement;
  center?: [number, number];
  zoom?: number;
}

// Map event types
export type MapEvent = 'load' | 'error' | 'style-load' | 'tile-error' | 'webgl-error';

// Terrain configuration constants
export const DEM_SOURCE_ID = 'mapbox-dem';
export const DEM_URL = 'mapbox://mapbox.mapbox-terrain-dem-v1';
export const DEM_TILESIZE = 512;
export const DEM_MAXZOOM = 14;

// Map provider interface
export interface IMapProvider {
  initialize(): Promise<void>;
  addLayer(layer: any): void;
  removeLayer(layerId: string): void;
  setLayerVisibility(layerId: string, visible: boolean): void;
  setCenter(center: [number, number]): void;
  setZoom(zoom: number): void;
  setTerrainEnabled(on: boolean, opts?: { sourceId?: string; exaggeration?: number }): void;
  hasTerrain(): boolean;
  getMapInstance(): any;
  on(event: MapEvent, handler: (event: any) => void): void;
  off(event: MapEvent, handler: (event: any) => void): void;
  destroy(): void;
}

/**
 * Map Provider with fault injection support
 * 
 * This provider integrates with the fault injection system to simulate
 * various map failure scenarios during testing.
 */
export class MapProvider implements IMapProvider {
  private config: MapProviderConfig;
  private map: any; // Mapbox GL JS map instance
  private eventHandlers: Map<MapEvent, Set<(event: any) => void>> = new Map();
  private layers: Map<string, any> = new Map();
  private isInitialized = false;

  constructor(config: MapProviderConfig) {
    this.config = config;
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers map
   */
  private setupEventHandlers() {
    const events: MapEvent[] = ['load', 'error', 'style-load', 'tile-error', 'webgl-error'];
    events.forEach(event => {
      this.eventHandlers.set(event, new Set());
    });
  }

  /**
   * Check for fault injection before map operations
   */
  private checkFaultInjection(operation: string) {
    if (typeof window === 'undefined' || !window.__testFaults__?.config.map) {
      return;
    }

    const fault = window.__testFaults__?.config.map;
    
    switch (fault.kind) {
      case 'webgl-unavailable':
        if (operation === 'initialize') {
          throw new Error('WebGL is not available');
        }
        break;
        
      case 'style-load-fail':
        if (operation === 'initialize') {
          throw new Error('Map style failed to load');
        }
        break;
        
      case 'mapbox-token-invalid':
        if (operation === 'initialize') {
          throw new Error('Invalid Mapbox access token');
        }
        break;
        
      case 'duplicate-layer-id':
        if (operation === 'addLayer') {
          throw new Error('Duplicate layer ID detected');
        }
        break;
        
      case 'missing-sprite':
        if (operation === 'initialize') {
          throw new Error('Map sprites are missing');
        }
        break;
        
      case 'font-load-fail':
        if (operation === 'initialize') {
          throw new Error('Map fonts failed to load');
        }
        break;
        
      case 'geolocation-error':
        if (operation === 'initialize') {
          throw new Error('Geolocation service failed');
        }
        break;
        
      case '3d-terrain-load-fail':
        if (operation === 'initialize') {
          throw new Error('3D terrain data failed to load');
        }
        break;
        
      case 'building-data-corrupt':
        if (operation === 'addLayer') {
          throw new Error('Building data is corrupted');
        }
        break;
    }
  }

  /**
   * Initialize the map
   */
  async initialize(): Promise<void> {
    try {
      // Check for fault injection
      this.checkFaultInjection('initialize');
      
      // Check WebGL availability
      if (!this.isWebGLAvailable()) {
        throw new Error('WebGL is not available in this browser');
      }

      // Validate configuration
      if (!this.config.token) {
        throw new Error('Mapbox access token is required');
      }

      // Import Mapbox GL JS dynamically
      const mapboxgl = await this.importMapboxGL();
      
      // Create map instance
      this.map = new mapboxgl.Map({
        accessToken: this.config.token,
        container: this.config.container,
        style: this.config.styleUrl || 'mapbox://styles/mapbox/streets-v11',
        center: this.config.center || [-74.5, 40],
        zoom: this.config.zoom || 9,
        attributionControl: true,
        preserveDrawingBuffer: true, // For testing
      });

      // Setup map event handlers
      this.setupMapEventHandlers();
      
      this.isInitialized = true;
      
      // Emit load event
      this.emit('load', { map: this.map });
      
    } catch (error) {
      // Emit error event
      this.emit('error', { error, operation: 'initialize' });
      throw error;
    }
  }

  /**
   * Check WebGL availability
   */
  private isWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  /**
   * Import Mapbox GL JS
   */
  private async importMapboxGL() {
    try {
      // Try to import from CDN or local installation
      if (typeof window !== 'undefined' && (window as any).mapboxgl) {
        return (window as any).mapboxgl;
      }
      
      // Try to import from node_modules
      try {
        const mapboxgl = await import('mapbox-gl');
        return mapboxgl.default || mapboxgl;
      } catch (importError) {
        console.warn('Failed to import mapbox-gl from node_modules:', importError);
      }
      
      // Dynamic import for testing environments
      const module = await import('mapbox-gl');
      return module.default;
      
    } catch (error) {
      throw new Error('Failed to load Mapbox GL JS');
    }
  }

  /**
   * Setup map event handlers
   */
  private setupMapEventHandlers() {
    if (!this.map) return;

    // Map load event
    this.map.on('load', () => {
      this.emit('load', { map: this.map });
    });

    // Style load event
    this.map.on('style.load', () => {
      this.emit('style-load', { map: this.map });
    });

    // Error events
    this.map.on('error', (event: any) => {
      this.emit('error', { error: event.error, map: this.map });
    });

    // Tile error events
    this.map.on('tile.error', (event: any) => {
      this.emit('tile-error', { error: event.error, map: this.map });
    });

    // WebGL context lost
    this.map.on('webglcontextlost', () => {
      this.emit('webgl-error', { error: new Error('WebGL context lost'), map: this.map });
    });
  }

  /**
   * Add layer to map
   */
  addLayer(layer: any): void {
    try {
      // Check for fault injection
      this.checkFaultInjection('addLayer');
      
      if (!this.isInitialized) {
        throw new Error('Map not initialized');
      }

      if (!layer.id) {
        throw new Error('Layer must have an ID');
      }

      // Check for duplicate layer ID
      if (this.layers.has(layer.id)) {
        throw new Error(`Layer with ID '${layer.id}' already exists`);
      }

      // Add layer to map
      this.map.addLayer(layer);
      
      // Store layer reference
      this.layers.set(layer.id, layer);
      
    } catch (error) {
      this.emit('error', { error, operation: 'addLayer', layer });
      throw error;
    }
  }

  /**
   * Remove layer from map
   */
  removeLayer(layerId: string): void {
    try {
      if (!this.isInitialized) {
        throw new Error('Map not initialized');
      }

      if (!this.layers.has(layerId)) {
        throw new Error(`Layer with ID '${layerId}' not found`);
      }

      // Remove layer from map
      this.map.removeLayer(layerId);
      
      // Remove layer reference
      this.layers.delete(layerId);
      
    } catch (error) {
      this.emit('error', { error, operation: 'removeLayer', layerId });
      throw error;
    }
  }

  /**
   * Set layer visibility
   */
  setLayerVisibility(layerId: string, visible: boolean): void {
    try {
      if (!this.isInitialized) {
        throw new Error('Map not initialized');
      }

      if (!this.layers.has(layerId)) {
        console.warn(`Layer with ID '${layerId}' not found, cannot set visibility`);
        return;
      }

      // Set layer visibility using Mapbox GL JS
      this.map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      
    } catch (error) {
      this.emit('error', { error, operation: 'setLayerVisibility', layerId, visible });
      throw error;
    }
  }

  /**
   * Set map center
   */
  setCenter(center: [number, number]): void {
    try {
      if (!this.isInitialized) {
        throw new Error('Map not initialized');
      }

      this.map.setCenter(center);
      
    } catch (error) {
      this.emit('error', { error, operation: 'setCenter', center });
      throw error;
    }
  }

  /**
   * Set map zoom
   */
  setZoom(zoom: number): void {
    try {
      if (!this.isInitialized) {
        throw new Error('Map not initialized');
      }

      this.map.setZoom(zoom);
      
    } catch (error) {
      this.emit('error', { error, operation: 'setZoom', zoom });
      throw error;
    }
  }

  /**
   * Register event handler
   */
  on(event: MapEvent, handler: (event: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.add(handler);
    }
  }

  /**
   * Remove event handler
   */
  off(event: MapEvent, handler: (event: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to registered handlers
   */
  private emit(event: MapEvent, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} event handler:`, error);
        }
      });
    }
  }

  /**
   * Destroy map instance
   */
  destroy(): void {
    try {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      
      this.layers.clear();
      this.eventHandlers.clear();
      this.isInitialized = false;
      
    } catch (error) {
      console.error('Error destroying map:', error);
    }
  }


  /**
   * Get layer count
   */
  getLayerCount(): number {
    return this.layers.size;
  }

  /**
   * Check if layer exists
   */
  hasLayer(layerId: string): boolean {
    return this.layers.has(layerId);
  }

  /**
   * Get all layer IDs
   */
  getLayerIds(): string[] {
    return Array.from(this.layers.keys());
  }

  /**
   * Set terrain enabled/disabled
   */
  setTerrainEnabled(on: boolean, opts: { sourceId?: string; exaggeration?: number } = {}): void {
    try {
      if (!this.isInitialized || !this.map?.isStyleLoaded()) {
        return;
      }

      const { sourceId = DEM_SOURCE_ID, exaggeration = 1.5 } = opts;

      const ensureDem = () => {
        if (!this.map!.getSource(sourceId)) {
          this.map!.addSource(sourceId, {
            type: 'raster-dem',
            url: DEM_URL,
            tileSize: DEM_TILESIZE,
            maxzoom: DEM_MAXZOOM,
          } as any);
        }
      };

      if (on) {
        ensureDem();
        this.map!.setTerrain({ source: sourceId, exaggeration });
      } else {
        this.map!.setTerrain(null);
      }
    } catch (error) {
      this.emit('error', { error, operation: 'setTerrainEnabled', enabled: on });
      throw error;
    }
  }

  /**
   * Check if terrain is currently enabled
   */
  hasTerrain(): boolean {
    try {
      if (!this.isInitialized || !this.map) {
        return false;
      }
      
      // Try the newer getTerrain API first, fallback to style check
      return !!(this.map as any).getTerrain?.() || !!this.map.getStyle()?.terrain;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the underlying Mapbox GL JS map instance
   */
  getMapInstance(): any {
    return this.map;
  }
}

/**
 * Factory function to create map provider
 */
export const createMapProvider = (config: MapProviderConfig): IMapProvider => {
  return new MapProvider(config);
};

export default MapProvider;
