/**
 * Frontend test setup and configuration
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('process.env', () => ({
  REACT_APP_MAPBOX_TOKEN: 'test-mapbox-token',
  REACT_APP_FOUNDRY_URL: 'https://test-foundry.example.com',
}));

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    getContainer: vi.fn(() => document.createElement('div')),
    getStyle: vi.fn(() => ({})),
    setStyle: vi.fn(),
    addSource: vi.fn(),
    removeSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    setPaintProperty: vi.fn(),
    setLayoutProperty: vi.fn(),
    queryRenderedFeatures: vi.fn(() => []),
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    setCenter: vi.fn(),
    getZoom: vi.fn(() => 10),
    setZoom: vi.fn(),
    fitBounds: vi.fn(),
    resize: vi.fn(),
  })),
  supported: vi.fn(() => true),
}));

// Mock react-map-gl
vi.mock('react-map-gl', () => ({
  default: vi.fn().mockImplementation(({ children, ...props }) => {
    return (
      <div data-testid="map" {...props}>
        {children}
      </div>
    );
  }),
  NavigationControl: vi.fn().mockImplementation((props) => (
    <div data-testid="navigation-control" {...props} />
  )),
  Source: vi.fn().mockImplementation(({ children, ...props }) => (
    <div data-testid="map-source" {...props}>
      {children}
    </div>
  )),
  Layer: vi.fn().mockImplementation((props) => (
    <div data-testid="map-layer" {...props} />
  )),
}));

// Mock deck.gl
vi.mock('@deck.gl/react', () => ({
  DeckGL: vi.fn().mockImplementation(({ children, ...props }) => (
    <div data-testid="deck-gl" {...props}>
      {children}
    </div>
  )),
}));

vi.mock('@deck.gl/layers', () => ({
  PolygonLayer: vi.fn().mockImplementation(() => ({})),
  LineLayer: vi.fn().mockImplementation(() => ({})),
}));

// Mock h3-js
vi.mock('h3-js', () => ({
  geoToH3: vi.fn(() => '8928308280fffff'),
  h3ToGeo: vi.fn(() => [0, 0]),
  h3GetResolution: vi.fn(() => 9),
}));

// Mock @turf/turf
vi.mock('@turf/turf', () => ({
  distance: vi.fn(() => 1000),
  buffer: vi.fn(() => ({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[]] } })),
  intersect: vi.fn(() => null),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: vi.fn().mockImplementation((props) => (
    <div data-testid="alert-triangle" {...props} />
  )),
  MapPin: vi.fn().mockImplementation((props) => (
    <div data-testid="map-pin" {...props} />
  )),
  Route: vi.fn().mockImplementation((props) => (
    <div data-testid="route" {...props} />
  )),
  BarChart3: vi.fn().mockImplementation((props) => (
    <div data-testid="bar-chart" {...props} />
  )),
  RefreshCw: vi.fn().mockImplementation((props) => (
    <div data-testid="refresh-cw" {...props} />
  )),
  CheckCircle: vi.fn().mockImplementation((props) => (
    <div data-testid="check-circle" {...props} />
  )),
  XCircle: vi.fn().mockImplementation((props) => (
    <div data-testid="x-circle" {...props} />
  )),
  AlertCircle: vi.fn().mockImplementation((props) => (
    <div data-testid="alert-circle" {...props} />
  )),
  ChevronDown: vi.fn().mockImplementation((props) => (
    <div data-testid="chevron-down" {...props} />
  )),
  ChevronUp: vi.fn().mockImplementation((props) => (
    <div data-testid="chevron-up" {...props} />
  )),
  Activity: vi.fn().mockImplementation((props) => (
    <div data-testid="activity" {...props} />
  )),
  Navigation: vi.fn().mockImplementation((props) => (
    <div data-testid="navigation" {...props} />
  )),
  Shield: vi.fn().mockImplementation((props) => (
    <div data-testid="shield" {...props} />
  )),
  TrendingUp: vi.fn().mockImplementation((props) => (
    <div data-testid="trending-up" {...props} />
  )),
  Info: vi.fn().mockImplementation((props) => (
    <div data-testid="info" {...props} />
  )),
  Settings: vi.fn().mockImplementation((props) => (
    <div data-testid="settings" {...props} />
  )),
  Download: vi.fn().mockImplementation((props) => (
    <div data-testid="download" {...props} />
  )),
  Database: vi.fn().mockImplementation((props) => (
    <div data-testid="database" {...props} />
  )),
  Map: vi.fn().mockImplementation((props) => (
    <div data-testid="map" {...props} />
  )),
  Clock: vi.fn().mockImplementation((props) => (
    <div data-testid="clock" {...props} />
  )),
}));

// Mock axios for API calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}; 