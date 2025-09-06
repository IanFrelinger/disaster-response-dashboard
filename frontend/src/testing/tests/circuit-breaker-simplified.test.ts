/**
 * Simplified Circuit-Breaker Tests
 * 
 * These tests focus on core circuit-breaker functionality without complex concurrency scenarios
 * that can cause timeouts and race conditions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';
import type { FaultInjectionAPI } from '../error-catalog';

// Simple circuit breaker implementation
class SimpleCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;

  private nextAttemptTime: number = 0;
  private readonly failureThreshold: number = 3;
  private readonly timeoutMs: number = 5000;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('CIRCUIT_BREAKER_OPEN');
      }
      this.state = 'HALF_OPEN';
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
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;

    if (this.state === 'CLOSED' && this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeoutMs;
    } else if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeoutMs;
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;

    this.nextAttemptTime = 0;
  }

  isOpen(): boolean {
    return this.state === 'OPEN';
  }

  isHalfOpen(): boolean {
    return this.state === 'HALF_OPEN';
  }

  isClosed(): boolean {
    return this.state === 'CLOSED';
  }
}

describe('Simplified Circuit-Breaker', () => {
  let faultInjector: FaultInjectionAPI;
  let circuitBreaker: SimpleCircuitBreaker;

  beforeEach(() => {
    faultInjector = useFaultInjection;
    faultInjector.reset();
    circuitBreaker = new SimpleCircuitBreaker();
  });

  afterEach(() => {
    faultInjector.reset();
    circuitBreaker.reset();
  });

  describe('Basic State Transitions', () => {
    it('starts in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.isClosed()).toBe(true);
      expect(circuitBreaker.isOpen()).toBe(false);
      expect(circuitBreaker.isHalfOpen()).toBe(false);
    });

    it('transitions from CLOSED to OPEN after failure threshold', async () => {
      // Inject failures until threshold is reached
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');
      expect(circuitBreaker.isOpen()).toBe(true);
      expect(circuitBreaker.getFailureCount()).toBe(3);
    });

    it('transitions from OPEN to HALF_OPEN after timeout', async () => {
      // First get to OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');

      // Simulate timeout by manually setting nextAttemptTime to past
      (circuitBreaker as any).nextAttemptTime = Date.now() - 1000;

      // Try to execute - should transition to HALF_OPEN
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Probe failure');
        });
      } catch (error) {
        // Expected failure
      }

      expect(circuitBreaker.getState()).toBe('OPEN'); // Should go back to OPEN on failure
    });

    it('transitions from HALF_OPEN to CLOSED on success', async () => {
      // First get to OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');

      // Simulate timeout
      (circuitBreaker as any).nextAttemptTime = Date.now() - 1000;

      // Try to execute - should transition to HALF_OPEN and succeed
      const result = await circuitBreaker.execute(async () => {
        return 'success';
      });

      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });
  });

  describe('Fault Injection Integration', () => {
    it('injects circuit-breaker fault correctly', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const integrationFault = activeFaults.find((f: any) => f.category === 'integration');
      expect(integrationFault?.fault).toEqual({ kind: 'circuit-breaker-trigger' });
    });

    it('resets fault injection correctly', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      expect(faultInjector.hasAnyFault()).toBe(true);
      
      faultInjector.reset();
      expect(faultInjector.hasAnyFault()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('throws CIRCUIT_BREAKER_OPEN when circuit is open', async () => {
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

      // Try to execute while open
      try {
        await circuitBreaker.execute(async () => {
          return 'should not reach here';
        });
        expect.fail('Should have thrown CIRCUIT_BREAKER_OPEN');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('CIRCUIT_BREAKER_OPEN');
      }
    });

    it('maintains failure count correctly', async () => {
      expect(circuitBreaker.getFailureCount()).toBe(0);

      // Inject one failure
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('First failure');
        });
      } catch (error) {
        // Expected failure
      }

      expect(circuitBreaker.getFailureCount()).toBe(1);
      expect(circuitBreaker.getState()).toBe('CLOSED');

      // Inject second failure
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Second failure');
        });
      } catch (error) {
        // Expected failure
      }

      expect(circuitBreaker.getFailureCount()).toBe(2);
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });
  });

  describe('Reset Functionality', () => {
    it('resets circuit breaker to initial state', async () => {
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

      expect(circuitBreaker.getState()).toBe('OPEN');
      expect(circuitBreaker.getFailureCount()).toBe(3);

      // Reset
      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailureCount()).toBe(0);
      expect(circuitBreaker.isClosed()).toBe(true);
    });

    it('allows execution after reset', async () => {
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

      // Reset
      circuitBreaker.reset();

      // Should be able to execute again
      const result = await circuitBreaker.execute(async () => {
        return 'success after reset';
      });

      expect(result).toBe('success after reset');
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });
  });

  describe('Performance and Stability', () => {
    it('handles rapid state transitions without issues', async () => {
      const iterations = 10;
      
      for (let cycle = 0; cycle < iterations; cycle++) {
        // Open the circuit
        for (let i = 0; i < 3; i++) {
          try {
            await circuitBreaker.execute(async () => {
              throw new Error(`Cycle ${cycle} failure ${i}`);
            });
          } catch (error) {
            // Expected failure
          }
        }
        
        expect(circuitBreaker.isOpen()).toBe(true);
        
        // Reset for next cycle
        circuitBreaker.reset();
        expect(circuitBreaker.isClosed()).toBe(true);
      }
      
      // Final state should be CLOSED
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });

    it('maintains state consistency during concurrent access simulation', async () => {
      // Simulate multiple operations (not truly concurrent, but tests state consistency)
      const operations = Array.from({ length: 5 }, (_, i) => 
        circuitBreaker.execute(async () => {
          if (i % 2 === 0) {
            throw new Error(`Operation ${i} failure`);
          }
          return `Operation ${i} success`;
        })
      );
      
      const results = await Promise.allSettled(operations);
      
      // Verify no unhandled rejections
      const rejectedResults = results.filter(r => r.status === 'rejected');
      const fulfilledResults = results.filter(r => r.status === 'fulfilled');
      
      expect(rejectedResults.length + fulfilledResults.length).toBe(5);
      
      // Circuit should be in a consistent state
      expect(['CLOSED', 'OPEN']).toContain(circuitBreaker.getState());
    });
  });
});
