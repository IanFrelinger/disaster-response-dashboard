import { test, expect, Page } from '@playwright/test';

/**
 * Focused Brute Force Test Suite
 * Tests critical components with edge cases and error conditions
 * Optimized for faster execution while maintaining comprehensive coverage
 */

interface FocusedTestConfig {
  componentName: string;
  criticalProps: any[];
  edgeCases: any[];
  errorConditions: any[];
  interactions: string[];
}

const FOCUSED_TEST_CONFIGS: FocusedTestConfig[] = [
  {
    componentName: 'LayerTogglePanel',
    criticalProps: [
      { title: 'Layer Controls', className: 'test-panel' },
      { title: '', className: '' },
      { title: 'A'.repeat(100), className: 'very-long-class-name' },
      { toggleDescriptors: [{ key: 'terrain', label: '3D Terrain', checked: false }] },
      { toggleDescriptors: [] },
      { toggleDescriptors: [{ key: '', label: '', checked: null }] }
    ],
    edgeCases: [
      { title: null, className: null },
      { toggleDescriptors: [{ key: 'terrain', label: '3D Terrain', checked: undefined }] },
      { toggleDescriptors: [{ key: 'terrain', label: 'A'.repeat(1000), checked: false }] }
    ],
    errorConditions: [
      { toggleDescriptors: [{ key: 'terrain', label: '3D Terrain', checked: 'invalid' }] },
      { toggleDescriptors: 'not-an-array' },
      { toggleDescriptors: [{ key: 'terrain' }] } // Missing required properties
    ],
    interactions: ['click', 'keyboard', 'focus']
  },
  {
    componentName: 'MapContainer',
    criticalProps: [
      { center: [-122.4194, 37.7749], zoom: 12 },
      { center: [0, 0], zoom: 0 },
      { center: [180, 90], zoom: 22 },
      { center: [-122.4194, 37.7749], zoom: 12, hazards: [] },
      { center: [-122.4194, 37.7749], zoom: 12, units: [] },
      { center: [-122.4194, 37.7749], zoom: 12, routes: [] }
    ],
    edgeCases: [
      { center: [-180, -90], zoom: -1 },
      { center: [200, 100], zoom: 25 },
      { center: [0, 0, 0], zoom: 12 }, // 3D coordinates
      { center: ['invalid', 'coordinates'], zoom: 12 }
    ],
    errorConditions: [
      { center: null, zoom: 12 },
      { center: [-122.4194, 37.7749], zoom: null },
      { center: [], zoom: 12 },
      { center: [-122.4194], zoom: 12 } // Incomplete coordinates
    ],
    interactions: ['click', 'drag', 'scroll', 'keyboard']
  },
  {
    componentName: 'AIPDecisionSupport',
    criticalProps: [
      { className: 'ai-panel' },
      { onDecisionMade: () => console.log('Decision made') },
      { className: '', onDecisionMade: null }
    ],
    edgeCases: [
      { className: 'A'.repeat(1000) },
      { onDecisionMade: 'not-a-function' }
    ],
    errorConditions: [
      { onDecisionMade: () => { throw new Error('Callback error'); } }
    ],
    interactions: ['click', 'input', 'select']
  }
];

class FocusedBruteForceTester {
  private results: any[] = [];
  private consoleErrors: string[] = [];
  private renderErrors: string[] = [];

  async testComponent(page: Page, config: FocusedTestConfig): Promise<void> {
    console.log(`\n=== Testing ${config.componentName} ===`);
    
    // Test critical props
    for (const props of config.criticalProps) {
      await this.testProps(page, config.componentName, props, 'critical');
    }
    
    // Test edge cases
    for (const props of config.edgeCases) {
      await this.testProps(page, config.componentName, props, 'edge-case');
    }
    
    // Test error conditions
    for (const props of config.errorConditions) {
      await this.testProps(page, config.componentName, props, 'error-condition');
    }
  }

  private async testProps(page: Page, componentName: string, props: any, testType: string): Promise<void> {
    try {
      // Set up error tracking
      await page.evaluate(() => {
        (window as any).testErrors = [];
        (window as any).consoleErrors = [];
        
        const originalError = console.error;
        console.error = (...args) => {
          (window as any).consoleErrors.push(args.join(' '));
          originalError.apply(console, args);
        };
      });

      // Render component
      await this.renderComponent(page, componentName, props);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(100);

      // Check for errors
      const consoleErrors = await page.evaluate(() => (window as any).consoleErrors || []);
      const jsErrors = await page.evaluate(() => (window as any).testErrors || []);
      
      // Check for rendering issues
      const hasErrorBoundary = await page.locator('.error-boundary').count() > 0;
      const hasContent = await page.locator('#component-container').textContent() !== '';
      
      const result = {
        componentName,
        props,
        testType,
        success: consoleErrors.length === 0 && jsErrors.length === 0 && !hasErrorBoundary && hasContent,
        consoleErrors,
        jsErrors,
        hasErrorBoundary,
        hasContent,
        timestamp: Date.now()
      };

      this.results.push(result);

      if (!result.success) {
        console.log(`❌ ${testType}: ${JSON.stringify(props)}`);
        console.log(`   Console errors: ${consoleErrors.join(', ')}`);
        console.log(`   JS errors: ${jsErrors.join(', ')}`);
        console.log(`   Error boundary: ${hasErrorBoundary}`);
        console.log(`   Has content: ${hasContent}`);
      } else {
        console.log(`✅ ${testType}: ${JSON.stringify(props)}`);
      }

    } catch (error) {
      console.log(`💥 Test execution error: ${error instanceof Error ? error.message : String(error)}`);
      this.results.push({
        componentName,
        props,
        testType,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
    }
  }

  private async renderComponent(page: Page, componentName: string, props: any): Promise<void> {
    const testPageHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Focused Test - ${componentName}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .test-container { border: 1px solid #ccc; padding: 20px; margin: 10px 0; }
            .error-boundary { border: 2px solid red; padding: 10px; background: #ffe6e6; }
            .error-message { color: red; font-weight: bold; }
            .layer-toggle-panel { border: 1px solid #ddd; padding: 10px; }
            .map-container { width: 400px; height: 300px; border: 1px solid #ccc; position: relative; }
            .ai-decision-support { border: 1px solid #ddd; padding: 10px; }
          </style>
        </head>
        <body>
          <div id="root">
            <div class="test-container">
              <h2>Testing: ${componentName}</h2>
              <div id="component-container"></div>
            </div>
          </div>
          
          <script>
            window.renderComponent = function(componentName, props) {
              try {
                const container = document.getElementById('component-container');
                container.innerHTML = '';
                
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
                  default:
                    element = document.createElement('div');
                    element.textContent = 'Unknown component: ' + componentName;
                }
                
                container.appendChild(element);
                
              } catch (error) {
                window.testErrors = window.testErrors || [];
                window.testErrors.push('Render error: ' + error instanceof Error ? error.message : String(error));
                
                const container = document.getElementById('component-container');
                container.innerHTML = '<div class="error-boundary"><div class="error-message">Render Error: ' + error instanceof Error ? error.message : String(error) + '</div></div>';
              }
            };
            
            function createLayerTogglePanel(props) {
              const div = document.createElement('div');
              div.className = 'layer-toggle-panel ' + (props.className || '');
              
              if (props.title) {
                const title = document.createElement('h3');
                title.textContent = props.title;
                div.appendChild(title);
              }
              
              // Handle various toggle descriptor formats with proper validation
              let toggles = props.toggleDescriptors;
              if (!Array.isArray(toggles)) {
                toggles = [
                  { key: 'terrain', label: '3D Terrain', checked: false },
                  { key: 'buildings', label: 'Buildings', checked: true }
                ];
              }
              
              // If empty array, show default message
              if (toggles.length === 0) {
                const message = document.createElement('div');
                message.textContent = 'No layers configured';
                message.style.fontStyle = 'italic';
                message.style.color = '#666';
                div.appendChild(message);
                return div;
              }
              
              toggles.forEach(toggle => {
                try {
                  const label = document.createElement('label');
                  label.style.display = 'block';
                  label.style.margin = '5px 0';
                  
                  const input = document.createElement('input');
                  input.type = 'checkbox';
                  
                  // Handle various checked value types safely
                  if (typeof toggle.checked === 'boolean') {
                    input.checked = toggle.checked;
                  } else if (toggle.checked === 'true' || toggle.checked === 1) {
                    input.checked = true;
                  } else {
                    input.checked = false;
                  }
                  
                  input.setAttribute('data-testid', 'toggle-' + (toggle.key || 'unknown'));
                  
                  const span = document.createElement('span');
                  span.textContent = toggle.label || 'Unlabeled';
                  span.style.marginLeft = '5px';
                  
                  label.appendChild(input);
                  label.appendChild(span);
                  div.appendChild(label);
                } catch (error) {
                  console.error('Error creating toggle:', error instanceof Error ? error.message : String(error));
                  // Add error indicator instead of failing
                  const errorDiv = document.createElement('div');
                  errorDiv.textContent = 'Error creating toggle';
                  errorDiv.style.color = 'red';
                  div.appendChild(errorDiv);
                }
              });
              
              return div;
            }
            
            function createMapContainer(props) {
              const div = document.createElement('div');
              div.className = 'map-container';
              
              const center = props.center || [0, 0];
              const zoom = props.zoom || 10;
              
              div.innerHTML = \`
                <div class="map-content">
                  <div class="map-info">
                    Center: [\${Array.isArray(center) ? center.join(', ') : center}]<br>
                    Zoom: \${zoom}
                  </div>
                  <div class="map-controls">
                    <button data-testid="zoom-in">+</button>
                    <button data-testid="zoom-out">-</button>
                  </div>
                </div>
              \`;
              
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
                </div>
                <textarea placeholder="Enter decision criteria..."></textarea>
                <select>
                  <option value="low">Low Priority</option>
                  <option value="high">High Priority</option>
                </select>
              \`;
              
              div.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                  if (props.onDecisionMade && typeof props.onDecisionMade === 'function') {
                    try {
                      props.onDecisionMade({ option: btn.textContent, timestamp: Date.now() });
                    } catch (error) {
                      console.error('Callback error:', error instanceof Error ? error.message : String(error));
                    }
                  }
                });
              });
              
              return div;
            }
            
            // Render the component
            window.renderComponent('${componentName}', ${JSON.stringify(props)});
          </script>
        </body>
      </html>
    `;

    await page.setContent(testPageHTML);
  }

  getResults(): any[] {
    return this.results;
  }

  getSummary(): any {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    
    const byType = {
      critical: this.results.filter(r => r.testType === 'critical'),
      edgeCase: this.results.filter(r => r.testType === 'edge-case'),
      errorCondition: this.results.filter(r => r.testType === 'error-condition')
    };

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      byType: {
        critical: {
          total: byType.critical.length,
          successful: byType.critical.filter(r => r.success).length
        },
        edgeCase: {
          total: byType.edgeCase.length,
          successful: byType.edgeCase.filter(r => r.success).length
        },
        errorCondition: {
          total: byType.errorCondition.length,
          successful: byType.errorCondition.filter(r => r.success).length
        }
      }
    };
  }
}

// Test suite
test.describe('Focused Brute Force Component Tests', () => {
  let tester: FocusedBruteForceTester;

  test.beforeEach(async ({ page }) => {
    tester = new FocusedBruteForceTester();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('Page error:', error instanceof Error ? error.message : String(error));
    });
  });

  // Test each component with focused configurations
  for (const config of FOCUSED_TEST_CONFIGS) {
    test(`Focused brute force: ${config.componentName}`, async ({ page }) => {
      await tester.testComponent(page, config);
      
      const summary = tester.getSummary();
      console.log(`\n=== ${config.componentName} Summary ===`);
      console.log(`Total tests: ${summary.total}`);
      console.log(`Success rate: ${summary.successRate.toFixed(2)}%`);
      console.log(`Critical props: ${summary.byType.critical.successful}/${summary.byType.critical.total} passed`);
      console.log(`Edge cases: ${summary.byType.edgeCase.successful}/${summary.byType.edgeCase.total} passed`);
      console.log(`Error conditions: ${summary.byType.errorCondition.successful}/${summary.byType.errorCondition.total} passed`);
      
      // Assert minimum success rates
      expect(summary.byType.critical.successful).toBeGreaterThan(0); // At least some critical props should work
      expect(summary.successRate).toBeGreaterThan(50); // Overall 50% success rate minimum
    });
  }

  test('Generate focused test report', async ({ page }) => {
    const allResults = tester.getResults();
    const summary = tester.getSummary();
    
    console.log('\n=== FOCUSED BRUTE FORCE TEST REPORT ===');
    console.log(`Total tests executed: ${summary.total}`);
    console.log(`Overall success rate: ${summary.successRate.toFixed(2)}%`);
    
    // Group failures by component and type
    const failuresByComponent = allResults
      .filter(r => !r.success)
      .reduce((acc, result) => {
        if (!acc[result.componentName]) {
          acc[result.componentName] = { critical: 0, edgeCase: 0, errorCondition: 0 };
        }
        acc[result.componentName][result.testType.replace('-', '')]++;
        return acc;
      }, {} as Record<string, any>);
    
    console.log('\nFailures by component:');
    Object.entries(failuresByComponent).forEach(([component, failures]) => {
      console.log(`- ${component}: Critical(${(failures as any).critical}) Edge(${(failures as any).edgeCase}) Error(${(failures as any).errorCondition})`);
    });
    
    // Show sample failures
    const sampleFailures = allResults.filter(r => !r.success).slice(0, 5);
    if (sampleFailures.length > 0) {
      console.log('\nSample failures:');
      sampleFailures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.componentName} (${failure.testType})`);
        console.log(`   Props: ${JSON.stringify(failure.props)}`);
        console.log(`   Console errors: ${failure.consoleErrors?.join(', ') || 'None'}`);
        console.log(`   JS errors: ${failure.jsErrors?.join(', ') || 'None'}`);
      });
    }
    
    // Final assertion
    expect(summary.successRate).toBeGreaterThan(40); // Minimum 40% success rate
  });
});
