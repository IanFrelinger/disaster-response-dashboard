import React, { useState } from 'react';
import type { DetailLevels } from '../types/emergency-response';
import './DrillDownCapability.css';

interface DrillDownCapabilityProps {
  detailLevels: DetailLevels;
  currentZoom: number;
  currentLocation: string;
  onZoomChange?: (zoom: number) => void;
  onLocationSelect?: (location: string) => void;
  className?: string;
}

export const DrillDownCapability: React.FC<DrillDownCapabilityProps> = ({
  currentZoom,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<keyof DetailLevels>>(new Set(['county']));

  // Zoom-based detail level configuration
  const zoomLevels: { [key: number]: keyof DetailLevels } = {
    8: 'county',
    9: 'county',
    10: 'county',
    11: 'county',
    12: 'zone',
    13: 'zone',
    14: 'zone',
    15: 'neighborhood',
    16: 'neighborhood',
    17: 'neighborhood',
    18: 'building',
    19: 'building',
    20: 'building'
  };

  const getDetailLevelForZoom = (zoom: number): keyof DetailLevels => {
    return zoomLevels[zoom as keyof typeof zoomLevels] || 'county';
  };

  const getDetailLevelLabel = (level: keyof DetailLevels): string => {
    switch (level) {
      case 'county': return 'County Overview';
      case 'zone': return 'Zone Detail';
      case 'neighborhood': return 'Neighborhood';
      case 'building': return 'Building Detail';
      default: return 'Unknown';
    }
  };

  const getDetailLevelIcon = (level: keyof DetailLevels): string => {
    switch (level) {
      case 'county': return 'County';
      case 'zone': return 'Zone';
      case 'neighborhood': return 'Neighborhood';
      case 'building': return 'Building';
              default: return 'Unknown';
    }
  };

  const getDetailLevelColor = (level: keyof DetailLevels): string => {
    switch (level) {
      case 'county': return 'var(--ios-blue)';
      case 'zone': return 'var(--ios-green)';
      case 'neighborhood': return 'var(--ios-orange)';
      case 'building': return 'var(--ios-purple)';
      default: return 'var(--ios-gray)';
    }
  };

  const toggleSection = (section: keyof DetailLevels) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };



  // Mock data for demonstration
  const mockLocationData = {
    'county': {
      name: 'San Francisco County',
      population: '873,965',
      area: '121.4 km²',
      activeIncidents: 3,
      emergencyUnits: 24,
      evacuationZones: 8
    },
    'zone': {
      name: 'Zone A - Downtown',
      population: '45,000',
      buildings: 847,
      evacuationProgress: '73%',
      assignedUnits: 6,
      hazards: 2
    },
    'neighborhood': {
      name: 'Financial District',
      population: '12,500',
      buildings: 234,
      evacuationProgress: '89%',
      assignedUnits: 3,
      hazards: 1
    },
    'building': {
      name: '123 Main Street',
      type: 'Commercial Office',
      units: 45,
      population: 180,
      evacuationStatus: 'Complete',
      assignedUnits: 1,
      hazards: 0
    }
  };



  const renderDetailLevelContent = (level: keyof DetailLevels) => {
    const data = mockLocationData[level];
    const isExpanded = expandedSections.has(level);

    return (
      <div className={`detail-level ${level} ${isExpanded ? 'expanded' : ''}`}>
        <div 
          className="detail-level-header"
          onClick={() => toggleSection(level)}
          style={{ borderLeftColor: getDetailLevelColor(level) }}
        >
          <div className="header-content">
            <span className="level-icon">{getDetailLevelIcon(level)}</span>
            <span className="level-title">{getDetailLevelLabel(level)}</span>
            <span className="level-name">{data.name}</span>
          </div>
          <div className="header-actions">
            <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="detail-level-content">
            <div className="level-overview">
              <div className="overview-grid">
                <div className="overview-item">
                  <span className="item-label">Population:</span>
                  <span className="item-value">{data.population}</span>
                </div>
                {'buildings' in data && data.buildings && (
                  <div className="overview-item">
                    <span className="item-label">Buildings:</span>
                    <span className="item-value">{data.buildings}</span>
                  </div>
                )}
                {'area' in data && data.area && (
                  <div className="overview-item">
                    <span className="item-label">Area:</span>
                    <span className="item-value">{data.area}</span>
                  </div>
                )}
                {'activeIncidents' in data && (
                  <div className="overview-item">
                    <span className="item-label">Active Incidents:</span>
                    <span className="item-value">{data.activeIncidents}</span>
                  </div>
                )}
                {'emergencyUnits' in data && (
                  <div className="overview-item">
                    <span className="item-label">Emergency Units:</span>
                    <span className="item-value">{data.emergencyUnits}</span>
                  </div>
                )}
                {'evacuationZones' in data && data.evacuationZones && (
                  <div className="overview-item">
                    <span className="item-label">Evacuation Zones:</span>
                    <span className="item-value">{data.evacuationZones}</span>
                  </div>
                )}
                {'evacuationProgress' in data && data.evacuationProgress && (
                  <div className="overview-item">
                    <span className="item-label">Evacuation Progress:</span>
                    <span className="item-value">{data.evacuationProgress}</span>
                  </div>
                )}
                {'assignedUnits' in data && data.assignedUnits && (
                  <div className="overview-item">
                    <span className="item-label">Assigned Units:</span>
                    <span className="item-value">{data.assignedUnits}</span>
                  </div>
                )}
                {'hazards' in data && data.hazards !== undefined && (
                  <div className="overview-item">
                    <span className="item-label">Active Hazards:</span>
                    <span className="item-value">{data.hazards}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="level-actions">
              <button className="ios-button primary small">
                                  View on Map
              </button>
              <button className="ios-button secondary small">
                                  View Analytics
              </button>
              <button className="ios-button secondary small">
                                  Issue Alert
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`drill-down-capability ${className}`} style={{
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
                Drill-Down Capability
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Multi-scale visualization with zoom-based detail levels
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <div className="zoom-controls">
                <span className="zoom-label">Zoom: {currentZoom}</span>
                <div className="zoom-buttons">
                  <button 
                    className="zoom-button"
                    onClick={() => {}} // Zoom functionality disabled
                  >
                    −
                  </button>
                  <button 
                    className="zoom-button"
                    onClick={() => {}} // Zoom functionality disabled
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Location Breadcrumb */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
                          <h4>Current Location</h4>
          <div className="location-breadcrumb">
            <span className="breadcrumb-item">San Francisco County</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">Zone A - Downtown</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">Financial District</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">123 Main Street</span>
          </div>
          <div className="current-detail-level">
            <span className="level-indicator" style={{ backgroundColor: getDetailLevelColor(getDetailLevelForZoom(currentZoom)) }}>
              {getDetailLevelIcon(getDetailLevelForZoom(currentZoom))} {getDetailLevelLabel(getDetailLevelForZoom(currentZoom))}
            </span>
            <span className="level-description">
              Showing {getDetailLevelLabel(getDetailLevelForZoom(currentZoom)).toLowerCase()} level details
            </span>
          </div>
        </div>
      </div>

      {/* Detail Levels */}
      <div className="detail-levels">
        <div className="ios-card">
          <div className="ios-container">
            <h4>📋 Detail Level Information</h4>
            <p className="detail-description">
              Click on any detail level to expand and view information. The current zoom level determines which details are visible.
            </p>
            
            <div className="detail-levels-container">
              {renderDetailLevelContent('county')}
              {renderDetailLevelContent('zone')}
              {renderDetailLevelContent('neighborhood')}
              {renderDetailLevelContent('building')}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Level Guide */}
      <div className="zoom-guide">
        <div className="ios-card">
          <div className="ios-container">
                            <h4>Zoom Level Guide</h4>
            <div className="zoom-levels-grid">
              <div className="zoom-level">
                <div className="zoom-header">
                  <span className="zoom-range">8-11</span>
                  <span className="zoom-icon">County</span>
                </div>
                <div className="zoom-content">
                  <h5>County Overview</h5>
                  <ul>
                    <li>Hazard zones</li>
                    <li>Major routes</li>
                    <li>Resource counts</li>
                    <li>Population overview</li>
                  </ul>
                </div>
              </div>
              
              <div className="zoom-level">
                <div className="zoom-header">
                  <span className="zoom-range">12-14</span>
                  <span className="zoom-icon">Zone</span>
                </div>
                <div className="zoom-content">
                  <h5>Zone Detail</h5>
                  <ul>
                    <li>Evacuation progress</li>
                    <li>Route capacity</li>
                    <li>Staging areas</li>
                    <li>Unit assignments</li>
                  </ul>
                </div>
              </div>
              
              <div className="zoom-level">
                <div className="zoom-header">
                  <span className="zoom-range">15-17</span>
                  <span className="zoom-icon">Neighborhood</span>
                </div>
                <div className="zoom-content">
                  <h5>Neighborhood</h5>
                  <ul>
                    <li>Building status</li>
                    <li>Unit locations</li>
                    <li>Hydrants & infrastructure</li>
                    <li>Block-level aggregation</li>
                  </ul>
                </div>
              </div>
              
              <div className="zoom-level">
                <div className="zoom-header">
                  <span className="zoom-range">18-20</span>
                  <span className="zoom-icon">🏠</span>
                </div>
                <div className="zoom-content">
                  <h5>Building Detail</h5>
                  <ul>
                    <li>Unit numbers</li>
                    <li>Evacuation status</li>
                    <li>Search markings</li>
                    <li>Direct selection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Features */}
      <div className="interactive-features">
        <div className="ios-card">
          <div className="ios-container">
            <h4>🎯 Interactive Features</h4>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">📍</span>
                <span className="feature-title">Location Selection</span>
                <span className="feature-description">Click on map to select specific locations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span className="feature-title">Detail Expansion</span>
                <span className="feature-description">Expand detail levels to see more information</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-title">Data Visualization</span>
                <span className="feature-description">View data at different levels of detail</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚨</span>
                <span className="feature-title">Quick Actions</span>
                <span className="feature-description">Perform actions directly from detail panels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

