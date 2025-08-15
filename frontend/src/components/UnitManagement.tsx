import React, { useState, useEffect } from 'react';
import { EmergencyUnit, EvacuationZone, OperationalRoute } from '../types/emergency-response';
import './UnitManagement.css';

interface UnitManagementProps {
  units: EmergencyUnit[];
  zones: EvacuationZone[];
  routes: OperationalRoute[];
  onUnitAssign?: (unitId: string, targetId: string, targetType: 'zone' | 'route') => void;
  onUnitStatusUpdate?: (unitId: string, status: EmergencyUnit['status']) => void;
  className?: string;
}

export const UnitManagement: React.FC<UnitManagementProps> = ({
  units,
  zones,
  routes,
  onUnitAssign,
  onUnitStatusUpdate,
  className = ''
}) => {
  const [selectedUnit, setSelectedUnit] = useState<EmergencyUnit | null>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'units' | 'assignments' | 'status' | 'capabilities'>('units');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Unit type configuration
  const unitTypes = {
    FIRE_ENGINE: {
      icon: '🚒',
      color: '#FF3B30',
      capabilities: ['Fire Suppression', 'Rescue', 'Water Supply'],
      maxSpeed: 80,
      crewSize: 4
    },
    AMBULANCE: {
      icon: '🚑',
      color: '#007AFF',
      capabilities: ['Medical Transport', 'Emergency Care', 'Patient Monitoring'],
      maxSpeed: 90,
      crewSize: 2
    },
    POLICE_VEHICLE: {
      icon: '🚓',
      color: '#5856D6',
      capabilities: ['Traffic Control', 'Security', 'Escort'],
      maxSpeed: 100,
      crewSize: 2
    },
    COMMAND_VEHICLE: {
      icon: '🚐',
      color: '#FF9500',
      capabilities: ['Command Post', 'Communications', 'Coordination'],
      maxSpeed: 70,
      crewSize: 6
    },
    UTILITY_TRUCK: {
      icon: '🚛',
      color: '#8E8E93',
      capabilities: ['Equipment Transport', 'Support', 'Logistics'],
      maxSpeed: 60,
      crewSize: 3
    }
  };

  // Get unit type configuration
  const getUnitTypeConfig = (type: string) => {
    return unitTypes[type as keyof typeof unitTypes] || {
      icon: '🚗',
      color: '#8E8E93',
      capabilities: ['General Purpose'],
      maxSpeed: 70,
      crewSize: 2
    };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#34C759';
      case 'assigned': return '#007AFF';
      case 'en_route': return '#FF9500';
      case 'on_scene': return '#FF3B30';
      case 'returning': return '#5856D6';
      case 'maintenance': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '🟢';
      case 'assigned': return '🔵';
      case 'en_route': return '🟡';
      case 'on_scene': return '🔴';
      case 'returning': return '🟣';
      case 'maintenance': return '⚪';
      default: return '⚪';
    }
  };

  // Filter units
  const getFilteredUnits = () => {
    return units.filter(unit => {
      if (filterType !== 'all' && unit.type !== filterType) return false;
      if (filterStatus !== 'all' && unit.status !== filterStatus) return false;
      return true;
    });
  };

  // Handle unit selection
  const handleUnitSelect = (unit: EmergencyUnit) => {
    setSelectedUnit(unit);
  };

  // Handle unit assignment
  const handleUnitAssign = (unitId: string, targetId: string, targetType: 'zone' | 'route') => {
    if (onUnitAssign) {
      onUnitAssign(unitId, targetId, targetType);
    }
    setDragTarget(null);
  };

  // Handle unit status update
  const handleStatusUpdate = (unitId: string, newStatus: EmergencyUnit['status']) => {
    if (onUnitStatusUpdate) {
      onUnitStatusUpdate(unitId, newStatus);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, unitId: string) => {
    e.dataTransfer.setData('text/plain', unitId);
    setDragTarget(unitId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'zone' | 'route') => {
    e.preventDefault();
    const unitId = e.dataTransfer.getData('text/plain');
    if (unitId) {
      handleUnitAssign(unitId, targetId, targetType);
    }
  };

  // Calculate assignment statistics
  const getAssignmentStats = () => {
    const total = units.length;
    const assigned = units.filter(u => u.status === 'responding' || u.status === 'on_scene' || u.status === 'deployed').length;
    const available = units.filter(u => u.status === 'available').length;
    const maintenance = units.filter(u => u.status === 'out_of_service').length;

    return { total, assigned, available, maintenance };
  };

  const stats = getAssignmentStats();

  return (
    <div className={`unit-management ${className}`} style={{
      padding: '20px',
      backgroundColor: '#f5f5f7',
      borderRadius: '12px',
      minHeight: '600px',
      margin: '0',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                Unit Management System
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Drag-and-drop unit assignment and real-time status tracking
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <button 
                className={`ios-button ${viewMode === 'units' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('units')}
              >
                Units
              </button>
              <button 
                className={`ios-button ${viewMode === 'assignments' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('assignments')}
              >
                Assignments
              </button>
              <button 
                className={`ios-button ${viewMode === 'status' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('status')}
              >
                Status
              </button>
              <button 
                className={`ios-button ${viewMode === 'capabilities' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('capabilities')}
              >
                Capabilities
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <h4>Unit Status Overview</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#007AFF' }}>{stats.assigned}</div>
              <div className="stat-label">Assigned</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#34C759' }}>{stats.available}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#8E8E93' }}>{stats.maintenance}</div>
              <div className="stat-label">Maintenance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="filters">
            <div className="filter-group">
              <label>Unit Type:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                {Object.keys(unitTypes).map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="en_route">En Route</option>
                <option value="on_scene">On Scene</option>
                <option value="returning">Returning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'units' && (
        <div className="units-view">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Emergency Units ({getFilteredUnits().length})</h4>
              <div className="units-grid">
                {getFilteredUnits().map(unit => {
                  const typeConfig = getUnitTypeConfig(unit.type);
                  return (
                    <div
                      key={unit.id}
                      className={`unit-card ${selectedUnit?.id === unit.id ? 'selected' : ''}`}
                      onClick={() => handleUnitSelect(unit)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, unit.id)}
                      style={{
                        borderColor: dragTarget === unit.id ? typeConfig.color : undefined,
                        opacity: dragTarget === unit.id ? 0.7 : 1
                      }}
                    >
                      <div className="unit-header">
                        <div className="unit-type">
                          <span className="unit-icon" style={{ color: typeConfig.color }}>
                            {typeConfig.icon}
                          </span>
                          <span className="unit-name">{unit.id}</span>
                        </div>
                        <div className="unit-status">
                          <span className="status-icon">{getStatusIcon(unit.status)}</span>
                          <span className="status-text">{unit.status}</span>
                        </div>
                      </div>
                      
                      <div className="unit-info">
                        <div className="unit-details">
                          <div className="detail-item">
                            <span className="label">Type:</span>
                            <span className="value">{unit.type.replace('_', ' ')}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Location:</span>
                            <span className="value">
                              {unit.location[0].toFixed(4)}, {unit.location[1].toFixed(4)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Crew:</span>
                            <span className="value">{typeConfig.crewSize} personnel</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Max Speed:</span>
                            <span className="value">{typeConfig.maxSpeed} mph</span>
                          </div>
                        </div>
                        
                        <div className="unit-capabilities">
                          <span className="label">Capabilities:</span>
                          <div className="capabilities-list">
                            {typeConfig.capabilities.slice(0, 2).map((cap, index) => (
                              <span key={index} className="capability-tag">{cap}</span>
                            ))}
                            {typeConfig.capabilities.length > 2 && (
                              <span className="capability-more">+{typeConfig.capabilities.length - 2} more</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="unit-assignment">
                          {unit.assignedRoute ? (
                            <span className="assigned">Route: {unit.assignedRoute}</span>
                          ) : unit.assignedIncident ? (
                            <span className="assigned">Incident: {unit.assignedIncident}</span>
                          ) : (
                            <span className="unassigned">⏳ No assignment</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'assignments' && (
        <div className="assignments-view">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Unit Assignments</h4>
              
              {/* Zones */}
              <div className="assignment-section">
                <h5>Evacuation Zones</h5>
                <div className="zones-grid">
                  {zones.map(zone => (
                    <div
                      key={zone.id}
                      className="zone-drop-zone"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, zone.id, 'zone')}
                    >
                      <div className="zone-header">
                        <span className="zone-name">{zone.name}</span>
                        <span className="zone-priority" style={{ color: getPriorityColor(zone.priority) }}>
                          {zone.priority}
                        </span>
                      </div>
                      <div className="zone-info">
                        <div className="zone-stats">
                          <span>Population: {zone.totalPopulation}</span>
                          <span>Buildings: {zone.totalBuildings}</span>
                        </div>
                        <div className="assigned-units">
                          {units.filter(u => u.assignedIncident && u.assignedIncident.includes(zone.id)).map(unit => (
                            <div key={unit.id} className="assigned-unit">
                              <span className="unit-icon">{getUnitTypeConfig(unit.type).icon}</span>
                              <span className="unit-id">{unit.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Routes */}
              <div className="assignment-section">
                <h5>Operational Routes</h5>
                <div className="routes-grid">
                  {routes.map(route => (
                    <div
                      key={route.id}
                      className="route-drop-zone"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, route.id, 'route')}
                    >
                      <div className="route-header">
                        <span className="route-name">{route.profile.replace('_', ' ')}</span>
                        <span className="route-status">{route.status}</span>
                      </div>
                      <div className="route-info">
                        <div className="route-stats">
                          <span>Capacity: {route.capacity}</span>
                          <span>Time: {route.estimatedTime} min</span>
                        </div>
                        <div className="assigned-units">
                          {units.filter(u => u.assignedRoute === route.id).map(unit => (
                            <div key={unit.id} className="assigned-unit">
                              <span className="unit-icon">{getUnitTypeConfig(unit.type).icon}</span>
                              <span className="unit-id">{unit.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'status' && (
        <div className="status-view">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Unit Status Management</h4>
              <div className="status-grid">
                {units.map(unit => (
                  <div key={unit.id} className="status-card">
                    <div className="status-header">
                      <span className="unit-id">{unit.id}</span>
                      <span className="current-status">{unit.status}</span>
                    </div>
                    <div className="status-controls">
                      <select
                        value={unit.status}
                        onChange={(e) => handleStatusUpdate(unit.id, e.target.value as EmergencyUnit['status'])}
                        className="status-select"
                      >
                        <option value="available">Available</option>
                        <option value="assigned">Assigned</option>
                        <option value="en_route">En Route</option>
                        <option value="on_scene">On Scene</option>
                        <option value="returning">Returning</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'capabilities' && (
        <div className="capabilities-view">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Unit Capabilities Overview</h4>
              <div className="capabilities-grid">
                {Object.entries(unitTypes).map(([type, config]) => (
                  <div key={type} className="capability-card">
                    <div className="capability-header">
                      <span className="capability-icon" style={{ color: config.color }}>
                        {config.icon}
                      </span>
                      <span className="capability-name">{type.replace('_', ' ')}</span>
                    </div>
                    <div className="capability-details">
                      <div className="capability-stats">
                        <span>Max Speed: {config.maxSpeed} mph</span>
                        <span>Crew Size: {config.crewSize}</span>
                      </div>
                      <div className="capabilities-list">
                        {config.capabilities.map((cap, index) => (
                          <span key={index} className="capability-tag">{cap}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Details Panel */}
      {selectedUnit && (
        <div className="unit-details-panel">
          <div className="ios-card">
            <div className="ios-container">
              <div className="ios-flex-between">
                <h3>Unit Details</h3>
                <button 
                  className="ios-button secondary small"
                  onClick={() => setSelectedUnit(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="unit-details-content">
                <div className="detail-section">
                  <h4>Unit Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">ID:</span>
                      <span className="value">{selectedUnit.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span className="value">{selectedUnit.type.replace('_', ' ')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className="value">{selectedUnit.status}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Location:</span>
                      <span className="value">
                        {selectedUnit.location[0].toFixed(4)}, {selectedUnit.location[1].toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Capabilities</h4>
                  <div className="capabilities-grid">
                    {getUnitTypeConfig(selectedUnit.type).capabilities.map((cap, index) => (
                      <span key={index} className="capability-tag">{cap}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Current Assignment</h4>
                  <div className="assignment-info">
                    {selectedUnit.assignedRoute ? (
                      <div className="assignment-item">
                        <span className="label">Route:</span>
                        <span className="value">{selectedUnit.assignedRoute}</span>
                      </div>
                    ) : selectedUnit.assignedIncident ? (
                      <div className="assignment-item">
                        <span className="label">Incident:</span>
                        <span className="value">{selectedUnit.assignedIncident}</span>
                      </div>
                    ) : (
                      <div className="assignment-item">
                        <span className="label">Status:</span>
                        <span className="value">Unassigned</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Unit Actions</h4>
                  <div className="unit-actions">
                    <button className="ios-button primary">
                      View on Map
                    </button>
                    <button className="ios-button secondary">
                      Update Status
                    </button>
                    <button className="ios-button secondary">
                      View History
                    </button>
                    <button className="ios-button secondary">
                      Maintenance Log
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for priority color (should match EvacuationDashboard)
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'immediate': return 'var(--ios-red)';
    case 'warning': return 'var(--ios-orange)';
    case 'standby': return 'var(--ios-blue)';
    case 'all_clear': return 'var(--ios-green)';
    default: return 'var(--ios-light-gray)';
  }
};

export default UnitManagement;
