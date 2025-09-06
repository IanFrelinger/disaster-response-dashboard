import { describe, it, expect, vi, beforeEach } from 'vitest';
import mapboxgl from 'mapbox-gl';
import {
  createEmptyValidationResults,
  validateTerrainLayer,
  validateBuildingsLayer,
  validateHazardsLayer,
  validateUnitsLayer,
  validateRoutesLayer,
  type LayerValidationResults,
  type LayerValidationResult
} from '../layerValidation';

// Mock mapboxgl.Map
const createMockMap = (overrides: Partial<any> = {}) => ({
  getTerrain: vi.fn().mockReturnValue(null),
  getSource: vi.fn().mockReturnValue(undefined),
  getLayer: vi.fn().mockReturnValue(undefined),
  getLayoutProperty: vi.fn().mockReturnValue('visible'),
  queryTerrainElevation: vi.fn().mockResolvedValue(100),
  queryRenderedFeatures: vi.fn().mockReturnValue([]),
  ...overrides
});

describe('Layer Validation', () => {
  let mockMap: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMap = createMockMap();
  });

  describe('createEmptyValidationResults', () => {
    it('should create empty validation results with correct structure', () => {
      const results = createEmptyValidationResults();

      expect(results).toHaveProperty('terrain');
      expect(results).toHaveProperty('buildings');
      expect(results).toHaveProperty('hazards');
      expect(results).toHaveProperty('units');
      expect(results).toHaveProperty('routes');
      expect(results).toHaveProperty('overall');

      expect(results.overall.success).toBe(false);
      expect(results.overall.totalLayers).toBe(5);
      expect(results.overall.successfulLayers).toBe(0);
      expect(results.overall.errors).toEqual(['No layers validated']);

      // Check individual layer results
      Object.values(results).forEach((result: any) => {
        if (result.name) {
          expect(result.success).toBe(false);
          expect(result.enabled).toBe(false);
          expect(result.rendered).toBe(false);
          expect(result.interactive).toBe(false);
          expect(result.errors).toEqual(['Layer not initialized']);
          expect(result.performance.renderTime).toBe(0);
        }
      });
    });
  });

  describe('validateTerrainLayer', () => {
    it('should validate terrain layer successfully when enabled', async () => {
      mockMap.getTerrain.mockReturnValue({ source: 'mapbox-dem', exaggeration: 1.5 });
      mockMap.getSource.mockImplementation((id: string) => {
        if (id === 'mapbox-dem') return { type: 'raster-dem' };
        return undefined;
      });
      mockMap.getLayer.mockImplementation((id: string) => {
        if (id === 'sky') return { type: 'sky' };
        return undefined;
      });
      mockMap.queryTerrainElevation.mockResolvedValue(150.5);

      const result = await validateTerrainLayer(mockMap as any);

      expect(result.name).toBe('terrain');
      expect(result.success).toBe(true);
      expect(result.enabled).toBe(true);
      expect(result.rendered).toBe(true);
      expect(result.interactive).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.performance.renderTime).toBeGreaterThan(0);
    });

    it('should handle terrain layer when disabled', async () => {
      mockMap.getTerrain.mockReturnValue(null);
      mockMap.getSource.mockReturnValue(undefined);

      const result = await validateTerrainLayer(mockMap as any);

      expect(result.name).toBe('terrain');
      expect(result.success).toBe(true); // Success when disabled is expected
      expect(result.enabled).toBe(false);
      expect(result.rendered).toBe(false);
      expect(result.interactive).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle terrain elevation query failure', async () => {
      mockMap.getTerrain.mockReturnValue({ source: 'mapbox-dem', exaggeration: 1.5 });
      mockMap.getSource.mockReturnValue({ type: 'raster-dem' });
      mockMap.queryTerrainElevation.mockRejectedValue(new Error('Elevation query failed'));

      const result = await validateTerrainLayer(mockMap as any);

      expect(result.name).toBe('terrain');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Terrain elevation query failed: Error: Elevation query failed');
    });

    it('should handle missing DEM source', async () => {
      mockMap.getTerrain.mockReturnValue({ source: 'mapbox-dem', exaggeration: 1.5 });
      mockMap.getSource.mockReturnValue(undefined);

      const result = await validateTerrainLayer(mockMap as any);

      expect(result.name).toBe('terrain');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('DEM source not found');
    });
  });

  describe('validateBuildingsLayer', () => {
    it('should validate buildings layer successfully', async () => {
      mockMap.getLayer.mockImplementation((id: string) => {
        if (id === '3d-buildings') return { type: 'fill-extrusion' };
        return undefined;
      });
      mockMap.getSource.mockImplementation((id: string) => {
        if (id === 'composite') return { type: 'vector' };
        return undefined;
      });
      mockMap.getLayoutProperty.mockReturnValue('visible');
      mockMap.queryRenderedFeatures.mockReturnValue([{ id: 'building-1' }]);

      const result = await validateBuildingsLayer(mockMap as any);

      expect(result.name).toBe('buildings');
      expect(result.success).toBe(true);
      expect(result.enabled).toBe(true);
      expect(result.rendered).toBe(true);
      expect(result.interactive).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing composite source', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill-extrusion' });
      mockMap.getSource.mockReturnValue(undefined);

      const result = await validateBuildingsLayer(mockMap as any);

      expect(result.name).toBe('buildings');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Composite source not found');
    });

    it('should handle layer interaction failure', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'fill-extrusion' });
      mockMap.getSource.mockReturnValue({ type: 'vector' });
      mockMap.queryRenderedFeatures.mockImplementation(() => {
        throw new Error('Query failed');
      });

      const result = await validateBuildingsLayer(mockMap as any);

      expect(result.name).toBe('buildings');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Buildings layer interaction failed: Error: Query failed');
    });
  });

  describe('validateHazardsLayer', () => {
    it('should validate hazards layer successfully', async () => {
      mockMap.getLayer.mockImplementation((id: string) => {
        if (id === 'hazards') return { type: 'circle' };
        return undefined;
      });
      mockMap.getSource.mockImplementation((id: string) => {
        if (id === 'hazards') return { type: 'geojson' };
        return undefined;
      });
      mockMap.getLayoutProperty.mockReturnValue('visible');
      mockMap.queryRenderedFeatures.mockReturnValue([{ id: 'hazard-1' }]);

      const result = await validateHazardsLayer(mockMap as any);

      expect(result.name).toBe('hazards');
      expect(result.success).toBe(true);
      expect(result.enabled).toBe(true);
      expect(result.rendered).toBe(true);
      expect(result.interactive).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing hazards source', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'circle' });
      mockMap.getSource.mockReturnValue(undefined);
      mockMap.getLayoutProperty.mockReturnValue('visible');

      const result = await validateHazardsLayer(mockMap as any);

      expect(result.name).toBe('hazards');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Hazards source not found');
    });
  });

  describe('validateUnitsLayer', () => {
    it('should validate units layer successfully', async () => {
      mockMap.getLayer.mockImplementation((id: string) => {
        if (id === 'units') return { type: 'circle' };
        return undefined;
      });
      mockMap.getSource.mockImplementation((id: string) => {
        if (id === 'units') return { type: 'geojson' };
        return undefined;
      });
      mockMap.getLayoutProperty.mockReturnValue('visible');
      mockMap.queryRenderedFeatures.mockReturnValue([{ id: 'unit-1' }]);

      const result = await validateUnitsLayer(mockMap as any);

      expect(result.name).toBe('units');
      expect(result.success).toBe(true);
      expect(result.enabled).toBe(true);
      expect(result.rendered).toBe(true);
      expect(result.interactive).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing units source', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'circle' });
      mockMap.getSource.mockReturnValue(undefined);
      mockMap.getLayoutProperty.mockReturnValue('visible');

      const result = await validateUnitsLayer(mockMap as any);

      expect(result.name).toBe('units');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Units source not found');
    });
  });

  describe('validateRoutesLayer', () => {
    it('should validate routes layer successfully', async () => {
      mockMap.getLayer.mockImplementation((id: string) => {
        if (id === 'routes') return { type: 'line' };
        return undefined;
      });
      mockMap.getSource.mockImplementation((id: string) => {
        if (id === 'routes') return { type: 'geojson' };
        return undefined;
      });
      mockMap.getLayoutProperty.mockReturnValue('visible');
      mockMap.queryRenderedFeatures.mockReturnValue([{ id: 'route-1' }]);

      const result = await validateRoutesLayer(mockMap as any);

      expect(result.name).toBe('routes');
      expect(result.success).toBe(true);
      expect(result.enabled).toBe(true);
      expect(result.rendered).toBe(true);
      expect(result.interactive).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing routes source', async () => {
      mockMap.getLayer.mockReturnValue({ type: 'line' });
      mockMap.getSource.mockReturnValue(undefined);
      mockMap.getLayoutProperty.mockReturnValue('visible');

      const result = await validateRoutesLayer(mockMap as any);

      expect(result.name).toBe('routes');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Routes source not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      mockMap.getTerrain.mockImplementation(() => {
        throw new Error('Map error');
      });

      const result = await validateTerrainLayer(mockMap as any);

      expect(result.name).toBe('terrain');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Terrain validation failed: Error: Map error');
    });

    it('should measure performance correctly', async () => {
      const startTime = performance.now();
      mockMap.getTerrain.mockReturnValue(null);

      const result = await validateTerrainLayer(mockMap as any);
      const endTime = performance.now();

      expect(result.performance.renderTime).toBeGreaterThanOrEqual(0);
      expect(result.performance.renderTime).toBeLessThan(endTime - startTime + 10); // Allow some margin
    });
  });
});
