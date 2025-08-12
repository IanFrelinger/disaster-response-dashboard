import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WeatherData } from '../../types/emergency-response';

// Define enhanced hazard data structure for EMS operations
interface HazardFeature {
  type: 'Feature';
  properties: {
    hazard_type: string;
    severity: string;
    id: string;
    name?: string;
    description?: string;
    location?: string;
    tooltip?: string;
    evacuation_required?: boolean;
    affected_area?: string;
    timestamp?: string;
    magnitude?: string;
    // EMS-specific properties
    ems_impact?: 'low' | 'moderate' | 'high' | 'critical';
    access_restricted?: boolean;
    staging_area?: [number, number];
    // Flood-specific properties
    water_depth?: string;
    projected_depth?: string;
    projected_time?: string;
  };
  geometry: {
    type: 'Polygon' | 'Point';
    coordinates: number[][][] | number[];
  };
}

interface HazardData {
  type: 'FeatureCollection';
  features: HazardFeature[];
}

interface SimpleMapboxTestProps {
  showHazards?: boolean;
  showUnits?: boolean;
  showRoutes?: boolean;
  showBuildings?: boolean;
  showTerrain?: boolean;
  showAnalytics?: boolean;
  showWeather?: boolean;
  weatherData?: WeatherData;
}

// Enhanced hazard data for San Francisco area with EMS focus
const hazardData: HazardData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        hazard_type: 'wildfire',
        severity: 'high',
        id: 'hazard_001',
        name: 'Golden Gate Park Wildfire',
        description: 'Wildfire spreading from Golden Gate Park area',
        location: 'Golden Gate Park, San Francisco',
        tooltip: '🔥 High Risk Wildfire • Golden Gate Park • Immediate Action Required',
        evacuation_required: true,
        affected_area: '2.5 sq km',
        timestamp: '2024-08-11T21:43:00Z',
        ems_impact: 'high',
        access_restricted: true,
        staging_area: [-122.480, 37.770]
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.485, 37.765],
          [-122.475, 37.765],
          [-122.475, 37.775],
          [-122.485, 37.775],
          [-122.485, 37.765]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        hazard_type: 'flood',
        severity: 'high',
        id: 'hazard_002',
        name: 'Fisherman\'s Wharf Coastal Flooding',
        description: 'Coastal flooding with rising tide and storm surge',
        location: 'Fisherman\'s Wharf, San Francisco',
        tooltip: '🌊 HIGH RISK FLOOD • Fisherman\'s Wharf • Rising Water • EMS Access Limited',
        evacuation_required: true,
        affected_area: '2.1 sq km',
        timestamp: '2024-08-11T21:43:00Z',
        ems_impact: 'critical',
        access_restricted: true,
        water_depth: '3.2 ft',
        projected_depth: '5.8 ft',
        projected_time: '2 hours',
        staging_area: [-122.410, 37.810]
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.415, 37.805],
          [-122.405, 37.805],
          [-122.405, 37.815],
          [-122.415, 37.815],
          [-122.415, 37.805]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        hazard_type: 'flood',
        severity: 'medium',
        id: 'hazard_004',
        name: 'Mission Bay Inland Flooding',
        description: 'Inland flooding from heavy rainfall and drainage overflow',
        location: 'Mission Bay, San Francisco',
        tooltip: '🌊 Medium Risk Flood • Mission Bay • Drainage Overflow • Monitor Water Levels',
        evacuation_required: false,
        affected_area: '1.5 sq km',
        timestamp: '2024-08-11T21:43:00Z',
        ems_impact: 'moderate',
        access_restricted: false,
        water_depth: '1.8 ft',
        projected_depth: '2.5 ft',
        projected_time: '4 hours',
        staging_area: [-122.390, 37.770]
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.395, 37.765],
          [-122.385, 37.765],
          [-122.385, 37.775],
          [-122.395, 37.775],
          [-122.395, 37.765]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        hazard_type: 'earthquake',
        severity: 'high',
        id: 'hazard_003',
        name: 'Mission Bay Earthquake',
        description: 'Recent earthquake activity near Mission Bay',
        location: 'Mission Bay, San Francisco',
        tooltip: '🌋 High Risk Earthquake • Mission Bay • Magnitude 5.2 • Immediate Action Required',
        evacuation_required: true,
        magnitude: '5.2',
        timestamp: '2024-08-11T21:43:00Z'
      },
      geometry: {
        type: 'Point',
        coordinates: [-122.395, 37.770]
      }
    },
    {
      type: 'Feature',
      properties: {
        hazard_type: 'landslide',
        severity: 'medium',
        id: 'hazard_004',
        name: 'Twin Peaks Landslide',
        description: 'Landslide risk in Twin Peaks area',
        location: 'Twin Peaks, San Francisco',
        tooltip: '🏔️ Medium Risk Landslide • Twin Peaks • Monitor Conditions',
        evacuation_required: true,
        affected_area: '0.8 sq km',
        timestamp: '2024-08-11T21:43:00Z'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.445, 37.750],
          [-122.435, 37.750],
          [-122.435, 37.760],
          [-122.445, 37.760],
          [-122.445, 37.750]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        hazard_type: 'tsunami',
        severity: 'low',
        id: 'hazard_005',
        name: 'Coastal Tsunami Warning',
        description: 'Tsunami warning for coastal areas',
        location: 'San Francisco Coast',
        tooltip: '🌊 Low Risk Tsunami • Coastal Areas • Monitor Conditions',
        evacuation_required: true,
        affected_area: '5.2 sq km',
        timestamp: '2024-08-11T21:43:00Z'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.520, 37.800],
          [-122.480, 37.800],
          [-122.480, 37.820],
          [-122.520, 37.820],
          [-122.520, 37.800]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        hazard_type: 'chemical_spill',
        severity: 'high',
        id: 'hazard_006',
        name: 'South SF Chemical Spill',
        description: 'Chemical spill in South San Francisco industrial area',
        location: 'South San Francisco',
        tooltip: '☣️ High Risk Chemical Spill • South SF Industrial • Immediate Action Required',
        evacuation_required: true,
        affected_area: '1.2 sq km',
        timestamp: '2024-08-11T21:43:00Z'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.380, 37.650],
          [-122.370, 37.650],
          [-122.370, 37.660],
          [-122.380, 37.660],
          [-122.380, 37.650]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        hazard_type: 'power_outage',
        severity: 'medium',
        id: 'hazard_007',
        name: 'Downtown Power Outage',
        description: 'Major power outage affecting downtown area',
        location: 'Downtown San Francisco',
        tooltip: '⚡ Medium Risk Power Outage • Downtown Area • Monitor Conditions',
        evacuation_required: false,
        affected_area: '3.1 sq km',
        timestamp: '2024-08-11T21:43:00Z'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.405, 37.785],
          [-122.395, 37.785],
          [-122.395, 37.795],
          [-122.405, 37.795],
          [-122.405, 37.785]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        hazard_type: 'gas_leak',
        severity: 'high',
        id: 'hazard_008',
        name: 'North Beach Gas Leak',
        description: 'Natural gas leak in North Beach neighborhood',
        location: 'North Beach, San Francisco',
        tooltip: '💨 High Risk Gas Leak • North Beach • Immediate Action Required',
        evacuation_required: true,
        affected_area: '0.6 sq km',
        timestamp: '2024-08-11T21:43:00Z'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.410, 37.800],
          [-122.400, 37.800],
          [-122.400, 37.810],
          [-122.410, 37.810],
          [-122.410, 37.800]
        ]]
      }
    }
  ]
};

export const SimpleMapboxTest: React.FC<SimpleMapboxTestProps> = ({
  showHazards: initialShowHazards = true,
  showUnits: initialShowUnits = true,
  showRoutes: initialShowRoutes = true,
  showBuildings: initialShowBuildings = true,
  showTerrain: initialShowTerrain = true,
  showAnalytics: initialShowAnalytics = true,
  showWeather: initialShowWeather = true,
  weatherData
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [buildingsAdded, setBuildingsAdded] = useState(false);
  const [terrainAdded, setTerrainAdded] = useState(false);
  const [escapeRouteAdded, setEscapeRouteAdded] = useState(false);
  const [hazardsAdded, setHazardsAdded] = useState(false);
  const [unitsAdded, setUnitsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({
    visible: false,
    content: '',
    x: 0,
    y: 0
  });
  
  // Add state for control toggles
  const [showHazards, setShowHazards] = useState(initialShowHazards);
  const [showUnits, setShowUnits] = useState(initialShowUnits);
  const [showRoutes, setShowRoutes] = useState(initialShowRoutes);
  const [showAnalytics, setShowAnalytics] = useState(initialShowAnalytics);
  const [showWeather, setShowWeather] = useState(initialShowWeather);
  const [showEvacuationZones, setShowEvacuationZones] = useState(true);
  
  // 3D Terrain and 3D Buildings are always enabled
  const showBuildings = true;
  const showTerrain = true;

  // Get Mapbox access token from environment or use fallback
  const getMapboxToken = () => {
    // Try to get from environment variable first
    const envToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (envToken && envToken !== 'your-mapbox-access-token-here') {
      return envToken;
    }
    
    // Fallback to valid token
    return 'pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw';
  };

  useEffect(() => {
    console.log('=== SIMPLEMAPBOXTEST DEBUG START ===');
    
    if (!containerRef.current) {
      console.error('SimpleMapboxTest: Container ref is null');
      setError('Container ref is null');
      return;
    }

    console.log('SimpleMapboxTest: Container ref found:', containerRef.current);
    console.log('SimpleMapboxTest: Container dimensions:', containerRef.current.offsetWidth, 'x', containerRef.current.offsetHeight);
    console.log('SimpleMapboxTest: Container style:', window.getComputedStyle(containerRef.current));

    // Check if Mapbox is actually available
    console.log('SimpleMapboxTest: Checking Mapbox availability...');
    console.log('mapboxgl object:', mapboxgl);
    console.log('mapboxgl type:', typeof mapboxgl);
    console.log('mapboxgl keys:', Object.keys(mapboxgl || {}));
    console.log('mapboxgl.Map:', mapboxgl?.Map);
    console.log('mapboxgl.accessToken:', mapboxgl?.accessToken);

    if (!mapboxgl) {
      const error = 'Mapbox library not available - mapboxgl is undefined';
      console.error('SimpleMapboxTest:', error);
      setError(error);
      return;
    }

    if (!mapboxgl.Map) {
      const error = 'Mapbox library not available - mapboxgl.Map is undefined';
      console.error('SimpleMapboxTest:', error);
      setError(error);
      return;
    }

    const accessToken = getMapboxToken();
    console.log('SimpleMapboxTest: Got access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'Not set');
    
    // Check if we have a valid token
    if (!accessToken || accessToken === 'your-mapbox-access-token-here') {
      const error = 'Mapbox access token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN in your environment variables.';
      console.error('SimpleMapboxTest:', error);
      setError(error);
      return;
    }

    try {
      console.log('SimpleMapboxTest: Setting access token...');
      mapboxgl.accessToken = accessToken;
      console.log('SimpleMapboxTest: Access token set successfully');

      console.log('SimpleMapboxTest: Creating new Mapbox map...');
      console.log('Container element:', containerRef.current);
      console.log('Container dimensions:', containerRef.current?.offsetWidth, 'x', containerRef.current?.offsetHeight);

      // Create a minimal map first to test basic functionality
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Use basic style first
        center: [-122.4194, 37.7749], // San Francisco
        zoom: 10, // Lower zoom for testing
        pitch: 0, // No pitch for testing
        bearing: 0
      });

      console.log('SimpleMapboxTest: Map instance created successfully:', map);
      console.log('SimpleMapboxTest: Map object type:', typeof map);
      console.log('SimpleMapboxTest: Map object keys:', Object.keys(map || {}));
      
      mapRef.current = map;

      // Add comprehensive error handling for map loading
      map.on('error', (e) => {
        console.error('SimpleMapboxTest: Map error event:', e);
        console.error('SimpleMapboxTest: Map error details:', e.error);
        setError(`Map error event: ${e.error?.message || 'Unknown error'}`);
      });

      map.on('load', () => {
        console.log('SimpleMapboxTest: Map loaded successfully!');
        console.log('SimpleMapboxTest: Map load event fired');
        setMapLoaded(true);
        setError(null); // Clear any previous errors on successful load
        
        // Test basic map functionality
        console.log('SimpleMapboxTest: Testing map functionality...');
        console.log('Map center:', map.getCenter());
        console.log('Map zoom:', map.getZoom());
        
        // Add a simple marker to test if the map is working
        try {
          const marker = new mapboxgl.Marker()
            .setLngLat([-122.4194, 37.7749])
            .addTo(map);
          console.log('SimpleMapboxTest: Basic marker added successfully:', marker);
        } catch (markerError) {
          console.error('SimpleMapboxTest: Error adding marker:', markerError);
        }
      });

      // Add a simple error handler for the map
      map.on('error', (e) => {
        console.error('SimpleMapboxTest: Map error event (duplicate):', e);
        setError(`Map error event: ${e.error?.message || 'Unknown error'}`);
      });

      // Add a simple render handler to see if the map is actually rendering
      map.on('render', () => {
        console.log('SimpleMapboxTest: Map render event fired');
      });

      // Add a simple idle handler to see if the map finishes loading
      map.on('idle', () => {
        console.log('SimpleMapboxTest: Map idle event fired - map is ready');
        
        // Now that the map is fully loaded, add all the features
        console.log('SimpleMapboxTest: Adding map features...');
        
        try {
          // Add 3D terrain first
          add3DTerrain(map);
          
          // Add 3D buildings
          add3DBuildings(map);
          
          // Add hazards
          addHazards(map);
          
          // Add escape routes
          addEscapeRoute(map);
          
          // Add evacuation zones
          addEvacuationZones(map);
          
          console.log('SimpleMapboxTest: All map features added successfully');
        } catch (featureError) {
          console.error('SimpleMapboxTest: Error adding map features:', featureError);
        }
      });

      // Add a simple style load handler
      map.on('style.load', () => {
        console.log('SimpleMapboxTest: Map style loaded');
      });

      // Add a simple data load handler
      map.on('data', (e) => {
        console.log('SimpleMapboxTest: Map data event:', e.type);
      });

      console.log('SimpleMapboxTest: All event listeners added successfully');

    } catch (error) {
      console.error('SimpleMapboxTest: Error creating map:', error);
      console.error('SimpleMapboxTest: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setError(`Failed to create map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('=== SIMPLEMAPBOXTEST DEBUG END ===');

    return () => {
      console.log('SimpleMapboxTest: Cleanup - removing map');
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Control layer visibility based on props
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Control hazards layers
    const hazardLayers = ['hazards-fill', 'hazards-outline', 'hazard-markers', 'hazard-labels', 'hazard-icons', 'hazard-point-icons'];
    hazardLayers.forEach(layerId => {
      if (mapRef.current!.getLayer(layerId)) {
        mapRef.current!.setLayoutProperty(layerId, 'visibility', showHazards ? 'visible' : 'none');
      }
    });

    // Control escape route layers
    const routeLayers = ['escape-route-primary', 'escape-route-secondary', 'escape-route-markers', 'route-start-icons', 'route-end-icons'];
    routeLayers.forEach(layerId => {
      if (mapRef.current!.getLayer(layerId)) {
        mapRef.current!.setLayoutProperty(layerId, 'visibility', showRoutes ? 'visible' : 'none');
      }
    });

    // Control buildings layer
    if (mapRef.current.getLayer('3d-buildings')) {
      mapRef.current.setLayoutProperty('3d-buildings', 'visibility', showBuildings ? 'visible' : 'none');
    }

    // Control terrain - this affects the overall 3D terrain
    if (showTerrain) {
      // Terrain is controlled by map.setTerrain() which is already set
      console.log('3D terrain enabled');
    } else {
      // Disable terrain by setting it to null
      mapRef.current.setTerrain(null);
    }

    // Control analytics panel
    if (showAnalytics) {
      console.log('Analytics panel enabled');
    }

    // Control weather overlay
    if (showWeather && weatherData) {
      console.log('Weather overlay enabled');
      addWeatherOverlay(mapRef.current);
    } else if (!showWeather) {
      console.log('Weather overlay disabled');
      removeWeatherOverlay(mapRef.current);
    }

  }, [showHazards, showUnits, showRoutes, showBuildings, showTerrain, showAnalytics, showWeather, weatherData, mapLoaded]);

  const add3DTerrain = (map: mapboxgl.Map) => {
    try {
      console.log('Adding 3D terrain...');
      
      // Add terrain source
      map.addSource('mapbox-terrain', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      // Add terrain layer
      map.setTerrain({
        'source': 'mapbox-terrain',
        'exaggeration': 1.5 // Exaggerate terrain height for better visibility
      });

      console.log('3D terrain added successfully');
      setTerrainAdded(true);

    } catch (error) {
      console.error('Error adding 3D terrain:', error);
      
      // Fallback: try with different terrain source
      try {
        console.log('Trying fallback terrain approach...');
        map.addSource('terrain-source', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.terrain-rgb',
          'tileSize': 256,
          'maxzoom': 15
        });

        map.setTerrain({
          'source': 'terrain-source',
          'exaggeration': 1.0
        });
        
        console.log('Fallback terrain added');
        setTerrainAdded(true);
      } catch (fallbackError) {
        console.error('Fallback terrain also failed:', fallbackError);
      }
    }
  };

  const addHazards = (map: mapboxgl.Map) => {
    try {
      console.log('Adding hazards...');
      
      // Add hazards source
      map.addSource('hazards', {
        'type': 'geojson',
        'data': hazardData as any
      });

      // Add hazards fill layer (polygon areas only)
      map.addLayer({
        'id': 'hazards-fill',
        'type': 'fill',
        'source': 'hazards',
        'filter': ['==', ['geometry-type'], 'Polygon'],
        'paint': {
          'fill-color': [
            'case',
            ['==', ['get', 'severity'], 'high'], '#FF3B30', // iOS red for high severity
            ['==', ['get', 'severity'], 'medium'], '#FF9500', // iOS orange for medium severity
            ['==', ['get', 'severity'], 'low'], '#FFCC00', // iOS yellow for low severity
            '#FF3B30' // Default to red
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'severity'], 'high'], 0.4, // More opaque for high severity
            ['==', ['get', 'severity'], 'medium'], 0.3, // Medium opacity for medium severity
            ['==', ['get', 'severity'], 'low'], 0.2, // Less opaque for low severity
            0.3 // Default opacity
          ]
        }
      });

      // Add hazards outline layer (polygon areas only)
      map.addLayer({
        'id': 'hazards-outline',
        'type': 'line',
        'source': 'hazards',
        'filter': ['==', ['geometry-type'], 'Polygon'],
        'paint': {
          'line-color': [
            'case',
            ['==', ['get', 'severity'], 'high'], '#FF3B30', // iOS red for high severity
            ['==', ['get', 'severity'], 'medium'], '#FF9500', // iOS orange for medium severity
            ['==', ['get', 'severity'], 'low'], '#FFCC00', // iOS yellow for low severity
            '#FF3B30' // Default to red
          ],
          'line-width': [
            'case',
            ['==', ['get', 'severity'], 'high'], 3, // Thicker line for high severity
            ['==', ['get', 'severity'], 'medium'], 2, // Medium line for medium severity
            ['==', ['get', 'severity'], 'low'], 1, // Thinner line for low severity
            2 // Default line width
          ],
          'line-opacity': 0.8
        }
      });

      // Add hazard markers for all hazards (both polygon centers and point hazards)
      map.addLayer({
        'id': 'hazard-markers',
        'type': 'circle',
        'source': 'hazards',
        'paint': {
          'circle-radius': [
            'case',
            ['==', ['get', 'severity'], 'high'], 12, // Larger circle for high severity
            ['==', ['get', 'severity'], 'medium'], 8, // Medium circle for medium severity
            ['==', ['get', 'severity'], 'low'], 6, // Smaller circle for low severity
            8 // Default size
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'severity'], 'high'], '#FF3B30',
            ['==', ['get', 'severity'], 'medium'], '#FF9500',
            ['==', ['get', 'severity'], 'low'], '#FFCC00',
            '#FF3B30' // Default to red
          ],
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
          'circle-opacity': 0.9
        }
      });

      // Add hazard labels with safe font handling
      try {
        if (map.isStyleLoaded() && map.getStyle().glyphs) {
          map.addLayer({
            'id': 'hazard-labels',
            'type': 'symbol',
            'source': 'hazards',
            'layout': {
              'text-field': ['get', 'hazard_type'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 10,
              'text-offset': [0, -2],
              'text-anchor': 'top',
              'text-allow-overlap': false
            },
            'paint': {
              'text-color': '#F2F2F7',
              'text-halo-color': '#000000',
              'text-halo-width': 2
            }
          });
        } else {
          console.log('Map style not fully loaded or glyphs not available, skipping hazard labels');
        }
      } catch (error) {
        console.log('Could not add hazard text labels:', error);
      }

      // Add hazard icons for polygon centers
      map.addLayer({
        'id': 'hazard-icons',
        'type': 'symbol',
        'source': 'hazards',
        'filter': ['==', ['geometry-type'], 'Polygon'],
        'layout': {
          'icon-image': [
            'case',
            ['==', ['get', 'hazard_type'], 'wildfire'], 'fire-icon',
            ['==', ['get', 'hazard_type'], 'flood'], 'flood-icon',
            ['==', ['get', 'hazard_type'], 'earthquake'], 'earthquake-icon',
            ['==', ['get', 'hazard_type'], 'landslide'], 'landslide-icon',
            ['==', ['get', 'hazard_type'], 'tsunami'], 'tsunami-icon',
            ['==', ['get', 'hazard_type'], 'chemical_spill'], 'chemical-icon',
            ['==', ['get', 'hazard_type'], 'power_outage'], 'power-icon',
            ['==', ['get', 'hazard_type'], 'gas_leak'], 'gas-icon',
            'default-icon'
          ],
          'icon-size': [
            'case',
            ['==', ['get', 'severity'], 'high'], 1.2,
            ['==', ['get', 'severity'], 'medium'], 1.0,
            ['==', ['get', 'severity'], 'low'], 0.8,
            1.0
          ],
          'icon-allow-overlap': false,
          'icon-ignore-placement': false
        },
        'paint': {
          'icon-opacity': 0.9
        }
      });

      // Add hazard icons for point hazards
      map.addLayer({
        'id': 'hazard-point-icons',
        'type': 'symbol',
        'source': 'hazards',
        'filter': ['==', ['geometry-type'], 'Point'],
        'layout': {
          'icon-image': [
            'case',
            ['==', ['get', 'hazard_type'], 'wildfire'], 'fire-icon',
            ['==', ['get', 'hazard_type'], 'flood'], 'flood-icon',
            ['==', ['get', 'hazard_type'], 'earthquake'], 'earthquake-icon',
            ['==', ['get', 'hazard_type'], 'landslide'], 'landslide-icon',
            ['==', ['get', 'hazard_type'], 'tsunami'], 'tsunami-icon',
            ['==', ['get', 'hazard_type'], 'chemical_spill'], 'chemical-icon',
            ['==', ['get', 'hazard_type'], 'power_outage'], 'power-icon',
            ['==', ['get', 'hazard_type'], 'gas_leak'], 'gas-icon',
            'default-icon'
          ],
          'icon-size': [
            'case',
            ['==', ['get', 'severity'], 'high'], 1.2,
            ['==', ['get', 'severity'], 'medium'], 1.0,
            ['==', ['get', 'severity'], 'low'], 0.8,
            1.0
          ],
          'icon-allow-overlap': false,
          'icon-ignore-placement': false
        },
        'paint': {
          'icon-opacity': 0.9
        }
      });

      // Add hover effect for all hazard layers
      const hazardLayers = ['hazards-fill', 'hazards-outline', 'hazard-markers'];
      
      hazardLayers.forEach(layerId => {
        map.on('mouseenter', layerId, (e: mapboxgl.MapMouseEvent) => {
          map.getCanvas().style.cursor = 'pointer';
          
          // Highlight the hazard area
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const properties = feature.properties;
            
            if (properties) {
              // Show tooltip
              setTooltip({
                visible: true,
                content: `${properties.name || properties.hazard_type} - ${properties.severity.toUpperCase()} RISK\n${properties.description || 'No description available'}\nLocation: ${properties.location || 'Unknown'}`,
                x: e.point.x,
                y: e.point.y
              });
            }
          }
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
          setTooltip(prev => ({ ...prev, visible: false }));
        });
      });

      // Click interaction for hazard details
      map.on('click', 'hazard-markers', (e: mapboxgl.MapMouseEvent) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const properties = feature.properties;
          
          if (properties && feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates;
            if (coordinates && coordinates[0] && coordinates[0][0]) {
              // Calculate center point of polygon for popup placement
              const centerLng = coordinates[0].reduce((sum, coord) => sum + coord[0], 0) / coordinates[0].length;
              const centerLat = coordinates[0].reduce((sum, coord) => sum + coord[1], 0) / coordinates[0].length;
              
              // Create popup with hazard information
              new mapboxgl.Popup()
                .setLngLat([centerLng, centerLat])
                .setHTML(`
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; padding: 12px; min-width: 250px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                      <div style="
                        width: 12px; 
                        height: 12px; 
                        border-radius: 50%; 
                        background-color: ${
                          properties.severity === 'high' ? 'var(--ios-red)' : 
                          properties.severity === 'medium' ? 'var(--ios-orange)' : 'var(--ios-yellow)'
                        };
                        border: 2px solid #FFFFFF;
                        box-shadow: 0 0 8px rgba(0,0,0,0.3);
                      "></div>
                      <h3 style="margin: 0; color: var(--ios-red); font-size: 16px; font-weight: 600;">
                        ${properties.name || 'Hazard Alert'}
                      </h3>
                    </div>
                    <div style="margin-bottom: 8px;">
                      <span style="
                        display: inline-block;
                        padding: 4px 8px;
                        background-color: ${
                          properties.severity === 'high' ? 'var(--ios-red)' : 
                          properties.severity === 'medium' ? 'var(--ios-orange)' : 'var(--ios-yellow)'
                        };
                        color: #FFFFFF;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                      ">
                        ${properties.severity} Risk
                      </span>
                    </div>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">
                      <strong>Type:</strong> ${properties.hazard_type}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">
                      <strong>Description:</strong> ${properties.description || 'No description available.'}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #8E8E93;">
                      <strong>Location:</strong> ${properties.location || 'Location unknown'}
                    </p>
                  </div>
                `)
                .addTo(map);
            }
          }
        }
      });

      console.log('Hazards added successfully');
      setHazardsAdded(true);

    } catch (error) {
      console.error('Error adding hazards:', error);
    }
  };

  const add3DBuildings = (map: mapboxgl.Map) => {
    try {
      console.log('Adding 3D buildings with terrain...');
      
      // Remove existing layer if it exists
      if (map.getLayer('3d-buildings')) {
        map.removeLayer('3d-buildings');
      }

      // Check if the source exists
      if (!map.getSource('composite')) {
        console.log('Composite source not available, trying alternative approach...');
        return;
      }

      // Add 3D buildings with terrain integration
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#007AFF', // iOS blue for hover
            '#8E8E93'  // iOS gray for normal
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
          'fill-extrusion-opacity': 0.8,
          'fill-extrusion-translate': [0, 0],
          'fill-extrusion-translate-anchor': 'map'
        }
      });

      console.log('3D buildings layer added successfully with terrain');
      setBuildingsAdded(true);

      // Add hover effect
      map.on('mouseenter', '3d-buildings', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        
        // Show building tooltip
        if (e.features && e.features[0] && e.features[0].properties) {
          const properties = e.features[0].properties;
          setTooltip({
            visible: true,
            content: `🏢 3D BUILDING\nHeight: ${properties.height || 'Unknown'}m\nType: ${properties.building || 'Commercial'}\nAddress: ${properties.address || 'Location available'}`,
            x: e.point.x,
            y: e.point.y
          });
        }
      });

      map.on('mouseleave', '3d-buildings', () => {
        map.getCanvas().style.cursor = '';
        setTooltip(prev => ({ ...prev, visible: false }));
      });

    } catch (error) {
      console.error('Error adding 3D buildings:', error);
      
      // Fallback: try with a different approach
      try {
        console.log('Trying fallback 3D buildings approach...');
        map.addLayer({
          'id': '3d-buildings-fallback',
          'source': 'composite',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#007AFF',
            'fill-extrusion-height': 50, // Fixed height as fallback
            'fill-extrusion-opacity': 0.6
          }
        });
        console.log('Fallback 3D buildings added');
        setBuildingsAdded(true);
      } catch (fallbackError) {
        console.error('Fallback 3D buildings also failed:', fallbackError);
      }
    }
  };

  const addEscapeRoute = (map: mapboxgl.Map) => {
    try {
      console.log('Adding enhanced EMS route system with civilian evacuation and deconflicted EMS routes...');
      
      // Enhanced route system with EMS deconfliction
      const routeData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          // CIVILIAN EVACUATION ROUTES (Min-hazard, high safety)
          {
            type: 'Feature',
            properties: {
              routeType: 'civilian_evacuation',
              routeName: 'Primary Civilian Evacuation Route',
              status: 'Active',
              estimatedTime: '18 minutes',
              capacity: 'High',
              riskLevel: 'Low',
              description: 'Minimum hazard route for civilian evacuation with maximum safety',
              tooltip: '🚨 Primary Civilian Route: 18 min • Low Risk • High Capacity • Maximum Safety • Avoids all hazard zones',
              ems_priority: 'low',
              civilian_priority: 'high',
              restrictions: 'No EMS vehicles during evacuation',
              staging_area: [-122.400, 37.795]
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-122.4194, 37.7749], // Starting point (downtown SF)
                [-122.4150, 37.7800], // North
                [-122.4100, 37.7850], // Northeast
                [-122.4050, 37.7900], // Further northeast
                [-122.4000, 37.7950], // Safe zone destination
              ]
            }
          },
          {
            type: 'Feature',
            properties: {
              routeType: 'civilian_evacuation',
              routeName: 'Secondary Civilian Evacuation Route',
              status: 'Active',
              estimatedTime: '22 minutes',
              capacity: 'Medium',
              riskLevel: 'Low',
              description: 'Alternative civilian evacuation route via waterfront',
              tooltip: '🟠 Secondary Civilian Route: 22 min • Low Risk • Medium Capacity • Alternative Safe Path',
              ems_priority: 'low',
              civilian_priority: 'high',
              restrictions: 'No EMS vehicles during evacuation',
              staging_area: [-122.440, 37.785]
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-122.4194, 37.7749], // Starting point (downtown SF)
                [-122.4250, 37.7750], // West
                [-122.4300, 37.7750], // Further west
                [-122.4350, 37.7800], // Northwest
                [-122.4400, 37.7850], // Safe zone destination
              ]
            }
          },
          
          // EMS RESPONSE ROUTES (Deconflicted, accepts calculated risk)
          {
            type: 'Feature',
            properties: {
              routeType: 'ems_response',
              routeName: 'EMS Primary Response Route',
              status: 'Active',
              estimatedTime: '8 minutes',
              capacity: 'EMS Only',
              riskLevel: 'Moderate',
              description: 'Deconflicted EMS route to hazard zones with calculated risk acceptance',
              tooltip: '🚑 EMS Primary Route: 8 min • Moderate Risk • EMS Only • Deconflicted • Accepts calculated risk for rapid response',
              ems_priority: 'high',
              civilian_priority: 'none',
              restrictions: 'EMS vehicles only, with PPE',
              staging_area: [-122.480, 37.770],
              hazard_access: 'direct',
              escape_routes: 2
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-122.480, 37.770], // EMS staging area
                [-122.475, 37.770], // Approach
                [-122.470, 37.770], // Closer
                [-122.465, 37.770], // Near hazard
                [-122.460, 37.770], // Hazard zone entry
              ]
            }
          },
          {
            type: 'Feature',
            properties: {
              routeType: 'ems_response',
              routeName: 'EMS Secondary Response Route',
              status: 'Active',
              estimatedTime: '12 minutes',
              capacity: 'EMS Only',
              riskLevel: 'Moderate',
              description: 'Alternative EMS route with different approach vector',
              tooltip: '🚑 EMS Secondary Route: 12 min • Moderate Risk • EMS Only • Alternative Approach • Maintains escape routes',
              ems_priority: 'high',
              civilian_priority: 'none',
              restrictions: 'EMS vehicles only, with PPE',
              staging_area: [-122.410, 37.810],
              hazard_access: 'direct',
              escape_routes: 2
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-122.410, 37.810], // EMS staging area
                [-122.415, 37.810], // Approach
                [-122.420, 37.810], // Closer
                [-122.425, 37.810], // Near hazard
                [-122.430, 37.810], // Hazard zone entry
              ]
            }
          },
          
          // EMS EVACUATION SUPPORT ROUTES
          {
            type: 'Feature',
            properties: {
              routeType: 'ems_evacuation_support',
              routeName: 'EMS Evacuation Support Route',
              status: 'Active',
              estimatedTime: '15 minutes',
              capacity: 'EMS + Special Needs',
              riskLevel: 'Low',
              description: 'EMS support route for special needs evacuation',
              tooltip: '🚑 EMS Evacuation Support: 15 min • Low Risk • Special Needs Support • Medical Assistance Available',
              ems_priority: 'medium',
              civilian_priority: 'special_needs',
              restrictions: 'Special needs civilians + EMS support',
              staging_area: [-122.400, 37.795],
              special_needs: true,
              medical_support: true
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-122.400, 37.795], // Safe zone
                [-122.405, 37.790], // Support point
                [-122.410, 37.785], // Intermediate
                [-122.415, 37.780], // Approach
                [-122.4194, 37.7749], // Downtown (evacuation origin)
              ]
            }
          }
        ]
      };

      // Add enhanced route source
      map.addSource('escape-routes', {
        'type': 'geojson',
        'data': routeData
      });

      // Add route icons at start and end points
      map.addLayer({
        'id': 'route-start-icons',
        'type': 'symbol',
        'source': 'escape-routes',
        'layout': {
          'icon-image': 'route-start-icon',
          'icon-size': 1.0,
          'icon-allow-overlap': false,
          'icon-ignore-placement': false
        },
        'paint': {
          'icon-opacity': 0.9
        }
      });

      map.addLayer({
        'id': 'route-end-icons',
        'type': 'symbol',
        'source': 'escape-routes',
        'layout': {
          'icon-image': 'route-end-icon',
          'icon-size': 1.0,
          'icon-allow-overlap': false,
          'icon-ignore-placement': false
        },
        'paint': {
          'icon-opacity': 0.9
        }
      });

      // Add primary escape route layer
      map.addLayer({
        'id': 'escape-route-primary',
        'type': 'line',
        'source': 'escape-routes',
        'filter': ['==', 'routeName', 'Primary Evacuation Route'],
        'paint': {
          'line-color': resolveColor('#FF3B30'), // iOS red for emergency routes
          'line-width': 6,
          'line-opacity': 0.8,
          'line-dasharray': [2, 2] // Dashed line for evacuation route
        }
      });

      // Add secondary escape route layer
      map.addLayer({
        'id': 'escape-route-secondary',
        'type': 'line',
        'source': 'escape-routes',
        'filter': ['==', 'routeName', 'Secondary Evacuation Route'],
        'paint': {
          'line-color': resolveColor('#FF9500'), // iOS orange for secondary route
          'line-width': 4,
          'line-opacity': 0.6,
          'line-dasharray': [1, 1] // Different dash pattern
        }
      });

      // Add EMS response route layers
      map.addLayer({
        'id': 'ems-response-primary',
        'type': 'line',
        'source': 'escape-routes',
        'filter': ['==', 'routeType', 'ems_response'],
        'paint': {
          'line-color': resolveColor('#007AFF'), // iOS blue for EMS routes
          'line-width': 5,
          'line-opacity': 0.8,
          'line-dasharray': [3, 3] // Dotted line for EMS routes
        }
      });
      
      // Debug: Log the layer creation
      console.log('Created ems-response-primary layer with line-color:', resolveColor('#007AFF'));

      // Add EMS evacuation support route layer
      map.addLayer({
        'id': 'ems-evacuation-support',
        'type': 'line',
        'source': 'escape-routes',
        'filter': ['==', 'routeType', 'ems_evacuation_support'],
        'paint': {
          'line-color': resolveColor('#34C759'), // iOS green for support routes
          'line-width': 4,
          'line-opacity': 0.7,
          'line-dasharray': [2, 4] // Different dotted pattern
        }
      });

      // Add route markers
      map.addLayer({
        'id': 'escape-route-markers',
        'type': 'circle',
        'source': 'escape-routes',
        'paint': {
          'circle-radius': 8,
          'circle-color': resolveColor('#FF3B30'),
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }
      });

      // Add route labels with safe font handling
      try {
        // Check if the map style has glyphs available
        if (map.isStyleLoaded() && map.getStyle().glyphs) {
          map.addLayer({
            'id': 'escape-route-labels',
            'type': 'symbol',
            'source': 'escape-routes',
            'layout': {
              'text-field': ['get', 'routeName'],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 12,
              'text-offset': [0, -1.5],
              'text-anchor': 'top',
              'text-allow-overlap': false,
              'text-ignore-placement': false
            },
            'paint': {
              'text-color': '#FFFFFF',
              'text-halo-color': '#000000',
              'text-halo-width': 1
            }
          });
        } else {
          console.log('Map style not fully loaded or glyphs not available, skipping text labels');
        }
      } catch (error) {
        console.log('Could not add route text labels:', error);
      }

      console.log('Escape route added successfully');
      setEscapeRouteAdded(true);

      // Enhanced mouse over feedback and tooltips
      const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
        // Only query layers that actually exist on the map
        const availableLayers = ['escape-route-primary', 'escape-route-secondary', 'ems-response-primary', 'ems-evacuation-support']
          .filter(layerId => map.getLayer(layerId));
        
        if (availableLayers.length === 0) {
          setTooltip(prev => ({ ...prev, visible: false }));
          return;
        }

        const features = map.queryRenderedFeatures(e.point, {
          layers: availableLayers
        });

        if (features.length > 0) {
          const feature = features[0];
          const properties = feature.properties;
          
          if (properties && properties.tooltip) {
            setTooltip({
              visible: true,
              content: properties.tooltip,
              x: e.point.x,
              y: e.point.y
            });
          }
        } else {
          setTooltip(prev => ({ ...prev, visible: false }));
        }
      };

      // Add mouse move listener for tooltips
      map.on('mousemove', handleMouseMove);

      // Enhanced hover effects for primary route - only if layer exists
      if (map.getLayer('escape-route-primary')) {
        map.on('mouseenter', 'escape-route-primary', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          map.setPaintProperty('escape-route-primary', 'line-width', 8);
          map.setPaintProperty('escape-route-primary', 'line-opacity', 1.0);
          
          // Add glow effect
          const colorValue = resolveColor('#FF6B6B');
          map.setPaintProperty('escape-route-primary', 'line-color', colorValue);
          
          // Show tooltip
          if (e.features && e.features[0] && e.features[0].properties) {
            const properties = e.features[0].properties;
            setTooltip({
              visible: true,
              content: `🚨 PRIMARY EVACUATION ROUTE\n${properties.routeName || 'Main Route'}\nStatus: ${properties.status || 'Active'}\nTime: ${properties.estimatedTime || 'Unknown'}\nCapacity: ${properties.capacity || 'Unlimited'}`,
              x: e.point.x,
              y: e.point.y
            });
          }
        });

        map.on('mouseleave', 'escape-route-primary', () => {
          map.getCanvas().style.cursor = '';
          map.setPaintProperty('escape-route-primary', 'line-width', 6);
          map.setPaintProperty('escape-route-primary', 'line-opacity', 0.8);
          const colorValue = resolveColor('#FF3B30');
          map.setPaintProperty('escape-route-primary', 'line-color', colorValue);
          setTooltip(prev => ({ ...prev, visible: false }));
        });
      }

      // Enhanced hover effects for secondary route - only if layer exists
      if (map.getLayer('escape-route-secondary')) {
        map.on('mouseenter', 'escape-route-secondary', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          map.setPaintProperty('escape-route-secondary', 'line-width', 6);
          map.setPaintProperty('escape-route-secondary', 'line-opacity', 0.9);
          
          // Add glow effect
          const colorValue = resolveColor('#FFB347');
          map.setPaintProperty('escape-route-secondary', 'line-color', colorValue);
          
          // Show tooltip
          if (e.features && e.features[0] && e.features[0].properties) {
            const properties = e.features[0].properties;
            setTooltip({
              visible: true,
              content: `⚠️ SECONDARY EVACUATION ROUTE\n${properties.routeName || 'Alternative Route'}\nStatus: ${properties.status || 'Active'}\nTime: ${properties.estimatedTime || 'Unknown'}\nCapacity: ${properties.capacity || 'Limited'}`,
              x: e.point.x,
              y: e.point.y
            });
          }
        });

        map.on('mouseleave', 'escape-route-secondary', () => {
          map.getCanvas().style.cursor = '';
          map.setPaintProperty('escape-route-secondary', 'line-width', 4);
          map.setPaintProperty('escape-route-secondary', 'line-opacity', 0.6);
          const colorValue = resolveColor('#FF9500');
          map.setPaintProperty('escape-route-secondary', 'line-color', colorValue);
          setTooltip(prev => ({ ...prev, visible: false }));
        });
      }

      // Click interaction for route information - only if layers exist
      if (map.getLayer('escape-route-primary')) {
        map.on('click', 'escape-route-primary', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const geometry = feature.geometry as GeoJSON.LineString;
            const properties = feature.properties;
            
            if (geometry.coordinates && properties) {
              // Create popup with route information
              new mapboxgl.Popup()
                .setLngLat([geometry.coordinates[0][0], geometry.coordinates[0][1]])
                .setHTML(`
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #FF3B30; font-size: 16px;">${properties.routeName}</h3>
                    <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Status:</strong> ${properties.status}</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Time:</strong> ${properties.estimatedTime}</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Capacity:</strong> ${properties.capacity}</p>
                    <p style="margin: 0; font-size: 12px; color: #8E8E93;">${properties.description}</p>
                  </div>
                `)
                .addTo(map);
            }
          }
        });
      }

      if (map.getLayer('escape-route-secondary')) {
        map.on('click', 'escape-route-secondary', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const geometry = feature.geometry as GeoJSON.LineString;
            const properties = feature.properties;
            
            if (geometry.coordinates && properties) {
              // Create popup with route information
              new mapboxgl.Popup()
                .setLngLat([geometry.coordinates[0][0], geometry.coordinates[0][1]])
                .setHTML(`
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #FF9500; font-size: 16px;">${properties.routeName}</h3>
                    <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Status:</strong> ${properties.status}</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Time:</strong> ${properties.estimatedTime}</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Capacity:</strong> ${properties.capacity}</p>
                    <p style="margin: 0; font-size: 12px; color: #8E8E93;">${properties.description}</p>
                  </div>
                `)
                .addTo(map);
            }
          }
        });
      }

      // EMS Response Route Interactions - only if layer exists
      if (map.getLayer('ems-response-primary')) {
        map.on('mouseenter', 'ems-response-primary', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          map.setPaintProperty('ems-response-primary', 'line-width', 7);
          map.setPaintProperty('ems-response-primary', 'line-opacity', 1.0);
          
          // Debug: Log the color value being set
          const colorValue = resolveColor('#4A90E2');
          console.log('Setting ems-response-primary line-color to:', colorValue);
          map.setPaintProperty('ems-response-primary', 'line-color', colorValue);
          
          if (e.features && e.features[0] && e.features[0].properties) {
            const properties = e.features[0].properties;
            setTooltip({
              visible: true,
              content: properties.tooltip || '🚑 EMS Response Route',
              x: e.point.x,
              y: e.point.y
            });
          }
        });

        map.on('mouseleave', 'ems-response-primary', () => {
          map.getCanvas().style.cursor = '';
          map.setPaintProperty('ems-response-primary', 'line-width', 5);
          map.setPaintProperty('ems-response-primary', 'line-opacity', 0.8);
          
          // Debug: Log the color value being set
          const colorValue = resolveColor('#007AFF');
          console.log('Setting ems-response-primary line-color to:', colorValue);
          map.setPaintProperty('ems-response-primary', 'line-color', colorValue);
          
          setTooltip(prev => ({ ...prev, visible: false }));
        });
      }

      // EMS Evacuation Support Route Interactions - only if layer exists
      if (map.getLayer('ems-evacuation-support')) {
        map.on('mouseenter', 'ems-evacuation-support', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          map.setPaintProperty('ems-evacuation-support', 'line-width', 6);
          map.setPaintProperty('ems-evacuation-support', 'line-opacity', 0.9);
          
          const colorValue = resolveColor('#5AC18E');
          map.setPaintProperty('ems-evacuation-support', 'line-color', colorValue);
          
          if (e.features && e.features[0] && e.features[0].properties) {
            const properties = e.features[0].properties;
            setTooltip({
              visible: true,
              content: properties.tooltip || '🚑 EMS Evacuation Support',
              x: e.point.x,
              y: e.point.y
            });
          }
        });

        map.on('mouseleave', 'ems-evacuation-support', () => {
          map.getCanvas().style.cursor = '';
          map.setPaintProperty('ems-evacuation-support', 'line-width', 4);
          map.setPaintProperty('ems-evacuation-support', 'line-opacity', 0.7);
          const colorValue = resolveColor('#34C759');
          map.setPaintProperty('ems-evacuation-support', 'line-color', colorValue);
          setTooltip(prev => ({ ...prev, visible: false }));
        });
      }

    } catch (error) {
      console.error('Error adding escape route:', error);
    }
  };

  // ===== WEATHER OVERLAY FUNCTIONS =====
  
  const addWeatherOverlay = (map: mapboxgl.Map) => {
    if (!weatherData) {
      console.log('No weather data available for overlay');
      return;
    }

    try {
      console.log('Adding weather overlay with wind vectors, temperature, and humidity...');
      
      // Create wind vector field
      const windVectors = createWindVectorField(weatherData);
      
      // Add wind vectors source
      map.addSource('wind-vectors', {
        'type': 'geojson',
        'data': windVectors
      });

      // Add wind vector layer with enhanced styling
      map.addLayer({
        'id': 'wind-vectors-layer',
        'type': 'symbol',
        'source': 'wind-vectors',
        'layout': {
          'icon-image': 'wind-arrow',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['get', 'windSpeed'],
            0, 0.3,   // 0 mph = 0.3x size
            15, 0.8,  // 15 mph = 0.8x size
            30, 1.2,  // 30 mph = 1.2x size
            50, 2.0   // 50+ mph = 2.0x size
          ],
          'icon-rotate': ['get', 'windDirection'],
          'icon-allow-overlap': false,
          'icon-ignore-placement': false,
          'symbol-placement': 'point'
        },
        'paint': {
          'icon-opacity': [
            'case',
            ['get', 'isHighWind'], 0.95,  // High wind = more visible
            ['get', 'windGusts'], 0.9,    // Gusts = more visible
            0.7                            // Normal = less visible
          ]
        }
      });

      // Add mouse events for wind vectors
      map.on('mouseenter', 'wind-vectors-layer', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        
        if (e.features && e.features[0] && e.features[0].properties) {
          const properties = e.features[0].properties;
          const windInfo = `💨 WIND VECTOR\nSpeed: ${properties.windSpeed} mph\nDirection: ${properties.windDirection}°\nCategory: ${properties.windCategory.toUpperCase()}\n${properties.windGusts ? '⚠️ GUST DETECTED' : 'Normal conditions'}\n${properties.isHighWind ? '🚨 HIGH WIND WARNING' : ''}`;
          
          setTooltip({
            visible: true,
            content: windInfo,
            x: e.point.x,
            y: e.point.y
          });
        }
      });

      map.on('mouseleave', 'wind-vectors-layer', () => {
        map.getCanvas().style.cursor = '';
        setTooltip(prev => ({ ...prev, visible: false }));
      });

      // Add wind gust indicators as separate layer
      map.addLayer({
        'id': 'wind-gusts-layer',
        'type': 'circle',
        'source': 'wind-vectors',
        'filter': ['==', ['get', 'windGusts'], true],
        'paint': {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'gustIntensity'],
            0, 2,   // No gust = small circle
            10, 6,  // Moderate gust = medium circle
            20, 12  // Strong gust = large circle
          ],
          'circle-color': [
            'case',
            ['get', 'isHighWind'], '#FF3B30',  // High wind = red
            '#FF9500'                          // Normal gust = orange
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-opacity': 0.9
        }
      });

      // Add mouse events for wind gusts
      map.on('mouseenter', 'wind-gusts-layer', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        
        if (e.features && e.features[0] && e.features[0].properties) {
          const properties = e.features[0].properties;
          const gustInfo = `💨 WIND GUST\nBase Speed: ${properties.windSpeed - properties.gustIntensity} mph\nGust Speed: ${properties.windSpeed} mph\nGust Intensity: +${properties.gustIntensity} mph\n${properties.isHighWind ? '🚨 HIGH WIND WARNING' : 'Moderate conditions'}`;
          
          setTooltip({
            visible: true,
            content: gustInfo,
            x: e.point.x,
            y: e.point.y
          });
        }
      });

      map.on('mouseleave', 'wind-gusts-layer', () => {
        map.getCanvas().style.cursor = '';
        setTooltip(prev => ({ ...prev, visible: false }));
      });

      // Add high wind warning zones
      map.addLayer({
        'id': 'high-wind-warnings',
        'type': 'circle',
        'source': 'wind-vectors',
        'filter': ['==', ['get', 'isHighWind'], true],
        'paint': {
          'circle-radius': 8,
          'circle-color': '#FF3B30',
          'circle-opacity': 0.6,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#FF0000',
          'circle-stroke-opacity': 0.8
        }
      });

      // Add temperature heat map
      const temperatureGrid = createTemperatureGrid(weatherData);
      map.addSource('temperature-grid', {
        'type': 'geojson',
        'data': temperatureGrid
      });

      map.addLayer({
        'id': 'temperature-heatmap',
        'type': 'fill',
        'source': 'temperature-grid',
        'paint': {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'temperature'],
            50, '#0066FF',  // Cold (blue)
            70, '#00FF00',  // Cool (green)
            80, '#FFFF00',  // Warm (yellow)
            90, '#FF6600',  // Hot (orange)
            100, '#FF0000'  // Very hot (red)
          ],
          'fill-opacity': 0.3
        }
      });

      // Add humidity moisture zones
      const humidityZones = createHumidityZones(weatherData);
      map.addSource('humidity-zones', {
        'type': 'geojson',
        'data': humidityZones
      });

      map.addLayer({
        'id': 'humidity-moisture',
        'type': 'fill',
        'source': 'humidity-zones',
        'paint': {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'humidity'],
            0, '#8B4513',   // Very dry (brown)
            20, '#FFA500',  // Dry (orange)
            40, '#FFFF00',  // Moderate (yellow)
            60, '#90EE90',  // Moist (light green)
            80, '#006400',  // Very moist (dark green)
            100, '#0000FF'  // Saturated (blue)
          ],
          'fill-opacity': 0.4
        }
      });

      // Add weather legend
      addWeatherLegend(map);

      console.log('Weather overlay added successfully');
    } catch (error) {
      console.error('Error adding weather overlay:', error);
    }
  };

  const removeWeatherOverlay = (map: mapboxgl.Map) => {
    try {
      console.log('Removing weather overlay...');
      
      // Remove weather layers
      if (map.getLayer('wind-vectors-layer')) {
        map.removeLayer('wind-vectors-layer');
      }
      if (map.getLayer('wind-gusts-layer')) {
        map.removeLayer('wind-gusts-layer');
      }
      if (map.getLayer('high-wind-warnings')) {
        map.removeLayer('high-wind-warnings');
      }
      if (map.getLayer('temperature-heatmap')) {
        map.removeLayer('temperature-heatmap');
      }
      if (map.getLayer('humidity-moisture')) {
        map.removeLayer('humidity-moisture');
      }
      
      // Remove weather sources
      if (map.getSource('wind-vectors')) {
        map.removeSource('wind-vectors');
      }
      if (map.getSource('temperature-grid')) {
        map.removeSource('temperature-grid');
      }
      if (map.getSource('humidity-zones')) {
        map.removeSource('humidity-zones');
      }
      
      // Remove weather legend
      const legend = map.getContainer().querySelector('.weather-legend');
      if (legend) {
        legend.remove();
      }
      
      console.log('Weather overlay removed successfully');
    } catch (error) {
      console.error('Error removing weather overlay:', error);
    }
  };

  const createWindVectorField = (weather: WeatherData) => {
    // Create a grid of wind vectors across the map area with enhanced gust detection
    const vectors: GeoJSON.Feature[] = [];
    const bounds = [-122.5, 37.7, -122.4, 37.8]; // San Francisco area
    const gridSize = 0.008; // Smaller grid for more detailed vectors
    
    for (let lng = bounds[0]; lng <= bounds[2]; lng += gridSize) {
      for (let lat = bounds[1]; lat <= bounds[3]; lat += gridSize) {
        // Add realistic wind variation based on location and terrain
        const terrainVariation = Math.sin(lng * 150) * Math.cos(lat * 150) * 0.15;
        const coastalEffect = Math.exp(-Math.abs(lng + 122.4) * 8); // Windier near coast
        
        // Calculate adjusted wind properties
        const adjustedDirection = (weather.current.windDirection + (terrainVariation * 45)) % 360;
        const baseSpeed = weather.current.windSpeed;
        const gustMultiplier = weather.current.windGusts ? 1.5 : 1.0;
        const adjustedSpeed = (baseSpeed + (terrainVariation * 8) + (coastalEffect * 5)) * gustMultiplier;
        
        // Determine if this is a gust area (random but realistic)
        const isGustArea = Math.random() < 0.3 && weather.current.windGusts;
        const gustSpeed = isGustArea ? adjustedSpeed * 1.8 : adjustedSpeed;
        
        // Create vector feature with enhanced properties
        vectors.push({
          type: 'Feature',
          properties: {
            windSpeed: Math.max(0, Math.round(gustSpeed)),
            windDirection: Math.round(adjustedDirection),
            windGusts: isGustArea,
            gustIntensity: isGustArea ? Math.round(gustSpeed - adjustedSpeed) : 0,
            isHighWind: gustSpeed > 25, // High wind warning threshold
            windCategory: gustSpeed < 10 ? 'light' : gustSpeed < 20 ? 'moderate' : gustSpeed < 30 ? 'strong' : 'severe'
          },
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        });
      }
    }

    return {
      type: 'FeatureCollection' as const,
      features: vectors
    };
  };

  const createTemperatureGrid = (weather: WeatherData) => {
    // Create temperature grid with some spatial variation
    const grid: GeoJSON.Feature[] = [];
    const bounds = [-122.5, 37.7, -122.4, 37.8];
    const gridSize = 0.005;
    
    for (let lng = bounds[0]; lng <= bounds[2]; lng += gridSize) {
      for (let lat = bounds[1]; lat <= bounds[3]; lat += gridSize) {
        // Add terrain-based temperature variation
        const elevationFactor = Math.sin(lng * 200) * Math.cos(lat * 200) * 0.1;
        const adjustedTemp = weather.current.temp + (elevationFactor * 10);
        
        grid.push({
          type: 'Feature',
          properties: {
            temperature: Math.max(0, adjustedTemp)
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng, lat],
              [lng + gridSize, lat],
              [lng + gridSize, lat + gridSize],
              [lng, lat + gridSize],
              [lng, lat]
            ]]
          }
        });
      }
    }

    return {
      type: 'FeatureCollection' as const,
      features: grid
    };
  };

  const createHumidityZones = (weather: WeatherData) => {
    // Create humidity zones with spatial variation
    const zones: GeoJSON.Feature[] = [];
    const bounds = [-122.5, 37.7, -122.4, 37.8];
    const zoneSize = 0.01;
    
    for (let lng = bounds[0]; lng <= bounds[2]; lng += zoneSize) {
      for (let lat = bounds[1]; lat <= bounds[3]; lat += zoneSize) {
        // Add coastal influence on humidity
        const coastalFactor = Math.exp(-Math.abs(lng + 122.4) * 10); // Higher humidity near coast
        const adjustedHumidity = weather.current.humidity + (coastalFactor * 20);
        
        zones.push({
          type: 'Feature',
          properties: {
            humidity: Math.min(100, Math.max(0, adjustedHumidity))
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng, lat],
              [lng + zoneSize, lat],
              [lng + zoneSize, lat + zoneSize],
              [lng, lat + zoneSize],
              [lng, lat]
            ]]
          }
        });
      }
    }

    return {
      type: 'FeatureCollection' as const,
      features: zones
    };
  };

  const addWeatherLegend = (map: mapboxgl.Map) => {
    // Create enhanced EMS weather legend element
    const legend = document.createElement('div');
    legend.className = 'weather-legend';
    
    // Use grid layout instead of absolute positioning
    legend.style.cssText = `
      grid-area: legend;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: #1D1D1F;
      padding: 20px;
      border-radius: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      font-size: 13px;
      z-index: 500;
      min-width: 280px;
      max-width: 320px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.8);
      max-height: 400px;
      overflow-y: auto;
      pointer-events: auto;
      align-self: start;
    `;

    legend.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--ios-blue); font-size: 17px; border-bottom: 1px solid rgba(0, 122, 255, 0.2); padding-bottom: 8px; font-weight: 600;">
        🌤️ Weather Operations
      </h4>
      
      <!-- Current Conditions -->
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(0, 122, 255, 0.05); border-radius: 12px; border: 1px solid rgba(0, 122, 255, 0.1);">
        <h5 style="margin: 0 0 8px 0; color: var(--ios-blue); font-size: 15px; font-weight: 600;">📊 Current Conditions</h5>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
          <div><span style="color: var(--ios-blue); font-weight: 500;">🌡️ Temp:</span> ${weatherData?.current.temp}°F</div>
          <div><span style="color: var(--ios-blue); font-weight: 500;">💧 Humidity:</span> ${weatherData?.current.humidity}%</div>
          <div><span style="color: var(--ios-blue); font-weight: 500;">💨 Wind:</span> ${weatherData?.current.windSpeed} mph</div>
          <div><span style="color: var(--ios-blue); font-weight: 500;">🧭 Direction:</span> ${getWindDirection(weatherData?.current.windDirection || 0)}</div>
          ${weatherData?.current.windGusts ? '<div style="grid-column: 1 / -1;"><span style="color: var(--ios-orange); font-weight: 500;">💨 Gusts:</span> Active - Monitor for changes</div>' : ''}
        </div>
      </div>

      <!-- Wind Vector Legend -->
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(0, 122, 255, 0.05); border-radius: 12px; border: 1px solid rgba(0, 122, 255, 0.1);">
        <h5 style="margin: 0 0 8px 0; color: var(--ios-blue); font-size: 15px; font-weight: 600;">💨 Wind Vectors</h5>
        <div style="font-size: 12px; line-height: 1.4;">
          <div style="margin-bottom: 4px;">
            <span style="color: var(--ios-blue); font-weight: 500;">→ Arrows:</span> Wind direction
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: var(--ios-blue); font-weight: 500;">📏 Length:</span> Wind speed (longer = faster)
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: var(--ios-orange); font-weight: 500;">🟠 Circles:</span> Wind gusts detected
          </div>
          <div>
            <span style="color: #FF3B30; font-weight: 500;">🔴 Red:</span> High wind warnings (>25 mph)
          </div>
        </div>
      </div>

      <!-- EMS Impact Assessment -->
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255, 59, 48, 0.05); border-radius: 12px; border: 1px solid rgba(255, 59, 48, 0.1);">
        <h5 style="margin: 0 0 8px 0; color: #FF3B30; font-size: 15px; font-weight: 600;">🚑 EMS Impact</h5>
        <div style="font-size: 13px;">
          <div style="margin-bottom: 6px;">
            <span style="color: #FF3B30; font-weight: 500;">🔥 Fire Risk:</span> 
            <span style="color: ${getFireRiskColor(weatherData?.current.fireWeatherIndex || 'low')}; font-weight: 600;">
              ${weatherData?.current.fireWeatherIndex?.toUpperCase()}
            </span>
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: #FF3B30; font-weight: 500;">🚨 Evacuation:</span> 
            <span style="color: ${getEvacuationRiskColor(weatherData?.current)}; font-weight: 600;">
              ${getEvacuationRisk(weatherData?.current)}
            </span>
          </div>
          <div>
            <span style="color: #FF3B30; font-weight: 500;">🚁 Air Operations:</span> 
            <span style="color: ${getAirOpsRiskColor(weatherData?.current)}; font-weight: 600;">
              ${getAirOpsRisk(weatherData?.current)}
            </span>
          </div>
        </div>
      </div>

      <!-- Forecast Box -->
      <div style="padding: 12px; background: rgba(88, 86, 214, 0.05); border-radius: 12px; border: 1px solid rgba(88, 86, 214, 0.1);">
        <h5 style="margin: 0 0 8px 0; color: #5856D6; font-size: 15px; font-weight: 600;">📅 Forecast</h5>
        <div style="font-size: 13px; line-height: 1.4;">
          ${weatherData?.forecast.redFlagWarning ? 
            '<div style="color: #FF3B30; margin-bottom: 6px; font-weight: 600;">⚠️ RED FLAG WARNING ACTIVE</div>' : ''
          }
          <div style="margin-bottom: 6px;">
            <span style="color: #5856D6; font-weight: 500;">18:00:</span> ${weatherData?.forecast.windShiftExpected || 'No wind shift expected'}
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: #5856D6; font-weight: 500;">Overnight:</span> ${weatherData?.forecast.humidityRecovery || 'Humidity stable'}
          </div>
          <div>
            <span style="color: #5856D6; font-weight: 500;">22:00:</span> ${weatherData?.forecast.tempDrop || 'Temperature stable'}
          </div>
        </div>
      </div>

      <div style="font-size: 12px; color: #8E8E93; margin-top: 15px; text-align: center; border-top: 1px solid rgba(142, 142, 147, 0.2); padding-top: 12px; line-height: 1.4;">
        Wind vectors show direction and speed<br>
        Colors indicate temperature and humidity<br>
        <strong style="color: #1D1D1F;">Critical for EMS routing decisions</strong>
      </div>
    `;

    // Add legend to map container
    const mapContainer = map.getContainer();
    mapContainer.appendChild(legend);
  };

  // EMS Weather Risk Assessment Functions
  const getFireRiskColor = (risk: string): string => {
    const colors: { [key: string]: string } = {
      low: '#34C759',
      moderate: '#FFCC00',
      high: '#FF9500',
      extreme: '#FF3B30',
      catastrophic: '#AF52DE'
    };
    return colors[risk] || '#34C759';
  };

  const getEvacuationRiskColor = (weather: any): string => {
    if (weather.humidity < 20 || weather.windSpeed > 25 || weather.temp > 90) return '#FF3B30';
    if (weather.humidity < 30 || weather.windSpeed > 20 || weather.temp > 85) return '#FF9500';
    return '#34C759';
  };

  const getEvacuationRisk = (weather: any): string => {
    if (weather.humidity < 20 || weather.windSpeed > 25 || weather.temp > 90) return 'CRITICAL';
    if (weather.humidity < 30 || weather.windSpeed > 20 || weather.temp > 85) return 'HIGH';
    return 'LOW';
  };

  const getAirOpsRiskColor = (weather: any): string => {
    if (weather.windSpeed > 30 || weather.visibility < 5) return '#FF3B30';
    if (weather.windSpeed > 20 || weather.visibility < 5) return '#FF9500';
    return '#34C759';
  };

  const getAirOpsRisk = (weather: any): string => {
    if (weather.windSpeed > 30 || weather.visibility < 3) return 'GROUNDED';
    if (weather.windSpeed > 20 || weather.visibility < 5) return 'RESTRICTED';
    return 'CLEAR';
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // ===== EVACUATION ZONES AND BUILDING STATUS SYSTEM =====
  
  const addEvacuationZones = (map: mapboxgl.Map) => {
    try {
      console.log('Adding evacuation zones and building status system...');
      
      // Evacuation zones data
      const evacuationZonesData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              zoneId: 'evac_zone_001',
              zoneName: 'Golden Gate Park Evacuation Zone',
              priority: 'immediate',
              totalBuildings: 45,
              totalPopulation: 1200,
              evacuationProgress: {
                confirmed: 28,
                inProgress: 12,
                refused: 3,
                noContact: 2,
                unchecked: 0,
                specialNeeds: 8
              },
              status: 'active',
              estimatedCompletion: '2 hours',
              lastUpdated: new Date().toISOString()
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-122.485, 37.765],
                [-122.475, 37.765],
                [-122.475, 37.775],
                [-122.485, 37.775],
                [-122.485, 37.765]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: {
              zoneId: 'evac_zone_002',
              zoneName: 'Fisherman\'s Wharf Evacuation Zone',
              priority: 'immediate',
              totalBuildings: 32,
              totalPopulation: 800,
              evacuationProgress: {
                confirmed: 25,
                inProgress: 5,
                refused: 1,
                noContact: 1,
                unchecked: 0,
                specialNeeds: 3
              },
              status: 'active',
              estimatedCompletion: '1.5 hours',
              lastUpdated: new Date().toISOString()
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-122.415, 37.805],
                [-122.405, 37.805],
                [-122.405, 37.815],
                [-122.415, 37.815],
                [-122.415, 37.805]
              ]]
            }
          }
        ]
      };

      // Add evacuation zones source
      map.addSource('evacuation-zones', {
        'type': 'geojson',
        'data': evacuationZonesData
      });

      // Add evacuation zone layers
      map.addLayer({
        'id': 'evacuation-zones-fill',
        'type': 'fill',
        'source': 'evacuation-zones',
        'paint': {
          'fill-color': [
            'case',
            ['==', ['get', 'priority'], 'immediate'], '#FF0000',
            ['==', ['get', 'priority'], 'warning'], '#FF6600',
            ['==', ['get', 'priority'], 'standby'], '#FFFF00',
            '#00FF00'
          ],
          'fill-opacity': 0.3
        }
      });

      map.addLayer({
        'id': 'evacuation-zones-border',
        'type': 'line',
        'source': 'evacuation-zones',
        'paint': {
          'line-color': [
            'case',
            ['==', ['get', 'priority'], 'immediate'], '#FF0000',
            ['==', ['get', 'priority'], 'warning'], '#FF6600',
            ['==', ['get', 'priority'], 'standby'], '#FFFF00',
            '#00FF00'
          ],
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });

      // Add evacuation zone labels with safe font handling
      try {
        if (map.isStyleLoaded() && map.getStyle().glyphs) {
          map.addLayer({
            'id': 'evacuation-zone-labels',
            'type': 'symbol',
            'source': 'evacuation-zones',
            'layout': {
              'text-field': ['get', 'zoneName'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 14,
              'text-offset': [0, 0],
              'text-anchor': 'center'
            },
            'paint': {
              'text-color': '#FFFFFF',
              'text-halo-color': '#000000',
              'text-halo-width': 2
            }
          });
        } else {
          console.log('Map style not fully loaded or glyphs not available, skipping evacuation zone labels');
        }
      } catch (error) {
        console.log('Could not add evacuation zone text labels:', error);
      }

      // Add building evacuation status
      const buildingStatusData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          // Sample buildings with evacuation status
          {
            type: 'Feature',
            properties: {
              buildingId: 'bldg_001',
              address: '123 Golden Gate Ave',
              evacuationStatus: 'confirmed',
              confirmedBy: 'EMS-Unit-5',
              timestamp: new Date().toISOString(),
              specialNeeds: ['wheelchair', 'oxygen'],
              pets: 2,
              vehicles: 1,
              notes: 'Family of 4 evacuated successfully'
            },
            geometry: {
              type: 'Point',
              coordinates: [-122.480, 37.770]
            }
          },
          {
            type: 'Feature',
            properties: {
              buildingId: 'bldg_002',
              address: '456 Park Boulevard',
              evacuationStatus: 'in_progress',
              confirmedBy: 'EMS-Unit-3',
              timestamp: new Date().toISOString(),
              specialNeeds: ['elderly'],
              pets: 1,
              vehicles: 0,
              notes: 'Elderly resident, assistance required'
            },
            geometry: {
              type: 'Point',
              coordinates: [-122.478, 37.772]
            }
          },
          {
            type: 'Feature',
            properties: {
              buildingId: 'bldg_003',
              address: '789 Sunset Drive',
              evacuationStatus: 'refused',
              confirmedBy: 'EMS-Unit-1',
              timestamp: new Date().toISOString(),
              specialNeeds: [],
              pets: 0,
              vehicles: 1,
              notes: 'Resident refused evacuation, monitoring'
            },
            geometry: {
              type: 'Point',
              coordinates: [-122.476, 37.768]
            }
          }
        ]
      };

      // Add building status source
      map.addSource('building-status', {
        'type': 'geojson',
        'data': buildingStatusData
      });

      // Add building status layer
      map.addLayer({
        'id': 'building-evacuation-status',
        'type': 'circle',
        'source': 'building-status',
        'paint': {
          'circle-radius': 8,
          'circle-color': [
            'case',
            ['==', ['get', 'evacuationStatus'], 'confirmed'], '#00FF00',
            ['==', ['get', 'evacuationStatus'], 'in_progress'], '#FFFF00',
            ['==', ['get', 'evacuationStatus'], 'refused'], '#FF6600',
            ['==', ['get', 'evacuationStatus'], 'no_contact'], '#FF0000',
            '#808080'
          ],
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }
      });

      // Add building labels with safe font handling
      try {
        if (map.isStyleLoaded() && map.getStyle().glyphs) {
          map.addLayer({
            'id': 'building-status-labels',
            'type': 'symbol',
            'source': 'building-status',
            'layout': {
              'text-field': ['get', 'evacuationStatus'],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 10,
              'text-offset': [0, 1.5],
              'text-anchor': 'top'
            },
            'paint': {
              'text-color': '#FFFFFF',
              'text-halo-color': '#000000',
              'text-halo-width': 1
            }
          });
        } else {
          console.log('Map style not fully loaded or glyphs not available, skipping building status labels');
        }
      } catch (error) {
        console.log('Could not add building status text labels:', error);
      }

      console.log('Evacuation zones and building status system added successfully');
    } catch (error) {
      console.error('Error adding evacuation zones:', error);
    }
  };

  const removeEvacuationZones = (map: mapboxgl.Map) => {
    try {
      console.log('Removing evacuation zones and building status system...');
      
      // Remove evacuation zone layers
      if (map.getLayer('evacuation-zones-fill')) {
        map.removeLayer('evacuation-zones-fill');
      }
      if (map.getLayer('evacuation-zones-border')) {
        map.removeLayer('evacuation-zones-border');
      }
      if (map.getLayer('evacuation-zone-labels')) {
        map.removeLayer('evacuation-zone-labels');
      }
      
      // Remove building status layers
      if (map.getLayer('building-evacuation-status')) {
        map.removeLayer('building-evacuation-status');
      }
      if (map.getLayer('building-status-labels')) {
        map.removeLayer('building-status-labels');
      }
      
      // Remove sources
      if (map.getSource('evacuation-zones')) {
        map.removeSource('evacuation-zones');
      }
      if (map.getSource('building-status')) {
        map.removeSource('building-status');
      }
      
      console.log('Evacuation zones and building status system removed successfully');
    } catch (error) {
      console.error('Error removing evacuation zones:', error);
    }
  };

  // Debug: Check CSS variable resolution
  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const iosBlueValue = computedStyle.getPropertyValue('--ios-blue').trim();
    console.log('CSS variable --ios-blue resolved to:', iosBlueValue);
    console.log('Document root element:', root);
    console.log('Computed style object:', computedStyle);
  }, []);

  // Utility function to safely resolve CSS variables to hex colors
  const resolveColor = (colorValue: string): string => {
    // If it's already a hex color, return it
    if (colorValue.startsWith('#')) {
      return colorValue;
    }
    
    // If it's a CSS variable, resolve it
    if (colorValue.startsWith('var(--')) {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const resolvedValue = computedStyle.getPropertyValue(colorValue.slice(4, -1)).trim();
      
      // If the resolved value is still a CSS variable, fall back to a default
      if (resolvedValue.startsWith('var(--') || !resolvedValue) {
        console.warn(`Could not resolve CSS variable ${colorValue}, using fallback color`);
        return '#007AFF'; // Default iOS blue
      }
      
      return resolvedValue;
    }
    
    // If it's any other format, return as-is (Mapbox will handle validation)
    return colorValue;
  };

  useEffect(() => {
    // Initialize map
    if (!mapboxgl.accessToken) {
      setError('Mapbox access token not found. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env.local file.');
      return;
    }

    // Map initialization logic will go here
    // (removed resize handler since we're using CSS Grid now)
  }, []);

  return (
    <div 
      className="simple-mapbox-test" 
      style={{ 
        width: '100%', 
        height: '800px',
        position: 'relative',
        backgroundColor: '#f5f5f7',
        borderRadius: '12px',
        margin: '0',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateAreas: window.innerWidth < 1200 ? `
          "header"
          "map"
          "controls"
          "legend"
        ` : `
          "header header header"
          "map map controls"
          "map map legend"
        `,
        gridTemplateRows: window.innerWidth < 1200 ? 'auto 1fr auto auto' : 'auto 1fr auto',
        gridTemplateColumns: window.innerWidth < 1200 ? '1fr' : '1fr 1fr 320px',
        gap: '20px',
        padding: '20px'
      }}
    >
      {/* Header Area */}
      <div style={{ 
        gridArea: 'header',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        zIndex: 100
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#1D1D1F', fontSize: '24px' }}>
          🗺️ Emergency Response Map
        </h2>
        <p style={{ margin: '0', color: '#8E8E93', fontSize: '16px' }}>
          Real-time disaster monitoring and response coordination
        </p>
      </div>

      {/* Map Container - Now properly positioned in grid */}
      <div 
        ref={containerRef} 
        className="mapbox-container"
        style={{ 
          gridArea: 'map',
          width: '100%', 
          height: '100%',
          borderRadius: '12px',
          zIndex: 1,
          overflow: 'hidden'
        }} 
      />
      
      {/* Error Display */}
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: 'var(--ios-spacing-md)', 
          left: 'var(--ios-spacing-md)', 
          right: 'var(--ios-spacing-md)',
          background: 'rgba(220, 53, 69, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 'var(--ios-border-radius-xl)',
          padding: 'var(--ios-spacing-md)',
          boxShadow: 'var(--ios-shadow-medium)',
          border: '1px solid rgba(220, 53, 69, 0.8)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ios-spacing-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#DC3545'
            }}>⚠️</div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '700',
              color: '#FFFFFF',
              fontSize: '14px',
              letterSpacing: '-0.022em'
            }}>Map Loading Error</span>
          </div>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#FFFFFF',
            fontSize: '13px',
            letterSpacing: '-0.022em',
            lineHeight: '1.4'
          }}>{error}</p>
          <div style={{ 
            marginTop: 'var(--ios-spacing-xs)',
            padding: 'var(--ios-spacing-xs)',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--ios-border-radius-medium)',
            fontSize: '12px',
            color: '#FFFFFF'
          }}>
            <strong>To fix this:</strong><br/>
            1. Set VITE_MAPBOX_ACCESS_TOKEN in your .env.local file<br/>
            2. Or contact your administrator for a valid Mapbox token
          </div>
        </div>
      )}
      
      {/* Enhanced iOS-style loading indicator */}
      {!mapLoaded && !error && (
        <div style={{ 
          position: 'absolute', 
          top: 'var(--ios-spacing-md)', 
          left: 'var(--ios-spacing-md)', 
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 'var(--ios-border-radius-xl)',
          padding: 'var(--ios-spacing-md)',
          boxShadow: 'var(--ios-shadow-medium)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ios-spacing-sm)',
          minWidth: '200px'
        }}>
          <div className="ios-spinner" style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid var(--ios-blue)',
            borderRadius: '50%',
            animation: 'ios-spin 1s linear infinite'
          }}></div>
          <span className="ios-caption" style={{ 
            margin: 0, 
            fontWeight: '600',
            color: '#FFFFFF',
            fontSize: '14px',
            letterSpacing: '-0.022em'
          }}>Loading 3D Map...</span>
        </div>
      )}
      
      {/* Map is now full-screen without control panel */}
      
      {/* Apple Maps-style Layer Controls - Now properly positioned in grid */}
      {mapLoaded && (
        <div 
          className="layer-controls"
          style={{ 
          gridArea: 'controls',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '280px',
          maxWidth: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          alignSelf: 'start'
        }}>
          <h4 style={{ 
            margin: 0, 
            marginBottom: '12px', 
            fontWeight: '600',
            color: '#1D1D1F',
            fontSize: '17px',
            letterSpacing: '-0.022em'
          }}>Map Layers</h4>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(255, 59, 48, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 59, 48, 0.1)',
            cursor: 'pointer'
          }}
          onClick={() => setShowHazards(!showHazards)}
          >
            <span style={{ margin: 0, color: 'var(--ios-red)', fontWeight: '500' }}>Hazards:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ margin: 0, color: '#1D1D1F', fontWeight: '600' }}>
                {showHazards ? (hazardsAdded ? '3 Active' : 'Loading...') : 'Disabled'}
              </span>
              <input 
                type="checkbox" 
                checked={showHazards}
                onChange={() => setShowHazards(!showHazards)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: 'var(--ios-red)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(255, 149, 0, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 149, 0, 0.1)',
            cursor: 'pointer'
          }}
          onClick={() => setShowRoutes(!showRoutes)}
          >
            <span style={{ margin: 0, color: 'var(--ios-orange)', fontWeight: '500' }}>Routes:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ margin: 0, color: '#1D1D1F', fontWeight: '600' }}>
                {showRoutes ? (escapeRouteAdded ? '5 Available' : 'Loading...') : 'Disabled'}
              </span>
              <input 
                type="checkbox" 
                checked={showRoutes}
                onChange={() => setShowRoutes(!showRoutes)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: 'var(--ios-orange)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(0, 122, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 122, 255, 0.1)',
            cursor: 'pointer'
          }}
          onClick={() => setShowUnits(!showUnits)}
          >
            <span style={{ margin: 0, color: 'var(--ios-blue)', fontWeight: '500' }}>Units:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ margin: 0, color: '#1D1D1F', fontWeight: '600' }}>
                {showUnits ? '8 Active' : 'Disabled'}
              </span>
              <input 
                type="checkbox" 
                checked={showUnits}
                onChange={() => setShowUnits(!showUnits)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: 'var(--ios-blue)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(52, 199, 89, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(52, 199, 89, 0.1)'
          }}>
            <span style={{ margin: 0, color: 'var(--ios-green)', fontWeight: '500' }}>Buildings:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ margin: 0, color: '#1D1D1F', fontWeight: '600' }}>
                {buildingsAdded ? '25+ Visible' : 'Loading...'} Always On
              </span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(88, 86, 214, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(88, 86, 214, 0.1)',
            cursor: 'pointer'
          }}
          onClick={() => setShowWeather(!showWeather)}
          >
            <span style={{ margin: 0, color: 'var(--ios-purple)', fontWeight: '500' }}>Weather:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ margin: 0, color: '#1D1D1F', fontWeight: '600' }}>
                {showWeather ? 'Active' : 'Disabled'}
              </span>
              <input 
                type="checkbox" 
                checked={showWeather}
                onChange={() => setShowWeather(!showWeather)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: 'var(--ios-purple)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(255, 59, 48, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 59, 48, 0.1)',
            cursor: 'pointer'
          }}
          onClick={() => setShowEvacuationZones(!showEvacuationZones)}
          >
            <span style={{ margin: 0, color: 'var(--ios-red)', fontWeight: '500' }}>Evac Zones:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ margin: 0, color: '#1D1D1F', fontWeight: '600' }}>
                {showEvacuationZones ? 'Active' : 'Disabled'}
              </span>
              <input 
                type="checkbox" 
                checked={showEvacuationZones}
                onChange={() => setShowEvacuationZones(!showEvacuationZones)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: 'var(--ios-red)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
          
          {/* Summary Section */}
          <div style={{ 
            marginTop: '12px', 
            paddingTop: '12px',
            borderTop: '1px solid rgba(142, 142, 147, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ margin: 0, color: '#8E8E93', fontWeight: '500' }}>Active Features:</span>
              <span style={{ margin: 0, color: '#1D1D1F', fontWeight: '600' }}>
                {[showHazards, showRoutes, showUnits, showWeather, showEvacuationZones].filter(Boolean).length + 1}/6 (3D Buildings Always On)
              </span>
            </div>
            <div style={{ 
              marginTop: '8px',
              fontSize: '12px',
              color: '#8E8E93',
              fontStyle: 'italic'
            }}>
              Click toggles to show/hide map layers
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Robust Tooltip */}
      {tooltip.visible && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 10, window.innerWidth - 320), // Prevent overflow
          top: Math.max(tooltip.y - 40, 10), // Prevent overflow
          background: 'rgba(0, 0, 0, 0.95)',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          zIndex: 2000,
          pointerEvents: 'none',
          maxWidth: '350px',
          minWidth: '250px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          lineHeight: '1.5',
          letterSpacing: '-0.022em',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          {tooltip.content}
          <div style={{
            position: 'absolute',
            left: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid rgba(0, 0, 0, 0.95)'
          }}></div>
        </div>
      )}
    </div>
  );
};
