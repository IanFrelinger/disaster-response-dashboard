import { defineConfig, devices } from '@playwright/test';

/**
 * PLAYWRIGHT TERMINAL-ONLY CONFIGURATION
 * 
 * This configuration runs tests with terminal-only output - no HTML reports,
 * no browser opening, perfect for CI/CD and terminal-only environments.
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['list'], // Terminal-friendly list reporter
    ['line'], // Rich terminal output with progress
    ['json', { outputFile: 'test-results/terminal/results.json' }], // JSON output
    ['junit', { outputFile: 'test-results/terminal/results.xml' }], // JUnit XML for CI
    ['dot'] // Minimal dot reporter for CI
  ],
  
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:3001',
    
    // Headless mode settings
    headless: true,
    
    // Screenshot settings for debugging
    screenshot: 'only-on-failure',
    
    // Video recording for debugging
    video: 'retain-on-failure',
    
    // Trace for debugging
    trace: 'retain-on-failure',
    
    // Viewport settings for consistent testing
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors (for local development)
    ignoreHTTPSErrors: true,
    
    // Timeout settings
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Terminal-optimized Chrome
    {
      name: 'chromium-terminal',
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
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      },
    },
    
    // Terminal-optimized Firefox
    {
      name: 'firefox-terminal',
      use: { 
        ...devices['Desktop Firefox'],
        headless: true,
      },
    },
    
    // Terminal-optimized Safari
    {
      name: 'webkit-terminal',
      use: { 
        ...devices['Desktop Safari'],
        headless: true,
      },
    },
  ],

  // Global setup and teardown
  globalSetup: './tests/e2e/headless-setup.ts',
  globalTeardown: './tests/e2e/headless-teardown.ts',
  
  // Output directory for terminal test artifacts
  outputDir: 'test-results/terminal',
  
  // Timeout settings
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  
  // Terminal-optimized settings
  use: {
    // Disable any browser opening
    launchOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security'
      ]
    }
  }
});
