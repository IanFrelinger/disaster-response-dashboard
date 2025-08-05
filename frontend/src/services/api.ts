import React from 'react';
import { HazardZone, SafeRoute, RiskAssessment, HazardSummary, EvacuationRoutesResponse } from '../types/hazard';
import { environment, logger, useSyntheticData } from '../config/environment';
import { SyntheticDataGenerator } from './syntheticData';
import { validateData, logValidationResults } from '../utils/dataValidation';

// API base URL from environment configuration
const API_BASE_URL = environment.apiBaseUrl;

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: number;
  error?: string;
}

interface DashboardData {
  hazardZones: HazardZone[];
  safeRoutes: SafeRoute[];
  riskAssessment: RiskAssessment;
  hazardSummary: HazardSummary;
  evacuationRoutes: EvacuationRoutesResponse;
}

// API service class
export class ApiService {
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // If using synthetic data, generate data locally
    if (useSyntheticData()) {
      logger.debug(`Using synthetic data for endpoint: ${endpoint}`);
      return this.generateSyntheticData<T>(endpoint);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    logger.debug(`Making API request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data;
    } catch (error) {
      logger.error(`API request failed for ${endpoint}:`, error);
      
      // Fallback to synthetic data if API fails and we're in demo mode
      if (environment.mode === 'demo') {
        logger.warn('Falling back to synthetic data due to API failure');
        return this.generateSyntheticData<T>(endpoint);
      }
      
      throw error;
    }
  }

  private static generateSyntheticData<T>(endpoint: string): T {
    logger.debug(`Generating synthetic data for: ${endpoint}`);
    
    let data: any;
    
    switch (endpoint) {
      case '/dashboard':
        data = SyntheticDataGenerator.generateDashboardData();
        break;
      case '/hazards':
        data = SyntheticDataGenerator.generateHazardZones(20);
        break;
      case '/routes':
        data = SyntheticDataGenerator.generateSafeRoutes(12);
        break;
      case '/risk-assessment':
        data = SyntheticDataGenerator.generateRiskAssessment();
        break;
      case '/hazard-summary':
        data = SyntheticDataGenerator.generateHazardSummary();
        break;
      case '/evacuation-routes':
        data = SyntheticDataGenerator.generateEvacuationRoutesResponse();
        break;
      default:
        if (endpoint.startsWith('/scenario/')) {
          const scenario = endpoint.split('/')[2] as 'wildfire' | 'earthquake' | 'flood' | 'normal';
          data = SyntheticDataGenerator.generateScenarioData(scenario);
        } else {
          throw new Error(`Unknown endpoint for synthetic data: ${endpoint}`);
        }
    }

    // Validate synthetic data before returning
    if (data && typeof data === 'object') {
      const validationResult = validateData(data);
      logValidationResults(validationResult, `API Synthetic Data (${endpoint})`);
      
      if (!validationResult.isValid) {
        logger.warn(`Synthetic data validation failed for ${endpoint}, but continuing with data`);
      }
    }

    return data as T;
  }

  // Get complete dashboard data
  static async getDashboardData(): Promise<DashboardData> {
    return this.makeRequest<DashboardData>('/dashboard');
  }

  // Get hazard zones
  static async getHazardZones(count: number = 20): Promise<HazardZone[]> {
    return this.makeRequest<HazardZone[]>(`/hazards?count=${count}`);
  }

  // Get safe routes
  static async getSafeRoutes(count: number = 12): Promise<SafeRoute[]> {
    return this.makeRequest<SafeRoute[]>(`/routes?count=${count}`);
  }

  // Get risk assessment for a specific location
  static async getRiskAssessment(lat: number, lng: number): Promise<RiskAssessment> {
    return this.makeRequest<RiskAssessment>(`/risk-assessment?lat=${lat}&lng=${lng}`);
  }

  // Get hazard summary
  static async getHazardSummary(): Promise<HazardSummary> {
    return this.makeRequest<HazardSummary>('/hazard-summary');
  }

  // Get evacuation routes
  static async getEvacuationRoutes(): Promise<EvacuationRoutesResponse> {
    return this.makeRequest<EvacuationRoutesResponse>('/evacuation-routes');
  }

  // Get scenario-specific data
  static async getScenarioData(scenario: 'wildfire' | 'earthquake' | 'flood' | 'normal'): Promise<DashboardData> {
    return this.makeRequest<DashboardData>(`/scenario/${scenario}`);
  }

  // Refresh data (force new generation)
  static async refreshData(): Promise<DashboardData> {
    return this.makeRequest<DashboardData>('/refresh', {
      method: 'POST',
    });
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; service: string }> {
    return this.makeRequest<{ status: string; service: string }>('/health');
  }

  // Get API info
  static async getApiInfo(): Promise<any> {
    return this.makeRequest<any>('/info');
  }
}

// Hook for using API data with loading states
export function useApiData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFunction();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('API data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
}

// Custom hooks for specific data types
export function useDashboardData() {
  return useApiData(() => ApiService.getDashboardData(), []);
}

export function useHazardZones(count: number = 20) {
  return useApiData(() => ApiService.getHazardZones(count), [count]);
}

export function useSafeRoutes(count: number = 12) {
  return useApiData(() => ApiService.getSafeRoutes(count), [count]);
}

export function useRiskAssessment(lat: number, lng: number) {
  return useApiData(() => ApiService.getRiskAssessment(lat, lng), [lat, lng]);
}

export function useHazardSummary() {
  return useApiData(() => ApiService.getHazardSummary(), []);
}

export function useEvacuationRoutes() {
  return useApiData(() => ApiService.getEvacuationRoutes(), []);
}

export function useScenarioData(scenario: 'wildfire' | 'earthquake' | 'flood' | 'normal') {
  return useApiData(() => ApiService.getScenarioData(scenario), [scenario]);
}

// Export the API service for direct use
export default ApiService; 