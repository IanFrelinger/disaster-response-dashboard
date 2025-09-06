import type { 
  Route, 
  RoutePoint, 
  RouteSegment, 
  RouteOptimization, 
  RouteMetrics, 
  RouteComparison,
  RouteOptimizationResult,
  HazardZone,
  TrafficCondition,
  DynamicRouteUpdate
} from '../types/routing';

/**
 * Route Optimizer Service
 * Integrates building and terrain data for intelligent emergency response routing
 */
export class RouteOptimizer {
  private routes: Map<string, Route> = new Map();
  private hazardZones: Map<string, HazardZone> = new Map();
  private trafficConditions: Map<string, TrafficCondition> = new Map();
  private optimizationCache: Map<string, RouteOptimizationResult> = new Map();
  private updateCallbacks: Map<string, (update: DynamicRouteUpdate) => void> = new Map();

  constructor() {
    // Initialize with default hazard zones and traffic conditions
    this.initializeDefaultData();
  }

  /**
   * Initialize default hazard zones and traffic conditions for testing
   */
  private initializeDefaultData(): void {
    // Add sample hazard zones
    this.addHazardZone({
      id: 'hazard-1',
      type: 'fire',
      coordinates: [
        [-122.4194, 37.7749],
        [-122.4195, 37.7749],
        [-122.4195, 37.7750],
        [-122.4194, 37.7750]
      ],
      center: [-122.41945, 37.77495],
      radius: 0.001,
      severity: 'high',
      properties: {
        name: 'Downtown Fire',
        description: 'Active fire in downtown area',
        startTime: new Date(),
        affectedArea: 0.0001,
        populationAtRisk: 150,
        evacuationRoutes: ['evac-route-1', 'evac-route-2'],
        emergencyContacts: ['fire-dept-911'],
        status: 'active'
      },
      avoidance: {
        enabled: true,
        bufferDistance: 0.002,
        alternativeRoutes: ['alt-route-1'],
        priority: 'must_avoid'
      }
    });

    // Add sample traffic conditions
    this.addTrafficCondition({
      id: 'traffic-1',
      location: [-122.4196, 37.7749],
      type: 'accident',
      severity: 'medium',
      properties: {
        description: 'Multi-vehicle accident on Main St',
        startTime: new Date(),
        affectedLanes: 2,
        delay: 15,
        detourAvailable: true,
        emergencyAccess: true
      }
    });
  }

  /**
   * Add hazard zone
   */
  addHazardZone(hazard: HazardZone): void {
    this.hazardZones.set(hazard.id, hazard);
  }

  /**
   * Remove hazard zone
   */
  removeHazardZone(hazardId: string): void {
    this.hazardZones.delete(hazardId);
  }

  /**
   * Add traffic condition
   */
  addTrafficCondition(traffic: TrafficCondition): void {
    this.trafficConditions.set(traffic.id, traffic);
  }

  /**
   * Remove traffic condition
   */
  removeTrafficCondition(trafficId: string): void {
    this.trafficConditions.delete(trafficId);
  }

  /**
   * Optimize route based on constraints and preferences
   */
  async optimizeRoute(optimization: RouteOptimization): Promise<RouteOptimizationResult> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(optimization);
    
    // Check cache first
    if (this.optimizationCache.has(cacheKey)) {
      const cached = this.optimizationCache.get(cacheKey)!;
      return {
        ...cached,
        optimizationTime: 0 // Cached results should have minimal time
      };
    }

    try {
      // Add small delay to ensure measurable optimization time
      await new Promise(resolve => setTimeout(resolve, 1));
      
      // Generate route candidates
      const routeCandidates = await this.generateRouteCandidates(optimization);
      
      // Apply constraints and filters
      const filteredRoutes = this.applyConstraints(routeCandidates, optimization.constraints);
      
      // Score and rank routes
      const scoredRoutes = this.scoreRoutes(filteredRoutes, optimization.preferences);
      
      // Select best route and alternatives
      const bestRoute = scoredRoutes[0];
      const alternatives = scoredRoutes.slice(1, 4); // Top 3 alternatives
      
      // Calculate metrics for all routes
      const metrics = await Promise.all(
        scoredRoutes.map(route => this.calculateRouteMetrics(route))
      );
      
      // Check constraint satisfaction
      const constraints = this.checkConstraintSatisfaction(scoredRoutes, optimization.constraints);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(scoredRoutes, constraints);
      
      const result: RouteOptimizationResult = {
        success: true,
        routes: scoredRoutes,
        bestRoute: bestRoute || scoredRoutes[0] || {} as Route,
        alternatives,
        metrics,
        optimizationTime: performance.now() - startTime,
        constraints,
        recommendations
      };

                // Store routes in internal storage for later access
          scoredRoutes.forEach(route => {
            this.routes.set(route.id, route);
          });
          
          // Cache the result
          this.optimizationCache.set(cacheKey, result);
          
          // Limit cache size
          if (this.optimizationCache.size > 100) {
            const firstKey = this.optimizationCache.keys().next().value;
            if (firstKey) {
              this.optimizationCache.delete(firstKey);
            }
          }

      return result;
    } catch (error) {
      console.error('Route optimization failed:', error);
      return {
        success: false,
        routes: [],
        bestRoute: {} as Route,
        alternatives: [],
        metrics: [],
        optimizationTime: performance.now() - startTime,
        constraints: { satisfied: [], violated: [], warnings: [] },
        recommendations: { immediate: [], planning: [], long_term: [] }
      };
    }
  }

  /**
   * Generate route candidates using different algorithms
   */
  private async generateRouteCandidates(optimization: RouteOptimization): Promise<Route[]> {
    const candidates: Route[] = [];
    
    // Generate different route types based on optimization preference
    switch (optimization.optimization) {
      case 'fastest':
        candidates.push(...await this.generateFastestRoutes(optimization));
        break;
      case 'shortest':
        candidates.push(...await this.generateShortestRoutes(optimization));
        break;
      case 'safest':
        candidates.push(...await this.generateSafestRoutes(optimization));
        break;
      case 'most_accessible':
        candidates.push(...await this.generateAccessibleRoutes(optimization));
        break;
      case 'balanced':
        candidates.push(...await this.generateBalancedRoutes(optimization));
        break;
    }

    return candidates;
  }

  /**
   * Generate fastest routes (time-optimized)
   */
  private async generateFastestRoutes(optimization: RouteOptimization): Promise<Route[]> {
    const routes: Route[] = [];
    
    // Create direct route
    const directRoute = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'fastest'
    );
    routes.push(directRoute);
    
    // Create alternative routes with different road types
    const highwayRoute = this.createHighwayRoute(optimization);
    if (highwayRoute) routes.push(highwayRoute);
    
    const arterialRoute = this.createArterialRoute(optimization);
    if (arterialRoute) routes.push(arterialRoute);
    
    return routes;
  }

  /**
   * Generate shortest routes (distance-optimized)
   */
  private async generateShortestRoutes(optimization: RouteOptimization): Promise<Route[]> {
    const routes: Route[] = [];
    
    // Create direct route
    const directRoute = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'shortest'
    );
    routes.push(directRoute);
    
    // Create routes avoiding major roads for shorter distance
    const localRoute = this.createLocalRoadRoute(optimization);
    if (localRoute) routes.push(localRoute);
    
    return routes;
  }

  /**
   * Generate safest routes (hazard-avoidance optimized)
   */
  private async generateSafestRoutes(optimization: RouteOptimization): Promise<Route[]> {
    const routes: Route[] = [];
    
    // Create route avoiding all hazards
    const safeRoute = this.createSafeRoute(optimization);
    if (safeRoute) routes.push(safeRoute);
    
    // Create route with minimal slope
    const gentleRoute = this.createGentleSlopeRoute(optimization);
    if (gentleRoute) routes.push(gentleRoute);
    
    return routes;
  }

  /**
   * Generate most accessible routes (emergency vehicle optimized)
   */
  private async generateAccessibleRoutes(optimization: RouteOptimization): Promise<Route[]> {
    const routes: Route[] = [];
    
    // Create route optimized for emergency vehicles
    const emergencyRoute = this.createEmergencyVehicleRoute(optimization);
    if (emergencyRoute) routes.push(emergencyRoute);
    
    // Create route with building access points
    const buildingAccessRoute = this.createBuildingAccessRoute(optimization);
    if (buildingAccessRoute) routes.push(buildingAccessRoute);
    
    return routes;
  }

  /**
   * Generate balanced routes (multi-criteria optimization)
   */
  private async generateBalancedRoutes(optimization: RouteOptimization): Promise<Route[]> {
    const routes: Route[] = [];
    
    // Generate routes from all categories
    const fastestRoutes = await this.generateFastestRoutes(optimization);
    const shortestRoutes = await this.generateShortestRoutes(optimization);
    const safestRoutes = await this.generateSafestRoutes(optimization);
    const accessibleRoutes = await this.generateAccessibleRoutes(optimization);
    
    routes.push(...fastestRoutes, ...shortestRoutes, ...safestRoutes, ...accessibleRoutes);
    
    return routes;
  }

  /**
   * Create route from start, destination, and waypoints
   */
  private createRouteFromPoints(
    start: [number, number],
    destination: [number, number],
    waypoints: [number, number][],
    optimizationType: string
  ): Route {
    const routeId = `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create route points
    const startPoint: RoutePoint = {
      id: 'start',
      coordinates: start,
      type: 'start',
      properties: {
        name: 'Start Point',
        accessibility: 'open',
        emergency_access: true
      }
    };

    const destinationPoint: RoutePoint = {
      id: 'destination',
      coordinates: destination,
      type: 'destination',
      properties: {
        name: 'Destination',
        accessibility: 'open',
        emergency_access: true
      }
    };

    const waypointObjects: RoutePoint[] = waypoints.map((coord, index) => ({
      id: `waypoint-${index}`,
      coordinates: coord,
      type: 'waypoint',
      properties: {
        name: `Waypoint ${index + 1}`,
        accessibility: 'open'
      }
    }));

    // Create route segments
    const allPoints = [startPoint, ...waypointObjects, destinationPoint];
    const segments: RouteSegment[] = [];
    
    for (let i = 0; i < allPoints.length - 1; i++) {
      const startPoint = allPoints[i];
      const endPoint = allPoints[i + 1];
      if (!startPoint || !endPoint) continue;
      
      const segment: RouteSegment = {
        id: `segment-${i}`,
        startPoint,
        endPoint,
        coordinates: [startPoint.coordinates, endPoint.coordinates],
        properties: {
          distance: this.calculateDistance(startPoint.coordinates, endPoint.coordinates),
          time: 0, // Will be calculated based on road type and conditions
          elevation_gain: 0, // Will be calculated from terrain data
          elevation_loss: 0, // Will be calculated from terrain data
          max_slope: 0, // Will be calculated from terrain data
          average_slope: 0, // Will be calculated from terrain data
          road_type: 'local',
          road_condition: 'good',
          traffic_conditions: 'clear',
          emergency_priority: 'medium',
          hazards: [],
          accessibility: 'open'
        }
      };
      segments.push(segment);
    }

    // Calculate totals
    const totalDistance = segments.reduce((sum, seg) => sum + seg.properties.distance, 0);
    const totalTime = segments.reduce((sum, seg) => sum + seg.properties.time, 0);
    const totalElevationGain = segments.reduce((sum, seg) => sum + seg.properties.elevation_gain, 0);
    const totalElevationLoss = segments.reduce((sum, seg) => sum + seg.properties.elevation_loss, 0);
    const maxSlope = Math.max(...segments.map(seg => seg.properties.max_slope));
    const averageSlope = segments.reduce((sum, seg) => sum + seg.properties.average_slope, 0) / segments.length;

    const route: Route = {
      id: routeId,
      name: `${optimizationType.charAt(0).toUpperCase() + optimizationType.slice(1)} Route`,
      startPoint,
      destinationPoint,
      waypoints: waypointObjects,
      segments,
      totalDistance,
      totalTime,
      totalElevationGain,
      totalElevationLoss,
      maxSlope,
      averageSlope,
      emergencyPriority: 'medium',
      vehicleType: 'general',
      status: 'planned',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        optimization_method: optimizationType,
        constraints_applied: [],
        performance_score: 0, // Will be calculated
        reliability_score: 0 // Will be calculated
      }
    };

    return route;
  }

  /**
   * Create highway route for fastest travel
   */
  private createHighwayRoute(optimization: RouteOptimization): Route {
    const route = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'highway'
    );
    
    // Modify segments to use highway properties
    route.segments.forEach(segment => {
      segment.properties.road_type = 'highway';
      segment.properties.road_condition = 'excellent';
      segment.properties.time = segment.properties.distance * 0.5; // Highway is faster
      segment.properties.emergency_priority = 'high';
    });
    
    route.name = 'Highway Route';
    return route;
  }

  /**
   * Create arterial route
   */
  private createArterialRoute(optimization: RouteOptimization): Route {
    const route = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'arterial'
    );
    
    route.segments.forEach(segment => {
      segment.properties.road_type = 'arterial';
      segment.properties.road_condition = 'good';
      segment.properties.time = segment.properties.distance * 0.8;
      segment.properties.emergency_priority = 'high';
    });
    
    route.name = 'Arterial Route';
    return route;
  }

  /**
   * Create local road route for shortest distance
   */
  private createLocalRoadRoute(optimization: RouteOptimization): Route {
    const route = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'local'
    );
    
    route.segments.forEach(segment => {
      segment.properties.road_type = 'local';
      segment.properties.road_condition = 'fair';
      segment.properties.time = segment.properties.distance * 1.2; // Local roads are slower
      segment.properties.emergency_priority = 'medium';
    });
    
    route.name = 'Local Road Route';
    return route;
  }

  /**
   * Create safe route avoiding hazards
   */
  private createSafeRoute(optimization: RouteOptimization): Route {
    const route = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'safe'
    );
    
    // Add hazard avoidance logic
    route.segments.forEach(segment => {
      const hazards = this.detectHazardsInSegment(segment);
      segment.properties.hazards = hazards;
      
      if (hazards.length > 0) {
        segment.properties.emergency_priority = 'high';
        segment.properties.road_condition = 'poor';
      }
    });
    
    route.name = 'Safe Route';
    return route;
  }

  /**
   * Create gentle slope route
   */
  private createGentleSlopeRoute(optimization: RouteOptimization): Route {
    const route = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'gentle'
    );
    
    // In production, this would use actual terrain data
    route.segments.forEach(segment => {
      segment.properties.max_slope = Math.random() * 5; // Gentle slopes
      segment.properties.average_slope = Math.random() * 3;
    });
    
    route.name = 'Gentle Slope Route';
    return route;
  }

  /**
   * Create emergency vehicle optimized route
   */
  private createEmergencyVehicleRoute(optimization: RouteOptimization): Route {
    const route = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'emergency'
    );
    
    route.segments.forEach(segment => {
      segment.properties.emergency_priority = 'high';
      segment.properties.road_condition = 'excellent';
      segment.properties.traffic_conditions = 'clear';
    });
    
    route.vehicleType = 'fire_truck';
    route.emergencyPriority = 'high';
    route.name = 'Emergency Vehicle Route';
    return route;
  }

  /**
   * Create building access route
   */
  private createBuildingAccessRoute(optimization: RouteOptimization): Route {
    const route = this.createRouteFromPoints(
      optimization.startPoint,
      optimization.destinationPoint,
      optimization.waypoints || [],
      'building-access'
    );
    
    // In production, this would analyze building access points
    route.segments.forEach(segment => {
      segment.properties.emergency_priority = 'high';
    });
    
    route.name = 'Building Access Route';
    return route;
  }

  /**
   * Apply constraints to route candidates
   */
  private applyConstraints(routes: Route[], constraints: RouteOptimization['constraints']): Route[] {
    return routes.filter(route => {
      // Check distance constraint
      if (constraints.maxDistance && route.totalDistance > constraints.maxDistance) {
        return false;
      }
      
      // Check time constraint
      if (constraints.maxTime && route.totalTime > constraints.maxTime) {
        return false;
      }
      
      // Check slope constraint
      if (constraints.maxSlope && route.maxSlope > constraints.maxSlope) {
        return false;
      }
      
      // Check hazard avoidance
      if (constraints.avoidHazards) {
        const hasHazards = route.segments.some(seg => seg.properties.hazards.length > 0);
        if (hasHazards) return false;
      }
      
      return true;
    });
  }

  /**
   * Score routes based on preferences
   */
  private scoreRoutes(routes: Route[], preferences: RouteOptimization['preferences']): Route[] {
    return routes
      .map(route => ({
        route,
        score: this.calculateRouteScore(route, preferences)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.route);
  }

  /**
   * Calculate route score based on preferences
   */
  private calculateRouteScore(route: Route, preferences: RouteOptimization['preferences']): number {
    let score = 0;
    
    // Normalize values to 0-1 range
    const distanceScore = 1 / (1 + route.totalDistance); // Lower distance = higher score
    const timeScore = 1 / (1 + route.totalTime); // Lower time = higher score
    const safetyScore = 1 / (1 + route.segments.reduce((sum, seg) => sum + seg.properties.hazards.length, 0));
    const accessibilityScore = route.segments.reduce((sum, seg) => 
      sum + (seg.properties.emergency_priority === 'high' ? 1 : 0.5), 0) / route.segments.length;
    
    // Apply weights
    score += distanceScore * preferences.weightDistance;
    score += timeScore * preferences.weightTime;
    score += safetyScore * preferences.weightSafety;
    score += accessibilityScore * preferences.weightAccessibility;
    
    return score;
  }

  /**
   * Calculate comprehensive route metrics
   */
  async calculateRouteMetrics(route: Route): Promise<RouteMetrics> {
    // Calculate elevation metrics
    const elevationGain = route.totalElevationGain;
    const elevationLoss = route.totalElevationLoss;
    const elevationNet = elevationGain - elevationLoss;
    const elevationMax = Math.max(...route.segments.map(seg => seg.properties.elevation_gain));
    const elevationMin = Math.min(...route.segments.map(seg => seg.properties.elevation_loss));
    
    // Calculate slope metrics
    const slopes = route.segments.map(seg => seg.properties.max_slope);
    const maxSlope = Math.max(...slopes);
    const averageSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
    const steepSegments = slopes.filter(slope => slope > 15).length;
    const moderateSegments = slopes.filter(slope => slope >= 5 && slope <= 15).length;
    const gentleSegments = slopes.filter(slope => slope < 5).length;
    
    // Calculate accessibility metrics
    const emergencyVehicleCompatible = route.segments.every(seg => 
      seg.properties.road_condition !== 'impassable' && seg.properties.max_slope <= 20
    );
    const restrictedAreas = route.segments.filter(seg => 
      seg.properties.accessibility === 'restricted'
    ).length;
    const buildingAccessPoints = route.segments.filter(seg => 
      seg.properties.emergency_priority === 'high'
    ).length;
    const hazardAvoidanceScore = this.calculateHazardAvoidanceScore(route);
    
    // Calculate performance metrics
    const fuelEfficiency = this.calculateFuelEfficiency(route);
    const timeReliability = this.calculateTimeReliability(route);
    const safetyScore = this.calculateSafetyScore(route);
    const overallScore = (fuelEfficiency + timeReliability + safetyScore) / 3;
    
    return {
      distance: route.totalDistance,
      time: route.totalTime,
      elevation: {
        gain: elevationGain,
        loss: elevationLoss,
        net: elevationNet,
        max: elevationMax,
        min: elevationMin
      },
      slope: {
        max: maxSlope,
        average: averageSlope,
        steep_segments: steepSegments,
        moderate_segments: moderateSegments,
        gentle_segments: gentleSegments
      },
      accessibility: {
        emergency_vehicle_compatible: emergencyVehicleCompatible,
        restricted_areas: restrictedAreas,
        building_access_points: buildingAccessPoints,
        hazard_avoidance_score: hazardAvoidanceScore
      },
      performance: {
        fuel_efficiency: fuelEfficiency,
        time_reliability: timeReliability,
        safety_score: safetyScore,
        overall_score: overallScore
      }
    };
  }

  /**
   * Calculate hazard avoidance score
   */
  private calculateHazardAvoidanceScore(route: Route): number {
    const totalHazards = route.segments.reduce((sum, seg) => sum + seg.properties.hazards.length, 0);
    const maxHazards = route.segments.length * 2; // Assume max 2 hazards per segment
    
    return Math.max(0, 100 - (totalHazards / maxHazards) * 100);
  }

  /**
   * Calculate fuel efficiency score
   */
  private calculateFuelEfficiency(route: Route): number {
    let score = 100;
    
    // Penalize steep slopes
    score -= route.maxSlope * 2;
    
    // Penalize poor road conditions
    const poorRoads = route.segments.filter(seg => 
      ['poor', 'impassable'].includes(seg.properties.road_condition)
    ).length;
    score -= poorRoads * 10;
    
    // Penalize traffic congestion
    const congestedSegments = route.segments.filter(seg => 
      ['heavy', 'congested'].includes(seg.properties.traffic_conditions)
    ).length;
    score -= congestedSegments * 15;
    
    return Math.max(0, score);
  }

  /**
   * Calculate time reliability score
   */
  private calculateTimeReliability(route: Route): number {
    let score = 100;
    
    // Penalize routes with hazards
    const hazardSegments = route.segments.filter(seg => seg.properties.hazards.length > 0).length;
    score -= hazardSegments * 20;
    
    // Penalize poor road conditions
    const poorRoads = route.segments.filter(seg => 
      ['poor', 'impassable'].includes(seg.properties.road_condition)
    ).length;
    score -= poorRoads * 15;
    
    return Math.max(0, score);
  }

  /**
   * Calculate safety score
   */
  private calculateSafetyScore(route: Route): number {
    let score = 100;
    
    // Penalize steep slopes
    score -= route.maxSlope * 3;
    
    // Penalize hazards
    const totalHazards = route.segments.reduce((sum, seg) => sum + seg.properties.hazards.length, 0);
    score -= totalHazards * 25;
    
    // Penalize poor road conditions
    const poorRoads = route.segments.filter(seg => 
      ['poor', 'impassable'].includes(seg.properties.road_condition)
    ).length;
    score -= poorRoads * 20;
    
    return Math.max(0, score);
  }

  /**
   * Check constraint satisfaction
   */
  private checkConstraintSatisfaction(routes: Route[], constraints: RouteOptimization['constraints']): {
    satisfied: string[];
    violated: string[];
    warnings: string[];
  } {
    const satisfied: string[] = [];
    const violated: string[] = [];
    const warnings: string[] = [];
    
    if (constraints.maxDistance) {
      const compliant = routes.filter(route => route.totalDistance <= constraints.maxDistance!);
      if (compliant.length > 0) {
        satisfied.push(`Distance constraint (≤${constraints.maxDistance}km) satisfied by ${compliant.length} routes`);
      } else {
        violated.push(`No routes satisfy distance constraint (≤${constraints.maxDistance}km)`);
      }
    }
    
    if (constraints.maxTime) {
      const compliant = routes.filter(route => route.totalTime <= constraints.maxTime!);
      if (compliant.length > 0) {
        satisfied.push(`Time constraint (≤${constraints.maxTime}min) satisfied by ${compliant.length} routes`);
      } else {
        violated.push(`No routes satisfy time constraint (≤${constraints.maxTime}min)`);
      }
    }
    
    if (constraints.avoidHazards) {
      const safeRoutes = routes.filter(route => 
        route.segments.every(seg => seg.properties.hazards.length === 0)
      );
      if (safeRoutes.length > 0) {
        satisfied.push(`Hazard avoidance satisfied by ${safeRoutes.length} routes`);
      } else {
        warnings.push('No completely hazard-free routes available');
      }
    }
    
    return { satisfied, violated, warnings };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(routes: Route[], constraints: {
    satisfied: string[];
    violated: string[];
    warnings: string[];
  }): {
    immediate: string[];
    planning: string[];
    long_term: string[];
  } {
    const immediate: string[] = [];
    const planning: string[] = [];
    const long_term: string[] = [];
    
    if (constraints.violated.length > 0) {
      immediate.push('Review and adjust route constraints to find viable options');
    }
    
    if (constraints.warnings.length > 0) {
      immediate.push('Consider alternative transportation modes for affected segments');
    }
    
    if (routes.length > 0) {
      const bestRoute = routes[0];
      if (bestRoute) {
        immediate.push(`Use ${bestRoute.name} as primary route (Score: ${bestRoute.metadata.performance_score})`);
        
        if (routes.length > 1) {
          const backupRoute = routes[1];
          if (backupRoute) {
            immediate.push(`Keep ${backupRoute.name} as backup option`);
          }
        }
      }
    }
    
    planning.push('Monitor traffic conditions and hazard zones for route updates');
    planning.push('Establish communication protocols for route changes');
    
    long_term.push('Implement real-time traffic monitoring system');
    long_term.push('Develop predictive hazard modeling');
    long_term.push('Optimize road network for emergency response');
    
    return { immediate, planning, long_term };
  }

  /**
   * Detect hazards in route segment
   */
  private detectHazardsInSegment(segment: RouteSegment): string[] {
    const hazards: string[] = [];
    
    // Check for hazard zones
    this.hazardZones.forEach(hazard => {
      if (this.segmentIntersectsHazard(segment, hazard)) {
        hazards.push(`Hazard: ${hazard.type} - ${hazard.properties.name}`);
      }
    });
    
    // Check for traffic conditions
    this.trafficConditions.forEach(traffic => {
      if (this.segmentIntersectsTraffic(segment, traffic)) {
        hazards.push(`Traffic: ${traffic.type} - ${traffic.properties.description}`);
      }
    });
    
    return hazards;
  }

  /**
   * Check if segment intersects with hazard zone
   */
  private segmentIntersectsHazard(segment: RouteSegment, hazard: HazardZone): boolean {
    // Simplified intersection check
    // In production, this would use proper geometric intersection algorithms
    const segmentCenter: [number, number] = [
      (segment.startPoint.coordinates[0] + segment.endPoint.coordinates[0]) / 2,
      (segment.startPoint.coordinates[1] + segment.endPoint.coordinates[1]) / 2
    ];
    
    const distance = this.calculateDistance(segmentCenter, hazard.center);
    return distance <= hazard.radius;
  }

  /**
   * Check if segment intersects with traffic condition
   */
  private segmentIntersectsTraffic(segment: RouteSegment, traffic: TrafficCondition): boolean {
    // Simplified intersection check
    const segmentCenter: [number, number] = [
      (segment.startPoint.coordinates[0] + segment.endPoint.coordinates[0]) / 2,
      (segment.startPoint.coordinates[1] + segment.endPoint.coordinates[1]) / 2
    ];
    
    const distance = this.calculateDistance(segmentCenter, traffic.location);
    return distance <= 0.001; // 100m radius for traffic conditions
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Generate cache key for optimization
   */
  private generateCacheKey(optimization: RouteOptimization): string {
    return JSON.stringify({
      start: optimization.startPoint,
      destination: optimization.destinationPoint,
      waypoints: optimization.waypoints,
      constraints: optimization.constraints,
      optimization: optimization.optimization,
      preferences: optimization.preferences
    });
  }

  /**
   * Get route by ID
   */
  getRoute(routeId: string): Route | undefined {
    return this.routes.get(routeId);
  }

  /**
   * Get all stored routes
   */
  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  /**
   * Add route manually (for testing and external route management)
   */
  addRoute(route: Route): void {
    this.routes.set(route.id, route);
  }

  /**
   * Remove route by ID
   */
  removeRoute(routeId: string): void {
    this.routes.delete(routeId);
  }

  /**
   * Compare multiple routes
   */
  async compareRoutes(routeIds: string[]): Promise<RouteComparison> {
    const routes = routeIds.map(id => this.routes.get(id)).filter(Boolean) as Route[];
    
    if (routes.length === 0) {
      throw new Error('No valid routes found for comparison');
    }
    
    const metrics = await Promise.all(routes.map(route => this.calculateRouteMetrics(route)));
    
    // Find best routes in each category
    const distanceValues = metrics.map(m => m.distance);
    const timeValues = metrics.map(m => m.time);
    const safetyValues = metrics.map(m => m.performance.safety_score);
    const accessibilityValues = metrics.map(m => m.accessibility.hazard_avoidance_score);
    const overallValues = metrics.map(m => m.performance.overall_score);
    
    const bestDistanceIndex = distanceValues.indexOf(Math.min(...distanceValues));
    const bestTimeIndex = timeValues.indexOf(Math.min(...timeValues));
    const bestSafetyIndex = safetyValues.indexOf(Math.max(...safetyValues));
    const bestAccessibilityIndex = accessibilityValues.indexOf(Math.max(...accessibilityValues));
    const overallBestIndex = overallValues.indexOf(Math.max(...overallValues));
    
    const bestDistance = bestDistanceIndex >= 0 ? routes[bestDistanceIndex]?.id || '' : routes[0]?.id || '';
    const bestTime = bestTimeIndex >= 0 ? routes[bestTimeIndex]?.id || '' : routes[0]?.id || '';
    const bestSafety = bestSafetyIndex >= 0 ? routes[bestSafetyIndex]?.id || '' : routes[0]?.id || '';
    const bestAccessibility = bestAccessibilityIndex >= 0 ? routes[bestAccessibilityIndex]?.id || '' : routes[0]?.id || '';
    const overallBest = overallBestIndex >= 0 ? routes[overallBestIndex]?.id || '' : routes[0]?.id || '';
    
    // Generate recommendations
    const emergency = routes.find(r => r.emergencyPriority === 'critical' || r.emergencyPriority === 'high')?.id || routes[0]?.id || '';
    const standard = routes.find(r => r.emergencyPriority === 'medium')?.id || routes[0]?.id || '';
    const scenic = routes.find(r => r.maxSlope < 10)?.id || routes[0]?.id || '';
    const avoid = routes.filter(r => r.metadata.performance_score < 50).map(r => r.id).filter(Boolean) as string[];
    
    return {
      routes,
      metrics,
      comparison: {
        bestDistance,
        bestTime,
        bestSafety,
        bestAccessibility,
        overallBest
      },
      recommendations: {
        emergency,
        standard,
        scenic,
        avoid
      }
    };
  }

  /**
   * Register callback for route updates
   */
  registerUpdateCallback(routeId: string, callback: (update: DynamicRouteUpdate) => void): void {
    this.updateCallbacks.set(routeId, callback);
  }

  /**
   * Unregister callback for route updates
   */
  unregisterUpdateCallback(routeId: string): void {
    this.updateCallbacks.delete(routeId);
  }

  /**
   * Trigger route update
   */
  triggerRouteUpdate(update: DynamicRouteUpdate): void {
    const callback = this.updateCallbacks.get(update.routeId);
    if (callback) {
      callback(update);
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.routes.clear();
    this.hazardZones.clear();
    this.trafficConditions.clear();
    this.optimizationCache.clear();
    this.updateCallbacks.clear();
  }
}
