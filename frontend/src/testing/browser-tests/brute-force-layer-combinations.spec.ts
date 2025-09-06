import { test, expect, Page } from '@playwright/test';

/**
 * Brute Force Layer Combination Testing
 * Tests all possible combinations of layer states and properties
 */

interface LayerState {
  name: string;
  enabled: boolean;
  properties: Record<string, any>;
}

interface TestResult {
  combination: LayerState[];
  success: boolean;
  renderTime: number;
  memoryUsage: number;
  errors: string[];
  warnings: string[];
}

class LayerCombinationGenerator {
  private layers = [
    { name: 'terrain', properties: { exaggeration: [0.5, 1.0, 1.5, 2.0], addSky: [true, false] } },
    { name: 'buildings', properties: { opacity: [0.1, 0.5, 0.8, 1.0], height: [0.5, 1.0, 1.5, 2.0] } },
    { name: 'hazards', properties: { radius: [5, 10, 20, 50], color: ['#ff0000', '#ff8800', '#ffff00'] } },
    { name: 'units', properties: { size: [10, 20, 30, 40], color: ['#00ff00', '#0088ff', '#ff8800'] } },
    { name: 'routes', properties: { width: [2, 4, 6, 8], color: ['#ff0000', '#00ff00', '#0000ff'] } }
  ];

  generateAllCombinations(): LayerState[][] {
    const combinations: LayerState[][] = [];
    
    // Generate all possible enabled/disabled combinations (2^5 = 32 combinations)
    for (let i = 0; i < 32; i++) {
      const combination: LayerState[] = [];
      
      for (let j = 0; j < this.layers.length; j++) {
        const layer = this.layers[j];
        if (layer) {
          const enabled = (i & (1 << j)) !== 0;
          
          // For each enabled layer, generate property combinations
          if (enabled) {
            const filteredProperties = Object.fromEntries(
              Object.entries(layer.properties).filter(([_, value]) => value !== undefined)
            ) as Record<string, any[]>;
            const propertyCombinations = this.generatePropertyCombinations(filteredProperties);
            for (const props of propertyCombinations) {
              combination.push({
                name: layer.name,
                enabled: true,
                properties: props
              });
            }
          } else {
            combination.push({
              name: layer.name,
              enabled: false,
              properties: {}
            });
          }
        }
      }
      
      combinations.push(combination);
    }
    
    return combinations;
  }

  private generatePropertyCombinations(properties: Record<string, any[]>): Record<string, any>[] {
    const keys = Object.keys(properties);
    const combinations: Record<string, any>[] = [];

    function generate(index: number, current: Record<string, any>) {
      if (index === keys.length) {
        combinations.push({ ...current });
        return;
      }

      const key = keys[index];
      if (key) {
        const values = properties[key];
        
        if (values) {
          for (const value of values) {
            current[key] = value;
            generate(index + 1, current);
          }
        }
      }
    }

    generate(0, {});
    return combinations;
  }
}

class PerformanceTracker {
  private results: TestResult[] = [];
  private startTime: number = 0;

  startTest() {
    this.startTime = performance.now();
  }

  endTest(combination: LayerState[], success: boolean, errors: string[], warnings: string[]): TestResult {
    const endTime = performance.now();
    const renderTime = endTime - this.startTime;
    
    const result: TestResult = {
      combination,
      success,
      renderTime,
      memoryUsage: this.getMemoryUsage(),
      errors,
      warnings
    };
    
    this.results.push(result);
    return result;
  }

  private getMemoryUsage(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    
    const avgRenderTime = this.results.reduce((sum, r) => sum + r.renderTime, 0) / total;
    const maxRenderTime = Math.max(...this.results.map(r => r.renderTime));
    const minRenderTime = Math.min(...this.results.map(r => r.renderTime));
    
    const avgMemoryUsage = this.results.reduce((sum, r) => sum + r.memoryUsage, 0) / total;
    const maxMemoryUsage = Math.max(...this.results.map(r => r.memoryUsage));
    
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = this.results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      avgRenderTime,
      maxRenderTime,
      minRenderTime,
      avgMemoryUsage,
      maxMemoryUsage,
      totalErrors,
      totalWarnings
    };
  }
}

test.describe('Brute Force Layer Combinations', () => {
  let performanceTracker: PerformanceTracker;
  let combinationGenerator: LayerCombinationGenerator;

  test.beforeEach(async ({ page }) => {
    performanceTracker = new PerformanceTracker();
    combinationGenerator = new LayerCombinationGenerator();
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(5000);
    
    // Wait for the map API to be available
    await page.waitForFunction(() => {
      const api = (window as any).__mapTestApi3D__;
      return api && api.validateLayers && api.getMapInstance;
    }, { timeout: 10000 });
    
    // Wait for initial validation to complete
    await page.waitForFunction(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) return false;
      try {
        const results = api.validateLayers();
        return results && Object.keys(results).length > 0;
      } catch {
        return false;
      }
    }, { timeout: 10000 });
  });

  test('test all layer enabled/disabled combinations', async ({ page }) => {
    console.log('🔥 Starting brute force layer combination testing...');
    
    const combinations = combinationGenerator.generateAllCombinations();
    console.log(`📊 Generated ${combinations.length} layer combinations`);
    
    for (let i = 0; i < combinations.length; i++) {
      const combination = combinations[i];
      if (combination) {
        console.log(`\n🧪 Test ${i + 1}/${combinations.length}: ${combination.map(l => `${l.name}:${l.enabled}`).join(', ')}`);
        
        performanceTracker.startTest();
        
        try {
          // Apply the combination
          await applyLayerCombination(page, combination);
        
        // Wait for render
        await page.waitForTimeout(1000);
        
        // Validate the combination
        const validationResult = await validateLayerCombination(page, combination);
        
        // Check for console errors and warnings
        const consoleIssues = await page.evaluate(() => {
          return {
            errors: (window as any).__consoleErrors || [],
            warnings: (window as any).__consoleWarnings || []
          };
        });
        
        const result = performanceTracker.endTest(
          combination,
          validationResult.success,
          [...validationResult.errors, ...consoleIssues.errors],
          consoleIssues.warnings
        );
        
        if (result.success) {
          console.log(`✅ Passed (${result.renderTime.toFixed(2)}ms, ${result.memoryUsage.toFixed(2)}MB)`);
        } else {
          console.log(`❌ Failed: ${result.errors.join(', ')}`);
        }
        
      } catch (error: any) {
        const result = performanceTracker.endTest(
          combination,
          false,
          [`Exception: ${error instanceof Error ? error.message : String(error)}`],
          []
        );
        console.log(`💥 Exception: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    // Print summary
    const summary = performanceTracker.getSummary();
    console.log(`\n📊 Brute Force Layer Combination Testing Summary:`);
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
    console.log(`Average Render Time: ${summary.avgRenderTime.toFixed(2)}ms`);
    console.log(`Max Render Time: ${summary.maxRenderTime.toFixed(2)}ms`);
    console.log(`Average Memory Usage: ${summary.avgMemoryUsage.toFixed(2)}MB`);
    console.log(`Max Memory Usage: ${summary.maxMemoryUsage.toFixed(2)}MB`);
    console.log(`Total Errors: ${summary.totalErrors}`);
    console.log(`Total Warnings: ${summary.totalWarnings}`);
    
    // Performance assertions
    expect(summary.avgRenderTime).toBeLessThan(1000); // Average render time < 1s
    expect(summary.maxRenderTime).toBeLessThan(5000); // Max render time < 5s
    expect(summary.avgMemoryUsage).toBeLessThan(100); // Average memory < 100MB
    expect(summary.maxMemoryUsage).toBeLessThan(200); // Max memory < 200MB
    
    // Success rate assertion
    expect(summary.successRate).toBeGreaterThan(95); // 95% success rate
  });

  test('test extreme layer property combinations', async ({ page }) => {
    console.log('🔥 Testing extreme layer property combinations...');
    
    const extremeCombinations = [
      // All layers enabled with extreme values
      [
        { name: 'terrain', enabled: true, properties: { exaggeration: 5.0, addSky: true } },
        { name: 'buildings', enabled: true, properties: { opacity: 0.01, height: 5.0 } },
        { name: 'hazards', enabled: true, properties: { radius: 200, color: '#ff0000' } },
        { name: 'units', enabled: true, properties: { size: 100, color: '#00ff00' } },
        { name: 'routes', enabled: true, properties: { width: 20, color: '#0000ff' } }
      ],
      // All layers disabled
      [
        { name: 'terrain', enabled: false, properties: {} },
        { name: 'buildings', enabled: false, properties: {} },
        { name: 'hazards', enabled: false, properties: {} },
        { name: 'units', enabled: false, properties: {} },
        { name: 'routes', enabled: false, properties: {} }
      ],
      // Mixed extreme values
      [
        { name: 'terrain', enabled: true, properties: { exaggeration: 0.1, addSky: false } },
        { name: 'buildings', enabled: false, properties: {} },
        { name: 'hazards', enabled: true, properties: { radius: 1, color: '#ffffff' } },
        { name: 'units', enabled: true, properties: { size: 1, color: '#000000' } },
        { name: 'routes', enabled: false, properties: {} }
      ]
    ];
    
    for (let i = 0; i < extremeCombinations.length; i++) {
      const combination = extremeCombinations[i];
      if (combination) {
        console.log(`\n🧪 Extreme Test ${i + 1}/${extremeCombinations.length}: ${combination.map(l => `${l.name}:${l.enabled}`).join(', ')}`);
        
        performanceTracker.startTest();
        
        try {
          // Apply the combination
          await applyLayerCombination(page, combination);
        
        // Wait for render
        await page.waitForTimeout(2000);
        
        // Validate the combination
        const validationResult = await validateLayerCombination(page, combination);
        
        // Check for console errors and warnings
        const consoleIssues = await page.evaluate(() => {
          return {
            errors: (window as any).__consoleErrors || [],
            warnings: (window as any).__consoleWarnings || []
          };
        });
        
        const result = performanceTracker.endTest(
          combination,
          validationResult.success,
          [...validationResult.errors, ...consoleIssues.errors],
          consoleIssues.warnings
        );
        
        if (result.success) {
          console.log(`✅ Passed (${result.renderTime.toFixed(2)}ms, ${result.memoryUsage.toFixed(2)}MB)`);
        } else {
          console.log(`❌ Failed: ${result.errors.join(', ')}`);
        }
        
      } catch (error: any) {
        const result = performanceTracker.endTest(
          combination,
          false,
          [`Exception: ${error instanceof Error ? error.message : String(error)}`],
          []
        );
        console.log(`💥 Exception: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    // Print summary
    const summary = performanceTracker.getSummary();
    console.log(`\n📊 Extreme Layer Property Testing Summary:`);
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
    
    // Assertions
    expect(summary.successRate).toBeGreaterThan(90); // 90% success rate for extreme cases
  });

  test('test rapid layer state changes', async ({ page }) => {
    console.log('🔥 Testing rapid layer state changes...');
    
    const rapidChangeSequences = [
      // Rapid toggle on/off
      ['terrain', 'buildings', 'hazards', 'units', 'routes'],
      // Rapid property changes
      ['terrain', 'terrain', 'terrain', 'terrain', 'terrain'],
      // Mixed rapid changes
      ['terrain', 'buildings', 'terrain', 'hazards', 'buildings']
    ];
    
    for (let i = 0; i < rapidChangeSequences.length; i++) {
      const sequence = rapidChangeSequences[i];
      if (sequence) {
        console.log(`\n🧪 Rapid Change Test ${i + 1}/${rapidChangeSequences.length}: ${sequence.join(' -> ')}`);
        
        performanceTracker.startTest();
        
        try {
          // Apply rapid changes
          for (const layerName of sequence) {
          await applyRapidLayerChange(page, layerName);
          await page.waitForTimeout(100); // Very short delay
        }
        
        // Wait for stabilization
        await page.waitForTimeout(1000);
        
        // Validate final state
        const validationResult = await validateRapidChanges(page, sequence);
        
        // Check for console errors and warnings
        const consoleIssues = await page.evaluate(() => {
          return {
            errors: (window as any).__consoleErrors || [],
            warnings: (window as any).__consoleWarnings || []
          };
        });
        
        const result = performanceTracker.endTest(
          [{ name: 'rapid_changes', enabled: true, properties: { sequence } }],
          validationResult.success,
          [...validationResult.errors, ...consoleIssues.errors],
          consoleIssues.warnings
        );
        
        if (result.success) {
          console.log(`✅ Passed (${result.renderTime.toFixed(2)}ms, ${result.memoryUsage.toFixed(2)}MB)`);
        } else {
          console.log(`❌ Failed: ${result.errors.join(', ')}`);
        }
        
      } catch (error: any) {
        const result = performanceTracker.endTest(
          [{ name: 'rapid_changes', enabled: true, properties: { sequence } }],
          false,
          [`Exception: ${error instanceof Error ? error.message : String(error)}`],
          []
        );
        console.log(`💥 Exception: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    // Print summary
    const summary = performanceTracker.getSummary();
    console.log(`\n📊 Rapid Layer State Change Testing Summary:`);
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
    
    // Assertions
    expect(summary.successRate).toBeGreaterThan(90); // 90% success rate for rapid changes
  });
});

// Helper functions
async function applyLayerCombination(page: Page, combination: LayerState[]) {
  for (const layer of combination) {
    // Find the layer toggle
    const toggles = page.locator('input[type="checkbox"]');
    const toggleCount = await toggles.count();
    
    let targetToggle = null;
    for (let i = 0; i < toggleCount; i++) {
      const toggle = toggles.nth(i);
      const label = await toggle.locator('..').textContent();
      if (label && label.toLowerCase().includes(layer.name.toLowerCase())) {
        targetToggle = toggle;
        break;
      }
    }
    
    if (targetToggle) {
      // Apply enabled state
      if (layer.enabled) {
        await targetToggle.check();
      } else {
        await targetToggle.uncheck();
      }
    }
    
    // Apply properties via API if available
    await page.evaluate(({ layerName, properties }) => {
      const api = (window as any).__mapTestApi3D__;
      if (api && api.updateLayerProps) {
        api.updateLayerProps(layerName, properties);
      }
    }, { layerName: layer.name, properties: layer.properties });
  }
}

async function validateLayerCombination(page: Page, combination: LayerState[]) {
  const result = await page.evaluate((combination) => {
    const api = (window as any).__mapTestApi3D__;
    if (!api || !api.validateLayers) {
      return { success: false, errors: ['API not available'] };
    }
    
    try {
      const results = api.validateLayers();
      const errors: string[] = [];
      
      // If no results at all, that's an error
      if (!results || Object.keys(results).length === 0) {
        return { success: false, errors: ['No validation results available'] };
      }
      
      for (const layer of combination) {
        const layerResult = results[layer.name];
        
        if (!layerResult) {
          // For disabled layers, this might be expected
          if (!layer.enabled) {
            continue; // Skip validation for disabled layers
          }
          errors.push(`Layer ${layer.name} result not found`);
          continue;
        }
        
        // Check if layer is in expected state
        if (layer.enabled && !layerResult.rendered) {
          errors.push(`Layer ${layer.name} should be rendered but is not`);
        }
        if (!layer.enabled && layerResult.rendered) {
          errors.push(`Layer ${layer.name} should not be rendered but is`);
        }
        
        // Check performance
        if (layerResult.performance && layerResult.performance.renderTime > 1000) {
          errors.push(`Layer ${layer.name} render time too slow: ${layerResult.performance.renderTime}ms`);
        }
        
        // Check for errors
        if (layerResult.errors && layerResult.errors.length > 0) {
          errors.push(`Layer ${layer.name} errors: ${layerResult.errors.join(', ')}`);
        }
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      return { success: false, errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`] };
    }
  }, combination);
  
  return result;
}

async function applyRapidLayerChange(page: Page, layerName: string) {
  // Find the layer toggle
  const toggles = page.locator('input[type="checkbox"]');
  const toggleCount = await toggles.count();
  
  let targetToggle = null;
  for (let i = 0; i < toggleCount; i++) {
    const toggle = toggles.nth(i);
    const label = await toggle.locator('..').textContent();
    if (label && label.toLowerCase().includes(layerName.toLowerCase())) {
      targetToggle = toggle;
      break;
    }
  }
  
  if (targetToggle) {
    // Toggle the layer
    const isChecked = await targetToggle.isChecked();
    if (isChecked) {
      await targetToggle.uncheck();
    } else {
      await targetToggle.check();
    }
  }
}

async function validateRapidChanges(page: Page, sequence: string[]) {
  const result = await page.evaluate(() => {
    const api = (window as any).__mapTestApi3D__;
    if (!api || !api.validateLayers) {
      return { success: false, errors: ['API not available'] };
    }
    
    try {
      const results = api.validateLayers();
      const errors: string[] = [];
      
      // Check that all layers are in a valid state
      for (const [layerName, layerResult] of Object.entries(results)) {
        if ((layerResult as any).errors && (layerResult as any).errors.length > 0) {
          errors.push(`Layer ${layerName} errors: ${(layerResult as any).errors.join(', ')}`);
        }
        
        // Check performance
        if ((layerResult as any).performance && (layerResult as any).performance.renderTime > 2000) {
          errors.push(`Layer ${layerName} render time too slow after rapid changes: ${(layerResult as any).performance.renderTime}ms`);
        }
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      return { success: false, errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`] };
    }
  });
  
  return result;
}
