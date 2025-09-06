/**
 * Comprehensive Mapbox GL JS mocks for offline testing
 * Provides deterministic responses for all Mapbox services
 */

import { vi } from 'vitest';

// Mock Mapbox GL JS classes and methods
export const mockMapboxGL = {
  Map: vi.fn().mockImplementation((options) => ({
    // Map instance methods
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    getSource: vi.fn(),
    getLayer: vi.fn(),
    setTerrain: vi.fn(),
    getTerrain: vi.fn(),
    addImage: vi.fn(),
    removeImage: vi.fn(),
    loadImage: vi.fn(),
    hasImage: vi.fn(),
    addControl: vi.fn(),
    removeControl: vi.fn(),
    getControl: vi.fn(),
    hasControl: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    fire: vi.fn(),
    queryRenderedFeatures: vi.fn(),
    querySourceFeatures: vi.fn(),
    setStyle: vi.fn(),
    getStyle: vi.fn(),
    isStyleLoaded: vi.fn().mockReturnValue(true),
    isSourceLoaded: vi.fn().mockReturnValue(true),
    areTilesLoaded: vi.fn().mockReturnValue(true),
    setCenter: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lng: -122.4194, lat: 37.7749 }),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(10),
    setBearing: vi.fn(),
    getBearing: vi.fn().mockReturnValue(0),
    setPitch: vi.fn(),
    getPitch: vi.fn().mockReturnValue(0),
    setPadding: vi.fn(),
    getPadding: vi.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 }),
    fitBounds: vi.fn(),
    fitScreenCoordinates: vi.fn(),
    jumpTo: vi.fn(),
    easeTo: vi.fn(),
    flyTo: vi.fn(),
    panTo: vi.fn(),
    panBy: vi.fn(),
    rotateTo: vi.fn(),
    resetNorth: vi.fn(),
    snapToNorth: vi.fn(),
    getBounds: vi.fn().mockReturnValue({
      getNorth: () => 37.8,
      getSouth: () => 37.7,
      getEast: () => -122.4,
      getWest: () => -122.5
    }),
    project: vi.fn().mockReturnValue({ x: 100, y: 100 }),
    unproject: vi.fn().mockReturnValue({ lng: -122.4194, lat: 37.7749 }),
    getContainer: vi.fn().mockReturnValue(document.createElement('div')),
    getCanvasContainer: vi.fn().mockReturnValue(document.createElement('div')),
    getCanvas: vi.fn().mockReturnValue(document.createElement('canvas')),
    resize: vi.fn(),
    remove: vi.fn(),
    // Map state
    loaded: vi.fn().mockReturnValue(true),
    isMoving: vi.fn().mockReturnValue(false),
    isZooming: vi.fn().mockReturnValue(false),
    isRotating: vi.fn().mockReturnValue(false),
    isPitching: vi.fn().mockReturnValue(false),
    isDragging: vi.fn().mockReturnValue(false),
    // Event handling
    _listeners: {},
    _emitter: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    }
  })),
  
  // Static methods
  accessToken: 'pk.test-token',
  setRTLTextPlugin: vi.fn(),
  supported: vi.fn().mockReturnValue({
    webGL: true,
    webGL2: true
  }),
  getRTLTextPluginStatus: vi.fn().mockReturnValue('loaded'),
  
  // Constants
  version: '2.15.0',
  
  // Control classes
  NavigationControl: vi.fn().mockImplementation(() => ({
    onAdd: vi.fn().mockReturnValue(document.createElement('div')),
    onRemove: vi.fn()
  })),
  
  GeolocateControl: vi.fn().mockImplementation(() => ({
    onAdd: vi.fn().mockReturnValue(document.createElement('div')),
    onRemove: vi.fn(),
    trigger: vi.fn()
  })),
  
  ScaleControl: vi.fn().mockImplementation(() => ({
    onAdd: vi.fn().mockReturnValue(document.createElement('div')),
    onRemove: vi.fn()
  })),
  
  FullscreenControl: vi.fn().mockImplementation(() => ({
    onAdd: vi.fn().mockReturnValue(document.createElement('div')),
    onRemove: vi.fn()
  })),
  
  AttributionControl: vi.fn().mockImplementation(() => ({
    onAdd: vi.fn().mockReturnValue(document.createElement('div')),
    onRemove: vi.fn()
  }))
};

// Mock Mapbox Directions API
export const mockDirectionsAPI = {
  getDirections: vi.fn().mockImplementation(async (config) => {
    // Return deterministic route based on coordinates
    const { coordinates } = config;
    const distance = calculateDistance(coordinates[0], coordinates[1]);
    
    return {
      routes: [{
        geometry: {
          coordinates: coordinates,
          type: 'LineString'
        },
        legs: [{
          distance: distance,
          duration: distance * 0.5, // Assume 2 m/s walking speed
          steps: generateSteps(coordinates[0], coordinates[1])
        }],
        distance: distance,
        duration: distance * 0.5,
        weight: distance,
        weight_name: 'routability'
      }],
      waypoints: coordinates.map((coord: any) => ({
        name: '',
        location: coord
      })),
      code: 'Ok',
      uuid: 'test-route-uuid'
    };
  })
};

// Mock Mapbox Geocoding API
export const mockGeocodingAPI = {
  forwardGeocode: vi.fn().mockImplementation(async (config) => {
    const { query } = config;
    
    // Return deterministic results based on query
    if (query.includes('San Francisco')) {
      return {
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          },
          properties: {
            name: 'San Francisco, CA, United States',
            place_name: 'San Francisco, CA, United States',
            text: 'San Francisco',
            place_type: ['place'],
            bbox: [-122.515, 37.704, -122.348, 37.832]
          }
        }]
      };
    }
    
    return { features: [] };
  }),
  
  reverseGeocode: vi.fn().mockImplementation(async (config) => {
    const { lng, lat } = config;
    
    return {
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          name: `Location at ${lat}, ${lng}`,
          place_name: `Location at ${lat}, ${lng}`,
          text: 'Test Location',
          place_type: ['place']
        }
      }]
    };
  })
};

// Mock Mapbox Matrix API
export const mockMatrixAPI = {
  getMatrix: vi.fn().mockImplementation(async (config) => {
    const { coordinates } = config;
    const size = coordinates.length;
    
    // Generate deterministic distance matrix
    const distances = [];
    const durations = [];
    
    for (let i = 0; i < size; i++) {
      const rowDistances = [];
      const rowDurations = [];
      
      for (let j = 0; j < size; j++) {
        if (i === j) {
          rowDistances.push(0);
          rowDurations.push(0);
        } else {
          const distance = calculateDistance(coordinates[i], coordinates[j]);
          rowDistances.push(distance);
          rowDurations.push(distance * 0.5); // 2 m/s walking speed
        }
      }
      
      distances.push(rowDistances);
      durations.push(rowDurations);
    }
    
    return {
      distances,
      durations,
      code: 'Ok'
    };
  })
};

// Helper functions
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateSteps(start: [number, number], end: [number, number]) {
  const steps = [];
  const numSteps = 5;
  
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const lng = start[0] + (end[0] - start[0]) * t;
    const lat = start[1] + (end[1] - start[1]) * t;
    
    steps.push({
      geometry: {
        coordinates: [[lng, lat]],
        type: 'LineString'
      },
      maneuver: {
        location: [lng, lat],
        bearing_after: i === numSteps ? 0 : 45,
        bearing_before: i === 0 ? 0 : 45,
        instruction: i === 0 ? 'Start' : i === numSteps ? 'Arrive' : 'Continue'
      },
      distance: calculateDistance(start, end) / numSteps,
      duration: (calculateDistance(start, end) * 0.5) / numSteps,
      name: `Step ${i + 1}`
    });
  }
  
  return steps;
}

// Export default mock
export default mockMapboxGL;

