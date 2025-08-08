import React from 'react';
import { Terrain3DViewer } from './Terrain3DViewer';

// Example usage of the reusable Terrain3DViewer component
export const Terrain3DTest: React.FC = () => {
  return (
    <Terrain3DViewer
      title="3D Terrain Visualization"
      subtitle="Real-time heightmap rendering with building footprints and vegetation"
      initialLocation={[-122.4194, 37.7749]}
      initialElevation={1.5}
      initialZoom={12}
      onTerrainLoad={() => console.log('3D Terrain loaded')}
      onLocationChange={(coords, preset) => console.log('Location changed to:', preset.name, coords)}
      onElevationChange={(elevation) => console.log('Elevation changed to:', elevation)}
      onReset={() => console.log('View reset')}
    />
  );
};
