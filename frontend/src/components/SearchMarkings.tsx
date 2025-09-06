import React, { useState } from 'react';
import type { SearchMarking } from '../types/emergency-response';
import './SearchMarkings.css';

interface SearchMarkingsProps {
  searchMarkings: SearchMarking[];
  onMarkingCreate?: (marking: SearchMarking) => void;
  onMarkingUpdate?: (markingId: string, updates: Partial<SearchMarking>) => void;
  onMarkingDelete?: (markingId: string) => void;
  className?: string;
}

export const SearchMarkings: React.FC<SearchMarkingsProps> = ({
  searchMarkings,
  onMarkingCreate,
  onMarkingDelete,
  className = ''
}) => {
  const [selectedMarking, setSelectedMarking] = useState<SearchMarking | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'create' | 'details'>('overview');
  const [newMarking, setNewMarking] = useState<Partial<SearchMarking>>({
    structure: {
      id: '',
      location: [0, 0],
      searchCode: {
        top: '',
        left: '',
        right: '',
        bottom: 0
      },
      structuralDamage: 'none',
      reEntry: 'safe',
      searchCompleted: new Date(),
      searchTeam: '',
      notes: ''
    }
  });

  // FEMA X-Code standard configuration
  const femaConfig = {
    structuralDamage: [
      { value: 'none', label: 'None', icon: '🟢', description: 'No structural damage' },
      { value: 'light', label: 'Light', icon: '🟡', description: 'Minor damage, safe to enter' },
      { value: 'moderate', label: 'Moderate', icon: '🟠', description: 'Moderate damage, caution required' },
      { value: 'heavy', label: 'Heavy', icon: '🔴', description: 'Heavy damage, unsafe to enter' },
      { value: 'destroyed', label: 'Destroyed', icon: '⚫', description: 'Structure destroyed' }
    ],
    reEntry: [
      { value: 'safe', label: 'Safe', icon: '🟢', description: 'Safe to re-enter' },
      { value: 'unsafe', label: 'Unsafe', icon: '🔴', description: 'Unsafe to re-enter' },
      { value: 'restricted', label: 'Restricted', icon: '🟡', description: 'Restricted entry only' }
    ],
    hazards: [
      'Gas leak',
      'Structural damage',
      'Electrical hazard',
      'HazMat',
      'Fire damage',
      'Water damage',
      'Chemical spill',
      'Unstable foundation',
      'Falling debris',
      'Confined space'
    ]
  };

  const getCurrentDateTime = (): string => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}${minute}`;
  };

  const getStructuralDamageIcon = (damage: string) => {
    const config = femaConfig.structuralDamage.find(d => d.value === damage);
    return config?.icon || '⚪';
  };

  const getReEntryIcon = (reEntry: string) => {
    const config = femaConfig.reEntry.find(r => r.value === reEntry);
    return config?.icon || '⚪';
  };

  const handleQuickMarking = (type: 'clear' | 'hazard' | 'victims') => {
    const marking: SearchMarking = {
      structure: {
        id: `marking-${Date.now()}`,
        location: [0, 0], // Will be set by GPS
        searchCode: {
          top: getCurrentDateTime(),
          left: 'Current_Team',
          right: type === 'hazard' ? 'Hazard detected' : type === 'victims' ? 'Victims found' : 'Clear',
          bottom: type === 'victims' ? 1 : 0,
          ...(type === 'clear' && { center: 'X' })
        },
        structuralDamage: type === 'hazard' ? 'moderate' : 'none',
        reEntry: type === 'hazard' ? 'unsafe' : 'safe',
        searchCompleted: new Date(),
        searchTeam: 'Current_Team',
        notes: `Quick marking: ${type}`
      }
    };

    if (onMarkingCreate) {
      onMarkingCreate(marking);
    }
  };

  const handleCreateMarking = () => {
    if (!newMarking.structure?.id || !newMarking.structure?.searchTeam) {
      alert('Please fill in required fields');
      return;
    }

    const marking: SearchMarking = {
      structure: {
        id: newMarking.structure.id,
        location: newMarking.structure.location || [0, 0],
        searchCode: {
          top: newMarking.structure.searchCode?.top || getCurrentDateTime(),
          left: newMarking.structure.searchCode?.left || 'Current_Team',
          right: newMarking.structure.searchCode?.right || '',
          bottom: newMarking.structure.searchCode?.bottom || 0,
          ...(newMarking.structure.searchCode?.center && { center: newMarking.structure.searchCode.center })
        },
        structuralDamage: newMarking.structure.structuralDamage || 'none',
        reEntry: newMarking.structure.reEntry || 'safe',
        searchCompleted: new Date(),
        searchTeam: newMarking.structure.searchTeam,
        notes: newMarking.structure.notes || ''
      }
    };

    if (onMarkingCreate) {
      onMarkingCreate(marking);
    }

    // Reset form
    setNewMarking({
      structure: {
        id: '',
        location: [0, 0],
        searchCode: {
          top: '',
          left: '',
          right: '',
          bottom: 0,

        },
        structuralDamage: 'none',
        reEntry: 'safe',
        searchCompleted: new Date(),
        searchTeam: '',
        notes: ''
      }
    });

    setViewMode('overview');
  };

  const handleMarkingSelect = (marking: SearchMarking) => {
    setSelectedMarking(marking);
    setViewMode('details');
  };

  const getSearchCodeVisual = (searchCode: SearchMarking['structure']['searchCode']) => {
    return (
      <div className="search-code-visual">
        <div className="code-grid">
          <div className="code-cell top">{searchCode.top}</div>
          <div className="code-cell left">{searchCode.left}</div>
          <div className="code-cell center">{searchCode.center}</div>
          <div className="code-cell right">{searchCode.right}</div>
          <div className="code-cell bottom">{searchCode.bottom}</div>
        </div>
        <div className="code-legend">
          <div className="legend-item">
            <span className="legend-label">Top:</span>
            <span className="legend-value">Date/Time</span>
          </div>
          <div className="legend-item">
            <span className="legend-label">Left:</span>
            <span className="legend-value">Team ID</span>
          </div>
          <div className="legend-item">
            <span className="legend-label">Right:</span>
            <span className="legend-value">Hazards</span>
          </div>
          <div className="legend-item">
            <span className="legend-label">Bottom:</span>
            <span className="legend-value">Victims Removed</span>
          </div>
          <div className="legend-item">
            <span className="legend-label">Center:</span>
            <span className="legend-value">Fully Searched</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`search-markings ${className}`} style={{
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
                Post-Disaster Search Markings
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                FEMA X-Code system for tracking search and rescue operations
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
                className={`ios-button ${viewMode === 'create' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('create')}
              >
                Create
              </button>
              <button 
                className={`ios-button ${viewMode === 'details' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('details')}
                disabled={!selectedMarking}
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Marking Interface */}
      {viewMode === 'overview' && (
        <div className="quick-marking-interface">
          <div className="ios-card">
            <div className="ios-container">
                              <h4>Quick Marking Interface</h4>
              <p className="quick-marking-description">
                Use these buttons for rapid field marking. Detailed marking can be created below.
              </p>
              
              <div className="quick-buttons">
                <button 
                  className="quick-button clear"
                  onClick={() => handleQuickMarking('clear')}
                >
                  <span className="button-icon">Clear</span>
                  <span className="button-label">Clear</span>
                  <span className="button-description">Structure clear, no victims</span>
                </button>
                
                <button 
                  className="quick-button hazard"
                  onClick={() => handleQuickMarking('hazard')}
                >
                  <span className="button-icon">Caution</span>
                  <span className="button-label">Hazard</span>
                  <span className="button-description">Hazard detected, unsafe</span>
                </button>
                
                <button 
                  className="quick-button victims"
                  onClick={() => handleQuickMarking('victims')}
                >
                  <span className="button-icon">👥</span>
                  <span className="button-label">Victims</span>
                  <span className="button-description">Victims found and removed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Marking */}
      {viewMode === 'create' && (
        <div className="create-marking">
          <div className="ios-card">
            <div className="ios-container">
              <h4>📝 Create Detailed Search Marking</h4>
              
              <div className="marking-form">
                <div className="form-section">
                  <h5>Structure Information</h5>
                  <div className="form-row">
                    <label className="form-label">
                      Structure ID:
                      <input
                        type="text"
                        value={newMarking.structure?.id || ''}
                        onChange={(e) => setNewMarking({
                          ...newMarking,
                          structure: {
                            ...newMarking.structure!,
                            id: e.target.value
                          }
                        })}
                        placeholder="e.g., Building-123"
                        className="form-input"
                      />
                    </label>
                  </div>
                  
                  <div className="form-row">
                    <label className="form-label">
                      Search Team:
                      <input
                        type="text"
                        value={newMarking.structure?.searchTeam || ''}
                        onChange={(e) => setNewMarking({
                          ...newMarking,
                          structure: {
                            ...newMarking.structure!,
                            searchTeam: e.target.value
                          }
                        })}
                        placeholder="e.g., CA-TF1"
                        className="form-input"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h5>Search Code (FEMA X-Code)</h5>
                  <div className="search-code-form">
                    <div className="code-input-row">
                      <label className="code-input">
                        <span className="code-label">Top (Date/Time):</span>
                        <input
                          type="text"
                          value={newMarking.structure?.searchCode?.top || ''}
                          onChange={(e) => setNewMarking({
                            ...newMarking,
                            structure: {
                              ...newMarking.structure!,
                              searchCode: {
                                ...newMarking.structure!.searchCode!,
                                top: e.target.value
                              }
                            }
                          })}
                          placeholder="MM/DD HHMM"
                          className="form-input"
                        />
                      </label>
                      
                      <label className="code-input">
                        <span className="code-label">Left (Team ID):</span>
                        <input
                          type="text"
                          value={newMarking.structure?.searchCode?.left || ''}
                          onChange={(e) => setNewMarking({
                            ...newMarking,
                            structure: {
                              ...newMarking.structure!,
                              searchCode: {
                                ...newMarking.structure!.searchCode!,
                                left: e.target.value
                              }
                            }
                          })}
                          placeholder="Team identifier"
                          className="form-input"
                        />
                      </label>
                    </div>
                    
                    <div className="code-input-row">
                      <label className="code-input">
                        <span className="code-label">Right (Hazards):</span>
                        <input
                          type="text"
                          value={newMarking.structure?.searchCode?.right || ''}
                          onChange={(e) => setNewMarking({
                            ...newMarking,
                            structure: {
                              ...newMarking.structure!,
                              searchCode: {
                                ...newMarking.structure!.searchCode!,
                                right: e.target.value
                              }
                            }
                          })}
                          placeholder="Hazard description"
                          className="form-input"
                        />
                      </label>
                      
                      <label className="code-input">
                        <span className="code-label">Bottom (Victims):</span>
                        <input
                          type="number"
                          value={newMarking.structure?.searchCode?.bottom || 0}
                          onChange={(e) => setNewMarking({
                            ...newMarking,
                            structure: {
                              ...newMarking.structure!,
                              searchCode: {
                                ...newMarking.structure!.searchCode!,
                                bottom: parseInt(e.target.value) || 0
                              }
                            }
                          })}
                          min="0"
                          className="form-input"
                        />
                      </label>
                    </div>
                    
                    <div className="code-input-row">
                      <label className="code-input center-input">
                        <span className="code-label">Center (Fully Searched):</span>
                        <input
                          type="checkbox"
                          checked={newMarking.structure?.searchCode?.center === 'X'}
                          onChange={(e) => setNewMarking({
                            ...newMarking,
                            structure: {
                              ...newMarking.structure!,
                              searchCode: {
                                ...newMarking.structure!.searchCode!,
                                ...(e.target.checked && { center: 'X' })
                              }
                            }
                          })}
                          className="form-checkbox"
                        />
                        <span>Mark as fully searched</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h5>Assessment</h5>
                  <div className="form-row">
                    <label className="form-label">
                      Structural Damage:
                      <select
                        value={newMarking.structure?.structuralDamage || 'none'}
                        onChange={(e) => setNewMarking({
                          ...newMarking,
                          structure: {
                            ...newMarking.structure!,
                            structuralDamage: e.target.value as any
                          }
                        })}
                        className="form-select"
                      >
                        {femaConfig.structuralDamage.map(damage => (
                          <option key={damage.value} value={damage.value}>
                            {damage.icon} {damage.label} - {damage.description}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  
                  <div className="form-row">
                    <label className="form-label">
                      Re-Entry Status:
                      <select
                        value={newMarking.structure?.reEntry || 'safe'}
                        onChange={(e) => setNewMarking({
                          ...newMarking,
                          structure: {
                            ...newMarking.structure!,
                            reEntry: e.target.value as any
                          }
                        })}
                        className="form-select"
                      >
                        {femaConfig.reEntry.map(reEntry => (
                          <option key={reEntry.value} value={reEntry.value}>
                            {reEntry.icon} {reEntry.label} - {reEntry.description}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  
                  <div className="form-row">
                    <label className="form-label">
                      Notes:
                      <textarea
                        value={newMarking.structure?.notes || ''}
                        onChange={(e) => setNewMarking({
                          ...newMarking,
                          structure: {
                            ...newMarking.structure!,
                            notes: e.target.value
                          }
                        })}
                        placeholder="Additional notes about the search..."
                        className="form-textarea"
                        rows={3}
                      />
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="ios-button secondary"
                    onClick={() => setViewMode('overview')}
                  >
                    Cancel
                  </button>
                  <button 
                    className="ios-button primary"
                    onClick={handleCreateMarking}
                  >
                    Create Marking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Markings Overview */}
      {viewMode === 'overview' && (
        <div className="markings-overview">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Search Markings ({searchMarkings.length})</h4>
              
              <div className="markings-grid">
                {searchMarkings.map(marking => (
                  <div
                    key={marking.structure.id}
                    className="marking-card"
                    onClick={() => handleMarkingSelect(marking)}
                  >
                    <div className="marking-header">
                      <span className="marking-id">{marking.structure.id}</span>
                      <span className="marking-team">{marking.structure.searchTeam}</span>
                    </div>
                    
                    <div className="marking-search-code">
                      {getSearchCodeVisual(marking.structure.searchCode)}
                    </div>
                    
                    <div className="marking-assessment">
                      <div className="assessment-item">
                        <span className="assessment-label">Damage:</span>
                        <span className="assessment-value">
                          {getStructuralDamageIcon(marking.structure.structuralDamage)} {marking.structure.structuralDamage}
                        </span>
                      </div>
                      <div className="assessment-item">
                        <span className="assessment-label">Re-Entry:</span>
                        <span className="assessment-value">
                          {getReEntryIcon(marking.structure.reEntry)} {marking.structure.reEntry}
                        </span>
                      </div>
                    </div>
                    
                    <div className="marking-meta">
                      <div className="meta-item">
                        <span className="meta-label">Searched:</span>
                        <span className="meta-value">
                          {marking.structure.searchCompleted.toLocaleString()}
                        </span>
                      </div>
                      {marking.structure.notes && (
                        <div className="marking-notes">
                          📝 {marking.structure.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marking Details */}
      {viewMode === 'details' && selectedMarking && (
        <div className="marking-details">
          <div className="ios-card">
            <div className="ios-container">
              <div className="ios-flex-between">
                <h3>Search Marking Details</h3>
                <button 
                  className="ios-button secondary small"
                  onClick={() => setViewMode('overview')}
                >
                  ✕
                </button>
              </div>
              
              <div className="marking-details-content">
                <div className="detail-section">
                  <h4>Structure Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">ID:</span>
                      <span className="value">{selectedMarking.structure.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Search Team:</span>
                      <span className="value">{selectedMarking.structure.searchTeam}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Search Completed:</span>
                      <span className="value">
                        {selectedMarking.structure.searchCompleted.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>FEMA X-Code</h4>
                  {getSearchCodeVisual(selectedMarking.structure.searchCode)}
                </div>

                <div className="detail-section">
                  <h4>Assessment</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Structural Damage:</span>
                      <span className="value">
                        {getStructuralDamageIcon(selectedMarking.structure.structuralDamage)} {selectedMarking.structure.structuralDamage}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Re-Entry Status:</span>
                      <span className="value">
                        {getReEntryIcon(selectedMarking.structure.reEntry)} {selectedMarking.structure.reEntry}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedMarking.structure.notes && (
                  <div className="detail-section">
                    <h4>Notes</h4>
                    <div className="notes-content">
                      {selectedMarking.structure.notes}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Actions</h4>
                  <div className="marking-actions">
                    <button className="ios-button primary">
                      View on Map
                    </button>
                    <button className="ios-button secondary">
                                              Edit Marking
                    </button>
                    <button className="ios-button secondary">
                                              View Analytics
                    </button>
                    <button 
                      className="ios-button secondary danger"
                      onClick={() => {
                        if (onMarkingDelete && confirm('Delete this marking?')) {
                          onMarkingDelete(selectedMarking.structure.id);
                          setViewMode('overview');
                        }
                      }}
                    >
                                              Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEMA X-Code Legend */}
      <div className="fema-legend">
        <div className="ios-card">
          <div className="ios-container">
            <h4>📋 FEMA X-Code Legend</h4>
            <div className="legend-content">
              <p>
                The FEMA X-Code is a standardized system for marking structures after search and rescue operations.
                Each marking provides critical information about the search status and safety conditions.
              </p>
              <div className="legend-grid">
                <div className="legend-item">
                  <strong>Top:</strong> Date and time of search (MM/DD HHMM)
                </div>
                <div className="legend-item">
                  <strong>Left:</strong> Search team identifier
                </div>
                <div className="legend-item">
                  <strong>Right:</strong> Hazards or special conditions found
                </div>
                <div className="legend-item">
                  <strong>Bottom:</strong> Number of live victims removed
                </div>
                <div className="legend-item">
                  <strong>Center:</strong> X indicates structure fully searched
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

