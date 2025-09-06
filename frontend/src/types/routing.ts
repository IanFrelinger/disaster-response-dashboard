/**
 * Advanced routing data structures for emergency response planning
 */

export interface RoutePoint {
  id: string;
  coordinates: [number, number];
  elevation?: number;
  type: 'start' | 'destination' | 'waypoint' | 'hazard' | 'building';
  properties: {
    name?: string;
    description?: string;
    accessibility?: 'open' | 'restricted' | 'closed';
    emergency_access?: boolean;
    vehicle_type?: 'fire_truck' | 'ambulance' | 'police' | 'general';
    time_estimate?: number; // minutes
    distance_from_previous?: number; // kilometers
  };
}

export interface RouteSegment {
  id: string;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  coordinates: [number, number][];
  properties: {
    distance: number; // kilometers
    time: number; // minutes
    elevation_gain: number; // meters
    elevation_loss: number; // meters
    max_slope: number; // percentage
    average_slope: number; // percentage
    road_type: 'highway' | 'arterial' | 'collector' | 'local' | 'off_road';
    road_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'impassable';
    traffic_conditions: 'clear' | 'moderate' | 'heavy' | 'congested';
    emergency_priority: 'high' | 'medium' | 'low';
    hazards: string[];
    accessibility: 'open' | 'restricted' | 'closed';
  };
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  startPoint: RoutePoint;
  destinationPoint: RoutePoint;
  waypoints: RoutePoint[];
  segments: RouteSegment[];
  totalDistance: number; // kilometers
  totalTime: number; // minutes
  totalElevationGain: number; // meters
  totalElevationLoss: number; // meters
  maxSlope: number; // percentage
  averageSlope: number; // percentage
  emergencyPriority: 'critical' | 'high' | 'medium' | 'low';
  vehicleType: 'fire_truck' | 'ambulance' | 'police' | 'general';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    optimization_method: string;
    constraints_applied: string[];
    performance_score: number; // 0-100
    reliability_score: number; // 0-100
  };
}

export interface RouteOptimization {
  startPoint: [number, number];
  destinationPoint: [number, number];
  waypoints?: [number, number][];
  constraints: {
    maxDistance?: number; // kilometers
    maxTime?: number; // minutes
    maxSlope?: number; // percentage
    avoidHazards?: boolean;
    emergencyPriority?: 'critical' | 'high' | 'medium' | 'low';
    vehicleType?: 'fire_truck' | 'ambulance' | 'police' | 'general';
    roadConditions?: string[];
    timeOfDay?: 'day' | 'night' | 'rush_hour';
    weatherConditions?: 'clear' | 'rain' | 'snow' | 'fog';
  };
  optimization: 'fastest' | 'shortest' | 'safest' | 'most_accessible' | 'balanced';
  preferences: {
    weightDistance: number; // 0-1
    weightTime: number; // 0-1
    weightSafety: number; // 0-1
    weightAccessibility: number; // 0-1
  };
}

export interface HazardZone {
  id: string;
  type: 'fire' | 'flood' | 'chemical' | 'structural' | 'traffic' | 'weather';
  coordinates: [number, number][];
  center: [number, number];
  radius: number; // kilometers
  severity: 'low' | 'medium' | 'high' | 'critical';
  properties: {
    name: string;
    description: string;
    startTime: Date;
    estimatedEndTime?: Date;
    affectedArea: number; // square kilometers
    populationAtRisk: number;
    evacuationRoutes: string[];
    emergencyContacts: string[];
    status: 'active' | 'contained' | 'resolved';
  };
  avoidance: {
    enabled: boolean;
    bufferDistance: number; // kilometers
    alternativeRoutes: string[];
    priority: 'must_avoid' | 'prefer_avoid' | 'can_traverse';
  };
}

export interface TrafficCondition {
  id: string;
  location: [number, number];
  type: 'accident' | 'construction' | 'congestion' | 'road_closed' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  properties: {
    description: string;
    startTime: Date;
    estimatedEndTime?: Date;
    affectedLanes: number;
    delay: number; // minutes
    detourAvailable: boolean;
    emergencyAccess: boolean;
  };
}

export interface RouteMetrics {
  distance: number; // kilometers
  time: number; // minutes
  elevation: {
    gain: number; // meters
    loss: number; // meters
    net: number; // meters
    max: number; // meters
    min: number; // meters
  };
  slope: {
    max: number; // percentage
    average: number; // percentage
    steep_segments: number; // count of segments >15%
    moderate_segments: number; // count of segments 5-15%
    gentle_segments: number; // count of segments <5%
  };
  accessibility: {
    emergency_vehicle_compatible: boolean;
    restricted_areas: number;
    building_access_points: number;
    hazard_avoidance_score: number; // 0-100
  };
  performance: {
    fuel_efficiency: number; // 0-100
    time_reliability: number; // 0-100
    safety_score: number; // 0-100
    overall_score: number; // 0-100
  };
}

export interface RouteComparison {
  routes: Route[];
  metrics: RouteMetrics[];
  comparison: {
    bestDistance: string; // route ID
    bestTime: string; // route ID
    bestSafety: string; // route ID
    bestAccessibility: string; // route ID
    overallBest: string; // route ID
  };
  recommendations: {
    emergency: string; // route ID
    standard: string; // route ID
    scenic: string; // route ID
    avoid: string[]; // route IDs to avoid
  };
}

export interface DynamicRouteUpdate {
  routeId: string;
  type: 'hazard_detected' | 'traffic_change' | 'road_closure' | 'weather_update';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: [number, number];
  affectedSegments: string[];
  recommendedAction: 'continue' | 'reroute' | 'delay' | 'cancel';
  newRoute?: Route;
  estimatedDelay: number; // minutes
  timestamp: Date;
}

export interface RouteOptimizationResult {
  success: boolean;
  routes: Route[];
  bestRoute: Route;
  alternatives: Route[];
  metrics: RouteMetrics[];
  optimizationTime: number; // milliseconds
  constraints: {
    satisfied: string[];
    violated: string[];
    warnings: string[];
  };
  recommendations: {
    immediate: string[];
    planning: string[];
    long_term: string[];
  };
}
