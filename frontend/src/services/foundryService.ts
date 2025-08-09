// Foundry Service for Real-Time Emergency Response Data
// This service connects to Palantir Foundry for live data integration

export interface EvacuationRoute {
  id: string;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  properties: {
    routeName: string;
    status: 'Active' | 'Blocked' | 'Compromised';
    estimatedTime: string;
    capacity: 'High' | 'Medium' | 'Low';
    description: string;
    tooltip: string;
    duration: number; // minutes
    vehicle_capacity: number;
    is_blocked: boolean;
    hazard_distance: number; // meters from nearest hazard
    population_served: number;
    last_updated: string;
  };
}

export interface HazardZone {
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
  properties: {
    hazard_type: 'fire' | 'flood' | 'smoke' | 'debris';
    risk_level: 'critical' | 'high' | 'medium' | 'low';
    smoke_height: number; // meters for 3D visualization
    spread_rate: number; // meters per hour
    direction: number; // degrees
    confidence: number; // 0-1
    detected_at: string;
    predicted_spread: {
      coordinates: [number, number][][];
      time_horizon: number; // hours
    };
  };
}

export interface EmergencyZone {
  id: string;
  h3_cell: string;
  name: string;
  population: number;
  evacuation_status: 'none' | 'voluntary' | 'mandatory' | 'completed';
  hazard_exposure: number; // 0-1
  evacuation_routes: string[];
  last_assessment: string;
}

export interface EvacuationOrder {
  zone_id: string;
  type: 'voluntary' | 'mandatory';
  message: string;
  routes: string[];
  issued_at: string;
  expires_at: string;
}

export interface EvacuationResult {
  affected_population: number;
  routes_activated: number;
  notifications_sent: number;
  estimated_clearance_time: number; // minutes
  success: boolean;
  message: string;
}

// Mock Foundry Client for development
// Replace with actual @palantir/foundry-sdk in production
class MockFoundryClient {
  private routes: EvacuationRoute[] = [];
  private hazards: HazardZone[] = [];
  private zones: EmergencyZone[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock evacuation routes based on San Francisco
    this.routes = [
      {
        id: 'route-primary-001',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-122.4194, 37.7749], // Downtown SF
            [-122.4150, 37.7800],
            [-122.4100, 37.7850],
            [-122.4050, 37.7900],
            [-122.4000, 37.7950], // Safe zone
          ]
        },
        properties: {
          routeName: 'Primary Evacuation Route',
          status: 'Active',
          estimatedTime: '15 minutes',
          capacity: 'High',
          description: 'Main evacuation route from downtown to safe zone',
          tooltip: '🚨 Primary Route: 15 min • High Capacity • Active • Real-time hazard monitoring enabled',
          duration: 15,
          vehicle_capacity: 500,
          is_blocked: false,
          hazard_distance: 1200,
          population_served: 25000,
          last_updated: new Date().toISOString()
        }
      },
      {
        id: 'route-secondary-002',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-122.4194, 37.7749], // Downtown SF
            [-122.4250, 37.7750],
            [-122.4300, 37.7750],
            [-122.4350, 37.7800],
            [-122.4400, 37.7850], // Safe zone
          ]
        },
        properties: {
          routeName: 'Secondary Evacuation Route',
          status: 'Active',
          estimatedTime: '20 minutes',
          capacity: 'Medium',
          description: 'Alternative evacuation route via waterfront',
          tooltip: '🟠 Secondary Route: 20 min • Medium Capacity • Active • Alternative path with different characteristics',
          duration: 20,
          vehicle_capacity: 300,
          is_blocked: false,
          hazard_distance: 800,
          population_served: 15000,
          last_updated: new Date().toISOString()
        }
      }
    ];

    // Mock hazard zones
    this.hazards = [
      {
        id: 'hazard-fire-001',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-122.4220, 37.7720],
            [-122.4180, 37.7720],
            [-122.4180, 37.7760],
            [-122.4220, 37.7760],
            [-122.4220, 37.7720]
          ]]
        },
        properties: {
          hazard_type: 'fire',
          risk_level: 'critical',
          smoke_height: 150,
          spread_rate: 25,
          direction: 45,
          confidence: 0.95,
          detected_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          predicted_spread: {
            coordinates: [[
              [-122.4220, 37.7720],
              [-122.4160, 37.7720],
              [-122.4160, 37.7780],
              [-122.4220, 37.7780],
              [-122.4220, 37.7720]
            ]],
            time_horizon: 2
          }
        }
      }
    ];

    // Mock emergency zones
    this.zones = [
      {
        id: 'zone-downtown-001',
        h3_cell: '8928308280fffff',
        name: 'Downtown San Francisco',
        population: 25000,
        evacuation_status: 'none',
        hazard_exposure: 0.3,
        evacuation_routes: ['route-primary-001', 'route-secondary-002'],
        last_assessment: new Date().toISOString()
      }
    ];
  }

  functions = {
    execute: async (functionName: string, parameters: any) => {
      console.log(`Mock Foundry Function: ${functionName}`, parameters);
      
      switch (functionName) {
        case 'ri.function.main.get-evacuation-routes':
          return this.routes;
        
        case 'ri.function.main.get-hazard-zones':
          return this.hazards;
        
        case 'ri.function.main.get-emergency-zones':
          return this.zones;
        
        case 'ri.function.main.issue-evacuation':
          return this.issueEvacuation(parameters);
        
        case 'ri.function.main.calculate-optimal-routes':
          return this.calculateOptimalRoutes(parameters);
        
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    }
  };

  private async issueEvacuation(order: EvacuationOrder): Promise<EvacuationResult> {
    const zone = this.zones.find(z => z.id === order.zone_id);
    if (!zone) {
      throw new Error(`Zone not found: ${order.zone_id}`);
    }

    // Update zone status
    zone.evacuation_status = order.type;
    zone.last_assessment = new Date().toISOString();

    return {
      affected_population: zone.population,
      routes_activated: order.routes.length,
      notifications_sent: Math.floor(zone.population * 0.8), // 80% notification rate
      estimated_clearance_time: 45, // minutes
      success: true,
      message: `Evacuation order issued for ${zone.name}`
    };
  }

  private async calculateOptimalRoutes(parameters: any): Promise<EvacuationRoute[]> {
    // Simulate AI-powered route optimization
    const { avoid_hazards = true, max_capacity = true } = parameters;
    
    // Filter routes based on parameters
    let optimalRoutes = this.routes.filter(route => {
      if (avoid_hazards && route.properties.hazard_distance < 500) {
        return false;
      }
      if (max_capacity && route.properties.capacity === 'Low') {
        return false;
      }
      return true;
    });

    // Sort by optimal criteria
    optimalRoutes.sort((a, b) => {
      const scoreA = (a.properties.vehicle_capacity * 0.6) + (a.properties.hazard_distance * 0.4);
      const scoreB = (b.properties.vehicle_capacity * 0.6) + (b.properties.hazard_distance * 0.4);
      return scoreB - scoreA;
    });

    return optimalRoutes;
  }
}

// Real Foundry Client (for production)
class RealFoundryClient {
  // TODO: Replace with actual @palantir/foundry-sdk
  // import { FoundryClient } from '@palantir/foundry-sdk';
  
  functions = {
    execute: async (functionName: string, parameters: any) => {
      // TODO: Implement real Foundry SDK calls
      console.log(`Real Foundry Function: ${functionName}`, parameters);
      throw new Error('Real Foundry SDK not yet implemented');
    }
  };
}

// Service class
class FoundryService {
  private client: MockFoundryClient | RealFoundryClient;

  constructor(useMock: boolean = true) {
    this.client = useMock ? new MockFoundryClient() : new RealFoundryClient();
  }

  // Evacuation Routes
  async getLiveEvacuationRoutes(zoneId?: string): Promise<EvacuationRoute[]> {
    try {
      const routes = await this.client.functions.execute(
        'ri.function.main.get-evacuation-routes',
        {
          zone_id: zoneId,
          include_alternates: true,
          real_time: true
        }
      );
      
      if (Array.isArray(routes)) {
        return routes.map((route: any) => ({
          ...route,
          properties: {
            ...route.properties,
            tooltip: this.generateTooltip(route.properties)
          }
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching evacuation routes:', error);
      return [];
    }
  }

  // Hazard Zones
  async getHazardZones(): Promise<HazardZone[]> {
    try {
      const result = await this.client.functions.execute(
        'ri.function.main.get-hazard-zones',
        {
          include_predictions: true,
          real_time: true
        }
      );
      
      if (Array.isArray(result)) {
        return result as HazardZone[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching hazard zones:', error);
      return [];
    }
  }

  // Emergency Zones
  async getEmergencyZones(): Promise<EmergencyZone[]> {
    try {
      const result = await this.client.functions.execute(
        'ri.function.main.get-emergency-zones',
        {
          include_population: true,
          include_risk_assessment: true
        }
      );
      
      if (Array.isArray(result)) {
        return result as EmergencyZone[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching emergency zones:', error);
      return [];
    }
  }

  // Issue Evacuation Order
  async issueEvacuation(order: EvacuationOrder): Promise<EvacuationResult> {
    try {
      const result = await this.client.functions.execute(
        'ri.function.main.issue-evacuation',
        order
      );
      
      if (result && typeof result === 'object' && 'affected_population' in result) {
        return result as EvacuationResult;
      }
      throw new Error('Invalid evacuation result');
    } catch (error) {
      console.error('Error issuing evacuation:', error);
      throw error;
    }
  }

  // Calculate Optimal Routes
  async calculateOptimalRoutes(zoneId: string, parameters: any = {}): Promise<EvacuationRoute[]> {
    try {
      const result = await this.client.functions.execute(
        'ri.function.main.calculate-optimal-routes',
        {
          zone_id: zoneId,
          avoid_hazards: true,
          max_capacity: true,
          ...parameters
        }
      );
      
      if (Array.isArray(result)) {
        return result as EvacuationRoute[];
      }
      return [];
    } catch (error) {
      console.error('Error calculating optimal routes:', error);
      return [];
    }
  }

  // Get Population in Hazard Zones
  async getPopulationInHazardZones(): Promise<number> {
    try {
      const zones = await this.getEmergencyZones();
      return zones.reduce((total, zone) => {
        return total + (zone.hazard_exposure > 0.5 ? zone.population : 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating population in hazard zones:', error);
      return 0;
    }
  }

  // Generate dynamic tooltips
  private generateTooltip(properties: any): string {
    const status = properties.is_blocked ? '🚫 Blocked' : '✅ Active';
    const capacity = properties.vehicle_capacity > 400 ? 'High' : 
                    properties.vehicle_capacity > 200 ? 'Medium' : 'Low';
    
    return `${status} • ${properties.duration} min • ${capacity} Capacity • ${properties.hazard_distance}m from hazard`;
  }

  // Real-time updates
  subscribeToUpdates(callback: (data: any) => void): () => void {
    // TODO: Implement real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const [routes, hazards, zones] = await Promise.all([
          this.getLiveEvacuationRoutes(),
          this.getHazardZones(),
          this.getEmergencyZones()
        ]);
        
        callback({ routes, hazards, zones, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }
}

// Export singleton instance
export const foundryService = new FoundryService(true); // Use mock for now
