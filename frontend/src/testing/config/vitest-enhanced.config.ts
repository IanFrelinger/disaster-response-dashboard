/**
 * Enhanced Vitest configuration for comprehensive testing
 * Includes mocks, fixtures, and edge case coverage
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/testing/setup.ts',
      './src/testing/config/test-setup-enhanced.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}',
        '!src/testing/**/*'
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.config.{js,ts}',
        '**/vite.config.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // Test patterns
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/__tests__/**/*.test.ts',
      'src/**/__tests__/**/*.test.tsx',
      'src/testing/tests/**/*.test.ts',
      'src/testing/tests/**/*.test.tsx'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      'src/testing/browser-tests/**/*',
      'playwright.config.ts'
    ],
    // Test execution settings
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    // Retry configuration
    retry: 2,
    // Reporter configuration
    reporters: [
      'verbose',
      'json',
      'html'
    ],
    // Output configuration
    outputFile: {
      json: './test-results/vitest-results.json',
      html: './test-results/vitest-report.html'
    },
    // Environment variables
    env: {
      NODE_ENV: 'test',
      VITE_MAPBOX_TOKEN: 'pk.test-token',
      VITE_MAPBOX_STYLE_URL: 'mapbox://styles/mapbox/streets-v11',
      VITE_API_BASE_URL: 'http://localhost:8000/api'
    },
    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@testing': path.resolve(__dirname, './src/testing'),
      '@mocks': path.resolve(__dirname, './src/testing/mocks'),
      '@fixtures': path.resolve(__dirname, './src/testing/fixtures')
    }
  },
  // Define global types
  define: {
    'import.meta.vitest': 'undefined'
  }
});

