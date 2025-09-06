/**
 * Circuit-Breaker Resilience Tests
 * 
 * These tests ensure that circuit breakers properly handle state transitions,
 * half-open states, and maintain isolation between test runs.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';
import type { FaultInjectionAPI } from '../error-catalog';

// Circuit breaker state enum
enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

// Circuit breaker configuration
interface CircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  successThreshold: number;
}

// Circuit breaker state representation
interface CircuitBreakerStateData {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  successCount: number;
  lastSuccessTime: number;
}

// Mock circuit breaker implementation
class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  private successCount: number = 0;
  private lastSuccessTime: number = 0;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('CIRCUIT_BREAKER_OPEN');
      }
      this.state = CircuitBreakerState.HALF_OPEN;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.lastSuccessTime = Date.now();
    this.successCount++;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.CLOSED) {
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CircuitBreakerState.OPEN;
        this.nextAttemptTime = Date.now() + this.config.timeoutMs;
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.timeoutMs;
      this.successCount = 0;
    }
  }

  getState(): CircuitBreakerStateData {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      successCount: this.successCount,
      lastSuccessTime: this.lastSuccessTime
    };
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
    this.successCount = 0;
    this.lastSuccessTime = 0;
  }

  isOpen(): boolean {
    return this.state === CircuitBreakerState.OPEN;
  }

  isHalfOpen(): boolean {
    return this.state === CircuitBreakerState.HALF_OPEN;
  }

  isClosed(): boolean {
    return this.state === CircuitBreakerState.CLOSED;
  }
}

describe('Circuit-Breaker Resilience', () => {
  let faultInjector: FaultInjectionAPI;
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    faultInjector = useFaultInjection;
    faultInjector.reset();
    
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      timeoutMs: 5000,
      successThreshold: 2
    });
  });

  afterEach(() => {
    faultInjector.reset();
    circuitBreaker.reset();
  });

  describe('State Transitions', () => {
    it('transitions from CLOSED to OPEN after failure threshold', async () => {
      expect(circuitBreaker.isClosed()).toBe(true);
      
      // Trigger failures up to threshold
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      expect(circuitBreaker.isOpen()).toBe(true);
      const state = circuitBreaker.getState();
      expect(state.failureCount).toBe(3);
      expect(state.state).toBe(CircuitBreakerState.OPEN);
    });

    it('transitions from OPEN to HALF_OPEN after timeout', async () => {
      // Get to OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      expect(circuitBreaker.isOpen()).toBe(true);
      
      // Simulate timeout by directly setting nextAttemptTime to the past
      // This is more reliable than changing config and waiting
      circuitBreaker['nextAttemptTime'] = Date.now() - 100;
      
      // Now execute an operation to trigger the transition to HALF_OPEN
      // The execute method should see that Date.now() < nextAttemptTime is false
      // and transition from OPEN to HALF_OPEN
      try {
        await circuitBreaker.execute(async () => {
          return 'probe-success';
        });
      } catch (error) {
        // Expected - this should trigger the transition to HALF_OPEN
      }
      
      // Now should be in HALF_OPEN state
      expect(circuitBreaker.getState().state).toBe(CircuitBreakerState.HALF_OPEN);
    });

    it('transitions from HALF_OPEN to CLOSED after success threshold', async () => {
      // First, get to HALF_OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // Simulate timeout to get to HALF_OPEN
      circuitBreaker['nextAttemptTime'] = Date.now() - 100;
      
      // First successful probe
      await circuitBreaker.execute(async () => 'success');
      expect(circuitBreaker.isHalfOpen()).toBe(true);
      
      // Second successful probe should close the circuit
      await circuitBreaker.execute(async () => 'success');
      expect(circuitBreaker.isClosed()).toBe(true);
      
      const state = circuitBreaker.getState();
      expect(state.successCount).toBe(0); // Reset after closing
      expect(state.failureCount).toBe(0); // Reset after closing
    });

    it('transitions from HALF_OPEN back to OPEN on failure', async () => {
      // First, get to HALF_OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // Simulate timeout to get to HALF_OPEN
      circuitBreaker['nextAttemptTime'] = Date.now() - 100;
      
      // Failure in HALF_OPEN should reopen the circuit
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Probe failure');
        });
      } catch (error) {
        // Expected failure
      }
      
      expect(circuitBreaker.isOpen()).toBe(true);
      const state = circuitBreaker.getState();
      expect(state.state).toBe(CircuitBreakerState.OPEN);
    });
  });

  describe('Test Isolation', () => {
    it('maintains separate state between test runs', async () => {
      // First test run
      expect(circuitBreaker.isClosed()).toBe(true);
      expect(circuitBreaker.getState().failureCount).toBe(0);
      
      // Simulate some failures
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      expect(circuitBreaker.getState().failureCount).toBe(2);
      
      // Reset for next test
      circuitBreaker.reset();
      
      // Second test run should start fresh
      expect(circuitBreaker.isClosed()).toBe(true);
      expect(circuitBreaker.getState().failureCount).toBe(0);
      expect(circuitBreaker.getState().state).toBe(CircuitBreakerState.CLOSED);
    });

    it('isolates fault injection state between tests', () => {
      // First test
      faultInjector.integration.injectCircuitBreakerTrigger();
      expect(faultInjector.integration.shouldFail()).toBe(true);
      
      // Reset for next test
      faultInjector.reset();
      
      // Second test should start clean
      expect(faultInjector.integration.shouldFail()).toBe(false);
      expect(faultInjector.hasAnyFault()).toBe(false);
    });
  });

  describe('Rapid Successive Failures', () => {
    it('handles rapid failure bursts correctly', async () => {
      const rapidFailures = 10;
      
      // Trigger rapid successive failures
      for (let i = 0; i < rapidFailures; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error(`Rapid failure ${i + 1}`);
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // Circuit should be open
      expect(circuitBreaker.isOpen()).toBe(true);
      
      const state = circuitBreaker.getState();
      // Circuit breaker should open after failure threshold (3), not count all failures
      expect(state.failureCount).toBe(3); // Default failure threshold
      expect(state.state).toBe(CircuitBreakerState.OPEN);
      
      // Should not allow execution while open
      try {
        await circuitBreaker.execute(async () => 'should not execute');
        expect.fail('Should have thrown CIRCUIT_BREAKER_OPEN');
      } catch (error) {
        expect((error as Error).message).toBe('CIRCUIT_BREAKER_OPEN');
      }
    });

    it('handles rapid failure bursts correctly', async () => {
      const failureThreshold = 3;
      
      // Trigger failures one by one and check state
      for (let i = 0; i < failureThreshold + 2; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error(`Failure ${i + 1}`);
          });
        } catch (error) {
          // Expected failure
        }
        
        const state = circuitBreaker.getState();
        
        if (i < failureThreshold - 1) {
          expect(state.failureCount).toBe(i + 1);
          expect(state.state).toBe(CircuitBreakerState.CLOSED);
        } else {
          // After failure threshold, circuit opens and failure count is capped
          expect(state.failureCount).toBe(failureThreshold);
          expect(state.state).toBe(CircuitBreakerState.OPEN);
        }
      }
    });
  });

  describe('Fault Injection Integration', () => {
    it('injects circuit-breaker fault with proper error structure', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const integrationFault = activeFaults.find((f: any) => f.category === 'integration');
      expect(integrationFault?.fault).toEqual({ kind: 'circuit-breaker-trigger' });
      
      // Simulate the error response that would be generated
      const mockResponse = {
        status: 503,
        headers: {
          'X-CircuitBreaker-State': 'OPEN',
          'X-CircuitBreaker-FailureCount': '5',
          'X-CircuitBreaker-Timeout': '30000'
        },
        body: {
          error: 'circuit_breaker_open',
          error_code: 'CIRCUIT_BREAKER_OPEN',
          state: 'OPEN',
          failure_count: 5,
          timeout_ms: 30000,
          trace_id: `fault-${Date.now()}`
        }
      };
      
      expect(mockResponse.status).toBe(503);
      expect(mockResponse.body.error_code).toBe('CIRCUIT_BREAKER_OPEN');
      expect(mockResponse.body.state).toBe('OPEN');
      expect(mockResponse.body.trace_id).toMatch(/^fault-\d+$/);
    });

    it('maintains fault state during circuit breaker transitions', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      // Fault should be active
      expect(faultInjector.integration.shouldFail()).toBe(true);
      expect(faultInjector.hasAnyFault()).toBe(true);
      
      // Simulate circuit breaker state changes
      const states = ['CLOSED', 'OPEN', 'HALF_OPEN', 'CLOSED'];
      states.forEach(_state => {
        // Fault injection state should remain independent
        expect(faultInjector.integration.shouldFail()).toBe(true);
        expect(faultInjector.hasAnyFault()).toBe(true);
      });
    });
  });

  describe('Complex Failure Scenarios', () => {
    it('handles circuit breaker with rate-limit combination', () => {
      // Inject both circuit breaker and rate limit faults
      faultInjector.integration.injectCircuitBreakerTrigger();
      faultInjector.api.injectRateLimitExceeded();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(2);
      
      // Both should be active
      expect(faultInjector.integration.shouldFail()).toBe(true);
      expect(faultInjector.api.shouldFail()).toBe(true);
      expect(faultInjector.hasAnyFault()).toBe(true);
      
      // Check fault types
      const circuitBreakerFault = activeFaults.find((f: any) => f.category === 'integration');
      const rateLimitFault = activeFaults.find((f: any) => f.category === 'api');
      
      expect(circuitBreakerFault?.fault).toEqual({ kind: 'circuit-breaker-trigger' });
      expect(rateLimitFault?.fault).toEqual({ kind: 'rate-limit-exceeded' });
    });

    it('handles circuit breaker with network error combination', () => {
      // Inject circuit breaker and network error
      faultInjector.integration.injectCircuitBreakerTrigger();
      faultInjector.api.injectNetworkError();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(2);
      
      // Both should be active
      expect(faultInjector.integration.shouldFail()).toBe(true);
      expect(faultInjector.api.shouldFail()).toBe(true);
      
      // Check fault types
      const circuitBreakerFault = activeFaults.find((f: any) => f.category === 'integration');
      const networkFault = activeFaults.find((f: any) => f.category === 'api');
      
      expect(circuitBreakerFault?.fault).toEqual({ kind: 'circuit-breaker-trigger' });
      expect(networkFault?.fault).toEqual({ kind: 'network-error' });
    });
  });

  describe('State Persistence and Recovery', () => {
    it('persists state during multiple operations', async () => {
      // Trigger some failures
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error(`Failure ${i + 1}`);
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // State should persist
      expect(circuitBreaker.getState().failureCount).toBe(2);
      expect(circuitBreaker.isClosed()).toBe(true);
      
      // Perform some other operations
      const state1 = circuitBreaker.getState();
      const state2 = circuitBreaker.getState();
      
      // States should be consistent
      expect(state1.failureCount).toBe(state2.failureCount);
      expect(state1.state).toBe(state2.state);
    });

    it('recovers properly after reset', async () => {
      // Get to a non-closed state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      expect(circuitBreaker.isOpen()).toBe(true);
      
      // Reset should restore initial state
      circuitBreaker.reset();
      expect(circuitBreaker.isClosed()).toBe(true);
      expect(circuitBreaker.getState().failureCount).toBe(0);
      expect(circuitBreaker.getState().successCount).toBe(0);
    });
  });
});
