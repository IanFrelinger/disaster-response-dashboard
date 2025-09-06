/**
 * Contract Tests for Fault Injection Aliases
 * 
 * These tests ensure that deprecated methods call the new implementations
 * correctly, maintaining backward compatibility.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFaultInjection } from '../fault-injection';
import type { FaultInjectionAPI } from '../error-catalog';

describe('Fault Injection Contract Tests', () => {
  let faultInjector: FaultInjectionAPI;

  beforeEach(() => {
    faultInjector = useFaultInjection;
    faultInjector.reset();
  });

  describe('Legacy API Aliases', () => {
    it('injectRateLimit calls injectRateLimitExceeded', () => {
      const spyRL = vi.spyOn(faultInjector.api, 'injectRateLimitExceeded');
      
      faultInjector.api.injectRateLimit();
      
      expect(spyRL).toHaveBeenCalledTimes(1);
    });

    it('injectCircuitBreaker calls injectCircuitBreakerTrigger', () => {
      const spyCB = vi.spyOn(faultInjector.integration, 'injectCircuitBreakerTrigger');
      
      faultInjector.api.injectCircuitBreaker();
      
      expect(spyCB).toHaveBeenCalledTimes(1);
    });

    it('deprecated methods set the correct fault types', () => {
      faultInjector.api.injectRateLimit();
      faultInjector.api.injectCircuitBreaker();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(2);
      
      const rateLimitFault = activeFaults.find((f: any) => f.category === 'api');
      const circuitBreakerFault = activeFaults.find((f: any) => f.category === 'integration');
      
      expect(rateLimitFault?.fault).toEqual({ kind: 'rate-limit-exceeded' });
      expect(circuitBreakerFault?.fault).toEqual({ kind: 'circuit-breaker-trigger' });
    });
  });

  describe('Convenience Methods', () => {
    it('hasAnyFault returns true when faults are active', () => {
      expect(faultInjector.hasAnyFault()).toBe(false);
      
      faultInjector.api.injectRateLimitExceeded();
      expect(faultInjector.hasAnyFault()).toBe(true);
    });

    it('hasAnyFault returns false when no faults are active', () => {
      expect(faultInjector.hasAnyFault()).toBe(false);
      
      faultInjector.api.injectRateLimitExceeded();
      faultInjector.reset();
      expect(faultInjector.hasAnyFault()).toBe(false);
    });

    it('hasAnyFault matches getActiveFaults().length > 0', () => {
      expect(faultInjector.hasAnyFault()).toBe(faultInjector.getActiveFaults().length > 0);
      
      faultInjector.api.injectRateLimitExceeded();
      expect(faultInjector.hasAnyFault()).toBe(faultInjector.getActiveFaults().length > 0);
      
      faultInjector.map.injectWebglUnavailable();
      expect(faultInjector.hasAnyFault()).toBe(faultInjector.getActiveFaults().length > 0);
    });
  });

  describe('Backward Compatibility', () => {
    it('old method names still work without breaking', () => {
      expect(() => {
        faultInjector.api.injectRateLimit();
        faultInjector.api.injectCircuitBreaker();
      }).not.toThrow();
    });

    it('deprecated methods log warnings', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      faultInjector.api.injectRateLimit();
      faultInjector.api.injectCircuitBreaker();
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FAULT-INJECTION] injectRateLimit is deprecated. Use injectRateLimitExceeded instead.'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FAULT-INJECTION] injectCircuitBreaker is deprecated. Use injectCircuitBreakerTrigger instead.'
      );
      
      consoleSpy.mockRestore();
    });
  });
});
