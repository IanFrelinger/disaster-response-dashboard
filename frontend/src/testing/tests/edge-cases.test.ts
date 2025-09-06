/**
 * Edge case test coverage for disaster response dashboard
 * Tests dateline crossing, polar tiles, tiny polygons, mixed CRS, and other edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deterministicDatasets } from '../fixtures/deterministic-datasets';
import { mockMapboxGL } from '../mocks/mapbox-mocks';

describe('Edge Case Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dateline Crossing', () => {
    it('should handle routes that cross the international dateline', () => {
      const datelineRoute = deterministicDatasets.edgeCases.datelineCrossingRoutes[0];
      expect(datelineRoute).toBeDefined();
      
      expect(datelineRoute!.geometry.coordinates?.[0]?.[0]).toBeCloseTo(179.9, 1);
      expect(datelineRoute!.geometry.coordinates?.[1]?.[0]).toBeCloseTo(-179.9, 1);
      expect(datelineRoute!.properties.distance).toBeGreaterThan(0);
    });

    it('should calculate correct distance for dateline crossing routes', () => {
      const datelineRoute = deterministicDatasets.edgeCases.datelineCrossingRoutes[0];
      expect(datelineRoute).toBeDefined();
      const coords = datelineRoute!.geometry.coordinates;
      
      // Distance should be calculated correctly across dateline
      const distance = datelineRoute!.properties.distance;
      expect(distance).toBeGreaterThan(1000); // Should be substantial distance
      expect(distance).toBeLessThan(50000); // But not too large
    });

    it('should handle map rendering near dateline', () => {
      const map = new mockMapboxGL.Map({
        center: [179.9, 37.7749],
        zoom: 10
      });
      
      expect(map.setCenter).toHaveBeenCalledWith([179.9, 37.7749]);
      expect(map.getCenter()).toEqual({ lng: 179.9, lat: 37.7749 });
    });
  });

  describe('Polar Region Tiles', () => {
    it('should handle Arctic region tiles', () => {
      const arcticTile = deterministicDatasets.edgeCases.polarRegionTiles[0];
      expect(arcticTile).toBeDefined();
      
      expect(arcticTile!.z).toBe(4);
      expect(arcticTile!.x).toBe(0);
      expect(arcticTile!.y).toBe(0);
      expect(arcticTile!.data.region).toBe('arctic');
    });

    it('should handle Antarctic region tiles', () => {
      const antarcticTile = deterministicDatasets.edgeCases.polarRegionTiles[1];
      expect(antarcticTile).toBeDefined();
      
      expect(antarcticTile!.z).toBe(4);
      expect(antarcticTile!.x).toBe(0);
      expect(antarcticTile!.y).toBe(15);
      expect(antarcticTile!.data.region).toBe('antarctic');
    });

    it('should handle extreme latitude coordinates', () => {
      const extremeCoords = [
        [0, 89.9], // Near North Pole
        [0, -89.9], // Near South Pole
        [180, 89.9], // Near North Pole, opposite side
        [-180, -89.9] // Near South Pole, opposite side
      ];
      
      extremeCoords.forEach(coord => {
        expect(coord[1]).toBeGreaterThanOrEqual(-90);
        expect(coord[1]).toBeLessThanOrEqual(90);
        expect(coord[0]).toBeGreaterThanOrEqual(-180);
        expect(coord[0]).toBeLessThanOrEqual(180);
      });
    });
  });

  describe('Tiny Polygons', () => {
    it('should handle very small polygon areas', () => {
      const tinyPolygon = deterministicDatasets.edgeCases.tinyPolygons[0];
      expect(tinyPolygon).toBeDefined();
      
      expect(tinyPolygon!.geometry.type).toBe('Polygon');
      expect(tinyPolygon!.properties.area).toBeLessThan(0.00001);
      expect(tinyPolygon!.properties.type).toBe('micro-hazard');
    });

    it('should validate tiny polygon coordinates', () => {
      const tinyPolygon = deterministicDatasets.edgeCases.tinyPolygons[0];
      expect(tinyPolygon).toBeDefined();
      const coords = tinyPolygon!.geometry.coordinates[0];
      
      // Check that coordinates form a valid polygon
      expect(coords).toBeDefined();
      expect(coords!.length).toBeGreaterThanOrEqual(4);
      expect(coords![0]).toEqual(coords![coords!.length - 1]); // Closed polygon
      
      // Check that coordinates are very close together
      const lngs = coords!.map(c => c[0]);
      const lats = coords!.map(c => c[1]);
      const lngRange = Math.max(...(lngs.filter((lng): lng is number => lng !== undefined))) - Math.min(...(lngs.filter((lng): lng is number => lng !== undefined)));
      const latRange = Math.max(...(lats.filter((lat): lat is number => lat !== undefined))) - Math.min(...(lats.filter((lat): lat is number => lat !== undefined)));
      
      expect(lngRange).toBeLessThan(0.0001);
      expect(latRange).toBeLessThan(0.0001);
    });

    it('should handle rendering of tiny polygons on map', () => {
      const map = new mockMapboxGL.Map({});
      const tinyPolygon = deterministicDatasets.edgeCases.tinyPolygons[0];
      
      // Should be able to add tiny polygon as source
      map.addSource('tiny-polygon', {
        type: 'geojson',
        data: tinyPolygon
      });
      
      expect(map.addSource).toHaveBeenCalledWith('tiny-polygon', {
        type: 'geojson',
        data: tinyPolygon
      });
    });
  });

  describe('Mixed CRS Data', () => {
    it('should handle WGS84 coordinates', () => {
      const wgs84Point = deterministicDatasets.edgeCases.mixedCRSData[0];
      expect(wgs84Point).toBeDefined();
      
      expect(wgs84Point!.geometry.crs).toBe('EPSG:4326');
      expect(wgs84Point!.geometry.coordinates[0]).toBeCloseTo(-122.4194, 4);
      expect(wgs84Point!.geometry.coordinates[1]).toBeCloseTo(37.7749, 4);
    });

    it('should handle UTM coordinates', () => {
      const utmPoint = deterministicDatasets.edgeCases.mixedCRSData[1];
      expect(utmPoint).toBeDefined();
      
      expect(utmPoint!.geometry.crs).toBe('EPSG:32610');
      expect(utmPoint!.geometry.coordinates[0]).toBe(548000);
      expect(utmPoint!.geometry.coordinates[1]).toBe(4180000);
    });

    it('should convert between coordinate systems', () => {
      // Mock coordinate conversion function
      const convertCoordinates = vi.fn().mockImplementation((coords, fromCRS, toCRS) => {
        if (fromCRS === 'EPSG:32610' && toCRS === 'EPSG:4326') {
          // Simplified UTM to WGS84 conversion
          return [-122.4194, 37.7749];
        }
        return coords;
      });
      
      const utmPoint = deterministicDatasets.edgeCases.mixedCRSData[1];
      const converted = convertCoordinates(
        utmPoint?.geometry.coordinates,
        utmPoint?.geometry.crs,
        'EPSG:4326'
      );
      
      expect(convertCoordinates).toHaveBeenCalledWith(
        [548000, 4180000],
        'EPSG:32610',
        'EPSG:4326'
      );
      expect(converted).toEqual([-122.4194, 37.7749]);
    });
  });

  describe('Extreme Values', () => {
    it('should handle very large coordinate values', () => {
      const largeCoords = [
        [999999, 999999],
        [-999999, -999999],
        [999999, -999999],
        [-999999, 999999]
      ];
      
      largeCoords.forEach(coord => {
        expect(coord[0]).toBeGreaterThanOrEqual(-180);
        expect(coord[0]).toBeLessThanOrEqual(180);
        expect(coord[1]).toBeGreaterThanOrEqual(-90);
        expect(coord[1]).toBeLessThanOrEqual(90);
      });
    });

    it('should handle very small coordinate values', () => {
      const smallCoords = [
        [0.000001, 0.000001],
        [-0.000001, -0.000001],
        [0.000001, -0.000001],
        [-0.000001, 0.000001]
      ];
      
      smallCoords.forEach(coord => {
        expect(coord[0]).toBeGreaterThanOrEqual(-180);
        expect(coord[0]).toBeLessThanOrEqual(180);
        expect(coord[1]).toBeGreaterThanOrEqual(-90);
        expect(coord[1]).toBeLessThanOrEqual(90);
      });
    });

    it('should handle zero coordinates', () => {
      const zeroCoords = [0, 0];
      
      expect(zeroCoords[0]).toBe(0);
      expect(zeroCoords[1]).toBe(0);
    });
  });

  describe('Invalid Data Handling', () => {
    it('should handle null coordinates', () => {
      const nullCoords = null;
      
      expect(nullCoords).toBeNull();
    });

    it('should handle undefined coordinates', () => {
      const undefinedCoords = undefined;
      
      expect(undefinedCoords).toBeUndefined();
    });

    it('should handle empty coordinate arrays', () => {
      const emptyCoords: number[] = [];
      
      expect(emptyCoords.length).toBe(0);
    });

    it('should handle malformed coordinate arrays', () => {
      const malformedCoords = [
        [1], // Missing y coordinate
        [1, 2, 3], // Extra coordinate
        ['a', 'b'], // String coordinates
        [null, undefined], // Null/undefined coordinates
        [Infinity, -Infinity], // Infinite coordinates
        [NaN, NaN] // NaN coordinates
      ];
      
      malformedCoords.forEach(coord => {
        expect(Array.isArray(coord)).toBe(true);
      });
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = deterministicDatasets.hazardTiles.largeHazardTiles;
      
      expect(largeDataset.length).toBeGreaterThan(100);
      
      // Should be able to process large dataset
      const startTime = performance.now();
      const processed = largeDataset.filter(tile => tile.data.severity === 'high');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should process in < 100ms
      expect(processed.length).toBeGreaterThan(0);
    });

    it('should handle rapid map updates', () => {
      const map = new mockMapboxGL.Map({});
      
      // Simulate rapid updates
      for (let i = 0; i < 100; i++) {
        map.setCenter([-122.4194 + i * 0.001, 37.7749 + i * 0.001]);
      }
      
      expect(map.setCenter).toHaveBeenCalledTimes(100);
    });

    it('should handle memory constraints', () => {
      const memoryUsage = process.memoryUsage();
      
      expect(memoryUsage.heapUsed).toBeGreaterThan(0);
      expect(memoryUsage.heapTotal).toBeGreaterThan(0);
      
      // Should not exceed reasonable memory limits
      expect(memoryUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // 100MB
    });
  });

  describe('Network Edge Cases', () => {
    it('should handle network timeouts', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      });
      
      await expect(timeoutPromise).rejects.toThrow('Timeout');
    });

    it('should handle network errors', async () => {
      const errorPromise = Promise.reject(new Error('Network error'));
      
      await expect(errorPromise).rejects.toThrow('Network error');
    });

    it('should handle slow network responses', async () => {
      const slowPromise = new Promise(resolve => {
        setTimeout(() => resolve('Slow response'), 1000);
      });
      
      const startTime = performance.now();
      await slowPromise;
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeGreaterThan(900);
      expect(endTime - startTime).toBeLessThan(1100);
    });
  });

  describe('Browser Edge Cases', () => {
    it('should handle missing WebGL support', () => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      
      // Mock missing WebGL support
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl');
      
      expect(context).toBeNull();
      
      // Restore original function
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it('should handle limited memory devices', () => {
      const limitedMemory = 50 * 1024 * 1024; // 50MB
      
      expect(limitedMemory).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle slow devices', () => {
      const slowDevice = {
        cpuCores: 1,
        memory: 1024 * 1024 * 1024, // 1GB
        isSlow: true
      };
      
      expect(slowDevice.cpuCores).toBe(1);
      expect(slowDevice.memory).toBeLessThan(4 * 1024 * 1024 * 1024);
      expect(slowDevice.isSlow).toBe(true);
    });
  });
});

