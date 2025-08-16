#!/usr/bin/env tsx

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoOnlyTest {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private capturesDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.capturesDir = path.join(__dirname, '..', 'captures');
    
    // Ensure directories exist
    [this.outputDir, this.capturesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async runVideoTest() {
    console.log('🎬 Video-Only Test');
    console.log('==================');
    console.log('This will test video recording without TTS generation');
    
    try {
      await this.recordDemoVideo();
      console.log('✅ Video recording test completed successfully!');
      
    } catch (error) {
      console.error('❌ Video test failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async recordDemoVideo() {
    console.log('📹 Recording demo video...');
    
    await this.initializeBrowser();
    await this.executeDemoScenes();
    await this.stopRecording();
    
    console.log('✅ Demo video recorded successfully');
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: this.capturesDir,
        size: { width: 1920, height: 1080 }
      }
    });

    // Set zoom for readability
    await this.page.evaluate(() => {
      document.body.style.zoom = '1.1';
    });
    
    console.log('✅ Browser initialized with video recording');
  }

  private async executeDemoScenes() {
    const scenes = [
      {
        title: 'Intro',
        duration: 10,
        action: async () => {
          await this.showIntroSequence();
        }
      },
      {
        title: 'Dashboard',
        duration: 10,
        action: async () => {
          await this.page!.goto('http://localhost:3000');
          await this.page!.waitForLoadState('networkidle');
          await this.page!.click('button:has-text("Commander Dashboard")');
          await this.page!.waitForLoadState('networkidle');
        }
      },
      {
        title: 'Live Map',
        duration: 10,
        action: async () => {
          await this.page!.click('button:has-text("Live Map")');
          await this.page!.waitForLoadState('networkidle');
        }
      }
    ];

    console.log(`📹 Executing ${scenes.length} scenes...`);
    
    for (const scene of scenes) {
      console.log(`🎬 Scene: ${scene.title} (${scene.duration}s)`);
      
      await scene.action();
      await this.page!.waitForTimeout(scene.duration * 1000);
    }
  }

  private async showIntroSequence() {
    await this.page!.evaluate(() => {
      const introDiv = document.createElement('div');
      introDiv.innerHTML = `
        <div id="intro-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); 
                    z-index: 1000; display: flex; align-items: center; justify-content: center; 
                    color: white; font-family: Arial, sans-serif;">
          <div style="text-align: center; max-width: 800px; padding: 40px;">
            <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
              Disaster Response Platform
            </h1>
            <h2 style="font-size: 24px; margin-bottom: 30px; color: #ffd700;">
              Video Test - Ian Frelinger
            </h2>
            <p style="font-size: 18px; line-height: 1.6;">
              Testing video recording pipeline
            </p>
          </div>
        </div>
      `;
      document.body.appendChild(introDiv);
    });
  }

  private async stopRecording() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Run the video-only test
const test = new VideoOnlyTest();
test.runVideoTest().catch(console.error);
