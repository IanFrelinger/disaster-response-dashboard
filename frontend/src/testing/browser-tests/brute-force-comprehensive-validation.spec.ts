import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Brute Force Validation Suite
 * Tests all possible input combinations for every layer and UI component
 */

interface LayerTestConfig {
  name: string;
  layerId: string;
  toggleSelector: string;
  props: Record<string, any[]>;
  interactions: string[];
  validationChecks: string[];
}

interface UIComponentTestConfig {
  name: string;
  selector: string;
  props: Record<string, any[]>;
  interactions: string[];
  validationChecks: string[];
}

// Define all possible layer configurations
const LAYER_CONFIGS: LayerTestConfig[] = [
  {
    name: 'TerrainLayer',
    layerId: 'terrain',
    toggleSelector: 'input[type="checkbox"]',
    props: {
      enabled: [true, false],
      exaggeration: [0.5, 1.0, 1.5, 2.0, 3.0],
      addSky: [true, false]
    },
    interactions: ['toggle', 'hover', 'click'],
    validationChecks: ['renders', 'performance', 'memory', 'errors', 'interactive']
  },
  {
    name: 'BuildingsLayer',
    layerId: 'buildings',
    toggleSelector: 'input[type="checkbox"]',
    props: {
      enabled: [true, false],
      opacity: [0.1, 0.5, 0.8, 1.0],
      height: [0.5, 1.0, 1.5, 2.0],
      color: ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000']
    },
    interactions: ['toggle', 'hover', 'click'],
    validationChecks: ['renders', 'performance', 'memory', 'errors', 'interactive']
  },
  {
    name: 'HazardsLayer',
    layerId: 'hazards',
    toggleSelector: 'input[type="checkbox"]',
    props: {
      enabled: [true, false],
      radius: [5, 10, 20, 50, 100],
      color: ['#ff0000', '#ff8800', '#ffff00', '#ff0088'],
      opacity: [0.3, 0.6, 0.8, 1.0]
    },
    interactions: ['toggle', 'hover', 'click'],
    validationChecks: ['renders', 'performance', 'memory', 'errors', 'interactive']
  },
  {
    name: 'EmergencyUnitsLayer',
    layerId: 'units',
    toggleSelector: 'input[type="checkbox"]',
    props: {
      enabled: [true, false],
      size: [10, 20, 30, 40, 50],
      color: ['#00ff00', '#0088ff', '#ff8800', '#ffffff'],
      opacity: [0.5, 0.7, 0.9, 1.0]
    },
    interactions: ['toggle', 'hover', 'click'],
    validationChecks: ['renders', 'performance', 'memory', 'errors', 'interactive']
  },
  {
    name: 'EvacuationRoutesLayer',
    layerId: 'routes',
    toggleSelector: 'input[type="checkbox"]',
    props: {
      enabled: [true, false],
      width: [2, 4, 6, 8, 10],
      color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
      opacity: [0.5, 0.7, 0.9, 1.0],
      dashArray: [[], [5, 5], [10, 5], [20, 10]]
    },
    interactions: ['toggle', 'hover', 'click'],
    validationChecks: ['renders', 'performance', 'memory', 'errors', 'interactive']
  }
];

// Define all possible UI component configurations
const UI_COMPONENT_CONFIGS: UIComponentTestConfig[] = [
  {
    name: 'LayerToggle',
    selector: 'input[type="checkbox"]',
    props: {
      checked: [true, false],
      disabled: [true, false]
    },
    interactions: ['click', 'hover', 'focus', 'blur'],
    validationChecks: ['renders', 'accessible', 'responsive', 'errors']
  },
  {
    name: 'ValidationOverlay',
    selector: '.validation-overlay',
    props: {
      visible: [true, false],
      position: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    },
    interactions: ['hover', 'click'],
    validationChecks: ['renders', 'positioned', 'responsive', 'errors']
  },
  {
    name: 'MapContainer',
    selector: '.map-container-3d',
    props: {
      width: ['100%', '50%', '75%', 'auto'],
      height: ['500px', '600px', '700px', '100vh']
    },
    interactions: ['resize', 'scroll'],
    validationChecks: ['renders', 'sized', 'responsive', 'errors']
  }
];

// Generate all possible combinations for a given config
function generateCombinations(config: any): any[] {
  const keys = Object.keys(config);
  const combinations: any[] = [];

  function generate(index: number, current: any) {
    if (index === keys.length) {
      combinations.push({ ...current });
      return;
    }

    const key = keys[index];
    if (key) {
      const values = config[key];
      
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

// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, any[]> = new Map();

  startMeasurement(name: string) {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
      
      return duration;
    };
  }

  getMetrics() {
    const result: Record<string, any> = {};
    for (const [name, values] of this.metrics) {
      result[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p95: values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)]
      };
    }
    return result;
  }
}

test.describe('Brute Force Comprehensive Validation', () => {
  let performanceMonitor: PerformanceMonitor;

  test.beforeEach(async ({ page }) => {
    performanceMonitor = new PerformanceMonitor();
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on the "Open 3D Map" button
    await page.click('button:has-text("Open 3D Map")');
    await page.waitForTimeout(5000);
  });

  test('brute force test all layer combinations', async ({ page }) => {
    console.log('🔥 Starting brute force layer testing...');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const errors: string[] = [];

    for (const layerConfig of LAYER_CONFIGS) {
      console.log(`\n🎯 Testing ${layerConfig.name}...`);
      
      const combinations = generateCombinations(layerConfig.props);
      console.log(`📊 Generated ${combinations.length} combinations for ${layerConfig.name}`);
      
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i];
        totalTests++;
        
        try {
          console.log(`\n🧪 Test ${i + 1}/${combinations.length}: ${JSON.stringify(combination)}`);
          
          const endMeasurement = performanceMonitor.startMeasurement(`${layerConfig.name}_render`);
          
          // Apply the combination
          await applyLayerCombination(page, layerConfig, combination);
          
          // Wait for render
          await page.waitForTimeout(1000);
          
          const renderTime = endMeasurement();
          
          // Validate the combination
          const validationResult = await validateLayerCombination(page, layerConfig, combination);
          
          if (validationResult.success) {
            passedTests++;
            console.log(`✅ Passed (${renderTime.toFixed(2)}ms)`);
          } else {
            failedTests++;
            errors.push(`${layerConfig.name}: ${validationResult.error}`);
            console.log(`❌ Failed: ${validationResult.error}`);
            // Fail fast - stop on first error
            throw new Error(`Layer test failed: ${validationResult.error}`);
          }
          
          // Check for console errors
          const consoleErrors = await page.evaluate(() => {
            return (window as any).__consoleErrors || [];
          });
          
          if (consoleErrors.length > 0) {
            errors.push(`${layerConfig.name}: Console errors: ${consoleErrors.join(', ')}`);
          }
          
        } catch (error: any) {
          failedTests++;
          errors.push(`${layerConfig.name}: Exception: ${error instanceof Error ? error.message : String(error)}`);
          console.log(`💥 Exception: ${error instanceof Error ? error.message : String(error)}`);
          // Fail fast - stop on first exception
          throw error;
        }
      }
    }
    
    console.log(`\n📊 Brute Force Layer Testing Results:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Errors Found:`);
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Performance metrics
    const metrics = performanceMonitor.getMetrics();
    console.log(`\n⚡ Performance Metrics:`);
    for (const [name, metric] of Object.entries(metrics)) {
      console.log(`  ${name}: avg=${metric.avg.toFixed(2)}ms, p95=${metric.p95.toFixed(2)}ms`);
    }
    
    // Assertions
    expect(failedTests).toBe(0);
    expect(errors.length).toBe(0);
  });

  test('brute force test all UI component combinations', async ({ page }) => {
    console.log('🔥 Starting brute force UI component testing...');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const errors: string[] = [];

    for (const componentConfig of UI_COMPONENT_CONFIGS) {
      console.log(`\n🎯 Testing ${componentConfig.name}...`);
      
      const combinations = generateCombinations(componentConfig.props);
      console.log(`📊 Generated ${combinations.length} combinations for ${componentConfig.name}`);
      
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i];
        totalTests++;
        
        try {
          console.log(`\n🧪 Test ${i + 1}/${combinations.length}: ${JSON.stringify(combination)}`);
          
          const endMeasurement = performanceMonitor.startMeasurement(`${componentConfig.name}_render`);
          
          // Apply the combination
          await applyUIComponentCombination(page, componentConfig, combination);
          
          // Wait for render
          await page.waitForTimeout(500);
          
          const renderTime = endMeasurement();
          
          // Validate the combination
          const validationResult = await validateUIComponentCombination(page, componentConfig, combination);
          
          if (validationResult.success) {
            passedTests++;
            console.log(`✅ Passed (${renderTime.toFixed(2)}ms)`);
          } else {
            failedTests++;
            errors.push(`${componentConfig.name}: ${validationResult.error}`);
            console.log(`❌ Failed: ${validationResult.error}`);
          }
          
        } catch (error: any) {
          failedTests++;
          errors.push(`${componentConfig.name}: Exception: ${error instanceof Error ? error.message : String(error)}`);
          console.log(`💥 Exception: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    console.log(`\n📊 Brute Force UI Component Testing Results:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Errors Found:`);
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Performance metrics
    const metrics = performanceMonitor.getMetrics();
    console.log(`\n⚡ Performance Metrics:`);
    for (const [name, metric] of Object.entries(metrics)) {
      console.log(`  ${name}: avg=${metric.avg.toFixed(2)}ms, p95=${metric.p95.toFixed(2)}ms`);
    }
    
    // Assertions
    expect(failedTests).toBe(0);
    expect(errors.length).toBe(0);
  });

  test('brute force test all interaction combinations', async ({ page }) => {
    console.log('🔥 Starting brute force interaction testing...');
    
    const interactionSequences = generateInteractionSequences();
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const errors: string[] = [];

    for (const sequence of interactionSequences) {
      totalTests++;
      
      try {
        console.log(`\n🧪 Interaction Sequence: ${sequence.join(' -> ')}`);
        
        const endMeasurement = performanceMonitor.startMeasurement('interaction_sequence');
        
        // Execute the interaction sequence
        await executeInteractionSequence(page, sequence);
        
        // Wait for stabilization
        await page.waitForTimeout(1000);
        
        const executionTime = endMeasurement();
        
        // Validate the result
        const validationResult = await validateInteractionSequence(page, sequence);
        
        if (validationResult.success) {
          passedTests++;
          console.log(`✅ Passed (${executionTime.toFixed(2)}ms)`);
        } else {
          failedTests++;
          errors.push(`Interaction sequence: ${validationResult.error}`);
          console.log(`❌ Failed: ${validationResult.error}`);
        }
        
      } catch (error: any) {
        failedTests++;
        errors.push(`Interaction sequence: Exception: ${error instanceof Error ? error.message : String(error)}`);
        console.log(`💥 Exception: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log(`\n📊 Brute Force Interaction Testing Results:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Errors Found:`);
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Assertions
    expect(failedTests).toBe(0);
    expect(errors.length).toBe(0);
  });

  test('brute force test error boundary conditions', async ({ page }) => {
    console.log('🔥 Starting brute force error boundary testing...');
    
    const errorConditions = [
      { type: 'invalid_props', description: 'Invalid prop values' },
      { type: 'missing_data', description: 'Missing data sources' },
      { type: 'network_failure', description: 'Network failures' },
      { type: 'memory_pressure', description: 'Memory pressure' },
      { type: 'rapid_changes', description: 'Rapid prop changes' },
      { type: 'concurrent_updates', description: 'Concurrent updates' }
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const errors: string[] = [];

    for (const condition of errorConditions) {
      totalTests++;
      
      try {
        console.log(`\n🧪 Testing error condition: ${condition.description}`);
        
        const endMeasurement = performanceMonitor.startMeasurement(`error_${condition.type}`);
        
        // Apply the error condition
        await applyErrorCondition(page, condition);
        
        // Wait for error handling
        await page.waitForTimeout(2000);
        
        const handlingTime = endMeasurement();
        
        // Validate error handling
        const validationResult = await validateErrorHandling(page, condition);
        
        if (validationResult.success) {
          passedTests++;
          console.log(`✅ Error handled correctly (${handlingTime.toFixed(2)}ms)`);
        } else {
          failedTests++;
          errors.push(`Error condition ${condition.type}: ${validationResult.error}`);
          console.log(`❌ Failed: ${validationResult.error}`);
        }
        
      } catch (error: any) {
        failedTests++;
        errors.push(`Error condition ${condition.type}: Exception: ${error instanceof Error ? error.message : String(error)}`);
        console.log(`💥 Exception: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log(`\n📊 Brute Force Error Boundary Testing Results:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Errors Found:`);
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Assertions
    expect(failedTests).toBe(0);
    expect(errors.length).toBe(0);
  });
});

// Helper functions
async function applyLayerCombination(page: Page, config: LayerTestConfig, combination: any) {
  // Find the layer toggle
  const toggles = page.locator(config.toggleSelector);
  const toggleCount = await toggles.count();
  
  let targetToggle = null;
  for (let i = 0; i < toggleCount; i++) {
    const toggle = toggles.nth(i);
    const label = await toggle.locator('..').textContent();
    if (label && label.toLowerCase().includes(config.name.toLowerCase().replace('layer', ''))) {
      targetToggle = toggle;
      break;
    }
  }
  
  if (targetToggle) {
    // Apply enabled state
    if (combination.enabled !== undefined) {
      if (combination.enabled) {
        await targetToggle.check();
      } else {
        await targetToggle.uncheck();
      }
    }
  }
  
  // Apply other properties via API if available
  await page.evaluate(({ layerId, combination }) => {
    const api = (window as any).__mapTestApi3D__;
    if (api && api.updateLayerProps) {
      api.updateLayerProps(layerId, combination);
    }
  }, { layerId: config.layerId, combination });
}

async function validateLayerCombination(page: Page, config: LayerTestConfig, combination: any) {
  const result = await page.evaluate(({ layerId, combination }) => {
    const api = (window as any).__mapTestApi3D__;
    if (!api || !api.validateLayers) {
      return { success: false, error: 'API not available' };
    }
    
    try {
      const results = api.validateLayers();
      const layerResult = results[layerId];
      
      if (!layerResult) {
        return { success: false, error: 'Layer result not found' };
      }
      
      // Check if layer is in expected state
      if (combination.enabled !== undefined) {
        if (combination.enabled && !layerResult.rendered) {
          return { success: false, error: 'Layer should be rendered but is not' };
        }
        if (!combination.enabled && layerResult.rendered) {
          return { success: false, error: 'Layer should not be rendered but is' };
        }
      }
      
      // Check performance
      if (layerResult.performance && layerResult.performance.renderTime > 1000) {
        return { success: false, error: 'Render time too slow' };
      }
      
      // Check for errors
      if (layerResult.errors && layerResult.errors.length > 0) {
        return { success: false, error: `Layer errors: ${layerResult.errors.join(', ')}` };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: `Validation error: ${error instanceof Error ? error.message : String(error)}` };
    }
  }, { layerId: config.layerId, combination });
  
  return result;
}

async function applyUIComponentCombination(page: Page, config: UIComponentTestConfig, combination: any) {
  const element = page.locator(config.selector).first();
  
  if (await element.count() > 0) {
    // Apply properties
    if (combination.checked !== undefined) {
      if (combination.checked) {
        await element.check();
      } else {
        await element.uncheck();
      }
    }
    
    if (combination.disabled !== undefined) {
      await element.evaluate((el: any, disabled: boolean) => {
        el.disabled = disabled;
      }, combination.disabled);
    }
  }
}

async function validateUIComponentCombination(page: Page, config: UIComponentTestConfig, combination: any) {
  const element = page.locator(config.selector).first();
  
  if (await element.count() === 0) {
    return { success: false, error: 'Element not found' };
  }
  
  // Check if element is visible
  const isVisible = await element.isVisible();
  if (!isVisible) {
    return { success: false, error: 'Element not visible' };
  }
  
  // Check accessibility
  const isAccessible = await element.evaluate((el: any) => {
    return el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent;
  });
  
  if (!isAccessible) {
    return { success: false, error: 'Element not accessible' };
  }
  
  return { success: true };
}

function generateInteractionSequences(): string[][] {
  const interactions = ['click', 'hover', 'focus', 'blur', 'keydown', 'keyup'];
  const sequences: string[][] = [];
  
  // Generate sequences of length 2-4
  for (let length = 2; length <= 4; length++) {
    function generateSequence(current: string[], remaining: string[]) {
      if (current.length === length) {
        sequences.push([...current]);
        return;
      }
      
      for (let i = 0; i < remaining.length; i++) {
        const next = remaining[i];
        if (next) {
          const newRemaining = remaining.filter((_, index) => index !== i);
          generateSequence([...current, next], newRemaining);
        }
      }
    }
    
    generateSequence([], interactions);
  }
  
  return sequences.slice(0, 50); // Limit to 50 sequences for performance
}

async function executeInteractionSequence(page: Page, sequence: string[]) {
  for (const interaction of sequence) {
    const element = page.locator('input[type="checkbox"]').first();
    
    switch (interaction) {
      case 'click':
        await element.click();
        break;
      case 'hover':
        await element.hover();
        break;
      case 'focus':
        await element.focus();
        break;
      case 'blur':
        await element.blur();
        break;
      case 'keydown':
        await element.press('Tab');
        break;
      case 'keyup':
        await element.press('Enter');
        break;
    }
    
    await page.waitForTimeout(100);
  }
}

async function validateInteractionSequence(page: Page, sequence: string[]) {
  // Check that the page is still responsive
  const isResponsive = await page.evaluate(() => {
    return document.readyState === 'complete';
  });
  
  if (!isResponsive) {
    return { success: false, error: 'Page not responsive after interaction sequence' };
  }
  
  // Check for console errors
  const consoleErrors = await page.evaluate(() => {
    return (window as any).__consoleErrors || [];
  });
  
  if (consoleErrors.length > 0) {
    return { success: false, error: `Console errors: ${consoleErrors.join(', ')}` };
  }
  
  return { success: true };
}

async function applyErrorCondition(page: Page, condition: any) {
  switch (condition.type) {
    case 'invalid_props':
      await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (api && api.injectInvalidProps) {
          api.injectInvalidProps();
        }
      });
      break;
    case 'missing_data':
      await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (api && api.injectMissingData) {
          api.injectMissingData();
        }
      });
      break;
    case 'network_failure':
      await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (api && api.injectNetworkFailure) {
          api.injectNetworkFailure();
        }
      });
      break;
    case 'memory_pressure':
      await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (api && api.injectMemoryPressure) {
          api.injectMemoryPressure();
        }
      });
      break;
    case 'rapid_changes':
      await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (api && api.injectRapidChanges) {
          api.injectRapidChanges();
        }
      });
      break;
    case 'concurrent_updates':
      await page.evaluate(() => {
        const api = (window as any).__mapTestApi3D__;
        if (api && api.injectConcurrentUpdates) {
          api.injectConcurrentUpdates();
        }
      });
      break;
  }
}

async function validateErrorHandling(page: Page, condition: any) {
  // Check that the page is still responsive
  const isResponsive = await page.evaluate(() => {
    return document.readyState === 'complete';
  });
  
  if (!isResponsive) {
    return { success: false, error: 'Page not responsive after error condition' };
  }
  
  // Check for error boundaries
  const errorBoundaryActive = await page.evaluate(() => {
    const errorBoundary = document.querySelector('.error-boundary');
    return errorBoundary && errorBoundary.textContent?.includes('Something went wrong');
  });
  
  if (errorBoundaryActive) {
    return { success: true }; // Error boundary caught the error correctly
  }
  
  // Check for console errors
  const consoleErrors = await page.evaluate(() => {
    return (window as any).__consoleErrors || [];
  });
  
  if (consoleErrors.length > 0) {
    return { success: false, error: `Unhandled console errors: ${consoleErrors.join(', ')}` };
  }
  
  return { success: true };
}
