import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/node';
import './testing/fault-injection';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// ENHANCED FAIL-FAST ERROR HANDLING
// Turn any client-side error into a test failure
let consoleErrors: string[] = [];
let consoleWarns: string[] = [];
let unhandledRejections: Error[] = [];

// Comprehensive patterns that should cause test failures (React render errors, warnings, etc.)
const patternsToFailOn = [
  // React key warnings
  /Each child .* unique "key"/i,
  /Warning: .*act\(\)/i,
  /validateDOMNesting/i,
  
  // DOM attribute warnings
  /Received .* for a non-boolean attribute/i,
  /Prop .* did not match/i,
  /Warning: .*Invalid DOM property/i,
  /Warning: .*React does not recognize the.*prop/i,
  
  // State management warnings
  /state update on an unmounted component/i,
  /Can't perform a React state update on an unmounted component/i,
  /Warning: .*setState.*called on unmounted component/i,
  /Warning: .*component is changing an uncontrolled input/i,
  /Warning: .*component is changing a controlled input/i,
  
  // Hydration warnings
  /Warning: .*hydration/i,
  /Warning: .*text content did not match/i,
  /Warning: .*expected server HTML to contain/i,
  
  // Render errors
  /Error: .*render/i,
  /Error: .*component.*error/i,
  /Error: .*React.*error/i,
  
  // Execution errors
  /Warning: .*Failed to execute.*on.*/i,
  
  // Style and CSS warnings
  /Warning: .*CSS.*invalid/i,
  /Warning: .*style.*failed/i,
  /Warning: .*font.*failed/i,
  /Warning: .*image.*failed/i,
  
  // Mapbox specific warnings
  /Warning: .*Mapbox.*error/i,
  /Warning: .*terrain.*failed/i,
  /Warning: .*layer.*failed/i,
  
  // Performance warnings
  /Warning: .*performance/i,
  /Warning: .*memory.*leak/i,
  /Warning: .*event.*listener.*leak/i
];

// Additional patterns for style regressions
const styleRegressionPatterns = [
  /Warning: .*CSS.*property.*invalid/i,
  /Warning: .*style.*not.*applied/i,
  /Warning: .*theme.*not.*found/i,
  /Warning: .*design.*token.*missing/i
];

beforeAll(() => {
  // Setup MSW server for tests
  server.listen({ onUnhandledRequest: 'error' });
  
  // Capture console errors and warnings
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    consoleErrors.push(message);
    
    // In test mode, also log to help with debugging
    if (process.env['NODE_ENV'] === 'test') {
      console.log(`[CONSOLE.ERROR] ${message}`);
    }
  });
  
  vi.spyOn(console, 'warn').mockImplementation((...args) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    consoleWarns.push(message);
    
    // FAIL-FAST: Throw immediately on known React render warning patterns
    if (patternsToFailOn.some(pattern => pattern.test(message))) {
      throw new Error(`React render warning detected: ${message}`);
    }
    
    // FAIL-FAST: Throw on style regression patterns
    if (styleRegressionPatterns.some(pattern => pattern.test(message))) {
      throw new Error(`Style regression detected: ${message}`);
    }
    
    if (process.env['NODE_ENV'] === 'test') {
      console.log(`[CONSOLE.WARN] ${message}`);
    }
  });
  
  // Capture unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    unhandledRejections.push(error);
    
    if (process.env['NODE_ENV'] === 'test') {
      console.log(`[UNHANDLED_REJECTION] ${error.message}`);
    }
  });
  
  // Capture uncaught exceptions
  process.on('uncaughtException', (error) => {
    unhandledRejections.push(error);
    
    if (process.env['NODE_ENV'] === 'test') {
      console.log(`[UNCAUGHT_EXCEPTION] ${error.message}`);
    }
  });
});

afterEach(() => {
  // Reset MSW handlers
  server.resetHandlers();
  
  // FAIL-FAST: Throw error if any console errors occurred (but allow expected errors in error testing)
  if (consoleErrors.length > 0) {
    // Check if this is an error testing scenario
    const isErrorTesting = consoleErrors.some(error => 
      error.includes('Environment configuration failed') ||
      error.includes('WebGL is not available') ||
      error.includes('HTTP 503 error') ||
      error.includes('Map style failed to load') ||
      error.includes('Simulated error for testing') ||
      error.includes('Error caught by boundary') ||
      error.includes('FAULT-INJECTION') || // Allow fault injection errors
      error.includes('Terrain query failed') || // Allow terrain error handling tests
      error.includes('Mapbox API error') // Allow expected Mapbox errors
    );
    
    if (!isErrorTesting) {
      const errorMessages = consoleErrors.join('\n');
      consoleErrors = []; // Reset for next test
      throw new Error(`Console errors during test:\n${errorMessages}`);
    }
    
    // For error testing, just log the expected errors
    if (process.env['NODE_ENV'] === 'test') {
      console.log(`[EXPECTED_ERROR] ${consoleErrors.join('; ')}`);
    }
  }
  
  // Reset console errors for next test
  consoleErrors = [];
  
  // FAIL-FAST: Check for any console warnings that might indicate render issues
  if (consoleWarns.length > 0) {
    // Allow some known warnings but fail on suspicious ones
    const suspiciousWarnings = consoleWarns.filter(warning => 
      !warning.includes('FAULT-INJECTION') && // Allow fault injection warnings
      !warning.includes('deprecated') && // Allow deprecation warnings
      !warning.includes('experimental') && // Allow experimental feature warnings
      !warning.includes('Failed to query terrain elevation') && // Allow terrain error handling tests
      !warning.includes('Terrain query failed') && // Allow terrain error handling tests
      !warning.includes('Using fallback environment configuration') && // Allow environment fallback tests
      !warning.includes('Mapbox deprecation') && // Allow Mapbox deprecation warnings
      !warning.includes('Performance warning') // Allow performance warnings
    );
    
    if (suspiciousWarnings.length > 0) {
      const warningMessages = suspiciousWarnings.join('\n');
      consoleWarns = []; // Reset for next test
      throw new Error(`Suspicious console warnings detected:\n${warningMessages}`);
    }
  }
  
  // Reset console warnings for next test
  consoleWarns = [];
  
  // FAIL-FAST: Throw error if any unhandled rejections occurred
  if (unhandledRejections.length > 0) {
    const rejectionMessages = unhandledRejections.map(e => e.message).join('\n');
    unhandledRejections = []; // Reset for next test
    throw new Error(`Unhandled rejections during test:\n${rejectionMessages}`);
  }
  
  // Reset fault injection state
  if (typeof window !== 'undefined' && window.__testFaults__) {
    window.__testFaults__.reset();
  }
});

afterAll(() => {
  server.close();
  
  // Restore console methods
  vi.restoreAllMocks();
  
  // Remove event listeners
  process.removeAllListeners('unhandledRejection');
  process.removeAllListeners('uncaughtException');
});

// Global test utilities for fault injection
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveFault: (expectedFault: any) => R;
      toHaveNoFaults: () => R;
    }
  }
}

// Custom matchers for fault injection testing
// Note: These are commented out as they cause TypeScript compilation issues
// Uncomment when needed for specific test scenarios
/*
expect.extend({
  toHaveFault(received: any, expectedFault: any) {
    if (typeof window === 'undefined' || !window.__testFaults__) {
      return {
        message: () => 'Fault injection not available in this environment',
        pass: false,
      };
    }
    
    const activeFaults = window.__testFaults__.getActiveFaults();
    const hasFault = activeFaults.some(({ fault }) => 
      fault.kind === expectedFault.kind && 
      (expectedFault.status ? fault.status === expectedFault.status : true)
    );
    
    return {
      message: () => 
        `Expected fault injection to have fault ${JSON.stringify(expectedFault)}, but got ${JSON.stringify(activeFaults)}`,
      pass: hasFault,
    };
  },
  
  toHaveNoFaults(received: any) {
    if (typeof window === 'undefined' || !window.__testFaults__) {
      return {
        message: () => 'Fault injection not available in this environment',
        pass: false,
      };
    }
    
    const activeFaults = window.__testFaults__.getActiveFaults();
    const hasNoFaults = activeFaults.length === 0;
    return {
      message: () => 
        `Expected no fault injections, but got ${JSON.stringify(activeFaults)}`,
      pass: hasNoFaults,
    };
  },
});
*/
