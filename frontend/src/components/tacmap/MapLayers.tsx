import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Flame, Route, Users, Map } from 'lucide-react';

interface MapLayersProps {
  showHazards: boolean;
  showRoutes: boolean;
  showResources: boolean;
  showBoundaries: boolean;
  onClose: () => void;
  onToggleHazards?: (show: boolean) => void;
  onToggleRoutes?: (show: boolean) => void;
  onToggleResources?: (show: boolean) => void;
  onToggleBoundaries?: (show: boolean) => void;
}

export const MapLayers: React.FC<MapLayersProps> = ({
  showHazards,
  showRoutes,
  showResources,
  showBoundaries,
  onClose,
  onToggleHazards,
  onToggleRoutes,
  onToggleResources,
  onToggleBoundaries
}) => {
  const layers = [
    {
      id: 'hazards',
      label: 'Hazard Zones',
      icon: Flame,
      visible: showHazards,
      color: 'text-red-400',
      description: 'Fire, flood, and other hazard areas'
    },
    {
      id: 'routes',
      label: 'Evacuation Routes',
      icon: Route,
      visible: showRoutes,
      color: 'text-green-400',
      description: 'Emergency evacuation and response routes'
    },
    {
      id: 'resources',
      label: 'Emergency Units',
      icon: Users,
      visible: showResources,
      color: 'text-blue-400',
      description: 'Fire, police, and medical units'
    },
    {
      id: 'boundaries',
      label: 'Admin Boundaries',
      icon: Map,
      visible: showBoundaries,
      color: 'text-cyan-400',
      description: 'City, county, and district boundaries'
    }
  ];

  const handleToggle = (layerId: string, visible: boolean) => {
    switch (layerId) {
      case 'hazards':
        onToggleHazards?.(visible);
        break;
      case 'routes':
        onToggleRoutes?.(visible);
        break;
      case 'resources':
        onToggleResources?.(visible);
        break;
      case 'boundaries':
        onToggleBoundaries?.(visible);
        break;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="absolute top-16 left-4 z-1000"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="tacmap-panel p-4 min-w-64">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
              Map Layers
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Layer List */}
          <div className="space-y-2">
            {layers.map((layer) => {
              const IconComponent = layer.icon;
              return (
                <motion.div
                  key={layer.id}
                  className="flex items-center justify-between p-2 rounded border border-gray-700 hover:border-cyan-500 transition-colors"
                  whileHover={{ backgroundColor: 'rgba(0, 255, 255, 0.05)' }}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent 
                      size={16} 
                      className={layer.color}
                    />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {layer.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        {layer.description}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggle(layer.id, !layer.visible)}
                    className="p-1 rounded hover:bg-cyan-500 hover:bg-opacity-20 transition-colors"
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? (
                      <Eye size={14} className="text-cyan-400" />
                    ) : (
                      <EyeOff size={14} className="text-gray-500" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Legend
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-300">Critical Hazards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-gray-300">High Risk Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Safe Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Emergency Units</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
