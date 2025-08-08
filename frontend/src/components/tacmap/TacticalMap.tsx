import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Settings } from 'lucide-react';
import { 
  TacMapConfig, 
  ZoomConfiguration, 

  ZoomController,
  PanController,
  TooltipManager,
  HoverEffectManager,
  PerformanceOptimizer,
  TooltipData,
  ContextMenu,
  MenuItem
} from '@/types/tacmap';
import { ZoomControls } from './ZoomControls';
import { MapTooltip } from './MapTooltip';
import { ContextMenuComponent } from './ContextMenu';
import { MapLayers } from './MapLayers';
import { MapSettings } from './MapSettings';
import '@/styles/tacmap.css';

// Mapbox access token - should be in environment variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWFuZnJlbGluZ2VyIiwiYSI6ImNsdGZ0Z2Z0ZDAwMDBqMmpxZ2Z0ZDAwMDAifQ.example';

interface TacticalMapProps {
  center?: [number, number];
  zoom?: number;
  showHazards?: boolean;
  showRoutes?: boolean;
  showResources?: boolean;
  showBoundaries?: boolean;
  onMapLoad?: () => void;
  onFeatureClick?: (feature: any) => void;
  onFeatureHover?: (feature: any) => void;
  className?: string;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  center = [-122.4194, 37.7749], // San Francisco
  zoom = 12,
  showHazards = true,
  showRoutes = true,
  showResources = true,
  showBoundaries = true,
  onMapLoad,
  onFeatureClick,
  onFeatureHover,
  className = "h-full w-full"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [, setMapCenter] = useState(center);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'terrain' | 'street'>('street');

  // Controllers
  const zoomControllerRef = useRef<ZoomController | null>(null);
  const panControllerRef = useRef<PanController | null>(null);
  const tooltipManagerRef = useRef<TooltipManager | null>(null);
  const hoverManagerRef = useRef<HoverEffectManager | null>(null);
  const performanceOptimizerRef = useRef<PerformanceOptimizer | null>(null);

  // Map configuration
  const mapConfig: TacMapConfig = {
    style: {
      version: 8,
      sources: {
        terrain: {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb',
          tileSize: 512,
          maxzoom: 14
        },
        satellite: {
          type: 'raster',
          url: 'mapbox://mapbox.satellite',
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#0A0E27',
            'background-opacity': 0.95
          }
        },
        {
          id: 'terrain-3d',
          type: 'hillshade',
          source: 'terrain',
          paint: {
            'hillshade-exaggeration': 0.5,
            'hillshade-shadow-color': '#000000',
            'hillshade-highlight-color': '#00FFFF',
            'hillshade-accent-color': '#00CED1'
          }
        }
      ],
      fog: {
        color: ['interpolate', ['linear'], ['zoom'],
          10, 'rgba(0, 206, 209, 0.3)',
          15, 'rgba(0, 255, 255, 0.1)'
        ],
        'horizon-blend': 0.1,
        'high-color': '#001122',
        'space-color': '#000011',
        'star-intensity': 0.15
      }
    },
    renderConfig: {
      antialias: true,
      preserveDrawingBuffer: true,
      failIfMajorPerformanceCaveat: false
    }
  };

  // Zoom configuration
  const zoomConfig: ZoomConfiguration = {
    minZoom: 3,
    maxZoom: 20,
    defaultZoom: 12,
    zoomDuration: 300,
    lodBreakpoints: {
      overview: { min: 3, max: 8 },
      regional: { min: 8, max: 12 },
      tactical: { min: 12, max: 16 },
      detail: { min: 16, max: 20 }
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Create map instance
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: getMapStyle(mapStyle),
        center: center,
        zoom: zoom,
        minZoom: zoomConfig.minZoom,
        maxZoom: zoomConfig.maxZoom,
        antialias: mapConfig.renderConfig.antialias,
        preserveDrawingBuffer: mapConfig.renderConfig.preserveDrawingBuffer,
        failIfMajorPerformanceCaveat: mapConfig.renderConfig.failIfMajorPerformanceCaveat,
        attributionControl: false,
        logoPosition: 'bottom-left'
      });

      mapRef.current = map;

      // Initialize controllers
      zoomControllerRef.current = new ZoomController(map);
      panControllerRef.current = new PanController(map);
      tooltipManagerRef.current = new TooltipManager();
      hoverManagerRef.current = new HoverEffectManager(map);
      performanceOptimizerRef.current = new PerformanceOptimizer();

      // Set up event listeners
      map.on('load', () => {
        setIsLoading(false);
        onMapLoad?.();
        
        // Initialize tooltip manager
        if (tooltipManagerRef.current && mapContainer.current) {
          tooltipManagerRef.current.init(mapContainer.current);
        }
        
        // Initialize hover effects
        if (hoverManagerRef.current) {
          hoverManagerRef.current.initHoverEffects();
        }
        
        // Add custom layers
        addCustomLayers(map);
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map');
      });

      map.on('zoom', () => {
        setCurrentZoom(map.getZoom());
      });

      map.on('move', () => {
        setMapCenter([map.getCenter().lng, map.getCenter().lat]);
      });

      // Mouse events
      map.on('click', handleMapClick);
      map.on('contextmenu', handleContextMenu);
      map.on('mouseenter', handleMouseEnter);
      map.on('mouseleave', handleMouseLeave);

      // Touch events
      map.on('touchstart', handleTouchStart);
      map.on('touchmove', handleTouchMove);
      map.on('touchend', handleTouchEnd);

      // Keyboard events
      document.addEventListener('keydown', handleKeyboard);

    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError('Failed to initialize map');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, []);

  // Get map style based on selection
  const getMapStyle = (style: string): string => {
    switch (style) {
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-v9';
      case 'terrain':
        return 'mapbox://styles/mapbox/outdoors-v12';
      case 'street':
      default:
        return 'mapbox://styles/mapbox/dark-v11';
    }
  };



  // Add custom layers
  const addCustomLayers = (map: mapboxgl.Map) => {
    // Hexagon grid layer
    const bounds = map.getBounds();
    if (bounds) {
      map.addSource('hexagon-grid', {
        type: 'geojson',
        data: generateHexagonGrid(bounds)
      });
    }

    map.addLayer({
      id: 'hexagon-layer',
      type: 'fill',
      source: 'hexagon-grid',
      paint: {
        'fill-color': '#00CED1',
        'fill-opacity': 0.6,
        'fill-outline-color': '#00FFFF'
      }
    });

    // Emergency units layer
    if (showResources) {
      map.addSource('emergency-units', {
        type: 'geojson',
        data: generateEmergencyUnits()
      });

      map.addLayer({
        id: 'unit-markers',
        type: 'circle',
        source: 'emergency-units',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'case',
            ['==', ['get', 'type'], 'fire'], '#FF4444',
            ['==', ['get', 'type'], 'police'], '#4444FF',
            ['==', ['get', 'type'], 'medical'], '#44FF44',
            '#00FFFF'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });
    }

    // Hazard zones layer
    if (showHazards) {
      map.addSource('hazard-zones', {
        type: 'geojson',
        data: generateHazardZones()
      });

      map.addLayer({
        id: 'hazard-layer',
        type: 'fill',
        source: 'hazard-zones',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'severity'], 'critical'], '#FF4444',
            ['==', ['get', 'severity'], 'high'], '#FFA500',
            ['==', ['get', 'severity'], 'medium'], '#FFAA00',
            '#00FF88'
          ],
          'fill-opacity': 0.3,
          'fill-outline-color': '#FF4444'
        }
      });
    }

    // Evacuation routes layer
    if (showRoutes) {
      map.addSource('evacuation-routes', {
        type: 'geojson',
        data: generateEvacuationRoutes()
      });

      map.addLayer({
        id: 'route-lines',
        type: 'line',
        source: 'evacuation-routes',
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'status'], 'open'], '#00FF88',
            ['==', ['get', 'status'], 'congested'], '#FFA500',
            '#FF4444'
          ],
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      map.addLayer({
        id: 'route-points',
        type: 'circle',
        source: 'evacuation-routes',
        paint: {
          'circle-radius': 6,
          'circle-color': '#00FFFF',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });
    }
  };

  // Generate sample data
  const generateHexagonGrid = (bounds: mapboxgl.LngLatBounds) => {
    // Simplified hexagon grid generation
    const features = [];
    const step = 0.01; // Simplified for demo
    
    for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += step) {
      for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += step) {
        features.push({
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[
              [lng, lat],
              [lng + step, lat],
              [lng + step, lat + step],
              [lng, lat + step],
              [lng, lat]
            ]]
          },
          properties: {
            h3Index: `${lng}_${lat}`,
            type: 'hexagon'
          }
        });
      }
    }
    
    return {
      type: 'FeatureCollection' as const,
      features
    };
  };

  const generateEmergencyUnits = () => {
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [-122.4194, 37.7749]
          },
          properties: {
            id: 'fire-unit-1',
            type: 'fire-unit',
            name: 'Engine 1',
            status: 'responding',
            personnel: 4,
            fuel: 85,
            equipment: ['Hose', 'Ladder', 'Pump'],
            assignedIncident: 'fire-001'
          }
        },
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [-122.4000, 37.7800]
          },
          properties: {
            id: 'police-unit-1',
            type: 'police',
            name: 'Patrol Car 1',
            status: 'available',
            personnel: 2,
            fuel: 92,
            equipment: ['Radio', 'Body Camera'],
            assignedIncident: null
          }
        },
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [-122.4100, 37.7700]
          },
          properties: {
            id: 'medical-unit-1',
            type: 'medical',
            name: 'Ambulance 1',
            status: 'on-scene',
            personnel: 3,
            fuel: 78,
            equipment: ['Defibrillator', 'Oxygen', 'Stretcher'],
            assignedIncident: 'medical-001'
          }
        },
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [-122.4300, 37.7850]
          },
          properties: {
            id: 'rescue-unit-1',
            type: 'rescue',
            name: 'Rescue Squad 1',
            status: 'returning',
            personnel: 6,
            fuel: 45,
            equipment: ['Jaws of Life', 'Rope', 'Harness'],
            assignedIncident: 'rescue-001'
          }
        }
      ]
    };
  };

  const generateHazardZones = () => {
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[
              [-122.4200, 37.7700],
              [-122.4100, 37.7700],
              [-122.4100, 37.7800],
              [-122.4200, 37.7800],
              [-122.4200, 37.7700]
            ]]
          },
          properties: {
            id: 'fire-001',
            type: 'fire-hazard',
            name: 'Downtown Fire',
            severity: 'critical',
            spreadRate: 25,
            timeToImpact: '15 minutes',
            affectedArea: 0.5,
            description: 'Multi-story building fire spreading rapidly'
          }
        },
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[
              [-122.4300, 37.7750],
              [-122.4200, 37.7750],
              [-122.4200, 37.7850],
              [-122.4300, 37.7850],
              [-122.4300, 37.7750]
            ]]
          },
          properties: {
            id: 'flood-001',
            type: 'flood',
            name: 'River Overflow',
            severity: 'high',
            spreadRate: 5,
            timeToImpact: '2 hours',
            affectedArea: 1.2,
            description: 'River levels rising due to heavy rainfall'
          }
        },
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[
              [-122.4100, 37.7650],
              [-122.4000, 37.7650],
              [-122.4000, 37.7750],
              [-122.4100, 37.7750],
              [-122.4100, 37.7650]
            ]]
          },
          properties: {
            id: 'chemical-001',
            type: 'chemical',
            name: 'Chemical Spill',
            severity: 'medium',
            spreadRate: 2,
            timeToImpact: '30 minutes',
            affectedArea: 0.3,
            description: 'Industrial chemical leak in warehouse district'
          }
        }
      ]
    };
  };

  const generateEvacuationRoutes = () => {
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [-122.4200, 37.7750],
              [-122.4100, 37.7800],
              [-122.4050, 37.7825],
              [-122.4000, 37.7850]
            ]
          },
          properties: {
            id: 'route-001',
            name: 'Primary Evacuation Route',
            status: 'open',
            capacity: 1000,
            currentUsage: 250,
            estimatedTime: 15,
            description: 'Main evacuation route to safe zone'
          }
        },
        {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [-122.4150, 37.7700],
              [-122.4050, 37.7725],
              [-122.3950, 37.7750]
            ]
          },
          properties: {
            id: 'route-002',
            name: 'Secondary Route',
            status: 'congested',
            capacity: 500,
            currentUsage: 450,
            estimatedTime: 25,
            description: 'Alternative route experiencing heavy traffic'
          }
        }
      ]
    };
  };

  // Event handlers
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    const features = mapRef.current?.queryRenderedFeatures(e.point);
    if (features && features.length > 0) {
      onFeatureClick?.(features[0]);
    }
  }, [onFeatureClick]);

  const handleContextMenu = useCallback((e: mapboxgl.MapMouseEvent) => {
    e.preventDefault();
    
    const features = mapRef.current?.queryRenderedFeatures(e.point);
    if (features && features.length > 0) {
      const feature = features[0];
      const menuItems = getContextMenuItems(feature);
      
      setContextMenu({
        items: menuItems,
        position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
        target: feature
      });
    }
  }, []);

  const handleMouseEnter = useCallback((e: mapboxgl.MapMouseEvent) => {
    const features = mapRef.current?.queryRenderedFeatures(e.point);
    if (features && features.length > 0) {
      const feature = features[0];
      onFeatureHover?.(feature);
      
      // Determine tooltip type based on layer and properties
      let tooltipType: 'unit' | 'hazard' | 'evacuation' | 'hexagon' = 'hexagon';
      let title = feature.properties?.name || feature.properties?.id || 'Unknown Feature';
      
      if (feature.layer?.id === 'unit-markers') {
        tooltipType = 'unit';
        title = feature.properties?.name || `Unit ${feature.properties?.id}`;
      } else if (feature.layer?.id === 'hazard-layer') {
        tooltipType = 'hazard';
        title = feature.properties?.name || `Hazard ${feature.properties?.id}`;
      } else if (feature.layer?.id === 'route-lines' || feature.layer?.id === 'route-points') {
        tooltipType = 'evacuation';
        title = feature.properties?.name || `Route ${feature.properties?.id}`;
      }
      
      // Show tooltip
      const tooltipData: TooltipData = {
        id: feature.properties?.id || 'unknown',
        type: tooltipType,
        title: title,
        content: feature.properties || {},
        priority: 1,
        position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY }
      };
      
      setActiveTooltip(tooltipData);
    }
  }, [onFeatureHover]);

  const handleMouseLeave = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  const handleTouchStart = useCallback((e: mapboxgl.MapTouchEvent) => {
    if (panControllerRef.current) {
      panControllerRef.current.handleTouchPan(e.originalEvent);
    }
  }, []);

  const handleTouchMove = useCallback((e: mapboxgl.MapTouchEvent) => {
    if (panControllerRef.current) {
      panControllerRef.current.handleTouchPan(e.originalEvent);
    }
  }, []);

  const handleTouchEnd = useCallback((e: mapboxgl.MapTouchEvent) => {
    if (panControllerRef.current) {
      panControllerRef.current.handleTouchPan(e.originalEvent);
    }
  }, []);

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if (zoomControllerRef.current) {
      zoomControllerRef.current.handleKeyboard(e);
    }
    
    if (panControllerRef.current) {
      switch (e.key) {
        case 'ArrowUp':
          panControllerRef.current.handleKeyboardPan('up');
          break;
        case 'ArrowDown':
          panControllerRef.current.handleKeyboardPan('down');
          break;
        case 'ArrowLeft':
          panControllerRef.current.handleKeyboardPan('left');
          break;
        case 'ArrowRight':
          panControllerRef.current.handleKeyboardPan('right');
          break;
      }
    }
  }, []);

  const getContextMenuItems = (feature: any): MenuItem[] => {
    const type = feature.properties?.type;
    const layer = feature.layer?.id;
    
    // Handle emergency units
    if (layer === 'unit-markers') {
      switch (type) {
        case 'fire-unit':
        case 'police':
        case 'medical':
        case 'rescue':
          return [
            { label: 'View Details', action: 'view-details', icon: 'info' },
            { label: 'Track Unit', action: 'track', icon: 'crosshair' },
            { label: 'Send Message', action: 'message', icon: 'message' },
            { divider: true },
            { label: 'Request Backup', action: 'backup', icon: 'alert' }
          ];
        default:
          return [
            { label: 'View Details', action: 'view-details', icon: 'info' },
            { label: 'Track Unit', action: 'track', icon: 'crosshair' }
          ];
      }
    }
    
    // Handle hazard zones
    if (layer === 'hazard-layer') {
      switch (type) {
        case 'fire-hazard':
        case 'flood':
        case 'chemical':
        case 'earthquake':
          return [
            { label: 'Analyze Spread', action: 'analyze', icon: 'chart' },
            { label: 'Set Perimeter', action: 'perimeter', icon: 'shield' },
            { label: 'Evacuation Zone', action: 'evacuate', icon: 'exit' },
            { divider: true },
            { label: 'Alert All Units', action: 'alert-all', icon: 'broadcast' }
          ];
        default:
          return [
            { label: 'Analyze Hazard', action: 'analyze', icon: 'chart' },
            { label: 'Set Perimeter', action: 'perimeter', icon: 'shield' }
          ];
      }
    }
    
    // Handle evacuation routes
    if (layer === 'route-lines' || layer === 'route-points') {
      return [
        { label: 'View Route Details', action: 'view-details', icon: 'info' },
        { label: 'Modify Route', action: 'modify', icon: 'edit' },
        { label: 'Close Route', action: 'close', icon: 'x' }
      ];
    }
    
    // Default context menu
    return [
      { label: 'Measure Distance', action: 'measure', icon: 'ruler' },
      { label: 'Add Marker', action: 'marker', icon: 'pin' },
      { label: 'Get Coordinates', action: 'coords', icon: 'location' }
    ];
  };

  const handleContextMenuAction = (action: string) => {
    console.log('Context menu action:', action);
    setContextMenu(null);
  };

  const handleMapStyleChange = (newStyle: 'satellite' | 'terrain' | 'street') => {
    setMapStyle(newStyle);
    if (mapRef.current) {
      mapRef.current.setStyle(getMapStyle(newStyle));
    }
  };

  return (
    <div className={`tacmap-container ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full relative"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-30"
          >
            <div className="tacmap-loading">
              <div className="tacmap-spinner"></div>
              <p className="text-sm">Initializing Tactical Map...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-30"
          >
            <div className="tacmap-panel p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                className="tacmap-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls */}
      <div className="map-overlay">
        {/* Zoom Controls */}
        <ZoomControls 
          currentZoom={currentZoom}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />

        {/* Layer Controls */}
        <div className="absolute top-4 left-4 z-1000">
          <button
            className="tacmap-button"
            onClick={() => setShowLayers(!showLayers)}
          >
            <Layers size={16} />
          </button>
        </div>

        {/* Settings Controls */}
        <div className="absolute top-4 left-16 z-1000">
          <button
            className="tacmap-button"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} />
          </button>
        </div>



        {/* Layers Panel */}
        <AnimatePresence>
          {showLayers && (
            <MapLayers 
              showHazards={showHazards}
              showRoutes={showRoutes}
              showResources={showResources}
              showBoundaries={showBoundaries}
              onClose={() => setShowLayers(false)}
            />
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <MapSettings 
              mapStyle={mapStyle}
              onStyleChange={handleMapStyleChange}
              onClose={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {activeTooltip && (
          <MapTooltip 
            data={activeTooltip}
            onClose={() => setActiveTooltip(null)}
          />
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenuComponent 
            menu={contextMenu}
            onAction={handleContextMenuAction}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
