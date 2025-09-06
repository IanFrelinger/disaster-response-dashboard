/**
 * Example Error Test - Demonstrates Fault Injection Usage
 * 
 * This file shows how to use the fault injection system in your tests.
 * Copy and adapt these patterns for your actual components.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';
import { useFaultInjection } from './fault-injection';

// Type declaration for test faults
declare global {
  interface Window {
    __testFaults__?: any;
  }
}

// Example component that demonstrates fault injection
const ExampleComponent = () => {
  // Check for various fault types and render appropriate UI
  // Note: Order matters - map faults take priority over API faults, then data faults
  if (typeof window !== 'undefined' && window.__testFaults__?.config.map) {
    const fault = window.__testFaults__?.config.map;
    if (fault?.kind === 'webgl-unavailable') {
      return <div>Map unavailable - WebGL not supported</div>;
    }
    if (fault?.kind === 'style-load-fail') {
      return <div>Map style failed to load</div>;
    }
  }

  if (typeof window !== 'undefined' && window.__testFaults__?.config.api) {
    const fault = window.__testFaults__?.config.api;
    if (fault?.kind === 'http' && fault.status === 503) {
      return <div>Service unavailable</div>;
    }
    if (fault?.kind === 'timeout') {
      return <div>Request timeout</div>;
    }
  }

  if (typeof window !== 'undefined' && window.__testFaults__?.config.data) {
    const fault = window.__testFaults__?.config.data;
    if (fault?.kind === 'geojson-invalid') {
      return <div>Data corrupted - invalid format</div>;
    }
    if (fault?.kind === 'empty-dataset') {
      return <div>No data available</div>;
    }
  }

  if (typeof window !== 'undefined' && window.__testFaults__?.config.ui) {
    const fault = window.__testFaults__?.config.ui;
    if (fault?.kind === 'error-boundary-trigger') {
      throw new Error('Simulated error for testing');
    }
  }

  return <div>Component loaded successfully</div>;
};

// Example error boundary component
class ExampleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={this.resetError}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

describe('Fault Injection Examples', () => {
  beforeEach(() => {
    useFaultInjection.reset();
  });

  describe('API Faults', () => {
    test('shows service unavailable message when API returns 503', () => {
      useFaultInjection.api.injectHttpError(503);
      render(<ExampleComponent />);
      expect(screen.getByText('Service unavailable')).toBeInTheDocument();
    });

    test('shows timeout message when API times out', () => {
      useFaultInjection.api.injectTimeout();
      render(<ExampleComponent />);
      expect(screen.getByText('Request timeout')).toBeInTheDocument();
    });

    test('shows invalid JSON message when API returns malformed data', () => {
      useFaultInjection.api.injectInvalidJson();
      render(<ExampleComponent />);
      expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();
    });
  });

  describe('Map Faults', () => {
    test('shows WebGL unavailable message when WebGL is not supported', () => {
      useFaultInjection.map.injectWebglUnavailable();
      render(<ExampleComponent />);
      expect(screen.getByText('Map unavailable - WebGL not supported')).toBeInTheDocument();
    });

    test('shows style load failure message when map style fails to load', () => {
      useFaultInjection.map.injectStyleLoadFail();
      render(<ExampleComponent />);
      expect(screen.getByText('Map style failed to load')).toBeInTheDocument();
    });

    test('shows invalid token message when Mapbox token is invalid', () => {
      useFaultInjection.map.injectInvalidToken();
      render(<ExampleComponent />);
      expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();
    });
  });

  describe('UI Faults', () => {
    test('error boundary catches and displays error', () => {
      useFaultInjection.ui.injectErrorBoundary();
      const { container } = render(
        <ExampleErrorBoundary>
          <ExampleComponent />
        </ExampleErrorBoundary>
      );
      
      // Error boundary should catch the error
      expect(container.querySelector('h2')).toHaveTextContent('Something went wrong');
    });

    test('component recovers after error boundary reset', () => {
      useFaultInjection.ui.injectErrorBoundary();
      const { container, rerender } = render(
        <ExampleErrorBoundary key="test1">
          <ExampleComponent />
        </ExampleErrorBoundary>
      );
      
      // Error boundary should catch the error
      expect(container.querySelector('h2')).toHaveTextContent('Something went wrong');
      
      // Click try again button
      const tryAgainButton = container.querySelector('button');
      expect(tryAgainButton).toHaveTextContent('Try again');
      fireEvent.click(tryAgainButton!);
      
      // Reset fault injection so component can recover
      useFaultInjection.reset();
      
      // Force re-render with new key to ensure clean state
      rerender(
        <ExampleErrorBoundary key="test2">
          <ExampleComponent />
        </ExampleErrorBoundary>
      );
      
      // Component should recover
      expect(container).toHaveTextContent('Component loaded successfully');
    });
  });

  describe('Environment Faults', () => {
    test('shows fallback when environment is misconfigured', () => {
      useFaultInjection.env.injectMissingMapboxToken();
      render(<ExampleComponent />);
      expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();
    });

    test('shows fallback when API endpoint is invalid', () => {
      useFaultInjection.env.injectInvalidApiEndpoint();
      render(<ExampleComponent />);
      expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();
    });
  });

  describe('Performance Faults', () => {
    test('maintains performance under memory pressure', () => {
      // Inject memory pressure fault
      useFaultInjection.perf.injectMemorySpike();
      
      const startTime = performance.now();
      render(<ExampleComponent />);
      const endTime = performance.now();
      
      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();
    });

    test('handles slow network gracefully', () => {
      useFaultInjection.perf.injectNetworkLatency();
      render(<ExampleComponent />);
      expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();
    });
  });

  describe('Data Faults', () => {
    test('shows fallback when data is corrupted', () => {
      useFaultInjection.data.injectGeojsonInvalid();
      render(<ExampleComponent />);
      expect(screen.getByText('Data corrupted - invalid format')).toBeInTheDocument();
    });

    test('shows fallback when data is missing', () => {
      useFaultInjection.data.injectEmptyDataset();
      render(<ExampleComponent />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Integration Faults', () => {
    test('handles service discovery failures', () => {
      useFaultInjection.integration.injectServiceDiscoveryFail();
      render(<ExampleComponent />);
      expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();
    });

    test('handles authentication failures', () => {
      useFaultInjection.integration.injectCircuitBreakerTrigger();
      render(<ExampleComponent />);
      expect(screen.getByText('Component loaded successfully')).toBeInTheDocument();
    });
  });

  describe('Multiple Faults', () => {
    test('handles multiple simultaneous faults', () => {
      // Inject multiple faults
      useFaultInjection.api.injectHttpError(503);
      useFaultInjection.map.injectWebglUnavailable();
      
      render(<ExampleComponent />);
      
      // Component should handle multiple faults gracefully
      // Priority should be given to the most critical fault (map faults)
      expect(screen.getByText('Map unavailable - WebGL not supported')).toBeInTheDocument();
    });

    test('prioritizes critical faults over non-critical ones', () => {
      useFaultInjection.api.injectTimeout();
      useFaultInjection.map.injectStyleLoadFail();
      
      render(<ExampleComponent />);
      
      // Map faults should take priority
      expect(screen.getByText('Map style failed to load')).toBeInTheDocument();
    });
  });

  describe('Fault Injection Validation', () => {
    test('validates fault injection state', () => {
      // Inject fault
      useFaultInjection.api.injectHttpError(503);
      
      // Validate fault is active
      expect(useFaultInjection.api.shouldFail()).toBe(true);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'http', status: 503 });
      
      // Reset and validate
      useFaultInjection.reset();
      expect(useFaultInjection.api.shouldFail()).toBe(false);
      expect(useFaultInjection.getActiveFaults().length).toBe(0);
    });

    test('ensures only one fault per category', () => {
      // Inject first fault
      useFaultInjection.api.injectHttpError(500);
      expect(useFaultInjection.getActiveFaults().length).toBe(1);
      
      // Replace with second fault
      useFaultInjection.api.injectTimeout();
      expect(useFaultInjection.getActiveFaults().length).toBe(1);
      expect(useFaultInjection.api.getFault()).toEqual({ kind: 'timeout' });
    });
  });
});

describe('Async Error Handling Examples', () => {
  beforeEach(() => {
    useFaultInjection.reset();
  });

  test('handles async API failures gracefully', async () => {
    useFaultInjection.api.injectHttpError(503);
    
    const asyncOperation = async () => {
      if (useFaultInjection.api.shouldFail()) {
        throw new Error('API call failed');
      }
      return 'success';
    };
    
    // Should handle the error gracefully
    await expect(asyncOperation()).rejects.toThrow('API call failed');
  });

  test('handles timeout scenarios', async () => {
    useFaultInjection.api.injectTimeout();
    
    const asyncOperation = async () => {
      if (useFaultInjection.api.shouldFail()) {
        throw new Error('Request timeout');
      }
      return 'success';
    };
    
    // Should handle timeout gracefully
    await expect(asyncOperation()).rejects.toThrow('Request timeout');
  });
});

describe('Error Boundary Testing Examples', () => {
  beforeEach(() => {
    useFaultInjection.reset();
  });

  test('error boundary catches component errors', () => {
    useFaultInjection.ui.injectErrorBoundary();
    
    const { container } = render(
      <ExampleErrorBoundary>
        <ExampleComponent />
      </ExampleErrorBoundary>
    );
    
    // Error boundary should catch the error
    expect(container.querySelector('h2')).toHaveTextContent('Something went wrong');
  });

  test('error boundary allows recovery', () => {
    useFaultInjection.ui.injectErrorBoundary();
    
    const { container, rerender } = render(
      <ExampleErrorBoundary key="test3">
        <ExampleComponent />
      </ExampleErrorBoundary>
    );
    
    // Error boundary should catch the error
    expect(container.querySelector('h2')).toHaveTextContent('Something went wrong');
    
    // Click try again button
    const tryAgainButton = container.querySelector('button');
    expect(tryAgainButton).toHaveTextContent('Try again');
    fireEvent.click(tryAgainButton!);
    
    // Reset fault injection so component can recover
    useFaultInjection.reset();
    
    // Force re-render with new key to ensure clean state
    rerender(
      <ExampleErrorBoundary key="test4">
        <ExampleComponent />
      </ExampleErrorBoundary>
    );
    
    // Component should recover
    expect(container).toHaveTextContent('Component loaded successfully');
  });
});
