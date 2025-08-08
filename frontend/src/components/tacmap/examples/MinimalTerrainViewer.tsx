import React from 'react';
import { Terrain3DViewer } from '../Terrain3DViewer';

// Example: Minimal terrain viewer with only essential features
export const MinimalTerrainViewer: React.FC = () => {
  return (
    <Terrain3DViewer
      title="Minimal Terrain View"
      subtitle="Essential 3D terrain visualization"
      showHeader={true}
      showControls={false}
      showInfoPanel={false}
      showLocationPresets={false}
      showElevationControl={false}
      showFeaturesList={false}
      showInstructions={false}
      enableAnimations={false}
      className="min-h-screen"
    />
  );
};
