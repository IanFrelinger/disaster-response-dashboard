#!/usr/bin/env ts-node

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

interface LiveVideoSegment {
  name: string;
  description: string;
  duration: number;
  actions: VideoAction[];
  outputFile: string;
  technicalFocus: string;
  preActions?: VideoAction[];
  postActions?: VideoAction[];
}

interface VideoAction {
  type: 'click' | 'hover' | 'type' | 'scroll' | 'wait' | 'navigate' | 'custom' | 'keyboard';
  selector?: string;
  text?: string;
  x?: number;
  y?: number;
  delay?: number;
  description: string;
  customScript?: string;
  key?: string;
  modifiers?: string[];
}

class LiveVideoDemoGenerator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private projectRoot: string;
  private outputDir: string;
  private tempDir: string;
  private videoDir: string;
  private isRecording: boolean = false;
  private currentVideoPath: string = '';

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.outputDir = path.join(this.projectRoot, 'out');
    this.tempDir = path.join(this.projectRoot, 'temp');
    this.videoDir = path.join(this.projectRoot, 'temp', 'videos');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.outputDir, this.tempDir, this.videoDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Live Video Demo Generator...');
    
    this.browser = await chromium.launch({
      headless: false, // Keep visible for live demos
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    
    // Create context with video recording enabled
    this.context = await this.browser.newContext({
      recordVideo: {
        dir: this.videoDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Browser initialized with video recording enabled');
  }

  async startLiveDemo(url: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log(`🌐 Starting live demo at: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Live demo page loaded successfully');
    console.log('🎬 Ready to record live video interactions.');
  }

  async startVideoRecording(segment: LiveVideoSegment): Promise<void> {
    if (!this.context) throw new Error('Context not initialized');
    
    console.log(`🎥 Starting video recording for: ${segment.name}`);
    
    // Create a new page for this segment to get a fresh video recording
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the demo page
    await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(1000);
    
    this.isRecording = true;
    console.log(`✅ Video recording started for ${segment.name}`);
  }

  async stopVideoRecording(): Promise<string> {
    if (!this.page || !this.context) throw new Error('Page or context not initialized');
    
    this.isRecording = false;
    
    // Close the page to finalize the video recording
    await this.page.close();
    
    // Wait a moment for video file to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find the most recent video file
    const videoFiles = fs.readdirSync(this.videoDir)
      .filter(file => file.endsWith('.webm'))
      .map(file => ({ file, path: path.join(this.videoDir, file), mtime: fs.statSync(path.join(this.videoDir, file)).mtime }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    if (videoFiles.length === 0) {
      throw new Error('No video files found');
    }
    
    const latestVideo = videoFiles[0];
    console.log(`✅ Video recording stopped: ${latestVideo.file}`);
    
    return latestVideo.path;
  }

  async recordLiveVideoSegment(segment: LiveVideoSegment): Promise<void> {
    console.log(`🎬 Recording ${segment.name} (${segment.duration}s) - ${segment.technicalFocus}`);
    console.log(`📝 Actions: ${segment.actions.length} interactions planned`);
    
    try {
      // Start video recording
      await this.startVideoRecording(segment);
      
      // Execute pre-actions if any
      if (segment.preActions) {
        console.log('  🔧 Executing pre-actions...');
        for (const action of segment.preActions) {
          await this.executeVideoAction(action);
        }
      }
      
      // Execute main actions
      for (let i = 0; i < segment.actions.length; i++) {
        const action = segment.actions[i];
        await this.executeVideoAction(action, i + 1, segment.actions.length);
      }
      
      // Execute post-actions if any
      if (segment.postActions) {
        console.log('  🔧 Executing post-actions...');
        for (const action of segment.postActions) {
          await this.executeVideoAction(action);
        }
      }
      
      // Wait for any final animations or effects
      await this.page!.waitForTimeout(1000);
      
      // Stop video recording
      const videoPath = await this.stopVideoRecording();
      
      // Process the video to match the desired duration
      const outputPath = path.join(this.outputDir, segment.outputFile);
      await this.processVideoToDuration(videoPath, outputPath, segment.duration);
      
      console.log(`✅ ${segment.name} live video recorded: ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ Error recording ${segment.name}:`, error);
      throw error;
    }
  }

  async executeVideoAction(action: VideoAction, current?: number, total?: number): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    const prefix = current && total ? `  [${current}/${total}]` : '  ';
    console.log(`${prefix} ${action.type}: ${action.description}`);
    
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
          
        case 'keyboard':
          if (action.key) {
            if (action.modifiers && action.modifiers.length > 0) {
              await this.page.keyboard.press(`${action.modifiers.join('+')}+${action.key}`);
            } else {
              await this.page.keyboard.press(action.key);
            }
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

  async processVideoToDuration(inputPath: string, outputPath: string, targetDuration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`  🎬 Processing video: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
      
      const ffmpegArgs = [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-t', targetDuration.toString(),
        '-pix_fmt', 'yuv420p',
        '-y',
        outputPath
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: 'pipe' });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(`  ✅ Video processed successfully`);
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

  async generateLiveVideoDemo(): Promise<void> {
    const segments: LiveVideoSegment[] = [
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
      
      console.log('🎬 Starting Live Video Demo Generation...');
      console.log(`📊 Total segments: ${segments.length}`);
      console.log(`⏱️  Total duration: ${segments.reduce((sum, s) => sum + s.duration, 0)} seconds`);
      console.log('');
      
      // Start with live website
      await this.startLiveDemo('http://localhost:3000'); // Adjust URL as needed
      
      for (const segment of segments) {
        await this.recordLiveVideoSegment(segment);
      }
      
      console.log('');
      console.log('🎉 All live video demo segments generated successfully!');
      
    } catch (error) {
      console.error('❌ Error generating live video demos:', error);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Main execution
async function main() {
  const generator = new LiveVideoDemoGenerator();
  await generator.generateLiveVideoDemo();
}

// Run main function
main().catch(console.error);
