import React, { useState, useCallback, ReactNode } from 'react';
import { Terrain3D } from './Terrain3D';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mountain, 
  Eye,
  EyeOff,
  RotateCcw,
  MapPin,
  Settings,
  Info,
  LucideIcon
} from 'lucide-react';

// Types for configuration
export interface LocationPreset {
  id: string;
  name: string;
  coords: [number, number];
  description: string;
  category?: string;
}

export interface TerrainFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  category?: string;
}

export interface ControlInstruction {
  id: string;
  text: string;
  category?: string;
}

export interface Terrain3DViewerProps {
  // Core configuration
  title?: string;
  subtitle?: string;
  initialLocation?: [number, number];
  initialElevation?: number;
  initialZoom?: number;
  
  // Location presets
  locationPresets?: LocationPreset[];
  defaultLocationPresets?: boolean;
  
  // Features and instructions
  terrainFeatures?: TerrainFeature[];
  controlInstructions?: ControlInstruction[];
  defaultFeatures?: boolean;
  defaultInstructions?: boolean;
  
  // UI configuration
  showHeader?: boolean;
  showControls?: boolean;
  showInfoPanel?: boolean;
  showLocationPresets?: boolean;
  showElevationControl?: boolean;
  showFeaturesList?: boolean;
  showInstructions?: boolean;
  
  // Styling and layout
  className?: string;
  headerClassName?: string;
  controlsClassName?: string;
  infoPanelClassName?: string;
  terrainClassName?: string;
  
  // Callbacks
  onLocationChange?: (coords: [number, number], preset: LocationPreset) => void;
  onElevationChange?: (elevation: number) => void;
  onTerrainLoad?: () => void;
  onReset?: () => void;
  
  // Custom components
  customHeader?: ReactNode;
  customControls?: ReactNode;
  customInfoPanel?: ReactNode;
  
  // Advanced configuration
  enableAnimations?: boolean;
  enableHoverEffects?: boolean;
  enableKeyboardControls?: boolean;
  enableTouchControls?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
}

// Default configurations
const DEFAULT_LOCATION_PRESETS: LocationPreset[] = [
  { 
    id: 'san-francisco',
    name: 'San Francisco', 
    coords: [-122.4194, 37.7749], 
    description: 'Urban area with buildings & vegetation',
    category: 'urban'
  },
  { 
    id: 'yosemite',
    name: 'Yosemite', 
    coords: [-119.5383, 37.8651], 
    description: 'Mountainous terrain with forests',
    category: 'natural'
  },
  { 
    id: 'mount-whitney',
    name: 'Mount Whitney', 
    coords: [-118.2923, 36.5785], 
    description: 'Highest peak with alpine vegetation',
    category: 'natural'
  },
  { 
    id: 'death-valley',
    name: 'Death Valley', 
    coords: [-116.8231, 36.5323], 
    description: 'Desert terrain with sparse vegetation',
    category: 'desert'
  },
  { 
    id: 'lake-tahoe',
    name: 'Lake Tahoe', 
    coords: [-120.0324, 39.0968], 
    description: 'Alpine lake with surrounding forests',
    category: 'natural'
  }
];

const DEFAULT_TERRAIN_FEATURES: TerrainFeature[] = [
  { 
    id: 'buildings',
    icon: '🏢', 
    title: 'Buildings', 
    description: '3D structures with heights', 
    color: 'text-accent-blue',
    category: 'structures'
  },
  { 
    id: 'vegetation',
    icon: '🌳', 
    title: 'Vegetation', 
    description: 'Trees, forests, brush', 
    color: 'text-accent-green',
    category: 'environment'
  },
  { 
    id: 'heightmap',
    icon: '🗺️', 
    title: 'Heightmap', 
    description: 'Realistic elevation data', 
    color: 'text-accent-orange',
    category: 'terrain'
  },
  { 
    id: 'peaks',
    icon: '⛰️', 
    title: 'Peaks', 
    description: 'Mountain geometries', 
    color: 'text-accent-red',
    category: 'terrain'
  }
];

const DEFAULT_CONTROL_INSTRUCTIONS: ControlInstruction[] = [
  { id: 'mouse-rotate', text: 'Mouse: Rotate camera', category: 'navigation' },
  { id: 'scroll-zoom', text: 'Scroll: Zoom in/out', category: 'navigation' },
  { id: 'right-click-pan', text: 'Right-click: Pan view', category: 'navigation' },
  { id: 'toggle-2d-3d', text: 'Toggle button: Switch 2D/3D', category: 'view' }
];

export const Terrain3DViewer: React.FC<Terrain3DViewerProps> = ({
  // Core configuration
  title = '3D Terrain Visualization',
  subtitle = 'Real-time heightmap rendering with building footprints and vegetation',
  initialLocation = [-122.4194, 37.7749],
  initialElevation = 1.5,
  initialZoom = 12,
  
  // Location presets
  locationPresets,
  defaultLocationPresets = true,
  
  // Features and instructions
  terrainFeatures,
  controlInstructions,
  defaultFeatures = true,
  defaultInstructions = true,
  
  // UI configuration
  showHeader = true,
  showControls = true,
  showInfoPanel = true,
  showLocationPresets = true,
  showElevationControl = true,
  showFeaturesList = true,
  showInstructions = true,
  
  // Styling and layout
  className = '',
  headerClassName = '',
  controlsClassName = '',
  infoPanelClassName = '',
  terrainClassName = '',
  
  // Callbacks
  onLocationChange,
  onElevationChange,
  onTerrainLoad,
  onReset,
  
  // Custom components
  customHeader,
  customControls,
  customInfoPanel,
  
  // Advanced configuration
  enableAnimations = true,
  enableHoverEffects = true,
  enableKeyboardControls = true,
  enableTouchControls = true,
  
  // Accessibility
  ariaLabel,
  ariaDescription
}) => {
  // State management
  const [elevation, setElevation] = useState(initialElevation);
  const [showControlsPanel, setShowControlsPanel] = useState(showControls);
  const [center, setCenter] = useState<[number, number]>(initialLocation);

  // Use provided presets or defaults
  const presets = locationPresets || (defaultLocationPresets ? DEFAULT_LOCATION_PRESETS : []);
  const features = terrainFeatures || (defaultFeatures ? DEFAULT_TERRAIN_FEATURES : []);
  const instructions = controlInstructions || (defaultInstructions ? DEFAULT_CONTROL_INSTRUCTIONS : []);

  // Event handlers
  const handleLocationChange = useCallback((coords: [number, number]) => {
    setCenter(coords);
    const preset = presets.find(p => p.coords[0] === coords[0] && p.coords[1] === coords[1]);
    if (onLocationChange && preset) {
      onLocationChange(coords, preset);
    }
  }, [presets, onLocationChange]);

  const handleElevationChange = useCallback((newElevation: number) => {
    setElevation(newElevation);
    if (onElevationChange) {
      onElevationChange(newElevation);
    }
  }, [onElevationChange]);

  const handleReset = useCallback(() => {
    setElevation(initialElevation);
    setCenter(initialLocation);
    if (onReset) {
      onReset();
    }
  }, [initialElevation, initialLocation, onReset]);

  const handleTerrainLoad = useCallback(() => {
    if (onTerrainLoad) {
      onTerrainLoad();
    }
  }, [onTerrainLoad]);

  // Render functions
  const renderHeader = () => {
    if (!showHeader) return null;
    
    if (customHeader) {
      return customHeader;
    }

    return (
      <div className={`absolute top-0 left-0 right-0 z-30 glass-enhanced border-b border-light ${headerClassName}`}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="heading-5 text-primary">{title}</h1>
                <p className="caption text-secondary">{subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {showControls && (
                <button
                  onClick={() => setShowControlsPanel(!showControlsPanel)}
                  className="btn btn-ghost btn-sm flex items-center gap-2"
                >
                  {showControlsPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="body-small">{showControlsPanel ? 'Hide' : 'Show'} Controls</span>
                </button>
              )}
              
              <button
                onClick={handleReset}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="body-small">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderControls = () => {
    if (!showControls || !showControlsPanel) return null;
    
    if (customControls) {
      return customControls;
    }

    return (
      <AnimatePresence>
        {enableAnimations ? (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute left-6 top-24 z-20 glass-enhanced rounded-2xl p-8 w-96 shadow-lg border border-light ${controlsClassName}`}
          >
            {renderControlsContent()}
          </motion.div>
        ) : (
          <div className={`absolute left-6 top-24 z-20 glass-enhanced rounded-2xl p-8 w-96 shadow-lg border border-light ${controlsClassName}`}>
            {renderControlsContent()}
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderControlsContent = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-light">
        <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <h3 className="heading-5 text-primary">Terrain Controls</h3>
      </div>

      {/* Elevation Control */}
      {showElevationControl && (
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
              onChange={(e) => handleElevationChange(parseFloat(e.target.value))}
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
      )}

      {/* Location Presets */}
      {showLocationPresets && presets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            <label className="body-medium text-primary font-medium">Location Presets</label>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {presets.map((location) => (
              <button
                key={location.id}
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
      )}

      {/* Features List */}
      {showFeaturesList && features.length > 0 && (
        <div className="space-y-4">
          <h4 className="body-medium text-primary font-medium">Features</h4>
          <div className="grid grid-cols-1 gap-2">
            {features.map((feature) => (
              <div key={feature.id} className="feature-item">
                <div className="feature-dot"></div>
                <span className="body-small text-secondary">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {showInstructions && instructions.length > 0 && (
        <div className="bg-accent-blue-light rounded-xl p-4 border border-accent-blue">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-accent-blue" />
            <h4 className="body-medium text-accent-blue font-medium">Controls</h4>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {instructions.map((instruction) => (
              <div key={instruction.id} className="control-instruction">
                <span className="control-bullet">•</span>
                <span className="body-small text-accent-blue">{instruction.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInfoPanel = () => {
    if (!showInfoPanel) return null;
    
    if (customInfoPanel) {
      return customInfoPanel;
    }

    return (
      <div className={`absolute bottom-4 right-4 z-20 glass rounded-xl p-4 max-w-xs shadow-sm border border-light opacity-80 hover:opacity-100 transition-opacity duration-300 ${infoPanelClassName}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-accent-blue rounded-md flex items-center justify-center">
            <Info className="w-3 h-3 text-white" />
          </div>
          <h3 className="body-medium text-primary font-medium">Terrain Features</h3>
        </div>
        
        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-start gap-2">
              <span className="text-sm">{feature.icon}</span>
              <div className="min-w-0 flex-1">
                <div className={`caption font-medium ${feature.color} mb-0.5`}>
                  {feature.title}
                </div>
                <div className="caption text-tertiary">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`h-screen w-full bg-secondary relative overflow-hidden ${className}`}
      role="region"
      aria-label={ariaLabel || title}
      aria-description={ariaDescription || subtitle}
    >
      {renderHeader()}
      {renderControls()}

      {/* Terrain Component */}
      <div className={`h-full w-full ${terrainClassName}`}>
        <Terrain3D
          center={center}
          zoom={initialZoom}
          elevation={elevation}
          onTerrainLoad={handleTerrainLoad}
          className="h-full w-full"
        />
      </div>

      {renderInfoPanel()}
    </div>
  );
};

// Export default configuration for easy use
export const defaultTerrain3DViewerProps: Partial<Terrain3DViewerProps> = {
  title: '3D Terrain Visualization',
  subtitle: 'Real-time heightmap rendering with building footprints and vegetation',
  initialLocation: [-122.4194, 37.7749],
  initialElevation: 1.5,
  initialZoom: 12,
  showHeader: true,
  showControls: true,
  showInfoPanel: true,
  showLocationPresets: true,
  showElevationControl: true,
  showFeaturesList: true,
  showInstructions: true,
  enableAnimations: true,
  enableHoverEffects: true,
  enableKeyboardControls: true,
  enableTouchControls: true,
  defaultLocationPresets: true,
  defaultFeatures: true,
  defaultInstructions: true
};

// Export types for external use
export type { Terrain3DViewerProps, LocationPreset, TerrainFeature, ControlInstruction };
