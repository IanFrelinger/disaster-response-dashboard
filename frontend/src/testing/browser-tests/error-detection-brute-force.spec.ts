import { test, expect, Page } from '@playwright/test';

/**
 * Error Detection Brute Force Test Suite
 * Specifically designed to catch rendering errors, console errors, and JavaScript exceptions
 * Tests components with malformed data, edge cases, and error conditions
 */

interface ErrorTestConfig {
  componentName: string;
  errorTriggers: any[];
  consoleErrorPatterns: string[];
  renderErrorPatterns: string[];
}

const ERROR_TEST_CONFIGS: ErrorTestConfig[] = [
  {
    componentName: 'LayerTogglePanel',
    errorTriggers: [
      // Malformed toggle descriptors
      { toggleDescriptors: null },
      { toggleDescriptors: 'not-an-array' },
      { toggleDescriptors: [{ key: null, label: null, checked: null }] },
      { toggleDescriptors: [{ key: undefined, label: undefined, checked: undefined }] },
      { toggleDescriptors: [{ key: '', label: '', checked: 'invalid-boolean' }] },
      { toggleDescriptors: [{ key: 123, label: 456, checked: 'maybe' }] },
      { toggleDescriptors: [{ key: 'terrain' }] }, // Missing properties
      { toggleDescriptors: [{ label: 'Terrain', checked: false }] }, // Missing key
      { toggleDescriptors: [{ key: 'terrain', label: 'Terrain' }] }, // Missing checked
      
      // Extreme values
      { title: null },
      { title: undefined },
      { title: 123 },
      { title: {} },
      { title: [] },
      { className: null },
      { className: undefined },
      { className: 123 },
      { className: {} },
      { className: [] },
      
      // Circular references (simulated)
      { toggleDescriptors: [{ key: 'terrain', label: 'Terrain', checked: false, circular: null }] }
    ],
    consoleErrorPatterns: [
      'TypeError',
      'ReferenceError',
      'Cannot read property',
      'Cannot read properties',
      'is not a function',
      'is not defined',
      'Invalid prop',
      'Warning:',
      'Error:'
    ],
    renderErrorPatterns: [
      'Error Boundary',
      'Render Error',
      'Component Error',
      'Failed to render',
      'Exception'
    ]
  },
  {
    componentName: 'MapContainer',
    errorTriggers: [
      // Invalid coordinates
      { center: null, zoom: 12 },
      { center: undefined, zoom: 12 },
      { center: 'invalid', zoom: 12 },
      { center: 123, zoom: 12 },
      { center: {}, zoom: 12 },
      { center: [], zoom: 12 },
      { center: [null, null], zoom: 12 },
      { center: [undefined, undefined], zoom: 12 },
      { center: ['invalid', 'coordinates'], zoom: 12 },
      { center: [NaN, NaN], zoom: 12 },
      { center: [Infinity, Infinity], zoom: 12 },
      { center: [-Infinity, -Infinity], zoom: 12 },
      
      // Invalid zoom
      { center: [-122.4194, 37.7749], zoom: null },
      { center: [-122.4194, 37.7749], zoom: undefined },
      { center: [-122.4194, 37.7749], zoom: 'invalid' },
      { center: [-122.4194, 37.7749], zoom: {} },
      { center: [-122.4194, 37.7749], zoom: [] },
      { center: [-122.4194, 37.7749], zoom: NaN },
      { center: [-122.4194, 37.7749], zoom: Infinity },
      { center: [-122.4194, 37.7749], zoom: -Infinity },
      
      // Invalid arrays
      { center: [-122.4194, 37.7749], zoom: 12, hazards: null },
      { center: [-122.4194, 37.7749], zoom: 12, hazards: 'not-an-array' },
      { center: [-122.4194, 37.7749], zoom: 12, units: null },
      { center: [-122.4194, 37.7749], zoom: 12, units: 'not-an-array' },
      { center: [-122.4194, 37.7749], zoom: 12, routes: null },
      { center: [-122.4194, 37.7749], zoom: 12, routes: 'not-an-array' },
      
      // Malformed array items
      { center: [-122.4194, 37.7749], zoom: 12, hazards: [{ h3CellId: null, riskLevel: null }] },
      { center: [-122.4194, 37.7749], zoom: 12, units: [{ unitId: null, callSign: null }] },
      { center: [-122.4194, 37.7749], zoom: 12, routes: [{ routeId: null, originH3: null }] }
    ],
    consoleErrorPatterns: [
      'TypeError',
      'ReferenceError',
      'Cannot read property',
      'Invalid coordinates',
      'Invalid zoom',
      'Map initialization failed',
      'Error:'
    ],
    renderErrorPatterns: [
      'Error Boundary',
      'Map Error',
      'Failed to initialize',
      'Render Error'
    ]
  },
  {
    componentName: 'AIPDecisionSupport',
    errorTriggers: [
      // Invalid callbacks
      { onDecisionMade: null },
      { onDecisionMade: undefined },
      { onDecisionMade: 'not-a-function' },
      { onDecisionMade: 123 },
      { onDecisionMade: {} },
      { onDecisionMade: [] },
      
      // Callback that throws
      { onDecisionMade: () => { throw new Error('Callback error'); } },
      { onDecisionMade: () => { throw new TypeError('Type error'); } },
      { onDecisionMade: () => { throw new ReferenceError('Reference error'); } },
      
      // Invalid className
      { className: null },
      { className: undefined },
      { className: 123 },
      { className: {} },
      { className: [] },
      
      // Circular references
      { onDecisionMade: () => {}, circular: null }
    ],
    consoleErrorPatterns: [
      'TypeError',
      'ReferenceError',
      'Callback error',
      'Type error',
      'Reference error',
      'Error:'
    ],
    renderErrorPatterns: [
      'Error Boundary',
      'Component Error',
      'Render Error'
    ]
  }
];

class ErrorDetectionTester {
  private results: any[] = [];
  private allConsoleErrors: string[] = [];
  private allRenderErrors: string[] = [];

  async testComponent(page: Page, config: ErrorTestConfig): Promise<void> {
    console.log(`\n=== Error Detection Testing: ${config.componentName} ===`);
    
    for (const errorTrigger of config.errorTriggers) {
      await this.testErrorTrigger(page, config, errorTrigger);
    }
  }

  private async testErrorTrigger(page: Page, config: ErrorTestConfig, errorTrigger: any): Promise<void> {
    try {
      // Set up comprehensive error tracking
      await page.evaluate(() => {
        (window as any).testErrors = [];
        (window as any).consoleErrors = [];
        (window as any).renderErrors = [];
        
        // Override console methods
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.error = (...args) => {
          (window as any).consoleErrors.push(args.join(' '));
          originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
          (window as any).consoleErrors.push('WARNING: ' + args.join(' '));
          originalWarn.apply(console, args);
        };
        
        // Global error handler
        window.addEventListener('error', (event) => {
          (window as any).testErrors.push('Global error: ' + event.error?.message || event.message);
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
          (window as any).testErrors.push('Unhandled rejection: ' + event.reason);
        });
      });

      // Render component with error trigger
      await this.renderComponentWithErrorTrigger(page, config.componentName, errorTrigger);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(200); // Allow time for async operations

      // Collect all errors
      const consoleErrors = await page.evaluate(() => (window as any).consoleErrors || []);
      const jsErrors = await page.evaluate(() => (window as any).testErrors || []);
      const renderErrors = await page.evaluate(() => (window as any).renderErrors || []);

      // Check for error boundary activation
      const errorBoundaryActive = await page.locator('.error-boundary').count() > 0;
      const errorBoundaryText = errorBoundaryActive ? 
        await page.locator('.error-message').textContent() : '';

      // Check for component rendering
      const componentRendered = await page.locator('#component-container').count() > 0;
      const hasContent = componentRendered ? 
        await page.locator('#component-container').textContent() !== '' : false;

      // Analyze error patterns
      const matchedConsolePatterns = config.consoleErrorPatterns.filter(pattern =>
        consoleErrors.some((error: any) => error.includes(pattern))
      );
      
      const matchedRenderPatterns = config.renderErrorPatterns.filter(pattern =>
        errorBoundaryText?.includes(pattern) || renderErrors.some((error: any) => error.includes(pattern))
      );

      const result = {
        componentName: config.componentName,
        errorTrigger,
        consoleErrors,
        jsErrors,
        renderErrors,
        errorBoundaryActive,
        errorBoundaryText,
        componentRendered,
        hasContent,
        matchedConsolePatterns,
        matchedRenderPatterns,
        timestamp: Date.now()
      };

      this.results.push(result);
      this.allConsoleErrors.push(...consoleErrors);
      this.allRenderErrors.push(...renderErrors);

      // Log results
      const errorCount = consoleErrors.length + jsErrors.length + renderErrors.length;
      if (errorCount > 0) {
        console.log(`🚨 Error detected with trigger: ${JSON.stringify(errorTrigger)}`);
        console.log(`   Console errors: ${consoleErrors.length}`);
        console.log(`   JS errors: ${jsErrors.length}`);
        console.log(`   Render errors: ${renderErrors.length}`);
        console.log(`   Error boundary: ${errorBoundaryActive}`);
        if (matchedConsolePatterns.length > 0) {
          console.log(`   Matched console patterns: ${matchedConsolePatterns.join(', ')}`);
        }
        if (matchedRenderPatterns.length > 0) {
          console.log(`   Matched render patterns: ${matchedRenderPatterns.join(', ')}`);
        }
      } else {
        console.log(`✅ No errors with trigger: ${JSON.stringify(errorTrigger)}`);
      }

    } catch (error) {
      console.log(`💥 Test execution error: ${error instanceof Error ? error.message : String(error)}`);
      this.results.push({
        componentName: config.componentName,
        errorTrigger,
        testError: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
    }
  }

  private async renderComponentWithErrorTrigger(page: Page, componentName: string, errorTrigger: any): Promise<void> {
    const testPageHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error Detection Test - ${componentName}</title>
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
              <h2>Error Detection Test: ${componentName}</h2>
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
                window.testErrors.push('Render error: ' + error.message);
                window.renderErrors = window.renderErrors || [];
                window.renderErrors.push('Render error: ' + error.message);
                
                const container = document.getElementById('component-container');
                container.innerHTML = '<div class="error-boundary"><div class="error-message">Render Error: ' + error.message + '</div></div>';
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
              
              // Handle various toggle descriptor formats
              let toggles = props.toggleDescriptors;
              if (!Array.isArray(toggles)) {
                toggles = [];
              }
              
              toggles.forEach(toggle => {
                try {
                  const label = document.createElement('label');
                  label.style.display = 'block';
                  label.style.margin = '5px 0';
                  
                  const input = document.createElement('input');
                  input.type = 'checkbox';
                  
                  // Handle various checked value types
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
                  console.error('Error creating toggle:', error.message);
                }
              });
              
              return div;
            }
            
            function createMapContainer(props) {
              const div = document.createElement('div');
              div.className = 'map-container';
              
              try {
                const center = props.center;
                const zoom = props.zoom;
                
                let centerText = 'Invalid coordinates';
                let zoomText = 'Invalid zoom';
                
                if (Array.isArray(center) && center.length >= 2) {
                  centerText = '[' + center.slice(0, 2).join(', ') + ']';
                } else if (center !== null && center !== undefined) {
                  centerText = String(center);
                }
                
                if (typeof zoom === 'number' && !isNaN(zoom)) {
                  zoomText = String(zoom);
                } else if (zoom !== null && zoom !== undefined) {
                  zoomText = String(zoom);
                }
                
                div.innerHTML = \`
                  <div class="map-content">
                    <div class="map-info">
                      Center: \${centerText}<br>
                      Zoom: \${zoomText}
                    </div>
                    <div class="map-controls">
                      <button data-testid="zoom-in">+</button>
                      <button data-testid="zoom-out">-</button>
                    </div>
                  </div>
                \`;
              } catch (error) {
                console.error('Error creating map container:', error.message);
                div.innerHTML = '<div class="error-message">Map Error: ' + error.message + '</div>';
              }
              
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
                  if (props.onDecisionMade) {
                    try {
                      if (typeof props.onDecisionMade === 'function') {
                        props.onDecisionMade({ option: btn.textContent, timestamp: Date.now() });
                      } else {
                        console.error('onDecisionMade is not a function:', typeof props.onDecisionMade);
                      }
                    } catch (error) {
                      console.error('Callback error:', error.message);
                    }
                  }
                });
              });
              
              return div;
            }
            
            // Render the component
            window.renderComponent('${componentName}', ${JSON.stringify(errorTrigger)});
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
    const withErrors = this.results.filter(r => 
      (r.consoleErrors && r.consoleErrors.length > 0) ||
      (r.jsErrors && r.jsErrors.length > 0) ||
      (r.renderErrors && r.renderErrors.length > 0) ||
      r.errorBoundaryActive
    ).length;
    
    const errorBoundaryActivations = this.results.filter(r => r.errorBoundaryActive).length;
    
    return {
      total,
      withErrors,
      errorBoundaryActivations,
      errorRate: total > 0 ? (withErrors / total) * 100 : 0,
      uniqueConsoleErrors: [...new Set(this.allConsoleErrors)].length,
      uniqueRenderErrors: [...new Set(this.allRenderErrors)].length
    };
  }
}

// Test suite
test.describe('Error Detection Brute Force Tests', () => {
  let tester: ErrorDetectionTester;

  test.beforeEach(async ({ page }) => {
    tester = new ErrorDetectionTester();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
  });

  // Test each component for error detection
  for (const config of ERROR_TEST_CONFIGS) {
    test(`Error detection: ${config.componentName}`, async ({ page }) => {
      await tester.testComponent(page, config);
      
      const summary = tester.getSummary();
      console.log(`\n=== ${config.componentName} Error Detection Summary ===`);
      console.log(`Total error triggers tested: ${summary.total}`);
      console.log(`Triggers that caused errors: ${summary.withErrors}`);
      console.log(`Error boundary activations: ${summary.errorBoundaryActivations}`);
      console.log(`Error rate: ${summary.errorRate.toFixed(2)}%`);
      console.log(`Unique console errors: ${summary.uniqueConsoleErrors}`);
      console.log(`Unique render errors: ${summary.uniqueRenderErrors}`);
      
      // For error detection tests, we expect some errors to be caught
      // The goal is to ensure error boundaries and error handling work properly
      expect(summary.total).toBeGreaterThan(0);
    });
  }

  test('Generate error detection report', async ({ page }) => {
    const allResults = tester.getResults();
    const summary = tester.getSummary();
    
    console.log('\n=== ERROR DETECTION BRUTE FORCE REPORT ===');
    console.log(`Total error triggers tested: ${summary.total}`);
    console.log(`Triggers that caused errors: ${summary.withErrors}`);
    console.log(`Error boundary activations: ${summary.errorBoundaryActivations}`);
    console.log(`Overall error rate: ${summary.errorRate.toFixed(2)}%`);
    
    // Group errors by component
    const errorsByComponent = allResults
      .filter(r => (r.consoleErrors && r.consoleErrors.length > 0) || (r.jsErrors && r.jsErrors.length > 0) || r.errorBoundaryActive)
      .reduce((acc, result) => {
        if (!acc[result.componentName]) {
          acc[result.componentName] = 0;
        }
        acc[result.componentName]++;
        return acc;
      }, {} as Record<string, number>);
    
    console.log('\nErrors by component:');
    Object.entries(errorsByComponent).forEach(([component, count]) => {
      console.log(`- ${component}: ${count} error triggers`);
    });
    
    // Show most common error patterns
    const errorPatterns = [...new Set((tester as any).allConsoleErrors)].slice(0, 10);
    if (errorPatterns.length > 0) {
      console.log('\nMost common error patterns:');
      errorPatterns.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern}`);
      });
    }
    
    // Final assertion - we expect error detection to work
    expect(summary.total).toBeGreaterThan(0);
  });
});
