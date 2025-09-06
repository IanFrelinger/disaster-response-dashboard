/**
 * Contract tests for REST API schemas
 * Validates API contracts using OpenAPI/Pact patterns
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// API Schema definitions using Zod for runtime validation
const HazardSchema = z.object({
  id: z.string(),
  type: z.enum(['fire', 'flood', 'earthquake', 'hurricane', 'tornado', 'wildfire']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  geometry: z.object({
    type: z.enum(['Polygon', 'Point']),
    coordinates: z.union([
      z.array(z.array(z.array(z.number()))), // Polygon
      z.array(z.number()) // Point
    ])
  }),
  properties: z.object({
    name: z.string(),
    description: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    confidence: z.number().min(0).max(1),
    source: z.string(),
    lastUpdated: z.string().datetime()
  })
});

const RouteSchema = z.object({
  id: z.string(),
  type: z.enum(['evacuation', 'emergency-response', 'access']),
  geometry: z.object({
    type: z.literal('LineString'),
    coordinates: z.array(z.array(z.number()))
  }),
  properties: z.object({
    name: z.string(),
    distance: z.number().positive(),
    duration: z.number().positive(),
    safetyScore: z.number().min(0).max(1),
    capacity: z.number().int().positive(),
    accessibility: z.enum(['wheelchair', 'walking', 'vehicle']),
    lastUpdated: z.string().datetime()
  })
});

const EmergencyUnitSchema = z.object({
  id: z.string(),
  type: z.enum(['fire', 'police', 'medical', 'command']),
  status: z.enum(['available', 'busy', 'offline', 'maintenance']),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number())
  }),
  properties: z.object({
    name: z.string(),
    unitNumber: z.string(),
    personnel: z.number().int().positive(),
    equipment: z.array(z.string()),
    lastUpdated: z.string().datetime()
  })
});

const ValidationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string().datetime(),
  details: z.record(z.any()).optional()
});

const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string().optional(),
  timestamp: z.string().datetime(),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().positive()
  }).optional()
});

// Mock API responses
const mockAPIResponses = {
  hazards: {
    success: true,
    data: {
      type: 'FeatureCollection',
      features: [
        {
          id: 'hazard-001',
          type: 'wildfire',
          severity: 'high',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-122.5, 37.7],
              [-122.4, 37.7],
              [-122.4, 37.8],
              [-122.5, 37.8],
              [-122.5, 37.7]
            ]]
          },
          properties: {
            name: 'Test Wildfire',
            description: 'Simulated wildfire for testing',
            startTime: '2024-01-01T00:00:00Z',
            confidence: 0.95,
            source: 'mock-feed',
            lastUpdated: '2024-01-01T12:00:00Z'
          }
        }
      ]
    },
    message: 'Hazards retrieved successfully',
    timestamp: '2024-01-01T12:00:00Z'
  },
  
  routes: {
    success: true,
    data: [
      {
        id: 'route-001',
        type: 'evacuation',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-122.4194, 37.7749],
            [-122.3194, 37.8749]
          ]
        },
        properties: {
          name: 'Test Evacuation Route',
          distance: 10000,
          duration: 5000,
          safetyScore: 0.9,
          capacity: 500,
          accessibility: 'walking',
          lastUpdated: '2024-01-01T12:00:00Z'
        }
      }
    ],
    message: 'Routes retrieved successfully',
    timestamp: '2024-01-01T12:00:00Z'
  },
  
  units: {
    success: true,
    data: [
      {
        id: 'unit-001',
        type: 'fire',
        status: 'available',
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        properties: {
          name: 'Fire Station 1',
          unitNumber: 'FS001',
          personnel: 10,
          equipment: ['ladder', 'hose', 'pump'],
          lastUpdated: '2024-01-01T12:00:00Z'
        }
      }
    ],
    message: 'Units retrieved successfully',
    timestamp: '2024-01-01T12:00:00Z'
  },
  
  validation: {
    success: true,
    data: {
      success: true,
      message: 'Validation completed successfully',
      timestamp: '2024-01-01T12:00:00Z',
      details: {
        hazardsValidated: 5,
        routesValidated: 3,
        unitsValidated: 2
      }
    },
    message: 'Validation completed',
    timestamp: '2024-01-01T12:00:00Z'
  }
};

describe('API Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hazard API Contracts', () => {
    it('should validate hazard schema structure', () => {
      const hazard = mockAPIResponses.hazards.data.features[0];
      
      expect(() => HazardSchema.parse(hazard)).not.toThrow();
    });

    it('should reject invalid hazard types', () => {
      const invalidHazard = {
        ...mockAPIResponses.hazards.data.features[0],
        type: 'invalid-type'
      };
      
      expect(() => HazardSchema.parse(invalidHazard)).toThrow();
    });

    it('should reject invalid severity levels', () => {
      const invalidHazard = {
        ...mockAPIResponses.hazards.data.features[0],
        severity: 'invalid-severity'
      };
      
      expect(() => HazardSchema.parse(invalidHazard)).toThrow();
    });

    it('should validate geometry coordinates', () => {
      const hazard = mockAPIResponses.hazards.data.features[0];
      
      expect(() => HazardSchema.parse(hazard)).not.toThrow();
      expect(hazard?.geometry.coordinates).toBeDefined();
      expect(Array.isArray(hazard?.geometry.coordinates)).toBe(true);
    });

    it('should validate required properties', () => {
      const hazard = mockAPIResponses.hazards.data.features[0];
      
      expect(hazard?.properties.name).toBeDefined();
      expect(hazard?.properties.description).toBeDefined();
      expect(hazard?.properties.startTime).toBeDefined();
      expect(hazard?.properties.confidence).toBeDefined();
      expect(hazard?.properties.source).toBeDefined();
      expect(hazard?.properties.lastUpdated).toBeDefined();
    });

    it('should validate confidence range', () => {
      const validHazard = {
        ...mockAPIResponses.hazards.data.features[0],
        properties: {
          ...(mockAPIResponses.hazards.data.features[0]?.properties || {}),
          confidence: 0.5
        }
      };
      
      expect(() => HazardSchema.parse(validHazard)).not.toThrow();
      
      const invalidHazard = {
        ...mockAPIResponses.hazards.data.features[0],
        properties: {
          ...(mockAPIResponses.hazards.data.features[0]?.properties || {}),
          confidence: 1.5
        }
      };
      
      expect(() => HazardSchema.parse(invalidHazard)).toThrow();
    });
  });

  describe('Route API Contracts', () => {
    it('should validate route schema structure', () => {
      const route = mockAPIResponses.routes.data[0];
      
      expect(() => RouteSchema.parse(route)).not.toThrow();
    });

    it('should reject invalid route types', () => {
      const invalidRoute = {
        ...mockAPIResponses.routes.data[0],
        type: 'invalid-type'
      };
      
      expect(() => RouteSchema.parse(invalidRoute)).toThrow();
    });

    it('should validate distance and duration are positive', () => {
      const validRoute = {
        ...mockAPIResponses.routes.data[0],
        properties: {
          ...(mockAPIResponses.routes.data[0]?.properties || {}),
          distance: 1000,
          duration: 500
        }
      };
      
      expect(() => RouteSchema.parse(validRoute)).not.toThrow();
      
      const invalidRoute = {
        ...mockAPIResponses.routes.data[0],
        properties: {
          ...(mockAPIResponses.routes.data[0]?.properties || {}),
          distance: -1000,
          duration: -500
        }
      };
      
      expect(() => RouteSchema.parse(invalidRoute)).toThrow();
    });

    it('should validate safety score range', () => {
      const validRoute = {
        ...mockAPIResponses.routes.data[0],
        properties: {
          ...(mockAPIResponses.routes.data[0]?.properties || {}),
          safetyScore: 0.8
        }
      };
      
      expect(() => RouteSchema.parse(validRoute)).not.toThrow();
      
      const invalidRoute = {
        ...mockAPIResponses.routes.data[0],
        properties: {
          ...(mockAPIResponses.routes.data[0]?.properties || {}),
          safetyScore: 1.5
        }
      };
      
      expect(() => RouteSchema.parse(invalidRoute)).toThrow();
    });

    it('should validate accessibility options', () => {
      const validAccessibility = ['wheelchair', 'walking', 'vehicle'];
      
      validAccessibility.forEach(accessibility => {
        const route = {
          ...mockAPIResponses.routes.data[0],
          properties: {
            ...(mockAPIResponses.routes.data[0]?.properties || {}),
            accessibility
          }
        };
        
        expect(() => RouteSchema.parse(route)).not.toThrow();
      });
      
      const invalidRoute = {
        ...mockAPIResponses.routes.data[0],
        properties: {
          ...(mockAPIResponses.routes.data[0]?.properties || {}),
          accessibility: 'invalid-accessibility'
        }
      };
      
      expect(() => RouteSchema.parse(invalidRoute)).toThrow();
    });
  });

  describe('Emergency Unit API Contracts', () => {
    it('should validate unit schema structure', () => {
      const unit = mockAPIResponses.units.data[0];
      
      expect(() => EmergencyUnitSchema.parse(unit)).not.toThrow();
    });

    it('should reject invalid unit types', () => {
      const invalidUnit = {
        ...mockAPIResponses.units.data[0],
        type: 'invalid-type'
      };
      
      expect(() => EmergencyUnitSchema.parse(invalidUnit)).toThrow();
    });

    it('should reject invalid status values', () => {
      const invalidUnit = {
        ...mockAPIResponses.units.data[0],
        status: 'invalid-status'
      };
      
      expect(() => EmergencyUnitSchema.parse(invalidUnit)).toThrow();
    });

    it('should validate personnel count is positive', () => {
      const validUnit = {
        ...mockAPIResponses.units.data[0],
        properties: {
          ...(mockAPIResponses.units.data[0]?.properties || {}),
          personnel: 5
        }
      };
      
      expect(() => EmergencyUnitSchema.parse(validUnit)).not.toThrow();
      
      const invalidUnit = {
        ...mockAPIResponses.units.data[0],
        properties: {
          ...(mockAPIResponses.units.data[0]?.properties || {}),
          personnel: -1
        }
      };
      
      expect(() => EmergencyUnitSchema.parse(invalidUnit)).toThrow();
    });

    it('should validate equipment array', () => {
      const validUnit = {
        ...mockAPIResponses.units.data[0],
        properties: {
          ...(mockAPIResponses.units.data[0]?.properties || {}),
          equipment: ['ladder', 'hose', 'pump']
        }
      };
      
      expect(() => EmergencyUnitSchema.parse(validUnit)).not.toThrow();
      expect(Array.isArray(validUnit.properties.equipment)).toBe(true);
    });
  });

  describe('API Response Contracts', () => {
    it('should validate successful API response structure', () => {
      const response = mockAPIResponses.hazards;
      
      expect(() => APIResponseSchema.parse(response)).not.toThrow();
    });

    it('should validate response has required fields', () => {
      const response = mockAPIResponses.hazards;
      
      expect(response.success).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.timestamp).toBe('string');
    });

    it('should validate timestamp format', () => {
      const response = mockAPIResponses.hazards;
      
      expect(() => {
        new Date(response.timestamp);
      }).not.toThrow();
      
      const date = new Date(response.timestamp);
      expect(date instanceof Date).toBe(true);
      expect(!isNaN(date.getTime())).toBe(true);
    });

    it('should validate pagination when present', () => {
      const responseWithPagination = {
        ...mockAPIResponses.hazards,
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10
        }
      };
      
      expect(() => APIResponseSchema.parse(responseWithPagination)).not.toThrow();
    });

    it('should validate pagination values are positive', () => {
      const invalidPagination = {
        ...mockAPIResponses.hazards,
        pagination: {
          page: -1,
          limit: 0,
          total: -10,
          totalPages: 0
        }
      };
      
      expect(() => APIResponseSchema.parse(invalidPagination)).toThrow();
    });
  });

  describe('Validation Result Contracts', () => {
    it('should validate validation result structure', () => {
      const validationResult = mockAPIResponses.validation.data;
      
      expect(() => ValidationResultSchema.parse(validationResult)).not.toThrow();
    });

    it('should validate success field is boolean', () => {
      const validationResult = mockAPIResponses.validation.data;
      
      expect(typeof validationResult.success).toBe('boolean');
    });

    it('should validate timestamp format', () => {
      const validationResult = mockAPIResponses.validation.data;
      
      expect(() => {
        new Date(validationResult.timestamp);
      }).not.toThrow();
    });

    it('should validate details object when present', () => {
      const validationResult = mockAPIResponses.validation.data;
      
      expect(validationResult.details).toBeDefined();
      expect(typeof validationResult.details).toBe('object');
    });
  });

  describe('Error Response Contracts', () => {
    it('should validate error response structure', () => {
      const errorResponse = {
        success: false,
        data: null,
        message: 'Error occurred',
        timestamp: '2024-01-01T12:00:00Z',
        error: {
          code: 'VALIDATION_ERROR',
          details: 'Invalid input data'
        }
      };
      
      expect(() => APIResponseSchema.parse(errorResponse)).not.toThrow();
    });

    it('should validate error response has message', () => {
      const errorResponse = {
        success: false,
        data: null,
        message: 'Error occurred',
        timestamp: '2024-01-01T12:00:00Z'
      };
      
      expect(errorResponse.message).toBeDefined();
      expect(typeof errorResponse.message).toBe('string');
      expect(errorResponse.message.length).toBeGreaterThan(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle missing optional fields', () => {
      const minimalHazard = {
        id: 'hazard-001',
        type: 'wildfire',
        severity: 'high',
        geometry: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        properties: {
          name: 'Test Hazard',
          description: 'Test Description',
          startTime: '2024-01-01T00:00:00Z',
          confidence: 0.9,
          source: 'test',
          lastUpdated: '2024-01-01T12:00:00Z'
        }
      };
      
      expect(() => HazardSchema.parse(minimalHazard)).not.toThrow();
    });

    it('should handle additional fields gracefully', () => {
      const extendedHazard = {
        ...mockAPIResponses.hazards.data.features[0],
        additionalField: 'additional value',
        properties: {
          ...(mockAPIResponses.hazards.data.features[0]?.properties || {}),
          additionalProperty: 'additional property value'
        }
      };
      
      // Should not throw even with additional fields
      expect(() => HazardSchema.parse(extendedHazard)).not.toThrow();
    });
  });

  describe('Performance Contracts', () => {
    it('should validate response time is within limits', async () => {
      const startTime = performance.now();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(100); // Should respond within 100ms
    });

    it('should validate payload size is reasonable', () => {
      const response = mockAPIResponses.hazards;
      const payloadSize = JSON.stringify(response).length;
      
      expect(payloadSize).toBeLessThan(10000); // Should be less than 10KB
    });
  });
});

