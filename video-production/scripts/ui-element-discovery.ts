#!/usr/bin/env ts-node

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface UIElement {
  tagName: string;
  text: string;
  className: string;
  id: string;
  dataTestId: string;
  ariaLabel: string;
  role: string;
  type: string;
  href: string;
  selector: string;
  isVisible: boolean;
  isEnabled: boolean;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  computedStyles: {
    display: string;
    visibility: string;
    opacity: string;
    pointerEvents: string;
  };
}

interface UIElementMap {
  [key: string]: UIElement[];
}

class UIElementDiscovery {
  private browser: any = null;
  private context: any = null;
  private page: any = null;
  private projectRoot: string;
  private outputDir: string;

  constructor() {
    // Use process.cwd() instead of import.meta.url for compatibility
    this.projectRoot = process.cwd();
    this.outputDir = path.join(this.projectRoot, 'config', 'ui-elements');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize(url: string): Promise<void> {
    console.log('🔍 Initializing UI Element Discovery...');
    
    this.browser = await chromium.launch({
      headless: false, // Keep visible for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the target URL
    await this.page.goto(url, { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(3000); // Wait for dynamic content
    
    console.log('✅ UI Element Discovery initialized successfully');
  }

  async discoverAllUIElements(): Promise<UIElementMap> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔍 Discovering all UI elements...');
    
    const elementMap: UIElementMap = {
      buttons: [],
      links: [],
      inputs: [],
      navigation: [],
      interactive: [],
      content: []
    };

    // Discover buttons
    elementMap.buttons = await this.discoverElements('button, input[type="button"], input[type="submit"], .btn, .button');
    
    // Discover links
    elementMap.links = await this.discoverElements('a, [role="link"]');
    
    // Discover inputs
    elementMap.inputs = await this.discoverElements('input, textarea, select');
    
    // Discover navigation elements
    elementMap.navigation = await this.discoverElements('nav, [role="navigation"], .nav, .menu, .sidebar');
    
    // Discover interactive elements
    elementMap.interactive = await this.discoverElements('[onclick], [onmouseover], [onmouseenter], [data-interactive], .interactive');
    
    // Discover content elements
    elementMap.content = await this.discoverElements('h1, h2, h3, h4, h5, h6, p, div[class*="content"], .content, .text');

    console.log(`✅ Discovered ${Object.values(elementMap).reduce((sum, arr) => sum + arr.length, 0)} UI elements`);
    
    return elementMap;
  }

  private async discoverElements(selector: string): Promise<UIElement[]> {
    if (!this.page) throw new Error('Page not initialized');

    const elements: UIElement[] = [];
    const elementHandles = await this.page.$$(selector);

    for (const element of elementHandles) {
      try {
        const elementInfo = await this.extractElementInfo(element, selector);
        if (elementInfo) {
          elements.push(elementInfo);
        }
      } catch (error) {
        // Skip elements that can't be analyzed
        continue;
      }
    }

    return elements;
  }

  private async extractElementInfo(element: any, baseSelector: string): Promise<UIElement | null> {
    try {
      // Check if element is visible
      const isVisible = await element.isVisible();
      if (!isVisible) return null;

      // Extract basic properties
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const text = await element.evaluate(el => el.textContent?.trim() || '');
      const className = await element.evaluate(el => el.className || '');
      const id = await element.evaluate(el => el.id || '');
      const dataTestId = await element.evaluate(el => el.getAttribute('data-testid') || '');
      const ariaLabel = await element.evaluate(el => el.getAttribute('aria-label') || '');
      const role = await element.evaluate(el => el.getAttribute('role') || '');
      const type = await element.evaluate(el => el.getAttribute('type') || '');
      const href = await element.evaluate(el => el.getAttribute('href') || '');

      // Check if element is enabled
      const isEnabled = await element.evaluate(el => {
        if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
          return !el.disabled;
        }
        return true;
      });

      // Get bounding box
      const boundingBox = await element.boundingBox();

      // Get computed styles
      const computedStyles = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          pointerEvents: styles.pointerEvents
        };
      });

      // Generate unique selector
      const selector = await this.generateUniqueSelector(element, baseSelector);

      return {
        tagName,
        text,
        className,
        id,
        dataTestId,
        ariaLabel,
        role,
        type,
        href,
        selector,
        isVisible,
        isEnabled,
        boundingBox,
        computedStyles
      };
    } catch (error) {
      return null;
    }
  }

  private async generateUniqueSelector(element: any, baseSelector: string): Promise<string> {
    try {
      // Try to generate a unique selector
      const selector = await element.evaluate((el, base) => {
        // Try ID first
        if (el.id) {
          return `#${el.id}`;
        }
        
        // Try data-testid
        if (el.getAttribute('data-testid')) {
          return `[data-testid="${el.getAttribute('data-testid')}"]`;
        }
        
        // Try aria-label
        if (el.getAttribute('aria-label')) {
          return `[aria-label="${el.getAttribute('aria-label')}"]`;
        }
        
        // Try text content
        if (el.textContent && el.textContent.trim()) {
          const text = el.textContent.trim();
          if (text.length < 50) { // Only use short text
            return `text="${text}"`;
          }
        }
        
        // Try class-based selector
        if (el.className) {
          const classes = el.className.split(' ').filter(c => c.length > 0);
          if (classes.length > 0) {
            return `.${classes[0]}`;
          }
        }
        
        // Fallback to tag name
        return el.tagName.toLowerCase();
      }, baseSelector);
      
      return selector;
    } catch (error) {
      return baseSelector;
    }
  }

  async findElementsByDescription(description: string): Promise<UIElement[]> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🔍 Searching for elements matching: "${description}"`);
    
    const keywords = description.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(term => term.length > 2);

    const allElements = await this.discoverAllUIElements();
    const flatElements = Object.values(allElements).flat();
    
    const matches: Array<{ element: UIElement; score: number }> = [];

    for (const element of flatElements) {
      let score = 0;
      
      // Score based on text content
      if (element.text) {
        const elementText = element.text.toLowerCase();
        for (const keyword of keywords) {
          if (elementText.includes(keyword)) {
            score += 10;
          }
        }
      }
      
      // Score based on aria-label
      if (element.ariaLabel) {
        const ariaText = element.ariaLabel.toLowerCase();
        for (const keyword of keywords) {
          if (ariaText.includes(keyword)) {
            score += 8;
          }
        }
      }
      
      // Score based on data-testid
      if (element.dataTestId) {
        const testId = element.dataTestId.toLowerCase();
        for (const keyword of keywords) {
          if (testId.includes(keyword)) {
            score += 6;
          }
        }
      }
      
      // Score based on class name
      if (element.className) {
        const classes = element.className.toLowerCase();
        for (const keyword of keywords) {
          if (classes.includes(keyword)) {
            score += 4;
          }
        }
      }
      
      // Score based on role
      if (element.role) {
        const role = element.role.toLowerCase();
        for (const keyword of keywords) {
          if (role.includes(keyword)) {
            score += 5;
          }
        }
      }
      
      // Bonus for interactive elements
      if (element.isEnabled && element.isVisible) {
        score += 2;
      }
      
      if (score > 0) {
        matches.push({ element, score });
      }
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    console.log(`✅ Found ${matches.length} potential matches`);
    
    return matches.map(match => match.element);
  }

  async generateUIElementReport(): Promise<string> {
    const elementMap = await this.discoverAllUIElements();
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: 'UI Element Discovery',
        version: '1.0.0',
        totalElements: Object.values(elementMap).reduce((sum, arr) => sum + arr.length, 0)
      },
      elementCategories: elementMap,
      summary: {
        buttons: elementMap.buttons.length,
        links: elementMap.links.length,
        inputs: elementMap.inputs.length,
        navigation: elementMap.navigation.length,
        interactive: elementMap.interactive.length,
        content: elementMap.content.length
      }
    };

    const reportPath = path.join(this.outputDir, 'ui-element-discovery-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ UI Element Report generated: ${reportPath}`);
    return reportPath;
  }

  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 UI Element Discovery cleanup completed');
  }
}

// Example usage
async function demonstrateUIElementDiscovery() {
  const discovery = new UIElementDiscovery();
  
  try {
    // Initialize with your demo website
    await discovery.initialize('http://localhost:3000');
    
    // Generate comprehensive UI element report
    const reportPath = await discovery.generateUIElementReport();
    
    // Find elements by description
    const mapElements = await discovery.findElementsByDescription('map button');
    console.log(`Found ${mapElements.length} map-related elements`);
    
    const hazardElements = await discovery.findElementsByDescription('hazard layer');
    console.log(`Found ${hazardElements.length} hazard-related elements`);
    
  } catch (error) {
    console.error('❌ Error demonstrating UI Element Discovery:', error);
  } finally {
    await discovery.cleanup();
  }
}

// Main execution
// Check if this script is being run directly
if (process.argv[1] && process.argv[1].endsWith('ui-element-discovery.ts')) {
  demonstrateUIElementDiscovery().catch(console.error);
}

export { UIElementDiscovery };
