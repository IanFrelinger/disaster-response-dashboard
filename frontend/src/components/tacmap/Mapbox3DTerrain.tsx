import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { 
  useDataFusion
} from '../../services/foundryDataFusion';
import type { HazardZone, EmergencyUnit, EvacuationRoute } from '../../sdk/foundry-sdk';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Building2,
  RefreshCw,
  Mountain
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw';

interface Mapbox3DTerrainProps {
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  showHazards?: boolean;
  showUnits?: boolean;
  showRoutes?: boolean;
  showAnalytics?: boolean;
  showBuildings?: boolean;
  showTerrain?: boolean;
  onMapLoad?: () => void;
  onHazardClick?: (hazard: HazardZone) => void;
  onUnitClick?: (unit: EmergencyUnit) => void;
  onRouteClick?: (route: EvacuationRoute) => void;
  className?: string;
}

// Convert H3 cell ID to coordinates
const h3ToCoordinates = (h3CellId: string): [number, number] => {
  // Simple conversion for demo - in production, use actual H3 library
  const hash = h3CellId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const lat = 37.7749 + (hash % 1000) / 10000;
  const lng = -122.4194 + (hash % 1000) / 10000;
  return [lng, lat];
};

export const Mapbox3DTerrain: React.FC<Mapbox3DTerrainProps> = ({
  center = [-122.4194, 37.7749],
  zoom = 15,
  pitch = 60,
  bearing = 0,
  showHazards = true,
  showUnits = true,
  showRoutes = true,
  showAnalytics = true,
  showBuildings = true,
  showTerrain = true,
  onMapLoad,
  onHazardClick,
  onUnitClick,
  onRouteClick,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [localShowTerrain, setLocalShowTerrain] = useState(showTerrain);
  const [localShowBuildings, setLocalShowBuildings] = useState(showBuildings);
  const [localShowHazards, setLocalShowHazards] = useState(showHazards);
  const [localShowUnits, setLocalShowUnits] = useState(showUnits);
  const [localShowRoutes, setLocalShowRoutes] = useState(showRoutes);

  // Get Foundry data
  const fusedData = useDataFusion();

  // Initialize map with 3D terrain and building extrusions
  const initMap = useCallback(() => {
    if (!containerRef.current) return;

    setIsLoading(true);

    // Clean up any existing map
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (error) {
        console.warn('Error removing existing map:', error);
      }
      mapRef.current = null;
    }

    try {
      console.log('Initializing Mapbox map with 3D terrain...');
      
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: getMapStyle(mapStyle),
        center: center,
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        antialias: true,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false, // Allow fallback
        maxZoom: 20,
        minZoom: 3
      });

      // Add error recovery
      let loadTimeout: NodeJS.Timeout;
      let errorCount = 0;
      const maxErrors = 3;

      const handleMapLoad = () => {
        console.log('Mapbox map loaded, adding 3D terrain and building extrusions...');
        clearTimeout(loadTimeout);
        
        try {
          // Add terrain and heightmap
          if (localShowTerrain) {
            addTerrainLayers(map);
          }
          
          // Add 3D building extrusions
          if (localShowBuildings) {
            addBuildingExtrusions(map);
          }
          
          // Add Foundry data layers
          if (localShowHazards || localShowUnits || localShowRoutes) {
            addFoundryDataLayers(map);
          }
          
          setIsLoading(false);
          onMapLoad?.();
        } catch (error) {
          console.error('Error adding layers:', error);
          setIsLoading(false);
        }
      };

      const handleMapError = (e: any) => {
        errorCount++;
        console.error(`Mapbox error (${errorCount}/${maxErrors}):`, e);
        
        if (errorCount >= maxErrors) {
          console.error('Too many Mapbox errors, stopping retries');
          setIsLoading(false);
        } else {
          console.log('Retrying map initialization...');
          setTimeout(() => {
            if (mapRef.current) {
              initMap();
            }
          }, 2000);
        }
      };

      // Set timeout for map loading
      loadTimeout = setTimeout(() => {
        console.warn('Map load timeout, retrying...');
        handleMapError(new Error('Map load timeout'));
      }, 30000); // Increased timeout to 30 seconds

      map.on('load', handleMapLoad);
      map.on('error', handleMapError);
      map.on('webglcontextlost', () => {
        console.error('WebGL context lost, attempting recovery...');
        setTimeout(() => {
          if (mapRef.current) {
            initMap();
          }
        }, 1000);
      });

      mapRef.current = map;
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
    }
  }, [center, zoom, pitch, bearing, mapStyle, localShowBuildings, localShowTerrain, localShowHazards, localShowUnits, localShowRoutes, onMapLoad]);

  // Get map style based on selection
  const getMapStyle = (style: 'dark' | 'satellite' | 'streets'): string => {
    switch (style) {
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-v9';
      case 'streets':
        return 'mapbox://styles/mapbox/streets-v12';
      default:
        return 'mapbox://styles/mapbox/dark-v11';
    }
  };

  // Add terrain and heightmap layers
  const addTerrainLayers = (map: mapboxgl.Map) => {
    console.log('Adding 3D terrain and heightmap...');
    
    // Add terrain source
    map.addSource('mapbox-terrain', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb',
      tileSize: 512,
      maxzoom: 14
    });

    // Add hillshading layer
    map.addLayer({
      id: 'hillshading',
      source: 'mapbox-terrain',
      type: 'hillshade',
      paint: {
        'hillshade-exaggeration': 0.5,
        'hillshade-shadow-color': '#000000',
        'hillshade-highlight-color': '#ffffff',
        'hillshade-accent-color': '#000000'
      }
    });

    // Set terrain with exaggeration
    map.setTerrain({
      source: 'mapbox-terrain',
      exaggeration: 1.0
    });

    console.log('3D terrain and heightmap added successfully');
  };

  // Add 3D building extrusions using Mapbox building data
  const addBuildingExtrusions = (map: mapboxgl.Map) => {
    console.log('Adding 3D building extrusions...');
    
    // Add 3D building extrusions layer
    map.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': [
          'case',
          ['==', ['get', 'type'], 'commercial'], '#4169E1',
          ['==', ['get', 'type'], 'residential'], '#8B4513',
          ['==', ['get', 'type'], 'industrial'], '#696969',
          ['==', ['get', 'type'], 'government'], '#DC143C',
          '#808080'
        ],
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
        'fill-extrusion-opacity': 0.8
      }
    });

    // Add building outlines
    map.addLayer({
      id: 'building-outlines',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'line',
      minzoom: 15,
      paint: {
        'line-color': '#ffffff',
        'line-width': 1,
        'line-opacity': 0.3
      }
    });

    console.log('3D building extrusions added successfully');
  };

  // Add Foundry data layers
  const addFoundryDataLayers = useCallback((map: mapboxgl.Map) => {
    if (!fusedData?.hazards?.active) return;

    // Remove existing sources and layers first
    try {
      if (map.getSource('hazard-zones')) {
        if (map.getLayer('hazard-markers')) map.removeLayer('hazard-markers');
        map.removeSource('hazard-zones');
      }
      if (map.getSource('emergency-units')) {
        if (map.getLayer('unit-markers')) map.removeLayer('unit-markers');
        map.removeSource('emergency-units');
      }
      if (map.getSource('evacuation-routes')) {
        if (map.getLayer('route-lines')) map.removeLayer('route-lines');
        map.removeSource('evacuation-routes');
      }
    } catch (error) {
      console.warn('Error removing existing sources:', error);
    }

    // Add hazard zones
    if (showHazards && fusedData.hazards.active.length > 0) {
      try {
        map.addSource('hazard-zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fusedData.hazards.active.map((hazard: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: h3ToCoordinates(hazard.h3CellId)
            },
            properties: {
              id: hazard.h3CellId,
              riskLevel: hazard.riskLevel,
              riskScore: hazard.riskScore,
              affectedPopulation: hazard.affectedPopulation
            }
          }))
        }
      });

      map.addLayer({
        id: 'hazard-markers',
        type: 'circle',
        source: 'hazard-zones',
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
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
      } catch (error) {
        console.error('Error adding hazard zones:', error);
      }

      // Add click handler for hazards
      map.on('click', 'hazard-markers', (e) => {
        if (e.features && e.features[0] && fusedData?.hazards?.active) {
          const feature = e.features[0];
          const hazard = fusedData.hazards.active.find((h: any) => h.h3CellId === feature?.properties?.id);
          if (hazard) {
            onHazardClick?.(hazard);
          }
        }
      });
    }

    // Add emergency units
    if (showUnits && fusedData?.units?.available && fusedData.units.available.length > 0) {
      try {
        map.addSource('emergency-units', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fusedData.units.available.map((unit: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: h3ToCoordinates(unit.currentLocation)
            },
            properties: {
              id: unit.unitId,
              type: unit.unitType,
              callSign: unit.callSign,
              status: unit.status
            }
          }))
        }
      });

      map.addLayer({
        id: 'unit-markers',
        type: 'circle',
        source: 'emergency-units',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'case',
            ['==', ['get', 'type'], 'fire_engine'], '#ff4444',
            ['==', ['get', 'type'], 'ambulance'], '#44ff44',
            ['==', ['get', 'type'], 'police'], '#4444ff',
            '#888888'
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
      } catch (error) {
        console.error('Error adding emergency units:', error);
      }

      // Add click handler for units
      map.on('click', 'unit-markers', (e) => {
        if (e.features && e.features[0] && fusedData?.units?.available) {
          const feature = e.features[0];
          const unit = fusedData.units.available.find((u: any) => u.unitId === feature?.properties?.id);
          if (unit) {
            onUnitClick?.(unit);
          }
        }
      });
    }

    // Add evacuation routes
    if (showRoutes && fusedData?.routes?.safe && fusedData.routes.safe.length > 0) {
      try {
        map.addSource('evacuation-routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fusedData.routes.safe.map((route: any) => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.geometry.coordinates
            },
            properties: {
              id: route.routeId,
              name: route.routeName,
              status: route.status,
              estimatedTime: route.estimatedTime
            }
          }))
        }
      });

      map.addLayer({
        id: 'route-lines',
        type: 'line',
        source: 'evacuation-routes',
        paint: {
          'line-color': '#00ff00',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
      } catch (error) {
        console.error('Error adding evacuation routes:', error);
      }

      // Add click handler for routes
      map.on('click', 'route-lines', (e) => {
        if (e.features && e.features[0] && fusedData?.routes?.safe) {
          const feature = e.features[0];
          const route = fusedData.routes.safe.find((r: any) => r.routeId === feature?.properties?.id);
          if (route) {
            onRouteClick?.(route);
          }
        }
      });
    }
  }, [fusedData, localShowHazards, localShowUnits, localShowRoutes, onHazardClick, onUnitClick, onRouteClick]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh data by re-initializing the map
      if (mapRef.current) {
        addFoundryDataLayers(mapRef.current);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Change map style
  const handleStyleChange = (newStyle: 'dark' | 'satellite' | 'streets') => {
    setMapStyle(newStyle);
    if (mapRef.current) {
      mapRef.current.setStyle(getMapStyle(newStyle));
    }
  };

  // Initialize map on mount
  useEffect(() => {
    initMap();
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.warn('Error cleaning up map:', error);
        }
        mapRef.current = null;
      }
    };
  }, [initMap]);

  // Update layers when data changes - memoized to prevent excessive re-renders
  const memoizedAddFoundryDataLayers = useCallback(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      try {
        addFoundryDataLayers(mapRef.current);
      } catch (error) {
        console.error('Error updating layers:', error);
      }
    }
  }, [addFoundryDataLayers]);

  useEffect(() => {
    memoizedAddFoundryDataLayers();
  }, [memoizedAddFoundryDataLayers]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden bg-gray-800 border border-gray-600"
        style={{ minHeight: '600px', position: 'relative' }}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
          >
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading 3D Terrain with Building Extrusions...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

              {/* Control Panel */}
        <div className="ios-card" style={{ position: 'absolute', top: 'var(--ios-spacing-md)', right: 'var(--ios-spacing-md)', zIndex: 20, margin: 0, padding: 'var(--ios-spacing-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-md)' }}>
            <h3 className="ios-subheadline" style={{ margin: 0, marginBottom: 'var(--ios-spacing-sm)', color: 'var(--ios-blue)' }}>3D Map Controls</h3>
          
          {/* Map Style Selector */}
          <div className="ios-segmented-control">
            <div 
              className={`ios-segment ${mapStyle === 'dark' ? 'active' : ''}`}
              onClick={() => handleStyleChange('dark')}
            >
              Dark
            </div>
            <div 
              className={`ios-segment ${mapStyle === 'satellite' ? 'active' : ''}`}
              onClick={() => handleStyleChange('satellite')}
            >
              Satellite
            </div>
            <div 
              className={`ios-segment ${mapStyle === 'streets' ? 'active' : ''}`}
              onClick={() => handleStyleChange('streets')}
            >
              Streets
            </div>
          </div>

          {/* Layer Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-sm)' }}>
            <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)' }}>
              <input
                type="checkbox"
                checked={localShowTerrain}
                onChange={(e) => setLocalShowTerrain(e.target.checked)}
                className="ios-input"
                style={{ width: '16px', height: '16px', margin: 0 }}
              />
              <Mountain className="w-3 h-3" style={{ color: 'var(--ios-blue)' }} />
              <span className="ios-caption" style={{ margin: 0 }}>3D Terrain</span>
            </label>
            
            <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)' }}>
              <input
                type="checkbox"
                checked={localShowBuildings}
                onChange={(e) => setLocalShowBuildings(e.target.checked)}
                className="ios-input"
                style={{ width: '16px', height: '16px', margin: 0 }}
              />
              <Building2 className="w-3 h-3" style={{ color: 'var(--ios-green)' }} />
              <span className="ios-caption" style={{ margin: 0 }}>3D Buildings</span>
            </label>
            
            <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)' }}>
              <input
                type="checkbox"
                checked={localShowHazards}
                onChange={(e) => setLocalShowHazards(e.target.checked)}
                className="ios-input"
                style={{ width: '16px', height: '16px', margin: 0 }}
              />
              <AlertTriangle className="w-3 h-3" style={{ color: 'var(--ios-red)' }} />
              <span className="ios-caption" style={{ margin: 0 }}>Hazards</span>
            </label>
            
            <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)' }}>
              <input
                type="checkbox"
                checked={localShowUnits}
                onChange={(e) => setLocalShowUnits(e.target.checked)}
                className="ios-input"
                style={{ width: '16px', height: '16px', margin: 0 }}
              />
              <Shield className="w-3 h-3" style={{ color: 'var(--ios-green)' }} />
              <span className="ios-caption" style={{ margin: 0 }}>Units</span>
            </label>
            
            <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)' }}>
              <input
                type="checkbox"
                checked={localShowRoutes}
                onChange={(e) => setLocalShowRoutes(e.target.checked)}
                className="ios-input"
                style={{ width: '16px', height: '16px', margin: 0 }}
              />
              <MapPin className="w-3 h-3" style={{ color: 'var(--ios-orange)' }} />
              <span className="ios-caption" style={{ margin: 0 }}>Routes</span>
            </label>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ios-button"
            style={{ fontSize: '12px', padding: 'var(--ios-spacing-xs) var(--ios-spacing-sm)' }}
          >
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </div>
          </button>
        </div>
      </div>

      {/* Data Status */}
      {!fusedData && (
        <div className="ios-card" style={{ position: 'absolute', bottom: 'var(--ios-spacing-md)', left: 'var(--ios-spacing-md)', zIndex: 20, margin: 0, backgroundColor: 'var(--ios-orange)', color: 'white' }}>
          <div className="ios-flex" style={{ gap: 'var(--ios-spacing-sm)' }}>
            <div className="ios-spinner" style={{ width: '12px', height: '12px', borderTopColor: 'white' }}></div>
            <span className="ios-caption" style={{ margin: 0, color: 'white' }}>Loading Foundry data...</span>
          </div>
        </div>
      )}

      {/* Recovery Button */}
      <div className="ios-card" style={{ position: 'absolute', bottom: 'var(--ios-spacing-md)', left: 'var(--ios-spacing-md)', zIndex: 30, margin: 0, backgroundColor: 'var(--ios-red)', color: 'white' }}>
        <button
          onClick={() => {
            console.log('Manual map recovery triggered');
            if (mapRef.current) {
              try {
                mapRef.current.remove();
              } catch (error) {
                console.warn('Error removing map during recovery:', error);
              }
              mapRef.current = null;
            }
            setTimeout(() => {
              initMap();
            }, 500);
          }}
          className="ios-flex"
          style={{ gap: 'var(--ios-spacing-sm)', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <RefreshCw className="w-4 h-4" />
          <span className="ios-caption" style={{ margin: 0, color: 'white' }}>Recover Map</span>
        </button>
      </div>

              {/* Analytics Panel */}
        {showAnalytics && (
          <div className="ios-card" style={{ position: 'absolute', bottom: 'var(--ios-spacing-md)', right: 'var(--ios-spacing-md)', zIndex: 20, margin: 0, maxWidth: '280px' }}>
            <h3 className="ios-subheadline" style={{ margin: 0, marginBottom: 'var(--ios-spacing-sm)', color: 'var(--ios-purple)' }}>Analytics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
            <div className="ios-flex-between">
              <span className="ios-caption" style={{ margin: 0 }}>Active Hazards:</span>
              <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-red)', fontWeight: '600' }}>{fusedData?.hazards?.active?.length || 0}</span>
            </div>
            <div className="ios-flex-between">
              <span className="ios-caption" style={{ margin: 0 }}>Available Units:</span>
              <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-green)', fontWeight: '600' }}>{fusedData?.units?.available?.length || 0}</span>
            </div>
            <div className="ios-flex-between">
              <span className="ios-caption" style={{ margin: 0 }}>Safe Routes:</span>
              <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-orange)', fontWeight: '600' }}>{fusedData?.routes?.safe?.length || 0}</span>
            </div>
            <div className="ios-flex-between">
              <span className="ios-caption" style={{ margin: 0 }}>Response Time:</span>
              <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-blue)', fontWeight: '600' }}>5min</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
