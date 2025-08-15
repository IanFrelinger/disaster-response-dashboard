#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ComplexTestBeat {
  id: string;
  title: string;
  description: string;
  interactions: ComplexTestInteraction[];
}

interface ComplexTestInteraction {
  type: 'click' | 'wait' | 'screenshot' | 'waitForSelector' | 'scroll' | 'hover' | 'type' | 'keyboard';
  selector?: string;
  value?: string;
  duration?: number;
  description: string;
  coordinates?: [number, number];
}

class ComplexBeatTester {
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
    console.log('🚀 Initializing Playwright browser for complex beat test...');
    
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

  private async executeInteraction(interaction: ComplexTestInteraction): Promise<boolean> {
    if (!this.page) {
      console.error('❌ Page not initialized during interaction execution');
      return false;
    }

    try {
      console.log(`  🔧 ${interaction.description}`);
      
      switch (interaction.type) {
        case 'waitForSelector':
          if (interaction.selector) {
            await this.page.waitForSelector(interaction.selector);
          }
          break;
          
        case 'click':
          if (interaction.selector) {
            await this.page.click(interaction.selector);
          } else if (interaction.coordinates) {
            await this.page.click('.mapboxgl-canvas', { position: { x: interaction.coordinates[0], y: interaction.coordinates[1] } });
          }
          break;
          
        case 'hover':
          if (interaction.selector) {
            await this.page.hover(interaction.selector);
          } else if (interaction.coordinates) {
            await this.page.hover('.mapboxgl-canvas', { position: { x: interaction.coordinates[0], y: interaction.coordinates[1] } });
          }
          break;
          
        case 'type':
          if (interaction.selector && interaction.value) {
            await this.page.type(interaction.selector, interaction.value);
          }
          break;
          
        case 'keyboard':
          if (interaction.value) {
            await this.page.keyboard.press(interaction.value);
          }
          break;
          
        case 'scroll':
          await this.page.evaluate(() => {
            window.scrollBy(0, 400);
          });
          break;
          
        case 'wait':
          if (interaction.duration) {
            await this.page.waitForTimeout(interaction.duration);
          }
          break;
          
        case 'screenshot':
          const timestamp = Date.now();
          await this.page.screenshot({ 
            path: path.join(this.outputDir, `complex-test-${timestamp}.png`),
            fullPage: true 
          });
          break;
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Interaction failed: ${interaction.description}`, error);
      return false;
    }
  }

  async testComplexBeat(): Promise<void> {
    console.log('🎬 Testing Complex Beat Recording');
    console.log('=' .repeat(40));

    const testBeat: ComplexTestBeat = {
      id: "test-complex-interactions",
      title: "Test Complex Interactions Beat",
      description: "Test extended interactions including map interactions, scrolling, and form interactions",
      interactions: [
        { type: 'waitForSelector', selector: '#root', description: 'Wait for app to load' },
        { type: 'wait', duration: 3000, description: 'Show initial Commander Dashboard view' },
        { type: 'screenshot', description: 'Capture initial dashboard view' },
        { type: 'scroll', description: 'Scroll down to show more dashboard content' },
        { type: 'wait', duration: 1000, description: 'Let content settle after scroll' },
        { type: 'screenshot', description: 'Capture scrolled dashboard view' },
        { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to Live Map view' },
        { type: 'wait', duration: 3000, description: 'Wait for map to load and render' },
        { type: 'screenshot', description: 'Capture Live Map view' },
        { type: 'click', selector: '.mapboxgl-canvas', coordinates: [960, 540], description: 'Click on map center to test map interaction' },
        { type: 'wait', duration: 1000, description: 'Wait for map click response' },
        { type: 'hover', selector: '.mapboxgl-canvas', coordinates: [960, 540], description: 'Hover over map center to test hover' },
        { type: 'wait', duration: 1000, description: 'Show hover effect' },
        { type: 'screenshot', description: 'Capture map interaction test' },
        { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard' },
        { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
        { type: 'screenshot', description: 'Capture final dashboard view' }
      ]
    };

    try {
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      console.log(`\n🎬 Testing beat: ${testBeat.title}`);
      console.log(`📝 Description: ${testBeat.description}`);
      
      for (const interaction of testBeat.interactions) {
        const success = await this.executeInteraction(interaction);
        if (!success) {
          console.error(`❌ Beat test failed at interaction: ${interaction.description}`);
          return;
        }
      }
      
      console.log('✅ Complex beat test completed successfully!');
      console.log('📁 Check the captures directory for test screenshots');
      
    } catch (error) {
      console.error('❌ Complex beat test failed:', error);
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
  const tester = new ComplexBeatTester();
  await tester.testComplexBeat();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComplexBeatTester };
