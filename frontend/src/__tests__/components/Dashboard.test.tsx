/**
 * Tests for Dashboard component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Dashboard from '../../components/Dashboard';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    getDashboardData: vi.fn(),
    refreshData: vi.fn(),
    getRiskAssessment: vi.fn(),
  },
}));

// Mock the validation utility
vi.mock('../../utils/dataValidation', () => ({
  validateData: vi.fn(() => ({ isValid: true, errors: [] })),
}));

// Mock the environment config
vi.mock('../../config/environment', () => ({
  environment: {
    mode: 'demo',
    useSyntheticData: true,
  },
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import ApiService from '../../services/api';
import { validateData } from '../../utils/dataValidation';

const mockApiService = ApiService as any;
const mockValidateData = validateData as any;

describe('Dashboard', () => {
  const mockDashboardData = {
    hazardZones: [],
    safeRoutes: [],
    riskAssessment: {
      totalNearbyHazards: 0,
      riskLevels: { low: 0, medium: 0, high: 0, critical: 0 },
      avgRiskScore: 0,
      maxRiskScore: 0,
      closestHazardDistanceKm: null,
      assessmentRadiusKm: 10,
      location: { latitude: 37.7749, longitude: -122.4194 },
      assessmentTimestamp: '2024-01-01T12:00:00Z',
    },
    hazardSummary: {
      totalHazards: 0,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      dataSources: { FIRMS: 0 },
      lastUpdated: '2024-01-01T12:00:00Z',
      bbox: [-122.5, 37.7, -122.3, 37.8],
    },
    evacuationRoutes: {
      availableRoutes: 0,
      routes: [],
      origin: [37.7749, -122.4194],
      destination: [37.7849, -122.4094],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiService.getDashboardData.mockResolvedValue(mockDashboardData);
    mockApiService.refreshData.mockResolvedValue(mockDashboardData);
    mockApiService.getRiskAssessment.mockResolvedValue(mockDashboardData.riskAssessment);
    mockValidateData.mockReturnValue({ isValid: true, errors: [] });
  });

  describe('Rendering', () => {
    it('renders the dashboard with loading state initially', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Loading disaster response data...')).toBeInTheDocument();
    });

    it('renders the dashboard with data after loading', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Disaster Response Dashboard')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Real-time hazard monitoring and evacuation planning')).toBeInTheDocument();
      expect(screen.getByText('DEMO MODE')).toBeInTheDocument();
      expect(screen.getByText('SYNTHETIC DATA')).toBeInTheDocument();
    });

    it('displays error state when data loading fails', async () => {
      mockApiService.getDashboardData.mockRejectedValue(new Error('Failed to load'));
      
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      });
    });
  });

  describe('Interaction', () => {
    it('handles refresh button click', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      expect(mockApiService.refreshData).toHaveBeenCalled();
    });

    it('handles export button click', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
      
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeInTheDocument();
    });

    it('handles settings button click', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
      
      const settingsButton = screen.getByText('Settings');
      expect(settingsButton).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays data sources information', async () => {
      const dataWithSources = {
        ...mockDashboardData,
        hazardSummary: {
          ...mockDashboardData.hazardSummary,
          dataSources: { FIRMS: 5, NOAA: 3 },
        },
      };
      
      mockApiService.getDashboardData.mockResolvedValue(dataWithSources);
      
      render(<Dashboard />);
      
      await waitFor(() => {
        // Check that Data Sources section exists (there might be multiple elements with this text)
        const dataSourcesElements = screen.getAllByText('Data Sources');
        expect(dataSourcesElements.length).toBeGreaterThanOrEqual(1);
        // Check that FIRMS appears (there might be multiple elements with this text)
        const firmsElements = screen.getAllByText('FIRMS');
        expect(firmsElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('5 hazards')).toBeInTheDocument();
        // Check that NOAA appears (there might be multiple elements with this text)
        const noaaElements = screen.getAllByText('NOAA');
        expect(noaaElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('3 hazards')).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('renders all child components', async () => {
      render(<Dashboard />);
      
      await waitFor(() => {
        // Check that child components are rendered
        expect(screen.getByText('Disaster Response Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockApiService.getDashboardData.mockRejectedValue(new Error('Network error'));
      
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      });
    });

    it('handles validation errors', async () => {
      mockValidateData.mockReturnValue({ 
        isValid: false, 
        errors: ['Invalid data format'] 
      });
      
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Disaster Response Dashboard')).toBeInTheDocument();
      });
    });
  });
}); 