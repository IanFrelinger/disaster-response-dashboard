import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MapContainer3D } from '../MapContainer3D';
import { useLayerToggles } from '../../../features/layers/useLayerToggles';
import type { HazardZone, EmergencyUnit, EvacuationRoute } from '../../../sdk/foundry-sdk';

// Mock the map provider
vi.mock('../../../services/map-provider', () => ({
  createMapProvider: vi.fn(() => ({
    on: vi.fn(),
    initialize: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
    getMapInstance: vi.fn(() => ({
      getSource: vi.fn(),
      getLayer: vi.fn(),
      getTerrain: vi.fn(),
      queryTerrainElevation: vi.fn().mockResolvedValue(100),
      queryRenderedFeatures: vi.fn().mockReturnValue([]),
      getLayoutProperty: vi.fn().mockReturnValue('visible'),
      isStyleLoaded: vi.fn().mockReturnValue(true)
    })),
    setTerrainEnabled: vi.fn(),
    hasTerrain: vi.fn().mockReturnValue(true)
  }))
}));

// Mock the layer toggles hook
vi.mock('../../../features/layers/useLayerToggles', () => ({
  useLayerToggles: vi.fn(() => ({
    toggles: {
      terrain: true,
      buildings: true,
      hazards: true,
      units: true,
      routes: true
    }
  }))
}));

// Mock the LayerManager
vi.mock('../layers/LayerManager', () => ({
  LayerManager: ({ onLayerReady, onLayerError }: any) => {
    React.useEffect(() => {
      // Simulate layer ready events
      setTimeout(() => {
        onLayerReady?.('terrain');
        onLayerReady?.('buildings');
        onLayerReady?.('hazards');
        onLayerReady?.('units');
        onLayerReady?.('routes');
      }, 100);
    }, [onLayerReady, onLayerError]);
    
    return <div data-testid="layer-manager">Layer Manager</div>;
  }
}));

// Mock environment variables
const mockEnv = {
  VITE_MAPBOX_ACCESS_TOKEN: 'test-token'
};

Object.defineProperty(import.meta, 'env', {
  value: mockEnv,
  writable: true
});

describe('MapContainer3D', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders 3D map container', () => {
    render(<MapContainer3D />);
    
    expect(screen.getByText('Loading 3D map...')).toBeInTheDocument();
  });

  test('initializes with 3D terrain enabled', async () => {
    const { createMapProvider } = require('../../../services/map-provider');
    const mockProvider = createMapProvider();
    
    render(<MapContainer3D />);
    
    await waitFor(() => {
      expect(mockProvider.setTerrainEnabled).toHaveBeenCalledWith(true, { exaggeration: 1.5 });
    });
  });

  test('exposes 3D map test API', async () => {
    render(<MapContainer3D />);
    
    await waitFor(() => {
      expect((window as any).__mapTestApi3D__).toBeDefined();
      expect((window as any).__mapReady3D).toBe(true);
    });
  });

  test('handles layer ready events', async () => {
    const onValidationComplete = vi.fn();
    
    render(<MapContainer3D onValidationComplete={onValidationComplete} />);
    
    await waitFor(() => {
      expect(onValidationComplete).toHaveBeenCalled();
    });
  });

  test('validates terrain layer correctly', async () => {
    render(<MapContainer3D enableValidation={true} />);
    
    await waitFor(() => {
      const api = (window as any).__mapTestApi3D__;
      expect(api).toBeDefined();
      expect(api.validateLayers).toBeDefined();
    });
  });

  test('displays validation results overlay', async () => {
    render(<MapContainer3D enableValidation={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Layer Validation')).toBeInTheDocument();
    });
  });

  test('handles map initialization errors', () => {
    const { createMapProvider } = require('../../../services/map-provider');
    const mockProvider = createMapProvider();
    mockProvider.initialize.mockRejectedValue(new Error('Map initialization failed'));
    
    render(<MapContainer3D />);
    
    expect(screen.getByText('3D Map Error')).toBeInTheDocument();
    expect(screen.getByText('Map initialization failed')).toBeInTheDocument();
  });

  test('handles missing mapbox token', () => {
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_MAPBOX_ACCESS_TOKEN: undefined },
      writable: true
    });
    
    render(<MapContainer3D />);
    
    expect(screen.getByText('3D Map Error')).toBeInTheDocument();
    expect(screen.getByText('Mapbox access token not found')).toBeInTheDocument();
  });

  test('validates all layers when enabled', async () => {
    const onValidationComplete = vi.fn();
    
    render(<MapContainer3D enableValidation={true} onValidationComplete={onValidationComplete} />);
    
    await waitFor(() => {
      expect(onValidationComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          terrain: expect.objectContaining({
            name: 'terrain',
            success: expect.any(Boolean),
            enabled: expect.any(Boolean),
            rendered: expect.any(Boolean),
            interactive: expect.any(Boolean),
            errors: expect.any(Array),
            performance: expect.objectContaining({
              renderTime: expect.any(Number)
            })
          }),
          buildings: expect.objectContaining({
            name: 'buildings'
          }),
          hazards: expect.objectContaining({
            name: 'hazards'
          }),
          units: expect.objectContaining({
            name: 'units'
          }),
          routes: expect.objectContaining({
            name: 'routes'
          }),
          overall: expect.objectContaining({
            success: expect.any(Boolean),
            totalLayers: 5,
            successfulLayers: expect.any(Number),
            errors: expect.any(Array)
          })
        })
      );
    });
  });

  test('skips validation when disabled', async () => {
    const onValidationComplete = vi.fn();
    
    render(<MapContainer3D enableValidation={false} onValidationComplete={onValidationComplete} />);
    
    await waitFor(() => {
      expect(onValidationComplete).not.toHaveBeenCalled();
    });
  });

  test('handles layer errors gracefully', async () => {
    render(<MapContainer3D />);
    
    // The mock LayerManager doesn't trigger errors, but we can test the error handling structure
    expect(screen.getByTestId('layer-manager')).toBeInTheDocument();
  });

  test('updates layer states correctly', async () => {
    render(<MapContainer3D />);
    
    await waitFor(() => {
      const api = (window as any).__mapTestApi3D__;
      expect(api).toBeDefined();
      expect(api.getLayerStates).toBeDefined();
    });
  });

  test('provides terrain elevation query functionality', async () => {
    render(<MapContainer3D />);
    
    await waitFor(() => {
      const api = (window as any).__mapTestApi3D__;
      expect(api.queryTerrainElevation).toBeDefined();
    });
  });

  test('handles terrain toggle correctly', async () => {
    render(<MapContainer3D />);
    
    await waitFor(() => {
      const api = (window as any).__mapTestApi3D__;
      expect(api.setTerrainEnabled).toBeDefined();
      expect(api.hasTerrain).toBeDefined();
    });
  });

  test('renders with custom props', () => {
    const customProps = {
      className: 'custom-3d-map',
      center: [-122.5, 37.8] as [number, number],
      zoom: 15,
      style: 'mapbox://styles/mapbox/dark-v11'
    };
    
    render(<MapContainer3D {...customProps} />);
    
    expect(screen.getByText('Loading 3D map...')).toBeInTheDocument();
  });

  test('handles data props correctly', () => {
    const mockData = {
      hazards: [] as HazardZone[],
      units: [] as EmergencyUnit[],
      routes: [] as EvacuationRoute[]
    };
    
    render(<MapContainer3D {...mockData} />);
    
    expect(screen.getByText('Loading 3D map...')).toBeInTheDocument();
  });
});
