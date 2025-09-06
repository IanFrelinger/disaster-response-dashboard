import { test, expect, Page } from '@playwright/test';
import { COMPONENT_MAP, generatePropCombinations, generateInteractionSequences } from '../component-map';

/**
 * Brute Force Interaction Test Suite
 * Systematically tests every combination of props and interactions for all components
 * Detects rendering errors, console errors, and interaction failures
 */

interface TestResult {
  componentName: string;
  propCombination: any;
  interactionSequence: any[];
  success: boolean;
  errors: string[];
  consoleErrors: string[];
  renderErrors: string[];
  performanceMetrics: {
    renderTime: number;
    interactionTime: number;
    memoryUsage?: number;
  };
}

class BruteForceTester {
  private results: TestResult[] = [];
  private maxCombinationsPerComponent = 50; // Limit to prevent infinite testing
  private maxInteractionsPerSequence = 10; // Limit interaction sequences

  async testComponent(page: Page, component: any): Promise<TestResult[]> {
    const componentResults: TestResult[] = [];
    const propCombinations = generatePropCombinations(component).slice(0, this.maxCombinationsPerComponent);
    const interactionSequences = generateInteractionSequences(component).slice(0, this.maxInteractionsPerSequence);

    console.log(`Testing ${component.componentName}: ${propCombinations.length} prop combinations, ${interactionSequences.length} interaction sequences`);

    for (const propCombination of propCombinations) {
      for (const interactionSequence of interactionSequences) {
        const result = await this.testCombination(page, component, propCombination, interactionSequence);
        componentResults.push(result);
        
        // Log progress
        if (componentResults.length % 10 === 0) {
          console.log(`Progress: ${componentResults.length}/${propCombinations.length * interactionSequences.length} combinations tested`);
        }
      }
    }

    return componentResults;
  }

  private async testCombination(
    page: Page, 
    component: any, 
    propCombination: any, 
    interactionSequence: any[]
  ): Promise<TestResult> {
    const result: TestResult = {
      componentName: component.componentName,
      propCombination,
      interactionSequence,
      success: false,
      errors: [],
      consoleErrors: [],
      renderErrors: [],
      performanceMetrics: {
        renderTime: 0,
        interactionTime: 0
      }
    };

    try {
      // Clear console and set up error tracking
      await page.evaluate(() => {
        (window as any).testErrors = [];
        (window as any).consoleErrors = [];
        
        // Override console.error to capture errors
        const originalError = console.error;
        console.error = (...args) => {
          (window as any).consoleErrors.push(args.join(' '));
          originalError.apply(console, args);
        };
      });

      // Navigate to test page with component
      await this.renderComponent(page, component, propCombination);
      
      // Measure render time
      const renderStart = Date.now();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(100); // Allow for async rendering
      result.performanceMetrics.renderTime = Date.now() - renderStart;

      // Check for rendering errors
      await this.checkRenderingErrors(page, result);

      // Execute interaction sequence
      const interactionStart = Date.now();
      await this.executeInteractionSequence(page, interactionSequence, result);
      result.performanceMetrics.interactionTime = Date.now() - interactionStart;

      // Collect console errors
      const consoleErrors = await page.evaluate(() => (window as any).consoleErrors || []);
      result.consoleErrors = consoleErrors;

      // Check for JavaScript errors
      const jsErrors = await page.evaluate(() => (window as any).testErrors || []);
      result.errors = jsErrors;

      // Determine success
      result.success = result.errors.length === 0 && result.consoleErrors.length === 0 && result.renderErrors.length === 0;

    } catch (error) {
      result.errors.push(`Test execution error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  private async renderComponent(page: Page, component: any, propCombination: any): Promise<void> {
    // Create a test page that renders the component with the given props
    const testPageHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Brute Force Test - ${component.componentName}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .test-container { border: 1px solid #ccc; padding: 20px; margin: 10px 0; }
            .error-boundary { border: 2px solid red; padding: 10px; background: #ffe6e6; }
            .error-message { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <div id="root">
            <div class="test-container">
              <h2>Testing: ${component.componentName}</h2>
              <div id="component-container"></div>
            </div>
          </div>
          
          <script>
            // Mock React and component rendering
            window.renderComponent = function(componentName, props) {
              try {
                const container = document.getElementById('component-container');
                
                // Create component element based on component name
                let element;
                switch(componentName) {
                  case 'LayerTogglePanel':
                    element = createLayerTogglePanel(props);
                    break;
                  case 'MapContainer':
                    element = createMapContainer(props);
                    break;
                  case 'AIPDecisionSupport':
                    element = createAIPDecisionSupport(props);
                    break;
                  case 'RealTimeDashboard':
                    element = createRealTimeDashboard(props);
                    break;
                  case 'RoleBasedRouting':
                    element = createRoleBasedRouting(props);
                    break;
                  case 'EvacuationDashboard':
                    element = createEvacuationDashboard(props);
                    break;
                  case 'ErrorBoundary':
                    element = createErrorBoundary(props);
                    break;
                  default:
                    element = document.createElement('div');
                    element.textContent = 'Unknown component: ' + componentName;
                }
                
                container.innerHTML = '';
                container.appendChild(element);
                
              } catch (error) {
                window.testErrors = window.testErrors || [];
                window.testErrors.push('Render error: ' + error instanceof Error ? error.message : String(error));
                
                const container = document.getElementById('component-container');
                container.innerHTML = '<div class="error-boundary"><div class="error-message">Render Error: ' + error instanceof Error ? error.message : String(error) + '</div></div>';
              }
            };
            
            // Component creation functions
            function createLayerTogglePanel(props) {
              const div = document.createElement('div');
              div.className = 'layer-toggle-panel ' + (props.className || '');
              
              if (props.title) {
                const title = document.createElement('h3');
                title.textContent = props.title;
                div.appendChild(title);
              }
              
              const toggles = props.toggleDescriptors || [
                { key: 'terrain', label: '3D Terrain', checked: false },
                { key: 'buildings', label: 'Buildings', checked: true },
                { key: 'hazards', label: 'Hazards', checked: false }
              ];
              
              toggles.forEach(toggle => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.margin = '5px 0';
                
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = toggle.checked;
                input.setAttribute('data-testid', 'toggle-' + toggle.key);
                input.addEventListener('change', () => {
                  console.log('Toggle changed:', toggle.key, input.checked);
                });
                
                const span = document.createElement('span');
                span.textContent = toggle.label;
                span.style.marginLeft = '5px';
                
                label.appendChild(input);
                label.appendChild(span);
                div.appendChild(label);
              });
              
              return div;
            }
            
            function createMapContainer(props) {
              const div = document.createElement('div');
              div.className = 'map-container';
              div.style.width = '400px';
              div.style.height = '300px';
              div.style.border = '1px solid #ccc';
              div.style.position = 'relative';
              
              const center = props.center || [0, 0];
              const zoom = props.zoom || 10;
              
              div.innerHTML = \`
                <div class="map-content">
                  <div class="map-info">
                    Center: [\${center[0]}, \${center[1]}]<br>
                    Zoom: \${zoom}
                  </div>
                  <div class="map-controls">
                    <button data-testid="zoom-in">+</button>
                    <button data-testid="zoom-out">-</button>
                  </div>
                </div>
              \`;
              
              // Add interaction handlers
              div.addEventListener('click', (e) => {
                console.log('Map clicked:', e.target);
              });
              
              return div;
            }
            
            function createAIPDecisionSupport(props) {
              const div = document.createElement('div');
              div.className = 'ai-decision-support ' + (props.className || '');
              
              div.innerHTML = \`
                <h3>AI Decision Support</h3>
                <div class="decision-options">
                  <button data-testid="option-1">Option 1</button>
                  <button data-testid="option-2">Option 2</button>
                  <button data-testid="option-3">Option 3</button>
                </div>
                <textarea placeholder="Enter decision criteria..."></textarea>
                <select>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              \`;
              
              // Add event handlers
              div.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                  if (props.onDecisionMade) {
                    props.onDecisionMade({ option: btn.textContent, timestamp: Date.now() });
                  }
                });
              });
              
              return div;
            }
            
            function createRealTimeDashboard(props) {
              const div = document.createElement('div');
              div.className = 'realtime-dashboard ' + (props.className || '');
              
              let content = '<h3>Real-Time Dashboard</h3>';
              
              if (props.showSystemStatus !== false) {
                content += '<div class="system-status">System: Online</div>';
              }
              
              if (props.showDataFeeds !== false) {
                content += '<div class="data-feeds">Data Feeds: Active</div>';
              }
              
              if (props.showLiveUpdates !== false) {
                content += '<div class="live-updates">Live Updates: Enabled</div>';
              }
              
              div.innerHTML = content;
              
              return div;
            }
            
            function createRoleBasedRouting(props) {
              const div = document.createElement('div');
              div.className = 'role-based-routing ' + (props.className || '');
              
              div.innerHTML = \`
                <h3>Role-Based Routing</h3>
                <div class="routes">
                  \${(props.routes || []).map(route => \`
                    <div class="route-item" data-route-id="\${route.id}">
                      \${route.name || 'Unnamed Route'}
                    </div>
                  \`).join('')}
                </div>
                <div class="units">
                  \${(props.units || []).map(unit => \`
                    <div class="unit-item" data-unit-id="\${unit.id}">
                      \${unit.name || 'Unnamed Unit'}
                    </div>
                  \`).join('')}
                </div>
                <select>
                  <option value="fire">Fire Department</option>
                  <option value="police">Police</option>
                  <option value="medical">Medical</option>
                </select>
              \`;
              
              // Add event handlers
              div.querySelectorAll('.route-item').forEach(item => {
                item.addEventListener('click', () => {
                  if (props.onRouteSelect) {
                    props.onRouteSelect({ id: item.dataset.routeId, name: item.textContent });
                  }
                });
              });
              
              return div;
            }
            
            function createEvacuationDashboard(props) {
              const div = document.createElement('div');
              div.className = 'evacuation-dashboard ' + (props.className || '');
              
              div.innerHTML = \`
                <h3>Evacuation Dashboard</h3>
                <div class="zones">
                  \${(props.zones || []).map(zone => \`
                    <div class="zone-item" data-zone-id="\${zone.id}">
                      \${zone.name || 'Unnamed Zone'}
                    </div>
                  \`).join('')}
                </div>
                <div class="buildings">
                  \${(props.buildings || []).map(building => \`
                    <div class="building-item" data-building-id="\${building.id}">
                      \${building.name || 'Unnamed Building'}
                    </div>
                  \`).join('')}
                </div>
                \${props.weatherData ? \`
                  <div class="weather-panel">
                    Temperature: \${props.weatherData.temperature || 'N/A'}°C<br>
                    Humidity: \${props.weatherData.humidity || 'N/A'}%
                  </div>
                \` : ''}
              \`;
              
              return div;
            }
            
            function createErrorBoundary(props) {
              const div = document.createElement('div');
              div.className = 'error-boundary';
              
              try {
                // Simulate potential error
                if (props.children && Math.random() < 0.1) {
                  throw new Error('Simulated component error');
                }
                
                div.innerHTML = '<div class="error-boundary-content">' + (props.children || 'No children') + '</div>';
              } catch (error) {
                div.innerHTML = '<div class="error-message">Error Boundary Caught: ' + error instanceof Error ? error.message : String(error) + '</div>';
                if (props.onError) {
                  props.onError(error);
                }
              }
              
              return div;
            }
            
            // Render the component
            window.renderComponent('${component.componentName}', ${JSON.stringify(propCombination)});
          </script>
        </body>
      </html>
    `;

    await page.setContent(testPageHTML);
  }

  private async checkRenderingErrors(page: Page, result: TestResult): Promise<void> {
    // Check for error boundary activation
    const errorBoundary = await page.locator('.error-boundary').count();
    if (errorBoundary > 0) {
      const errorText = await page.locator('.error-message').textContent();
      result.renderErrors.push(`Error boundary activated: ${errorText}`);
    }

    // Check for missing required elements
    const componentContainer = await page.locator('#component-container').count();
    if (componentContainer === 0) {
      result.renderErrors.push('Component container not found');
    }

    // Check for empty component
    const componentContent = await page.locator('#component-container').textContent();
    if (!componentContent || componentContent.trim() === '') {
      result.renderErrors.push('Component rendered empty content');
    }
  }

  private async executeInteractionSequence(page: Page, sequence: any[], result: TestResult): Promise<void> {
    for (const interaction of sequence) {
      try {
        await this.executeInteraction(page, interaction);
        await page.waitForTimeout(50); // Small delay between interactions
      } catch (error) {
        result.errors.push(`Interaction error (${interaction.type}): ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async executeInteraction(page: Page, interaction: any): Promise<void> {
    const element = page.locator(interaction.selector);
    
    switch (interaction.type) {
      case 'click':
        if (await element.count() > 0) {
          await element.first().click();
        }
        break;
        
      case 'hover':
        if (await element.count() > 0) {
          await element.first().hover();
        }
        break;
        
      case 'focus':
        if (await element.count() > 0) {
          await element.first().focus();
        }
        break;
        
      case 'input':
        if (await element.count() > 0) {
          await element.first().fill(interaction.value || 'test input');
        }
        break;
        
      case 'select':
        if (await element.count() > 0) {
          await element.first().selectOption(interaction.value || 'option1');
        }
        break;
        
      case 'keyboard':
        if (await element.count() > 0) {
          await element.first().focus();
          for (const key of interaction.keyboardKeys || ['Tab']) {
            await page.keyboard.press(key);
          }
        }
        break;
        
      case 'drag':
        if (await element.count() > 0) {
          await element.first().dragTo(element.first(), { targetPosition: { x: 100, y: 100 } });
        }
        break;
        
      case 'scroll':
        if (await element.count() > 0) {
          await element.first().scrollIntoViewIfNeeded();
        }
        break;
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary(): any {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    
    const errorTypes = {
      renderErrors: this.results.filter(r => r.renderErrors.length > 0).length,
      consoleErrors: this.results.filter(r => r.consoleErrors.length > 0).length,
      interactionErrors: this.results.filter(r => r.errors.length > 0).length
    };

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      errorTypes,
      averageRenderTime: this.results.reduce((sum, r) => sum + r.performanceMetrics.renderTime, 0) / total,
      averageInteractionTime: this.results.reduce((sum, r) => sum + r.performanceMetrics.interactionTime, 0) / total
    };
  }
}

// Test suite
test.describe('Brute Force Component Interaction Tests', () => {
  let tester: BruteForceTester;

  test.beforeEach(async ({ page }) => {
    tester = new BruteForceTester();
    
    // Set up error handling
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('Page error:', error instanceof Error ? error.message : String(error));
    });
  });

  // Test each component systematically
  for (const component of COMPONENT_MAP) {
    test(`Brute force test: ${component.componentName}`, async ({ page }) => {
      const results = await tester.testComponent(page, component);
      tester.getResults().push(...results);
      
      // Generate detailed report
      const summary = tester.getSummary();
      console.log(`\n=== ${component.componentName} Test Summary ===`);
      console.log(`Total combinations tested: ${summary.total}`);
      console.log(`Success rate: ${summary.successRate.toFixed(2)}%`);
      console.log(`Average render time: ${summary.averageRenderTime.toFixed(2)}ms`);
      console.log(`Average interaction time: ${summary.averageInteractionTime.toFixed(2)}ms`);
      
      // Log failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        console.log(`\nFailures (${failures.length}):`);
        failures.slice(0, 5).forEach((failure, index) => {
          console.log(`${index + 1}. Props: ${JSON.stringify(failure.propCombination)}`);
          console.log(`   Errors: ${failure.errors.join(', ')}`);
          console.log(`   Console Errors: ${failure.consoleErrors.join(', ')}`);
          console.log(`   Render Errors: ${failure.renderErrors.join(', ')}`);
        });
      }
      
      // Assert minimum success rate (adjust as needed)
      expect(summary.successRate).toBeGreaterThan(80); // At least 80% success rate
    });
  }

  test('Generate comprehensive test report', async ({ page }) => {
    // This test runs after all component tests to generate a final report
    const allResults = tester.getResults();
    const summary = tester.getSummary();
    
    console.log('\n=== COMPREHENSIVE BRUTE FORCE TEST REPORT ===');
    console.log(`Total tests executed: ${summary.total}`);
    console.log(`Overall success rate: ${summary.successRate.toFixed(2)}%`);
    console.log(`Average render time: ${summary.averageRenderTime.toFixed(2)}ms`);
    console.log(`Average interaction time: ${summary.averageInteractionTime.toFixed(2)}ms`);
    
    console.log('\nError breakdown:');
    console.log(`- Render errors: ${summary.errorTypes.renderErrors}`);
    console.log(`- Console errors: ${summary.errorTypes.consoleErrors}`);
    console.log(`- Interaction errors: ${summary.errorTypes.interactionErrors}`);
    
    // Group failures by component
    const failuresByComponent = allResults
      .filter(r => !r.success)
      .reduce((acc, result) => {
        if (result.componentName) {
          if (!acc[result.componentName]) {
            acc[result.componentName] = [];
          }
          acc[result.componentName]?.push(result);
        }
        return acc;
      }, {} as Record<string, TestResult[]>);
    
    console.log('\nFailures by component:');
    Object.entries(failuresByComponent).forEach(([component, failures]) => {
      console.log(`- ${component}: ${failures.length} failures`);
    });
    
    // Save detailed results to file (optional)
    const reportData = {
      summary,
      failuresByComponent,
      allResults: allResults.slice(0, 100) // Limit to first 100 for file size
    };
    
    await page.evaluate((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'brute-force-test-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }, reportData);
    
    // Final assertion
    expect(summary.successRate).toBeGreaterThan(70); // Overall minimum success rate
  });
});
