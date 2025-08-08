import React, { useState } from 'react';
import { TacticalMap } from './TacticalMap';

export const TacticalMapTest: React.FC = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMapLoad = () => {
    console.log('Tactical map loaded successfully');
    setMapLoaded(true);
    setError(null);
  };

  const handleFeatureClick = (feature: any) => {
    console.log('Feature clicked:', feature);
  };

  const handleFeatureHover = (feature: any) => {
    console.log('Feature hovered:', feature);
  };

  // const handleMapError = (error: string) => {
  //   console.error('Map error:', error);
  //   setError(error);
  // };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Tactical Map Test</h1>
        <p className="text-gray-300">
          Halo Infinite-inspired disaster response tactical map
        </p>
        {mapLoaded && (
          <div className="mt-2 text-green-400 text-sm">
            ✓ Map loaded successfully
          </div>
        )}
        {error && (
          <div className="mt-2 text-red-400 text-sm">
            ✗ Error: {error}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <TacticalMap
          center={[-122.4194, 37.7749]} // San Francisco
          zoom={12}
          showHazards={true}
          showRoutes={true}
          showResources={true}
          showBoundaries={true}
          onMapLoad={handleMapLoad}
          onFeatureClick={handleFeatureClick}
          onFeatureHover={handleFeatureHover}
          className="h-full w-full"
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-800 text-white p-4 border-t border-gray-700">
        <h3 className="font-semibold mb-2">Controls:</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Mouse wheel: Zoom in/out</li>
          <li>• Click and drag: Pan the map</li>
          <li>• Hover over features: Show tooltips</li>
          <li>• Right-click: Context menu</li>
          <li>• Arrow keys: Pan with keyboard</li>
          <li>• +/- keys: Zoom with keyboard</li>
        </ul>
      </div>
    </div>
  );
};
