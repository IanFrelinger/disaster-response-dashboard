import { defineConfig, devices } from '@playwright/test';

/**
 * PLAYWRIGHT HEADLESS MODE CONFIGURATION
 * 
 * This configuration runs tests in headless mode for CI/CD and automated testing.
 * It validates that all layer functionality works without a visible browser window.
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['list'], // Terminal-friendly list reporter
    ['json', { outputFile: 'test-results/headless/results.json' }],
    ['junit', { outputFile: 'test-results/headless/results.xml' }],
    ['html', { outputFolder: 'test-results/headless', open: 'never' }], // HTML without auto-opening
    ['line'] // Rich terminal output with progress
  ],
  
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:3001',
    
    // Headless mode settings
    headless: true,
    
    // Screenshot settings for debugging headless issues
    screenshot: 'only-on-failure',
    
    // Video recording for debugging
    video: 'retain-on-failure',
    
    // Trace for debugging headless issues
    trace: 'retain-on-failure',
    
    // Viewport settings for consistent headless testing
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors (for local development)
    ignoreHTTPSErrors: true,
    
    // Timeout settings for headless mode
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Headless Chrome for primary testing
    {
      name: 'chromium-headless',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      },
    },
    
    // Headless Firefox for cross-browser validation
    {
      name: 'firefox-headless',
      use: { 
        ...devices['Desktop Firefox'],
        headless: true,
      },
    },
    
    // Headless Safari for macOS compatibility
    {
      name: 'webkit-headless',
      use: { 
        ...devices['Desktop Safari'],
        headless: true,
      },
    },
  ],

  // Global setup and teardown for headless mode
  globalSetup: './tests/e2e/headless-setup.ts',
  globalTeardown: './tests/e2e/headless-teardown.ts',
  
  // Output directory for headless test artifacts
  outputDir: 'test-results/headless',
  
  // Timeout settings
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  
  // Reporters for different environments
  reporter: process.env.CI ? [
    ['dot'],
    ['list'], // Terminal-friendly list reporter
    ['line'], // Rich terminal output with progress
    ['html', { outputFolder: 'test-results/headless', open: 'never' }],
    ['junit', { outputFile: 'test-results/headless/results.xml' }]
  ] : [
    ['list'], // Terminal-friendly list reporter
    ['line'], // Rich terminal output with progress
    ['html', { outputFolder: 'test-results/headless', open: 'never' }],
    ['json', { outputFile: 'test-results/headless/results.json' }]
  ],
});
