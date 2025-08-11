import React, { useState } from 'react';
import { SimpleMapboxTest } from './SimpleMapboxTest';
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Building2,
  Layers,
  Info,
  Settings,
  Mountain,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';

interface LiveHazardMapProps {
  showPredictions?: boolean;
  show3D?: boolean;
  autoUpdate?: boolean;
}

export const LiveHazardMap: React.FC<LiveHazardMapProps> = ({
  autoUpdate = true
}) => {
  const [showHazards, setShowHazards] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  // 3D Terrain and 3D Buildings are always enabled
  const showBuildings = true;
  const showTerrain = true;
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const toggleControlPanel = () => {
    setIsControlPanelOpen(!isControlPanelOpen);
  };

  // Simulate real-time updates
  React.useEffect(() => {
    if (!autoUpdate) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoUpdate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ios-background)' }}>
      {/* Enhanced Header */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                🚨 Live Hazard Response Map
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Real-time 3D terrain visualization with live hazard data and Foundry integration
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <button 
                onClick={toggleControlPanel}
                className="ios-button secondary small"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}
              >
                {isControlPanelOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isControlPanelOpen ? 'Hide' : 'Show'} Controls
              </button>
              
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <Activity className="w-4 h-4" style={{ color: 'var(--ios-red)' }} />
                <span className="ios-caption" style={{ margin: 0 }}>Live Data</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <Mountain className="w-4 h-4" style={{ color: 'var(--ios-blue)' }} />
                <span className="ios-caption" style={{ margin: 0 }}>3D Terrain</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <Building2 className="w-4 h-4" style={{ color: 'var(--ios-green)' }} />
                <span className="ios-caption" style={{ margin: 0 }}>3D Buildings</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <Layers className="w-4 h-4" style={{ color: 'var(--ios-purple)' }} />
                <span className="ios-caption" style={{ margin: 0 }}>Foundry Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ios-container" style={{ padding: 0 }}>
        <div className="ios-grid" style={{ 
          gridTemplateColumns: isControlPanelOpen ? '350px 1fr' : '1fr', 
          gap: 'var(--ios-spacing-lg)',
          transition: 'grid-template-columns var(--ios-transition-normal)'
        }}>
          {/* Enhanced Control Panel */}
          {isControlPanelOpen && (
            <div className="ios-slide-up">
              <div className="ios-card" style={{ margin: 0, position: 'sticky', top: 'var(--ios-spacing-lg)' }}>
                <div>
                  <h2 className="ios-subheadline" style={{ margin: 0, marginBottom: 'var(--ios-spacing-lg)', display: 'flex', alignItems: 'center' }}>
                    <Settings className="w-5 h-5" style={{ marginRight: 'var(--ios-spacing-sm)' }} />
                    Live Map Controls
                  </h2>
                  
                  {/* Layer Controls */}
                  <div style={{ marginBottom: 'var(--ios-spacing-lg)' }}>
                    <label className="ios-body" style={{ display: 'block', margin: 0, marginBottom: 'var(--ios-spacing-sm)', fontWeight: '600' }}>Live Layers</label>
                    
                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)', backgroundColor: showHazards ? 'rgba(255, 59, 48, 0.1)' : 'transparent' }}>
                      <input
                        type="checkbox"
                        checked={showHazards}
                        onChange={(e) => setShowHazards(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <AlertTriangle className="w-4 h-4" style={{ color: showHazards ? 'var(--ios-red)' : 'var(--ios-secondary-text)' }} />
                      <span className="ios-body" style={{ margin: 0, color: showHazards ? 'var(--ios-text)' : 'var(--ios-secondary-text)' }}>Hazard Zones</span>
                    </label>

                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)', backgroundColor: showUnits ? 'rgba(0, 122, 255, 0.1)' : 'transparent' }}>
                      <input
                        type="checkbox"
                        checked={showUnits}
                        onChange={(e) => setShowUnits(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <Shield className="w-4 h-4" style={{ color: showUnits ? 'var(--ios-blue)' : 'var(--ios-secondary-text)' }} />
                      <span className="ios-body" style={{ margin: 0, color: showUnits ? 'var(--ios-text)' : 'var(--ios-secondary-text)' }}>Emergency Units</span>
                    </label>

                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)', backgroundColor: showRoutes ? 'rgba(255, 149, 0, 0.1)' : 'transparent' }}>
                      <input
                        type="checkbox"
                        checked={showRoutes}
                        onChange={(e) => setShowRoutes(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <MapPin className="w-4 h-4" style={{ color: showRoutes ? 'var(--ios-orange)' : 'var(--ios-secondary-text)' }} />
                      <span className="ios-body" style={{ margin: 0, color: showRoutes ? 'var(--ios-text)' : 'var(--ios-secondary-text)' }}>Evacuation Routes</span>
                    </label>

                    {/* 3D Buildings - Always Enabled */}
                    <div className="ios-flex" style={{ gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
                      <Building2 className="w-4 h-4" style={{ color: 'var(--ios-green)' }} />
                      <span className="ios-body" style={{ margin: 0, color: 'var(--ios-text)', fontWeight: '600' }}>3D Buildings</span>
                      <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-green)', marginLeft: 'auto' }}>Always On</span>
                    </div>

                    {/* 3D Terrain - Always Enabled */}
                    <div className="ios-flex" style={{ gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                      <Mountain className="w-4 h-4" style={{ color: 'var(--ios-blue)' }} />
                      <span className="ios-body" style={{ margin: 0, color: 'var(--ios-text)', fontWeight: '600' }}>3D Terrain</span>
                      <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-blue)', marginLeft: 'auto' }}>Always On</span>
                    </div>

                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)', backgroundColor: showAnalytics ? 'rgba(88, 86, 214, 0.1)' : 'transparent' }}>
                      <input
                        type="checkbox"
                        checked={showAnalytics}
                        onChange={(e) => setShowAnalytics(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <Info className="w-4 h-4" style={{ color: showAnalytics ? 'var(--ios-purple)' : 'var(--ios-secondary-text)' }} />
                      <span className="ios-body" style={{ margin: 0, color: showAnalytics ? 'var(--ios-text)' : 'var(--ios-secondary-text)' }}>Analytics Panel</span>
                    </label>
                  </div>

                  {/* Layer Status Indicator */}
                  <div style={{ marginBottom: 'var(--ios-spacing-lg)' }}>
                    <label className="ios-body" style={{ display: 'block', margin: 0, marginBottom: 'var(--ios-spacing-sm)', fontWeight: '600' }}>Active Layers</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
                      <div className="ios-flex" style={{ alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          backgroundColor: showHazards ? 'var(--ios-red)' : 'var(--ios-light-gray)', 
                          borderRadius: '50%',
                          transition: 'background-color var(--ios-transition-fast)'
                        }}></div>
                        <span className="ios-caption" style={{ margin: 0, color: showHazards ? 'var(--ios-text)' : 'var(--ios-secondary-text)' }}>
                          Hazards: {showHazards ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <div className="ios-flex" style={{ alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          backgroundColor: showRoutes ? 'var(--ios-orange)' : 'var(--ios-light-gray)', 
                          borderRadius: '50%',
                          transition: 'background-color var(--ios-transition-fast)'
                        }}></div>
                        <span className="ios-caption" style={{ margin: 0, color: showRoutes ? 'var(--ios-text)' : 'var(--ios-secondary-text)' }}>
                          Routes: {showRoutes ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <div className="ios-flex" style={{ alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          backgroundColor: 'var(--ios-green)', 
                          borderRadius: '50%'
                        }}></div>
                        <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-text)' }}>
                          Buildings: 3D Always Enabled
                        </span>
                      </div>
                      <div className="ios-flex" style={{ alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          backgroundColor: 'var(--ios-blue)', 
                          borderRadius: '50%'
                        }}></div>
                        <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-text)' }}>
                          Terrain: 3D Always Enabled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Data Status */}
                <div style={{ borderTop: '1px solid var(--ios-light-gray)', paddingTop: 'var(--ios-spacing-lg)', marginTop: 'var(--ios-spacing-lg)' }}>
                  <h3 className="ios-body" style={{ margin: 0, marginBottom: 'var(--ios-spacing-sm)', color: 'var(--ios-secondary-text)', fontWeight: '600' }}>Live Data Status</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
                    <div className="ios-flex" style={{ alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--ios-green)', borderRadius: '50%' }}></div>
                      <span className="ios-caption" style={{ margin: 0 }}>Hazard Zones: Active</span>
                    </div>
                    <div className="ios-flex" style={{ alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--ios-green)', borderRadius: '50%' }}></div>
                      <span className="ios-caption" style={{ margin: 0 }}>Emergency Units: Online</span>
                    </div>
                    <div className="ios-flex" style={{ alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--ios-green)', borderRadius: '50%' }}></div>
                      <span className="ios-caption" style={{ margin: 0 }}>Evacuation Routes: Updated</span>
                    </div>
                    <div className="ios-flex" style={{ alignItems: 'center', gap: 'var(--ios-spacing-xs)' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--ios-green)', borderRadius: '50%' }}></div>
                      <span className="ios-caption" style={{ margin: 0 }}>Foundry Integration: Connected</span>
                    </div>
                    <div style={{ marginTop: 'var(--ios-spacing-sm)', paddingTop: 'var(--ios-spacing-sm)', borderTop: '1px solid var(--ios-light-gray)' }}>
                      <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-secondary-text)' }}>
                        Last Update: {lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Information Panel */}
                <div style={{ borderTop: '1px solid var(--ios-light-gray)', paddingTop: 'var(--ios-spacing-lg)', marginTop: 'var(--ios-spacing-lg)' }}>
                  <h3 className="ios-body" style={{ margin: 0, marginBottom: 'var(--ios-spacing-sm)', color: 'var(--ios-secondary-text)', fontWeight: '600' }}>About Live Hazard Map</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
                    <p className="ios-caption" style={{ margin: 0 }}>
                      Real-time disaster response visualization with 3D terrain and building data.
                    </p>
                    <p className="ios-caption" style={{ margin: 0 }}>
                      <strong>Live Data:</strong> Hazard zones, emergency units, and evacuation routes from Foundry.
                    </p>
                    <p className="ios-caption" style={{ margin: 0 }}>
                      <strong>3D Terrain:</strong> Real elevation data with hazard overlay visualization.
                    </p>
                    <p className="ios-caption" style={{ margin: 0 }}>
                      <strong>3D Buildings:</strong> Building footprints with evacuation route integration.
                    </p>
                  </div>
                </div>

                {/* Enhanced Instructions */}
                <div style={{ borderTop: '1px solid var(--ios-light-gray)', paddingTop: 'var(--ios-spacing-lg)', marginTop: 'var(--ios-spacing-lg)' }}>
                  <h3 className="ios-body" style={{ margin: 0, marginBottom: 'var(--ios-spacing-sm)', color: 'var(--ios-secondary-text)', fontWeight: '600' }}>Instructions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Click and drag</strong> to rotate the 3D view</p>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Scroll</strong> to zoom in/out</p>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Click on markers</strong> for hazard details</p>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Use controls</strong> to toggle live layers</p>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Real-time updates</strong> every 30 seconds</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Map Container */}
          <div>
            <div className="ios-card" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '700px', position: 'relative' }}>
                <SimpleMapboxTest 
                  showHazards={showHazards}
                  showUnits={showUnits}
                  showRoutes={showRoutes}
                  showBuildings={showBuildings}
                  showTerrain={showTerrain}
                  showAnalytics={showAnalytics}
                />
              </div>
            </div>

            {/* Enhanced Status Bar */}
            <div className="ios-card" style={{ margin: 'var(--ios-spacing-md) 0 0 0' }}>
              <div className="ios-flex-between">
                <div className="ios-flex" style={{ gap: 'var(--ios-spacing-lg)' }}>
                  <span className="ios-caption" style={{ margin: 0 }}>
                    Location: <span style={{ color: 'var(--ios-blue)', fontWeight: '600' }}>San Francisco</span>
                  </span>
                  <span className="ios-caption" style={{ margin: 0 }}>
                    View: <span style={{ color: 'var(--ios-green)', fontWeight: '600' }}>Live Hazard Response with 3D Terrain</span>
                  </span>
                </div>
                <div className="ios-flex" style={{ gap: 'var(--ios-spacing-sm)' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--ios-red)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                  <span className="ios-caption" style={{ margin: 0 }}>Live Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="ios-card" style={{ margin: 'var(--ios-spacing-xl) 0 0 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <p className="ios-caption" style={{ margin: 0 }}>
              Live Hazard Response Map • Real-time 3D terrain visualization with Foundry data integration
            </p>
            <p className="ios-caption" style={{ margin: 'var(--ios-spacing-xs) 0 0 0' }}>
              Built with Mapbox GL JS, React, and Palantir Foundry Data Fusion
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
