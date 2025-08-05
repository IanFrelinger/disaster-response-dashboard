// Environment configuration for different modes
export type EnvironmentMode = 'debug' | 'production' | 'demo';

interface EnvironmentConfig {
  mode: EnvironmentMode;
  apiBaseUrl: string;
  useSyntheticData: boolean;
  enableLogging: boolean;
  enableMockData: boolean;
  mapboxToken?: string;
}

// Environment detection
const getEnvironmentMode = (): EnvironmentMode => {
  const mode = import.meta.env.VITE_ENVIRONMENT_MODE || 'demo';
  
  if (['debug', 'production', 'demo'].includes(mode)) {
    return mode as EnvironmentMode;
  }
  
  console.warn(`Invalid environment mode: ${mode}, falling back to demo mode`);
  return 'demo';
};

// Configuration for each environment
const environmentConfigs: Record<EnvironmentMode, EnvironmentConfig> = {
  debug: {
    mode: 'debug',
    apiBaseUrl: import.meta.env.VITE_DEBUG_API_BASE_URL || 'http://localhost:5000/api',
    useSyntheticData: false,
    enableLogging: true,
    enableMockData: true,
    mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN,
  },
  production: {
    mode: 'production',
    apiBaseUrl: import.meta.env.VITE_PRODUCTION_API_BASE_URL || 'https://api.disaster-response.com/api',
    useSyntheticData: false,
    enableLogging: false,
    enableMockData: false,
    mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN,
  },
  demo: {
    mode: 'demo',
    apiBaseUrl: import.meta.env.VITE_DEMO_API_BASE_URL || 'http://localhost:5000/api',
    useSyntheticData: true,
    enableLogging: true,
    enableMockData: true,
    mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN,
  },
};

// Current environment configuration
export const environment: EnvironmentConfig = environmentConfigs[getEnvironmentMode()];

// Environment utilities
export const isDebugMode = () => environment.mode === 'debug';
export const isProductionMode = () => environment.mode === 'production';
export const isDemoMode = () => environment.mode === 'demo';
export const useSyntheticData = () => environment.useSyntheticData;
export const enableLogging = () => environment.enableLogging;
export const enableMockData = () => environment.enableMockData;

// Logger utility
export const logger = {
  log: (...args: any[]) => {
    if (enableLogging()) {
      console.log(`[${environment.mode.toUpperCase()}]`, ...args);
    }
  },
  warn: (...args: any[]) => {
    if (enableLogging()) {
      console.warn(`[${environment.mode.toUpperCase()}]`, ...args);
    }
  },
  error: (...args: any[]) => {
    if (enableLogging()) {
      console.error(`[${environment.mode.toUpperCase()}]`, ...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDebugMode() && enableLogging()) {
      console.debug(`[${environment.mode.toUpperCase()}]`, ...args);
    }
  },
};

// Environment info
export const getEnvironmentInfo = () => ({
  mode: environment.mode,
  apiBaseUrl: environment.apiBaseUrl,
  useSyntheticData: environment.useSyntheticData,
  enableLogging: environment.enableLogging,
  enableMockData: environment.enableMockData,
  hasMapboxToken: !!environment.mapboxToken,
});

// Display environment info on startup
logger.log('Environment initialized:', getEnvironmentInfo()); 