import React, { useState } from 'react';
import { EvacuationZone, Building } from '../types/emergency-response';
import './BuildingEvacuationTracker.css';

interface BuildingEvacuationTrackerProps {
  zones: EvacuationZone[];
  buildings: Building[];
  onZoneUpdate?: (zoneId: string, updates: Partial<EvacuationZone>) => void;
  onBuildingUpdate?: (buildingId: string, updates: Partial<Building>) => void;
  className?: string;
}

export const BuildingEvacuationTracker: React.FC<BuildingEvacuationTrackerProps> = ({
  zones,
  buildings,
  onZoneUpdate,
  onBuildingUpdate,
  className = ''
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'zones' | 'buildings'>('zones');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evacuated': return '#28a745';
      case 'inProgress': return '#ffc107';
      case 'refused': return '#fd7e14';
      case 'noContact': return '#dc3545';
      case 'unchecked': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'evacuated': return 'Evacuated';
      case 'inProgress': return 'In Progress';
      case 'refused': return 'Refused';
      case 'noContact': return 'No Contact';
      case 'unchecked': return 'Unchecked';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate': return '#dc3545';
      case 'warning': return '#fd7e14';
      case 'standby': return '#ffc107';
      case 'all_clear': return '#28a745';
      default: return '#6c757d';
    }
  };

  const calculateZoneProgress = (zone: EvacuationZone) => {
    const total = zone.totalBuildings;
    const evacuated = zone.evacuationProgress.confirmed;
    const percentage = total > 0 ? Math.round((evacuated / total) * 100) : 0;
    
    return {
      percentage,
      evacuated,
      total,
      remaining: total - evacuated
    };
  };

  const getZoneBuildings = (zoneId: string) => {
    return buildings.filter(building => 
      building.evacuationStatus && building.evacuationStatus.evacuated !== undefined
    );
  };

  const handleBuildingStatusUpdate = (buildingId: string, newStatus: string) => {
    if (onBuildingUpdate) {
      onBuildingUpdate(buildingId, {
        evacuationStatus: {
          evacuated: newStatus === 'evacuated',
          confirmedBy: 'Current_User',
          timestamp: new Date(),
          notes: `Status updated to ${newStatus}`,
          specialNeeds: [],
          pets: 0,
          vehicles: 0
        }
      });
    }
  };

  return (
    <div className={`building-evacuation-tracker ${className}`}>
      {/* Enhanced Header - Matching Live Map Style */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                🏠 Building Evacuation Tracker
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Detailed building-level evacuation tracking with zone management and status updates
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-red)' }}>🏢</span>
                <span className="ios-caption" style={{ margin: 0 }}>Buildings</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-blue)' }}>📍</span>
                <span className="ios-caption" style={{ margin: 0 }}>Zones</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-green)' }}>📊</span>
                <span className="ios-caption" style={{ margin: 0 }}>Progress</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-purple)' }}>⏰</span>
                <span className="ios-caption" style={{ margin: 0 }}>Timeline</span>
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
              Zone Overview
            </button>
            <button 
              className={`ios-button ${viewMode === 'buildings' ? 'primary' : 'secondary'} small`}
              onClick={() => setViewMode('buildings')}
            >
              Building Details
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'zones' && (
        <div className="zones-overview">
          <h4>Evacuation Zones</h4>
          <div className="zones-grid">
            {zones.map(zone => {
              const progress = calculateZoneProgress(zone);
              return (
                <div 
                  key={zone.id} 
                  className={`zone-card ${zone.priority}`}
                  onClick={() => setSelectedZone(zone.id)}
                >
                  <div className="zone-header">
                    <h5>{zone.name}</h5>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(zone.priority) }}
                    >
                      {zone.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="zone-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${progress.percentage}%`,
                          backgroundColor: progress.percentage > 80 ? '#28a745' : 
                                        progress.percentage > 60 ? '#ffc107' : '#dc3545'
                        }}
                      />
                    </div>
                    <div className="progress-stats">
                      <span className="percentage">{progress.percentage}%</span>
                      <span className="counts">{progress.evacuated}/{progress.total}</span>
                    </div>
                  </div>
                  
                  <div className="zone-details">
                    <div className="detail-item">
                      <span className="label">Population:</span>
                      <span className="value">{zone.totalPopulation.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Units:</span>
                      <span className="value">{zone.assignedUnits.length}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">ETA:</span>
                      <span className="value">
                        {zone.estimatedCompletion ? 
                          zone.estimatedCompletion.toLocaleTimeString() : 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'buildings' && (
        <div className="buildings-detail">
          <h4>Building Status</h4>
          <div className="buildings-grid">
            {buildings.map(building => (
              <div 
                key={building.id} 
                className={`building-card ${building.evacuationStatus?.evacuated ? 'evacuated' : 'not-evacuated'}`}
                onClick={() => setSelectedBuilding(building.id)}
              >
                <div className="building-header">
                  <h6>{building.address}</h6>
                  <span className={`status-badge ${building.evacuationStatus?.evacuated ? 'evacuated' : 'not-evacuated'}`}>
                    {building.evacuationStatus?.evacuated ? '✓ Evacuated' : '⏳ Pending'}
                  </span>
                </div>
                
                <div className="building-info">
                  <div className="info-row">
                    <span className="label">Type:</span>
                    <span className="value">{building.type.replace('_', ' ')}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Units:</span>
                    <span className="value">{building.units}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Population:</span>
                    <span className="value">{building.population}</span>
                  </div>
                  {building.specialNeeds.length > 0 && (
                    <div className="info-row special-needs">
                      <span className="label">Special Needs:</span>
                      <span className="value">{building.specialNeeds.length} residents</span>
                    </div>
                  )}
                </div>
                
                {building.evacuationStatus?.notes && (
                  <div className="building-notes">
                    {building.evacuationStatus.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone Detail Modal */}
      {selectedZone && (
        <div className="modal-overlay" onClick={() => setSelectedZone(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{zones.find(z => z.id === selectedZone)?.name}</h3>
              <button onClick={() => setSelectedZone(null)}>×</button>
            </div>
            
            <div className="zone-detail-content">
              {(() => {
                const zone = zones.find(z => z.id === selectedZone);
                if (!zone) return null;
                
                const progress = calculateZoneProgress(zone);
                return (
                  <>
                    <div className="zone-progress-detail">
                      <h4>Evacuation Progress</h4>
                      <div className="progress-breakdown">
                        <div className="progress-item">
                          <span className="status evacuated">Evacuated</span>
                          <span className="count">{zone.evacuationProgress.confirmed}</span>
                          <span className="percentage">
                            {Math.round((zone.evacuationProgress.confirmed / zone.totalBuildings) * 100)}%
                          </span>
                        </div>
                        <div className="progress-item">
                          <span className="status in-progress">In Progress</span>
                          <span className="count">{zone.evacuationProgress.inProgress}</span>
                          <span className="percentage">
                            {Math.round((zone.evacuationProgress.inProgress / zone.totalBuildings) * 100)}%
                          </span>
                        </div>
                        <div className="progress-item">
                          <span className="status refused">Refused</span>
                          <span className="count">{zone.evacuationProgress.refused}</span>
                          <span className="percentage">
                            {Math.round((zone.evacuationProgress.refused / zone.totalBuildings) * 100)}%
                          </span>
                        </div>
                        <div className="progress-item">
                          <span className="status no-contact">No Contact</span>
                          <span className="count">{zone.evacuationProgress.noContact}</span>
                          <span className="percentage">
                            {Math.round((zone.evacuationProgress.noContact / zone.totalBuildings) * 100)}%
                          </span>
                        </div>
                        <div className="progress-item">
                          <span className="status unchecked">Unchecked</span>
                          <span className="count">{zone.evacuationProgress.unchecked}</span>
                          <span className="percentage">
                            {Math.round((zone.evacuationProgress.unchecked / zone.totalBuildings) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="zone-assignments">
                      <h4>Assigned Units</h4>
                      <div className="units-list">
                        {zone.assignedUnits.map(unit => (
                          <div key={unit} className="unit-item">
                            {unit}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="zone-timeline">
                      <h4>Timeline</h4>
                      <div className="timeline-item">
                        <span className="time">Started:</span>
                        <span className="event">Evacuation order issued</span>
                      </div>
                      <div className="timeline-item">
                        <span className="time">Current:</span>
                        <span className="event">{progress.percentage}% complete</span>
                      </div>
                      <div className="timeline-item">
                        <span className="time">ETA:</span>
                        <span className="event">
                          {zone.estimatedCompletion ? 
                            zone.estimatedCompletion.toLocaleString() : 'To be determined'}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Building Detail Modal */}
      {selectedBuilding && (
        <div className="modal-overlay" onClick={() => setSelectedBuilding(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{buildings.find(b => b.id === selectedBuilding)?.address}</h3>
              <button onClick={() => setSelectedBuilding(null)}>×</button>
            </div>
            
            <div className="building-detail-content">
              {(() => {
                const building = buildings.find(b => b.id === selectedBuilding);
                if (!building) return null;
                
                return (
                  <>
                    <div className="building-status">
                      <h4>Evacuation Status</h4>
                      <div className="status-actions">
                        <button 
                          className={`status-btn ${building.evacuationStatus?.evacuated ? 'active' : ''}`}
                          onClick={() => handleBuildingStatusUpdate(building.id, 'evacuated')}
                        >
                          ✓ Evacuated
                        </button>
                        <button 
                          className={`status-btn ${!building.evacuationStatus?.evacuated ? 'active' : ''}`}
                          onClick={() => handleBuildingStatusUpdate(building.id, 'not-evacuated')}
                        >
                          ⏳ Not Evacuated
                        </button>
                      </div>
                    </div>
                    
                    <div className="building-details">
                      <h4>Building Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="label">Type:</span>
                          <span className="value">{building.type.replace('_', ' ')}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Units:</span>
                          <span className="value">{building.units}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Population:</span>
                          <span className="value">{building.population}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Structural Integrity:</span>
                          <span className={`value ${building.structuralIntegrity}`}>
                            {building.structuralIntegrity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {building.specialNeeds.length > 0 && (
                      <div className="special-needs-section">
                        <h4>Special Needs Residents</h4>
                        <div className="needs-list">
                          {building.specialNeeds.map((need, index) => (
                            <div key={index} className="need-item">
                              {need}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {building.evacuationStatus?.notes && (
                      <div className="notes-section">
                        <h4>Notes</h4>
                        <div className="notes-content">
                          {building.evacuationStatus.notes}
                        </div>
                        <div className="notes-meta">
                          <span>By: {building.evacuationStatus.confirmedBy}</span>
                          <span>At: {building.evacuationStatus.timestamp?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingEvacuationTracker;
