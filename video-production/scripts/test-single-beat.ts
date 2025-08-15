#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface TestBeat {
  id: string;
  title: string;
  description: string;
  interactions: TestInteraction[];
}

interface TestInteraction {
  type: 'click' | 'wait' | 'screenshot' | 'waitForSelector';
  selector?: string;
  duration?: number;
  description: string;
}

class SingleBeatTester {
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
    console.log('🚀 Initializing Playwright browser for single beat test...');
    
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

  private async executeInteraction(interaction: TestInteraction): Promise<boolean> {
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
          }
          break;
          
        case 'wait':
          if (interaction.duration) {
            await this.page.waitForTimeout(interaction.duration);
          }
          break;
          
        case 'screenshot':
          const timestamp = Date.now();
          await this.page.screenshot({ 
            path: path.join(this.outputDir, `test-${timestamp}.png`),
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

  async testSingleBeat(): Promise<void> {
    console.log('🎬 Testing Single Beat Recording');
    console.log('=' .repeat(40));

    const testBeat: TestBeat = {
      id: "test-intro",
      title: "Test Introduction Beat",
      description: "Test the basic navigation and view switching",
      interactions: [
        { type: 'waitForSelector', selector: '#root', description: 'Wait for app to load' },
        { type: 'wait', duration: 3000, description: 'Show initial Commander Dashboard view' },
        { type: 'screenshot', description: 'Capture Commander Dashboard overview' },
        { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to Live Map view' },
        { type: 'wait', duration: 3000, description: 'Wait for map to load and render' },
        { type: 'screenshot', description: 'Capture Live Map view' },
        { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard' },
        { type: 'wait', duration: 2000, description: 'Show dashboard context' }
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
      
      console.log('✅ Single beat test completed successfully!');
      console.log('📁 Check the captures directory for test screenshots');
      
    } catch (error) {
      console.error('❌ Single beat test failed:', error);
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
  const tester = new SingleBeatTester();
  await tester.testSingleBeat();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SingleBeatTester };
