/**
 * Mock hazard feed services for offline testing
 * Provides deterministic hazard data for various disaster scenarios
 */

import { vi } from 'vitest';

// Mock hazard data types
export interface MockHazard {
  id: string;
  type: 'fire' | 'flood' | 'earthquake' | 'hurricane' | 'tornado' | 'wildfire';
  severity: 'low' | 'medium' | 'high' | 'critical';
  geometry: {
    type: 'Polygon' | 'Point';
    coordinates: number[][][] | number[];
  };
  properties: {
    name: string;
    description: string;
    startTime: string;
    endTime?: string;
    confidence: number;
    source: string;
    lastUpdated: string;
  };
}

// Deterministic hazard datasets
export const mockHazardDatasets = {
  // California wildfire scenario
  californiaWildfire: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'fire-001',
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
          lastUpdated: '2024-01-01T12:00:00Z',
          type: 'wildfire',
          severity: 'high'
        }
      }
    ]
  },
  
  // Flood scenario
  floodScenario: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'flood-001',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-122.45, 37.75],
            [-122.35, 37.75],
            [-122.35, 37.85],
            [-122.45, 37.85],
            [-122.45, 37.75]
          ]]
        },
        properties: {
          name: 'Test Flood Zone',
          description: 'Simulated flood area for testing',
          startTime: '2024-01-01T06:00:00Z',
          confidence: 0.88,
          source: 'mock-feed',
          lastUpdated: '2024-01-01T12:00:00Z',
          type: 'flood',
          severity: 'medium'
        }
      }
    ]
  },
  
  // Earthquake scenario
  earthquakeScenario: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'earthquake-001',
        geometry: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        properties: {
          name: 'Test Earthquake',
          description: 'Simulated earthquake epicenter',
          startTime: '2024-01-01T10:30:00Z',
          confidence: 0.99,
          source: 'mock-feed',
          lastUpdated: '2024-01-01T12:00:00Z',
          type: 'earthquake',
          severity: 'critical',
          magnitude: 6.5
        }
      }
    ]
  }
};

// Mock FIRMS (Fire Information for Resource Management System) API
export const mockFIRMSAPI = {
  getActiveFires: vi.fn().mockImplementation(async (config) => {
    const { area, startDate, endDate } = config;
    
    // Return deterministic fire data based on area
    if (area.includes('california') || area.includes('CA')) {
      return mockHazardDatasets.californiaWildfire;
    }
    
    return { type: 'FeatureCollection', features: [] };
  }),
  
  getFireHistory: vi.fn().mockImplementation(async (config) => {
    const { area, startDate, endDate } = config;
    
    // Return historical fire data
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'historical-fire-001',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-122.6, 37.6],
              [-122.3, 37.6],
              [-122.3, 37.9],
              [-122.6, 37.9],
              [-122.6, 37.6]
            ]]
          },
          properties: {
            name: 'Historical Fire',
            description: 'Past fire event for testing',
            startTime: '2023-12-01T00:00:00Z',
            endTime: '2023-12-05T00:00:00Z',
            confidence: 1.0,
            source: 'mock-feed',
            lastUpdated: '2023-12-05T00:00:00Z',
            type: 'wildfire',
            severity: 'high'
          }
        }
      ]
    };
  })
};

// Mock NOAA (National Oceanic and Atmospheric Administration) API
export const mockNOAAAPI = {
  getWeatherAlerts: vi.fn().mockImplementation(async (config) => {
    const { lat, lng, radius } = config;
    
    // Return weather alerts based on location
    return {
      alerts: [
        {
          id: 'weather-alert-001',
          type: 'severe-weather',
          severity: 'moderate',
          title: 'Test Weather Alert',
          description: 'Simulated weather alert for testing',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-02T00:00:00Z',
          area: {
            type: 'Polygon',
            coordinates: [[
              [lng - 0.1, lat - 0.1],
              [lng + 0.1, lat - 0.1],
              [lng + 0.1, lat + 0.1],
              [lng - 0.1, lat + 0.1],
              [lng - 0.1, lat - 0.1]
            ]]
          }
        }
      ]
    };
  }),
  
  getFloodData: vi.fn().mockImplementation(async (config) => {
    const { area } = config;
    
    return mockHazardDatasets.floodScenario;
  }),
  
  getEarthquakeData: vi.fn().mockImplementation(async (config) => {
    const { area, startDate, endDate } = config;
    
    return mockHazardDatasets.earthquakeScenario;
  })
};

// Mock USGS (United States Geological Survey) API
export const mockUSGSAPI = {
  getEarthquakes: vi.fn().mockImplementation(async (config) => {
    const { startTime, endTime, minMagnitude, maxMagnitude } = config;
    
    // Return earthquake data based on time range and magnitude
    const earthquakes = [];
    
    if (minMagnitude <= 6.5) {
      earthquakes.push({
        type: 'Feature',
        id: 'earthquake-001',
        geometry: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        properties: {
          name: 'Test Earthquake',
          description: 'Simulated earthquake for testing',
          startTime: startTime || '2024-01-01T10:30:00Z',
          confidence: 0.99,
          source: 'mock-feed',
          lastUpdated: '2024-01-01T12:00:00Z',
          type: 'earthquake',
          severity: 'critical',
          magnitude: 6.5
        }
      });
    }
    
    return {
      type: 'FeatureCollection',
      features: earthquakes
    };
  }),
  
  getVolcanoData: vi.fn().mockImplementation(async (config) => {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'volcano-001',
          geometry: {
            type: 'Point',
            coordinates: [-122.5, 37.8]
          },
          properties: {
            name: 'Test Volcano',
            description: 'Simulated volcano for testing',
            startTime: '2024-01-01T00:00:00Z',
            confidence: 0.85,
            source: 'mock-feed',
            lastUpdated: '2024-01-01T12:00:00Z',
            type: 'volcano',
            severity: 'medium'
          }
        }
      ]
    };
  })
};

// Mock FEMA (Federal Emergency Management Agency) API
export const mockFEMAAPI = {
  getDisasterDeclarations: vi.fn().mockImplementation(async (config) => {
    const { state, startDate, endDate } = config;
    
    return {
      disasters: [
        {
          id: 'disaster-001',
          type: 'wildfire',
          state: state || 'CA',
          declarationDate: '2024-01-01T00:00:00Z',
          incidentType: 'Fire',
          title: 'Test Disaster Declaration',
          description: 'Simulated disaster declaration for testing',
          severity: 'high'
        }
      ]
    };
  }),
  
  getHazardMitigation: vi.fn().mockImplementation(async (config) => {
    const { area } = config;
    
    return {
      hazards: [
        {
          id: 'hazard-001',
          type: 'flood',
          name: 'Test Flood Hazard',
          description: 'Simulated flood hazard for testing',
          riskLevel: 'high',
          area: {
            type: 'Polygon',
            coordinates: [[
              [-122.45, 37.75],
              [-122.35, 37.75],
              [-122.35, 37.85],
              [-122.45, 37.85],
              [-122.45, 37.75]
            ]]
          }
        }
      ]
    };
  })
};

// Mock hazard feed aggregator
export const mockHazardFeedAggregator = {
  getAllHazards: vi.fn().mockImplementation(async (config) => {
    const { area, startDate, endDate, types } = config;
    
    const allHazards = [];
    
    // Aggregate from all sources
    if (!types || types.includes('wildfire')) {
      const fires = await mockFIRMSAPI.getActiveFires({ area, startDate, endDate });
      allHazards.push(...fires.features);
    }
    
    if (!types || types.includes('flood')) {
      const floods = await mockNOAAAPI.getFloodData({ area });
      allHazards.push(...floods.features);
    }
    
    if (!types || types.includes('earthquake')) {
      const earthquakes = await mockUSGSAPI.getEarthquakes({ startDate, endDate });
      allHazards.push(...earthquakes.features);
    }
    
    return {
      type: 'FeatureCollection',
      features: allHazards
    };
  }),
  
  getHazardsByType: vi.fn().mockImplementation(async (type, config) => {
    switch (type) {
      case 'wildfire':
        return await mockFIRMSAPI.getActiveFires(config);
      case 'flood':
        return await mockNOAAAPI.getFloodData(config);
      case 'earthquake':
        return await mockUSGSAPI.getEarthquakes(config);
      default:
        return { type: 'FeatureCollection', features: [] };
    }
  }),
  
  getHazardsBySeverity: vi.fn().mockImplementation(async (severity, config) => {
    const allHazards = await mockHazardFeedAggregator.getAllHazards(config);
    
    return {
      type: 'FeatureCollection',
      features: allHazards.features.filter((feature: any) => 
        feature.properties.severity === severity
      )
    };
  })
};

// Export all mocks
export const hazardFeedMocks = {
  FIRMS: mockFIRMSAPI,
  NOAA: mockNOAAAPI,
  USGS: mockUSGSAPI,
  FEMA: mockFEMAAPI,
  Aggregator: mockHazardFeedAggregator,
  datasets: mockHazardDatasets
};

export default hazardFeedMocks;

