import React from 'react';
import { TacticalMap } from './TacticalMap';

export const SimpleTest: React.FC = () => {
  const handleMapLoad = () => {
    console.log('✅ Map loaded successfully');
  };

  const handleFeatureClick = (feature: any) => {
    console.log('✅ Feature clicked:', feature);
  };

  const handleFeatureHover = (feature: any) => {
    console.log('✅ Feature hovered:', feature);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 text-white p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Simple Tactical Map Test</h1>
        <p className="text-gray-300">Basic functionality verification</p>
      </div>
      
      <div className="flex-1 relative">
        <TacticalMap
          center={[-122.4194, 37.7749]}
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
      
      <div className="bg-gray-800 text-white p-4 border-t border-gray-700">
        <div className="text-sm">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ul className="space-y-1 text-gray-300">
            <li>• Check browser console for map load confirmation</li>
            <li>• Try zooming with mouse wheel</li>
            <li>• Try panning by clicking and dragging</li>
            <li>• Hover over map features to see tooltips</li>
            <li>• Right-click for context menus</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
