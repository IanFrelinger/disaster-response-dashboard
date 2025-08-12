import React, { useState } from 'react';
import { EvacuationZone, Building, WeatherData } from '../types/emergency-response';
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
  const [viewMode, setViewMode] = useState<'zones' | 'buildings' | 'details' | 'weather' | 'building-overview'>('zones');
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
    setViewMode('buildings');
    if (onZoneSelect) onZoneSelect(zone);
  };

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setViewMode('details');
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
    setViewMode('buildings');
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
                🏠 Evacuation Tracking Dashboard
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Real-time evacuation progress monitoring with zone management and building status tracking
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-red)' }}>🚨</span>
                <span className="ios-caption" style={{ margin: 0 }}>Live Status</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-blue)' }}>📊</span>
                <span className="ios-caption" style={{ margin: 0 }}>Progress</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-green)' }}>🏢</span>
                <span className="ios-caption" style={{ margin: 0 }}>Buildings</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-purple)' }}>📍</span>
                <span className="ios-caption" style={{ margin: 0 }}>Zones</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex" style={{ gap: 'var(--ios-spacing-sm)' }}>
            <button 
              className={`ios-button ${viewMode === 'zones' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('zones')}
            >
              🏘️ Zones
            </button>
            <button 
              className={`ios-button ${viewMode === 'buildings' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('buildings')}
              disabled={!selectedZone}
            >
              🏢 Buildings
            </button>
            <button 
              className={`ios-button ${viewMode === 'details' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('details')}
              disabled={!selectedBuilding}
            >
              📋 Details
            </button>
            <button 
              className={`ios-button ${viewMode === 'weather' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('weather')}
            >
              🌤️ Weather
            </button>
            <button 
              className={`ios-button ${viewMode === 'building-overview' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('building-overview')}
            >
              🏗️ Building Overview
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

      {/* Buildings View */}
      {viewMode === 'buildings' && selectedZone && (
        <div className="buildings-view">
          <div className="view-header">
            <button className="back-button" onClick={handleBackToZones}>
              ← Back to Zones
            </button>
            <h3>{selectedZone.name} - Buildings</h3>
            <div className="filter-controls">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Statuses</option>
                <option value="evacuated">Evacuated</option>
                <option value="inProgress">In Progress</option>
                <option value="refused">Refused</option>
                <option value="noContact">No Contact</option>
                <option value="specialNeeds">Special Needs</option>
              </select>
            </div>
          </div>

          <div className="buildings-grid">
            {getFilteredBuildings().map((building) => (
              <div 
                key={building.id}
                className="building-card"
                onClick={() => handleBuildingSelect(building)}
                style={{ borderLeftColor: getBuildingStatusColor(building) }}
              >
                <div className="building-header">
                  <h4>{building.address}</h4>
                  <span className={`status-badge ${building.evacuationStatus.evacuated ? 'evacuated' : 'not-evacuated'}`}>
                    {building.evacuationStatus.evacuated ? 'Evacuated' : 'Not Evacuated'}
                  </span>
                </div>
                
                <div className="building-details">
                  <div className="detail">
                    <span className="label">Type:</span>
                    <span className="value">{building.type}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Units:</span>
                    <span className="value">{building.units}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Population:</span>
                    <span className="value">{building.population}</span>
                  </div>
                  {building.evacuationStatus.specialNeeds.length > 0 && (
                    <div className="detail special-needs">
                      <span className="label">Special Needs:</span>
                      <span className="value">{building.evacuationStatus.specialNeeds.join(', ')}</span>
                    </div>
                  )}
                </div>

                {building.evacuationStatus.notes && (
                  <div className="building-notes">
                    {building.evacuationStatus.notes}
                  </div>
                )}

                <div className="building-footer">
                  <span className="last-updated">
                    {building.evacuationStatus.timestamp 
                      ? `Updated: ${building.evacuationStatus.timestamp.toLocaleTimeString()}`
                      : 'Not yet checked'
                    }
                  </span>
                  {building.evacuationStatus.confirmedBy && (
                    <span className="confirmed-by">
                      By: {building.evacuationStatus.confirmedBy}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Building Details View */}
      {viewMode === 'details' && selectedBuilding && (
        <div className="building-details-view">
          <div className="view-header">
            <button className="back-button" onClick={handleBackToBuildings}>
              ← Back to Buildings
            </button>
            <h3>{selectedBuilding.address}</h3>
          </div>

          <div className="building-detail-content">
            <div className="detail-section">
              <h4>Building Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Type:</span>
                  <span className="value">{selectedBuilding.type}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Units:</span>
                  <span className="value">{selectedBuilding.units}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Population:</span>
                  <span className="value">{selectedBuilding.population}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Structural Integrity:</span>
                  <span className={`value ${selectedBuilding.structuralIntegrity}`}>
                    {selectedBuilding.structuralIntegrity}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Evacuation Status</h4>
              <div className="status-update-form">
                <div className="form-group">
                  <label>Status:</label>
                  <select 
                    value={selectedBuilding.evacuationStatus.evacuated ? 'evacuated' : 'not-evacuated'}
                    onChange={(e) => {
                      const evacuated = e.target.value === 'evacuated';
                      handleStatusUpdate(selectedBuilding.id, { evacuated });
                    }}
                  >
                    <option value="evacuated">Evacuated</option>
                    <option value="not-evacuated">Not Evacuated</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Notes:</label>
                  <textarea 
                    value={selectedBuilding.evacuationStatus.notes || ''}
                    onChange={(e) => {
                      handleStatusUpdate(selectedBuilding.id, { notes: e.target.value });
                    }}
                    placeholder="Enter evacuation notes..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Special Needs:</label>
                  <input 
                    type="text"
                    value={selectedBuilding.evacuationStatus.specialNeeds.join(', ') || ''}
                    onChange={(e) => {
                      const specialNeeds = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      handleStatusUpdate(selectedBuilding.id, { specialNeeds });
                    }}
                    placeholder="e.g., wheelchair, oxygen, pets"
                  />
                </div>

                <div className="form-group">
                  <label>Pets:</label>
                  <input 
                    type="number"
                    value={selectedBuilding.evacuationStatus.pets || 0}
                    onChange={(e) => {
                      handleStatusUpdate(selectedBuilding.id, { pets: parseInt(e.target.value) || 0 });
                    }}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Vehicles:</label>
                  <input 
                    type="number"
                    value={selectedBuilding.evacuationStatus.vehicles || 0}
                    onChange={(e) => {
                      handleStatusUpdate(selectedBuilding.id, { vehicles: parseInt(e.target.value) || 0 });
                    }}
                    min="0"
                  />
                </div>

                <button 
                  className="update-button"
                  onClick={() => {
                    handleStatusUpdate(selectedBuilding.id, { 
                      timestamp: new Date(),
                      confirmedBy: 'Current User' // This would come from auth context
                    });
                  }}
                >
                  Update Status
                </button>
              </div>
            </div>

            {/* Search Markings */}
            {selectedBuilding.searchMarkings && (
              <div className="detail-section">
                <h4>Search Markings (FEMA X-Code)</h4>
                <div className="search-markings">
                  <div className="x-code">
                    <div className="x-code-top">{selectedBuilding.searchMarkings.structure.searchCode.top}</div>
                    <div className="x-code-left">{selectedBuilding.searchMarkings.structure.searchCode.left}</div>
                    <div className="x-code-center">{selectedBuilding.searchMarkings.structure.searchCode.center}</div>
                    <div className="x-code-right">{selectedBuilding.searchMarkings.structure.searchCode.right}</div>
                    <div className="x-code-bottom">{selectedBuilding.searchMarkings.structure.searchCode.bottom}</div>
                  </div>
                  <div className="marking-details">
                    <p><strong>Search Team:</strong> {selectedBuilding.searchMarkings.structure.searchTeam}</p>
                    <p><strong>Completed:</strong> {selectedBuilding.searchMarkings.structure.searchCompleted.toLocaleString()}</p>
                    <p><strong>Re-entry:</strong> {selectedBuilding.searchMarkings.structure.reEntry}</p>
                    <p><strong>Notes:</strong> {selectedBuilding.searchMarkings.structure.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weather View */}
      {viewMode === 'weather' && weatherData && (
        <div className="weather-view">
          <div className="view-header">
            <h3>🌤️ Weather Operations Dashboard</h3>
            <p className="ios-caption" style={{ margin: '8px 0 0 0', color: 'var(--ios-secondary)' }}>
              Critical weather information for emergency response operations
            </p>
          </div>

          <div className="weather-grid">
            {/* Current Conditions */}
            <div className="ios-card">
              <div className="ios-container">
                <h4 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: '0 0 var(--ios-spacing-md) 0' }}>
                  📊 Current Conditions
                </h4>
                <div className="weather-stats-grid">
                  <div className="weather-stat">
                    <span className="stat-label">🌡️ Temperature:</span>
                    <span className="stat-value">{weatherData.current.temp}°F</span>
                  </div>
                  <div className="weather-stat">
                    <span className="stat-label">💧 Humidity:</span>
                    <span className="stat-value">{weatherData.current.humidity}%</span>
                  </div>
                  <div className="weather-stat">
                    <span className="stat-label">💨 Wind Speed:</span>
                    <span className="stat-value">{weatherData.current.windSpeed} mph</span>
                  </div>
                  <div className="weather-stat">
                    <span className="stat-label">🧭 Wind Direction:</span>
                    <span className="stat-value">{getWindDirection(weatherData.current.windDirection)}</span>
                  </div>
                  {weatherData.current.windGusts && (
                    <div className="weather-stat">
                      <span className="stat-label">💨 Wind Gusts:</span>
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
                  🚑 EMS Impact Assessment
                </h4>
                <div className="impact-grid">
                  <div className="impact-item">
                    <span className="impact-label">🔥 Fire Risk:</span>
                    <span 
                      className="impact-value" 
                      style={{ color: getFireRiskColor(weatherData.current.fireWeatherIndex || 'low') }}
                    >
                      {weatherData.current.fireWeatherIndex?.toUpperCase() || 'LOW'}
                    </span>
                  </div>
                  <div className="impact-item">
                    <span className="impact-label">🚨 Evacuation Risk:</span>
                    <span 
                      className="impact-value" 
                      style={{ color: getEvacuationRiskColor(weatherData.current) }}
                    >
                      {getEvacuationRisk(weatherData.current)}
                    </span>
                  </div>
                  <div className="impact-item">
                    <span className="impact-label">🚁 Air Operations:</span>
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
                  📅 Forecast & Alerts
                </h4>
                <div className="forecast-content">
                  {weatherData.forecast.redFlagWarning && (
                    <div className="red-flag-warning">
                      <span style={{ color: 'var(--ios-red)', fontWeight: '600' }}>⚠️ RED FLAG WARNING ACTIVE</span>
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
            <h3>🏗️ Building Overview & Status</h3>
            <p className="ios-caption" style={{ margin: '8px 0 0 0', color: 'var(--ios-secondary)' }}>
              Comprehensive building status across all evacuation zones
            </p>
          </div>

          <div className="building-overview-grid">
            {/* Overall Statistics */}
            <div className="ios-card">
              <div className="ios-container">
                <h4 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: '0 0 var(--ios-spacing-md) 0' }}>
                  📊 Overall Statistics
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
                  🏘️ Zone Summary
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
    </div>
  );
};

export default EvacuationDashboard;
