import { test as base, expect } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';

// Enhanced console fail hooks for Playwright
const consoleFailPatterns = [
  // React render warnings
  /Each child .* unique "key"/i,
  /Warning: .*act\(\)/i,
  /validateDOMNesting/i,
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
  
  // Style and CSS warnings
  /Warning: .*CSS.*invalid/i,
  /Warning: .*style.*failed/i,
  /Warning: .*font.*failed/i,
  /Warning: .*image.*failed/i,
  /Warning: .*CSS.*property.*invalid/i,
  /Warning: .*style.*not.*applied/i,
  /Warning: .*theme.*not.*found/i,
  /Warning: .*design.*token.*missing/i,
  
  // Mapbox specific warnings
  /Warning: .*Mapbox.*error/i,
  /Warning: .*terrain.*failed/i,
  /Warning: .*layer.*failed/i,
  
  // Performance warnings
  /Warning: .*performance/i,
  /Warning: .*memory.*leak/i,
  /Warning: .*event.*listener.*leak/i
];

// Custom test fixture with console monitoring and timeout handling
export const test = base.extend({
  page: async ({ page }, use) => {
    // Set up console monitoring
    const consoleErrors: string[] = [];
    const consoleWarns: string[] = [];
    
    // Set up timeout for page operations
    page.setDefaultTimeout(15000); // 15 seconds default timeout
    page.setDefaultNavigationTimeout(20000); // 20 seconds for navigation
    
    page.on('console', (msg) => {
      const message = msg.text();
      
      if (msg.type() === 'error') {
        consoleErrors.push(message);
        console.log(`[CONSOLE.ERROR] ${message}`);
      }
      
      if (msg.type() === 'warning') {
        consoleWarns.push(message);
        
        // FAIL-FAST: Throw on known render warning patterns
        if (consoleFailPatterns.some(pattern => pattern.test(message))) {
          throw new Error(`Console warning detected during test: ${message}`);
        }
        
        console.log(`[CONSOLE.WARN] ${message}`);
      }
    });
    
    // Set up page error monitoring with timeout
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
      console.log(`[PAGE_ERROR] ${error.message}`);
    });
    
    // Set up request failure monitoring with timeout
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure) {
        consoleErrors.push(`Request failed: ${request.url()} - ${failure.errorText}`);
        console.log(`[REQUEST_FAILED] ${request.url()} - ${failure.errorText}`);
      }
    });
    
    // Set up timeout for page load
    page.on('load', () => {
      console.log('[PAGE_LOADED] Page load event fired');
    });
    
    // Set up timeout for DOM content loaded
    page.on('domcontentloaded', () => {
      console.log('[DOM_LOADED] DOM content loaded');
    });
    
    await use(page);
    
    // After test, check for console errors
    if (consoleErrors.length > 0) {
      // Allow some expected errors but fail on unexpected ones
      const unexpectedErrors = consoleErrors.filter(error => 
        !error.includes('Environment configuration failed') &&
        !error.includes('WebGL is not available') &&
        !error.includes('HTTP 503 error') &&
        !error.includes('Map style failed to load') &&
        !error.includes('Simulated error for testing') &&
        !error.includes('Error caught by boundary') &&
        !error.includes('FAULT-INJECTION') &&
        !error.includes('Terrain query failed') &&
        !error.includes('Mapbox API error')
      );
      
      if (unexpectedErrors.length > 0) {
        throw new Error(`Unexpected console errors during test:\n${unexpectedErrors.join('\n')}`);
      }
    }
  },
});

export { expect };

// Browser launch options for better stability
export const chromiumOptions = {
  launchOptions: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  }
};

export const firefoxOptions = {
  launchOptions: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  }
};

export const webkitOptions = {
  launchOptions: {
    args: [
      '--no-sandbox'
    ]
  }
};

// Utility functions for testing with better timeout handling
export const waitForMapLoad = async (page: any, timeout = 15000) => {
  try {
    await page.waitForSelector('[data-testid="map-container"]', { timeout });
    await page.waitForFunction(() => {
      return window.__mapTestApi__ && window.__mapTestApi__.isLoaded();
    }, { timeout });
  } catch (error) {
    console.log(`[TIMEOUT] Map load timeout after ${timeout}ms: ${error}`);
    throw new Error(`Map failed to load within ${timeout}ms: ${error}`);
  }
};

export const waitForTerrainLoad = async (page: any, timeout = 10000) => {
  try {
    await page.waitForFunction(() => {
      return window.__mapTestApi__ && window.__mapTestApi__.hasTerrain();
    }, { timeout });
  } catch (error) {
    console.log(`[TIMEOUT] Terrain load timeout after ${timeout}ms: ${error}`);
    throw new Error(`Terrain failed to load within ${timeout}ms: ${error}`);
  }
};

export const waitForLayerVisibility = async (page: any, layerId: string, timeout = 10000) => {
  try {
    await page.waitForFunction((id: string) => {
      return window.__mapTestApi__ && window.__mapTestApi__.isVisible(id);
    }, layerId, { timeout });
  } catch (error) {
    console.log(`[TIMEOUT] Layer visibility timeout after ${timeout}ms: ${error}`);
    throw new Error(`Layer ${layerId} failed to become visible within ${timeout}ms: ${error}`);
  }
};

// New utility for safe element waiting with fallback
export const waitForElementSafely = async (page: any, selector: string, timeout = 10000, fallback?: () => Promise<void>) => {
  try {
    await page.waitForSelector(selector, { timeout });
  } catch (error) {
    console.log(`[TIMEOUT] Element ${selector} not found after ${timeout}ms: ${error}`);
    
    if (fallback) {
      console.log(`[FALLBACK] Executing fallback for ${selector}`);
      await fallback();
    } else {
      throw new Error(`Element ${selector} not found within ${timeout}ms: ${error}`);
    }
  }
};

// Accessibility testing utilities
export const runA11yCheck = async (page: any, context?: string) => {
  // Basic accessibility checks
  const violations = await page.evaluate(() => {
    const issues = [];
    
    // Check for missing alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image ${index} missing alt text or aria-label`);
      }
    });
    
    // Check for proper heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => ({ level: parseInt(h.tagName[1]), text: h.textContent?.trim() || '' }))
      .sort((a, b) => a.level - b.level);
    
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      if (heading.level > lastLevel + 1) {
        issues.push(`Heading hierarchy skip: ${lastLevel} -> ${heading.level} at "${heading.text}"`);
      }
      lastLevel = heading.level;
    });
    
    // Check for proper form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      
      if (!label && !ariaLabel && !input.getAttribute('aria-labelledby')) {
        issues.push(`Form control ${index} missing label or aria-label`);
      }
    });
    
    return issues;
  });
  
  if (violations.length > 0) {
    const contextStr = context ? ` in ${context}` : '';
    throw new Error(`Accessibility violations detected${contextStr}:\n${violations.join('\n')}`);
  }
};

// Performance testing utilities
export const measurePerformance = async (page: any, metric: string) => {
  const result = await page.evaluate((metricName: string) => {
    return new Promise((resolve) => {
      if (metricName === 'first-paint') {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            resolve(entries[0].startTime);
          }
        }).observe({ entryTypes: ['paint'] });
      } else if (metricName === 'time-to-interactive') {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            resolve(entries[0].startTime);
          }
        }).observe({ entryTypes: ['measure'] });
      }
      
      // Fallback timeout
      setTimeout(() => resolve(null), 10000);
    });
  }, metric);
  
  return result;
};

// Browser options available for configuration

