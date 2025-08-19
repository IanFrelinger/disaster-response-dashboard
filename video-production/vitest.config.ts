import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules',
      'out',
      'output',
      'dist',
      'coverage',
      'scripts/**/*.cjs',
      'scripts/**/*.js',
      'scripts/**/*.sh'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        // Core functionality - focus on these key files
        'scripts/enhanced-production-pipeline-with-validation.ts',
        'scripts/enhanced-humanizer-bot.ts',
        'scripts/enhanced-critic-bot.ts',
        'scripts/enhanced-frontend-captures-with-validation.ts',
        'scripts/intelligent-quality-agent.ts',
        'scripts/shared-types.ts'
      ],
      exclude: [
        'node_modules/',
        'out/',
        'output/',
        'coverage/',
        'tests/',
        'scripts/**/*.d.ts',
        'scripts/**/*.cjs',
        'scripts/**/*.js',
        'scripts/**/*.sh',
        // Exclude utility and test files
        'scripts/test-*.ts',
        'scripts/*-test.ts',
        'scripts/smoke-*.ts',
        'scripts/run-*.ts',
        'scripts/generate-*.ts',
        'scripts/assemble-*.ts',
        'scripts/export-*.ts',
        'scripts/verify-*.ts',
        'scripts/execute-*.ts',
        'scripts/capture-*.ts',
        'scripts/graphics-*.ts',
        'scripts/ui-element-discovery.ts',
        'scripts/video-marketing-*.ts',
        'scripts/humanizer-bot.ts'
      ],
      thresholds: {
        global: {
          // More realistic thresholds for core functionality
          branches: 70,
          functions: 75,
          lines: 70,
          statements: 70
        }
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './scripts')
    }
  }
})
