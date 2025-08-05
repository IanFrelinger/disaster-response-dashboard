// TypeScript interfaces for hazard data

export interface HazardZone {
  id: string;
  geometry: GeoJSON.Polygon;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
  dataSource: 'FIRMS' | 'NOAA' | 'USGS';
  riskScore: number;
  h3Index?: string;
  brightness?: number;
  confidence?: number;
  acqDate?: Date;
}

export interface SafeRoute {
  id: string;
  origin: [number, number]; // [lat, lon]
  destination: [number, number]; // [lat, lon]
  route: GeoJSON.LineString;
  hazardAvoided: boolean;
  distance: number;
  estimatedTime: number;
}

export interface RiskAssessment {
  totalNearbyHazards: number;
  riskLevels: Record<string, number>;
  avgRiskScore: number;
  maxRiskScore: number;
  closestHazardDistanceKm: number | null;
  assessmentRadiusKm: number;
  location: {
    latitude: number;
    longitude: number;
  };
  assessmentTimestamp: string;
}

export interface HazardSummary {
  totalHazards: number;
  riskDistribution: Record<string, number>;
  dataSources: Record<string, number>;
  lastUpdated: string | null;
  bbox: [number, number, number, number] | null; // [minLon, minLat, maxLon, maxLat]
}

export interface EvacuationRoutesResponse {
  routes: SafeRoute[];
  hazardCount: number;
  availableRoutes: number;
  generatedAt: string;
} 