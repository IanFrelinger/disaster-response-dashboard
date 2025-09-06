/**
 * Playwright integration for composed test commands
 */

import { test, expect } from '@playwright/test';
import { presetManager } from '../../src/testing/presets/presets';
import { TestContext } from '../../src/testing/commands/TestCommand';

// Test each preset
const presets = presetManager.listPresets();

for (const presetName of presets) {
  test.describe(`Preset: ${presetName}`, () => {
    test(`should run ${presetName} preset successfully`, async ({ page, context }) => {
      // Get preset
      const preset = presetManager.getPreset(presetName);
      expect(preset).toBeTruthy();

      // Set up test context
      const artifactsDir = `test-results/${presetName}`;
      const testContext: TestContext = {
        page,
        env: {
          stopOnFirstFailure: true,
          verbose: true
        },
        artifactsDir,
        baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
      };

      // Run preset
      const result = await preset!.run(testContext);

      // Verify results
      expect(result.ok).toBe(true);
      expect(result.name).toBe(presetName);
      expect(result.durationMs).toBeGreaterThan(0);
      expect(result.details).toBeTruthy();

      // Log results
      console.log(`\n📊 Preset ${presetName} Results:`);
      console.log(`Status: ${result.ok ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Duration: ${result.durationMs}ms`);
      console.log(`Details: ${result.details}`);
      
      if (result.artifacts && result.artifacts.length > 0) {
        console.log(`Artifacts: ${result.artifacts.join(', ')}`);
      }
    });
  });
}

// Test individual commands
test.describe('Individual Commands', () => {
  test('should run smoke test command', async ({ page }) => {
    const { SmokeTestCommand } = await import('../../src/testing/commands/SmokeTestCommand');
    const { LAYER_IDS } = await import('../../src/testing/commands/TestCommand');
    
    const command = new SmokeTestCommand({
      url: process.env.FRONTEND_URL || 'http://localhost:5173',
      layerIds: LAYER_IDS as string[]
    });

    const testContext: TestContext = {
      page,
      env: { verbose: true },
      artifactsDir: 'test-results/smoke-individual',
      baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
    };

    const result = await command.run(testContext);
    
    expect(result.ok).toBe(true);
    expect(result.name).toBe('SmokeTest');
    expect(result.durationMs).toBeGreaterThan(0);
  });

  test('should run performance budget command', async ({ page }) => {
    const { PerfBudgetCommand } = await import('../../src/testing/commands/PerfBudgetCommand');
    
    const command = new PerfBudgetCommand({
      maxMs: 5000 // More lenient for CI
    });

    const testContext: TestContext = {
      page,
      env: { verbose: true },
      artifactsDir: 'test-results/perf-individual',
      baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
    };

    const result = await command.run(testContext);
    
    expect(result.ok).toBe(true);
    expect(result.name).toBe('PerfBudget');
    expect(result.durationMs).toBeGreaterThan(0);
  });
});

// Test error handling
test.describe('Error Handling', () => {
  test('should handle invalid preset gracefully', async ({ page }) => {
    const invalidPreset = presetManager.getPreset('invalid-preset');
    expect(invalidPreset).toBeUndefined();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    const { RobustnessCommand } = await import('../../src/testing/commands/RobustnessCommand');
    
    const command = new RobustnessCommand({
      failureRate: 0.8, // High failure rate
      endpoints: ['**/tiles/**']
    });

    const testContext: TestContext = {
      page,
      env: { verbose: true },
      artifactsDir: 'test-results/robustness-error',
      baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
    };

    const result = await command.run(testContext);
    
    // Should still complete, but may not pass
    expect(result.name).toBe('Robustness');
    expect(result.durationMs).toBeGreaterThan(0);
  });
});

// Test preset information
test.describe('Preset Information', () => {
  test('should provide preset details', () => {
    for (const presetName of presets) {
      const info = presetManager.getPresetInfo(presetName);
      expect(info).toBeTruthy();
      expect(info!.name).toBe(presetName);
      expect(info!.commandCount).toBeGreaterThan(0);
      expect(info!.commands.length).toBeGreaterThan(0);
    }
  });

  test('should list all available presets', () => {
    const availablePresets = presetManager.listPresets();
    expect(availablePresets.length).toBeGreaterThan(0);
    expect(availablePresets).toContain('smoke-min');
    expect(availablePresets).toContain('map-core');
    expect(availablePresets).toContain('full-map');
  });
});
