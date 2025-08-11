import React, { useState, useEffect } from 'react';
import { WeatherData, WeatherAlert } from '../types/emergency-response';
import './WeatherPanel.css';

interface WeatherPanelProps {
  weatherData: WeatherData;
  onWeatherAlert?: (alert: WeatherAlert) => void;
  className?: string;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ 
  weatherData, 
  onWeatherAlert,
  className = '' 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

  // Fire weather index colors and labels
  const fireIndexConfig = {
    low: { color: '#4CAF50', label: 'Low', icon: '🟢', description: 'Normal fire behavior' },
    moderate: { color: '#FF9800', label: 'Moderate', icon: '🟡', description: 'Increased fire potential' },
    high: { color: '#F44336', label: 'High', icon: '🟠', description: 'High fire potential' },
    extreme: { color: '#9C27B0', label: 'Extreme', icon: '🟣', description: 'Extreme fire behavior' },
    catastrophic: { color: '#000000', label: 'Catastrophic', icon: '⚫', description: 'Catastrophic fire conditions' }
  };

  const currentIndex = weatherData.current.fireWeatherIndex;
  const indexConfig = fireIndexConfig[currentIndex];

  // Wind direction to cardinal direction
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // Critical weather conditions for fire behavior
  const isCriticalConditions = 
    weatherData.current.humidity < 20 || 
    weatherData.current.windSpeed > 25 || 
    weatherData.current.temp > 90 ||
    weatherData.forecast.redFlagWarning;

  // Fire behavior prediction based on weather
  const getFireBehaviorPrediction = () => {
    const { temp, humidity, windSpeed, windDirection } = weatherData.current;
    
    let behavior = 'Normal';
    let risk = 'low';
    let recommendations: string[] = [];

    // Temperature factor
    if (temp > 95) {
      behavior = 'High intensity';
      risk = 'high';
      recommendations.push('Fire will spread rapidly');
    } else if (temp > 85) {
      behavior = 'Moderate intensity';
      risk = 'moderate';
      recommendations.push('Fire will spread steadily');
    }

    // Humidity factor
    if (humidity < 15) {
      behavior += ', Low moisture';
      risk = risk === 'high' ? 'extreme' : 'high';
      recommendations.push('Vegetation extremely dry');
    } else if (humidity < 25) {
      behavior += ', Dry conditions';
      recommendations.push('Vegetation dry');
    }

    // Wind factor
    if (windSpeed > 30) {
      behavior += ', High wind spread';
      risk = risk === 'extreme' ? 'catastrophic' : 'extreme';
      recommendations.push('Fire will spread rapidly with wind');
    } else if (windSpeed > 20) {
      behavior += ', Moderate wind spread';
      recommendations.push('Fire will spread with wind');
    }

    // Wind direction impact
    const windCardinal = getWindDirection(windDirection);
    recommendations.push(`Wind from ${windCardinal} will push fire in that direction`);

    return { behavior, risk, recommendations };
  };

  const firePrediction = getFireBehaviorPrediction();

  useEffect(() => {
    if (isCriticalConditions && onWeatherAlert) {
      const criticalAlert: WeatherAlert = {
        type: 'red_flag',
        severity: 'warning',
        message: `Critical fire weather conditions: ${weatherData.current.temp}°F, ${weatherData.current.humidity}% humidity, ${weatherData.current.windSpeed} mph winds from ${getWindDirection(weatherData.current.windDirection)}`,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        affectedAreas: ['Current incident area']
      };
      onWeatherAlert(criticalAlert);
    }
  }, [weatherData, isCriticalConditions, onWeatherAlert]);

  return (
    <div className={`weather-panel ${className} ${isCriticalConditions ? 'critical' : ''}`}>
      {/* Header */}
      <div className="weather-header">
        <h3>🌤️ Weather Conditions</h3>
        <button 
          className="expand-button"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {/* Current Conditions */}
      <div className="current-conditions">
        <div className="main-metrics">
          <div className="metric temp">
            <span className="value">{weatherData.current.temp}°</span>
            <span className="label">Temperature</span>
          </div>
          
          <div className="metric humidity">
            <span className={`value ${weatherData.current.humidity < 20 ? 'critical' : ''}`}>
              {weatherData.current.humidity}%
            </span>
            <span className="label">Humidity</span>
          </div>
          
          <div className="metric wind">
            <span className="value">{weatherData.current.windSpeed}</span>
            <span className="label">Wind (mph)</span>
          </div>
        </div>

        {/* Fire Weather Index */}
        <div className="fire-weather-index">
          <div className="index-header">
            <span className="icon">{indexConfig.icon}</span>
            <span className="label">Fire Weather Index</span>
          </div>
          <div 
            className="index-gauge"
            style={{ backgroundColor: indexConfig.color }}
          >
            <span className="index-value">{indexConfig.label}</span>
          </div>
          <div className="index-description">{indexConfig.description}</div>
        </div>
      </div>

      {/* Enhanced Wind Rose */}
      <div className="wind-section">
        <h4>💨 Wind Conditions</h4>
        <div className="wind-rose">
          <div 
            className={`wind-direction ${weatherData.current.windSpeed > 25 ? 'danger-wind' : ''}`}
            style={{ 
              transform: `rotate(${weatherData.current.windDirection}deg)`,
              backgroundColor: weatherData.current.windSpeed > 25 ? '#ff4444' : '#44aa44'
            }}
          >
            <div className="wind-arrow">↑</div>
            <div className="wind-speed">{weatherData.current.windSpeed} mph</div>
          </div>
          <div className="wind-cardinal">
            {getWindDirection(weatherData.current.windDirection)}
          </div>
          {weatherData.current.windGusts > weatherData.current.windSpeed && (
            <div className="wind-gusts">
              Gusts: {weatherData.current.windGusts} mph
            </div>
          )}
        </div>
        
        {/* Wind Impact on Fire */}
        <div className="wind-impact">
          <div className="impact-label">Fire Impact:</div>
          <div className="impact-value">
            {weatherData.current.windSpeed > 25 ? '🔥 High spread risk' : '🟢 Normal spread'}
          </div>
        </div>
      </div>

      {/* Fire Behavior Prediction */}
      <div className="fire-behavior-prediction">
        <h4>🔥 Fire Behavior Prediction</h4>
        <div className={`prediction-card ${firePrediction.risk}`}>
          <div className="prediction-header">
            <span className="prediction-behavior">{firePrediction.behavior}</span>
            <span className={`prediction-risk ${firePrediction.risk}`}>
              {firePrediction.risk.toUpperCase()} RISK
            </span>
          </div>
          <div className="prediction-recommendations">
            {firePrediction.recommendations.map((rec, index) => (
              <div key={index} className="recommendation">• {rec}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast and Alerts */}
      {expanded && (
        <div className="forecast-section">
          <h4>📅 Forecast</h4>
          
          {weatherData.forecast.redFlagWarning && (
            <div className="alert critical">
              ⚠️ Red Flag Warning Active
              <div className="warning-details">
                Wind shift expected 18:00 - evacuation routes may change
              </div>
            </div>
          )}
          
          <div className="forecast-timeline">
            {weatherData.forecast.windShiftExpected && (
              <div className="forecast-item">
                <span className="time">18:00</span>
                <span className="event">Wind shift to NE</span>
                <span className="impact">⚠️ Routes may change</span>
              </div>
            )}
            
            {weatherData.forecast.humidityRecovery && (
              <div className="forecast-item">
                <span className="time">Overnight</span>
                <span className="event">Humidity recovery to 40%</span>
                <span className="impact">🟢 Fire risk decreases</span>
              </div>
            )}
            
            {weatherData.forecast.tempDrop && (
              <div className="forecast-item">
                <span className="time">22:00</span>
                <span className="event">Temperature drop to 65°F</span>
                <span className="impact">🟢 Fire intensity decreases</span>
              </div>
            )}
          </div>

          {/* Weather Alerts */}
          {weatherData.alerts.length > 0 && (
            <div className="alerts-section">
              <h4>🚨 Active Alerts</h4>
              {weatherData.alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`alert ${alert.severity}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <span className="alert-type">{alert.type.replace('_', ' ').toUpperCase()}</span>
                  <span className="alert-message">{alert.message}</span>
                  <span className="alert-time">
                    {alert.validFrom.toLocaleTimeString()} - {alert.validTo.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="alert-modal" onClick={() => setSelectedAlert(null)}>
          <div className="alert-content" onClick={e => e.stopPropagation()}>
            <h3>Weather Alert Details</h3>
            <div className="alert-details">
              <p><strong>Type:</strong> {selectedAlert.type}</p>
              <p><strong>Severity:</strong> {selectedAlert.severity}</p>
              <p><strong>Message:</strong> {selectedAlert.message}</p>
              <p><strong>Valid From:</strong> {selectedAlert.validFrom.toLocaleString()}</p>
              <p><strong>Valid To:</strong> {selectedAlert.validTo.toLocaleString()}</p>
              <p><strong>Affected Areas:</strong> {selectedAlert.affectedAreas.join(', ')}</p>
            </div>
            <button onClick={() => setSelectedAlert(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Critical Conditions Warning */}
      {isCriticalConditions && (
        <div className="critical-warning">
          ⚠️ CRITICAL FIRE WEATHER CONDITIONS
          <div className="warning-details">
            Evacuation routes may be affected. Monitor wind shifts.
            <div className="immediate-actions">
              <strong>Immediate Actions:</strong>
              <ul>
                <li>Alert evacuation teams of wind conditions</li>
                <li>Prepare for route changes if wind shifts</li>
                <li>Monitor fire spread direction</li>
                <li>Consider early evacuation if conditions worsen</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPanel;
