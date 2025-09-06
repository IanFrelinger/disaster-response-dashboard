import { test, expect, Page } from '@playwright/test';

/**
 * Focused Brute Force Validation
 * Tests critical combinations efficiently without overwhelming the system
 */

interface CriticalTest {
  name: string;
  description: string;
  setup: (page: Page) => Promise<void>;
  validation: (page: Page) => Promise<{ success: boolean; errors: string[] }>;
  cleanup?: (page: Page) => Promise<void>;
}

class FocusedBruteForceValidator {
  private results: Array<{ test: string; success: boolean; errors: string[]; duration: number }> = [];

  async runCriticalTests(page: Page): Promise<void> {
    const criticalTests: CriticalTest[] = [
      {
        name: 'all-layers-disabled',
        description: 'All layers disabled - baseline state',
        setup: async (page) => {
          // Ensure all layers are disabled
          const checkboxes = page.locator('input[type="checkbox"]');
          const count = await checkboxes.count();
          for (let i = 0; i < count; i++) {
            await checkboxes.nth(i).uncheck();
          }
          await page.waitForTimeout(1000);
        },
        validation: async (page) => {
          const result = await page.evaluate(() => {
            const api = (window as any).__mapTestApi3D__;
            if (!api || !api.validateLayers) {
              return { success: false, errors: ['API not available'] };
            }
            
            try {
              const results = api.validateLayers();
              const errors: string[] = [];
              
              // Check that no layers are rendered
              for (const [layerName, layerResult] of Object.entries(results)) {
                if ((layerResult as any).rendered) {
                  errors.push(`Layer ${layerName} should not be rendered but is`);
                }
                if ((layerResult as any).errors && (layerResult as any).errors.length > 0) {
                  errors.push(`Layer ${layerName} has errors: ${(layerResult as any).errors.join(', ')}`);
                }
              }
              
              return { success: errors.length === 0, errors };
            } catch (error) {
              return { success: false, errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`] };
            }
          });
          
          return result;
        }
      },
      {
        name: 'all-layers-enabled',
        description: 'All layers enabled - maximum load',
        setup: async (page) => {
          // Enable all layers
          const checkboxes = page.locator('input[type="checkbox"]');
          const count = await checkboxes.count();
          for (let i = 0; i < count; i++) {
            await checkboxes.nth(i).check();
          }
          await page.waitForTimeout(2000);
        },
        validation: async (page) => {
          const result = await page.evaluate(() => {
            const api = (window as any).__mapTestApi3D__;
            if (!api || !api.validateLayers) {
              return { success: false, errors: ['API not available'] };
            }
            
            try {
              const results = api.validateLayers();
              const errors: string[] = [];
              
              // Check that all layers are rendered and performing well
              for (const [layerName, layerResult] of Object.entries(results)) {
                if (!(layerResult as any).rendered) {
                  errors.push(`Layer ${layerName} should be rendered but is not`);
                }
                if ((layerResult as any).performance && (layerResult as any).performance.renderTime > 2000) {
                  errors.push(`Layer ${layerName} render time too slow: ${(layerResult as any).performance.renderTime}ms`);
                }
                if ((layerResult as any).errors && (layerResult as any).errors.length > 0) {
                  errors.push(`Layer ${layerName} has errors: ${(layerResult as any).errors.join(', ')}`);
                }
              }
              
              return { success: errors.length === 0, errors };
            } catch (error) {
              return { success: false, errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`] };
            }
          });
          
          return result;
        }
      },
      {
        name: 'rapid-toggle-sequence',
        description: 'Rapid toggle sequence - stress test',
        setup: async (page) => {
          const checkboxes = page.locator('input[type="checkbox"]');
          const count = await checkboxes.count();
          
          // Rapid toggle sequence
          for (let round = 0; round < 3; round++) {
            for (let i = 0; i < count; i++) {
              await checkboxes.nth(i).click();
              await page.waitForTimeout(50); // Very short delay
            }
          }
          await page.waitForTimeout(1000);
        },
        validation: async (page) => {
          const result = await page.evaluate(() => {
            const api = (window as any).__mapTestApi3D__;
            if (!api || !api.validateLayers) {
              return { success: false, errors: ['API not available'] };
            }
            
            try {
              const results = api.validateLayers();
              const errors: string[] = [];
              
              // Check that system is stable after rapid changes
              for (const [layerName, layerResult] of Object.entries(results)) {
                if ((layerResult as any).errors && (layerResult as any).errors.length > 0) {
                  errors.push(`Layer ${layerName} has errors after rapid changes: ${(layerResult as any).errors.join(', ')}`);
                }
                if ((layerResult as any).performance && (layerResult as any).performance.renderTime > 3000) {
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
      },
      {
        name: 'extreme-property-values',
        description: 'Extreme property values - edge case testing',
        setup: async (page) => {
          // Apply extreme property values via API
          await page.evaluate(() => {
            const api = (window as any).__mapTestApi3D__;
            if (api && api.updateLayerProps) {
              // Extreme terrain values
              api.updateLayerProps('terrain', { exaggeration: 5.0, addSky: true });
              // Extreme building values
              api.updateLayerProps('buildings', { opacity: 0.01, height: 5.0 });
              // Extreme hazard values
              api.updateLayerProps('hazards', { radius: 200, color: '#ff0000' });
              // Extreme unit values
              api.updateLayerProps('units', { size: 100, color: '#00ff00' });
              // Extreme route values
              api.updateLayerProps('routes', { width: 20, color: '#0000ff' });
            }
          });
          await page.waitForTimeout(2000);
        },
        validation: async (page) => {
          const result = await page.evaluate(() => {
            const api = (window as any).__mapTestApi3D__;
            if (!api || !api.validateLayers) {
              return { success: false, errors: ['API not available'] };
            }
            
            try {
              const results = api.validateLayers();
              const errors: string[] = [];
              
              // Check that system handles extreme values gracefully
              for (const [layerName, layerResult] of Object.entries(results)) {
                if ((layerResult as any).errors && (layerResult as any).errors.length > 0) {
                  errors.push(`Layer ${layerName} has errors with extreme values: ${(layerResult as any).errors.join(', ')}`);
                }
                if ((layerResult as any).performance && (layerResult as any).performance.renderTime > 5000) {
                  errors.push(`Layer ${layerName} render time too slow with extreme values: ${(layerResult as any).performance.renderTime}ms`);
                }
              }
              
              return { success: errors.length === 0, errors };
            } catch (error) {
              return { success: false, errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`] };
            }
          });
          
          return result;
        }
      },
      {
        name: 'memory-pressure-test',
        description: 'Memory pressure test - resource management',
        setup: async (page) => {
          // Create memory pressure
          await page.evaluate(() => {
            // Create large arrays to simulate memory pressure
            const arrays = [];
            for (let i = 0; i < 100; i++) {
              arrays.push(new Array(10000).fill(Math.random()));
            }
            (window as any).__memoryPressureArrays = arrays;
          });
          
          // Enable all layers to maximize memory usage
          const checkboxes = page.locator('input[type="checkbox"]');
          const count = await checkboxes.count();
          for (let i = 0; i < count; i++) {
            await checkboxes.nth(i).check();
          }
          await page.waitForTimeout(2000);
        },
        validation: async (page) => {
          const result = await page.evaluate(() => {
            const api = (window as any).__mapTestApi3D__;
            if (!api || !api.validateLayers) {
              return { success: false, errors: ['API not available'] };
            }
            
            try {
              const results = api.validateLayers();
              const errors: string[] = [];
              
              // Check that system remains stable under memory pressure
              for (const [layerName, layerResult] of Object.entries(results)) {
                if ((layerResult as any).errors && (layerResult as any).errors.length > 0) {
                  errors.push(`Layer ${layerName} has errors under memory pressure: ${(layerResult as any).errors.join(', ')}`);
                }
                if ((layerResult as any).performance && (layerResult as any).performance.renderTime > 4000) {
                  errors.push(`Layer ${layerName} render time too slow under memory pressure: ${(layerResult as any).performance.renderTime}ms`);
                }
              }
              
              return { success: errors.length === 0, errors };
            } catch (error) {
              return { success: false, errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`] };
            }
          });
          
          return result;
        },
        cleanup: async (page) => {
          // Clean up memory pressure
          await page.evaluate(() => {
            delete (window as any).__memoryPressureArrays;
            // Force garbage collection if available
            if (window.gc) {
              window.gc();
            }
          });
        }
      },
      {
        name: 'concurrent-operations',
        description: 'Concurrent operations - race condition testing',
        setup: async (page) => {
          // Simulate concurrent operations
          await page.evaluate(() => {
            const api = (window as any).__mapTestApi3D__;
            if (api && api.updateLayerProps) {
              // Start multiple concurrent updates
              setTimeout(() => api.updateLayerProps('terrain', { exaggeration: 1.5 }), 0);
              setTimeout(() => api.updateLayerProps('buildings', { opacity: 0.8 }), 10);
              setTimeout(() => api.updateLayerProps('hazards', { radius: 50 }), 20);
              setTimeout(() => api.updateLayerProps('units', { size: 30 }), 30);
              setTimeout(() => api.updateLayerProps('routes', { width: 6 }), 40);
            }
          });
          
          // Also toggle checkboxes concurrently
          const checkboxes = page.locator('input[type="checkbox"]');
          const count = await checkboxes.count();
          for (let i = 0; i < count; i++) {
            checkboxes.nth(i).click(); // Don't await - let them run concurrently
          }
          await page.waitForTimeout(2000);
        },
        validation: async (page) => {
          const result = await page.evaluate(() => {
            const api = (window as any).__mapTestApi3D__;
            if (!api || !api.validateLayers) {
              return { success: false, errors: ['API not available'] };
            }
            
            try {
              const results = api.validateLayers();
              const errors: string[] = [];
              
              // Check that system handles concurrent operations correctly
              for (const [layerName, layerResult] of Object.entries(results)) {
                if ((layerResult as any).errors && (layerResult as any).errors.length > 0) {
                  errors.push(`Layer ${layerName} has errors with concurrent operations: ${(layerResult as any).errors.join(', ')}`);
                }
                if ((layerResult as any).performance && (layerResult as any).performance.renderTime > 3000) {
                  errors.push(`Layer ${layerName} render time too slow with concurrent operations: ${(layerResult as any).performance.renderTime}ms`);
                }
              }
              
              return { success: errors.length === 0, errors };
            } catch (error) {
              return { success: false, errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`] };
            }
          });
          
          return result;
        }
      }
    ];

    console.log(`🔥 Running ${criticalTests.length} focused brute force tests...`);

    for (const test of criticalTests) {
      console.log(`\n🧪 Running: ${test.name} - ${test.description}`);
      
      const startTime = performance.now();
      
      try {
        // Setup
        await test.setup(page);
        
        // Validation
        const validationResult = await test.validation(page);
        
        // Cleanup
        if (test.cleanup) {
          await test.cleanup(page);
        }
        
        const duration = performance.now() - startTime;
        
        const result = {
          test: test.name,
          success: validationResult.success,
          errors: validationResult.errors,
          duration
        };
        
        this.results.push(result);
        
        if (result.success) {
          console.log(`✅ ${test.name} passed (${duration.toFixed(2)}ms)`);
        } else {
          console.log(`❌ ${test.name} failed: ${result.errors.join(', ')}`);
          // Fail fast - stop on first error
          throw new Error(`Test ${test.name} failed: ${result.errors.join(', ')}`);
        }
        
      } catch (error: any) {
        const duration = performance.now() - startTime;
        const result = {
          test: test.name,
          success: false,
          errors: [`Exception: ${error instanceof Error ? error.message : String(error)}`],
          duration
        };
        
        this.results.push(result);
        console.log(`💥 ${test.name} exception: ${error instanceof Error ? error.message : String(error)}`);
        // Fail fast - stop on first exception
        throw error;
      }
    }
  }

  getResults() {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;
    const maxDuration = Math.max(...this.results.map(r => r.duration));
    const minDuration = Math.min(...this.results.map(r => r.duration));
    
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0);
    
    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      avgDuration,
      maxDuration,
      minDuration,
      totalErrors
    };
  }
}

test.describe('Focused Brute Force Validation', () => {
  let validator: FocusedBruteForceValidator;

  test.beforeEach(async ({ page }) => {
    validator = new FocusedBruteForceValidator();
    
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

  test('run focused brute force validation', async ({ page }) => {
    await validator.runCriticalTests(page);
    
    // Print summary
    const summary = validator.getSummary();
    console.log(`\n📊 Focused Brute Force Validation Summary:`);
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
    console.log(`Average Duration: ${summary.avgDuration.toFixed(2)}ms`);
    console.log(`Max Duration: ${summary.maxDuration.toFixed(2)}ms`);
    console.log(`Total Errors: ${summary.totalErrors}`);
    
    // Print detailed results
    console.log(`\n📋 Detailed Results:`);
    for (const result of validator.getResults()) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.duration.toFixed(2)}ms`);
      if (!result.success && result.errors.length > 0) {
        result.errors.forEach(error => console.log(`   - ${error}`));
      }
    }
    
    // Assertions
    expect(summary.successRate).toBeGreaterThan(80); // 80% success rate
    expect(summary.avgDuration).toBeLessThan(5000); // Average duration < 5s
    expect(summary.maxDuration).toBeLessThan(10000); // Max duration < 10s
    expect(summary.totalErrors).toBeLessThan(10); // Less than 10 total errors
  });

  test('validate error handling and recovery', async ({ page }) => {
    console.log('🔥 Testing error handling and recovery...');
    
    // Test error injection and recovery
    await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (api && api.injectError) {
        api.injectError('test-error');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check that system recovers
    const recoveryResult = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { success: false, errors: ['API not available'] };
      }
      
      try {
        const results = api.validateLayers();
        const errors: string[] = [];
        
        // Check that system is still responsive
        for (const [layerName, layerResult] of Object.entries(results)) {
          if ((layerResult as any).errors && (layerResult as any).errors.length > 0) {
            // Some errors might be expected, but system should still be functional
            console.log(`Layer ${layerName} has errors: ${(layerResult as any).errors.join(', ')}`);
          }
        }
        
        return { success: true, errors: [] };
      } catch (error) {
        return { success: false, errors: [`Recovery error: ${error instanceof Error ? error.message : String(error)}`] };
      }
    });
    
    expect(recoveryResult.success).toBe(true);
    console.log('✅ Error handling and recovery test passed');
  });

  test('validate performance under load', async ({ page }) => {
    console.log('🔥 Testing performance under load...');
    
    // Enable all layers
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }
    
    await page.waitForTimeout(2000);
    
    // Measure performance
    const performanceResult = await page.evaluate(() => {
      const api = (window as any).__mapTestApi3D__;
      if (!api || !api.validateLayers) {
        return { success: false, errors: ['API not available'] };
      }
      
      try {
        const results = api.validateLayers();
        const errors: string[] = [];
        let totalRenderTime = 0;
        let layerCount = 0;
        
        for (const [layerName, layerResult] of Object.entries(results)) {
          if ((layerResult as any).performance && (layerResult as any).performance.renderTime) {
            totalRenderTime += (layerResult as any).performance.renderTime;
            layerCount++;
            
            if ((layerResult as any).performance.renderTime > 2000) {
              errors.push(`Layer ${layerName} render time too slow: ${(layerResult as any).performance.renderTime}ms`);
            }
          }
        }
        
        const avgRenderTime = layerCount > 0 ? totalRenderTime / layerCount : 0;
        
        if (avgRenderTime > 1000) {
          errors.push(`Average render time too slow: ${avgRenderTime.toFixed(2)}ms`);
        }
        
        return { 
          success: errors.length === 0, 
          errors,
          avgRenderTime,
          totalRenderTime,
          layerCount
        };
      } catch (error) {
        return { success: false, errors: [`Performance test error: ${error instanceof Error ? error.message : String(error)}`] };
      }
    });
    
    console.log(`📊 Performance Results:`);
    console.log(`Average Render Time: ${performanceResult.avgRenderTime?.toFixed(2)}ms`);
    console.log(`Total Render Time: ${performanceResult.totalRenderTime?.toFixed(2)}ms`);
    console.log(`Layer Count: ${performanceResult.layerCount}`);
    
    expect(performanceResult.success).toBe(true);
    expect(performanceResult.avgRenderTime).toBeLessThan(1000);
    console.log('✅ Performance under load test passed');
  });
});
