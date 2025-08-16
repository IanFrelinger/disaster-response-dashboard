import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { GraphicsBot, OverlayDescriptor } from './graphics-bot.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Beat {
  id: string;
  duration: number;
  actions: string[];
}

interface TTSCue {
  id: string;
  text: string;
}

interface OverlayConfig {
  type: string;
  content: string;
  timing: number;
  duration: number;
}

// New interfaces for humanized actions
interface HumanizedAction {
  action: string;
  selector?: string;
  coordinates?: [number, number];
  path?: [number, number][];
  duration?: number;
  milliseconds?: number;
  comment?: string;
}

interface HumanizedBeat {
  id: string;
  duration: number;
  originalActions: string[];
  humanizedActions: HumanizedAction[];
}

// New interface for UI component mapping
interface UIComponentMapping {
  selector: string;
  type: string;
  text?: string;
  attributes: Record<string, string>;
  isClickable: boolean;
  isVisible: boolean;
  coordinates?: [number, number];
}

interface PageUIMap {
  components: UIComponentMapping[];
  timestamp: number;
  url: string;
}

class InteractionBot {
  /**
   * Transforms robotic browser automation scripts into human-like recording instructions
   */
  humanizeActions(originalActions: string[], uiMap?: PageUIMap): HumanizedAction[] {
    const humanizedActions: HumanizedAction[] = [];
    let lastKnownPosition: [number, number] | null = null;
    
    // Validate actions against UI map if provided
    if (uiMap) {
      const validationResult = this.validateActionsAgainstUI(originalActions, uiMap);
      if (validationResult.invalidActions.length > 0) {
        console.warn(`⚠️ Found ${validationResult.invalidActions.length} invalid actions:`, validationResult.invalidActions);
        // Filter out invalid actions or replace them with safe alternatives
        originalActions = this.sanitizeActions(originalActions, validationResult, uiMap);
      }
    }
    
    for (let i = 0; i < originalActions.length; i++) {
      const action = originalActions[i];
      const nextAction = originalActions[i + 1];
      
      // Parse the original action
      const parsedAction = this.parseAction(action);
      if (!parsedAction) continue;
      
      // Add pre-action hover for clickable elements
      if (parsedAction.action === 'click' && parsedAction.selector) {
        humanizedActions.push({
          action: 'hover',
          selector: parsedAction.selector,
          duration: 500,
          comment: 'Pre-click hover for emphasis'
        });
        humanizedActions.push({
          action: 'wait',
          milliseconds: this.randomizeTiming(300, 50)
        });
      }
      
      // Add the main action
      humanizedActions.push(parsedAction);
      
      // Update last known position if this action has coordinates
      if (parsedAction.coordinates) {
        lastKnownPosition = parsedAction.coordinates;
      }
      
      // Add post-action wait
      const waitDuration = this.getPostActionWait(parsedAction.action);
      if (waitDuration > 0) {
        humanizedActions.push({
          action: 'wait',
          milliseconds: this.randomizeTiming(waitDuration, 50)
        });
      }
      
      // Add mouse movement if next action involves coordinates
      if (nextAction && this.actionHasCoordinates(nextAction)) {
        const nextCoords = this.extractCoordinates(nextAction);
        if (nextCoords && lastKnownPosition) {
          const path = this.generateHumanizedPath(lastKnownPosition, nextCoords);
          humanizedActions.push({
            action: 'mouseMove',
            path: path,
            duration: this.calculateMoveDuration(path),
            comment: 'Smooth mouse movement to next target'
          });
        }
      }
    }
    
    return humanizedActions;
  }

  /**
   * Validates actions against the current UI map to ensure they target valid components
   */
  private validateActionsAgainstUI(actions: string[], uiMap: PageUIMap): {
    validActions: string[];
    invalidActions: string[];
    warnings: string[];
  } {
    const validActions: string[] = [];
    const invalidActions: string[] = [];
    const warnings: string[] = [];
    
    for (const action of actions) {
      const parsedAction = this.parseAction(action);
      if (!parsedAction) {
        invalidActions.push(action);
        warnings.push(`Could not parse action: ${action}`);
        continue;
      }
      
      if (parsedAction.selector) {
        const component = uiMap.components.find(comp => 
          comp.selector === parsedAction.selector || 
          this.isSelectorMatch(comp.selector, parsedAction.selector!)
        );
        
        if (!component) {
          invalidActions.push(action);
          warnings.push(`Selector not found in UI: ${parsedAction.selector}`);
        } else if (!component.isVisible) {
          warnings.push(`Component exists but not visible: ${parsedAction.selector}`);
          validActions.push(action); // Still valid, just warning
        } else if (parsedAction.action === 'click' && !component.isClickable) {
          warnings.push(`Component not clickable: ${parsedAction.selector}`);
          validActions.push(action); // Still valid, just warning
        } else {
          validActions.push(action);
        }
      } else if (parsedAction.coordinates) {
        // Validate coordinates are within viewport bounds
        const [x, y] = parsedAction.coordinates;
        if (x < 0 || x > 1920 || y < 0 || y > 1080) {
          warnings.push(`Coordinates out of viewport bounds: (${x}, ${y})`);
        }
        validActions.push(action);
      } else {
        validActions.push(action);
      }
    }
    
    return { validActions, invalidActions, warnings };
  }

  /**
   * Sanitizes actions by replacing invalid ones with safe alternatives
   */
  private sanitizeActions(actions: string[], validationResult: any, uiMap: PageUIMap): string[] {
    const sanitizedActions: string[] = [];
    
    for (const action of actions) {
      const parsedAction = this.parseAction(action);
      if (!parsedAction) continue;
      
      if (validationResult.invalidActions.includes(action)) {
        // Try to find a safe alternative
        const safeAlternative = this.findSafeAlternative(parsedAction, uiMap);
        if (safeAlternative) {
          sanitizedActions.push(safeAlternative);
          console.log(`🔄 Replaced invalid action "${action}" with safe alternative: "${safeAlternative}"`);
        } else {
          console.log(`⚠️ Skipping invalid action: ${action}`);
        }
      } else {
        sanitizedActions.push(action);
      }
    }
    
    return sanitizedActions;
  }

  /**
   * Finds safe alternatives for invalid actions
   */
  private findSafeAlternative(parsedAction: any, uiMap: PageUIMap): string | null {
    if (parsedAction.selector) {
      // Try to find a similar component
      const similarComponent = uiMap.components.find(comp => 
        comp.type === 'button' || comp.type === 'div' || comp.type === 'span'
      );
      
      if (similarComponent) {
        return `${parsedAction.action}('${similarComponent.selector}')`;
      }
    }
    
    return null;
  }

  /**
   * Checks if two selectors match (handles partial matches)
   */
  private isSelectorMatch(uiSelector: string, actionSelector: string): boolean {
    // Simple matching logic - can be enhanced
    return uiSelector.includes(actionSelector) || actionSelector.includes(uiSelector);
  }
  
  private parseAction(actionString: string): HumanizedAction | null {
    if (actionString.startsWith('click(')) {
      const selector = actionString.match(/click\(([^)]+)\)/)?.[1];
      if (selector) {
        return { action: 'click', selector };
      }
    } else if (actionString.startsWith('mouseClick(')) {
      const coordsMatch = actionString.match(/mouseClick\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number) as [number, number];
        return { action: 'click', coordinates: coords };
      }
    } else if (actionString.startsWith('mouseMove(')) {
      const coordsMatch = actionString.match(/mouseMove\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number) as [number, number];
        return { action: 'mouseMove', coordinates: coords };
      }
    } else if (actionString.startsWith('wait(')) {
      const ms = parseInt(actionString.match(/wait\(([^)]+)\)/)?.[1] || '1000');
      return { action: 'wait', milliseconds: ms };
    } else if (actionString.startsWith('wheel(')) {
      const delta = parseInt(actionString.match(/wheel\(([^)]+)\)/)?.[1] || '0');
      return { action: 'wheel', milliseconds: delta };
    } else if (actionString.startsWith('mouseDrag(')) {
      const coordsMatch = actionString.match(/mouseDrag\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 4) {
          return { 
            action: 'mouseDrag', 
            coordinates: [coords[0], coords[1]] as [number, number],
            path: [[coords[2], coords[3]] as [number, number]]
          };
        }
      }
    } else if (actionString.startsWith('goto(')) {
      return { action: 'goto', comment: 'Navigate to app' };
    } else if (actionString.startsWith('waitForSelector(')) {
      const selector = actionString.match(/waitForSelector\(([^)]+)\)/)?.[1];
      return { action: 'waitForSelector', selector, comment: 'Wait for element' };
    } else if (actionString.startsWith('overlay(')) {
      return { action: 'overlay', comment: actionString };
    } else if (actionString.startsWith('screenshot(')) {
      return { action: 'screenshot', comment: actionString };
    }
    
    return null;
  }
  
  private actionHasCoordinates(action: string): boolean {
    return action.includes('mouseClick(') || action.includes('mouseMove(') || action.includes('mouseDrag(');
  }
  
  private extractCoordinates(action: string): [number, number] | null {
    const coordsMatch = action.match(/\(([^)]+)\)/)?.[1];
    if (coordsMatch) {
      const coords = coordsMatch.split(',').map(Number);
      if (coords.length >= 2) {
        return [coords[0], coords[1]];
      }
    }
    return null;
  }
  
  private generateHumanizedPath(from: [number, number], to: [number, number]): [number, number][] {
    const [x1, y1] = from;
    const [x2, y2] = to;
    
    // Calculate distance
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // For short distances, use direct path with slight curve
    if (distance < 100) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 20;
      return [[x1, y1], [midX, midY], [x2, y2]];
    }
    
    // For longer distances, add intermediate points with natural curves
    const numPoints = Math.max(3, Math.floor(distance / 150));
    const path: [number, number][] = [[x1, y1]];
    
    for (let i = 1; i < numPoints - 1; i++) {
      const t = i / (numPoints - 1);
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      
      // Add slight randomness to make it more human-like
      const randomOffset = (Math.random() - 0.5) * 30;
      path.push([x + randomOffset, y + randomOffset]);
    }
    
    path.push([x2, y2]);
    return path;
  }
  
  private calculateMoveDuration(path: [number, number][]): number {
    if (path.length < 2) return 300;
    
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const [x1, y1] = path[i - 1];
      const [x2, y2] = path[i];
      totalDistance += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    // Base duration: 300ms minimum, 1000ms maximum
    const baseDuration = Math.min(1000, Math.max(300, totalDistance * 2));
    return this.randomizeTiming(baseDuration, 100);
  }
  
  private getPostActionWait(actionType: string): number {
    switch (actionType) {
      case 'click':
        return 500; // Wait after clicks
      case 'wheel':
        return 400; // Wait after scrolling
      case 'mouseMove':
        return 200; // Brief pause after movement
      case 'mouseDrag':
        return 600; // Longer pause after drag operations
      default:
        return 0;
    }
  }
  
  private randomizeTiming(baseTime: number, variance: number): number {
    const randomOffset = (Math.random() - 0.5) * 2 * variance;
    return Math.max(100, baseTime + randomOffset);
  }
}

class ProperDemoVideoCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private overlayEngine: OverlayEngine;
  private interactionBot: InteractionBot;
  private graphicsBot: GraphicsBot;
  private currentBeat: number = 0;
  private totalBeats: number = 0;
  private currentOverlayDescriptors: OverlayDescriptor[] = [];

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.overlayEngine = new OverlayEngine();
    this.interactionBot = new InteractionBot();
    this.graphicsBot = new GraphicsBot({ width: 1920, height: 1080 });
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createProperDemoVideo() {
    console.log('🎬 Creating Proper 5-Minute Demo Video...');
    console.log('📹 Using recorder-ready timeline configuration');
    
    try {
      await this.initializeBrowser();
      await this.recordDemoSegments();
      await this.generateFinalVideo();
      
      console.log('✅ Proper demo video creation completed!');
      console.log('🎬 5:40 demonstration with recorder-ready timeline ready');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: this.outputDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    console.log('✅ Browser initialized');
  }

  private async recordDemoSegments() {
    console.log('📹 Using recorder-ready timeline configuration...');
    
    // Load the recorder-ready timeline configuration
    const recordConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'record.config.json'), 'utf8'));
    const ttsCueSheet = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tts-cue-sheet.json'), 'utf8'));
    
    this.totalBeats = recordConfig.beats.length;
    console.log(`🎬 Recording ${this.totalBeats} beats from recorder-ready timeline...`);
    
    // Scan the page for UI components before starting recording
    console.log('🔍 Scanning page for UI components...');
    let uiMap = await this.scanPageUI();
    console.log(`✅ Found ${uiMap.components.length} UI components`);
    
    for (let i = 0; i < recordConfig.beats.length; i++) {
      this.currentBeat = i + 1;
      const beat = recordConfig.beats[i];
      const ttsCue = ttsCueSheet.beats.find((b: TTSCue) => b.id === beat.id);
      
      console.log(`🎬 Recording beat ${this.currentBeat}/${this.totalBeats}: ${beat.id} (${beat.duration}s)`);
      console.log(`🎤 Narration: ${ttsCue?.text || 'No narration'}`);
      
      try {
        // Refresh UI map every few beats to handle dynamic content
        if (i > 0 && i % 3 === 0) {
          console.log('🔄 Refreshing UI component map...');
          uiMap = await this.scanPageUI();
        }
        
        await this.executeBeat(beat, this.page!, uiMap);
        console.log(`✅ Beat ${beat.id} recorded successfully`);
        
        // Wait for beat duration to complete
        await this.page!.waitForTimeout(beat.duration * 1000);
        
      } catch (error) {
        console.error(`❌ Error recording beat ${beat.id}:`, error);
      }
    }
  }

  /**
   * Scans the current page to identify all valid UI components and their properties
   */
  private async scanPageUI(): Promise<PageUIMap> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const uiMap: PageUIMap = {
      components: [],
      timestamp: Date.now(),
      url: this.page.url()
    };

    try {
      // Wait for the page to be fully loaded
      await this.page.waitForLoadState('networkidle');
      
      // Get all interactive elements
      const selectors = [
        'button', 'a', 'input', 'select', 'textarea',
        '[role="button"]', '[role="link"]', '[role="tab"]',
        '[onclick]', '[data-testid]', '[id]', '[class]'
      ];

      for (const selector of selectors) {
        const elements = await this.page.$$(selector);
        
        for (const element of elements) {
          try {
            const isVisible = await element.isVisible();
            if (!isVisible) continue;

            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const text = await element.evaluate(el => el.textContent?.trim() || '');
            const id = await element.evaluate(el => el.id || '');
            const className = await element.evaluate(el => el.className || '');
            
            // Create a unique selector for this element
            let uniqueSelector = selector;
            if (id) {
              uniqueSelector = `#${id}`;
            } else if (className) {
              const classes = className.split(' ').filter(c => c.trim());
              if (classes.length > 0) {
                uniqueSelector = `.${classes[0]}`;
              }
            }

            // Determine if element is clickable
            const isClickable = await element.evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.pointerEvents !== 'none' && 
                     style.cursor !== 'default' &&
                     (el.tagName === 'BUTTON' || el.tagName === 'A' || 
                      el.hasAttribute('onclick') || el.hasAttribute('role'));
            });

            // Get element position
            const boundingBox = await element.boundingBox();
            const coordinates: [number, number] | undefined = boundingBox ? 
              [boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2] : 
              undefined;

            // Get additional attributes
            const attributes: Record<string, string> = {};
            const attributeNames = ['data-testid', 'data-cy', 'aria-label', 'title', 'alt'];
            for (const attr of attributeNames) {
              const value = await element.getAttribute(attr);
              if (value) {
                attributes[attr] = value;
              }
            }

            const component: UIComponentMapping = {
              selector: uniqueSelector,
              type: tagName,
              text: text || undefined,
              attributes,
              isClickable,
              isVisible,
              coordinates
            };

            uiMap.components.push(component);
          } catch (error) {
            // Skip elements that can't be analyzed
            continue;
          }
        }
      }

      // Log summary of found components
      const clickableCount = uiMap.components.filter(c => c.isClickable).length;
      const visibleCount = uiMap.components.filter(c => c.isVisible).length;
      console.log(`  📊 UI Scan Results: ${uiMap.components.length} total, ${clickableCount} clickable, ${visibleCount} visible`);
      
      // Log some example components for debugging
      const exampleComponents = uiMap.components.slice(0, 5);
      console.log('  📋 Example components:');
      exampleComponents.forEach(comp => {
        console.log(`    - ${comp.selector} (${comp.type})${comp.text ? `: "${comp.text}"` : ''}`);
      });

      // Export UI map for debugging
      await this.exportUIMap(uiMap);

    } catch (error) {
      console.error('❌ Error scanning page UI:', error);
    }

    return uiMap;
  }

  /**
   * Exports the UI map to a JSON file for debugging and analysis
   */
  private async exportUIMap(uiMap: PageUIMap): Promise<void> {
    try {
      const exportPath = path.join(this.outputDir, 'ui-component-map.json');
      const exportData = {
        ...uiMap,
        exportInfo: {
          timestamp: new Date().toISOString(),
          totalComponents: uiMap.components.length,
          clickableComponents: uiMap.components.filter(c => c.isClickable).length,
          visibleComponents: uiMap.components.filter(c => c.isVisible).length,
          componentTypes: [...new Set(uiMap.components.map(c => c.type))],
          selectors: uiMap.components.map(c => c.selector)
        }
      };
      
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
      console.log(`  💾 UI map exported to: ${exportPath}`);
      
      // Also create a simplified summary file
      const summaryPath = path.join(this.outputDir, 'ui-components-summary.txt');
      const summary = this.generateUISummary(uiMap);
      fs.writeFileSync(summaryPath, summary);
      console.log(`  📝 UI summary exported to: ${summaryPath}`);
      
    } catch (error) {
      console.error('❌ Error exporting UI map:', error);
    }
  }

  /**
   * Generates a human-readable summary of the UI components
   */
  private generateUISummary(uiMap: PageUIMap): string {
    const summary: string[] = [];
    summary.push('UI Components Summary');
    summary.push('====================');
    summary.push(`URL: ${uiMap.url}`);
    summary.push(`Timestamp: ${new Date(uiMap.timestamp).toISOString()}`);
    summary.push(`Total Components: ${uiMap.components.length}`);
    summary.push('');
    
    // Group by type
    const byType = uiMap.components.reduce((acc, comp) => {
      if (!acc[comp.type]) acc[comp.type] = [];
      acc[comp.type].push(comp);
      return acc;
    }, {} as Record<string, UIComponentMapping[]>);
    
    Object.entries(byType).forEach(([type, components]) => {
      summary.push(`${type.toUpperCase()} (${components.length}):`);
      components.forEach(comp => {
        const status = comp.isClickable ? 'CLICKABLE' : comp.isVisible ? 'VISIBLE' : 'HIDDEN';
        const text = comp.text ? `: "${comp.text}"` : '';
        summary.push(`  - ${comp.selector} (${comp.type}) [${status}]${text}`);
      });
      summary.push('');
    });
    
    // Clickable components summary
    const clickable = uiMap.components.filter(c => c.isClickable);
    summary.push(`CLICKABLE COMPONENTS (${clickable.length}):`);
    clickable.forEach(comp => {
      const text = comp.text ? `: "${comp.text}"` : '';
      summary.push(`  - ${comp.selector} (${comp.type})${text}`);
    });
    
    // Add validation recommendations
    summary.push('');
    summary.push('VALIDATION RECOMMENDATIONS:');
    summary.push('==========================');
    
    const recommendations = this.generateValidationRecommendations(uiMap);
    recommendations.forEach(rec => summary.push(`- ${rec}`));
    
    return summary.join('\n');
  }

  /**
   * Generates validation recommendations for the UI map
   */
  private generateValidationRecommendations(uiMap: PageUIMap): string[] {
    const recommendations: string[] = [];
    
    // Check for components without proper selectors
    const componentsWithoutId = uiMap.components.filter(c => 
      !c.selector.startsWith('#') && !c.selector.startsWith('.')
    );
    if (componentsWithoutId.length > 0) {
      recommendations.push(`Consider adding IDs or data-testid attributes to ${componentsWithoutId.length} components for better targeting`);
    }
    
    // Check for components without text content
    const componentsWithoutText = uiMap.components.filter(c => !c.text && c.isClickable);
    if (componentsWithoutText.length > 0) {
      recommendations.push(`Add aria-label or title attributes to ${componentsWithoutText.length} clickable components without text`);
    }
    
    // Check for overlapping coordinates
    const componentsWithCoords = uiMap.components.filter(c => c.coordinates);
    const overlapping = this.findOverlappingComponents(componentsWithCoords);
    if (overlapping.length > 0) {
      recommendations.push(`Found ${overlapping.length} pairs of components with overlapping coordinates - may cause targeting issues`);
    }
    
    // Check for components outside viewport
    const outOfBounds = uiMap.components.filter(c => {
      if (!c.coordinates) return false;
      const [x, y] = c.coordinates;
      return x < 0 || x > 1920 || y < 0 || y > 1080;
    });
    if (outOfBounds.length > 0) {
      recommendations.push(`Found ${outOfBounds.length} components with coordinates outside viewport bounds`);
    }
    
    // Check for accessibility issues
    const clickableWithoutRole = uiMap.components.filter(c => 
      c.isClickable && !c.attributes['role'] && !['button', 'a'].includes(c.type)
    );
    if (clickableWithoutRole.length > 0) {
      recommendations.push(`Consider adding role attributes to ${clickableWithoutRole.length} clickable components for better accessibility`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('UI map looks good! All components have proper selectors and attributes');
    }
    
    return recommendations;
  }

  /**
   * Finds components with overlapping coordinates
   */
  private findOverlappingComponents(components: UIComponentMapping[]): Array<[UIComponentMapping, UIComponentMapping]> {
    const overlapping: Array<[UIComponentMapping, UIComponentMapping]> = [];
    
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i];
        const comp2 = components[j];
        
        if (comp1.coordinates && comp2.coordinates) {
          const [x1, y1] = comp1.coordinates;
          const [x2, y2] = comp2.coordinates;
          const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          
          // Consider overlapping if distance is less than 20 pixels
          if (distance < 20) {
            overlapping.push([comp1, comp2]);
          }
        }
      }
    }
    
    return overlapping;
  }

  private async executeBeat(beat: Beat, page: Page, uiMap: PageUIMap) {
    console.log(`  🎯 Executing ${beat.actions.length} actions for beat ${beat.id}`);
    
    // Humanize the actions using InteractionBot
    const humanizedActions = this.interactionBot.humanizeActions(beat.actions, uiMap);
    console.log(`  🤖 Humanized into ${humanizedActions.length} actions`);
    
    // Generate beautiful overlays using GraphicsBot
    const overlayActions = beat.actions.filter(action => action.includes('overlay('));
    if (overlayActions.length > 0) {
      const overlayDescriptors = this.graphicsBot.generateOverlays(overlayActions);
      console.log(`  🎨 Generated ${overlayDescriptors.length} beautiful overlays`);
      
      // Store overlay descriptors for later use
      this.currentOverlayDescriptors = overlayDescriptors;
    }
    
    // Execute each humanized action
    for (let i = 0; i < humanizedActions.length; i++) {
      const action = humanizedActions[i];
      console.log(`    📝 Action ${i + 1}/${humanizedActions.length}: ${action.action}${action.comment ? ` (${action.comment})` : ''}`);
      
      try {
        await this.executeHumanizedAction(action, page);
      } catch (error) {
        console.error(`    ❌ Error executing humanized action ${action.action}:`, error);
      }
    }
  }

  private async executeHumanizedAction(action: HumanizedAction, page: Page) {
    try {
      switch (action.action) {
        case 'goto':
          await page.goto('http://localhost:3000');
          console.log('      🌐 Navigated to app');
          break;
          
        case 'waitForSelector':
          if (action.selector) {
            await page.waitForSelector(action.selector);
            console.log(`      ⏳ Waited for selector: ${action.selector}`);
          }
          break;
          
        case 'hover':
          if (action.selector) {
            await page.hover(action.selector);
            console.log(`      🖱️ Hovered over: ${action.selector}`);
            if (action.duration) {
              await page.waitForTimeout(action.duration);
            }
          }
          break;
          
        case 'click':
          if (action.selector) {
            await page.click(action.selector);
            console.log(`      🖱️ Clicked: ${action.selector}`);
          } else if (action.coordinates) {
            await page.mouse.click(action.coordinates[0], action.coordinates[1]);
            console.log(`      🖱️ Clicked at (${action.coordinates[0]}, ${action.coordinates[1]})`);
          }
          break;
          
        case 'wait':
          if (action.milliseconds) {
            await page.waitForTimeout(action.milliseconds);
            console.log(`      ⏱️ Waited ${action.milliseconds}ms`);
          }
          break;
          
        case 'mouseMove':
          if (action.path && action.path.length > 0) {
            // Execute smooth mouse movement along the path
            await this.executeSmoothMouseMove(page, action.path, action.duration || 500);
            console.log(`      🖱️ Moved mouse along path (${action.path.length} points)`);
          } else if (action.coordinates) {
            await page.mouse.move(action.coordinates[0], action.coordinates[1]);
            console.log(`      🖱️ Moved mouse to (${action.coordinates[0]}, ${action.coordinates[1]})`);
          }
          break;
          
        case 'wheel':
          if (action.milliseconds) {
            await page.mouse.wheel(0, action.milliseconds);
            console.log(`      ⏱️ Scrolled wheel: ${action.milliseconds}`);
          }
          break;
          
        case 'mouseDrag':
          if (action.coordinates && action.path && action.path.length > 0) {
            const [startX, startY] = action.coordinates;
            const [endX, endY] = action.path[0];
            await page.mouse.move(startX, startY);
            await page.mouse.down();
            await page.mouse.move(endX, endY);
            await page.mouse.up();
            console.log(`      🖱️ Dragged from (${startX}, ${startY}) to (${endX}, ${endY})`);
          }
          break;
          
        case 'screenshot':
          // Handle screenshot actions by calling the original executeAction
          await this.executeAction(action.comment || '', page);
          break;
          
        case 'overlay':
          // Handle overlay actions by calling the original executeAction
          await this.executeAction(action.comment || '', page);
          break;
          
        default:
          console.log(`      ⚠️ Unknown action type: ${action.action}`);
      }
    } catch (error) {
      console.error(`      ❌ Error executing action ${action.action}:`, error);
      throw error;
    }
  }
  
  private async executeSmoothMouseMove(page: Page, path: [number, number][], duration: number) {
    if (path.length < 2) return;
    
    const stepDuration = duration / (path.length - 1);
    
    for (let i = 1; i < path.length; i++) {
      const [x, y] = path[i];
      await page.mouse.move(x, y);
      
      if (i < path.length - 1) {
        await page.waitForTimeout(stepDuration);
      }
    }
  }

  private async executeAction(action: string, page: Page) {
    // Parse action string and execute accordingly
    if (action.startsWith('goto(')) {
      const url = action.match(/goto\(([^)]+)\)/)?.[1];
      if (url === 'APP_URL') {
        await page.goto('http://localhost:3000');
        console.log('      🌐 Navigated to app');
      }
    } else if (action.startsWith('waitForSelector(')) {
      const selector = action.match(/waitForSelector\(([^)]+)\)/)?.[1];
      if (selector) {
        await page.waitForSelector(selector);
        console.log(`      ⏳ Waited for selector: ${selector}`);
      }
    } else if (action.startsWith('click(')) {
      const selector = action.match(/click\(([^)]+)\)/)?.[1];
      if (selector) {
        await page.click(selector);
        console.log(`      🖱️ Clicked: ${selector}`);
      }
    } else if (action.startsWith('wait(')) {
      const ms = parseInt(action.match(/wait\(([^)]+)\)/)?.[1] || '1000');
      await page.waitForTimeout(ms);
      console.log(`      ⏱️ Waited ${ms}ms`);
    } else if (action.startsWith('mouseMove(')) {
      const coordsMatch = action.match(/mouseMove\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 2) {
          await page.mouse.move(coords[0], coords[1]);
          console.log(`      🖱️ Moved mouse to (${coords[0]}, ${coords[1]})`);
        }
      }
    } else if (action.startsWith('mouseClick(')) {
      const coordsMatch = action.match(/mouseClick\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 2) {
          await page.mouse.click(coords[0], coords[1]);
          console.log(`      🖱️ Clicked at (${coords[0]}, ${coords[1]})`);
        }
      }
    } else if (action.startsWith('mouseDrag(')) {
      const coordsMatch = action.match(/mouseDrag\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 4) {
          await page.mouse.move(coords[0], coords[1]);
          await page.mouse.down();
          await page.mouse.move(coords[2], coords[3]);
          await page.mouse.up();
          console.log(`      🖱️ Dragged from (${coords[0]}, ${coords[1]}) to (${coords[2]}, ${coords[3]})`);
        }
      }
    } else if (action.startsWith('wheel(')) {
      const delta = parseInt(action.match(/wheel\(([^)]+)\)/)?.[1] || '0');
      await page.mouse.wheel(0, delta);
      console.log(`      🖱️ Scrolled wheel: ${delta}`);
    } else if (action.startsWith('screenshot(')) {
      const pathMatch = action.match(/screenshot\(([^)]+)\)/)?.[1];
      if (pathMatch) {
        const screenshotPath = pathMatch.replace(/"/g, '');
        const fullPath = path.join(__dirname, '..', screenshotPath);
        
        // Ensure directory exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        await page.screenshot({ path: fullPath });
        console.log(`      📸 Screenshot saved: ${screenshotPath}`);
      }
    } else if (action.startsWith('overlay(')) {
      // Handle overlay actions with the overlay engine
      await this.overlayEngine.handleOverlayAction(action, page);
    }
  }

  private async generateFinalVideo() {
    console.log('🎬 Generating final video...');
    
    // Get the recorded video file
    const videoFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length === 0) {
      console.error('❌ No video files found to combine');
      return;
    }
    
    const inputFile = path.join(this.outputDir, videoFiles[0]);
    const outputPath = path.join(this.outputDir, 'proper-demo-video-final.mp4');
    
    try {
      // Convert webm to mp4 with professional quality settings, enhancement filters, and audio
      const voiceoverPath = path.join(__dirname, '..', 'audio', 'voiceover.wav');
      let ffmpegCommand;
      
      if (fs.existsSync(voiceoverPath)) {
        // Include audio if voiceover exists
        ffmpegCommand = `ffmpeg -i "${inputFile}" -i "${voiceoverPath}" -vf "unsharp=3:3:1.5:3:3:0.5,eq=contrast=1.1:brightness=0.05" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart -pix_fmt yuv420p "${outputPath}"`;
        console.log('🎵 Including voiceover audio in final video...');
      } else {
        // No audio, just video
        ffmpegCommand = `ffmpeg -i "${inputFile}" -vf "unsharp=3:3:1.5:3:3:0.5,eq=contrast=1.1:brightness=0.05" -c:v libx264 -preset slow -crf 18 -movflags +faststart -pix_fmt yuv420p "${outputPath}"`;
        console.log('⚠️ No voiceover audio found, generating video only...');
      }
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      console.log(`✅ Final video generated: ${outputPath}`);
      
      // Get video info
      const videoInfo = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${outputPath}"`, { encoding: 'utf8' });
      const info = JSON.parse(videoInfo);
      const duration = parseFloat(info.format.duration);
      
      console.log(`📊 Video details:`);
      console.log(`   Duration: ${duration.toFixed(2)}s`);
      console.log(`   Size: ${(parseInt(info.format.size) / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Resolution: ${info.streams[0].width}x${info.streams[0].height}`);
      
      // Clean up the original webm file
      if (fs.existsSync(inputFile)) {
        fs.unlinkSync(inputFile);
        console.log('🧹 Cleaned up original webm file');
      }
      
    } catch (error) {
      console.error('❌ Error generating final video:', error);
    }
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

class OverlayEngine {
  private overlayElements: Map<string, any> = new Map();
  private assetsDir: string;

  constructor() {
    this.assetsDir = path.join(__dirname, '..', 'assets');
  }

  async handleOverlayAction(action: string, page: Page) {
    try {
      const match = action.match(/overlay\(([^)]+)\)/);
      if (!match) return;

      const params = match[1].split(',');
      const overlayType = params[0];
      
      // Handle content that may contain commas by looking for the last two parameters
      let overlayContent = '';
      let timing = 0;
      
      if (params.length >= 3) {
        // Last two params are direction and timing
        const direction = params[params.length - 2];
        timing = parseInt(params[params.length - 1] || '0');
        // Everything in between is content
        overlayContent = params.slice(1, params.length - 2).join(',');
      } else if (params.length === 2) {
        overlayContent = params[1];
      }
      
      // Parse overlay type and content if they're colon-separated
      let actualType = overlayType;
      if (overlayType.includes(':')) {
        const [type, content] = overlayType.split(':', 2);
        actualType = type;
        overlayContent = content + (overlayContent ? ',' + overlayContent : '');
      }

      console.log(`      🎨 Overlay: ${actualType} - ${overlayContent} at ${timing}ms`);

      switch (actualType) {
        case 'intro.fullscreen':
          await this.showFullscreenOverlay('intro', page);
          break;
        case 'title':
          await this.showTitleOverlay(overlayContent, page);
          break;
        case 'subtitle':
          await this.showSubtitleOverlay(overlayContent, page);
          break;
        case 'lowerThird':
          await this.showLowerThirdOverlay(overlayContent, page);
          break;
        case 'diagram':
          await this.showDiagramOverlay(overlayContent, page);
          break;
        case 'callout':
          await this.showCalloutOverlay(overlayContent, page);
          break;
        case 'chip':
          await this.showChipOverlay(overlayContent, page);
          break;
        case 'status':
          await this.showStatusOverlay(overlayContent, page);
          break;
        case 'badge':
          await this.showBadgeOverlay(overlayContent, page);
          break;
        case 'routeOverlay':
          await this.showRouteOverlay(overlayContent, page);
          break;
        case 'reveal':
          // Handle reveal action for existing overlays
          await this.revealOverlay(overlayContent, page);
          break;
        case 'panel':
          await this.showPanelOverlay(overlayContent, page);
          break;
        case 'type':
          await this.showTypeOverlay(overlayContent, page);
          break;
        case 'card':
          await this.showCardOverlay(overlayContent, page);
          break;
        case 'label':
          await this.showLabelOverlay(overlayContent, page);
          break;
        case 'slide':
          await this.showSlideOverlay(overlayContent, page);
          break;
        case 'conclusion':
          await this.showConclusionOverlay(overlayContent, page);
          break;
        case 'problem':
          await this.showProblemOverlay(overlayContent, page);
          break;
        case 'user_roles':
          await this.showUserRolesOverlay(overlayContent, page);
          break;
        case 'value':
          await this.showValueOverlay(overlayContent, page);
          break;
        case 'ingestion':
          await this.showIngestionOverlay(overlayContent, page);
          break;
        case 'processing':
          await this.showProcessingOverlay(overlayContent, page);
          break;
        case 'routing':
          await this.showRoutingOverlay(overlayContent, page);
          break;
        case 'delivery':
          await this.showDeliveryOverlay(overlayContent, page);
          break;
        case 'endpoints':
          await this.showEndpointsOverlay(overlayContent, page);
          break;
        case 'layers':
          await this.showLayersOverlay(overlayContent, page);
          break;
        case 'hazard_info':
          await this.showHazardInfoOverlay(overlayContent, page);
          break;
        case 'triage':
          await this.showTriageOverlay(overlayContent, page);
          break;
        case 'zone_card':
          await this.showZoneCardOverlay(overlayContent, page);
          break;
        case 'progress':
          await this.showProgressOverlay(overlayContent, page);
          break;
        case 'buildings':
          await this.showBuildingsOverlay(overlayContent, page);
          break;
        case 'endpoint':
          await this.showEndpointOverlay(overlayContent, page);
          break;
        case 'foundry':
          await this.showFoundryOverlay(overlayContent, page);
          break;
        case 'route_concept':
          await this.showRouteConceptOverlay(overlayContent, page);
          break;
        case 'profiles':
          await this.showProfilesOverlay(overlayContent, page);
          break;
        case 'constraints':
          await this.showConstraintsOverlay(overlayContent, page);
          break;
        case 'result':
          await this.showResultOverlay(overlayContent, page);
          break;
        case 'ai_question':
          await this.showAIQuestionOverlay(overlayContent, page);
          break;
        case 'ai_evaluation':
          await this.showAIEvaluationOverlay(overlayContent, page);
          break;
        case 'ai_recommendation':
          await this.showAIRecommendationOverlay(overlayContent, page);
          break;
        case 'ai_control':
          await this.showAIControlOverlay(overlayContent, page);
          break;
        case 'reliability':
          await this.showReliabilityOverlay(overlayContent, page);
          break;
        case 'security':
          await this.showSecurityOverlay(overlayContent, page);
          break;
        case 'performance':
          await this.showPerformanceOverlay(overlayContent, page);
          break;
        case 'impact':
          await this.showImpactOverlay(overlayContent, page);
          break;
        case 'democratization':
          await this.showDemocratizationOverlay(overlayContent, page);
          break;
        case 'focus':
          await this.showFocusOverlay(overlayContent, page);
          break;
        case 'contact':
          await this.showContactOverlay(overlayContent, page);
          break;
        case '*':
          await this.hideAllOverlays(page);
          break;
        default:
          console.log(`      ⚠️ Unknown overlay type: ${actualType}`);
      }

      // Wait for timing if specified
      if (timing > 0) {
        await page.waitForTimeout(timing);
      }

    } catch (error) {
      console.error(`      ❌ Error handling overlay action: ${error}`);
    }
  }

  private async showFullscreenOverlay(type: string, page: Page) {
    // Create a fullscreen overlay element
    await page.evaluate((overlayType) => {
      const overlay = document.createElement('div');
      overlay.id = 'fullscreen-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      if (overlayType === 'intro') {
        overlay.innerHTML = `
          <h1 style="font-size: 4rem; margin: 0; text-align: center; font-weight: 300;">
            Disaster Response Platform
          </h1>
          <p style="font-size: 1.5rem; margin: 1rem 0 0 0; opacity: 0.9;">
            Palantir Building Challenge — Ian Frelinger
          </p>
        `;
      }
      
      document.body.appendChild(overlay);
    }, type);
  }

  private async showTitleOverlay(text: string, page: Page) {
    await page.evaluate((titleText) => {
      const overlay = document.createElement('div');
      overlay.id = 'title-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2rem 4rem;
        border-radius: 8px;
        font-size: 2.5rem;
        font-weight: 600;
        z-index: 10001;
        text-align: center;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = titleText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showSubtitleOverlay(text: string, page: Page) {
    await page.evaluate((subtitleText) => {
      const overlay = document.createElement('div');
      overlay.id = 'subtitle-overlay';
      overlay.style.cssText = `
        position: fixed;
        bottom: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 1rem 2rem;
        border-radius: 6px;
        font-size: 1.2rem;
        z-index: 10001;
        text-align: center;
      `;
      overlay.textContent = subtitleText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showLowerThirdOverlay(text: string, page: Page) {
    await page.evaluate((lowerThirdText) => {
      const overlay = document.createElement('div');
      overlay.id = 'lower-third-overlay';
      overlay.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.9) 0%, rgba(59, 130, 246, 0.7) 100%);
        color: white;
        padding: 1.5rem 2rem;
        font-size: 1.3rem;
        font-weight: 500;
        z-index: 10001;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = lowerThirdText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showDiagramOverlay(imagePath: string, page: Page) {
    await page.evaluate((imgPath) => {
      const overlay = document.createElement('div');
      overlay.id = 'diagram-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        max-width: 80vw;
        max-height: 80vh;
        overflow: hidden;
      `;
      
      const img = document.createElement('img');
      img.src = imgPath;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
      `;
      
      overlay.appendChild(img);
      document.body.appendChild(overlay);
    }, imagePath);
  }

  private async showCalloutOverlay(text: string, page: Page) {
    await page.evaluate((calloutText) => {
      const overlay = document.createElement('div');
      overlay.id = 'callout-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 20%;
        right: 5%;
        background: rgba(34, 197, 94, 0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 500;
        z-index: 10001;
        max-width: 300px;
        text-align: center;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = calloutText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showChipOverlay(text: string, page: Page) {
    await page.evaluate((chipText) => {
      const overlay = document.createElement('div');
      overlay.id = 'chip-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(99, 102, 241, 0.9);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 20px;
        font-size: 1rem;
        font-weight: 500;
        z-index: 10001;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = chipText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showStatusOverlay(text: string, page: Page) {
    await page.evaluate((statusText) => {
      const overlay = document.createElement('div');
      overlay.id = 'status-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 15%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.2rem;
        font-weight: 600;
        z-index: 10001;
        text-align: center;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = statusText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showBadgeOverlay(text: string, page: Page) {
    await page.evaluate((badgeText) => {
      const overlay = document.createElement('div');
      overlay.id = 'badge-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 25%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(168, 85, 247, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 500;
        z-index: 10001;
        text-align: center;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = badgeText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showRouteOverlay(imagePath: string, page: Page) {
    await page.evaluate((imgPath) => {
      const overlay = document.createElement('div');
      overlay.id = 'route-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
      `;
      
      const img = document.createElement('img');
      img.src = imgPath;
      img.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      `;
      
      overlay.appendChild(img);
      document.body.appendChild(overlay);
    }, imagePath);
  }

  private async showPanelOverlay(text: string, page: Page) {
    await page.evaluate((panelText) => {
      const overlay = document.createElement('div');
      overlay.id = 'panel-overlay';
      overlay.style.cssText = `
        position: fixed;
        bottom: 20%;
        right: 5%;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 500;
        z-index: 10001;
        max-width: 350px;
        text-align: center;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = panelText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showTypeOverlay(text: string, page: Page) {
    await page.evaluate((typeText) => {
      const overlay = document.createElement('div');
      overlay.id = 'type-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 40%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(245, 158, 11, 0.9);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 8px;
        font-size: 1.3rem;
        font-weight: 600;
        z-index: 10001;
        text-align: center;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = typeText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showCardOverlay(text: string, page: Page) {
    await page.evaluate((cardText) => {
      const overlay = document.createElement('div');
      overlay.id = 'card-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(34, 197, 94, 0.9);
        color: white;
        padding: 2rem 3rem;
        border-radius: 12px;
        font-size: 1.2rem;
        font-weight: 500;
        z-index: 10001;
        text-align: center;
        max-width: 500px;
        backdrop-filter: blur(10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      `;
      overlay.textContent = cardText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showLabelOverlay(text: string, page: Page) {
    await page.evaluate((labelText) => {
      const overlay = document.createElement('div');
      overlay.id = 'label-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 35%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(6, 182, 212, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 500;
        z-index: 10001;
        text-align: center;
        backdrop-filter: blur(10px);
      `;
      overlay.textContent = labelText;
      document.body.appendChild(overlay);
    }, text);
  }

  private async showSlideOverlay(imagePath: string, page: Page) {
    await page.evaluate((imgPath) => {
      const overlay = document.createElement('div');
      overlay.id = 'slide-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
      `;
      
      const img = document.createElement('img');
      img.src = imgPath;
      img.style.cssText = `
        max-width: 95vw;
        max-height: 95vh;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
      `;
      
      overlay.appendChild(img);
      document.body.appendChild(overlay);
    }, imagePath);
  }

  private async showConclusionOverlay(imagePath: string, page: Page) {
    await page.evaluate((imgPath) => {
      const overlay = document.createElement('div');
      overlay.id = 'conclusion-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
      `;
      
      const img = document.createElement('img');
      img.src = imgPath;
      img.style.cssText = `
        max-width: 80vw;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 16px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
      `;
      
      overlay.appendChild(img);
      document.body.appendChild(overlay);
    }, imagePath);
  }

  private async revealOverlay(overlayId: string, page: Page) {
    await page.evaluate((id) => {
      const overlay = document.getElementById(id);
      if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.transform = 'scale(1)';
      }
    }, overlayId);
    console.log(`      🎨 Revealed overlay: ${overlayId}`);
  }

  private async hideAllOverlays(page: Page) {
    await page.evaluate(() => {
      const overlays = document.querySelectorAll('[id$="-overlay"]');
      overlays.forEach(overlay => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      });
    });
    console.log('      🎨 Hidden all overlays');
  }

  // Generic overlay method for most new overlay types
  private async showGenericOverlay(content: string, page: Page, style: string = 'default') {
    await page.evaluate(({ overlayContent, overlayStyle }) => {
      const overlay = document.createElement('div');
      overlay.id = `generic-overlay-${Date.now()}`;
      
      let cssStyle = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 500;
        z-index: 10001;
        text-align: center;
        backdrop-filter: blur(10px);
        max-width: 80vw;
      `;
      
      if (overlayStyle === 'problem') {
        cssStyle += 'background: rgba(220, 38, 38, 0.9);';
      } else if (overlayStyle === 'value') {
        cssStyle += 'background: rgba(34, 197, 94, 0.9);';
      } else if (overlayStyle === 'tech') {
        cssStyle += 'background: rgba(59, 130, 246, 0.9);';
      }
      
      overlay.style.cssText = cssStyle;
      overlay.textContent = overlayContent;
      document.body.appendChild(overlay);
    }, { overlayContent: content, overlayStyle: style });
  }

  // Implement all the missing overlay methods using the generic approach
  private async showProblemOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'problem');
  }

  private async showUserRolesOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'value');
  }

  private async showValueOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'value');
  }

  private async showIngestionOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showProcessingOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showRoutingOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showDeliveryOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showEndpointsOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showLayersOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'default');
  }

  private async showHazardInfoOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'problem');
  }

  private async showTriageOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'default');
  }

  private async showZoneCardOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'value');
  }

  private async showProgressOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'value');
  }

  private async showBuildingsOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'default');
  }

  private async showEndpointOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showFoundryOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showRouteConceptOverlay(content: string, page: Page) {
    await this.showRouteOverlay(content, page);
  }

  private async showProfilesOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showConstraintsOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showResultOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'value');
  }

  private async showAIQuestionOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'default');
  }

  private async showAIEvaluationOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showAIRecommendationOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'value');
  }

  private async showAIControlOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'default');
  }

  private async showReliabilityOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showSecurityOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showPerformanceOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'tech');
  }

  private async showImpactOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'value');
  }

  private async showDemocratizationOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'value');
  }

  private async showFocusOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'default');
  }

  private async showContactOverlay(content: string, page: Page) {
    await this.showGenericOverlay(content, page, 'default');
  }
}

// Run the video creation
const creator = new ProperDemoVideoCreator();
creator.createProperDemoVideo().catch(console.error);
