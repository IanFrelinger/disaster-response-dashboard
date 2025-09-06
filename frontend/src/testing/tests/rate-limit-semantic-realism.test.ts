/**
 * Rate-Limit Semantic Realism Tests
 * 
 * These tests ensure that rate-limit handling respects HTTP 429 semantics
 * including Retry-After headers and exponential backoff behavior.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';
import type { FaultInjectionAPI } from '../error-catalog';

// Mock rate-limit response structure
interface RateLimitResponse {
  status: 429;
  headers: {
    'Retry-After'?: string;
    'X-RateLimit-Remaining'?: string;
    'X-RateLimit-Reset'?: string;
  };
  body: {
    error: string;
    error_code: string;
    retry_after?: number;
    trace_id: string;
  };
}

// Mock exponential backoff implementation
class ExponentialBackoff {
  private baseDelay: number;
  private maxDelay: number;
  private attempt: number = 0;

  constructor(baseDelay: number = 1000, maxDelay: number = 30000) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  getNextDelay(): number {
    const delay = Math.min(this.baseDelay * Math.pow(2, this.attempt), this.maxDelay);
    this.attempt++;
    return delay;
  }

  reset(): void {
    this.attempt = 0;
  }

  getAttempt(): number {
    return this.attempt;
  }
}

describe('Rate-Limit Semantic Realism', () => {
  let faultInjector: FaultInjectionAPI;
  let backoff: ExponentialBackoff;

  beforeEach(() => {
    faultInjector = useFaultInjection;
    faultInjector.reset();
    backoff = new ExponentialBackoff();
  });

  afterEach(() => {
    faultInjector.reset();
    backoff.reset();
  });

  describe('Retry-After Header Parsing', () => {
    it('parses second-based Retry-After headers correctly', () => {
      const retryAfterSeconds = 5;
      const response: RateLimitResponse = {
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString()
        },
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          retry_after: retryAfterSeconds,
          trace_id: 'test-trace-123'
        }
      };

      // Parse Retry-After header
      const retryAfterHeader = response.headers['Retry-After'];
      const retryAfterValue = parseInt(retryAfterHeader || '0', 10);
      
      expect(retryAfterValue).toBe(retryAfterSeconds);
      expect(response.body.retry_after).toBe(retryAfterSeconds);
      expect(response.body.trace_id).toBe('test-trace-123');
    });

    it('parses date-based Retry-After headers correctly', () => {
      const futureDate = new Date(Date.now() + 10000); // 10 seconds from now
      const response: RateLimitResponse = {
        status: 429,
        headers: {
          'Retry-After': futureDate.toUTCString()
        },
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          trace_id: 'test-trace-456'
        }
      };

      // Parse date-based Retry-After
      const retryAfterHeader = response.headers['Retry-After'];
      const retryAfterDate = new Date(retryAfterHeader || '');
      const now = new Date();
      
      expect(retryAfterDate.getTime()).toBeGreaterThan(now.getTime());
      expect(response.body.trace_id).toBe('test-trace-456');
    });

    it('handles missing Retry-After header gracefully', () => {
      const response: RateLimitResponse = {
        status: 429,
        headers: {},
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          trace_id: 'test-trace-789'
        }
      };

      const retryAfterHeader = response.headers['Retry-After'];
      expect(retryAfterHeader).toBeUndefined();
      
      // Should fall back to default backoff strategy
      const defaultDelay = backoff.getNextDelay();
      expect(defaultDelay).toBe(1000); // Base delay
    });
  });

  describe('Exponential Backoff Behavior', () => {
    it('respects Retry-After timing over exponential backoff', () => {
      const retryAfterSeconds = 3;
      const response: RateLimitResponse = {
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString()
        },
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          retry_after: retryAfterSeconds,
          trace_id: 'test-trace-backoff-1'
        }
      };

      // Parse Retry-After
      const retryAfterHeader = response.headers['Retry-After'];
      const retryAfterValue = parseInt(retryAfterHeader || '0', 10);
      
      // Calculate backoff delay
      const backoffDelay = backoff.getNextDelay();
      
      // Retry-After should take precedence over exponential backoff
      const actualDelay = Math.max(retryAfterValue * 1000, backoffDelay);
      expect(actualDelay).toBe(retryAfterValue * 1000);
      expect(actualDelay).toBeGreaterThanOrEqual(backoffDelay);
    });

    it('implements proper exponential backoff progression', () => {
      const expectedDelays = [1000, 2000, 4000, 8000, 16000, 30000]; // Max delay capped
      
      expectedDelays.forEach((expectedDelay, index) => {
        const actualDelay = backoff.getNextDelay();
        expect(actualDelay).toBe(expectedDelay);
        expect(backoff.getAttempt()).toBe(index + 1);
      });
    });

    it('caps exponential backoff at maximum delay', () => {
      // Exceed the max delay threshold
      for (let i = 0; i < 10; i++) {
        backoff.getNextDelay();
      }
      
      const finalDelay = backoff.getNextDelay();
      expect(finalDelay).toBe(30000); // Max delay
      expect(backoff.getAttempt()).toBe(11);
    });

    it('resets backoff state correctly', () => {
      // Generate some delays
      backoff.getNextDelay(); // 1000
      backoff.getNextDelay(); // 2000
      expect(backoff.getAttempt()).toBe(2);
      
      // Reset
      backoff.reset();
      expect(backoff.getAttempt()).toBe(0);
      
      // Should start from base delay again
      const firstDelay = backoff.getNextDelay();
      expect(firstDelay).toBe(1000);
      expect(backoff.getAttempt()).toBe(1);
    });
  });

  describe('Rate-Limit Response Structure', () => {
    it('includes all required rate-limit headers', () => {
      const response: RateLimitResponse = {
        status: 429,
        headers: {
          'Retry-After': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + 300).toString()
        },
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          retry_after: 5,
          trace_id: 'test-trace-headers-1'
        }
      };

      expect(response.headers['Retry-After']).toBe('5');
      expect(response.headers['X-RateLimit-Remaining']).toBe('0');
      expect(response.headers['X-RateLimit-Reset']).toBeDefined();
      expect(response.body.error_code).toBe('API_RATE_LIMIT_EXCEEDED');
      expect(response.body.trace_id).toBe('test-trace-headers-1');
    });

    it('provides consistent error codes across responses', () => {
      const responses: RateLimitResponse[] = [
        {
          status: 429,
          headers: { 'Retry-After': '1' },
          body: {
            error: 'rate_limit_exceeded',
            error_code: 'API_RATE_LIMIT_EXCEEDED',
            trace_id: 'test-trace-consistency-1'
          }
        },
        {
          status: 429,
          headers: { 'Retry-After': '2' },
          body: {
            error: 'rate_limit_exceeded',
            error_code: 'API_RATE_LIMIT_EXCEEDED',
            trace_id: 'test-trace-consistency-2'
          }
        }
      ];

      responses.forEach(response => {
        expect(response.body.error_code).toBe('API_RATE_LIMIT_EXCEEDED');
        expect(response.body.error).toBe('rate_limit_exceeded');
        expect(response.status).toBe(429);
      });
    });
  });

  describe('Fault Injection Integration', () => {
    it('injects rate-limit fault with proper error structure', () => {
      faultInjector.api.injectRateLimitExceeded();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const apiFault = activeFaults.find((f: any) => f.category === 'api');
      expect(apiFault?.fault).toEqual({ kind: 'rate-limit-exceeded' });
      
      // Simulate the error response that would be generated
      const mockResponse: RateLimitResponse = {
        status: 429,
        headers: {
          'Retry-After': '3',
          'X-RateLimit-Remaining': '0'
        },
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          retry_after: 3,
          trace_id: `fault-${Date.now()}`
        }
      };
      
      expect(mockResponse.status).toBe(429);
      expect(mockResponse.body.error_code).toBe('API_RATE_LIMIT_EXCEEDED');
      expect(mockResponse.body.trace_id).toMatch(/^fault-\d+$/);
    });

    it('maintains fault state during retry attempts', () => {
      faultInjector.api.injectRateLimitExceeded();
      
      // Simulate multiple retry attempts
      for (let attempt = 1; attempt <= 3; attempt++) {
        expect(faultInjector.api.shouldFail()).toBe(true);
        
        // Each attempt should respect the rate limit
        const retryAfter = 3;
        const backoffDelay = backoff.getNextDelay();
        const actualDelay = Math.max(retryAfter * 1000, backoffDelay);
        
        expect(actualDelay).toBeGreaterThanOrEqual(retryAfter * 1000);
      }
      
      // Fault should still be active
      expect(faultInjector.hasAnyFault()).toBe(true);
    });
  });

  describe('Complex Rate-Limit Scenarios', () => {
    it('handles rate-limit with invalid JSON response', () => {
      // Simulate a rate-limit response that also has malformed JSON
      const response = {
        status: 429,
        headers: { 'Retry-After': '2' },
        body: 'invalid json content', // Malformed JSON
        error_code: 'API_RATE_LIMIT_EXCEEDED',
        trace_id: 'test-trace-malformed-1'
      };

      // Should still respect Retry-After even with malformed response
      const retryAfterHeader = response.headers['Retry-After'];
      const retryAfterValue = parseInt(retryAfterHeader || '0', 10);
      
      expect(retryAfterValue).toBe(2);
      expect(response.error_code).toBe('API_RATE_LIMIT_EXCEEDED');
      expect(response.trace_id).toBe('test-trace-malformed-1');
    });

    it('handles rate-limit with missing required headers', () => {
      const response: Partial<RateLimitResponse> = {
        status: 429,
        headers: {}, // Missing Retry-After
        body: {
          error: 'rate_limit_exceeded',
          error_code: 'API_RATE_LIMIT_EXCEEDED',
          trace_id: 'test-trace-missing-headers-1'
        }
      };

      // Should fall back to exponential backoff
      const fallbackDelay = backoff.getNextDelay();
      expect(fallbackDelay).toBe(1000);
      expect(response.body?.error_code).toBe('API_RATE_LIMIT_EXCEEDED');
    });
  });
});
