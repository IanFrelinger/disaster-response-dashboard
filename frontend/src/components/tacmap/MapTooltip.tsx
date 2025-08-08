import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Users, Fuel } from 'lucide-react';
import { TooltipData } from '@/types/tacmap';

interface MapTooltipProps {
  data: TooltipData;
  onClose: () => void;
}

export const MapTooltip: React.FC<MapTooltipProps> = ({ data, onClose }) => {
  const [position, setPosition] = useState(data.position);

  // Update position when data changes
  useEffect(() => {
    setPosition(data.position);
  }, [data.position]);

  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const renderTooltipContent = () => {
    const { type, title, content } = data;

    switch (type) {
      case 'unit':
        return renderUnitTooltip(title, content);
      case 'hazard':
        return renderHazardTooltip(title, content);
      case 'evacuation':
        return renderEvacuationTooltip(title, content);
      case 'hexagon':
        return renderHexagonTooltip(title, content);
      default:
        return renderDefaultTooltip(title, content);
    }
  };

  const renderUnitTooltip = (title: string, content: any) => (
    <>
      <div className="tooltip-header">
        <div className={`tooltip-icon unit-icon status-${content.status}`}></div>
        <span className="tooltip-title">{title}</span>
        <button
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>
      <div className="tooltip-body">
        <div className="tooltip-row">
          <span className="label">STATUS:</span>
          <span className={`value status-${content.status}`}>
            {content.status?.toUpperCase()}
          </span>
        </div>
        <div className="tooltip-row">
          <span className="label">PERSONNEL:</span>
          <span className="value flex items-center gap-1">
            <Users size={12} />
            {content.personnel || 0}
          </span>
        </div>
        <div className="tooltip-row">
          <span className="label">FUEL:</span>
          <span className="value flex items-center gap-1">
            <Fuel size={12} />
            {content.fuel || 0}%
          </span>
        </div>
        <div className="tooltip-progress">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${content.fuel || 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="progress-label">FUEL: {content.fuel || 0}%</span>
        </div>
      </div>
    </>
  );

  const renderHazardTooltip = (title: string, content: any) => {
    const severity = content.severity || 'medium';
    const timeToImpact = content.timeToImpact || 'Unknown';
    
    return (
      <>
        <div className={`tooltip-header hazard-${severity}`}>
          <div className="tooltip-icon hazard-icon pulse"></div>
          <span className="tooltip-title">{title}</span>
          <button
            className="ml-auto text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>
        <div className="tooltip-body">
          <div className="tooltip-alert">
            <AlertTriangle size={14} />
            <span className="alert-text">DANGER ZONE</span>
          </div>
          <div className="tooltip-row">
            <span className="label">SEVERITY:</span>
            <span className={`value severity-${severity}`}>
              {severity.toUpperCase()}
            </span>
          </div>
          <div className="tooltip-row">
            <span className="label">TIME TO IMPACT:</span>
            <span className="value countdown">{timeToImpact}</span>
          </div>
          <div className="tooltip-row">
            <span className="label">SPREAD RATE:</span>
            <span className="value">{content.spreadRate || 0} km/h</span>
          </div>
        </div>
      </>
    );
  };

  const renderEvacuationTooltip = (title: string, content: any) => (
    <>
      <div className="tooltip-header">
        <div className="tooltip-icon evacuation-icon"></div>
        <span className="tooltip-title">{title}</span>
        <button
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>
      <div className="tooltip-body">
        <div className="tooltip-row">
          <span className="label">STATUS:</span>
          <span className={`value status-${content.status}`}>
            {content.status?.toUpperCase()}
          </span>
        </div>
        <div className="tooltip-row">
          <span className="label">CAPACITY:</span>
          <span className="value">{content.capacity || 0}</span>
        </div>
        <div className="tooltip-row">
          <span className="label">CURRENT USAGE:</span>
          <span className="value">{content.currentUsage || 0}</span>
        </div>
        <div className="tooltip-row">
          <span className="label">EST. TIME:</span>
          <span className="value">{content.estimatedTime || 0} min</span>
        </div>
      </div>
    </>
  );

  const renderHexagonTooltip = (title: string, content: any) => (
    <>
      <div className="tooltip-header">
        <div className="tooltip-icon hexagon-icon"></div>
        <span className="tooltip-title">{title}</span>
        <button
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>
      <div className="tooltip-body">
        <div className="tooltip-row">
          <span className="label">GRID ID:</span>
          <span className="value">{content.h3Index || 'Unknown'}</span>
        </div>
        <div className="tooltip-row">
          <span className="label">UNITS:</span>
          <span className="value">{content.units || 0}</span>
        </div>
        <div className="tooltip-row">
          <span className="label">HAZARDS:</span>
          <span className="value">{content.hazards || 0}</span>
        </div>
      </div>
    </>
  );

  const renderDefaultTooltip = (title: string, content: any) => (
    <>
      <div className="tooltip-header">
        <div className="tooltip-icon"></div>
        <span className="tooltip-title">{title}</span>
        <button
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>
      <div className="tooltip-body">
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="tooltip-row">
            <span className="label">{key.toUpperCase()}:</span>
            <span className="value">{String(value)}</span>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <AnimatePresence>
      <motion.div
        className="tacmap-tooltip"
        style={{
          left: position.x + 10,
          top: position.y + 10
        }}
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onMouseEnter={(e) => e.stopPropagation()}
        onMouseLeave={onClose}
      >
        {renderTooltipContent()}
      </motion.div>
    </AnimatePresence>
  );
};
