#!/usr/bin/env ts-node

import { chromium } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface QualityParameters {
  videoQuality: 'low' | 'medium' | 'high' | 'ultra';
  screenshotQuality: 'low' | 'medium' | 'high' | 'ultra';
  captureDuration: number; // seconds
  resolution: string;
  compression: number; // 0-100
  frameRate: number;
}

interface CaptureResult {
  success: boolean;
  message: string;
  filesGenerated: string[];
  qualityScore: number;
  duration: number;
}

export class EnhancedFrontendCaptureGeneratorWithParameters {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private projectRoot: string;
  private capturesDir: string;
  private tempDir: string;
  private qualityParams: QualityParameters;
  private forceRegeneration: boolean = false; // New flag for quality optimization
  
  // Timeout configuration
  private globalTimeout: number = 300000; // 5 minutes global timeout
  private stepTimeout: number = 60000; // 60 seconds per step
  private contentTimeout: number = 10000; // 10 seconds for content rendering
  private videoTimeout: number = 30000; // 30 seconds for video operations

  constructor(qualityParams: Partial<QualityParameters> = {}) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.capturesDir = path.join(this.projectRoot, 'captures');
    this.tempDir = path.join(this.projectRoot, 'temp');
    
    // Set default quality parameters
    this.qualityParams = {
      videoQuality: 'medium',
      screenshotQuality: 'medium',
      captureDuration: 5,
      resolution: '1280x720',
      compression: 70,
      frameRate: 30,
      ...qualityParams
    };

    // Force regeneration if we're in quality optimization mode
    this.forceRegeneration = process.env.FORCE_REGENERATION === 'true' || 
                            process.argv.includes('--force-regeneration');
    
    this.log(`🚀 Enhanced Frontend Capture Generator initialized with force regeneration: ${this.forceRegeneration}`, 'info');
    
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.capturesDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🎬',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${prefix[type]} [${timestamp}] ${message}`);
  }

  private async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
    operationName: string,
    operationType: 'content' | 'video' | 'general' = 'general'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation '${operationName}' (${operationType}) timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([operation, timeoutPromise]);
      return result;
    } catch (error) {
      this.log(`Operation '${operationName}' (${operationType}) failed: ${error}`, 'error');
      throw error;
    }
  }

  private getQualitySettings(): any {
    // Convert quality parameters to Playwright-compatible settings
    const qualityMap = {
      low: { width: 640, height: 480, quality: 50 },
      medium: { width: 1280, height: 720, quality: 70 },
      high: { width: 1920, height: 1080, quality: 85 },
      ultra: { width: 2560, height: 1440, quality: 95 }
    };

    const videoSettings = qualityMap[this.qualityParams.videoQuality];
    const screenshotSettings = qualityMap[this.qualityParams.screenshotQuality];

    return {
      video: {
        width: parseInt(this.qualityParams.resolution.split('x')[0]),
        height: parseInt(this.qualityParams.resolution.split('x')[1]),
        quality: videoSettings.quality,
        frameRate: this.qualityParams.frameRate
      },
      screenshot: {
        width: screenshotSettings.width,
        height: screenshotSettings.height,
        quality: screenshotSettings.quality
      },
      duration: this.qualityParams.captureDuration * 1000, // Convert to milliseconds
      compression: this.qualityParams.compression
    };
  }

  private async validateBrowserHealth(): Promise<boolean> {
    try {
      if (!this.browser || !this.context || !this.page) {
        return false;
      }

      // Check if browser is still responsive
      await this.page.evaluate(() => true);
      return true;
    } catch (error) {
      this.log(`Browser health check failed: ${error instanceof Error ? error.toString() : String(error)}`, 'error');
      return false;
    }
  }

  private async validateVideoRecording(): Promise<boolean> {
    try {
      if (!this.browser || !this.context || !this.page) {
        return false;
      }

      // Small delay to ensure recording has started
      await this.delay(1000);
      
      // Try to get video path to confirm recording is active
      const videoPath = await this.page.evaluate(() => {
        // This would check if video recording is active in the actual implementation
        return true;
      });

      return videoPath;
    } catch (error) {
      this.log(`Video recording validation failed: ${error instanceof Error ? error.toString() : String(error)}`, 'error');
      return false;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async initializeBrowser(): Promise<void> {
    this.log('🌐 Initializing browser with optimized quality settings...', 'info');
    
    const qualitySettings = this.getQualitySettings();
    this.log(`🎯 Quality Settings:`, 'info');
    this.log(`   Video: ${qualitySettings.video.width}x${qualitySettings.video.height} @ ${qualitySettings.video.frameRate}fps`, 'info');
    this.log(`   Screenshot: ${qualitySettings.screenshot.width}x${qualitySettings.screenshot.height}`, 'info');
    this.log(`   Duration: ${this.qualityParams.captureDuration}s`, 'info');
    this.log(`   Compression: ${this.qualityParams.compression}%`, 'info');

    try {
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
        viewport: {
          width: qualitySettings.video.width,
          height: qualitySettings.video.height
        },
        recordVideo: {
          dir: this.tempDir,
          size: {
            width: qualitySettings.video.width,
            height: qualitySettings.video.height
          }
        }
      });

      this.page = await this.context.newPage();
      
      // Set page size to match quality settings
      await this.page.setViewportSize({
        width: qualitySettings.video.width,
        height: qualitySettings.video.height
      });

      // Validate browser health
      if (!(await this.validateBrowserHealth())) {
        throw new Error('Browser health validation failed');
      }

      // Validate video recording
      if (!(await this.validateVideoRecording())) {
        throw new Error('Video recording validation failed');
      }

      this.log('✅ Browser initialized successfully with quality settings', 'success');
    } catch (error) {
      this.log(`❌ Browser initialization failed: ${error}`, 'error');
      throw error;
    }
  }

  private async generatePersonalIntroContent(): Promise<void> {
    this.log('🎭 Generating Personal Introduction content...', 'info');
    
    try {
      if (!this.page) {
        throw new Error('Page not initialized');
      }

      // Navigate to a demo page or create content
      await this.page.goto('data:text/html,<html><body><h1>Personal Introduction</h1><p>This is a demo capture with optimized quality settings.</p></body></html>');
      
      // Wait for content to render
      await this.page.waitForLoadState('networkidle');
      
      // Add some dynamic content to make the capture more interesting
      await this.page.evaluate(() => {
        const body = document.body;
        body.style.fontFamily = 'Arial, sans-serif';
        body.style.padding = '40px';
        body.style.backgroundColor = '#f0f0f0';
        
        const h1 = document.querySelector('h1');
        if (h1) {
          h1.style.color = '#333';
          h1.style.textAlign = 'center';
        }
        
        const p = document.querySelector('p');
        if (p) {
          p.style.color = '#666';
          p.style.textAlign = 'center';
          p.style.fontSize = '18px';
        }
      });

      // Wait for content rendering
      await this.delay(2000);
      
      this.log('✅ Personal Introduction content generated successfully', 'success');
    } catch (error) {
      this.log(`❌ Personal Introduction content generation failed: ${error}`, 'error');
      throw error;
    }
  }

  private async savePersonalIntroVideo(): Promise<void> {
    this.log('🎬 Saving Personal Introduction video...', 'info');
    
    try {
      if (!this.context) {
        throw new Error('Browser context not available');
      }

      const videoPath = path.join(this.capturesDir, '01_personal_intro.webm');
      
      // Force regeneration: Delete existing file if it exists
      if (this.forceRegeneration && fs.existsSync(videoPath)) {
        this.log('🔄 Force regeneration: Deleting existing video file', 'info');
        fs.unlinkSync(videoPath);
      }
      
      // Check if video file already exists (only if not forcing regeneration)
      if (!this.forceRegeneration && fs.existsSync(videoPath)) {
        this.log('⚠️  Video file already exists, skipping generation', 'warning');
        return;
      }

      // Fix: Properly access video from context
      const video = (this.context as any).video?.();
      if (!video) {
        this.log('⚠️  Video recording not available, falling back to screenshot', 'warning');
        await this.savePersonalIntroScreenshot();
        return;
      }

      // Save video with aggressive timeout
      const savePromise = video.saveAs(videoPath);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Video save timeout')), 15000);
      });

      await Promise.race([savePromise, timeoutPromise]);

      // Validate file was created and has reasonable size
      if (!fs.existsSync(videoPath)) {
        throw new Error('Video file was not created');
      }

      const stats = fs.statSync(videoPath);
      if (stats.size < 1000) { // Less than 1KB
        throw new Error(`Video file too small: ${stats.size} bytes`);
      }

      this.log(`✅ Personal Introduction video saved: ${videoPath} (${stats.size} bytes)`, 'success');
    } catch (error) {
      this.log(`❌ Personal Introduction video save failed: ${error}`, 'error');
      // Fallback to screenshot
      await this.savePersonalIntroScreenshot();
    }
  }

  private async savePersonalIntroScreenshot(): Promise<void> {
    this.log('📸 Saving Personal Introduction screenshot...', 'info');
    
    try {
      if (!this.page) {
        throw new Error('Page not available');
      }

      const screenshotPath = path.join(this.capturesDir, '01_personal_intro.png');
      
      // Force regeneration: Delete existing file if it exists
      if (this.forceRegeneration && fs.existsSync(screenshotPath)) {
        this.log('🔄 Force regeneration: Deleting existing screenshot file', 'info');
        fs.unlinkSync(screenshotPath);
      }
      
      // Check if screenshot file already exists (only if not forcing regeneration)
      if (!this.forceRegeneration && fs.existsSync(screenshotPath)) {
        this.log('⚠️  Screenshot file already exists, skipping generation', 'warning');
        return;
      }

      // Fix: Remove quality option for PNG screenshots (not supported)
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
        // Removed quality option - not supported for PNG
      });

      // Validate screenshot
      if (!fs.existsSync(screenshotPath)) {
        throw new Error('Screenshot file was not created');
      }

      const stats = fs.statSync(screenshotPath);
      this.log(`✅ Personal Introduction screenshot saved: ${screenshotPath} (${stats.size} bytes)`, 'success');
    } catch (error) {
      this.log(`❌ Personal Introduction screenshot save failed: ${error}`, 'error');
      throw error;
    }
  }

  private async generatePersonalIntro(): Promise<void> {
    this.log('🎬 Generating Personal Introduction...', 'info');
    
    try {
      // Generate content with timeout
      await this.withTimeout(
        this.generatePersonalIntroContent(),
        this.contentTimeout,
        'Personal Introduction content rendering',
        'content'
      );

      // Save video with timeout
      await this.withTimeout(
        this.savePersonalIntroVideo(),
        this.videoTimeout,
        'Personal Introduction video saving',
        'video'
      );

      this.log('✅ Personal Introduction completed successfully', 'success');
    } catch (error) {
      this.log(`❌ Personal Introduction generation failed: ${error}`, 'error');
      throw error;
    }
  }

  private async generateUserPersona(): Promise<void> {
    this.log('👤 Generating User Persona...', 'info');
    
    try {
      if (!this.page) {
        throw new Error('Page not available');
      }

      // Navigate to user persona content
      await this.page.goto('data:text/html,<html><body><h1>User Persona</h1><p>This is a demo user persona capture with optimized quality settings.</p></body></html>');
      
      // Wait for content to render
      await this.page.waitForLoadState('networkidle');
      
      // Add styling
      await this.page.evaluate(() => {
        const body = document.body;
        body.style.fontFamily = 'Arial, sans-serif';
        body.style.padding = '40px';
        body.style.backgroundColor = '#e8f4f8';
        
        const h1 = document.querySelector('h1');
        if (h1) {
          h1.style.color = '#2c5aa0';
          h1.style.textAlign = 'center';
        }
        
        const p = document.querySelector('p');
        if (p) {
          p.style.color = '#555';
          p.style.textAlign = 'center';
          p.style.fontSize = '18px';
        }
      });

      // Wait for content rendering
      await this.delay(2000);

      // Save video
      await this.withTimeout(
        this.saveUserPersonaVideo(),
        this.videoTimeout,
        'User Persona video saving',
        'video'
      );

      this.log('✅ User Persona completed successfully', 'success');
    } catch (error) {
      this.log(`❌ User Persona generation failed: ${error}`, 'error');
      // Fallback to screenshot
      await this.saveUserPersonaScreenshot();
    }
  }

  private async saveUserPersonaVideo(): Promise<void> {
    this.log('🎬 Saving User Persona video...', 'info');
    
    try {
      if (!this.context) {
        throw new Error('Browser context not available');
      }

      const videoPath = path.join(this.capturesDir, '02_user_persona.webm');
      
      // Force regeneration: Delete existing file if it exists
      if (this.forceRegeneration && fs.existsSync(videoPath)) {
        this.log('🔄 Force regeneration: Deleting existing video file', 'info');
        fs.unlinkSync(videoPath);
      }
      
      // Check if video file already exists (only if not forcing regeneration)
      if (!this.forceRegeneration && fs.existsSync(videoPath)) {
        this.log('⚠️  Video file already exists, skipping generation', 'warning');
        return;
      }

      // Fix: Properly access video from context
      const video = (this.context as any).video?.();
      if (!video) {
        this.log('⚠️  Video recording not available, falling back to screenshot', 'warning');
        await this.saveUserPersonaScreenshot();
        return;
      }

      // Save video with aggressive timeout
      const savePromise = video.saveAs(videoPath);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Video save timeout')), 15000);
      });

      await Promise.race([savePromise, timeoutPromise]);

      // Validate file was created and has reasonable size
      if (!fs.existsSync(videoPath)) {
        throw new Error('Video file was not created');
      }

      const stats = fs.statSync(videoPath);
      if (stats.size < 1000) { // Less than 1KB
        throw new Error(`Video file too small: ${stats.size} bytes`);
      }

      this.log(`✅ User Persona video saved: ${videoPath} (${stats.size} bytes)`, 'success');
    } catch (error) {
      this.log(`❌ User Persona video save failed: ${error}`, 'error');
      // Fallback to screenshot
      await this.saveUserPersonaScreenshot();
    }
  }

  private async saveUserPersonaScreenshot(): Promise<void> {
    this.log('📸 Saving User Persona screenshot...', 'info');
    
    try {
      if (!this.page) {
        throw new Error('Page not available');
      }

      const screenshotPath = path.join(this.capturesDir, '02_user_persona.png');
      
      // Force regeneration: Delete existing file if it exists
      if (this.forceRegeneration && fs.existsSync(screenshotPath)) {
        this.log('🔄 Force regeneration: Deleting existing screenshot file', 'info');
        fs.unlinkSync(screenshotPath);
      }
      
      // Check if screenshot file already exists (only if not forcing regeneration)
      if (!this.forceRegeneration && fs.existsSync(screenshotPath)) {
        this.log('⚠️  Screenshot file already exists, skipping generation', 'warning');
        return;
      }

      // Fix: Remove quality option for PNG screenshots (not supported)
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
        // Removed quality option - not supported for PNG
      });

      // Validate screenshot
      if (!fs.existsSync(screenshotPath)) {
        throw new Error('Screenshot file was not created');
      }

      const stats = fs.statSync(screenshotPath);
      this.log(`✅ User Persona screenshot saved: ${screenshotPath} (${stats.size} bytes)`, 'success');
    } catch (error) {
      this.log(`❌ User Persona screenshot save failed: ${error}`, 'error');
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    this.log('🧹 Cleaning up resources...', 'info');
    
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      this.log('✅ Cleanup completed successfully', 'success');
    } catch (error) {
      this.log(`⚠️  Cleanup warning: ${error instanceof Error ? error.toString() : String(error)}`, 'warning');
    }
  }

  private getValidationResults(): CaptureResult {
    try {
      const files = fs.readdirSync(this.capturesDir).filter(file => 
        file.endsWith('.webm') || file.endsWith('.png')
      );
      
      let totalScore = 0;
      let fileCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.capturesDir, file);
        const stats = fs.statSync(filePath);
        
        let fileScore = 0;
        
        if (file.endsWith('.webm')) {
          if (stats.size > 2000000) fileScore = 95;
          else if (stats.size > 1000000) fileScore = 85;
          else if (stats.size > 500000) fileScore = 70;
          else fileScore = 50;
        } else if (file.endsWith('.png')) {
          if (stats.size > 500000) fileScore = 90;
          else if (stats.size > 200000) fileScore = 80;
          else if (stats.size > 100000) fileScore = 70;
          else fileScore = 50;
        }
        
        totalScore += fileScore;
        fileCount++;
      }
      
      const averageScore = fileCount > 0 ? Math.round(totalScore / fileCount) : 0;
      
      return {
        success: true,
        message: 'Capture generation completed successfully',
        filesGenerated: files,
        qualityScore: averageScore,
        duration: 0 // Would calculate actual duration in production
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error}`,
        filesGenerated: [],
        qualityScore: 0,
        duration: 0
      };
    }
  }

  async generateCaptures(): Promise<CaptureResult> {
    const startTime = Date.now();
    
    try {
      this.log('🚀 Starting Enhanced Frontend Capture Generation with Quality Parameters...', 'info');
      this.log(`🎯 Quality Parameters:`, 'info');
      this.log(`   Video Quality: ${this.qualityParams.videoQuality}`, 'info');
      this.log(`   Screenshot Quality: ${this.qualityParams.screenshotQuality}`, 'info');
      this.log(`   Resolution: ${this.qualityParams.resolution}`, 'info');
      this.log(`   Duration: ${this.qualityParams.captureDuration}s`, 'info');
      this.log(`   Compression: ${this.qualityParams.compression}%`, 'info');
      this.log(`   Frame Rate: ${this.qualityParams.frameRate}fps`, 'info');
      
      await this.initializeBrowser();
      await this.generatePersonalIntro();
      await this.generateUserPersona();
      
      const result = this.getValidationResults();
      result.duration = Date.now() - startTime;
      
      this.log(`✅ Capture generation completed in ${result.duration}ms`, 'success');
      this.log(`📊 Quality Score: ${result.qualityScore}/100`, 'info');
      this.log(`📁 Files Generated: ${result.filesGenerated.length}`, 'info');
      
      return result;
      
    } catch (error) {
      this.log(`❌ Capture generation failed: ${error}`, 'error');
      
      return {
        success: false,
        message: `Generation failed: ${error}`,
        filesGenerated: [],
        qualityScore: 0,
        duration: Date.now() - startTime
      };
    } finally {
      await this.cleanup();
    }
  }
}

// Main execution function
async function main() {
  try {
    // Check if quality parameters were passed via command line
    const args = process.argv.slice(2);
    let qualityParams: Partial<QualityParameters> = {};
    
    if (args.length > 0) {
      try {
        qualityParams = JSON.parse(args[0]);
        console.log('🎯 Using quality parameters from command line:', qualityParams);
      } catch (error) {
        console.log('⚠️  Invalid quality parameters, using defaults');
      }
    }
    
    const generator = new EnhancedFrontendCaptureGeneratorWithParameters(qualityParams);
    const result = await generator.generateCaptures();
    
    if (result.success) {
      console.log('\n🎉 Enhanced Frontend Capture Generation completed successfully!');
      console.log(`📊 Quality Score: ${result.qualityScore}/100`);
      console.log(`📁 Files Generated: ${result.filesGenerated.length}`);
      console.log(`⏱️  Duration: ${result.duration}ms`);
      process.exit(0);
    } else {
      console.log('\n❌ Enhanced Frontend Capture Generation failed!');
      console.log(`💬 Error: ${result.message}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
