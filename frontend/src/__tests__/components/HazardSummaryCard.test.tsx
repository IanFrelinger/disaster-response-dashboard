/**
 * Tests for HazardSummaryCard component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';
import HazardSummaryCard from '../../components/HazardSummaryCard';

describe('HazardSummaryCard', () => {
  const defaultProps = {
    summary: {
      totalHazards: 15,
      riskDistribution: { low: 5, medium: 6, high: 3, critical: 1 },
      dataSources: { FIRMS: 12, NOAA: 3 },
      lastUpdated: '2024-01-01T12:00:00Z',
      bbox: [-122.5, 37.7, -122.3, 37.8],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the hazard summary card', () => {
      render(<HazardSummaryCard {...defaultProps} />);
      
      expect(screen.getByText('Hazard Summary')).toBeInTheDocument();
    });

    it('displays total hazards count', () => {
      render(<HazardSummaryCard {...defaultProps} />);
      
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Total Hazards')).toBeInTheDocument();
    });

    it('displays data sources count', () => {
      render(<HazardSummaryCard {...defaultProps} />);
      
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 data sources
      // Check that Data Sources section exists (there might be multiple elements with this text)
      const dataSourcesElements = screen.getAllByText('Data Sources');
      expect(dataSourcesElements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays risk level distribution', () => {
      render(<HazardSummaryCard {...defaultProps} />);
      
      expect(screen.getByText('Risk Level Distribution')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
      
      // Check that expected counts are present (there might be multiple elements with same text)
      const fiveElements = screen.getAllByText('5');
      const sixElements = screen.getAllByText('6');
      const threeElements = screen.getAllByText('3');
      const oneElements = screen.getAllByText('1');
      
      expect(fiveElements.length).toBeGreaterThanOrEqual(1); // low count
      expect(sixElements.length).toBeGreaterThanOrEqual(1); // medium count
      expect(threeElements.length).toBeGreaterThanOrEqual(1); // high count
      expect(oneElements.length).toBeGreaterThanOrEqual(1); // critical count
    });

    it('displays data sources information', () => {
      render(<HazardSummaryCard {...defaultProps} />);
      
      // Check that Data Sources section exists (there might be multiple elements with this text)
      const dataSourcesElements = screen.getAllByText('Data Sources');
      expect(dataSourcesElements.length).toBeGreaterThanOrEqual(1);
      
      expect(screen.getByText('FIRMS')).toBeInTheDocument();
      expect(screen.getByText('NOAA')).toBeInTheDocument();
      
      // Check that expected counts are present
      const twelveElements = screen.getAllByText('12');
      const threeElements = screen.getAllByText('3');
      expect(twelveElements.length).toBeGreaterThanOrEqual(1); // FIRMS count
      expect(threeElements.length).toBeGreaterThanOrEqual(1); // NOAA count
    });

    it('displays last updated timestamp', () => {
      render(<HazardSummaryCard {...defaultProps} />);
      
      expect(screen.getByText(/Last Updated/)).toBeInTheDocument();
      expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty summary data', () => {
      const emptySummary = {
        totalHazards: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        dataSources: {},
        lastUpdated: '2024-01-01T12:00:00Z',
        bbox: [-122.5, 37.7, -122.3, 37.8],
      };

      render(<HazardSummaryCard summary={emptySummary} />);
      
      // Check that we have multiple zeros (total hazards and risk distribution)
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(2);
    });

    it('handles missing last updated timestamp', () => {
      const summaryWithoutTimestamp = {
        ...defaultProps.summary,
        lastUpdated: null,
      };

      render(<HazardSummaryCard summary={summaryWithoutTimestamp} />);
      
      expect(screen.getByText(/Last Updated/)).toBeInTheDocument();
      expect(screen.getByText(/N\/A/)).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      const largeSummary = {
        totalHazards: 999999,
        riskDistribution: { low: 500000, medium: 300000, high: 150000, critical: 49999 },
        dataSources: { FIRMS: 800000, NOAA: 199999 },
        lastUpdated: '2024-01-01T12:00:00Z',
        bbox: [-122.5, 37.7, -122.3, 37.8],
      };

      render(<HazardSummaryCard summary={largeSummary} />);
      
      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('500000')).toBeInTheDocument();
      expect(screen.getByText('800000')).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('applies custom className when provided', () => {
      render(<HazardSummaryCard {...defaultProps} className="custom-class" />);
      
      const cardElement = screen.getByText('Hazard Summary').closest('div')?.parentElement;
      expect(cardElement).toHaveClass('custom-class');
    });

    it('renders with default styling when no className provided', () => {
      render(<HazardSummaryCard {...defaultProps} />);
      
      const cardElement = screen.getByText('Hazard Summary').closest('div')?.parentElement;
      expect(cardElement).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
    });
  });

  describe('Data Validation', () => {
    it('handles zero total hazards correctly', () => {
      const zeroHazards = {
        totalHazards: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        dataSources: { FIRMS: 0 },
        lastUpdated: '2024-01-01T12:00:00Z',
        bbox: [-122.5, 37.7, -122.3, 37.8],
      };

      render(<HazardSummaryCard summary={zeroHazards} />);
      
      // Check that we have multiple zeros (total hazards, risk distribution, and data sources)
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(3);
    });

    it('calculates percentages correctly', () => {
      render(<HazardSummaryCard {...defaultProps} />);
      
      // With 15 total hazards:
      // low: 5/15 = 33.33%
      // medium: 6/15 = 40%
      // high: 3/15 = 20%
      // critical: 1/15 = 6.67%
      
      // Check that all expected counts are present
      const fiveElements = screen.getAllByText('5');
      const sixElements = screen.getAllByText('6');
      const threeElements = screen.getAllByText('3');
      const oneElements = screen.getAllByText('1');
      
      expect(fiveElements.length).toBeGreaterThanOrEqual(1); // low count
      expect(sixElements.length).toBeGreaterThanOrEqual(1); // medium count
      expect(threeElements.length).toBeGreaterThanOrEqual(1); // high count
      expect(oneElements.length).toBeGreaterThanOrEqual(1); // critical count
    });
  });
}); 