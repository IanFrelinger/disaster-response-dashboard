export interface LayerToggleState {
  terrain: boolean;
  buildings: boolean;
  hazards: boolean;
  units: boolean;
  routes: boolean;
}

export interface LayerData {
  hazards: any[];
  units: any[];
  routes: any[];
}

export interface LayerCallbacks {
  onLayerReady?: (layerName: string) => void;
  onLayerError?: (layerName: string, error: string) => void;
  onHazardClick?: (hazard: any) => void;
  onUnitClick?: (unit: any) => void;
  onRouteClick?: (route: any) => void;
}
