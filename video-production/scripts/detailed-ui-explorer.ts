#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface DetailedUIElement {
  tag: string;
  id?: string;
  className?: string;
  text?: string;
  role?: string;
  type?: string;
  value?: string;
  href?: string;
  src?: string;
  alt?: string;
  ariaLabel?: string;
  interactions: string[];
  selector: string;
  xpath: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  isEnabled: boolean;
  children?: DetailedUIElement[];
}

class DetailedUIExplorer {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private outputDir: string = 'captures';

  constructor() {
    this.ensureOutputDirs();
  }

  private ensureOutputDirs(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Playwright browser for detailed UI exploration...');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(30000);
      
      console.log('✅ Browser initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      return false;
    }
  }

  async navigateToApp(): Promise<boolean> {
    if (!this.page) {
      console.error('❌ Page not initialized');
      return false;
    }
    
    const url = process.env.HOST_FRONTEND_URL || "http://localhost:3000";
    console.log(`🌐 Navigating to: ${url}`);
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForSelector("#root");
      await this.page.waitForTimeout(2000);
      
      console.log('✅ App loaded successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to navigate to app:', error);
      return false;
    }
  }

  private async exploreElement(selector: string, description: string): Promise<DetailedUIElement | null> {
    if (!this.page) return null;

    try {
      console.log(`  🔍 Exploring: ${description}`);
      
      const element = await this.page.$(selector);
      if (!element) {
        console.log(`    ⚠️ Element not found: ${selector}`);
        return null;
      }

      const elementInfo = await element.evaluate((el) => {
        const tag = el.tagName.toLowerCase();
        const id = el.id || undefined;
        const className = el.className || undefined;
        const text = el.textContent?.trim().substring(0, 200) || undefined;
        const role = el.getAttribute('role') || undefined;
        const type = el.getAttribute('type') || undefined;
        const value = el.getAttribute('value') || undefined;
        const href = el.getAttribute('href') || undefined;
        const src = el.getAttribute('src') || undefined;
        const alt = el.getAttribute('alt') || undefined;
        const ariaLabel = el.getAttribute('aria-label') || undefined;
        
        // Determine interactions
        const interactions: string[] = [];
        if (tag === 'button' || el.onclick || el.getAttribute('onclick')) {
          interactions.push('click');
        }
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
          interactions.push('type', 'focus', 'blur');
          if (type === 'checkbox' || type === 'radio') {
            interactions.push('check', 'uncheck');
          }
          if (type === 'file') {
            interactions.push('upload');
          }
        }
        if (tag === 'a' && href) {
          interactions.push('click', 'navigate');
        }
        if (tag === 'img') {
          interactions.push('click', 'hover');
        }
        if (el.onmouseenter || el.onmouseleave) {
          interactions.push('hover');
        }
        if (el.ondragstart || el.ondrop) {
          interactions.push('drag', 'drop');
        }
        if (el.onscroll || el.scrollTop !== undefined) {
          interactions.push('scroll');
        }
        
        // Generate selector
        let selector = tag;
        if (id) {
          selector = `#${id}`;
        } else if (className) {
          const classes = className.split(' ').filter(c => c.trim()).map(c => `.${c.trim()}`).join('');
          selector = `${tag}${classes}`;
        }
        
        // Generate XPath
        let xpath = `//${tag}`;
        if (id) {
          xpath = `//*[@id="${id}"]`;
        } else if (className) {
          const classes = className.split(' ').filter(c => c.trim()).map(c => `contains(@class, "${c.trim()}")`).join(' and ');
          xpath = `//${tag}[${classes}]`;
        }
        
        // Get bounding box
        const rect = el.getBoundingClientRect();
        const boundingBox = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
        
        // Check visibility and enabled state
        const isVisible = rect.width > 0 && rect.height > 0;
        const isEnabled = !el.hasAttribute('disabled');
        
        return {
          tag,
          id,
          className,
          text,
          role,
          type,
          value,
          href,
          src,
          alt,
          ariaLabel,
          interactions,
          selector,
          xpath,
          boundingBox,
          isVisible,
          isEnabled
        };
      });

      console.log(`    ✅ Found: ${elementInfo.tag}${elementInfo.className ? ` (${elementInfo.className})` : ''}${elementInfo.text ? ` - "${elementInfo.text.substring(0, 50)}..."` : ''}`);
      console.log(`    🔧 Interactions: ${elementInfo.interactions.join(', ')}`);
      
      return elementInfo;
      
    } catch (error) {
      console.error(`    ❌ Error exploring element: ${error}`);
      return null;
    }
  }

  private async exploreZoneCards(): Promise<void> {
    console.log('\n🏠 Exploring Zone Cards...');
    
    try {
      // Ensure we're on the dashboard
      await this.page!.click('button:has-text("Commander Dashboard")');
      await this.page!.waitForTimeout(2000);
      
      const zoneCards = await this.page!.$$('.zone-card');
      console.log(`  📊 Found ${zoneCards.length} zone cards`);
      
      for (let i = 0; i < zoneCards.length; i++) {
        const card = zoneCards[i];
        const cardInfo = await card.evaluate((el) => {
          const text = el.textContent?.trim() || '';
          const className = el.className || '';
          const role = el.getAttribute('role') || undefined;
          const onclick = el.getAttribute('onclick') || undefined;
          
          // Check for child elements
          const children = Array.from(el.children).map(child => ({
            tag: child.tagName.toLowerCase(),
            className: child.className || undefined,
            text: child.textContent?.trim().substring(0, 100) || undefined
          }));
          
          return { text, className, role, onclick, children };
        });
        
        console.log(`  🏠 Zone Card ${i + 1}:`);
        console.log(`    📝 Text: "${cardInfo.text.substring(0, 100)}..."`);
        console.log(`    🏷️ Class: ${cardInfo.className}`);
        console.log(`    🎭 Role: ${cardInfo.role || 'none'}`);
        console.log(`    🔗 OnClick: ${cardInfo.onclick || 'none'}`);
        console.log(`    👶 Children: ${cardInfo.children.length}`);
        cardInfo.children.forEach((child, j) => {
          console.log(`      ${j + 1}. ${child.tag}${child.className ? ` (${child.className})` : ''}${child.text ? ` - "${child.text}"` : ''}`);
        });
        
        // Try to click the card to see what happens
        try {
          await card.click();
          await this.page!.waitForTimeout(1000);
          console.log(`    ✅ Clicked successfully`);
          
          // Take screenshot of what happened
          await this.page!.screenshot({ 
            path: path.join(this.outputDir, `zone-card-${i + 1}-clicked.png`),
            fullPage: true 
          });
          
        } catch (error) {
          console.log(`    ⚠️ Could not click: ${error}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error exploring zone cards:', error);
    }
  }

  private async exploreMapInteractions(): Promise<void> {
    console.log('\n🗺️ Exploring Map Interactions...');
    
    try {
      // Switch to map view
      await this.page!.click('button:has-text("Live Map")');
      await this.page!.waitForTimeout(3000);
      
      // Look for map controls and layers
      const mapControls = await this.page!.$$('[class*="mapbox"], [class*="map"], [class*="layer"], [class*="control"]');
      console.log(`  🎛️ Found ${mapControls.length} potential map controls`);
      
      // Look for checkboxes (layer toggles)
      const checkboxes = await this.page!.$$('input[type="checkbox"]');
      console.log(`  ☑️ Found ${checkboxes.length} checkboxes (likely layer toggles)`);
      
      for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const checkboxInfo = await checkbox.evaluate((el) => {
          const id = el.id || undefined;
          const className = el.className || undefined;
          const name = el.getAttribute('name') || undefined;
          const value = el.getAttribute('value') || undefined;
          const checked = el.checked;
          const label = el.labels?.[0]?.textContent?.trim() || undefined;
          
          return { id, className, name, value, checked, label };
        });
        
        console.log(`  ☑️ Checkbox ${i + 1}:`);
        console.log(`    🏷️ ID: ${checkboxInfo.id || 'none'}`);
        console.log(`    🏷️ Class: ${checkboxInfo.className || 'none'}`);
        console.log(`    🏷️ Name: ${checkboxInfo.name || 'none'}`);
        console.log(`    🏷️ Value: ${checkboxInfo.value || 'none'}`);
        console.log(`    ✅ Checked: ${checkboxInfo.checked}`);
        console.log(`    🏷️ Label: ${checkboxInfo.label || 'none'}`);
        
        // Try to toggle the checkbox
        try {
          await checkbox.click();
          await this.page!.waitForTimeout(1000);
          console.log(`    🔄 Toggled successfully`);
          
          // Take screenshot of what changed
          await this.page!.screenshot({ 
            path: path.join(this.outputDir, `map-layer-${i + 1}-toggled.png`),
            fullPage: true 
          });
          
        } catch (error) {
          console.log(`    ⚠️ Could not toggle: ${error}`);
        }
      }
      
      // Look for canvas element for map interactions
      const canvas = await this.page!.$('.mapboxgl-canvas');
      if (canvas) {
        console.log(`  🎨 Found map canvas`);
        
        // Get canvas info
        const canvasInfo = await canvas.evaluate((el) => {
          const width = el.width;
          const height = el.height;
          const className = el.className || undefined;
          
          return { width, height, className };
        });
        
        console.log(`    📏 Dimensions: ${canvasInfo.width}x${canvasInfo.height}`);
        console.log(`    🏷️ Class: ${canvasInfo.className}`);
        
        // Try to click on the canvas
        try {
          await canvas.click({ position: { x: 100, y: 100 } });
          await this.page!.waitForTimeout(1000);
          console.log(`    ✅ Clicked on canvas at (100, 100)`);
          
          // Take screenshot
          await this.page!.screenshot({ 
            path: path.join(this.outputDir, 'map-canvas-clicked.png'),
            fullPage: true 
          });
          
        } catch (error) {
          console.log(`    ⚠️ Could not click on canvas: ${error}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error exploring map interactions:', error);
    }
  }

  private async exploreNavigationElements(): Promise<void> {
    console.log('\n🧭 Exploring Navigation Elements...');
    
    try {
      // Look for all navigation-related elements
      const navElements = await this.page!.$$('button, [role="button"], [role="navigation"], [role="tab"], nav, .nav, [class*="nav"]');
      console.log(`  🧭 Found ${navElements.length} navigation elements`);
      
      for (let i = 0; i < Math.min(navElements.length, 20); i++) {
        const element = navElements[i];
        const elementInfo = await element.evaluate((el) => {
          const tag = el.tagName.toLowerCase();
          const id = el.id || undefined;
          const className = el.className || undefined;
          const text = el.textContent?.trim().substring(0, 100) || undefined;
          const role = el.getAttribute('role') || undefined;
          const onclick = el.getAttribute('onclick') || undefined;
          
          return { tag, id, className, text, role, onclick };
        });
        
        console.log(`  🧭 Navigation Element ${i + 1}:`);
        console.log(`    🏷️ Tag: ${elementInfo.tag}`);
        console.log(`    🆔 ID: ${elementInfo.id || 'none'}`);
        console.log(`    🏷️ Class: ${elementInfo.className || 'none'}`);
        console.log(`    📝 Text: "${elementInfo.text || 'none'}"`);
        console.log(`    🎭 Role: ${elementInfo.role || 'none'}`);
        console.log(`    🔗 OnClick: ${elementInfo.onclick || 'none'}`);
        
        // Try to click if it's a button
        if (elementInfo.tag === 'button' || elementInfo.role === 'button') {
          try {
            await element.click();
            await this.page!.waitForTimeout(1000);
            console.log(`    ✅ Clicked successfully`);
            
            // Take screenshot
            await this.page!.screenshot({ 
              path: path.join(this.outputDir, `nav-element-${i + 1}-clicked.png`),
              fullPage: true 
            });
            
          } catch (error) {
            console.log(`    ⚠️ Could not click: ${error}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error exploring navigation elements:', error);
    }
  }

  async runDetailedExploration(): Promise<void> {
    console.log('🎬 Starting Detailed UI Exploration');
    console.log('=' .repeat(50));
    console.log('This will explore specific UI elements in detail to understand their behavior.');

    try {
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      // Explore different aspects of the UI
      await this.exploreZoneCards();
      await this.exploreMapInteractions();
      await this.exploreNavigationElements();
      
      console.log('\n✅ Detailed UI Exploration completed successfully!');
      console.log('📁 Check the captures directory for detailed screenshots and analysis');
      
    } catch (error) {
      console.error('❌ Detailed UI Exploration failed:', error);
    } finally {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Main execution
async function main() {
  const explorer = new DetailedUIExplorer();
  await explorer.runDetailedExploration();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DetailedUIExplorer };
