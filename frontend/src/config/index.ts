/**
 * Configuration Management for Disaster Response Dashboard Frontend
 * Handles environment variables, API keys, and application settings.
 */

// =============================================================================
// CORE APPLICATION SETTINGS
// =============================================================================

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Disaster Response Dashboard',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_APP_ENV || 'development',
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5001/ws',
  wsReconnectInterval: parseInt(import.meta.env.VITE_WS_RECONNECT_INTERVAL || '5000'),
} as const;

// =============================================================================
// MAPPING SERVICES
// =============================================================================

export const MAP_CONFIG = {
  mapbox: {
    accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
    styleUrl: import.meta.env.VITE_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/dark-v11',
    account: import.meta.env.VITE_MAPBOX_ACCOUNT || '',
  },
  osm: {
    tileUrl: import.meta.env.VITE_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: import.meta.env.VITE_OSM_ATTRIBUTION || '© OpenStreetMap contributors',
  },
  tileServer: {
    baseUrl: import.meta.env.VITE_TILE_SERVER_URL || 'http://localhost:8080',
    layers: {
      adminBoundaries: '/data/admin_boundaries',
      californiaCounties: '/data/california_counties',
      hazards: '/data/hazards',
      routes: '/data/routes',
    },
    attribution: import.meta.env.VITE_TILE_SERVER_ATTRIBUTION || '© Disaster Response Dashboard',
  },
} as const;

// =============================================================================
// EXTERNAL SERVICE INTEGRATIONS
// =============================================================================

export const EXTERNAL_SERVICES = {
  nasaFirms: {
    apiKey: import.meta.env.VITE_NASA_FIRMS_API_KEY || '',
    baseUrl: import.meta.env.VITE_NASA_FIRMS_BASE_URL || 'https://firms.modaps.eosdis.nasa.gov/api',
  },
  noaa: {
    apiKey: import.meta.env.VITE_NOAA_API_KEY || '',
    baseUrl: import.meta.env.VITE_NOAA_BASE_URL || 'https://api.weather.gov',
  },
  emergency: {
    apiKey: import.meta.env.VITE_EMERGENCY_API_KEY || '',
    baseUrl: import.meta.env.VITE_EMERGENCY_BASE_URL || 'https://api.emergency.gov',
  },
} as const;

// =============================================================================
// COMMUNICATION SERVICES
// =============================================================================

export const COMMUNICATION_CONFIG = {
  twilio: {
    accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
    authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
    phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
  },
  sendGrid: {
    apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
    fromEmail: import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'alerts@disaster-response.gov',
  },
} as const;

// =============================================================================
// ANALYTICS & MONITORING
// =============================================================================

export const ANALYTICS_CONFIG = {
  googleAnalytics: {
    trackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
    enabled: import.meta.env.VITE_GA_ENABLED === 'true',
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  },
} as const;

// =============================================================================
// AUTHENTICATION & SECURITY
// =============================================================================

export const AUTH_CONFIG = {
  jwt: {
    secret: import.meta.env.VITE_JWT_SECRET || '',
    expiresIn: parseInt(import.meta.env.VITE_JWT_EXPIRES_IN || '3600'),
  },
  oauth: {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
    },
    microsoft: {
      clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET || '',
    },
  },
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURE_FLAGS = {
  voiceCommands: import.meta.env.VITE_ENABLE_VOICE_COMMANDS === 'true',
  offlineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  pushNotifications: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
  familyTracking: import.meta.env.VITE_ENABLE_FAMILY_TRACKING === 'true',
  multiLanguage: import.meta.env.VITE_ENABLE_MULTI_LANGUAGE === 'true',
} as const;

// =============================================================================
// PERFORMANCE & CACHING
// =============================================================================

export const PERFORMANCE_CONFIG = {
  cache: {
    duration: parseInt(import.meta.env.VITE_CACHE_DURATION || '300000'),
    offlineSize: parseInt(import.meta.env.VITE_OFFLINE_CACHE_SIZE || '50'),
    mapTileSize: parseInt(import.meta.env.VITE_MAP_TILE_CACHE_SIZE || '100'),
  },
  requests: {
    maxConcurrent: parseInt(import.meta.env.VITE_MAX_CONCURRENT_REQUESTS || '10'),
    timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '30000'),
    retryDelay: parseInt(import.meta.env.VITE_RETRY_DELAY || '1000'),
  },
} as const;

// =============================================================================
// DEVELOPMENT SETTINGS
// =============================================================================

export const DEV_CONFIG = {
  server: {
    port: parseInt(import.meta.env.VITE_DEV_SERVER_PORT || '3000'),
    host: import.meta.env.VITE_DEV_SERVER_HOST || 'localhost',
  },
  hmr: {
    enabled: import.meta.env.VITE_HMR_ENABLED === 'true',
    port: parseInt(import.meta.env.VITE_HMR_PORT || '24678'),
  },
  mockData: {
    useMock: import.meta.env.VITE_USE_MOCK_DATA === 'true',
    path: import.meta.env.VITE_MOCK_DATA_PATH || './src/mocks/',
  },
} as const;

// =============================================================================
// INTERNATIONALIZATION
// =============================================================================

export const I18N_CONFIG = {
  supportedLanguages: (import.meta.env.VITE_SUPPORTED_LANGUAGES || 'en,es,zh,fr,de').split(','),
  defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
  fallbackLanguage: import.meta.env.VITE_FALLBACK_LANGUAGE || 'en',
} as const;

// =============================================================================
// ACCESSIBILITY
// =============================================================================

export const ACCESSIBILITY_CONFIG = {
  screenReader: import.meta.env.VITE_ENABLE_SCREEN_READER === 'true',
  highContrast: import.meta.env.VITE_ENABLE_HIGH_CONTRAST === 'true',
  keyboardNavigation: import.meta.env.VITE_ENABLE_KEYBOARD_NAVIGATION === 'true',
} as const;

// =============================================================================
// ENVIRONMENT-SPECIFIC OVERRIDES
// =============================================================================

const getEnvironmentOverrides = () => {
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return {
        apiUrl: import.meta.env.VITE_DEV_API_URL || API_CONFIG.baseUrl,
        wsUrl: import.meta.env.VITE_DEV_WS_URL || API_CONFIG.wsUrl,
      };
    case 'staging':
      return {
        apiUrl: import.meta.env.VITE_STAGING_API_URL || 'https://staging-api.disaster-response.gov',
        wsUrl: import.meta.env.VITE_STAGING_WS_URL || 'wss://staging-api.disaster-response.gov/ws',
      };
    case 'production':
      return {
        apiUrl: import.meta.env.VITE_PROD_API_URL || 'https://api.disaster-response.gov',
        wsUrl: import.meta.env.VITE_PROD_WS_URL || 'wss://api.disaster-response.gov/ws',
      };
    default:
      return {
        apiUrl: API_CONFIG.baseUrl,
        wsUrl: API_CONFIG.wsUrl,
      };
  }
};

export const ENV_OVERRIDES = getEnvironmentOverrides();

// =============================================================================
// VALIDATION & UTILITIES
// =============================================================================

export const validateConfiguration = (): { valid: boolean; missingKeys: string[] } => {
  const missingKeys: string[] = [];
  
  // Check required API keys
  if (!MAP_CONFIG.mapbox.accessToken) {
    missingKeys.push('VITE_MAPBOX_ACCESS_TOKEN');
  }
  
  if (!EXTERNAL_SERVICES.nasaFirms.apiKey) {
    missingKeys.push('VITE_NASA_FIRMS_API_KEY');
  }
  
  if (!EXTERNAL_SERVICES.noaa.apiKey) {
    missingKeys.push('VITE_NOAA_API_KEY');
  }
  
  if (!EXTERNAL_SERVICES.emergency.apiKey) {
    missingKeys.push('VITE_EMERGENCY_API_KEY');
  }
  
  return {
    valid: missingKeys.length === 0,
    missingKeys,
  };
};

export const getApiConfig = () => ({
  ...API_CONFIG,
  ...ENV_OVERRIDES,
});

export const getMapConfig = () => ({
  ...MAP_CONFIG,
  // Use fallback to OSM if Mapbox token is not available
  primaryProvider: MAP_CONFIG.mapbox.accessToken ? 'mapbox' : 'osm',
});

export const isDevelopment = () => APP_CONFIG.environment === 'development';
export const isProduction = () => APP_CONFIG.environment === 'production';
export const isStaging = () => APP_CONFIG.environment === 'staging';

// =============================================================================
// CONFIGURATION EXPORT
// =============================================================================

export const CONFIG = {
  app: APP_CONFIG,
  api: getApiConfig(),
  map: getMapConfig(),
  externalServices: EXTERNAL_SERVICES,
  communication: COMMUNICATION_CONFIG,
  analytics: ANALYTICS_CONFIG,
  auth: AUTH_CONFIG,
  features: FEATURE_FLAGS,
  performance: PERFORMANCE_CONFIG,
  dev: DEV_CONFIG,
  i18n: I18N_CONFIG,
  accessibility: ACCESSIBILITY_CONFIG,
  env: ENV_OVERRIDES,
} as const;

export default CONFIG;
