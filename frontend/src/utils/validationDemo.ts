import { validateDataAndThrow, ValidationException } from './dataValidation';
import { logger } from '../config/environment';

/**
 * Demonstration of the validation exception functionality
 */
export function demonstrateValidationExceptions() {
  console.log('=== Validation Exception Demonstration ===\n');

  // Example 1: Valid data (should not throw)
  console.log('1. Testing with valid data...');
  try {
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

    validateDataAndThrow(validData, undefined, 'Valid Data Test');
    console.log('✅ Valid data passed validation\n');
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }

  // Example 2: Invalid data (should throw ValidationException)
  console.log('2. Testing with invalid data...');
  try {
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

    validateDataAndThrow(invalidData, undefined, 'Invalid Data Test');
    console.log('❌ Expected validation to fail but it passed\n');
  } catch (error) {
    if (error instanceof ValidationException) {
      console.log('✅ ValidationException caught as expected');
      console.log(`   Message: ${error.message}`);
      console.log(`   Context: ${error.context}`);
      console.log(`   Errors: ${error.validationResult.errors.length} errors found`);
      console.log(`   Warnings: ${error.validationResult.warnings.length} warnings found`);
      console.log(`   Suggestions: ${error.validationResult.suggestions.length} suggestions found\n`);
    } else {
      console.log('❌ Unexpected error type:', error);
    }
  }

  // Example 3: Data with warnings only (should not throw)
  console.log('3. Testing with data that has warnings but no errors...');
  try {
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

    validateDataAndThrow(dataWithWarnings, undefined, 'Warnings Test');
    console.log('✅ Data with warnings passed validation (warnings logged but no exception thrown)\n');
  } catch (error) {
    if (error instanceof ValidationException) {
      console.log('❌ Unexpected ValidationException:', error.message);
    } else {
      console.log('❌ Unexpected error:', error);
    }
  }

  console.log('=== Demonstration Complete ===');
}

// Export for use in other modules
export default demonstrateValidationExceptions; 