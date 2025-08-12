import React, { useState, useEffect } from 'react';
import { RouteProfiles, OperationalRoute, EmergencyUnit, StagingArea } from '../types/emergency-response';
import './RoleBasedRouting.css';

interface RoleBasedRoutingProps {
  routes: OperationalRoute[];
  units: EmergencyUnit[];
  stagingAreas: StagingArea[];
  onRouteSelect?: (route: OperationalRoute) => void;
  onRouteUpdate?: (routeId: string, updates: Partial<OperationalRoute>) => void;
  className?: string;
}

export const RoleBasedRouting: React.FC<RoleBasedRoutingProps> = ({
  routes,
  units,
  stagingAreas,
  onRouteSelect,
  onRouteUpdate,
  className = ''
}) => {
  const [selectedRoute, setSelectedRoute] = useState<OperationalRoute | null>(null);
  const [activeProfile, setActiveProfile] = useState<keyof RouteProfiles | 'ALL'>('CIVILIAN_EVACUATION');
  const [viewMode, setViewMode] = useState<'routes' | 'units' | 'staging' | 'deconfliction'>('routes');
  const [showDeconflicted, setShowDeconflicted] = useState(true);

  // Route profile configuration
  const routeProfiles: RouteProfiles = {
    CIVILIAN_EVACUATION: {
      algorithm: 'maximum_safety',
      constraints: {
        avoidHazardBuffer: 1000,
        avoidSmoke: true,
        preferHighways: true,
        avoidWaterCrossings: true,
        maxGradient: 8,
        minRoadWidth: 3.5
      },
      priorities: ['safety', 'capacity', 'speed']
    },
    EMS_RESPONSE: {
      algorithm: 'calculated_risk',
      constraints: {
        avoidHazardBuffer: 200,
        allowSmokeTransit: true,
        requireTwoWayAccess: true,
        maxResponseTime: 8,
        deconflictWithOtherUnits: true,
        requireStagingArea: true
      },
      priorities: ['speed', 'safety', 'accessibility']
    },
    FIRE_TACTICAL: {
      algorithm: 'direct_approach',
      constraints: {
        avoidHazardBuffer: 0,
        requireWaterSource: true,
        checkVehicleClearance: true,
        maintainEscapeRoutes: 2,
        requireCommandPost: true
      },
      priorities: ['access', 'safety', 'efficiency']
    },
    POLICE_ESCORT: {
      algorithm: 'secure_transit',
      constraints: {
        avoidHazardBuffer: 500,
        requireArterialRoads: true,
        maintainFormation: true,
        requireStagingAreas: true
      },
      priorities: ['security', 'coordination', 'speed']
    }
  };

  const getProfileColor = (profile: keyof RouteProfiles): string => {
    switch (profile) {
      case 'CIVILIAN_EVACUATION': return '#34C759'; // Green
      case 'EMS_RESPONSE': return '#007AFF';        // Blue
      case 'FIRE_TACTICAL': return '#FF3B30';       // Red
      case 'POLICE_ESCORT': return '#5856D6';       // Purple
      default: return '#8E8E93';
    }
  };

  const getProfileIcon = (profile: keyof RouteProfiles): string => {
    switch (profile) {
      case 'CIVILIAN_EVACUATION': return '👥';
      case 'EMS_RESPONSE': return '🚑';
      case 'FIRE_TACTICAL': return '🚒';
      case 'POLICE_ESCORT': return '🚓';
      default: return '🚗';
    }
  };

  const getRouteStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#34C759';
      case 'planned': return '#007AFF';
      case 'completed': return '#8E8E93';
      case 'blocked': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getRouteStatusIcon = (status: string): string => {
    switch (status) {
      case 'active': return '🟢';
      case 'planned': return '🔵';
      case 'completed': return '⚪';
      case 'blocked': return '🔴';
      default: return '⚪';
    }
  };

  const calculateRouteEfficiency = (route: OperationalRoute): number => {
    if (!route.actualTime || route.estimatedTime === 0) return 0;
    return Math.round(((route.estimatedTime - route.actualTime) / route.estimatedTime) * 100);
  };

  const getDeconflictionStatus = (route: OperationalRoute): string => {
    if (route.deconflicted) return 'Deconflicted';
    return 'Needs Deconfliction';
  };

  const getCapacityStatus = (route: OperationalRoute): string => {
    const usage = route.currentUsage;
    const capacity = route.capacity;
    const percentage = Math.round((usage / capacity) * 100);
    
    if (percentage >= 90) return '🔴 Critical';
    if (percentage >= 75) return '🟡 High';
    if (percentage >= 50) return '🟠 Moderate';
    return '🟢 Good';
  };

  const handleRouteSelect = (route: OperationalRoute) => {
    setSelectedRoute(route);
    if (onRouteSelect) {
      onRouteSelect(route);
    }
  };

  const filteredRoutes = routes.filter(route => {
    if (activeProfile !== 'ALL' && route.profile !== activeProfile) return false;
    if (showDeconflicted && !route.deconflicted) return false;
    return true;
  });

  const getUnitsForRoute = (routeId: string) => {
    return units.filter(unit => unit.assignedRoute === routeId);
  };

  const getStagingAreasForRoute = (routeId: string) => {
    return stagingAreas.filter(area => area.accessRoutes.includes(routeId));
  };

  return (
    <div className={`role-based-routing ${className}`} style={{
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
                Role-Based Routing System
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Intelligent route optimization for different emergency response roles
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <button 
                className={`ios-button ${viewMode === 'routes' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('routes')}
              >
                Routes
              </button>
              <button 
                className={`ios-button ${viewMode === 'units' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('units')}
              >
                Units
              </button>
              <button 
                className={`ios-button ${viewMode === 'staging' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('staging')}
              >
                Staging
              </button>
              <button 
                className={`ios-button ${viewMode === 'deconfliction' ? 'primary' : 'secondary'} small`}
                onClick={() => setViewMode('deconfliction')}
              >
                Deconfliction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Selection */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <h4>Route Profile Selection</h4>
          <div className="profile-selector">
            <button
              key="ALL"
              className={`profile-button ${activeProfile === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveProfile('ALL')}
              style={{
                borderColor: '#666',
                backgroundColor: activeProfile === 'ALL' ? '#666' : 'transparent',
                color: activeProfile === 'ALL' ? 'white' : '#666'
              }}
            >
              <span className="profile-icon">🌐</span>
              <span className="profile-name">All Profiles</span>
            </button>
            {Object.keys(routeProfiles).map(profile => (
              <button
                key={profile}
                className={`profile-button ${activeProfile === profile ? 'active' : ''}`}
                onClick={() => setActiveProfile(profile as keyof RouteProfiles)}
                style={{
                  borderColor: getProfileColor(profile as keyof RouteProfiles),
                  backgroundColor: activeProfile === profile ? getProfileColor(profile as keyof RouteProfiles) : 'transparent',
                  color: activeProfile === profile ? 'white' : getProfileColor(profile as keyof RouteProfiles)
                }}
              >
                <span className="profile-icon">{getProfileIcon(profile as keyof RouteProfiles)}</span>
                <span className="profile-name">{profile.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
          
          {/* Profile Details */}
          <div className="profile-details">
            <h5>Current Profile: {activeProfile === 'ALL' ? 'All Profiles' : activeProfile.replace('_', ' ')}</h5>
            {activeProfile !== 'ALL' && (
              <div className="profile-info">
                <div className="info-row">
                  <span className="label">Algorithm:</span>
                  <span className="value">{routeProfiles[activeProfile].algorithm}</span>
                </div>
                <div className="info-row">
                  <span className="label">Priorities:</span>
                  <span className="value">{routeProfiles[activeProfile].priorities.join(' > ')}</span>
                </div>
                <div className="info-row">
                  <span className="label">Hazard Buffer:</span>
                  <span className="value">{routeProfiles[activeProfile].constraints.avoidHazardBuffer}m</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="filters">
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={showDeconflicted}
                onChange={(e) => setShowDeconflicted(e.target.checked)}
              />
              <span>Show Only Deconflicted Routes</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'routes' && (
        <div className="routes-view">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Operational Routes ({filteredRoutes.length})</h4>
              <div className="routes-grid">
                {filteredRoutes.map(route => (
                  <div
                    key={route.id}
                    className={`route-card ${route.status} ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                    onClick={() => handleRouteSelect(route)}
                  >
                    <div className="route-header">
                      <div className="route-profile">
                        <span className="profile-icon" style={{ color: getProfileColor(route.profile) }}>
                          {getProfileIcon(route.profile)}
                        </span>
                        <span className="profile-name">{route.profile.replace('_', ' ')}</span>
                      </div>
                      <div className="route-status">
                        <span className="status-icon">{getRouteStatusIcon(route.status)}</span>
                        <span className="status-text">{route.status}</span>
                      </div>
                    </div>
                    
                    <div className="route-info">
                      <div className="route-points">
                        <div className="point start">
                          <span className="label">Start:</span>
                          <span className="coordinates">
                            {route.startPoint[0].toFixed(4)}, {route.startPoint[1].toFixed(4)}
                          </span>
                        </div>
                        <div className="point end">
                          <span className="label">End:</span>
                          <span className="coordinates">
                            {route.endPoint[0].toFixed(4)}, {route.endPoint[1].toFixed(4)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="route-metrics">
                        <div className="metric">
                          <span className="label">Capacity:</span>
                          <span className="value">{getCapacityStatus(route)}</span>
                        </div>
                        <div className="metric">
                          <span className="label">Usage:</span>
                          <span className="value">{route.currentUsage}/{route.capacity}</span>
                        </div>
                        <div className="metric">
                          <span className="label">Time:</span>
                          <span className="value">{route.estimatedTime} min</span>
                        </div>
                        <div className="metric">
                          <span className="label">Efficiency:</span>
                          <span className="value">{calculateRouteEfficiency(route)}%</span>
                        </div>
                      </div>
                      
                      <div className="route-details">
                        <div className="deconfliction-status">
                          {getDeconflictionStatus(route)}
                        </div>
                        <div className="assigned-units">
                          <span className="label">Units:</span>
                          <span className="value">{route.assignedUnits.length}</span>
                        </div>
                        <div className="staging-areas">
                          <span className="label">Staging:</span>
                          <span className="value">{route.stagingAreas.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'units' && (
        <div className="units-view">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Emergency Units ({units.length})</h4>
              <div className="units-grid">
                {units.map(unit => (
                  <div key={unit.id} className="unit-card">
                    <div className="unit-header">
                      <span className="unit-type">{unit.type.replace('_', ' ')}</span>
                      <span className={`unit-status ${unit.status}`}>{unit.status}</span>
                    </div>
                    <div className="unit-info">
                      <div className="unit-location">
                        {unit.location[0].toFixed(4)}, {unit.location[1].toFixed(4)}
                      </div>
                      <div className="unit-assignment">
                        {unit.assignedRoute ? (
                          <span className="assigned">Route: {unit.assignedRoute}</span>
                        ) : (
                          <span className="unassigned">⏳ No route assigned</span>
                        )}
                      </div>
                      <div className="unit-capabilities">
                        <span className="label">Capabilities:</span>
                        <span className="value">{unit.capabilities.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'staging' && (
        <div className="staging-view">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Staging Areas ({stagingAreas.length})</h4>
              <div className="staging-grid">
                {stagingAreas.map(area => (
                  <div key={area.id} className="staging-card">
                    <div className="staging-header">
                      <span className="staging-type">{area.type}</span>
                      <span className="staging-capacity">{area.currentUnits}/{area.capacity}</span>
                    </div>
                    <div className="staging-info">
                      <div className="staging-location">
                        {area.location[0].toFixed(4)}, {area.location[1].toFixed(4)}
                      </div>
                      <div className="staging-access">
                        <span className="label">Access Routes:</span>
                        <span className="value">{area.accessRoutes.length}</span>
                      </div>
                      <div className="staging-facilities">
                        <span className="label">Facilities:</span>
                        <span className="value">{area.facilities.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'deconfliction' && (
        <div className="deconfliction-view">
          <div className="ios-card">
            <div className="ios-container">
              <h4>Route Deconfliction</h4>
              <div className="deconfliction-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Routes:</span>
                  <span className="stat-value">{routes.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Deconflicted:</span>
                  <span className="stat-value deconflicted">
                    {routes.filter(r => r.deconflicted).length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Needs Deconfliction:</span>
                  <span className="stat-value needs-deconfliction">
                    {routes.filter(r => !r.deconflicted).length}
                  </span>
                </div>
              </div>
              
              <div className="deconfliction-list">
                {routes.filter(r => !r.deconflicted).map(route => (
                  <div key={route.id} className="deconfliction-item">
                    <div className="conflict-info">
                      <span className="route-id">{route.id}</span>
                      <span className="conflict-type">Route overlap detected</span>
                    </div>
                    <button className="ios-button primary small">
                      🔧 Resolve Conflict
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Details Panel */}
      {selectedRoute && (
        <div className="route-details-panel">
          <div className="ios-card">
            <div className="ios-container">
              <div className="ios-flex-between">
                <h3>Route Details</h3>
                <button 
                  className="ios-button secondary small"
                  onClick={() => setSelectedRoute(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="route-details-content">
                <div className="detail-section">
                  <h4>Route Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Profile:</span>
                      <span className="value">{selectedRoute.profile.replace('_', ' ')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className="value">{selectedRoute.status}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Capacity:</span>
                      <span className="value">{selectedRoute.capacity}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Current Usage:</span>
                      <span className="value">{selectedRoute.currentUsage}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Estimated Time:</span>
                      <span className="value">{selectedRoute.estimatedTime} minutes</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Deconflicted:</span>
                      <span className="value">{selectedRoute.deconflicted ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Assigned Units</h4>
                  <div className="units-list">
                    {getUnitsForRoute(selectedRoute.id).map(unit => (
                      <div key={unit.id} className="unit-item">
                        <span className="unit-id">{unit.id}</span>
                        <span className="unit-type">{unit.type}</span>
                        <span className="unit-status">{unit.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Staging Areas</h4>
                  <div className="staging-list">
                    {getStagingAreasForRoute(selectedRoute.id).map(area => (
                      <div key={area.id} className="staging-item">
                        <span className="staging-id">{area.id}</span>
                        <span className="staging-type">{area.type}</span>
                        <span className="staging-capacity">{area.currentUnits}/{area.capacity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Route Actions</h4>
                  <div className="route-actions">
                    <button className="ios-button primary">
                      View on Map
                    </button>
                    <button className="ios-button secondary">
                      View Analytics
                    </button>
                    <button className="ios-button secondary">
                      🔧 Optimize Route
                    </button>
                    <button className="ios-button secondary">
                      Issue Alert
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

export default RoleBasedRouting;
