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
  type: 'click' | 'wait' | 'screenshot' | 'waitForSelector' | 'scroll' | 'hover' | 'type' | 'check' | 'uncheck' | 'navigate';
  selector?: string;
  value?: string;
  duration?: number;
  description: string;
  coordinates?: [number, number];
}

class RealisticDemoRecorder {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private outputDir: string = 'output';
  private capturesDir: string = 'captures';
  private audioDir: string = 'audio';

  constructor() {
    this.ensureOutputDirs();
  }

  private ensureOutputDirs(): void {
    [this.outputDir, this.capturesDir, this.audioDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Playwright browser for realistic demo recording...');
    
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
            path: path.join(this.capturesDir, `demo-${timestamp}.png`),
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

  private createRealisticConfig(): RealisticBeat[] {
    return [
      {
        id: "dashboard-overview",
        title: "Dashboard Overview & Zone Status",
        duration: 25,
        description: "Show the main dashboard with zone overview and current status",
        narration: "Welcome to the Disaster Response Dashboard. I'm Ian Frelinger, Incident Commander. Here we have a real-time overview of our evacuation zones. Zone A shows IMMEDIATE priority with 150 buildings and 1,500 residents. We've evacuated 120, have 20 in progress, and 5 refused. Zone B is at WARNING level with 75 buildings and 2,200 residents. Zone C is on STANDBY with 50 buildings and 800 residents.",
        interactions: [
          { type: 'waitForSelector', selector: '#root', description: 'Wait for app to load' },
          { type: 'wait', duration: 3000, description: 'Show initial dashboard view' },
          { type: 'screenshot', description: 'Capture dashboard overview' },
          { type: 'scroll', description: 'Scroll down to show zone cards' },
          { type: 'wait', duration: 1000, description: 'Let content settle' },
          { type: 'screenshot', description: 'Capture zone cards view' }
        ],
        visualTarget: "Commander Dashboard with zone status overview",
        expectedOutcome: "Viewers see the operational dashboard and understand current evacuation status"
      },
      {
        id: "zone-investigation",
        title: "Zone Investigation & Details",
        duration: 30,
        description: "Investigate specific zones to show detailed information and progress",
        narration: "Let me investigate Zone A in detail. This zone has the highest priority due to immediate threat. I can see we have 2 units assigned and estimated completion at 8:35 PM. The progress section shows our evacuation status - 120 evacuated, 20 in progress, 5 refused, 3 no contact, and 2 unchecked. This gives me the granular data I need to make operational decisions.",
        interactions: [
          { type: 'click', selector: 'div.zone-card', description: 'Click on Zone A card to investigate' },
          { type: 'wait', duration: 2000, description: 'Wait for zone details to load' },
          { type: 'screenshot', description: 'Capture Zone A detailed view' },
          { type: 'click', selector: 'div.zone-card', description: 'Click on Zone B card to compare' },
          { type: 'wait', duration: 2000, description: 'Wait for Zone B details' },
          { type: 'screenshot', description: 'Capture Zone B detailed view' },
          { type: 'click', selector: 'div.zone-card', description: 'Click on Zone C card for full picture' },
          { type: 'wait', duration: 2000, description: 'Wait for Zone C details' },
          { type: 'screenshot', description: 'Capture Zone C detailed view' }
        ],
        visualTarget: "Detailed zone investigation and progress tracking",
        expectedOutcome: "Viewers see how commanders investigate zones and track evacuation progress"
      },
      {
        id: "tab-navigation",
        title: "Operational Tab Navigation",
        duration: 25,
        description: "Demonstrate navigation between different operational views",
        narration: "The dashboard provides different operational views. Let me show you the Operations tab, which is our primary view. Then we have Conditions for weather and environmental data, Assets for resource management, and AIP Commander for AI decision support. Each tab gives me a different perspective on the incident.",
        interactions: [
          { type: 'click', selector: 'button.ios-button.primary.small', description: 'Click Operations tab' },
          { type: 'wait', duration: 2000, description: 'Wait for operations view' },
          { type: 'screenshot', description: 'Capture operations view' },
          { type: 'click', selector: 'button.ios-button.secondary.small:has-text("Conditions")', description: 'Switch to Conditions tab' },
          { type: 'wait', duration: 2000, description: 'Wait for conditions view' },
          { type: 'screenshot', description: 'Capture conditions view' },
          { type: 'click', selector: 'button.ios-button.secondary.small:has-text("Assets")', description: 'Switch to Assets tab' },
          { type: 'wait', duration: 2000, description: 'Wait for assets view' },
          { type: 'screenshot', description: 'Capture assets view' },
          { type: 'click', selector: 'button.ios-button.secondary.small:has-text("AIP Commander")', description: 'Switch to AIP Commander tab' },
          { type: 'wait', duration: 2000, description: 'Wait for AIP view' },
          { type: 'screenshot', description: 'Capture AIP Commander view' }
        ],
        visualTarget: "Tab navigation between operational views",
        expectedOutcome: "Viewers see how commanders access different operational perspectives"
      },
      {
        id: "map-transition",
        title: "Transition to Live Map View",
        duration: 20,
        description: "Switch to map view to show geographic visualization",
        narration: "Now let me switch to the Live Map view to show you the geographic visualization. This gives me a spatial understanding of the incident area, showing hazards, evacuation zones, and unit locations in real-time.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to Live Map view' },
          { type: 'wait', duration: 3000, description: 'Wait for map to load and render' },
          { type: 'screenshot', description: 'Capture live map view' }
        ],
        visualTarget: "Live Map with geographic visualization",
        expectedOutcome: "Viewers see the transition to map view and understand spatial context"
      },
      {
        id: "map-layer-management",
        title: "Map Layer Management & Controls",
        duration: 30,
        description: "Demonstrate map layer controls and visibility toggling",
        narration: "The map has multiple layers that I can toggle on and off. Let me show you how to manage these layers. I can control hazard visibility, evacuation zones, weather overlays, and unit positions. This layer management gives me the flexibility to focus on specific aspects of the situation.",
        interactions: [
          { type: 'waitForSelector', selector: 'input[type="checkbox"]', description: 'Wait for layer checkboxes to load' },
          { type: 'screenshot', description: 'Capture map with all layers visible' },
          { type: 'uncheck', selector: 'input[type="checkbox"]:nth-of-type(1)', description: 'Toggle first layer off' },
          { type: 'wait', duration: 1000, description: 'Show layer change' },
          { type: 'screenshot', description: 'Capture map with first layer hidden' },
          { type: 'check', selector: 'input[type="checkbox"]:nth-of-type(1)', description: 'Toggle first layer back on' },
          { type: 'wait', duration: 1000, description: 'Show layer restored' },
          { type: 'uncheck', selector: 'input[type="checkbox"]:nth-of-type(2)', description: 'Toggle second layer off' },
          { type: 'wait', duration: 1000, description: 'Show second layer change' },
          { type: 'screenshot', description: 'Capture map with second layer hidden' },
          { type: 'check', selector: 'input[type="checkbox"]:nth-of-type(2)', description: 'Toggle second layer back on' },
          { type: 'wait', duration: 1000, description: 'Show second layer restored' }
        ],
        visualTarget: "Map layer management and visibility controls",
        expectedOutcome: "Viewers see how commanders control map layers for situational awareness"
      },
      {
        id: "map-interaction",
        title: "Map Interaction & Location Selection",
        duration: 25,
        description: "Demonstrate map interaction capabilities and location selection",
        narration: "The map is fully interactive. I can click on specific locations to get detailed information, pan and zoom to focus on areas of interest, and use the map controls for navigation. This interactive capability is crucial for understanding the spatial relationships between hazards, evacuation zones, and response units.",
        interactions: [
          { type: 'click', selector: '.mapboxgl-canvas', description: 'Click on map canvas to demonstrate interaction' },
          { type: 'wait', duration: 1000, description: 'Show map click response' },
          { type: 'screenshot', description: 'Capture map interaction' },
          { type: 'hover', selector: '.mapboxgl-canvas', description: 'Hover over map to show tooltip capability' },
          { type: 'wait', duration: 1000, description: 'Show hover effect' },
          { type: 'screenshot', description: 'Capture map hover interaction' }
        ],
        visualTarget: "Map interaction and location selection",
        expectedOutcome: "Viewers see how commanders interact with the map for detailed analysis"
      },
      {
        id: "dashboard-return",
        title: "Return to Dashboard for Decision Making",
        duration: 20,
        description: "Return to dashboard to show decision-making workflow",
        narration: "Now let me return to the Commander Dashboard to show you how I use this information for decision making. Having seen the geographic context on the map, I can now make informed decisions about resource allocation, evacuation priorities, and response coordination.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to Commander Dashboard' },
          { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
          { type: 'screenshot', description: 'Capture return to dashboard' }
        ],
        visualTarget: "Return to dashboard for decision making",
        expectedOutcome: "Viewers see the complete workflow from map analysis to dashboard decision making"
      },
      {
        id: "operational-decision",
        title: "Operational Decision Making & Coordination",
        duration: 30,
        description: "Demonstrate operational decision making using dashboard data",
        narration: "Based on the data I've gathered, I can see that Zone A needs immediate attention. We have 20 evacuations in progress and 5 refusals that require follow-up. The dashboard gives me real-time visibility into unit assignments, completion estimates, and population status. This enables me to make data-driven decisions about resource allocation and response priorities.",
        interactions: [
          { type: 'click', selector: 'div.zone-card', description: 'Click on Zone A for detailed analysis' },
          { type: 'wait', duration: 2000, description: 'Wait for zone details' },
          { type: 'screenshot', description: 'Capture Zone A analysis for decision making' },
          { type: 'scroll', description: 'Scroll to show more operational data' },
          { type: 'wait', duration: 1000, description: 'Let content settle' },
          { type: 'screenshot', description: 'Capture operational decision making view' }
        ],
        visualTarget: "Operational decision making using dashboard data",
        expectedOutcome: "Viewers see how commanders use data for operational decisions"
      },
      {
        id: "aip-commander-demo",
        title: "AIP Commander AI Decision Support",
        duration: 35,
        description: "Demonstrate AI decision support capabilities",
        narration: "Let me show you the AIP Commander, our AI decision support system. This integrates with Foundry's ontology to provide intelligent recommendations. I can ask natural language questions about the incident, get risk assessments, and receive alternative response scenarios. This AI support enhances my decision-making capabilities significantly.",
        interactions: [
          { type: 'click', selector: 'button.ios-button.secondary.small:has-text("AIP Commander")', description: 'Switch to AIP Commander tab' },
          { type: 'wait', duration: 2000, description: 'Wait for AIP interface to load' },
          { type: 'screenshot', description: 'Capture AIP Commander interface' },
          { type: 'wait', duration: 3000, description: 'Show AI processing and recommendations' },
          { type: 'screenshot', description: 'Capture AI recommendations and decision support' }
        ],
        visualTarget: "AIP Commander AI decision support interface",
        expectedOutcome: "Viewers see how AI enhances commander decision making"
      },
      {
        id: "comprehensive-overview",
        title: "Comprehensive System Overview & Value",
        duration: 25,
        description: "Show comprehensive system overview and demonstrate value proposition",
        narration: "This Disaster Response Dashboard brings together real-time data, geographic visualization, and AI decision support in one integrated platform. It eliminates the need for multiple systems and provides commanders with immediate situational awareness. The result is faster response times, better resource allocation, and improved coordination between response units.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to main dashboard view' },
          { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
          { type: 'screenshot', description: 'Capture comprehensive system overview' },
          { type: 'scroll', description: 'Scroll to show full system capabilities' },
          { type: 'wait', duration: 1000, description: 'Let content settle' },
          { type: 'screenshot', description: 'Capture full system capabilities view' }
        ],
        visualTarget: "Comprehensive system overview and value demonstration",
        expectedOutcome: "Viewers understand the complete value proposition and system capabilities"
      }
    ];
  }

  private async generateTTSAudio(beat: RealisticBeat): Promise<void> {
    console.log(`  🎤 Generating TTS for: ${beat.title}`);
    
    try {
      const filename = `audio-${beat.id}.wav`;
      const filepath = path.join(this.audioDir, filename);
      
      // Use macOS say command to generate TTS
      const sayCommand = `say -v Daniel -o "${filepath}" "${beat.narration}"`;
      await execAsync(sayCommand);
      
      // Convert to MP3 for better compatibility
      const mp3Filepath = filepath.replace('.wav', '.mp3');
      const convertCommand = `ffmpeg -i "${filepath}" -acodec libmp3lame -ab 128k "${mp3Filepath}" -y`;
      await execAsync(convertCommand);
      
      // Remove WAV file
      fs.unlinkSync(filepath);
      
      console.log(`    ✅ TTS generated: ${mp3Filepath}`);
      
    } catch (error) {
      console.error(`    ❌ TTS generation failed: ${error}`);
    }
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
      const targetPath = path.join(this.outputDir, 'disaster-response-realistic-demo.mp4');
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
        const newPath = path.join(this.outputDir, 'disaster-response-realistic-demo.webm');
        fs.renameSync(sourcePath, newPath);
        console.log(`✅ Video saved as: ${newPath}`);
      }
    } catch (error) {
      console.error('❌ Failed to save video:', error);
    }
  }

  async runRealisticDemo(): Promise<void> {
    console.log('🎬 Starting Realistic Demo Recording');
    console.log('=' .repeat(50));
    console.log('This will record a comprehensive demo using real UI interactions.');

    const beats = this.createRealisticConfig();
    console.log(`📋 Total beats to record: ${beats.length}`);

    try {
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      // Generate TTS for all beats
      console.log('\n🎤 Generating TTS audio for all beats...');
      for (const beat of beats) {
        await this.generateTTSAudio(beat);
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
      
      console.log('\n🎬 Realistic Demo Recording completed successfully!');
      console.log('📁 Check the output directory for the final video');
      console.log('🎤 Check the audio directory for TTS files');
      console.log('📸 Check the captures directory for screenshots');
      
    } catch (error) {
      console.error('❌ Realistic Demo Recording failed:', error);
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
  const recorder = new RealisticDemoRecorder();
  await recorder.runRealisticDemo();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RealisticDemoRecorder };
