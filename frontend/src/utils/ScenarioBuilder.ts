export interface Waypoint {
  id: string;
  type: 'start' | 'destination' | 'turn';
  coordinates: [number, number];
  name: string;
  properties?: Record<string, any>;
}

export interface Route {
  id: string;
  name: string;
  coordinates: [number, number][];
  properties?: Record<string, any>;
}

export interface Building {
  id: string;
  name: string;
  coordinates: [number, number];
  height: number;
  properties?: Record<string, any>;
}

export interface Hazard {
  id: string;
  type: 'fire' | 'flood' | 'chemical' | 'structural';
  coordinates: [number, number];
  radius: number;
  severity: 'low' | 'medium' | 'high';
  properties?: Record<string, any>;
}

export interface Scenario {
  id: string;
  name: string;
  waypoints: Waypoint[];
  routes: Route[];
  buildings: Building[];
  hazards: Hazard[];
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

export class ScenarioBuilder {
  private waypoints: Waypoint[] = [];
  private routes: Route[] = [];
  private buildings: Building[] = [];
  private hazards: Hazard[] = [];
  private center: [number, number] = [-122.4194, 37.7749]; // San Francisco
  private zoom = 16;
  private pitch = 45;
  private bearing = 0;
  private seed: number = 42; // Default seed for deterministic generation

  constructor(seed?: number) {
    if (seed !== undefined) {
      this.seed = seed;
    }
  }

  // Deterministic random number generator
  private random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Generate deterministic color based on type
  private getColor(type: string): string {
    const colors: Record<string, string> = {
      start: '#00FF00',
      destination: '#FF0000',
      turn: '#0080FF',
      fire: '#FF6B35',
      flood: '#0066CC',
      chemical: '#FFD700',
      structural: '#8B4513'
    };
    return colors[type] || '#808080';
  }

  withWaypoint(id: string, type: Waypoint['type'], coordinates: [number, number], name?: string): this {
    this.waypoints.push({
      id,
      type,
      coordinates,
      name: name || `${type}-${id}`,
      properties: {
        color: this.getColor(type),
        size: type === 'start' || type === 'destination' ? 25 : 20,
        opacity: 0.9
      }
    });
    return this;
  }

  withRoute(id: string, coordinates: [number, number][], name?: string): this {
    this.routes.push({
      id,
      name: name || `Route-${id}`,
      coordinates,
      properties: {
        color: '#FF6B35',
        width: 4,
        opacity: 0.8
      }
    });
    return this;
  }

  withBuilding(id: string, coordinates: [number, number], height: number, name?: string): this {
    this.buildings.push({
      id,
      name: name || `Building-${id}`,
      coordinates,
      height,
      properties: {
        color: '#8B4513',
        opacity: 0.7
      }
    });
    return this;
  }

  withHazard(id: string, type: Hazard['type'], coordinates: [number, number], radius: number, severity: Hazard['severity']): this {
    this.hazards.push({
      id,
      type,
      coordinates,
      radius,
      severity,
      properties: {
        color: this.getColor(type),
        opacity: severity === 'high' ? 0.9 : severity === 'medium' ? 0.7 : 0.5
      }
    });
    return this;
  }

  withCenter(coordinates: [number, number]): this {
    this.center = coordinates;
    return this;
  }

  withZoom(zoom: number): this {
    this.zoom = zoom;
    return this;
  }

  withPitch(pitch: number): this {
    this.pitch = pitch;
    return this;
  }

  withBearing(bearing: number): this {
    this.bearing = bearing;
    return this;
  }

  // Generate a simple evacuation scenario
  withEvacuationScenario(): this {
    const startPoint: [number, number] = [-122.4194, 37.7749];
    const endPoint: [number, number] = [-122.4083, 37.7879];
    const turnPoint: [number, number] = [-122.4150, 37.7810];

    return this
      .withWaypoint('evac-start', 'start', startPoint, 'Evacuation Start')
      .withWaypoint('evac-dest', 'destination', endPoint, 'Safe Zone')
      .withWaypoint('evac-turn', 'turn', turnPoint, 'Checkpoint Alpha')
      .withRoute('evac-route', [startPoint, turnPoint, endPoint], 'Evacuation Route Alpha')
      .withBuilding('hq', startPoint, 50, 'Command Center')
      .withBuilding('shelter', endPoint, 30, 'Emergency Shelter')
      .withHazard('fire-zone', 'fire', [-122.4170, 37.7760], 200, 'high');
  }

  // Generate a complex multi-hazard scenario
  withMultiHazardScenario(): this {
    const points: [number, number][] = [
      [-122.4194, 37.7749], // Start
      [-122.4150, 37.7810], // Turn 1
      [-122.4100, 37.7850], // Turn 2
      [-122.4083, 37.7879]  // End
    ];

    // Add waypoints
    this.withWaypoint('multi-start', 'start', points[0]!, 'Multi-Hazard Start');
    this.withWaypoint('multi-turn1', 'turn', points[1]!, 'Checkpoint Bravo');
    this.withWaypoint('multi-turn2', 'turn', points[2]!, 'Checkpoint Charlie');
    this.withWaypoint('multi-dest', 'destination', points[3]!, 'Multi-Hazard Safe Zone');

    // Add route
    this.withRoute('multi-route', points, 'Multi-Hazard Evacuation Route');

    // Add buildings
    this.withBuilding('command', points[0]!, 60, 'Emergency Command');
    this.withBuilding('hospital', points[3]!, 40, 'Field Hospital');
    this.withBuilding('warehouse', points[1]!, 25, 'Supply Warehouse');

    // Add multiple hazards
    this.withHazard('fire-1', 'fire', [-122.4170, 37.7760], 150, 'high');
    this.withHazard('flood-1', 'flood', [-122.4130, 37.7830], 300, 'medium');
    this.withHazard('chemical-1', 'chemical', [-122.4110, 37.7860], 100, 'high');
    this.withHazard('structural-1', 'structural', [-122.4160, 37.7780], 80, 'low');

    return this;
  }

  // Generate a simple test scenario
  withSimpleTestScenario(): this {
    const start: [number, number] = [-122.4194, 37.7749];
    const end: [number, number] = [-122.4083, 37.7879];

    return this
      .withWaypoint('test-start', 'start', start, 'Test Start')
      .withWaypoint('test-dest', 'destination', end, 'Test End')
      .withRoute('test-route', [start, end], 'Test Route')
      .withBuilding('test-building', start, 30, 'Test Building');
  }

  // Freeze the scenario and return the final result
  freeze(): Scenario {
    return {
      id: `scenario-${Date.now()}-${Math.floor(this.random() * 1000)}`,
      name: 'Generated Scenario',
      waypoints: [...this.waypoints],
      routes: [...this.routes],
      buildings: [...this.buildings],
      hazards: [...this.hazards],
      center: [...this.center],
      zoom: this.zoom,
      pitch: this.pitch,
      bearing: this.bearing
    };
  }

  // Reset the builder
  reset(): this {
    this.waypoints = [];
    this.routes = [];
    this.buildings = [];
    this.hazards = [];
    this.center = [-122.4194, 37.7749];
    this.zoom = 16;
    this.pitch = 45;
    this.bearing = 0;
    return this;
  }

  // Get current state without freezing
  getCurrentState(): Omit<Scenario, 'id' | 'name'> {
    return {
      waypoints: [...this.waypoints],
      routes: [...this.routes],
      buildings: [...this.buildings],
      hazards: [...this.hazards],
      center: [...this.center],
      zoom: this.zoom,
      pitch: this.pitch,
      bearing: this.bearing
    };
  }
}

// Pre-built scenarios for common test cases
export const scenarios = {
  simple: () => new ScenarioBuilder().withSimpleTestScenario().freeze(),
  evacuation: () => new ScenarioBuilder().withEvacuationScenario().freeze(),
  multiHazard: () => new ScenarioBuilder().withMultiHazardScenario().freeze(),
  custom: (seed?: number) => new ScenarioBuilder(seed)
};

// Utility function to create a scenario from JSON
export const createScenarioFromJSON = (json: any): Scenario => {
  return {
    id: json.id || `imported-${Date.now()}`,
    name: json.name || 'Imported Scenario',
    waypoints: json.waypoints || [],
    routes: json.routes || [],
    buildings: json.buildings || [],
    hazards: json.hazards || [],
    center: json.center || [-122.4194, 37.7749],
    zoom: json.zoom || 16,
    pitch: json.pitch || 45,
    bearing: json.bearing || 0
  };
};

