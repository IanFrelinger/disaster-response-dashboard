/**
 * Playwright Test Setup with Fail-Fast Error Handling
 * 
 * This file configures Playwright to fail tests on any client-side errors,
 * unhandled rejections, or console errors.
 */

import { test as base, expect } from '@playwright/test';

// Extend the base test with fault injection and error handling
export const test = base.extend({
  // Enhanced page with error handling
  page: async ({ page }, use) => {
    // FAIL-FAST: Fail test on console errors
    page.on('console', (message) => {
      if (message.type() === 'error') {
        throw new Error(`Console error: ${message.text()}`);
      }
    });

    // FAIL-FAST: Fail test on page errors
    page.on('pageerror', (error) => {
      throw new Error(`Page error: ${error.message}`);
    });

    // FAIL-FAST: Fail test on unhandled rejections
    await page.addInitScript(() => {
      window.addEventListener('unhandledrejection', (event) => {
        throw new Error(`Unhandled promise rejection: ${event.reason}`);
      });

      // FAIL-FAST: Fail test on any uncaught errors
      window.addEventListener('error', (event) => {
        const error = (event as any).error || new Error(String((event as any).message));
        throw error;
      });

      // FAIL-FAST: Fail test on resource load failures
      window.addEventListener('error', (event) => {
        if (event.target && (event.target as any).tagName) {
          const target = event.target as HTMLElement;
          if (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
            throw new Error(`Resource load failed: ${target.tagName} - ${(event as any).message}`);
          }
        }
      }, true);
    });

    // FAIL-FAST: Fail test on request failures
    page.on('requestfailed', (request) => {
      // Don't fail on expected failures (like 404s for missing resources)
      if (request.resourceType() === 'image' || request.resourceType() === 'font') {
        return;
      }
      
      // Fail on critical resource failures
      if (request.resourceType() === 'script' || request.resourceType() === 'stylesheet') {
        throw new Error(`Critical resource failed to load: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`);
      }
    });

    await use(page);
  },

  // Enhanced context with offline simulation support
  context: async ({ context }, use) => {
    // Add fault injection script to context
    await context.addInitScript(() => {
      // Initialize fault injection if not already present
      if (!window.__testFaults__) {
        window.__testFaults__ = {
          config: {
            api: null,
            map: null,
            data: null,
            ui: null,
            env: null,
            perf: null,
            integration: null
          },
          setFault: (category: string, fault: any) => {
            if (window.__testFaults__) {
              (window.__testFaults__ as any).config[category] = fault;
            }
          },
          reset: () => {
            if (window.__testFaults__) {
              (window.__testFaults__ as any).config = {
                api: null,
                map: null,
                data: null,
                ui: null,
                env: null,
                perf: null,
                integration: null
              };
            }
          },
          getActiveFaults: () => {
            if (!window.__testFaults__) return [];
            const config = (window.__testFaults__ as any).config;
            return Object.entries(config)
              .filter(([_, fault]) => fault !== null)
              .map(([category, fault]) => ({ category, fault }));
          }
        };
      }
    });

    await use(context);
  }
});

// Export the enhanced test
export { expect };

// Fault injection utilities for Playwright tests
export const faultInjection = {
  // Set fault from Playwright test
  setFault: async (page: any, category: string, fault: any) => {
    await page.evaluate(({ category, fault }) => {
      if (window.__testFaults__) {
        (window.__testFaults__ as any).setFault(category, fault);
      }
    }, { category, fault });
  },

  // Reset all faults
  reset: async (page: any) => {
    await page.evaluate(() => {
      if (window.__testFaults__) {
        (window.__testFaults__ as any).reset();
      }
    });
  },

  // Get active faults
  getActiveFaults: async (page: any) => {
    return await page.evaluate(() => {
      if (window.__testFaults__) {
        return (window.__testFaults__ as any).getActiveFaults();
      }
      return [];
    });
  },

  // Check if specific fault is active
  hasFault: async (page: any, expectedFault: any) => {
    const activeFaults = await faultInjection.getActiveFaults(page);
    return activeFaults.some(({ fault }: any) => 
      fault.kind === expectedFault.kind && 
      (expectedFault.status ? fault.status === expectedFault.status : true)
    );
  }
};

// Network fault injection utilities
export const networkFaults = {
  // Inject HTTP error response
  injectHttpError: async (page: any, urlPattern: string, status: number, body?: string) => {
    await page.route(urlPattern, (route: any) => {
      route.fulfill({
        status,
        body: body || `Error ${status}`,
        contentType: 'text/plain'
      });
    });
  },

  // Inject timeout
  injectTimeout: async (page: any, urlPattern: string, delayMs: number = 30000) => {
    await page.route(urlPattern, (route: any) => {
      setTimeout(() => {
        route.fulfill({ status: 200, body: 'Delayed response' });
      }, delayMs);
    });
  },

  // Inject invalid JSON
  injectInvalidJson: async (page: any, urlPattern: string) => {
    await page.route(urlPattern, (route: any) => {
      route.fulfill({
        status: 200,
        body: '{"invalid": json, missing: quotes}',
        contentType: 'application/json'
      });
    });
  },

  // Inject CORS error
  injectCorsError: async (page: any, urlPattern: string) => {
    await page.route(urlPattern, (route: any) => {
      route.fulfill({
        status: 0,
        body: 'CORS error',
        headers: {
          'Access-Control-Allow-Origin': 'null'
        }
      });
    });
  },

  // Inject network error
  injectNetworkError: async (page: any, urlPattern: string) => {
    await page.route(urlPattern, (route: any) => {
      route.abort('failed');
    });
  }
};

// Performance fault injection utilities
export const performanceFaults = {
  // Simulate slow network
  injectSlowNetwork: async (page: any, delayMs: number = 1000) => {
    await page.route('**/*', (route: any) => {
      setTimeout(() => {
        route.continue();
      }, delayMs);
    });
  },

  // Simulate memory pressure
  injectMemoryPressure: async (page: any) => {
    await page.addInitScript(() => {
      // Simulate memory pressure by creating large objects
      const createMemoryPressure = () => {
        const largeArray = new Array(1000000).fill('memory pressure');
        setTimeout(() => {
          largeArray.length = 0;
        }, 100);
      };
      
      // Trigger memory pressure periodically
      setInterval(createMemoryPressure, 500);
    });
  },

  // Simulate CPU overload
  injectCpuOverload: async (page: any) => {
    await page.addInitScript(() => {
      // Simulate CPU overload with intensive computation
      const cpuIntensiveTask = () => {
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }
        return result;
      };
      
      // Run CPU-intensive task periodically
      setInterval(cpuIntensiveTask, 100);
    });
  }
};

// Data fault injection utilities
export const dataFaults = {
  // Inject invalid GeoJSON
  injectInvalidGeoJson: async (page: any, dataKey: string) => {
    await page.addInitScript((key) => {
      // Override any existing data with invalid GeoJSON
      if (window.__testFaults__?.config.data?.kind === 'geojson-invalid') {
        const invalidData = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[[0, 0], [1, 1], [0, 0]]] // Invalid: not closed
              },
              properties: {}
            }
          ]
        };
        
        // Store invalid data for components to access
        (window as any)[key] = invalidData;
      }
    }, dataKey);
  },

  // Inject extreme density data
  injectExtremeDensity: async (page: any, dataKey: string, featureCount: number = 10000) => {
    await page.addInitScript(({ key, count }) => {
      if (window.__testFaults__?.config.data?.kind === 'extreme-density') {
        const features = [];
        for (let i = 0; i < count; i++) {
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [Math.random() * 360 - 180, Math.random() * 180 - 90]
            },
            properties: { id: i, density: 'extreme' }
          });
        }
        
        const extremeData = {
          type: 'FeatureCollection',
          features
        };
        
        (window as any)[key] = extremeData;
      }
    }, { key: dataKey, count: featureCount });
  },

  // Inject empty dataset
  injectEmptyDataset: async (page: any, dataKey: string) => {
    await page.addInitScript((key) => {
      if (window.__testFaults__?.config.data?.kind === 'empty-dataset') {
        const emptyData = {
          type: 'FeatureCollection',
          features: []
        };
        
        (window as any)[key] = emptyData;
      }
    }, dataKey);
  }
};

// Export all utilities
export { test as baseTest };
