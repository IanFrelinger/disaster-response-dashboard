/**
 * Error Testing Playbook - Fault Catalog
 * 
 * This file defines all possible fault types across system boundaries.
 * Every test phase should iterate through these to guarantee coverage.
 */

// API Layer Faults
export type ApiFault =
  | { kind: 'http'; status: 400 | 401 | 403 | 404 | 408 | 409 | 429 | 500 | 502 | 503 }
  | { kind: 'timeout' }
  | { kind: 'invalid-json' }
  | { kind: 'schema-mismatch' }
  | { kind: 'network-error' }
  | { kind: 'cors-error' }
  | { kind: 'rate-limit-exceeded' };

// Map Layer Faults
export type MapFault =
  | { kind: 'webgl-unavailable' }
  | { kind: 'style-load-fail' }
  | { kind: 'tile-error' }
  | { kind: 'duplicate-layer-id' }
  | { kind: 'missing-sprite' }
  | { kind: 'font-load-fail' }
  | { kind: 'geolocation-error' }
  | { kind: 'mapbox-token-invalid' }
  | { kind: '3d-terrain-load-fail' }
  | { kind: 'building-data-corrupt' };

// Data Layer Faults
export type DataFault =
  | { kind: 'geojson-invalid' }
  | { kind: 'degenerate-geometry' }
  | { kind: 'coords-out-of-range' }
  | { kind: 'extreme-density' }
  | { kind: 'empty-dataset' }
  | { kind: 'malformed-feature' }
  | { kind: 'missing-required-props' }
  | { kind: 'type-mismatch' }
  | { kind: 'circular-reference' }
  | { kind: 'memory-overflow' };

// UI Layer Faults
export type UiFault =
  | { kind: 'unhandled-promise' }
  | { kind: 'error-boundary-trigger' }
  | { kind: 'lazy-chunk-load-fail' }
  | { kind: 'i18n-missing-key' }
  | { kind: 'component-render-fail' }
  | { kind: 'state-corruption' }
  | { kind: 'event-listener-leak' }
  | { kind: 'memory-leak' }
  | { kind: 'focus-trap-fail' }
  | { kind: 'accessibility-violation' }
  | { kind: 'click-failure' }
  | { kind: 'drag-failure' }
  | { kind: 'keyboard-failure' }
  | { kind: 'form-submission-failure' }
  | { kind: 'navigation-failure' }
  | { kind: 'rapid-click-burst' }
  | { kind: 'rapid-hover-burst' }
  | { kind: 'click-outside-map' };

// Environment Faults
export type EnvFault =
  | { kind: 'missing-mapbox-token' }
  | { kind: 'invalid-api-endpoint' }
  | { kind: 'ssl-certificate-error' }
  | { kind: 'feature-flag-mismatch' }
  | { kind: 'config-file-corrupt' }
  | { kind: 'environment-variable-missing' };

// Performance Faults
export type PerfFault =
  | { kind: 'frame-rate-drop' }
  | { kind: 'memory-spike' }
  | { kind: 'cpu-overload' }
  | { kind: 'network-latency' }
  | { kind: 'render-blocking' }
  | { kind: 'large-bundle-size' };

// Integration Faults
export type IntegrationFault =
  | { kind: 'service-discovery-fail' }
  | { kind: 'circuit-breaker-trigger' }
  | { kind: 'fallback-service-unavailable' }
  | { kind: 'data-sync-conflict' }
  | { kind: 'version-mismatch' }
  | { kind: 'dependency-resolution-fail' };

// All Fault Types Combined
export type AllFaults = 
  | ApiFault 
  | MapFault 
  | DataFault 
  | UiFault 
  | EnvFault 
  | PerfFault 
  | IntegrationFault;

// Fault Categories for Phase-based Testing
export const FAULT_CATEGORIES = {
  // Phase 1: Foundation & Basic Functionality
  phase1: {
    env: ['missing-mapbox-token', 'invalid-api-endpoint', 'config-file-corrupt'] as const,
    map: ['webgl-unavailable', 'style-load-fail', 'mapbox-token-invalid'] as const,
    api: ['network-error', 'cors-error'] as const,
    ui: ['component-render-fail'] as const
  },
  
  // Phase 2: Visual Effects & Styling
  phase2: {
    map: ['duplicate-layer-id', 'missing-sprite', 'font-load-fail', 'tile-error'] as const,
    data: ['geojson-invalid', 'degenerate-geometry'] as const,
    ui: ['component-render-fail', 'accessibility-violation'] as const
  },
  
  // Phase 3: Interactive Elements
  phase3: {
    ui: ['unhandled-promise', 'error-boundary-trigger', 'event-listener-leak', 'focus-trap-fail'] as const,
    map: ['geolocation-error'] as const,
    data: ['type-mismatch', 'missing-required-props'] as const
  },
  
  // Phase 4: Advanced Integration & Performance
  phase4: {
    api: ['http', 'timeout', 'invalid-json', 'schema-mismatch', 'rate-limit-exceeded'] as const,
    perf: ['frame-rate-drop', 'memory-spike', 'network-latency'] as const,
    integration: ['service-discovery-fail', 'circuit-breaker-trigger', 'data-sync-conflict'] as const
  },
  
  // Phase 5: Stress & Edge Cases
  phase5: {
    data: ['extreme-density', 'empty-dataset', 'memory-overflow', 'circular-reference'] as const,
    map: ['3d-terrain-load-fail', 'building-data-corrupt'] as const,
    perf: ['cpu-overload', 'render-blocking', 'large-bundle-size'] as const,
    ui: ['lazy-chunk-load-fail', 'i18n-missing-key', 'state-corruption'] as const
  }
} as const;

// Fault Injection Configuration
export interface FaultInjectionConfig {
  api: ApiFault | null;
  map: MapFault | null;
  data: DataFault | null;
  ui: UiFault | null;
  env: EnvFault | null;
  perf: PerfFault | null;
  integration: IntegrationFault | null;
}

// Default (no faults) configuration
export const DEFAULT_FAULT_CONFIG: FaultInjectionConfig = {
  api: null,
  map: null,
  data: null,
  ui: null,
  env: null,
  perf: null,
  integration: null
};

// Fault Injection API
export interface FaultInjectionAPI {
  config: FaultInjectionConfig;
  setFault: <K extends keyof FaultInjectionConfig>(
    category: K, 
    fault: FaultInjectionConfig[K]
  ) => void;
  reset: () => void;
  getActiveFaults: () => Array<{ category: keyof FaultInjectionConfig; fault: AllFaults }>;
  hasAnyFault: () => boolean;
  api: {
    shouldFail: () => boolean;
    getFault: () => ApiFault | null;
    injectHttpError: (status: 400 | 401 | 403 | 404 | 408 | 409 | 429 | 500 | 502 | 503) => void;
    injectTimeout: () => void;
    injectInvalidJson: () => void;
    injectSchemaMismatch: () => void;
    injectNetworkError: () => void;
    injectCorsError: () => void;
    injectRateLimitExceeded: () => void;
    injectRateLimit: () => void;
    injectCircuitBreaker: () => void;
  };
  map: {
    shouldFail: () => boolean;
    getFault: () => MapFault | null;
    injectWebglUnavailable: () => void;
    injectStyleLoadFail: () => void;
    injectInvalidToken: () => void;
    injectDuplicateLayerId: () => void;
    injectTileError: () => void;
    injectMissingSprite: () => void;
    injectFontLoadFail: () => void;
    injectGeolocationError: () => void;
    inject3DTerrainFail: () => void;
    injectBuildingDataCorrupt: () => void;
  };
  perf: {
    shouldFail: () => boolean;
    getFault: () => PerfFault | null;
    injectMemorySpike: () => void;
    injectNetworkLatency: () => void;
    injectFrameRateDrop: () => void;
    injectCpuOverload: () => void;
    injectRenderBlocking: () => void;
    injectLargeBundle: () => void;
  };
  data: {
    shouldFail: () => boolean;
    getFault: () => DataFault | null;
    injectGeojsonInvalid: () => void;
    injectEmptyDataset: () => void;
    injectTypeMismatch: () => void;
    injectMissingRequiredProps: () => void;
    injectExtremeDensity: () => void;
    injectMemoryOverflow: () => void;
    injectCircularReference: () => void;
    injectMalformedFeature: () => void;
    injectCoordsOutOfRange: () => void;
  };
  ui: {
    shouldFail: () => boolean;
    getFault: () => UiFault | null;
    injectUnhandledPromise: () => void;
    injectErrorBoundary: () => void;
    injectLazyChunkFail: () => void;
    injectI18nMissing: () => void;
    injectComponentRenderFail: () => void;
    injectStateCorruption: () => void;
    injectEventListenerLeak: () => void;
    injectMemoryLeak: () => void;
    injectFocusTrapFail: () => void;
    injectAccessibilityViolation: () => void;
    injectClickFailure: () => void;
    injectDragFailure: () => void;
    injectKeyboardFailure: () => void;
    injectFormSubmissionFailure: () => void;
    injectNavigationFailure: () => void;
    injectRapidClickBurst: () => void;
    injectRapidHoverBurst: () => void;
    injectClickOutsideMap: () => void;
  };
  env: {
    shouldFail: () => boolean;
    getFault: () => EnvFault | null;
    injectMissingMapboxToken: () => void;
    injectInvalidApiEndpoint: () => void;
    injectSslCertificateError: () => void;
    injectFeatureFlagMismatch: () => void;
    injectConfigFileCorrupt: () => void;
    injectEnvironmentVariableMissing: () => void;
  };
  integration: {
    shouldFail: () => boolean;
    getFault: () => IntegrationFault | null;
    injectServiceDiscoveryFail: () => void;
    injectCircuitBreakerTrigger: () => void;
    injectFallbackServiceUnavailable: () => void;
    injectDataSyncConflict: () => void;
    injectVersionMismatch: () => void;
    injectDependencyResolutionFail: () => void;
  };
}

// Fault Description Map for Testing
export const FAULT_DESCRIPTIONS: Record<string, string> = {
  // API Faults
  'http-400': 'Bad Request - Invalid parameters',
  'http-401': 'Unauthorized - Missing or invalid credentials',
  'http-403': 'Forbidden - Insufficient permissions',
  'http-404': 'Not Found - Resource does not exist',
  'http-408': 'Request Timeout - Server took too long to respond',
  'http-409': 'Conflict - Resource state conflict',
  'http-429': 'Too Many Requests - Rate limit exceeded',
  'http-500': 'Internal Server Error - Server malfunction',
  'http-502': 'Bad Gateway - Upstream service error',
  'http-503': 'Service Unavailable - Service temporarily unavailable',
  
  // Map Faults
  'webgl-unavailable': 'WebGL not supported or disabled',
  'style-load-fail': 'Map style failed to load',
  'tile-error': 'Map tiles failed to load',
  'duplicate-layer-id': 'Duplicate layer ID detected',
  'missing-sprite': 'Map sprite images missing',
  'font-load-fail': 'Map fonts failed to load',
  'geolocation-error': 'Geolocation service failed',
  'mapbox-token-invalid': 'Invalid Mapbox access token',
  '3d-terrain-load-fail': '3D terrain data failed to load',
  'building-data-corrupt': 'Building data is corrupted',
  
  // Data Faults
  'geojson-invalid': 'Invalid GeoJSON format',
  'degenerate-geometry': 'Geometry contains invalid coordinates',
  'coords-out-of-range': 'Coordinates outside valid ranges',
  'extreme-density': 'Data density exceeds performance limits',
  'empty-dataset': 'Dataset contains no features',
  'malformed-feature': 'Feature has malformed properties',
  'missing-required-props': 'Required properties missing',
  'type-mismatch': 'Data type mismatch',
  'circular-reference': 'Circular reference detected',
  'memory-overflow': 'Data exceeds memory limits',
  
  // UI Faults
  'unhandled-promise': 'Unhandled promise rejection',
  'error-boundary-trigger': 'Error boundary activated',
  'lazy-chunk-load-fail': 'Lazy-loaded component failed',
  'i18n-missing-key': 'Internationalization key missing',
  'component-render-fail': 'Component failed to render',
  'state-corruption': 'Application state corrupted',
  'event-listener-leak': 'Event listener memory leak',
  'memory-leak': 'Memory leak detected',
  'focus-trap-fail': 'Focus trap failed',
  'accessibility-violation': 'Accessibility standards violation',
  
  // Environment Faults
  'missing-mapbox-token': 'Mapbox access token missing',
  'invalid-api-endpoint': 'Invalid API endpoint configuration',
  'ssl-certificate-error': 'SSL certificate validation failed',
  'feature-flag-mismatch': 'Feature flag configuration mismatch',
  'config-file-corrupt': 'Configuration file corrupted',
  'environment-variable-missing': 'Required environment variable missing',
  
  // Performance Faults
  'frame-rate-drop': 'Frame rate dropped below threshold',
  'memory-spike': 'Memory usage spiked unexpectedly',
  'cpu-overload': 'CPU usage exceeded limits',
  'network-latency': 'Network latency exceeded threshold',
  'render-blocking': 'Render blocking detected',
  'large-bundle-size': 'Bundle size exceeded limits',
  
  // Integration Faults
  'service-discovery-fail': 'Service discovery failed',
  'circuit-breaker-trigger': 'Circuit breaker activated',
  'fallback-service-unavailable': 'Fallback service unavailable',
  'data-sync-conflict': 'Data synchronization conflict',
  'version-mismatch': 'Version compatibility mismatch',
  'dependency-resolution-fail': 'Dependency resolution failed'
};

// Helper function to get fault description
export const getFaultDescription = (fault: AllFaults): string => {
  if (fault.kind === 'http') {
    return FAULT_DESCRIPTIONS[`http-${fault.status}`] || `HTTP ${fault.status} error`;
  }
  return FAULT_DESCRIPTIONS[fault.kind] || `Unknown fault: ${fault.kind}`;
};

// Fault severity levels for testing prioritization
export const FAULT_SEVERITY: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  // Critical - App completely unusable
  'webgl-unavailable': 'critical',
  'missing-mapbox-token': 'critical',
  'config-file-corrupt': 'critical',
  
  // High - Major functionality broken
  'style-load-fail': 'high',
  'api-500': 'high',
  'geojson-invalid': 'high',
  'error-boundary-trigger': 'high',
  
  // Medium - Some features affected
  'tile-error': 'medium',
  'duplicate-layer-id': 'medium',
  'http-429': 'medium',
  'frame-rate-drop': 'medium',
  
  // Low - Minor issues
  'missing-sprite': 'low',
  'i18n-missing-key': 'low',
  'http-404': 'low'
};

// Export all fault types for easy access
export const ALL_FAULTS = {
  ApiFaults: ['http', 'timeout', 'invalid-json', 'schema-mismatch', 'network-error', 'cors-error', 'rate-limit-exceeded'] as const,
  MapFaults: ['webgl-unavailable', 'style-load-fail', 'tile-error', 'duplicate-layer-id', 'missing-sprite', 'font-load-fail', 'geolocation-error', 'mapbox-token-invalid', '3d-terrain-load-fail', 'building-data-corrupt'] as const,
  DataFaults: ['geojson-invalid', 'degenerate-geometry', 'coords-out-of-range', 'extreme-density', 'empty-dataset', 'malformed-feature', 'missing-required-props', 'type-mismatch', 'circular-reference', 'memory-overflow'] as const,
  UiFaults: ['unhandled-promise', 'error-boundary-trigger', 'lazy-chunk-load-fail', 'i18n-missing-key', 'component-render-fail', 'state-corruption', 'event-listener-leak', 'memory-leak', 'focus-trap-fail', 'accessibility-violation'] as const,
  EnvFaults: ['missing-mapbox-token', 'invalid-api-endpoint', 'ssl-certificate-error', 'feature-flag-mismatch', 'config-file-corrupt', 'environment-variable-missing'] as const,
  PerfFaults: ['frame-rate-drop', 'memory-spike', 'cpu-overload', 'network-latency', 'render-blocking', 'large-bundle-size'] as const,
  IntegrationFaults: ['service-discovery-fail', 'circuit-breaker-trigger', 'fallback-service-unavailable', 'data-sync-conflict', 'version-mismatch', 'dependency-resolution-fail'] as const
} as const;

// Error codes for different fault types
export const ERROR_CODES = {
  // API Faults
  API_RATE_LIMIT_EXCEEDED: 'API_RATE_LIMIT_EXCEEDED',
  API_TIMEOUT: 'API_TIMEOUT',
  API_INVALID_JSON: 'API_INVALID_JSON',
  API_SCHEMA_MISMATCH: 'API_SCHEMA_MISMATCH',
  API_NETWORK_ERROR: 'API_NETWORK_ERROR',
  API_CORS_ERROR: 'API_CORS_ERROR',
  API_HTTP_ERROR: 'API_HTTP_ERROR',
  
  // Integration Faults
  CIRCUIT_BREAKER_OPEN: 'CIRCUIT_BREAKER_OPEN',
  SERVICE_DISCOVERY_FAIL: 'SERVICE_DISCOVERY_FAIL',
  FALLBACK_SERVICE_UNAVAILABLE: 'FALLBACK_SERVICE_UNAVAILABLE',
  DATA_SYNC_CONFLICT: 'DATA_SYNC_CONFLICT',
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  DEPENDENCY_RESOLUTION_FAIL: 'DEPENDENCY_RESOLUTION_FAIL',
  
  // Map Faults
  MAP_WEBGL_UNAVAILABLE: 'MAP_WEBGL_UNAVAILABLE',
  MAP_STYLE_LOAD_FAIL: 'MAP_STYLE_LOAD_FAIL',
  MAP_TILE_ERROR: 'MAP_TILE_ERROR',
  MAP_3D_TERRAIN_FAIL: 'MAP_3D_TERRAIN_FAIL',
  
  // Data Faults
  DATA_GEOJSON_INVALID: 'DATA_GEOJSON_INVALID',
  DATA_MEMORY_OVERFLOW: 'DATA_MEMORY_OVERFLOW',
  DATA_TYPE_MISMATCH: 'DATA_TYPE_MISMATCH',
  
  // UI Faults
  UI_COMPONENT_RENDER_FAIL: 'UI_COMPONENT_RENDER_FAIL',
  UI_ERROR_BOUNDARY_TRIGGER: 'UI_ERROR_BOUNDARY_TRIGGER',
  UI_MEMORY_LEAK: 'UI_MEMORY_LEAK',
  
  // Environment Faults
  ENV_MISSING_MAPBOX_TOKEN: 'ENV_MISSING_MAPBOX_TOKEN',
  ENV_CONFIG_CORRUPT: 'ENV_CONFIG_CORRUPT',
  
  // Performance Faults
  PERF_MEMORY_SPIKE: 'PERF_MEMORY_SPIKE',
  PERF_FRAME_RATE_DROP: 'PERF_FRAME_RATE_DROP',
  PERF_CPU_OVERLOAD: 'PERF_CPU_OVERLOAD'
} as const;

// Typed error schema for compile-time consistency
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Correlation ID for cross-service debugging
export type CorrelationId = string;

// Enhanced structured error object with observability features
export interface StructuredError {
  error_code: ErrorCode;
  message: string;
  trace_id: string;
  correlation_id?: CorrelationId;
  timestamp: string;
  category: keyof FaultInjectionConfig;
  fault_kind: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  user_id?: string | undefined;
  session_id?: string | undefined;
}

// Error schema validation result
export interface ErrorValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields: string[];
}

// Error audit result for enforcing consistency
export interface ErrorAuditResult {
  totalErrors: number;
  validErrors: number;
  invalidErrors: number;
  missingErrorCodes: number;
  missingTraceIds: number;
  missingCorrelationIds: number;
  validationErrors: Array<{ error: StructuredError; issues: string[] }>;
}

// Helper function to generate trace IDs
export const generateTraceId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `trace-${timestamp}-${random}`;
};

// Enhanced helper function to create structured errors with validation
export const createStructuredError = (
  errorCode: ErrorCode,
  message: string,
  category: keyof FaultInjectionConfig,
  faultKind: string,
  options?: {
    correlationId?: CorrelationId;
    metadata?: Record<string, unknown>;
    severity?: StructuredError['severity'];
    source?: string;
    userId?: string;
    sessionId?: string;
  }
): StructuredError => {
  const error: StructuredError = {
    error_code: errorCode,
    message,
    trace_id: generateTraceId(),
    timestamp: new Date().toISOString(),
    category,
    fault_kind: faultKind,
    metadata: options?.metadata || {},
    severity: options?.severity || 'medium',
    source: options?.source || 'fault-injection-system',
    user_id: options?.userId,
    session_id: options?.sessionId
  };

  if (options?.correlationId) {
    error.correlation_id = options.correlationId;
  }

  return error;
};

// Generate correlation ID for cross-service debugging
export const generateCorrelationId = (): CorrelationId => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const serviceId = 'disaster-dashboard';
  return `${serviceId}-${timestamp}-${random}`;
};

// Validate structured error for completeness
export const validateStructuredError = (error: StructuredError): ErrorValidationResult => {
  const errors: string[] = [];
  const missingFields: string[] = [];

  // Required fields validation
  if (!error.error_code) {
    missingFields.push('error_code');
    errors.push('error_code is required');
  }

  if (!error.trace_id) {
    missingFields.push('trace_id');
    errors.push('trace_id is required');
  }

  if (!error.message) {
    missingFields.push('message');
    errors.push('message is required');
  }

  if (!error.category) {
    missingFields.push('category');
    errors.push('category is required');
  }

  if (!error.fault_kind) {
    missingFields.push('fault_kind');
    errors.push('fault_kind is required');
  }

  if (!error.timestamp) {
    missingFields.push('timestamp');
    errors.push('timestamp is required');
  }

  // Type validation
  if (error.error_code && !Object.values(ERROR_CODES).includes(error.error_code)) {
    errors.push(`Invalid error_code: ${error.error_code}`);
  }

  if (error.trace_id && !error.trace_id.match(/^trace-\w+-\w+$/)) {
    errors.push(`Invalid trace_id format: ${error.trace_id}`);
  }

  if (error.correlation_id && !error.correlation_id.match(/^[\w-]+-\w+-\w+$/)) {
    errors.push(`Invalid correlation_id format: ${error.correlation_id}`);
  }

  // Timestamp validation
  if (error.timestamp) {
    const timestamp = new Date(error.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.push(`Invalid timestamp format: ${error.timestamp}`);
    }
  }

  // Severity validation
  if (error.severity && !['low', 'medium', 'high', 'critical'].includes(error.severity)) {
    errors.push(`Invalid severity: ${error.severity}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields
  };
};

// Audit multiple errors for consistency
export const auditStructuredErrors = (errors: StructuredError[]): ErrorAuditResult => {
  const result: ErrorAuditResult = {
    totalErrors: errors.length,
    validErrors: 0,
    invalidErrors: 0,
    missingErrorCodes: 0,
    missingTraceIds: 0,
    missingCorrelationIds: 0,
    validationErrors: []
  };

  errors.forEach(error => {
    const validation = validateStructuredError(error);
    
    if (validation.isValid) {
      result.validErrors++;
    } else {
      result.invalidErrors++;
      
      if (validation.missingFields.includes('error_code')) {
        result.missingErrorCodes++;
      }
      
      if (validation.missingFields.includes('trace_id')) {
        result.missingTraceIds++;
      }
      
      if (validation.missingFields.includes('correlation_id')) {
        result.missingCorrelationIds++;
      }
      
      result.validationErrors.push({
        error,
        issues: validation.errors
      });
    }
  });

  return result;
};

// Error code mapping for fault types
export const getErrorCodeForFault = (fault: AllFaults): ErrorCode => {
  switch (fault.kind) {
    // API Faults
    case 'rate-limit-exceeded':
      return ERROR_CODES.API_RATE_LIMIT_EXCEEDED;
    case 'timeout':
      return ERROR_CODES.API_TIMEOUT;
    case 'invalid-json':
      return ERROR_CODES.API_INVALID_JSON;
    case 'schema-mismatch':
      return ERROR_CODES.API_SCHEMA_MISMATCH;
    case 'network-error':
      return ERROR_CODES.API_NETWORK_ERROR;
    case 'cors-error':
      return ERROR_CODES.API_CORS_ERROR;
    case 'http':
      return ERROR_CODES.API_HTTP_ERROR;
    
    // Integration Faults
    case 'circuit-breaker-trigger':
      return ERROR_CODES.CIRCUIT_BREAKER_OPEN;
    case 'service-discovery-fail':
      return ERROR_CODES.SERVICE_DISCOVERY_FAIL;
    case 'fallback-service-unavailable':
      return ERROR_CODES.FALLBACK_SERVICE_UNAVAILABLE;
    case 'data-sync-conflict':
      return ERROR_CODES.DATA_SYNC_CONFLICT;
    case 'version-mismatch':
      return ERROR_CODES.VERSION_MISMATCH;
    case 'dependency-resolution-fail':
      return ERROR_CODES.DEPENDENCY_RESOLUTION_FAIL;
    
    // Map Faults
    case 'webgl-unavailable':
      return ERROR_CODES.MAP_WEBGL_UNAVAILABLE;
    case 'style-load-fail':
      return ERROR_CODES.MAP_STYLE_LOAD_FAIL;
    case 'tile-error':
      return ERROR_CODES.MAP_TILE_ERROR;
    case '3d-terrain-load-fail':
      return ERROR_CODES.MAP_3D_TERRAIN_FAIL;
    
    // Data Faults
    case 'geojson-invalid':
      return ERROR_CODES.DATA_GEOJSON_INVALID;
    case 'memory-overflow':
      return ERROR_CODES.DATA_MEMORY_OVERFLOW;
    case 'type-mismatch':
      return ERROR_CODES.DATA_TYPE_MISMATCH;
    
    // UI Faults
    case 'component-render-fail':
      return ERROR_CODES.UI_COMPONENT_RENDER_FAIL;
    case 'error-boundary-trigger':
      return ERROR_CODES.UI_ERROR_BOUNDARY_TRIGGER;
    case 'memory-leak':
      return ERROR_CODES.UI_MEMORY_LEAK;
    
    // Environment Faults
    case 'missing-mapbox-token':
      return ERROR_CODES.ENV_MISSING_MAPBOX_TOKEN;
    case 'config-file-corrupt':
      return ERROR_CODES.ENV_CONFIG_CORRUPT;
    
    // Performance Faults
    case 'memory-spike':
      return ERROR_CODES.PERF_MEMORY_SPIKE;
    case 'frame-rate-drop':
      return ERROR_CODES.PERF_FRAME_RATE_DROP;
    case 'cpu-overload':
      return ERROR_CODES.PERF_CPU_OVERLOAD;
    
    default:
      return 'UNKNOWN_FAULT' as ErrorCode;
  }
};

// Create error with correlation ID for cross-service debugging
export const createCorrelatedError = (
  errorCode: ErrorCode,
  message: string,
  category: keyof FaultInjectionConfig,
  faultKind: string,
  correlationId: CorrelationId,
  options?: {
    metadata?: Record<string, unknown>;
    severity?: StructuredError['severity'];
    source?: string;
    userId?: string;
    sessionId?: string;
  }
): StructuredError => {
  return createStructuredError(errorCode, message, category, faultKind, {
    correlationId,
    ...options
  });
};

// Batch error creation with validation
export const createBatchErrors = (
  errors: Array<{
    errorCode: ErrorCode;
    message: string;
    category: keyof FaultInjectionConfig;
    faultKind: string;
    options?: Parameters<typeof createStructuredError>[4];
  }>
): StructuredError[] => {
  return errors.map(({ errorCode, message, category, faultKind, options }) =>
    createStructuredError(errorCode, message, category, faultKind, options)
  );
};

// Error severity mapping based on fault type
export const getErrorSeverity = (fault: AllFaults): StructuredError['severity'] => {
  switch (fault.kind) {
    // Critical faults
    case 'circuit-breaker-trigger':
    case 'service-discovery-fail':
    case 'fallback-service-unavailable':
      return 'critical';
    
    // High severity faults
    case 'rate-limit-exceeded':
    case 'memory-overflow':
    case 'component-render-fail':
      return 'high';
    
    // Medium severity faults
    case 'timeout':
    case 'network-error':
    case 'webgl-unavailable':
    case 'geojson-invalid':
      return 'medium';
    
    // Low severity faults
    case 'invalid-json':
    case 'schema-mismatch':
    case 'tile-error':
      return 'low';
    
    default:
      return 'medium';
  }
};

// Create error with automatic severity detection
export const createSeverityAwareError = (
  errorCode: ErrorCode,
  message: string,
  category: keyof FaultInjectionConfig,
  faultKind: string,
  options?: {
    correlationId?: CorrelationId;
    metadata?: Record<string, unknown>;
    source?: string;
    userId?: string;
    sessionId?: string;
  }
): StructuredError => {
  // Find the fault to determine severity
  const fault: AllFaults = { kind: faultKind as any };
  const severity = getErrorSeverity(fault);
  
  return createStructuredError(errorCode, message, category, faultKind, {
    ...options,
    severity
  });
};
