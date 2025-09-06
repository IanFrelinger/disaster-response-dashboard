import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TerrainLayer } from '../TerrainLayer';

// Mock mapbox-gl
const mockMap = {
  isStyleLoaded: vi.fn(() => true),
  getSource: vi.fn(),
  addSource: vi.fn(),
  setTerrain: vi.fn(),
  getLayer: vi.fn(),
  addLayer: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

// Mock the map provider constants
vi.mock('../../../services/map-provider', () => ({
  DEM_SOURCE_ID: 'mapbox-dem',
  DEM_URL: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  DEM_TILESIZE: 512,
  DEM_MAXZOOM: 14,
}));

describe('TerrainLayer', () => {
  const defaultProps = {
    map: mockMap as any,
    enabled: false,
    onLayerReady: vi.fn(),
    onLayerError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders without crashing', () => {
    render(<TerrainLayer {...defaultProps} />);
    // Component returns null, so we just check it doesn't throw
    expect(true).toBe(true);
  });

  test('does not apply terrain when disabled', () => {
    render(<TerrainLayer {...defaultProps} enabled={false} />);
    
    // When disabled, should call setTerrain(null) to disable terrain
    expect(mockMap.setTerrain).toHaveBeenCalledWith(null);
    expect(mockMap.addSource).not.toHaveBeenCalled();
  });

  test('applies terrain when enabled and style is loaded', () => {
    mockMap.getSource.mockReturnValue(null); // No existing source
    mockMap.getLayer.mockReturnValue(null); // No existing sky layer
    
    render(<TerrainLayer {...defaultProps} enabled={true} />);
    
    expect(mockMap.addSource).toHaveBeenCalledWith('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    });
    
    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'mapbox-dem',
      exaggeration: 1.5,
    });
    
    expect(mockMap.addLayer).toHaveBeenCalledWith({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun-intensity': 15
      }
    });
    
    expect(defaultProps.onLayerReady).toHaveBeenCalled();
  });

  test('uses existing DEM source when available', () => {
    mockMap.getSource.mockReturnValue({}); // Existing source
    mockMap.getLayer.mockReturnValue(null); // No existing sky layer
    
    render(<TerrainLayer {...defaultProps} enabled={true} />);
    
    expect(mockMap.addSource).not.toHaveBeenCalled();
    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'mapbox-dem',
      exaggeration: 1.5,
    });
  });

  test('does not add sky layer when addSky is false', () => {
    mockMap.getSource.mockReturnValue(null);
    
    render(<TerrainLayer {...defaultProps} enabled={true} addSky={false} />);
    
    expect(mockMap.addLayer).not.toHaveBeenCalled();
    expect(mockMap.setTerrain).toHaveBeenCalled();
  });

  test('does not add sky layer when it already exists', () => {
    mockMap.getSource.mockReturnValue(null);
    mockMap.getLayer.mockReturnValue({}); // Existing sky layer
    
    render(<TerrainLayer {...defaultProps} enabled={true} />);
    
    expect(mockMap.addLayer).not.toHaveBeenCalled();
    expect(mockMap.setTerrain).toHaveBeenCalled();
  });

  test('uses custom exaggeration value', () => {
    mockMap.getSource.mockReturnValue(null);
    mockMap.getLayer.mockReturnValue(null);
    
    render(<TerrainLayer {...defaultProps} enabled={true} exaggeration={2.0} />);
    
    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'mapbox-dem',
      exaggeration: 2.0,
    });
  });

  test('disables terrain when enabled changes from true to false', () => {
    const { rerender } = render(<TerrainLayer {...defaultProps} enabled={true} />);
    
    // First render with terrain enabled
    expect(mockMap.setTerrain).toHaveBeenCalledWith({
      source: 'mapbox-dem',
      exaggeration: 1.5,
    });
    
    // Clear previous calls
    vi.clearAllMocks();
    
    // Re-render with terrain disabled
    rerender(<TerrainLayer {...defaultProps} enabled={false} />);
    
    expect(mockMap.setTerrain).toHaveBeenCalledWith(null);
  });

  test('handles style.load event when style is not initially loaded', () => {
    mockMap.isStyleLoaded.mockReturnValue(false);
    mockMap.getSource.mockReturnValue(null);
    mockMap.getLayer.mockReturnValue(null);
    
    render(<TerrainLayer {...defaultProps} enabled={true} />);
    
    // Should not apply terrain immediately
    expect(mockMap.setTerrain).not.toHaveBeenCalled();
    
    // Should register for style.load event
    expect(mockMap.on).toHaveBeenCalledWith('style.load', expect.any(Function));
    
    // Simulate style.load event
    const styleLoadHandler = mockMap.on.mock.calls.find(
      call => call[0] === 'style.load'
    )?.[1];
    
    if (styleLoadHandler) {
      styleLoadHandler();
      expect(mockMap.setTerrain).toHaveBeenCalledWith({
        source: 'mapbox-dem',
        exaggeration: 1.5,
      });
    }
  });

  test('calls onLayerError when terrain application fails', () => {
    const errorMessage = 'Terrain application failed';
    mockMap.setTerrain.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    mockMap.getSource.mockReturnValue(null);
    mockMap.getLayer.mockReturnValue(null);
    
    render(<TerrainLayer {...defaultProps} enabled={true} />);
    
    expect(defaultProps.onLayerError).toHaveBeenCalledWith(errorMessage);
  });

  test('cleans up event listeners on unmount', () => {
    const { unmount } = render(<TerrainLayer {...defaultProps} enabled={true} />);
    
    unmount();
    
    expect(mockMap.off).toHaveBeenCalledWith('style.load', expect.any(Function));
  });

  test('handles null map gracefully', () => {
    render(<TerrainLayer {...defaultProps} map={null} enabled={true} />);
    
    expect(mockMap.setTerrain).not.toHaveBeenCalled();
    expect(mockMap.addSource).not.toHaveBeenCalled();
  });
});
