import { describe, test, expect, beforeEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';

describe('Phase 4 - Integration & Performance Testing', () => {
  beforeEach(() => {
    useFaultInjection.reset();
  });

  // HTTP API Fault Matrix
  describe('HTTP API Fault Matrix', () => {
    test('should handle HTTP 400 Bad Request', () => {
      useFaultInjection.api.injectHttpError(400);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 400 });
    });

    test('should handle HTTP 401 Unauthorized', () => {
      useFaultInjection.api.injectHttpError(401);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 401 });
    });

    test('should handle HTTP 403 Forbidden', () => {
      useFaultInjection.api.injectHttpError(403);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 403 });
    });

    test('should handle HTTP 404 Not Found', () => {
      useFaultInjection.api.injectHttpError(404);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 404 });
    });

    test('should handle HTTP 408 Request Timeout', () => {
      useFaultInjection.api.injectHttpError(408);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 408 });
    });

    test('should handle HTTP 409 Conflict', () => {
      useFaultInjection.api.injectHttpError(409);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 409 });
    });

    test('should handle HTTP 429 Too Many Requests', () => {
      useFaultInjection.api.injectHttpError(429);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 429 });
    });

    test('should handle HTTP 500 Internal Server Error', () => {
      useFaultInjection.api.injectHttpError(500);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 500 });
    });

    test('should handle HTTP 502 Bad Gateway', () => {
      useFaultInjection.api.injectHttpError(502);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 502 });
    });

    test('should handle HTTP 503 Service Unavailable', () => {
      useFaultInjection.api.injectHttpError(503);
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 503 });
    });
  });

  // API Response Faults
  describe('API Response Faults', () => {
    test('should handle timeouts', () => {
      useFaultInjection.api.injectTimeout();
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'timeout' });
    });

    test('should handle invalid JSON responses', () => {
      useFaultInjection.api.injectInvalidJson();
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'invalid-json' });
    });

    test('should handle schema mismatches', () => {
      useFaultInjection.api.injectSchemaMismatch();
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'schema-mismatch' });
    });

    test('should handle rate limit exceeded', () => {
      useFaultInjection.api.injectRateLimitExceeded();
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'rate-limit-exceeded' });
    });
  });

  // Performance Degradation
  describe('Performance Degradation', () => {
    test('should handle frame rate drops', () => {
      useFaultInjection.perf.injectFrameRateDrop();
      expect(useFaultInjection.perf.shouldFail()).toBe(true);
      expect(useFaultInjection.perf.getFault()).toEqual({ kind: 'frame-rate-drop' });
    });

    test('should handle memory spikes', () => {
      useFaultInjection.perf.injectMemorySpike();
      expect(useFaultInjection.perf.shouldFail()).toBe(true);
      expect(useFaultInjection.perf.getFault()).toEqual({ kind: 'memory-spike' });
    });

    test('should handle network latency', () => {
      useFaultInjection.perf.injectNetworkLatency();
      expect(useFaultInjection.perf.shouldFail()).toBe(true);
      expect(useFaultInjection.perf.getFault()).toEqual({ kind: 'network-latency' });
    });
  });

  // Integration Service Faults
  describe('Integration Service Faults', () => {
    test('should handle service discovery failures', () => {
      useFaultInjection.integration.injectServiceDiscoveryFail();
      expect(useFaultInjection.integration.shouldFail()).toBe(true);
      expect(useFaultInjection.integration.getFault()).toEqual({ kind: 'service-discovery-fail' });
    });

    test('should handle circuit breaker triggers', () => {
      useFaultInjection.integration.injectCircuitBreakerTrigger();
      expect(useFaultInjection.integration.shouldFail()).toBe(true);
      expect(useFaultInjection.integration.getFault()).toEqual({ kind: 'circuit-breaker-trigger' });
    });

    test('should handle data sync conflicts', () => {
      useFaultInjection.integration.injectDataSyncConflict();
      expect(useFaultInjection.integration.shouldFail()).toBe(true);
      expect(useFaultInjection.integration.getFault()).toEqual({ kind: 'data-sync-conflict' });
    });

    test('should handle fallback service unavailability', () => {
      useFaultInjection.integration.injectFallbackServiceUnavailable();
      expect(useFaultInjection.integration.shouldFail()).toBe(true);
      expect(useFaultInjection.integration.getFault()).toEqual({ kind: 'fallback-service-unavailable' });
    });
  });
});
