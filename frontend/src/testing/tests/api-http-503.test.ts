import { describe, test, expect, beforeEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';

describe('API Client - HTTP 503 Error', () => {
  beforeEach(() => {
    // Reset fault injection
    useFaultInjection.reset();
  });

  test('should inject HTTP 503 fault correctly', () => {
    // Inject HTTP 503 fault
    useFaultInjection.api.injectHttpError(503);
    
    // Verify fault is active
    expect(useFaultInjection.api.shouldFail()).toBe(true);
    
    // Verify fault details
    const fault = useFaultInjection.api.getFault();
    expect(fault).toEqual({ kind: 'http', status: 503 });
  });

  test('should inject timeout fault correctly', () => {
    // Inject timeout fault
    useFaultInjection.api.injectTimeout();
    
    // Verify fault is active
    expect(useFaultInjection.api.shouldFail()).toBe(true);
    
    // Verify fault details
    const fault = useFaultInjection.api.getFault();
    expect(fault).toEqual({ kind: 'timeout' });
  });

  test('should inject network error fault correctly', () => {
    // Inject network error fault
    useFaultInjection.api.injectNetworkError();
    
    // Verify fault is active
    expect(useFaultInjection.api.shouldFail()).toBe(true);
    
    // Verify fault details
    const fault = useFaultInjection.api.getFault();
    expect(fault).toEqual({ kind: 'network-error' });
  });

  test('should inject CORS error fault correctly', () => {
    // Inject CORS error fault
    useFaultInjection.api.injectCorsError();
    
    // Verify fault is active
    expect(useFaultInjection.api.shouldFail()).toBe(true);
    
    // Verify fault details
    const fault = useFaultInjection.api.getFault();
    expect(fault).toEqual({ kind: 'cors-error' });
  });

  test('should inject rate limit fault correctly', () => {
    // Inject rate limit fault
    useFaultInjection.api.injectRateLimitExceeded();
    
    // Verify fault is active
    expect(useFaultInjection.api.shouldFail()).toBe(true);
    
    // Verify fault type
    const fault = useFaultInjection.api.getFault();
    expect(fault?.kind).toBe('rate-limit-exceeded');
  });

  test('should reset fault injection correctly', () => {
    // Inject fault
    useFaultInjection.api.injectHttpError(503);
    
    // Verify fault is active
    expect(useFaultInjection.api.shouldFail()).toBe(true);
    expect(useFaultInjection.getActiveFaults().length).toBe(1);
    
    // Reset
    useFaultInjection.reset();
    
    // Verify fault is cleared
    expect(useFaultInjection.api.shouldFail()).toBe(false);
    expect(useFaultInjection.getActiveFaults().length).toBe(0);
  });

  test('should handle fault replacement correctly', () => {
    // Inject first fault
    useFaultInjection.api.injectHttpError(500);
    
    // Verify first fault is active
    expect(useFaultInjection.api.shouldFail()).toBe(true);
    let fault = useFaultInjection.api.getFault();
    expect(fault).toEqual({ kind: 'http', status: 500 });
    
    // Replace with second fault
    useFaultInjection.api.injectTimeout();
    
    // Verify second fault replaced first
    expect(useFaultInjection.api.shouldFail()).toBe(true);
    fault = useFaultInjection.api.getFault();
    expect(fault).toEqual({ kind: 'timeout' });
    
    // Verify only one fault is active
    expect(useFaultInjection.getActiveFaults().length).toBe(1);
  });
});
