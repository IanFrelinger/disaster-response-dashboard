import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testing/setup.ts'],
    include: [
      'src/testing/tests/map-validation.test.tsx',
      'src/testing/tests/map-performance.test.tsx',
      'src/testing/tests/data-layer-validation.test.tsx',
      'src/testing/tests/user-story-data-layers.test.tsx',
      'src/testing/tests/debug-data-flow.test.tsx',
      'src/testing/tests/data-layer-integration.test.tsx',
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '**/*.config.*',
      '**/*.d.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        'build',
        'coverage',
        '**/*.config.*',
        '**/*.d.ts',
        '**/*.test.*',
        '**/*.spec.*',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
