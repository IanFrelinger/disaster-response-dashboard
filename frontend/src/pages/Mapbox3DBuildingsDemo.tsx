import React, { useState } from 'react';
import { SimpleMapboxTest } from '../components/tacmap/SimpleMapboxTest';
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Building2,
  Layers,
  Info,
  Settings,
  Mountain,
  Navigation,
  Eye,
  EyeOff
} from 'lucide-react';

export const Mapbox3DBuildingsDemo: React.FC = () => {
  const [showHazards, setShowHazards] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showTerrain, setShowTerrain] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<'sf' | 'nyc' | 'la'>('sf');
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);

  const locations = {
    sf: { name: 'San Francisco', coords: [-122.4194, 37.7749] as [number, number] },
    nyc: { name: 'New York City', coords: [-74.0060, 40.7128] as [number, number] },
    la: { name: 'Los Angeles', coords: [-118.2437, 34.0522] as [number, number] }
  };

  const toggleControlPanel = () => {
    setIsControlPanelOpen(!isControlPanelOpen);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ios-background)' }}>
      {/* Enhanced Header */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                🏔️ 3D Terrain Visualization
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Real 3D terrain and building footprints with Foundry data integration
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
                    Map Controls
                  </h2>
                  
                  {/* Enhanced Location Selector */}
                  <div style={{ marginBottom: 'var(--ios-spacing-lg)' }}>
                    <label className="ios-body" style={{ display: 'block', margin: 0, marginBottom: 'var(--ios-spacing-sm)', fontWeight: '600' }}>Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value as 'sf' | 'nyc' | 'la')}
                      className="ios-input"
                      style={{ width: '100%' }}
                    >
                      <option value="sf">San Francisco</option>
                      <option value="nyc">New York City</option>
                      <option value="la">Los Angeles</option>
                    </select>
                  </div>

                  {/* Enhanced Layer Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-md)' }}>
                    <h3 className="ios-body" style={{ margin: 0, color: 'var(--ios-secondary-text)', fontWeight: '600' }}>Layers</h3>
                    
                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)' }}>
                      <input
                        type="checkbox"
                        checked={showTerrain}
                        onChange={(e) => setShowTerrain(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <Mountain className="w-4 h-4" style={{ color: 'var(--ios-blue)' }} />
                      <span className="ios-body" style={{ margin: 0 }}>3D Terrain</span>
                    </label>

                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)' }}>
                      <input
                        type="checkbox"
                        checked={showBuildings}
                        onChange={(e) => setShowBuildings(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <Building2 className="w-4 h-4" style={{ color: 'var(--ios-green)' }} />
                      <span className="ios-body" style={{ margin: 0 }}>3D Buildings</span>
                    </label>

                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)' }}>
                      <input
                        type="checkbox"
                        checked={showHazards}
                        onChange={(e) => setShowHazards(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <AlertTriangle className="w-4 h-4" style={{ color: 'var(--ios-red)' }} />
                      <span className="ios-body" style={{ margin: 0 }}>Hazard Zones</span>
                    </label>

                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)' }}>
                      <input
                        type="checkbox"
                        checked={showUnits}
                        onChange={(e) => setShowUnits(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <Shield className="w-4 h-4" style={{ color: 'var(--ios-green)' }} />
                      <span className="ios-body" style={{ margin: 0 }}>Emergency Units</span>
                    </label>

                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)' }}>
                      <input
                        type="checkbox"
                        checked={showRoutes}
                        onChange={(e) => setShowRoutes(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <MapPin className="w-4 h-4" style={{ color: 'var(--ios-orange)' }} />
                      <span className="ios-body" style={{ margin: 0 }}>Evacuation Routes</span>
                    </label>

                    <label className="ios-flex" style={{ cursor: 'pointer', gap: 'var(--ios-spacing-sm)', padding: 'var(--ios-spacing-sm)', borderRadius: 'var(--ios-border-radius-medium)', transition: 'background-color var(--ios-transition-fast)' }}>
                      <input
                        type="checkbox"
                        checked={showAnalytics}
                        onChange={(e) => setShowAnalytics(e.target.checked)}
                        className="ios-input"
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      <Info className="w-4 h-4" style={{ color: 'var(--ios-purple)' }} />
                      <span className="ios-body" style={{ margin: 0 }}>Analytics Panel</span>
                    </label>
                  </div>
                </div>

                {/* Enhanced Information Panel */}
                <div style={{ borderTop: '1px solid var(--ios-light-gray)', paddingTop: 'var(--ios-spacing-lg)', marginTop: 'var(--ios-spacing-lg)' }}>
                  <h3 className="ios-body" style={{ margin: 0, marginBottom: 'var(--ios-spacing-sm)', color: 'var(--ios-secondary-text)', fontWeight: '600' }}>About This Demo</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
                    <p className="ios-caption" style={{ margin: 0 }}>
                      This demonstrates Mapbox's native 3D terrain and building extrusions using real data from Mapbox.
                    </p>
                    <p className="ios-caption" style={{ margin: 0 }}>
                      <strong>3D Terrain:</strong> Real elevation data from Mapbox heightmap tiles with hillshading.
                    </p>
                    <p className="ios-caption" style={{ margin: 0 }}>
                      <strong>3D Buildings:</strong> Real building footprints with heights, colored by type.
                    </p>
                    <p className="ios-caption" style={{ margin: 0 }}>
                      Foundry data is overlaid as interactive layers for disaster response scenarios.
                    </p>
                  </div>
                </div>

                {/* Enhanced Instructions */}
                <div style={{ borderTop: '1px solid var(--ios-light-gray)', paddingTop: 'var(--ios-spacing-lg)', marginTop: 'var(--ios-spacing-lg)' }}>
                  <h3 className="ios-body" style={{ margin: 0, marginBottom: 'var(--ios-spacing-sm)', color: 'var(--ios-secondary-text)', fontWeight: '600' }}>Instructions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ios-spacing-xs)' }}>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Click and drag</strong> to rotate the 3D view</p>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Scroll</strong> to zoom in/out</p>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Click on markers</strong> for details</p>
                    <p className="ios-caption" style={{ margin: 0 }}>• <strong>Use controls</strong> to toggle layers</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Map Container */}
          <div>
            <div className="ios-card" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '700px', position: 'relative' }}>
                <SimpleMapboxTest />
              </div>
            </div>

            {/* Enhanced Status Bar */}
            <div className="ios-card" style={{ margin: 'var(--ios-spacing-md) 0 0 0' }}>
              <div className="ios-flex-between">
                <div className="ios-flex" style={{ gap: 'var(--ios-spacing-lg)' }}>
                  <span className="ios-caption" style={{ margin: 0 }}>
                    Location: <span style={{ color: 'var(--ios-blue)', fontWeight: '600' }}>{locations[selectedLocation].name}</span>
                  </span>
                  <span className="ios-caption" style={{ margin: 0 }}>
                    View: <span style={{ color: 'var(--ios-green)', fontWeight: '600' }}>3D Terrain with Building Extrusions</span>
                  </span>
                </div>
                <div className="ios-flex" style={{ gap: 'var(--ios-spacing-sm)' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--ios-green)', borderRadius: '50%' }}></div>
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
              Mapbox 3D Terrain Demo • Real terrain and building footprints with Foundry data integration
            </p>
            <p className="ios-caption" style={{ margin: 'var(--ios-spacing-xs) 0 0 0' }}>
              Built with Mapbox GL JS, React, and Foundry Data Fusion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
