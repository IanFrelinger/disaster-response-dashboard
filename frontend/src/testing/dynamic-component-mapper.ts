/**
 * Dynamic Component Mapping System
 * Automatically discovers components, analyzes their props, and generates test configurations
 * Adapts to changes in the codebase without manual updates
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface DynamicComponentInfo {
  name: string;
  filePath: string;
  props: DynamicPropInfo[];
  interactions: DynamicInteractionInfo[];
  errorBoundary: boolean;
  async: boolean;
  lastModified: Date;
}

export interface DynamicPropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  possibleValues: any[];
  description?: string;
}

export interface DynamicInteractionInfo {
  type: string;
  selector: string;
  testId?: string;
  possibleValues?: any[];
  keyboardKeys?: string[];
}

export class DynamicComponentMapper {
  private components: Map<string, DynamicComponentInfo> = new Map();
  private componentDir: string;
  private testDir: string;

  constructor(componentDir: string = 'src/components', testDir: string = 'src/testing') {
    this.componentDir = componentDir;
    this.testDir = testDir;
  }

  /**
   * Discover all React components in the codebase
   */
  async discoverComponents(): Promise<DynamicComponentInfo[]> {
    const componentFiles = await this.findComponentFiles();
    const components: DynamicComponentInfo[] = [];

    for (const file of componentFiles) {
      try {
        const componentInfo = await this.analyzeComponentFile(file);
        if (componentInfo) {
          components.push(componentInfo);
          this.components.set(componentInfo.name, componentInfo);
        }
      } catch (error) {
        console.warn(`Failed to analyze component file ${file}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return components;
  }

  /**
   * Find all potential component files
   */
  private async findComponentFiles(): Promise<string[]> {
    const patterns = [
      `${this.componentDir}/**/*.tsx`,
      `${this.componentDir}/**/*.ts`,
      `${this.componentDir}/**/*.jsx`,
      `${this.componentDir}/**/*.js`
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: process.cwd() });
      files.push(...matches);
    }

    return files.filter(file => 
      !file.includes('.test.') && 
      !file.includes('.spec.') && 
      !file.includes('.stories.') &&
      !file.includes('__tests__')
    );
  }

  /**
   * Analyze a component file to extract information
   */
  private async analyzeComponentFile(filePath: string): Promise<DynamicComponentInfo | null> {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const stats = fs.statSync(fullPath);

    // Extract component name
    const componentName = this.extractComponentName(content, filePath);
    if (!componentName) return null;

    // Extract props interface
    const props = this.extractProps(content);
    
    // Extract interactions
    const interactions = this.extractInteractions(content);
    
    // Determine if it's an error boundary
    const errorBoundary = this.isErrorBoundary(content);
    
    // Determine if it's async
    const async = this.isAsyncComponent(content);

    return {
      name: componentName,
      filePath: filePath,
      props,
      interactions,
      errorBoundary,
      async,
      lastModified: stats.mtime
    };
  }

  /**
   * Extract component name from file content
   */
  private extractComponentName(content: string, filePath: string): string | null {
    // Try to find exported component
    const exportMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
    if (exportMatch) return exportMatch[1] || null;

    // Try to find default export
    const defaultMatch = content.match(/export\s+default\s+(\w+)/);
    if (defaultMatch) return defaultMatch[1] || null;

    // Try to find component in JSX
    const jsxMatch = content.match(/<(\w+)[\s>]/);
    if (jsxMatch) return jsxMatch[1] || null;

    // Fallback to filename
    const fileName = path.basename(filePath, path.extname(filePath));
    return fileName.replace(/\.(component|container|panel|dashboard)$/i, '');
  }

  /**
   * Extract props information from TypeScript interfaces
   */
  private extractProps(content: string): DynamicPropInfo[] {
    const props: DynamicPropInfo[] = [];

    // Find interface definitions
    const interfaceRegex = /interface\s+(\w+Props?)\s*\{([^}]+)\}/g;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceContent = match[2];
      const propMatches = interfaceContent?.match(/(\w+)(\?)?\s*:\s*([^;,\n]+)/g);
      
      if (propMatches) {
        for (const propMatch of propMatches) {
          const propInfo = this.parsePropDefinition(propMatch);
          if (propInfo) {
            props.push(propInfo);
          }
        }
      }
    }

    return props;
  }

  /**
   * Parse individual prop definition
   */
  private parsePropDefinition(propDef: string): DynamicPropInfo | null {
    const match = propDef.match(/(\w+)(\?)?\s*:\s*(.+)/);
    if (!match) return null;

    const [, name, optional, type] = match;
    const required = !optional;
    
    return {
      name: name || 'unknown',
      type: type?.trim() || 'unknown',
      required,
      possibleValues: this.generatePossibleValues(type?.trim() || 'unknown'),
      description: this.extractPropDescription(propDef)
    };
  }

  /**
   * Generate possible values for a prop type
   */
  private generatePossibleValues(type: string): any[] {
    const values: any[] = [];

    // Handle different type patterns
    if (type.includes('string')) {
      values.push('', 'test', 'A'.repeat(100), null, undefined);
    }
    
    if (type.includes('number')) {
      values.push(0, 1, -1, 100, 0.5, null, undefined, NaN, Infinity);
    }
    
    if (type.includes('boolean')) {
      values.push(true, false, null, undefined);
    }
    
    if (type.includes('[]') || type.includes('Array')) {
      values.push([], [1, 2, 3], null, undefined, 'not-an-array');
    }
    
    if (type.includes('{}') || type.includes('object')) {
      values.push({}, { key: 'value' }, null, undefined);
    }
    
    if (type.includes('function') || type.includes('=>')) {
      values.push(undefined, null, () => {}, 'not-a-function');
    }

    // Handle union types
    if (type.includes('|')) {
      const unionTypes = type.split('|').map(t => t.trim());
      for (const unionType of unionTypes) {
        values.push(...this.generatePossibleValues(unionType));
      }
    }

    // Handle optional types
    if (type.includes('?')) {
      values.push(undefined);
    }

    return [...new Set(values)]; // Remove duplicates
  }

  /**
   * Extract prop description from JSDoc comments
   */
  private extractPropDescription(propDef: string): string | undefined {
    // This would need more sophisticated parsing in a real implementation
    return undefined;
  }

  /**
   * Extract interaction patterns from component content
   */
  private extractInteractions(content: string): DynamicInteractionInfo[] {
    const interactions: DynamicInteractionInfo[] = [];

    // Look for common interaction patterns
    if (content.includes('onClick') || content.includes('onClick=')) {
      interactions.push({
        type: 'click',
        selector: 'button, [role="button"], .clickable',
        testId: 'click-target'
      });
    }

    if (content.includes('onChange') || content.includes('onInput')) {
      interactions.push({
        type: 'input',
        selector: 'input, textarea, select',
        testId: 'input-field'
      });
    }

    if (content.includes('onFocus') || content.includes('onBlur')) {
      interactions.push({
        type: 'focus',
        selector: 'input, button, [tabindex]',
        testId: 'focus-target'
      });
    }

    if (content.includes('onKeyDown') || content.includes('onKeyUp')) {
      interactions.push({
        type: 'keyboard',
        selector: 'input, button, [tabindex]',
        keyboardKeys: ['Tab', 'Enter', 'Space', 'Escape']
      });
    }

    if (content.includes('onMouseEnter') || content.includes('onMouseLeave')) {
      interactions.push({
        type: 'hover',
        selector: '.hoverable, button, a',
        testId: 'hover-target'
      });
    }

    // Look for data-testid attributes
    const testIdMatches = content.match(/data-testid=["']([^"']+)["']/g);
    if (testIdMatches) {
      for (const match of testIdMatches) {
        const testId = match.match(/data-testid=["']([^"']+)["']/)?.[1];
        if (testId) {
          interactions.push({
            type: 'click',
            selector: `[data-testid="${testId}"]`,
            testId
          });
        }
      }
    }

    return interactions;
  }

  /**
   * Check if component is an error boundary
   */
  private isErrorBoundary(content: string): boolean {
    return content.includes('componentDidCatch') || 
           content.includes('getDerivedStateFromError') ||
           content.includes('ErrorBoundary') ||
           content.includes('error-boundary');
  }

  /**
   * Check if component is async or uses async operations
   */
  private isAsyncComponent(content: string): boolean {
    return content.includes('async') || 
           content.includes('await') || 
           content.includes('Promise') ||
           content.includes('useEffect') ||
           content.includes('useState');
  }

  /**
   * Generate test configuration for a component
   */
  generateTestConfig(component: DynamicComponentInfo): any {
    return {
      componentName: component.name,
      filePath: component.filePath,
      props: component.props.map(prop => ({
        name: prop.name,
        type: prop.type,
        required: prop.required,
        possibleValues: prop.possibleValues.slice(0, 10) // Limit for performance
      })),
      interactions: component.interactions,
      errorBoundary: component.errorBoundary,
      async: component.async,
      lastModified: component.lastModified
    };
  }

  /**
   * Generate all test configurations
   */
  generateAllTestConfigs(): any[] {
    return Array.from(this.components.values()).map(component => 
      this.generateTestConfig(component)
    );
  }

  /**
   * Check for changes since last discovery
   */
  async checkForChanges(): Promise<DynamicComponentInfo[]> {
    const changedComponents: DynamicComponentInfo[] = [];
    
    for (const [name, component] of this.components) {
      try {
        const stats = fs.statSync(component.filePath);
        if (stats.mtime > component.lastModified) {
          const updatedComponent = await this.analyzeComponentFile(component.filePath);
          if (updatedComponent) {
            changedComponents.push(updatedComponent);
            this.components.set(name, updatedComponent);
          }
        }
      } catch (error) {
        console.warn(`Failed to check changes for ${name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return changedComponents;
  }

  /**
   * Save component map to file
   */
  async saveComponentMap(outputPath: string): Promise<void> {
    const configs = this.generateAllTestConfigs();
    const content = `// Auto-generated component map
// Generated at: ${new Date().toISOString()}

export const DYNAMIC_COMPONENT_MAP = ${JSON.stringify(configs, null, 2)};

export const COMPONENT_COUNT = ${configs.length};
export const LAST_UPDATED = '${new Date().toISOString()}';
`;

    fs.writeFileSync(outputPath, content);
  }

  /**
   * Load component map from file
   */
  async loadComponentMap(inputPath: string): Promise<void> {
    if (fs.existsSync(inputPath)) {
      const content = fs.readFileSync(inputPath, 'utf-8');
      // Parse the exported configuration
      const match = content.match(/export const DYNAMIC_COMPONENT_MAP = (\[[\s\S]*?\]);/);
      if (match) {
        const configs = JSON.parse(match[1] || '{}');
        for (const config of configs) {
          this.components.set(config.componentName, config as DynamicComponentInfo);
        }
      }
    }
  }
}
