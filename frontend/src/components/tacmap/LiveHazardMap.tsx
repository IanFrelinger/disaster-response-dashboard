import React, { useState } from 'react';
import { SimpleMapboxTest } from './SimpleMapboxTest';
import { WeatherData } from '../../types/emergency-response';
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Building2,
  Layers,
  Info,
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
  const [showWeather, setShowWeather] = useState(true);
  // 3D Terrain and 3D Buildings are always enabled
  const showBuildings = true;
  const showTerrain = true;
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock weather data for demonstration
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
    },
    alerts: []
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
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F7' }}>
      {/* Enhanced Header */}
      <div className="ios-card" style={{ margin: '0 0 16px 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: '#007AFF', margin: 0, marginBottom: '4px' }}>
                🚨 Live Hazard Response Map
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Real-time 3D terrain visualization with live hazard data and Foundry integration
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: '12px' }}>
              <div className="ios-flex" style={{ gap: '4px' }}>
                <Activity className="w-4 h-4" style={{ color: '#FF3B30' }} />
                <span className="ios-caption" style={{ margin: 0 }}>Live Data</span>
              </div>
              <div className="ios-flex" style={{ gap: '4px' }}>
                <Mountain className="w-4 h-4" style={{ color: '#007AFF' }} />
                <span className="ios-caption" style={{ margin: 0 }}>3D Terrain</span>
              </div>
              <div className="ios-flex" style={{ gap: '4px' }}>
                <Building2 className="w-4 h-4" style={{ color: '#007AFF' }} />
                <span className="ios-caption" style={{ margin: 0 }}>3D Buildings</span>
              </div>
              <div className="ios-flex" style={{ gap: '4px' }}>
                <Layers className="w-4 h-4" style={{ color: '#AF52DE' }} />
                <span className="ios-caption" style={{ margin: 0 }}>Foundry Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width Map */}
      <div className="ios-container" style={{ padding: 0 }}>
        <div className="ios-card" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
          <div style={{ height: '700px', position: 'relative' }}>
            <SimpleMapboxTest 
              showHazards={showHazards}
              showUnits={showUnits}
              showRoutes={showRoutes}
              showBuildings={showBuildings}
              showTerrain={showTerrain}
              showAnalytics={showAnalytics}
              showWeather={showWeather}
              weatherData={mockWeatherData}
            />
          </div>
        </div>

        {/* Enhanced Status Bar */}
        <div className="ios-card" style={{ margin: '12px 0 0 0' }}>
          <div className="ios-flex-between">
            <div className="ios-flex" style={{ gap: '16px' }}>
              <span className="ios-caption" style={{ margin: 0 }}>
                Location: <span style={{ color: '#007AFF', fontWeight: '600' }}>San Francisco</span>
              </span>
              <span className="ios-caption" style={{ margin: 0 }}>
                View: <span style={{ color: '#34C759', fontWeight: '600' }}>Live Hazard Response with 3D Terrain</span>
              </span>
              <span className="ios-caption" style={{ margin: 0 }}>
                Last Update: <span style={{ color: '#FF9500', fontWeight: '600' }}>{lastUpdate.toLocaleTimeString()}</span>
              </span>
            </div>
            <div className="ios-flex" style={{ gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#FF3B30', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
              <span className="ios-caption" style={{ margin: 0 }}>Live Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="ios-card" style={{ margin: '20px 0 0 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <p className="ios-caption" style={{ margin: 0 }}>
              Live Hazard Response Map • Real-time 3D terrain visualization with Foundry data integration
            </p>
            <p className="ios-caption" style={{ margin: '4px 0 0 0' }}>
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
