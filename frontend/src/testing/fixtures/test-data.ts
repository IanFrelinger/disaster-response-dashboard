/**
 * Test Fixtures and Data
 * 
 * Provides deterministic test data for map testing scenarios.
 */

export interface TestHazardZone {
  id: string;
  name: string;
  type: 'fire' | 'flood' | 'earthquake' | 'chemical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number][][];
  radius: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestEmergencyUnit {
  id: string;
  name: string;
  type: 'fire_truck' | 'ambulance' | 'police_car' | 'helicopter';
  status: 'available' | 'busy' | 'offline';
  location: [number, number];
  capacity: number;
  equipment: string[];
  lastUpdate: string;
}

export interface TestEvacuationRoute {
  id: string;
  name: string;
  waypoints: [number, number][];
  status: 'active' | 'blocked' | 'maintenance';
  capacity: number;
  estimatedTime: number;
  safetyScore: number;
  lastUpdate: string;
}

// Test viewport configurations
export const TEST_VIEWPORTS = {
  dcDowntown: {
    center: [-77.0369, 38.9072] as [number, number],
    zoom: 15,
    pitch: 45,
    bearing: 0
  },
  sanFrancisco: {
    center: [-122.4194, 37.7749] as [number, number],
    zoom: 12,
    pitch: 30,
    bearing: 0
  },
  newYork: {
    center: [-74.0060, 40.7128] as [number, number],
    zoom: 13,
    pitch: 60,
    bearing: 0
  },
  losAngeles: {
    center: [-118.2437, 34.0522] as [number, number],
    zoom: 11,
    pitch: 0,
    bearing: 0
  }
};

// Test hazard data - deterministic for consistent testing
export const TEST_HAZARDS: TestHazardZone[] = [
  {
    id: 'hazard-001',
    name: 'Test Fire Zone',
    type: 'fire',
    severity: 'high',
    coordinates: [[
      [-122.4194, 37.7749],
      [-122.4190, 37.7749],
      [-122.4190, 37.7753],
      [-122.4194, 37.7753],
      [-122.4194, 37.7749]
    ] as [number, number][]],
    radius: 100,
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hazard-002',
    name: 'Test Flood Zone',
    type: 'flood',
    severity: 'medium',
    coordinates: [[
      [-122.4200, 37.7750],
      [-122.4195, 37.7750],
      [-122.4195, 37.7755],
      [-122.4200, 37.7755],
      [-122.4200, 37.7750]
    ] as [number, number][]],
    radius: 150,
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hazard-003',
    name: 'Test Chemical Zone',
    type: 'chemical',
    severity: 'critical',
    coordinates: [[
      [-122.4185, 37.7745],
      [-122.4180, 37.7745],
      [-122.4180, 37.7750],
      [-122.4185, 37.7750],
      [-122.4185, 37.7745]
    ] as [number, number][]],
    radius: 200,
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Test emergency units - deterministic for consistent testing
export const TEST_EMERGENCY_UNITS: TestEmergencyUnit[] = [
  {
    id: 'unit-001',
    name: 'Fire Truck Alpha',
    type: 'fire_truck',
    status: 'available',
    location: [-122.4192, 37.7751],
    capacity: 6,
    equipment: ['water_tank', 'ladder', 'hose'],
    lastUpdate: '2024-01-01T00:00:00Z'
  },
  {
    id: 'unit-002',
    name: 'Ambulance Beta',
    type: 'ambulance',
    status: 'busy',
    location: [-122.4198, 37.7752],
    capacity: 2,
    equipment: ['stretcher', 'defibrillator', 'oxygen'],
    lastUpdate: '2024-01-01T00:00:00Z'
  },
  {
    id: 'unit-003',
    name: 'Police Car Gamma',
    type: 'police_car',
    status: 'available',
    location: [-122.4190, 37.7748],
    capacity: 4,
    equipment: ['radio', 'first_aid', 'traffic_cone'],
    lastUpdate: '2024-01-01T00:00:00Z'
  },
  {
    id: 'unit-004',
    name: 'Helicopter Delta',
    type: 'helicopter',
    status: 'available',
    location: [-122.4195, 37.7755],
    capacity: 8,
    equipment: ['rescue_hoist', 'medical_supplies', 'camera'],
    lastUpdate: '2024-01-01T00:00:00Z'
  }
];

// Test evacuation routes - deterministic for consistent testing
export const TEST_EVACUATION_ROUTES: TestEvacuationRoute[] = [
  {
    id: 'route-001',
    name: 'Primary Evacuation Route',
    waypoints: [
      [-122.4194, 37.7749],
      [-122.4190, 37.7750],
      [-122.4185, 37.7752],
      [-122.4180, 37.7755]
    ] as [number, number][],
    status: 'active',
    capacity: 1000,
    estimatedTime: 15,
    safetyScore: 0.95,
    lastUpdate: '2024-01-01T00:00:00Z'
  },
  {
    id: 'route-002',
    name: 'Secondary Evacuation Route',
    waypoints: [
      [-122.4194, 37.7749],
      [-122.4200, 37.7750],
      [-122.4205, 37.7752],
      [-122.4210, 37.7755]
    ] as [number, number][],
    status: 'active',
    capacity: 800,
    estimatedTime: 20,
    safetyScore: 0.88,
    lastUpdate: '2024-01-01T00:00:00Z'
  },
  {
    id: 'route-003',
    name: 'Emergency Route',
    waypoints: [
      [-122.4194, 37.7749],
      [-122.4192, 37.7745],
      [-122.4190, 37.7740],
      [-122.4188, 37.7735]
    ] as [number, number][],
    status: 'active',
    capacity: 500,
    estimatedTime: 12,
    safetyScore: 0.92,
    lastUpdate: '2024-01-01T00:00:00Z'
  }
];

// Test map styles
export const TEST_MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11'
};

// Test layer configurations
export const TEST_LAYER_CONFIGS = {
  terrain: {
    enabled: true,
    exaggeration: 1.5
  },
  buildings: {
    enabled: true,
    minZoom: 15
  },
  hazards: {
    enabled: true,
    showActiveOnly: true
  },
  units: {
    enabled: true,
    showStatus: true
  },
  routes: {
    enabled: true,
    showSafetyScore: true
  }
};

// Test performance thresholds
export const TEST_PERFORMANCE_THRESHOLDS = {
  mapLoadTime: 3000, // 3 seconds
  tileLoadTime: 5000, // 5 seconds
  layerRenderTime: 100, // 100ms
  layerToggleTime: 200, // 200ms
  viewportChangeTime: 1000, // 1 second
  styleChangeTime: 2000, // 2 seconds
  memoryUsage: 100 * 1024 * 1024, // 100MB
  featureCount: 1000 // Maximum features for performance testing
};

// Test error scenarios
export const TEST_ERROR_SCENARIOS = {
  networkTimeout: {
    delay: 10000, // 10 seconds
    probability: 0.5 // 50% chance
  },
  tileFailure: {
    probability: 0.3 // 30% chance
  },
  invalidToken: {
    token: 'invalid_token_12345'
  },
  malformedData: {
    hazards: { invalid: 'data' },
    units: { invalid: 'data' },
    routes: { invalid: 'data' }
  }
};

// Test viewport bounds for different scenarios
export const TEST_VIEWPORT_BOUNDS = {
  small: {
    north: 37.7750,
    south: 37.7745,
    east: -122.4190,
    west: -122.4200
  },
  medium: {
    north: 37.7760,
    south: 37.7740,
    east: -122.4180,
    west: -122.4210
  },
  large: {
    north: 37.7770,
    south: 37.7730,
    east: -122.4170,
    west: -122.4220
  }
};

// Test data for visual regression testing
export const TEST_VISUAL_DATA = {
  viewports: Object.keys(TEST_VIEWPORTS),
  styles: Object.keys(TEST_MAP_STYLES),
  zoomLevels: [8, 12, 16],
  pitchAngles: [0, 30, 60],
  layerCombinations: [
    { terrain: true, buildings: false, hazards: true, units: false, routes: true },
    { terrain: false, buildings: true, hazards: false, units: true, routes: false },
    { terrain: true, buildings: true, hazards: true, units: true, routes: true }
  ]
};

// Helper function to get test data by scenario
export function getTestData(scenario: 'minimal' | 'standard' | 'large' | 'stress') {
  switch (scenario) {
    case 'minimal':
      return {
        hazards: TEST_HAZARDS.slice(0, 1),
        units: TEST_EMERGENCY_UNITS.slice(0, 1),
        routes: TEST_EVACUATION_ROUTES.slice(0, 1)
      };
    case 'standard':
      return {
        hazards: TEST_HAZARDS,
        units: TEST_EMERGENCY_UNITS,
        routes: TEST_EVACUATION_ROUTES
      };
    case 'large':
      return {
        hazards: [...TEST_HAZARDS, ...TEST_HAZARDS.map(h => ({ ...h, id: h.id + '-copy' }))],
        units: [...TEST_EMERGENCY_UNITS, ...TEST_EMERGENCY_UNITS.map(u => ({ ...u, id: u.id + '-copy' }))],
        routes: [...TEST_EVACUATION_ROUTES, ...TEST_EVACUATION_ROUTES.map(r => ({ ...r, id: r.id + '-copy' }))]
      };
    case 'stress':
      const stressHazards = [];
      const stressUnits = [];
      const stressRoutes = [];
      
      // Generate 50 hazards
      for (let i = 0; i < 50; i++) {
        stressHazards.push({
          ...TEST_HAZARDS[i % TEST_HAZARDS.length],
          id: `stress-hazard-${i}`,
          coordinates: [[
            [-122.4194 + (i * 0.001), 37.7749 + (i * 0.001)],
            [-122.4190 + (i * 0.001), 37.7749 + (i * 0.001)],
            [-122.4190 + (i * 0.001), 37.7753 + (i * 0.001)],
            [-122.4194 + (i * 0.001), 37.7753 + (i * 0.001)],
            [-122.4194 + (i * 0.001), 37.7749 + (i * 0.001)]
          ] as [number, number][]]
        });
      }
      
      // Generate 100 units
      for (let i = 0; i < 100; i++) {
        stressUnits.push({
          ...TEST_EMERGENCY_UNITS[i % TEST_EMERGENCY_UNITS.length],
          id: `stress-unit-${i}`,
          location: [-122.4194 + (i * 0.001), 37.7749 + (i * 0.001)] as [number, number]
        });
      }
      
      // Generate 25 routes
      for (let i = 0; i < 25; i++) {
        stressRoutes.push({
          ...TEST_EVACUATION_ROUTES[i % TEST_EVACUATION_ROUTES.length],
          id: `stress-route-${i}`,
          waypoints: [
            [-122.4194 + (i * 0.001), 37.7749 + (i * 0.001)],
            [-122.4190 + (i * 0.001), 37.7750 + (i * 0.001)],
            [-122.4185 + (i * 0.001), 37.7752 + (i * 0.001)],
            [-122.4180 + (i * 0.001), 37.7755 + (i * 0.001)]
          ] as [number, number][]
        });
      }
      
      return {
        hazards: stressHazards,
        units: stressUnits,
        routes: stressRoutes
      };
    default:
      return {
        hazards: TEST_HAZARDS,
        units: TEST_EMERGENCY_UNITS,
        routes: TEST_EVACUATION_ROUTES
      };
  }
}
