#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ProfessionalBeat {
  id: string;
  title: string;
  duration: number;
  description: string;
  narration: string;
  interactions: ProfessionalInteraction[];
  visualTarget: string;
  expectedOutcome: string;
  requiresGraphics?: boolean;
  graphicsType?: 'intro' | 'user-persona' | 'api-flow' | 'operational' | 'swimlane' | 'metrics' | 'conclusion';
}

interface ProfessionalInteraction {
  type: 'click' | 'wait' | 'screenshot' | 'waitForSelector' | 'scroll' | 'hover' | 'type' | 'check' | 'uncheck' | 'navigate' | 'drag' | 'drop' | 'select' | 'keyboard' | 'zoom' | 'pan';
  selector?: string;
  value?: string;
  duration?: number;
  description: string;
  coordinates?: [number, number];
  pauseBefore?: number;
  pauseAfter?: number;
}

class ProfessionalProductionRecorder {
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
    console.log('🚀 Initializing Playwright browser for professional production recording...');
    
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

  private async executeInteraction(interaction: ProfessionalInteraction): Promise<boolean> {
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
          
        case 'select':
          if (interaction.selector && interaction.value) {
            await this.page.selectOption(interaction.selector, interaction.value);
          }
          break;
          
        case 'drag':
          if (interaction.selector) {
            // Simulate drag operation
            await this.page.dragAndDrop(interaction.selector, '.drop-zone');
          }
          break;
          
        case 'drop':
          // Handle drop operations
          break;
          
        case 'zoom':
          // Simulate zoom with keyboard
          await this.page.keyboard.press('Control+=');
          break;
          
        case 'pan':
          // Simulate pan with arrow keys
          await this.page.keyboard.press('ArrowRight');
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
            path: path.join(this.capturesDir, `professional-${timestamp}.png`),
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

  private createProfessionalConfig(): ProfessionalBeat[] {
    return [
      {
        id: "intro-and-context",
        title: "Introduction & Context",
        duration: 15,
        description: "Set the scene with intro graphic and user persona",
        narration: "Welcome to the Disaster Response Dashboard. I'm Ian Frelinger, Incident Commander. In emergency situations, every second counts. This platform brings together real-time data, AI decision support, and Foundry's ontology to give us the edge we need.",
        interactions: [
          { type: 'waitForSelector', selector: '#root', description: 'Wait for app to load' },
          { type: 'wait', duration: 3000, description: 'Show intro context' },
          { type: 'screenshot', description: 'Capture intro view' }
        ],
        visualTarget: "Introduction with context and user persona",
        expectedOutcome: "Viewers understand who the user is and the context",
        requiresGraphics: true,
        graphicsType: 'intro'
      },
      {
        id: "hazard-detection-triage",
        title: "Detect & Verify - Hazard Detection",
        duration: 25,
        description: "Demonstrate hazard detection, selection, and risk scoring",
        narration: "A satellite feed has detected a new fire. Let me show you how the system automatically flags hazards and allows me to investigate. I'll click on the hazard marker to see details, then toggle different layers to understand the full situation including weather overlays and risk scoring.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for hazard investigation' },
          { type: 'wait', duration: 3000, description: 'Wait for map to load with hazards' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause for viewer absorption' },
          { type: 'click', selector: '.mapboxgl-canvas', coordinates: [960, 540], description: 'Click on hazard marker to select it' },
          { type: 'pauseAfter', duration: 1000, description: 'Pause to show selection' },
          { type: 'wait', duration: 2000, description: 'Wait for hazard details to appear' },
          { type: 'screenshot', description: 'Capture hazard selection and details' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before layer toggling' },
          { type: 'uncheck', selector: 'input[type="checkbox"]:nth-of-type(1)', description: 'Toggle hazards layer off to show base map' },
          { type: 'wait', duration: 1000, description: 'Show map without hazards' },
          { type: 'check', selector: 'input[type="checkbox"]:nth-of-type(1)', description: 'Restore hazards layer' },
          { type: 'wait', duration: 1000, description: 'Show hazards restored' },
          { type: 'screenshot', description: 'Capture layered map view with hazard detection' }
        ],
        visualTarget: "Hazard detection workflow with layer toggling and risk assessment",
        expectedOutcome: "Viewers see how hazards are detected, investigated, and contextualized"
      },
      {
        id: "zone-definition-prioritization",
        title: "Define Zones - Evacuation Planning",
        duration: 30,
        description: "Demonstrate zone definition, drawing, and prioritization",
        narration: "Now I need to define evacuation zones based on the hazard analysis. The system allows me to draw zones, set priorities, and assign risk scores. I'll create Zone A as IMMEDIATE priority, Zone B as WARNING, and Zone C as STANDBY. Each zone gets population counts, building assessments, and evacuation time estimates.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard for zone management' },
          { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before zone definition' },
          { type: 'click', selector: 'div.zone-card', description: 'Click on Zone A to access zone definition tools' },
          { type: 'wait', duration: 2000, description: 'Wait for zone definition interface' },
          { type: 'screenshot', description: 'Capture zone definition interface' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before zone modification' },
          { type: 'click', selector: 'button:has-text("Edit Zone")', description: 'Access zone editing tools' },
          { type: 'wait', duration: 2000, description: 'Wait for editing interface' },
          { type: 'screenshot', description: 'Capture zone editing tools' },
          { type: 'click', selector: 'button:has-text("Set Priority")', description: 'Set zone priority level' },
          { type: 'wait', duration: 1000, description: 'Show priority setting' },
          { type: 'screenshot', description: 'Capture priority setting' }
        ],
        visualTarget: "Zone definition and prioritization workflow",
        expectedOutcome: "Viewers see how evacuation zones are defined and prioritized"
      },
      {
        id: "route-planning-profiles",
        title: "Plan Routes - A Star Algorithm",
        duration: 35,
        description: "Demonstrate route planning with different profiles and A Star algorithm",
        narration: "Now for route planning. The system uses the A Star algorithm to calculate optimal evacuation routes. I can choose different route profiles: Civilian for general evacuation, EMS for medical emergencies, Fire for fire response, and Police for security. Each profile considers different constraints and priorities. Let me show you how the A Star algorithm finds the best path while avoiding hazards.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for route planning' },
          { type: 'wait', duration: 3000, description: 'Wait for map to load' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before route planning' },
          { type: 'click', selector: 'button:has-text("Route Planning")', description: 'Access route planning interface' },
          { type: 'wait', duration: 2000, description: 'Wait for route planning tools' },
          { type: 'screenshot', description: 'Capture route planning interface' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before profile selection' },
          { type: 'click', selector: 'button:has-text("Civilian")', description: 'Select Civilian route profile' },
          { type: 'wait', duration: 2000, description: 'Wait for route calculation' },
          { type: 'screenshot', description: 'Capture Civilian route with A Star algorithm' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before EMS profile' },
          { type: 'click', selector: 'button:has-text("EMS")', description: 'Select EMS route profile' },
          { type: 'wait', duration: 2000, description: 'Wait for EMS route calculation' },
          { type: 'screenshot', description: 'Capture EMS route with different constraints' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before Fire profile' },
          { type: 'click', selector: 'button:has-text("Fire")', description: 'Select Fire route profile' },
          { type: 'wait', duration: 2000, description: 'Wait for Fire route calculation' },
          { type: 'screenshot', description: 'Capture Fire route optimization' }
        ],
        visualTarget: "Route planning with different profiles and A Star algorithm demonstration",
        expectedOutcome: "Viewers see how different route profiles work and understand A Star algorithm"
      },
      {
        id: "unit-assignment-coordination",
        title: "Assign Units - Resource Management",
        duration: 30,
        description: "Demonstrate unit assignment, drag-and-drop, and status updates",
        narration: "Now for unit assignment. I can drag and drop units to specific zones and routes. The system shows unit status, capabilities, and current assignments. I'll assign fire units to Zone A, EMS units to evacuation routes, and police units to security checkpoints. Each assignment updates the dashboard in real-time.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard for unit management' },
          { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before unit assignment' },
          { type: 'click', selector: 'button:has-text("Unit Management")', description: 'Access unit management interface' },
          { type: 'wait', duration: 2000, description: 'Wait for unit interface' },
          { type: 'screenshot', description: 'Capture unit management interface' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before unit selection' },
          { type: 'click', selector: 'div.unit-card:has-text("Fire Engine 1")', description: 'Select fire unit for assignment' },
          { type: 'wait', duration: 1000, description: 'Show unit selection' },
          { type: 'drag', selector: 'div.unit-card:has-text("Fire Engine 1")', description: 'Drag fire unit to Zone A' },
          { type: 'wait', duration: 2000, description: 'Wait for assignment confirmation' },
          { type: 'screenshot', description: 'Capture fire unit assignment to Zone A' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before EMS assignment' },
          { type: 'click', selector: 'div.unit-card:has-text("Ambulance 1")', description: 'Select EMS unit' },
          { type: 'drag', selector: 'div.unit-card:has-text("Ambulance 1")', description: 'Drag EMS unit to evacuation route' },
          { type: 'wait', duration: 2000, description: 'Wait for EMS assignment' },
          { type: 'screenshot', description: 'Capture EMS unit assignment to route' }
        ],
        visualTarget: "Unit assignment workflow with drag-and-drop and status updates",
        expectedOutcome: "Viewers see how units are assigned and how status updates in real-time"
      },
      {
        id: "ai-decision-support",
        title: "AI Decision Support - Foundry Integration",
        duration: 40,
        description: "Demonstrate AI queries, recommendations, and Foundry ontology",
        narration: "Now let me show you the AI decision support powered by Foundry's ontology. I'll ask the AIP Commander what happens if we lose Highway 30. The system analyzes traffic patterns, population density, and alternative routes using Foundry's data relationships. It recommends immediate evacuation of Zone B and provides alternative route calculations. This shows how Foundry's ontology enables intelligent decision support.",
        interactions: [
          { type: 'click', selector: 'button:has-text("AIP Commander")', description: 'Switch to AI decision support' },
          { type: 'wait', duration: 2000, description: 'Wait for AI interface to load' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before AI interaction' },
          { type: 'click', selector: 'input[type="text"]', description: 'Click on AI input field' },
          { type: 'type', selector: 'input[type="text"]', value: 'What happens if we lose Highway 30?', description: 'Type AI query about Highway 30' },
          { type: 'wait', duration: 1000, description: 'Show typed query' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before submitting query' },
          { type: 'click', selector: 'button:has-text("Ask Commander")', description: 'Submit query to AI' },
          { type: 'wait', duration: 3000, description: 'Wait for AI processing' },
          { type: 'screenshot', description: 'Capture AI processing and analysis' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before showing recommendations' },
          { type: 'click', selector: '.recommendation-card', description: 'Click on AI recommendation' },
          { type: 'wait', duration: 1000, description: 'Show recommendation details' },
          { type: 'screenshot', description: 'Capture AI recommendation details' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before accepting recommendation' },
          { type: 'click', selector: 'button:has-text("Accept")', description: 'Accept AI recommendation' },
          { type: 'wait', duration: 2000, description: 'Show recommendation acceptance' },
          { type: 'screenshot', description: 'Capture recommendation acceptance and implementation' }
        ],
        visualTarget: "AI decision support interface and Foundry ontology integration",
        expectedOutcome: "Viewers see how AI supports decision-making and how Foundry enables intelligent analysis"
      },
      {
        id: "technical-architecture",
        title: "Technical Architecture - Data Flow",
        duration: 20,
        description: "Show technical architecture with API data flow and Foundry integration",
        narration: "Let me show you the technical architecture. Data flows from satellite feeds through our ingestion pipeline to hazard processing, route optimization using the A Star algorithm, and AI decision support powered by Foundry's ontology. This integration enables real-time situational awareness and intelligent recommendations.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Technical View")', description: 'Switch to technical architecture view' },
          { type: 'wait', duration: 2000, description: 'Wait for technical interface' },
          { type: 'screenshot', description: 'Capture technical architecture overview' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before showing data flow' },
          { type: 'click', selector: 'button:has-text("Data Flow")', description: 'Show API data flow diagram' },
          { type: 'wait', duration: 2000, description: 'Wait for data flow visualization' },
          { type: 'screenshot', description: 'Capture API data flow diagram' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before showing Foundry integration' },
          { type: 'click', selector: 'button:has-text("Foundry Integration")', description: 'Show Foundry ontology integration' },
          { type: 'wait', duration: 2000, description: 'Wait for Foundry visualization' },
          { type: 'screenshot', description: 'Capture Foundry ontology integration' }
        ],
        visualTarget: "Technical architecture with data flow and Foundry integration",
        expectedOutcome: "Viewers understand the technical architecture and data relationships",
        requiresGraphics: true,
        graphicsType: 'api-flow'
      },
      {
        id: "progress-metrics-impact",
        title: "Progress Metrics & Impact",
        duration: 25,
        description: "Show real-time progress metrics, risk scores, and cost savings",
        narration: "Now let's look at our progress metrics. Zone A has evacuated 120 out of 150 buildings with 2 units assigned. Zone B shows 60 evacuations in progress. Our risk scores are decreasing as we implement the AI recommendations. The system has reduced response time by 65% and improved coordination efficiency by 90%. These metrics demonstrate the real impact of integrated decision support.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard for metrics' },
          { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before showing metrics' },
          { type: 'click', selector: 'button:has-text("Metrics")', description: 'Access progress metrics view' },
          { type: 'wait', duration: 2000, description: 'Wait for metrics interface' },
          { type: 'screenshot', description: 'Capture progress metrics overview' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before showing risk scores' },
          { type: 'click', selector: 'button:has-text("Risk Assessment")', description: 'Show risk assessment metrics' },
          { type: 'wait', duration: 2000, description: 'Wait for risk visualization' },
          { type: 'screenshot', description: 'Capture risk assessment and scoring' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before showing cost savings' },
          { type: 'click', selector: 'button:has-text("Cost Analysis")', description: 'Show cost savings and ROI metrics' },
          { type: 'wait', duration: 2000, description: 'Wait for cost analysis' },
          { type: 'screenshot', description: 'Capture cost savings and impact metrics' }
        ],
        visualTarget: "Progress metrics, risk scores, and cost savings demonstration",
        expectedOutcome: "Viewers see concrete metrics and impact of the system",
        requiresGraphics: true,
        graphicsType: 'metrics'
      },
      {
        id: "conclusion-call-to-action",
        title: "Conclusion & Call to Action",
        duration: 20,
        description: "Strong conclusion with summary and call to action",
        narration: "This Disaster Response Dashboard demonstrates how integrated data, AI decision support, and Foundry's ontology can transform emergency response. We've shown real-time hazard detection, intelligent zone management, optimized routing with the A Star algorithm, and AI-powered decision making. The result is faster response times, better resource allocation, and improved coordination. I invite you to pilot this system and see how it can enhance your emergency response capabilities.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Summary")', description: 'Access system summary view' },
          { type: 'wait', duration: 2000, description: 'Wait for summary interface' },
          { type: 'screenshot', description: 'Capture system summary and capabilities' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before showing conclusion' },
          { type: 'click', selector: 'button:has-text("Conclusion")', description: 'Show conclusion and call to action' },
          { type: 'wait', duration: 2000, description: 'Wait for conclusion interface' },
          { type: 'screenshot', description: 'Capture conclusion and call to action' }
        ],
        visualTarget: "Conclusion with summary and strong call to action",
        expectedOutcome: "Viewers are inspired to take action and pilot the system",
        requiresGraphics: true,
        graphicsType: 'conclusion'
      }
    ];
  }

  private async generateTTSAudio(beat: ProfessionalBeat): Promise<void> {
    console.log(`  🎤 Generating TTS for: ${beat.title}`);
    
    try {
      const filename = `professional-${beat.id}.wav`;
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
      const targetPath = path.join(this.outputDir, 'disaster-response-professional-production.mp4');
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
        const newPath = path.join(this.outputDir, 'disaster-response-professional-production.webm');
        fs.renameSync(sourcePath, newPath);
        console.log(`✅ Video saved as: ${newPath}`);
      }
    } catch (error) {
      console.error('❌ Failed to save video:', error);
    }
  }

  async runProfessionalProduction(): Promise<void> {
    console.log('🎬 Starting Professional Production Recording');
    console.log('=' .repeat(50));
    console.log('This will record a comprehensive, polished demo addressing all timeline requirements.');

    const beats = this.createProfessionalConfig();
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
        if (beat.requiresGraphics) {
          console.log(`🎨 Graphics Required: ${beat.graphicsType}`);
        }

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
      
      console.log('\n🎬 Professional Production Recording completed successfully!');
      console.log('📁 Check the output directory for the final video');
      console.log('🎤 Check the audio directory for TTS files');
      console.log('📸 Check the captures directory for screenshots');
      
    } catch (error) {
      console.error('❌ Professional Production Recording failed:', error);
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
  const recorder = new ProfessionalProductionRecorder();
  await recorder.runProfessionalProduction();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ProfessionalProductionRecorder };
