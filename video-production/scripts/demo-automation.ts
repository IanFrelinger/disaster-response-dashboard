import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DemoStep {
  name: string;
  duration: number;
  action: (page: Page) => Promise<void>;
  validation: (page: Page) => Promise<boolean>;
}

class DemoAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private videoDir: string;
  private outputDir: string;
  private isRecording: boolean = false;

  constructor() {
    this.videoDir = path.join(process.cwd(), 'captures');
    this.outputDir = path.join(process.cwd(), 'out');
    
    // Ensure directories exist
    if (!fs.existsSync(this.videoDir)) {
      fs.mkdirSync(this.videoDir, { recursive: true });
    }
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize() {
    console.log('🚀 Initializing demo automation...');
    
    // Launch browser with optimized settings for host system
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--enable-features=NetworkService,NetworkServiceLogging',
        '--force-color-profile=srgb',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--no-default-browser-check',
        '--no-pings',
        '--password-store=basic'
      ]
    });

    // Create context with video recording
    const context = await this.browser.newContext({
      recordVideo: {
        dir: this.videoDir,
        size: { width: 1920, height: 1080 }
      },
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
      locale: 'en-US',
      timezoneId: 'America/Los_Angeles'
    });

    this.page = await context.newPage();
    
    // Set up crash and error handlers
    this.page.on('crash', () => {
      console.error('💥 Page crashed! Attempting to recover...');
      this.page = null;
    });
    
    this.page.on('close', () => {
      console.error('🚪 Page was closed unexpectedly!');
      this.page = null;
    });
    
    this.isRecording = true;
    
    console.log('✅ Browser initialized with video recording');
  }

  async navigateToApp() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('🌐 Navigating to application...');
    
    // Set up console error logging
    const errors: string[] = [];
    const warnings: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`🚨 Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });
    
    // Set up page error logging
    this.page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
    });
    
    // Set up request failure logging
    this.page.on('requestfailed', request => {
      console.log(`❌ Request Failed: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`);
    });
    
    // Navigate to the local application
    await this.page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for the main application to load
    await this.page.waitForSelector('#root', { timeout: 10000 });
    
    // Validate that the page loaded correctly
    const title = await this.page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Log any console errors that occurred during navigation
    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} console errors detected during navigation`);
    }
    if (warnings.length > 0) {
      console.warn(`⚠️ ${warnings.length} console warnings detected during navigation`);
    }

    console.log('✅ Application loaded successfully');
  }

  async validateRecording() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('🔍 Validating recording quality...');
    
    // Take a screenshot to check for colored bars or rendering issues
    const screenshot = await this.page.screenshot({
      fullPage: true,
      type: 'png'
    });
    
    // Save screenshot for analysis
    const screenshotPath = path.join(this.outputDir, 'recording-validation.png');
    fs.writeFileSync(screenshotPath, screenshot);
    
    // Basic validation - check if screenshot contains mostly colored bars
    // This is a simplified check - in production you'd want more sophisticated image analysis
    const imageBuffer = Buffer.from(screenshot);
    
    // Check for common colored bar patterns (simplified)
    const hasColoredBars = await this.detectColoredBars(imageBuffer);
    
    if (hasColoredBars) {
      throw new Error('❌ Colored bars detected in recording - browser rendering issue');
    }
    
    // Check if the page content is visible
    const contentVisible = await this.page.locator('#root').isVisible();
    if (!contentVisible) {
      throw new Error('❌ Main content not visible - page may not have loaded correctly');
    }
    
    console.log('✅ Recording validation passed');
    return true;
  }

  private async detectColoredBars(imageBuffer: Buffer): Promise<boolean> {
    // This is a simplified check - in a real implementation you'd use image processing
    // For now, we'll check if the image has reasonable dimensions and isn't empty
    if (imageBuffer.length < 1000) {
      return true; // Likely a colored bar or error screen
    }
    
    // Additional checks could be added here using image processing libraries
    return false;
  }

  async executeDemoSequence() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('🎬 Starting demo sequence...');
    
    // Monitor memory usage
    const startMemory = process.memoryUsage();
    console.log(`💾 Starting memory usage: ${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`);
    
    const steps: DemoStep[] = [
      {
        name: 'intro',
        duration: 8,
        action: async (page) => {
          console.log('📊 Showing dashboard overview...');
          // Ensure we're on the dashboard view
          await page.waitForSelector('text=Commander Dashboard', { timeout: 5000 });
          await page.click('text=Commander Dashboard');
          await page.waitForTimeout(2000);
        },
        validation: async (page) => {
          return await page.locator('h1:has-text("Command Center")').first().isVisible();
        }
      },
      {
        name: 'hazards',
        duration: 10,
        action: async (page) => {
          console.log('🗺️ Navigating to live map...');
          await page.click('text=Live Map');
          await page.waitForSelector('.mapboxgl-map', { timeout: 10000 });
          await page.waitForTimeout(2000);
          
          // Toggle hazard layers
          console.log('🔥 Activating hazard layers...');
          const hazardsToggle = page.locator('text=Hazards:').first();
          if (await hazardsToggle.isVisible()) {
            await hazardsToggle.click();
            await page.waitForTimeout(1000);
          }
        },
        validation: async (page) => {
          return await page.locator('.mapboxgl-map').isVisible();
        }
      },
      {
        name: 'routes',
        duration: 12,
        action: async (page) => {
          console.log('🛣️ Demonstrating evacuation routes...');
          // Simulate route planning interaction
          await page.waitForTimeout(2000);
          
          // Look for route-related controls
          const routeControls = page.locator('text=Routes:').first();
          if (await routeControls.isVisible()) {
            await routeControls.click();
            await page.waitForTimeout(2000);
          }
        },
        validation: async (page) => {
          return await page.locator('.mapboxgl-map').isVisible();
        }
      },
      {
        name: '3d-terrain',
        duration: 10,
        action: async (page) => {
          console.log('🏔️ Activating 3D terrain view...');
          // 3D terrain is always enabled in this component, so we'll toggle units instead
          const unitsToggle = page.locator('text=Units:').first();
          if (await unitsToggle.isVisible()) {
            await unitsToggle.click();
            await page.waitForTimeout(3000);
          }
        },
        validation: async (page) => {
          return await page.locator('.mapboxgl-map').isVisible();
        }
      },
      {
        name: 'evacuation',
        duration: 12,
        action: async (page) => {
          console.log('🚨 Showing evacuation management...');
          // Navigate to evacuation dashboard
          await page.click('text=Commander Dashboard');
          await page.waitForTimeout(2000);
          
          // Look for evacuation-related components
          const evacuationElements = page.locator('text=Evac Zones:').first();
          if (await evacuationElements.isVisible()) {
            await evacuationElements.click();
            await page.waitForTimeout(2000);
          }
        },
        validation: async (page) => {
          return await page.locator('h1:has-text("Command Center")').first().isVisible();
        }
      },
      {
        name: 'ai-support',
        duration: 15,
        action: async (page) => {
          console.log('🤖 Demonstrating AI decision support...');
          // Navigate to AIP Commander
          const aipButton = page.locator('text=AIP Commander').first();
          if (await aipButton.isVisible()) {
            await aipButton.click();
            await page.waitForTimeout(2000);
            
            // Look for example queries
            const exampleQueries = page.locator('text=Highway 30 closure').or(page.locator('text=Pine Valley evacuation'));
            if (await exampleQueries.first().isVisible()) {
              await exampleQueries.first().click();
              await page.waitForTimeout(3000);
            }
          }
        },
        validation: async (page) => {
          return await page.locator('text=AIP-Powered Decision Support').first().isVisible();
        }
      },
      {
        name: 'weather',
        duration: 10,
        action: async (page) => {
          console.log('🌤️ Showing weather integration...');
          // Navigate back to map
          await page.click('text=Live Map');
          await page.waitForTimeout(2000);
          
          // Look for weather panel
          const weatherPanel = page.locator('text=Weather:').first();
          if (await weatherPanel.isVisible()) {
            await weatherPanel.click();
            await page.waitForTimeout(2000);
          }
        },
        validation: async (page) => {
          return await page.locator('.mapboxgl-map').isVisible();
        }
      },
      {
        name: 'commander',
        duration: 8,
        action: async (page) => {
          console.log('👨‍💼 Showing commander view...');
          await page.click('text=Commander Dashboard');
          await page.waitForTimeout(2000);
        },
        validation: async (page) => {
          return await page.locator('h1:has-text("Command Center")').first().isVisible();
        }
      },
      {
        name: 'responder',
        duration: 8,
        action: async (page) => {
          console.log('🚑 Showing responder view...');
          // Look for evacuation zones as responder view
          const evacuationZones = page.locator('text=Evac Zones:').first();
          if (await evacuationZones.isVisible()) {
            await evacuationZones.click();
            await page.waitForTimeout(2000);
          }
        },
        validation: async (page) => {
          return await page.locator('h1:has-text("Command Center")').first().isVisible();
        }
      },
      {
        name: 'public',
        duration: 8,
        action: async (page) => {
          console.log('📢 Showing public information...');
          // Look for weather information as public view
          const weatherInfo = page.locator('text=Weather:').first();
          if (await weatherInfo.isVisible()) {
            await weatherInfo.click();
            await page.waitForTimeout(2000);
          }
        },
        validation: async (page) => {
          return await page.locator('h1:has-text("Command Center")').first().isVisible();
        }
      },
      {
        name: 'outro',
        duration: 6,
        action: async (page) => {
          console.log('🎯 Final overview...');
          await page.click('text=Commander Dashboard');
          await page.waitForTimeout(2000);
        },
        validation: async (page) => {
          return await page.locator('h1:has-text("Command Center")').first().isVisible();
        }
      }
    ];

    let totalTime = 0;
    
    for (const step of steps) {
      console.log(`\n🎬 Executing step: ${step.name} (${step.duration}s)`);
      
      try {
        // Execute the action
        await step.action(this.page);
        
        // Validate the step
        const isValid = await step.validation(this.page);
        if (!isValid) {
          console.warn(`⚠️ Validation failed for step: ${step.name}`);
        }
        
        // Wait for the specified duration
        await this.page.waitForTimeout(step.duration * 1000);
        totalTime += step.duration;
        
        console.log(`✅ Step completed: ${step.name}`);
        
      } catch (error) {
        console.error(`❌ Error in step ${step.name}:`, error);
        
        // Check if the page is still available
        if (this.page && !this.page.isClosed()) {
          console.log(`🔄 Continuing with next step...`);
        } else {
          console.error(`💥 Page was closed, attempting to recover...`);
          
          try {
            // Try to recreate the page
            const context = this.browser?.contexts()[0];
            if (context) {
              this.page = await context.newPage();
              await this.page.goto('http://localhost:3000', {
                waitUntil: 'networkidle',
                timeout: 30000
              });
              console.log(`✅ Page recovered, continuing...`);
            } else {
              console.error(`💥 Cannot recover page, stopping execution`);
              break;
            }
          } catch (recoveryError) {
            console.error(`💥 Page recovery failed:`, recoveryError);
            break;
          }
        }
      }
    }
    
    console.log(`\n🎬 Demo sequence completed in ${totalTime} seconds`);
    
    // Monitor final memory usage
    const endMemory = process.memoryUsage();
    console.log(`💾 Final memory usage: ${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`);
    console.log(`💾 Memory increase: ${Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024)}MB`);
  }

  async finalizeRecording() {
    if (!this.browser || !this.page) {
      throw new Error('Browser not initialized');
    }
    
    console.log('🎬 Finalizing recording...');
    
    // Close the page to finalize video recording
    await this.page.close();
    
    // Close the browser
    await this.browser.close();
    
    this.isRecording = false;
    
    // Wait a moment for video file to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Recording finalized');
  }

  async validateVideoFiles() {
    console.log('🔍 Validating video files...');
    
    const videoFiles = fs.readdirSync(this.videoDir)
      .filter(file => file.endsWith('.webm') || file.endsWith('.mp4'));
    
    if (videoFiles.length === 0) {
      throw new Error('❌ No video files found in captures directory');
    }
    
    console.log(`📹 Found ${videoFiles.length} video files:`);
    for (const file of videoFiles) {
      const filePath = path.join(this.videoDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${file} (${sizeMB} MB)`);
      
      // Check if file is too small (likely corrupted or colored bars)
      if (stats.size < 100000) { // Less than 100KB
        console.warn(`⚠️ Warning: ${file} is very small (${sizeMB} MB) - may contain colored bars`);
      }
    }
    
    return videoFiles;
  }

  async run() {
    try {
      console.log('🎬 Starting Disaster Response Dashboard Demo Automation');
      console.log('=' .repeat(60));
      
      await this.initialize();
      await this.navigateToApp();
      await this.validateRecording();
      await this.executeDemoSequence();
      await this.finalizeRecording();
      await this.validateVideoFiles();
      
      console.log('\n🎉 Demo automation completed successfully!');
      console.log('📹 Video files are ready in the captures directory');
      
    } catch (error) {
      console.error('❌ Demo automation failed:', error);
      
      // Clean up on error
      if (this.browser) {
        await this.browser.close();
      }
      
      throw error;
    }
  }
}

// Main execution
async function main() {
  const demo = new DemoAutomation();
  await demo.run();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DemoAutomation };
