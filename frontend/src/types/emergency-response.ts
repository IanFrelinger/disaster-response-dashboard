// Emergency Response System Types
// Based on real-world operational feedback

// ===== WEATHER INTEGRATION =====
export interface WeatherData {
  current: {
    temp: number;           // 95°F
    humidity: number;       // 12% - critically low
    windSpeed: number;      // 25 mph
    windDirection: number;  // 270° (from west)
    windGusts: number;      // 35 mph
    fireWeatherIndex: 'low' | 'moderate' | 'high' | 'extreme' | 'catastrophic';
    visibility: number;     // miles
    pressure: number;       // mb
  };
  forecast: {
    redFlagWarning: boolean;
    windShiftExpected: string;  // "18:00 - Wind shift to NE"
    humidityRecovery: string;   // "Overnight to 40%"
    tempDrop: string;          // "22:00 - Drop to 65°F"
    nextHour: {
      temp: number;
      humidity: number;
      windSpeed: number;
      windDirection: number;
    };
  };
  alerts?: WeatherAlert[];
}

export interface WeatherAlert {
  type: 'red_flag' | 'high_wind' | 'low_humidity' | 'extreme_temp';
  severity: 'warning' | 'watch' | 'advisory';
  message: string;
  validFrom: Date;
  validTo: Date;
  affectedAreas: string[];
}

// ===== MULTI-HAZARD SUPPORT =====
export interface HazardLayer {
  id: string;
  type: 'fire' | 'flood' | 'earthquake' | 'chemical' | 'landslide';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'active' | 'contained' | 'controlled' | 'extinguished';
  
  fire?: {
    active: Array<{
      type?: string;
      coordinates?: number[][][];
    } | number[][]>;
    predicted_1hr?: Array<{
      type?: string;
      coordinates?: number[][][];
    } | number[][]>;
    predicted_3hr?: Array<{
      type?: string;
      coordinates?: number[][][];
    } | number[][]>;
    predicted?: Array<{
      type?: string;
      coordinates?: number[][][];
    } | number[][]>;
    intensity: number; // 0-100
    fuelType: string;
    spreadRate: number; // mph
    flameHeight: number; // feet
    smokeHeight?: number;
  };
  
  flood?: {
    current: {
      geometry: Array<{
        type?: string;
        coordinates?: number[][][];
      } | number[][]> | {
        type: string;
        coordinates: number[][][];
      };
      depth: number; // feet
      flowRate: number; // mph
      waterLevel: number; // feet above normal
    };
    projected?: {
      geometry: Array<{
        type?: string;
        coordinates?: number[][][];
      } | number[][]> | {
        type: string;
        coordinates: number[][][];
      };
      timeframe: '30min' | '1hr' | '3hr' | '6hr';
      confidence: number; // 0-1
      depth: number;
    };
  };
  
  earthquake?: {
    magnitude: number;
    epicenter: [number, number];
    depth: number; // km
    aftershocks: number;
    groundShaking: 'light' | 'moderate' | 'strong' | 'severe';
  };
  
  chemical?: {
    substance: string;
    concentration: number; // ppm
    dispersion: Array<{
      type?: string;
      coordinates?: number[][][];
    } | number[][]>;
    windCarried: boolean;
    evacuationRadius: number; // meters
  };
  
  location: [number, number];
  affectedArea: number; // square meters
  timeToImpact: string;
  lastUpdated: Date;
}

// ===== ROLE-BASED ROUTING SYSTEM =====
export interface RouteProfiles {
  CIVILIAN_EVACUATION: {
    algorithm: 'maximum_safety';
    constraints: {
      avoidHazardBuffer: number; // meters
      avoidSmoke: boolean;
      preferHighways: boolean;
      avoidWaterCrossings: boolean;
      maxGradient: number; // degrees
      minRoadWidth: number; // meters
    };
    priorities: ['safety', 'capacity', 'speed'];
  };
  
  EMS_RESPONSE: {
    algorithm: 'calculated_risk';
    constraints: {
      avoidHazardBuffer: number;  // Can get closer
      allowSmokeTransit: boolean;  // With PPE
      requireTwoWayAccess: boolean; // Must be able to exit
      maxResponseTime: number; // minutes
      deconflictWithOtherUnits: boolean;
      requireStagingArea: boolean;
    };
    priorities: ['speed', 'safety', 'accessibility'];
  };
  
  FIRE_TACTICAL: {
    algorithm: 'direct_approach';
    constraints: {
      avoidHazardBuffer: number;     // Direct to fire line
      requireWaterSource: boolean;  // Must have hydrants
      checkVehicleClearance: boolean;
      maintainEscapeRoutes: number;   // Always N ways out
      requireCommandPost: boolean;
    };
    priorities: ['access', 'safety', 'efficiency'];
  };
  
  POLICE_ESCORT: {
    algorithm: 'secure_transit';
    constraints: {
      avoidHazardBuffer: number;
      requireArterialRoads: boolean;
      maintainFormation: boolean;
      requireStagingAreas: boolean;
    };
    priorities: ['security', 'coordination', 'speed'];
  };
}

export interface OperationalRoute {
  id: string;
  profile: keyof RouteProfiles;
  startPoint: [number, number];
  endPoint: [number, number];
  waypoints: [number, number][];
  status: 'planned' | 'active' | 'completed' | 'blocked';
  capacity: number;
  currentUsage: number;
  estimatedTime: number; // minutes
  actualTime?: number;
  hazards: string[]; // hazard IDs to avoid
  deconflicted: boolean;
  assignedUnits: string[];
  stagingAreas: StagingArea[];
  restrictions?: string[];
}

export interface StagingArea {
  id: string;
  location: [number, number];
  capacity: number;
  currentUnits: number;
  type: 'command' | 'staging' | 'helispot' | 'medical';
  accessRoutes: string[]; // route IDs
  facilities: string[];
}

// ===== BUILDING-LEVEL EVACUATION TRACKING =====
export interface EvacuationZone {
  id: string;
  name: string;
  priority: 'immediate' | 'warning' | 'standby' | 'all_clear';
  totalBuildings: number;
  totalPopulation: number;
  evacuationProgress: {
    confirmed: number;      // Green
    inProgress: number;     // Yellow  
    refused: number;        // Orange
    noContact: number;      // Red
    unchecked: number;      // Gray
    specialNeeds: number;   // Purple
  };
  boundaries: {
    type: string;
    coordinates: number[][][];
  } | number[][];
  assignedUnits: string[];
  estimatedCompletion: Date;
  lastUpdated: Date;
}

export interface Building {
  id: string;
  address: string;
  coordinates: [number, number];
  type: 'residential' | 'commercial' | 'critical_facility' | 'industrial';
  units: number;
  population: number;
  specialNeeds: string[];
  evacuationStatus: {
    evacuated: boolean;
    confirmedBy?: string;
    timestamp?: Date;
    notes?: string;
    specialNeeds: string[];
    pets?: number;
    vehicles?: number;
    lastContact?: Date;
  };
  structuralIntegrity: 'intact' | 'damaged' | 'unsafe' | 'destroyed';
  accessRoutes: string[];
  hazards: string[];
  searchMarkings?: SearchMarking;
  buildingHeight?: number;
}

// ===== POST-DISASTER SEARCH MARKINGS (FEMA X-CODE) =====
export interface SearchMarking {
  structure: {
    id: string;
    location: [number, number];
    searchCode: {
      top: string;      // Date/time (e.g., "10/30 1400")
      left: string;     // Team ID (e.g., "CA-TF1")
      right: string;    // Hazards (e.g., "Gas leak")
      bottom: number;   // Live victims removed
      center?: 'X';     // If fully searched
    };
    structuralDamage: 'none' | 'light' | 'moderate' | 'heavy' | 'destroyed';
    reEntry: 'safe' | 'unsafe' | 'restricted';
    searchCompleted: Date;
    searchTeam: string;
    notes: string;
  };
}

// ===== DRILL-DOWN CAPABILITY =====
export interface DetailLevels {
  county: {
    show: string[];
    hide: string[];
    aggregate: boolean;
  };
  zone: {
    show: string[];
    hide: string[];
    aggregate: boolean;
  };
  neighborhood: {
    show: string[];
    hide: string[];
    aggregate: boolean;
  };
  building: {
    show: string[];
    hide: string[];
    enable: string[];
  };
}

// ===== EFFICIENCY METRICS =====
export interface EfficiencyMetrics {
  decisionSpeed: {
    before: number; // minutes
    after: number;  // minutes
    saved: number;  // minutes
    impact: string; // "12 more evacuations completed"
  };
  resourceUtilization: {
    before: number; // percentage
    after: number;  // percentage
    freed: number;  // percentage
    impact: string; // "8 additional rescues per hour"
  };
  responseTime: {
    before: number; // minutes
    after: number;  // minutes
    improvement: number; // percentage
  };
  outcomeProjection: {
    livesSaved: { estimate: number; confidence: number };
    injuriesReduced: { estimate: number; confidence: number };
    propertySaved: { estimate: string; confidence: number };
  };
}

// ===== EMERGENCY UNITS =====
export interface EmergencyUnit {
  id: string;
  type: 'fire_engine' | 'ambulance' | 'police_car' | 'rescue_truck' | 'command_vehicle';
  status: 'available' | 'responding' | 'on_scene' | 'returning' | 'out_of_service' | 'deployed';
  location: [number, number];
  destination?: [number, number];
  personnel: number;
  fuel: number;
  equipment: string[];
  assignedIncident?: string;
  assignedRoute?: string;
  capabilities: string[];
  lastLocationUpdate: Date;
  estimatedArrival?: Date;
  callSign?: string;
  currentTask?: string;
  unitHeight?: number;
}

// ===== INCIDENT MANAGEMENT =====
export interface Incident {
  id: string;
  type: string;
  location: [number, number];
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  status: 'active' | 'contained' | 'controlled' | 'extinguished';
  startTime: Date;
  estimatedContainment?: Date;
  assignedUnits: string[];
  hazards: string[];
  evacuationZones: string[];
  commandPost?: [number, number];
  stagingAreas: string[];
  lastUpdated: Date;
}

// ===== REAL-TIME UPDATES =====
export interface RealTimeUpdate {
  id: string;
  type: 'unit_movement' | 'hazard_update' | 'evacuation_progress' | 'route_change';
  timestamp: Date;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}
