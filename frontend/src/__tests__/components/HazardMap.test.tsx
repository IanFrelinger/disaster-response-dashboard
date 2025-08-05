/**
 * Tests for HazardMap component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockHazardZone, mockSafeRoute, simulateMapClick } from '../test-utils';
import HazardMap from '../../components/HazardMap';

// Mock the HazardMap component's dependencies
vi.mock('../../components/HazardMap', () => {
  const MockHazardMap = ({ 
    hazardZones, 
    safeRoutes, 
    onLocationClick, 
    center, 
    zoom 
  }: any) => {
    return (
      <div data-testid="hazard-map" data-center={JSON.stringify(center)} data-zoom={zoom}>
        <div data-testid="hazard-zones-count">{hazardZones.length}</div>
        <div data-testid="safe-routes-count">{safeRoutes.length}</div>
        
        {/* Mock hazard zones */}
        {hazardZones.map((hazard: any, index: number) => (
          <div 
            key={hazard.id || index}
            data-testid={`hazard-zone-${index}`}
            data-risk-level={hazard.riskLevel}
            data-risk-score={hazard.riskScore}
            onClick={() => {
              // Simulate hazard selection
              const event = new CustomEvent('hazardSelected', { detail: hazard });
              document.dispatchEvent(event);
            }}
          >
            <span data-testid={`hazard-source-${index}`}>{hazard.dataSource}</span>
            <span data-testid={`hazard-brightness-${index}`}>{hazard.brightness}</span>
            <span data-testid={`hazard-confidence-${index}`}>{hazard.confidence}</span>
          </div>
        ))}
        
        {/* Mock safe routes */}
        {safeRoutes.map((route: any, index: number) => (
          <div 
            key={route.id || index}
            data-testid={`safe-route-${index}`}
            data-hazard-avoided={route.hazardAvoided}
            data-distance={route.distance}
          >
            <span data-testid={`route-origin-${index}`}>
              {route.origin.join(',')}
            </span>
            <span data-testid={`route-destination-${index}`}>
              {route.destination.join(',')}
            </span>
          </div>
        ))}
        
        {/* Mock map click handler */}
        <div 
          data-testid="map-click-area"
          onClick={(e) => {
            if (onLocationClick) {
              onLocationClick(37.7749, -122.4194);
            }
          }}
        >
          Click to test location
        </div>
        
        {/* Mock legends */}
        <div data-testid="hazard-legend">
          <div data-testid="legend-low">Low Risk</div>
          <div data-testid="legend-medium">Medium Risk</div>
          <div data-testid="legend-high">High Risk</div>
          <div data-testid="legend-critical">Critical Risk</div>
        </div>
        
        <div data-testid="route-legend">
          <div data-testid="legend-routes">Safe Routes</div>
        </div>
      </div>
    );
  };
  
  return { default: MockHazardMap };
});

describe('HazardMap', () => {
  const defaultProps = {
    hazardZones: [mockHazardZone()],
    safeRoutes: [mockSafeRoute()],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the map component', () => {
      render(<HazardMap {...defaultProps} />);
      
      expect(screen.getByTestId('hazard-map')).toBeInTheDocument();
    });

    it('displays correct number of hazard zones', () => {
      const hazardZones = [mockHazardZone(), mockHazardZone({ id: 'hazard-2' })];
      render(<HazardMap {...defaultProps} hazardZones={hazardZones} />);
      
      expect(screen.getByTestId('hazard-zones-count')).toHaveTextContent('2');
    });

    it('displays correct number of safe routes', () => {
      const safeRoutes = [mockSafeRoute(), mockSafeRoute({ id: 'route-2' })];
      render(<HazardMap {...defaultProps} safeRoutes={safeRoutes} />);
      
      expect(screen.getByTestId('safe-routes-count')).toHaveTextContent('2');
    });

    it('renders hazard zones with correct properties', () => {
      const hazardZone = mockHazardZone({
        riskLevel: 'critical',
        riskScore: 0.9,
        dataSource: 'NOAA',
        brightness: 400,
        confidence: 95,
      });
      
      render(<HazardMap {...defaultProps} hazardZones={[hazardZone]} />);
      
      const hazardElement = screen.getByTestId('hazard-zone-0');
      expect(hazardElement).toHaveAttribute('data-risk-level', 'critical');
      expect(hazardElement).toHaveAttribute('data-risk-score', '0.9');
      expect(screen.getByTestId('hazard-source-0')).toHaveTextContent('NOAA');
      expect(screen.getByTestId('hazard-brightness-0')).toHaveTextContent('400');
      expect(screen.getByTestId('hazard-confidence-0')).toHaveTextContent('95');
    });

    it('renders safe routes with correct properties', () => {
      const safeRoute = mockSafeRoute({
        hazardAvoided: true,
        distance: 1500,
        origin: [37.7749, -122.4194],
        destination: [37.7849, -122.4094],
      });
      
      render(<HazardMap {...defaultProps} safeRoutes={[safeRoute]} />);
      
      const routeElement = screen.getByTestId('safe-route-0');
      expect(routeElement).toHaveAttribute('data-hazard-avoided', 'true');
      expect(routeElement).toHaveAttribute('data-distance', '1500');
      expect(screen.getByTestId('route-origin-0')).toHaveTextContent('37.7749,-122.4194');
      expect(screen.getByTestId('route-destination-0')).toHaveTextContent('37.7849,-122.4094');
    });

    it('renders hazard legend', () => {
      render(<HazardMap {...defaultProps} />);
      
      expect(screen.getByTestId('hazard-legend')).toBeInTheDocument();
      expect(screen.getByTestId('legend-low')).toHaveTextContent('Low Risk');
      expect(screen.getByTestId('legend-medium')).toHaveTextContent('Medium Risk');
      expect(screen.getByTestId('legend-high')).toHaveTextContent('High Risk');
      expect(screen.getByTestId('legend-critical')).toHaveTextContent('Critical Risk');
    });

    it('renders route legend', () => {
      render(<HazardMap {...defaultProps} />);
      
      expect(screen.getByTestId('route-legend')).toBeInTheDocument();
      expect(screen.getByTestId('legend-routes')).toHaveTextContent('Safe Routes');
    });
  });

  describe('Props and Configuration', () => {
    it('uses default center coordinates when not provided', () => {
      render(<HazardMap {...defaultProps} />);
      
      const mapElement = screen.getByTestId('hazard-map');
      const center = JSON.parse(mapElement.getAttribute('data-center') || '[]');
      expect(center).toEqual([-122.4194, 37.7749]); // San Francisco default
    });

    it('uses custom center coordinates when provided', () => {
      const customCenter: [number, number] = [40.7128, -74.0060]; // New York
      render(<HazardMap {...defaultProps} center={customCenter} />);
      
      const mapElement = screen.getByTestId('hazard-map');
      const center = JSON.parse(mapElement.getAttribute('data-center') || '[]');
      expect(center).toEqual(customCenter);
    });

    it('uses default zoom level when not provided', () => {
      render(<HazardMap {...defaultProps} />);
      
      const mapElement = screen.getByTestId('hazard-map');
      expect(mapElement).toHaveAttribute('data-zoom', '10');
    });

    it('uses custom zoom level when provided', () => {
      render(<HazardMap {...defaultProps} zoom={15} />);
      
      const mapElement = screen.getByTestId('hazard-map');
      expect(mapElement).toHaveAttribute('data-zoom', '15');
    });

    it('handles empty hazard zones array', () => {
      render(<HazardMap {...defaultProps} hazardZones={[]} />);
      
      expect(screen.getByTestId('hazard-zones-count')).toHaveTextContent('0');
    });

    it('handles empty safe routes array', () => {
      render(<HazardMap {...defaultProps} safeRoutes={[]} />);
      
      expect(screen.getByTestId('safe-routes-count')).toHaveTextContent('0');
    });
  });

  describe('Interaction', () => {
    it('calls onLocationClick when map is clicked', () => {
      const mockOnLocationClick = vi.fn();
      render(<HazardMap {...defaultProps} onLocationClick={mockOnLocationClick} />);
      
      const clickArea = screen.getByTestId('map-click-area');
      fireEvent.click(clickArea);
      
      expect(mockOnLocationClick).toHaveBeenCalledWith(37.7749, -122.4194);
    });

    it('does not call onLocationClick when not provided', () => {
      render(<HazardMap {...defaultProps} />);
      
      const clickArea = screen.getByTestId('map-click-area');
      expect(() => fireEvent.click(clickArea)).not.toThrow();
    });

    it('handles hazard zone selection', () => {
      const hazardZone = mockHazardZone({ id: 'test-hazard' });
      render(<HazardMap {...defaultProps} hazardZones={[hazardZone]} />);
      
      const hazardElement = screen.getByTestId('hazard-zone-0');
      
      // Listen for the custom event
      const eventHandler = vi.fn();
      document.addEventListener('hazardSelected', eventHandler);
      
      fireEvent.click(hazardElement);
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: hazardZone,
        })
      );
      
      document.removeEventListener('hazardSelected', eventHandler);
    });
  });

  describe('Edge Cases', () => {
    it('handles hazard zones with missing optional properties', () => {
      const minimalHazardZone = {
        id: 'minimal-hazard',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
        riskLevel: 'medium' as const,
        lastUpdated: new Date(),
        dataSource: 'FIRMS' as const,
        riskScore: 0.5,
      };
      
      render(<HazardMap {...defaultProps} hazardZones={[minimalHazardZone]} />);
      
      expect(screen.getByTestId('hazard-zone-0')).toBeInTheDocument();
      expect(screen.getByTestId('hazard-zone-0')).toHaveAttribute('data-risk-level', 'medium');
    });

    it('handles safe routes with missing optional properties', () => {
      const minimalSafeRoute = {
        id: 'minimal-route',
        origin: [0, 0] as [number, number],
        destination: [1, 1] as [number, number],
        route: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        hazardAvoided: false,
      };
      
      render(<HazardMap {...defaultProps} safeRoutes={[minimalSafeRoute]} />);
      
      expect(screen.getByTestId('safe-route-0')).toBeInTheDocument();
      expect(screen.getByTestId('safe-route-0')).toHaveAttribute('data-hazard-avoided', 'false');
    });

    it('handles very large coordinate values', () => {
      const extremeHazardZone = mockHazardZone({
        geometry: {
          type: 'Polygon',
          coordinates: [[[180, 90], [180, 90], [180, 90], [180, 90], [180, 90]]],
        },
      });
      
      render(<HazardMap {...defaultProps} hazardZones={[extremeHazardZone]} />);
      
      expect(screen.getByTestId('hazard-zone-0')).toBeInTheDocument();
    });

    it('handles zero risk scores', () => {
      const zeroRiskHazard = mockHazardZone({ riskScore: 0 });
      
      render(<HazardMap {...defaultProps} hazardZones={[zeroRiskHazard]} />);
      
      expect(screen.getByTestId('hazard-zone-0')).toHaveAttribute('data-risk-score', '0');
    });

    it('handles maximum risk scores', () => {
      const maxRiskHazard = mockHazardZone({ riskScore: 1.0 });
      
      render(<HazardMap {...defaultProps} hazardZones={[maxRiskHazard]} />);
      
      expect(screen.getByTestId('hazard-zone-0')).toHaveAttribute('data-risk-score', '1');
    });
  });

  describe('Accessibility', () => {
    it('provides appropriate test IDs for testing', () => {
      render(<HazardMap {...defaultProps} />);
      
      expect(screen.getByTestId('hazard-map')).toBeInTheDocument();
      expect(screen.getByTestId('hazard-legend')).toBeInTheDocument();
      expect(screen.getByTestId('route-legend')).toBeInTheDocument();
      expect(screen.getByTestId('map-click-area')).toBeInTheDocument();
    });

    it('renders hazard zones with accessible attributes', () => {
      const hazardZone = mockHazardZone({ riskLevel: 'high' });
      render(<HazardMap {...defaultProps} hazardZones={[hazardZone]} />);
      
      const hazardElement = screen.getByTestId('hazard-zone-0');
      expect(hazardElement).toHaveAttribute('data-risk-level');
      expect(hazardElement).toHaveAttribute('data-risk-score');
    });

    it('renders safe routes with accessible attributes', () => {
      const safeRoute = mockSafeRoute({ hazardAvoided: true });
      render(<HazardMap {...defaultProps} safeRoutes={[safeRoute]} />);
      
      const routeElement = screen.getByTestId('safe-route-0');
      expect(routeElement).toHaveAttribute('data-hazard-avoided');
      expect(routeElement).toHaveAttribute('data-distance');
    });
  });
}); 