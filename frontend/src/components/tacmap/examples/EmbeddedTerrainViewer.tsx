import React from 'react';
import { Terrain3DViewer } from '../Terrain3DViewer';

// Example: Embedded terrain viewer for use within other components
export const EmbeddedTerrainViewer: React.FC = () => {
  return (
    <div className="embedded-terrain-container">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="heading-3 text-primary mb-2">Embedded Terrain Visualization</h2>
          <p className="body-medium text-secondary">
            This terrain viewer is embedded within a larger page layout and demonstrates
            how the component can be integrated into existing designs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with additional content */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="heading-5 text-primary mb-4">Terrain Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="body-medium font-medium text-primary mb-2">Current Location</h4>
                  <p className="body-small text-secondary">San Francisco Bay Area</p>
                </div>
                <div>
                  <h4 className="body-medium font-medium text-primary mb-2">Elevation Range</h4>
                  <p className="body-small text-secondary">0.1x to 3.0x multiplier</p>
                </div>
                <div>
                  <h4 className="body-medium font-medium text-primary mb-2">Features</h4>
                  <ul className="space-y-1">
                    <li className="body-small text-secondary">• 3D Building Footprints</li>
                    <li className="body-small text-secondary">• Dynamic Vegetation</li>
                    <li className="body-small text-secondary">• Real-time Heightmap</li>
                    <li className="body-small text-secondary">• Interactive Controls</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Embedded terrain viewer */}
          <div className="lg:col-span-2">
            <div className="relative h-96 rounded-xl overflow-hidden border border-light">
              <Terrain3DViewer
                title=""
                subtitle=""
                showHeader={false}
                showControls={true}
                showInfoPanel={false}
                showLocationPresets={true}
                showElevationControl={true}
                showFeaturesList={false}
                showInstructions={false}
                className="h-full"
                terrainClassName="h-full"
                onLocationChange={(coords, preset) => {
                  console.log('Embedded viewer location changed:', preset.name);
                }}
                onElevationChange={(elevation) => {
                  console.log('Embedded viewer elevation changed:', elevation);
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Additional content below */}
        <div className="mt-6">
          <div className="card p-6">
            <h3 className="heading-5 text-primary mb-4">Usage Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="body-medium font-medium text-primary mb-2">Integration</h4>
                <p className="body-small text-secondary">
                  The terrain viewer can be embedded in any container with a defined height.
                  Simply set the container height and the viewer will adapt accordingly.
                </p>
              </div>
              <div>
                <h4 className="body-medium font-medium text-primary mb-2">Customization</h4>
                <p className="body-small text-secondary">
                  All UI elements can be toggled on/off, and custom content can be provided
                  through props for maximum flexibility in different contexts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
