import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { 
  HazardLayer, 
  WeatherData, 
  Building, 
  EvacuationZone,
  OperationalRoute,
  EmergencyUnit 
} from '../../types/emergency-response';

interface Enhanced3DTerrainProps {
  mapboxAccessToken: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  showDisasterResponse?: boolean;
  hazards?: HazardLayer[];
  weather?: WeatherData;
  buildings?: Building[];
  evacuationZones?: EvacuationZone[];
  routes?: OperationalRoute[];
  units?: EmergencyUnit[];
  onMapLoad?: (map: mapboxgl.Map) => void;
  onHazardClick?: (hazard: HazardLayer) => void;
  onBuildingClick?: (building: Building) => void;
  onRouteClick?: (route: OperationalRoute) => void;
  onUnitClick?: (unit: EmergencyUnit) => void;
  className?: string;
}

export const Enhanced3DTerrain: React.FC<Enhanced3DTerrainProps> = ({
  mapboxAccessToken,
  initialCenter = [-122.4194, 37.7749], // San Francisco
  initialZoom = 11,
  showDisasterResponse = true,
  hazards = [],
  weather = {
    current: {
      temp: 70,
      humidity: 50,
      windSpeed: 10,
      windDirection: 0,
      windGusts: 15,
      fireWeatherIndex: 'low',
      visibility: 10,
      pressure: 1013
    },
    forecast: {
      redFlagWarning: false,
      windShiftExpected: 'No change expected',
      humidityRecovery: 'Stable conditions',
      tempDrop: 'No significant change',
      nextHour: {
        temp: 70,
        humidity: 50,
        windSpeed: 10,
        windDirection: 0
      }
    }
  },
  buildings = [],
  evacuationZones = [],
  routes = [],
  units = [],
  onMapLoad,
  onHazardClick,
  onBuildingClick,
  onRouteClick,
  onUnitClick,
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showTerrainControls, setShowTerrainControls] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxAccessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: initialCenter,
      zoom: initialZoom,
      pitch: 45,
      bearing: 0,
      antialias: true,
      preserveDrawingBuffer: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
    
    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-left'
    );

    // Map load event
    map.current.on('load', () => {
      setIsMapLoaded(true);
      onMapLoad?.(map.current!);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxAccessToken, initialCenter, initialZoom, onMapLoad]);

  // Setup 3D terrain and buildings
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Enable 3D terrain
    map.current.setTerrain({ 
      source: 'mapbox-dem', 
      exaggeration: 1.5 
    });

    // Add hillshading for terrain depth
    map.current.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14
    });

    // Add hillshading layer
    map.current.addLayer({
      id: 'hillshading',
      source: 'mapbox-dem',
      type: 'hillshade',
      paint: {
        'hillshade-shadow-color': '#000000',
        'hillshade-highlight-color': '#ffffff',
        'hillshade-accent-color': '#000000',
        'hillshade-illumination-anchor': 'viewport'
      }
    });

    // Add 3D buildings layer
    map.current.addLayer({
      id: '3d-buildings',
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

    // Add sky layer for atmospheric effect
    map.current.addLayer({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0]
      }
    });

  }, [isMapLoaded]);

  // Add weather effects
  useEffect(() => {
    if (!map.current || !isMapLoaded || !weather.current) return;

    // Add fog layer for atmospheric conditions
    if (weather.current.humidity > 80) {
      map.current.addLayer({
        id: 'fog',
        type: 'fill',
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': 0.1
        }
      }, 'hillshading');
    }

    // Add wind effect to terrain
    if (weather.current.windSpeed > 20) {
      map.current.setPaintProperty('hillshading', 'hillshade-shadow-color', '#000000');
      map.current.setPaintProperty('hillshading', 'hillshade-highlight-color', '#ffffff');
    }

  }, [isMapLoaded, weather.current]);

  // Add hazard-specific terrain modifications
  useEffect(() => {
    if (!map.current || !isMapLoaded || hazards.length === 0) return;

    // Modify terrain for flood areas
    hazards.forEach(hazard => {
      if (hazard.type === 'flood' && hazard.flood) {
        // Handle both geometry formats: array or object
        let geometry;
        if (Array.isArray(hazard.flood.current.geometry)) {
          // Array format: convert to proper geometry
          geometry = {
            type: 'Polygon',
            coordinates: hazard.flood.current.geometry
          };
        } else if (hazard.flood.current.geometry && typeof hazard.flood.current.geometry === 'object') {
          // Object format: use as is
          geometry = hazard.flood.current.geometry;
        } else {
          return; // Skip invalid geometry
        }
        
        // Lower terrain in flood zones for realistic water flow
        map.current!.addLayer({
          id: `flood-terrain-${hazard.id}`,
          type: 'fill',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: geometry,
              properties: {}
            }
          },
          paint: {
            'fill-color': '#0066CC',
            'fill-opacity': 0.3
          }
        }, 'hillshading');
      }
    });

  }, [isMapLoaded, hazards]);

  // Camera controls for tactical operations
  const flyToHazard = useCallback((hazard: HazardLayer) => {
    if (!map.current) return;

    map.current.flyTo({
      center: hazard.location,
      zoom: 16,
      pitch: 60,
      bearing: 0,
      duration: 3000
    });
  }, []);

  // Enhanced building inspection
  const flyToBuilding = useCallback((building: Building) => {
    if (!map.current) return;

    map.current.flyTo({
      center: building.coordinates,
      zoom: 18,
      pitch: 45,
      bearing: 0,
      duration: 2000
    });
  }, []);

  // Route visualization with terrain
  const flyToRoute = useCallback((route: OperationalRoute) => {
    if (!map.current) return;

    // Calculate route bounds
    const bounds = new mapboxgl.LngLatBounds();
    route.waypoints.forEach(coord => bounds.extend(coord));

    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 3000,
      pitch: 30
    });
  }, []);

  // Unit tracking
  const flyToUnit = useCallback((unit: EmergencyUnit) => {
    if (!map.current) return;

    map.current.flyTo({
      center: unit.location,
      zoom: 17,
      pitch: 50,
      bearing: 0,
      duration: 2000
    });
  }, []);

  // Terrain control panel
  const TerrainControls = () => (
    <div className="terrain-controls">
      <h3>Terrain</h3>
      <div className="terrain-options">
        <label className="terrain-option">
          <input
            type="checkbox"
            checked={showTerrainControls}
            onChange={(e) => setShowTerrainControls(e.target.checked)}
          />
          Show 3D Buildings
        </label>
        <button 
          className="terrain-btn"
          onClick={() => {
            if (map.current) {
              map.current.setPitch(map.current.getPitch() === 0 ? 45 : 0);
            }
          }}
        >
          Toggle 3D View
        </button>
        <button 
          className="terrain-btn"
          onClick={() => {
            if (map.current) {
              map.current.setBearing(0);
              map.current.setPitch(0);
            }
          }}
        >
          Reset View
        </button>
      </div>
    </div>
  );

  return (
    <div className={`enhanced-3d-terrain ${className}`}>
      <div ref={mapContainer} className="map-container" />
      
      {isMapLoaded && showDisasterResponse && (
        <TerrainControls />
      )}

      {/* Terrain Controls Overlay */}
      {isMapLoaded && (
        <div className="terrain-controls-overlay">
          <TerrainControls />
        </div>
      )}

      {/* Loading Indicator */}
      {!isMapLoaded && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading 3D Terrain...</span>
          </div>
        </div>
      )}
    </div>
  );
};
