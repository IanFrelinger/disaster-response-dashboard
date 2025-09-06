import axios from 'axios';

// Street data types matching "Where am I" app format
export interface StreetSegment {
  id: string;
  name: string;
  type: 'highway' | 'primary' | 'secondary' | 'tertiary' | 'residential' | 'service' | 'path';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  properties: {
    length_m: number;
    speed_limit_kmh: number;
    lanes: number;
    one_way: boolean;
    surface: 'paved' | 'unpaved' | 'gravel' | 'dirt';
    width_m: number;
    max_weight_kg: number;
    max_height_m: number;
    max_width_m: number;
    bridge: boolean;
    tunnel: boolean;
    access: 'yes' | 'no' | 'private' | 'emergency';
    emergency_access: boolean;
    evacuation_route: boolean;
    hazard_zone: boolean;
    traffic_signals: boolean;
    stop_signs: boolean;
    yield_signs: boolean;
    roundabouts: boolean;
    traffic_calming: boolean;
    lighting: boolean;
    sidewalk: boolean;
    bike_lane: boolean;
    bus_lane: boolean;
    hov_lane: boolean;
    toll: boolean;
    seasonal: boolean;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'closed';
    last_updated: string;
  };
}

export interface StreetNetwork {
  id: string;
  name: string;
  description: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  segments: StreetSegment[];
  metadata: {
    total_segments: number;
    total_length_km: number;
    last_updated: string;
    source: string;
    version: string;
  };
}

export interface StreetQuery {
  latitude: number;
  longitude: number;
  radius_m: number;
  street_types?: string[];
  access_types?: string[];
  max_speed_kmh?: number;
  min_lanes?: number;
  emergency_access_only?: boolean;
  evacuation_routes_only?: boolean;
}

export interface StreetQueryResponse {
  success: boolean;
  streets: StreetSegment[];
  total_count: number;
  query_bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  metadata: {
    query_time_ms: number;
    cache_hit: boolean;
  };
}

// Use Vite environment variable for API base URL
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:8000';

class StreetDataService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  /**
   * Get street data for a specific area
   */
  async getStreetData(query: StreetQuery): Promise<StreetQueryResponse> {
    try {
      const response = await this.apiClient.get('/api/street_data', {
        params: {
          lat: query.latitude,
          lon: query.longitude,
          radius: query.radius_m,
          street_types: query.street_types?.join(','),
          access_types: query.access_types?.join(','),
          max_speed: query.max_speed_kmh,
          min_lanes: query.min_lanes,
          emergency_access_only: query.emergency_access_only,
          evacuation_routes_only: query.evacuation_routes_only
        }
      });
      
      // Map backend response to frontend expected format
      if (response.data.success && response.data.data && response.data.data.features) {
        const streets = response.data.data.features.map((feature: any) => this._mapFeatureToStreetSegment(feature));
        return {
          success: true,
          streets: streets,
          total_count: streets.length,
          query_bounds: { north: 0, south: 0, east: 0, west: 0 },
          metadata: { query_time_ms: 0, cache_hit: false }
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching street data:', error);
      return {
        success: false,
        streets: [],
        total_count: 0,
        query_bounds: { north: 0, south: 0, east: 0, west: 0 },
        metadata: { query_time_ms: 0, cache_hit: false }
      };
    }
  }

  /**
   * Get street network for routing
   */
  async getStreetNetwork(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<StreetNetwork | null> {
    try {
      const response = await this.apiClient.get('/api/street_network', {
        params: bounds
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching street network:', error);
      return null;
    }
  }

  /**
   * Find nearest street to a point
   */
  async findNearestStreet(latitude: number, longitude: number, maxDistance_m: number = 1000): Promise<StreetSegment | null> {
    try {
      const response = await this.apiClient.get('/api/nearest_street', {
        params: {
          lat: latitude,
          lon: longitude,
          max_distance: maxDistance_m
        }
      });
      return response.data.street || null;
    } catch (error) {
      console.error('Error finding nearest street:', error);
      return null;
    }
  }

  /**
   * Get street segments along a route
   */
  async getRouteStreets(routeCoordinates: [number, number][]): Promise<StreetSegment[]> {
    try {
      const response = await this.apiClient.post('/api/route_streets', {
        coordinates: routeCoordinates
      });
      return response.data.streets || [];
    } catch (error) {
      console.error('Error fetching route streets:', error);
      return [];
    }
  }

  /**
   * Get street conditions and restrictions
   */
  async getStreetConditions(streetIds: string[]): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.post('/api/street_conditions', {
        street_ids: streetIds
      });
      return response.data.conditions || {};
    } catch (error) {
      console.error('Error fetching street conditions:', error);
      return {};
    }
  }

  /**
   * Get real-time traffic data for streets
   */
  async getTrafficData(streetIds: string[]): Promise<Record<string, any>> {
    try {
      const response = await this.apiClient.post('/api/traffic_data', {
        street_ids: streetIds
      });
      return response.data.traffic || {};
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      return {};
    }
  }

  /**
   * Get evacuation routes
   */
  async getEvacuationRoutes(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<StreetSegment[]> {
    try {
      const response = await this.apiClient.get('/api/evacuation_routes', {
        params: bounds
      });
      return response.data.routes || [];
    } catch (error) {
      console.error('Error fetching evacuation routes:', error);
      return [];
    }
  }

  /**
   * Get emergency access routes
   */
  async getEmergencyAccessRoutes(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<StreetSegment[]> {
    try {
      const response = await this.apiClient.get('/api/emergency_access_routes', {
        params: bounds
      });
      return response.data.routes || [];
    } catch (error) {
      console.error('Error fetching emergency access routes:', error);
      return [];
    }
  }

  /**
   * Convert street data to routing format
   */
  convertToRoutingFormat(streets: StreetSegment[]): any[] {
    return streets.map(street => ({
      id: street.id,
      name: street.name,
      type: street.type,
      geometry: street.geometry,
      length_m: street.properties.length_m,
      speed_limit_kmh: street.properties.speed_limit_kmh,
      lanes: street.properties.lanes,
      one_way: street.properties.one_way,
      surface: street.properties.surface,
      width_m: street.properties.width_m,
      max_weight_kg: street.properties.max_weight_kg,
      max_height_m: street.properties.max_height_m,
      max_width_m: street.properties.max_width_m,
      bridge: street.properties.bridge,
      tunnel: street.properties.tunnel,
      access: street.properties.access,
      emergency_access: street.properties.emergency_access,
      evacuation_route: street.properties.evacuation_route,
      hazard_zone: street.properties.hazard_zone,
      traffic_signals: street.properties.traffic_signals,
      stop_signs: street.properties.stop_signs,
      yield_signs: street.properties.yield_signs,
      roundabouts: street.properties.roundabouts,
      traffic_calming: street.properties.traffic_calming,
      lighting: street.properties.lighting,
      sidewalk: street.properties.sidewalk,
      bike_lane: street.properties.bike_lane,
      bus_lane: street.properties.bus_lane,
      hov_lane: street.properties.hov_lane,
      toll: street.properties.toll,
      seasonal: street.properties.seasonal,
      condition: street.properties.condition,
      last_updated: street.properties.last_updated
    }));
  }

  /**
   * Filter streets by vehicle type constraints
   */
  filterByVehicleConstraints(streets: StreetSegment[], vehicleType: string): StreetSegment[] {
    const vehicleConstraints = {
      civilian: {
        max_weight_kg: 3500,
        max_height_m: 4.0,
        max_width_m: 2.5,
        min_lanes: 1,
        avoid_hazards: true
      },
      fire_engine: {
        max_weight_kg: 15000,
        max_height_m: 4.5,
        max_width_m: 3.0,
        min_lanes: 2,
        require_emergency_access: true
      },
      ambulance: {
        max_weight_kg: 5000,
        max_height_m: 3.5,
        max_width_m: 2.8,
        min_lanes: 1,
        require_emergency_access: true
      },
      police_car: {
        max_weight_kg: 2500,
        max_height_m: 2.0,
        max_width_m: 2.2,
        min_lanes: 1,
        require_emergency_access: true
      },
      rescue_truck: {
        max_weight_kg: 20000,
        max_height_m: 5.0,
        max_width_m: 3.5,
        min_lanes: 2,
        require_emergency_access: true
      }
    };

    const constraints = vehicleConstraints[vehicleType as keyof typeof vehicleConstraints] || vehicleConstraints.civilian;

    return streets.filter(street => {
      // Check weight constraints
      if (street.properties.max_weight_kg < constraints.max_weight_kg) return false;
      
      // Check height constraints
      if (street.properties.max_height_m < constraints.max_height_m) return false;
      
      // Check width constraints
      if (street.properties.max_width_m < constraints.max_width_m) return false;
      
      // Check lane constraints
      if (street.properties.lanes < constraints.min_lanes) return false;
      
      // Check emergency access if required
      if ('require_emergency_access' in constraints && constraints.require_emergency_access && !street.properties.emergency_access) return false;
      
      // Check hazard zones if avoiding
      if ('avoid_hazards' in constraints && constraints.avoid_hazards && street.properties.hazard_zone) return false;
      
      return true;
    });
  }

  /**
   * Calculate street-based route metrics
   */
  calculateRouteMetrics(streets: StreetSegment[]): {
    total_length_km: number;
    total_time_min: number;
    average_speed_kmh: number;
    safety_score: number;
    emergency_access_score: number;
    evacuation_route_score: number;
  } {
    if (streets.length === 0) {
      return {
        total_length_km: 0,
        total_time_min: 0,
        average_speed_kmh: 0,
        safety_score: 0,
        emergency_access_score: 0,
        evacuation_route_score: 0
      };
    }

    const totalLengthKm = streets.reduce((sum, street) => sum + street.properties.length_m / 1000, 0);
    const totalTimeMin = streets.reduce((sum, street) => {
      const timeHours = (street.properties.length_m / 1000) / street.properties.speed_limit_kmh;
      return sum + (timeHours * 60);
    }, 0);

    const averageSpeedKmh = totalLengthKm / (totalTimeMin / 60);

    // Calculate safety score (0-100)
    const safetyFactors = streets.map(street => {
      let score = 100;
      
      // Deduct for poor conditions
      if (street.properties.condition === 'poor') score -= 30;
      else if (street.properties.condition === 'fair') score -= 15;
      
      // Deduct for hazard zones
      if (street.properties.hazard_zone) score -= 50;
      
      // Deduct for lack of lighting
      if (!street.properties.lighting) score -= 10;
      
      // Deduct for lack of sidewalks
      if (!street.properties.sidewalk) score -= 5;
      
      // Bonus for traffic calming
      if (street.properties.traffic_calming) score += 10;
      
      return Math.max(0, score);
    });
    
    const safetyScore = safetyFactors.reduce((sum, score) => sum + score, 0) / safetyFactors.length;

    // Calculate emergency access score
    const emergencyAccessStreets = streets.filter(street => street.properties.emergency_access);
    const emergencyAccessScore = (emergencyAccessStreets.length / streets.length) * 100;

    // Calculate evacuation route score
    const evacuationRouteStreets = streets.filter(street => street.properties.evacuation_route);
    const evacuationRouteScore = (evacuationRouteStreets.length / streets.length) * 100;

    return {
      total_length_km: totalLengthKm,
      total_time_min: totalTimeMin,
      average_speed_kmh: averageSpeedKmh,
      safety_score: safetyScore,
      emergency_access_score: emergencyAccessScore,
      evacuation_route_score: evacuationRouteScore
    };
  }

  /**
   * Map GeoJSON feature to StreetSegment format
   */
  private _mapFeatureToStreetSegment(feature: any): StreetSegment {
    const props = feature.properties;
    return {
      id: props.osm_id || feature.id || `street-${Date.now()}`,
      name: props.name || 'Unnamed Street',
      type: (this._mapHighwayType(props.highway) || 'residential') as 'highway' | 'primary' | 'secondary' | 'tertiary' | 'residential' | 'service' | 'path',
      geometry: {
        type: 'LineString',
        coordinates: feature.geometry.coordinates
      },
      properties: {
        length_m: props.length_m || this._calculateLengthFromCoordinates(feature.geometry.coordinates),
        speed_limit_kmh: props.maxspeed || 50,
        lanes: props.lanes || 2,
        one_way: props.oneway || false,
        surface: (this._mapSurfaceType(props.surface) || 'paved') as 'paved' | 'unpaved' | 'gravel' | 'dirt',
        width_m: props.width || 3.5,
        max_weight_kg: props.maxweight || 3500,
        max_height_m: props.maxheight || 4.0,
        max_width_m: props.maxwidth || 2.5,
        bridge: props.bridge || false,
        tunnel: props.tunnel || false,
        access: (this._mapAccessType(props.access) || 'yes') as 'yes' | 'no' | 'private' | 'emergency',
        emergency_access: props.emergency_access || true,
        evacuation_route: props.evacuation_route || false,
        hazard_zone: props.hazard_zone || false,
        traffic_signals: props.traffic_signals || false,
        stop_signs: props.stop_signs || false,
        yield_signs: props.yield_signs || false,
        roundabouts: props.roundabouts || false,
        traffic_calming: props.traffic_calming || false,
        lighting: props.lit || true,
        sidewalk: props.sidewalk || true,
        bike_lane: props.bicycle || false,
        bus_lane: props.bus_lane || false,
        hov_lane: props.hov_lane || false,
        toll: props.toll || false,
        seasonal: props.seasonal || false,
        condition: (this._mapConditionType(props.condition) || 'good') as 'excellent' | 'good' | 'fair' | 'poor' | 'closed',
        last_updated: new Date().toISOString()
      }
    };
  }

  /**
   * Map highway type from backend to frontend format
   */
  private _mapHighwayType(highway: string): string {
    const typeMap: Record<string, string> = {
      'motorway': 'highway',
      'trunk': 'highway',
      'primary': 'primary',
      'secondary': 'secondary',
      'tertiary': 'tertiary',
      'residential': 'residential',
      'service': 'service',
      'path': 'path'
    };
    return typeMap[highway] || 'residential';
  }

  /**
   * Map surface type from backend to frontend format
   */
  private _mapSurfaceType(surface: string): string {
    const surfaceMap: Record<string, string> = {
      'paved': 'paved',
      'unpaved': 'unpaved',
      'gravel': 'gravel',
      'dirt': 'dirt'
    };
    return surfaceMap[surface] || 'paved';
  }

  /**
   * Map access type from backend to frontend format
   */
  private _mapAccessType(access: string): string {
    const accessMap: Record<string, string> = {
      'yes': 'yes',
      'no': 'no',
      'private': 'private',
      'emergency': 'emergency'
    };
    return accessMap[access] || 'yes';
  }

  /**
   * Map condition type from backend to frontend format
   */
  private _mapConditionType(condition: string): string {
    const conditionMap: Record<string, string> = {
      'excellent': 'excellent',
      'good': 'good',
      'fair': 'fair',
      'poor': 'poor',
      'closed': 'closed'
    };
    return conditionMap[condition] || 'good';
  }

  /**
   * Calculate length from coordinates
   */
  private _calculateLengthFromCoordinates(coordinates: [number, number][]): number {
    let totalLength = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      
      if (!prev || !curr) continue;
      
      const lat1 = prev[1] * Math.PI / 180;
      const lat2 = curr[1] * Math.PI / 180;
      const deltaLat = (curr[1] - prev[1]) * Math.PI / 180;
      const deltaLon = (curr[0] - prev[0]) * Math.PI / 180;
      
      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) +
                Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371000 * c; // Earth radius in meters
      
      totalLength += distance;
    }
    return Math.round(totalLength);
  }
}

export const streetDataService = new StreetDataService();
export default streetDataService;
