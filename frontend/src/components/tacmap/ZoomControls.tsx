import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ZoomControlsProps {
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentZoom,
  onZoomIn,
  onZoomOut,
  className = ""
}) => {
  const zoomPercentage = ((currentZoom - 3) / (20 - 3)) * 100;

  return (
    <div className={`zoom-controls ${className}`}>
      {/* Zoom In Button */}
      <motion.button
        className="tacmap-button zoom-in"
        onClick={onZoomIn}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Zoom In"
      >
        <Plus size={16} />
      </motion.button>

      {/* Zoom Level Indicator */}
      <motion.div
        className="zoom-level-indicator"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="label">ZOOM</span>
        <span className="value">{currentZoom.toFixed(1)}</span>
        <div className="zoom-bar">
          <motion.div
            className="zoom-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${zoomPercentage}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Zoom Out Button */}
      <motion.button
        className="tacmap-button zoom-out"
        onClick={onZoomOut}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Zoom Out"
      >
        <Minus size={16} />
      </motion.button>
    </div>
  );
};
