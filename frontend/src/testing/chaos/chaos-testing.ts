/**
 * Chaos testing scenarios for disaster response dashboard
 * Tests system resilience under various failure conditions
 */

import { vi } from 'vitest';

interface ChaosScenario {
  name: string;
  description: string;
  probability: number; // 0-1, probability of triggering
  duration: number; // milliseconds
  setup: () => void;
  teardown: () => void;
}

class ChaosTestingEngine {
  private scenarios: ChaosScenario[] = [];
  private activeScenarios: Set<string> = new Set();
  private isEnabled = false;

  constructor() {
    this.initializeScenarios();
  }

  private initializeScenarios(): void {
    this.scenarios = [
      // Network chaos scenarios
      {
        name: 'network-latency',
        description: 'Introduce random network latency',
        probability: 0.1,
        duration: 5000,
        setup: () => this.injectNetworkLatency(),
        teardown: () => this.restoreNetworkLatency()
      },
      {
        name: 'network-timeout',
        description: 'Simulate network timeouts',
        probability: 0.05,
        duration: 3000,
        setup: () => this.injectNetworkTimeouts(),
        teardown: () => this.restoreNetworkTimeouts()
      },
      {
        name: 'network-errors',
        description: 'Simulate network errors (5xx)',
        probability: 0.08,
        duration: 4000,
        setup: () => this.injectNetworkErrors(),
        teardown: () => this.restoreNetworkErrors()
      },
      {
        name: 'cors-errors',
        description: 'Simulate CORS errors',
        probability: 0.03,
        duration: 2000,
        setup: () => this.injectCorsErrors(),
        teardown: () => this.restoreCorsErrors()
      },

      // Map chaos scenarios
      {
        name: 'tile-404',
        description: 'Simulate tile 404 errors',
        probability: 0.1,
        duration: 6000,
        setup: () => this.injectTile404Errors(),
        teardown: () => this.restoreTile404Errors()
      },
      {
        name: 'mapbox-token-invalid',
        description: 'Simulate invalid Mapbox token',
        probability: 0.02,
        duration: 2000,
        setup: () => this.injectInvalidToken(),
        teardown: () => this.restoreValidToken()
      },
      {
        name: 'webgl-unavailable',
        description: 'Simulate WebGL unavailable',
        probability: 0.05,
        duration: 3000,
        setup: () => this.injectWebGLUnavailable(),
        teardown: () => this.restoreWebGL()
      },
      {
        name: 'map-style-load-fail',
        description: 'Simulate map style load failure',
        probability: 0.07,
        duration: 4000,
        setup: () => this.injectStyleLoadFailure(),
        teardown: () => this.restoreStyleLoading()
      },

      // Performance chaos scenarios
      {
        name: 'memory-spike',
        description: 'Simulate memory spike',
        probability: 0.1,
        duration: 5000,
        setup: () => this.injectMemorySpike(),
        teardown: () => this.restoreMemory()
      },
      {
        name: 'cpu-overload',
        description: 'Simulate CPU overload',
        probability: 0.08,
        duration: 4000,
        setup: () => this.injectCpuOverload(),
        teardown: () => this.restoreCpu()
      },
      {
        name: 'frame-rate-drop',
        description: 'Simulate frame rate drop',
        probability: 0.12,
        duration: 6000,
        setup: () => this.injectFrameRateDrop(),
        teardown: () => this.restoreFrameRate()
      },

      // Data chaos scenarios
      {
        name: 'invalid-geojson',
        description: 'Simulate invalid GeoJSON data',
        probability: 0.06,
        duration: 3000,
        setup: () => this.injectInvalidGeoJSON(),
        teardown: () => this.restoreValidGeoJSON()
      },
      {
        name: 'malformed-api-response',
        description: 'Simulate malformed API responses',
        probability: 0.04,
        duration: 2000,
        setup: () => this.injectMalformedResponses(),
        teardown: () => this.restoreValidResponses()
      },
      {
        name: 'data-corruption',
        description: 'Simulate data corruption',
        probability: 0.05,
        duration: 4000,
        setup: () => this.injectDataCorruption(),
        teardown: () => this.restoreDataIntegrity()
      },

      // Browser chaos scenarios
      {
        name: 'local-storage-full',
        description: 'Simulate full localStorage',
        probability: 0.03,
        duration: 2000,
        setup: () => this.injectLocalStorageFull(),
        teardown: () => this.restoreLocalStorage()
      },
      {
        name: 'cookies-disabled',
        description: 'Simulate disabled cookies',
        probability: 0.02,
        duration: 1000,
        setup: () => this.injectCookiesDisabled(),
        teardown: () => this.restoreCookies()
      },
      {
        name: 'javascript-disabled',
        description: 'Simulate disabled JavaScript features',
        probability: 0.01,
        duration: 1000,
        setup: () => this.injectJavaScriptDisabled(),
        teardown: () => this.restoreJavaScript()
      }
    ];
  }

  public enable(): void {
    this.isEnabled = true;
    this.startChaosLoop();
  }

  public disable(): void {
    this.isEnabled = false;
    this.stopAllScenarios();
  }

  public triggerScenario(name: string): void {
    const scenario = this.scenarios.find(s => s.name === name);
    if (scenario) {
      this.executeScenario(scenario);
    }
  }

  public getActiveScenarios(): string[] {
    return Array.from(this.activeScenarios);
  }

  public getAvailableScenarios(): ChaosScenario[] {
    return this.scenarios;
  }

  private startChaosLoop(): void {
    if (!this.isEnabled) return;

    // Check for random scenario triggers
    this.scenarios.forEach(scenario => {
      if (Math.random() < scenario.probability && !this.activeScenarios.has(scenario.name)) {
        this.executeScenario(scenario);
      }
    });

    // Continue the loop
    setTimeout(() => this.startChaosLoop(), 1000);
  }

  private executeScenario(scenario: ChaosScenario): void {
    this.activeScenarios.add(scenario.name);
    scenario.setup();

    // Auto-teardown after duration
    setTimeout(() => {
      this.stopScenario(scenario.name);
    }, scenario.duration);
  }

  private stopScenario(name: string): void {
    const scenario = this.scenarios.find(s => s.name === name);
    if (scenario && this.activeScenarios.has(name)) {
      scenario.teardown();
      this.activeScenarios.delete(name);
    }
  }

  private stopAllScenarios(): void {
    this.activeScenarios.forEach(name => {
      this.stopScenario(name);
    });
  }

  // Network chaos implementations
  private injectNetworkLatency(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const delay = Math.random() * 2000 + 500; // 500-2500ms delay
      await new Promise(resolve => setTimeout(resolve, delay));
      return originalFetch(...args);
    };
  }

  private restoreNetworkLatency(): void {
    // Restore original fetch
    window.fetch = window.fetch;
  }

  private injectNetworkTimeouts(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const shouldTimeout = Math.random() < 0.3; // 30% chance of timeout
      if (shouldTimeout) {
        throw new Error('Network timeout');
      }
      return originalFetch(...args);
    };
  }

  private restoreNetworkTimeouts(): void {
    window.fetch = window.fetch;
  }

  private injectNetworkErrors(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const shouldError = Math.random() < 0.2; // 20% chance of error
      if (shouldError) {
        return new Response(null, { status: 500, statusText: 'Internal Server Error' });
      }
      return originalFetch(...args);
    };
  }

  private restoreNetworkErrors(): void {
    window.fetch = window.fetch;
  }

  private injectCorsErrors(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const shouldCorsError = Math.random() < 0.1; // 10% chance of CORS error
      if (shouldCorsError) {
        throw new Error('CORS error: Access denied');
      }
      return originalFetch(...args);
    };
  }

  private restoreCorsErrors(): void {
    window.fetch = window.fetch;
  }

  // Map chaos implementations
  private injectTile404Errors(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      if (url.includes('tiles') && Math.random() < 0.3) {
        return new Response(null, { status: 404, statusText: 'Not Found' });
      }
      return originalFetch(...args);
    };
  }

  private restoreTile404Errors(): void {
    window.fetch = window.fetch;
  }

  private injectInvalidToken(): void {
    // Mock invalid token error
    vi.stubGlobal('__MAPBOX_TOKEN_INVALID__', true);
  }

  private restoreValidToken(): void {
    vi.unstubAllGlobals();
  }

  private injectWebGLUnavailable(): void {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
  }

  private restoreWebGL(): void {
    HTMLCanvasElement.prototype.getContext = HTMLCanvasElement.prototype.getContext;
  }

  private injectStyleLoadFailure(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      if (url.includes('styles') && Math.random() < 0.4) {
        return new Response(null, { status: 500, statusText: 'Style Load Failed' });
      }
      return originalFetch(...args);
    };
  }

  private restoreStyleLoading(): void {
    window.fetch = window.fetch;
  }

  // Performance chaos implementations
  private injectMemorySpike(): void {
    // Create memory pressure
    const memoryHog = [];
    for (let i = 0; i < 1000000; i++) {
      memoryHog.push(new Array(1000).fill(Math.random()));
    }
    
    // Store reference to prevent garbage collection
    (window as any).__memoryHog__ = memoryHog;
  }

  private restoreMemory(): void {
    delete (window as any).__memoryHog__;
  }

  private injectCpuOverload(): void {
    // Create CPU intensive task
    const cpuHog = setInterval(() => {
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i);
      }
    }, 100);
    
    (window as any).__cpuHog__ = cpuHog;
  }

  private restoreCpu(): void {
    const cpuHog = (window as any).__cpuHog__;
    if (cpuHog) {
      clearInterval(cpuHog);
      delete (window as any).__cpuHog__;
    }
  }

  private injectFrameRateDrop(): void {
    // Throttle requestAnimationFrame
    const originalRAF = window.requestAnimationFrame;
    let frameCount = 0;
    
    window.requestAnimationFrame = (callback) => {
      frameCount++;
      if (frameCount % 3 === 0) { // Drop every 3rd frame
        return originalRAF(callback);
      }
      return 0;
    };
  }

  private restoreFrameRate(): void {
    window.requestAnimationFrame = window.requestAnimationFrame;
  }

  // Data chaos implementations
  private injectInvalidGeoJSON(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      if (url.includes('geojson') && Math.random() < 0.2) {
        return new Response('{"invalid": "geojson"}', {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return originalFetch(...args);
    };
  }

  private restoreValidGeoJSON(): void {
    window.fetch = window.fetch;
  }

  private injectMalformedResponses(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const shouldMalform = Math.random() < 0.15; // 15% chance
      if (shouldMalform) {
        return new Response('{"incomplete": json', {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return originalFetch(...args);
    };
  }

  private restoreValidResponses(): void {
    window.fetch = window.fetch;
  }

  private injectDataCorruption(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (Math.random() < 0.1) { // 10% chance
        const text = await response.text();
        const corrupted = text.replace(/[0-9]/g, 'X'); // Replace numbers with X
        return new Response(corrupted, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
      return response;
    };
  }

  private restoreDataIntegrity(): void {
    window.fetch = window.fetch;
  }

  // Browser chaos implementations
  private injectLocalStorageFull(): void {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (Math.random() < 0.5) { // 50% chance of failure
        throw new Error('QuotaExceededError: Local storage is full');
      }
      return originalSetItem.call(localStorage, key, value);
    };
  }

  private restoreLocalStorage(): void {
    localStorage.setItem = localStorage.setItem;
  }

  private injectCookiesDisabled(): void {
    Object.defineProperty(document, 'cookie', {
      get: () => '',
      set: () => {},
      configurable: true
    });
  }

  private restoreCookies(): void {
    Object.defineProperty(document, 'cookie', {
      get: () => document.cookie,
      set: (value) => { document.cookie = value; },
      configurable: true
    });
  }

  private injectJavaScriptDisabled(): void {
    // Disable some JavaScript features
    (window as any).requestAnimationFrame = undefined;
    (window as any).setTimeout = undefined;
    (window as any).setInterval = undefined;
  }

  private restoreJavaScript(): void {
    // Restore JavaScript features
    (window as any).requestAnimationFrame = window.requestAnimationFrame;
    (window as any).setTimeout = window.setTimeout;
    (window as any).setInterval = window.setInterval;
  }
}

// Global chaos testing engine
export const chaosEngine = new ChaosTestingEngine();

// Export types and engine
export type { ChaosScenario };
export { ChaosTestingEngine };

