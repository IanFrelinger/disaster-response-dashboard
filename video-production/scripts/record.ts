#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import pkg from 'fs-extra';
const { readFile, ensureDirSync, writeFileSync, existsSync, statSync } = pkg;
import * as path from 'path';
import * as yaml from 'yaml';

interface RecordConfig {
  app: {
    url: string;
    viewport: {
      width: number;
      height: number;
    };
    waitForSelector: string;
    timeout: number;
  };
  beats: Array<{
    id: string;
    title: string;
    duration: number;
    actions: string[];
  }>;
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
  filePath?: string;
  error?: string;
  actualDuration?: number;
}

class VideoRecorder {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: RecordConfig | null = null;
  private outputDir: string = 'captures';
  private criticalErrors: string[] = [];

  constructor(private configPath: string) {
    this.ensureOutputDir();
  }

  private async loadConfig(configPath: string): Promise<RecordConfig> {
    try {
      const configContent = await readFile(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to load config: ${error}`);
    }
  }

  private ensureOutputDir(): void {
    ensureDirSync(this.outputDir);
  }

  private addCriticalError(error: string): void {
    this.criticalErrors.push(error);
    console.error(`🚨 CRITICAL ERROR: ${error}`);
  }

  private hasCriticalErrors(): boolean {
    return this.criticalErrors.length > 0;
  }

  private async validateEnvironment(): Promise<boolean> {
    console.log('🔍 Validating environment...');
    
    try {
      // Check if output directory is writable
      const testFile = path.join(this.outputDir, '.test-write');
      writeFileSync(testFile, 'test');
      if (existsSync(testFile)) {
        // Clean up test file
        const fs = await import('fs');
        fs.unlinkSync(testFile);
      }
      
      // Check if config is valid
      if (!this.config) {
        this.addCriticalError('Configuration not loaded');
        return false;
      }
      
      if (!this.config.app?.url) {
        this.addCriticalError('Invalid app URL in configuration');
        return false;
      }
      
      if (!this.config.beats || this.config.beats.length === 0) {
        this.addCriticalError('No beats defined in configuration');
        return false;
      }
      
      console.log('✅ Environment validation passed');
      return true;
      
    } catch (error) {
      this.addCriticalError(`Environment validation failed: ${error}`);
      return false;
    }
  }

  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Playwright browser...');
    
    try {
      // Load config if not already loaded
      if (!this.config) {
        this.config = await this.loadConfig(this.configPath);
      }
      
      // Validate environment before proceeding
      if (!(await this.validateEnvironment())) {
        return false;
      }
      
      this.browser = await chromium.launch({
        headless: true,
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
      
      // Set default timeout
      this.page.setDefaultTimeout(this.config.app.timeout);
      
      console.log('✅ Browser initialized successfully');
      return true;
      
    } catch (error) {
      this.addCriticalError(`Failed to initialize browser: ${error}`);
      return false;
    }
  }

  async navigateToApp(): Promise<boolean> {
    if (!this.page) {
      this.addCriticalError('Page not initialized');
      return false;
    }
    
    // Use environment variable for frontend URL if available, otherwise use config
    const frontendUrl = process.env.HOST_FRONTEND_URL || this.config.app.url;
    console.log(`🌐 Navigating to: ${frontendUrl}`);
    
    try {
      await this.page.goto(frontendUrl, { waitUntil: 'networkidle' });
      
      // Wait for the specified selector
      if (this.config.app.waitForSelector) {
        console.log(`⏳ Waiting for selector: ${this.config.app.waitForSelector}`);
        await this.page.waitForSelector(this.config.app.waitForSelector);
      }
      
      // Wait a bit for the page to fully load
      await this.page.waitForTimeout(2000);
      
      console.log('✅ App loaded successfully');
      return true;
      
    } catch (error) {
      this.addCriticalError(`Failed to navigate to app: ${error}`);
      return false;
    }
  }

  private async executeAction(action: string): Promise<boolean> {
    if (!this.page) {
      this.addCriticalError('Page not initialized during action execution');
      return false;
    }
    
    try {
      if (action.startsWith('waitForSelector(')) {
        const selector = action.slice(16, -1); // Remove 'waitForSelector(' and ')'
        await this.page.waitForSelector(selector);
        console.log(`  ✅ Waited for selector: ${selector}`);
        
      } else if (action.startsWith('click(')) {
        const selector = action.slice(6, -1); // Remove 'click(' and ')'
        await this.page.click(selector);
        console.log(`  ✅ Clicked: ${selector}`);
        
      } else if (action.startsWith('selectOption(')) {
        const parts = action.slice(12, -1).split(', ');
        const selector = parts[0].slice(1, -1); // Remove quotes
        const value = parts[1].slice(1, -1); // Remove quotes
        await this.page.selectOption(selector, value);
        console.log(`  ✅ Selected option: ${value} in ${selector}`);
        
      } else if (action.startsWith('wait(')) {
        const ms = parseInt(action.slice(5, -1));
        await this.page.waitForTimeout(ms);
        console.log(`  ✅ Waited: ${ms}ms`);
        
      } else {
        console.log(`  ⚠️  Unknown action: ${action}`);
      }
      
      return true;
      
    } catch (error) {
      console.log(`  ❌ Action failed: ${action} - ${error}`);
      this.addCriticalError(`Action execution failed: ${action} - ${error}`);
      return false;
    }
  }

  async recordBeat(beat: any): Promise<BeatResult> {
    if (!this.page || !this.context) {
      const error = 'Browser not initialized';
      this.addCriticalError(error);
      return {
        id: beat.id,
        title: beat.title,
        duration: beat.duration,
        success: false,
        error: error
      };
    }
    
    console.log(`\n🎬 Recording beat: ${beat.title} (${beat.duration}s)`);
    
    try {
      // Start recording
      const videoPath = path.join(this.outputDir, `${beat.id}.webm`);
      
      // Execute actions before recording
      if (beat.actions && beat.actions.length > 0) {
        console.log('  🔧 Executing actions...');
        for (const action of beat.actions) {
          const actionSuccess = await this.executeAction(action);
          if (!actionSuccess) {
            // If any action fails, mark this beat as failed
            return {
              id: beat.id,
              title: beat.title,
              duration: beat.duration,
              success: false,
              error: `Action execution failed: ${action}`
            };
          }
        }
      }
      
      // Wait for actions to complete
      await this.page.waitForTimeout(1000);
      
      // Start recording
      console.log('  📹 Starting recording...');
      await this.page.evaluate(() => {
        // Add any page-specific recording logic here
        console.log('Recording started');
      });
      
      // Record for the specified duration
      await this.page.waitForTimeout(beat.duration * 1000);
      
      // Stop recording
      console.log('  ⏹️  Stopping recording...');
      await this.page.evaluate(() => {
        console.log('Recording stopped');
      });
      
      // Wait for video file to be written
      await this.page.waitForTimeout(2000);
      
      // Check if video file was created
      if (existsSync(videoPath)) {
        const stats = statSync(videoPath);
        const fileSize = (stats.size / 1024 / 1024).toFixed(2);
        
        // Validate file size (should be reasonable for the duration)
        const expectedMinSize = 0.1; // 100KB minimum
        if (stats.size < expectedMinSize * 1024 * 1024) {
          this.addCriticalError(`Video file too small: ${fileSize} MB for ${beat.duration}s duration`);
          return {
            id: beat.id,
            title: beat.title,
            duration: beat.duration,
            success: false,
            error: `Video file too small: ${fileSize} MB`
          };
        }
        
        console.log(`  ✅ Recording saved: ${videoPath} (${fileSize} MB)`);
        
        return {
          id: beat.id,
          title: beat.title,
          duration: beat.duration,
          success: true,
          filePath: videoPath,
          actualDuration: beat.duration
        };
        
      } else {
        this.addCriticalError(`Video file not created for beat: ${beat.id}`);
        throw new Error('Video file not created');
      }
      
    } catch (error) {
      console.log(`  ❌ Recording failed: ${error}`);
      this.addCriticalError(`Beat recording failed: ${beat.id} - ${error}`);
      
      return {
        id: beat.id,
        title: beat.title,
        duration: beat.duration,
        success: false,
        error: error.message
      };
    }
  }

  async recordAllBeats(): Promise<BeatResult[]> {
    console.log(`\n🎥 Starting recording of ${this.config.beats.length} beats...`);
    
    const results: BeatResult[] = [];
    
    for (const beat of this.config.beats) {
      try {
        const result = await this.recordBeat(beat);
        results.push(result);
        
        // Check for critical errors after each beat
        if (this.hasCriticalErrors()) {
          console.log(`🚨 Critical errors detected after beat ${beat.id}. Stopping recording.`);
          break;
        }
        
        // Small delay between beats
        await this.page?.waitForTimeout(1000);
        
      } catch (error) {
        console.log(`❌ Failed to record beat ${beat.id}: ${error}`);
        this.addCriticalError(`Beat recording exception: ${beat.id} - ${error}`);
        
        results.push({
          id: beat.id,
          title: beat.title,
          duration: beat.duration,
          success: false,
          error: error.message
        });
        
        // Stop recording on critical errors
        if (this.hasCriticalErrors()) {
          break;
        }
      }
    }
    
    return results;
  }

  async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up...');
    
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
      
      console.log('✅ Cleanup completed');
      
    } catch (error) {
      console.log(`⚠️  Cleanup warning: ${error}`);
    }
  }

  async run(): Promise<boolean> {
    try {
      // Initialize browser
      if (!(await this.initialize())) {
        console.error('❌ Failed to initialize browser');
        return false;
      }
      
      // Navigate to app
      if (!(await this.navigateToApp())) {
        console.error('❌ Failed to navigate to app');
        return false;
      }
      
      const results = await this.recordAllBeats();
      
      // Summary
      const successful = results.filter(r => r.success).length;
      const total = results.length;
      
      console.log('\n📊 Recording Summary:');
      console.log(`✅ Successful: ${successful}/${total}`);
      console.log(`📁 Output directory: ${this.outputDir}`);
      
      // Save results
      const resultsPath = path.join('out', 'recording-results.json');
      ensureDirSync('out');
      
      writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalBeats: total,
        successful: successful,
        criticalErrors: this.criticalErrors,
        results: results
      }, null, 2));
      
      console.log(`📋 Results saved to: ${resultsPath}`);
      
      // Check for critical errors
      if (this.hasCriticalErrors()) {
        console.log('\n🚨 CRITICAL ERRORS DETECTED:');
        this.criticalErrors.forEach(error => console.log(`  - ${error}`));
        console.log('\n❌ Recording failed due to critical errors. Exiting.');
        return false;
      }
      
      if (successful === total) {
        console.log('\n🎉 All beats recorded successfully!');
        console.log('Next step: Run "npm run assemble" to create the video');
        return true;
      } else {
        console.log('\n⚠️  Some beats failed to record. Check the results for details.');
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Recording failed: ${error}`);
      this.addCriticalError(`Unexpected error: ${error}`);
      return false;
      
    } finally {
      await this.cleanup();
    }
  }
}

async function main(): Promise<void> {
  const configPath = 'record.config.json';
  
  if (!existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    process.exit(1);
  }
  
  try {
    const recorder = new VideoRecorder(configPath);
    const success = await recorder.run();
    
    if (!success) {
      console.error('❌ Recording completed with errors. Exiting with failure code.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Recording failed: ${error}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { VideoRecorder };
