/**
 * Custom hooks for hazard data management
 */

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { HazardZone, SafeRoute, HazardSummary } from '../types/hazard';

// Custom hook for hazard data
export const useHazardData = () => {
  const hazardZonesQuery = useQuery({
    queryKey: ['hazardZones'],
    queryFn: async () => {
      const response = await apiService.getHazardZones();
      return response.data;
    },
  });

  const safeRoutesQuery = useQuery({
    queryKey: ['safeRoutes'],
    queryFn: async () => {
      const response = await apiService.getSafeRoutes();
      return response.data;
    },
  });

  const summaryQuery = useQuery({
    queryKey: ['hazardSummary'],
    queryFn: async () => {
      const response = await apiService.getHazardSummary();
      return response.data;
    },
  });

  return {
    hazardZones: hazardZonesQuery.data || [],
    safeRoutes: safeRoutesQuery.data || [],
    summary: summaryQuery.data,
    isLoading: hazardZonesQuery.isLoading || safeRoutesQuery.isLoading || summaryQuery.isLoading,
    error: hazardZonesQuery.error || safeRoutesQuery.error || summaryQuery.error,
    refetch: () => {
      hazardZonesQuery.refetch();
      safeRoutesQuery.refetch();
      summaryQuery.refetch();
    },
  };
};

// Custom hook for risk assessment
export const useRiskAssessment = (latitude: number, longitude: number, radius: number = 10) => {
  const query = useQuery({
    queryKey: ['riskAssessment', latitude, longitude, radius],
    queryFn: async () => {
      const response = await apiService.getRiskAssessment(latitude, longitude, radius);
      return response.data;
    },
    enabled: !!latitude && !!longitude,
  });

  return {
    riskAssessment: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}; 