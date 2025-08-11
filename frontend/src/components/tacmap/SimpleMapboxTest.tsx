import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Define hazard data structure
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
}

// Mock hazard data for San Francisco area
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
        timestamp: '2024-08-11T21:43:00Z'
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
        severity: 'medium',
        id: 'hazard_002',
        name: 'Fisherman\'s Wharf Flooding',
        description: 'Coastal flooding in Fisherman\'s Wharf area',
        location: 'Fisherman\'s Wharf, San Francisco',
        tooltip: '🌊 Medium Risk Flood • Fisherman\'s Wharf • Monitor Conditions',
        evacuation_required: false,
        affected_area: '1.8 sq km',
        timestamp: '2024-08-11T21:43:00Z'
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
  showAnalytics: initialShowAnalytics = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [buildingsAdded, setBuildingsAdded] = useState(false);
  const [terrainAdded, setTerrainAdded] = useState(false);
  const [escapeRouteAdded, setEscapeRouteAdded] = useState(false);
  const [hazardsAdded, setHazardsAdded] = useState(false);
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
    if (!containerRef.current) return;

    const accessToken = getMapboxToken();
    
    // Check if we have a valid token
    if (!accessToken || accessToken === 'your-mapbox-access-token-here') {
      setError('Mapbox access token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN in your environment variables.');
      return;
    }

    console.log('SimpleMapboxTest: Initializing map with 3D terrain, hazards, and escape route...');
    console.log('Mapbox available:', !!mapboxgl);
    console.log('Mapbox Map available:', !!mapboxgl.Map);
    console.log('Access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'Not set');

    try {
      // Set the access token
      mapboxgl.accessToken = accessToken;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Back to dark style
        center: [-122.4194, 37.7749], // San Francisco
        zoom: 16, // Higher zoom for 3D buildings
        pitch: 60, // More dramatic pitch for 3D effect
        bearing: 0,
        antialias: true
      });

      mapRef.current = map;

      map.on('load', () => {
        console.log('SimpleMapboxTest: Map loaded successfully!');
        setMapLoaded(true);
        setError(null); // Clear any previous errors on successful load
        
        // Add custom icons to the map
        // Fire icon (🔥)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI0ZGN0YwMCIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('fire-icon', image);
        });
        
        // Flood icon (🌊)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzAwN0FGRiIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('flood-icon', image);
        });
        
        // Earthquake icon (🌋)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI0ZGN0YwMCIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('earthquake-icon', image);
        });
        
        // Landslide icon (🏔️)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI0ZGN0YwMCIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('landslide-icon', image);
        });
        
        // Tsunami icon (🌊)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzAwN0FGRiIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('tsunami-icon', image);
        });
        
        // Chemical spill icon (☣️)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI0ZGN0YwMCIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('chemical-icon', image);
        });
        
        // Power outage icon (⚡)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI0ZGN0YwMCIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('power-icon', image);
        });
        
        // Gas leak icon (💨)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI0ZGN0YwMCIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('gas-icon', image);
        });
        
        // Default icon
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzAwN0FGRiIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('default-icon', image);
        });
        
        // Route start icon (🚪)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzAwN0FGRiIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('route-start-icon', image);
        });
        
        // Route end icon (✅)
        map.loadImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzAwN0FGRiIvPgo8L3N2Zz4K', (error, image) => {
          if (!error && image) map.addImage('route-end-icon', image);
        });
        
        setTimeout(() => {
          add3DTerrain(map);
          addHazards(map);
          add3DBuildings(map);
          addEscapeRoute(map);
        }, 1000);
      });

      map.on('error', (e) => {
        console.error('SimpleMapboxTest: Map error:', e);
        setError(`Map error: ${e.error?.message || 'Unknown error'}`);
      });

      // Add 3D buildings when zoom changes to appropriate level
      map.on('zoom', () => {
        if (map.getZoom() >= 15 && !buildingsAdded) {
          add3DBuildings(map);
        }
      });

    } catch (error) {
      console.error('SimpleMapboxTest: Error creating map:', error);
      setError(`Failed to create map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [buildingsAdded, terrainAdded, escapeRouteAdded, hazardsAdded]);

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

  }, [showHazards, showUnits, showRoutes, showBuildings, showTerrain, showAnalytics, mapLoaded]);

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
            ['==', ['get', 'severity'], 'high'], '#FF3B30', // iOS red for high severity
            ['==', ['get', 'severity'], 'medium'], '#FF9500', // iOS orange for medium severity
            ['==', ['get', 'severity'], 'low'], '#FFCC00', // iOS yellow for low severity
            '#FF3B30' // Default to red
          ],
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
          'circle-opacity': 0.9
        }
      });

      // Add hazard labels
      map.addLayer({
        'id': 'hazard-labels',
        'type': 'symbol',
        'source': 'hazards',
        'layout': {
          'text-field': ['get', 'hazard_type'],
          'text-font': ['Open Sans Bold'],
          'text-size': 10,
          'text-offset': [0, -2],
          'text-anchor': 'top',
          'text-allow-overlap': false
        },
        'paint': {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

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
                content: properties.tooltip || `${properties.hazard_type} - ${properties.severity} risk`,
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
                          properties.severity === 'high' ? '#FF3B30' : 
                          properties.severity === 'medium' ? '#FF9500' : '#FFCC00'
                        };
                        border: 2px solid #FFFFFF;
                        box-shadow: 0 0 8px rgba(0,0,0,0.3);
                      "></div>
                      <h3 style="margin: 0; color: #FF3B30; font-size: 16px; font-weight: 600;">
                        ${properties.name || 'Hazard Alert'}
                      </h3>
                    </div>
                    <div style="margin-bottom: 8px;">
                      <span style="
                        display: inline-block;
                        padding: 4px 8px;
                        background-color: ${
                          properties.severity === 'high' ? '#FF3B30' : 
                          properties.severity === 'medium' ? '#FF9500' : '#FFCC00'
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
      map.on('mouseenter', '3d-buildings', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', '3d-buildings', () => {
        map.getCanvas().style.cursor = '';
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
      console.log('Adding example escape route with enhanced tooltips...');
      
      // Example escape route data - San Francisco evacuation route
      const escapeRouteData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              routeName: 'Primary Evacuation Route',
              status: 'Active',
              estimatedTime: '15 minutes',
              capacity: 'High',
              description: 'Main evacuation route from downtown to safe zone',
              tooltip: '🚨 Primary Route: 15 min • High Capacity • Active • This is a longer tooltip to test text wrapping and scaling capabilities with multiple lines of content'
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
              routeName: 'Secondary Evacuation Route',
              status: 'Active',
              estimatedTime: '20 minutes',
              capacity: 'Medium',
              description: 'Alternative evacuation route via waterfront',
              tooltip: '🟠 Secondary Route: 20 min • Medium Capacity • Active • Alternative path with different characteristics and longer description for testing'
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
          }
        ]
      };

      // Add escape route source
      map.addSource('escape-routes', {
        'type': 'geojson',
        'data': escapeRouteData
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
          'line-color': '#FF3B30', // iOS red for emergency routes
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
          'line-color': '#FF9500', // iOS orange for secondary route
          'line-width': 4,
          'line-opacity': 0.6,
          'line-dasharray': [1, 1] // Different dash pattern
        }
      });

      // Add route markers
      map.addLayer({
        'id': 'escape-route-markers',
        'type': 'circle',
        'source': 'escape-routes',
        'paint': {
          'circle-radius': 8,
          'circle-color': '#FF3B30',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }
      });

      // Add route labels
      map.addLayer({
        'id': 'escape-route-labels',
        'type': 'symbol',
        'source': 'escape-routes',
        'layout': {
          'text-field': ['get', 'routeName'],
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
          'text-offset': [0, -1.5],
          'text-anchor': 'top'
        },
        'paint': {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      console.log('Escape route added successfully');
      setEscapeRouteAdded(true);

      // Enhanced mouse over feedback and tooltips
      const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['escape-route-primary', 'escape-route-secondary']
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

      // Enhanced hover effects for primary route
      map.on('mouseenter', 'escape-route-primary', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty('escape-route-primary', 'line-width', 8);
        map.setPaintProperty('escape-route-primary', 'line-opacity', 1.0);
        
        // Add glow effect
        map.setPaintProperty('escape-route-primary', 'line-color', '#FF6B6B');
        
        // Show tooltip
        if (e.features && e.features[0] && e.features[0].properties) {
          const properties = e.features[0].properties;
          setTooltip({
            visible: true,
            content: properties.tooltip || '🚨 Primary Evacuation Route',
            x: e.point.x,
            y: e.point.y
          });
        }
      });

      map.on('mouseleave', 'escape-route-primary', () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty('escape-route-primary', 'line-width', 6);
        map.setPaintProperty('escape-route-primary', 'line-opacity', 0.8);
        map.setPaintProperty('escape-route-primary', 'line-color', '#FF3B30');
        setTooltip(prev => ({ ...prev, visible: false }));
      });

      // Enhanced hover effects for secondary route
      map.on('mouseenter', 'escape-route-secondary', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty('escape-route-secondary', 'line-width', 6);
        map.setPaintProperty('escape-route-secondary', 'line-opacity', 0.9);
        
        // Add glow effect
        map.setPaintProperty('escape-route-secondary', 'line-color', '#FFB347');
        
        // Show tooltip
        if (e.features && e.features[0] && e.features[0].properties) {
          const properties = e.features[0].properties;
          setTooltip({
            visible: true,
            content: properties.tooltip || '🟠 Secondary Evacuation Route',
            x: e.point.x,
            y: e.point.y
          });
        }
      });

      map.on('mouseleave', 'escape-route-secondary', () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty('escape-route-secondary', 'line-width', 4);
        map.setPaintProperty('escape-route-secondary', 'line-opacity', 0.6);
        map.setPaintProperty('escape-route-secondary', 'line-color', '#FF9500');
        setTooltip(prev => ({ ...prev, visible: false }));
      });

      // Click interaction for route information
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

    } catch (error) {
      console.error('Error adding escape route:', error);
    }
  };

  return (
    <div 
      className="simple-mapbox-test" 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: '#000000'
      }}
    >
      <div 
        ref={containerRef} 
        className="mapbox-container"
        style={{ width: '100%', height: '100%' }} 
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
      
      {/* Enhanced iOS-style controls */}
      {mapLoaded && (
        <div style={{ 
          position: 'absolute', 
          top: 'var(--ios-spacing-md)', 
          right: 'var(--ios-spacing-md)', 
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 'var(--ios-border-radius-xl)',
          padding: 'var(--ios-spacing-lg)',
          boxShadow: 'var(--ios-shadow-medium)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ios-spacing-sm)',
          minWidth: '200px'
        }}>
          <h4 className="ios-body" style={{ 
            margin: 0, 
            marginBottom: 'var(--ios-spacing-sm)', 
            fontWeight: '700',
            color: '#FFFFFF',
            fontSize: '16px',
            letterSpacing: '-0.022em'
          }}>Map Controls</h4>
          
          <div style={{ 
            marginBottom: 'var(--ios-spacing-sm)', 
            padding: 'var(--ios-spacing-xs)', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 'var(--ios-border-radius-medium)',
            fontSize: '11px',
            color: '#CCCCCC'
          }}>
            Click checkboxes to toggle features
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: 'var(--ios-blue)', 
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
            </div>
            <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF' }}>
              3D Terrain ✅ Always On
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <input
              type="checkbox"
              className="analytics-checkbox"
              checked={showAnalytics}
              onChange={(e) => {
                setShowAnalytics(e.target.checked);
                console.log('Analytics Panel toggled:', e.target.checked);
              }}
              style={{ width: '16px', height: '16px' }}
            />
            <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF' }}>
              Analytics Panel {showAnalytics ? '✅' : '❌'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <input
              type="checkbox"
              checked={showHazards}
              onChange={(e) => {
                setShowHazards(e.target.checked);
                console.log('Hazards toggled:', e.target.checked);
              }}
              style={{ width: '16px', height: '16px' }}
            />
            <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF' }}>
              Hazards {showHazards ? '✅' : '❌'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: 'var(--ios-green)', 
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
            </div>
            <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF' }}>
              3D Buildings ✅ Always On
            </span>
          </div>
        </div>
      )}
      
      {/* Analytics Panel */}
      {mapLoaded && showAnalytics && (
        <div 
          className="analytics-panel"
          style={{ 
          position: 'absolute', 
          bottom: 'var(--ios-spacing-md)', 
          left: 'var(--ios-spacing-md)', 
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 'var(--ios-border-radius-xl)',
          padding: 'var(--ios-spacing-lg)',
          boxShadow: 'var(--ios-shadow-medium)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ios-spacing-sm)',
          minWidth: '250px'
        }}>
          <h4 className="ios-body" style={{ 
            margin: 0, 
            marginBottom: 'var(--ios-spacing-sm)', 
            fontWeight: '700',
            color: '#FFFFFF',
            fontSize: '16px',
            letterSpacing: '-0.022em'
          }}>Analytics</h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="ios-caption" style={{ margin: 0, color: '#CCCCCC' }}>Hazards:</span>
            <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF', fontWeight: '600' }}>
              {showHazards ? (hazardsAdded ? '3 Active' : 'Loading...') : 'Disabled'}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="ios-caption" style={{ margin: 0, color: '#CCCCCC' }}>Routes:</span>
            <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF', fontWeight: '600' }}>
              {showRoutes ? (escapeRouteAdded ? '1 Available' : 'Loading...') : 'Disabled'}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="ios-caption" style={{ margin: 0, color: '#CCCCCC' }}>Buildings:</span>
            <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF', fontWeight: '600' }}>
              {buildingsAdded ? '25+ Visible' : 'Loading...'} ✅ Always On
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="ios-caption" style={{ margin: 0, color: '#CCCCCC' }}>Terrain:</span>
            <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF', fontWeight: '600' }}>
              {terrainAdded ? '3D Enabled' : 'Loading...'} ✅ Always On
            </span>
          </div>
          
          {/* Summary Section */}
          <div style={{ 
            marginTop: 'var(--ios-spacing-sm)', 
            paddingTop: 'var(--ios-spacing-sm)',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="ios-caption" style={{ margin: 0, color: '#CCCCCC' }}>Active Features:</span>
              <span className="ios-caption" style={{ margin: 0, color: '#FFFFFF', fontWeight: '600' }}>
                {[showHazards, showRoutes].filter(Boolean).length + 2}/4 (3D Terrain & Buildings Always On)
              </span>
            </div>
            <div style={{ 
              marginTop: 'var(--ios-spacing-xs)',
              fontSize: '10px',
              color: '#CCCCCC',
              fontStyle: 'italic'
            }}>
              {showAnalytics ? 'Analytics enabled' : 'Analytics disabled'}
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced iOS-style status indicator */}
      {mapLoaded && (
        <div style={{ 
          position: 'absolute', 
          top: 'var(--ios-spacing-md)', 
          left: 'var(--ios-spacing-md)', 
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 'var(--ios-border-radius-xl)',
          padding: 'var(--ios-spacing-lg)',
          boxShadow: 'var(--ios-shadow-medium)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ios-spacing-sm)',
          minWidth: '220px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: terrainAdded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: terrainAdded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {terrainAdded ? '3D Terrain Loaded' : 'Loading 3D Terrain...'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: buildingsAdded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: buildingsAdded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {buildingsAdded ? '3D Buildings Loaded' : 'Loading 3D Buildings...'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: escapeRouteAdded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: escapeRouteAdded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {escapeRouteAdded ? 'Escape Routes Loaded' : 'Loading Escape Routes...'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-sm)' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: hazardsAdded ? 'var(--ios-green)' : 'var(--ios-orange)', 
              borderRadius: '50%',
              boxShadow: hazardsAdded ? '0 0 8px var(--ios-green)' : '0 0 8px var(--ios-orange)'
            }}></div>
            <span className="ios-caption" style={{ 
              margin: 0, 
              fontWeight: '600',
              color: '#FFFFFF',
              fontSize: '13px',
              letterSpacing: '-0.022em'
            }}>
              {hazardsAdded ? 'Hazards Loaded' : 'Loading Hazards...'}
            </span>
          </div>
          
          {/* Hazard Legend */}
          {hazardsAdded && (
            <div style={{ 
              marginTop: 'var(--ios-spacing-sm)', 
              paddingTop: 'var(--ios-spacing-sm)', 
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ios-spacing-xs)'
            }}>
              <span className="ios-caption" style={{ 
                margin: 0, 
                fontWeight: '600', 
                color: '#FFFFFF',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Hazard Legend
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#FF3B30', 
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}></div>
                <span className="ios-caption" style={{ margin: 0, fontSize: '10px', color: '#FFFFFF' }}>High Risk</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#FF9500', 
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}></div>
                <span className="ios-caption" style={{ margin: 0, fontSize: '10px', color: '#FFFFFF' }}>Medium Risk</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#FFCC00', 
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}></div>
                <span className="ios-caption" style={{ margin: 0, fontSize: '10px', color: '#FFFFFF' }}>Low Risk</span>
              </div>
            </div>
          )}
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
          padding: 'var(--ios-spacing-md)',
          borderRadius: 'var(--ios-border-radius-large)',
          fontSize: '13px',
          fontWeight: '500',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          zIndex: 2000,
          pointerEvents: 'none',
          maxWidth: '300px',
          minWidth: '200px',
          boxShadow: 'var(--ios-shadow-large)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          lineHeight: '1.4',
          letterSpacing: '-0.022em',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}>
          {tooltip.content}
          <div style={{
            position: 'absolute',
            left: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid rgba(0, 0, 0, 0.95)'
          }}></div>
        </div>
      )}
      
      {/* Enhanced iOS-style map controls info */}
      <div style={{ 
        position: 'absolute', 
        bottom: 'var(--ios-spacing-md)', 
        right: 'var(--ios-spacing-md)', 
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: 'var(--ios-border-radius-xl)',
        padding: 'var(--ios-spacing-lg)',
        boxShadow: 'var(--ios-shadow-medium)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1000,
        maxWidth: '320px',
        minWidth: '280px'
      }}>
        <h4 className="ios-body" style={{ 
          margin: 0, 
          marginBottom: 'var(--ios-spacing-sm)', 
          fontWeight: '700',
          color: '#FFFFFF',
          fontSize: '16px',
          letterSpacing: '-0.022em'
        }}>3D Map Controls</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Drag to rotate</p>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Scroll to zoom</p>
          <p className="ios-caption" style={{ 
            margin: 0, 
            color: '#CCCCCC',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>• Right-click to tilt</p>
        </div>
        <div style={{ 
          marginTop: 'var(--ios-spacing-sm)', 
          paddingTop: 'var(--ios-spacing-sm)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p className="ios-caption" style={{ 
            margin: 0, 
            marginBottom: 'var(--ios-spacing-xs)',
            fontWeight: '600',
            color: '#FFFFFF',
            fontSize: '12px',
            letterSpacing: '-0.022em'
          }}>
            Features:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• 3D Terrain with elevation</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• 3D Buildings on terrain</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Emergency escape routes</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Hover for tooltips</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Click routes for details</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Zoom to 15+ for buildings</p>
            <p className="ios-caption" style={{ 
              margin: 0, 
              color: '#CCCCCC',
              fontSize: '12px',
              letterSpacing: '-0.022em'
            }}>• Hazards on map</p>
          </div>
        </div>
      </div>
    </div>
  );
};
