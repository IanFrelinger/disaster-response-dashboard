/**
 * Tests for RiskAssessmentCard component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';
import RiskAssessmentCard from '../../components/RiskAssessmentCard';

describe('RiskAssessmentCard', () => {
  const defaultProps = {
    assessment: {
      totalNearbyHazards: 5,
      riskLevels: { low: 2, medium: 2, high: 1, critical: 0 },
      avgRiskScore: 0.45,
      maxRiskScore: 0.75,
      closestHazardDistanceKm: 2.5,
      assessmentRadiusKm: 10,
      location: { latitude: 37.7749, longitude: -122.4194 },
      assessmentTimestamp: '2024-01-01T12:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the risk assessment card', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
    });

    it('displays overall risk level', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      // With maxRiskScore of 0.75, should be HIGH
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('displays nearby hazards count', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Nearby Hazards')).toBeInTheDocument();
    });

    it('displays closest hazard distance', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText('2.5km')).toBeInTheDocument();
      expect(screen.getByText('Closest Hazard')).toBeInTheDocument();
    });

    it('displays average risk score', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText('45.0%')).toBeInTheDocument();
      expect(screen.getByText('Average Risk Score')).toBeInTheDocument();
    });

    it('displays max risk score', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText('75.0%')).toBeInTheDocument();
      expect(screen.getByText('Max Risk Score')).toBeInTheDocument();
    });

    it('displays assessment radius', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText('10km')).toBeInTheDocument();
      expect(screen.getByText('Assessment Radius')).toBeInTheDocument();
    });

    it('displays risk level distribution', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText('Risk Level Distribution')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
      
      // Check that expected counts are present (there might be multiple elements with same text)
      const twoElements = screen.getAllByText('2');
      const oneElements = screen.getAllByText('1');
      expect(twoElements.length).toBeGreaterThanOrEqual(1); // low count
      expect(oneElements.length).toBeGreaterThanOrEqual(1); // high count
    });

    it('displays location coordinates', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText('37.7749, -122.4194')).toBeInTheDocument();
    });

    it('displays assessment timestamp', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
    });
  });

  describe('Risk Level Calculation', () => {
    it('displays critical risk level for high max risk score', () => {
      const criticalAssessment = {
        ...defaultProps.assessment,
        maxRiskScore: 0.9,
      };

      render(<RiskAssessmentCard assessment={criticalAssessment} />);
      
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    });

    it('displays high risk level for medium-high max risk score', () => {
      const highAssessment = {
        ...defaultProps.assessment,
        maxRiskScore: 0.7,
      };

      render(<RiskAssessmentCard assessment={highAssessment} />);
      
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('displays medium risk level for medium max risk score', () => {
      const mediumAssessment = {
        ...defaultProps.assessment,
        maxRiskScore: 0.5,
      };

      render(<RiskAssessmentCard assessment={mediumAssessment} />);
      
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('displays low risk level for low max risk score', () => {
      const lowAssessment = {
        ...defaultProps.assessment,
        maxRiskScore: 0.3,
      };

      render(<RiskAssessmentCard assessment={lowAssessment} />);
      
      expect(screen.getByText('LOW')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles no nearby hazards', () => {
      const noHazardsAssessment = {
        ...defaultProps.assessment,
        totalNearbyHazards: 0,
        closestHazardDistanceKm: null,
      };

      render(<RiskAssessmentCard assessment={noHazardsAssessment} />);
      
      // Check that we have at least one zero (for nearby hazards)
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(1); // Nearby hazards
      expect(screen.getByText('N/A')).toBeInTheDocument(); // Closest hazard
    });

    it('handles zero risk scores', () => {
      const zeroRiskAssessment = {
        ...defaultProps.assessment,
        avgRiskScore: 0,
        maxRiskScore: 0,
      };

      render(<RiskAssessmentCard assessment={zeroRiskAssessment} />);
      
      // Use getAllByText to get all instances and check specific ones
      const percentageElements = screen.getAllByText('0.0%');
      expect(percentageElements.length).toBeGreaterThanOrEqual(2); // Should have at least 2 (avg and max)
      expect(screen.getByText('LOW')).toBeInTheDocument(); // Risk level
    });

    it('handles very high risk scores', () => {
      const highRiskAssessment = {
        ...defaultProps.assessment,
        avgRiskScore: 0.95,
        maxRiskScore: 0.99,
      };

      render(<RiskAssessmentCard assessment={highRiskAssessment} />);
      
      expect(screen.getByText('95.0%')).toBeInTheDocument(); // Average risk
      expect(screen.getByText('99.0%')).toBeInTheDocument(); // Max risk
      expect(screen.getByText('CRITICAL')).toBeInTheDocument(); // Risk level
    });

    it('handles empty risk level distribution', () => {
      const emptyDistributionAssessment = {
        ...defaultProps.assessment,
        riskLevels: { low: 0, medium: 0, high: 0, critical: 0 },
      };

      render(<RiskAssessmentCard assessment={emptyDistributionAssessment} />);
      
      // Check that all risk level counts are 0
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(4); // Should have at least 4 zeros (one for each risk level)
    });
  });

  describe('Visual Design', () => {
    it('applies custom className when provided', () => {
      render(<RiskAssessmentCard {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('Risk Assessment').closest('div')?.parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('renders with default styling when no className provided', () => {
      render(<RiskAssessmentCard {...defaultProps} />);
      
      const container = screen.getByText('Risk Assessment').closest('div')?.parentElement;
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
    });
  });

  describe('Data Formatting', () => {
    it('formats distance correctly', () => {
      const assessmentWithDecimalDistance = {
        ...defaultProps.assessment,
        closestHazardDistanceKm: 1.23456,
      };

      render(<RiskAssessmentCard assessment={assessmentWithDecimalDistance} />);
      
      expect(screen.getByText('1.2km')).toBeInTheDocument();
    });

    it('formats coordinates correctly', () => {
      const assessmentWithDecimalCoordinates = {
        ...defaultProps.assessment,
        location: { latitude: 37.123456, longitude: -122.654321 },
      };

      render(<RiskAssessmentCard assessment={assessmentWithDecimalCoordinates} />);
      
      expect(screen.getByText('37.1235, -122.6543')).toBeInTheDocument();
    });

    it('formats percentages correctly', () => {
      const assessmentWithDecimalPercentages = {
        ...defaultProps.assessment,
        avgRiskScore: 0.123456,
        maxRiskScore: 0.987654,
      };

      render(<RiskAssessmentCard assessment={assessmentWithDecimalPercentages} />);
      
      expect(screen.getByText('12.3%')).toBeInTheDocument(); // Average
      expect(screen.getByText('98.8%')).toBeInTheDocument(); // Max
    });
  });
}); 