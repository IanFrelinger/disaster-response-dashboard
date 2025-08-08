/**
 * Foundry API Service - Frontend
 * Handles API calls to the backend for data retrieval
 * No data processing - only UI concerns
 */

// Types for API responses
export interface HazardZone {
  h3CellId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  intensity: number;
  confidence: number;
  affectedPopulation: number;
  buildingsAtRisk: number;
  latestDetection: string | null;
  windSpeed: number;
  lastUpdated: string | null;
}

export interface EmergencyUnit {
  unitId: string;
  callSign: string;
  unitType: 'fire_engine' | 'ambulance' | 'police' | 'helicopter' | 'command';
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'returning' | 'out_of_service';
  currentLocation: string;
  lastLocationUpdate: string | null;
  capacity: number;
  equipment: string[];
}

export interface EvacuationRoute {
  routeId: string;
  originH3: string;
  destinationH3: string;
  routeGeometry: string;
  distanceKm: number;
  estimatedTimeMinutes: number;
  capacityPerHour: number;
  status: 'safe' | 'compromised' | 'closed';
  lastUpdated: string | null;
}

export interface Analytics {
  totalAffectedPopulation: number;
  averageResponseTime: number;
  evacuationCompliance: number;
  lastUpdated: string;
}

export interface FusedDataState {
  hazards: {
    active: HazardZone[];
    critical: HazardZone[];
    total: number;
    lastUpdated: string;
  };
  units: {
    available: EmergencyUnit[];
    dispatched: EmergencyUnit[];
    total: number;
    byType: Record<string, EmergencyUnit[]>;
    lastUpdated: string;
  };
  routes: {
    safe: EvacuationRoute[];
    compromised: EvacuationRoute[];
    total: number;
    lastUpdated: string;
  };
  analytics: Analytics;
}

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class FoundryApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get complete fused data state from backend
   */
  async getFusedState(): Promise<FusedDataState> {
    try {
      const response = await fetch(`${this.baseUrl}/api/foundry/state`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch fused state:', error);
      throw error;
    }
  }

  /**
   * Get hazard zones with optional filters
   */
  async getHazards(filters?: {
    riskLevel?: string[];
  }): Promise<{
    active: HazardZone[];
    critical: HazardZone[];
    total: number;
    lastUpdated: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.riskLevel) {
        params.append('risk_level', filters.riskLevel.join(','));
      }

      const url = `${this.baseUrl}/api/foundry/hazards`;
      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch hazards:', error);
      throw error;
    }
  }

  /**
   * Get emergency units with optional filters
   */
  async getUnits(filters?: {
    status?: string[];
  }): Promise<{
    available: EmergencyUnit[];
    dispatched: EmergencyUnit[];
    total: number;
    byType: Record<string, EmergencyUnit[]>;
    lastUpdated: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.append('status', filters.status.join(','));
      }

      const url = `${this.baseUrl}/api/foundry/units`;
      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch units:', error);
      throw error;
    }
  }

  /**
   * Get evacuation routes with optional filters
   */
  async getRoutes(filters?: {
    status?: string[];
  }): Promise<{
    safe: EvacuationRoute[];
    compromised: EvacuationRoute[];
    total: number;
    lastUpdated: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.append('status', filters.status.join(','));
      }

      const url = `${this.baseUrl}/api/foundry/routes`;
      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      throw error;
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<Analytics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/foundry/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  /**
   * Refresh all data on the backend
   */
  async refreshData(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/foundry/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    lastUpdate: string;
    dataCounts: {
      hazards: number;
      units: number;
      routes: number;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/foundry/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to check health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const foundryApi = new FoundryApiService();

// React hooks for easy integration
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to get fused data state
 */
export function useFusedData() {
  const [data, setData] = useState<FusedDataState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await foundryApi.getFusedState();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to get analytics
 */
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await foundryApi.getAnalytics();
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

/**
 * Hook to get hazards
 */
export function useHazards(filters?: { riskLevel?: string[] }) {
  const [hazards, setHazards] = useState<{
    active: HazardZone[];
    critical: HazardZone[];
    total: number;
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHazards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await foundryApi.getHazards(filters);
      setHazards(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHazards();
  }, [fetchHazards]);

  return { hazards, loading, error, refetch: fetchHazards };
}

/**
 * Hook to get units
 */
export function useUnits(filters?: { status?: string[] }) {
  const [units, setUnits] = useState<{
    available: EmergencyUnit[];
    dispatched: EmergencyUnit[];
    total: number;
    byType: Record<string, EmergencyUnit[]>;
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await foundryApi.getUnits(filters);
      setUnits(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return { units, loading, error, refetch: fetchUnits };
}

/**
 * Hook to get routes
 */
export function useRoutes(filters?: { status?: string[] }) {
  const [routes, setRoutes] = useState<{
    safe: EvacuationRoute[];
    compromised: EvacuationRoute[];
    total: number;
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await foundryApi.getRoutes(filters);
      setRoutes(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return { routes, loading, error, refetch: fetchRoutes };
}
