/**
 * Enhanced test setup for comprehensive testing
 * Includes mocks, fixtures, and edge case configurations
 */

import { vi } from 'vitest';
import { beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { mockMapboxGL, mockDirectionsAPI, mockGeocodingAPI, mockMatrixAPI } from '../mocks/mapbox-mocks';
import { hazardFeedMocks } from '../mocks/hazard-feeds-mocks';
import { deterministicDatasets } from '../fixtures/deterministic-datasets';

// Mock Mapbox GL JS
vi.mock('mapbox-gl', () => mockMapboxGL);
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

// Mock Mapbox services
vi.mock('@mapbox/mapbox-sdk/services/directions', () => ({
  default: () => mockDirectionsAPI
}));

vi.mock('@mapbox/mapbox-sdk/services/geocoding', () => ({
  default: () => mockGeocodingAPI
}));

vi.mock('@mapbox/mapbox-sdk/services/matrix', () => ({
  default: () => mockMatrixAPI
}));

// Mock hazard feed services
vi.mock('../services/hazard-feeds', () => hazardFeedMocks);

// Mock external APIs
vi.mock('../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock WebGL context
const mockWebGLContext = {
  getParameter: vi.fn(),
  getExtension: vi.fn(),
  createShader: vi.fn(),
  createProgram: vi.fn(),
  createBuffer: vi.fn(),
  createTexture: vi.fn(),
  createFramebuffer: vi.fn(),
  createRenderbuffer: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  bindTexture: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  bindFramebuffer: vi.fn(),
  bindRenderbuffer: vi.fn(),
  renderbufferStorage: vi.fn(),
  framebufferRenderbuffer: vi.fn(),
  framebufferTexture2D: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  clear: vi.fn(),
  viewport: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  blendFunc: vi.fn(),
  depthFunc: vi.fn(),
  cullFace: vi.fn(),
  frontFace: vi.fn(),
  lineWidth: vi.fn(),
  pixelStorei: vi.fn(),
  getShaderParameter: vi.fn().mockReturnValue(true),
  getProgramParameter: vi.fn().mockReturnValue(true),
  getError: vi.fn().mockReturnValue(0),
  checkFramebufferStatus: vi.fn().mockReturnValue(36053), // FRAMEBUFFER_COMPLETE
  getSupportedExtensions: vi.fn().mockReturnValue([
    'ANGLE_instanced_arrays',
    'EXT_blend_minmax',
    'EXT_color_buffer_half_float',
    'EXT_disjoint_timer_query',
    'EXT_frag_depth',
    'EXT_shader_texture_lod',
    'EXT_texture_filter_anisotropic',
    'WEBKIT_EXT_texture_filter_anisotropic',
    'EXT_sRGB',
    'OES_element_index_uint',
    'OES_standard_derivatives',
    'OES_texture_float',
    'OES_texture_half_float',
    'OES_vertex_array_object',
    'WEBGL_color_buffer_float',
    'WEBGL_compressed_texture_s3tc',
    'WEBGL_debug_renderer_info',
    'WEBGL_debug_shaders',
    'WEBGL_depth_texture',
    'WEBGL_draw_buffers',
    'WEBGL_lose_context'
  ])
};

// Mock Canvas
const mockCanvas = {
  getContext: vi.fn().mockImplementation((contextType) => {
    if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      return mockWebGLContext;
    }
    return null;
  }),
  toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
  width: 800,
  height: 600,
  style: {}
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockCanvas.getContext
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: mockCanvas.toDataURL
});

// Mock Image
const mockImage = {
  src: '',
  onload: null,
  onerror: null,
  width: 100,
  height: 100,
  naturalWidth: 100,
  naturalHeight: 100,
  complete: true
};

Object.defineProperty(global, 'Image', {
  value: vi.fn().mockImplementation(() => mockImage)
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
global.URL.revokeObjectURL = vi.fn();

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn().mockReturnValue('test-uuid-1234-5678-9abc-def012345678')
  }
});

// Test data setup
beforeAll(() => {
  // Set up deterministic test data
  vi.stubGlobal('__TEST_DATA__', deterministicDatasets);
  
  // Set up mock API responses
  (global.fetch as any).mockImplementation((url: string) => {
    if (url.includes('/api/health')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy', timestamp: new Date().toISOString() })
      });
    }
    
    if (url.includes('/api/hazards')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(hazardFeedMocks.Aggregator.getAllHazards({}))
      });
    }
    
    if (url.includes('/api/routes')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(deterministicDatasets.routes.simpleEvacuationRoutes)
      });
    }
    
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' })
    });
  });
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Reset localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset console methods
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});

afterAll(() => {
  // Clean up after all tests
  vi.unstubAllGlobals();
});

// Export test utilities
export {
  mockMapboxGL,
  mockDirectionsAPI,
  mockGeocodingAPI,
  mockMatrixAPI,
  hazardFeedMocks,
  deterministicDatasets,
  mockWebGLContext,
  mockCanvas,
  mockImage,
  mockGeolocation,
  localStorageMock,
  sessionStorageMock
};

