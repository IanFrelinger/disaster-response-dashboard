/**
 * Test utilities for React component testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  withRouter?: boolean;
}

const AllTheProviders = ({ 
  children, 
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  }),
  withRouter = false,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
  withRouter?: boolean;
}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const content = (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    return withRouter ? (
      <BrowserRouter>
        {content}
      </BrowserRouter>
    ) : content;
  };

  return <Wrapper>{children}</Wrapper>;
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, withRouter, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient} withRouter={withRouter}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock data generators
export const mockHazardZone = (overrides = {}) => ({
  id: 'hazard-1',
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
  },
  riskLevel: 'high' as const,
  lastUpdated: new Date('2024-01-01T12:00:00Z'),
  dataSource: 'FIRMS' as const,
  riskScore: 0.8,
  h3Index: '8928308280fffff',
  brightness: 300,
  confidence: 85,
  acqDate: new Date('2024-01-01T10:00:00Z'),
  ...overrides,
});

export const mockSafeRoute = (overrides = {}) => ({
  id: 'route-1',
  origin: [37.7749, -122.4194] as [number, number],
  destination: [37.7849, -122.4094] as [number, number],
  route: {
    type: 'LineString',
    coordinates: [[-122.4194, 37.7749], [-122.4094, 37.7849]],
  },
  hazardAvoided: true,
  distance: 1000,
  estimatedTime: 15,
  ...overrides,
});

export const mockRiskAssessment = (overrides = {}) => ({
  totalNearbyHazards: 3,
  riskLevels: { high: 1, medium: 1, low: 1 },
  avgRiskScore: 0.5,
  maxRiskScore: 0.8,
  closestHazardDistanceKm: 2.5,
  assessmentRadiusKm: 10,
  location: { latitude: 37.7749, longitude: -122.4194 },
  assessmentTimestamp: '2024-01-01T12:00:00Z',
  ...overrides,
});

export const mockHazardSummary = (overrides = {}) => ({
  totalHazards: 15,
  riskDistribution: { low: 5, medium: 6, high: 3, critical: 1 },
  dataSources: { FIRMS: 12, NOAA: 3 },
  lastUpdated: '2024-01-01T12:00:00Z',
  bbox: [-122.5, 37.7, -122.3, 37.8] as [number, number, number, number],
  ...overrides,
});

// Event simulation helpers
export const simulateMapClick = (element: HTMLElement, lat = 37.7749, lng = -122.4194) => {
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: 100,
    clientY: 100,
  });
  
  // Add custom properties for map coordinates
  Object.defineProperty(clickEvent, 'coordinate', {
    value: [lng, lat],
    writable: false,
  });
  
  element.dispatchEvent(clickEvent);
};

export const simulateMapHover = (element: HTMLElement) => {
  const hoverEvent = new MouseEvent('mouseenter', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(hoverEvent);
};

// Async helpers
export const waitForElementToBeRemoved = (element: HTMLElement) => {
  return new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// Mock API response helpers
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  });
};

export const mockApiError = (message = 'API Error', status = 500) => {
  return Promise.reject({
    response: {
      data: { message },
      status,
      statusText: 'Internal Server Error',
    },
  });
};

// Test constants
export const TEST_COORDINATES = {
  SAN_FRANCISCO: [37.7749, -122.4194] as [number, number],
  NEW_YORK: [40.7128, -74.0060] as [number, number],
  LONDON: [51.5074, -0.1278] as [number, number],
};

export const TEST_HAZARD_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render }; 