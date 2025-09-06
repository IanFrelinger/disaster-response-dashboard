import React, { useState, useEffect, useCallback } from 'react';
import { RealTimeDataManager } from '../../services/RealTimeDataManager';
import { getRealTimeConfig } from '../../config/realtimeConfig';
import type { 
  RealTimeData, 
  WeatherData, 
  TrafficData, 
  EmergencyAlertData, 
  BuildingStatusData, 
  TerrainChangeData,
  SystemStatus,
  DataFeed
} from '../../types/realtime';
import './RealTimeDashboard.css';

interface RealTimeDashboardProps {
  className?: string;
  showSystemStatus?: boolean;
  showDataFeeds?: boolean;
  showLiveUpdates?: boolean;
  maxUpdates?: number;
}

/**
 * Real-Time Dashboard Component
 * Displays live data feeds, system status, and real-time updates
 */
export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
  className = '',
  showSystemStatus = true,
  showDataFeeds = true,
  showLiveUpdates = true,
  maxUpdates = 50
}) => {
  const [realTimeManager, setRealTimeManager] = useState<RealTimeDataManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [dataFeeds, setDataFeeds] = useState<DataFeed[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<RealTimeData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize real-time manager
  useEffect(() => {
    let manager: RealTimeDataManager | null = null;
    
    try {
      const config = getRealTimeConfig();
      manager = new RealTimeDataManager(config);
      setRealTimeManager(manager);

      // Set up event listeners
      manager.on('websocket:connected', () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
      });

      manager.on('websocket:disconnected', () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });

      manager.on('websocket:error', (error) => {
        setConnectionStatus('error');
        setError(`WebSocket error: ${error.message || 'Unknown error'}`);
      });

      manager.on('websocket:max_reconnect_reached', () => {
        setConnectionStatus('error');
        setError('Max reconnection attempts reached');
      });

      manager.on('data:update', (data: RealTimeData) => {
        setLiveUpdates(prev => {
          const newUpdates = [data, ...prev];
          return newUpdates.slice(0, maxUpdates);
        });
        setLastUpdate(new Date());
      });

      manager.on('system:status', (status: SystemStatus) => {
        setSystemStatus(status);
      });

      manager.on('feed:error', ({ feed, error }) => {
        console.error(`Data feed error: ${feed.name}`, error);
      });

      // Connect to WebSocket
      manager.connect();

      // Get initial data
      setDataFeeds(manager.getDataFeedStatus());
      setSystemStatus(manager.getSystemStatus());
    } catch (err) {
      setError(`Failed to initialize real-time manager: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return () => {
      if (manager) {
        manager.destroy();
      }
    };
  }, [maxUpdates]);

  // Update system status periodically
  useEffect(() => {
    if (!realTimeManager) return;

    const interval = setInterval(() => {
      setSystemStatus(realTimeManager.getSystemStatus());
      setDataFeeds(realTimeManager.getDataFeedStatus());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [realTimeManager]);

  // Handle manual connection toggle
  const handleConnectionToggle = useCallback(async () => {
    if (!realTimeManager) return;

    if (isConnected) {
      realTimeManager.disconnect();
    } else {
      setConnectionStatus('connecting');
      try {
        await realTimeManager.connect();
      } catch (err) {
        setConnectionStatus('error');
        setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  }, [realTimeManager, isConnected]);

  // Handle data feed toggle
  const handleFeedToggle = useCallback((feedId: string, enabled: boolean) => {
    if (!realTimeManager) return;

    const success = realTimeManager.setDataFeedStatus(feedId, enabled);
    if (success) {
      setDataFeeds(realTimeManager.getDataFeedStatus());
    }
  }, [realTimeManager]);

  // Get severity color
  const getSeverityColor = (severity: RealTimeData['severity']): string => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  // Get data type icon
  const getDataTypeIcon = (type: RealTimeData['type']): string => {
    switch (type) {
      case 'weather': return '🌤️';
      case 'traffic': return '🚗';
      case 'hazard': return '🚨';
      case 'building': return '🏢';
      case 'terrain': return '🏔️';
      case 'route': return '🛣️';
      default: return '📊';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  // Render weather data
  const renderWeatherData = (data: WeatherData) => (
    <div className="weather-data">
      <div className="weather-main">
        <span className="temperature">{data.data.temperature}°C</span>
        <span className="conditions">{data.data.conditions}</span>
      </div>
      <div className="weather-details">
        <span>💨 {data.data.windSpeed} km/h</span>
        <span>💧 {data.data.humidity}%</span>
        <span>👁️ {data.data.visibility} km</span>
      </div>
      {data.data.alerts.length > 0 && (
        <div className="weather-alerts">
          <span>⚠️ {data.data.alerts.join(', ')}</span>
        </div>
      )}
    </div>
  );

  // Render traffic data
  const renderTrafficData = (data: TrafficData) => (
    <div className="traffic-data">
      <div className="traffic-main">
        <span className="congestion">{data.data.congestionLevel}</span>
        <span className="speed">{data.data.averageSpeed} km/h</span>
      </div>
      {data.data.incidentType !== 'none' && (
        <div className="traffic-incident">
          <span>🚧 {data.data.incidentType}</span>
          <span>⏱️ {data.data.estimatedDelay} min delay</span>
        </div>
      )}
    </div>
  );

  // Render emergency data
  const renderEmergencyData = (data: EmergencyAlertData) => (
    <div className="emergency-data">
      <div className="emergency-main">
        <span className="alert-type">{data.data.alertType}</span>
        <span className="population">👥 {data.data.populationAtRisk}</span>
      </div>
      <div className="emergency-details">
        <span>📍 {data.data.affectedArea.toFixed(2)} km²</span>
        <span>🚨 {data.data.evacuationRequired ? 'Evacuation Required' : 'No Evacuation'}</span>
      </div>
      <div className="response-info">
        <span>⏱️ {data.data.estimatedResponseTime} min</span>
        <span>🚓 {data.data.responseUnits.join(', ')}</span>
      </div>
    </div>
  );

  // Render building data
  const renderBuildingData = (data: BuildingStatusData) => (
    <div className="building-data">
      <div className="building-main">
        <span className="building-id">{data.data.buildingId}</span>
        <span className="occupancy">👥 {data.data.occupancy}/{data.data.maxCapacity}</span>
      </div>
      <div className="building-status">
        <span className={`evacuation ${data.data.evacuationStatus}`}>
          {data.data.evacuationStatus}
        </span>
        <span className={`damage ${data.data.damageLevel}`}>
          {data.data.damageLevel}
        </span>
      </div>
      <div className="critical-systems">
        {Object.entries(data.data.criticalSystems).map(([system, status]) => (
          <span key={system} className={`system ${status}`}>
            {system}: {status}
          </span>
        ))}
      </div>
    </div>
  );

  // Render terrain data
  const renderTerrainData = (data: TerrainChangeData) => (
    <div className="terrain-data">
      <div className="terrain-main">
        <span className="change-type">{data.data.changeType}</span>
        <span className="area">📍 {data.data.affectedArea.toFixed(2)} km²</span>
      </div>
      <div className="terrain-changes">
        <span>📈 Elevation: {data.data.elevationChange > 0 ? '+' : ''}{data.data.elevationChange}m</span>
        <span>📐 Slope: {data.data.slopeChange > 0 ? '+' : ''}{data.data.slopeChange}%</span>
      </div>
      <div className="terrain-impact">
        <span>⚠️ Impact: {data.data.accessibilityImpact}</span>
        <span>⏱️ Duration: {data.data.estimatedDuration}h</span>
      </div>
    </div>
  );

  // Render live update
  const renderLiveUpdate = (update: RealTimeData) => {
    return (
      <div 
        key={update.id} 
        className="live-update"
        style={{ borderLeftColor: getSeverityColor(update.severity) }}
      >
        <div className="update-header">
          <span className="update-type">
            {getDataTypeIcon(update.type)} {update.type}
          </span>
          <span className="update-severity" style={{ color: getSeverityColor(update.severity) }}>
            {update.severity}
          </span>
          <span className="update-time">
            {formatTimestamp(update.timestamp)}
          </span>
        </div>
        
        <div className="update-content">
          {update.type === 'weather' && renderWeatherData(update as WeatherData)}
          {update.type === 'traffic' && renderTrafficData(update as TrafficData)}
          {update.type === 'hazard' && renderEmergencyData(update as EmergencyAlertData)}
          {update.type === 'building' && renderBuildingData(update as BuildingStatusData)}
          {update.type === 'terrain' && renderTerrainData(update as TerrainChangeData)}
        </div>
        
        <div className="update-metadata">
          <span className="source">Source: {update.source}</span>
          <span className="confidence">Confidence: {(update.metadata.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className={`real-time-dashboard error ${className}`}>
        <div className="error-message">
          <h3>❌ Real-Time Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`real-time-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>🔄 Real-Time Dashboard</h2>
        <div className="connection-controls">
          <button 
            className={`connection-btn ${connectionStatus}`}
            onClick={handleConnectionToggle}
            disabled={!realTimeManager}
          >
            {connectionStatus === 'connecting' && '🔄 Connecting...'}
            {connectionStatus === 'connected' && '🟢 Connected'}
            {connectionStatus === 'disconnected' && '🔴 Disconnected'}
            {connectionStatus === 'error' && '❌ Error'}
          </button>
          {lastUpdate && (
            <span className="last-update">
              Last update: {formatTimestamp(lastUpdate)}
            </span>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {showSystemStatus && systemStatus && (
          <div className="system-status-panel">
            <h3>🖥️ System Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Status:</span>
                <span className={`value status-${systemStatus.status}`}>
                  {systemStatus.status}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Active Feeds:</span>
                <span className="value">{systemStatus.dataFeeds.length}</span>
              </div>
              <div className="status-item">
                <span className="label">Connections:</span>
                <span className="value">{systemStatus.activeConnections}</span>
              </div>
              <div className="status-item">
                <span className="label">Queue Size:</span>
                <span className="value">{systemStatus.performance.throughput}</span>
              </div>
            </div>
          </div>
        )}

        {showDataFeeds && (
          <div className="data-feeds-panel">
            <h3>📡 Data Feeds</h3>
            <div className="feeds-grid">
              {dataFeeds.map(feed => (
                <div key={feed.id} className={`feed-item ${feed.status}`}>
                  <div className="feed-header">
                    <span className="feed-name">{feed.name}</span>
                    <span className={`feed-status ${feed.status}`}>
                      {feed.status}
                    </span>
                  </div>
                  <div className="feed-details">
                    <span className="feed-type">{feed.type}</span>
                    <span className="feed-interval">{feed.updateInterval}s</span>
                    <span className="feed-provider">{feed.metadata.provider}</span>
                  </div>
                  <div className="feed-controls">
                    <button
                      className={`feed-toggle ${feed.enabled ? 'enabled' : 'disabled'}`}
                      onClick={() => handleFeedToggle(feed.id, !feed.enabled)}
                    >
                      {feed.enabled ? 'Disable' : 'Enable'}
                    </button>
                    {feed.lastError && (
                      <span className="feed-error" title={feed.lastError}>
                        ⚠️ Error
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showLiveUpdates && (
          <div className="live-updates-panel">
            <h3>📊 Live Updates ({liveUpdates.length})</h3>
            <div className="updates-container">
              {liveUpdates.length === 0 ? (
                <div className="no-updates">
                  <p>No live updates yet. Data feeds are collecting information...</p>
                </div>
              ) : (
                liveUpdates.map(renderLiveUpdate)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

