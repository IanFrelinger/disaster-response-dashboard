import { OperationalRoute, EmergencyUnit, StagingArea } from '../types/emergency-response';

// Mock operational routes data
export const mockRoutes: OperationalRoute[] = [
  {
    id: 'route-001',
    profile: 'CIVILIAN_EVACUATION',
    startPoint: [-122.4194, 37.7749],
    endPoint: [-122.4000, 37.7800],
    waypoints: [
      [-122.4100, 37.7750],
      [-122.4050, 37.7775]
    ],
    status: 'active',
    capacity: 500,
    currentUsage: 320,
    estimatedTime: 25,
    actualTime: 22,
    hazards: ['hazard-001', 'hazard-002'],
    deconflicted: true,
    assignedUnits: ['unit-001', 'unit-002'],
    stagingAreas: []
  },
  {
    id: 'route-002',
    profile: 'EMS_RESPONSE',
    startPoint: [-122.4194, 37.7749],
    endPoint: [-122.4200, 37.7850],
    waypoints: [
      [-122.4190, 37.7800]
    ],
    status: 'planned',
    capacity: 200,
    currentUsage: 0,
    estimatedTime: 15,
    hazards: ['hazard-003'],
    deconflicted: false,
    assignedUnits: [],
    stagingAreas: []
  },
  {
    id: 'route-003',
    profile: 'FIRE_TACTICAL',
    startPoint: [-122.4194, 37.7749],
    endPoint: [-122.4150, 37.7700],
    waypoints: [
      [-122.4170, 37.7720]
    ],
    status: 'active',
    capacity: 100,
    currentUsage: 75,
    estimatedTime: 12,
    actualTime: 10,
    hazards: [],
    deconflicted: true,
    assignedUnits: ['unit-003', 'unit-004'],
    stagingAreas: []
  },
  {
    id: 'route-004',
    profile: 'POLICE_ESCORT',
    startPoint: [-122.4194, 37.7749],
    endPoint: [-122.4250, 37.7800],
    waypoints: [
      [-122.4220, 37.7780]
    ],
    status: 'planned',
    capacity: 150,
    currentUsage: 0,
    estimatedTime: 18,
    hazards: ['hazard-004'],
    deconflicted: false,
    assignedUnits: [],
    stagingAreas: []
  }
];

// Mock emergency units data
export const mockUnits: EmergencyUnit[] = [
  {
    id: 'unit-001',
    type: 'fire_engine',
    status: 'responding',
    location: [-122.4100, 37.7750],
    destination: [-122.4000, 37.7800],
    personnel: 4,
    fuel: 85,
    equipment: ['Ladder', 'Hose', 'Pump', 'Rescue Tools'],
    assignedIncident: 'incident-001',
    assignedRoute: 'route-001',
    capabilities: ['Fire Suppression', 'Rescue', 'Water Supply'],
    lastLocationUpdate: new Date(),
    estimatedArrival: new Date(Date.now() + 15 * 60 * 1000),
    callSign: 'Engine 1',
    currentTask: 'Responding to evacuation route',
    unitHeight: 12
  },
  {
    id: 'unit-002',
    type: 'ambulance',
    status: 'on_scene',
    location: [-122.4050, 37.7775],
    destination: [-122.4050, 37.7775],
    personnel: 2,
    fuel: 70,
    equipment: ['Defibrillator', 'Oxygen', 'Medical Supplies', 'Stretcher'],
    assignedIncident: 'incident-001',
    assignedRoute: 'route-001',
    capabilities: ['Medical Transport', 'Emergency Care', 'Patient Monitoring'],
    lastLocationUpdate: new Date(),
    estimatedArrival: new Date(),
    callSign: 'Medic 1',
    currentTask: 'Providing medical support',
    unitHeight: 8
  },
  {
    id: 'unit-003',
    type: 'fire_engine',
    status: 'on_scene',
    location: [-122.4150, 37.7700],
    destination: [-122.4150, 37.7700],
    personnel: 4,
    fuel: 95,
    equipment: ['Ladder', 'Hose', 'Pump', 'Rescue Tools'],
    assignedIncident: 'incident-002',
    assignedRoute: 'route-003',
    capabilities: ['Fire Suppression', 'Rescue', 'Water Supply'],
    lastLocationUpdate: new Date(),
    estimatedArrival: new Date(),
    callSign: 'Engine 3',
    currentTask: 'Fire suppression operations',
    unitHeight: 12
  },
  {
    id: 'unit-004',
    type: 'command_vehicle',
    status: 'deployed',
    location: [-122.4194, 37.7749],
    destination: [-122.4194, 37.7749],
    personnel: 6,
    fuel: 80,
    equipment: ['Radio System', 'Computer Workstations', 'Display Screens', 'Communication Hub'],
    assignedIncident: 'incident-002',
    assignedRoute: 'route-003',
    capabilities: ['Command Post', 'Communications', 'Coordination'],
    lastLocationUpdate: new Date(),
    estimatedArrival: new Date(),
    callSign: 'Command 1',
    currentTask: 'Incident command operations',
    unitHeight: 10
  },
  {
    id: 'unit-005',
    type: 'police_car',
    status: 'available',
    location: [-122.4194, 37.7749],
    destination: undefined,
    personnel: 2,
    fuel: 90,
    equipment: ['Radio', 'Emergency Lights', 'Traffic Cones', 'Barriers'],
    assignedIncident: undefined,
    assignedRoute: undefined,
    capabilities: ['Traffic Control', 'Security', 'Escort'],
    lastLocationUpdate: new Date(),
    estimatedArrival: undefined,
    callSign: 'Unit 5',
    currentTask: 'Standby for assignment',
    unitHeight: 6
  },
  {
    id: 'unit-006',
    type: 'rescue_truck',
    status: 'out_of_service',
    location: [-122.4194, 37.7749],
    destination: undefined,
    personnel: 3,
    fuel: 60,
    equipment: ['Generators', 'Tools', 'Spare Parts', 'Fuel Cans'],
    assignedIncident: undefined,
    assignedRoute: undefined,
    capabilities: ['Equipment Transport', 'Support', 'Logistics'],
    lastLocationUpdate: new Date(),
    estimatedArrival: undefined,
    callSign: 'Utility 6',
    currentTask: 'Under maintenance',
    unitHeight: 14
  }
];

// Mock staging areas data
export const mockStagingAreas: StagingArea[] = [
  {
    id: 'staging-001',
    location: [-122.4194, 37.7749],
    capacity: 20,
    currentUnits: 8,
    type: 'command',
    accessRoutes: ['route-001', 'route-002'],
    facilities: ['Communications', 'Medical', 'Rest Area', 'Fuel Station']
  },
  {
    id: 'staging-002',
    location: [-122.4200, 37.7850],
    capacity: 15,
    currentUnits: 5,
    type: 'medical',
    accessRoutes: ['route-002'],
    facilities: ['Medical Tents', 'Triage Area', 'Ambulance Bay', 'Helipad']
  },
  {
    id: 'staging-003',
    location: [-122.4150, 37.7700],
    capacity: 25,
    currentUnits: 12,
    type: 'staging',
    accessRoutes: ['route-003'],
    facilities: ['Water Supply', 'Equipment Cache', 'Rest Area', 'Command Post']
  },
  {
    id: 'staging-004',
    location: [-122.4250, 37.7800],
    capacity: 10,
    currentUnits: 3,
    type: 'staging',
    accessRoutes: ['route-004'],
    facilities: ['Checkpoint', 'Barriers', 'Communication Hub', 'Rest Area']
  }
];

// Mock hazard data for route planning
export const mockHazards = [
  {
    id: 'hazard-001',
    type: 'fire',
    location: [-122.4100, 37.7750],
    severity: 'high',
    radius: 500,
    description: 'Active fire with heavy smoke'
  },
  {
    id: 'hazard-002',
    type: 'structural',
    location: [-122.4050, 37.7775],
    severity: 'medium',
    radius: 200,
    description: 'Unstable building structure'
  },
  {
    id: 'hazard-003',
    type: 'chemical',
    location: [-122.4200, 37.7850],
    severity: 'high',
    radius: 300,
    description: 'Chemical spill requiring hazmat response'
  },
  {
    id: 'hazard-004',
    type: 'traffic',
    location: [-122.4250, 37.7800],
    severity: 'medium',
    radius: 150,
    description: 'Major traffic accident blocking roadway'
  }
];

// Mock weather data for route planning
export const mockWeatherData = {
  temperature: 75,
  humidity: 45,
  windSpeed: 15,
  windDirection: 270,
  visibility: 10,
  precipitation: 0,
  fireRisk: 'moderate',
  evacuationRisk: 'low',
  airOpsRisk: 'clear'
};

// Mock population data for route planning
export const mockPopulationData = {
  totalPopulation: 15000,
  evacuationProgress: 65,
  specialNeeds: 450,
  vehicles: 3200,
  pets: 1800
};

// Mock traffic data for route planning
export const mockTrafficData = {
  congestionLevel: 'moderate',
  averageSpeed: 25,
  blockedRoads: ['Highway 30', 'Main Street Bridge'],
  alternativeRoutes: ['Bypass Road', 'Emergency Access'],
  estimatedDelay: 15
};
