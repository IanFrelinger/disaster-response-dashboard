// Domain types with compile-time guarantees
// Branded types prevent common mistakes like lat/lon mix-ups

// Geographic coordinates with validation
export type Longitude = number & { readonly __brand: 'Longitude' };
export type Latitude = number & { readonly __brand: 'Latitude' };
export type Zoom = number & { readonly __brand: 'Zoom' };

// Coordinate validation functions
export const createLongitude = (value: number): Longitude => {
  if (value < -180 || value > 180) {
    throw new Error(`Invalid longitude: ${value}. Must be between -180 and 180.`);
  }
  return value as Longitude;
};

export const createLatitude = (value: number): Latitude => {
  if (value < -90 || value > 90) {
    throw new Error(`Invalid latitude: ${value}. Must be between -90 and 90.`);
  }
  return value as Latitude;
};

export const createZoom = (value: number): Zoom => {
  if (value < 0 || value > 22) {
    throw new Error(`Invalid zoom: ${value}. Must be between 0 and 22.`);
  }
  return value as Zoom;
};

// Typed layer IDs to prevent string typos
export type AnyLayerId = 
  | 'fire-incidents'
  | 'evacuation-zones'
  | 'emergency-services'
  | 'road-closures'
  | 'weather-alerts'
  | 'resource-locations'
  | 'damage-assessment'
  | 'population-density';

// GeoJSON coordinate tuple with branded types
export type GeoJSONCoordinate = [Longitude, Latitude];

// Map bounds with branded types
export interface MapBounds {
  north: Latitude;
  south: Latitude;
  east: Longitude;
  west: Longitude;
}

// Error codes for observability
export type ErrorCode = 
  | 'API_TIMEOUT'
  | 'API_RATE_LIMIT'
  | 'API_INVALID_JSON'
  | 'MAP_WEBGL_UNAVAILABLE'
  | 'MAP_STYLE_LOAD_FAIL'
  | 'DATA_INVALID_GEOJSON'
  | 'DATA_MEMORY_OVERFLOW'
  | 'UI_ERROR_BOUNDARY'
  | 'UI_LAZY_LOAD_FAIL'
  | 'PERF_MEMORY_SPIKE'
  | 'PERF_FRAME_RATE_DROP'
  | 'INTEGRATION_SERVICE_DISCOVERY_FAIL'
  | 'INTEGRATION_CIRCUIT_BREAKER';

// Structured error with observability
export interface StructuredError {
  code: ErrorCode;
  message: string;
  trace_id: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

// Exhaustiveness checking utility
export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}
