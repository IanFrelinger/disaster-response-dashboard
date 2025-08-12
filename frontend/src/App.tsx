import React, { useState } from 'react';
import { EvacuationDashboard } from './components/EvacuationDashboard';
import { SimpleMapboxTest } from './components/tacmap/SimpleMapboxTest';
import { WeatherPanel } from './components/WeatherPanel';
import { BuildingEvacuationTracker } from './components/BuildingEvacuationTracker';
import { MultiHazardMap } from './components/MultiHazardMap';
import { RoleBasedRouting } from './components/RoleBasedRouting';
import { SearchMarkings } from './components/SearchMarkings';
import { EfficiencyMetrics } from './components/EfficiencyMetrics';
import { DrillDownCapability } from './components/DrillDownCapability';


import { 
  EvacuationZone, 
  Building, 
  WeatherData, 
  HazardLayer, 
  OperationalRoute, 
  EmergencyUnit, 
  StagingArea,
  SearchMarking,
  EfficiencyMetrics as EfficiencyMetricsType,
  DetailLevels
} from './types/emergency-response';

// Mock data that matches the expected types
const mockEvacuationZones: EvacuationZone[] = [
  {
    id: 'zone-001',
    name: 'Zone A',
    priority: 'immediate',
    totalBuildings: 150,
    totalPopulation: 1500,
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
    estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000),
    lastUpdated: new Date()
  },
  {
    id: 'zone-002',
    name: 'Zone B',
    priority: 'warning',
    totalBuildings: 75,
    totalPopulation: 2200,
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
    estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000),
    lastUpdated: new Date()
  },
  {
    id: 'zone-003',
    name: 'Zone C',
    priority: 'standby',
    totalBuildings: 50,
    totalPopulation: 800,
    evacuationProgress: {
      confirmed: 40,
      inProgress: 5,
      refused: 1,
      noContact: 1,
      unchecked: 1,
      specialNeeds: 2
    },
    boundaries: {
      type: 'Polygon',
      coordinates: [[
        [-122.400, 37.780],
        [-122.390, 37.780],
        [-122.390, 37.790],
        [-122.400, 37.790],
        [-122.400, 37.780]
      ]]
    },
    assignedUnits: ['unit-004'],
    estimatedCompletion: new Date(Date.now() + 6 * 60 * 60 * 1000),
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
  },
  {
    id: 'building-003',
    address: '50 Oak St',
    coordinates: [-122.4100, 37.7850],
    type: 'residential',
    units: 120,
    population: 120,
    specialNeeds: ['elderly', 'children'],
    evacuationStatus: {
      evacuated: false,
      confirmedBy: 'Unit-003',
      timestamp: new Date(),
      notes: 'Building secure, monitoring',
      specialNeeds: ['elderly', 'children'],
      pets: 15,
      vehicles: 45,
      lastContact: new Date()
    },
    structuralIntegrity: 'intact',
    accessRoutes: ['route-003'],
    hazards: []
  }
];

const mockWeatherData: WeatherData = {
  current: {
    temp: 72,
    humidity: 65,
    windSpeed: 12,
    windDirection: 270,
    windGusts: 15,
    fireWeatherIndex: 'moderate',
    visibility: 10,
    pressure: 1013
  },
  forecast: {
    redFlagWarning: false,
    windShiftExpected: '18:00 - Wind shift to NE',
    humidityRecovery: 'Overnight to 40%',
    tempDrop: '22:00 - Drop to 65°F',
    nextHour: {
      temp: 74,
      humidity: 60,
      windSpeed: 14,
      windDirection: 275
    }
  },
  alerts: [
    {
      type: 'high_wind',
      severity: 'warning',
      message: 'High Wind Warning',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 24 * 60 * 60 * 1000),
      affectedAreas: ['San Francisco Bay Area']
    },
    {
      type: 'low_humidity',
      severity: 'watch',
      message: 'Fire Weather Watch',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 48 * 60 * 60 * 1000),
      affectedAreas: ['Northern California']
    }
  ]
};

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'map' | 'weather' | 'buildings'>('dashboard');
  


  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <EvacuationDashboard
            zones={mockEvacuationZones}
            buildings={mockBuildings}
            weatherData={mockWeatherData}
            onZoneSelect={(zone) => console.log('Zone selected:', zone)}
            onBuildingSelect={(building) => console.log('Building selected:', building)}
            onStatusUpdate={(buildingId, status) => console.log('Status update:', buildingId, status)}
          />
        );
      case 'map':
        return (
          <SimpleMapboxTest
            showHazards={true}
            showUnits={true}
            showRoutes={true}
            showBuildings={true}
            showTerrain={true}
            showAnalytics={true}
            showWeather={true}
            weatherData={mockWeatherData}
          />
        );

      default:
        return (
          <EvacuationDashboard
            zones={mockEvacuationZones}
            buildings={mockBuildings}
            weatherData={mockWeatherData}
            onZoneSelect={(zone) => console.log('Zone selected:', zone)}
            onBuildingSelect={(building) => console.log('Building selected:', building)}
            onStatusUpdate={(buildingId, status) => console.log('Status update:', buildingId, status)}
          />
        );
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Apple-style design */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(30px) saturate(180%)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.04)'
      }}>
        {/* Title and navigation in single row */}
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Title row */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                borderRadius: '12px',
                padding: '10px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)'
              }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white', strokeWidth: 2.5 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <div>
                <h1 style={{ 
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: '700',
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #1d1d1f, #2d2d30)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Command Center</h1>
                <p style={{ 
                  margin: '6px 0 0 0',
                  fontSize: '15px',
                  lineHeight: '1.4',
                  letterSpacing: '0.01em',
                  color: '#86868b',
                  fontWeight: '500'
                }}>Centralized emergency response command and control</p>
              </div>
            </div>
            

          </div>
          
          {/* Navigation row */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{ 
              display: 'flex',
              background: 'rgba(142, 142, 147, 0.08)',
              borderRadius: '16px',
              padding: '4px',
              gap: '4px',
              border: '1px solid rgba(142, 142, 147, 0.16)',
              maxWidth: '600px',
              width: '100%',
              backdropFilter: 'blur(20px)'
            }}>
              <button 
                onClick={() => setActiveView('dashboard')}
                style={{ 
                  flex: 1,
                  padding: '10px 20px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: '600',
                  fontSize: '15px',
                  lineHeight: '1.2',
                  letterSpacing: '-0.01em',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: activeView === 'dashboard' ? 'linear-gradient(135deg, #007AFF, #5856D6)' : 'transparent',
                  color: activeView === 'dashboard' ? 'white' : '#1d1d1f',
                  border: 'none',
                  outline: 'none',
                  boxShadow: activeView === 'dashboard' ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none',
                  transform: activeView === 'dashboard' ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                Commander Dashboard
              </button>
              <button 
                onClick={() => setActiveView('map')}
                style={{ 
                  flex: 1,
                  padding: '10px 20px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: '600',
                  fontSize: '15px',
                  lineHeight: '1.2',
                  letterSpacing: '-0.01em',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: activeView === 'map' ? 'linear-gradient(135deg, #007AFF, #5856D6)' : 'transparent',
                  color: activeView === 'map' ? 'white' : '#1d1d1f',
                  border: 'none',
                  outline: 'none',
                  boxShadow: activeView === 'map' ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none',
                  transform: activeView === 'map' ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                Live Map
              </button>

            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content - Separate container with clear positioning */}
      <main style={{ 
        flex: 1,
        padding: '80px 24px 40px 24px', // Further increased top padding for clear separation
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative', // Ensure proper positioning context
        zIndex: 1, // Lower z-index than header
        borderTop: '1px solid rgba(0, 0, 0, 0.05)', // Visual separation
        background: '#ffffff' // Ensure clean background
      }}>
        {renderView()}
      </main>

      {/* Footer - Separate container */}
      <footer style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '20px 0',
        width: '100%',
        marginTop: 'auto'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ margin: 0, color: '#8e8e93', fontSize: '14px' }}>Emergency Response System v1.0.0</p>
            <p style={{ margin: 0, color: '#8e8e93', fontSize: '14px' }}>Powered by Mapbox & React • Real-time disaster monitoring</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
