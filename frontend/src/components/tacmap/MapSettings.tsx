import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Satellite, Mountain, Map, Monitor, Smartphone } from 'lucide-react';

interface MapSettingsProps {
  mapStyle: 'satellite' | 'terrain' | 'street';
  onStyleChange: (style: 'satellite' | 'terrain' | 'street') => void;
  onClose: () => void;
}

export const MapSettings: React.FC<MapSettingsProps> = ({
  mapStyle,
  onStyleChange,
  onClose
}) => {
  const mapStyles = [
    {
      id: 'street',
      label: 'Street View',
      icon: Map,
      description: 'Standard street map with labels',
      preview: 'bg-gradient-to-br from-gray-800 to-gray-900'
    },
    {
      id: 'satellite',
      label: 'Satellite',
      icon: Satellite,
      description: 'High-resolution satellite imagery',
      preview: 'bg-gradient-to-br from-green-800 to-green-900'
    },
    {
      id: 'terrain',
      label: 'Terrain',
      icon: Mountain,
      description: 'Topographic terrain view',
      preview: 'bg-gradient-to-br from-yellow-800 to-brown-900'
    }
  ];

  const performanceModes = [
    {
      id: 'auto',
      label: 'Auto',
      description: 'Automatically adjust based on device',
      icon: Monitor
    },
    {
      id: 'high',
      label: 'High Quality',
      description: 'Maximum visual quality',
      icon: Monitor
    },
    {
      id: 'balanced',
      label: 'Balanced',
      description: 'Good quality and performance',
      icon: Monitor
    },
    {
      id: 'performance',
      label: 'Performance',
      description: 'Optimized for speed',
      icon: Smartphone
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="absolute top-16 left-16 z-1000"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="tacmap-panel p-4 min-w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
              Map Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Map Style Section */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Map Style
            </h4>
            <div className="space-y-2">
              {mapStyles.map((style) => {
                const IconComponent = style.icon;
                const isActive = mapStyle === style.id;
                
                return (
                  <motion.div
                    key={style.id}
                    className={`flex items-center gap-3 p-3 rounded border transition-all cursor-pointer ${
                      isActive 
                        ? 'border-cyan-500 bg-cyan-500 bg-opacity-10' 
                        : 'border-gray-700 hover:border-cyan-400 hover:bg-cyan-500 hover:bg-opacity-5'
                    }`}
                    onClick={() => onStyleChange(style.id as 'satellite' | 'terrain' | 'street')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-8 h-8 rounded ${style.preview} flex items-center justify-center`}>
                      <IconComponent size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {style.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        {style.description}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Performance Section */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Performance Mode
            </h4>
            <div className="space-y-2">
              {performanceModes.map((mode) => {
                const IconComponent = mode.icon;
                
                return (
                  <motion.div
                    key={mode.id}
                    className="flex items-center gap-3 p-2 rounded border border-gray-700 hover:border-cyan-400 hover:bg-cyan-500 hover:bg-opacity-5 transition-all cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <IconComponent size={14} className="text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {mode.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        {mode.description}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>



          {/* Display Options */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Display Options
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-sm text-white">Show 3D Buildings</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-sm text-white">Show Traffic</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-sm text-white">Show Weather</span>
              </label>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="tacmap-button text-xs py-2">
                Reset View
              </button>
              <button className="tacmap-button text-xs py-2">
                Save Preset
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
