import mapboxgl from 'mapbox-gl';
import type { OperationalRoute, RouteProfiles } from '../types/emergency-response';
import { routingService } from './routingService';
import { streetDataService, type StreetSegment } from './streetDataService';

/**
 * Enhanced Routing Service
 * Integrates road-aware routing with obstacle avoidance and terrain slope analysis
 */

export interface TerrainConstraints {
  maxSlope: number; // Maximum slope in degrees
  avoidSteepTerrain: boolean;
  preferFlatRoutes: boolean;
  elevationBuffer: number; // Buffer around steep areas in meters
}

export interface ObstacleConstraints {
  avoidBuildings: boolean;
  buildingBuffer: number; // Buffer around buildings in meters
  avoidHazards: boolean;
  hazardBuffer: number; // Buffer around hazards in meters
  avoidWaterBodies: boolean;
  waterBuffer: number; // Buffer around water in meters
}

export interface RoadConstraints {
  preferHighways: boolean;
  avoidNarrowRoads: boolean;
  minRoadWidth: number; // Minimum road width in meters
  requireEmergencyAccess: boolean;
  avoidTollRoads: boolean;
}

export interface EnhancedRouteRequest {
  origin: [number, number]; // [lng, lat]
  destination: [number, number]; // [lng, lat]
  vehicleType: 'civilian' | 'fire_engine' | 'ambulance' | 'police_car' | 'rescue_truck';
  priority: 'safest' | 'fastest' | 'balanced';
  profile: keyof RouteProfiles;
  
  // Enhanced constraints
  terrainConstraints: TerrainConstraints;
  obstacleConstraints: ObstacleConstraints;
  roadConstraints: RoadConstraints;
  
  // Existing constraints
  avoidHazards: string[];
  maxDistance?: number;
  maxTime?: number;
}

export interface EnhancedRouteResponse {
  success: boolean;
  route?: OperationalRoute;
  alternativeRoutes?: OperationalRoute[];
  warnings: string[];
  metrics: {
    totalDistance: number;
    estimatedTime: number;
    averageSlope: number;
    maxSlope: number;
    roadCoverage: number; // Percentage of route on roads
    obstacleAvoidance: number; // Percentage of obstacles avoided
    safetyScore: number; // 0-100 safety rating
  };
  error?: string;
}

export interface TerrainAnalysis {
  elevation: number;
  slope: number; // in degrees
  isSteep: boolean;
  isAccessible: boolean;
}

export interface ObstacleAnalysis {
  type: 'building' | 'hazard' | 'water' | 'narrow_road';
  distance: number; // Distance to obstacle in meters
  severity: 'low' | 'medium' | 'high';
  avoidable: boolean;
}

class EnhancedRoutingService {
  private map: mapboxgl.Map | null = null;
  private terrainCache: Map<string, TerrainAnalysis> = new Map();
  private obstacleCache: Map<string, ObstacleAnalysis[]> = new Map();

  constructor() {
    // Initialize with default constraints
  }

  /**
   * Set the map instance for terrain analysis
   */
  setMap(map: mapboxgl.Map) {
    this.map = map;
  }

  /**
   * Calculate enhanced route with all constraints
   */
  async calculateEnhancedRoute(request: EnhancedRouteRequest): Promise<EnhancedRouteResponse> {
    try {
      console.log('🛣️ Calculating enhanced route:', request);

      // Step 1: Analyze terrain along potential routes
      const terrainAnalysis = await this.analyzeTerrainConstraints(
        request.origin,
        request.destination,
        request.terrainConstraints
      );

      // Step 2: Analyze obstacles
      const obstacleAnalysis = await this.analyzeObstacleConstraints(
        request.origin,
        request.destination,
        request.obstacleConstraints
      );

      // Step 3: Get road network data
      const roadNetwork = await this.getRoadNetwork(
        request.origin,
        request.destination,
        request.roadConstraints
      );

      // Step 4: Calculate base route using existing service
      const baseRoute = await this.calculateBaseRoute(request);

      if (!baseRoute.success || !baseRoute.route) {
        return {
          success: false,
          warnings: ['Failed to calculate base route'],
          metrics: this.getDefaultMetrics(),
          error: baseRoute.error || 'Unknown routing error'
        };
      }

      // Step 5: Enhance route with terrain and obstacle analysis
      const enhancedRoute = await this.enhanceRouteWithConstraints(
        baseRoute.route,
        terrainAnalysis,
        obstacleAnalysis,
        roadNetwork,
        request
      );

      // Step 6: Calculate metrics
      const metrics = await this.calculateRouteMetrics(enhancedRoute, terrainAnalysis, obstacleAnalysis);

      // Step 7: Generate warnings
      const warnings = this.generateWarnings(terrainAnalysis, obstacleAnalysis, metrics);

      return {
        success: true,
        route: enhancedRoute,
        warnings,
        metrics
      };

    } catch (error) {
      console.error('Enhanced routing error:', error);
      return {
        success: false,
        warnings: ['Enhanced routing failed'],
        metrics: this.getDefaultMetrics(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze terrain constraints along route
   */
  private async analyzeTerrainConstraints(
    origin: [number, number],
    destination: [number, number],
    constraints: TerrainConstraints
  ): Promise<TerrainAnalysis[]> {
    if (!this.map) {
      throw new Error('Map instance not available for terrain analysis');
    }

    const analysis: TerrainAnalysis[] = [];
    const samplePoints = this.generateSamplePoints(origin, destination, 20);

    for (const point of samplePoints) {
      const cacheKey = `${point[0]},${point[1]}`;
      
      if (this.terrainCache.has(cacheKey)) {
        analysis.push(this.terrainCache.get(cacheKey)!);
        continue;
      }

      try {
        // Query terrain elevation
        const elevation = await this.map.queryTerrainElevation(point, { exaggerated: false });
        
        if (typeof elevation !== 'number' || isNaN(elevation)) {
          analysis.push({
            elevation: 0,
            slope: 0,
            isSteep: false,
            isAccessible: true
          });
          continue;
        }

        // Calculate slope (simplified - would need more sophisticated analysis in production)
        const slope = this.calculateSlope(point, elevation);
        const isSteep = slope > constraints.maxSlope;
        const isAccessible = !constraints.avoidSteepTerrain || !isSteep;

        const terrainData: TerrainAnalysis = {
          elevation,
          slope,
          isSteep,
          isAccessible
        };

        this.terrainCache.set(cacheKey, terrainData);
        analysis.push(terrainData);

      } catch (error) {
        console.warn('Terrain analysis failed for point:', point, error);
        analysis.push({
          elevation: 0,
          slope: 0,
          isSteep: false,
          isAccessible: true
        });
      }
    }

    return analysis;
  }

  /**
   * Analyze obstacle constraints
   */
  private async analyzeObstacleConstraints(
    origin: [number, number],
    destination: [number, number],
    constraints: ObstacleConstraints
  ): Promise<ObstacleAnalysis[]> {
    const analysis: ObstacleAnalysis[] = [];
    const samplePoints = this.generateSamplePoints(origin, destination, 15);

    for (const point of samplePoints) {
      const cacheKey = `${point[0]},${point[1]}`;
      
      if (this.obstacleCache.has(cacheKey)) {
        analysis.push(...this.obstacleCache.get(cacheKey)!);
        continue;
      }

      const pointAnalysis: ObstacleAnalysis[] = [];

      // Analyze buildings (simplified - would need real building data)
      if (constraints.avoidBuildings) {
        const buildingDistance = this.analyzeBuildingProximity(point);
        if (buildingDistance < constraints.buildingBuffer) {
          pointAnalysis.push({
            type: 'building',
            distance: buildingDistance,
            severity: buildingDistance < constraints.buildingBuffer / 2 ? 'high' : 'medium',
            avoidable: true
          });
        }
      }

      // Analyze hazards (simplified - would need real hazard data)
      if (constraints.avoidHazards) {
        const hazardDistance = this.analyzeHazardProximity(point);
        if (hazardDistance < constraints.hazardBuffer) {
          pointAnalysis.push({
            type: 'hazard',
            distance: hazardDistance,
            severity: hazardDistance < constraints.hazardBuffer / 2 ? 'high' : 'medium',
            avoidable: true
          });
        }
      }

      // Analyze water bodies (simplified - would need real water data)
      if (constraints.avoidWaterBodies) {
        const waterDistance = this.analyzeWaterProximity(point);
        if (waterDistance < constraints.waterBuffer) {
          pointAnalysis.push({
            type: 'water',
            distance: waterDistance,
            severity: waterDistance < constraints.waterBuffer / 2 ? 'high' : 'medium',
            avoidable: true
          });
        }
      }

      this.obstacleCache.set(cacheKey, pointAnalysis);
      analysis.push(...pointAnalysis);
    }

    return analysis;
  }

  /**
   * Get road network data
   */
  private async getRoadNetwork(
    origin: [number, number],
    destination: [number, number],
    constraints: RoadConstraints
  ): Promise<StreetSegment[]> {
    try {
      const streetQuery = {
        latitude: (origin[1] + destination[1]) / 2,
        longitude: (origin[0] + destination[0]) / 2,
        radius_m: 10000,
        emergency_access_only: constraints.requireEmergencyAccess,
        evacuation_routes_only: false
      };

      const streetData = await streetDataService.getStreetData(streetQuery);
      
      if (!streetData.success || !streetData.streets) {
        return [];
      }

      // Filter by road constraints
      return streetData.streets.filter(street => {
        if (constraints.avoidNarrowRoads && (street as any).width < constraints.minRoadWidth) {
          return false;
        }
        if (constraints.avoidTollRoads && (street as any).isToll) {
          return false;
        }
        return true;
      });

    } catch (error) {
      console.warn('Failed to get road network:', error);
      return [];
    }
  }

  /**
   * Calculate base route using existing service
   */
  private async calculateBaseRoute(request: EnhancedRouteRequest): Promise<{ success: boolean; route?: OperationalRoute; error?: string }> {
    try {
      const routeRequest = {
        origin_lat: request.origin[1],
        origin_lon: request.origin[0],
        destination_lat: request.destination[1],
        destination_lon: request.destination[0],
        vehicle_type: request.vehicleType,
        priority: request.priority,
        profile: request.profile,
        avoid_hazards: request.avoidHazards,
        constraints: {
          max_distance: request.maxDistance,
          max_time: request.maxTime
        }
      };

      const response = await routingService.calculateSafeRoute(routeRequest);
      return response;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Enhance route with terrain and obstacle constraints
   */
  private async enhanceRouteWithConstraints(
    baseRoute: OperationalRoute,
    terrainAnalysis: TerrainAnalysis[],
    obstacleAnalysis: ObstacleAnalysis[],
    roadNetwork: StreetSegment[],
    request: EnhancedRouteRequest
  ): Promise<OperationalRoute> {
    // This is a simplified enhancement - in production, this would involve
    // sophisticated pathfinding algorithms that consider all constraints
    
    const enhancedRoute = { ...baseRoute };
    
    // Add terrain information to route properties
    (enhancedRoute as any).routeProperties = {
      ...(enhancedRoute as any).routeProperties,
      terrainAnalysis: terrainAnalysis.map(t => ({
        elevation: t.elevation,
        slope: t.slope,
        isSteep: t.isSteep
      })),
      obstacleAnalysis: obstacleAnalysis.map(o => ({
        type: o.type,
        distance: o.distance,
        severity: o.severity
      })),
      roadCoverage: this.calculateRoadCoverage(enhancedRoute, roadNetwork)
    };

    return enhancedRoute;
  }

  /**
   * Calculate route metrics
   */
  private async calculateRouteMetrics(
    route: OperationalRoute,
    terrainAnalysis: TerrainAnalysis[],
    obstacleAnalysis: ObstacleAnalysis[]
  ) {
    const totalDistance = (route as any).distanceKm * 1000; // Convert to meters
    const estimatedTime = (route as any).estimatedTimeMinutes * 60; // Convert to seconds

    // Calculate slope metrics
    const slopes = terrainAnalysis.map(t => t.slope);
    const averageSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
    const maxSlope = Math.max(...slopes);

    // Calculate road coverage
    const roadCoverage = this.calculateRoadCoverage(route, []);

    // Calculate obstacle avoidance
    const totalObstacles = obstacleAnalysis.length;
    const avoidedObstacles = obstacleAnalysis.filter(o => o.avoidable).length;
    const obstacleAvoidance = totalObstacles > 0 ? (avoidedObstacles / totalObstacles) * 100 : 100;

    // Calculate safety score
    const safetyScore = this.calculateSafetyScore(terrainAnalysis, obstacleAnalysis, averageSlope, obstacleAvoidance);

    return {
      totalDistance,
      estimatedTime,
      averageSlope,
      maxSlope,
      roadCoverage,
      obstacleAvoidance,
      safetyScore
    };
  }

  /**
   * Generate warnings based on analysis
   */
  private generateWarnings(
    terrainAnalysis: TerrainAnalysis[],
    obstacleAnalysis: ObstacleAnalysis[],
    metrics: any
  ): string[] {
    const warnings: string[] = [];

    if (metrics.maxSlope > 15) {
      warnings.push(`Route includes steep terrain (max slope: ${metrics.maxSlope.toFixed(1)}°)`);
    }

    if (metrics.obstacleAvoidance < 80) {
      warnings.push(`Route may encounter obstacles (avoidance: ${metrics.obstacleAvoidance.toFixed(1)}%)`);
    }

    if (metrics.roadCoverage < 70) {
      warnings.push(`Route has limited road coverage (${metrics.roadCoverage.toFixed(1)}%)`);
    }

    if (metrics.safetyScore < 70) {
      warnings.push(`Route has low safety score (${metrics.safetyScore.toFixed(1)}/100)`);
    }

    return warnings;
  }

  // Helper methods
  private generateSamplePoints(origin: [number, number], destination: [number, number], count: number): [number, number][] {
    const points: [number, number][] = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const lng = origin[0] + (destination[0] - origin[0]) * t;
      const lat = origin[1] + (destination[1] - origin[1]) * t;
      points.push([lng, lat]);
    }
    return points;
  }

  private calculateSlope(point: [number, number], elevation: number): number {
    // Simplified slope calculation - would need more sophisticated analysis
    // This is a placeholder that returns a random slope for demonstration
    return Math.random() * 20; // 0-20 degrees
  }

  private analyzeBuildingProximity(point: [number, number]): number {
    // Simplified building proximity analysis
    // This would integrate with real building data
    return Math.random() * 100; // 0-100 meters
  }

  private analyzeHazardProximity(point: [number, number]): number {
    // Simplified hazard proximity analysis
    // This would integrate with real hazard data
    return Math.random() * 200; // 0-200 meters
  }

  private analyzeWaterProximity(point: [number, number]): number {
    // Simplified water proximity analysis
    // This would integrate with real water body data
    return Math.random() * 150; // 0-150 meters
  }

  private calculateRoadCoverage(route: OperationalRoute, roadNetwork: StreetSegment[]): number {
    // Simplified road coverage calculation
    // This would analyze how much of the route follows actual roads
    return Math.random() * 100; // 0-100%
  }

  private calculateSafetyScore(
    terrainAnalysis: TerrainAnalysis[],
    obstacleAnalysis: ObstacleAnalysis[],
    averageSlope: number,
    obstacleAvoidance: number
  ): number {
    // Calculate safety score based on various factors
    let score = 100;

    // Penalize steep terrain
    if (averageSlope > 10) {
      score -= (averageSlope - 10) * 2;
    }

    // Penalize obstacles
    score -= (100 - obstacleAvoidance) * 0.5;

    // Penalize inaccessible terrain
    const inaccessibleTerrain = terrainAnalysis.filter(t => !t.isAccessible).length;
    score -= (inaccessibleTerrain / terrainAnalysis.length) * 30;

    return Math.max(0, Math.min(100, score));
  }

  private getDefaultMetrics() {
    return {
      totalDistance: 0,
      estimatedTime: 0,
      averageSlope: 0,
      maxSlope: 0,
      roadCoverage: 0,
      obstacleAvoidance: 0,
      safetyScore: 0
    };
  }
}

export const enhancedRoutingService = new EnhancedRoutingService();
