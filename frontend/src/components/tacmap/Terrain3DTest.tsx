import React, { useState } from 'react';
import { Terrain3D } from './Terrain3D';
import { motion } from 'framer-motion';
import { 
  Mountain, 
  Eye,
  EyeOff,
  RotateCcw,
  MapPin,
  Settings,
  Info
} from 'lucide-react';

export const Terrain3DTest: React.FC = () => {
  const [elevation, setElevation] = useState(1.5);
  const [showControls, setShowControls] = useState(true);
  const [center, setCenter] = useState<[number, number]>([-122.4194, 37.7749]);

  const presetLocations = [
    { name: 'San Francisco', coords: [-122.4194, 37.7749] as [number, number], description: 'Urban area with buildings & vegetation' },
    { name: 'Yosemite', coords: [-119.5383, 37.8651] as [number, number], description: 'Mountainous terrain with forests' },
    { name: 'Mount Whitney', coords: [-118.2923, 36.5785] as [number, number], description: 'Highest peak with alpine vegetation' },
    { name: 'Death Valley', coords: [-116.8231, 36.5323] as [number, number], description: 'Desert terrain with sparse vegetation' },
    { name: 'Lake Tahoe', coords: [-120.0324, 39.0968] as [number, number], description: 'Alpine lake with surrounding forests' }
  ];

  const handleLocationChange = (coords: [number, number]) => {
    setCenter(coords);
  };

  const resetView = () => {
    setElevation(1.5);
    setCenter([-122.4194, 37.7749]);
  };

  return (
    <div className="h-screen w-full bg-secondary relative overflow-hidden">
      {/* Header - Minimalist and clean */}
      <div className="absolute top-0 left-0 right-0 z-30 glass-enhanced border-b border-light">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="heading-5 text-primary">3D Terrain Visualization</h1>
                <p className="caption text-secondary">Real-time heightmap rendering with building footprints and vegetation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowControls(!showControls)}
                className="btn btn-ghost btn-sm flex items-center gap-2"
              >
                {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="body-small">{showControls ? 'Hide' : 'Show'} Controls</span>
              </button>
              
              <button
                onClick={resetView}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="body-small">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Panel - Elegant and refined */}
      {showControls && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-6 top-24 z-20 glass-enhanced rounded-2xl p-8 w-96 shadow-lg border border-light"
        >
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 pb-6 border-b border-light">
              <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h3 className="heading-5 text-primary">Terrain Controls</h3>
            </div>

            {/* Elevation Control */}
            <div className="space-y-4">
              <label className="body-medium text-primary font-medium">
                Elevation Multiplier: <span className="text-accent-blue font-semibold">{elevation}x</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={elevation}
                  onChange={(e) => setElevation(parseFloat(e.target.value))}
                  className="w-full h-2 bg-warm-gray-200 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${(elevation - 0.1) / 2.9 * 100}%, var(--warm-gray-200) ${(elevation - 0.1) / 2.9 * 100}%, var(--warm-gray-200) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-secondary mt-2">
                  <span>0.1x</span>
                  <span>1.5x</span>
                  <span>3.0x</span>
                </div>
              </div>
            </div>

            {/* Location Presets */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <label className="body-medium text-primary font-medium">Location Presets</label>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {presetLocations.map((location) => (
                  <button
                    key={location.name}
                    onClick={() => handleLocationChange(location.coords)}
                    className={`location-preset ${
                      center[0] === location.coords[0] && center[1] === location.coords[1]
                        ? 'selected'
                        : ''
                    }`}
                  >
                    <div className="font-medium body-medium mb-1">{location.name}</div>
                    <div className="text-xs opacity-75 mb-2">
                      {location.coords[1].toFixed(4)}, {location.coords[0].toFixed(4)}
                    </div>
                    <div className="text-xs opacity-60">
                      {location.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <h4 className="body-medium text-primary font-medium">Features</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Real-time heightmap generation',
                  'Building footprints with heights',
                  'Dynamic vegetation (trees, forests, brush)',
                  'Mountain peaks & terrain features',
                  'Atmospheric effects & fog',
                  'Water body rendering',
                  'Interactive 3D controls',
                  'Shadow mapping & lighting'
                ].map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-dot"></div>
                    <span className="body-small text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-accent-blue-light rounded-xl p-4 border border-accent-blue">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-accent-blue" />
                <h4 className="body-medium text-accent-blue font-medium">Controls</h4>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {[
                  'Mouse: Rotate camera',
                  'Scroll: Zoom in/out',
                  'Right-click: Pan view',
                  'Toggle button: Switch 2D/3D'
                ].map((control, index) => (
                  <div key={index} className="control-instruction">
                    <span className="control-bullet">•</span>
                    <span className="body-small text-accent-blue">{control}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Terrain Component */}
      <div className="h-full w-full">
        <Terrain3D
          center={center}
          zoom={12}
          elevation={elevation}
          onTerrainLoad={() => console.log('3D Terrain loaded')}
          className="h-full w-full"
        />
      </div>

      {/* Info Panel - Subtle and unobtrusive */}
      <div className="absolute bottom-4 right-4 z-20 glass rounded-xl p-4 max-w-xs shadow-sm border border-light opacity-80 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-accent-blue rounded-md flex items-center justify-center">
            <Info className="w-3 h-3 text-white" />
          </div>
          <h3 className="body-medium text-primary font-medium">Terrain Features</h3>
        </div>
        
        <div className="space-y-2">
          {[
            { icon: '🏢', title: 'Buildings', desc: '3D structures with heights', color: 'text-accent-blue' },
            { icon: '🌳', title: 'Vegetation', desc: 'Trees, forests, brush', color: 'text-accent-green' },
            { icon: '🗺️', title: 'Heightmap', desc: 'Realistic elevation data', color: 'text-accent-orange' },
            { icon: '⛰️', title: 'Peaks', desc: 'Mountain geometries', color: 'text-accent-red' }
          ].map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-sm">{feature.icon}</span>
              <div className="min-w-0 flex-1">
                <div className={`caption font-medium ${feature.color} mb-0.5`}>
                  {feature.title}
                </div>
                <div className="caption text-tertiary">
                  {feature.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading is handled by Terrain3D component */}
    </div>
  );
};
