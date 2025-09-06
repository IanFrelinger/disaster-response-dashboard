/**
 * Fault Injection System for Testing
 * 
 * This module provides a controlled way to inject faults during testing
 * to ensure error handling paths are properly covered.
 */

import type { 
  FaultInjectionConfig, 
  FaultInjectionAPI,
  ApiFault,
  MapFault,
  DataFault,
  UiFault,
  EnvFault,
  PerfFault,
  IntegrationFault,
  AllFaults
} from './error-catalog';
import { DEFAULT_FAULT_CONFIG } from './error-catalog';

// Global fault injection state (only available during test builds)
let faultInjector: FaultInjector | null = null;

// Fault injection configuration
interface FaultInjectorConfig {
  api: ApiFault | null;
  map: MapFault | null;
  data: DataFault | null;
  ui: UiFault | null;
  env: EnvFault | null;
  perf: PerfFault | null;
  integration: IntegrationFault | null;
}

// Fault injector class
class FaultInjector implements FaultInjectionAPI {
  private _config: FaultInjectorConfig = { ...DEFAULT_FAULT_CONFIG };

  get config(): FaultInjectorConfig {
    return this._config;
  }

  setFault<K extends keyof FaultInjectorConfig>(
    category: K,
    fault: FaultInjectorConfig[K]
  ): void {
    this._config[category] = fault;
    console.log(`[FAULT-INJECTION] Set ${category} fault:`, fault);
  }

  reset(): void {
    this._config = { ...DEFAULT_FAULT_CONFIG };
    console.log('[FAULT-INJECTION] All faults reset');
  }

  getActiveFaults(): Array<{ category: keyof FaultInjectionConfig; fault: AllFaults }> {
    return Object.entries(this._config)
      .filter(([, fault]) => fault !== null)
      .map(([category, fault]) => ({ 
        category: category as keyof FaultInjectionConfig, 
        fault: fault as AllFaults 
      }));
  }

  // Convenience method for checking if any faults are active
  hasAnyFault(): boolean {
    return this.getActiveFaults().length > 0;
  }

  // API layer fault injection
  api = {
    shouldFail: () => this._config.api !== null,
    getFault: () => this._config.api,
    injectHttpError: (status: 400 | 401 | 403 | 404 | 408 | 409 | 429 | 500 | 502 | 503) => {
      this.setFault('api', { kind: 'http', status });
    },
    injectTimeout: () => {
      this.setFault('api', { kind: 'timeout' });
    },
    injectInvalidJson: () => {
      this.setFault('api', { kind: 'invalid-json' });
    },
    injectSchemaMismatch: () => {
      this.setFault('api', { kind: 'schema-mismatch' });
    },
    injectNetworkError: () => {
      this.setFault('api', { kind: 'network-error' });
    },
    injectCorsError: () => {
      this.setFault('api', { kind: 'cors-error' });
    },
    injectRateLimitExceeded: () => {
      this.setFault('api', { kind: 'rate-limit-exceeded' });
    },
    // Deprecated aliases - these call the new implementations
    /**
     * @deprecated Since v1.0.0 - Use injectRateLimitExceeded() instead.
     * This method will be removed in v2.0.0.
     * 
     * @example
     * // ❌ Deprecated usage
     * faultInjector.api.injectRateLimit();
     * 
     * // ✅ New usage
     * faultInjector.api.injectRateLimitExceeded();
     */
    injectRateLimit: () => {
      console.warn('[FAULT-INJECTION] injectRateLimit is deprecated. Use injectRateLimitExceeded instead.');
      this.api.injectRateLimitExceeded();
    },
    /**
     * @deprecated Since v1.0.0 - Use injectCircuitBreakerTrigger() instead.
     * This method will be removed in v2.0.0.
     * 
     * @example
     * // ❌ Deprecated usage
     * faultInjector.api.injectCircuitBreaker();
     * 
     * // ✅ New usage
     * faultInjector.integration.injectCircuitBreakerTrigger();
     */
    injectCircuitBreaker: () => {
      console.warn('[FAULT-INJECTION] injectCircuitBreaker is deprecated. Use injectCircuitBreakerTrigger instead.');
      this.integration.injectCircuitBreakerTrigger();
    }
  };

  // Map layer fault injection
  map = {
    shouldFail: () => this._config.map !== null,
    getFault: () => this._config.map,
    injectWebglUnavailable: () => { this.setFault('map', { kind: 'webgl-unavailable' }); },
    injectStyleLoadFail: () => { this.setFault('map', { kind: 'style-load-fail' }); },
    injectInvalidToken: () => { this.setFault('map', { kind: 'mapbox-token-invalid' }); },
    injectDuplicateLayerId: () => { this.setFault('map', { kind: 'duplicate-layer-id' }); },
    injectTileError: () => { this.setFault('map', { kind: 'tile-error' }); },
    injectMissingSprite: () => { this.setFault('map', { kind: 'missing-sprite' }); },
    injectFontLoadFail: () => { this.setFault('map', { kind: 'font-load-fail' }); },
    injectGeolocationError: () => { this.setFault('map', { kind: 'geolocation-error' }); },
    inject3DTerrainFail: () => { this.setFault('map', { kind: '3d-terrain-load-fail' }); },
    injectBuildingDataCorrupt: () => { this.setFault('map', { kind: 'building-data-corrupt' }); }
  };

  // Performance layer fault injection
  perf = {
    shouldFail: () => this._config.perf !== null,
    getFault: () => this._config.perf,
    injectMemorySpike: () => { this.setFault('perf', { kind: 'memory-spike' }); },
    injectNetworkLatency: () => { this.setFault('perf', { kind: 'network-latency' }); },
    injectFrameRateDrop: () => { this.setFault('perf', { kind: 'frame-rate-drop' }); },
    injectCpuOverload: () => { this.setFault('perf', { kind: 'cpu-overload' }); },
    injectRenderBlocking: () => { this.setFault('perf', { kind: 'render-blocking' }); },
    injectLargeBundle: () => { this.setFault('perf', { kind: 'large-bundle-size' }); },
  };

  // Data layer fault injection
  data = {
    shouldFail: () => this._config.data !== null,
    getFault: () => this._config.data,
    injectGeojsonInvalid: () => { this.setFault('data', { kind: 'geojson-invalid' }); },
    injectEmptyDataset: () => { this.setFault('data', { kind: 'empty-dataset' }); },
    injectTypeMismatch: () => { this.setFault('data', { kind: 'type-mismatch' }); },
    injectMissingRequiredProps: () => { this.setFault('data', { kind: 'missing-required-props' }); },
    injectExtremeDensity: () => { this.setFault('data', { kind: 'extreme-density' }); },
    injectMemoryOverflow: () => { this.setFault('data', { kind: 'memory-overflow' }); },
    injectCircularReference: () => { this.setFault('data', { kind: 'circular-reference' }); },
    injectMalformedFeature: () => { this.setFault('data', { kind: 'malformed-feature' }); },
    injectCoordsOutOfRange: () => { this.setFault('data', { kind: 'coords-out-of-range' }); },
  };

  // UI layer fault injection
  ui = {
    shouldFail: () => this._config.ui !== null,
    getFault: () => this._config.ui,
    injectUnhandledPromise: () => { this.setFault('ui', { kind: 'unhandled-promise' }); },
    injectErrorBoundary: () => { this.setFault('ui', { kind: 'error-boundary-trigger' }); },
    injectLazyChunkFail: () => { this.setFault('ui', { kind: 'lazy-chunk-load-fail' }); },
    injectI18nMissing: () => { this.setFault('ui', { kind: 'i18n-missing-key' }); },
    injectComponentRenderFail: () => { this.setFault('ui', { kind: 'component-render-fail' }); },
    injectStateCorruption: () => { this.setFault('ui', { kind: 'state-corruption' }); },
    injectEventListenerLeak: () => { this.setFault('ui', { kind: 'event-listener-leak' }); },
    injectMemoryLeak: () => { this.setFault('ui', { kind: 'memory-leak' }); },
    injectFocusTrapFail: () => { this.setFault('ui', { kind: 'focus-trap-fail' }); },
    injectAccessibilityViolation: () => { this.setFault('ui', { kind: 'accessibility-violation' }); },
    injectClickFailure: () => { this.setFault('ui', { kind: 'click-failure' }); },
    injectDragFailure: () => { this.setFault('ui', { kind: 'drag-failure' }); },
    injectKeyboardFailure: () => { this.setFault('ui', { kind: 'keyboard-failure' }); },
    injectFormSubmissionFailure: () => { this.setFault('ui', { kind: 'form-submission-failure' }); },
    injectNavigationFailure: () => { this.setFault('ui', { kind: 'navigation-failure' }); },
    injectRapidClickBurst: () => { this.setFault('ui', { kind: 'rapid-click-burst' }); },
    injectRapidHoverBurst: () => { this.setFault('ui', { kind: 'rapid-hover-burst' }); },
    injectClickOutsideMap: () => { this.setFault('ui', { kind: 'click-outside-map' }); },
  };

  // Environment layer fault injection
  env = {
    shouldFail: () => this._config.env !== null,
    getFault: () => this._config.env,
    injectMissingMapboxToken: () => {
      if (typeof process !== 'undefined' && process.env) {
        delete process.env['VITE_MAPBOX_TOKEN'];
      }
      this.setFault('env', { kind: 'missing-mapbox-token' });
    },
    injectInvalidApiEndpoint: () => {
      this.setFault('env', { kind: 'invalid-api-endpoint' });
    },
    injectSslCertificateError: () => {
      this.setFault('env', { kind: 'ssl-certificate-error' });
    },
    injectFeatureFlagMismatch: () => {
      this.setFault('env', { kind: 'feature-flag-mismatch' });
    },
    injectConfigFileCorrupt: () => {
      this.setFault('env', { kind: 'config-file-corrupt' });
    },
    injectEnvironmentVariableMissing: () => {
      if (typeof process !== 'undefined' && process.env) {
        delete process.env['VITE_API_BASE_URL'];
      }
      this.setFault('env', { kind: 'environment-variable-missing' });
    }
  };

  // Integration fault injection
  integration = {
    shouldFail: () => this._config.integration !== null,
    getFault: () => this._config.integration,
    injectServiceDiscoveryFail: () => {
      this.setFault('integration', { kind: 'service-discovery-fail' });
    },
    injectCircuitBreakerTrigger: () => {
      this.setFault('integration', { kind: 'circuit-breaker-trigger' });
    },
    injectFallbackServiceUnavailable: () => {
      this.setFault('integration', { kind: 'fallback-service-unavailable' });
    },
    injectDataSyncConflict: () => {
      this.setFault('integration', { kind: 'data-sync-conflict' });
    },
    injectVersionMismatch: () => {
      this.setFault('integration', { kind: 'version-mismatch' });
    },
    injectDependencyResolutionFail: () => {
      this.setFault('integration', { kind: 'dependency-resolution-fail' });
    }
  };
}

// Initialize fault injector only in test environment
if (typeof process !== 'undefined' && process.env && process.env['NODE_ENV'] === 'test') {
  faultInjector = new FaultInjector();
  
  // Expose fault injection API globally for tests
  if (typeof window !== 'undefined') {
    window.__testFaults__ = faultInjector;
  }
}

// Export the fault injection API
export const useFaultInjection: FaultInjectionAPI = faultInjector || {
  config: { ...DEFAULT_FAULT_CONFIG },
  setFault: () => {},
  reset: () => {},
  getActiveFaults: () => [],
  hasAnyFault: () => false,
  api: {
    shouldFail: () => false,
    getFault: () => null,
    injectHttpError: () => {},
    injectTimeout: () => {},
    injectInvalidJson: () => {},
    injectSchemaMismatch: () => {},
    injectNetworkError: () => {},
    injectCorsError: () => {},
    injectRateLimitExceeded: () => {},
    injectRateLimit: () => {},
    injectCircuitBreaker: () => {}
  },
  map: {
    shouldFail: () => false,
    getFault: () => null,
    injectWebglUnavailable: () => {},
    injectStyleLoadFail: () => {},
    injectInvalidToken: () => {},
    injectDuplicateLayerId: () => {},
    injectTileError: () => {},
    injectMissingSprite: () => {},
    injectFontLoadFail: () => {},
    injectGeolocationError: () => {},
    inject3DTerrainFail: () => {},
    injectBuildingDataCorrupt: () => {}
  },
  perf: {
    shouldFail: () => false,
    getFault: () => null,
    injectMemorySpike: () => {},
    injectNetworkLatency: () => {},
    injectFrameRateDrop: () => {},
    injectCpuOverload: () => {},
    injectRenderBlocking: () => {},
    injectLargeBundle: () => {}
  },
  data: {
    shouldFail: () => false,
    getFault: () => null,
    injectGeojsonInvalid: () => {},
    injectEmptyDataset: () => {},
    injectTypeMismatch: () => {},
    injectMissingRequiredProps: () => {},
    injectExtremeDensity: () => {},
    injectMemoryOverflow: () => {},
    injectCircularReference: () => {},
    injectMalformedFeature: () => {},
    injectCoordsOutOfRange: () => {}
  },
  ui: {
    shouldFail: () => false,
    getFault: () => null,
    injectUnhandledPromise: () => {},
    injectErrorBoundary: () => {},
    injectLazyChunkFail: () => {},
    injectI18nMissing: () => {},
    injectComponentRenderFail: () => {},
    injectStateCorruption: () => {},
    injectEventListenerLeak: () => {},
    injectMemoryLeak: () => {},
    injectFocusTrapFail: () => {},
    injectAccessibilityViolation: () => {},
    injectClickFailure: () => {},
    injectDragFailure: () => {},
    injectKeyboardFailure: () => {},
    injectFormSubmissionFailure: () => {},
    injectNavigationFailure: () => {},
    injectRapidClickBurst: () => {},
    injectRapidHoverBurst: () => {},
    injectClickOutsideMap: () => {}
  },
  env: {
    shouldFail: () => false,
    getFault: () => null,
    injectMissingMapboxToken: () => {},
    injectInvalidApiEndpoint: () => {},
    injectSslCertificateError: () => {},
    injectFeatureFlagMismatch: () => {},
    injectConfigFileCorrupt: () => {},
    injectEnvironmentVariableMissing: () => {}
  },
  integration: {
    shouldFail: () => false,
    getFault: () => null,
    injectServiceDiscoveryFail: () => {},
    injectCircuitBreakerTrigger: () => {},
    injectFallbackServiceUnavailable: () => {},
    injectDataSyncConflict: () => {},
    injectVersionMismatch: () => {},
    injectDependencyResolutionFail: () => {}
  }
};
