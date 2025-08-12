import React, { useState } from 'react';
import { EvacuationZone, Building, WeatherData } from '../types/emergency-response';
import { AIPDecisionSupport, OperationalGuidance } from './AIPDecisionSupport';

import './EvacuationDashboard.css';

interface EvacuationDashboardProps {
  zones: EvacuationZone[];
  buildings: Building[];
  weatherData?: WeatherData;
  onZoneSelect?: (zone: EvacuationZone) => void;
  onBuildingSelect?: (building: Building) => void;
  onStatusUpdate?: (buildingId: string, status: Partial<Building['evacuationStatus']>) => void;
  className?: string;
}

export const EvacuationDashboard: React.FC<EvacuationDashboardProps> = ({
  zones,
  buildings,
  weatherData,
  onZoneSelect,
  onBuildingSelect,
  onStatusUpdate,
  className = ''
}) => {
  const [selectedZone, setSelectedZone] = useState<EvacuationZone | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [viewMode, setViewMode] = useState<'zones' | 'weather' | 'building-overview' | 'aip'>('zones');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Calculate zone progress percentages
  const getZoneProgress = (zone: EvacuationZone) => {
    const total = zone.totalBuildings;
    const evacuated = zone.evacuationProgress.confirmed;
    const inProgress = zone.evacuationProgress.inProgress;
    const refused = zone.evacuationProgress.refused;
    const noContact = zone.evacuationProgress.noContact;
    const unchecked = zone.evacuationProgress.unchecked;
    const specialNeeds = zone.evacuationProgress.specialNeeds;

    return {
      evacuated: (evacuated / total) * 100,
      inProgress: (inProgress / total) * 100,
      refused: (refused / total) * 100,
      noContact: (noContact / total) * 100,
      unchecked: (unchecked / total) * 100,
      specialNeeds: (specialNeeds / total) * 100
    };
  };

  // Get zone priority color using iOS color system
  const getPriorityColor = (priority: EvacuationZone['priority']) => {
    switch (priority) {
      case 'immediate': return 'var(--ios-red)';
      case 'warning': return 'var(--ios-orange)';
      case 'standby': return 'var(--ios-blue)';
      case 'all_clear': return 'var(--ios-green)';
      default: return 'var(--ios-light-gray)';
    }
  };

  // Get building status color using iOS color system
  const getBuildingStatusColor = (building: Building) => {
    if (building.evacuationStatus.evacuated) return 'var(--ios-green)';
    if (building.evacuationStatus.notes?.includes('refused')) return 'var(--ios-orange)';
    if (building.evacuationStatus.lastContact) return 'var(--ios-blue)';
    return 'var(--ios-light-gray)';
  };

  // Filter buildings by status
  const getFilteredBuildings = () => {
    if (!selectedZone) return [];
    
    // Handle both coordinate formats: number[][][] and number[][]
    const boundaries = selectedZone.boundaries;
    let minX: number, maxX: number, minY: number, maxY: number;
    
    if ('coordinates' in boundaries && Array.isArray(boundaries.coordinates) && boundaries.coordinates.length > 0) {
      const zoneCoordinates = boundaries.coordinates;
      if (typeof zoneCoordinates[0] === 'number') {
        // Simple array format: number[][]
        const coords = (zoneCoordinates as unknown) as number[][];
        minX = Math.min(...coords.map(c => c[0]));
        maxX = Math.max(...coords.map(c => c[0]));
        minY = Math.min(...coords.map(c => c[1]));
        maxY = Math.max(...coords.map(c => c[1]));
      } else {
        // Complex format: number[][][]
        const coords = zoneCoordinates as number[][][];
        minX = Math.min(...coords.flat().map(c => c[0]));
        maxX = Math.max(...coords.flat().map(c => c[0]));
        minY = Math.min(...coords.flat().map(c => c[1]));
        maxY = Math.max(...coords.flat().map(c => c[1]));
      }
    } else if (Array.isArray(boundaries) && boundaries.length > 0) {
      // Direct array format: number[][]
      const firstCoord = boundaries[0];
      if (Array.isArray(firstCoord) && firstCoord.length >= 2 && typeof firstCoord[0] === 'number' && typeof firstCoord[1] === 'number') {
        const coords = (boundaries as unknown) as number[][];
        minX = Math.min(...coords.map(c => c[0]));
        maxX = Math.max(...coords.map(c => c[0]));
        minY = Math.min(...coords.map(c => c[1]));
        maxY = Math.max(...coords.map(c => c[1]));
      } else {
        return []; // Invalid coordinate format
      }
    } else {
      return []; // Invalid coordinates
    }
    
    const zoneBuildings = buildings.filter(b => 
      b.coordinates[0] >= minX &&
      b.coordinates[0] <= maxX &&
      b.coordinates[1] >= minY &&
      b.coordinates[1] <= maxY
    );

    if (filterStatus === 'all') return zoneBuildings;
    
    return zoneBuildings.filter(b => {
      switch (filterStatus) {
        case 'evacuated': return b.evacuationStatus.evacuated;
        case 'inProgress': return b.evacuationStatus.notes?.includes('in progress');
        case 'refused': return b.evacuationStatus.notes?.includes('refused');
        case 'noContact': return !b.evacuationStatus.lastContact;
        case 'specialNeeds': return b.evacuationStatus.specialNeeds.length > 0;
        default: return true;
      }
    });
  };

  const handleZoneSelect = (zone: EvacuationZone) => {
    setSelectedZone(zone);
    // Stay in zones view since buildings view is removed
    if (onZoneSelect) onZoneSelect(zone);
  };

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    // Stay in current view since details view is removed
    if (onBuildingSelect) onBuildingSelect(building);
  };

  const handleStatusUpdate = (buildingId: string, status: Partial<Building['evacuationStatus']>) => {
    if (onStatusUpdate) onStatusUpdate(buildingId, status);
  };

  const handleBackToZones = () => {
    setSelectedZone(null);
    setViewMode('zones');
  };

  const handleBackToBuildings = () => {
    setSelectedBuilding(null);
    // Go back to zones view since buildings view is removed
    setViewMode('zones');
  };

  // Weather utility functions
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getFireRiskColor = (risk: string): string => {
    const colors: { [key: string]: string } = {
      low: '#34C759',
      moderate: '#FFCC00',
      high: '#FF9500',
      extreme: '#FF3B30',
      catastrophic: '#AF52DE'
    };
    return colors[risk] || '#34C759';
  };

  const getEvacuationRiskColor = (weather: any): string => {
    if (weather.humidity < 20 || weather.windSpeed > 25 || weather.temp > 90) return '#FF3B30';
    if (weather.humidity < 30 || weather.windSpeed > 20 || weather.temp > 85) return '#FF9500';
    return '#34C759';
  };

  const getEvacuationRisk = (weather: any): string => {
    if (weather.humidity < 20 || weather.windSpeed > 25 || weather.temp > 90) return 'CRITICAL';
    if (weather.humidity < 30 || weather.windSpeed > 20 || weather.temp > 85) return 'HIGH';
    return 'LOW';
  };

  const getAirOpsRiskColor = (weather: any): string => {
    if (weather.windSpeed > 30 || weather.visibility < 5) return '#FF3B30';
    if (weather.windSpeed > 20 || weather.visibility < 5) return '#FF9500';
    return '#34C759';
  };

  const getAirOpsRisk = (weather: any): string => {
    if (weather.windSpeed > 30 || weather.visibility < 3) return 'GROUNDED';
    if (weather.windSpeed > 20 || weather.visibility < 5) return 'RESTRICTED';
    return 'CLEAR';
  };

  return (
    <div className={`evacuation-dashboard ${className}`} style={{
      padding: '20px',
      backgroundColor: '#f5f5f7',
      borderRadius: '12px',
      minHeight: '600px',
      margin: '0',
      boxSizing: 'border-box'
    }}>
      {/* Enhanced Header - Matching Live Map Style */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                Commander Dashboard
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Command center for emergency response operations with real-time situational awareness
              </p>
            </div>
            

          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex" style={{ 
            gap: 'var(--ios-spacing-sm)',
            background: 'rgba(142, 142, 147, 0.08)',
            borderRadius: '16px',
            padding: '4px',
            border: '1px solid rgba(142, 142, 147, 0.16)',
            backdropFilter: 'blur(20px)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <button 
              className={`ios-button ${viewMode === 'zones' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('zones')}
              style={{
                flex: 1,
                padding: '10px 20px',
                textAlign: 'center',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: '600',
                fontSize: '15px',
                lineHeight: '1.2',
                letterSpacing: '-0.01em',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: viewMode === 'zones' ? 'linear-gradient(135deg, #007AFF, #5856D6)' : 'transparent',
                color: viewMode === 'zones' ? 'white' : '#1d1d1f',
                border: 'none',
                outline: 'none',
                boxShadow: viewMode === 'zones' ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none',
                transform: viewMode === 'zones' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              Operations
            </button>

            <button 
              className={`ios-button ${viewMode === 'weather' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('weather')}
              style={{
                flex: 1,
                padding: '10px 20px',
                textAlign: 'center',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: '600',
                fontSize: '15px',
                lineHeight: '1.2',
                letterSpacing: '-0.01em',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: viewMode === 'weather' ? 'linear-gradient(135deg, #007AFF, #5856D6)' : 'transparent',
                color: viewMode === 'weather' ? 'white' : '#1d1d1f',
                border: 'none',
                outline: 'none',
                boxShadow: viewMode === 'weather' ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none',
                transform: viewMode === 'weather' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              Conditions
            </button>
            <button 
              className={`ios-button ${viewMode === 'building-overview' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('building-overview')}
              style={{
                flex: 1,
                padding: '10px 20px',
                textAlign: 'center',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: '600',
                fontSize: '15px',
                lineHeight: '1.2',
                letterSpacing: '-0.01em',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: viewMode === 'building-overview' ? 'linear-gradient(135deg, #007AFF, #5856D6)' : 'transparent',
                color: viewMode === 'building-overview' ? 'white' : '#1d1d1f',
                border: 'none',
                outline: 'none',
                boxShadow: viewMode === 'building-overview' ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none',
                transform: viewMode === 'building-overview' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              Assets
            </button>

            <button 
              className={`ios-button ${viewMode === 'aip' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('aip')}
              style={{
                flex: 1,
                padding: '10px 20px',
                textAlign: 'center',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: '600',
                fontSize: '15px',
                lineHeight: '1.2',
                letterSpacing: '-0.01em',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: viewMode === 'aip' ? 'linear-gradient(135deg, #007AFF, #5856D6)' : 'transparent',
                color: viewMode === 'aip' ? 'white' : '#1d1d1f',
                border: 'none',
                outline: 'none',
                boxShadow: viewMode === 'aip' ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none',
                transform: viewMode === 'aip' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              AIP Commander
            </button>



          </div>
        </div>
      </div>

      {/* Zone Overview */}
      {viewMode === 'zones' && (
        <div className="zones-overview">
          <div className="zones-grid">
            {zones.map((zone) => {
              const progress = getZoneProgress(zone);
              return (
                <div 
                  key={zone.id}
                  className="zone-card"
                  onClick={() => handleZoneSelect(zone)}
                  style={{ borderLeftColor: getPriorityColor(zone.priority) }}
                >
                  <div className="zone-header">
                    <h3>{zone.name}</h3>
                    <span className={`priority-badge ${zone.priority}`}>
                      {zone.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="zone-stats">
                    <div className="stat">
                      <span className="label">Total Buildings:</span>
                      <span className="value">{zone.totalBuildings}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Population:</span>
                      <span className="value">{zone.totalPopulation}</span>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-segment evacuated"
                        style={{ width: `${progress.evacuated}%` }}
                        title={`${progress.evacuated.toFixed(1)}% Evacuated`}
                      />
                      <div 
                        className="progress-segment in-progress"
                        style={{ width: `${progress.inProgress}%` }}
                        title={`${progress.inProgress.toFixed(1)}% In Progress`}
                      />
                      <div 
                        className="progress-segment refused"
                        style={{ width: `${progress.refused}%` }}
                        title={`${progress.refused.toFixed(1)}% Refused`}
                      />
                      <div 
                        className="progress-segment no-contact"
                        style={{ width: `${progress.noContact}%` }}
                        title={`${progress.noContact.toFixed(1)}% No Contact`}
                      />
                      <div 
                        className="progress-segment unchecked"
                        style={{ width: `${progress.unchecked}%` }}
                        title={`${progress.unchecked.toFixed(1)}% Unchecked`}
                      />
                    </div>
                    
                    <div className="progress-legend">
                      <div className="legend-item">
                        <span className="legend-color evacuated"></span>
                        <span>Evacuated ({zone.evacuationProgress.confirmed})</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color in-progress"></span>
                        <span>In Progress ({zone.evacuationProgress.inProgress})</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color refused"></span>
                        <span>Refused ({zone.evacuationProgress.refused})</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color no-contact"></span>
                        <span>No Contact ({zone.evacuationProgress.noContact})</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color unchecked"></span>
                        <span>Unchecked ({zone.evacuationProgress.unchecked})</span>
                      </div>
                    </div>
                  </div>

                  <div className="zone-footer">
                    <span className="completion-estimate">
                      Est. Completion: {zone.estimatedCompletion?.toLocaleTimeString() || 'TBD'}
                    </span>
                    <span className="assigned-units">
                      {zone.assignedUnits.length} units assigned
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}





      {/* Weather View */}
      {viewMode === 'weather' && weatherData && (
        <div className="weather-view">
          <div className="view-header">
            <h3>Environmental Conditions</h3>
            <p className="ios-caption" style={{ margin: '8px 0 0 0', color: 'var(--ios-secondary)' }}>
              Real-time environmental monitoring for operational decision making
            </p>
          </div>

          <div className="weather-grid">
            {/* Current Conditions */}
            <div className="ios-card">
              <div className="ios-container">
                <h4 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: '0 0 var(--ios-spacing-md) 0' }}>
                  Current Conditions
                </h4>
                <div className="weather-stats-grid">
                  <div className="weather-stat">
                    <span className="stat-label">Temperature:</span>
                    <span className="stat-value">{weatherData.current.temp}°F</span>
                  </div>
                  <div className="weather-stat">
                    <span className="stat-label">Humidity:</span>
                    <span className="stat-value">{weatherData.current.humidity}%</span>
                  </div>
                  <div className="weather-stat">
                    <span className="stat-label">Wind Speed:</span>
                    <span className="stat-value">{weatherData.current.windSpeed} mph</span>
                  </div>
                  <div className="weather-stat">
                    <span className="stat-label">Wind Direction:</span>
                    <span className="stat-value">{getWindDirection(weatherData.current.windDirection)}</span>
                  </div>
                  {weatherData.current.windGusts && (
                    <div className="weather-stat">
                      <span className="stat-label">Wind Gusts:</span>
                      <span className="stat-value" style={{ color: 'var(--ios-orange)' }}>Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EMS Impact Assessment */}
            <div className="ios-card">
              <div className="ios-container">
                <h4 className="ios-headline" style={{ color: 'var(--ios-red)', margin: '0 0 var(--ios-spacing-md) 0' }}>
                  EMS Impact Assessment
                </h4>
                <div className="impact-grid">
                  <div className="impact-item">
                    <span className="impact-label">Fire Risk:</span>
                    <span 
                      className="impact-value" 
                      style={{ color: getFireRiskColor(weatherData.current.fireWeatherIndex || 'low') }}
                    >
                      {weatherData.current.fireWeatherIndex?.toUpperCase() || 'LOW'}
                    </span>
                  </div>
                  <div className="impact-item">
                    <span className="impact-label">Evacuation Risk:</span>
                    <span 
                      className="impact-value" 
                      style={{ color: getEvacuationRiskColor(weatherData.current) }}
                    >
                      {getEvacuationRisk(weatherData.current)}
                    </span>
                  </div>
                  <div className="impact-item">
                    <span className="impact-label">Air Operations:</span>
                    <span 
                      className="impact-value" 
                      style={{ color: getAirOpsRiskColor(weatherData.current) }}
                    >
                      {getAirOpsRisk(weatherData.current)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast Information */}
            <div className="ios-card">
              <div className="ios-container">
                <h4 className="ios-headline" style={{ color: 'var(--ios-purple)', margin: '0 0 var(--ios-spacing-md) 0' }}>
                  Forecast & Alerts
                </h4>
                <div className="forecast-content">
                  {weatherData.forecast.redFlagWarning && (
                    <div className="red-flag-warning">
                      <span style={{ color: 'var(--ios-red)', fontWeight: '600' }}>RED FLAG WARNING ACTIVE</span>
                    </div>
                  )}
                  <div className="forecast-item">
                    <span className="forecast-label">18:00:</span>
                    <span className="forecast-value">{weatherData.forecast.windShiftExpected || 'No wind shift expected'}</span>
                  </div>
                  <div className="forecast-item">
                    <span className="forecast-label">Overnight:</span>
                    <span className="forecast-value">{weatherData.forecast.humidityRecovery || 'Humidity stable'}</span>
                  </div>
                  <div className="forecast-item">
                    <span className="forecast-label">22:00:</span>
                    <span className="forecast-value">{weatherData.forecast.tempDrop || 'Temperature stable'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Building Overview View */}
      {viewMode === 'building-overview' && (
        <div className="building-overview-view">
          <div className="view-header">
            <h3>Asset Management & Status</h3>
            <p className="ios-caption" style={{ margin: '8px 0 0 0', color: 'var(--ios-secondary)' }}>
              Comprehensive asset tracking and operational status monitoring
            </p>
          </div>

          <div className="building-overview-grid">
            {/* Overall Statistics */}
            <div className="ios-card">
              <div className="ios-container">
                <h4 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: '0 0 var(--ios-spacing-md) 0' }}>
                  Overall Statistics
                </h4>
                <div className="overview-stats">
                  <div className="overview-stat">
                    <span className="stat-label">Total Buildings:</span>
                    <span className="stat-value">{buildings.length}</span>
                  </div>
                  <div className="overview-stat">
                    <span className="stat-label">Total Population:</span>
                    <span className="stat-value">{buildings.reduce((sum, b) => sum + b.population, 0)}</span>
                  </div>
                  <div className="overview-stat">
                    <span className="stat-label">Evacuated:</span>
                    <span className="stat-value" style={{ color: 'var(--ios-green)' }}>
                      {buildings.filter(b => b.evacuationStatus.evacuated).length}
                    </span>
                  </div>
                  <div className="overview-stat">
                    <span className="stat-label">Special Needs:</span>
                    <span className="stat-value" style={{ color: 'var(--ios-orange)' }}>
                      {buildings.filter(b => b.evacuationStatus.specialNeeds.length > 0).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Summary */}
            <div className="ios-card">
              <div className="ios-container">
                <h4 className="ios-headline" style={{ color: 'var(--ios-purple)', margin: '0 0 var(--ios-spacing-md) 0' }}>
                  Zone Summary
                </h4>
                <div className="zone-summary-list">
                  {zones.map(zone => {
                    const zoneBuildings = buildings.filter(b => {
                      // Simple coordinate check for zone membership
                      const boundaries = zone.boundaries;
                      if ('coordinates' in boundaries && Array.isArray(boundaries.coordinates)) {
                        const coords = boundaries.coordinates.flat();
                        const minX = Math.min(...coords.filter((_, i) => i % 2 === 0).map(c => Number(c)));
                        const maxX = Math.max(...coords.filter((_, i) => i % 2 === 0).map(c => Number(c)));
                        const minY = Math.min(...coords.filter((_, i) => i % 2 === 1).map(c => Number(c)));
                        const maxY = Math.max(...coords.filter((_, i) => i % 2 === 1).map(c => Number(c)));
                        
                        return b.coordinates[0] >= minX && b.coordinates[0] <= maxX &&
                               b.coordinates[1] >= minY && b.coordinates[1] <= maxY;
                      }
                      return false;
                    });
                    
                    const evacuatedCount = zoneBuildings.filter(b => b.evacuationStatus.evacuated).length;
                    const progress = (evacuatedCount / zoneBuildings.length) * 100;
                    
                    return (
                      <div key={zone.id} className="zone-summary-item" onClick={() => handleZoneSelect(zone)}>
                        <div className="zone-summary-header">
                          <span className="zone-name">{zone.name}</span>
                          <span className="zone-priority" style={{ color: getPriorityColor(zone.priority) }}>
                            {zone.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="zone-summary-stats">
                          <span>{zoneBuildings.length} buildings</span>
                          <span>{zone.totalPopulation} people</span>
                          <span style={{ color: 'var(--ios-green)' }}>{evacuatedCount} evacuated</span>
                        </div>
                        <div className="zone-progress-bar">
                          <div 
                            className="zone-progress-fill" 
                            style={{ width: `${progress}%`, backgroundColor: 'var(--ios-green)' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AIP-Powered Decision Support View */}
      {viewMode === 'aip' && (
        <div className="aip-view">
          <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
            <div className="ios-container">
              <div style={{ marginBottom: '24px' }}>
                <h3 className="ios-headline" style={{ 
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'var(--ios-blue)'
                }}>
                  AIP-Powered Decision Support
                </h3>
                <p className="ios-caption" style={{ 
                  margin: '0',
                  fontSize: '16px',
                  color: 'var(--ios-secondary)'
                }}>
                  Natural language command interface with explainable AI decisions for disaster response
                </p>
              </div>
              
              <AIPDecisionSupport 
                onDecisionMade={(guidance: OperationalGuidance) => {
                  console.log('AIP Decision Made:', guidance);
                  // Here you could integrate with other dashboard components
                  // For example, update evacuation zones based on AI recommendations
                  if (guidance.recommendation.toLowerCase().includes('evacuate')) {
                    console.log('AI recommends evacuation - updating zone priorities');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EvacuationDashboard;
