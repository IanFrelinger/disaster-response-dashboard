/**
 * VISUAL REGRESSION TESTING CONFIGURATION
 * 
 * This configuration sets up visual regression testing for the modular layer system.
 * It captures baseline screenshots and compares them against new implementations
 * to catch unexpected visual shifts early.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual-regression',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:3001',
    
    // Screenshot settings for visual regression
    screenshot: 'on',
    
    // Video recording for debugging
    video: 'retain-on-failure',
    
    // Trace for debugging
    trace: 'retain-on-failure',
  },

  projects: [
    // Desktop Chrome for baseline screenshots
    {
      name: 'chromium-baseline',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    // Mobile viewport for responsive testing
    {
      name: 'chromium-mobile',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  
  // Output directory for visual regression artifacts
  outputDir: 'test-results/visual-regression',
  
  // Screenshot comparison settings
  expect: {
    // Threshold for pixel differences (0.1 = 10% tolerance)
    toHaveScreenshot: { threshold: 0.1 },
    
    // Threshold for color differences
    toMatchSnapshot: { threshold: 0.1 },
  },
});

/**
 * GLOBAL SETUP
 * Ensures the dev server is running and captures initial baseline screenshots
 */
export async function globalSetup() {
  // Check if dev server is running
  const response = await fetch('http://localhost:3001');
  if (!response.ok) {
    throw new Error('Dev server not running on port 3001');
  }
  
  console.log('✅ Dev server ready for visual regression testing');
}

/**
 * GLOBAL TEARDOWN
 * Cleanup after visual regression tests
 */
export async function globalTeardown() {
  console.log('🧹 Visual regression testing complete');
}
