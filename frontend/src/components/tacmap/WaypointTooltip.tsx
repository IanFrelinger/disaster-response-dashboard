import React from 'react';
import type { TooltipData } from '../../types/holographic-waypoints';
import './WaypointTooltip.css';

interface WaypointTooltipProps {
  tooltip: TooltipData | null;
  onClose: () => void;
  isHover?: boolean;
}

const WaypointTooltip: React.FC<WaypointTooltipProps> = ({ tooltip, onClose, isHover = false }) => {
  if (!tooltip) return null;

  // Convert map coordinates to screen coordinates
  const map = (window as any).map;
  if (!map) return null;

  const screenPoint = map.project(tooltip.position);
  const left = screenPoint.x;
  const top = screenPoint.y - 20; // Offset above the waypoint

  const getInstructionIcon = (instruction: string) => {
    if (instruction.includes('Start')) return '🚀';
    if (instruction.includes('Turn right')) return '↱';
    if (instruction.includes('Turn left')) return '↰';
    if (instruction.includes('Slight right')) return '↱';
    if (instruction.includes('Slight left')) return '↰';
    if (instruction.includes('Turn around')) return '↻';
    if (instruction.includes('Continue')) return '→';
    if (instruction.includes('arrived')) return '🎯';
    return '📍';
  };

  return (
    <div 
      className={`waypoint-tooltip ${isHover ? 'hover-tooltip' : ''}`}
      onClick={(e) => e.stopPropagation()}
      style={{
        left: `${left}px`,
        top: `${top}px`
      }}
    >
              <div className="tooltip-header">
          <div className="tooltip-icon">
            {getInstructionIcon(tooltip.content.instruction)}
          </div>
          <div className="tooltip-title">{tooltip.content.title}</div>
          {!isHover && (
            <button className="tooltip-close" onClick={onClose}>×</button>
          )}
        </div>
      
      <div className="tooltip-content">
        <div className="instruction-text">
          {tooltip.content.instruction}
        </div>
        
        {tooltip.content.streetName && (
          <div className="street-name">
            {tooltip.content.streetName}
          </div>
        )}
        
        <div className="tooltip-details">
          {tooltip.content.distance && (
            <div className="detail-item">
              <span className="detail-label">Distance:</span>
              <span className="detail-value">{tooltip.content.distance}</span>
            </div>
          )}
          
          {tooltip.content.duration && (
            <div className="detail-item">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{tooltip.content.duration}</span>
            </div>
          )}
        </div>
        
        {tooltip.content.nextInstruction && (
          <div className="next-instruction">
            <div className="next-label">Next:</div>
            <div className="next-text">{tooltip.content.nextInstruction}</div>
          </div>
        )}
      </div>
      
      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default WaypointTooltip;
