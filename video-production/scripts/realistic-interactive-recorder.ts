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
  visualTarget?: string;
}

interface RealisticInteraction {
  type: 'click' | 'hover' | 'type' | 'wait' | 'screenshot' | 'waitForSelector' | 'scroll';
  selector?: string;
  value?: string;
  duration?: number;
  description: string;
}

interface RealisticConfig {
  app: {
    url: string;
    viewport: {
      width: number;
      height: number;
    };
    waitForSelector: string;
    timeout: number;
  };
  beats: RealisticBeat[];
  recording: {
    format: string;
    codec: string;
    quality: string;
    fps: number;
    audio: boolean;
  };
  tts: {
    provider: string;
    voice: string;
    rate: number;
    pitch: number;
  };
}

interface BeatResult {
  id: string;
  title: string;
  duration: number;
  success: boolean;
  videoPath?: string;
  audioPath?: string;
  error?: string;
  actualDuration?: number;
  notes?: string;
}

class RealisticInteractiveRecorder {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: RealisticConfig;
  private outputDir: string = 'captures';
  private audioDir: string = 'audio';
  private results: BeatResult[] = [];

  constructor() {
    this.config = this.createRealisticConfig();
    this.ensureOutputDirs();
  }

  private createRealisticConfig(): RealisticConfig {
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
          interactions: [
            { type: 'waitForSelector', selector: '#root', description: 'Wait for app to load' },
            { type: 'wait', duration: 3000, description: 'Let page settle and show dashboard' },
            { type: 'screenshot', description: 'Capture initial dashboard view' }
          ],
          visualTarget: "Dashboard main view"
        },
        {
          id: "problem-statement",
          title: "Problem Statement & Motivation",
          duration: 25,
          description: "Show current challenges with hazard detection",
          narration: "Emergency responders have to juggle radios, maps, spreadsheets and more, which slows them down when minutes matter. This system brings everything together in one place.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to live map view' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load and render' },
            { type: 'screenshot', description: 'Capture hazard detection view' }
          ],
          visualTarget: "Hazard detection and mapping"
        },
        {
          id: "user-persona",
          title: "Target User Persona",
          duration: 15,
          description: "Show different user roles and access levels",
          narration: "This system is designed for Incident Commanders, Operations and Planning chiefs, dispatchers and field responders. Each role has tailored views and permissions.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to commander view' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll down to show more dashboard content' },
            { type: 'wait', duration: 1000, description: 'Let content settle' },
            { type: 'screenshot', description: 'Capture commander dashboard view' },
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch back to map view' },
            { type: 'wait', duration: 2000, description: 'Wait for map to load' },
            { type: 'screenshot', description: 'Capture responder view' }
          ],
          visualTarget: "Different user roles and views"
        },
        {
          id: "technical-architecture",
          title: "Technical Architecture & API Data Flow",
          duration: 30,
          description: "Show API data flow and system architecture",
          narration: "Under the hood, the front end uses React and Mapbox for a fast, 3-D map. The backend runs on Python/Flask with real-time data ingestion from multiple sources.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to dashboard' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll through dashboard sections' },
            { type: 'wait', duration: 2000, description: 'Show dashboard content' },
            { type: 'screenshot', description: 'Capture API architecture view' }
          ],
          visualTarget: "API data flow and system architecture"
        },
        {
          id: "detect-verify",
          title: "Detect & Verify",
          duration: 15,
          description: "Show satellite feed and risk scoring",
          narration: "A satellite feed shows a new fire. The system flags it and scores the risk using population data and weather conditions.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map view' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load and show hazards' },
            { type: 'screenshot', description: 'Capture hazard detection and verification' }
          ],
          visualTarget: "Hazard detection and risk scoring"
        },
        {
          id: "triage-risk",
          title: "Triage & Risk Scoring",
          duration: 10,
          description: "Show evacuation vs shelter decision",
          narration: "Looking at the risk and wind direction, I decide we should evacuate rather than shelter in place. The system calculates affected population and infrastructure.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to dashboard' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show risk assessment areas' },
            { type: 'wait', duration: 1000, description: 'Let content settle' },
            { type: 'screenshot', description: 'Capture risk assessment view' }
          ],
          visualTarget: "Risk assessment and decision making"
        },
        {
          id: "define-zones",
          title: "Define Zones",
          duration: 10,
          description: "Show evacuation zone drawing tool",
          narration: "With the drawing tool, I outline the evacuation zone and set its priority. This defines which buildings and roads are affected.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map view' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load' },
            { type: 'screenshot', description: 'Capture zone definition view' }
          ],
          visualTarget: "Evacuation zone drawing and definition"
        },
        {
          id: "plan-routes",
          title: "Plan Routes",
          duration: 20,
          description: "Show route planning with different profiles",
          narration: "I pick a route profile—civilian, EMS, fire tactical or police—each balancing safety and speed. The system calculates optimal routes avoiding hazards.",
          interactions: [
            { type: 'wait', duration: 2000, description: 'Show existing routes on map' },
            { type: 'screenshot', description: 'Capture route planning view' }
          ],
          visualTarget: "Route planning with different profiles"
        },
        {
          id: "assign-units",
          title: "Assign Units & Track Assets",
          duration: 10,
          description: "Show unit assignment and building status",
          narration: "I assign engines and medics. Dragging units onto the map updates their tasks and travel times. On the right, you can see building status—evacuated, in progress, refused or uncontacted.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to dashboard' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show unit assignment areas' },
            { type: 'wait', duration: 1000, description: 'Let content settle' },
            { type: 'screenshot', description: 'Capture unit assignment and building status' }
          ],
          visualTarget: "Unit assignment and building status tracking"
        },
        {
          id: "ai-support",
          title: "AI Support & Replan",
          duration: 20,
          description: "Show AIP assistant and alternative routes",
          narration: "If I have a question, I can ask the AIP assistant something like \"What happens if we lose Highway 30?\" and get alternative routes right away. When a new hazard or weather update comes in, the system automatically recalculates and loops back to zone definition.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map view' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load' },
            { type: 'screenshot', description: 'Capture AI assistant interface' }
          ],
          visualTarget: "AI assistant interface and alternative routes"
        },
        {
          id: "value-proposition",
          title: "Value Proposition & Impact",
          duration: 30,
          description: "Show asset management and benefits",
          narration: "This platform speeds up decisions, reduces staffing needed for manual data fusion, and gives every responder a common operating picture while keeping the Incident Commander firmly in control. By automating routine steps, it lets teams focus on actions that save lives and property.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to dashboard' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll through dashboard to show metrics' },
            { type: 'wait', duration: 2000, description: 'Show dashboard metrics' },
            { type: 'screenshot', description: 'Capture value proposition and impact metrics' }
          ],
          visualTarget: "Asset management dashboard and impact metrics"
        },
        {
          id: "foundry-integration",
          title: "Foundry Integration & AI Assistance",
          duration: 20,
          description: "Show Foundry data pipelines and ontology",
          narration: "Thanks to Foundry's data pipelines and ontology, I can ingest and fuse multiple feeds quickly. The AIP assistant is context-aware because it sits on top of that ontology, so it can recommend re-routing around a blocked highway or predict fire spread.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map view' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load' },
            { type: 'screenshot', description: 'Capture Foundry integration and data pipelines' }
          ],
          visualTarget: "Foundry integration and data pipelines"
        },
        {
          id: "conclusion",
          title: "Conclusion & Call to Action",
          duration: 20,
          description: "Final summary and call to action",
          narration: "To wrap up, this project shows how real-time data, AI assistance and a streamlined chain of command can modernize emergency response. I'd love to talk about piloting this with your teams.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to dashboard' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show conclusion area' },
            { type: 'wait', duration: 1000, description: 'Let content settle' },
            { type: 'screenshot', description: 'Capture conclusion and call to action' }
          ],
          visualTarget: "Navigation menu with CTA"
        }
      ],
      recording: {
        format: "webm",
        codec: "vp9",
        quality: "high",
        fps: 30,
        audio: true
      },
      tts: {
        provider: "say",
        voice: "Alex",
        rate: 175,
        pitch: 100
      }
    };
  }

  private ensureOutputDirs(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Playwright browser for realistic interactive presentation...');
    
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
          
        case 'scroll':
          // Scroll down to show more content
          await this.page.evaluate(() => {
            window.scrollBy(0, 300);
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
            path: path.join(this.outputDir, `realistic-${timestamp}.png`),
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

  async generateTTSAudio(beat: RealisticBeat): Promise<string | null> {
    const audioPath = path.join(this.audioDir, `${beat.id}.wav`);
    const aiffPath = path.join(this.audioDir, `${beat.id}.aiff`);
    
    try {
      console.log(`  🎤 Generating TTS for: ${beat.title}`);
      
      const tempTextFile = path.join(this.audioDir, `${beat.id}.txt`);
      fs.writeFileSync(tempTextFile, beat.narration);
      
      const command = `say -v ${this.config.tts.voice} -r ${this.config.tts.rate} -f "${tempTextFile}" -o "${aiffPath}"`;
      
      await execAsync(command);
      
      if (fs.existsSync(tempTextFile)) {
        fs.unlinkSync(tempTextFile);
      }
      
      if (fs.existsSync(aiffPath)) {
        console.log(`  ✅ TTS generated: ${aiffPath}`);
        
        try {
          const convertCommand = `ffmpeg -i "${aiffPath}" -acodec pcm_s16le -ar 44100 "${audioPath}" -y`;
          await execAsync(convertCommand);
          
          if (fs.existsSync(aiffPath)) {
            fs.unlinkSync(aiffPath);
          }
          
          if (fs.existsSync(audioPath)) {
            console.log(`  ✅ Converted to WAV: ${audioPath}`);
            return audioPath;
          }
        } catch (convertError) {
          console.log(`  ⚠️  Could not convert to WAV, keeping AIFF: ${aiffPath}`);
          return aiffPath;
        }
        
        return aiffPath;
      } else {
        console.error(`  ❌ TTS file not created: ${aiffPath}`);
        return null;
      }
      
    } catch (error) {
      console.error(`  ❌ TTS generation failed: ${error}`);
      return null;
    }
  }

  async recordBeat(beat: RealisticBeat): Promise<BeatResult> {
    console.log(`\n🎬 Recording realistic beat: ${beat.title} (${beat.duration}s)`);
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
      
      const audioPath = await this.generateTTSAudio(beat);
      if (audioPath) {
        result.audioPath = audioPath;
      }
      
      for (const interaction of beat.interactions) {
        const success = await this.executeInteraction(interaction);
        if (!success) {
          result.error = `Interaction failed: ${interaction.description}`;
          result.notes = `Failed at interaction: ${interaction.description}`;
          return result;
        }
      }
      
      const elapsed = Date.now() - startTime;
      const remainingWait = Math.max(0, (beat.duration * 1000) - elapsed);
      
      if (remainingWait > 0) {
        console.log(`  ⏳ Waiting ${remainingWait}ms to complete beat duration`);
        await this.page!.waitForTimeout(remainingWait);
      }
      
      result.success = true;
      result.actualDuration = (Date.now() - startTime) / 1000;
      result.notes = `Visual target: ${beat.visualTarget}`;
      
      console.log(`✅ Realistic beat completed successfully (${result.actualDuration.toFixed(1)}s)`);
      
    } catch (error) {
      result.error = `Realistic beat recording failed: ${error}`;
      console.error(`❌ Realistic beat failed: ${error}`);
    }
    
    return result;
  }

  async saveRecordedVideo(): Promise<void> {
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
      const targetPath = path.join(this.outputDir, 'disaster-response-realistic.mp4');
      
      try {
        const convertCommand = `ffmpeg -i "${sourcePath}" -c:v libx264 -preset fast -crf 23 "${targetPath}" -y`;
        await execAsync(convertCommand);
        
        fs.unlinkSync(sourcePath);
        
        console.log(`✅ Realistic video saved as: ${targetPath}`);
        
        const stats = fs.statSync(targetPath);
        const fileSize = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`📊 File size: ${fileSize} MB`);
        
      } catch (convertError) {
        console.log(`⚠️ Could not convert to MP4, keeping original: ${videoFile}`);
        const newPath = path.join(this.outputDir, 'disaster-response-realistic.webm');
        fs.renameSync(sourcePath, newPath);
        console.log(`✅ Realistic video saved as: ${newPath}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to save realistic video:', error);
    }
  }

  async generateReport(): Promise<void> {
    const reportPath = path.join(this.outputDir, 'realistic-presentation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      summary: {
        totalBeats: this.results.length,
        successfulBeats: this.results.filter(r => r.success).length,
        failedBeats: this.results.filter(r => !r.success).length,
        totalDuration: this.results.reduce((sum, r) => sum + (r.actualDuration || 0), 0),
        expectedDuration: this.config.beats.reduce((sum, beat) => sum + beat.duration, 0),
        audioFiles: this.results.filter(r => r.audioPath).length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Realistic Presentation Report');
    console.log('=' .repeat(40));
    console.log(`Total beats: ${report.summary.totalBeats}`);
    console.log(`Successful: ${report.summary.successfulBeats}`);
    console.log(`Failed: ${report.summary.failedBeats}`);
    console.log(`Success rate: ${((report.summary.successfulBeats / report.summary.totalBeats) * 100).toFixed(1)}%`);
    console.log(`Actual duration: ${report.summary.totalDuration.toFixed(1)}s`);
    console.log(`Expected duration: ${report.summary.expectedDuration}s`);
    console.log(`Audio files generated: ${report.summary.audioFiles}`);
    console.log(`Report saved to: ${reportPath}`);
    
    if (report.summary.failedBeats > 0) {
      console.log('\n❌ Failed beats:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.title}: ${result.error}`);
      });
    }
    
    console.log('\n🎬 Next Steps:');
    console.log('1. Review the recorded realistic video in the captures directory');
    console.log('2. Check the generated audio files in the audio directory');
    console.log('3. Use video editing software to combine video and audio');
    console.log('4. Add any additional graphics or overlays as needed');
  }

  async runRealisticPresentation(): Promise<void> {
    console.log('🎬 Starting Realistic Interactive Presentation Recording');
    console.log('=' .repeat(60));
    console.log(`📊 Total beats: ${this.config.beats.length}`);
    console.log(`🎯 Total duration: ${this.config.beats.reduce((sum, beat) => sum + beat.duration, 0)}s`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`🎤 Audio directory: ${this.audioDir}`);
    console.log(`🔊 TTS Provider: ${this.config.tts.provider} (${this.config.tts.voice})`);
    console.log('');

    try {
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      for (const beat of this.config.beats) {
        const result = await this.recordBeat(beat);
        this.results.push(result);
        
        if (!result.success) {
          console.log(`⚠️ Beat failed, but continuing with next beat...`);
        }
      }

      await this.generateReport();
      await this.saveRecordedVideo();

    } catch (error) {
      console.error('❌ Realistic presentation failed:', error);
    } finally {
      if (this.page) {
        console.log('🎬 Finalizing video recording...');
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Main execution
async function main() {
  const recorder = new RealisticInteractiveRecorder();
  await recorder.runRealisticPresentation();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RealisticInteractiveRecorder };
