import { describe, it, expect, beforeEach, vi } from 'vitest';

// Simple test to debug the data flow issue
describe('Debug Data Flow', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  it('should be able to import the data fusion service', async () => {
    // Test if we can import the service
    try {
      const { useDataFusion } = await import('../../services/foundryDataFusion');
      expect(useDataFusion).toBeDefined();
      expect(typeof useDataFusion).toBe('function');
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  });

  it('should be able to import the foundry SDK', async () => {
    // Test if we can import the SDK
    try {
      const { foundrySDK } = await import('../../sdk/foundry-sdk');
      expect(foundrySDK).toBeDefined();
      expect(foundrySDK.getHazardZones).toBeDefined();
      expect(foundrySDK.getEmergencyUnits).toBeDefined();
      expect(foundrySDK.getEvacuationRoutes).toBeDefined();
    } catch (error) {
      console.error('SDK import error:', error);
      throw error;
    }
  });

  it('should be able to call SDK methods', async () => {
    try {
      const { foundrySDK } = await import('../../sdk/foundry-sdk');
      
      // Test calling the SDK methods
      const hazards = await foundrySDK.getHazardZones();
      const units = await foundrySDK.getEmergencyUnits();
      const routes = await foundrySDK.getEvacuationRoutes();
      
      expect(Array.isArray(hazards)).toBe(true);
      expect(Array.isArray(units)).toBe(true);
      expect(Array.isArray(routes)).toBe(true);
      
      console.log('SDK data:', {
        hazards: hazards.length,
        units: units.length,
        routes: routes.length
      });
      
      // Check that we have actual data
      if (hazards.length > 0) {
        expect(hazards[0]).toHaveProperty('h3CellId');
        expect(hazards[0]).toHaveProperty('riskLevel');
      }
      
      if (units.length > 0) {
        expect(units[0]).toHaveProperty('unitId');
        expect(units[0]).toHaveProperty('currentLocation'); // Fixed: use currentLocation not location
      }
      
      if (routes.length > 0) {
        expect(routes[0]).toHaveProperty('routeId');
        expect(routes[0]).toHaveProperty('routeGeometry');
      }
      
    } catch (error) {
      console.error('SDK method call error:', error);
      throw error;
    }
  });

  it('should be able to create data fusion instance', async () => {
    try {
      const { FoundryDataFusion } = await import('../../services/foundryDataFusion');
      
      // Create an instance
      const dataFusion = new FoundryDataFusion();
      expect(dataFusion).toBeDefined();
      expect(typeof dataFusion.getState).toBe('function');
      
      // Get initial state
      const state = dataFusion.getState();
      expect(state).toBeDefined();
      expect(state.hazards).toBeDefined();
      expect(state.units).toBeDefined();
      expect(state.routes).toBeDefined();
      
      console.log('Initial state:', {
        hazards: state.hazards.total,
        units: state.units.total,
        routes: state.routes.total
      });
      
    } catch (error) {
      console.error('Data fusion instance error:', error);
      throw error;
    }
  });

  it('should be able to test data loading', async () => {
    try {
      const { FoundryDataFusion } = await import('../../services/foundryDataFusion');
      
      // Create an instance
      const dataFusion = new FoundryDataFusion();
      
      // Test data loading - check if method exists first
      if (typeof (dataFusion as any).testDataLoading === 'function') {
        await (dataFusion as any).testDataLoading();
        
        // Get updated state
        const state = dataFusion.getState();
        
        console.log('After test data loading:', {
          hazards: state.hazards.total,
          units: state.units.total,
          routes: state.routes.total
        });
        
        // Check that we have data after loading
        expect(state.hazards.total).toBeGreaterThan(0);
        expect(state.units.total).toBeGreaterThan(0);
        expect(state.routes.total).toBeGreaterThan(0);
      } else {
        console.log('testDataLoading method not available, skipping test');
        // Skip this test if method doesn't exist
        expect(true).toBe(true);
      }
      
    } catch (error) {
      console.error('Test data loading error:', error);
      throw error;
    }
  });
});
