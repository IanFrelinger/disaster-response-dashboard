import { useState } from 'react';
import { Mapbox3DBuildingsDemo } from './pages/Mapbox3DBuildingsDemo';
import { LiveHazardMap } from './components/tacmap/LiveHazardMap';
import { useApplyBrowserSettings, useBrowserSettingsInfo } from './hooks/useBrowserSettings';
import './styles/apple-hig-compliant.css';

// Navigation component with iOS design principles
const Navigation = ({ 
  showLiveMap, 
  setShowLiveMap,
  browserSettings,
  settingsInfo
}: {
  showLiveMap: boolean;
  setShowLiveMap: (show: boolean) => void;
  browserSettings: any;
  settingsInfo: any;
}) => (
  <nav className="ios-navbar">
    <div className="ios-container">
      <div className="ios-flex-between">
        <div className="ios-flex">
          <div className="ios-card compact" style={{ margin: 0, marginRight: 'var(--ios-spacing-md)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--ios-blue)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
          </div>
          <div>
            <h1 className="ios-headline" style={{ margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>Disaster Response Dashboard</h1>
            <p className="ios-caption" style={{ margin: 0 }}>Real-time 3D mapping with Foundry integration</p>
          </div>
        </div>
        
        <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
          <button 
            onClick={() => setShowLiveMap(!showLiveMap)}
            className="ios-button secondary"
            style={{
              background: showLiveMap ? 'var(--ios-blue)' : 'transparent',
              color: showLiveMap ? '#FFFFFF' : 'var(--ios-blue)',
              border: '1px solid var(--ios-blue)',
              padding: 'var(--ios-spacing-sm) var(--ios-spacing-md)',
              borderRadius: 'var(--ios-border-radius-medium)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '-0.022em'
            }}
          >
            {showLiveMap ? 'Live Map Active' : 'Live Hazards'}
          </button>

          <div className="ios-card compact" style={{ 
            background: 'var(--ios-green)', 
            color: 'white', 
            padding: 'var(--ios-spacing-sm) var(--ios-spacing-md)',
            borderRadius: 'var(--ios-border-radius-medium)',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '-0.022em'
          }}>
            Foundry Ready
          </div>
          <div className="ios-card compact" style={{ 
            background: 'var(--ios-blue)', 
            color: 'white', 
            padding: 'var(--ios-spacing-sm) var(--ios-spacing-md)',
            borderRadius: 'var(--ios-border-radius-medium)',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '-0.022em',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }} title={settingsInfo.info}>
            {browserSettings.colorScheme === 'dark' ? '🌙' : '☀️'} {browserSettings.contrast === 'high' ? '🔍' : ''} Browser Settings
          </div>
        </div>
      </div>
    </div>
  </nav>
);

function App() {
  const [showLiveMap, setShowLiveMap] = useState(false);
  
  // Apply browser settings to the application
  const browserSettings = useApplyBrowserSettings();
  const settingsInfo = useBrowserSettingsInfo();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ios-background)' }}>
      <Navigation 
        showLiveMap={showLiveMap}
        setShowLiveMap={setShowLiveMap}
        browserSettings={browserSettings}
        settingsInfo={settingsInfo}
      />
      <main style={{ paddingTop: 'var(--ios-spacing-xl)', paddingBottom: 'var(--ios-spacing-xl)' }}>
        {showLiveMap ? (
          <LiveHazardMap showPredictions={true} show3D={true} autoUpdate={true} />
        ) : (
          <Mapbox3DBuildingsDemo />
        )}
      </main>
      

    </div>
  );
}

export default App;
