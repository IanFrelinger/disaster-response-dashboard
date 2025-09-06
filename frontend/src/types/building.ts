/**
 * Building feature data structure for 3D visualization
 */

export interface BuildingFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    height: number;
    min_height: number;
    building_type: string;
    emergency_access: boolean;
    population_capacity: number;
    address?: string;
    construction_year?: number;
    hazard_level?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface BuildingLayer {
  id: string;
  type: 'fill-extrusion';
  source: string;
  paint: {
    'fill-extrusion-height': number | string[];
    'fill-extrusion-base': number | string[];
    'fill-extrusion-color': string | string[];
    'fill-extrusion-opacity': number;
    'fill-extrusion-translate'?: [number, number];
    'fill-extrusion-translate-anchor'?: 'map' | 'viewport';
  };
  filter?: any[];
  layout?: {
    visibility?: 'visible' | 'none';
  };
}

export interface BuildingSource {
  id: string;
  type: 'geojson';
  data: {
    type: 'FeatureCollection';
    features: BuildingFeature[];
  };
  cluster?: boolean;
  clusterMaxZoom?: number;
  clusterRadius?: number;
}

export interface BuildingInteraction {
  onHover?: (feature: BuildingFeature, event: any) => void;
  onClick?: (feature: BuildingFeature, event: any) => void;
  onSelect?: (feature: BuildingFeature) => void;
}

export interface BuildingStyle {
  height: number;
  color: string;
  opacity: number;
  baseHeight?: number;
  emergencyHighlight?: boolean;
}

export interface BuildingFilter {
  buildingTypes?: string[];
  heightRange?: [number, number];
  emergencyAccess?: boolean;
  hazardLevel?: string[];
  populationRange?: [number, number];
}

export interface BuildingMetrics {
  totalBuildings: number;
  totalHeight: number;
  averageHeight: number;
  emergencyAccessCount: number;
  highHazardCount: number;
  totalCapacity: number;
}
