#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface PresentationBeat {
  id: string;
  title: string;
  duration: number;
  description: string;
  narration: string;
  actions: string[];
  visualTarget?: string;
}

interface SimpleConfig {
  app: {
    url: string;
    viewport: {
      width: number;
      height: number;
    };
    waitForSelector: string;
    timeout: number;
  };
  beats: PresentationBeat[];
  recording: {
    format: string;
    codec: string;
    quality: string;
    fps: number;
    audio: boolean;
  };
}

interface BeatResult {
  id: string;
  title: string;
  duration: number;
  success: boolean;
  videoPath?: string;
  error?: string;
  actualDuration?: number;
  notes?: string;
}

class SimplePresentationRecorder {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: SimpleConfig;
  private outputDir: string = 'captures';
  private results: BeatResult[] = [];

  constructor() {
    this.config = this.createPresentationConfig();
    this.ensureOutputDir();
  }

  private createPresentationConfig(): SimpleConfig {
    return {
      app: {
        url: process.env.HOST_FRONTEND_URL || "http://localhost:3000",
        viewport: {
          width: 1920,
          height: 1080
        },
        waitForSelector: "#root",
        timeout: 30000
      },
      beats: [
        {
          id: "intro",
          title: "Introduction",
          duration: 15,
          description: "Dashboard overview and platform introduction",
          narration: "Hi, I'm excited to share my Palantir Building Challenge project. I've built a disaster-response platform that helps incident commanders and their teams coordinate faster and safer when minutes matter.",
          actions: [
            "waitForSelector('#root')",
            "wait(2000)",
            "screenshot('intro-dashboard')"
          ],
          visualTarget: "Dashboard main view"
        },
        {
          id: "problem-statement",
          title: "Problem Statement & Motivation",
          duration: 25,
          description: "Show current challenges with hazard detection",
          narration: "Emergency responders have to juggle radios, maps, spreadsheets and more, which slows them down when every minute counts. In many cases, lower-level responders lack access to high-level situational awareness and tools reserved for incident commanders. I wanted to build something that brings everyone onto the same page without overloading them with information.",
          actions: [
            "click('button:has-text(\"Live Map\")')",
            "waitForSelector('.mapboxgl-canvas')",
            "wait(2000)",
            "screenshot('hazard-detection')"
          ],
          visualTarget: "Live hazard map with active hazards"
        },
        {
          id: "user-persona",
          title: "Target User Persona",
          duration: 15,
          description: "Show different user roles and access levels",
          narration: "This system is designed for Incident Commanders, Operations and Planning chiefs, dispatchers and field units. We keep the Incident Commander at the top of the chain of command but also give front-line teams real-time information and AI-generated recommendations.",
          actions: [
            "click('button:has-text(\"Commander Dashboard\")')",
            "wait(1000)",
            "screenshot('commander-view')",
            "click('button:has-text(\"Live Map\")')",
            "wait(1000)",
            "screenshot('responder-view')"
          ],
          visualTarget: "User role selection interface"
        },
        {
          id: "technical-architecture",
          title: "Technical Architecture & API Data Flow",
          duration: 30,
          description: "Show API data flow and system architecture",
          narration: "Under the hood, the front end uses React and Mapbox for a fast, 3-D map. The backend runs on Python/Flask with WebSockets and Celery to handle real-time updates. Everything sits on Palantir Foundry, which streams live data from NOAA, NASA and USGS and powers the AIP assistant. This API data-flow diagram shows how external feeds flow into ingestion and hazard processing. From there, the data drives three core services: route optimisation, ontology and entities, and AI decision support.",
          actions: [
            "click('button:has-text(\"Commander Dashboard\")')",
            "wait(2000)",
            "screenshot('api-architecture')"
          ],
          visualTarget: "API data flow diagram"
        },
        {
          id: "detect-verify",
          title: "Detect & Verify",
          duration: 15,
          description: "Show satellite feed and risk scoring",
          narration: "A satellite feed shows a new fire. The system flags it and scores the risk using population data and weather. As the Incident Commander, I confirm that this is a real incident.",
          actions: [
            "click('button:has-text(\"Live Map\")')",
            "waitForSelector('.mapboxgl-canvas')",
            "wait(2000)",
            "screenshot('detect-verify')"
          ],
          visualTarget: "Satellite feed with risk scoring"
        },
        {
          id: "triage-risk",
          title: "Triage & Risk Scoring",
          duration: 10,
          description: "Show evacuation vs shelter decision",
          narration: "Looking at the risk and wind direction, I decide we should evacuate rather than shelter in place. The AI suggests this because the fire is near critical infrastructure.",
          actions: [
            "click('button:has-text(\"Commander Dashboard\")')",
            "wait(2000)",
            "screenshot('triage-risk')"
          ],
          visualTarget: "Risk analysis with AI recommendations"
        },
        {
          id: "define-zones",
          title: "Define Zones",
          duration: 10,
          description: "Show evacuation zone drawing tool",
          narration: "With the drawing tool, I outline the evacuation zone and set its priority. This defines which buildings and residents are affected.",
          actions: [
            "click('button:has-text(\"Live Map\")')",
            "waitForSelector('.mapboxgl-canvas')",
            "wait(2000)",
            "screenshot('zone-definition')"
          ],
          visualTarget: "Zone drawing interface"
        },
        {
          id: "plan-routes",
          title: "Plan Routes",
          duration: 20,
          description: "Show route planning with different profiles",
          narration: "I pick a route profile—civilian, EMS, fire tactical or police—each balancing safety and speed. The blue line you see is a hazard-aware route calculated using A Star search.",
          actions: [
            "click('button:has-text(\"Live Map\")')",
            "waitForSelector('.mapboxgl-canvas')",
            "wait(2000)",
            "screenshot('route-planning')"
          ],
          visualTarget: "Route planning with hazard-aware routing"
        },
        {
          id: "assign-units",
          title: "Assign Units & Track Assets",
          duration: 10,
          description: "Show unit assignment and building status",
          narration: "I assign engines and medics. Dragging units onto the map updates their tasks and travel times. On the right, you can see building status—evacuated, in progress, refused or uncontacted.",
          actions: [
            "click('button:has-text(\"Commander Dashboard\")')",
            "wait(2000)",
            "screenshot('unit-assignment')"
          ],
          visualTarget: "Unit assignment and building status tracking"
        },
        {
          id: "ai-support",
          title: "AI Support & Replan",
          duration: 20,
          description: "Show AIP assistant and alternative routes",
          narration: "If I have a question, I can ask the AIP assistant something like \"What happens if we lose Highway 30?\" and get alternative routes right away. When a new hazard or weather update comes in, the system automatically recalculates and loops back to zone definition.",
          actions: [
            "click('button:has-text(\"Live Map\")')",
            "waitForSelector('.mapboxgl-canvas')",
            "wait(2000)",
            "screenshot('ai-support')"
          ],
          visualTarget: "AI assistant interface"
        },
        {
          id: "value-proposition",
          title: "Value Proposition & Impact",
          duration: 30,
          description: "Show asset management and benefits",
          narration: "This platform speeds up decisions, reduces staffing needed for manual data fusion, and gives every responder a common operating picture while keeping the Incident Commander firmly in control. By automating routine steps, it lets teams focus on actions that save lives and property.",
          actions: [
            "click('button:has-text(\"Commander Dashboard\")')",
            "wait(2000)",
            "screenshot('value-proposition')"
          ],
          visualTarget: "Asset management dashboard"
        },
        {
          id: "foundry-integration",
          title: "Foundry Integration & AI Assistance",
          duration: 20,
          description: "Show Foundry data pipelines and ontology",
          narration: "Thanks to Foundry's data pipelines and ontology, I can ingest and fuse multiple feeds quickly. The AIP assistant is context-aware because it sits on top of that ontology, so it can recommend re-routing around a blocked highway or predict fire spread.",
          actions: [
            "click('button:has-text(\"Live Map\")')",
            "waitForSelector('.mapboxgl-canvas')",
            "wait(2000)",
            "screenshot('foundry-integration')"
          ],
          visualTarget: "Foundry integration and data pipelines"
        },
        {
          id: "conclusion",
          title: "Conclusion & Call to Action",
          duration: 20,
          description: "Final summary and call to action",
          narration: "To wrap up, this project shows how real-time data, AI assistance and a streamlined chain of command can modernize emergency response. I'd love to talk about piloting this with your teams.",
          actions: [
            "click('button:has-text(\"Commander Dashboard\")')",
            "wait(2000)",
            "screenshot('conclusion')"
          ],
          visualTarget: "Navigation menu with CTA"
        }
      ],
      recording: {
        format: "webm",
        codec: "vp9",
        quality: "high",
        fps: 30,
        audio: false
      }
    };
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Playwright browser for simple presentation...');
    
    try {
      this.browser = await chromium.launch({
        headless: false, // Show browser for recording
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
        viewport: this.config.app.viewport,
        recordVideo: {
          dir: this.outputDir,
          size: this.config.app.viewport
        }
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.config.app.timeout);
      
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
    
    console.log(`🌐 Navigating to: ${this.config.app.url}`);
    
    try {
      await this.page.goto(this.config.app.url, { waitUntil: 'networkidle' });
      
      if (this.config.app.waitForSelector) {
        console.log(`⏳ Waiting for selector: ${this.config.app.waitForSelector}`);
        await this.page.waitForSelector(this.config.app.waitForSelector);
      }
      
      await this.page.waitForTimeout(2000);
      
      console.log('✅ App loaded successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to navigate to app:', error);
      return false;
    }
  }

  private async executeAction(action: string): Promise<boolean> {
    if (!this.page) {
      console.error('❌ Page not initialized during action execution');
      return false;
    }

    try {
      if (action.startsWith('waitForSelector(')) {
        const selector = action.match(/waitForSelector\('([^']+)'\)/)?.[1];
        if (selector) {
          await this.page.waitForSelector(selector);
        }
      } else if (action.startsWith('click(')) {
        const selector = action.match(/click\('([^']+)'\)/)?.[1];
        if (selector) {
          await this.page.click(selector);
        }
      } else if (action.startsWith('wait(')) {
        const time = action.match(/wait\((\d+)\)/)?.[1];
        if (time) {
          await this.page.waitForTimeout(parseInt(time));
        }
      } else if (action.startsWith('screenshot(')) {
        const name = action.match(/screenshot\('([^']+)'\)/)?.[1];
        if (name) {
          await this.page.screenshot({ 
            path: path.join(this.outputDir, `${name}.png`),
            fullPage: true 
          });
        }
      } else if (action.startsWith('selectOption(')) {
        const match = action.match(/selectOption\('([^']+)',\s*'([^']+)'\)/);
        if (match) {
          const [selector, value] = match.slice(1);
          await this.page.selectOption(selector, value);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Action failed: ${action}`, error);
      return false;
    }
  }

  async recordBeat(beat: PresentationBeat): Promise<BeatResult> {
    console.log(`\n🎬 Recording beat: ${beat.title} (${beat.duration}s)`);
    console.log(`📝 Description: ${beat.description}`);
    console.log(`🎤 Narration: ${beat.narration.substring(0, 100)}...`);
    
    const result: BeatResult = {
      id: beat.id,
      title: beat.title,
      duration: beat.duration,
      success: false
    };

    try {
      const startTime = Date.now();
      
      // Execute all actions for this beat
      for (const action of beat.actions) {
        console.log(`  🔧 Executing: ${action}`);
        const success = await this.executeAction(action);
        if (!success) {
          result.error = `Action failed: ${action}`;
          result.notes = `Failed at action: ${action}`;
          return result;
        }
      }
      
      // Wait for the specified duration
      const elapsed = Date.now() - startTime;
      const remainingWait = Math.max(0, (beat.duration * 1000) - elapsed);
      
      if (remainingWait > 0) {
        console.log(`  ⏳ Waiting ${remainingWait}ms to complete beat duration`);
        await this.page!.waitForTimeout(remainingWait);
      }
      
      result.success = true;
      result.actualDuration = (Date.now() - startTime) / 1000;
      result.notes = `Visual target: ${beat.visualTarget}`;
      
      console.log(`✅ Beat completed successfully (${result.actualDuration.toFixed(1)}s)`);
      
    } catch (error) {
      result.error = `Beat recording failed: ${error}`;
      console.error(`❌ Beat failed: ${error}`);
    }
    
    return result;
  }

  async runSimplePresentation(): Promise<void> {
    console.log('🎬 Starting Simple Presentation Recording');
    console.log('=' .repeat(50));
    console.log(`📊 Total beats: ${this.config.beats.length}`);
    console.log(`🎯 Total duration: ${this.config.beats.reduce((sum, beat) => sum + beat.duration, 0)}s`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log('');

    try {
      // Initialize browser
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      // Navigate to app
      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      // Record each beat
      for (const beat of this.config.beats) {
        const result = await this.recordBeat(beat);
        this.results.push(result);
        
        if (!result.success) {
          console.log(`⚠️ Beat failed, but continuing with next beat...`);
        }
      }

      // Generate report
      await this.generateReport();

    } catch (error) {
      console.error('❌ Simple presentation failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async generateReport(): Promise<void> {
    const reportPath = path.join(this.outputDir, 'simple-presentation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      summary: {
        totalBeats: this.results.length,
        successfulBeats: this.results.filter(r => r.success).length,
        failedBeats: this.results.filter(r => !r.success).length,
        totalDuration: this.results.reduce((sum, r) => sum + (r.actualDuration || 0), 0),
        expectedDuration: this.config.beats.reduce((sum, beat) => sum + beat.duration, 0)
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Simple Presentation Report');
    console.log('=' .repeat(35));
    console.log(`Total beats: ${report.summary.totalBeats}`);
    console.log(`Successful: ${report.summary.successfulBeats}`);
    console.log(`Failed: ${report.summary.failedBeats}`);
    console.log(`Success rate: ${((report.summary.successfulBeats / report.summary.totalBeats) * 100).toFixed(1)}%`);
    console.log(`Actual duration: ${report.summary.totalDuration.toFixed(1)}s`);
    console.log(`Expected duration: ${report.summary.expectedDuration}s`);
    console.log(`Report saved to: ${reportPath}`);
    
    if (report.summary.failedBeats > 0) {
      console.log('\n❌ Failed beats:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.title}: ${result.error}`);
      });
    }
    
    console.log('\n🎬 Next Steps:');
    console.log('1. Review the recorded video in the captures directory');
    console.log('2. Add text-to-speech narration separately if needed');
    console.log('3. Use video editing software to combine video and audio');
    console.log('4. Add any additional graphics or overlays as needed');
  }
}

// Main execution
async function main() {
  const recorder = new SimplePresentationRecorder();
  await recorder.runSimplePresentation();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SimplePresentationRecorder };
