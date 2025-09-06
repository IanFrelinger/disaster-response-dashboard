import axios from 'axios';
import type { OperationalRoute, RouteProfiles } from '../types/emergency-response';
import { streetDataService } from './streetDataService';
import type { StreetSegment, StreetQuery } from './streetDataService';

// Use Vite environment variable for API base URL
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:8000';

export interface RouteCalculationRequest {
  origin_lat: number;
  origin_lon: number;
  destination_lat: number;
  destination_lon: number;
  vehicle_type: 'civilian' | 'fire_engine' | 'ambulance' | 'police_car' | 'rescue_truck';
  priority: 'safest' | 'fastest' | 'balanced';
  profile: keyof RouteProfiles;
  avoid_hazards: string[]; // hazard IDs to avoid
  constraints?: {
    max_distance?: number; // km
    max_time?: number; // minutes
    avoid_water_crossings?: boolean;
    require_staging_areas?: boolean;
    deconflict_with_units?: boolean;
  };
}

export interface RouteCalculationResponse {
  success: boolean;
  route_id?: string;
  route?: OperationalRoute;
  error?: string;
  alternatives?: OperationalRoute[];
  metrics?: {
    total_distance_km: number;
    estimated_time_minutes: number;
    hazard_avoidance_score: number;
    safety_score: number;
    efficiency_score: number;
  };
}

export interface RouteOptimizationRequest {
  routes: OperationalRoute[];
  optimization_goal: 'minimize_conflicts' | 'maximize_efficiency' | 'balance_safety_speed';
  constraints: {
    max_total_distance?: number;
    max_total_time?: number;
    avoid_hazard_zones: boolean;
    maintain_unit_separation?: boolean;
  };
}

export interface RouteOptimizationResponse {
  success: boolean;
  optimized_routes: OperationalRoute[];
  conflicts_resolved: number;
  efficiency_improvement: number;
  error?: string;
}

class RoutingService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout for route calculations
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Calculate a safe route between two points using street data
   */
  async calculateSafeRoute(request: RouteCalculationRequest): Promise<RouteCalculationResponse> {
    try {
      // First, get street data for the area
      const streetQuery: StreetQuery = {
        latitude: (request.origin_lat + request.destination_lat) / 2,
        longitude: (request.origin_lon + request.destination_lon) / 2,
        radius_m: 10000, // 10km radius
        emergency_access_only: request.vehicle_type !== 'civilian',
        evacuation_routes_only: request.profile === 'CIVILIAN_EVACUATION'
      };

      const streetData = await streetDataService.getStreetData(streetQuery);
      
      if (!streetData.success || streetData.streets.length === 0) {
        // Fallback to API if no street data available
        const response = await this.apiClient.post('/api/calculate_safe_route', request);
        return response.data;
      }

      // Filter streets by vehicle constraints
      const filteredStreets = streetDataService.filterByVehicleConstraints(
        streetData.streets, 
        request.vehicle_type
      );

      // Find nearest streets to origin and destination
      const originStreet = await streetDataService.findNearestStreet(
        request.origin_lat, 
        request.origin_lon
      );
      const destStreet = await streetDataService.findNearestStreet(
        request.destination_lat, 
        request.destination_lon
      );

      if (!originStreet || !destStreet) {
        throw new Error('Cannot find street access for origin or destination');
      }

      // Calculate route using street network
      const routeStreets = await this._calculateRouteFromStreets(
        originStreet,
        destStreet,
        filteredStreets,
        request
      );

      if (routeStreets.length === 0) {
        throw new Error('No valid route found');
      }

      // Calculate route metrics
      const metrics = streetDataService.calculateRouteMetrics(routeStreets);

      // Build route geometry
      const routeGeometry = this._buildRouteGeometry(routeStreets);

      // Create route response
      const route: OperationalRoute = {
        id: `route-${Date.now()}`,
        profile: request.profile,
        startPoint: [request.origin_lon, request.origin_lat],
        endPoint: [request.destination_lon, request.destination_lat],
        waypoints: routeGeometry.coordinates,
        status: 'planned',
        capacity: 100,
        currentUsage: 0,
        estimatedTime: Math.round(metrics.total_time_min),
        hazards: request.avoid_hazards,
        deconflicted: false,
        assignedUnits: [],
        stagingAreas: [],
        streetData: {
          segments: routeStreets.length,
          totalLengthKm: metrics.total_length_km,
          averageSpeedKmh: metrics.average_speed_kmh,
          safetyScore: metrics.safety_score,
          emergencyAccessScore: metrics.emergency_access_score,
          evacuationRouteScore: metrics.evacuation_route_score
        }
      };

      return {
        success: true,
        route
      };

    } catch (error) {
      console.error('Error calculating safe route:', error);
      
      // Fallback to API
      try {
        const response = await this.apiClient.post('/api/calculate_safe_route', request);
        return response.data;
      } catch (apiError) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  }

  /**
   * Optimize multiple routes to avoid conflicts and improve efficiency
   */
  async optimizeRoutes(request: RouteOptimizationRequest): Promise<RouteOptimizationResponse> {
    try {
      const response = await this.apiClient.post('/api/optimize_routes', request);
      return response.data;
    } catch (error) {
      console.error('Error optimizing routes:', error);
      return {
        success: false,
        optimized_routes: [],
        conflicts_resolved: 0,
        efficiency_improvement: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get real-time route status and updates
   */
  async getRouteStatus(routeId: string): Promise<Partial<OperationalRoute> | null> {
    try {
      const response = await this.apiClient.get(`/api/route_status/${routeId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting route status:', error);
      return null;
    }
  }

  /**
   * Update route information
   */
  async updateRoute(routeId: string, updates: Partial<OperationalRoute>): Promise<boolean> {
    try {
      await this.apiClient.put(`/api/routes/${routeId}`, updates);
      return true;
    } catch (error) {
      console.error('Error updating route:', error);
      return false;
    }
  }

  /**
   * Get route alternatives for a given origin and destination
   */
  async getRouteAlternatives(
    origin: [number, number],
    destination: [number, number],
    profile: keyof RouteProfiles
  ): Promise<OperationalRoute[]> {
    try {
      const response = await this.apiClient.get('/api/route_alternatives', {
        params: {
          origin_lat: origin[1],
          origin_lon: origin[0],
          destination_lat: destination[1],
          destination_lon: destination[0],
          profile
        }
      });
      return response.data.alternatives || [];
    } catch (error) {
      console.error('Error getting route alternatives:', error);
      return [];
    }
  }

  /**
   * Validate route feasibility considering current conditions
   */
  async validateRoute(route: OperationalRoute): Promise<{
    feasible: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const response = await this.apiClient.post('/api/validate_route', route);
      return response.data;
    } catch (error) {
      console.error('Error validating route:', error);
      return {
        feasible: false,
        issues: ['Unable to validate route'],
        recommendations: ['Check network connectivity and try again']
      };
    }
  }

  /**
   * Get hazard-aware route suggestions
   */
  async getHazardAwareRoutes(
    origin: [number, number],
    destination: [number, number],
    hazardIds: string[]
  ): Promise<OperationalRoute[]> {
    try {
      const response = await this.apiClient.post('/api/hazard_aware_routes', {
        origin,
        destination,
        hazard_ids: hazardIds
      });
      return response.data.routes || [];
    } catch (error) {
      console.error('Error getting hazard-aware routes:', error);
      return [];
    }
  }

  /**
   * Mock route calculation for development/testing
   */
  async createMockRoute(
    startPoint: [number, number],
    endPoint: [number, number],
    profile: keyof RouteProfiles
  ): Promise<OperationalRoute> {
    const routeId = `mock-route-${Date.now()}`;
    const distance = this.calculateDistance(startPoint, endPoint);
    const estimatedTime = Math.round(distance * 2); // Rough estimate: 2 min per km

    // Generate realistic waypoints along the route
    const waypoints = await this._generateRealisticWaypoints(startPoint, endPoint, profile, distance);

    return {
      id: routeId,
      profile,
      startPoint,
      endPoint,
      waypoints: waypoints,
      status: 'planned',
      capacity: 100,
      currentUsage: 0,
      estimatedTime,
      hazards: [],
      deconflicted: false,
      assignedUnits: [],
      stagingAreas: []
    };
  }

  /**
   * Generate realistic street-following waypoints between two points
   */
  private _generateRealisticWaypoints(
    start: [number, number], 
    end: [number, number], 
    profile: keyof RouteProfiles,
    distance: number
  ): Promise<[number, number][]> {
    return new Promise((resolve) => {
      (async () => {
      try {
        console.log('🛣️ Generating realistic waypoints:', { start, end, profile, distance });
        
        // Try to get real street data first
        const streetQuery: StreetQuery = {
          latitude: (start[1] + end[1]) / 2,
          longitude: (start[0] + end[0]) / 2,
          radius_m: Math.max(5000, distance * 1000), // Convert km to meters
          emergency_access_only: profile !== 'CIVILIAN_EVACUATION',
          evacuation_routes_only: profile === 'CIVILIAN_EVACUATION'
        };

        console.log('🔍 Street query:', streetQuery);
        const streetData = await streetDataService.getStreetData(streetQuery);
        console.log('📊 Street data response:', streetData);
        
        if (streetData.success && streetData.streets.length > 0) {
          console.log('✅ Using real street data for routing');
          // Use real street data to generate route
          const routeWaypoints = await this._generateRouteFromStreets(start, end, streetData.streets, profile);
          console.log('🛣️ Generated route waypoints from streets:', routeWaypoints);
          resolve(routeWaypoints);
        } else {
          console.log('⚠️ No street data available, using simulated routing');
          // Fallback to simulated street routing
          const simulatedWaypoints = this._generateSimulatedStreetRoute(start, end, profile, distance);
          console.log('🛣️ Generated simulated waypoints:', simulatedWaypoints);
          resolve(simulatedWaypoints);
        }
      } catch (error) {
        console.warn('❌ Error getting street data, using simulated route:', error);
        // Fallback to simulated routing
        const simulatedWaypoints = this._generateSimulatedStreetRoute(start, end, profile, distance);
        console.log('🛣️ Generated fallback waypoints:', simulatedWaypoints);
        resolve(simulatedWaypoints);
      }
      })();
    });
  }

  /**
   * Generate route waypoints from actual street data
   */
  private async _generateRouteFromStreets(
    start: [number, number],
    end: [number, number],
    streets: StreetSegment[],
    profile: keyof RouteProfiles
  ): Promise<[number, number][]> {
    // Find nearest streets to start and end points
    const startStreet = await streetDataService.findNearestStreet(start[1], start[0]);
    const endStreet = await streetDataService.findNearestStreet(end[1], end[0]);
    
    if (startStreet && endStreet) {
      // Filter streets by vehicle constraints
      const filteredStreets = streetDataService.filterByVehicleConstraints(streets, 
        this.mapVehicleType(profile)
      );
      
      // Try to find a path through the street network
      const routeStreets = await this._calculateRouteFromStreets(
        startStreet, 
        endStreet, 
        filteredStreets,
        {
          origin_lat: start[1],
          origin_lon: start[0],
          destination_lat: end[1],
          destination_lon: end[0],
          vehicle_type: this.mapVehicleType(profile),
          priority: this.mapProfileToPriority(profile),
          profile: profile,
          avoid_hazards: []
        } as RouteCalculationRequest
      );
      
      if (routeStreets.length > 0) {
        // Build route geometry from street segments
        const routeGeometry = this._buildRouteGeometry(routeStreets);
        return routeGeometry.coordinates;
      }
    }
    
    // Fallback to simulated routing if no street route found
    return this._generateSimulatedStreetRoute(start, end, profile, 
      this.calculateDistance(start, end)
    );
  }

  /**
   * Generate simulated street route when real street data is unavailable
   */
  private _generateSimulatedStreetRoute(
    start: [number, number],
    end: [number, number],
    profile: keyof RouteProfiles,
    distance: number
  ): [number, number][] {
    const waypoints: [number, number][] = [start];
    
    // Create a more realistic street-like path with turns and segments
    const numSegments = Math.max(3, Math.min(8, Math.floor(distance * 2)));
    
    // Generate waypoints that simulate street routing with turns
    let currentPoint = start;
    
    for (let i = 1; i < numSegments; i++) {
      // Calculate direction to end point
      const directionLng = end[0] - currentPoint[0];
      const directionLat = end[1] - currentPoint[1];
      const totalDistance = Math.sqrt(directionLng * directionLng + directionLat * directionLat);
      
      if (totalDistance < 0.001) break; // Very close to end
      
      // Normalize direction
      const unitLng = directionLng / totalDistance;
      const unitLat = directionLat / totalDistance;
      
      // Add some street-like variation (turns, curves)
      let variation = 0.0001;
      if (profile === 'FIRE_TACTICAL') variation = 0.0003;
      if (profile === 'CIVILIAN_EVACUATION') variation = 0.00005;
      
      // Create intermediate point with street-like variation
      const progress = i / numSegments;
      const baseLng = start[0] + (end[0] - start[0]) * progress;
      const baseLat = start[1] + (end[1] - start[1]) * progress;
      
      // Add perpendicular variation to simulate street turns
      const perpendicularLng = -unitLat * variation * (Math.random() - 0.5);
      const perpendicularLat = unitLng * variation * (Math.random() - 0.5);
      
      const intermediatePoint: [number, number] = [
        baseLng + perpendicularLng,
        baseLat + perpendicularLat
      ];
      
      waypoints.push(intermediatePoint);
      currentPoint = intermediatePoint;
    }
    
    waypoints.push(end);
    return waypoints;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2[1] - point1[1]);
    const dLon = this.toRadians(point2[0] - point1[0]);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1[1])) * Math.cos(this.toRadians(point2[1])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert vehicle type to backend format
   */
  mapVehicleType(profile: keyof RouteProfiles): 'civilian' | 'fire_engine' | 'ambulance' | 'police_car' | 'rescue_truck' {
    const mapping = {
      CIVILIAN_EVACUATION: 'civilian' as const,
      EMS_RESPONSE: 'ambulance' as const,
      FIRE_TACTICAL: 'fire_engine' as const,
      POLICE_ESCORT: 'police_car' as const
    };
    return mapping[profile] || 'civilian';
  }

  /**
   * Convert profile to priority setting
   */
  mapProfileToPriority(profile: keyof RouteProfiles): 'safest' | 'fastest' | 'balanced' {
    const mapping = {
      CIVILIAN_EVACUATION: 'safest' as const,
      EMS_RESPONSE: 'fastest' as const,
      FIRE_TACTICAL: 'balanced' as const,
      POLICE_ESCORT: 'balanced' as const
    };
    return mapping[profile] || 'balanced';
  }

  /**
   * Calculate route from street segments
   */
  private async _calculateRouteFromStreets(
    originStreet: StreetSegment,
    destStreet: StreetSegment,
    availableStreets: StreetSegment[],
    request: RouteCalculationRequest
  ): Promise<StreetSegment[]> {
    // Simple A* pathfinding implementation
    const openSet = new Set<string>([originStreet.id]);
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    gScore.set(originStreet.id, 0);
    fScore.set(originStreet.id, this._heuristic(originStreet, destStreet));

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let currentId = '';
      let lowestFScore = Infinity;
      for (const id of openSet) {
        const score = fScore.get(id) || Infinity;
        if (score < lowestFScore) {
          lowestFScore = score;
          currentId = id;
        }
      }

      if (currentId === destStreet.id) {
        // Reconstruct path
        return this._reconstructPath(cameFrom, currentId, availableStreets);
      }

      openSet.delete(currentId);
      closedSet.add(currentId);

      const currentStreet = availableStreets.find(s => s.id === currentId);
      if (!currentStreet) continue;

      // Find connected streets
      const neighbors = this._findConnectedStreets(currentStreet, availableStreets);
      
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor.id)) continue;

        const tentativeGScore = (gScore.get(currentId) || Infinity) + 
          this._calculateStreetCost(currentStreet, neighbor, request);

        if (!openSet.has(neighbor.id)) {
          openSet.add(neighbor.id);
        } else if (tentativeGScore >= (gScore.get(neighbor.id) || Infinity)) {
          continue;
        }

        cameFrom.set(neighbor.id, currentId);
        gScore.set(neighbor.id, tentativeGScore);
        fScore.set(neighbor.id, tentativeGScore + this._heuristic(neighbor, destStreet));
      }
    }

    // No path found
    return [];
  }

  /**
   * Find streets connected to a given street
   */
  private _findConnectedStreets(street: StreetSegment, allStreets: StreetSegment[]): StreetSegment[] {
    const connected: StreetSegment[] = [];
    const streetEnds = [
      street.geometry.coordinates[0],
      street.geometry.coordinates[street.geometry.coordinates.length - 1]
    ];

    for (const otherStreet of allStreets) {
      if (otherStreet.id === street.id) continue;

      const otherEnds = [
        otherStreet.geometry.coordinates[0],
        otherStreet.geometry.coordinates[otherStreet.geometry.coordinates.length - 1]
      ];

      // Check if streets are connected (within 50 meters)
      for (const end of streetEnds) {
        if (!end) continue;
        for (const otherEnd of otherEnds) {
          if (!otherEnd) continue;
          const distance = this._calculateDistance(end, otherEnd);
          if (distance < 0.0005) { // ~50 meters in degrees
            connected.push(otherStreet);
            break;
          }
        }
      }
    }

    return connected;
  }

  /**
   * Calculate heuristic distance between streets
   */
  private _heuristic(street1: StreetSegment, street2: StreetSegment): number {
    const center1 = this._getStreetCenter(street1);
    const center2 = this._getStreetCenter(street2);
    return this._calculateDistance(center1, center2);
  }

  /**
   * Get center point of a street
   */
  private _getStreetCenter(street: StreetSegment): [number, number] {
    const coords = street.geometry.coordinates;
    const midIndex = Math.floor(coords.length / 2);
    return coords[midIndex] || coords[0] || [0, 0];
  }

  /**
   * Calculate distance between two points
   */
  private _calculateDistance(point1: [number, number], point2: [number, number]): number {
    return Math.sqrt(
      Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2)
    );
  }

  /**
   * Calculate cost of traveling between streets
   */
  private _calculateStreetCost(_street1: StreetSegment, street2: StreetSegment, request: RouteCalculationRequest): number {
    let cost = street2.properties.length_m / 1000; // Base cost is distance in km

    // Apply vehicle-specific costs
    switch (request.vehicle_type) {
      case 'fire_engine':
        if (!street2.properties.emergency_access) cost *= 10;
        if (street2.properties.width_m < 3.0) cost *= 5;
        if (street2.properties.max_weight_kg < 15000) cost *= 3;
        break;
      case 'ambulance':
        if (!street2.properties.emergency_access) cost *= 5;
        if (street2.properties.width_m < 2.8) cost *= 3;
        break;
      case 'police_car':
        if (!street2.properties.emergency_access) cost *= 2;
        break;
      case 'civilian':
        if (street2.properties.hazard_zone) cost *= 10;
        if (street2.properties.condition === 'poor') cost *= 3;
        break;
    }

    // Apply priority-based costs
    switch (request.priority) {
      case 'fastest':
        cost /= street2.properties.speed_limit_kmh;
        break;
      case 'safest':
        if (street2.properties.condition !== 'excellent') cost *= 2;
        if (!street2.properties.lighting) cost *= 1.5;
        break;
    }

    return cost;
  }

  /**
   * Reconstruct path from A* algorithm
   */
  private _reconstructPath(
    cameFrom: Map<string, string>, 
    currentId: string, 
    availableStreets: StreetSegment[]
  ): StreetSegment[] {
    const path: StreetSegment[] = [];
    let current = currentId;

    while (cameFrom.has(current)) {
      const street = availableStreets.find(s => s.id === current);
      if (street) path.unshift(street);
      current = cameFrom.get(current)!;
    }

    // Add the starting street
    const startStreet = availableStreets.find(s => s.id === current);
    if (startStreet) path.unshift(startStreet);

    return path;
  }

  /**
   * Build route geometry from street segments with enhanced waypoint generation
   */
  private _buildRouteGeometry(streets: StreetSegment[]): {
    type: 'LineString';
    coordinates: [number, number][];
  } {
    if (streets.length === 0) {
      return {
        type: 'LineString',
        coordinates: []
      };
    }

    const coordinates: [number, number][] = [];
    
    for (let i = 0; i < streets.length; i++) {
      const street = streets[i];
      if (!street) continue;
      
      const streetCoords = street.geometry.coordinates;
      
      if (i === 0) {
        // Add all coordinates from first street
        coordinates.push(...streetCoords);
      } else {
        // Add coordinates from subsequent streets, avoiding duplicates
        const prevStreet = streets[i - 1];
        if (!prevStreet) continue;
        
        const prevEnd = prevStreet.geometry.coordinates[prevStreet.geometry.coordinates.length - 1];
        const currentStart = streetCoords[0];
        
        if (!prevEnd || !currentStart) continue;
        
        // If streets are connected, skip the first coordinate of current street
        if (this._calculateDistance(prevEnd, currentStart) < 0.0001) {
          coordinates.push(...streetCoords.slice(1));
        } else {
          coordinates.push(...streetCoords);
        }
      }
    }

    // Enhance the route with additional waypoints for smoother visualization
    const enhancedCoordinates = this._enhanceRouteWaypoints(coordinates);
    
    return {
      type: 'LineString',
      coordinates: enhancedCoordinates
    };
  }

  /**
   * Enhance route waypoints for smoother visualization
   */
  private _enhanceRouteWaypoints(coordinates: [number, number][]): [number, number][] {
    if (coordinates.length < 3) return coordinates;
    
    const enhanced: [number, number][] = [];
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const current = coordinates[i];
      const next = coordinates[i + 1];
      
      if (!current || !next) continue;
      
      enhanced.push(current);
      
      // Add intermediate points for longer segments to create smoother curves
      const distance = this._calculateDistance(current, next);
      if (distance > 0.5) { // If segment is longer than 0.5km
        const numIntermediates = Math.min(3, Math.floor(distance * 2));
        
        for (let j = 1; j <= numIntermediates; j++) {
          const progress = j / (numIntermediates + 1);
          const intermediate: [number, number] = [
            current[0] + (next[0] - current[0]) * progress,
            current[1] + (next[1] - current[1]) * progress
          ];
          
          // Add slight street-following variation
          const variation = 0.0001; // Small variation to simulate street routing
          intermediate[0] += (Math.random() - 0.5) * variation;
          intermediate[1] += (Math.random() - 0.5) * variation;
          
          enhanced.push(intermediate);
        }
      }
    }
    
    const lastCoordinate = coordinates[coordinates.length - 1];
    if (lastCoordinate) {
      enhanced.push(lastCoordinate); // Add the last coordinate
    }
    return enhanced;
  }
}

// Export singleton instance
export const routingService = new RoutingService();
export default routingService;
