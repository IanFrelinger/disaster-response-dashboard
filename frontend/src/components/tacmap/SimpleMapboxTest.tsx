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
        
        // Wind arrow icon for weather overlay
        const windArrowSvg = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#00AAFF"/>
            <path d="M12 4L12 20M8 8L12 4L16 8" stroke="#00AAFF" stroke-width="2" fill="none"/>
          </svg>
        `;
        const windArrowDataUrl = 'data:image/svg+xml;base64,' + btoa(windArrowSvg);
        map.loadImage(windArrowDataUrl, (error, image) => {
          if (!error && image) map.addImage('wind-arrow', image);
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
              'text-color': '#FFFFFF',
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

      // Add EMS response route layers
      map.addLayer({
        'id': 'ems-response-primary',
        'type': 'line',
        'source': 'escape-routes',
        'filter': ['==', 'routeType', 'ems_response'],
        'paint': {
          'line-color': '#007AFF', // iOS blue for EMS routes
          'line-width': 5,
          'line-opacity': 0.8,
          'line-dasharray': [3, 3] // Dotted line for EMS routes
        }
      });

      // Add EMS evacuation support route layer
      map.addLayer({
        'id': 'ems-evacuation-support',
        'type': 'line',
        'source': 'escape-routes',
        'filter': ['==', 'routeType', 'ems_evacuation_support'],
        'paint': {
          'line-color': '#34C759', // iOS green for support routes
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
          'circle-color': '#FF3B30',
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
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['escape-route-primary', 'escape-route-secondary', 'ems-response-primary', 'ems-evacuation-support']
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

      // EMS Response Route Interactions
      map.on('mouseenter', 'ems-response-primary', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty('ems-response-primary', 'line-width', 7);
        map.setPaintProperty('ems-response-primary', 'line-opacity', 1.0);
        map.setPaintProperty('ems-response-primary', 'line-color', '#4A90E2');
        
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
        map.setPaintProperty('ems-response-primary', 'line-color', '#007AFF');
        setTooltip(prev => ({ ...prev, visible: false }));
      });

      // EMS Evacuation Support Route Interactions
      map.on('mouseenter', 'ems-evacuation-support', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty('ems-evacuation-support', 'line-width', 6);
        map.setPaintProperty('ems-evacuation-support', 'line-opacity', 0.9);
        map.setPaintProperty('ems-evacuation-support', 'line-color', '#5AC18E');
        
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
        map.setPaintProperty('ems-evacuation-support', 'line-color', '#34C759');
        setTooltip(prev => ({ ...prev, visible: false }));
      });

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

      // Add wind vector layer
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
            0, 0.5,   // 0 mph = 0.5x size
            50, 2.0   // 50+ mph = 2.0x size
          ],
          'icon-rotate': ['get', 'windDirection'],
          'icon-allow-overlap': false,
          'icon-ignore-placement': false
        },
        'paint': {
          'icon-opacity': 0.8
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
    // Create a grid of wind vectors across the map area
    const vectors: GeoJSON.Feature[] = [];
    const bounds = [-122.5, 37.7, -122.4, 37.8]; // San Francisco area
    const gridSize = 0.01; // Grid spacing
    
    for (let lng = bounds[0]; lng <= bounds[2]; lng += gridSize) {
      for (let lat = bounds[1]; lat <= bounds[3]; lat += gridSize) {
        // Add some variation to wind direction and speed based on location
        const windVariation = Math.sin(lng * 100) * Math.cos(lat * 100) * 0.1;
        const adjustedDirection = weather.current.windDirection + (windVariation * 180);
        const adjustedSpeed = weather.current.windSpeed + (windVariation * 5);
        
        vectors.push({
          type: 'Feature',
          properties: {
            windSpeed: Math.max(0, adjustedSpeed),
            windDirection: adjustedDirection % 360,
            windGusts: weather.current.windGusts
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
    legend.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: #1D1D1F;
      padding: 20px;
      border-radius: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      font-size: 13px;
      z-index: 1000;
      min-width: 300px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.8);
    `;

    legend.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #007AFF; font-size: 17px; border-bottom: 1px solid rgba(0, 122, 255, 0.2); padding-bottom: 8px; font-weight: 600;">
        🌤️ Weather Operations
      </h4>
      
      <!-- Current Conditions -->
      <div style="margin-bottom: 15px; padding: 12px; background: rgba(0, 122, 255, 0.05); border-radius: 12px; border: 1px solid rgba(0, 122, 255, 0.1);">
        <h5 style="margin: 0 0 8px 0; color: #007AFF; font-size: 15px; font-weight: 600;">📊 Current Conditions</h5>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
          <div><span style="color: #007AFF; font-weight: 500;">🌡️ Temp:</span> ${weatherData?.current.temp}°F</div>
          <div><span style="color: #007AFF; font-weight: 500;">💧 Humidity:</span> ${weatherData?.current.humidity}%</div>
          <div><span style="color: #007AFF; font-weight: 500;">💨 Wind:</span> ${weatherData?.current.windSpeed} mph</div>
          <div><span style="color: #007AFF; font-weight: 500;">🧭 Direction:</span> ${getWindDirection(weatherData?.current.windDirection || 0)}</div>
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
    const colors = {
      low: '#00FF00',
      moderate: '#FFFF00', 
      high: '#FF6600',
      extreme: '#FF0000',
      catastrophic: '#800080'
    };
    return colors[risk as keyof typeof colors] || '#00FF00';
  };

  const getEvacuationRiskColor = (weather: any): string => {
    if (weather.humidity < 20 || weather.windSpeed > 25 || weather.temp > 90) return '#FF0000';
    if (weather.humidity < 30 || weather.windSpeed > 20 || weather.temp > 85) return '#FF6600';
    return '#00FF00';
  };

  const getEvacuationRisk = (weather: any): string => {
    if (weather.humidity < 20 || weather.windSpeed > 25 || weather.temp > 90) return 'CRITICAL';
    if (weather.humidity < 30 || weather.windSpeed > 20 || weather.temp > 85) return 'HIGH';
    return 'LOW';
  };

  const getAirOpsRiskColor = (weather: any): string => {
    if (weather.windSpeed > 30 || weather.visibility < 3) return '#FF0000';
    if (weather.windSpeed > 20 || weather.visibility < 5) return '#FF6600';
    return '#00FF00';
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
      
      {/* Map is now full-screen without control panel */}
      
      {/* Apple Maps-style Analytics Panel - Repositioned to bottom-left with standard iOS colors */}
      {mapLoaded && showAnalytics && (
        <div 
          className="analytics-panel"
          style={{ 
          position: 'absolute', 
          bottom: 'var(--ios-spacing-md)', 
          left: 'var(--ios-spacing-md)', 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '280px',
          maxWidth: '320px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>
          <h4 style={{ 
            margin: 0, 
            marginBottom: '12px', 
            fontWeight: '600',
            color: '#1D1D1F',
            fontSize: '17px',
            letterSpacing: '-0.022em'
          }}>Map Analytics</h4>
          
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
              {showAnalytics ? 'Analytics enabled' : 'Analytics disabled'}
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced iOS-style status indicator - Repositioned to top-right */}
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
          
          {/* Hazard Legend with Standard iOS Colors */}
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
                  backgroundColor: 'var(--ios-red)', 
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}></div>
                <span className="ios-caption" style={{ margin: 0, fontSize: '10px', color: '#FFFFFF' }}>High Risk</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: 'var(--ios-orange)', 
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}></div>
                <span className="ios-caption" style={{ margin: 0, fontSize: '10px', color: '#FFFFFF' }}>Medium Risk</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: 'var(--ios-yellow)', 
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
      
      {/* Map Controls Info - Simplified and Repositioned to bottom-right */}
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
        maxWidth: '280px',
        minWidth: '240px'
      }}>
        <h4 className="ios-body" style={{ 
          margin: 0, 
          marginBottom: 'var(--ios-spacing-sm)', 
          fontWeight: '700',
          color: '#FFFFFF',
          fontSize: '16px',
          letterSpacing: '-0.022em'
        }}>Map Controls</h4>
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
