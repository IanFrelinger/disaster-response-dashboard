/**
 * Tests for API service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { mockHazardZone, mockSafeRoute, mockHazardSummary, mockRiskAssessment } from '../test-utils';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock API service
const apiService = {
  baseURL: 'https://test-foundry.example.com',
  
  async getHazardZones() {
    const response = await mockedAxios.get(`${this.baseURL}/api/hazard-zones`);
    return response.data;
  },
  
  async getSafeRoutes() {
    const response = await mockedAxios.get(`${this.baseURL}/api/safe-routes`);
    return response.data;
  },
  
  async getHazardSummary() {
    const response = await mockedAxios.get(`${this.baseURL}/api/hazard-summary`);
    return response.data;
  },
  
  async getRiskAssessment(latitude: number, longitude: number, radius: number = 10) {
    const response = await mockedAxios.get(`${this.baseURL}/api/risk-assessment`, {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },
  
  async getEvacuationRoutes(originLat?: number, originLon?: number, destLat?: number, destLon?: number) {
    const params: any = {};
    if (originLat !== undefined) params.origin_lat = originLat;
    if (originLon !== undefined) params.origin_lon = originLon;
    if (destLat !== undefined) params.dest_lat = destLat;
    if (destLon !== undefined) params.dest_lon = destLon;
    
    const response = await mockedAxios.get(`${this.baseURL}/api/evacuation-routes`, { params });
    return response.data;
  },
};

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHazardZones', () => {
    it('fetches hazard zones successfully', async () => {
      const mockHazardZones = [mockHazardZone(), mockHazardZone({ id: 'hazard-2' })];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockHazardZones,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getHazardZones();

      expect(result).toEqual(mockHazardZones);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/hazard-zones'
      );
    });

    it('handles API errors', async () => {
      const errorMessage = 'Failed to fetch hazard zones';
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: errorMessage },
          status: 500,
          statusText: 'Internal Server Error',
        },
      });

      await expect(apiService.getHazardZones()).rejects.toThrow();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/hazard-zones'
      );
    });

    it('handles network errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getHazardZones()).rejects.toThrow('Network error');
    });

    it('handles empty response', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getHazardZones();

      expect(result).toEqual([]);
    });
  });

  describe('getSafeRoutes', () => {
    it('fetches safe routes successfully', async () => {
      const mockSafeRoutes = [mockSafeRoute(), mockSafeRoute({ id: 'route-2' })];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockSafeRoutes,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getSafeRoutes();

      expect(result).toEqual(mockSafeRoutes);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/safe-routes'
      );
    });

    it('handles API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: 'Routes not found' },
          status: 404,
          statusText: 'Not Found',
        },
      });

      await expect(apiService.getSafeRoutes()).rejects.toThrow();
    });
  });

  describe('getHazardSummary', () => {
    it('fetches hazard summary successfully', async () => {
      const mockSummary = mockHazardSummary();
      mockedAxios.get.mockResolvedValueOnce({
        data: mockSummary,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getHazardSummary();

      expect(result).toEqual(mockSummary);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/hazard-summary'
      );
    });

    it('handles null summary response', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getHazardSummary();

      expect(result).toBeNull();
    });
  });

  describe('getRiskAssessment', () => {
    it('fetches risk assessment with default radius', async () => {
      const mockAssessment = mockRiskAssessment();
      mockedAxios.get.mockResolvedValueOnce({
        data: mockAssessment,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getRiskAssessment(37.7749, -122.4194);

      expect(result).toEqual(mockAssessment);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/risk-assessment',
        { params: { latitude: 37.7749, longitude: -122.4194, radius: 10 } }
      );
    });

    it('fetches risk assessment with custom radius', async () => {
      const mockAssessment = mockRiskAssessment();
      mockedAxios.get.mockResolvedValueOnce({
        data: mockAssessment,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getRiskAssessment(37.7749, -122.4194, 25);

      expect(result).toEqual(mockAssessment);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/risk-assessment',
        { params: { latitude: 37.7749, longitude: -122.4194, radius: 25 } }
      );
    });

    it('handles extreme coordinate values', async () => {
      const mockAssessment = { totalNearbyHazards: 0 };
      mockedAxios.get.mockResolvedValueOnce({
        data: mockAssessment,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      await apiService.getRiskAssessment(90, 180, 50);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/risk-assessment',
        { params: { latitude: 90, longitude: 180, radius: 50 } }
      );
    });

    it('handles zero radius', async () => {
      const mockAssessment = { totalNearbyHazards: 0 };
      mockedAxios.get.mockResolvedValueOnce({
        data: mockAssessment,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      await apiService.getRiskAssessment(37.7749, -122.4194, 0);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/risk-assessment',
        { params: { latitude: 37.7749, longitude: -122.4194, radius: 0 } }
      );
    });

    it('handles API errors for risk assessment', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid coordinates' },
          status: 400,
          statusText: 'Bad Request',
        },
      });

      await expect(apiService.getRiskAssessment(999, 999)).rejects.toThrow();
    });
  });

  describe('getEvacuationRoutes', () => {
    it('fetches evacuation routes without coordinates', async () => {
      const mockRoutes = [mockSafeRoute()];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockRoutes,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getEvacuationRoutes();

      expect(result).toEqual(mockRoutes);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/evacuation-routes',
        { params: {} }
      );
    });

    it('fetches evacuation routes with all coordinates', async () => {
      const mockRoutes = [mockSafeRoute()];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockRoutes,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getEvacuationRoutes(37.7749, -122.4194, 37.7849, -122.4094);

      expect(result).toEqual(mockRoutes);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/evacuation-routes',
        {
          params: {
            origin_lat: 37.7749,
            origin_lon: -122.4194,
            dest_lat: 37.7849,
            dest_lon: -122.4094,
          },
        }
      );
    });

    it('fetches evacuation routes with partial coordinates', async () => {
      const mockRoutes = [mockSafeRoute()];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockRoutes,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getEvacuationRoutes(37.7749, -122.4194);

      expect(result).toEqual(mockRoutes);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-foundry.example.com/api/evacuation-routes',
        {
          params: {
            origin_lat: 37.7749,
            origin_lon: -122.4194,
          },
        }
      );
    });

    it('handles API errors for evacuation routes', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: 'No routes found' },
          status: 404,
          statusText: 'Not Found',
        },
      });

      await expect(apiService.getEvacuationRoutes()).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles 401 unauthorized errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: 'Unauthorized' },
          status: 401,
          statusText: 'Unauthorized',
        },
      });

      await expect(apiService.getHazardZones()).rejects.toThrow();
    });

    it('handles 403 forbidden errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: 'Forbidden' },
          status: 403,
          statusText: 'Forbidden',
        },
      });

      await expect(apiService.getHazardZones()).rejects.toThrow();
    });

    it('handles 500 server errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: 'Internal server error' },
          status: 500,
          statusText: 'Internal Server Error',
        },
      });

      await expect(apiService.getHazardZones()).rejects.toThrow();
    });

    it('handles timeout errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'Request timeout',
      });

      await expect(apiService.getHazardZones()).rejects.toThrow();
    });

    it('handles network connectivity errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        code: 'ERR_NETWORK',
        message: 'Network Error',
      });

      await expect(apiService.getHazardZones()).rejects.toThrow();
    });
  });

  describe('Response Validation', () => {
    it('handles malformed JSON responses', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: 'invalid json',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getHazardZones();
      expect(result).toBe('invalid json');
    });

    it('handles null response data', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getHazardZones();
      expect(result).toBeNull();
    });

    it('handles undefined response data', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await apiService.getHazardZones();
      expect(result).toBeUndefined();
    });
  });

  describe('Concurrent Requests', () => {
    it('handles multiple concurrent API calls', async () => {
      const mockHazardZones = [mockHazardZone()];
      const mockSafeRoutes = [mockSafeRoute()];
      const mockSummary = mockHazardSummary();

      mockedAxios.get
        .mockResolvedValueOnce({
          data: mockHazardZones,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        })
        .mockResolvedValueOnce({
          data: mockSafeRoutes,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        })
        .mockResolvedValueOnce({
          data: mockSummary,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        });

      const [hazardZones, safeRoutes, summary] = await Promise.all([
        apiService.getHazardZones(),
        apiService.getSafeRoutes(),
        apiService.getHazardSummary(),
      ]);

      expect(hazardZones).toEqual(mockHazardZones);
      expect(safeRoutes).toEqual(mockSafeRoutes);
      expect(summary).toEqual(mockSummary);
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });
  });
}); 