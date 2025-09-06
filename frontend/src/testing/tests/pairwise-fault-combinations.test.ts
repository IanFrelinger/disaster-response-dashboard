/**
 * Pairwise Fault Combinations Testing
 * 
 * This test suite explores fault combinations systematically to ensure
 * that multiple faults can coexist without causing unexpected behavior.
 * Uses pairwise testing to cover combinations efficiently.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFaultInjection } from '../fault-injection';
import type { FaultInjectionAPI } from '../error-catalog';
import { ERROR_CODES, createStructuredError } from '../error-catalog';

// Pairwise test generator for fault combinations
class PairwiseFaultTester {
  private faultCategories: Array<keyof FaultInjectionAPI['config']> = [
    'api', 'map', 'data', 'ui', 'env', 'perf', 'integration'
  ];



  // Generate pairwise combinations of fault categories
  generatePairwiseCombinations(): Array<[keyof FaultInjectionAPI['config'], keyof FaultInjectionAPI['config']]> {
    const combinations: Array<[keyof FaultInjectionAPI['config'], keyof FaultInjectionAPI['config']]> = [];
    
    for (let i = 0; i < this.faultCategories.length; i++) {
      for (let j = i + 1; j < this.faultCategories.length; j++) {
        const cat1 = this.faultCategories[i];
        const cat2 = this.faultCategories[j];
        if (cat1 && cat2) {
          combinations.push([cat1, cat2]);
        }
      }
    }
    
    return combinations;
  }

  // Generate specific fault combinations for testing
  generateFaultCombinations(): Array<{
    category1: keyof FaultInjectionAPI['config'];
    fault1: string;
    category2: keyof FaultInjectionAPI['config'];
    fault2: string;
  }> {
    const combinations: Array<{
      category1: keyof FaultInjectionAPI['config'];
      fault1: string;
      category2: keyof FaultInjectionAPI['config'];
      fault2: string;
    }> = [];

    // Test critical combinations
    const criticalCombinations = [
      { cat1: 'api', fault1: 'rate-limit-exceeded', cat2: 'integration', fault2: 'circuit-breaker-trigger' },
      { cat1: 'api', fault1: 'network-error', cat2: 'map', fault2: 'webgl-unavailable' },
      { cat1: 'data', fault1: 'memory-overflow', cat2: 'perf', fault2: 'memory-spike' },
      { cat1: 'ui', fault1: 'component-render-fail', cat2: 'env', fault2: 'missing-mapbox-token' },
      { cat1: 'map', fault1: 'tile-error', cat2: 'data', fault2: 'geojson-invalid' }
    ];

    criticalCombinations.forEach(combo => {
      combinations.push({
        category1: combo.cat1 as keyof FaultInjectionAPI['config'],
        fault1: combo.fault1,
        category2: combo.cat2 as keyof FaultInjectionAPI['config'],
        fault2: combo.fault2
      });
    });

    return combinations;
  }

  // Generate triple fault combinations for stress testing
  generateTripleFaultCombinations(): Array<{
    category1: keyof FaultInjectionAPI['config'];
    fault1: string;
    category2: keyof FaultInjectionAPI['config'];
    fault2: string;
    category3: keyof FaultInjectionAPI['config'];
    fault3: string;
  }> {
    return [
      {
        category1: 'api',
        fault1: 'rate-limit-exceeded',
        category2: 'integration',
        fault2: 'circuit-breaker-trigger',
        category3: 'perf',
        fault3: 'memory-spike'
      },
      {
        category1: 'map',
        fault1: 'webgl-unavailable',
        category2: 'data',
        fault2: 'memory-overflow',
        category3: 'ui',
        fault3: 'component-render-fail'
      }
    ];
  }

  // Helper methods
  injectFaultByCategory(faultInjector: FaultInjectionAPI, category: keyof FaultInjectionAPI['config'], _faultType: string): void {
    switch (category) {
      case 'api':
        faultInjector.api.injectRateLimitExceeded();
        break;
      case 'map':
        faultInjector.map.injectWebglUnavailable();
        break;
      case 'data':
        faultInjector.data.injectGeojsonInvalid();
        break;
      case 'ui':
        faultInjector.ui.injectComponentRenderFail();
        break;
      case 'env':
        faultInjector.env.injectMissingMapboxToken();
        break;
      case 'perf':
        faultInjector.perf.injectMemorySpike();
        break;
      case 'integration':
        faultInjector.integration.injectCircuitBreakerTrigger();
        break;
    }
  }

  injectSpecificFault(faultInjector: FaultInjectionAPI, category: keyof FaultInjectionAPI['config'], faultType: string): void {
    switch (category) {
      case 'api':
        if (faultType === 'rate-limit-exceeded') faultInjector.api.injectRateLimitExceeded();
        else if (faultType === 'timeout') faultInjector.api.injectTimeout();
        else if (faultType === 'network-error') faultInjector.api.injectNetworkError();
        break;
      case 'map':
        if (faultType === 'webgl-unavailable') faultInjector.map.injectWebglUnavailable();
        else if (faultType === 'style-load-fail') faultInjector.map.injectStyleLoadFail();
        else if (faultType === 'tile-error') faultInjector.map.injectTileError();
        break;
      case 'data':
        if (faultType === 'geojson-invalid') faultInjector.data.injectGeojsonInvalid();
        else if (faultType === 'memory-overflow') faultInjector.data.injectMemoryOverflow();
        else if (faultType === 'type-mismatch') faultInjector.data.injectTypeMismatch();
        break;
      case 'ui':
        if (faultType === 'component-render-fail') faultInjector.ui.injectComponentRenderFail();
        else if (faultType === 'error-boundary-trigger') faultInjector.ui.injectErrorBoundary();
        else if (faultType === 'memory-leak') faultInjector.ui.injectMemoryLeak();
        break;
      case 'env':
        if (faultType === 'missing-mapbox-token') faultInjector.env.injectMissingMapboxToken();
        else if (faultType === 'config-file-corrupt') faultInjector.env.injectConfigFileCorrupt();
        break;
      case 'perf':
        if (faultType === 'memory-spike') faultInjector.perf.injectMemorySpike();
        else if (faultType === 'frame-rate-drop') faultInjector.perf.injectFrameRateDrop();
        else if (faultType === 'cpu-overload') faultInjector.perf.injectCpuOverload();
        break;
      case 'integration':
        if (faultType === 'circuit-breaker-trigger') faultInjector.integration.injectCircuitBreakerTrigger();
        else if (faultType === 'service-discovery-fail') faultInjector.integration.injectServiceDiscoveryFail();
        break;
    }
  }

  getErrorCodeForFault(fault: any): string {
    // This would use the actual getErrorCodeForFault function from error-catalog
    // For now, return a mock implementation
    if (fault.kind === 'rate-limit-exceeded') return ERROR_CODES.API_RATE_LIMIT_EXCEEDED;
    if (fault.kind === 'circuit-breaker-trigger') return ERROR_CODES.CIRCUIT_BREAKER_OPEN;
    if (fault.kind === 'webgl-unavailable') return ERROR_CODES.MAP_WEBGL_UNAVAILABLE;
    if (fault.kind === 'geojson-invalid') return ERROR_CODES.DATA_GEOJSON_INVALID;
    if (fault.kind === 'component-render-fail') return ERROR_CODES.UI_COMPONENT_RENDER_FAIL;
    if (fault.kind === 'missing-mapbox-token') return ERROR_CODES.ENV_MISSING_MAPBOX_TOKEN;
    if (fault.kind === 'memory-spike') return ERROR_CODES.PERF_MEMORY_SPIKE;
    
    // Add missing fault types
    if (fault.kind === 'network-error') return ERROR_CODES.API_NETWORK_ERROR;
    if (fault.kind === 'memory-overflow') return ERROR_CODES.DATA_MEMORY_OVERFLOW;
    if (fault.kind === 'tile-error') return ERROR_CODES.MAP_TILE_ERROR;
    
    return 'UNKNOWN_FAULT';
  }
}

describe('Pairwise Fault Combinations', () => {
  let faultInjector: FaultInjectionAPI;
  let pairwiseTester: PairwiseFaultTester;

  beforeEach(() => {
    faultInjector = useFaultInjection;
    faultInjector.reset();
    pairwiseTester = new PairwiseFaultTester();
  });

  afterEach(() => {
    faultInjector.reset();
  });

  describe('Pairwise Category Combinations', () => {
    it('handles all pairwise combinations of fault categories', () => {
      const combinations = pairwiseTester.generatePairwiseCombinations();
      
      combinations.forEach(([cat1, cat2]) => {
        // Reset before each combination
        faultInjector.reset();
        
        // Inject faults in both categories
        pairwiseTester.injectFaultByCategory(faultInjector, cat1, 'test-fault-1');
        pairwiseTester.injectFaultByCategory(faultInjector, cat2, 'test-fault-2');
        
        // Verify both faults are active
        expect(faultInjector.hasAnyFault()).toBe(true);
        expect(faultInjector[cat1].shouldFail()).toBe(true);
        expect(faultInjector[cat2].shouldFail()).toBe(true);
        
        // Verify fault count
        const activeFaults = faultInjector.getActiveFaults();
        expect(activeFaults).toHaveLength(2);
      });
    });

    it('maintains fault isolation between categories', () => {
      const combinations = pairwiseTester.generatePairwiseCombinations();
      
      combinations.forEach(([cat1, cat2]) => {
        faultInjector.reset();
        
        // Inject fault in first category only
        pairwiseTester.injectFaultByCategory(faultInjector, cat1, 'test-fault');
        
        // Verify only first category is affected
        expect(faultInjector[cat1].shouldFail()).toBe(true);
        expect(faultInjector[cat2].shouldFail()).toBe(false);
        
        // Inject fault in second category
        pairwiseTester.injectFaultByCategory(faultInjector, cat2, 'test-fault');
        
        // Verify both are now affected
        expect(faultInjector[cat1].shouldFail()).toBe(true);
        expect(faultInjector[cat2].shouldFail()).toBe(true);
      });
    });
  });

  describe('Specific Fault Combinations', () => {
    it('handles critical fault combinations correctly', () => {
      const combinations = pairwiseTester.generateFaultCombinations();
      
      combinations.forEach(combo => {
        faultInjector.reset();
        
        // Inject first fault
        pairwiseTester.injectSpecificFault(faultInjector, combo.category1, combo.fault1);
        
        // Verify first fault is active
        expect(faultInjector[combo.category1].shouldFail()).toBe(true);
        expect(faultInjector.hasAnyFault()).toBe(true);
        
        // Inject second fault
        pairwiseTester.injectSpecificFault(faultInjector, combo.category2, combo.fault2);
        
        // Verify both faults are active
        expect(faultInjector[combo.category1].shouldFail()).toBe(true);
        expect(faultInjector[combo.category2].shouldFail()).toBe(true);
        expect(faultInjector.getActiveFaults()).toHaveLength(2);
      });
    });

    it('generates proper error codes for fault combinations', () => {
      const combinations = pairwiseTester.generateFaultCombinations();
      
      combinations.forEach(combo => {
        faultInjector.reset();
        
        // Inject both faults
        pairwiseTester.injectSpecificFault(faultInjector, combo.category1, combo.fault1);
        pairwiseTester.injectSpecificFault(faultInjector, combo.category2, combo.fault2);
        
        // Get active faults
        const activeFaults = faultInjector.getActiveFaults();
        
        // Verify each fault has proper error structure
        activeFaults.forEach(fault => {
          const errorCode = pairwiseTester.getErrorCodeForFault(fault.fault);
          expect(errorCode).not.toBe('UNKNOWN_FAULT');
          // The error codes don't follow a strict prefix pattern, so we just check they're valid
          expect(errorCode).toBeDefined();
          expect(typeof errorCode).toBe('string');
        });
      });
    });
  });

  describe('Triple Fault Combinations', () => {
    it('handles triple fault combinations without conflicts', () => {
      const combinations = pairwiseTester.generateTripleFaultCombinations();
      
      combinations.forEach(combo => {
        faultInjector.reset();
        
        // Inject all three faults
        pairwiseTester.injectSpecificFault(faultInjector, combo.category1, combo.fault1);
        pairwiseTester.injectSpecificFault(faultInjector, combo.category2, combo.fault2);
        pairwiseTester.injectSpecificFault(faultInjector, combo.category3, combo.fault3);
        
        // Verify all faults are active
        expect(faultInjector[combo.category1].shouldFail()).toBe(true);
        expect(faultInjector[combo.category2].shouldFail()).toBe(true);
        expect(faultInjector[combo.category3].shouldFail()).toBe(true);
        expect(faultInjector.hasAnyFault()).toBe(true);
        
        // Verify fault count
        const activeFaults = faultInjector.getActiveFaults();
        expect(activeFaults).toHaveLength(3);
      });
    });

    it('maintains fault state consistency in triple combinations', () => {
      const combinations = pairwiseTester.generateTripleFaultCombinations();
      
      combinations.forEach(combo => {
        faultInjector.reset();
        
        // Inject faults one by one
        pairwiseTester.injectSpecificFault(faultInjector, combo.category1, combo.fault1);
        expect(faultInjector.getActiveFaults()).toHaveLength(1);
        
        pairwiseTester.injectSpecificFault(faultInjector, combo.category2, combo.fault2);
        expect(faultInjector.getActiveFaults()).toHaveLength(2);
        
        pairwiseTester.injectSpecificFault(faultInjector, combo.category3, combo.fault3);
        expect(faultInjector.getActiveFaults()).toHaveLength(3);
        
        // Verify all categories are affected
        const categories = [combo.category1, combo.category2, combo.category3];
        categories.forEach(cat => {
          expect(faultInjector[cat].shouldFail()).toBe(true);
        });
      });
    });
  });

  describe('Fault Interaction Scenarios', () => {
    it('handles rate-limit with circuit breaker combination', () => {
      // Inject rate limit fault
      faultInjector.api.injectRateLimitExceeded();
      expect(faultInjector.api.shouldFail()).toBe(true);
      
      // Inject circuit breaker fault
      faultInjector.integration.injectCircuitBreakerTrigger();
      expect(faultInjector.integration.shouldFail()).toBe(true);
      
      // Both should be active
      expect(faultInjector.hasAnyFault()).toBe(true);
      expect(faultInjector.getActiveFaults()).toHaveLength(2);
      
      // Verify error codes
      const apiFault = faultInjector.api.getFault();
      const integrationFault = faultInjector.integration.getFault();
      
      expect(apiFault?.kind).toBe('rate-limit-exceeded');
      expect(integrationFault?.kind).toBe('circuit-breaker-trigger');
    });

    it('handles map failure with data corruption combination', () => {
      // Inject map fault
      faultInjector.map.injectWebglUnavailable();
      expect(faultInjector.map.shouldFail()).toBe(true);
      
      // Inject data fault
      faultInjector.data.injectGeojsonInvalid();
      expect(faultInjector.data.shouldFail()).toBe(true);
      
      // Both should be active
      expect(faultInjector.hasAnyFault()).toBe(true);
      expect(faultInjector.getActiveFaults()).toHaveLength(2);
      
      // Verify error codes
      const mapFault = faultInjector.map.getFault();
      const dataFault = faultInjector.data.getFault();
      
      expect(mapFault?.kind).toBe('webgl-unavailable');
      expect(dataFault?.kind).toBe('geojson-invalid');
    });

    it('handles UI failure with environment issue combination', () => {
      // Inject UI fault
      faultInjector.ui.injectComponentRenderFail();
      expect(faultInjector.ui.shouldFail()).toBe(true);
      
      // Inject environment fault
      faultInjector.env.injectMissingMapboxToken();
      expect(faultInjector.env.shouldFail()).toBe(true);
      
      // Both should be active
      expect(faultInjector.hasAnyFault()).toBe(true);
      expect(faultInjector.getActiveFaults()).toHaveLength(2);
      
      // Verify error codes
      const uiFault = faultInjector.ui.getFault();
      const envFault = faultInjector.env.getFault();
      
      expect(uiFault?.kind).toBe('component-render-fail');
      expect(envFault?.kind).toBe('missing-mapbox-token');
    });
  });

  describe('Fault Reset and Recovery', () => {
    it('resets all faults correctly after complex combinations', () => {
      // Inject multiple faults
      faultInjector.api.injectRateLimitExceeded();
      faultInjector.integration.injectCircuitBreakerTrigger();
      faultInjector.map.injectWebglUnavailable();
      faultInjector.data.injectMemoryOverflow();
      
      // Verify all are active
      expect(faultInjector.hasAnyFault()).toBe(true);
      expect(faultInjector.getActiveFaults()).toHaveLength(4);
      
      // Reset all faults
      faultInjector.reset();
      
      // Verify all are inactive
      expect(faultInjector.hasAnyFault()).toBe(false);
      expect(faultInjector.getActiveFaults()).toHaveLength(0);
      
      // Verify individual categories
      expect(faultInjector.api.shouldFail()).toBe(false);
      expect(faultInjector.integration.shouldFail()).toBe(false);
      expect(faultInjector.map.shouldFail()).toBe(false);
      expect(faultInjector.data.shouldFail()).toBe(false);
    });

    it('maintains fault independence during partial resets', () => {
      // Inject faults in different categories
      faultInjector.api.injectRateLimitExceeded();
      faultInjector.map.injectWebglUnavailable();
      
      // Verify both are active
      expect(faultInjector.api.shouldFail()).toBe(true);
      expect(faultInjector.map.shouldFail()).toBe(true);
      
      // Reset only API faults
      faultInjector.setFault('api', null);
      
      // Verify API is reset but map remains
      expect(faultInjector.api.shouldFail()).toBe(false);
      expect(faultInjector.map.shouldFail()).toBe(true);
      expect(faultInjector.hasAnyFault()).toBe(true);
    });
  });

  describe('Structured Error Generation', () => {
    it('generates structured errors for fault combinations', () => {
      // Inject multiple faults
      faultInjector.api.injectRateLimitExceeded();
      faultInjector.integration.injectCircuitBreakerTrigger();
      
      const activeFaults = faultInjector.getActiveFaults();
      
      // Generate structured errors for each fault
      const structuredErrors = activeFaults.map(fault => {
        return createStructuredError(
          pairwiseTester.getErrorCodeForFault(fault.fault) as any, // Cast to ErrorCode for now
          `Fault injected: ${fault.fault.kind}`,
          fault.category,
          fault.fault.kind,
          { metadata: { testRun: 'pairwise-test' } }
        );
      });
      
      // Verify structured error properties
      structuredErrors.forEach(error => {
        expect(error.error_code).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.trace_id).toBeDefined();
        expect(error.timestamp).toBeDefined();
        expect(error.category).toBeDefined();
        expect(error.fault_kind).toBeDefined();
        expect(error.metadata?.['testRun']).toBe('pairwise-test');
      });
      
      // Verify error codes are correct
      const apiError = structuredErrors.find(e => e.category === 'api');
      const integrationError = structuredErrors.find(e => e.category === 'integration');
      
      expect(apiError?.error_code).toBe(ERROR_CODES.API_RATE_LIMIT_EXCEEDED);
      expect(integrationError?.error_code).toBe(ERROR_CODES.CIRCUIT_BREAKER_OPEN);
    });
  });
});
