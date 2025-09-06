/**
 * Real-time data integration types for live emergency response updates
 */

export interface RealTimeData {
  id: string;
  timestamp: Date;
  source: string;
  type: 'hazard' | 'traffic' | 'weather' | 'building' | 'terrain' | 'route';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: [number, number];
  data: any;
  metadata: {
    confidence: number; // 0-1
    updateFrequency: number; // seconds
    lastVerified: Date;
    sourceReliability: 'high' | 'medium' | 'low';
  };
}

export interface WeatherData extends RealTimeData {
  type: 'weather';
  data: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    visibility: number;
    conditions: 'clear' | 'rain' | 'snow' | 'fog' | 'storm';
    alerts: string[];
  };
}

export interface TrafficData extends RealTimeData {
  type: 'traffic';
  data: {
    congestionLevel: 'clear' | 'moderate' | 'heavy' | 'congested';
    averageSpeed: number; // km/h
    incidentType: 'accident' | 'construction' | 'road_closure' | 'weather' | 'none';
    incidentDescription?: string;
    affectedLanes: number;
    estimatedDelay: number; // minutes
    detourAvailable: boolean;
  };
}

export interface EmergencyAlertData extends RealTimeData {
  type: 'hazard';
  data: {
    alertType: 'fire' | 'flood' | 'chemical' | 'structural' | 'medical' | 'security';
    description: string;
    affectedArea: number; // square kilometers
    populationAtRisk: number;
    evacuationRequired: boolean;
    emergencyContacts: string[];
    responseUnits: string[];
    estimatedResponseTime: number; // minutes
  };
}

export interface BuildingStatusData extends RealTimeData {
  type: 'building';
  data: {
    buildingId: string;
    occupancy: number;
    maxCapacity: number;
    evacuationStatus: 'normal' | 'partial' | 'full' | 'completed';
    damageLevel: 'none' | 'minor' | 'moderate' | 'severe' | 'destroyed';
    accessStatus: 'open' | 'restricted' | 'closed' | 'emergency_only';
    lastInspection: Date;
    nextInspection: Date;
    criticalSystems: {
      fireSuppression: 'operational' | 'maintenance' | 'failed';
      electrical: 'operational' | 'maintenance' | 'failed';
      hvac: 'operational' | 'maintenance' | 'failed';
      communications: 'operational' | 'maintenance' | 'failed';
    };
  };
}

export interface TerrainChangeData extends RealTimeData {
  type: 'terrain';
  data: {
    changeType: 'flooding' | 'landslide' | 'erosion' | 'sinkhole' | 'vegetation';
    affectedArea: number; // square kilometers
    elevationChange: number; // meters
    slopeChange: number; // percentage
    accessibilityImpact: 'none' | 'minor' | 'moderate' | 'severe';
    estimatedDuration: number; // hours
    monitoringRequired: boolean;
  };
}

export interface RouteUpdateData extends RealTimeData {
  type: 'route';
  data: {
    routeId: string;
    updateType: 'hazard_detected' | 'traffic_change' | 'road_closure' | 'weather_update';
    affectedSegments: string[];
    recommendedAction: 'continue' | 'reroute' | 'delay' | 'cancel';
    newRoute?: any;
    estimatedDelay: number; // minutes
    alternativeRoutes: string[];
  };
}

export interface DataFeed {
  id: string;
  name: string;
  type: RealTimeData['type'];
  url: string;
  apiKey?: string;
  updateInterval: number; // seconds
  enabled: boolean;
  lastUpdate: Date;
  status: 'active' | 'error' | 'disabled' | 'maintenance';
  errorCount: number;
  lastError?: string;
  metadata: {
    provider: string;
    coverage: string;
    reliability: number; // 0-1
    dataQuality: number; // 0-1
  };
}

export interface WebSocketMessage {
  type: 'data_update' | 'system_status' | 'error' | 'heartbeat';
  timestamp: Date;
  data: RealTimeData | SystemStatus | ErrorInfo | Heartbeat;
  sequence: number;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number; // seconds
  activeConnections: number;
  dataFeeds: DataFeed[];
  lastHealthCheck: Date;
  performance: {
    averageResponseTime: number; // milliseconds
    errorRate: number; // percentage
    throughput: number; // messages per second
  };
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  recoverable: boolean;
}

export interface Heartbeat {
  clientId: string;
  timestamp: Date;
  status: 'connected' | 'disconnected' | 'reconnecting';
}

export interface RealTimeConfig {
  websocket: {
    url: string;
    reconnectInterval: number; // milliseconds
    maxReconnectAttempts: number;
    heartbeatInterval: number; // milliseconds
  };
  dataFeeds: {
    weather: DataFeed[];
    traffic: DataFeed[];
    emergency: DataFeed[];
    buildings: DataFeed[];
    terrain: DataFeed[];
  };
  updateSettings: {
    maxUpdateFrequency: number; // seconds
    batchUpdates: boolean;
    compression: boolean;
    fallbackToPolling: boolean;
  };
  performance: {
    maxConcurrentUpdates: number;
    updateQueueSize: number;
    timeout: number; // milliseconds
  };
}

export interface UpdateSubscription {
  id: string;
  clientId: string;
  dataTypes: RealTimeData['type'][];
  locations?: [number, number][]; // Geographic bounds
  severity?: RealTimeData['severity'][];
  callback: (data: RealTimeData) => void;
  active: boolean;
  createdAt: Date;
  lastUsed: Date;
}
