import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/features/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}'
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/dist/**'
      ]
    },
    // Component-specific test patterns
    include: [
      'src/components/**/*.test.{ts,tsx}',
      'src/features/**/*.test.{ts,tsx}',
      'src/hooks/**/*.test.{ts,tsx}',
      'src/components/**/__tests__/**/*.test.{ts,tsx}',
      'src/features/**/__tests__/**/*.test.{ts,tsx}'
    ],
    // Exclude unit and E2E tests
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/**/*.spec.ts',
      'tests/**/*.spec.tsx',
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'playwright.config.ts',
      'src/testing/**/*.test.{ts,tsx}'
    ],
    // Component test specific settings
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously'
      }
    },
    // Mock setup for component tests
    setupFilesAfterEnv: ['./src/test-setup-component.ts'],
    // Test timeout for component rendering
    testTimeout: 10000,
    // Hook timeout for component setup
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Component test specific environment variables
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.VITEST': 'true'
  }
});

