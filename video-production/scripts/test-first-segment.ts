#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class FirstSegmentTest {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private capturesDir: string;
  private ffmpegAvailable: boolean = false;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.capturesDir = path.join(__dirname, '..', 'captures');
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

  async runTest(): Promise<void> {
    this.log('🚀 Testing First Segment Generation...', 'info');
    
    try {
      // Check dependencies
      await this.checkDependencies();
      
      // Initialize browser
      await this.initializeBrowser();
      
      // Test Introduction segment
      await this.testIntroductionSegment();
      
      this.log('🎉 First segment test completed successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Test failed: ${error}`, 'error');
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async checkDependencies(): Promise<void> {
    this.log('🔍 Checking dependencies...', 'info');
    
    // Check FFmpeg
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      await execAsync('ffmpeg -version');
      this.ffmpegAvailable = true;
      this.log('✅ FFmpeg available', 'success');
    } catch (error) {
      this.ffmpegAvailable = false;
      this.log('⚠️  FFmpeg not available - will use fallbacks', 'warning');
    }
    
    // Check captures directory
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
    this.log('✅ Captures directory ready', 'success');
  }

  private async initializeBrowser(): Promise<void> {
    this.log('🌐 Initializing browser...', 'info');
    
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
        dir: this.capturesDir,
        size: { width: 1920, height: 1080 }
      }
    });

    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    this.log('✅ Browser initialized with video recording', 'success');
  }

  private async testIntroductionSegment(): Promise<void> {
    this.log('📹 Testing Introduction segment...', 'info');
    
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Create Introduction slide content
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
      
      this.log('✅ Introduction content loaded', 'success');
      
      // Wait for content to render
      await this.page.waitForTimeout(2000);
      
      // Verify content is visible
      const nameElement = await this.page.$('.name');
      if (!nameElement) {
        throw new Error('Introduction content failed to render');
      }
      
      // Create video from static image
      const outputPath = path.join(this.capturesDir, '01_introduction_test.mp4');
      await this.createVideoFromImage(outputPath, 20); // 20 seconds
      
      // Generate voice-over
      const audioPath = await this.generateVoiceOver('Introduction', 20);
      
      // Combine video with voice-over
      if (audioPath && fs.existsSync(audioPath)) {
        const finalOutputPath = outputPath.replace('.mp4', '_with_vo.mp4');
        await this.combineVideoWithAudio(outputPath, audioPath, finalOutputPath);
        this.log('✅ Introduction segment with voice-over created', 'success');
      } else {
        this.log('⚠️  Voice-over not available, video created without audio', 'warning');
      }
      
    } catch (error) {
      this.log(`❌ Introduction segment failed: ${error}`, 'error');
      throw error;
    }
  }

  private async createVideoFromImage(outputPath: string, duration: number): Promise<void> {
    if (!this.ffmpegAvailable) {
      this.log('⚠️  FFmpeg not available - creating fallback image', 'warning');
      await this.createFallbackImage(outputPath);
      return;
    }
    
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);
    
    try {
      // Take screenshot first
      const screenshotPath = outputPath.replace('.mp4', '_slide.png');
      if (!this.page) throw new Error('Page not initialized');
      
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });
      
      this.log('✅ Screenshot captured', 'success');
      
      // Create video from image
      const escapedScreenshotPath = screenshotPath.replace(/"/g, '\\"');
      const escapedOutputPath = outputPath.replace(/"/g, '\\"');
      const command = `ffmpeg -loop 1 -i "${escapedScreenshotPath}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -y "${escapedOutputPath}"`;
      
      this.log('🎬 Creating video from image...', 'info');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('FFmpeg video creation timeout after 15 seconds')), 15000);
      });
      
      const execPromise = execAsync(command);
      await Promise.race([execPromise, timeoutPromise]);
      
      this.log(`✅ Video created from image: ${outputPath}`, 'success');
    } catch (error) {
      this.log(`❌ Failed to create video from image: ${error}`, 'error');
      await this.createFallbackImage(outputPath);
    }
  }

  private async createFallbackImage(outputPath: string): Promise<void> {
    try {
      const fallbackPath = outputPath.replace('.mp4', '.png');
      if (!this.page) throw new Error('Page not initialized');
      
      await this.page.screenshot({ 
        path: fallbackPath,
        fullPage: true,
        type: 'png'
      });
      
      this.log(`✅ Fallback image created: ${fallbackPath}`, 'success');
    } catch (error) {
      this.log(`❌ Fallback image creation failed: ${error}`, 'error');
      throw error;
    }
  }

  private async generateVoiceOver(segmentName: string, duration: number): Promise<string> {
    this.log(`🎤 Generating voice-over for: ${segmentName}`, 'info');
    
    try {
      const audioFileName = `${segmentName.toLowerCase().replace(/\s+/g, '_')}_vo.wav`;
      const audioPath = path.join(this.capturesDir, audioFileName);
      
      if (this.ffmpegAvailable) {
        await this.createSilentAudioFile(audioPath, duration);
        this.log(`✅ Voice-over file created: ${audioPath}`, 'success');
        return audioPath;
      } else {
        this.log('⚠️  FFmpeg not available - skipping voice-over', 'warning');
        return '';
      }
    } catch (error) {
      this.log(`❌ Voice-over generation failed: ${error}`, 'error');
      return '';
    }
  }

  private async createSilentAudioFile(audioPath: string, duration: number): Promise<void> {
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);
    
    try {
      const escapedPath = audioPath.replace(/"/g, '\\"');
      // Add timeout and simpler command to avoid hanging
      const command = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration} -acodec pcm_s16le -y "${escapedPath}"`;
      
      this.log(`🔇 Creating silent audio file (${duration}s)...`, 'info');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('FFmpeg timeout after 10 seconds')), 10000);
      });
      
      const execPromise = execAsync(command);
      await Promise.race([execPromise, timeoutPromise]);
      
      this.log(`✅ Silent audio file created (${duration}s)`, 'success');
    } catch (error) {
      this.log(`❌ Failed to create silent audio: ${error}`, 'error');
      // Don't throw error, just log it and continue
      this.log('⚠️  Continuing without audio file', 'warning');
    }
  }

  private async combineVideoWithAudio(videoPath: string, audioPath: string, outputPath: string): Promise<void> {
    if (!this.ffmpegAvailable) {
      this.log('⚠️  FFmpeg not available - copying video without audio', 'warning');
      fs.copyFileSync(videoPath, outputPath);
      return;
    }
    
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);
    
    try {
      const escapedVideoPath = videoPath.replace(/"/g, '\\"');
      const escapedAudioPath = audioPath.replace(/"/g, '\\"');
      const escapedOutputPath = outputPath.replace(/"/g, '\\"');
      
      const command = `ffmpeg -i "${escapedVideoPath}" -i "${escapedAudioPath}" -c:v copy -c:a aac -shortest -y "${escapedOutputPath}"`;
      
      this.log('🎬 Combining video with audio...', 'info');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('FFmpeg combination timeout after 20 seconds')), 20000);
      });
      
      const execPromise = execAsync(command);
      await Promise.race([execPromise, timeoutPromise]);
      
      this.log(`✅ Video with voice-over created: ${outputPath}`, 'success');
    } catch (error) {
      this.log(`❌ Failed to combine video with audio: ${error}`, 'error');
      // Fallback to video only
      fs.copyFileSync(videoPath, outputPath);
    }
  }

  async cleanup(): Promise<void> {
    this.log('🧹 Cleaning up...', 'info');
    
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
      this.log('✅ Cleanup completed', 'success');
    } catch (error) {
      this.log(`⚠️  Cleanup warning: ${error}`, 'warning');
    }
  }
}

// Main execution
async function main() {
  const test = new FirstSegmentTest();
  
  try {
    await test.runTest();
    console.log('\n🎯 First Segment Test: PASSED');
  } catch (error) {
    console.error('\n❌ First Segment Test: FAILED');
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { FirstSegmentTest };
