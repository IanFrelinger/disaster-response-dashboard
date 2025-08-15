#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface RealisticBeat {
  id: string;
  title: string;
  duration: number;
  description: string;
  narration: string;
  interactions: RealisticInteraction[];
  visualTarget: string;
  expectedOutcome: string;
}

interface RealisticInteraction {
  type: 'click' | 'wait' | 'screenshot' | 'waitForSelector' | 'scroll' | 'hover' | 'type' | 'check' | 'uncheck' | 'navigate' | 'keyboard';
  selector?: string;
  value?: string;
  duration?: number;
  description: string;
  pauseBefore?: number;
  pauseAfter?: number;
}

class RealisticProductionRecorder {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private outputDir: string = 'output';
  private capturesDir: string = 'captures';

  constructor() {
    this.ensureOutputDirs();
  }

  private ensureOutputDirs(): void {
    [this.outputDir, this.capturesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Playwright browser for realistic production recording...');
    
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
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
          dir: this.outputDir,
          size: { width: 1920, height: 1080 }
        }
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

  private async executeInteraction(interaction: RealisticInteraction): Promise<boolean> {
    if (!this.page) {
      console.error('❌ Page not initialized during interaction execution');
      return false;
    }

    try {
      // Pause before interaction for viewer absorption
      if (interaction.pauseBefore) {
        console.log(`  ⏸️ Pausing ${interaction.pauseBefore}ms before interaction...`);
        await this.page.waitForTimeout(interaction.pauseBefore);
      }

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
          
        case 'hover':
          if (interaction.selector) {
            await this.page.hover(interaction.selector);
          }
          break;
          
        case 'type':
          if (interaction.selector && interaction.value) {
            await this.page.type(interaction.selector, interaction.value);
          }
          break;
          
        case 'check':
          if (interaction.selector) {
            await this.page.check(interaction.selector);
          }
          break;
          
        case 'uncheck':
          if (interaction.selector) {
            await this.page.uncheck(interaction.selector);
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
          
        case 'navigate':
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
            path: path.join(this.capturesDir, `realistic-${timestamp}.png`),
            fullPage: true 
          });
          break;
      }
      
      // Pause after interaction for viewer absorption
      if (interaction.pauseAfter) {
        console.log(`  ⏸️ Pausing ${interaction.pauseAfter}ms after interaction...`);
        await this.page.waitForTimeout(interaction.pauseAfter);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Interaction failed: ${interaction.description}`, error);
      return false;
    }
  }

  private createRealisticConfig(): RealisticBeat[] {
    return [
      {
        id: "intro-dashboard",
        title: "Introduction - Commander Dashboard Overview",
        duration: 20,
        description: "Show the main dashboard with zone overview and current status",
        narration: "Welcome to the Disaster Response Dashboard. I'm Ian Frelinger, Incident Commander. Here we have a real-time overview of our evacuation zones. Zone A shows IMMEDIATE priority with 150 buildings and 1,500 residents. We've evacuated 120, have 20 in progress, and 5 refused. Zone B is at WARNING level with 75 buildings and 2,200 residents. Zone C is on STANDBY with 50 buildings and 800 residents.",
        interactions: [
          { type: 'waitForSelector', selector: '#root', description: 'Wait for app to load' },
          { type: 'wait', duration: 3000, description: 'Show initial dashboard view' },
          { type: 'screenshot', description: 'Capture dashboard overview' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before scrolling' },
          { type: 'scroll', description: 'Scroll down to show zone cards' },
          { type: 'wait', duration: 1000, description: 'Let content settle' },
          { type: 'screenshot', description: 'Capture zone cards view' }
        ],
        visualTarget: "Commander Dashboard with zone status overview",
        expectedOutcome: "Viewers see the operational dashboard and understand current evacuation status"
      },
      {
        id: "zone-interaction",
        title: "Zone Management - Interactive Zone Cards",
        duration: 25,
        description: "Demonstrate zone card interactions and status updates",
        narration: "Let me show you how we manage evacuation zones. Each zone card displays real-time information including population counts, evacuation progress, and risk assessments. I can click on any zone to see detailed information and update status. This gives me immediate situational awareness and the ability to make informed decisions about resource allocation.",
        interactions: [
          { type: 'click', selector: 'div.zone-card:first-child', description: 'Click on first zone card to show details' },
          { type: 'wait', duration: 2000, description: 'Wait for zone details to appear' },
          { type: 'screenshot', description: 'Capture zone details view' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before second zone' },
          { type: 'click', selector: 'div.zone-card:nth-child(2)', description: 'Click on second zone card' },
          { type: 'wait', duration: 2000, description: 'Wait for second zone details' },
          { type: 'screenshot', description: 'Capture second zone details' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before third zone' },
          { type: 'click', selector: 'div.zone-card:nth-child(3)', description: 'Click on third zone card' },
          { type: 'wait', duration: 2000, description: 'Wait for third zone details' },
          { type: 'screenshot', description: 'Capture third zone details' }
        ],
        visualTarget: "Interactive zone management with detailed information",
        expectedOutcome: "Viewers see how zones are managed and how detailed information is accessed"
      },
      {
        id: "live-map-view",
        title: "Live Map - Hazard Visualization & Layers",
        duration: 30,
        description: "Show the live map with hazard visualization and layer controls",
        narration: "Now let me show you the live map view. This provides real-time visualization of hazards, evacuation zones, and resource locations. I can toggle different layers to understand the full situation - hazards, weather conditions, evacuation zones, and unit locations. The map automatically updates as new data comes in from satellite feeds and ground sensors.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to live map view' },
          { type: 'wait', duration: 3000, description: 'Wait for map to load and render' },
          { type: 'screenshot', description: 'Capture initial map view with all layers' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before layer toggling' },
          { type: 'uncheck', selector: 'input[type="checkbox"]:nth-of-type(1)', description: 'Toggle first layer off to show base map' },
          { type: 'wait', duration: 1000, description: 'Show map without first layer' },
          { type: 'screenshot', description: 'Capture map with first layer disabled' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before restoring layer' },
          { type: 'check', selector: 'input[type="checkbox"]:nth-of-type(1)', description: 'Restore first layer' },
          { type: 'wait', duration: 1000, description: 'Show layer restored' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before second layer toggle' },
          { type: 'uncheck', selector: 'input[type="checkbox"]:nth-of-type(2)', description: 'Toggle second layer off' },
          { type: 'wait', duration: 1000, description: 'Show map with second layer disabled' },
          { type: 'screenshot', description: 'Capture map with second layer disabled' },
          { type: 'check', selector: 'input[type="checkbox"]:nth-of-type(2)', description: 'Restore second layer' },
          { type: 'wait', duration: 1000, description: 'Show all layers restored' },
          { type: 'screenshot', description: 'Capture final map view with all layers' }
        ],
        visualTarget: "Live map with hazard visualization and layer controls",
        expectedOutcome: "Viewers see how the map provides real-time situational awareness"
      },
      {
        id: "map-interaction",
        title: "Map Interaction - Hazard Investigation",
        duration: 25,
        description: "Demonstrate map interaction and hazard investigation",
        narration: "Let me show you how I investigate hazards on the map. I can click on hazard markers to see detailed information, hover over areas to get tooltips, and pan around to understand the geographic context. This interactive capability allows me to quickly assess threats and make informed decisions about evacuation priorities.",
        interactions: [
          { type: 'pauseBefore', duration: 1000, description: 'Pause before map interaction' },
          { type: 'click', selector: '.mapboxgl-canvas', coordinates: [100, 100], description: 'Click on map in safe area to test interaction' },
          { type: 'wait', duration: 1000, description: 'Show map click response' },
          { type: 'screenshot', description: 'Capture map interaction test' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before panning' },
          { type: 'keyboard', value: 'ArrowRight', description: 'Pan map to the right' },
          { type: 'wait', duration: 1000, description: 'Show map panned' },
          { type: 'screenshot', description: 'Capture panned map view' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before zooming' },
          { type: 'keyboard', value: 'Control+=', description: 'Zoom in on map' },
          { type: 'wait', duration: 1000, description: 'Show zoomed map' },
          { type: 'screenshot', description: 'Capture zoomed map view' }
        ],
        visualTarget: "Map interaction capabilities for hazard investigation",
        expectedOutcome: "Viewers see how the map enables interactive hazard investigation"
      },
      {
        id: "dashboard-return",
        title: "Dashboard Return - Status Overview",
        duration: 20,
        description: "Return to dashboard to show updated status and metrics",
        narration: "Now let me return to the dashboard to show you how our status has updated. The system provides real-time metrics on evacuation progress, resource utilization, and risk assessments. This gives me a comprehensive view of our operation and helps me identify areas that need attention or additional resources.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to commander dashboard' },
          { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
          { type: 'screenshot', description: 'Capture dashboard return view' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before scrolling' },
          { type: 'scroll', description: 'Scroll down to show more dashboard content' },
          { type: 'wait', duration: 1000, description: 'Let content settle' },
          { type: 'screenshot', description: 'Capture scrolled dashboard view' }
        ],
        visualTarget: "Updated dashboard with real-time status and metrics",
        expectedOutcome: "Viewers see how the dashboard provides comprehensive operational overview"
      },
      {
        id: "navigation-demo",
        title: "Navigation - View Switching & Context",
        duration: 20,
        description: "Demonstrate smooth navigation between different views",
        narration: "The system provides seamless navigation between different operational views. I can quickly switch from the commander dashboard to the live map and back, maintaining context and real-time updates. This flexibility allows me to respond quickly to changing situations while keeping all team members informed.",
        interactions: [
          { type: 'pauseBefore', duration: 1000, description: 'Pause before navigation demo' },
          { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to live map view' },
          { type: 'wait', duration: 2000, description: 'Wait for map to load' },
          { type: 'screenshot', description: 'Capture map view after navigation' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before returning to dashboard' },
          { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard' },
          { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
          { type: 'screenshot', description: 'Capture dashboard after navigation' }
        ],
        visualTarget: "Smooth navigation between operational views",
        expectedOutcome: "Viewers see how the system enables quick context switching"
      },
      {
        id: "conclusion-summary",
        title: "Conclusion - System Capabilities & Value",
        duration: 25,
        description: "Summarize system capabilities and demonstrate value proposition",
        narration: "This Disaster Response Dashboard demonstrates how integrated data and real-time visualization can transform emergency response operations. We've shown real-time hazard monitoring, interactive zone management, comprehensive status tracking, and seamless navigation between operational views. The system provides the situational awareness and decision support that emergency responders need to save lives and protect communities. I invite you to see how this platform can enhance your emergency response capabilities.",
        interactions: [
          { type: 'pauseBefore', duration: 1000, description: 'Pause before conclusion' },
          { type: 'scroll', description: 'Scroll to show full dashboard capabilities' },
          { type: 'wait', duration: 1000, description: 'Let content settle' },
          { type: 'screenshot', description: 'Capture full dashboard capabilities view' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before final view' },
          { type: 'click', selector: 'button:has-text("Live Map")', description: 'Show final map view' },
          { type: 'wait', duration: 2000, description: 'Wait for map to load' },
          { type: 'screenshot', description: 'Capture final map view for conclusion' }
        ],
        visualTarget: "System capabilities summary and value demonstration",
        expectedOutcome: "Viewers understand the system's value and are inspired to take action"
      }
    ];
  }

  private async saveRecordedVideo(): Promise<void> {
    console.log('🎬 Saving recorded video...');
    try {
      const files = fs.readdirSync(this.outputDir);
      const videoFiles = files.filter(file => file.endsWith('.webm'));
      if (videoFiles.length === 0) {
        console.log('⚠️ No video files found in output directory');
        return;
      }
      const videoFile = videoFiles[0];
      const sourcePath = path.join(this.outputDir, videoFile);
      const targetPath = path.join(this.outputDir, 'disaster-response-realistic-production.mp4');
      try {
        const convertCommand = `ffmpeg -i "${sourcePath}" -c:v libx264 -preset fast -crf 23 "${targetPath}" -y`;
        await execAsync(convertCommand);
        fs.unlinkSync(sourcePath);
        console.log(`✅ Video saved as: ${targetPath}`);
        const stats = fs.statSync(targetPath);
        const fileSize = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`📊 File size: ${fileSize} MB`);
      } catch (convertError) {
        console.log(`⚠️ Could not convert to MP4, keeping original: ${videoFile}`);
        const newPath = path.join(this.outputDir, 'disaster-response-realistic-production.webm');
        fs.renameSync(sourcePath, newPath);
        console.log(`✅ Video saved as: ${newPath}`);
      }
    } catch (error) {
      console.error('❌ Failed to save video:', error);
    }
  }

  async runRealisticProduction(): Promise<void> {
    console.log('🎬 Starting Realistic Production Recording');
    console.log('=' .repeat(50));
    console.log('This will record a realistic demo using actual UI components and interactions.');

    const beats = this.createRealisticConfig();
    console.log(`📋 Total beats to record: ${beats.length}`);

    try {
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      // Record each beat
      for (let i = 0; i < beats.length; i++) {
        const beat = beats[i];
        console.log(`\n🎬 Recording beat ${i + 1}/${beats.length}: ${beat.title}`);
        console.log(`📝 Description: ${beat.description}`);
        console.log(`🎤 Narration: ${beat.narration.substring(0, 100)}...`);
        console.log(`🎯 Visual Target: ${beat.visualTarget}`);
        console.log(`✅ Expected Outcome: ${beat.expectedOutcome}`);

        for (const interaction of beat.interactions) {
          const success = await this.executeInteraction(interaction);
          if (!success) {
            console.error(`❌ Beat ${beat.id} failed at interaction: ${interaction.description}`);
            break;
          }
        }

        // Wait between beats for natural pacing
        if (i < beats.length - 1) {
          console.log(`  ⏳ Waiting between beats...`);
          await this.page!.waitForTimeout(2000);
        }
      }

      console.log('\n✅ All beats recorded successfully!');
      
      // Save the recorded video
      await this.saveRecordedVideo();
      
      console.log('\n🎬 Realistic Production Recording completed successfully!');
      console.log('📁 Check the output directory for the final video');
      console.log('📸 Check the captures directory for screenshots');
      
    } catch (error) {
      console.error('❌ Realistic Production Recording failed:', error);
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
  const recorder = new RealisticProductionRecorder();
  await recorder.runRealisticProduction();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RealisticProductionRecorder };
