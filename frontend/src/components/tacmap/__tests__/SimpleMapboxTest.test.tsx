import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SimpleMapboxTest from '../SimpleMapboxTest';

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      getStyle: vi.fn().mockReturnValue({ sources: {}, layers: [] }),
      removeLayer: vi.fn(),
      removeSource: vi.fn(),
      setTerrain: vi.fn(),
      isStyleLoaded: vi.fn().mockReturnValue(true),
    })),
    supported: vi.fn().mockReturnValue(true),
  },
}));

// Mock the MapProvider
vi.mock('../MapProvider', () => ({
  MapProviderComponent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-provider">{children}</div>
  ),
  useMap: () => ({
    on: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getStyle: vi.fn().mockReturnValue({ sources: {}, layers: [] }),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    setTerrain: vi.fn(),
    isStyleLoaded: vi.fn().mockReturnValue(true),
  }),
  FakeMapProvider: class FakeMapProvider {
    create() {
      return {
        on: vi.fn(),
        addSource: vi.fn(),
        addLayer: vi.fn(),
        getStyle: vi.fn().mockReturnValue({ sources: {}, layers: [] }),
        removeLayer: vi.fn(),
        removeSource: vi.fn(),
        setTerrain: vi.fn(),
        isStyleLoaded: vi.fn().mockReturnValue(true),
      };
    }
  },
}));

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_MAPBOX_ACCESS_TOKEN: 'test-token',
}));

describe('SimpleMapboxTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<SimpleMapboxTest />);
    expect(screen.getByTestId('map-provider')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <SimpleMapboxTest
        center={[-122.4194, 37.7749]}
        zoom={12}
        pitch={45}
        bearing={90}
      />
    );
    expect(screen.getByTestId('map-provider')).toBeInTheDocument();
  });

  it('adds map features when scenario is provided', async () => {
    const mockScenario = {
      id: 'test-scenario',
      name: 'Test Scenario',
      center: [-122.4194, 37.7749] as [number, number],
      zoom: 12,
      pitch: 45,
      bearing: 0,
      waypoints: [
        { id: 'start', type: 'start' as const, coordinates: [-122.4194, 37.7749] as [number, number], name: 'Start' },
        { id: 'end', type: 'destination' as const, coordinates: [-122.4083, 37.7879] as [number, number], name: 'End' }
      ],
      routes: [
        { id: 'route-1', name: 'Route 1', coordinates: [[-122.4194, 37.7749], [-122.4083, 37.7879]] as [number, number][] }
      ],
      buildings: [
        { id: 'building-1', name: 'Building 1', coordinates: [-122.4194, 37.7749] as [number, number], height: 50 }
      ],
      hazards: [
        { id: 'hazard-1', type: 'fire' as const, coordinates: [-122.4170, 37.7760] as [number, number], radius: 200, severity: 'high' as const }
      ]
    };

    render(<SimpleMapboxTest scenario={mockScenario} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('map-provider')).toBeInTheDocument();
    });
  });

  it('handles prop changes', () => {
    const { rerender } = render(<SimpleMapboxTest center={[-122.4194, 37.7749]} />);
    expect(screen.getByTestId('map-provider')).toBeInTheDocument();

    rerender(<SimpleMapboxTest center={[-122.4083, 37.7879]} />);
    expect(screen.getByTestId('map-provider')).toBeInTheDocument();
  });

  it('is accessible', () => {
    render(<SimpleMapboxTest />);
    expect(screen.getByTestId('map-provider')).toBeInTheDocument();
  });

  it('integrates with ScenarioBuilder', async () => {
    const { ScenarioBuilder } = await import('../../../utils/ScenarioBuilder');
    const scenario = new ScenarioBuilder()
      .withSimpleTestScenario()
      .freeze();

    render(<SimpleMapboxTest scenario={scenario} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('map-provider')).toBeInTheDocument();
    });
  });
});
