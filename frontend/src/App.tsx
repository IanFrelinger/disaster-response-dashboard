import React, { useState, useEffect } from 'react';
import { EvacuationDashboard } from './components/EvacuationDashboard';
import { ChallengeDemo } from './components/ChallengeDemo';

import { LiveHazardMap } from './components/tacmap/LiveHazardMap';
import { WeatherPanel } from './components/WeatherPanel';
import { BuildingEvacuationTracker } from './components/BuildingEvacuationTracker';
import { foundryService } from './services/foundryService';
import { EvacuationZone, Building, WeatherData } from './types/emergency-response';
import { useApplyBrowserSettings, useBrowserSettingsInfo } from './hooks/useBrowserSettings';
import './styles/ios-design.css';
import './App.css';

// Mock data for demonstration
const mockEvacuationZones: EvacuationZone[] = [
  {
    id: 'zone-001',
    name: 'Downtown San Francisco',
    priority: 'immediate',
    totalBuildings: 150,
    totalPopulation: 25000,
    evacuationProgress: {
      confirmed: 120,
      inProgress: 20,
      refused: 5,
      noContact: 3,
      unchecked: 2,
      specialNeeds: 8
    },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-122.4194, 37.7749],
        [-122.4150, 37.7800],
        [-122.4100, 37.7850],
        [-122.4050, 37.7900],
        [-122.4000, 37.7950],
        [-122.4194, 37.7749]
      ]]
    },
    assignedUnits: ['unit-001', 'unit-002'],
    estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    lastUpdated: new Date()
  },
  {
    id: 'zone-002',
    name: 'Golden Gate Park',
    priority: 'warning',
    totalBuildings: 75,
    totalPopulation: 12000,
    evacuationProgress: {
      confirmed: 60,
      inProgress: 10,
      refused: 2,
      noContact: 2,
      unchecked: 1,
      specialNeeds: 3
    },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-122.485, 37.765],
        [-122.475, 37.765],
        [-122.475, 37.775],
        [-122.485, 37.775],
        [-122.485, 37.765]
      ]]
    },
    assignedUnits: ['unit-003'],
    estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    lastUpdated: new Date()
  }
];

const mockBuildings: Building[] = [
  {
    id: 'building-001',
    address: '1 Dr Carlton B Goodlett Pl',
    coordinates: [-122.4194, 37.7793],
    type: 'critical_facility',
    units: 1,
    population: 500,
    specialNeeds: ['wheelchair', 'elevator'],
    evacuationStatus: {
      evacuated: true,
      confirmedBy: 'Unit-001',
      timestamp: new Date(),
      notes: 'All personnel evacuated successfully',
      specialNeeds: ['wheelchair', 'elevator'],
      pets: 0,
      vehicles: 0,
      lastContact: new Date()
    },
    structuralIntegrity: 'intact',
    accessRoutes: ['route-001'],
    hazards: ['fire-proximity']
  },
  {
    id: 'building-002',
    address: '100 Larkin St',
    coordinates: [-122.4150, 37.7790],
    type: 'commercial',
    units: 25,
    population: 150,
    specialNeeds: ['elevator'],
    evacuationStatus: {
      evacuated: false,
      confirmedBy: 'Unit-002',
      timestamp: new Date(),
      notes: 'Evacuation in progress',
      specialNeeds: ['elevator'],
      pets: 0,
      vehicles: 0,
      lastContact: new Date()
    },
    structuralIntegrity: 'intact',
    accessRoutes: ['route-002'],
    hazards: ['smoke-exposure']
  }
];

const mockWeatherData: WeatherData = {
  current: {
    temp: 87,
    humidity: 35,
    windSpeed: 25,
    windDirection: 270,
    windGusts: 35,
    fireWeatherIndex: 'high',
    visibility: 8,
    pressure: 1013
  },
  forecast: {
    redFlagWarning: true,
    windShiftExpected: '18:00 - Wind shift to NE',
    humidityRecovery: 'Overnight to 40%',
    tempDrop: '22:00 - Drop to 65°F',
    nextHour: {
      temp: 89,
      humidity: 30,
      windSpeed: 28,
      windDirection: 275
    }
  }
};

// iOS-Style Navigation Component
const IOSNavigation = ({ 
  activeView, 
  setActiveView,
  browserSettings,
  settingsInfo
}: {
  activeView: 'dashboard' | 'map' | 'weather' | 'buildings';
  setActiveView: (view: 'dashboard' | 'map' | 'weather' | 'buildings') => void;
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
          <div className="ios-card compact" style={{ 
            background: 'var(--ios-green)', 
            color: 'white', 
            padding: 'var(--ios-spacing-sm) var(--ios-spacing-md)',
            borderRadius: 'var(--ios-border-radius-medium)',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '-0.022em'
          }}>
            🏆 Challenge Ready
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
      
      {/* iOS-Style Segmented Control for Navigation */}
      <div className="ios-segmented-control" style={{ marginTop: 'var(--ios-spacing-lg)' }}>
        <div 
          className={`ios-segment ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          📊 Dashboard
        </div>
        <div 
          className={`ios-segment ${activeView === 'map' ? 'active' : ''}`}
          onClick={() => setActiveView('map')}
        >
          🗺️ Live Map
        </div>

        <div 
          className={`ios-segment ${activeView === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveView('weather')}
        >
          🌤️ Weather
        </div>
        <div 
          className={`ios-segment ${activeView === 'buildings' ? 'active' : ''}`}
          onClick={() => setActiveView('buildings')}
        >
          🏢 Buildings
        </div>
      </div>
    </div>
  </nav>
);

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'map' | 'weather' | 'buildings'>('dashboard');
  const [hazards, setHazards] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Apply browser settings to the application
  const browserSettings = useApplyBrowserSettings();
  const settingsInfo = useBrowserSettingsInfo();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [hazardsData, routesData] = await Promise.all([
          foundryService.getHazardZones(),
          foundryService.getLiveEvacuationRoutes()
        ]);
        setHazards(hazardsData);
        setRoutes(routesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const renderView = () => {
    console.log('renderView called with activeView:', activeView);
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="ios-card large">
            <EvacuationDashboard
              zones={mockEvacuationZones}
              buildings={mockBuildings}
              onZoneSelect={(zone) => console.log('Zone selected:', zone)}
              onBuildingSelect={(building) => console.log('Building selected:', building)}
              onStatusUpdate={(buildingId, status) => console.log('Status update:', buildingId, status)}
            />
          </div>
        );
      
      case 'map':
        return (
          <div className="ios-card large" style={{ padding: 0, overflow: 'hidden', minHeight: '600px' }}>
            <LiveHazardMap />
          </div>
        );
      

      
      case 'weather':
        return (
          <div className="ios-card large">
            <WeatherPanel weatherData={mockWeatherData} />
          </div>
        );
      
      case 'buildings':
        return (
          <div className="ios-card large">
            <BuildingEvacuationTracker 
              zones={mockEvacuationZones}
              buildings={mockBuildings}
            />
          </div>
        );
      
      default:
        return (
          <div className="ios-card large">
            <ChallengeDemo />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--ios-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ios-card large" style={{ textAlign: 'center' }}>
          <div className="ios-spinner large" style={{ margin: '0 auto var(--ios-spacing-lg)' }}></div>
          <h2 className="ios-headline" style={{ color: 'var(--ios-blue)' }}>Loading Disaster Response Dashboard...</h2>
          <p className="ios-body">Initializing emergency response systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ios-background)' }}>
      <IOSNavigation 
        activeView={activeView}
        setActiveView={setActiveView}
        browserSettings={browserSettings}
        settingsInfo={settingsInfo}
      />
      
      <main style={{ paddingTop: 'var(--ios-spacing-xl)', paddingBottom: 'var(--ios-spacing-xl)' }}>
        <div className="ios-container">
          {renderView()}
        </div>
      </main>

      <footer className="ios-toolbar">
        <div className="ios-container">
          <div className="ios-flex-between">
            <p className="ios-caption" style={{ margin: 0 }}>🚨 Emergency Response System v1.0.0</p>
            <p className="ios-caption" style={{ margin: 0 }}>Powered by Mapbox & React • Real-time disaster monitoring</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
