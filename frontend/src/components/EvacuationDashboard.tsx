import React, { useState } from 'react';
import { EvacuationZone, Building } from '../types/emergency-response';
import './EvacuationDashboard.css';

interface EvacuationDashboardProps {
  zones: EvacuationZone[];
  buildings: Building[];
  onZoneSelect?: (zone: EvacuationZone) => void;
  onBuildingSelect?: (building: Building) => void;
  onStatusUpdate?: (buildingId: string, status: Partial<Building['evacuationStatus']>) => void;
  className?: string;
}

export const EvacuationDashboard: React.FC<EvacuationDashboardProps> = ({
  zones,
  buildings,
  onZoneSelect,
  onBuildingSelect,
  onStatusUpdate,
  className = ''
}) => {
  const [selectedZone, setSelectedZone] = useState<EvacuationZone | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [viewMode, setViewMode] = useState<'zones' | 'buildings' | 'details'>('zones');
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

  // Get zone priority color
  const getPriorityColor = (priority: EvacuationZone['priority']) => {
    switch (priority) {
      case 'immediate': return '#DC3545';
      case 'warning': return '#FFC107';
      case 'standby': return '#17A2B8';
      case 'all_clear': return '#28A745';
      default: return '#6C757D';
    }
  };

  // Get building status color
  const getBuildingStatusColor = (building: Building) => {
    if (building.evacuationStatus.evacuated) return '#28A745';
    if (building.evacuationStatus.notes?.includes('refused')) return '#FFC107';
    if (building.evacuationStatus.lastContact) return '#17A2B8';
    return '#6C757D';
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

  return (
    <div className={`evacuation-dashboard ${className}`}>
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
              Zones
            </button>
            <button 
              className={`ios-button ${viewMode === 'buildings' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('buildings')}
              disabled={!selectedZone}
            >
              Buildings
            </button>
            <button 
              className={`ios-button ${viewMode === 'details' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('details')}
              disabled={!selectedBuilding}
            >
              Details
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
    </div>
  );
};

export default EvacuationDashboard;
