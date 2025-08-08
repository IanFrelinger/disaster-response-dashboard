import React from 'react';
import { Terrain3DViewer, LocationPreset, TerrainFeature, ControlInstruction } from '../Terrain3DViewer';

// Example: Custom terrain viewer with specific location presets and features
export const CustomTerrainViewer: React.FC = () => {
  // Custom location presets for a specific region
  const customLocationPresets: LocationPreset[] = [
    {
      id: 'central-park',
      name: 'Central Park',
      coords: [-73.9654, 40.7829],
      description: 'Urban park with diverse vegetation',
      category: 'urban-park'
    },
    {
      id: 'empire-state',
      name: 'Empire State Building',
      coords: [-73.9857, 40.7484],
      description: 'Iconic skyscraper in Manhattan',
      category: 'landmark'
    },
    {
      id: 'brooklyn-bridge',
      name: 'Brooklyn Bridge',
      coords: [-73.9969, 40.7061],
      description: 'Historic bridge connecting boroughs',
      category: 'infrastructure'
    },
    {
      id: 'times-square',
      name: 'Times Square',
      coords: [-73.9855, 40.7580],
      description: 'Busy commercial intersection',
      category: 'commercial'
    }
  ];

  // Custom terrain features for urban environment
  const customTerrainFeatures: TerrainFeature[] = [
    {
      id: 'skyscrapers',
      icon: '🏙️',
      title: 'Skyscrapers',
      description: 'High-rise buildings with detailed facades',
      color: 'text-accent-blue',
      category: 'architecture'
    },
    {
      id: 'parks',
      icon: '🌳',
      title: 'Urban Parks',
      description: 'Green spaces and recreational areas',
      color: 'text-accent-green',
      category: 'environment'
    },
    {
      id: 'streets',
      icon: '🛣️',
      title: 'Street Network',
      description: 'Road infrastructure and traffic patterns',
      color: 'text-accent-orange',
      category: 'infrastructure'
    },
    {
      id: 'landmarks',
      icon: '🗽',
      title: 'Landmarks',
      description: 'Iconic buildings and monuments',
      color: 'text-accent-red',
      category: 'culture'
    },
    {
      id: 'subway',
      icon: '🚇',
      title: 'Subway System',
      description: 'Underground transportation network',
      color: 'text-purple-500',
      category: 'transportation'
    }
  ];

  // Custom control instructions for urban navigation
  const customControlInstructions: ControlInstruction[] = [
    { id: 'mouse-rotate', text: 'Mouse: Rotate camera around buildings', category: 'navigation' },
    { id: 'scroll-zoom', text: 'Scroll: Zoom in/out for street-level detail', category: 'navigation' },
    { id: 'right-click-pan', text: 'Right-click: Pan across the cityscape', category: 'navigation' },
    { id: 'building-highlight', text: 'Hover: Highlight building information', category: 'interaction' },
    { id: 'street-view', text: 'Double-click: Enter street-level view', category: 'view' }
  ];

  return (
    <Terrain3DViewer
      title="New York City 3D View"
      subtitle="Interactive urban terrain visualization with landmarks and infrastructure"
      initialLocation={[-73.9654, 40.7829]} // Central Park
      initialElevation={2.0}
      initialZoom={14}
      locationPresets={customLocationPresets}
      terrainFeatures={customTerrainFeatures}
      controlInstructions={customControlInstructions}
      defaultLocationPresets={false}
      defaultFeatures={false}
      defaultInstructions={false}
      onLocationChange={(coords, preset) => {
        console.log(`Navigating to ${preset.name} (${preset.category})`);
      }}
      onElevationChange={(elevation) => {
        console.log(`Building height multiplier: ${elevation}x`);
      }}
      onTerrainLoad={() => {
        console.log('NYC terrain loaded successfully');
      }}
      onReset={() => {
        console.log('Returning to Central Park view');
      }}
      className="nyc-terrain-viewer"
      headerClassName="nyc-header"
      controlsClassName="nyc-controls"
      infoPanelClassName="nyc-info-panel"
    />
  );
};
