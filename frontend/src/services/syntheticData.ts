import { HazardZone, SafeRoute, RiskAssessment, HazardSummary, EvacuationRoutesResponse } from '../types/hazard';
import { logger } from '../config/environment';


// Synthetic data generator for demo mode
export class SyntheticDataGenerator {
  private static readonly SAN_FRANCISCO_CENTER = [-122.4194, 37.7749];
  private static readonly BAY_AREA_BOUNDS = {
    minLat: 37.4,
    maxLat: 38.2,
    minLng: -122.8,
    maxLng: -121.8
  };

  // Generate random coordinates within Bay Area bounds
  private static randomCoordinate(): [number, number] {
    const lat = this.BAY_AREA_BOUNDS.minLat + Math.random() * (this.BAY_AREA_BOUNDS.maxLat - this.BAY_AREA_BOUNDS.minLat);
    const lng = this.BAY_AREA_BOUNDS.minLng + Math.random() * (this.BAY_AREA_BOUNDS.maxLng - this.BAY_AREA_BOUNDS.minLng);
    return [lng, lat];
  }

  // Generate a polygon around a center point
  private static generatePolygon(center: [number, number], radiusKm: number = 0.05): GeoJSON.Polygon {
    const [centerLng, centerLat] = center;
    const radiusDeg = radiusKm / 111; // Approximate conversion
    
    const points = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const lat = centerLat + radiusDeg * Math.cos(angle);
      const lng = centerLng + radiusDeg * Math.sin(angle);
      points.push([lng, lat]);
    }
    points.push(points[0]); // Close the polygon
    
    return {
      type: 'Polygon',
      coordinates: [points]
    };
  }

  // Generate a line string for routes
  private static generateRoute(origin: [number, number], destination: [number, number]): GeoJSON.LineString {
    const [originLng, originLat] = origin;
    const [destLng, destLat] = destination;
    
    // Create a simple route with a few waypoints
    const waypoints = [
      [originLng, originLat],
      [originLng + (destLng - originLng) * 0.3, originLat + (destLat - originLat) * 0.3],
      [originLng + (destLng - originLng) * 0.7, originLat + (destLat - originLat) * 0.7],
      [destLng, destLat]
    ];
    
    return {
      type: 'LineString',
      coordinates: waypoints
    };
  }

  // Generate synthetic hazard zones
  static generateHazardZones(count: number = 15): HazardZone[] {
    logger.debug(`Generating ${count} hazard zones`);
    const hazardZones: HazardZone[] = [];
    const riskLevels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    const dataSources: Array<'FIRMS' | 'NOAA' | 'USGS'> = ['FIRMS', 'NOAA', 'USGS'];

    for (let i = 0; i < count; i++) {
      const center = this.randomCoordinate();
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const dataSource = dataSources[Math.floor(Math.random() * dataSources.length)];
      
      // Risk score based on risk level
      let riskScore: number;
      switch (riskLevel) {
        case 'low': riskScore = 0.1 + Math.random() * 0.3; break;
        case 'medium': riskScore = 0.4 + Math.random() * 0.3; break;
        case 'high': riskScore = 0.7 + Math.random() * 0.2; break;
        case 'critical': riskScore = 0.9 + Math.random() * 0.1; break;
      }

      const hazardZone: HazardZone = {
        id: `hazard-${i + 1}`,
        geometry: this.generatePolygon(center, 0.02 + Math.random() * 0.08),
        riskLevel,
        riskScore,
        lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24 hours
        dataSource,
        h3Index: `h3-${Math.random().toString(36).substr(2, 9)}`,
        brightness: riskLevel === 'critical' || riskLevel === 'high' ? 300 + Math.random() * 200 : undefined,
        confidence: 70 + Math.random() * 30,
        acqDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
      };

      hazardZones.push(hazardZone);
    }

    return hazardZones;
  }

  // Generate synthetic safe routes
  static generateSafeRoutes(count: number = 8): SafeRoute[] {
    logger.debug(`Generating ${count} safe routes`);
    const safeRoutes: SafeRoute[] = [];

    for (let i = 0; i < count; i++) {
      const origin = this.randomCoordinate();
      const destination = this.randomCoordinate();
      const route = this.generateRoute(origin, destination);
      
      // Calculate distance (simplified)
      const distance = Math.sqrt(
        Math.pow(destination[0] - origin[0], 2) + Math.pow(destination[1] - origin[1], 2)
      ) * 111; // Rough conversion to km
      
      const safeRoute: SafeRoute = {
        id: `route-${i + 1}`,
        origin: [origin[1], origin[0]], // Convert to [lat, lng]
        destination: [destination[1], destination[0]], // Convert to [lat, lng]
        route,
        hazardAvoided: Math.random() > 0.3, // 70% chance of avoiding hazards
        distance,
        estimatedTime: distance * (2 + Math.random() * 3) // 2-5 minutes per km
      };

      safeRoutes.push(safeRoute);
    }

    return safeRoutes;
  }

  // Generate synthetic risk assessment
  static generateRiskAssessment(location: [number, number] = this.SAN_FRANCISCO_CENTER as [number, number]): RiskAssessment {
    logger.debug(`Generating risk assessment for location: ${location[0]}, ${location[1]}`);
    const nearbyHazards = Math.floor(Math.random() * 10) + 1;
    const riskLevels = {
      low: Math.floor(Math.random() * 5),
      medium: Math.floor(Math.random() * 8),
      high: Math.floor(Math.random() * 3),
      critical: Math.floor(Math.random() * 2)
    };

    const totalHazards = Object.values(riskLevels).reduce((sum, count) => sum + count, 0);
    const avgRiskScore = 0.3 + Math.random() * 0.6;
    const maxRiskScore = 0.7 + Math.random() * 0.3;

    return {
      totalNearbyHazards: totalHazards,
      riskLevels,
      avgRiskScore,
      maxRiskScore,
      closestHazardDistanceKm: Math.random() * 5,
      assessmentRadiusKm: 10,
      location: {
        latitude: location[1],
        longitude: location[0]
      },
      assessmentTimestamp: new Date().toISOString()
    };
  }

  // Generate synthetic hazard summary
  static generateHazardSummary(): HazardSummary {
    logger.debug('Generating hazard summary');
    const totalHazards = Math.floor(Math.random() * 50) + 20;
    const riskDistribution = {
      low: Math.floor(Math.random() * 15) + 5,
      medium: Math.floor(Math.random() * 20) + 10,
      high: Math.floor(Math.random() * 10) + 3,
      critical: Math.floor(Math.random() * 5) + 1
    };

    const dataSources = {
      FIRMS: Math.floor(Math.random() * 20) + 10,
      NOAA: Math.floor(Math.random() * 15) + 5,
      USGS: Math.floor(Math.random() * 10) + 3
    };

    return {
      totalHazards,
      riskDistribution,
      dataSources,
      lastUpdated: new Date().toISOString(),
      bbox: [this.BAY_AREA_BOUNDS.minLng, this.BAY_AREA_BOUNDS.minLat, 
             this.BAY_AREA_BOUNDS.maxLng, this.BAY_AREA_BOUNDS.maxLat]
    };
  }

  // Generate evacuation routes response
  static generateEvacuationRoutesResponse(): EvacuationRoutesResponse {
    logger.debug('Generating evacuation routes response');
    const routes = this.generateSafeRoutes(5);
    
    return {
      routes,
      hazardCount: Math.floor(Math.random() * 20) + 5,
      availableRoutes: routes.length,
      generatedAt: new Date().toISOString()
    };
  }

  // Generate complete dashboard data
  static generateDashboardData() {
    logger.debug('Generating complete dashboard data');
    const data = {
      hazardZones: this.generateHazardZones(20),
      safeRoutes: this.generateSafeRoutes(12),
      riskAssessment: this.generateRiskAssessment(),
      hazardSummary: this.generateHazardSummary(),
      evacuationRoutes: this.generateEvacuationRoutesResponse()
    };



    return data;
  }

  // Generate data for specific scenarios
  static generateScenarioData(scenario: 'wildfire' | 'earthquake' | 'flood' | 'normal') {
    logger.debug(`Generating ${scenario} scenario data`);
    
    let hazardCount = 15;
    let criticalRiskPercentage = 0.1;
    
    switch (scenario) {
      case 'wildfire':
        hazardCount = 30;
        criticalRiskPercentage = 0.3;
        break;
      case 'earthquake':
        hazardCount = 25;
        criticalRiskPercentage = 0.4;
        break;
      case 'flood':
        hazardCount = 20;
        criticalRiskPercentage = 0.25;
        break;
      case 'normal':
      default:
        hazardCount = 15;
        criticalRiskPercentage = 0.1;
        break;
    }
    
    const data = {
      hazardZones: this.generateHazardZones(hazardCount),
      safeRoutes: this.generateSafeRoutes(10),
      riskAssessment: this.generateRiskAssessment(),
      hazardSummary: this.generateHazardSummary(),
      evacuationRoutes: this.generateEvacuationRoutesResponse()
    };



    return data;
  }
} 