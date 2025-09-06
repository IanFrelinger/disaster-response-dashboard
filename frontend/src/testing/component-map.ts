/**
 * Comprehensive Component Map for Brute Force Testing
 * Maps all components with their props, possible values, and interaction patterns
 */

export interface ComponentTestConfig {
  componentName: string;
  filePath: string;
  props: PropConfig[];
  interactions: InteractionConfig[];
  errorBoundary?: boolean;
  async?: boolean;
}

export interface PropConfig {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function' | 'enum';
  required: boolean;
  defaultValue?: any;
  possibleValues?: any[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface InteractionConfig {
  type: 'click' | 'hover' | 'focus' | 'input' | 'select' | 'keyboard' | 'drag' | 'scroll';
  selector: string;
  testId?: string;
  possibleValues?: any[];
  keyboardKeys?: string[];
}

/**
 * Complete component map with all props and interaction patterns
 */
export const COMPONENT_MAP: ComponentTestConfig[] = [
  {
    componentName: 'LayerTogglePanel',
    filePath: 'src/components/LayerTogglePanel.tsx',
    props: [
      {
        name: 'title',
        type: 'string',
        required: false,
        possibleValues: [undefined, '', 'Layer Controls', 'Map Layers', 'Toggle Panel', 'A'.repeat(100)]
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        defaultValue: '',
        possibleValues: ['', 'custom-class', 'test-class', 'multiple classes here', 'class-with-dashes', 'class_with_underscores']
      },
      {
        name: 'toggleDescriptors',
        type: 'array',
        required: false,
        possibleValues: [
          undefined,
          [],
          [{ key: 'terrain', label: '3D Terrain', checked: false }],
          [{ key: 'buildings', label: 'Buildings', checked: true }],
          [{ key: 'hazards', label: 'Hazards', checked: false }],
          [{ key: 'units', label: 'Units', checked: true }],
          [{ key: 'routes', label: 'Routes', checked: false }],
          // Edge cases
          [{ key: '', label: '', checked: false }],
          [{ key: 'invalid-key', label: 'Invalid', checked: null }],
          [{ key: 'terrain', label: 'A'.repeat(1000), checked: false }]
        ]
      }
    ],
    interactions: [
      {
        type: 'click',
        selector: '[data-testid^="toggle-"]',
        testId: 'toggle-terrain'
      },
      {
        type: 'keyboard',
        selector: '[data-testid^="toggle-"]',
        keyboardKeys: ['Tab', 'Space', 'Enter', 'ArrowUp', 'ArrowDown']
      },
      {
        type: 'focus',
        selector: '[data-testid^="toggle-"]'
      }
    ],
    errorBoundary: true
  },
  {
    componentName: 'MapContainer',
    filePath: 'src/components/maps/MapContainer.tsx',
    props: [
      {
        name: 'center',
        type: 'array',
        required: true,
        possibleValues: [
          [-122.4194, 37.7749], // San Francisco
          [0, 0], // Null Island
          [-180, -90], // Edge case
          [180, 90], // Edge case
          [0, 0, 0], // 3D coordinates
          ['invalid', 'coordinates'] // Invalid
        ]
      },
      {
        name: 'zoom',
        type: 'number',
        required: true,
        min: 0,
        max: 22,
        possibleValues: [0, 1, 5, 10, 15, 20, 22, -1, 25, 0.5, 1.5]
      },
      {
        name: 'hazards',
        type: 'array',
        required: false,
        possibleValues: [
          undefined,
          [],
          [{ h3CellId: 'test', riskLevel: 'high' }],
          [{ h3CellId: '', riskLevel: '' }],
          [{ h3CellId: null, riskLevel: null }]
        ]
      },
      {
        name: 'units',
        type: 'array',
        required: false,
        possibleValues: [
          undefined,
          [],
          [{ unitId: 'unit-1', callSign: 'Engine 1' }],
          [{ unitId: '', callSign: '' }]
        ]
      },
      {
        name: 'routes',
        type: 'array',
        required: false,
        possibleValues: [
          undefined,
          [],
          [{ routeId: 'route-1', originH3: 'test' }],
          [{ routeId: '', originH3: '' }]
        ]
      }
    ],
    interactions: [
      {
        type: 'click',
        selector: '.map-container'
      },
      {
        type: 'drag',
        selector: '.map-container'
      },
      {
        type: 'scroll',
        selector: '.map-container'
      },
      {
        type: 'keyboard',
        selector: '.map-container',
        keyboardKeys: ['+', '-', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      }
    ],
    errorBoundary: true,
    async: true
  },
  {
    componentName: 'AIPDecisionSupport',
    filePath: 'src/components/AIPDecisionSupport.tsx',
    props: [
      {
        name: 'onDecisionMade',
        type: 'function',
        required: false,
        possibleValues: [undefined, () => {}, (guidance: any) => console.log(guidance)]
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        possibleValues: ['', 'custom-class', 'test-class']
      }
    ],
    interactions: [
      {
        type: 'click',
        selector: 'button'
      },
      {
        type: 'input',
        selector: 'input, textarea'
      },
      {
        type: 'select',
        selector: 'select'
      }
    ],
    errorBoundary: true
  },
  {
    componentName: 'RealTimeDashboard',
    filePath: 'src/components/realtime/RealTimeDashboard.tsx',
    props: [
      {
        name: 'className',
        type: 'string',
        required: false,
        possibleValues: ['', 'custom-class']
      },
      {
        name: 'showSystemStatus',
        type: 'boolean',
        required: false,
        possibleValues: [true, false, undefined]
      },
      {
        name: 'showDataFeeds',
        type: 'boolean',
        required: false,
        possibleValues: [true, false, undefined]
      },
      {
        name: 'showLiveUpdates',
        type: 'boolean',
        required: false,
        possibleValues: [true, false, undefined]
      },
      {
        name: 'maxUpdates',
        type: 'number',
        required: false,
        min: 1,
        max: 1000,
        possibleValues: [1, 10, 100, 1000, 0, -1, 2000]
      }
    ],
    interactions: [
      {
        type: 'click',
        selector: 'button'
      },
      {
        type: 'hover',
        selector: '.status-indicator'
      }
    ],
    errorBoundary: true,
    async: true
  },
  {
    componentName: 'RoleBasedRouting',
    filePath: 'src/components/RoleBasedRouting.tsx',
    props: [
      {
        name: 'routes',
        type: 'array',
        required: true,
        possibleValues: [
          [],
          [{ id: 'route-1', name: 'Route 1' }],
          [{ id: '', name: '' }],
          [{ id: null, name: null }]
        ]
      },
      {
        name: 'units',
        type: 'array',
        required: true,
        possibleValues: [
          [],
          [{ id: 'unit-1', name: 'Unit 1' }],
          [{ id: '', name: '' }]
        ]
      },
      {
        name: 'stagingAreas',
        type: 'array',
        required: true,
        possibleValues: [
          [],
          [{ id: 'area-1', name: 'Area 1' }],
          [{ id: '', name: '' }]
        ]
      },
      {
        name: 'onRouteSelect',
        type: 'function',
        required: false,
        possibleValues: [undefined, () => {}, (route: any) => console.log(route)]
      },
      {
        name: 'onRouteUpdate',
        type: 'function',
        required: false,
        possibleValues: [undefined, () => {}, (id: string, updates: any) => console.log(id, updates)]
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        possibleValues: ['', 'custom-class']
      }
    ],
    interactions: [
      {
        type: 'click',
        selector: '.route-item'
      },
      {
        type: 'click',
        selector: 'button'
      },
      {
        type: 'select',
        selector: 'select'
      }
    ],
    errorBoundary: true
  },
  {
    componentName: 'EvacuationDashboard',
    filePath: 'src/components/EvacuationDashboard.tsx',
    props: [
      {
        name: 'zones',
        type: 'array',
        required: true,
        possibleValues: [
          [],
          [{ id: 'zone-1', name: 'Zone 1' }],
          [{ id: '', name: '' }]
        ]
      },
      {
        name: 'buildings',
        type: 'array',
        required: true,
        possibleValues: [
          [],
          [{ id: 'building-1', name: 'Building 1' }],
          [{ id: '', name: '' }]
        ]
      },
      {
        name: 'weatherData',
        type: 'object',
        required: false,
        possibleValues: [
          undefined,
          { temperature: 20, humidity: 50 },
          { temperature: null, humidity: null },
          {}
        ]
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        possibleValues: ['', 'custom-class']
      }
    ],
    interactions: [
      {
        type: 'click',
        selector: '.zone-item'
      },
      {
        type: 'click',
        selector: '.building-item'
      },
      {
        type: 'hover',
        selector: '.weather-panel'
      }
    ],
    errorBoundary: true
  },
  {
    componentName: 'ErrorBoundary',
    filePath: 'src/components/ErrorBoundary.tsx',
    props: [
      {
        name: 'children',
        type: 'object',
        required: true,
        possibleValues: ['<div>Test</div>', null, undefined]
      },
      {
        name: 'fallback',
        type: 'function',
        required: false,
        possibleValues: [undefined, () => '<div>Error</div>']
      },
      {
        name: 'onError',
        type: 'function',
        required: false,
        possibleValues: [undefined, (error: Error) => console.log(error)]
      }
    ],
    interactions: [],
    errorBoundary: false // This IS the error boundary
  }
];

/**
 * Generate all possible prop combinations for a component
 */
export function generatePropCombinations(component: ComponentTestConfig): any[] {
  const combinations: any[] = [];
  
  function generateRecursive(props: any, index: number) {
    if (index >= component.props.length) {
      combinations.push({ ...props });
      return;
    }
    
    const prop = component.props[index];
    const values = prop?.possibleValues || [prop?.defaultValue];
    
    for (const value of values) {
      if (prop?.required || value !== undefined) {
        if (prop?.name) {
          props[prop.name] = value;
        }
        generateRecursive(props, index + 1);
      }
    }
  }
  
  generateRecursive({}, 0);
  return combinations;
}

/**
 * Generate all possible interaction sequences
 */
export function generateInteractionSequences(component: ComponentTestConfig): any[][] {
  const sequences: any[][] = [];
  
  function generateRecursive(sequence: any[], index: number) {
    if (index >= component.interactions.length) {
      if (sequence.length > 0) {
        sequences.push([...sequence]);
      }
      return;
    }
    
    const interaction = component.interactions[index];
    
    // Try each possible value for this interaction
    const values = interaction?.possibleValues || [null];
    for (const value of values) {
      sequence.push({
        type: interaction?.type,
        selector: interaction?.selector,
        testId: interaction?.testId,
        value: value,
        keyboardKeys: interaction?.keyboardKeys
      });
      generateRecursive(sequence, index + 1);
      sequence.pop();
    }
    
    // Also try skipping this interaction
    generateRecursive(sequence, index + 1);
  }
  
  generateRecursive([], 0);
  return sequences;
}
