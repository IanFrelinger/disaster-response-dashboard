#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface UIComponent {
  name: string;
  file: string;
  type: 'component' | 'page' | 'layout';
  interactions: Interaction[];
  props: string[];
  state: string[];
  cssClasses: string[];
  description: string;
}

interface Interaction {
  type: 'click' | 'hover' | 'scroll' | 'input' | 'select' | 'drag' | 'zoom' | 'pan' | 'toggle' | 'submit';
  target: string;
  description: string;
  selector?: string;
  action?: string;
}

interface ComponentMap {
  timestamp: string;
  frontendPath: string;
  components: UIComponent[];
  navigation: NavigationItem[];
  dataFlow: DataFlow[];
  interactionPatterns: InteractionPattern[];
}

interface NavigationItem {
  name: string;
  route: string;
  component: string;
  description: string;
}

interface DataFlow {
  from: string;
  to: string;
  dataType: string;
  description: string;
}

interface InteractionPattern {
  name: string;
  description: string;
  components: string[];
  userJourney: string[];
}

class UIComponentMapper {
  private projectRoot: string;
  private frontendPath: string;
  private outputPath: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..', '..');
    this.frontendPath = path.join(this.projectRoot, 'frontend', 'src');
    this.outputPath = path.join(__dirname, '..', 'config', 'ui-component-map.json');
  }

  async generateComponentMap(): Promise<ComponentMap> {
    console.log('🗺️  Generating comprehensive UI component map...');
    
    const components = await this.analyzeComponents();
    const navigation = this.analyzeNavigation();
    const dataFlow = this.analyzeDataFlow();
    const interactionPatterns = this.analyzeInteractionPatterns();

    const componentMap: ComponentMap = {
      timestamp: new Date().toISOString(),
      frontendPath: this.frontendPath,
      components,
      navigation,
      dataFlow,
      interactionPatterns
    };

    // Ensure config directory exists
    const configDir = path.dirname(this.outputPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write the component map
    fs.writeFileSync(this.outputPath, JSON.stringify(componentMap, null, 2));
    console.log(`✅ UI component map generated: ${this.outputPath}`);

    return componentMap;
  }

  private async analyzeComponents(): Promise<UIComponent[]> {
    const components: UIComponent[] = [];
    const componentsDir = path.join(this.frontendPath, 'components');
    
    if (!fs.existsSync(componentsDir)) {
      console.log('⚠️  Components directory not found');
      return components;
    }

    const componentFiles = fs.readdirSync(componentsDir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'))
      .filter(file => !file.includes('.test.') && !file.includes('.spec.'));

    for (const file of componentFiles) {
      const component = await this.analyzeComponentFile(path.join(componentsDir, file));
      if (component) {
        components.push(component);
      }
    }

    // Analyze tacmap components
    const tacmapDir = path.join(componentsDir, 'tacmap');
    if (fs.existsSync(tacmapDir)) {
      const tacmapFiles = fs.readdirSync(tacmapDir)
        .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));
      
      for (const file of tacmapFiles) {
        const component = await this.analyzeComponentFile(path.join(tacmapDir, file));
        if (component) {
          components.push(component);
        }
      }
    }

    return components;
  }

  private async analyzeComponentFile(filePath: string): Promise<UIComponent | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, path.extname(filePath));
      
      const component: UIComponent = {
        name: fileName,
        file: path.basename(filePath),
        type: this.determineComponentType(fileName),
        interactions: this.extractInteractions(content),
        props: this.extractProps(content),
        state: this.extractState(content),
        cssClasses: this.extractCSSClasses(content),
        description: this.generateComponentDescription(fileName, content)
      };

      return component;
    } catch (error) {
      console.log(`⚠️  Error analyzing ${filePath}: ${error}`);
      return null;
    }
  }

  private determineComponentType(fileName: string): 'component' | 'page' | 'layout' {
    if (fileName.includes('Dashboard') || fileName.includes('Page')) return 'page';
    if (fileName.includes('Layout') || fileName.includes('Container')) return 'layout';
    return 'component';
  }

  private extractInteractions(content: string): Interaction[] {
    const interactions: Interaction[] = [];
    
    // Extract click handlers
    const clickPatterns = [
      /onClick\s*=\s*{([^}]+)}/g,
      /onClick\s*=\s*\([^)]*\)\s*=>\s*{/g,
      /handleClick\s*=\s*\([^)]*\)\s*=>\s*{/g
    ];
    
    clickPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        interactions.push({
          type: 'click',
          target: 'button/div',
          description: 'Click interaction detected',
          action: 'onClick handler'
        });
      }
    });

    // Extract hover handlers
    const hoverPatterns = [
      /onMouseEnter\s*=\s*{([^}]+)}/g,
      /onMouseLeave\s*=\s*{([^}]+)}/g
    ];
    
    hoverPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        interactions.push({
          type: 'hover',
          target: 'element',
          description: 'Hover interaction detected',
          action: 'onMouseEnter/onMouseLeave'
        });
      }
    });

    // Extract input handlers
    const inputPatterns = [
      /onChange\s*=\s*{([^}]+)}/g,
      /onInput\s*=\s*{([^}]+)}/g,
      /onSubmit\s*=\s*{([^}]+)}/g
    ];
    
    inputPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        interactions.push({
          type: 'input',
          target: 'input/form',
          description: 'Input interaction detected',
          action: 'onChange/onInput/onSubmit'
        });
      }
    });

    // Extract map interactions
    if (content.includes('mapbox') || content.includes('Mapbox')) {
      interactions.push({
        type: 'zoom',
        target: 'map',
        description: 'Map zoom interaction',
        action: 'Scroll wheel or zoom controls'
      });
      
      interactions.push({
        type: 'pan',
        target: 'map',
        description: 'Map pan interaction',
        action: 'Drag to move map view'
      });
    }

    // Extract scroll interactions
    if (content.includes('onScroll') || content.includes('scrollIntoView')) {
      interactions.push({
        type: 'scroll',
        target: 'container',
        description: 'Scroll interaction detected',
        action: 'onScroll handler or scrollIntoView'
      });
    }

    return interactions;
  }

  private extractProps(content: string): string[] {
    const props: string[] = [];
    
    // Extract interface props
    const interfaceMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
    if (interfaceMatch) {
      const propsContent = interfaceMatch[1];
      const propLines = propsContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.includes(':'))
        .map(line => line.split(':')[0].trim());
      props.push(...propLines);
    }

    // Extract destructured props
    const destructureMatch = content.match(/\(\s*{\s*([^}]+)\s*}\s*\)/);
    if (destructureMatch) {
      const propsContent = destructureMatch[1];
      const propNames = propsContent.split(',').map(p => p.trim());
      props.push(...propNames);
    }

    return [...new Set(props)];
  }

  private extractState(content: string): string[] {
    const state: string[] = [];
    
    // Extract useState calls
    const useStateMatches = content.matchAll(/useState\s*<[^>]*>\s*\(\s*([^)]+)\s*\)/g);
    for (const match of useStateMatches) {
      const stateName = match[1].trim();
      state.push(stateName);
    }

    // Extract state variables
    const stateMatches = content.matchAll(/const\s+\[([^,]+)/g);
    for (const match of stateMatches) {
      const stateName = match[1].trim();
      if (stateName && !state.includes(stateName)) {
        state.push(stateName);
      }
    }

    return state;
  }

  private extractCSSClasses(content: string): string[] {
    const classes: string[] = [];
    
    // Extract className usage
    const classNameMatches = content.matchAll(/className\s*=\s*["'`]([^"'`]+)["'`]/g);
    for (const match of classNameMatches) {
      const classNames = match[1].split(' ').filter(c => c.trim());
      classes.push(...classNames);
    }

    // Extract CSS module imports
    const cssModuleMatches = content.matchAll(/import\s+.*\s+from\s+['"`]([^"'`]+\.module\.css)['"`]/g);
    for (const match of cssModuleMatches) {
      classes.push(`CSS Module: ${path.basename(match[1])}`);
    }

    return [...new Set(classes)];
  }

  private generateComponentDescription(fileName: string, content: string): string {
    // Generate description based on component name and content
    const name = fileName.toLowerCase();
    
    if (name.includes('dashboard')) return 'Main dashboard component for evacuation management';
    if (name.includes('map')) return 'Interactive map component for hazard visualization';
    if (name.includes('hazard')) return 'Hazard management and visualization component';
    if (name.includes('evacuation')) return 'Evacuation planning and tracking component';
    if (name.includes('weather')) return 'Weather data display and integration component';
    if (name.includes('ai') || name.includes('decision')) return 'AI-powered decision support component';
    if (name.includes('unit') || name.includes('management')) return 'Unit and resource management component';
    if (name.includes('routing')) return 'Route planning and optimization component';
    if (name.includes('building')) return 'Building-specific evacuation tracking component';
    if (name.includes('search')) return 'Search and marking functionality component';
    if (name.includes('efficiency')) return 'Efficiency metrics and analytics component';
    if (name.includes('drill')) return 'Drill-down capability for detailed analysis';
    if (name.includes('technical')) return 'Technical architecture and system information component';
    if (name.includes('challenge')) return 'Challenge demo and presentation component';
    
    return 'Interactive component with various user interactions';
  }

  private analyzeNavigation(): NavigationItem[] {
    return [
      {
        name: 'Evacuation Dashboard',
        route: '/dashboard',
        component: 'EvacuationDashboard',
        description: 'Main evacuation management interface'
      },
      {
        name: 'Multi-Hazard Map',
        route: '/map',
        component: 'MultiHazardMap',
        description: 'Interactive hazard visualization'
      },
      {
        name: 'AI Decision Support',
        route: '/ai-support',
        component: 'AIPDecisionSupport',
        description: 'AI-powered operational guidance'
      },
      {
        name: 'Unit Management',
        route: '/units',
        component: 'UnitManagement',
        description: 'Emergency unit coordination'
      },
      {
        name: 'Role-Based Routing',
        route: '/routing',
        component: 'RoleBasedRouting',
        description: 'Route optimization and planning'
      },
      {
        name: 'Building Tracker',
        route: '/buildings',
        component: 'BuildingEvacuationTracker',
        description: 'Building evacuation status tracking'
      },
      {
        name: 'Weather Panel',
        route: '/weather',
        component: 'WeatherPanel',
        description: 'Real-time weather integration'
      },
      {
        name: 'Technical Architecture',
        route: '/architecture',
        component: 'TechnicalArchitecture',
        description: 'System architecture overview'
      }
    ];
  }

  private analyzeDataFlow(): DataFlow[] {
    return [
      {
        from: 'MultiHazardMap',
        to: 'EvacuationDashboard',
        dataType: 'HazardLayer[]',
        description: 'Real-time hazard data flows to dashboard for evacuation planning'
      },
      {
        from: 'WeatherPanel',
        to: 'MultiHazardMap',
        dataType: 'WeatherData',
        description: 'Weather conditions influence hazard visualization and routing'
      },
      {
        from: 'AIPDecisionSupport',
        to: 'EvacuationDashboard',
        dataType: 'OperationalGuidance',
        description: 'AI recommendations guide evacuation decisions and resource allocation'
      },
      {
        from: 'BuildingEvacuationTracker',
        to: 'EvacuationDashboard',
        dataType: 'Building[]',
        description: 'Building status updates flow to dashboard for progress tracking'
      },
      {
        from: 'UnitManagement',
        to: 'RoleBasedRouting',
        dataType: 'EmergencyUnit[]',
        description: 'Unit availability and status inform route optimization'
      },
      {
        from: 'SearchMarkings',
        to: 'MultiHazardMap',
        dataType: 'SearchMarking[]',
        description: 'Search and rescue markings overlay on hazard map'
      }
    ];
  }

  private analyzeInteractionPatterns(): InteractionPattern[] {
    return [
      {
        name: 'Map Exploration',
        description: 'Users explore hazards and evacuation routes through interactive map',
        components: ['MultiHazardMap', 'SimpleMapboxTest', 'Enhanced3DTerrain'],
        userJourney: ['Load map', 'Toggle hazard layers', 'Zoom/pan to areas', 'Select hazards', 'View details']
      },
      {
        name: 'Evacuation Planning',
        description: 'Commanders plan and execute evacuation operations',
        components: ['EvacuationDashboard', 'AIPDecisionSupport', 'RoleBasedRouting'],
        userJourney: ['View evacuation zones', 'Analyze AI recommendations', 'Plan routes', 'Assign units', 'Monitor progress']
      },
      {
        name: 'Real-time Monitoring',
        description: 'Continuous monitoring of evacuation progress and hazard changes',
        components: ['BuildingEvacuationTracker', 'EfficiencyMetrics', 'WeatherPanel'],
        userJourney: ['Check building status', 'Review metrics', 'Monitor weather', 'Update information', 'Track progress']
      },
      {
        name: 'Unit Coordination',
        description: 'Emergency units coordinate and manage resources',
        components: ['UnitManagement', 'RoleBasedRouting', 'DrillDownCapability'],
        userJourney: ['View unit status', 'Assign tasks', 'Optimize routes', 'Track performance', 'Analyze efficiency']
      },
      {
        name: 'Decision Support',
        description: 'AI-powered guidance for complex operational decisions',
        components: ['AIPDecisionSupport', 'TechnicalArchitecture', 'ChallengeDemo'],
        userJourney: ['Query AI system', 'Review recommendations', 'Analyze alternatives', 'Make decisions', 'Track outcomes']
      }
    ];
  }

  async generateHumanizerBotContext(): Promise<string> {
    const componentMap = await this.generateComponentMap();
    
    const context = `# Disaster Response Dashboard UI Component Map
Generated: ${componentMap.timestamp}

## Overview
This map provides comprehensive information about all UI components, interactions, and user flows in the Disaster Response Dashboard frontend. Use this information to create realistic, contextually appropriate interaction descriptions for video production.

## Core Components

${componentMap.components.map(comp => `
### ${comp.name}
- **Type**: ${comp.type}
- **File**: ${comp.file}
- **Description**: ${comp.description}
- **Interactions**: ${comp.interactions.map(i => `${i.type} on ${i.target}`).join(', ')}
- **Key Props**: ${comp.props.slice(0, 5).join(', ')}
- **State Variables**: ${comp.state.slice(0, 5).join(', ')}
- **CSS Classes**: ${comp.cssClasses.slice(0, 5).join(', ')}
`).join('')}

## Navigation Structure
${componentMap.navigation.map(nav => `
- **${nav.name}** (${nav.route}) - ${nav.description}
`).join('')}

## Data Flow Patterns
${componentMap.dataFlow.map(flow => `
- **${flow.from}** → **${flow.to}**: ${flow.dataType} - ${flow.description}
`).join('')}

## User Interaction Patterns
${componentMap.interactionPatterns.map(pattern => `
### ${pattern.name}
${pattern.description}
**Components**: ${pattern.components.join(', ')}
**User Journey**: ${pattern.userJourney.join(' → ')}
`).join('')}

## Interaction Guidelines for Video Production

### Map Interactions
- **Zoom**: Users can zoom in/out using scroll wheel or zoom controls
- **Pan**: Users can drag the map to move the view
- **Layer Toggle**: Users can show/hide different hazard layers
- **Hazard Selection**: Users can click on hazards to view detailed information

### Dashboard Interactions
- **Zone Selection**: Users can click on evacuation zones to view details
- **Status Updates**: Users can update building and evacuation status
- **Filter Controls**: Users can filter by status, priority, or other criteria
- **Progress Tracking**: Users can monitor evacuation progress in real-time

### AI Decision Support
- **Query Input**: Users can type natural language queries
- **Recommendation Review**: Users can view AI-generated recommendations
- **Alternative Scenarios**: Users can explore different operational scenarios
- **Confidence Metrics**: Users can assess AI recommendation confidence

### Unit Management
- **Unit Assignment**: Users can assign units to specific tasks
- **Route Planning**: Users can plan and optimize unit routes
- **Performance Monitoring**: Users can track unit efficiency and performance
- **Resource Allocation**: Users can manage and allocate emergency resources

## Contextual Interaction Descriptions

When describing interactions in video production, consider:
1. **User Role**: Is this a commander, first responder, or public information officer?
2. **Operational Context**: What emergency scenario is being addressed?
3. **Component State**: What information is currently visible on screen?
4. **User Intent**: What is the user trying to accomplish?
5. **System Response**: How does the system respond to user actions?

## Realistic Interaction Examples

### Commander View
"Commander Johnson surveys the evacuation zones on the main dashboard. She clicks on Zone A to see detailed evacuation progress, then consults the AI decision support system for route optimization recommendations."

### First Responder View
"First responders use the building evacuation tracker to update status as they clear each building. They toggle between different hazard layers on the map to understand current threats."

### Public Information View
"Public information officers monitor the weather panel for changing conditions that might affect evacuation timing, while updating the public information dashboard with real-time status updates."

This component map should be referenced every time interaction descriptions are generated to ensure accuracy and contextual appropriateness.`;

    const contextPath = path.join(path.dirname(this.outputPath), 'humanizer-bot-context.md');
    fs.writeFileSync(contextPath, context);
    console.log(`✅ Humanizer bot context generated: ${contextPath}`);

    return context;
  }
}

// Main execution
async function main() {
  const mapper = new UIComponentMapper();
  
  try {
    await mapper.generateComponentMap();
    await mapper.generateHumanizerBotContext();
    console.log('🎉 UI component mapping completed successfully!');
  } catch (error) {
    console.error('❌ Error during UI component mapping:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(console.error);
