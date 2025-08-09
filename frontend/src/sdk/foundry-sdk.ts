/**
 * Foundry OSDK (Frontend SDK) - Type-Safe UI
 * Auto-generated TypeScript types from Ontology with real-time subscriptions.
 */

import { useEffect, useState, useCallback } from 'react';

// Auto-generated types from Ontology
export interface HazardZone {
  h3CellId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  intensity: number;
  confidence: number;
  affectedPopulation: number;
  buildingsAtRisk: number;
  latestDetection: string;
  windSpeed: number;
  lastUpdated: string;
  evacuationRoutes: EvacuationRoute[];
  assignedResources: EmergencyUnit[];
  evacuationOrders: EvacuationOrder[];
  affectedBuildings: Building[];
  
  // Ontology Actions
  issueEvacuationOrder: (params: {
    orderType: 'mandatory' | 'voluntary' | 'shelter_in_place';
    authorizedBy: string;
  }) => Promise<EvacuationOrder>;
}

export interface EmergencyUnit {
  unitId: string;
  callSign: string;
  unitType: 'fire_engine' | 'ambulance' | 'police' | 'helicopter' | 'command';
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'returning' | 'out_of_service';
  currentLocation: string; // H3 cell
  lastLocationUpdate: string;
  capacity: number;
  equipment: string[];
  currentIncident?: Incident;
  assignedZone?: HazardZone;
  dispatchHistory: DispatchRecord[];
  
  // Ontology Actions
  dispatchToIncident: (params: {
    incidentId: string;
    dispatcher: string;
  }) => Promise<DispatchRecord>;
  
  dispatchToEvacuation: (evacuationOrder: EvacuationOrder) => Promise<void>;
}

export interface EvacuationRoute {
  routeId: string;
  originH3: string;
  destinationH3: string;
  routeGeometry: string; // GeoJSON
  distanceKm: number;
  estimatedTimeMinutes: number;
  capacityPerHour: number;
  status: 'safe' | 'compromised' | 'closed';
  lastUpdated: string;
  hazardZones: HazardZone[];
  routeUsage: RouteUsage[];
  
  updateStatus: () => Promise<void>;
}

export interface EvacuationOrder {
  orderId: string;
  zone: HazardZone;
  orderType: 'mandatory' | 'voluntary' | 'shelter_in_place';
  authorizedBy: string;
  timestamp: string;
  status: 'active' | 'completed' | 'cancelled';
  publicMessage: string;
  affectedPopulation: number;
  notificationsSent: NotificationRecord[];
  complianceMetrics: ComplianceMetric[];
  
  sendNotifications: (channels: string[]) => Promise<void>;
}

export interface Building {
  buildingId: string;
  address: string;
  buildingType: string;
  occupancy: number;
  h3Cell: string;
  evacuationStatus: 'normal' | 'ordered' | 'evacuated';
  lastStatusUpdate: string;
  hazardZone?: HazardZone;
}

export interface Incident {
  incidentId: string;
  incidentType: string;
  locationH3: string;
  reportedAt: string;
  status: 'active' | 'resolved' | 'closed';
  severity: string;
  description: string;
  assignedUnits: EmergencyUnit[];
  updates: IncidentUpdate[];
}

// Supporting types
export interface DispatchRecord {
  recordId: string;
  unit: EmergencyUnit;
  incident: Incident;
  dispatchedBy: string;
  dispatchTime: string;
  status: string;
}

export interface NotificationRecord {
  notificationId: string;
  order: EvacuationOrder;
  channel: string;
  sentAt: string;
  status: string;
}

export interface RouteUsage {
  usageId: string;
  route: EvacuationRoute;
  timestamp: string;
  vehiclesPerHour: number;
  averageSpeed: number;
}

export interface ComplianceMetric {
  metricId: string;
  order: EvacuationOrder;
  timestamp: string;
  complianceRate: number;
  populationEvacuated: number;
}

export interface IncidentUpdate {
  updateId: string;
  incident: Incident;
  timestamp: string;
  status: string;
  notes: string;
  updatedBy: string;
}

// Mock data for testing
const mockHazardZones: HazardZone[] = [
  {
    h3CellId: '8928308280fffff',
    riskLevel: 'critical',
    riskScore: 0.95,
    intensity: 0.9,
    confidence: 0.85,
    affectedPopulation: 15000,
    buildingsAtRisk: 250,
    latestDetection: new Date().toISOString(),
    windSpeed: 25,
    lastUpdated: new Date().toISOString(),
    evacuationRoutes: [],
    assignedResources: [],
    evacuationOrders: [],
    affectedBuildings: [],
    issueEvacuationOrder: async (params) => {
      return {
        orderId: 'order-001',
        zone: mockHazardZones[0],
        orderType: params.orderType,
        authorizedBy: params.authorizedBy,
        timestamp: new Date().toISOString(),
        status: 'active',
        publicMessage: 'Mandatory evacuation ordered',
        affectedPopulation: 15000,
        notificationsSent: [],
        complianceMetrics: [],
        sendNotifications: async () => {}
      };
    }
  },
  {
    h3CellId: '8928308281fffff',
    riskLevel: 'high',
    riskScore: 0.75,
    intensity: 0.7,
    confidence: 0.8,
    affectedPopulation: 8000,
    buildingsAtRisk: 120,
    latestDetection: new Date().toISOString(),
    windSpeed: 15,
    lastUpdated: new Date().toISOString(),
    evacuationRoutes: [],
    assignedResources: [],
    evacuationOrders: [],
    affectedBuildings: [],
    issueEvacuationOrder: async (params) => {
      return {
        orderId: 'order-002',
        zone: mockHazardZones[1],
        orderType: params.orderType,
        authorizedBy: params.authorizedBy,
        timestamp: new Date().toISOString(),
        status: 'active',
        publicMessage: 'Voluntary evacuation recommended',
        affectedPopulation: 8000,
        notificationsSent: [],
        complianceMetrics: [],
        sendNotifications: async () => {}
      };
    }
  },
  {
    h3CellId: '8928308282fffff',
    riskLevel: 'medium',
    riskScore: 0.55,
    intensity: 0.5,
    confidence: 0.75,
    affectedPopulation: 3000,
    buildingsAtRisk: 45,
    latestDetection: new Date().toISOString(),
    windSpeed: 10,
    lastUpdated: new Date().toISOString(),
    evacuationRoutes: [],
    assignedResources: [],
    evacuationOrders: [],
    affectedBuildings: [],
    issueEvacuationOrder: async (params) => {
      return {
        orderId: 'order-003',
        zone: mockHazardZones[2],
        orderType: params.orderType,
        authorizedBy: params.authorizedBy,
        timestamp: new Date().toISOString(),
        status: 'active',
        publicMessage: 'Shelter in place recommended',
        affectedPopulation: 3000,
        notificationsSent: [],
        complianceMetrics: [],
        sendNotifications: async () => {}
      };
    }
  }
];

const mockEmergencyUnits: EmergencyUnit[] = [
  {
    unitId: 'unit-001',
    callSign: 'Engine 1',
    unitType: 'fire_engine',
    status: 'available',
    currentLocation: '8928308280fffff',
    lastLocationUpdate: new Date().toISOString(),
    capacity: 4,
    equipment: ['Hose', 'Ladder', 'Pump', 'SCBA'],
    dispatchHistory: [],
    dispatchToIncident: async (params) => {
      return {
        recordId: 'dispatch-001',
        unit: mockEmergencyUnits[0],
        incident: { incidentId: params.incidentId } as any,
        dispatchedBy: params.dispatcher,
        dispatchTime: new Date().toISOString(),
        status: 'dispatched'
      };
    },
    dispatchToEvacuation: async () => {}
  },
  {
    unitId: 'unit-002',
    callSign: 'Ambulance 1',
    unitType: 'ambulance',
    status: 'available',
    currentLocation: '8928308281fffff',
    lastLocationUpdate: new Date().toISOString(),
    capacity: 2,
    equipment: ['Defibrillator', 'Oxygen', 'Stretcher'],
    dispatchHistory: [],
    dispatchToIncident: async (params) => {
      return {
        recordId: 'dispatch-002',
        unit: mockEmergencyUnits[1],
        incident: { incidentId: params.incidentId } as any,
        dispatchedBy: params.dispatcher,
        dispatchTime: new Date().toISOString(),
        status: 'dispatched'
      };
    },
    dispatchToEvacuation: async () => {}
  },
  {
    unitId: 'unit-003',
    callSign: 'Patrol 1',
    unitType: 'police',
    status: 'dispatched',
    currentLocation: '8928308282fffff',
    lastLocationUpdate: new Date().toISOString(),
    capacity: 2,
    equipment: ['Radio', 'Body Camera', 'Taser'],
    dispatchHistory: [],
    dispatchToIncident: async (params) => {
      return {
        recordId: 'dispatch-003',
        unit: mockEmergencyUnits[2],
        incident: { incidentId: params.incidentId } as any,
        dispatchedBy: params.dispatcher,
        dispatchTime: new Date().toISOString(),
        status: 'dispatched'
      };
    },
    dispatchToEvacuation: async () => {}
  }
];

const mockEvacuationRoutes: EvacuationRoute[] = [
  {
    routeId: 'route-001',
    originH3: '8928308280fffff',
    destinationH3: '8928308283fffff',
    routeGeometry: JSON.stringify({
      type: 'LineString',
      coordinates: [
        [-122.4194, 37.7749],
        [-122.4100, 37.7800],
        [-122.4000, 37.7850]
      ]
    }),
    distanceKm: 2.5,
    estimatedTimeMinutes: 15,
    capacityPerHour: 1000,
    status: 'safe',
    lastUpdated: new Date().toISOString(),
    hazardZones: [],
    routeUsage: [],
    updateStatus: async () => {}
  },
  {
    routeId: 'route-002',
    originH3: '8928308281fffff',
    destinationH3: '8928308284fffff',
    routeGeometry: JSON.stringify({
      type: 'LineString',
      coordinates: [
        [-122.4180, 37.7755],
        [-122.4080, 37.7805],
        [-122.3980, 37.7855]
      ]
    }),
    distanceKm: 3.2,
    estimatedTimeMinutes: 20,
    capacityPerHour: 800,
    status: 'compromised',
    lastUpdated: new Date().toISOString(),
    hazardZones: [],
    routeUsage: [],
    updateStatus: async () => {}
  }
];

// Foundry SDK Client
class FoundrySDK {
  constructor(_baseUrl: string = 'https://your-foundry-instance.com') {
    // Mock implementation - baseUrl not used
  }

  setAuthToken(_token: string) {
    // Mock implementation - token not used
  }

  private async request<T>(endpoint: string, _options: RequestInit = {}): Promise<T> {
    // For demo purposes, return mock data instead of making real API calls
    console.log(`Mock API call to: ${endpoint}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return appropriate mock data based on endpoint
    if (endpoint.includes('hazard-zones')) {
      return mockHazardZones as T;
    } else if (endpoint.includes('emergency-units')) {
      return mockEmergencyUnits as T;
    } else if (endpoint.includes('evacuation-routes')) {
      return mockEvacuationRoutes as T;
    }
    
    throw new Error(`Mock endpoint not found: ${endpoint}`);
  }

  // Ontology object queries
  async getHazardZones(filters?: {
    riskLevel?: string[];
    minRiskScore?: number;
    maxDistance?: number;
    lat?: number;
    lon?: number;
  }): Promise<HazardZone[]> {
    console.log('Getting hazard zones with filters:', filters);
    return this.request<HazardZone[]>('/api/ontology/hazard-zones');
  }

  async getEmergencyUnits(filters?: {
    unitType?: string[];
    status?: string[];
    available?: boolean;
  }): Promise<EmergencyUnit[]> {
    console.log('Getting emergency units with filters:', filters);
    return this.request<EmergencyUnit[]>('/api/ontology/emergency-units');
  }

  async getEvacuationRoutes(filters?: {
    status?: string[];
    originH3?: string;
    destinationH3?: string;
  }): Promise<EvacuationRoute[]> {
    console.log('Getting evacuation routes with filters:', filters);
    return this.request<EvacuationRoute[]>('/api/ontology/evacuation-routes');
  }

  // Real-time subscriptions (mock implementation)
  subscribeToHazardZones(callback: (hazards: HazardZone[]) => void): () => void {
    console.log('Subscribing to hazard zones');
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      callback(mockHazardZones);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      console.log('Unsubscribed from hazard zones');
    };
  }

  subscribeToEmergencyUnits(callback: (units: EmergencyUnit[]) => void): () => void {
    console.log('Subscribing to emergency units');
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      callback(mockEmergencyUnits);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      console.log('Unsubscribed from emergency units');
    };
  }

  // Ontology Actions
  async issueEvacuationOrder(zoneId: string, params: {
    orderType: 'mandatory' | 'voluntary' | 'shelter_in_place';
    authorizedBy: string;
  }): Promise<EvacuationOrder> {
    console.log('Issuing evacuation order:', { zoneId, params });
    return this.request<EvacuationOrder>(`/api/ontology/hazard-zones/${zoneId}/issue-evacuation-order`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async dispatchUnit(unitId: string, params: {
    incidentId: string;
    dispatcher: string;
  }): Promise<DispatchRecord> {
    console.log('Dispatching unit:', { unitId, params });
    return this.request<DispatchRecord>(`/api/ontology/emergency-units/${unitId}/dispatch`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updateUnitLocation(unitId: string, params: {
    h3Cell: string;
    updatedBy: string;
  }): Promise<void> {
    console.log('Updating unit location:', { unitId, params });
    return this.request<void>(`/api/ontology/emergency-units/${unitId}/location`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }
}

// React hooks for Ontology objects
export function useOntology<T>(
  queryFn: () => Promise<T[]>,
  dependencies: any[] = []
): { data: T[] | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

export function useHazardZones(filters?: {
  riskLevel?: string[];
  minRiskScore?: number;
  maxDistance?: number;
  lat?: number;
  lon?: number;
}): { data: HazardZone[] | null; loading: boolean; error: Error | null; refetch: () => void } {
  const sdk = new FoundrySDK();
  
  return useOntology(
    () => sdk.getHazardZones(filters),
    [JSON.stringify(filters)]
  );
}

export function useEmergencyUnits(filters?: {
  unitType?: string[];
  status?: string[];
  available?: boolean;
}): { data: EmergencyUnit[] | null; loading: boolean; error: Error | null; refetch: () => void } {
  const sdk = new FoundrySDK();
  
  return useOntology(
    () => sdk.getEmergencyUnits(filters),
    [JSON.stringify(filters)]
  );
}

export function useEvacuationRoutes(filters?: {
  status?: string[];
  originH3?: string;
  destinationH3?: string;
}): { data: EvacuationRoute[] | null; loading: boolean; error: Error | null; refetch: () => void } {
  const sdk = new FoundrySDK();
  
  return useOntology(
    () => sdk.getEvacuationRoutes(filters),
    [JSON.stringify(filters)]
  );
}

// Real-time subscription hooks
export function useHazardZonesSubscription(
  callback: (hazards: HazardZone[]) => void
): () => void {
  const sdk = new FoundrySDK();
  
  useEffect(() => {
    return sdk.subscribeToHazardZones(callback);
  }, [callback]);
  
  return () => {}; // Cleanup function
}

export function useEmergencyUnitsSubscription(
  callback: (units: EmergencyUnit[]) => void
): () => void {
  const sdk = new FoundrySDK();
  
  useEffect(() => {
    return sdk.subscribeToEmergencyUnits(callback);
  }, [callback]);
  
  return () => {}; // Cleanup function
}

// Export SDK instance
export const foundrySDK = new FoundrySDK();
