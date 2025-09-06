import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Global timeout settings
  timeout: 30000, // 30 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for expect assertions
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['html', { outputDir: 'test-results/html-report' }]
  ],
  // Global action timeout
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Action timeouts
    actionTimeout: 15000, // 15 seconds for clicks, fills, etc.
    navigationTimeout: 20000, // 20 seconds for navigation
    // Element timeout
    locatorTimeout: 10000, // 10 seconds to find elements
    // Visual regression settings
    expect: {
      toHaveScreenshot: {
        threshold: 0.2,
        mode: 'percent',
        animations: 'disabled'
      }
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
