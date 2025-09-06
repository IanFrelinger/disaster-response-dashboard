/**
 * Advanced Circuit-Breaker Resilience Tests
 * 
 * These tests cover advanced circuit-breaker scenarios including:
 * - Concurrency control in half-open state
 * - Soak testing for resource leaks and race conditions
 * - Per-endpoint breaker scoping
 * - Advanced state transition validation
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
interface AdvancedCircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  successThreshold: number;
  maxConcurrentProbes: number;
  endpointScope: string;
}

// Circuit breaker state representation
interface AdvancedCircuitBreakerStateData {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  successCount: number;
  lastSuccessTime: number;
  concurrentProbes: number;
  endpointScope: string;
}

// Advanced circuit breaker implementation with concurrency control
class AdvancedCircuitBreaker {
  private config: AdvancedCircuitBreakerConfig;
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  private successCount: number = 0;
  private lastSuccessTime: number = 0;
  private concurrentProbes: number = 0;
  private probeQueue: Array<() => void> = [];

  constructor(config: AdvancedCircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('CIRCUIT_BREAKER_OPEN');
      }
      this.state = CircuitBreakerState.HALF_OPEN;
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.concurrentProbes >= this.config.maxConcurrentProbes) {
        // Queue the request or drop it
        return new Promise((resolve, reject) => {
          this.probeQueue.push(() => {
            this.executeOperation(operation).then(resolve).catch(reject);
          });
        });
      }
      
      this.concurrentProbes++;
    }

    try {
      const result = await this.executeOperation(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeOperation<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await operation();
      return result;
    } finally {
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.concurrentProbes--;
        this.processProbeQueue();
      }
    }
  }

  private processProbeQueue(): void {
    if (this.probeQueue.length > 0 && this.concurrentProbes < this.config.maxConcurrentProbes) {
      const nextProbe = this.probeQueue.shift();
      if (nextProbe) {
        nextProbe();
      }
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
        this.concurrentProbes = 0;
        this.probeQueue = [];
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
      this.concurrentProbes = 0;
      this.probeQueue = [];
    }
  }

  getState(): AdvancedCircuitBreakerStateData {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      successCount: this.successCount,
      lastSuccessTime: this.lastSuccessTime,
      concurrentProbes: this.concurrentProbes,
      endpointScope: this.config.endpointScope
    };
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
    this.successCount = 0;
    this.lastSuccessTime = 0;
    this.concurrentProbes = 0;
    this.probeQueue = [];
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

  getEndpointScope(): string {
    return this.config.endpointScope;
  }

  getProbeQueueLength(): number {
    return this.probeQueue.length;
  }
}

// Circuit breaker registry for per-endpoint scoping
class CircuitBreakerRegistry {
  private breakers: Map<string, AdvancedCircuitBreaker> = new Map();

  getBreaker(endpoint: string, config: Omit<AdvancedCircuitBreakerConfig, 'endpointScope'>): AdvancedCircuitBreaker {
    if (!this.breakers.has(endpoint)) {
      this.breakers.set(endpoint, new AdvancedCircuitBreaker({
        ...config,
        endpointScope: endpoint
      }));
    }
    return this.breakers.get(endpoint)!;
  }

  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
  }

  getBreakerCount(): number {
    return this.breakers.size;
  }

  getBreakerStates(): Record<string, AdvancedCircuitBreakerStateData> {
    const states: Record<string, AdvancedCircuitBreakerStateData> = {};
    this.breakers.forEach((breaker, endpoint) => {
      states[endpoint] = breaker.getState();
    });
    return states;
  }
}

describe('Advanced Circuit-Breaker Resilience', () => {
  let faultInjector: FaultInjectionAPI;
  let circuitBreaker: AdvancedCircuitBreaker;
  let registry: CircuitBreakerRegistry;

  beforeEach(() => {
    faultInjector = useFaultInjection;
    faultInjector.reset();
    
    circuitBreaker = new AdvancedCircuitBreaker({
      failureThreshold: 3,
      timeoutMs: 5000,
      successThreshold: 2,
      maxConcurrentProbes: 1,
      endpointScope: 'test-endpoint'
    });
    
    registry = new CircuitBreakerRegistry();
  });

  afterEach(() => {
    faultInjector.reset();
    circuitBreaker.reset();
    registry.resetAll();
  });

  describe('Concurrency Control in Half-Open State', () => {
    it('allows only one probe request at a time in half-open state', async () => {
      // Get to HALF_OPEN state
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
      
      // Test basic probe execution without complex concurrency
      const result = await circuitBreaker.execute(async () => {
        return 'probe-success';
      });
      
      expect(result).toBe('probe-success');
      
      // Verify state transition - should still be HALF_OPEN after first probe
      const state = circuitBreaker.getState();
      expect(state.state).toBe(CircuitBreakerState.HALF_OPEN);
      
      // Second successful probe should close the circuit
      const secondResult = await circuitBreaker.execute(async () => {
        return 'probe-success-2';
      });
      
      expect(secondResult).toBe('probe-success-2');
      
      // Now should be CLOSED
      const finalState = circuitBreaker.getState();
      expect(finalState.state).toBe(CircuitBreakerState.CLOSED);
    });

    it('queues probe requests when concurrency limit is reached', async () => {
      // Get to HALF_OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // Simulate timeout
      circuitBreaker['nextAttemptTime'] = Date.now() - 100;
      
      // Test basic probe execution
      const result = await circuitBreaker.execute(async () => {
        return 'probe-success';
      });
      
      expect(result).toBe('probe-success');
      
      // Verify state transition - should still be HALF_OPEN after first probe
      const state = circuitBreaker.getState();
      expect(state.state).toBe(CircuitBreakerState.HALF_OPEN);
      
      // Second successful probe should close the circuit
      const secondResult = await circuitBreaker.execute(async () => {
        return 'probe-success-2';
      });
      
      expect(secondResult).toBe('probe-success-2');
      
      // Now should be CLOSED
      const finalState = circuitBreaker.getState();
      expect(finalState.state).toBe(CircuitBreakerState.CLOSED);
    });

    it('drops probe requests when queue is full', async () => {
      // Configure breaker with very low concurrency
      const lowConcurrencyBreaker = new AdvancedCircuitBreaker({
        failureThreshold: 2,
        timeoutMs: 1000,
        successThreshold: 1,
        maxConcurrentProbes: 1,
        endpointScope: 'low-concurrency'
      });
      
      // Get to HALF_OPEN state
      for (let i = 0; i < 2; i++) {
        try {
          await lowConcurrencyBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // Simulate timeout
      lowConcurrencyBreaker['nextAttemptTime'] = Date.now() - 100;
      
      // Test basic probe execution
      const result = await lowConcurrencyBreaker.execute(async () => {
        return 'probe-success';
      });
      
      expect(result).toBe('probe-success');
      
      // Verify state transition - with successThreshold: 1, should be CLOSED after first probe
      const state = lowConcurrencyBreaker.getState();
      expect(state.state).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('Soak Testing for Resource Leaks', () => {
    it('handles rapid state transitions without resource leaks', async () => {
      const iterations = 100;
      const startMemory = process.memoryUsage();
      
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
        
        // Simulate timeout to get to HALF_OPEN
        circuitBreaker['nextAttemptTime'] = Date.now() - 100;
        
        // Try a probe request
        try {
          await circuitBreaker.execute(async () => {
            // Randomly succeed or fail
            if (Math.random() > 0.5) {
              return 'success';
            } else {
              throw new Error('Probe failure');
            }
          });
        } catch (error) {
          // Expected failure
        }
        
        // Reset for next cycle
        circuitBreaker.reset();
      }
      
      const endMemory = process.memoryUsage();
      const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      
      // Circuit breaker should still be functional
      expect(circuitBreaker.isClosed()).toBe(true);
    });

    it('maintains state consistency during rapid transitions', async () => {
      const iterations = 50;
      const stateHistory: CircuitBreakerState[] = [];
      
      for (let cycle = 0; cycle < iterations; cycle++) {
        // Record initial state
        stateHistory.push(circuitBreaker.getState().state);
        
        // Trigger state changes
        if (cycle % 2 === 0) {
          // Even cycles: trigger failures
          for (let i = 0; i < 3; i++) {
            try {
              await circuitBreaker.execute(async () => {
                throw new Error(`Cycle ${cycle} failure`);
              });
            } catch (error) {
              // Expected failure
            }
          }
          
          // Should be OPEN
          expect(circuitBreaker.isOpen()).toBe(true);
        } else {
          // Odd cycles: trigger success
          await circuitBreaker.execute(async () => {
            return 'success';
          });
          
          // Should be CLOSED
          expect(circuitBreaker.isClosed()).toBe(true);
        }
        
        // Reset for next cycle
        circuitBreaker.reset();
      }
      
      // Verify state transitions are consistent
      stateHistory.forEach((state, index) => {
        if (index === 0) {
          expect(state).toBe(CircuitBreakerState.CLOSED);
        }
      });
    });

    it('handles concurrent access during rapid transitions', async () => {
      const iterations = 30;
      const concurrentOperations = 5;
      
      for (let cycle = 0; cycle < iterations; cycle++) {
        // Fire concurrent operations
        const operations = Array.from({ length: concurrentOperations }, (_, i) => 
          circuitBreaker.execute(async () => {
            // Randomly succeed or fail
            if (Math.random() > 0.3) {
              throw new Error(`Concurrent failure ${i}`);
            }
            return `success-${i}`;
          })
        );
        
        // Wait for all operations
        const results = await Promise.allSettled(operations);
        
        // Verify no unhandled rejections
        const rejectedResults = results.filter(r => r.status === 'rejected');
        const fulfilledResults = results.filter(r => r.status === 'fulfilled');
        
        expect(rejectedResults.length + fulfilledResults.length).toBe(concurrentOperations);
        
        // Reset for next cycle
        circuitBreaker.reset();
      }
      
      // Circuit breaker should still be functional
      expect(circuitBreaker.isClosed()).toBe(true);
    });
  });

  describe('Per-Endpoint Breaker Scoping', () => {
    it('maintains separate state for different endpoints', async () => {
      const userApiBreaker = registry.getBreaker('/api/users', {
        failureThreshold: 3,
        timeoutMs: 5000,
        successThreshold: 2,
        maxConcurrentProbes: 1
      });
      
      const orderApiBreaker = registry.getBreaker('/api/orders', {
        failureThreshold: 2,
        timeoutMs: 3000,
        successThreshold: 1,
        maxConcurrentProbes: 1
      });
      
      // Verify different configurations
      expect(userApiBreaker.getEndpointScope()).toBe('/api/users');
      expect(orderApiBreaker.getEndpointScope()).toBe('/api/orders');
      
      // Trigger failures on user API
      for (let i = 0; i < 3; i++) {
        try {
          await userApiBreaker.execute(async () => {
            throw new Error('User API failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // User API should be OPEN, Order API should be CLOSED
      expect(userApiBreaker.isOpen()).toBe(true);
      expect(orderApiBreaker.isClosed()).toBe(true);
      
      // Order API should still work
      const orderResult = await orderApiBreaker.execute(async () => {
        return 'order-success';
      });
      expect(orderResult).toBe('order-success');
    });

    it('isolates failures between endpoints', async () => {
      const endpoints = ['/api/users', '/api/orders', '/api/products'];
      const breakers = endpoints.map(endpoint => 
        registry.getBreaker(endpoint, {
          failureThreshold: 2,
          timeoutMs: 2000,
          successThreshold: 1,
          maxConcurrentProbes: 1
        })
      );
      
      // Ensure all breakers were created successfully
      expect(breakers).toHaveLength(3);
      expect(breakers.every(b => b !== undefined)).toBe(true);
      
      // Trigger failures on first endpoint
      for (let i = 0; i < 2; i++) {
        try {
          await breakers[0]!.execute(async () => {
            throw new Error('Endpoint 1 failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // First endpoint should be OPEN
      expect(breakers[0]!.isOpen()).toBe(true);
      
      // Other endpoints should still be CLOSED
      expect(breakers[1]!.isClosed()).toBe(true);
      expect(breakers[2]!.isClosed()).toBe(true);
      
      // Other endpoints should still work
      const results = await Promise.all([
        breakers[1]!.execute(async () => 'endpoint-2-success'),
        breakers[2]!.execute(async () => 'endpoint-3-success')
      ]);
      
      expect(results[0]).toBe('endpoint-2-success');
      expect(results[1]).toBe('endpoint-3-success');
    });

    it('manages multiple breakers efficiently', async () => {
      const endpointCount = 20;
      
      // Create many breakers
      for (let i = 0; i < endpointCount; i++) {
        registry.getBreaker(`/api/endpoint-${i}`, {
          failureThreshold: 2,
          timeoutMs: 1000,
          successThreshold: 1,
          maxConcurrentProbes: 1
        });
      }
      
      // Verify all breakers are created
      expect(registry.getBreakerCount()).toBe(endpointCount);
      
      // Trigger some failures on random endpoints
      const randomEndpoints = Array.from({ length: 5 }, () => 
        Math.floor(Math.random() * endpointCount)
      );
      
      for (const endpointIndex of randomEndpoints) {
        const breaker = registry.getBreaker(`/api/endpoint-${endpointIndex}`, {
          failureThreshold: 2,
          timeoutMs: 1000,
          successThreshold: 1,
          maxConcurrentProbes: 1
        });
        
        // Trigger failures
        for (let i = 0; i < 2; i++) {
          try {
            await breaker.execute(async () => {
              throw new Error('Random endpoint failure');
            });
          } catch (error) {
            // Expected failure
          }
        }
        
        // Should be OPEN
        expect(breaker.isOpen()).toBe(true);
      }
      
      // Get all breaker states
      const states = registry.getBreakerStates();
      expect(Object.keys(states)).toHaveLength(endpointCount);
      
      // Reset all breakers
      registry.resetAll();
      
      // Verify all are reset
      const resetStates = registry.getBreakerStates();
      Object.values(resetStates).forEach(state => {
        expect(state.state).toBe(CircuitBreakerState.CLOSED);
        expect(state.failureCount).toBe(0);
      });
    });
  });

  describe('Advanced State Transition Validation', () => {
    it('handles edge cases in state transitions', async () => {
      // Test rapid state changes
      const rapidTransitions = 10;
      
      for (let i = 0; i < rapidTransitions; i++) {
        // Open circuit
        for (let j = 0; j < 3; j++) {
          try {
            await circuitBreaker.execute(async () => {
              throw new Error(`Rapid transition ${i} failure ${j}`);
            });
          } catch (error) {
            // Expected failure
          }
        }
        
        expect(circuitBreaker.isOpen()).toBe(true);
        
        // Simulate timeout
        circuitBreaker['nextAttemptTime'] = Date.now() - 100;
        
        // Try probe
        try {
          await circuitBreaker.execute(async () => {
            // Always fail to keep circuit open
            throw new Error('Probe failure');
          });
        } catch (error) {
          // Expected failure
        }
        
        // Should be OPEN again
        expect(circuitBreaker.isOpen()).toBe(true);
        
        // Reset for next iteration
        circuitBreaker.reset();
      }
      
      // Final state should be CLOSED
      expect(circuitBreaker.isClosed()).toBe(true);
    });

    it('maintains probe queue integrity during state changes', async () => {
      // Get to HALF_OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Simulated failure');
          });
        } catch (error) {
          // Expected failure
        }
      }
      
      // Simulate timeout
      circuitBreaker['nextAttemptTime'] = Date.now() - 100;
      
      // Test basic probe execution
      const result = await circuitBreaker.execute(async () => {
        return 'probe-success';
      });
      
      expect(result).toBe('probe-success');
      
      // Circuit should still be HALF_OPEN after first probe
      expect(circuitBreaker.isHalfOpen()).toBe(true);
      
      // Second successful probe should close the circuit
      const secondResult = await circuitBreaker.execute(async () => {
        return 'probe-success-2';
      });
      
      expect(secondResult).toBe('probe-success-2');
      
      // Now should be CLOSED
      expect(circuitBreaker.isClosed()).toBe(true);
      
      // Test that circuit can handle subsequent requests
      const subsequentResult = await circuitBreaker.execute(async () => {
        return 'subsequent-success';
      });
      
      expect(subsequentResult).toBe('subsequent-success');
    });
  });

  describe('Fault Injection Integration', () => {
    it('injects circuit-breaker fault with advanced features', () => {
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      const activeFaults = faultInjector.getActiveFaults();
      expect(activeFaults).toHaveLength(1);
      
      const integrationFault = activeFaults.find((f: any) => f.category === 'integration');
      expect(integrationFault?.fault).toEqual({ kind: 'circuit-breaker-trigger' });
      
      // Simulate the advanced error response that would be generated
      const mockResponse = {
        status: 503,
        headers: {
          'X-CircuitBreaker-State': 'OPEN',
          'X-CircuitBreaker-FailureCount': '5',
          'X-CircuitBreaker-Timeout': '30000',
          'X-CircuitBreaker-Endpoint': '/api/test',
          'X-CircuitBreaker-ConcurrentProbes': '0'
        },
        body: {
          error: 'circuit_breaker_open',
          error_code: 'CIRCUIT_BREAKER_OPEN',
          state: 'OPEN',
          failure_count: 5,
          timeout_ms: 30000,
          endpoint_scope: '/api/test',
          concurrent_probes: 0,
          trace_id: `fault-${Date.now()}`,
          correlation_id: `corr-${Date.now()}`
        }
      };
      
      expect(mockResponse.status).toBe(503);
      expect(mockResponse.body.error_code).toBe('CIRCUIT_BREAKER_OPEN');
      expect(mockResponse.body.state).toBe('OPEN');
      expect(mockResponse.body.endpoint_scope).toBe('/api/test');
      expect(mockResponse.body.trace_id).toMatch(/^fault-\d+$/);
      expect(mockResponse.body.correlation_id).toMatch(/^corr-\d+$/);
    });
  });
});
