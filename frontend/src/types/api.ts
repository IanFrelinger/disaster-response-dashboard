export interface HazardZone {
  id: string
  geometry: {
    type: string
    coordinates: number[][][]
  }
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastUpdated: string
  dataSource: string
  riskScore: number
  h3Index?: string
  brightness?: number
  confidence?: number
  acqDate?: string
}

export interface SafeRoute {
  id: string
  origin: [number, number]
  destination: [number, number]
  route: {
    type: string
    coordinates: number[][]
  }
  hazardAvoided: boolean
  distance: number
  estimatedTime: number
}

export interface RiskAssessment {
  totalNearbyHazards: number
  riskLevels: Record<string, number>
  avgRiskScore: number
  maxRiskScore: number
  closestHazardDistanceKm?: number
  assessmentRadiusKm: number
  location: {
    latitude: number
    longitude: number
  }
  assessmentTimestamp: string
}

export interface DashboardData {
  hazards: HazardZone[]
  routes: SafeRoute[]
  summary: {
    totalHazards: number
    riskDistribution: Record<string, number>
    dataSources: Record<string, number>
    lastUpdated: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: number
  error?: string
}
