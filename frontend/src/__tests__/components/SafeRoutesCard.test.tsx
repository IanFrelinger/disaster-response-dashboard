/**
 * Tests for SafeRoutesCard component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import SafeRoutesCard from '../../components/SafeRoutesCard';

describe('SafeRoutesCard', () => {
  const defaultProps = {
    evacuationRoutes: {
      availableRoutes: 3,
      routes: [
        {
          id: 'route-1',
          origin: [37.7749, -122.4194],
          destination: [37.7849, -122.4094],
          distance: 1.5,
          estimatedTime: 15,
          hazardAvoided: true,
        },
        {
          id: 'route-2',
          origin: [37.7749, -122.4194],
          destination: [37.7849, -122.4094],
          distance: 2.1,
          estimatedTime: 25,
          hazardAvoided: false,
        },
        {
          id: 'route-3',
          origin: [37.7749, -122.4194],
          destination: [37.7849, -122.4094],
          distance: 0.8,
          estimatedTime: 10,
          hazardAvoided: true,
        },
      ],
      hazardCount: 2,
      generatedAt: '2024-01-01T12:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the safe routes card', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      expect(screen.getByText('Safe Evacuation Routes')).toBeInTheDocument();
    });

    it('displays available routes count', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      expect(screen.getByText('3 routes available')).toBeInTheDocument();
    });

    it('displays route statistics', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Total routes
      expect(screen.getByText('Routes')).toBeInTheDocument();
      expect(screen.getAllByText('2')).toHaveLength(2); // Hazards avoided and Safe routes
      expect(screen.getByText('Hazards Avoided')).toBeInTheDocument();
      expect(screen.getByText('Safe Routes')).toBeInTheDocument();
    });

    it('displays individual routes', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      expect(screen.getByText('Route 1')).toBeInTheDocument();
      expect(screen.getByText('Route 2')).toBeInTheDocument();
      expect(screen.getByText('Route 3')).toBeInTheDocument();
    });

    it('displays route details', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      expect(screen.getByText('1.5km • 15m')).toBeInTheDocument(); // Route 1
      expect(screen.getByText('2.1km • 25m')).toBeInTheDocument(); // Route 2
      expect(screen.getByText('800m • 10m')).toBeInTheDocument(); // Route 3
    });

    it('displays generation timestamp', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      expect(screen.getByText(/Generated:/)).toBeInTheDocument();
      expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('expands and collapses route details when clicked', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      // Initially should not show route details
      expect(screen.queryByText('Origin')).not.toBeInTheDocument();
      
      // Click expand button for first route
      const expandButtons = screen.getAllByRole('button');
      const firstExpandButton = expandButtons[0]; // First route expand button
      fireEvent.click(firstExpandButton);
      
      // Should now show route details
      expect(screen.getByText('Origin')).toBeInTheDocument();
      expect(screen.getByText('Destination')).toBeInTheDocument();
      expect(screen.getByText('37.7749, -122.4194')).toBeInTheDocument(); // Origin
      expect(screen.getByText('37.7849, -122.4094')).toBeInTheDocument(); // Destination
      expect(screen.getByText('Distance: 1.5km')).toBeInTheDocument();
      expect(screen.getByText('ETA: 15m')).toBeInTheDocument();
      expect(screen.getByText('Hazards avoided')).toBeInTheDocument();
      
      // Click again to collapse
      fireEvent.click(firstExpandButton);
      
      // Should hide details again
      expect(screen.queryByText('Origin')).not.toBeInTheDocument();
    });

    it('can expand multiple routes independently', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      const expandButtons = screen.getAllByRole('button');
      
      // Expand first route
      fireEvent.click(expandButtons[0]);
      expect(screen.getByText('Route 1')).toBeInTheDocument();
      expect(screen.getByText('Distance: 1.5km')).toBeInTheDocument();
      
      // Expand second route (this should close the first route)
      fireEvent.click(expandButtons[1]);
      expect(screen.getByText('Route 2')).toBeInTheDocument();
      expect(screen.getByText('Distance: 2.1km')).toBeInTheDocument();
      
      // First route should no longer be expanded
      expect(screen.queryByText('Distance: 1.5km')).not.toBeInTheDocument();
    });
  });

  describe('Hazard Avoidance Display', () => {
    it('shows shield icon for safe routes', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      // Route 1 and Route 3 are safe (hazardAvoided: true)
      const shieldIcons = screen.getAllByTestId('shield');
      expect(shieldIcons).toHaveLength(2); // 2 safe routes
    });

    it('displays hazard avoidance status in expanded view', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      // Expand first route (safe)
      const expandButtons = screen.getAllByRole('button');
      fireEvent.click(expandButtons[0]);
      
      expect(screen.getByText('Hazards avoided')).toBeInTheDocument();
      
      // Expand second route (unsafe)
      fireEvent.click(expandButtons[1]);
      
      expect(screen.getByText('May encounter hazards')).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('formats distance correctly', () => {
      const routesWithDifferentDistances = {
        evacuationRoutes: {
          availableRoutes: 3,
          routes: [
            {
              id: 'route-1',
              origin: [37.7749, -122.4194],
              destination: [37.7849, -122.4094],
              distance: 0.5, // Less than 1km
              estimatedTime: 10,
              hazardAvoided: true,
            },
            {
              id: 'route-2',
              origin: [37.7749, -122.4194],
              destination: [37.7849, -122.4094],
              distance: 1.234, // More than 1km
              estimatedTime: 20,
              hazardAvoided: false,
            },
          ],
          hazardCount: 1,
          generatedAt: '2024-01-01T12:00:00Z',
        },
      };

      render(<SafeRoutesCard {...routesWithDifferentDistances} />);
      
      expect(screen.getByText('500m • 10m')).toBeInTheDocument(); // Less than 1km
      expect(screen.getByText('1.2km • 20m')).toBeInTheDocument(); // More than 1km
    });

    it('formats time correctly', () => {
      const routesWithDifferentTimes = {
        evacuationRoutes: {
          availableRoutes: 2,
          routes: [
            {
              id: 'route-1',
              origin: [37.7749, -122.4194],
              destination: [37.7849, -122.4094],
              distance: 1.0,
              estimatedTime: 45, // Less than 1 hour
              hazardAvoided: true,
            },
            {
              id: 'route-2',
              origin: [37.7749, -122.4194],
              destination: [37.7849, -122.4094],
              distance: 2.0,
              estimatedTime: 90, // More than 1 hour
              hazardAvoided: false,
            },
          ],
          hazardCount: 1,
          generatedAt: '2024-01-01T12:00:00Z',
        },
      };

      render(<SafeRoutesCard {...routesWithDifferentTimes} />);
      
      expect(screen.getByText('1.0km • 45m')).toBeInTheDocument(); // Less than 1 hour
      expect(screen.getByText('2.0km • 1h 30m')).toBeInTheDocument(); // More than 1 hour
    });

    it('formats coordinates correctly', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      // Expand first route to see coordinates
      const expandButtons = screen.getAllByRole('button');
      fireEvent.click(expandButtons[0]);
      
      expect(screen.getByText('37.7749, -122.4194')).toBeInTheDocument(); // Origin
      expect(screen.getByText('37.7849, -122.4094')).toBeInTheDocument(); // Destination
    });
  });

  describe('Edge Cases', () => {
    it('handles empty routes array', () => {
      const emptyRoutes = {
        evacuationRoutes: {
          availableRoutes: 0,
          routes: [],
          hazardCount: 0,
          generatedAt: '2024-01-01T12:00:00Z',
        },
      };

      render(<SafeRoutesCard {...emptyRoutes} />);
      
      expect(screen.getByText('0 routes available')).toBeInTheDocument();
      expect(screen.getAllByText('0')).toHaveLength(3); // Routes count, Hazards avoided, Safe routes
    });

    it('handles routes with zero distance and time', () => {
      const zeroRoutes = {
        evacuationRoutes: {
          availableRoutes: 1,
          routes: [
            {
              id: 'route-1',
              origin: [37.7749, -122.4194],
              destination: [37.7749, -122.4194], // Same as origin
              distance: 0,
              estimatedTime: 0,
              hazardAvoided: true,
            },
          ],
          hazardCount: 0,
          generatedAt: '2024-01-01T12:00:00Z',
        },
      };

      render(<SafeRoutesCard {...zeroRoutes} />);
      
      expect(screen.getByText('0m • 0m')).toBeInTheDocument();
    });

    it('handles very long distances and times', () => {
      const longRoutes = {
        evacuationRoutes: {
          availableRoutes: 1,
          routes: [
            {
              id: 'route-1',
              origin: [37.7749, -122.4194],
              destination: [37.7849, -122.4094],
              distance: 999.9,
              estimatedTime: 1440, // 24 hours
              hazardAvoided: true,
            },
          ],
          hazardCount: 1,
          generatedAt: '2024-01-01T12:00:00Z',
        },
      };

      render(<SafeRoutesCard {...longRoutes} />);
      
      expect(screen.getByText('999.9km • 24h 0m')).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('applies custom className when provided', () => {
      render(<SafeRoutesCard {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('Safe Evacuation Routes').closest('div')?.parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('renders with default styling when no className provided', () => {
      render(<SafeRoutesCard {...defaultProps} />);
      
      const container = screen.getByText('Safe Evacuation Routes').closest('div')?.parentElement;
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
    });
  });
}); 