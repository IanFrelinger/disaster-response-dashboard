import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MapProvider } from '../../services/map-provider';
import { useFaultInjection } from '../fault-injection';

// Mock the environment config module
vi.mock('../../config/environment', () => ({
  environmentConfig: {
    get: () => ({
      VITE_MAPBOX_TOKEN: 'test-token',
      VITE_MAPBOX_STYLE_URL: 'mapbox://styles/mapbox/streets-v11',
    }),
  },
}));

describe('Map Provider - WebGL Unavailable', () => {
  beforeEach(() => {
    // Reset fault injection
    useFaultInjection.reset();
    
    // Mock DOM environment
    const mockContainer = document.createElement('div');
    mockContainer.id = 'map-container';
    document.body.appendChild(mockContainer);
  });

  afterEach(() => {
    // Clean up
    const container = document.getElementById('map-container');
    if (container) {
      document.body.removeChild(container);
    }
  });

  test('should throw error when WebGL is unavailable', async () => {
    // Inject WebGL unavailable fault
    useFaultInjection.map.injectWebglUnavailable();
    
    const mapProvider = new MapProvider({
      token: 'test-token',
      container: 'map-container',
    });
    
    // Attempt to initialize map
    await expect(mapProvider.initialize()).rejects.toThrow('WebGL is not available');
  });

  test('should emit error event when WebGL is unavailable', async () => {
    // Inject WebGL unavailable fault
    useFaultInjection.map.injectWebglUnavailable();
    
    const mapProvider = new MapProvider({
      token: 'test-token',
      container: 'map-container',
    });
    
    let errorEvent: any = null;
    mapProvider.on('error', (event) => {
      errorEvent = event;
    });
    
    try {
      await mapProvider.initialize();
    } catch (error) {
      // Error should be emitted
      expect(errorEvent).toBeTruthy();
      expect(errorEvent.error.message).toBe('WebGL is not available');
      expect(errorEvent.operation).toBe('initialize');
    }
  });

  test('should not initialize map when WebGL is unavailable', async () => {
    // Inject WebGL unavailable fault
    useFaultInjection.map.injectWebglUnavailable();
    
    const mapProvider = new MapProvider({
      token: 'test-token',
      container: 'map-container',
    });
    
    try {
      await mapProvider.initialize();
    } catch (error) {
      // Map should not be initialized
      expect(mapProvider.getMapInstance()).toBeUndefined();
      expect(mapProvider.getLayerCount()).toBe(0);
    }
  });

  test('should reset fault injection correctly', () => {
    // Inject fault
    useFaultInjection.map.injectWebglUnavailable();
    
    // Verify fault is active
    expect(useFaultInjection.map.shouldFail()).toBe(true);
    
    // Reset
    useFaultInjection.reset();
    
    // Verify fault is cleared
    expect(useFaultInjection.map.shouldFail()).toBe(false);
  });

  test('should handle fault replacement correctly', () => {
    // Inject first fault
    useFaultInjection.map.injectWebglUnavailable();
    
    // Verify first fault is active
    expect(useFaultInjection.map.shouldFail()).toBe(true);
    let fault = useFaultInjection.map.getFault();
    expect(fault).toEqual({ kind: 'webgl-unavailable' });
    
    // Replace with second fault
    useFaultInjection.map.injectStyleLoadFail();
    
    // Verify second fault replaced first
    expect(useFaultInjection.map.shouldFail()).toBe(true);
    fault = useFaultInjection.map.getFault();
    expect(fault).toEqual({ kind: 'style-load-fail' });
    
    // Verify only one fault is active
    expect(useFaultInjection.getActiveFaults().length).toBe(1);
  });
});
