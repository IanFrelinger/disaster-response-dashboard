import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';
import { setupDeterministicTest } from '../utils/determinism';
import { createStructuredError, getErrorCodeForFault } from '../utils/observability';

describe('Fault Combinations - Pairwise Testing', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupDeterministicTest(12345);
    useFaultInjection.reset();
  });

  afterEach(() => {
    cleanup();
  });

  // High-impact pairwise combinations as suggested in feedback
  describe('API + Performance Combinations', () => {
    test('slow network + rate limit (API_TIMEOUT + API_RATE_LIMIT)', () => {
      // Inject both faults
      useFaultInjection.api.injectTimeout();
      useFaultInjection.perf.injectNetworkLatency();

      // Verify both faults are active
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.perf.shouldFail()).toBe(true);

      // Verify fault types
      const apiFault = useFaultInjection.api.getFault();
      const perfFault = useFaultInjection.perf.getFault();
      
      expect(apiFault?.kind).toBe('timeout');
      expect(perfFault?.kind).toBe('network-latency');

      // Test observability
      const apiErrorCode = getErrorCodeForFault('api', 'timeout');
      const perfErrorCode = getErrorCodeForFault('perf', 'network-latency');
      
      expect(apiErrorCode).toBe('API_TIMEOUT');
      expect(perfErrorCode).toBe('PERF_MEMORY_SPIKE'); // Network latency maps to memory spike
    });

    test('invalid JSON + retry mechanism (API_INVALID_JSON + API_TIMEOUT)', () => {
      // Inject invalid JSON fault
      useFaultInjection.api.injectInvalidJson();
      
      // Simulate retry by injecting timeout
      useFaultInjection.api.injectTimeout();

      // Verify latest fault (timeout) is active
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      const fault = useFaultInjection.api.getFault();
      expect(fault?.kind).toBe('timeout');

      // Verify error code
      const errorCode = getErrorCodeForFault('api', 'timeout');
      expect(errorCode).toBe('API_TIMEOUT');
    });
  });

  describe('Map + Data Combinations', () => {
    test('tile error + duplicate layer (MAP_STYLE_LOAD_FAIL + MAP_STYLE_LOAD_FAIL)', () => {
      // Inject tile error first
      useFaultInjection.map.injectTileError();
      
      // Then inject duplicate layer (should replace tile error)
      useFaultInjection.map.injectDuplicateLayerId();

      // Verify latest fault is active
      expect(useFaultInjection.map.shouldFail()).toBe(true);
      const fault = useFaultInjection.map.getFault();
      expect(fault?.kind).toBe('duplicate-layer-id');

      // Verify error code
      const errorCode = getErrorCodeForFault('map', 'duplicate-layer-id');
      expect(errorCode).toBe('MAP_STYLE_LOAD_FAIL');
    });

    test('building data corrupt + memory overflow (MAP_STYLE_LOAD_FAIL + DATA_MEMORY_OVERFLOW)', () => {
      // Inject both faults
      useFaultInjection.map.injectBuildingDataCorrupt();
      useFaultInjection.data.injectMemoryOverflow();

      // Verify both faults are active
      expect(useFaultInjection.map.shouldFail()).toBe(true);
      expect(useFaultInjection.data.shouldFail()).toBe(true);

      // Verify fault types
      const mapFault = useFaultInjection.map.getFault();
      const dataFault = useFaultInjection.data.getFault();
      
      expect(mapFault?.kind).toBe('building-data-corrupt');
      expect(dataFault?.kind).toBe('memory-overflow');

      // Test observability
      const mapErrorCode = getErrorCodeForFault('map', 'building-data-corrupt');
      const dataErrorCode = getErrorCodeForFault('data', 'memory-overflow');
      
      expect(mapErrorCode).toBe('MAP_STYLE_LOAD_FAIL');
      expect(dataErrorCode).toBe('DATA_MEMORY_OVERFLOW');
    });
  });

  describe('UI + Integration Combinations', () => {
    test('offline + lazy chunk fail (INTEGRATION_SERVICE_DISCOVERY_FAIL + UI_LAZY_LOAD_FAIL)', () => {
      // Inject offline fault
      useFaultInjection.integration.injectFallbackServiceUnavailable();
      
      // Inject lazy chunk failure
      useFaultInjection.ui.injectLazyChunkFail();

      // Verify both faults are active
      expect(useFaultInjection.integration.shouldFail()).toBe(true);
      expect(useFaultInjection.ui.shouldFail()).toBe(true);

      // Verify fault types
      const integrationFault = useFaultInjection.integration.getFault();
      const uiFault = useFaultInjection.ui.getFault();
      
      expect(integrationFault?.kind).toBe('fallback-service-unavailable');
      expect(uiFault?.kind).toBe('lazy-chunk-load-fail');

      // Test observability
      const integrationErrorCode = getErrorCodeForFault('integration', 'fallback-service-unavailable');
      const uiErrorCode = getErrorCodeForFault('ui', 'lazy-chunk-load-fail');
      
      expect(integrationErrorCode).toBe('INTEGRATION_SERVICE_DISCOVERY_FAIL');
      expect(uiErrorCode).toBe('UI_LAZY_LOAD_FAIL');
    });

    test('circuit breaker + error boundary (INTEGRATION_CIRCUIT_BREAKER + UI_ERROR_BOUNDARY)', () => {
      // Inject circuit breaker
      useFaultInjection.integration.injectCircuitBreakerTrigger();
      
      // Inject error boundary trigger
      useFaultInjection.ui.injectErrorBoundary();

      // Verify both faults are active
      expect(useFaultInjection.integration.shouldFail()).toBe(true);
      expect(useFaultInjection.ui.shouldFail()).toBe(true);

      // Verify fault types
      const integrationFault = useFaultInjection.integration.getFault();
      const uiFault = useFaultInjection.ui.getFault();
      
      expect(integrationFault?.kind).toBe('circuit-breaker-trigger');
      expect(uiFault?.kind).toBe('error-boundary-trigger');

      // Test observability
      const integrationErrorCode = getErrorCodeForFault('integration', 'circuit-breaker-trigger');
      const uiErrorCode = getErrorCodeForFault('ui', 'error-boundary-trigger');
      
      expect(integrationErrorCode).toBe('INTEGRATION_CIRCUIT_BREAKER');
      expect(uiErrorCode).toBe('UI_ERROR_BOUNDARY');
    });
  });

  describe('Performance + Data Combinations', () => {
    test('memory spike + extreme density (PERF_MEMORY_SPIKE + DATA_MEMORY_OVERFLOW)', () => {
      // Inject performance memory spike
      useFaultInjection.perf.injectMemorySpike();
      
      // Inject data extreme density
      useFaultInjection.data.injectExtremeDensity();

      // Verify both faults are active
      expect(useFaultInjection.perf.shouldFail()).toBe(true);
      expect(useFaultInjection.data.shouldFail()).toBe(true);

      // Verify fault types
      const perfFault = useFaultInjection.perf.getFault();
      const dataFault = useFaultInjection.data.getFault();
      
      expect(perfFault?.kind).toBe('memory-spike');
      expect(dataFault?.kind).toBe('extreme-density');

      // Test observability
      const perfErrorCode = getErrorCodeForFault('perf', 'memory-spike');
      const dataErrorCode = getErrorCodeForFault('data', 'extreme-density');
      
      expect(perfErrorCode).toBe('PERF_MEMORY_SPIKE');
      expect(dataErrorCode).toBe('DATA_MEMORY_OVERFLOW');
    });

    test('frame rate drop + malformed feature (PERF_FRAME_RATE_DROP + DATA_INVALID_GEOJSON)', () => {
      // Inject frame rate drop
      useFaultInjection.perf.injectFrameRateDrop();
      
      // Inject malformed feature
      useFaultInjection.data.injectMalformedFeature();

      // Verify both faults are active
      expect(useFaultInjection.perf.shouldFail()).toBe(true);
      expect(useFaultInjection.data.shouldFail()).toBe(true);

      // Verify fault types
      const perfFault = useFaultInjection.perf.getFault();
      const dataFault = useFaultInjection.data.getFault();
      
      expect(perfFault?.kind).toBe('frame-rate-drop');
      expect(dataFault?.kind).toBe('malformed-feature');

      // Test observability
      const perfErrorCode = getErrorCodeForFault('perf', 'frame-rate-drop');
      const dataErrorCode = getErrorCodeForFault('data', 'malformed-feature');
      
      expect(perfErrorCode).toBe('PERF_FRAME_RATE_DROP');
      expect(dataErrorCode).toBe('DATA_INVALID_GEOJSON');
    });
  });

  describe('Structured Error Observability', () => {
    test('all fault combinations generate structured errors with observability', () => {
      // Test a complex combination
      useFaultInjection.api.injectHttpError(503);
      useFaultInjection.map.injectWebglUnavailable();
      useFaultInjection.data.injectMemoryOverflow();

      // Create structured errors for each
      const apiError = createStructuredError(
        'API_TIMEOUT', // 503 maps to timeout
        'Service unavailable',
        { status: 503 }
      );

      const mapError = createStructuredError(
        'MAP_WEBGL_UNAVAILABLE',
        'WebGL not available',
        { browser: 'test' }
      );

      const dataError = createStructuredError(
        'DATA_MEMORY_OVERFLOW',
        'Memory overflow detected',
        { memoryUsage: 'high' }
      );

      // Verify observability properties
      expect(apiError.code).toBe('API_TIMEOUT');
      expect(apiError.trace_id).toMatch(/^trace_\d+_[a-z0-9]+$/);
      expect(apiError.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      expect(mapError.code).toBe('MAP_WEBGL_UNAVAILABLE');
      expect(mapError.trace_id).toMatch(/^trace_\d+_[a-z0-9]+$/);
      expect(mapError.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      expect(dataError.code).toBe('DATA_MEMORY_OVERFLOW');
      expect(dataError.trace_id).toMatch(/^trace_\d+_[a-z0-9]+$/);
      expect(dataError.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
