import { describe, it, expect } from 'vitest';
import { ValidationException, validateDataAndThrow, validateData } from '../../utils/dataValidation';

describe('ValidationException', () => {
  it('should create a validation exception with proper properties', () => {
    const validationResult = {
      isValid: false,
      errors: ['Invalid data format', 'Missing required field'],
      warnings: ['Data might be outdated'],
      suggestions: ['Consider refreshing data']
    };

    const exception = new ValidationException('Test validation failed', validationResult, 'Test Context');

    expect(exception.name).toBe('ValidationException');
    expect(exception.message).toBe('Test validation failed');
    expect(exception.validationResult).toBe(validationResult);
    expect(exception.context).toBe('Test Context');
  });

  it('should throw ValidationException when validateDataAndThrow is called with invalid data', () => {
    const invalidData = {
      hazardZones: null, // Invalid: should be an array
      riskAssessment: {
        totalNearbyHazards: -1, // Invalid: should be non-negative
        avgRiskScore: 1.5, // Invalid: should be between 0 and 1
        maxRiskScore: 2.0, // Invalid: should be between 0 and 1
        location: { latitude: 200, longitude: 300 }, // Invalid: out of bounds
        assessmentRadiusKm: 0, // Invalid: should be positive
        riskLevels: { low: -1, medium: 0, high: 0, critical: 0 }, // Invalid: negative count
        assessmentTimestamp: 'invalid-date' // Invalid: should be valid date
      }
    };

    expect(() => {
      validateDataAndThrow(invalidData, undefined, 'Test Validation');
    }).toThrow(ValidationException);
  });

  it('should not throw when validateDataAndThrow is called with valid data', () => {
    const validData = {
      hazardZones: [
        {
          id: 'hazard-1',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.4, 37.7], [-122.3, 37.7], [-122.3, 37.8], [-122.4, 37.8], [-122.4, 37.7]]]
          },
          riskLevel: 'medium',
          riskScore: 0.5,
          confidence: 85,
          brightness: 300,
          dataSource: 'FIRMS',
          lastUpdated: '2024-01-01T12:00:00Z'
        },
        {
          id: 'hazard-2',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.35, 37.75], [-122.25, 37.75], [-122.25, 37.85], [-122.35, 37.85], [-122.35, 37.75]]]
          },
          riskLevel: 'low',
          riskScore: 0.3,
          confidence: 90,
          brightness: 250,
          dataSource: 'FIRMS',
          lastUpdated: '2024-01-01T12:00:00Z'
        },
        {
          id: 'hazard-3',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.45, 37.65], [-122.35, 37.65], [-122.35, 37.75], [-122.45, 37.75], [-122.45, 37.65]]]
          },
          riskLevel: 'high',
          riskScore: 0.7,
          confidence: 80,
          brightness: 400,
          dataSource: 'NOAA',
          lastUpdated: '2024-01-01T12:00:00Z'
        },
        {
          id: 'hazard-4',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.25, 37.85], [-122.15, 37.85], [-122.15, 37.95], [-122.25, 37.95], [-122.25, 37.85]]]
          },
          riskLevel: 'low',
          riskScore: 0.2,
          confidence: 95,
          brightness: 200,
          dataSource: 'FIRMS',
          lastUpdated: '2024-01-01T12:00:00Z'
        },
        {
          id: 'hazard-5',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.55, 37.85], [-122.45, 37.85], [-122.45, 37.95], [-122.55, 37.95], [-122.55, 37.85]]]
          },
          riskLevel: 'medium',
          riskScore: 0.6,
          confidence: 85,
          brightness: 350,
          dataSource: 'NOAA',
          lastUpdated: '2024-01-01T12:00:00Z'
        }
      ],
      riskAssessment: {
        totalNearbyHazards: 5,
        avgRiskScore: 0.46,
        maxRiskScore: 0.7,
        location: { latitude: 37.75, longitude: -122.35 },
        assessmentRadiusKm: 10,
        riskLevels: { low: 2, medium: 2, high: 1, critical: 0 },
        assessmentTimestamp: '2024-01-01T12:00:00Z'
      }
    };

    expect(() => {
      validateDataAndThrow(validData, undefined, 'Test Validation');
    }).not.toThrow();
  });

  it('should include validation errors in the exception message', () => {
    const invalidData = {
      hazardZones: null,
      riskAssessment: {
        totalNearbyHazards: -1,
        avgRiskScore: 1.5,
        maxRiskScore: 2.0,
        location: { latitude: 200, longitude: 300 },
        assessmentRadiusKm: 0,
        riskLevels: { low: -1, medium: 0, high: 0, critical: 0 },
        assessmentTimestamp: 'invalid-date'
      }
    };

    try {
      validateDataAndThrow(invalidData, undefined, 'Test Context');
    } catch (error) {
      if (error instanceof ValidationException) {
        expect(error.message).toContain('Data validation failed in Test Context');
        expect(error.message).toContain('Errors:');
        expect(error.validationResult.errors.length).toBeGreaterThan(0);
        expect(error.context).toBe('Test Context');
      } else {
        throw error;
      }
    }
  });

  it('should log warnings but not throw when only warnings are present', () => {
    const dataWithWarnings = {
      hazardZones: [
        {
          id: 'hazard-1',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.4, 37.7], [-122.3, 37.7], [-122.3, 37.8], [-122.4, 37.8], [-122.4, 37.7]]]
          },
          riskLevel: 'critical',
          riskScore: 0.9,
          confidence: 85,
          brightness: 300,
          dataSource: 'FIRMS',
          lastUpdated: '2024-01-01T12:00:00Z'
        },
        {
          id: 'hazard-2',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.35, 37.75], [-122.25, 37.75], [-122.25, 37.85], [-122.35, 37.85], [-122.35, 37.75]]]
          },
          riskLevel: 'critical',
          riskScore: 0.95,
          confidence: 90,
          brightness: 500,
          dataSource: 'FIRMS',
          lastUpdated: '2024-01-01T12:00:00Z'
        },
        {
          id: 'hazard-3',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.45, 37.65], [-122.35, 37.65], [-122.35, 37.75], [-122.45, 37.75], [-122.45, 37.65]]]
          },
          riskLevel: 'critical',
          riskScore: 0.88,
          confidence: 80,
          brightness: 450,
          dataSource: 'NOAA',
          lastUpdated: '2024-01-01T12:00:00Z'
        },
        {
          id: 'hazard-4',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.25, 37.85], [-122.15, 37.85], [-122.15, 37.95], [-122.25, 37.95], [-122.25, 37.85]]]
          },
          riskLevel: 'critical',
          riskScore: 0.92,
          confidence: 95,
          brightness: 480,
          dataSource: 'FIRMS',
          lastUpdated: '2024-01-01T12:00:00Z'
        },
        {
          id: 'hazard-5',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-122.55, 37.85], [-122.45, 37.85], [-122.45, 37.95], [-122.55, 37.95], [-122.55, 37.85]]]
          },
          riskLevel: 'critical',
          riskScore: 0.87,
          confidence: 85,
          brightness: 420,
          dataSource: 'NOAA',
          lastUpdated: '2024-01-01T12:00:00Z'
        }
      ],
      riskAssessment: {
        totalNearbyHazards: 5,
        avgRiskScore: 0.904,
        maxRiskScore: 0.95,
        location: { latitude: 37.75, longitude: -122.35 },
        assessmentRadiusKm: 10,
        riskLevels: { low: 0, medium: 0, high: 0, critical: 5 },
        assessmentTimestamp: '2024-01-01T12:00:00Z'
      }
    };

    // This should not throw even though there might be warnings
    expect(() => {
      validateDataAndThrow(dataWithWarnings, undefined, 'Test Validation');
    }).not.toThrow();
  });
}); 