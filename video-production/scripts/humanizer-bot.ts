#!/usr/bin/env ts-node

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface HumanizedInteraction {
  name: string;
  description: string;
  duration: number;
  actions: HumanizedAction[];
  outputFile: string;
  technicalFocus: string;
  validation: ValidationResult;
}

interface HumanizedAction {
  type: 'click' | 'hover' | 'type' | 'scroll' | 'wait' | 'navigate' | 'custom' | 'keyboard';
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
  validation: {
    elementExists: boolean;
    elementVisible: boolean;
    elementInteractable: boolean;
    fallbackSelectors?: string[];
    coordinates?: { x: number; y: number };
  };
}

interface ValidationResult {
  overall: 'valid' | 'partial' | 'invalid';
  score: number; // 0-100
  issues: string[];
  warnings: string[];
  suggestions: string[];
}

interface NaturalLanguageParser {
  parse(description: string): ParsedAction;
}

interface ParsedAction {
  action: string;
  target: string;
  context?: string;
  modifiers?: string[];
}

class HumanizerBot {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
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
    console.log('🤖 Initializing Humanizer Bot...');
    
    this.browser = await chromium.launch({
      headless: false, // Keep visible for validation
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the target URL
    await this.page.goto(url, { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(2000);
    
    this.isInitialized = true;
    console.log('✅ Humanizer Bot initialized successfully');
  }

  async validateUIElement(description: string): Promise<{
    elementExists: boolean;
    elementVisible: boolean;
    elementInteractable: boolean;
    selector: string;
    fallbackSelectors: string[];
    coordinates?: { x: number; y: number };
  }> {
    if (!this.page) throw new Error('Page not initialized');

    const result = {
      elementExists: false,
      elementVisible: false,
      elementInteractable: false,
      selector: '',
      fallbackSelectors: [] as string[],
      coordinates: undefined as { x: number; y: number } | undefined
    };

    // Try multiple selector strategies
    const selectors = this.generateSelectors(description);
    
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();
          
          if (isVisible && isEnabled) {
            result.elementExists = true;
            result.elementVisible = true;
            result.elementInteractable = true;
            result.selector = selector;
            
            // Get coordinates for fallback
            const box = await element.boundingBox();
            if (box) {
              result.coordinates = {
                x: box.x + box.width / 2,
                y: box.y + box.height / 2
              };
            }
            break;
          } else if (isVisible) {
            result.elementExists = true;
            result.elementVisible = true;
            result.selector = selector;
          } else {
            result.elementExists = true;
            result.selector = selector;
          }
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    // Store fallback selectors
    result.fallbackSelectors = selectors.filter(s => s !== result.selector);

    return result;
  }

  private generateSelectors(description: string): string[] {
    const selectors: string[] = [];
    
    // Extract key terms from description
    const terms = description.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(term => term.length > 2);

    // Generate various selector strategies
    for (const term of terms) {
      // Text-based selectors
      selectors.push(`text=${term}`);
      selectors.push(`text=${term.charAt(0).toUpperCase() + term.slice(1)}`);
      selectors.push(`text=${term.toUpperCase()}`);
      
      // Class-based selectors
      selectors.push(`.${term}`);
      selectors.push(`[class*="${term}"]`);
      
      // ID-based selectors
      selectors.push(`#${term}`);
      selectors.push(`[id*="${term}"]`);
      
      // Data attribute selectors
      selectors.push(`[data-testid*="${term}"]`);
      selectors.push(`[data-cy*="${term}"]`);
      selectors.push(`[aria-label*="${term}"]`);
    }

    // Add common UI patterns
    selectors.push('button', 'a', 'input', '.btn', '.button', '.nav-item', '.menu-item');
    
    return selectors;
  }

  async parseNaturalLanguage(description: string): Promise<HumanizedAction> {
    console.log(`🔍 Parsing: "${description}"`);
    
    // Parse the natural language description
    const parsed = this.parseNaturalLanguageDescription(description);
    
    // Validate the UI element exists
    const validation = await this.validateUIElement(parsed.target);
    
    // Generate the action configuration
    const action: HumanizedAction = {
      type: parsed.action as any,
      selector: validation.selector || undefined,
      text: parsed.text,
      delay: this.calculateNaturalDelay(description),
      description: description,
      naturalLanguage: description,
      validation: {
        elementExists: validation.elementExists,
        elementVisible: validation.elementVisible,
        elementInteractable: validation.elementInteractable,
        fallbackSelectors: validation.fallbackSelectors,
        coordinates: validation.coordinates
      }
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

  private calculateNaturalDelay(description: string): number {
    const lowerDesc = description.toLowerCase();
    
    // Longer descriptions usually need more time
    let baseDelay = 1000;
    
    if (lowerDesc.includes('wait') || lowerDesc.includes('pause')) {
      baseDelay = 2000;
    } else if (lowerDesc.includes('load') || lowerDesc.includes('appear')) {
      baseDelay = 1500;
    } else if (lowerDesc.includes('quick') || lowerDesc.includes('fast')) {
      baseDelay = 500;
    }
    
    // Add random human-like variation (±200ms)
    const variation = Math.random() * 400 - 200;
    return Math.max(200, baseDelay + variation);
  }

  async generateInteractionConfig(
    naturalLanguageDescriptions: string[],
    segmentName: string,
    duration: number,
    technicalFocus: string
  ): Promise<HumanizedInteraction> {
    console.log(`🎬 Generating interaction config for: ${segmentName}`);
    
    const actions: HumanizedAction[] = [];
    
    // Parse each natural language description
    for (const description of naturalLanguageDescriptions) {
      const action = await this.parseNaturalLanguage(description);
      actions.push(action);
    }
    
    // Calculate validation score
    const validation = this.calculateValidationScore(actions);
    
    const interaction: HumanizedInteraction = {
      name: segmentName,
      description: `Humanized interaction: ${segmentName}`,
      duration: duration,
      actions: actions,
      outputFile: `${segmentName.toLowerCase().replace(/\s+/g, '_')}.mp4`,
      technicalFocus: technicalFocus,
      validation: validation
    };

    return interaction;
  }

  private calculateValidationScore(actions: HumanizedAction[]): ValidationResult {
    let totalScore = 0;
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    for (const action of actions) {
      let actionScore = 100;
      
      if (!action.validation.elementExists) {
        actionScore -= 40;
        issues.push(`Element not found: "${action.naturalLanguage}"`);
      } else if (!action.validation.elementVisible) {
        actionScore -= 20;
        warnings.push(`Element not visible: "${action.naturalLanguage}"`);
      } else if (!action.validation.elementInteractable) {
        actionScore -= 20;
        warnings.push(`Element not interactable: "${action.naturalLanguage}"`);
      }

      if (actionScore < 100) {
        if (action.validation.coordinates) {
          suggestions.push(`Use coordinates (${action.validation.coordinates.x}, ${action.validation.coordinates.y}) for "${action.naturalLanguage}"`);
        } else if (action.validation.fallbackSelectors.length > 0) {
          suggestions.push(`Try alternative selectors for "${action.naturalLanguage}"`);
        }
      }

      totalScore += actionScore;
    }

    const averageScore = totalScore / actions.length;
    
    let overall: 'valid' | 'partial' | 'invalid';
    if (averageScore >= 80) overall = 'valid';
    else if (averageScore >= 50) overall = 'partial';
    else overall = 'invalid';

    return {
      overall,
      score: Math.round(averageScore),
      issues,
      warnings,
      suggestions
    };
  }

  async generateJSONConfig(interactions: HumanizedInteraction[]): Promise<string> {
    const config = {
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: 'Humanizer Bot',
        version: '1.0.0',
        description: 'Humanized interaction configurations generated from natural language'
      },
      interactions: interactions,
      summary: {
        totalInteractions: interactions.length,
        totalActions: interactions.reduce((sum, i) => sum + i.actions.length, 0),
        validationScores: interactions.map(i => ({
          name: i.name,
          score: i.validation.score,
          overall: i.validation.overall
        }))
      }
    };

    const configPath = path.join(this.configDir, 'humanized-interactions.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`✅ JSON config generated: ${configPath}`);
    return configPath;
  }

  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Humanizer Bot cleanup completed');
  }
}

// Example usage and demonstration
async function demonstrateHumanizerBot() {
  const bot = new HumanizerBot();
  
  try {
    // Initialize with your demo website
    await bot.initialize('http://localhost:3000');
    
    // Example natural language descriptions
    const descriptions = [
      "Click on the map button to switch to map view",
      "Hover over the hazard layer to see details",
      "Wait for the evacuation routes to load",
      "Click on the zone boundary to select it",
      "Type 'emergency' in the search field",
      "Scroll down to see more information"
    ];
    
    // Generate interaction config
    const interaction = await bot.generateInteractionConfig(
      descriptions,
      'Natural Map Interaction',
      45,
      'Human-like map navigation and hazard exploration'
    );
    
    console.log('🎯 Generated Interaction:');
    console.log(JSON.stringify(interaction, null, 2));
    
    // Generate JSON config file
    const configPath = await bot.generateJSONConfig([interaction]);
    console.log(`📁 Config saved to: ${configPath}`);
    
  } catch (error) {
    console.error('❌ Error demonstrating Humanizer Bot:', error);
  } finally {
    await bot.cleanup();
  }
}

// Main execution
if (require.main === module) {
  demonstrateHumanizerBot().catch(console.error);
}

export { HumanizerBot, HumanizedInteraction, HumanizedAction, ValidationResult };
