// Tile Service for Disaster Response Dashboard
// Provides access to mock geo-tiles for development and testing

export interface TileSource {
  id: string;
  type: 'vector' | 'raster';
  url: string;
  layers?: string[];
}

export interface TileLayer {
  id: string;
  source: string;
  sourceLayer?: string;
  type: 'fill' | 'line' | 'symbol' | 'circle';
  paint?: Record<string, any>;
  layout?: Record<string, any>;
  filter?: any[];
  minzoom?: number;
  maxzoom?: number;
}

export class TileService {
  private static instance: TileService;
  private tileServerUrl: string;
  private pmtilesUrl: string;

  constructor() {
    this.tileServerUrl = import.meta.env.VITE_TILE_SERVER_URL || 'http://localhost:8080';
    this.pmtilesUrl = import.meta.env.VITE_PMTILES_URL || 'http://localhost:8081';
  }

  static getInstance(): TileService {
    if (!TileService.instance) {
      TileService.instance = new TileService();
    }
    return TileService.instance;
  }

  // Get vector tile sources
  getVectorTileSources(): Record<string, TileSource> {
    return {
      admin_boundaries: {
        id: 'admin_boundaries',
        type: 'vector',
        url: `${this.tileServerUrl}/data/admin_boundaries.json`
      },
      california_counties: {
        id: 'california_counties',
        type: 'vector',
        url: `${this.tileServerUrl}/data/california_counties.json`
      },
      hazards: {
        id: 'hazards',
        type: 'vector',
        url: `${this.tileServerUrl}/data/hazards.json`
      },
      routes: {
        id: 'routes',
        type: 'vector',
        url: `${this.tileServerUrl}/data/routes.json`
      }
    };
  }

  // Get PMTiles sources (for no-server use)
  getPMTileSources(): Record<string, TileSource> {
    return {
      admin_boundaries: {
        id: 'admin_boundaries',
        type: 'vector',
        url: `${this.pmtilesUrl}/admin_boundaries.pmtiles`
      },
      california_counties: {
        id: 'california_counties',
        type: 'vector',
        url: `${this.pmtilesUrl}/california_counties.pmtiles`
      },
      hazards: {
        id: 'hazards',
        type: 'vector',
        url: `${this.pmtilesUrl}/hazards.pmtiles`
      },
      routes: {
        id: 'routes',
        type: 'vector',
        url: `${this.pmtilesUrl}/routes.pmtiles`
      }
    };
  }

  // Get disaster response style
  getDisasterResponseStyle(): any {
    return {
      version: 8,
      name: 'Disaster Response',
      sources: this.getVectorTileSources(),
      layers: [
        {
          id: 'admin-background',
          type: 'background',
          paint: {
            'background-color': '#f8f9fa'
          }
        },
        {
          id: 'admin-boundaries',
          type: 'line',
          source: 'admin_boundaries',
          'source-layer': 'admin',
          minzoom: 0,
          maxzoom: 10,
          paint: {
            'line-color': '#dee2e6',
            'line-width': 1
          }
        },
        {
          id: 'county-boundaries',
          type: 'line',
          source: 'california_counties',
          'source-layer': 'counties',
          minzoom: 8,
          maxzoom: 14,
          paint: {
            'line-color': '#adb5bd',
            'line-width': 2
          }
        },
        {
          id: 'hazard-zones',
          type: 'fill',
          source: 'hazards',
          'source-layer': 'hazards',
          minzoom: 10,
          maxzoom: 16,
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'severity'], 'low'], '#ffd43b',
              ['==', ['get', 'severity'], 'medium'], '#fd7e14',
              ['==', ['get', 'severity'], 'high'], '#dc3545',
              ['==', ['get', 'severity'], 'critical'], '#721c24',
              '#6c757d'
            ],
            'fill-opacity': 0.7
          }
        },
        {
          id: 'hazard-borders',
          type: 'line',
          source: 'hazards',
          'source-layer': 'hazards',
          minzoom: 10,
          maxzoom: 16,
          paint: {
            'line-color': '#495057',
            'line-width': 2
          }
        },
        {
          id: 'evacuation-routes',
          type: 'line',
          source: 'routes',
          'source-layer': 'routes',
          minzoom: 10,
          maxzoom: 16,
          paint: {
            'line-color': '#28a745',
            'line-width': 4,
            'line-dasharray': [2, 2]
          }
        }
      ]
    };
  }

  // Check if tile server is healthy
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.tileServerUrl}/`);
      return response.ok;
    } catch (error) {
      console.warn('Tile server health check failed:', error);
      return false;
    }
  }
}

export default TileService.getInstance();
