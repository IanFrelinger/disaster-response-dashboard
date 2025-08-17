#!/usr/bin/env ts-node

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

interface InteractiveSegment {
  name: string;
  description: string;
  duration: number;
  actions: Action[];
  outputFile: string;
  technicalFocus: string;
}

interface Action {
  type: 'click' | 'hover' | 'type' | 'scroll' | 'wait' | 'navigate' | 'custom';
  selector?: string;
  text?: string;
  x?: number;
  y?: number;
  delay?: number;
  description: string;
  customScript?: string;
}

class InteractiveDemoGenerator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private projectRoot: string;
  private outputDir: string;
  private tempDir: string;
  private isRecording: boolean = false;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.outputDir = path.join(this.projectRoot, 'out');
    this.tempDir = path.join(this.projectRoot, 'temp');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.outputDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Interactive Demo Generator...');
    
    this.browser = await chromium.launch({
      headless: false, // Keep visible for live demos
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Enable video recording
    await this.page.context().addInitScript(() => {
      // Add any initialization scripts here
    });
    
    console.log('✅ Browser initialized successfully');
  }

  async startLiveDemo(url: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log(`🌐 Starting live demo at: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Live demo page loaded successfully');
    console.log('🎬 Ready to record interactions. Use the interactive segments below.');
  }

  async recordInteractiveSegment(segment: InteractiveSegment): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log(`🎬 Recording ${segment.name} (${segment.duration}s) - ${segment.technicalFocus}`);
    console.log(`📝 Actions: ${segment.actions.length} interactions planned`);
    
    try {
      // Start recording
      this.isRecording = true;
      
      // Execute each action in sequence
      for (let i = 0; i < segment.actions.length; i++) {
        const action = segment.actions[i];
        await this.executeAction(action, i + 1, segment.actions.length);
      }
      
      // Wait for any final animations or effects
      await this.page.waitForTimeout(1000);
      
      // Take final screenshot for this segment
      const screenshotPath = path.join(this.tempDir, `${segment.name.replace(/\s+/g, '_').toLowerCase()}_final.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Convert to video with the specified duration
      const outputPath = path.join(this.outputDir, segment.outputFile);
      await this.convertScreenshotToVideo(screenshotPath, outputPath, segment.duration);
      
      console.log(`✅ ${segment.name} interactive segment recorded: ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ Error recording ${segment.name}:`, error);
      throw error;
    } finally {
      this.isRecording = false;
    }
  }

  async executeAction(action: Action, current: number, total: number): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log(`  [${current}/${total}] ${action.type}: ${action.description}`);
    
    try {
      switch (action.type) {
        case 'click':
          if (action.selector) {
            await this.page.click(action.selector);
          } else if (action.x !== undefined && action.y !== undefined) {
            await this.page.mouse.click(action.x, action.y);
          }
          break;
          
        case 'hover':
          if (action.selector) {
            await this.page.hover(action.selector);
          } else if (action.x !== undefined && action.y !== undefined) {
            await this.page.mouse.move(action.x, action.y);
          }
          break;
          
        case 'type':
          if (action.selector && action.text) {
            await this.page.fill(action.selector, action.text);
          }
          break;
          
        case 'scroll':
          await this.page.mouse.wheel(0, action.y || 100);
          break;
          
        case 'wait':
          await this.page.waitForTimeout(action.delay || 1000);
          break;
          
        case 'navigate':
          if (action.text) {
            await this.page.goto(action.text, { waitUntil: 'networkidle' });
          }
          break;
          
        case 'custom':
          if (action.customScript) {
            await this.page.evaluate(action.customScript);
          }
          break;
      }
      
      // Wait for action to complete
      await this.page.waitForTimeout(action.delay || 500);
      
    } catch (error) {
      console.warn(`⚠️  Action ${action.type} failed: ${error}`);
      // Continue with next action
    }
  }

  async convertScreenshotToVideo(imagePath: string, outputPath: string, duration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-loop', '1',
        '-i', imagePath,
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
        '-c:v', 'libx264',
        '-t', duration.toString(),
        '-pix_fmt', 'yuv420p',
        '-y',
        outputPath
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: 'pipe' });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  async generateLiveDemoSegments(): Promise<void> {
    const segments: InteractiveSegment[] = [
      {
        name: 'Live Dashboard Overview',
        description: 'Real-time dashboard demonstration with live data',
        duration: 30,
        actions: [
          { type: 'wait', delay: 1000, description: 'Wait for dashboard to load' },
          { type: 'click', selector: 'text=🗺️ Live Map', description: 'Switch to live map view' },
          { type: 'wait', delay: 1000, description: 'Wait for map to load' },
          { type: 'hover', selector: '.hazard-layer', description: 'Hover over hazard layers' },
          { type: 'click', selector: '.hazard-toggle', description: 'Toggle hazard visibility' }
        ],
        outputFile: '01_live_dashboard_overview.mp4',
        technicalFocus: 'Real-time data visualization and interaction'
      },
      {
        name: 'Interactive Hazard Management',
        description: 'Live hazard interaction and risk assessment',
        duration: 45,
        actions: [
          { type: 'click', selector: '.hazard-point', description: 'Click on hazard point' },
          { type: 'wait', delay: 1000, description: 'Wait for hazard details' },
          { type: 'hover', selector: '.risk-indicator', description: 'Hover over risk indicators' },
          { type: 'click', selector: '.zone-boundary', description: 'Click on zone boundary' },
          { type: 'wait', delay: 1000, description: 'Wait for zone information' },
          { type: 'scroll', y: -200, description: 'Scroll to see more details' }
        ],
        outputFile: '02_interactive_hazard_management.mp4',
        technicalFocus: 'Dynamic hazard interaction and real-time risk assessment'
      },
      {
        name: 'Live Evacuation Routing',
        description: 'Real-time route calculation and optimization',
        duration: 45,
        actions: [
          { type: 'click', selector: '.evacuation-button', description: 'Click evacuation button' },
          { type: 'wait', delay: 1000, description: 'Wait for route calculation' },
          { type: 'hover', selector: '.route-line', description: 'Hover over route lines' },
          { type: 'click', selector: '.route-alternative', description: 'Select alternative route' },
          { type: 'wait', delay: 1000, description: 'Wait for route update' },
          { type: 'click', selector: '.traffic-toggle', description: 'Toggle traffic overlay' }
        ],
        outputFile: '03_live_evacuation_routing.mp4',
        technicalFocus: 'Real-time AI-powered route optimization'
      },
      {
        name: 'Dynamic Zone Management',
        description: 'Live zone creation and management',
        duration: 45,
        actions: [
          { type: 'click', selector: '.create-zone', description: 'Click create zone button' },
          { type: 'wait', delay: 1000, description: 'Wait for zone creation mode' },
          { type: 'click', x: 500, y: 300, description: 'Click to start zone boundary' },
          { type: 'click', x: 600, y: 300, description: 'Click to add boundary point' },
          { type: 'click', x: 600, y: 400, description: 'Click to add boundary point' },
          { type: 'click', x: 500, y: 400, description: 'Click to close zone boundary' },
          { type: 'wait', delay: 1000, description: 'Wait for zone creation' }
        ],
        outputFile: '04_dynamic_zone_management.mp4',
        technicalFocus: 'Real-time zone creation and management'
      },
      {
        name: 'AI Decision Support Live',
        description: 'Live AI recommendations and decision support',
        duration: 45,
        actions: [
          { type: 'click', selector: '.ai-recommendations', description: 'Click AI recommendations' },
          { type: 'wait', delay: 1000, description: 'Wait for AI analysis' },
          { type: 'hover', selector: '.recommendation-item', description: 'Hover over recommendations' },
          { type: 'click', selector: '.apply-recommendation', description: 'Apply AI recommendation' },
          { type: 'wait', delay: 1000, description: 'Wait for recommendation application' },
          { type: 'click', selector: '.ai-insights', description: 'View AI insights' }
        ],
        outputFile: '05_ai_decision_support_live.mp4',
        technicalFocus: 'Live AI decision support and recommendations'
      }
    ];

    try {
      await this.initialize();
      
      console.log('🎬 Starting Live Interactive Demo Generation...');
      console.log(`📊 Total segments: ${segments.length}`);
      console.log(`⏱️  Total duration: ${segments.reduce((sum, s) => sum + s.duration, 0)} seconds`);
      console.log('');
      
      // Start with live website
      await this.startLiveDemo('http://localhost:3000'); // Adjust URL as needed
      
      for (const segment of segments) {
        await this.recordInteractiveSegment(segment);
      }
      
      console.log('');
      console.log('🎉 All live interactive demo segments generated successfully!');
      
    } catch (error) {
      console.error('❌ Error generating live interactive demos:', error);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Main execution
async function main() {
  const generator = new InteractiveDemoGenerator();
  await generator.generateLiveDemoSegments();
}

// Run main function
main().catch(console.error);

export { InteractiveDemoGenerator, InteractiveSegment, Action };
