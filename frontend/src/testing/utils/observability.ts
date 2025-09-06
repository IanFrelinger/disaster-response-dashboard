// Observability utilities for error testing
// Provides structured errors, trace IDs, and error codes for better debugging

import type { ErrorCode, StructuredError } from '../../types/domain';

// Generate unique trace ID for each test run
export const generateTraceId = (): string => {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create structured error with observability
export const createStructuredError = (
  code: ErrorCode,
  message: string,
  context?: Record<string, unknown>
): StructuredError => {
  return {
    code,
    message,
    trace_id: generateTraceId(),
    timestamp: new Date().toISOString(),
    ...(context && { context })
  };
};

// Error code mapping for fault types
export const getErrorCodeForFault = (category: string, kind: string): ErrorCode => {
  const codeMap: Record<string, Record<string, ErrorCode>> = {
    api: {
      'http': 'API_RATE_LIMIT', // Will be overridden by status
      'timeout': 'API_TIMEOUT',
      'invalid-json': 'API_INVALID_JSON',
      'schema-mismatch': 'API_INVALID_JSON',
      'network-error': 'API_TIMEOUT',
      'cors-error': 'API_TIMEOUT',
      'rate-limit-exceeded': 'API_RATE_LIMIT'
    },
    map: {
      'webgl-unavailable': 'MAP_WEBGL_UNAVAILABLE',
      'style-load-fail': 'MAP_STYLE_LOAD_FAIL',
      'invalid-token': 'MAP_STYLE_LOAD_FAIL',
      'duplicate-layer-id': 'MAP_STYLE_LOAD_FAIL',
      'tile-error': 'MAP_STYLE_LOAD_FAIL',
      'missing-sprite': 'MAP_STYLE_LOAD_FAIL',
      'font-load-fail': 'MAP_STYLE_LOAD_FAIL',
      'geolocation-error': 'MAP_STYLE_LOAD_FAIL',
      '3d-terrain-load-fail': 'MAP_STYLE_LOAD_FAIL',
      'building-data-corrupt': 'MAP_STYLE_LOAD_FAIL'
    },
    data: {
      'geojson-invalid': 'DATA_INVALID_GEOJSON',
      'empty-dataset': 'DATA_INVALID_GEOJSON',
      'type-mismatch': 'DATA_INVALID_GEOJSON',
      'missing-required-props': 'DATA_INVALID_GEOJSON',
      'extreme-density': 'DATA_MEMORY_OVERFLOW',
      'memory-overflow': 'DATA_MEMORY_OVERFLOW',
      'circular-reference': 'DATA_INVALID_GEOJSON',
      'malformed-feature': 'DATA_INVALID_GEOJSON',
      'coords-out-of-range': 'DATA_INVALID_GEOJSON'
    },
    ui: {
      'unhandled-promise': 'UI_ERROR_BOUNDARY',
      'error-boundary-trigger': 'UI_ERROR_BOUNDARY',
      'lazy-chunk-load-fail': 'UI_LAZY_LOAD_FAIL',
      'i18n-missing-key': 'UI_ERROR_BOUNDARY',
      'component-render-fail': 'UI_ERROR_BOUNDARY',
      'state-corruption': 'UI_ERROR_BOUNDARY',
      'event-listener-leak': 'UI_ERROR_BOUNDARY',
      'memory-leak': 'UI_ERROR_BOUNDARY',
      'focus-trap-fail': 'UI_ERROR_BOUNDARY',
      'accessibility-violation': 'UI_ERROR_BOUNDARY',
      'click-failure': 'UI_ERROR_BOUNDARY',
      'drag-failure': 'UI_ERROR_BOUNDARY',
      'keyboard-failure': 'UI_ERROR_BOUNDARY',
      'form-submission-failure': 'UI_ERROR_BOUNDARY',
      'navigation-failure': 'UI_ERROR_BOUNDARY',
      'rapid-click-burst': 'UI_ERROR_BOUNDARY',
      'rapid-hover-burst': 'UI_ERROR_BOUNDARY',
      'click-outside-map': 'UI_ERROR_BOUNDARY'
    },
    perf: {
      'frame-rate-drop': 'PERF_FRAME_RATE_DROP',
      'memory-spike': 'PERF_MEMORY_SPIKE',
      'network-latency': 'PERF_MEMORY_SPIKE',
      'cpu-overload': 'PERF_MEMORY_SPIKE',
      'render-blocking': 'PERF_FRAME_RATE_DROP',
      'large-bundle-size': 'PERF_MEMORY_SPIKE'
    },
    integration: {
      'service-discovery-fail': 'INTEGRATION_SERVICE_DISCOVERY_FAIL',
      'circuit-breaker-trigger': 'INTEGRATION_CIRCUIT_BREAKER',
      'fallback-service-unavailable': 'INTEGRATION_SERVICE_DISCOVERY_FAIL',
      'data-sync-conflict': 'INTEGRATION_CIRCUIT_BREAKER',
      'version-mismatch': 'INTEGRATION_SERVICE_DISCOVERY_FAIL',
      'dependency-resolution-fail': 'INTEGRATION_SERVICE_DISCOVERY_FAIL'
    }
  };

  return codeMap[category]?.[kind] || 'UI_ERROR_BOUNDARY';
};

// HTTP status code to error code mapping
export const getErrorCodeForHttpStatus = (status: number): ErrorCode => {
  switch (status) {
    case 400: return 'API_INVALID_JSON';
    case 401: return 'API_INVALID_JSON';
    case 403: return 'API_INVALID_JSON';
    case 404: return 'API_INVALID_JSON';
    case 408: return 'API_TIMEOUT';
    case 409: return 'API_INVALID_JSON';
    case 429: return 'API_RATE_LIMIT';
    case 500: return 'API_INVALID_JSON';
    case 502: return 'API_TIMEOUT';
    case 503: return 'API_TIMEOUT';
    default: return 'API_INVALID_JSON';
  }
};

// Log structured error for observability
export const logStructuredError = (error: StructuredError): void => {
  console.error('[STRUCTURED_ERROR]', {
    code: error.code,
    message: error.message,
    trace_id: error.trace_id,
    timestamp: error.timestamp,
    context: error.context
  });
};

// Assert that error has proper observability
export const assertErrorObservability = (error: unknown): void => {
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    if (!errorObj['error_code']) {
      throw new Error('Error missing error_code for observability');
    }
    
    if (!errorObj['trace_id']) {
      throw new Error('Error missing trace_id for observability');
    }
    
    if (!errorObj['timestamp']) {
      throw new Error('Error missing timestamp for observability');
    }
  } else {
    throw new Error('Error must be an object with observability properties');
  }
};
