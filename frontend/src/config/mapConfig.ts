/**
 * Map Configuration
 * Controls which map provider to use in different environments
 */

export interface MapConfig {
  provider: 'mapbox' | 'fake';
  useRealMapbox: boolean;
  fallbackToFake: boolean;
}

/**
 * Get map configuration based on environment variables
 */
export const getMapConfig = (): MapConfig => {
  // Check if we're in a test environment
  const isTest = process.env.NODE_ENV === 'test';
  
  // Check if we have a valid Mapbox token
  const hasValidToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN && 
                       import.meta.env.VITE_MAPBOX_ACCESS_TOKEN !== 'your-mapbox-access-token-here' &&
                       import.meta.env.VITE_MAPBOX_ACCESS_TOKEN !== '';
  
  // Check if we should force fake provider (useful for testing)
  const forceFake = import.meta.env.VITE_FORCE_FAKE_MAP === 'true';
  
  // Determine provider
  let provider: 'mapbox' | 'fake' = 'fake';
  let useRealMapbox = false;
  
  if (isTest || forceFake) {
    provider = 'fake';
    useRealMapbox = false;
  } else if (hasValidToken) {
    provider = 'mapbox';
    useRealMapbox = true;
  } else {
    provider = 'fake';
    useRealMapbox = false;
  }
  
  return {
    provider,
    useRealMapbox,
    fallbackToFake: !isTest && !hasValidToken // Only fallback in non-test environments
  };
};

/**
 * Get provider type for logging/debugging
 */
export const getProviderType = (): string => {
  const config = getMapConfig();
  return config.provider;
};

/**
 * Check if we should use real Mapbox
 */
export const shouldUseRealMapbox = (): boolean => {
  const config = getMapConfig();
  return config.useRealMapbox;
};
