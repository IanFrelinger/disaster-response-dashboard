/**
 * Deterministic seeded datasets for testing
 * Provides consistent, reproducible data for H3 grids, hazard tiles, and routes
 */

import { H3Index } from 'h3-js';

// Seeded random number generator for deterministic data
class SeededRandom {
  private seed: number;
  
  constructor(seed: number = 12345) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
  
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)] as T;
  }
}

// Global seeded random instance
const seededRandom = new SeededRandom(12345);

// H3 Grid datasets
export const h3GridDatasets = {
  // Small H3 grid for San Francisco area (resolution 8)
  sanFranciscoGrid8: (() => {
    const centerLat = 37.7749;
    const centerLng = -122.4194;
    const radius = 5000; // 5km radius
    
    // Generate H3 indices in a hex pattern around center
    const h3Indices: H3Index[] = [];
    const centerH3 = '88283082dffffff'; // Approximate center H3 index
    
    // Generate a small grid of H3 cells
    for (let i = 0; i < 25; i++) {
      const offsetLat = seededRandom.nextFloat(-0.05, 0.05);
      const offsetLng = seededRandom.nextFloat(-0.05, 0.05);
      const lat = centerLat + offsetLat;
      const lng = centerLng + offsetLng;
      
      // Convert to H3 index (this would need actual H3 library in real implementation)
      h3Indices.push(`88283082dffffff${i.toString(16).padStart(2, '0')}`);
    }
    
    return h3Indices;
  })(),
  
  // Medium H3 grid for California (resolution 6)
  californiaGrid6: (() => {
    const h3Indices: H3Index[] = [];
    
    // Generate a larger grid covering California
    for (let i = 0; i < 100; i++) {
      const lat = seededRandom.nextFloat(32.5, 42.0); // California latitude range
      const lng = seededRandom.nextFloat(-124.5, -114.0); // California longitude range
      
      // Convert to H3 index (simplified for testing)
      h3Indices.push(`86283082dffffff${i.toString(16).padStart(3, '0')}`);
    }
    
    return h3Indices;
  })(),
  
  // Large H3 grid for US West Coast (resolution 4)
  westCoastGrid4: (() => {
    const h3Indices: H3Index[] = [];
    
    // Generate a very large grid covering US West Coast
    for (let i = 0; i < 500; i++) {
      const lat = seededRandom.nextFloat(30.0, 50.0); // West Coast latitude range
      const lng = seededRandom.nextFloat(-130.0, -110.0); // West Coast longitude range
      
      // Convert to H3 index (simplified for testing)
      h3Indices.push(`84283082dffffff${i.toString(16).padStart(4, '0')}`);
    }
    
    return h3Indices;
  })()
};

// Hazard tile datasets
export const hazardTileDatasets = {
  // Small hazard tiles for unit testing
  smallHazardTiles: (() => {
    const tiles = [];
    
    for (let z = 8; z <= 12; z++) {
      for (let x = 0; x < Math.pow(2, z); x += Math.pow(2, z - 8)) {
        for (let y = 0; y < Math.pow(2, z); y += Math.pow(2, z - 8)) {
          if (seededRandom.next() < 0.1) { // 10% chance of hazard tile
            tiles.push({
              z, x, y,
              data: {
                type: 'hazard',
                severity: seededRandom.choice(['low', 'medium', 'high', 'critical']),
                confidence: seededRandom.nextFloat(0.5, 1.0),
                timestamp: new Date(2024, 0, 1).toISOString()
              }
            });
          }
        }
      }
    }
    
    return tiles;
  })(),
  
  // Medium hazard tiles for integration testing
  mediumHazardTiles: (() => {
    const tiles = [];
    
    for (let z = 6; z <= 14; z++) {
      for (let x = 0; x < Math.pow(2, z); x += Math.pow(2, z - 6)) {
        for (let y = 0; y < Math.pow(2, z); y += Math.pow(2, z - 6)) {
          if (seededRandom.next() < 0.05) { // 5% chance of hazard tile
            tiles.push({
              z, x, y,
              data: {
                type: 'hazard',
                severity: seededRandom.choice(['low', 'medium', 'high', 'critical']),
                confidence: seededRandom.nextFloat(0.3, 1.0),
                timestamp: new Date(2024, 0, 1).toISOString(),
                source: seededRandom.choice(['FIRMS', 'NOAA', 'USGS', 'FEMA'])
              }
            });
          }
        }
      }
    }
    
    return tiles;
  })(),
  
  // Large hazard tiles for stress testing
  largeHazardTiles: (() => {
    const tiles = [];
    
    for (let z = 4; z <= 16; z++) {
      for (let x = 0; x < Math.pow(2, z); x += Math.pow(2, z - 4)) {
        for (let y = 0; y < Math.pow(2, z); y += Math.pow(2, z - 4)) {
          if (seededRandom.next() < 0.02) { // 2% chance of hazard tile
            tiles.push({
              z, x, y,
              data: {
                type: 'hazard',
                severity: seededRandom.choice(['low', 'medium', 'high', 'critical']),
                confidence: seededRandom.nextFloat(0.1, 1.0),
                timestamp: new Date(2024, 0, 1).toISOString(),
                source: seededRandom.choice(['FIRMS', 'NOAA', 'USGS', 'FEMA']),
                metadata: {
                  affectedArea: seededRandom.nextFloat(100, 10000), // square meters
                  populationAtRisk: seededRandom.nextInt(0, 10000),
                  estimatedDamage: seededRandom.nextFloat(1000, 1000000) // dollars
                }
              }
            });
          }
        }
      }
    }
    
    return tiles;
  })()
};

// Route datasets
export const routeDatasets = {
  // Simple evacuation routes
  simpleEvacuationRoutes: (() => {
    const routes = [];
    const startPoints = [
      [-122.4194, 37.7749], // San Francisco
      [-122.4094, 37.7849], // Slightly north
      [-122.4294, 37.7649]  // Slightly south
    ];
    
    const endPoints = [
      [-122.3194, 37.8749], // North evacuation point
      [-122.5194, 37.6749], // South evacuation point
      [-122.4194, 37.9749]  // East evacuation point
    ];
    
    for (let i = 0; i < 10; i++) {
      const start = seededRandom.choice(startPoints);
      const end = seededRandom.choice(endPoints);
      
      routes.push({
        id: `route-${i}`,
        type: 'evacuation',
        geometry: {
          type: 'LineString',
          coordinates: generateRouteCoordinates(start as [number, number], end as [number, number], 5)
        },
        properties: {
          name: `Evacuation Route ${i}`,
          distance: calculateDistance(start as [number, number], end as [number, number]),
          duration: calculateDistance(start as [number, number], end as [number, number]) * 0.5, // 2 m/s walking speed
          safetyScore: seededRandom.nextFloat(0.7, 1.0),
          capacity: seededRandom.nextInt(100, 1000),
          accessibility: seededRandom.choice(['wheelchair', 'walking', 'vehicle']),
          lastUpdated: new Date(2024, 0, 1).toISOString()
        }
      });
    }
    
    return routes;
  })(),
  
  // Complex evacuation routes with waypoints
  complexEvacuationRoutes: (() => {
    const routes = [];
    
    for (let i = 0; i < 20; i++) {
      const start = [seededRandom.nextFloat(-122.5, -122.3), seededRandom.nextFloat(37.7, 37.9)];
      const end = [seededRandom.nextFloat(-122.5, -122.3), seededRandom.nextFloat(37.7, 37.9)];
      
      // Generate waypoints
      const waypoints = [];
      const numWaypoints = seededRandom.nextInt(2, 8);
      
      for (let j = 0; j < numWaypoints; j++) {
        const t = (j + 1) / (numWaypoints + 1);
        const lng = (start?.[0] || 0) + ((end?.[0] || 0) - (start?.[0] || 0)) * t + seededRandom.nextFloat(-0.01, 0.01);
        const lat = (start?.[1] || 0) + ((end?.[1] || 0) - (start?.[1] || 0)) * t + seededRandom.nextFloat(-0.01, 0.01);
        waypoints.push([lng, lat]);
      }
      
      const coordinates = [start, ...waypoints, end];
      
      routes.push({
        id: `complex-route-${i}`,
        type: 'evacuation',
        geometry: {
          type: 'LineString',
          coordinates
        },
        properties: {
          name: `Complex Evacuation Route ${i}`,
          distance: calculateRouteDistance(coordinates as [number, number][]),
          duration: calculateRouteDistance(coordinates as [number, number][]) * 0.5,
          safetyScore: seededRandom.nextFloat(0.5, 1.0),
          capacity: seededRandom.nextInt(50, 500),
          accessibility: seededRandom.choice(['wheelchair', 'walking', 'vehicle']),
          waypoints: waypoints.length,
          lastUpdated: new Date(2024, 0, 1).toISOString(),
          metadata: {
            elevationGain: seededRandom.nextFloat(0, 100),
            surfaceType: seededRandom.choice(['paved', 'gravel', 'dirt', 'mixed']),
            lighting: seededRandom.choice(['good', 'fair', 'poor', 'none'])
          }
        }
      });
    }
    
    return routes;
  })(),
  
  // Emergency response routes
  emergencyResponseRoutes: (() => {
    const routes = [];
    const emergencyPoints = [
      [-122.4194, 37.7749], // City center
      [-122.4094, 37.7849], // Hospital
      [-122.4294, 37.7649], // Fire station
      [-122.4394, 37.7549]  // Police station
    ];
    
    for (let i = 0; i < 15; i++) {
      const start = seededRandom.choice(emergencyPoints);
      const end = seededRandom.choice(emergencyPoints.filter(p => p !== start));
      
      routes.push({
        id: `emergency-route-${i}`,
        type: 'emergency-response',
        geometry: {
          type: 'LineString',
          coordinates: generateRouteCoordinates(start as [number, number], end as [number, number], 3)
        },
        properties: {
          name: `Emergency Response Route ${i}`,
          distance: calculateDistance(start as [number, number], end as [number, number]),
          duration: calculateDistance(start as [number, number], end as [number, number]) * 0.3, // 3.3 m/s running speed
          priority: seededRandom.choice(['low', 'medium', 'high', 'critical']),
          vehicleType: seededRandom.choice(['ambulance', 'fire-truck', 'police-car', 'command-vehicle']),
          lastUpdated: new Date(2024, 0, 1).toISOString()
        }
      });
    }
    
    return routes;
  })()
};

// Edge case datasets
export const edgeCaseDatasets = {
  // Dateline crossing routes
  datelineCrossingRoutes: [
    {
      id: 'dateline-route-001',
      type: 'evacuation',
      geometry: {
        type: 'LineString',
        coordinates: [
          [179.9, 37.7749], // Near dateline
          [-179.9, 37.7749] // Cross dateline
        ]
      },
      properties: {
        name: 'Dateline Crossing Route',
        distance: 20000, // meters
        duration: 10000, // seconds
        safetyScore: 0.8,
        lastUpdated: new Date(2024, 0, 1).toISOString()
      }
    }
  ],
  
  // Polar region tiles
  polarRegionTiles: [
    {
      z: 4, x: 0, y: 0,
      data: {
        type: 'hazard',
        severity: 'low',
        confidence: 0.6,
        timestamp: new Date(2024, 0, 1).toISOString(),
        region: 'arctic'
      }
    },
    {
      z: 4, x: 0, y: 15,
      data: {
        type: 'hazard',
        severity: 'medium',
        confidence: 0.7,
        timestamp: new Date(2024, 0, 1).toISOString(),
        region: 'antarctic'
      }
    }
  ],
  
  // Tiny polygons
  tinyPolygons: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.4194, 37.7749],
          [-122.41941, 37.7749],
          [-122.41941, 37.77491],
          [-122.4194, 37.77491],
          [-122.4194, 37.7749]
        ]]
      },
      properties: {
        name: 'Tiny Polygon',
        area: 0.000001, // Very small area
        type: 'micro-hazard'
      }
    }
  ],
  
  // Mixed CRS data
  mixedCRSData: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        crs: 'EPSG:4326'
      },
      properties: {
        name: 'WGS84 Point',
        crs: 'EPSG:4326'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [548000, 4180000], // UTM coordinates
        crs: 'EPSG:32610'
      },
      properties: {
        name: 'UTM Point',
        crs: 'EPSG:32610'
      }
    }
  ]
};

// Helper functions
function generateRouteCoordinates(start: [number, number], end: [number, number], numPoints: number): [number, number][] {
  const coordinates: [number, number][] = [start];
  
  for (let i = 1; i < numPoints - 1; i++) {
    const t = i / (numPoints - 1);
    const lng = start[0] + (end[0] - start[0]) * t + seededRandom.nextFloat(-0.001, 0.001);
    const lat = start[1] + (end[1] - start[1]) * t + seededRandom.nextFloat(-0.001, 0.001);
    coordinates.push([lng, lat]);
  }
  
  coordinates.push(end);
  return coordinates;
}

function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateRouteDistance(coordinates: [number, number][]): number {
  let totalDistance = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i] as [number, number], coordinates[i + 1] as [number, number]);
  }
  
  return totalDistance;
}

// Export all datasets
export const deterministicDatasets = {
  h3Grids: h3GridDatasets,
  hazardTiles: hazardTileDatasets,
  routes: routeDatasets,
  edgeCases: edgeCaseDatasets
};

export default deterministicDatasets;

