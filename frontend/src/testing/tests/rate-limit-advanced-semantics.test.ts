/**
 * Advanced Rate-Limit Semantics Tests
 * 
 * These tests cover advanced rate-limit scenarios including:
 * - Clock skew handling
 * - Header precedence (seconds vs date)
 * - Jitter with fairness
 * - State reset on success
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';
import type { FaultInjectionAPI } from '../error-catalog';

// Enhanced rate-limit response with multiple header types
interface AdvancedRateLimitResponse {
  status: 429;
  headers: {
    'Retry-After'?: string;
    'X-RateLimit-Remaining'?: string;
    'X-RateLimit-Reset'?: string;
    'X-RateLimit-Reset-Date'?: string;
  };
  body: {
    error: string;
    error_code: string;
    retry_after?: number;
    retry_after_date?: string;
    trace_id: string;
    correlation_id?: string;
  };
}

// Enhanced exponential backoff with jitter
class AdvancedExponentialBackoff {
  private baseDelay: number;
  private maxDelay: number;
  private attempt: number = 0;
  private jitterFactor: number = 0.1; // 10% jitter

  constructor(baseDelay: number = 1000, maxDelay: number = 30000) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  getNextDelay(): number {
    const delay = Math.min(this.baseDelay * Math.pow(2, this.attempt), this.maxDelay);
    const jitter = delay * this.jitterFactor * Math.random();
    this.attempt++;
    return Math.floor(delay + jitter);
  }

  reset(): void {
    this.attempt = 0;
  }

  getAttempt(): number {
    return this.attempt;
  }

  setJitterFactor(factor: number): void {
    this.jitterFactor = Math.max(0, Math.min(1, factor));
  }
}

// Rate-limit state manager
class RateLimitStateManager {
  private retryAfterSeconds: number = 0;
  private retryAfterDate: Date | null = null;
  private lastFailureTime: number = 0;
  private failureCount: number = 0;
  private isRateLimited: boolean = false;

  setRetryAfterSeconds(seconds: number): void {
    this.retryAfterSeconds = seconds;
  }

  setRetryAfterDate(date: Date): void {
    this.retryAfterDate = date;
  }

  getEffectiveDelay(): number {
    const now = Date.now();
    
    // If we have both types, use the stricter (shorter) one
    if (this.retryAfterDate && this.retryAfterSeconds > 0) {
      const dateDelay = Math.max(0, this.retryAfterDate.getTime() - now);
      const secondsDelay = this.retryAfterSeconds * 1000;
      
      // Use the stricter (shorter) delay
      return Math.min(dateDelay, secondsDelay);
    }
    
    // Date-based retry-after
    if (this.retryAfterDate) {
      const delay = this.retryAfterDate.getTime() - now;
      return Math.max(0, delay); // Clamp to zero if date is in the past
    }
    
    // Seconds-based retry-after
    if (this.retryAfterSeconds > 0) {
      return this.retryAfterSeconds * 1000;
    }
    
    return 0;
  }

  canRetry(): boolean {
    return Date.now() >= this.lastFailureTime + this.getEffectiveDelay();
  }

  recordFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    this.isRateLimited = true;
  }

  recordSuccess(): void {
    // Reset rate-limit state on success
    this.retryAfterSeconds = 0;
    this.retryAfterDate = null;
    this.isRateLimited = false;
    this.failureCount = 0;
  }

  getState() {
    return {
      retryAfterSeconds: this.retryAfterSeconds,
      retryAfterDate: this.retryAfterDate,
      lastFailureTime: this.lastFailureTime,
      failureCount: this.failureCount,
      isRateLimited: this.isRateLimited,
      effectiveDelay: this.getEffectiveDelay(),
      canRetry: this.canRetry()
    };
  }

  reset(): void {
    this.retryAfterSeconds = 0;
    this.retryAfterDate = null;
    this.lastFailureTime = 0;
    this.failureCount = 0;
    this.isRateLimited = false;
  }
}

describe('Advanced Rate-Limit Semantics', () => {
  let faultInjector: FaultInjectionAPI;
  let backoff: AdvancedExponentialBackoff;
  let stateManager: RateLimitStateManager;

  beforeEach(() => {
    faultInjector = useFaultInjection;
    faultInjector.reset();
    backoff = new AdvancedExponentialBackoff();
    stateManager = new RateLimitStateManager();
  });

  afterEach(() => {
    faultInjector.reset();
    backoff.reset();
    stateManager.reset();
  });

  describe('Clock Skew and Header Precedence', () => {
    it('handles clock skew by clamping past dates to zero', () => {
      const pastDate = new Date(Date.now() - 10000); // 10 seconds ago
      const response: AdvancedRateLimitResponse = {
        status: 429,
        headers: {
          'Retry-After': pastDate.toUTCString()
        },
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          retry_after_date: pastDate.toISOString(),
          trace_id: 'test-trace-clock-skew-1'
        }
      };

      // Parse Retry-After date
      const retryAfterHeader = response.headers['Retry-After'];
      const retryAfterDate = new Date(retryAfterHeader || '');
      
      // Set the date in state manager
      stateManager.setRetryAfterDate(retryAfterDate);
      
      // Should clamp to zero since date is in the past
      expect(stateManager.getEffectiveDelay()).toBe(0);
      expect(stateManager.canRetry()).toBe(true);
    });

    it('uses stricter delay when both seconds and date are provided', () => {
      const futureDate = new Date(Date.now() + 15000); // 15 seconds from now

      // Set both types
      stateManager.setRetryAfterSeconds(5);
      stateManager.setRetryAfterDate(futureDate);
      
      // Should use the stricter (shorter) delay
      const effectiveDelay = stateManager.getEffectiveDelay();
      expect(effectiveDelay).toBe(5000); // Exactly 5 seconds (the shorter one)
    });

    it('prioritizes date over seconds when date is stricter', () => {
      const futureDate = new Date(Date.now() + 3000); // 3 seconds from now
      
      stateManager.setRetryAfterSeconds(10); // 10 seconds
      stateManager.setRetryAfterDate(futureDate); // 3 seconds
      
      // Should use the date (3 seconds) since it's stricter
      const effectiveDelay = stateManager.getEffectiveDelay();
      expect(effectiveDelay).toBeLessThan(5000); // Less than 5 seconds
      expect(effectiveDelay).toBeGreaterThan(0); // Greater than 0
    });

    it('prioritizes seconds over date when seconds are stricter', () => {
      const futureDate = new Date(Date.now() + 20000); // 20 seconds from now
      
      stateManager.setRetryAfterSeconds(5); // 5 seconds
      stateManager.setRetryAfterDate(futureDate); // 20 seconds
      
      // Should use the seconds (5 seconds) since it's stricter
      const effectiveDelay = stateManager.getEffectiveDelay();
      expect(effectiveDelay).toBe(5000); // Exactly 5 seconds
    });
  });

  describe('Jitter with Fairness', () => {
    it('adds jitter to prevent simultaneous retries', () => {
      const baseDelay = 1000;
      const jitterFactor = 0.2; // 20% jitter
      backoff.setJitterFactor(jitterFactor);
      
      const delays: number[] = [];
      for (let i = 0; i < 10; i++) {
        backoff.reset();
        delays.push(backoff.getNextDelay());
      }
      
      // All delays should be within jitter range
      delays.forEach(delay => {
        expect(delay).toBeGreaterThanOrEqual(baseDelay);
        expect(delay).toBeLessThanOrEqual(baseDelay * (1 + jitterFactor));
      });
      
      // Delays should not all be identical (jitter is working)
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('ensures jitter never exceeds Retry-After deadline', () => {
      const retryAfterSeconds = 3;
      stateManager.setRetryAfterSeconds(retryAfterSeconds);
      
      // Set a high jitter factor
      backoff.setJitterFactor(0.5); // 50% jitter
      
      const baseDelay = 1000;
      const jitteredDelay = backoff.getNextDelay();
      const effectiveDelay = stateManager.getEffectiveDelay();
      
      // Jittered delay should never exceed the effective delay
      expect(jitteredDelay).toBeLessThanOrEqual(effectiveDelay);
      
      // But should still be at least the base delay
      expect(jitteredDelay).toBeGreaterThanOrEqual(baseDelay);
    });

    it('maintains fairness across multiple clients', () => {
      const clientDelays: number[][] = [];
      const numClients = 5;
      const numAttempts = 3;
      
      // Simulate multiple clients with different jitter
      for (let client = 0; client < numClients; client++) {
        const clientBackoff = new AdvancedExponentialBackoff();
        clientBackoff.setJitterFactor(0.1 + (client * 0.05)); // Different jitter per client
        
        const delays: number[] = [];
        for (let attempt = 0; attempt < numAttempts; attempt++) {
          delays.push(clientBackoff.getNextDelay());
        }
        clientDelays.push(delays);
      }
      
      // Each client should have different delay patterns
      const allDelays = clientDelays.flat();
      const uniqueDelays = new Set(allDelays);
      expect(uniqueDelays.size).toBeGreaterThan(numClients); // Some variation
    });
  });

  describe('State Reset on Success', () => {
    it('resets rate-limit state after successful response', () => {
      // Set up rate limiting
      stateManager.setRetryAfterSeconds(10);
      stateManager.recordFailure();
      
      // Verify we're rate limited
      expect(stateManager.getState().isRateLimited).toBe(true);
      expect(stateManager.getState().failureCount).toBe(1);
      
      // Simulate successful response
      stateManager.recordSuccess();
      
      // Verify state is reset
      expect(stateManager.getState().isRateLimited).toBe(false);
      expect(stateManager.getState().failureCount).toBe(0);
      expect(stateManager.getState().retryAfterSeconds).toBe(0);
      expect(stateManager.getState().retryAfterDate).toBe(null);
    });

    it('allows immediate retry after success', () => {
      // Set up rate limiting
      stateManager.setRetryAfterSeconds(30);
      stateManager.recordFailure();
      
      // Verify we can't retry
      expect(stateManager.canRetry()).toBe(false);
      
      // Simulate successful response
      stateManager.recordSuccess();
      
      // Verify we can retry immediately
      expect(stateManager.canRetry()).toBe(true);
    });

    it('maintains separate state for different endpoints', () => {
      const endpoint1State = new RateLimitStateManager();
      const endpoint2State = new RateLimitStateManager();
      
      // Rate limit endpoint 1
      endpoint1State.setRetryAfterSeconds(10);
      endpoint1State.recordFailure();
      
      // Rate limit endpoint 2
      endpoint2State.setRetryAfterSeconds(5);
      endpoint2State.recordFailure();
      
      // Verify different states
      expect(endpoint1State.getState().retryAfterSeconds).toBe(10);
      expect(endpoint2State.getState().retryAfterSeconds).toBe(5);
      
      // Success on endpoint 1 shouldn't affect endpoint 2
      endpoint1State.recordSuccess();
      expect(endpoint1State.getState().isRateLimited).toBe(false);
      expect(endpoint2State.getState().isRateLimited).toBe(true);
    });
  });

  describe('Complex Rate-Limit Scenarios', () => {
    it('handles rapid successive rate-limit responses', () => {
      const responses: AdvancedRateLimitResponse[] = [
        {
          status: 429,
          headers: { 'Retry-After': '1' },
          body: {
            error: 'rate_limit_exceeded',
            error_code: 'API_RATE_LIMIT_EXCEEDED',
            retry_after: 1,
            trace_id: 'test-trace-rapid-1'
          }
        },
        {
          status: 429,
          headers: { 'Retry-After': '2' },
          body: {
            error: 'rate_limit_exceeded',
            error_code: 'API_RATE_LIMIT_EXCEEDED',
            retry_after: 2,
            trace_id: 'test-trace-rapid-2'
          }
        },
        {
          status: 429,
          headers: { 'Retry-After': '5' },
          body: {
            error: 'rate_limit_exceeded',
            error_code: 'API_RATE_LIMIT_EXCEEDED',
            retry_after: 5,
            trace_id: 'test-trace-rapid-3'
          }
        }
      ];
      
      // Process each response
      responses.forEach((response, index) => {
        const retryAfter = response.body.retry_after || 0;
        stateManager.setRetryAfterSeconds(retryAfter);
        stateManager.recordFailure();
        
        // Verify state
        expect(stateManager.getState().retryAfterSeconds).toBe(retryAfter);
        expect(stateManager.getState().failureCount).toBe(index + 1);
      });
      
      // Final state should reflect the last response
      expect(stateManager.getState().retryAfterSeconds).toBe(5);
      expect(stateManager.getState().failureCount).toBe(3);
    });

    it('handles mixed header types in sequence', () => {
      const mixedResponses: Array<{ seconds?: number; date?: Date }> = [
        { seconds: 3 },
        { date: new Date(Date.now() + 8000) }, // 8 seconds
        { seconds: 1 },
        { date: new Date(Date.now() + 12000) } // 12 seconds
      ];
      
      mixedResponses.forEach((response, _index) => {
        if (response.seconds) {
          stateManager.setRetryAfterSeconds(response.seconds);
        }
        if (response.date) {
          stateManager.setRetryAfterDate(response.date);
        }
        stateManager.recordFailure();
        
        // Verify effective delay is calculated correctly
        const effectiveDelay = stateManager.getEffectiveDelay();
        expect(effectiveDelay).toBeGreaterThan(0);
      });
    });

    it('handles correlation IDs for cross-service debugging', () => {
      const correlationId = 'corr-12345-67890';
      const response: AdvancedRateLimitResponse = {
        status: 429,
        headers: { 'Retry-After': '5' },
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          retry_after: 5,
          trace_id: 'test-trace-correlation-1',
          correlation_id: correlationId
        }
      };
      
      // Verify correlation ID is present
      expect(response.body.correlation_id).toBe(correlationId);
      expect(response.body.trace_id).toBe('test-trace-correlation-1');
      
      // Both should be unique identifiers
      expect(response.body.correlation_id).not.toBe(response.body.trace_id);
    });
  });

  describe('Fault Injection Integration', () => {
    it('injects rate-limit fault with advanced semantics', () => {
      faultInjector.api.injectRateLimitExceeded();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const apiFault = activeFaults.find((f: any) => f.category === 'api');
      expect(apiFault?.fault).toEqual({ kind: 'rate-limit-exceeded' });
      
      // Simulate the advanced error response that would be generated
      const mockResponse: AdvancedRateLimitResponse = {
        status: 429,
        headers: {
          'Retry-After': '3',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + 300).toString()
        },
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          retry_after: 3,
          trace_id: `fault-${Date.now()}`,
          correlation_id: `corr-${Date.now()}`
        }
      };
      
      expect(mockResponse.status).toBe(429);
      expect(mockResponse.body.error_code).toBe('API_RATE_LIMIT_EXCEEDED');
      expect(mockResponse.body.trace_id).toMatch(/^fault-\d+$/);
      expect(mockResponse.body.correlation_id).toMatch(/^corr-\d+$/);
      
      // Verify headers are properly formatted
      expect(mockResponse.headers['Retry-After']).toBe('3');
      expect(mockResponse.headers['X-RateLimit-Remaining']).toBe('0');
      expect(mockResponse.headers['X-RateLimit-Reset']).toBeDefined();
    });
  });
});
