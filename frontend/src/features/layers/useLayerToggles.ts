import { useState, useCallback } from 'react';
import type { ToggleKey } from './layerRegistry';

export interface LayerToggleDescriptor {
  key: ToggleKey;
  label: string;
  checked: boolean;
}

export const useLayerToggles = () => {
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    buildings: true, // Default to ON
    terrain: false, // Default to OFF (performance consideration)
    hazards: true, // Default to ON
    units: true, // Default to ON
    routes: true, // Default to ON
    enhancedRouting: false, // Default to OFF (advanced feature)
  });

  const setToggle = useCallback((key: ToggleKey, on: boolean) => {
    setToggles(prev => ({ ...prev, [key]: on }));
  }, []);

  const toggleDescriptors: LayerToggleDescriptor[] = [
    { key: 'terrain', label: '3D Terrain', checked: toggles.terrain },
    { key: 'buildings', label: 'Buildings', checked: toggles.buildings },
    { key: 'hazards', label: 'Hazards', checked: toggles.hazards },
    { key: 'units', label: 'Emergency Units', checked: toggles.units },
    { key: 'routes', label: 'Evacuation Routes', checked: toggles.routes },
    { key: 'enhancedRouting', label: 'Enhanced Routing', checked: toggles.enhancedRouting },
  ];

  return {
    toggles,
    toggleDescriptors,
    setToggle,
  };
};
