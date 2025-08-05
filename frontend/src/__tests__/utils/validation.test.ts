/**
 * Tests for utility functions and validation
 */

import { describe, it, expect, vi } from 'vitest';

// Mock utility functions
const validationUtils = {
  // Coordinate validation
  isValidLatitude(lat: number): boolean {
    return typeof lat === 'number' && lat >= -90 && lat <= 90;
  },

  isValidLongitude(lng: number): boolean {
    return typeof lng === 'number' && lng >= -180 && lng <= 180;
  },

  isValidCoordinate(lat: number, lng: number): boolean {
    return this.isValidLatitude(lat) && this.isValidLongitude(lng);
  },

  // Risk level validation
  isValidRiskLevel(level: string): boolean {
    const validLevels = ['low', 'medium', 'high', 'critical'];
    return validLevels.includes(level);
  },

  // Data source validation
  isValidDataSource(source: string): boolean {
    const validSources = ['FIRMS', 'NOAA', 'USGS'];
    return validSources.includes(source);
  },

  // Geometry validation
  isValidPolygon(coordinates: number[][][]): boolean {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return false;
    }

    const polygon = coordinates[0];
    if (!Array.isArray(polygon) || polygon.length < 3) {
      return false;
    }

    // Check if first and last points are the same (closed polygon)
    const first = polygon[0];
    const last = polygon[polygon.length - 1];
    return first[0] === last[0] && first[1] === last[1];
  },

  isValidLineString(coordinates: number[][]): boolean {
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return false;
    }

    return coordinates.every(coord => 
      Array.isArray(coord) && coord.length === 2 && 
      this.isValidCoordinate(coord[1], coord[0])
    );
  },

  // Date validation
  isValidDate(date: any): boolean {
    if (!date) return false;
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  },

  // Number validation
  isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },

  // String validation
  isValidString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  },

  // Array validation
  isValidArray(value: any): boolean {
    return Array.isArray(value) && value.length > 0;
  },

  // Object validation
  isValidObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  },

  // Distance calculation (Haversine formula)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  // Risk score normalization
  normalizeRiskScore(score: number): number {
    if (!this.isValidNumber(score)) return 0;
    return Math.max(0, Math.min(1, score));
  },

  // Time utilities
  isRecentDate(date: Date, hours: number = 24): boolean {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= hours;
  },

  formatDate(date: Date): string {
    return date.toISOString();
  },

  // Color utilities for risk levels
  getRiskLevelColor(level: string): string {
    const colors = {
      low: '#ffff00',      // Yellow
      medium: '#ffa500',   // Orange
      high: '#ff4500',     // Red-orange
      critical: '#ff0000', // Red
    };
    return colors[level as keyof typeof colors] || '#808080'; // Default gray
  },

  // Data transformation utilities
  transformCoordinates(lat: number, lng: number): [number, number] {
    return [lng, lat]; // GeoJSON format
  },

  // Validation for complete hazard zone object
  isValidHazardZone(hazard: any): boolean {
    return (
      this.isValidString(hazard.id) &&
      this.isValidObject(hazard.geometry) &&
      this.isValidPolygon(hazard.geometry.coordinates) &&
      this.isValidRiskLevel(hazard.riskLevel) &&
      this.isValidDataSource(hazard.dataSource) &&
      this.isValidNumber(hazard.riskScore) &&
      this.isValidDate(hazard.lastUpdated)
    );
  },

  // Validation for complete safe route object
  isValidSafeRoute(route: any): boolean {
    return (
      this.isValidString(route.id) &&
      this.isValidArray(route.origin) &&
      this.isValidArray(route.destination) &&
      this.isValidCoordinate(route.origin[0], route.origin[1]) &&
      this.isValidCoordinate(route.destination[0], route.destination[1]) &&
      this.isValidObject(route.route) &&
      this.isValidLineString(route.route.coordinates) &&
      typeof route.hazardAvoided === 'boolean'
    );
  },
};

describe('Validation Utils', () => {
  describe('Coordinate Validation', () => {
    it('validates valid latitude values', () => {
      expect(validationUtils.isValidLatitude(0)).toBe(true);
      expect(validationUtils.isValidLatitude(90)).toBe(true);
      expect(validationUtils.isValidLatitude(-90)).toBe(true);
      expect(validationUtils.isValidLatitude(45.5)).toBe(true);
    });

    it('rejects invalid latitude values', () => {
      expect(validationUtils.isValidLatitude(91)).toBe(false);
      expect(validationUtils.isValidLatitude(-91)).toBe(false);
      expect(validationUtils.isValidLatitude(180)).toBe(false);
      expect(validationUtils.isValidLatitude(NaN)).toBe(false);
      expect(validationUtils.isValidLatitude(Infinity)).toBe(false);
      expect(validationUtils.isValidLatitude('45')).toBe(false);
    });

    it('validates valid longitude values', () => {
      expect(validationUtils.isValidLongitude(0)).toBe(true);
      expect(validationUtils.isValidLongitude(180)).toBe(true);
      expect(validationUtils.isValidLongitude(-180)).toBe(true);
      expect(validationUtils.isValidLongitude(45.5)).toBe(true);
    });

    it('rejects invalid longitude values', () => {
      expect(validationUtils.isValidLongitude(181)).toBe(false);
      expect(validationUtils.isValidLongitude(-181)).toBe(false);
      expect(validationUtils.isValidLongitude(360)).toBe(false);
      expect(validationUtils.isValidLongitude(NaN)).toBe(false);
      expect(validationUtils.isValidLongitude(Infinity)).toBe(false);
      expect(validationUtils.isValidLongitude('45')).toBe(false);
    });

    it('validates valid coordinate pairs', () => {
      expect(validationUtils.isValidCoordinate(0, 0)).toBe(true);
      expect(validationUtils.isValidCoordinate(90, 180)).toBe(true);
      expect(validationUtils.isValidCoordinate(-90, -180)).toBe(true);
      expect(validationUtils.isValidCoordinate(45.5, -122.4)).toBe(true);
    });

    it('rejects invalid coordinate pairs', () => {
      expect(validationUtils.isValidCoordinate(91, 0)).toBe(false);
      expect(validationUtils.isValidCoordinate(0, 181)).toBe(false);
      expect(validationUtils.isValidCoordinate(91, 181)).toBe(false);
      expect(validationUtils.isValidCoordinate(NaN, 0)).toBe(false);
      expect(validationUtils.isValidCoordinate(0, NaN)).toBe(false);
    });
  });

  describe('Risk Level Validation', () => {
    it('validates valid risk levels', () => {
      expect(validationUtils.isValidRiskLevel('low')).toBe(true);
      expect(validationUtils.isValidRiskLevel('medium')).toBe(true);
      expect(validationUtils.isValidRiskLevel('high')).toBe(true);
      expect(validationUtils.isValidRiskLevel('critical')).toBe(true);
    });

    it('rejects invalid risk levels', () => {
      expect(validationUtils.isValidRiskLevel('very-low')).toBe(false);
      expect(validationUtils.isValidRiskLevel('extreme')).toBe(false);
      expect(validationUtils.isValidRiskLevel('')).toBe(false);
      expect(validationUtils.isValidRiskLevel('LOW')).toBe(false);
      expect(validationUtils.isValidRiskLevel(123)).toBe(false);
    });
  });

  describe('Data Source Validation', () => {
    it('validates valid data sources', () => {
      expect(validationUtils.isValidDataSource('FIRMS')).toBe(true);
      expect(validationUtils.isValidDataSource('NOAA')).toBe(true);
      expect(validationUtils.isValidDataSource('USGS')).toBe(true);
    });

    it('rejects invalid data sources', () => {
      expect(validationUtils.isValidDataSource('NASA')).toBe(false);
      expect(validationUtils.isValidDataSource('firms')).toBe(false);
      expect(validationUtils.isValidDataSource('')).toBe(false);
      expect(validationUtils.isValidDataSource(123)).toBe(false);
    });
  });

  describe('Geometry Validation', () => {
    it('validates valid polygons', () => {
      const validPolygon = [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]];
      expect(validationUtils.isValidPolygon(validPolygon)).toBe(true);
    });

    it('rejects invalid polygons', () => {
      expect(validationUtils.isValidPolygon([])).toBe(false);
      expect(validationUtils.isValidPolygon([[0, 0], [1, 0]])).toBe(false); // Not closed
      expect(validationUtils.isValidPolygon([[0, 0], [1, 0], [1, 1]])).toBe(false); // Not closed
      expect(validationUtils.isValidPolygon('not an array')).toBe(false);
    });

    it('validates valid line strings', () => {
      const validLineString = [[0, 0], [1, 1], [2, 2]];
      expect(validationUtils.isValidLineString(validLineString)).toBe(true);
    });

    it('rejects invalid line strings', () => {
      expect(validationUtils.isValidLineString([])).toBe(false);
      expect(validationUtils.isValidLineString([[0, 0]])).toBe(false); // Single point
      expect(validationUtils.isValidLineString([[0, 0], [91, 0]])).toBe(false); // Invalid coord
      expect(validationUtils.isValidLineString('not an array')).toBe(false);
    });
  });

  describe('Date Validation', () => {
    it('validates valid dates', () => {
      expect(validationUtils.isValidDate(new Date())).toBe(true);
      expect(validationUtils.isValidDate('2024-01-01')).toBe(true);
      expect(validationUtils.isValidDate('2024-01-01T12:00:00Z')).toBe(true);
    });

    it('rejects invalid dates', () => {
      expect(validationUtils.isValidDate('invalid date')).toBe(false);
      expect(validationUtils.isValidDate('')).toBe(false);
      expect(validationUtils.isValidDate(null)).toBe(false);
      expect(validationUtils.isValidDate(undefined)).toBe(false);
      expect(validationUtils.isValidDate(NaN)).toBe(false);
    });
  });

  describe('Number Validation', () => {
    it('validates valid numbers', () => {
      expect(validationUtils.isValidNumber(0)).toBe(true);
      expect(validationUtils.isValidNumber(123.45)).toBe(true);
      expect(validationUtils.isValidNumber(-123)).toBe(true);
    });

    it('rejects invalid numbers', () => {
      expect(validationUtils.isValidNumber(NaN)).toBe(false);
      expect(validationUtils.isValidNumber(Infinity)).toBe(false);
      expect(validationUtils.isValidNumber(-Infinity)).toBe(false);
      expect(validationUtils.isValidNumber('123')).toBe(false);
      expect(validationUtils.isValidNumber(null)).toBe(false);
    });
  });

  describe('String Validation', () => {
    it('validates valid strings', () => {
      expect(validationUtils.isValidString('hello')).toBe(true);
      expect(validationUtils.isValidString('  hello  ')).toBe(true);
    });

    it('rejects invalid strings', () => {
      expect(validationUtils.isValidString('')).toBe(false);
      expect(validationUtils.isValidString('   ')).toBe(false);
      expect(validationUtils.isValidString(123)).toBe(false);
      expect(validationUtils.isValidString(null)).toBe(false);
      expect(validationUtils.isValidString(undefined)).toBe(false);
    });
  });

  describe('Array Validation', () => {
    it('validates valid arrays', () => {
      expect(validationUtils.isValidArray([1, 2, 3])).toBe(true);
      expect(validationUtils.isValidArray(['a', 'b'])).toBe(true);
    });

    it('rejects invalid arrays', () => {
      expect(validationUtils.isValidArray([])).toBe(false);
      expect(validationUtils.isValidArray('not an array')).toBe(false);
      expect(validationUtils.isValidArray(null)).toBe(false);
      expect(validationUtils.isValidArray(undefined)).toBe(false);
    });
  });

  describe('Object Validation', () => {
    it('validates valid objects', () => {
      expect(validationUtils.isValidObject({})).toBe(true);
      expect(validationUtils.isValidObject({ key: 'value' })).toBe(true);
    });

    it('rejects invalid objects', () => {
      expect(validationUtils.isValidObject(null)).toBe(false);
      expect(validationUtils.isValidObject([])).toBe(false);
      expect(validationUtils.isValidObject('string')).toBe(false);
      expect(validationUtils.isValidObject(123)).toBe(false);
    });
  });

  describe('Distance Calculation', () => {
    it('calculates distance between coordinates', () => {
      const distance = validationUtils.calculateDistance(0, 0, 0, 1);
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    it('calculates zero distance for same coordinates', () => {
      const distance = validationUtils.calculateDistance(37.7749, -122.4194, 37.7749, -122.4194);
      expect(distance).toBe(0);
    });

    it('handles extreme coordinates', () => {
      const distance = validationUtils.calculateDistance(90, 180, -90, -180);
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });
  });

  describe('Risk Score Normalization', () => {
    it('normalizes valid risk scores', () => {
      expect(validationUtils.normalizeRiskScore(0.5)).toBe(0.5);
      expect(validationUtils.normalizeRiskScore(0)).toBe(0);
      expect(validationUtils.normalizeRiskScore(1)).toBe(1);
    });

    it('clamps risk scores to valid range', () => {
      expect(validationUtils.normalizeRiskScore(-0.5)).toBe(0);
      expect(validationUtils.normalizeRiskScore(1.5)).toBe(1);
      expect(validationUtils.normalizeRiskScore(Infinity)).toBe(0);
      expect(validationUtils.normalizeRiskScore(-Infinity)).toBe(0);
    });

    it('handles invalid inputs', () => {
      expect(validationUtils.normalizeRiskScore(NaN)).toBe(0);
      expect(validationUtils.normalizeRiskScore('0.5')).toBe(0);
      expect(validationUtils.normalizeRiskScore(null)).toBe(0);
    });
  });

  describe('Time Utilities', () => {
    it('identifies recent dates', () => {
      const now = new Date();
      expect(validationUtils.isRecentDate(now)).toBe(true);
      
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      expect(validationUtils.isRecentDate(oneHourAgo)).toBe(true);
    });

    it('identifies old dates', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(validationUtils.isRecentDate(twoDaysAgo)).toBe(false);
    });

    it('formats dates correctly', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = validationUtils.formatDate(date);
      expect(formatted).toBe('2024-01-01T12:00:00.000Z');
    });
  });

  describe('Color Utilities', () => {
    it('returns correct colors for risk levels', () => {
      expect(validationUtils.getRiskLevelColor('low')).toBe('#ffff00');
      expect(validationUtils.getRiskLevelColor('medium')).toBe('#ffa500');
      expect(validationUtils.getRiskLevelColor('high')).toBe('#ff4500');
      expect(validationUtils.getRiskLevelColor('critical')).toBe('#ff0000');
    });

    it('returns default color for invalid risk levels', () => {
      expect(validationUtils.getRiskLevelColor('invalid')).toBe('#808080');
      expect(validationUtils.getRiskLevelColor('')).toBe('#808080');
    });
  });

  describe('Coordinate Transformation', () => {
    it('transforms coordinates to GeoJSON format', () => {
      const result = validationUtils.transformCoordinates(37.7749, -122.4194);
      expect(result).toEqual([-122.4194, 37.7749]);
    });
  });

  describe('Complete Object Validation', () => {
    it('validates complete hazard zone objects', () => {
      const validHazard = {
        id: 'hazard-1',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
        riskLevel: 'high',
        dataSource: 'FIRMS',
        riskScore: 0.8,
        lastUpdated: new Date(),
      };

      expect(validationUtils.isValidHazardZone(validHazard)).toBe(true);
    });

    it('rejects invalid hazard zone objects', () => {
      const invalidHazard = {
        id: '',
        geometry: { type: 'Polygon', coordinates: [] },
        riskLevel: 'invalid',
        dataSource: 'INVALID',
        riskScore: NaN,
        lastUpdated: 'invalid date',
      };

      expect(validationUtils.isValidHazardZone(invalidHazard)).toBe(false);
    });

    it('validates complete safe route objects', () => {
      const validRoute = {
        id: 'route-1',
        origin: [37.7749, -122.4194],
        destination: [37.7849, -122.4094],
        route: {
          type: 'LineString',
          coordinates: [[-122.4194, 37.7749], [-122.4094, 37.7849]],
        },
        hazardAvoided: true,
      };

      expect(validationUtils.isValidSafeRoute(validRoute)).toBe(true);
    });

    it('rejects invalid safe route objects', () => {
      const invalidRoute = {
        id: '',
        origin: [91, 0], // Invalid latitude
        destination: [0, 0],
        route: { type: 'LineString', coordinates: [] },
        hazardAvoided: 'not boolean',
      };

      expect(validationUtils.isValidSafeRoute(invalidRoute)).toBe(false);
    });
  });
}); 