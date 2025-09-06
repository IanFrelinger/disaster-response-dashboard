import { Map as MapboxMap } from 'mapbox-gl';
import { RouteManager } from './RouteManager';

export class MapEventManager {
  private routeManager: RouteManager;
  private map: MapboxMap | null = null;
  private eventHandlers = new Map<string, () => void>();
  private isInitialized = false;

  constructor() {
    this.routeManager = RouteManager.getInstance();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Single handler for map idle
    this.eventHandlers.set('mapIdle', this.handleMapIdle.bind(this));
    
    // Single handler for route generation
    this.eventHandlers.set('routeGeneration', this.handleRouteGeneration.bind(this));
  }

  initialize(map: MapboxMap): void {
    if (this.isInitialized) {
      console.log('🛡️ [EVENT MANAGER] Already initialized, skipping...');
      return;
    }

    this.map = map;
    this.routeManager.setMap(map);
    this.attachEventListeners();
    this.isInitialized = true;
    
    console.log('✅ [EVENT MANAGER] Initialized successfully');
  }

  private attachEventListeners(): void {
    if (!this.map) return;

    // Remove any existing listeners first
    this.detachEventListeners();

    // Add single event listener for map idle
    const handleIdle = this.eventHandlers.get('mapIdle');
    if (handleIdle) {
      this.map.on('idle', handleIdle);
      console.log('🎧 [EVENT MANAGER] Attached idle event listener');
    }
  }

  private detachEventListeners(): void {
    if (!this.map) return;

    // Remove all event listeners
    const handleIdle = this.eventHandlers.get('mapIdle');
    if (handleIdle) {
      this.map.off('idle', handleIdle);
      console.log('🎧 [EVENT MANAGER] Detached idle event listener');
    }
  }

  private async handleMapIdle(): Promise<void> {
    console.log('🎧 [EVENT MANAGER] Map idle event triggered');
    
    // Only trigger route generation once
    await this.routeManager.generateRoutesOnce();
  }

  private async handleRouteGeneration(): Promise<void> {
    console.log('🎧 [EVENT MANAGER] Route generation requested');
    
    // Handle route generation requests
    await this.routeManager.generateRoutesOnce();
  }

  // Public method to manually trigger route generation
  async triggerRouteGeneration(): Promise<void> {
    await this.handleRouteGeneration();
  }

  // Cleanup method
  cleanup(): void {
    this.detachEventListeners();
    this.isInitialized = false;
    console.log('🧹 [EVENT MANAGER] Cleanup completed');
  }

  // Get current state
  getState() {
    return {
      isInitialized: this.isInitialized,
      routesGenerated: this.routeManager.isRoutesGenerated(),
      isGenerating: this.routeManager.isGeneratingRoutes(),
      buildingRoutes: this.routeManager.getBuildingRoutes()
    };
  }
}
