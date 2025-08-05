/**
 * Tests for hazard data hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { mockHazardZone, mockSafeRoute, mockHazardSummary, mockApiResponse, mockApiError } from '../test-utils';

// Mock the API service
const mockApiService = {
  getHazardZones: vi.fn(),
  getSafeRoutes: vi.fn(),
  getHazardSummary: vi.fn(),
  getRiskAssessment: vi.fn(),
};

vi.mock('../../services/api', () => ({
  apiService: mockApiService,
}));

// Custom hook for hazard data
const useHazardData = () => {
  const hazardZonesQuery = useQuery({
    queryKey: ['hazardZones'],
    queryFn: () => mockApiService.getHazardZones(),
  });

  const safeRoutesQuery = useQuery({
    queryKey: ['safeRoutes'],
    queryFn: () => mockApiService.getSafeRoutes(),
  });

  const summaryQuery = useQuery({
    queryKey: ['hazardSummary'],
    queryFn: () => mockApiService.getHazardSummary(),
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
const useRiskAssessment = (latitude: number, longitude: number, radius: number = 10) => {
  const query = useQuery({
    queryKey: ['riskAssessment', latitude, longitude, radius],
    queryFn: () => mockApiService.getRiskAssessment(latitude, longitude, radius),
    enabled: !!latitude && !!longitude,
  });

  return {
    riskAssessment: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Wrapper for testing hooks
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Hazard Data Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useHazardData', () => {
    it('returns initial loading state', () => {
      mockApiService.getHazardZones.mockResolvedValue(mockApiResponse([]));
      mockApiService.getSafeRoutes.mockResolvedValue(mockApiResponse([]));
      mockApiService.getHazardSummary.mockResolvedValue(mockApiResponse({}));

      const { result } = renderHook(() => useHazardData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.hazardZones).toEqual([]);
      expect(result.current.safeRoutes).toEqual([]);
      expect(result.current.summary).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it('loads hazard data successfully', async () => {
      const mockHazardZones = [mockHazardZone(), mockHazardZone({ id: 'hazard-2' })];
      const mockSafeRoutes = [mockSafeRoute(), mockSafeRoute({ id: 'route-2' })];
      const mockSummary = mockHazardSummary();

      mockApiService.getHazardZones.mockResolvedValue(mockApiResponse(mockHazardZones));
      mockApiService.getSafeRoutes.mockResolvedValue(mockApiResponse(mockSafeRoutes));
      mockApiService.getHazardSummary.mockResolvedValue(mockApiResponse(mockSummary));

      const { result } = renderHook(() => useHazardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hazardZones).toEqual(mockHazardZones);
      expect(result.current.safeRoutes).toEqual(mockSafeRoutes);
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.error).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      mockApiService.getHazardZones.mockRejectedValue(mockApiError('Failed to fetch hazards'));
      mockApiService.getSafeRoutes.mockResolvedValue(mockApiResponse([]));
      mockApiService.getHazardSummary.mockResolvedValue(mockApiResponse({}));

      const { result } = renderHook(() => useHazardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hazardZones).toEqual([]);
      expect(result.current.safeRoutes).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });

    it('handles partial data loading', async () => {
      const mockHazardZones = [mockHazardZone()];
      
      mockApiService.getHazardZones.mockResolvedValue(mockApiResponse(mockHazardZones));
      mockApiService.getSafeRoutes.mockRejectedValue(mockApiError('Routes failed'));
      mockApiService.getHazardSummary.mockResolvedValue(mockApiResponse(mockHazardSummary()));

      const { result } = renderHook(() => useHazardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hazardZones).toEqual(mockHazardZones);
      expect(result.current.safeRoutes).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });

    it('refetches data when refetch is called', async () => {
      mockApiService.getHazardZones.mockResolvedValue(mockApiResponse([]));
      mockApiService.getSafeRoutes.mockResolvedValue(mockApiResponse([]));
      mockApiService.getHazardSummary.mockResolvedValue(mockApiResponse({}));

      const { result } = renderHook(() => useHazardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Reset mock calls
      vi.clearAllMocks();

      // Call refetch
      result.current.refetch();

      // Verify API calls were made again
      expect(mockApiService.getHazardZones).toHaveBeenCalled();
      expect(mockApiService.getSafeRoutes).toHaveBeenCalled();
      expect(mockApiService.getHazardSummary).toHaveBeenCalled();
    });

    it('handles empty API responses', async () => {
      mockApiService.getHazardZones.mockResolvedValue(mockApiResponse([]));
      mockApiService.getSafeRoutes.mockResolvedValue(mockApiResponse([]));
      mockApiService.getHazardSummary.mockResolvedValue(mockApiResponse(null));

      const { result } = renderHook(() => useHazardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hazardZones).toEqual([]);
      expect(result.current.safeRoutes).toEqual([]);
      expect(result.current.summary).toBeNull();
    });
  });

  describe('useRiskAssessment', () => {
    it('returns initial state when coordinates are not provided', () => {
      const { result } = renderHook(() => useRiskAssessment(0, 0), {
        wrapper: createWrapper(),
      });

      expect(result.current.riskAssessment).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('loads risk assessment data successfully', async () => {
      const mockAssessment = {
        totalNearbyHazards: 3,
        riskLevels: { high: 1, medium: 1, low: 1 },
        avgRiskScore: 0.5,
        maxRiskScore: 0.8,
        closestHazardDistanceKm: 2.5,
        assessmentRadiusKm: 10,
        location: { latitude: 37.7749, longitude: -122.4194 },
        assessmentTimestamp: '2024-01-01T12:00:00Z',
      };

      mockApiService.getRiskAssessment.mockResolvedValue(mockApiResponse(mockAssessment));

      const { result } = renderHook(() => useRiskAssessment(37.7749, -122.4194, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.riskAssessment).toEqual(mockAssessment);
      expect(result.current.error).toBeNull();
      expect(mockApiService.getRiskAssessment).toHaveBeenCalledWith(37.7749, -122.4194, 10);
    });

    it('handles risk assessment API errors', async () => {
      mockApiService.getRiskAssessment.mockRejectedValue(mockApiError('Assessment failed'));

      const { result } = renderHook(() => useRiskAssessment(37.7749, -122.4194), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.riskAssessment).toBeUndefined();
      expect(result.current.error).toBeTruthy();
    });

    it('uses default radius when not provided', async () => {
      const mockAssessment = { totalNearbyHazards: 0 };
      mockApiService.getRiskAssessment.mockResolvedValue(mockApiResponse(mockAssessment));

      const { result } = renderHook(() => useRiskAssessment(37.7749, -122.4194), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiService.getRiskAssessment).toHaveBeenCalledWith(37.7749, -122.4194, 10);
    });

    it('refetches risk assessment data', async () => {
      const mockAssessment = { totalNearbyHazards: 1 };
      mockApiService.getRiskAssessment.mockResolvedValue(mockApiResponse(mockAssessment));

      const { result } = renderHook(() => useRiskAssessment(37.7749, -122.4194), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Reset mock calls
      vi.clearAllMocks();

      // Call refetch
      result.current.refetch();

      // Verify API call was made again
      expect(mockApiService.getRiskAssessment).toHaveBeenCalledWith(37.7749, -122.4194, 10);
    });

    it('handles extreme coordinate values', async () => {
      const mockAssessment = { totalNearbyHazards: 0 };
      mockApiService.getRiskAssessment.mockResolvedValue(mockApiResponse(mockAssessment));

      const { result } = renderHook(() => useRiskAssessment(90, 180, 50), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiService.getRiskAssessment).toHaveBeenCalledWith(90, 180, 50);
    });

    it('handles zero radius', async () => {
      const mockAssessment = { totalNearbyHazards: 0 };
      mockApiService.getRiskAssessment.mockResolvedValue(mockApiResponse(mockAssessment));

      const { result } = renderHook(() => useRiskAssessment(37.7749, -122.4194, 0), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiService.getRiskAssessment).toHaveBeenCalledWith(37.7749, -122.4194, 0);
    });
  });

  describe('Hook Integration', () => {
    it('handles multiple concurrent API calls', async () => {
      const mockHazardZones = [mockHazardZone()];
      const mockSafeRoutes = [mockSafeRoute()];
      const mockSummary = mockHazardSummary();
      const mockAssessment = { totalNearbyHazards: 2 };

      mockApiService.getHazardZones.mockResolvedValue(mockApiResponse(mockHazardZones));
      mockApiService.getSafeRoutes.mockResolvedValue(mockApiResponse(mockSafeRoutes));
      mockApiService.getHazardSummary.mockResolvedValue(mockApiResponse(mockSummary));
      mockApiService.getRiskAssessment.mockResolvedValue(mockApiResponse(mockAssessment));

      const { result: hazardResult } = renderHook(() => useHazardData(), {
        wrapper: createWrapper(),
      });

      const { result: riskResult } = renderHook(() => useRiskAssessment(37.7749, -122.4194), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(hazardResult.current.isLoading).toBe(false);
        expect(riskResult.current.isLoading).toBe(false);
      });

      expect(hazardResult.current.hazardZones).toEqual(mockHazardZones);
      expect(riskResult.current.riskAssessment).toEqual(mockAssessment);
    });

    it('handles mixed success and failure scenarios', async () => {
      mockApiService.getHazardZones.mockResolvedValue(mockApiResponse([mockHazardZone()]));
      mockApiService.getSafeRoutes.mockRejectedValue(mockApiError('Routes failed'));
      mockApiService.getHazardSummary.mockResolvedValue(mockApiResponse(mockHazardSummary()));
      mockApiService.getRiskAssessment.mockRejectedValue(mockApiError('Assessment failed'));

      const { result: hazardResult } = renderHook(() => useHazardData(), {
        wrapper: createWrapper(),
      });

      const { result: riskResult } = renderHook(() => useRiskAssessment(37.7749, -122.4194), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(hazardResult.current.isLoading).toBe(false);
        expect(riskResult.current.isLoading).toBe(false);
      });

      expect(hazardResult.current.hazardZones).toHaveLength(1);
      expect(hazardResult.current.safeRoutes).toEqual([]);
      expect(hazardResult.current.error).toBeTruthy();
      expect(riskResult.current.riskAssessment).toBeUndefined();
      expect(riskResult.current.error).toBeTruthy();
    });
  });
}); 