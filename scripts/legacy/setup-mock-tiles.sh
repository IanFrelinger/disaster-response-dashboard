#!/bin/bash

# Disaster Response Dashboard - Mock Tile Setup Script
# This script creates mock geo-tiles for development and testing
# Follows the pipeline architecture approach for maximum flexibility

set -e

echo "🚀 Setting up Mock Geo-Tiles for Disaster Response Dashboard"
echo "=========================================================="

# Configuration
TILES_DIR="./tiles"
DATA_DIR="./data"
PMTILES_DIR="./pmtiles"
SCRIPTS_DIR="./scripts"

# Create directories
mkdir -p $TILES_DIR $DATA_DIR $PMTILES_DIR $SCRIPTS_DIR

echo "📁 Created tile directories"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Tippecanoe on macOS
install_tippecanoe_macos() {
    if ! command_exists tippecanoe; then
        echo "📦 Installing Tippecanoe..."
        if command_exists brew; then
            brew install tippecanoe
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    else
        echo "✅ Tippecanoe already installed"
    fi
}

# Function to install GDAL on macOS
install_gdal_macos() {
    if ! command_exists gdal2tiles.py; then
        echo "📦 Installing GDAL..."
        if command_exists brew; then
            brew install gdal
        else
            echo "❌ Homebrew not found. Please install Homebrew first"
            exit 1
        fi
    else
        echo "✅ GDAL already installed"
    fi
}

# Function to download sample data
download_sample_data() {
    echo "📥 Downloading sample datasets..."
    
    # Create data directory
    mkdir -p $DATA_DIR
    
    # Download Natural Earth admin boundaries (small, global)
    if [ ! -f "$DATA_DIR/admin_boundaries.geojson" ]; then
        echo "  Downloading Natural Earth admin boundaries..."
        # Try multiple sources for Natural Earth data
        if curl -L "https://www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries.zip" \
            -o "$DATA_DIR/countries.zip" 2>/dev/null && [ -s "$DATA_DIR/countries.zip" ]; then
            if unzip -o "$DATA_DIR/countries.zip" -d "$DATA_DIR/" 2>/dev/null; then
                ogr2ogr -f GeoJSON "$DATA_DIR/admin_boundaries.geojson" "$DATA_DIR/ne_10m_admin_0_countries.shp"
                rm "$DATA_DIR/countries.zip" "$DATA_DIR/ne_10m_admin_0_countries."* 2>/dev/null
                echo "  Downloaded and processed Natural Earth data"
            else
                rm -f "$DATA_DIR/countries.zip"
                echo "  Failed to unzip Natural Earth data, trying alternative sources..."
            fi
        fi
        
        # If Natural Earth failed, try alternative sources
        if [ ! -f "$DATA_DIR/admin_boundaries.geojson" ]; then
            if curl -L "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson" \
                -o "$DATA_DIR/admin_boundaries.geojson" 2>/dev/null && [ -s "$DATA_DIR/admin_boundaries.geojson" ]; then
                echo "  Downloaded from GitHub alternative source"
            else
                echo "  Creating simplified admin boundaries..."
                # Create a simple mock admin boundaries file
                cat > "$DATA_DIR/admin_boundaries.geojson" << 'EOF'
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "United States",
        "iso_a3": "USA"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-125, 25],
          [-125, 50],
          [-65, 50],
          [-65, 25],
          [-125, 25]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Canada",
        "iso_a3": "CAN"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-125, 50],
          [-125, 70],
          [-65, 70],
          [-65, 50],
          [-125, 50]
        ]]
      }
    }
  ]
}
EOF
            fi
        fi
    fi
    
    # Download California counties for disaster response context
    if [ ! -f "$DATA_DIR/california_counties.geojson" ]; then
        echo "  Downloading California counties..."
        if curl -L "https://raw.githubusercontent.com/OpenDataIS/california-county-boundaries/master/california-county-boundaries.geojson" \
            -o "$DATA_DIR/california_counties.geojson" 2>/dev/null && [ -s "$DATA_DIR/california_counties.geojson" ] && \
           ! grep -q "404: Not Found" "$DATA_DIR/california_counties.geojson" 2>/dev/null; then
            echo "  Downloaded from GitHub source"
        elif curl -L "https://opendata.arcgis.com/datasets/8713ced9b78a4abb97dc7e5a019f5186_0.geojson" \
            -o "$DATA_DIR/california_counties.geojson" 2>/dev/null && [ -s "$DATA_DIR/california_counties.geojson" ] && \
           ! grep -q "404: Not Found" "$DATA_DIR/california_counties.geojson" 2>/dev/null; then
            echo "  Downloaded from ArcGIS source"
        else
            rm -f "$DATA_DIR/california_counties.geojson"
            echo "  Creating simplified California counties..."
            # Create a simple mock California counties file
            cat > "$DATA_DIR/california_counties.geojson" << 'EOF'
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "San Francisco",
        "county": "San Francisco"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-122.5, 37.7],
          [-122.4, 37.7],
          [-122.4, 37.8],
          [-122.5, 37.8],
          [-122.5, 37.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Alameda",
        "county": "Alameda"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-122.3, 37.6],
          [-122.2, 37.6],
          [-122.2, 37.7],
          [-122.3, 37.7],
          [-122.3, 37.6]
        ]]
      }
    }
  ]
}
EOF
        fi
    fi
    
    # Create mock hazard zones
    if [ ! -f "$DATA_DIR/mock_hazards.geojson" ]; then
        echo "  Creating mock hazard zones..."
        cat > "$DATA_DIR/mock_hazards.geojson" << 'EOF'
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "hazard_type": "wildfire",
        "severity": "high",
        "id": "hazard_001"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-122.5, 37.7],
          [-122.4, 37.7],
          [-122.4, 37.8],
          [-122.5, 37.8],
          [-122.5, 37.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "hazard_type": "flood",
        "severity": "medium",
        "id": "hazard_002"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-122.3, 37.6],
          [-122.2, 37.6],
          [-122.2, 37.7],
          [-122.3, 37.7],
          [-122.3, 37.6]
        ]]
      }
    }
  ]
}
EOF
    fi
    
    # Create mock evacuation routes
    if [ ! -f "$DATA_DIR/mock_routes.geojson" ]; then
        echo "  Creating mock evacuation routes..."
        cat > "$DATA_DIR/mock_routes.geojson" << 'EOF'
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "route_id": "route_001",
        "route_type": "evacuation",
        "distance_km": 5.2,
        "duration_min": 12
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-122.45, 37.75],
          [-122.4, 37.8],
          [-122.35, 37.85]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "route_id": "route_002",
        "route_type": "access",
        "distance_km": 3.1,
        "duration_min": 8
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-122.5, 37.7],
          [-122.45, 37.75],
          [-122.4, 37.8]
        ]
      }
    }
  ]
}
EOF
    fi
}

# Function to generate vector tiles
generate_vector_tiles() {
    echo "🗺️  Generating vector tiles..."
    
    # Generate admin boundaries tiles
    if [ ! -f "$TILES_DIR/admin_boundaries.mbtiles" ]; then
        echo "  Creating admin boundaries tiles..."
        tippecanoe \
            --output "$TILES_DIR/admin_boundaries.mbtiles" \
            --layer admin \
            --name "Admin Boundaries" \
            --description "Country and state boundaries" \
            --minimum-zoom 0 \
            --maximum-zoom 10 \
            --simplification 10 \
            "$DATA_DIR/admin_boundaries.geojson"
    fi
    
    # Generate California counties tiles
    if [ ! -f "$TILES_DIR/california_counties.mbtiles" ]; then
        echo "  Creating California counties tiles..."
        tippecanoe \
            --output "$TILES_DIR/california_counties.mbtiles" \
            --layer counties \
            --name "California Counties" \
            --description "California county boundaries" \
            --minimum-zoom 8 \
            --maximum-zoom 14 \
            --simplification 5 \
            "$DATA_DIR/california_counties.geojson"
    fi
    
    # Generate hazard zones tiles
    if [ ! -f "$TILES_DIR/hazards.mbtiles" ]; then
        echo "  Creating hazard zones tiles..."
        tippecanoe \
            --output "$TILES_DIR/hazards.mbtiles" \
            --layer hazards \
            --name "Hazard Zones" \
            --description "Disaster hazard zones" \
            --minimum-zoom 10 \
            --maximum-zoom 16 \
            --simplification 2 \
            "$DATA_DIR/mock_hazards.geojson"
    fi
    
    # Generate evacuation routes tiles
    if [ ! -f "$TILES_DIR/routes.mbtiles" ]; then
        echo "  Creating evacuation routes tiles..."
        tippecanoe \
            --output "$TILES_DIR/routes.mbtiles" \
            --layer routes \
            --name "Evacuation Routes" \
            --description "Emergency evacuation and access routes" \
            --minimum-zoom 10 \
            --maximum-zoom 16 \
            --simplification 1 \
            "$DATA_DIR/mock_routes.geojson"
    fi
}

# Function to convert to PMTiles (optional, for no-server use)
convert_to_pmtiles() {
    echo "🔄 Converting to PMTiles format..."
    
    # Check if PMTiles CLI is available
    if command_exists pmtiles; then
        for mbtiles_file in "$TILES_DIR"/*.mbtiles; do
            if [ -f "$mbtiles_file" ]; then
                basename=$(basename "$mbtiles_file" .mbtiles)
                pmtiles_file="$PMTILES_DIR/${basename}.pmtiles"
                
                if [ ! -f "$pmtiles_file" ]; then
                    echo "  Converting $basename to PMTiles..."
                    pmtiles convert "$mbtiles_file" "$pmtiles_file"
                fi
            fi
        done
    else
        echo "⚠️  PMTiles CLI not found. Skipping PMTiles conversion."
        echo "   Install with: npm install -g pmtiles"
    fi
}

# Function to create tile server configuration
create_tile_server_config() {
    echo "⚙️  Creating tile server configuration..."
    
    cat > "$TILES_DIR/config.json" << 'EOF'
{
  "options": {
    "paths": {
      "root": "/tiles",
      "fonts": "/fonts",
      "styles": "/styles",
      "mbtiles": "/mbtiles"
    },
    "serve_static": true,
    "formatQuality": {
      "jpeg": 80,
      "webp": 90
    },
    "maxSize": 2048,
    "pbfAlias": "pbf"
  },
  "styles": {
    "disaster-response": {
      "style": "/styles/disaster-response.json",
      "tilejson": {
        "bounds": [-180, -85, 180, 85]
      }
    }
  },
  "data": {
    "admin_boundaries": {
      "mbtiles": "admin_boundaries.mbtiles"
    },
    "california_counties": {
      "mbtiles": "california_counties.mbtiles"
    },
    "hazards": {
      "mbtiles": "hazards.mbtiles"
    },
    "routes": {
      "mbtiles": "routes.mbtiles"
    }
  }
}
EOF

    # Create MapLibre style
    mkdir -p "$TILES_DIR/styles"
    cat > "$TILES_DIR/styles/disaster-response.json" << 'EOF'
{
  "version": 8,
  "name": "Disaster Response",
  "sources": {
    "admin": {
      "type": "vector",
      "url": "http://localhost:8080/data/admin_boundaries.json"
    },
    "counties": {
      "type": "vector", 
      "url": "http://localhost:8080/data/california_counties.json"
    },
    "hazards": {
      "type": "vector",
      "url": "http://localhost:8080/data/hazards.json"
    },
    "routes": {
      "type": "vector",
      "url": "http://localhost:8080/data/routes.json"
    }
  },
  "layers": [
    {
      "id": "admin-background",
      "type": "background",
      "paint": {
        "background-color": "#f8f9fa"
      }
    },
    {
      "id": "admin-boundaries",
      "type": "line",
      "source": "admin",
      "source-layer": "admin",
      "minzoom": 0,
      "maxzoom": 10,
      "paint": {
        "line-color": "#dee2e6",
        "line-width": 1
      }
    },
    {
      "id": "county-boundaries",
      "type": "line",
      "source": "counties",
      "source-layer": "counties",
      "minzoom": 8,
      "maxzoom": 14,
      "paint": {
        "line-color": "#adb5bd",
        "line-width": 2
      }
    },
    {
      "id": "hazard-zones",
      "type": "fill",
      "source": "hazards",
      "source-layer": "hazards",
      "minzoom": 10,
      "maxzoom": 16,
      "paint": {
        "fill-color": [
          "case",
          ["==", ["get", "severity"], "low"], "#ffd43b",
          ["==", ["get", "severity"], "medium"], "#fd7e14",
          ["==", ["get", "severity"], "high"], "#dc3545",
          ["==", ["get", "severity"], "critical"], "#721c24",
          "#6c757d"
        ],
        "fill-opacity": 0.7
      }
    },
    {
      "id": "hazard-borders",
      "type": "line",
      "source": "hazards",
      "source-layer": "hazards",
      "minzoom": 10,
      "maxzoom": 16,
      "paint": {
        "line-color": "#495057",
        "line-width": 2
      }
    },
    {
      "id": "evacuation-routes",
      "type": "line",
      "source": "routes",
      "source-layer": "routes",
      "minzoom": 10,
      "maxzoom": 16,
      "paint": {
        "line-color": "#28a745",
        "line-width": 4,
        "line-dasharray": [2, 2]
      }
    }
  ]
}
EOF
}

# Function to create Docker Compose tile service
create_tile_service() {
    echo "🐳 Creating tile service configuration..."
    
    # Create tileserver-gl Dockerfile
    cat > "$TILES_DIR/Dockerfile" << 'EOF'
FROM maptiler/tileserver-gl:latest

# Copy tiles and configuration
COPY . /data

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1
EOF

    # Create docker-compose override for tiles
    cat > "docker-compose.tiles.yml" << 'EOF'
version: '3.8'

services:
  tileserver:
    build:
      context: ./tiles
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - ./tiles:/data
    environment:
      - MBTILES_FILE=/data/admin_boundaries.mbtiles
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: PMTiles server for static file serving
  pmtiles-server:
    image: nginx:alpine
    ports:
      - "8081:80"
    volumes:
      - ./pmtiles:/usr/share/nginx/html
      - ./tiles/nginx-pmtiles.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped
    profiles:
      - pmtiles
EOF

    # Create nginx config for PMTiles
    cat > "$TILES_DIR/nginx-pmtiles.conf" << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        
        # Enable CORS for PMTiles
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }
    
    # Serve PMTiles with correct headers
    location ~* \.pmtiles$ {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Range';
        add_header 'Accept-Ranges' 'bytes';
        add_header 'Content-Type' 'application/octet-stream';
    }
}
EOF
}

# Function to create frontend integration
create_frontend_integration() {
    echo "🎨 Creating frontend integration..."
    
    # Create tile service configuration
    cat > "frontend/src/services/tileService.ts" << 'EOF'
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
    this.tileServerUrl = process.env.VITE_TILE_SERVER_URL || 'http://localhost:8080';
    this.pmtilesUrl = process.env.VITE_PMTILES_URL || 'http://localhost:8081';
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
EOF

    # Create enhanced map component
    cat > "frontend/src/components/common/DisasterMap.tsx" << 'EOF'
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import tileService from '../../services/tileService';

interface DisasterMapProps {
  center?: [number, number];
  zoom?: number;
  showHazards?: boolean;
  showRoutes?: boolean;
  showCounties?: boolean;
  onMapLoad?: (map: mapboxgl.Map) => void;
  className?: string;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  center = [-122.4194, 37.7749], // San Francisco
  zoom = 10,
  showHazards = true,
  showRoutes = true,
  showCounties = true,
  onMapLoad,
  className = "h-96 w-full"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check tile server health
    tileService.checkHealth().then((isHealthy) => {
      if (!isHealthy) {
        setError('Tile server is not available. Using fallback map.');
      }
    });

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: tileService.getDisasterResponseStyle(),
      center,
      zoom,
      attributionControl: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Handle map load
    map.current.on('load', () => {
      setIsLoading(false);
      if (onMapLoad && map.current) {
        onMapLoad(map.current);
      }
    });

    // Handle errors
    map.current.on('error', (e) => {
      console.error('Map error:', e);
      setError('Failed to load map tiles');
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [center, zoom, onMapLoad]);

  // Toggle layer visibility
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const layers = {
      'hazard-zones': showHazards,
      'hazard-borders': showHazards,
      'evacuation-routes': showRoutes,
      'county-boundaries': showCounties
    };

    Object.entries(layers).forEach(([layerId, visible]) => {
      if (map.current?.getLayer(layerId)) {
        if (visible) {
          map.current.setLayoutProperty(layerId, 'visibility', 'visible');
        } else {
          map.current.setLayoutProperty(layerId, 'visibility', 'none');
        }
      }
    });
  }, [showHazards, showRoutes, showCounties]);

  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ {error}</div>
          <div className="text-sm text-gray-600">
            Using fallback map view. Check tile server configuration.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading map...</div>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default DisasterMap;
EOF
}

# Function to create startup script
create_startup_script() {
    echo "🚀 Creating startup script..."
    
    cat > "scripts/start-tiles.sh" << 'EOF'
#!/bin/bash

# Start tile services for Disaster Response Dashboard

echo "🗺️  Starting Tile Services..."
echo "=============================="

# Check if tiles exist
if [ ! -f "./tiles/admin_boundaries.mbtiles" ]; then
    echo "❌ Tiles not found. Run setup-mock-tiles.sh first."
    exit 1
fi

# Start tile server
echo "Starting Tileserver-GL..."
docker-compose -f docker-compose.tiles.yml up -d tileserver

# Optional: Start PMTiles server
if [ "$1" = "--pmtiles" ]; then
    echo "Starting PMTiles server..."
    docker-compose -f docker-compose.tiles.yml --profile pmtiles up -d pmtiles-server
fi

echo ""
echo "✅ Tile services started!"
echo "📊 Tileserver-GL: http://localhost:8080"
if [ "$1" = "--pmtiles" ]; then
    echo "📁 PMTiles server: http://localhost:8081"
fi
echo ""
echo "🔧 To view tiles in browser:"
echo "   http://localhost:8080/"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.tiles.yml down"
EOF

    chmod +x "scripts/start-tiles.sh"
}

# Function to create test script
create_test_script() {
    echo "🧪 Creating test script..."
    
    cat > "scripts/test-tiles.sh" << 'EOF'
#!/bin/bash

# Test tile services for Disaster Response Dashboard

echo "🧪 Testing Tile Services..."
echo "==========================="

# Test tile server health
echo "Testing Tileserver-GL health..."
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ Tileserver-GL is healthy"
else
    echo "❌ Tileserver-GL is not responding"
    exit 1
fi

# Test tile endpoints
echo "Testing tile endpoints..."
endpoints=(
    "/data/admin_boundaries.json"
    "/data/california_counties.json"
    "/data/hazards.json"
    "/data/routes.json"
)

for endpoint in "${endpoints[@]}"; do
    if curl -f "http://localhost:8080$endpoint" > /dev/null 2>&1; then
        echo "✅ $endpoint is accessible"
    else
        echo "❌ $endpoint is not accessible"
    fi
done

# Test PMTiles server if running
if curl -f http://localhost:8081/ > /dev/null 2>&1; then
    echo "✅ PMTiles server is accessible"
    
    pmtiles_files=(
        "/admin_boundaries.pmtiles"
        "/california_counties.pmtiles"
        "/hazards.pmtiles"
        "/routes.pmtiles"
    )
    
    for file in "${pmtiles_files[@]}"; do
        if curl -f "http://localhost:8081$file" > /dev/null 2>&1; then
            echo "✅ $file is accessible"
        else
            echo "❌ $file is not accessible"
        fi
    done
else
    echo "ℹ️  PMTiles server not running (use --pmtiles flag to start)"
fi

echo ""
echo "🎉 Tile testing complete!"
EOF

    chmod +x "scripts/test-tiles.sh"
}

# Main execution
main() {
    echo "🔧 Checking system requirements..."
    
    # Detect OS and install dependencies
    if [[ "$OSTYPE" == "darwin"* ]]; then
        install_tippecanoe_macos
        install_gdal_macos
    else
        echo "⚠️  This script is optimized for macOS."
        echo "   For other systems, please install Tippecanoe and GDAL manually."
        echo "   Tippecanoe: https://github.com/mapbox/tippecanoe"
        echo "   GDAL: https://gdal.org/"
    fi
    
    download_sample_data
    generate_vector_tiles
    convert_to_pmtiles
    create_tile_server_config
    create_tile_service
    create_frontend_integration
    create_startup_script
    create_test_script
    
    echo ""
    echo "🎉 Mock tile setup complete!"
    echo ""
    echo "📁 Generated files:"
    echo "   - Tiles: $TILES_DIR/"
    echo "   - PMTiles: $PMTILES_DIR/"
    echo "   - Data: $DATA_DIR/"
    echo "   - Scripts: scripts/"
    echo ""
    echo "🚀 To start tile services:"
    echo "   ./scripts/start-tiles.sh"
    echo ""
    echo "🧪 To test tile services:"
    echo "   ./scripts/test-tiles.sh"
    echo ""
    echo "🔧 To integrate with frontend:"
    echo "   Import DisasterMap component from frontend/src/components/common/DisasterMap.tsx"
    echo ""
    echo "📚 Documentation:"
    echo "   - Tileserver-GL: http://localhost:8080/ (when running)"
    echo "   - PMTiles: http://localhost:8081/ (when running with --pmtiles)"
}

# Run main function
main "$@"
