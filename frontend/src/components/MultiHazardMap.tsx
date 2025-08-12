import React, { useState, useEffect } from 'react';
import { HazardLayer } from '../types/emergency-response';
import './MultiHazardMap.css';

interface MultiHazardMapProps {
  hazards: HazardLayer[];
  onHazardSelect?: (hazard: HazardLayer) => void;
  onHazardUpdate?: (hazardId: string, updates: Partial<HazardLayer>) => void;
  className?: string;
}

export const MultiHazardMap: React.FC<MultiHazardMapProps> = ({
  hazards,
  onHazardSelect,
  onHazardUpdate,
  className = ''
}) => {
  const [selectedHazard, setSelectedHazard] = useState<HazardLayer | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['fire', 'flood']));
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'predictive'>('overview');

  // Hazard type configuration
  const hazardConfig = {
    fire: {
      color: '#FF4444',
              icon: 'Fire',
      label: 'Fire',
      priority: 1,
      styles: {
        active: { color: '#FF0000', opacity: 0.8, pattern: 'solid' },
        predicted_1hr: { color: '#FF6600', opacity: 0.6, pattern: 'dashed' },
        predicted_3hr: { color: '#FF8800', opacity: 0.4, pattern: 'dotted' }
      }
    },
    flood: {
      color: '#0066CC',
      icon: '🌊',
      label: 'Flood',
      priority: 2,
      styles: {
        current: { color: '#0066CC', opacity: 0.7, pattern: 'solid' },
        projected: { color: '#3399FF', opacity: 0.5, pattern: 'striped' }
      }
    },
    earthquake: {
      color: '#8B4513',
      icon: '🌋',
      label: 'Earthquake',
      priority: 3,
      styles: {
        epicenter: { color: '#8B4513', opacity: 0.9, pattern: 'circle' },
        aftershocks: { color: '#CD853F', opacity: 0.6, pattern: 'rings' }
      }
    },
    chemical: {
      color: '#9932CC',
              icon: 'Chemical',
      label: 'Chemical',
      priority: 4,
      styles: {
        dispersion: { color: '#9932CC', opacity: 0.7, pattern: 'cloud' },
        evacuation: { color: '#CC66FF', opacity: 0.5, pattern: 'dashed' }
      }
    }
  };

  const getHazardPriority = (hazard: HazardLayer): number => {
    const basePriority = hazardConfig[hazard.type]?.priority || 5;
    const severityMultiplier = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    return basePriority * severityMultiplier[hazard.severity];
  };

  const sortedHazards = [...hazards].sort((a, b) => getHazardPriority(b) - getHazardPriority(a));

  const handleHazardSelect = (hazard: HazardLayer) => {
    setSelectedHazard(hazard);
    if (onHazardSelect) {
      onHazardSelect(hazard);
    }
  };

  const toggleLayer = (layerType: string) => {
    const newLayers = new Set(activeLayers);
    if (newLayers.has(layerType)) {
      newLayers.delete(layerType);
    } else {
      newLayers.add(layerType);
    }
    setActiveLayers(newLayers);
  };

  const getHazardStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return '#FF4444';
      case 'contained': return '#FFAA00';
      case 'controlled': return '#44AA44';
      case 'extinguished': return '#44AA44';
      default: return '#888888';
    }
  };

  const renderHazardGeometry = (hazard: HazardLayer) => {
    const config = hazardConfig[hazard.type];
    if (!config) return null;

    switch (hazard.type) {
      case 'fire':
        return (
          <div className="hazard-geometry fire-hazard">
            {hazard.fire?.active && (
              <div className="fire-active" style={{
                backgroundColor: config.styles.active.color,
                opacity: config.styles.active.opacity
              }}>
                Active Fire
              </div>
            )}
            {hazard.fire?.predicted_1hr && (
              <div className="fire-predicted-1hr" style={{
                backgroundColor: config.styles.predicted_1hr.color,
                opacity: config.styles.predicted_1hr.opacity,
                borderStyle: config.styles.predicted_1hr.pattern
              }}>
                1hr Prediction
              </div>
            )}
            {hazard.fire?.predicted_3hr && (
              <div className="fire-predicted-3hr" style={{
                backgroundColor: config.styles.predicted_3hr.color,
                opacity: config.styles.predicted_3hr.opacity,
                borderStyle: config.styles.predicted_3hr.pattern
              }}>
                3hr Prediction
              </div>
            )}
          </div>
        );

      case 'flood':
        return (
          <div className="hazard-geometry flood-hazard">
            {hazard.flood?.current && (
              <div className="flood-current" style={{
                backgroundColor: config.styles.current.color,
                opacity: config.styles.current.opacity
              }}>
                🌊 Current Flood
                <div className="flood-details">
                  Depth: {hazard.flood.current.depth}ft
                  Flow: {hazard.flood.current.flowRate} mph
                </div>
              </div>
            )}
            {hazard.flood?.projected && (
              <div className="flood-projected" style={{
                backgroundColor: config.styles.projected.color,
                opacity: config.styles.projected.opacity,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
              }}>
                🌊 {hazard.flood.projected.timeframe} Projection
                <div className="flood-details">
                  Confidence: {Math.round(hazard.flood.projected.confidence * 100)}%
                </div>
              </div>
            )}
          </div>
        );

      case 'earthquake':
        return (
          <div className="hazard-geometry earthquake-hazard">
            <div className="earthquake-epicenter" style={{
              backgroundColor: config.styles.epicenter.color,
              opacity: config.styles.epicenter.opacity
            }}>
              🌋 M{hazard.earthquake?.magnitude} Earthquake
              <div className="earthquake-details">
                Depth: {hazard.earthquake?.depth}km
                Aftershocks: {hazard.earthquake?.aftershocks}
              </div>
            </div>
          </div>
        );

      case 'chemical':
        return (
          <div className="hazard-geometry chemical-hazard">
            <div className="chemical-dispersion" style={{
              backgroundColor: config.styles.dispersion.color,
              opacity: config.styles.dispersion.opacity
            }}>
                              {hazard.chemical?.substance}
              <div className="chemical-details">
                Concentration: {hazard.chemical?.concentration} ppm
                Evacuation Radius: {hazard.chemical?.evacuationRadius}m
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`multi-hazard-map ${className}`} style={{
      padding: '20px',
      backgroundColor: '#f5f5f7',
      borderRadius: '12px',
      minHeight: '600px',
      margin: '0',
      boxSizing: 'border-box'
    }}>
      {/* Enhanced Header */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                Multi-Hazard Emergency Map
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Real-time visualization of multiple hazard types with predictive modeling
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <button 
                className={`ios-button ${viewMode === 'overview' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('overview')}
              >
                Overview
              </button>
              <button 
                className={`ios-button ${viewMode === 'detailed' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('detailed')}
              >
                Detailed
              </button>
              <button 
                className={`ios-button ${viewMode === 'predictive' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('predictive')}
              >
                Predictive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <h4>Hazard Layers</h4>
          <div className="layer-controls">
            {Object.entries(hazardConfig).map(([type, config]) => (
              <label key={type} className="layer-toggle">
                <input
                  type="checkbox"
                  checked={activeLayers.has(type)}
                  onChange={() => toggleLayer(type)}
                />
                <span className="layer-icon">{config.icon}</span>
                <span className="layer-label">{config.label}</span>
                <span className="layer-count">
                  {hazards.filter(h => h.type === type).length}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Hazard Map */}
      <div className="hazard-map-container">
        <div className="hazard-map">
          {sortedHazards
            .filter(hazard => activeLayers.has(hazard.type))
            .map(hazard => (
              <div
                key={hazard.id}
                className={`hazard-item ${hazard.severity} ${selectedHazard?.id === hazard.id ? 'selected' : ''}`}
                onClick={() => handleHazardSelect(hazard)}
                style={{
                  borderColor: getHazardStatusColor(hazard.status),
                  borderWidth: hazard.severity === 'critical' ? '3px' : '2px'
                }}
              >
                <div className="hazard-header">
                  <span className="hazard-icon">
                    {hazardConfig[hazard.type]?.icon}
                  </span>
                  <span className="hazard-type">
                    {hazardConfig[hazard.type]?.label}
                  </span>
                  <span className={`hazard-severity ${hazard.severity}`}>
                    {hazard.severity.toUpperCase()}
                  </span>
                </div>
                
                {renderHazardGeometry(hazard)}
                
                <div className="hazard-info">
                  <div className="hazard-location">
                    {hazard.location[0].toFixed(4)}, {hazard.location[1].toFixed(4)}
                  </div>
                  <div className="hazard-time">
                    ⏰ {hazard.timeToImpact}
                  </div>
                  <div className="hazard-area">
                    📐 {Math.round(hazard.affectedArea / 1000000 * 100) / 100} km²
                  </div>
                  <div className="hazard-updated">
                    🔄 {hazard.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Hazard Details Panel */}
      {selectedHazard && (
        <div className="hazard-details-panel">
          <div className="ios-card">
            <div className="ios-container">
              <div className="ios-flex-between">
                <h3>Hazard Details</h3>
                <button 
                  className="ios-button secondary small"
                  onClick={() => setSelectedHazard(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="hazard-details">
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">
                    {hazardConfig[selectedHazard.type]?.icon} {hazardConfig[selectedHazard.type]?.label}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Severity:</span>
                  <span className={`value severity-${selectedHazard.severity}`}>
                    {selectedHazard.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="value">
                    {selectedHazard.status || 'Unknown'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">
                    {selectedHazard.location[0].toFixed(4)}, {selectedHazard.location[1].toFixed(4)}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Affected Area:</span>
                  <span className="value">
                    {Math.round(selectedHazard.affectedArea / 1000000 * 100) / 100} km²
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Time to Impact:</span>
                  <span className="value">
                    {selectedHazard.timeToImpact}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Last Updated:</span>
                  <span className="value">
                    {selectedHazard.lastUpdated.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Type-specific details */}
              {selectedHazard.fire && (
                <div className="type-specific-details">
                  <h4>Fire Details</h4>
                  <div className="detail-row">
                    <span className="label">Intensity:</span>
                    <span className="value">{selectedHazard.fire.intensity}/100</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Spread Rate:</span>
                    <span className="value">{selectedHazard.fire.spreadRate} mph</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Flame Height:</span>
                    <span className="value">{selectedHazard.fire.flameHeight} ft</span>
                  </div>
                </div>
              )}

              {selectedHazard.flood && (
                <div className="type-specific-details">
                  <h4>🌊 Flood Details</h4>
                  <div className="detail-row">
                    <span className="label">Current Depth:</span>
                    <span className="value">{selectedHazard.flood.current.depth} ft</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Flow Rate:</span>
                    <span className="value">{selectedHazard.flood.current.flowRate} mph</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Water Level:</span>
                    <span className="value">{selectedHazard.flood.current.waterLevel} ft above normal</span>
                  </div>
                </div>
              )}

              {selectedHazard.earthquake && (
                <div className="type-specific-details">
                  <h4>🌋 Earthquake Details</h4>
                  <div className="detail-row">
                    <span className="label">Magnitude:</span>
                    <span className="value">M{selectedHazard.earthquake.magnitude}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Depth:</span>
                    <span className="value">{selectedHazard.earthquake.depth} km</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Aftershocks:</span>
                    <span className="value">{selectedHazard.earthquake.aftershocks}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ground Shaking:</span>
                    <span className="value">{selectedHazard.earthquake.groundShaking}</span>
                  </div>
                </div>
              )}

              {selectedHazard.chemical && (
                <div className="type-specific-details">
                  <h4>Chemical Details</h4>
                  <div className="detail-row">
                    <span className="label">Substance:</span>
                    <span className="value">{selectedHazard.chemical.substance}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Concentration:</span>
                    <span className="value">{selectedHazard.chemical.concentration} ppm</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Evacuation Radius:</span>
                    <span className="value">{selectedHazard.chemical.evacuationRadius} m</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Wind Carried:</span>
                    <span className="value">{selectedHazard.chemical.windCarried ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="hazard-actions">
                <button className="ios-button primary">
                  View on Map
                </button>
                <button className="ios-button secondary">
                  View Analytics
                </button>
                <button className="ios-button secondary">
                  Issue Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hazard Summary */}
      <div className="hazard-summary">
        <div className="ios-card">
          <div className="ios-container">
            <h4>Hazard Summary</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Hazards:</span>
                <span className="stat-value">{hazards.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Critical:</span>
                <span className="stat-value critical">
                  {hazards.filter(h => h.severity === 'critical').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active:</span>
                <span className="stat-value active">
                  {hazards.filter(h => h.status === 'active').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Contained:</span>
                <span className="stat-value contained">
                  {hazards.filter(h => h.status === 'contained').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiHazardMap;
