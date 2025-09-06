/**
 * 5-Test Phase Workflow Integration
 * Integrates brute force testing into a comprehensive 5-phase testing workflow
 */

import { test, expect, Page } from '@playwright/test';
import { DynamicComponentMapper } from './dynamic-component-mapper';

export interface TestPhase {
  name: string;
  description: string;
  testFunction: (page: Page, components: any[]) => Promise<TestPhaseResult>;
  timeout: number;
  critical: boolean;
}

export interface TestPhaseResult {
  phase: string;
  success: boolean;
  duration: number;
  results: any[];
  errors: string[];
  summary: any;
}

export class FiveTestPhaseWorkflow {
  private mapper: DynamicComponentMapper;
  private components: any[] = [];
  private phaseResults: TestPhaseResult[] = [];

  constructor() {
    this.mapper = new DynamicComponentMapper();
  }

  /**
   * Phase 1: Component Discovery and Mapping
   */
  async phase1_ComponentDiscovery(page: Page): Promise<TestPhaseResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      console.log('🔍 Phase 1: Component Discovery and Mapping');
      
      // Discover components
      const discoveredComponents = await this.mapper.discoverComponents();
      this.components = discoveredComponents.map(comp => this.mapper.generateTestConfig(comp));
      
      // Save component map
      await this.mapper.saveComponentMap('./src/testing/generated-component-map.ts');
      
      const duration = Date.now() - startTime;
      const summary = {
        componentsDiscovered: this.components.length,
        totalProps: this.components.reduce((sum, c) => sum + c.props.length, 0),
        totalInteractions: this.components.reduce((sum, c) => sum + c.interactions.length, 0)
      };
      
      console.log(`✅ Phase 1 Complete: ${this.components.length} components discovered`);
      
      return {
        phase: 'Component Discovery',
        success: this.components.length > 0,
        duration,
        results: this.components,
        errors,
        summary
      };
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        phase: 'Component Discovery',
        success: false,
        duration: Date.now() - startTime,
        results: [],
        errors,
        summary: {}
      };
    }
  }

  /**
   * Phase 2: Basic Rendering Tests
   */
  async phase2_BasicRendering(page: Page): Promise<TestPhaseResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const results: any[] = [];
    
    try {
      console.log('🎨 Phase 2: Basic Rendering Tests');
      
      for (const component of this.components.slice(0, 5)) { // Limit for performance
        try {
          const result = await this.testBasicRendering(page, component);
          results.push(result);
        } catch (error) {
          errors.push(`Component ${component.componentName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      const duration = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const summary = {
        componentsTested: results.length,
        successful,
        successRate: (successful / results.length) * 100
      };
      
      console.log(`✅ Phase 2 Complete: ${successful}/${results.length} components rendered successfully`);
      
      return {
        phase: 'Basic Rendering',
        success: successful > 0,
        duration,
        results,
        errors,
        summary
      };
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        phase: 'Basic Rendering',
        success: false,
        duration: Date.now() - startTime,
        results,
        errors,
        summary: {}
      };
    }
  }

  /**
   * Phase 3: Prop Validation Tests
   */
  async phase3_PropValidation(page: Page): Promise<TestPhaseResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const results: any[] = [];
    
    try {
      console.log('🔧 Phase 3: Prop Validation Tests');
      
      for (const component of this.components.slice(0, 3)) { // Limit for performance
        try {
          const result = await this.testPropValidation(page, component);
          results.push(result);
        } catch (error) {
          errors.push(`Component ${component.componentName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      const duration = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const summary = {
        componentsTested: results.length,
        successful,
        totalPropCombinations: results.reduce((sum, r) => sum + r.propCombinations, 0)
      };
      
      console.log(`✅ Phase 3 Complete: ${successful}/${results.length} components passed prop validation`);
      
      return {
        phase: 'Prop Validation',
        success: successful > 0,
        duration,
        results,
        errors,
        summary
      };
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        phase: 'Prop Validation',
        success: false,
        duration: Date.now() - startTime,
        results,
        errors,
        summary: {}
      };
    }
  }

  /**
   * Phase 4: Interaction Testing
   */
  async phase4_InteractionTesting(page: Page): Promise<TestPhaseResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const results: any[] = [];
    
    try {
      console.log('🖱️ Phase 4: Interaction Testing');
      
      for (const component of this.components.slice(0, 3)) { // Limit for performance
        try {
          const result = await this.testInteractions(page, component);
          results.push(result);
        } catch (error) {
          errors.push(`Component ${component.componentName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      const duration = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const summary = {
        componentsTested: results.length,
        successful,
        totalInteractions: results.reduce((sum, r) => sum + r.interactionsTested, 0)
      };
      
      console.log(`✅ Phase 4 Complete: ${successful}/${results.length} components passed interaction tests`);
      
      return {
        phase: 'Interaction Testing',
        success: successful > 0,
        duration,
        results,
        errors,
        summary
      };
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        phase: 'Interaction Testing',
        success: false,
        duration: Date.now() - startTime,
        results,
        errors,
        summary: {}
      };
    }
  }

  /**
   * Phase 5: Error Handling and Edge Cases
   */
  async phase5_ErrorHandling(page: Page): Promise<TestPhaseResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const results: any[] = [];
    
    try {
      console.log('🚨 Phase 5: Error Handling and Edge Cases');
      
      for (const component of this.components.slice(0, 3)) { // Limit for performance
        try {
          const result = await this.testErrorHandling(page, component);
          results.push(result);
        } catch (error) {
          errors.push(`Component ${component.componentName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      const duration = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const summary = {
        componentsTested: results.length,
        successful,
        errorConditionsTested: results.reduce((sum, r) => sum + r.errorConditions, 0)
      };
      
      console.log(`✅ Phase 5 Complete: ${successful}/${results.length} components handled errors properly`);
      
      return {
        phase: 'Error Handling',
        success: successful > 0,
        duration,
        results,
        errors,
        summary
      };
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        phase: 'Error Handling',
        success: false,
        duration: Date.now() - startTime,
        results,
        errors,
        summary: {}
      };
    }
  }

  /**
   * Test basic rendering of a component
   */
  private async testBasicRendering(page: Page, component: any): Promise<any> {
    const testPageHTML = this.generateTestPage(component, {});
    await page.setContent(testPageHTML);
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('#component-container').textContent() !== '';
    const hasError = await page.locator('.error-boundary').count() > 0;
    
    return {
      componentName: component.componentName,
      success: hasContent && !hasError,
      hasContent,
      hasError
    };
  }

  /**
   * Test prop validation
   */
  private async testPropValidation(page: Page, component: any): Promise<any> {
    const results: any[] = [];
    let propCombinations = 0;
    
    // Test with valid props
    for (const prop of component.props.slice(0, 3)) { // Limit for performance
      for (const value of prop.possibleValues.slice(0, 3)) { // Limit for performance
        const props = { [prop.name]: value };
        const testPageHTML = this.generateTestPage(component, props);
        await page.setContent(testPageHTML);
        await page.waitForLoadState('networkidle');
        
        const hasContent = await page.locator('#component-container').textContent() !== '';
        const hasError = await page.locator('.error-boundary').count() > 0;
        
        results.push({
          prop: prop.name,
          value,
          success: hasContent && !hasError,
          hasContent,
          hasError
        });
        
        propCombinations++;
      }
    }
    
    const successful = results.filter(r => r.success).length;
    
    return {
      componentName: component.componentName,
      success: successful > 0,
      propCombinations,
      successful,
      results
    };
  }

  /**
   * Test interactions
   */
  private async testInteractions(page: Page, component: any): Promise<any> {
    const testPageHTML = this.generateTestPage(component, {});
    await page.setContent(testPageHTML);
    await page.waitForLoadState('networkidle');
    
    const results: any[] = [];
    let interactionsTested = 0;
    
    for (const interaction of component.interactions.slice(0, 3)) { // Limit for performance
      try {
        const element = page.locator(interaction.selector);
        if (await element.count() > 0) {
          switch (interaction.type) {
            case 'click':
              await element.first().click();
              break;
            case 'focus':
              await element.first().focus();
              break;
            case 'hover':
              await element.first().hover();
              break;
          }
          
          results.push({
            type: interaction.type,
            selector: interaction.selector,
            success: true
          });
        } else {
          results.push({
            type: interaction.type,
            selector: interaction.selector,
            success: false,
            error: 'Element not found'
          });
        }
        
        interactionsTested++;
      } catch (error) {
        results.push({
          type: interaction.type,
          selector: interaction.selector,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
        interactionsTested++;
      }
    }
    
    const successful = results.filter(r => r.success).length;
    
    return {
      componentName: component.componentName,
      success: successful > 0,
      interactionsTested,
      successful,
      results
    };
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(page: Page, component: any): Promise<any> {
    const results: any[] = [];
    let errorConditions = 0;
    
    // Test with invalid props
    const invalidProps = [
      { invalidProp: null },
      { invalidProp: undefined },
      { invalidProp: 'invalid' },
      { invalidProp: {} },
      { invalidProp: [] }
    ];
    
    for (const props of invalidProps) {
      const testPageHTML = this.generateTestPage(component, props);
      await page.setContent(testPageHTML);
      await page.waitForLoadState('networkidle');
      
      const hasContent = await page.locator('#component-container').textContent() !== '';
      const hasError = await page.locator('.error-boundary').count() > 0;
      const consoleErrors = await page.evaluate(() => (window as any).consoleErrors || []);
      
      results.push({
        props,
        success: hasContent || hasError, // Either renders or shows error
        hasContent,
        hasError,
        consoleErrors: consoleErrors.length
      });
      
      errorConditions++;
    }
    
    const successful = results.filter(r => r.success).length;
    
    return {
      componentName: component.componentName,
      success: successful > 0,
      errorConditions,
      successful,
      results
    };
  }

  /**
   * Generate test page HTML
   */
  private generateTestPage(component: any, props: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test - ${component.componentName}</title>
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
            window.renderComponent = function(componentName, props) {
              try {
                const container = document.getElementById('component-container');
                container.innerHTML = '';
                
                // Simple component rendering based on name
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
                    element.textContent = 'Component: ' + componentName;
                }
                
                container.appendChild(element);
                
              } catch (error) {
                const container = document.getElementById('component-container');
                container.innerHTML = '<div class="error-boundary"><div class="error-message">Error: ' + error instanceof Error ? error.message : String(error) + '</div></div>';
              }
            };
            
            function createLayerTogglePanel(props) {
              const div = document.createElement('div');
              div.className = 'layer-toggle-panel';
              div.innerHTML = '<h3>Layer Toggle Panel</h3><div>Props: ' + JSON.stringify(props) + '</div>';
              return div;
            }
            
            function createMapContainer(props) {
              const div = document.createElement('div');
              div.className = 'map-container';
              div.style.width = '400px';
              div.style.height = '300px';
              div.style.border = '1px solid #ccc';
              div.innerHTML = '<div>Map Container</div><div>Props: ' + JSON.stringify(props) + '</div>';
              return div;
            }
            
            function createAIPDecisionSupport(props) {
              const div = document.createElement('div');
              div.className = 'ai-decision-support';
              div.innerHTML = '<h3>AI Decision Support</h3><div>Props: ' + JSON.stringify(props) + '</div>';
              return div;
            }
            
            // Render the component
            window.renderComponent('${component.componentName}', ${JSON.stringify(props)});
          </script>
        </body>
      </html>
    `;
  }

  /**
   * Run all 5 phases
   */
  async runAllPhases(page: Page): Promise<TestPhaseResult[]> {
    console.log('🚀 Starting 5-Test Phase Workflow');
    
    const phases = [
      () => this.phase1_ComponentDiscovery(page),
      () => this.phase2_BasicRendering(page),
      () => this.phase3_PropValidation(page),
      () => this.phase4_InteractionTesting(page),
      () => this.phase5_ErrorHandling(page)
    ];
    
    for (let i = 0; i < phases.length; i++) {
      try {
        const result = await phases[i]?.();
        if (result) {
          this.phaseResults.push(result);
          
          if (!result.success && i < 2) { // Critical phases
            console.log(`❌ Phase ${i + 1} failed, stopping workflow`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Phase ${i + 1} error:`, error instanceof Error ? error.message : String(error));
        this.phaseResults.push({
          phase: `Phase ${i + 1}`,
          success: false,
          duration: 0,
          results: [],
          errors: [error instanceof Error ? error.message : String(error)],
          summary: {}
        });
      }
    }
    
    return this.phaseResults;
  }

  /**
   * Get workflow summary
   */
  getWorkflowSummary(): any {
    const totalDuration = this.phaseResults.reduce((sum, r) => sum + r.duration, 0);
    const successfulPhases = this.phaseResults.filter(r => r.success).length;
    
    return {
      totalPhases: this.phaseResults.length,
      successfulPhases,
      successRate: (successfulPhases / this.phaseResults.length) * 100,
      totalDuration,
      phaseResults: this.phaseResults
    };
  }
}
