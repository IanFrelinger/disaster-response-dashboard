#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface CaptureConfig {
  name: string;
  duration: number;
  description: string;
  actions: string[];
  type: 'static' | 'frontend' | 'interaction';
  url?: string;
  waitFor?: string;
  timeout?: number;
  retries?: number;
}

interface ValidationResult {
  success: boolean;
  message: string;
  details?: string;
  duration?: number;
}

class EnhancedFrontendCaptureGenerator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private capturesDir: string;
  private frontendUrl: string;
  private globalTimeout: number = 300000; // 5 minutes global timeout
  private stepTimeout: number = 60000; // 60 seconds per step (increased from 30s)
  private contentTimeout: number = 10000; // 10 seconds for content rendering
  private videoTimeout: number = 30000; // 30 seconds for video operations (reduced since we have fallback)
  private maxRetries: number = 3;
  private validationResults: ValidationResult[] = [];

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.frontendUrl = 'http://localhost:3000';
    this.ensureCapturesDirectory();
  }

  private ensureCapturesDirectory(): void {
    try {
      if (!fs.existsSync(this.capturesDir)) {
        fs.mkdirSync(this.capturesDir, { recursive: true });
      }
      console.log(`✅ Captures directory ready: ${this.capturesDir}`);
    } catch (error) {
      console.error(`❌ Failed to create captures directory: ${error}`);
      throw error;
    }
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${prefix[type]} [${timestamp}] ${message}`);
  }

  private addValidationResult(result: ValidationResult): void {
    this.validationResults.push(result);
  }

  getValidationResults(): ValidationResult[] {
    return [...this.validationResults];
  }

  getValidationSummary(): string {
    const total = this.validationResults.length;
    const passed = this.validationResults.filter(r => r.success).length;
    const failed = total - passed;
    
    return `Validation Summary: ${passed}/${total} passed, ${failed} failed`;
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

  private async validateVideoRecording(): Promise<ValidationResult> {
    const startTime = Date.now();
    try {
      if (!this.page) {
        return {
          success: false,
          message: 'Page not initialized for video validation',
          duration: Date.now() - startTime
        };
      }

      // Check if video recording is available
      const video = this.page.video();
      if (!video) {
        return {
          success: false,
          message: 'Video recording not available - check browser context configuration',
          duration: Date.now() - startTime
        };
      }

      // Verify video recording is actually working by checking if we can access video properties
      try {
        // Small delay to ensure video recording has started
        await this.page.waitForTimeout(1000);
        
        // Try to access video properties to verify it's working
        const videoPath = await video.path();
        if (!videoPath) {
          return {
            success: false,
            message: 'Video recording started but no path available',
            duration: Date.now() - startTime
          };
        }

        return {
          success: true,
          message: 'Video recording validation passed',
          duration: Date.now() - startTime
        };
      } catch (videoError) {
        return {
          success: false,
          message: 'Video recording validation failed',
          details: videoError instanceof Error ? videoError.toString() : String(videoError),
          duration: Date.now() - startTime
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Video recording validation error',
        details: error instanceof Error ? error.toString() : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  private async validateBrowserHealth(): Promise<ValidationResult> {
    const startTime = Date.now();
    try {
      if (!this.browser || !this.context || !this.page) {
        return {
          success: false,
          message: 'Browser components not initialized',
          duration: Date.now() - startTime
        };
      }

      // Check if browser is still responsive
      const isConnected = this.browser.isConnected();
      if (!isConnected) {
        return {
          success: false,
          message: 'Browser connection lost',
          duration: Date.now() - startTime
        };
      }

      // Check if page is responsive
      try {
        await this.page.evaluate(() => document.readyState);
      } catch (error) {
        return {
          success: false,
          message: 'Page not responsive',
          details: error instanceof Error ? error.toString() : String(error),
          duration: Date.now() - startTime
        };
      }

      return {
        success: true,
        message: 'Browser health check passed',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: 'Browser health check failed',
        details: error instanceof Error ? error.toString() : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  async initialize(): Promise<void> {
    this.log('🚀 Initializing Enhanced Frontend-Integrated Capture Generator...', 'info');
    
    try {
      // Initialize browser with timeout
      await this.withTimeout(
        this.initializeBrowser(),
        this.globalTimeout,
        'Browser initialization'
      );

      this.log('✅ Enhanced capture generator initialized successfully', 'success');
    } catch (error) {
      this.log(`❌ Failed to initialize capture generator: ${error}`, 'error');
      throw error;
    }
  }

  private async initializeBrowser(): Promise<void> {
    this.log('🌐 Launching browser...', 'info');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    this.log('📱 Creating browser context...', 'info');
    
    this.context = await this.browser.newContext({
      recordVideo: {
        dir: this.capturesDir,
        size: { width: 1920, height: 1080 }
      },
      viewport: { width: 1920, height: 1080 }
    });

    this.log('📄 Creating new page...', 'info');
    
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    // Validate browser health after initialization
    const healthCheck = await this.validateBrowserHealth();
    this.addValidationResult(healthCheck);
    
    if (!healthCheck.success) {
      throw new Error(`Browser health check failed: ${healthCheck.message}`);
    }

    // Validate video recording is working
    const videoCheck = await this.validateVideoRecording();
    this.addValidationResult(videoCheck);
    
    if (!videoCheck.success) {
      throw new Error(`Video recording validation failed: ${videoCheck.message}`);
    }

    this.log('✅ Browser initialized with video recording enabled', 'success');
  }

  async generatePersonalIntro(): Promise<void> {
    this.log('📹 Generating Personal Introduction capture...', 'info');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Use progressive timeouts: content rendering first, then video operations
      await this.withTimeout(
        this.generatePersonalIntroContent(),
        this.contentTimeout,
        'Personal Introduction content rendering',
        'content'
      );

      // Video operations get longer timeout
      await this.withTimeout(
        this.savePersonalIntroVideo(),
        this.videoTimeout,
        'Personal Introduction video saving',
        'video'
      );

      this.log('✅ Personal Introduction video captured', 'success');
    } catch (error) {
      this.log(`❌ Failed to generate Personal Introduction: ${error}`, 'error');
      throw error;
    }
  }

  private async generatePersonalIntroContent(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .intro-container {
              text-align: center;
              max-width: 800px;
              padding: 40px;
            }
            .name {
              font-size: 4rem;
              font-weight: 300;
              margin-bottom: 20px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .title {
              font-size: 2rem;
              margin-bottom: 30px;
              opacity: 0.9;
            }
            .mission {
              font-size: 1.4rem;
              line-height: 1.6;
              opacity: 0.8;
              max-width: 600px;
              margin: 0 auto;
            }
            .highlight {
              color: #ffd700;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="intro-container">
            <div class="name">Ian Frelinger</div>
            <div class="title">Disaster Response Platform Architect</div>
            <div class="mission">
              Building intelligent systems that save lives during emergencies. 
              Our platform transforms disaster response from reactive to proactive, 
              leveraging AI and real-time data to coordinate emergency services 
              and protect communities.
            </div>
          </div>
        </body>
      </html>
    `);
    
    // Wait for content to render with shorter timeout
    await this.page.waitForTimeout(2000);
    
    // Verify content is visible
    const nameElement = await this.page.$('.name');
    if (!nameElement) {
      throw new Error('Personal introduction content failed to render');
    }
    
    this.log('✅ Personal introduction content rendered successfully', 'success');
  }

  private async savePersonalIntroVideo(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Check if video file already exists from previous recording
    const outputPath = path.join(this.capturesDir, '01_personal_intro.webm');
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 0) {
        this.log(`✅ Video file already exists: ${outputPath} (${stats.size} bytes)`, 'success');
        return;
      }
    }

    // First, verify video recording is still working
    const video = this.page.video();
    if (!video) {
      this.log('⚠️ Video recording not available, falling back to screenshot', 'warning');
      await this.savePersonalIntroScreenshot();
      return;
    }

    try {
      // Check if video recording has a path (indicating it's working)
      const videoPath = await video.path();
      if (!videoPath) {
        this.log('⚠️ Video recording path not available, falling back to screenshot', 'warning');
        await this.savePersonalIntroScreenshot();
        return;
      }

      this.log(`📹 Video recording path: ${videoPath}`, 'info');
      
      // Wait a moment for video recording to stabilize
      await this.page.waitForTimeout(1000);
      
      // Save the video with aggressive timeout protection
      this.log(`💾 Saving video to: ${outputPath}`, 'info');
      
      // Use a more aggressive timeout for video.saveAs() which can hang
      const savePromise = video.saveAs(outputPath);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Video saveAs operation timed out - method may be hanging'));
        }, 15000); // 15 second timeout for saveAs
      });
      
      await Promise.race([savePromise, timeoutPromise]);
      
      // Verify the file was created and has content
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          this.log(`✅ Personal Introduction video saved: ${outputPath} (${stats.size} bytes)`, 'success');
        } else {
          throw new Error('Personal Introduction video file created but is empty');
        }
      } else {
        throw new Error('Personal Introduction video file was not created');
      }
    } catch (videoError) {
      this.log(`❌ Video saving failed: ${videoError}`, 'error');
      
      // Try to get more diagnostic information
      try {
        const videoPath = await video.path();
        this.log(`🔍 Video recording path: ${videoPath || 'Not available'}`, 'info');
        
        // Check if video directory exists and is writable
        if (!fs.existsSync(this.capturesDir)) {
          this.log(`❌ Captures directory does not exist: ${this.capturesDir}`, 'error');
        } else {
          try {
            const testFile = path.join(this.capturesDir, 'test_write.tmp');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            this.log('✅ Captures directory is writable', 'success');
          } catch (writeError) {
            this.log(`❌ Captures directory is not writable: ${writeError}`, 'error');
          }
        }
      } catch (diagnosticError) {
        this.log(`⚠️ Could not get diagnostic information: ${diagnosticError}`, 'warning');
      }
      
      // Fall back to screenshot if video fails
      this.log('🔄 Falling back to screenshot capture', 'info');
      await this.savePersonalIntroScreenshot();
    }
  }

  private async savePersonalIntroScreenshot(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      const screenshotPath = path.join(this.capturesDir, '01_personal_intro.png');
      this.log(`📸 Taking screenshot: ${screenshotPath}`, 'info');
      
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });
      
      if (fs.existsSync(screenshotPath)) {
        const stats = fs.statSync(screenshotPath);
        if (stats.size > 0) {
          this.log(`✅ Personal Introduction screenshot saved: ${screenshotPath} (${stats.size} bytes)`, 'success');
        } else {
          throw new Error('Screenshot file created but is empty');
        }
      } else {
        throw new Error('Screenshot file was not created');
      }
    } catch (screenshotError) {
      this.log(`❌ Screenshot fallback also failed: ${screenshotError}`, 'error');
      throw new Error(`Both video and screenshot capture failed. Video error: ${screenshotError}`);
    }
  }

  async generateUserPersona(): Promise<void> {
    this.log('📹 Generating User Persona capture...', 'info');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Use progressive timeouts: content rendering first, then video operations
      await this.withTimeout(
        this.generateUserPersonaContent(),
        this.contentTimeout,
        'User Persona content rendering',
        'content'
      );

      // Video operations get longer timeout
      await this.withTimeout(
        this.saveUserPersonaVideo(),
        this.videoTimeout,
        'User Persona video saving',
        'video'
      );

      this.log('✅ User Persona video captured', 'success');
    } catch (error) {
      this.log(`❌ Failed to generate User Persona: ${error}`, 'error');
      throw error;
    }
  }

  private async generateUserPersonaContent(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .persona-container {
              text-align: center;
              max-width: 900px;
              padding: 40px;
            }
            .title {
              font-size: 3rem;
              margin-bottom: 40px;
              color: #3498db;
            }
            .personas {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
              margin-top: 40px;
            }
            .persona {
              background: rgba(255,255,255,0.1);
              padding: 30px;
              border-radius: 15px;
              backdrop-filter: blur(10px);
            }
            .persona-title {
              font-size: 1.5rem;
              margin-bottom: 15px;
              color: #f39c12;
            }
            .persona-desc {
              font-size: 1.1rem;
              line-height: 1.6;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="persona-container">
            <div class="title">Target Users & Technical Requirements</div>
            <div class="personas">
              <div class="persona">
                <div class="persona-title">Emergency Responders</div>
                <div class="persona-desc">Firefighters, police, and medical personnel who need real-time situational awareness and coordination tools.</div>
              </div>
              <div class="persona">
                <div class="persona-title">Emergency Managers</div>
                <div class="persona-desc">Coordinators who need comprehensive overview of multiple incidents and resource allocation.</div>
              </div>
              <div class="persona">
                <div class="persona-title">Technical Teams</div>
                <div class="persona-desc">IT and operations staff who need reliable, scalable systems for critical operations.</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    // Wait for content to render with shorter timeout
    await this.page.waitForTimeout(2000);
    
    // Verify content is visible
    const titleElement = await this.page.$('.title');
    if (!titleElement) {
      throw new Error('User persona content failed to render');
    }
    
    this.log('✅ User persona content rendered successfully', 'success');
  }

  private async saveUserPersonaVideo(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Check if video file already exists from previous recording
    const outputPath = path.join(this.capturesDir, '02_user_persona.webm');
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 0) {
        this.log(`✅ Video file already exists: ${outputPath} (${stats.size} bytes)`, 'success');
        return;
      }
    }

    // First, verify video recording is still working
    const video = this.page.video();
    if (!video) {
      this.log('⚠️ Video recording not available, falling back to screenshot', 'warning');
      await this.saveUserPersonaScreenshot();
      return;
    }

    try {
      // Check if video recording has a path (indicating it's working)
      const videoPath = await video.path();
      if (!videoPath) {
        this.log('⚠️ Video recording path not available, falling back to screenshot', 'warning');
        await this.saveUserPersonaScreenshot();
        return;
      }

      this.log(`📹 Video recording path: ${videoPath}`, 'info');
      
      // Wait a moment for video recording to stabilize
      await this.page.waitForTimeout(1000);
      
      // Save the video with aggressive timeout protection
      this.log(`💾 Saving video to: ${outputPath}`, 'info');
      
      // Use a more aggressive timeout for video.saveAs() which can hang
      const savePromise = video.saveAs(outputPath);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Video saveAs operation timed out - method may be hanging'));
        }, 15000); // 15 second timeout for saveAs
      });
      
      await Promise.race([savePromise, timeoutPromise]);
      
      // Verify the file was created and has content
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          this.log(`✅ User Persona video saved: ${outputPath} (${stats.size} bytes)`, 'success');
        } else {
          throw new Error('User Persona video file created but is empty');
        }
      } else {
        throw new Error('User Persona video file was not created');
      }
    } catch (videoError) {
      this.log(`❌ Video saving failed: ${videoError}`, 'error');
      
      // Fall back to screenshot if video fails
      this.log('🔄 Falling back to screenshot capture', 'info');
      await this.saveUserPersonaScreenshot();
    }
  }

  private async saveUserPersonaScreenshot(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      const screenshotPath = path.join(this.capturesDir, '02_user_persona.png');
      this.log(`📸 Taking screenshot: ${screenshotPath}`, 'info');
      
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });
      
      if (fs.existsSync(screenshotPath)) {
        const stats = fs.statSync(screenshotPath);
        if (stats.size > 0) {
          this.log(`✅ User Persona screenshot saved: ${screenshotPath} (${stats.size} bytes)`, 'success');
        } else {
          throw new Error('Screenshot file created but is empty');
        }
      } else {
        throw new Error('Screenshot file was not created');
      }
    } catch (screenshotError) {
      this.log(`❌ Screenshot fallback also failed: ${screenshotError}`, 'error');
      throw new Error(`Both video and screenshot capture failed. Video error: ${screenshotError}`);
    }
  }

  async generateAllCaptures(): Promise<void> {
    this.log('🎬 Starting comprehensive capture generation...', 'info');
    
    const startTime = Date.now();
    
    try {
      // Generate all captures with individual timeouts
      await this.generatePersonalIntro();
      await this.generateUserPersona();
      
      const totalDuration = Date.now() - startTime;
      this.log(`✅ All captures generated successfully in ${totalDuration}ms`, 'success');
      
      // Print validation summary
      this.printValidationSummary();
      
    } catch (error) {
      this.log(`❌ Capture generation failed: ${error}`, 'error');
      throw error;
    }
  }

  private printValidationSummary(): void {
    this.log('📊 Validation Summary:', 'info');
    this.log('====================', 'info');
    
    const totalTests = this.validationResults.length;
    const passedTests = this.validationResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    this.log(`Total Validations: ${totalTests}`, 'info');
    this.log(`✅ Passed: ${passedTests}`, 'success');
    this.log(`❌ Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'info');
    
    if (failedTests > 0) {
      this.log('\nFailed Validations:', 'error');
      this.validationResults
        .filter(r => !r.success)
        .forEach(result => {
          this.log(`  - ${result.message}`, 'error');
          if (result.details) {
            this.log(`    Details: ${result.details}`, 'error');
          }
        });
    }
  }

  async cleanup(): Promise<void> {
    this.log('🧹 Cleaning up resources...', 'info');
    
    try {
      // Print validation summary before cleanup
      if (this.validationResults.length > 0) {
        this.log('📊 Final Validation Summary:', 'info');
        this.log(this.getValidationSummary(), 'info');
      }
      
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
      this.log(`⚠️ Cleanup warning: ${error instanceof Error ? error.message : String(error)}`, 'warning');
    }
  }

  async runWithValidation(): Promise<void> {
    this.log('🚀 Starting Enhanced Capture Generation with Validation...', 'info');
    
    try {
      await this.initialize();
      await this.generateAllCaptures();
    } catch (error) {
      this.log(`❌ Capture generation failed: ${error}`, 'error');
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Main execution function with timeout protection
async function main() {
  const generator = new EnhancedFrontendCaptureGenerator();
  
  // Global timeout for entire process
  const globalTimeout = 600000; // 10 minutes
  
  try {
    await Promise.race([
      generator.runWithValidation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Global timeout exceeded: ${globalTimeout}ms`));
        }, globalTimeout);
      })
    ]);
    
    console.log('🎉 Enhanced capture generation completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Enhanced capture generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
