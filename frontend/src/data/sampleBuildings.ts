import type { BuildingFeature } from '../types/building';

/**
 * Sample building data for testing 3D building visualization
 */
export const sampleBuildings: BuildingFeature[] = [
  {
    id: 'building-1',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.4194, 37.7749],
        [-122.4195, 37.7749],
        [-122.4195, 37.7750],
        [-122.4194, 37.7750],
        [-122.4194, 37.7749]
      ]]
    },
    properties: {
      height: 50,
      min_height: 0,
      building_type: 'Office Building',
      emergency_access: true,
      population_capacity: 200,
      address: '123 Main St',
      construction_year: 2020,
      hazard_level: 'low'
    }
  },
  {
    id: 'building-2',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.4196, 37.7749],
        [-122.4197, 37.7749],
        [-122.4197, 37.7750],
        [-122.4196, 37.7750],
        [-122.4196, 37.7749]
      ]]
    },
    properties: {
      height: 30,
      min_height: 0,
      building_type: 'Residential',
      emergency_access: false,
      population_capacity: 50,
      address: '456 Oak Ave',
      construction_year: 2018,
      hazard_level: 'medium'
    }
  },
  {
    id: 'building-3',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.4198, 37.7749],
        [-122.4199, 37.7749],
        [-122.4199, 37.7750],
        [-122.4198, 37.7750],
        [-122.4198, 37.7749]
      ]]
    },
    properties: {
      height: 80,
      min_height: 0,
      building_type: 'Hospital',
      emergency_access: true,
      population_capacity: 500,
      address: '789 Emergency Blvd',
      construction_year: 2022,
      hazard_level: 'low'
    }
  },
  {
    id: 'building-4',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.4200, 37.7749],
        [-122.4201, 37.7749],
        [-122.4201, 37.7750],
        [-122.4200, 37.7750],
        [-122.4200, 37.7749]
      ]]
    },
    properties: {
      height: 25,
      min_height: 0,
      building_type: 'School',
      emergency_access: true,
      population_capacity: 300,
      address: '321 Education Way',
      construction_year: 2015,
      hazard_level: 'low'
    }
  },
  {
    id: 'building-5',
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.4202, 37.7749],
        [-122.4203, 37.7749],
        [-122.4203, 37.7750],
        [-122.4202, 37.7750],
        [-122.4202, 37.7749]
      ]]
    },
    properties: {
      height: 40,
      min_height: 0,
      building_type: 'Warehouse',
      emergency_access: false,
      population_capacity: 20,
      address: '654 Industrial Rd',
      construction_year: 2019,
      hazard_level: 'high'
    }
  }
];

/**
 * Generate random buildings for stress testing
 */
export function generateRandomBuildings(count: number): BuildingFeature[] {
  const buildings: BuildingFeature[] = [];
  const buildingTypes = ['Office', 'Residential', 'Hospital', 'School', 'Warehouse', 'Retail', 'Industrial'];
  const hazardLevels: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < count; i++) {
    const lng = -122.4194 + (Math.random() - 0.5) * 0.01;
    const lat = 37.7749 + (Math.random() - 0.5) * 0.01;
    
    buildings.push({
      id: `random-building-${i}`,
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng, lat],
          [lng + 0.0001, lat],
          [lng + 0.0001, lat + 0.0001],
          [lng, lat + 0.0001],
          [lng, lat]
        ]]
      },
      properties: {
        height: Math.floor(Math.random() * 100) + 10,
        min_height: 0,
        building_type: buildingTypes[Math.floor(Math.random() * buildingTypes.length)] || 'Office',
        emergency_access: Math.random() > 0.5,
        population_capacity: Math.floor(Math.random() * 1000) + 10,
        address: `${Math.floor(Math.random() * 9999)} Random St`,
        construction_year: 2010 + Math.floor(Math.random() * 15),
        hazard_level: hazardLevels[Math.floor(Math.random() * hazardLevels.length)] || 'low'
      }
    });
  }
  
  return buildings;
}

/**
 * Get buildings by type
 */
export function getBuildingsByType(buildings: BuildingFeature[], type: string): BuildingFeature[] {
  return buildings.filter(building => building.properties.building_type === type);
}

/**
 * Get buildings with emergency access
 */
export function getEmergencyAccessBuildings(buildings: BuildingFeature[]): BuildingFeature[] {
  return buildings.filter(building => building.properties.emergency_access);
}

/**
 * Get buildings by hazard level
 */
export function getBuildingsByHazardLevel(buildings: BuildingFeature[], level: string): BuildingFeature[] {
  return buildings.filter(building => building.properties.hazard_level === level);
}
