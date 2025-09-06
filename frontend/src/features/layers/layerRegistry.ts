export const LAYER_IDS = {
  buildings: ['3d-buildings'],
  terrain: [], // Terrain is controlled via map.setTerrain(...)
  hazards: ['hazards-layer'],
  units: ['units-layer'],
  routes: ['routes-layer'],
  enhancedRouting: ['enhanced-routes', 'terrain-analysis', 'obstacle-analysis'],
} as const;

export type ToggleKey = keyof typeof LAYER_IDS;
