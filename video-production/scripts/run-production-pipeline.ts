import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProductionConfig {
  app: {
    url: string;
    viewport: { width: number; height: number };
    waitForSelector: string;
    timeout: number;
  };
  recording: {
    format: string;
    codec: string;
    quality: string;
    fps: number;
    audio: boolean;
  };
  output: {
    directory: string;
    filename: string;
    cleanup: boolean;
  };
  monitoring: {
    enableLogging: boolean;
    saveScreenshots: boolean;
    performanceMetrics: boolean;
  };
}

class ProductionVideoPipeline {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: ProductionConfig;
  private startTime: number = 0;
  private pipelineStatus: 'idle' | 'running' | 'completed' | 'failed' = 'idle';
  private currentBeat: number = 0;
  private totalBeats: number = 0;
  private errorLog: string[] = [];
  private performanceMetrics: any = {};

  constructor() {
    this.config = this.loadProductionConfig();
    this.startTime = Date.now();
  }

  private loadProductionConfig(): ProductionConfig {
    const configPath = path.join(__dirname, '..', 'config.env');
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const envVars = configContent.split('\n').reduce((acc: any, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {});
      
      return {
        app: {
          url: envVars.APP_URL || 'http://localhost:3000',
          viewport: { width: 1920, height: 1080 },
          waitForSelector: envVars.WAIT_FOR_SELECTOR || '#root',
          timeout: parseInt(envVars.TIMEOUT) || 30000
        },
        recording: {
          format: envVars.RECORDING_FORMAT || 'webm',
          codec: envVars.RECORDING_CODEC || 'vp9',
          quality: envVars.RECORDING_QUALITY || 'high',
          fps: parseInt(envVars.RECORDING_FPS) || 30,
          audio: envVars.RECORDING_AUDIO === 'true'
        },
        output: {
          directory: envVars.OUTPUT_DIR || path.join(__dirname, '..', 'output'),
          filename: envVars.OUTPUT_FILENAME || 'production-demo-video',
          cleanup: envVars.CLEANUP === 'true'
        },
        monitoring: {
          enableLogging: envVars.ENABLE_LOGGING !== 'false',
          saveScreenshots: envVars.SAVE_SCREENSHOTS === 'true',
          performanceMetrics: envVars.PERFORMANCE_METRICS === 'true'
        }
      };
    }
    
    // Default configuration
    return {
      app: {
        url: 'http://localhost:3000',
        viewport: { width: 1920, height: 1080 },
        waitForSelector: '#root',
        timeout: 30000
      },
      recording: {
        format: 'webm',
        codec: 'vp9',
        quality: 'high',
        fps: 30,
        audio: false
      },
      output: {
        directory: path.join(__dirname, '..', 'output'),
        filename: 'production-demo-video',
        cleanup: true
      },
      monitoring: {
        enableLogging: true,
        saveScreenshots: false,
        performanceMetrics: true
      }
    };
  }

  async runProductionPipeline() {
    console.log('🚀 Starting Production Video Pipeline...');
    console.log('=' .repeat(60));
    
    try {
      this.pipelineStatus = 'running';
      this.logInfo('Pipeline started', { timestamp: new Date().toISOString() });
      
      // Pre-flight checks
      await this.performPreFlightChecks();
      
      // Initialize browser and recording
      await this.initializeProductionBrowser();
      
      // Execute the production timeline
      await this.executeProductionTimeline();
      
      // Generate final production video
      await this.generateProductionVideo();
      
      // Post-production tasks
      await this.performPostProductionTasks();
      
      this.pipelineStatus = 'completed';
      this.logInfo('Pipeline completed successfully', { 
        duration: Date.now() - this.startTime,
        status: 'success'
      });
      
      console.log('\n🎉 Production pipeline completed successfully!');
      await this.generateProductionReport();
      
    } catch (error) {
      this.pipelineStatus = 'failed';
      this.logError('Pipeline failed', error);
      console.error('\n❌ Production pipeline failed:', error);
      
      // Attempt recovery
      await this.attemptRecovery();
      
    } finally {
      await this.cleanup();
    }
  }

  private async performPreFlightChecks() {
    console.log('🔍 Performing pre-flight checks...');
    
    // Check required files
    const requiredFiles = [
      'record.config.json',
      'tts-cue-sheet.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    
    // Check output directory
    if (!fs.existsSync(this.config.output.directory)) {
      fs.mkdirSync(this.config.output.directory, { recursive: true });
    }
    
    // Check ffmpeg availability
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
    } catch (error) {
      throw new Error('FFmpeg not found. Please install FFmpeg to continue.');
    }
    
    // Check app accessibility
    try {
      const response = await fetch(this.config.app.url);
      if (!response.ok) {
        throw new Error(`App not accessible at ${this.config.app.url}`);
      }
    } catch (error) {
      throw new Error(`Cannot connect to app at ${this.config.app.url}`);
    }
    
    console.log('✅ Pre-flight checks passed');
  }

  private async initializeProductionBrowser() {
    console.log('🌐 Initializing production browser...');
    
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage({
      viewport: this.config.app.viewport,
      recordVideo: {
        dir: this.config.output.directory,
        size: this.config.app.viewport,
        fps: this.config.recording.fps
      }
    });
    
    // Set performance monitoring
    if (this.config.monitoring.performanceMetrics) {
      await this.page.addInitScript(() => {
        window.performance.mark('pipeline-start');
      });
    }
    
    console.log('✅ Production browser initialized');
  }

  private async executeProductionTimeline() {
    console.log('📹 Executing production timeline...');
    
    const recordConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'record.config.json'), 'utf8'));
    const ttsCueSheet = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tts-cue-sheet.json'), 'utf8'));
    
    this.totalBeats = recordConfig.beats.length;
    console.log(`🎬 Executing ${this.totalBeats} production beats...`);
    
    // Navigate to app first
    await this.page!.goto(this.config.app.url);
    await this.page!.waitForSelector(this.config.app.waitForSelector, { timeout: this.config.app.timeout });
    
    for (let i = 0; i < recordConfig.beats.length; i++) {
      this.currentBeat = i + 1;
      const beat = recordConfig.beats[i];
      const ttsCue = ttsCueSheet.beats.find((b: any) => b.id === beat.id);
      
      console.log(`🎬 Beat ${this.currentBeat}/${this.totalBeats}: ${beat.id} (${beat.duration}s)`);
      
      try {
        await this.executeProductionBeat(beat);
        
        // Wait for beat duration
        await this.page!.waitForTimeout(beat.duration * 1000);
        
        // Save screenshot if enabled
        if (this.config.monitoring.saveScreenshots) {
          const screenshotPath = path.join(this.config.output.directory, `beat-${beat.id}.png`);
          await this.page!.screenshot({ path: screenshotPath });
        }
        
        console.log(`✅ Beat ${beat.id} completed`);
        
      } catch (error) {
        this.logError(`Beat ${beat.id} failed`, error);
        console.error(`❌ Beat ${beat.id} failed:`, error);
        
        // Continue with next beat instead of failing entire pipeline
        continue;
      }
    }
  }

  private async executeProductionBeat(beat: any) {
    const beatStartTime = Date.now();
    
    for (const action of beat.actions) {
      try {
        await this.executeProductionAction(action);
        await this.page!.waitForTimeout(100); // Small delay between actions
      } catch (error) {
        this.logError(`Action failed: ${action}`, error);
        throw error;
      }
    }
    
    const beatDuration = Date.now() - beatStartTime;
    this.performanceMetrics[`beat-${beat.id}`] = beatDuration;
  }

  private async executeProductionAction(action: string) {
    // Enhanced action execution with better error handling
    if (action.startsWith('goto(')) {
      const url = action.match(/goto\(([^)]+)\)/)?.[1];
      if (url === 'APP_URL') {
        await this.page!.goto(this.config.app.url);
      }
    } else if (action.startsWith('waitForSelector(')) {
      const selector = action.match(/waitForSelector\(([^)]+)\)/)?.[1];
      if (selector) {
        await this.page!.waitForSelector(selector, { timeout: this.config.app.timeout });
      }
    } else if (action.startsWith('click(')) {
      const selector = action.match(/click\(([^)]+)\)/)?.[1];
      if (selector) {
        await this.page!.click(selector);
      }
    } else if (action.startsWith('wait(')) {
      const ms = parseInt(action.match(/wait\(([^)]+)\)/)?.[1] || '1000');
      await this.page!.waitForTimeout(ms);
    } else if (action.startsWith('mouseMove(')) {
      const coordsMatch = action.match(/mouseMove\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 2) {
          await this.page!.mouse.move(coords[0], coords[1]);
        }
      }
    } else if (action.startsWith('mouseClick(')) {
      const coordsMatch = action.match(/mouseClick\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 2) {
          await this.page!.mouse.click(coords[0], coords[1]);
        }
      }
    } else if (action.startsWith('mouseDrag(')) {
      const coordsMatch = action.match(/mouseDrag\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 4) {
          await this.page!.mouse.move(coords[0], coords[1]);
          await this.page!.mouse.down();
          await this.page!.mouse.move(coords[2], coords[3]);
          await this.page!.mouse.up();
        }
      }
    } else if (action.startsWith('wheel(')) {
      const delta = parseInt(action.match(/wheel\(([^)]+)\)/)?.[1] || '0');
      await this.page!.mouse.wheel(0, delta);
    } else if (action.startsWith('screenshot(')) {
      const pathMatch = action.match(/screenshot\(([^)]+)\)/)?.[1];
      if (pathMatch) {
        const screenshotPath = pathMatch.replace(/"/g, '');
        const fullPath = path.join(this.config.output.directory, screenshotPath);
        
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        await this.page!.screenshot({ path: fullPath });
      }
    } else if (action.startsWith('overlay(')) {
      // Handle overlay actions (simplified for production)
      await this.handleProductionOverlay(action);
    }
  }

  private async handleProductionOverlay(action: string) {
    // Simplified overlay handling for production
    const match = action.match(/overlay\(([^)]+)\)/);
    if (!match) return;

    const params = match[1].split(',');
    const overlayType = params[0];
    
    // Create a simple overlay element
    await this.page!.evaluate((type) => {
      const overlay = document.createElement('div');
      overlay.id = `overlay-${Date.now()}`;
      overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2rem;
        border-radius: 8px;
        font-size: 1.5rem;
        z-index: 10000;
        text-align: center;
      `;
      overlay.textContent = type;
      document.body.appendChild(overlay);
    }, overlayType);
    
    // Wait a bit for the overlay to be visible
    await this.page!.waitForTimeout(500);
  }

  private async generateProductionVideo() {
    console.log('🎬 Generating production video...');
    
    const videoFiles = fs.readdirSync(this.config.output.directory).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length === 0) {
      throw new Error('No video files found to process');
    }
    
    const inputFile = path.join(this.config.output.directory, videoFiles[0]);
    const outputPath = path.join(this.config.output.directory, `${this.config.output.filename}.mp4`);
    
    try {
      // High-quality production settings
      const ffmpegCommand = `ffmpeg -i "${inputFile}" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -movflags +faststart -pix_fmt yuv420p "${outputPath}"`;
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      console.log(`✅ Production video generated: ${outputPath}`);
      
      // Get video information
      const videoInfo = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${outputPath}"`, { encoding: 'utf8' });
      const info = JSON.parse(videoInfo);
      
      this.performanceMetrics.videoInfo = {
        duration: parseFloat(info.format.duration),
        size: parseInt(info.format.size),
        resolution: `${info.streams[0].width}x${info.streams[0].height}`,
        bitrate: parseInt(info.format.bit_rate)
      };
      
      // Clean up original webm file
      if (this.config.output.cleanup && fs.existsSync(inputFile)) {
        fs.unlinkSync(inputFile);
        console.log('🧹 Cleaned up original webm file');
      }
      
    } catch (error) {
      throw new Error(`Video generation failed: ${error}`);
    }
  }

  private async performPostProductionTasks() {
    console.log('🎭 Performing post-production tasks...');
    
    // Generate thumbnail
    const outputPath = path.join(this.config.output.directory, `${this.config.output.filename}.mp4`);
    const thumbnailPath = path.join(this.config.output.directory, `${this.config.output.filename}-thumbnail.jpg`);
    
    try {
      const thumbnailCommand = `ffmpeg -i "${outputPath}" -ss 00:00:10 -vframes 1 -q:v 2 "${thumbnailPath}"`;
      execSync(thumbnailCommand, { stdio: 'ignore' });
      console.log('✅ Thumbnail generated');
    } catch (error) {
      console.warn('⚠️ Thumbnail generation failed:', error);
    }
    
    // Validate final video
    try {
      const validateCommand = `ffprobe -v error "${outputPath}"`;
      execSync(validateCommand, { stdio: 'ignore' });
      console.log('✅ Video validation passed');
    } catch (error) {
      throw new Error('Video validation failed');
    }
  }

  private async attemptRecovery() {
    console.log('🔄 Attempting pipeline recovery...');
    
    try {
      // Try to save any partial recordings
      if (this.page) {
        const partialScreenshot = path.join(this.config.output.directory, 'recovery-screenshot.png');
        await this.page.screenshot({ path: partialScreenshot });
        console.log('📸 Recovery screenshot saved');
      }
      
      // Log recovery attempt
      this.logInfo('Recovery attempted', { 
        timestamp: new Date().toISOString(),
        errors: this.errorLog.length
      });
      
    } catch (error) {
      console.error('❌ Recovery failed:', error);
    }
  }

  private async generateProductionReport() {
    console.log('📊 Generating production report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      pipeline: {
        status: this.pipelineStatus,
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        totalBeats: this.totalBeats,
        completedBeats: this.currentBeat
      },
      configuration: this.config,
      performance: this.performanceMetrics,
      errors: this.errorLog,
      output: {
        directory: this.config.output.directory,
        files: fs.readdirSync(this.config.output.directory)
      }
    };
    
    const reportPath = path.join(this.config.output.directory, 'production-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Production report saved to: ${reportPath}`);
    
    // Print summary
    console.log('\n📋 Production Summary:');
    console.log(`   Status: ${this.pipelineStatus}`);
    console.log(`   Duration: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);
    console.log(`   Beats: ${this.currentBeat}/${this.totalBeats}`);
    console.log(`   Errors: ${this.errorLog.length}`);
    
    if (this.performanceMetrics.videoInfo) {
      const video = this.performanceMetrics.videoInfo;
      console.log(`   Video: ${video.duration.toFixed(1)}s, ${(video.size / 1024 / 1024).toFixed(1)} MB`);
    }
  }

  private logInfo(message: string, data?: any) {
    if (this.config.monitoring.enableLogging) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message,
        data
      };
      console.log(`ℹ️ ${message}`, data || '');
    }
  }

  private logError(message: string, error: any) {
    const errorMessage = error?.message || String(error);
    this.errorLog.push(`${message}: ${errorMessage}`);
    
    if (this.config.monitoring.enableLogging) {
      console.error(`❌ ${message}:`, error);
    }
  }

  private async cleanup() {
    console.log('🧹 Cleaning up production environment...');
    
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('✅ Production cleanup completed');
  }
}

// Run the production pipeline
const pipeline = new ProductionVideoPipeline();
pipeline.runProductionPipeline().catch(console.error);
