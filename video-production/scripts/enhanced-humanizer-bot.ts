#!/usr/bin/env ts-node

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { UIElementDiscovery, UIElement } from './ui-element-discovery';

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
  validation: EnhancedActionValidation;
  realUIElements: UIElement[];
  confidence: number; // 0-100
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
    console.log('🤖 Initializing Enhanced Humanizer Bot...');
    
    // Initialize UI Element Discovery
    this.uiDiscovery = new UIElementDiscovery();
    await this.uiDiscovery.initialize(url);
    
    // Initialize browser for validation
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the target URL
    await this.page.goto(url, { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(2000);
    
    this.isInitialized = true;
    console.log('✅ Enhanced Humanizer Bot initialized successfully');
  }

  async validateWithRealUIElements(description: string): Promise<{
    validation: EnhancedActionValidation;
    realElements: UIElement[];
    confidence: number;
  }> {
    if (!this.uiDiscovery) throw new Error('UI Discovery not initialized');

    console.log(`🔍 Validating: "${description}"`);
    
    // Find real UI elements that match the description
    const realElements = await this.uiDiscovery.findElementsByDescription(description);
    
    // Generate validation result
    const validation: EnhancedActionValidation = {
      elementExists: realElements.length > 0,
      elementVisible: realElements.some(el => el.isVisible),
      elementInteractable: realElements.some(el => el.isEnabled && el.isVisible),
      realElementMatch: realElements.length > 0,
      suggestedElements: realElements.slice(0, 3), // Top 3 matches
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

    // Calculate confidence based on element match quality
    let confidence = 0;
    if (realElements.length > 0) {
      // Higher confidence for elements with better text matches
      const bestElement = realElements[0];
      if (bestElement.text && description.toLowerCase().includes(bestElement.text.toLowerCase())) {
        confidence = 90;
      } else if (bestElement.ariaLabel && description.toLowerCase().includes(bestElement.ariaLabel.toLowerCase())) {
        confidence = 85;
      } else if (bestElement.dataTestId && description.toLowerCase().includes(bestElement.dataTestId.toLowerCase())) {
        confidence = 80;
      } else {
        confidence = 70;
      }
    }

    return { validation, realElements, confidence };
  }

  async parseNaturalLanguageWithRealValidation(description: string): Promise<EnhancedHumanizedAction> {
    console.log(`🔍 Parsing with real UI validation: "${description}"`);
    
    // Parse the natural language description
    const parsed = this.parseNaturalLanguageDescription(description);
    
    // Validate against real UI elements
    const { validation, realElements, confidence } = await this.validateWithRealUIElements(description);
    
    // Generate the action configuration
    const action: EnhancedHumanizedAction = {
      type: parsed.action as any,
      selector: validation.fallbackSelectors?.[0] || undefined,
      text: parsed.text,
      delay: this.calculateNaturalDelay(description),
      description: description,
      naturalLanguage: description,
      validation: validation,
      realUIElements: realElements,
      confidence: confidence
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
      } else if (action.validation.validationScore < 70) {
        warnings.push(`Low validation score (${action.validation.validationScore}) for: "${action.naturalLanguage}"`);
      }

      if (action.validation.suggestedElements.length > 0) {
        const bestMatch = action.validation.suggestedElements[0];
        if (bestMatch.text) {
          suggestions.push(`Consider using "${bestMatch.text}" for: "${action.naturalLanguage}"`);
        }
      }
    }

    const averageScore = totalScore / actions.length;
    const averageConfidence = totalConfidence / actions.length;
    const realElementCoverage = (actions.filter(a => a.validation.realElementMatch).length / actions.length) * 100;
    
    let overall: 'valid' | 'partial' | 'invalid';
    if (averageScore >= 80 && realElementCoverage >= 80) overall = 'valid';
    else if (averageScore >= 50 && realElementCoverage >= 50) overall = 'partial';
    else overall = 'invalid';

    return {
      overall,
      score: Math.round(averageScore),
      confidence: Math.round(averageConfidence),
      realElementCoverage: Math.round(realElementCoverage),
      issues,
      warnings,
      suggestions
    };
  }

  async generateEnhancedJSONConfig(interactions: EnhancedHumanizedInteraction[]): Promise<string> {
    const config = {
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: 'Enhanced Humanizer Bot',
        version: '2.0.0',
        description: 'Enhanced humanized interaction configurations with real UI element validation'
      },
      interactions: interactions,
      summary: {
        totalInteractions: interactions.length,
        totalActions: interactions.reduce((sum, i) => sum + i.actions.length, 0),
        averageValidationScore: Math.round(interactions.reduce((sum, i) => sum + i.validation.score, 0) / interactions.length),
        averageConfidence: Math.round(interactions.reduce((sum, i) => sum + i.validation.confidence, 0) / interactions.length),
        averageRealElementCoverage: Math.round(interactions.reduce((sum, i) => sum + i.validation.realElementCoverage, 0) / interactions.length)
      }
    };

    const configPath = path.join(this.configDir, 'enhanced-humanized-interactions.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`✅ Enhanced JSON config generated: ${configPath}`);
    return configPath;
  }

  async cleanup(): Promise<void> {
    if (this.uiDiscovery) {
      await this.uiDiscovery.cleanup();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Enhanced Humanizer Bot cleanup completed');
  }
}

// Example usage and demonstration
async function demonstrateEnhancedHumanizerBot() {
  const bot = new EnhancedHumanizerBot();
  
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
    
    // Generate enhanced interaction config
    const interaction = await bot.generateEnhancedInteractionConfig(
      descriptions,
      'Enhanced Natural Map Interaction',
      45,
      'Real-time UI validation with human-like map navigation and hazard exploration'
    );
    
    console.log('🎯 Generated Enhanced Interaction:');
    console.log(JSON.stringify(interaction, null, 2));
    
    // Generate enhanced JSON config file
    const configPath = await bot.generateEnhancedJSONConfig([interaction]);
    console.log(`📁 Enhanced config saved to: ${configPath}`);
    
  } catch (error) {
    console.error('❌ Error demonstrating Enhanced Humanizer Bot:', error);
  } finally {
    await bot.cleanup();
  }
}

// Main execution
if (require.main === module) {
  demonstrateEnhancedHumanizerBot().catch(console.error);
}

export { EnhancedHumanizerBot, EnhancedHumanizedInteraction, EnhancedHumanizedAction, EnhancedValidationResult, UIElementReport };
