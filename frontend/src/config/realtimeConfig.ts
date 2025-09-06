import type { RealTimeConfig, DataFeed } from '../types/realtime';

/**
 * Default real-time configuration for the disaster response dashboard
 */
export const defaultRealTimeConfig: RealTimeConfig = {
  websocket: {
    url: process.env['VITE_WEBSOCKET_URL'] || 'ws://localhost:8080/realtime',
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000 // 30 seconds
  },
  dataFeeds: {
    weather: [
      {
        id: 'weather-noaa',
        name: 'NOAA Weather Service',
        type: 'weather',
        url: 'https://api.weather.gov',
        updateInterval: 300, // 5 minutes
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'NOAA',
          coverage: 'United States',
          reliability: 0.95,
          dataQuality: 0.9
        }
      },
      {
        id: 'weather-openweather',
        name: 'OpenWeatherMap',
        type: 'weather',
        url: 'https://api.openweathermap.org',
        ...(process.env['VITE_OPENWEATHER_API_KEY'] && { apiKey: process.env['VITE_OPENWEATHER_API_KEY'] }),
        updateInterval: 600, // 10 minutes
        enabled: false, // Disabled by default
        lastUpdate: new Date(),
        status: 'disabled',
        errorCount: 0,
        metadata: {
          provider: 'OpenWeatherMap',
          coverage: 'Global',
          reliability: 0.85,
          dataQuality: 0.8
        }
      }
    ],
    traffic: [
      {
        id: 'traffic-here',
        name: 'HERE Traffic API',
        type: 'traffic',
        url: 'https://traffic.api.here.com',
        ...(process.env['VITE_HERE_API_KEY'] && { apiKey: process.env['VITE_HERE_API_KEY'] }),
        updateInterval: 120, // 2 minutes
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'HERE Technologies',
          coverage: 'Global',
          reliability: 0.9,
          dataQuality: 0.85
        }
      },
      {
        id: 'traffic-google',
        name: 'Google Maps Traffic',
        type: 'traffic',
        url: 'https://maps.googleapis.com',
        ...(process.env['VITE_GOOGLE_MAPS_API_KEY'] && { apiKey: process.env['VITE_GOOGLE_MAPS_API_KEY'] }),
        updateInterval: 180, // 3 minutes
        enabled: false, // Disabled by default
        lastUpdate: new Date(),
        status: 'disabled',
        errorCount: 0,
        metadata: {
          provider: 'Google',
          coverage: 'Global',
          reliability: 0.95,
          dataQuality: 0.9
        }
      }
    ],
    emergency: [
      {
        id: 'emergency-fema',
        name: 'FEMA Emergency Alerts',
        type: 'hazard',
        url: 'https://www.fema.gov/api',
        updateInterval: 60, // 1 minute
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'FEMA',
          coverage: 'United States',
          reliability: 0.98,
          dataQuality: 0.95
        }
      },
      {
        id: 'emergency-local',
        name: 'Local Emergency Services',
        type: 'hazard',
        url: 'https://api.emergency.local',
        updateInterval: 30, // 30 seconds
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Local Services',
          coverage: 'San Francisco Bay Area',
          reliability: 0.9,
          dataQuality: 0.85
        }
      }
    ],
    buildings: [
      {
        id: 'buildings-bms',
        name: 'Building Management System',
        type: 'building',
        url: 'https://api.buildings.local',
        updateInterval: 300, // 5 minutes
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Local BMS',
          coverage: 'Downtown Buildings',
          reliability: 0.85,
          dataQuality: 0.8
        }
      },
      {
        id: 'buildings-fire',
        name: 'Fire Safety Systems',
        type: 'building',
        url: 'https://api.firesafety.local',
        updateInterval: 60, // 1 minute
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Fire Department',
          coverage: 'All Monitored Buildings',
          reliability: 0.95,
          dataQuality: 0.9
        }
      }
    ],
    terrain: [
      {
        id: 'terrain-usgs',
        name: 'USGS Terrain Monitoring',
        type: 'terrain',
        url: 'https://api.usgs.gov',
        updateInterval: 1800, // 30 minutes
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'USGS',
          coverage: 'United States',
          reliability: 0.9,
          dataQuality: 0.85
        }
      },
      {
        id: 'terrain-local',
        name: 'Local Terrain Sensors',
        type: 'terrain',
        url: 'https://api.terrain.local',
        updateInterval: 600, // 10 minutes
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Local Sensors',
          coverage: 'Critical Areas',
          reliability: 0.8,
          dataQuality: 0.75
        }
      }
    ]
  },
  updateSettings: {
    maxUpdateFrequency: 30, // Minimum 30 seconds between updates
    batchUpdates: true,
    compression: true,
    fallbackToPolling: true
  },
  performance: {
    maxConcurrentUpdates: 10,
    updateQueueSize: 1000,
    timeout: 5000 // 5 seconds
  }
};

/**
 * Get real-time configuration with environment overrides
 */
export function getRealTimeConfig(): RealTimeConfig {
  const config = { ...defaultRealTimeConfig };

  // Override WebSocket URL if environment variable is set
        if (process.env['VITE_WEBSOCKET_URL']) {
        config.websocket.url = process.env['VITE_WEBSOCKET_URL'];
      }

  // Override data feed settings based on environment
  if (process.env.NODE_ENV === 'development') {
    // In development, use faster update intervals for testing
    config.dataFeeds.weather.forEach(feed => {
      feed.updateInterval = Math.max(feed.updateInterval / 2, 30); // Minimum 30 seconds
    });
    config.dataFeeds.traffic.forEach(feed => {
      feed.updateInterval = Math.max(feed.updateInterval / 2, 30);
    });
    config.dataFeeds.emergency.forEach(feed => {
      feed.updateInterval = Math.max(feed.updateInterval / 2, 15); // Minimum 15 seconds
    });
  }

  // Override performance settings for testing
  if (process.env.NODE_ENV === 'test') {
    config.performance.maxConcurrentUpdates = 5;
    config.performance.updateQueueSize = 100;
    config.websocket.reconnectInterval = 1000; // Faster reconnection for tests
  }

  return config;
}

/**
 * Get configuration for a specific data feed type
 */
export function getDataFeedConfig(type: string): DataFeed[] {
  const config = getRealTimeConfig();
  return config.dataFeeds[type as keyof typeof config.dataFeeds] || [];
}

/**
 * Get enabled data feeds
 */
export function getEnabledDataFeeds(): DataFeed[] {
  const config = getRealTimeConfig();
  const allFeeds = [
    ...config.dataFeeds.weather,
    ...config.dataFeeds.traffic,
    ...config.dataFeeds.emergency,
    ...config.dataFeeds.buildings,
    ...config.dataFeeds.terrain
  ];
  
  return allFeeds.filter(feed => feed.enabled);
}

/**
 * Validate real-time configuration
 */
export function validateRealTimeConfig(config: RealTimeConfig): string[] {
  const errors: string[] = [];

  // Validate WebSocket configuration
  if (!config.websocket.url) {
    errors.push('WebSocket URL is required');
  }

  if (config.websocket.reconnectInterval < 1000) {
    errors.push('Reconnect interval must be at least 1000ms');
  }

  if (config.websocket.maxReconnectAttempts < 1) {
    errors.push('Max reconnection attempts must be at least 1');
  }

  if (config.websocket.heartbeatInterval < 5000) {
    errors.push('Heartbeat interval must be at least 5000ms');
  }

  // Validate data feeds
  Object.entries(config.dataFeeds).forEach(([type, feeds]) => {
    feeds.forEach((feed, index) => {
      if (!feed.id) {
        errors.push(`${type} feed ${index}: ID is required`);
      }
      if (!feed.name) {
        errors.push(`${type} feed ${index}: Name is required`);
      }
      if (!feed.url) {
        errors.push(`${type} feed ${index}: URL is required`);
      }
      if (feed.updateInterval < 10) {
        errors.push(`${type} feed ${index}: Update interval must be at least 10 seconds`);
      }
    });
  });

  // Validate performance settings
  if (config.performance.maxConcurrentUpdates < 1) {
    errors.push('Max concurrent updates must be at least 1');
  }

  if (config.performance.updateQueueSize < 10) {
    errors.push('Update queue size must be at least 10');
  }

  if (config.performance.timeout < 1000) {
    errors.push('Timeout must be at least 1000ms');
  }

  return errors;
}

/**
 * Get configuration summary for display
 */
export function getConfigSummary(): {
  totalFeeds: number;
  enabledFeeds: number;
  websocketStatus: string;
  performance: string;
} {
  const config = getRealTimeConfig();
  const allFeeds = [
    ...config.dataFeeds.weather,
    ...config.dataFeeds.traffic,
    ...config.dataFeeds.emergency,
    ...config.dataFeeds.buildings,
    ...config.dataFeeds.terrain
  ];
  
  const enabledFeeds = allFeeds.filter(feed => feed.enabled);
  
  return {
    totalFeeds: allFeeds.length,
    enabledFeeds: enabledFeeds.length,
    websocketStatus: config.websocket.url ? 'Configured' : 'Not Configured',
    performance: `${config.performance.maxConcurrentUpdates} concurrent, ${config.performance.updateQueueSize} queue size`
  };
}
