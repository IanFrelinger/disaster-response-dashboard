/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN: string
  readonly VITE_NASA_FIRMS_API_KEY: string
  readonly VITE_NOAA_API_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_FOUNDRY_URL: string
  readonly VITE_FOUNDRY_USERNAME: string
  readonly VITE_FOUNDRY_PASSWORD: string
  readonly VITE_FEATURE_FLAGS: string
  readonly VITE_BUILD_ENV: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_TILE_SERVER_URL: string
  readonly VITE_PMTILES_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
