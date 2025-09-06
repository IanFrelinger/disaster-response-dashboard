import React, { createContext, useContext, useEffect, useState } from 'react';

interface TestModeContextType {
  isTestMode: boolean;
  testViewport: string | null;
  testStyle: string | null;
  hideUIElements: boolean;
  setTestViewport: (viewport: string | null) => void;
  setTestStyle: (style: string | null) => void;
  setHideUIElements: (hide: boolean) => void;
}

const TestModeContext = createContext<TestModeContextType | null>(null);

export const useTestMode = () => {
  const context = useContext(TestModeContext);
  if (!context) {
    throw new Error('useTestMode must be used within a TestModeProvider');
  }
  return context;
};

interface TestModeProviderProps {
  children: React.ReactNode;
}

export const TestModeProvider: React.FC<TestModeProviderProps> = ({ children }) => {
  const [isTestMode, setIsTestMode] = useState(false);
  const [testViewport, setTestViewport] = useState<string | null>(null);
  const [testStyle, setTestStyle] = useState<string | null>(null);
  const [hideUIElements, setHideUIElements] = useState(false);

  useEffect(() => {
    // Check if we're in test mode
    const urlParams = new URLSearchParams(window.location.search);
    const testParam = urlParams.get('test');
    const viewportParam = urlParams.get('testViewport');
    const styleParam = urlParams.get('testStyle');
    const hideParam = urlParams.get('hideUI');

    setIsTestMode(testParam === 'true');
    setTestViewport(viewportParam);
    setTestStyle(styleParam);
    setHideUIElements(hideParam === 'true');

    // Apply test mode styles
    if (testParam === 'true') {
      document.body.setAttribute('data-test-mode', 'true');
    }

    // Apply test viewport if specified
    if (viewportParam && window.__map) {
      const viewports: Record<string, any> = {
        dcDowntown: { center: [-77.0369, 38.9072], zoom: 15, pitch: 45, bearing: 0 },
        sanFrancisco: { center: [-122.4194, 37.7749], zoom: 12, pitch: 30, bearing: 0 },
        newYork: { center: [-74.0060, 40.7128], zoom: 13, pitch: 60, bearing: 0 },
        losAngeles: { center: [-118.2437, 34.0522], zoom: 11, pitch: 0, bearing: 0 }
      };

      const viewport = viewports[viewportParam];
      if (viewport) {
        window.__map.setCenter(viewport.center);
        window.__map.setZoom(viewport.zoom);
        if (viewport.pitch !== undefined) window.__map.setPitch(viewport.pitch);
        if (viewport.bearing !== undefined) window.__map.setBearing(viewport.bearing);
      }
    }

    // Apply test style if specified
    if (styleParam && window.__map) {
      const styles: Record<string, string> = {
        streets: 'mapbox://styles/mapbox/streets-v12',
        satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
        dark: 'mapbox://styles/mapbox/dark-v11',
        light: 'mapbox://styles/mapbox/light-v11'
      };

      const styleUrl = styles[styleParam];
      if (styleUrl) {
        window.__map.setStyle(styleUrl);
      }
    }
  }, []);

  const contextValue: TestModeContextType = {
    isTestMode,
    testViewport,
    testStyle,
    hideUIElements,
    setTestViewport,
    setTestStyle,
    setHideUIElements
  };

  return (
    <TestModeContext.Provider value={contextValue}>
      {children}
    </TestModeContext.Provider>
  );
};

// Test mode CSS injection
export const TestModeStyles: React.FC = () => {
  const { isTestMode, hideUIElements } = useTestMode();

  useEffect(() => {
    if (isTestMode) {
      const style = document.createElement('style');
      style.textContent = `
        /* Test mode styles */
        [data-test-mode="true"] {
          --test-mode: true;
        }
        
        /* Hide non-deterministic UI elements in test mode */
        ${hideUIElements ? `
          [data-testid="loading-spinner"],
          [data-testid="live-badge"],
          .loading-indicator,
          .live-indicator,
          .timestamp,
          .last-updated,
          .status-indicator,
          .connection-status {
            display: none !important;
          }
        ` : ''}
        
        /* Test mode map styles */
        [data-test-mode="true"] .mapboxgl-map {
          filter: contrast(1.1) saturate(0.9);
        }
        
        /* Ensure consistent font rendering */
        [data-test-mode="true"] * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        /* Test mode layer styles for visual regression */
        [data-test-mode="true"] .mapboxgl-map[data-test-style="solid"] .mapboxgl-canvas {
          filter: contrast(1.3) saturate(0.7);
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
    return undefined;
  }, [isTestMode, hideUIElements]);

  return null;
};

