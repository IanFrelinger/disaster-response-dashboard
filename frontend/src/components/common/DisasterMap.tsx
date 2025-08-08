import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import tileService from '../../services/tileService';
import { MAP_CONFIG } from '../../config';

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

    // Check if we have Mapbox access token
    const hasMapboxToken = MAP_CONFIG.mapbox.accessToken && MAP_CONFIG.mapbox.accessToken !== '';
    
    // Initialize map with appropriate configuration
    const mapConfig: any = {
      container: mapContainer.current,
      center,
      zoom,
      attributionControl: true
    };

    if (hasMapboxToken) {
      // Use Mapbox with custom style
      mapConfig.style = tileService.getDisasterResponseStyle();
      mapboxgl.accessToken = MAP_CONFIG.mapbox.accessToken;
    } else {
      // Use tile server directly with a basic style
      mapConfig.style = {
        version: 8,
        name: 'Disaster Response',
        sources: tileService.getVectorTileSources(),
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

    map.current = new mapboxgl.Map(mapConfig);

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
