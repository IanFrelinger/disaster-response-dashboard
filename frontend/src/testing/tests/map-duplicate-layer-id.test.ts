import { describe, test, expect, beforeEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';

describe('Map Provider - Duplicate Layer ID', () => {
  beforeEach(() => {
    useFaultInjection.reset();
  });

  test('should detect duplicate layer IDs', () => {
    // Inject duplicate layer ID fault
    useFaultInjection.map.injectDuplicateLayerId();
    
    // Verify fault is active
    expect(useFaultInjection.map.shouldFail()).toBe(true);
    const fault = useFaultInjection.map.getFault();
    expect(fault).toEqual({ kind: 'duplicate-layer-id' });
  });

  test('should reset fault injection correctly', () => {
    // Inject fault
    useFaultInjection.map.injectDuplicateLayerId();
    
    // Verify fault is active
    expect(useFaultInjection.map.shouldFail()).toBe(true);
    
    // Reset
    useFaultInjection.reset();
    
    // Verify fault is cleared
    expect(useFaultInjection.map.shouldFail()).toBe(false);
    expect(useFaultInjection.getActiveFaults().length).toBe(0);
  });

  test('should handle fault replacement correctly', () => {
    // Inject first fault
    useFaultInjection.map.injectDuplicateLayerId();
    
    // Verify first fault is active
    expect(useFaultInjection.map.shouldFail()).toBe(true);
    let fault = useFaultInjection.map.getFault();
    expect(fault).toEqual({ kind: 'duplicate-layer-id' });
    
    // Replace with second fault
    useFaultInjection.map.injectWebglUnavailable();
    
    // Verify second fault replaced first
    expect(useFaultInjection.map.shouldFail()).toBe(true);
    fault = useFaultInjection.map.getFault();
    expect(fault).toEqual({ kind: 'webgl-unavailable' });
    
    // Verify only one fault is active
    expect(useFaultInjection.getActiveFaults().length).toBe(1);
  });
});
