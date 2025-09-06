import { test, expect, Page } from '@playwright/test';

/**
 * Brute Force UI Interaction Testing
 * Tests all possible UI component interactions and combinations
 */

interface UIElement {
  selector: string;
  type: 'button' | 'checkbox' | 'input' | 'select' | 'div' | 'span';
  interactions: string[];
  properties: Record<string, any[]>;
}

interface InteractionSequence {
  element: string;
  action: string;
  value?: any;
  delay?: number;
}

interface TestResult {
  sequence: InteractionSequence[];
  success: boolean;
  executionTime: number;
  errors: string[];
  warnings: string[];
  finalState: any;
}

class UIInteractionGenerator {
  private elements: UIElement[] = [
    {
      selector: 'button:has-text("Open 3D Map")',
      type: 'button',
      interactions: ['click', 'hover', 'focus', 'blur'],
      properties: { disabled: [true, false] }
    },
    {
      selector: 'input[type="checkbox"]',
      type: 'checkbox',
      interactions: ['click', 'hover', 'focus', 'blur', 'check', 'uncheck'],
      properties: { checked: [true, false], disabled: [true, false] }
    },
    {
      selector: '.validation-overlay',
      type: 'div',
      interactions: ['hover', 'click'],
      properties: { visible: [true, false] }
    },
    {
      selector: '.map-container-3d',
      type: 'div',
      interactions: ['hover', 'click', 'resize'],
      properties: { width: ['100%', '50%', '75%'], height: ['500px', '600px', '700px'] }
    },
    {
      selector: '.layer-controls',
      type: 'div',
      interactions: ['hover', 'click'],
      properties: { visible: [true, false] }
    }
  ];

  generateInteractionSequences(maxLength: number = 5): InteractionSequence[][] {
    const sequences: InteractionSequence[][] = [];
    
    // Generate sequences of different lengths
    for (let length = 1; length <= maxLength; length++) {
      this.generateSequencesOfLength(length, [], sequences);
    }
    
    return sequences;
  }

  private generateSequencesOfLength(length: number, current: InteractionSequence[], sequences: InteractionSequence[][]) {
    if (current.length === length) {
      sequences.push([...current]);
      return;
    }
    
    for (const element of this.elements) {
      for (const interaction of element.interactions) {
        const sequence: InteractionSequence = {
          element: element.selector,
          action: interaction,
          delay: Math.random() * 100 // Random delay 0-100ms
        };
        
        current.push(sequence);
        this.generateSequencesOfLength(length, current, sequences);
        current.pop();
      }
    }
  }

  generatePropertyCombinations(): Record<string, any>[] {
    const combinations: Record<string, any>[] = [];
    
    for (const element of this.elements) {
      const elementCombinations = this.generateElementPropertyCombinations(element);
      combinations.push(...elementCombinations);
    }
    
    return combinations;
  }

  private generateElementPropertyCombinations(element: UIElement): Record<string, any>[] {
    const keys = Object.keys(element.properties);
    const combinations: Record<string, any>[] = [];

    function generate(index: number, current: Record<string, any>) {
      if (index === keys.length) {
        combinations.push({ selector: element.selector, ...current });
        return;
      }

      const key = keys[index];
      if (key) {
        const values = element.properties[key];
        
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

class UIInteractionTester {
  private results: TestResult[] = [];

  async executeSequence(page: Page, sequence: InteractionSequence[]): Promise<TestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Clear console errors before starting
      await page.evaluate(() => {
        (window as any).__consoleErrors = [];
        (window as any).__consoleWarnings = [];
      });
      
      // Execute each interaction in the sequence
      for (const interaction of sequence) {
        try {
          await this.executeInteraction(page, interaction);
          
          // Add delay if specified
          if (interaction.delay) {
            await page.waitForTimeout(interaction.delay);
          }
        } catch (error: any) {
          errors.push(`Interaction ${interaction.action} on ${interaction.element}: ${error.message}`);
        }
      }
      
      // Wait for stabilization
      await page.waitForTimeout(500);
      
      // Capture final state
      const finalState = await this.captureFinalState(page);
      
      // Check for console errors and warnings
      const consoleIssues = await page.evaluate(() => {
        return {
          errors: (window as any).__consoleErrors || [],
          warnings: (window as any).__consoleWarnings || []
        };
      });
      
      errors.push(...consoleIssues.errors);
      warnings.push(...consoleIssues.warnings);
      
      const executionTime = performance.now() - startTime;
      
      const result: TestResult = {
        sequence,
        success: errors.length === 0,
        executionTime,
        errors,
        warnings,
        finalState
      };
      
      this.results.push(result);
      return result;
      
    } catch (error: any) {
      const executionTime = performance.now() - startTime;
      const result: TestResult = {
        sequence,
        success: false,
        executionTime,
        errors: [`Sequence execution failed: ${error.message}`],
        warnings: [],
        finalState: null
      };
      
      this.results.push(result);
      return result;
    }
  }

  private async executeInteraction(page: Page, interaction: InteractionSequence) {
    const element = page.locator(interaction.element).first();
    
    if (await element.count() === 0) {
      throw new Error(`Element not found: ${interaction.element}`);
    }
    
    switch (interaction.action) {
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
      case 'check':
        await element.check();
        break;
      case 'uncheck':
        await element.uncheck();
        break;
      case 'resize':
        await element.evaluate((el: any) => {
          el.style.width = '50%';
          el.style.height = '400px';
        });
        break;
      default:
        throw new Error(`Unknown interaction: ${interaction.action}`);
    }
  }

  private async captureFinalState(page: Page): Promise<any> {
    return await page.evaluate(() => {
      const state: any = {
        mapLoaded: false,
        layersVisible: {},
        validationOverlayVisible: false,
        consoleErrors: (window as any).__consoleErrors || [],
        consoleWarnings: (window as any).__consoleWarnings || []
      };
      
      // Check if map is loaded
      const mapContainer = document.querySelector('.map-container-3d');
      state.mapLoaded = !!mapContainer;
      
      // Check layer visibility
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox: any, index) => {
        const label = checkbox.closest('label')?.textContent || `layer-${index}`;
        state.layersVisible[label] = checkbox.checked;
      });
      
      // Check validation overlay
      const validationOverlay = document.querySelector('.validation-overlay');
      state.validationOverlayVisible = validationOverlay && (validationOverlay as HTMLElement).offsetParent !== null;
      
      return state;
    });
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    
    const avgExecutionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0) / total;
    const maxExecutionTime = Math.max(...this.results.map(r => r.executionTime));
    const minExecutionTime = Math.min(...this.results.map(r => r.executionTime));
    
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = this.results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      avgExecutionTime,
      maxExecutionTime,
      minExecutionTime,
      totalErrors,
      totalWarnings
    };
  }
}

test.describe('Brute Force UI Interactions', () => {
  let interactionGenerator: UIInteractionGenerator;
  let interactionTester: UIInteractionTester;

  test.beforeEach(async ({ page }) => {
    interactionGenerator = new UIInteractionGenerator();
    interactionTester = new UIInteractionTester();
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('test all UI interaction sequences', async ({ page }) => {
    console.log('🔥 Starting brute force UI interaction testing...');
    
    const sequences = interactionGenerator.generateInteractionSequences(3); // Limit to 3 for performance
    console.log(`📊 Generated ${sequences.length} interaction sequences`);
    
    for (let i = 0; i < sequences.length; i++) {
      const sequence = sequences[i];
      if (sequence) {
        console.log(`\n🧪 Test ${i + 1}/${sequences.length}: ${sequence.map(s => `${s.action}(${s.element})`).join(' -> ')}`);
        
        const result = await interactionTester.executeSequence(page, sequence);
      
      if (result.success) {
        console.log(`✅ Passed (${result.executionTime.toFixed(2)}ms)`);
      } else {
        console.log(`❌ Failed: ${result.errors.join(', ')}`);
      }
      }
    }
    
    // Print summary
    const summary = interactionTester.getSummary();
    console.log(`\n📊 Brute Force UI Interaction Testing Summary:`);
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
    console.log(`Average Execution Time: ${summary.avgExecutionTime.toFixed(2)}ms`);
    console.log(`Max Execution Time: ${summary.maxExecutionTime.toFixed(2)}ms`);
    console.log(`Total Errors: ${summary.totalErrors}`);
    console.log(`Total Warnings: ${summary.totalWarnings}`);
    
    // Assertions
    expect(summary.avgExecutionTime).toBeLessThan(1000); // Average execution time < 1s
    expect(summary.maxExecutionTime).toBeLessThan(5000); // Max execution time < 5s
    expect(summary.successRate).toBeGreaterThan(90); // 90% success rate
  });

  test('test all UI property combinations', async ({ page }) => {
    console.log('🔥 Testing all UI property combinations...');
    
    const combinations = interactionGenerator.generatePropertyCombinations();
    console.log(`📊 Generated ${combinations.length} property combinations`);
    
    for (let i = 0; i < combinations.length; i++) {
      const combination = combinations[i];
      console.log(`\n🧪 Test ${i + 1}/${combinations.length}: ${JSON.stringify(combination)}`);
      
      try {
        // Apply the property combination
        await applyPropertyCombination(page, combination);
        
        // Wait for render
        await page.waitForTimeout(500);
        
        // Validate the combination
        const validationResult = await validatePropertyCombination(page, combination);
        
        if (validationResult.success) {
          console.log(`✅ Passed`);
        } else {
          console.log(`❌ Failed: ${validationResult.error}`);
        }
        
      } catch (error: any) {
        console.log(`💥 Exception: ${error.message}`);
      }
    }
  });

  test('test rapid UI state changes', async ({ page }) => {
    console.log('🔥 Testing rapid UI state changes...');
    
    const rapidChangeSequences = [
      // Rapid checkbox toggles
      ['input[type="checkbox"]', 'input[type="checkbox"]', 'input[type="checkbox"]'],
      // Rapid button clicks
      ['button:has-text("Open 3D Map")', 'button:has-text("Open 3D Map")'],
      // Mixed rapid interactions
      ['input[type="checkbox"]', 'button:has-text("Open 3D Map")', 'input[type="checkbox"]']
    ];
    
    for (let i = 0; i < rapidChangeSequences.length; i++) {
      const sequence = rapidChangeSequences[i];
      if (sequence) {
        console.log(`\n🧪 Rapid Change Test ${i + 1}/${rapidChangeSequences.length}: ${sequence.join(' -> ')}`);
        
        try {
          // Apply rapid changes
          for (const selector of sequence) {
          await applyRapidUIChange(page, selector);
          await page.waitForTimeout(50); // Very short delay
        }
        
        // Wait for stabilization
        await page.waitForTimeout(1000);
        
        // Validate final state
        const validationResult = await validateRapidUIChanges(page, sequence);
        
        if (validationResult.success) {
          console.log(`✅ Passed`);
        } else {
          console.log(`❌ Failed: ${validationResult.error}`);
        }
        
        } catch (error: any) {
          console.log(`💥 Exception: ${error.message}`);
        }
      }
    }
  });

  test('test UI error boundary conditions', async ({ page }) => {
    console.log('🔥 Testing UI error boundary conditions...');
    
    const errorConditions = [
      { type: 'invalid_input', description: 'Invalid input values' },
      { type: 'missing_elements', description: 'Missing DOM elements' },
      { type: 'rapid_events', description: 'Rapid event firing' },
      { type: 'memory_pressure', description: 'Memory pressure' }
    ];
    
    for (const condition of errorConditions) {
      console.log(`\n🧪 Error Condition: ${condition.description}`);
      
      try {
        // Apply the error condition
        await applyUIErrorCondition(page, condition);
        
        // Wait for error handling
        await page.waitForTimeout(1000);
        
        // Validate error handling
        const validationResult = await validateUIErrorHandling(page, condition);
        
        if (validationResult.success) {
          console.log(`✅ Error handled correctly`);
        } else {
          console.log(`❌ Failed: ${validationResult.error}`);
        }
        
      } catch (error: any) {
        console.log(`💥 Exception: ${error.message}`);
      }
    }
  });
});

// Helper functions
async function applyPropertyCombination(page: Page, combination: any) {
  const element = page.locator(combination.selector).first();
  
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
    
    if (combination.visible !== undefined) {
      await element.evaluate((el: any, visible: boolean) => {
        el.style.display = visible ? 'block' : 'none';
      }, combination.visible);
    }
    
    if (combination.width !== undefined) {
      await element.evaluate((el: any, width: string) => {
        el.style.width = width;
      }, combination.width);
    }
    
    if (combination.height !== undefined) {
      await element.evaluate((el: any, height: string) => {
        el.style.height = height;
      }, combination.height);
    }
  }
}

async function validatePropertyCombination(page: Page, combination: any) {
  const element = page.locator(combination.selector).first();
  
  if (await element.count() === 0) {
    return { success: false, error: 'Element not found' };
  }
  
  // Check if element is visible
  const isVisible = await element.isVisible();
  if (!isVisible && combination.visible !== false) {
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

async function applyRapidUIChange(page: Page, selector: string) {
  const element = page.locator(selector).first();
  
  if (await element.count() > 0) {
    // Try different interactions
    const interactions = ['click', 'hover', 'focus'];
    const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
    
    switch (randomInteraction) {
      case 'click':
        await element.click();
        break;
      case 'hover':
        await element.hover();
        break;
      case 'focus':
        await element.focus();
        break;
    }
  }
}

async function validateRapidUIChanges(page: Page, sequence: string[]) {
  // Check that the page is still responsive
  const isResponsive = await page.evaluate(() => {
    return document.readyState === 'complete';
  });
  
  if (!isResponsive) {
    return { success: false, error: 'Page not responsive after rapid UI changes' };
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

async function applyUIErrorCondition(page: Page, condition: any) {
  switch (condition.type) {
    case 'invalid_input':
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
          if (input.type === 'checkbox') {
            input.checked = false;
          }
        });
      });
      break;
    case 'missing_elements':
      await page.evaluate(() => {
        const elements = document.querySelectorAll('.layer-controls, .validation-overlay');
        elements.forEach(el => el.remove());
      });
      break;
    case 'rapid_events':
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          for (let i = 0; i < 10; i++) {
            button.click();
          }
        });
      });
      break;
    case 'memory_pressure':
      await page.evaluate(() => {
        // Create memory pressure
        const arrays = [];
        for (let i = 0; i < 1000; i++) {
          arrays.push(new Array(1000).fill(Math.random()));
        }
      });
      break;
  }
}

async function validateUIErrorHandling(page: Page, condition: any) {
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
