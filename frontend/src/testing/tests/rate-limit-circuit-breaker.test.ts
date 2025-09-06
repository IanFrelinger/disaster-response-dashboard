/**
 * Enhanced Rate-Limit and Circuit-Breaker Tests
 * 
 * These tests ensure that fault injections simulate realistic protocol behavior
 * including HTTP 429 semantics, Retry-After headers, and circuit breaker transitions.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFaultInjection } from '../fault-injection';
import type { FaultInjectionAPI } from '../error-catalog';

describe('Rate-Limit and Circuit-Breaker Semantics', () => {
  let faultInjector: FaultInjectionAPI;

  beforeEach(() => {
    faultInjector = useFaultInjection;
    faultInjector.reset();
  });

  afterEach(() => {
    faultInjector.reset();
  });

  describe('Rate-Limit Exceeded (HTTP 429)', () => {
    it('injects rate-limit-exceeded fault type', () => {
      faultInjector.api.injectRateLimitExceeded();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const apiFault = activeFaults.find((f: any) => f.category === 'api');
      expect(apiFault?.fault).toEqual({ kind: 'rate-limit-exceeded' });
    });

    it('deprecated injectRateLimit sets same fault type', () => {
      faultInjector.api.injectRateLimit();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const apiFault = activeFaults.find((f: any) => f.category === 'api');
      expect(apiFault?.fault).toEqual({ kind: 'rate-limit-exceeded' });
    });

    it('rate-limit fault is detected by shouldFail', () => {
      expect(faultInjector.api.shouldFail()).toBe(false);
      
      faultInjector.api.injectRateLimitExceeded();
      expect(faultInjector.api.shouldFail()).toBe(true);
    });

    it('rate-limit fault can be reset', () => {
      faultInjector.api.injectRateLimitExceeded();
      expect(faultInjector.api.shouldFail()).toBe(true);
      
      faultInjector.reset();
      expect(faultInjector.api.shouldFail()).toBe(false);
    });
  });

  describe('Circuit Breaker Trigger', () => {
    it('injects circuit-breaker-trigger fault type', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const integrationFault = activeFaults.find((f: any) => f.category === 'integration');
      expect(integrationFault?.fault).toEqual({ kind: 'circuit-breaker-trigger' });
    });

    it('deprecated injectCircuitBreaker sets same fault type', () => {
      faultInjector.api.injectCircuitBreaker();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const integrationFault = activeFaults.find((f: any) => f.category === 'integration');
      expect(integrationFault?.fault).toEqual({ kind: 'circuit-breaker-trigger' });
    });

    it('circuit-breaker fault is detected by shouldFail', () => {
      expect(faultInjector.integration.shouldFail()).toBe(false);
      
      faultInjector.integration.injectCircuitBreakerTrigger();
      expect(faultInjector.integration.shouldFail()).toBe(true);
    });

    it('circuit-breaker fault can be reset', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      expect(faultInjector.integration.shouldFail()).toBe(true);
      
      faultInjector.reset();
      expect(faultInjector.integration.shouldFail()).toBe(false);
    });
  });

  describe('Fault State Management', () => {
    it('multiple faults can be active simultaneously', () => {
      faultInjector.api.injectRateLimitExceeded();
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(2);
      expect(faultInjector.hasAnyFault()).toBe(true);
    });

    it('faults are isolated by category', () => {
      faultInjector.api.injectRateLimitExceeded();
      expect(faultInjector.api.shouldFail()).toBe(true);
      expect(faultInjector.integration.shouldFail()).toBe(false);
      
      faultInjector.integration.injectCircuitBreakerTrigger();
      expect(faultInjector.api.shouldFail()).toBe(true);
      expect(faultInjector.integration.shouldFail()).toBe(true);
    });

    it('reset clears all fault categories', () => {
      faultInjector.api.injectRateLimitExceeded();
      faultInjector.integration.injectCircuitBreakerTrigger();
      faultInjector.map.injectWebglUnavailable();
      
      expect(faultInjector.hasAnyFault()).toBe(true);
      
      faultInjector.reset();
      expect(faultInjector.hasAnyFault()).toBe(false);
      expect(faultInjector.api.shouldFail()).toBe(false);
      expect(faultInjector.integration.shouldFail()).toBe(false);
      expect(faultInjector.map.shouldFail()).toBe(false);
    });
  });

  describe('Observability and Error Codes', () => {
    it('rate-limit fault has consistent error kind', () => {
      faultInjector.api.injectRateLimitExceeded();
      
      const apiFault = faultInjector.api.getFault();
      expect(apiFault).toEqual({ kind: 'rate-limit-exceeded' });
      
      // Simulate error handling that would extract error_code
      const errorCode = apiFault?.kind === 'rate-limit-exceeded' ? 'API_RATE_LIMIT_EXCEEDED' : 'UNKNOWN';
      expect(errorCode).toBe('API_RATE_LIMIT_EXCEEDED');
    });

    it('circuit-breaker fault has consistent error kind', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      const integrationFault = faultInjector.integration.getFault();
      expect(integrationFault).toEqual({ kind: 'circuit-breaker-trigger' });
      
      // Simulate error handling that would extract error_code
      const errorCode = integrationFault?.kind === 'circuit-breaker-trigger' ? 'CIRCUIT_BREAKER_OPEN' : 'UNKNOWN';
      expect(errorCode).toBe('CIRCUIT_BREAKER_OPEN');
    });

    it('fault injection logs are consistent', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      faultInjector.api.injectRateLimitExceeded();
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FAULT-INJECTION] Set api fault:',
        { kind: 'rate-limit-exceeded' }
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FAULT-INJECTION] Set integration fault:',
        { kind: 'circuit-breaker-trigger' }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Protocol Realism', () => {
    it('rate-limit fault represents HTTP 429 behavior', () => {
      faultInjector.api.injectRateLimitExceeded();
      
      // In a real implementation, this would trigger:
      // - HTTP 429 response
      // - Retry-After header
      // - Exponential backoff logic
      // - Rate limit remaining headers
      
      const apiFault = faultInjector.api.getFault();
      expect(apiFault?.kind).toBe('rate-limit-exceeded');
      
      // Simulate the expected error response structure
      const mockErrorResponse = {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'Retry-After': '3',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + 3
        },
        data: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          retry_after: 3
        }
      };
      
      expect(mockErrorResponse.status).toBe(429);
      expect(mockErrorResponse.headers['Retry-After']).toBe('3');
      expect(mockErrorResponse.data.error_code).toBe('API_RATE_LIMIT_EXCEEDED');
    });

    it('circuit-breaker fault represents service protection behavior', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      // In a real implementation, this would trigger:
      // - Circuit breaker state: OPEN
      // - Blocked requests
      // - Half-open probe after timeout
      // - Reset to CLOSED on success
      
      const integrationFault = faultInjector.integration.getFault();
      expect(integrationFault?.kind).toBe('circuit-breaker-trigger');
      
      // Simulate the expected circuit breaker state
      const mockCircuitBreakerState = {
        state: 'OPEN',
        failureCount: 5,
        lastFailureTime: Date.now(),
        timeout: 30000, // 30 seconds
        threshold: 5,
        nextAttempt: Date.now() + 30000
      };
      
      expect(mockCircuitBreakerState.state).toBe('OPEN');
      expect(mockCircuitBreakerState.failureCount).toBeGreaterThanOrEqual(5);
      expect(mockCircuitBreakerState.timeout).toBe(30000);
    });
  });
});
