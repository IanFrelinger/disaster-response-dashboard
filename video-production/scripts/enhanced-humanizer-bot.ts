#!/usr/bin/env ts-node

import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { UIElementDiscovery, type UIElement } from './ui-element-discovery.ts';

interface EnhancedHumanizedInteraction {
  name: string;
  description: string;
  duration: number;
  actions: EnhancedHumanizedAction[];
  outputFile: string;
  technicalFocus: string;
  validation: EnhancedValidationResult;
  uiElementReport: UIElementReport;
}

interface EnhancedHumanizedAction {
  type: 'click' | 'hover' | 'type' | 'scroll' | 'wait' | 'navigate' | 'custom' | 'keyboard' | 'mouse_movement';
  selector?: string;
  text?: string;
  x?: number;
  y?: number;
  delay?: number;
  description: string;
  naturalLanguage: string;
  customScript?: string;
  key?: string;
  modifiers?: string[];
  validation: EnhancedActionValidation;
  realUIElements: UIElement[];
  confidence: number; // 0-100
  // Enhanced human-like behavior
  mouseMovement?: MouseMovementPattern;
  humanMistakes?: HumanMistake[];
  visibilityDelay?: number; // Extra delay for demo visibility
  cursorBehavior?: CursorBehavior;
}

interface MouseMovementPattern {
  type: 'natural' | 'hesitant' | 'confident' | 'exploratory';
  speed: 'slow' | 'medium' | 'fast';
  path: 'direct' | 'curved' | 'zigzag' | 'hesitant';
  overshoot?: boolean; // Sometimes overshoot the target
  correction?: boolean; // Correct course if overshooting
  pausePoints?: number[]; // Points to pause during movement
}

interface HumanMistake {
  type: 'overshoot' | 'double_click' | 'wrong_element' | 'hesitation' | 'correction';
  probability: number; // 0-1 chance of making this mistake
  description: string;
  recoveryAction?: string;
}

interface CursorBehavior {
  showCursor: boolean;
  cursorStyle: 'default' | 'pointer' | 'text' | 'wait';
  highlightTarget: boolean;
  targetGlow: boolean;
  movementTrail: boolean;
}

interface EnhancedActionValidation {
  elementExists: boolean;
  elementVisible: boolean;
  elementInteractable: boolean;
  fallbackSelectors?: string[];
  coordinates?: { x: number; y: number };
  realElementMatch: boolean;
  suggestedElements: UIElement[];
  validationScore: number; // 0-100
}

interface EnhancedValidationResult {
  overall: 'valid' | 'partial' | 'invalid';
  score: number; // 0-100
  issues: string[];
  warnings: string[];
  suggestions: string[];
  realElementCoverage: number; // Percentage of actions with real UI elements
  confidence: number; // Overall confidence in the configuration
}

interface UIElementReport {
  totalElements: number;
  elementCategories: {
    buttons: number;
    links: number;
    inputs: number;
    navigation: number;
    interactive: number;
    content: number;
  };
  discoveredElements: UIElement[];
  elementMap: { [key: string]: UIElement[] };
}

class EnhancedHumanizerBot {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private uiDiscovery: UIElementDiscovery | null = null;
  private projectRoot: string;
  private outputDir: string;
  private configDir: string;
  private isInitialized: boolean = false;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.outputDir = path.join(this.projectRoot, 'out');
    this.configDir = path.join(this.projectRoot, 'config', 'interactions');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.outputDir, this.configDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize(url: string): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Enhanced Humanizer Bot...');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await this.context.newPage();
    await this.page.goto(url, { waitUntil: 'networkidle' });

    this.uiDiscovery = new UIElementDiscovery();
    await this.uiDiscovery.initialize(url);

    this.isInitialized = true;
    console.log('✅ Enhanced Humanizer Bot initialized');
  }

  private generateMouseMovementPattern(actionType: string): MouseMovementPattern {
    const patterns: MouseMovementPattern[] = [
      {
        type: 'natural',
        speed: 'medium',
        path: 'curved',
        overshoot: Math.random() < 0.3, // 30% chance of overshooting
        correction: true,
        pausePoints: [0.3, 0.7] // Pause at 30% and 70% of movement
      },
      {
        type: 'hesitant',
        speed: 'slow',
        path: 'zigzag',
        overshoot: Math.random() < 0.5, // 50% chance of overshooting
        correction: true,
        pausePoints: [0.2, 0.5, 0.8] // Multiple pause points
      },
      {
        type: 'confident',
        speed: 'medium',
        path: 'direct',
        overshoot: Math.random() < 0.1, // 10% chance of overshooting
        correction: false,
        pausePoints: [0.5] // Single pause point
      },
      {
        type: 'exploratory',
        speed: 'slow',
        path: 'curved',
        overshoot: Math.random() < 0.4, // 40% chance of overshooting
        correction: true,
        pausePoints: [0.25, 0.6, 0.9] // Multiple pause points
      }
    ];

    // Choose pattern based on action type
    if (actionType === 'click') {
      return patterns[Math.floor(Math.random() * 2)]; // natural or hesitant
    } else if (actionType === 'hover') {
      return patterns[2]; // confident
    } else {
      return patterns[Math.floor(Math.random() * patterns.length)];
    }
  }

  private generateHumanMistakes(actionType: string): HumanMistake[] {
    const mistakes: HumanMistake[] = [];

    // Overshoot mistake (common)
    if (Math.random() < 0.4) {
      mistakes.push({
        type: 'overshoot',
        probability: 0.4,
        description: 'Mouse overshoots target and needs correction',
        recoveryAction: 'Correct course and move to target'
      });
    }

    // Double-click mistake (occasional)
    if (actionType === 'click' && Math.random() < 0.15) {
      mistakes.push({
        type: 'double_click',
        probability: 0.15,
        description: 'Accidentally double-clicks instead of single click',
        recoveryAction: 'Wait and continue with next action'
      });
    }

    // Hesitation mistake (common)
    if (Math.random() < 0.6) {
      mistakes.push({
        type: 'hesitation',
        probability: 0.6,
        description: 'Pauses briefly before completing action',
        recoveryAction: 'Continue after brief pause'
      });
    }

    // Wrong element mistake (rare)
    if (Math.random() < 0.1) {
      mistakes.push({
        type: 'wrong_element',
        probability: 0.1,
        description: 'Clicks on wrong element initially',
        recoveryAction: 'Correct and click on intended element'
      });
    }

    return mistakes;
  }

  private calculateVisibilityDelay(description: string): number {
    const lowerDesc = description.toLowerCase();
    
    // Base delay for demo visibility (much longer than before)
    let baseDelay = 3000; // 3 seconds base delay
    
    if (lowerDesc.includes('wait') || lowerDesc.includes('pause')) {
      baseDelay = 5000; // 5 seconds for wait actions
    } else if (lowerDesc.includes('load') || lowerDesc.includes('appear')) {
      baseDelay = 4000; // 4 seconds for loading actions
    } else if (lowerDesc.includes('click') || lowerDesc.includes('select')) {
      baseDelay = 3500; // 3.5 seconds for click actions
    } else if (lowerDesc.includes('hover') || lowerDesc.includes('mouse over')) {
      baseDelay = 3000; // 3 seconds for hover actions
    } else if (lowerDesc.includes('scroll') || lowerDesc.includes('move')) {
      baseDelay = 4000; // 4 seconds for scroll actions
    }
    
    // Add random human-like variation (±1000ms for visibility)
    const variation = Math.random() * 2000 - 1000;
    return Math.max(2000, baseDelay + variation); // Minimum 2 seconds
  }

  private calculateNaturalDelay(description: string): number {
    const lowerDesc = description.toLowerCase();
    
    // Longer descriptions usually need more time
    let baseDelay = 2000; // Increased from 1000ms
    
    if (lowerDesc.includes('wait') || lowerDesc.includes('pause')) {
      baseDelay = 4000; // Increased from 2000ms
    } else if (lowerDesc.includes('load') || lowerDesc.includes('appear')) {
      baseDelay = 3000; // Increased from 1500ms
    } else if (lowerDesc.includes('quick') || lowerDesc.includes('fast')) {
      baseDelay = 1500; // Increased from 500ms
    }
    
    // Add random human-like variation (±500ms for visibility)
    const variation = Math.random() * 1000 - 500;
    return Math.max(1000, baseDelay + variation); // Minimum 1 second
  }

  private generateCursorBehavior(): CursorBehavior {
    return {
      showCursor: true,
      cursorStyle: 'pointer',
      highlightTarget: true,
      targetGlow: true,
      movementTrail: true
    };
  }

  private async validateAction(parsed: any, realElements: any[]): Promise<EnhancedActionValidation> {
    const validation: EnhancedActionValidation = {
      elementExists: realElements.length > 0,
      elementVisible: realElements.some(el => el.isVisible),
      elementInteractable: realElements.some(el => el.isEnabled && el.isVisible),
      realElementMatch: realElements.length > 0,
      suggestedElements: realElements.slice(0, 3),
      validationScore: 0
    };

    // Calculate validation score
    let score = 0;
    if (validation.elementExists) score += 30;
    if (validation.elementVisible) score += 25;
    if (validation.elementInteractable) score += 25;
    if (validation.realElementMatch) score += 20;
    
    validation.validationScore = score;

    // Generate fallback selectors from real elements
    if (realElements.length > 0) {
      validation.fallbackSelectors = realElements
        .filter(el => el.selector)
        .map(el => el.selector);
      
      // Use coordinates from the best match
      const bestMatch = realElements[0];
      if (bestMatch.boundingBox) {
        validation.coordinates = {
          x: bestMatch.boundingBox.x + bestMatch.boundingBox.width / 2,
          y: bestMatch.boundingBox.y + bestMatch.boundingBox.height / 2
        };
      }
    }

    return validation;
  }

  async parseNaturalLanguageWithRealValidation(description: string): Promise<EnhancedHumanizedAction> {
    if (!this.uiDiscovery) throw new Error('UI Discovery not initialized');

    // Parse the natural language description
    const parsed = this.parseNaturalLanguageDescription(description);
    
    // Find real UI elements that match the description
    const realElements = await this.uiDiscovery.findElementsByDescription(description);
    
    // Validate the action
    const validation = await this.validateAction(parsed, realElements);
    
    // Calculate confidence based on real element matches
    const confidence = Math.min(100, realElements.length * 25);
    
    // Generate the action configuration with enhanced human-like behavior
    const action: EnhancedHumanizedAction = {
      type: parsed.action as any,
      selector: validation.fallbackSelectors?.[0] || undefined,
      text: parsed.text,
      delay: this.calculateNaturalDelay(description),
      description: description,
      naturalLanguage: description,
      validation: validation,
      realUIElements: realElements,
      confidence: confidence,
      // Enhanced human-like behavior
      mouseMovement: this.generateMouseMovementPattern(parsed.action),
      humanMistakes: this.generateHumanMistakes(parsed.action),
      visibilityDelay: this.calculateVisibilityDelay(description),
      cursorBehavior: this.generateCursorBehavior()
    };

    // Add coordinates if selector failed but coordinates are available
    if (!action.selector && validation.coordinates) {
      action.x = validation.coordinates.x;
      action.y = validation.coordinates.y;
    }

    return action;
  }

  private parseNaturalLanguageDescription(description: string): {
    action: string;
    target: string;
    text?: string;
  } {
    const lowerDesc = description.toLowerCase();
    
    // Determine action type
    let action = 'click';
    if (lowerDesc.includes('hover') || lowerDesc.includes('mouse over')) {
      action = 'hover';
    } else if (lowerDesc.includes('type') || lowerDesc.includes('enter') || lowerDesc.includes('input')) {
      action = 'type';
    } else if (lowerDesc.includes('scroll') || lowerDesc.includes('move down') || lowerDesc.includes('move up')) {
      action = 'scroll';
    } else if (lowerDesc.includes('wait') || lowerDesc.includes('pause')) {
      action = 'wait';
    } else if (lowerDesc.includes('press') || lowerDesc.includes('key')) {
      action = 'keyboard';
    }

    // Extract target
    let target = description;
    if (lowerDesc.includes('on the')) {
      target = description.split('on the')[1]?.trim() || description;
    } else if (lowerDesc.includes('to the')) {
      target = description.split('to the')[1]?.trim() || description;
    } else if (lowerDesc.includes('the ')) {
      target = description.split('the ')[1]?.trim() || description;
    }

    // Extract text for typing actions
    let text: string | undefined;
    if (action === 'type' && lowerDesc.includes('"')) {
      const match = description.match(/"([^"]+)"/);
      text = match?.[1];
    }

    return { action, target, text };
  }

  async generateEnhancedInteractionConfig(
    naturalLanguageDescriptions: string[],
    segmentName: string,
    duration: number,
    technicalFocus: string
  ): Promise<EnhancedHumanizedInteraction> {
    console.log(`🎬 Generating enhanced interaction config for: ${segmentName}`);
    
    const actions: EnhancedHumanizedAction[] = [];
    
    // Parse each natural language description with real UI validation
    for (const description of naturalLanguageDescriptions) {
      const action = await this.parseNaturalLanguageWithRealValidation(description);
      actions.push(action);
    }
    
    // Generate UI element report
    const uiElementReport = await this.generateUIElementReport();
    
    // Calculate enhanced validation score
    const validation = this.calculateEnhancedValidationScore(actions, uiElementReport);
    
    const interaction: EnhancedHumanizedInteraction = {
      name: segmentName,
      description: `Enhanced humanized interaction: ${segmentName}`,
      duration: duration,
      actions: actions,
      outputFile: `${segmentName.toLowerCase().replace(/\s+/g, '_')}.mp4`,
      technicalFocus: technicalFocus,
      validation: validation,
      uiElementReport: uiElementReport
    };

    return interaction;
  }

  private async generateUIElementReport(): Promise<UIElementReport> {
    if (!this.uiDiscovery) throw new Error('UI Discovery not initialized');

    const elementMap = await this.uiDiscovery.discoverAllUIElements();
    
    return {
      totalElements: Object.values(elementMap).reduce((sum, arr) => sum + arr.length, 0),
      elementCategories: {
        buttons: elementMap.buttons.length,
        links: elementMap.links.length,
        inputs: elementMap.inputs.length,
        navigation: elementMap.navigation.length,
        interactive: elementMap.interactive.length,
        content: elementMap.content.length
      },
      discoveredElements: Object.values(elementMap).flat(),
      elementMap: elementMap
    };
  }

  private calculateEnhancedValidationScore(actions: EnhancedHumanizedAction[], uiReport: UIElementReport): EnhancedValidationResult {
    let totalScore = 0;
    let totalConfidence = 0;
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    for (const action of actions) {
      totalScore += action.validation.validationScore;
      totalConfidence += action.confidence;
      
      if (!action.validation.realElementMatch) {
        issues.push(`No real UI elements found for: "${action.naturalLanguage}"`);
      }
      
      if (action.validation.validationScore < 70) {
        warnings.push(`Low validation score for: "${action.naturalLanguage}"`);
      }
      
      if (action.humanMistakes && action.humanMistakes.length > 0) {
        suggestions.push(`Human mistakes added for realism: ${action.humanMistakes.map(m => m.type).join(', ')}`);
      }
    }

    const avgScore = totalScore / actions.length;
    const avgConfidence = totalConfidence / actions.length;
    const realElementCoverage = (actions.filter(a => a.validation.realElementMatch).length / actions.length) * 100;

    let overall: 'valid' | 'partial' | 'invalid';
    if (avgScore >= 80 && realElementCoverage >= 80) {
      overall = 'valid';
    } else if (avgScore >= 60 && realElementCoverage >= 60) {
      overall = 'partial';
    } else {
      overall = 'invalid';
    }

    return {
      overall,
      score: avgScore,
      issues,
      warnings,
      suggestions,
      realElementCoverage,
      confidence: avgConfidence
    };
  }

  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Enhanced Humanizer Bot cleanup completed');
  }
}

// Main execution
async function main() {
  const bot = new EnhancedHumanizerBot();
  
  try {
    await bot.initialize('http://localhost:3001');
    
    // Example usage
    const naturalLanguageDescriptions = [
      "Click on the hazard layer toggle to show threats",
      "Wait for the hazard data to load",
      "Hover over a hazard point to see details",
      "Click on the risk indicator to expand information"
    ];
    
    const interaction = await bot.generateEnhancedInteractionConfig(
      naturalLanguageDescriptions,
      "Hazard Management Demo",
      45,
      "Real-time hazard interaction and risk assessment"
    );
    
    console.log('✅ Enhanced interaction config generated:', JSON.stringify(interaction, null, 2));
    
  } catch (error) {
    console.error('❌ Enhanced Humanizer Bot failed:', error);
  } finally {
    await bot.cleanup();
  }
}

// ES module execution
main();

export { EnhancedHumanizerBot };
