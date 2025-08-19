#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class MinimalTest {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private capturesDir: string;

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
    this.log('🚀 Starting Minimal Integration Test...', 'info');
    
    try {
      // Test 1: Environment
      await this.testEnvironment();
      
      // Test 2: Browser
      await this.testBrowser();
      
      // Test 3: Simple Capture
      await this.testSimpleCapture();
      
      this.log('🎉 Minimal test completed successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Test failed: ${error}`, 'error');
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async testEnvironment(): Promise<void> {
    this.log('🧪 Testing environment...', 'info');
    
    // Check captures directory
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
    this.log('✅ Captures directory ready', 'success');
    
    // Check FFmpeg
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      await execAsync('ffmpeg -version');
      this.log('✅ FFmpeg available', 'success');
    } catch (error) {
      this.log('⚠️  FFmpeg not available', 'warning');
    }
  }

  private async testBrowser(): Promise<void> {
    this.log('🧪 Testing browser...', 'info');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.log('✅ Browser launched', 'success');
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: this.capturesDir,
        size: { width: 1920, height: 1080 }
      }
    });
    this.log('✅ Context created with video recording', 'success');
    
    this.page = await this.context.newPage();
    this.log('✅ Page created', 'success');
  }

  private async testSimpleCapture(): Promise<void> {
    this.log('🧪 Testing simple capture...', 'info');
    
    if (!this.page) throw new Error('Page not initialized');
    
    // Load simple content
    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 40px;
              background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
              font-family: Arial, sans-serif;
              color: white;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .content {
              font-size: 2rem;
            }
          </style>
        </head>
        <body>
          <div class="content">
            🎯 Minimal Test Success!<br>
            <small>Video recording test</small>
          </div>
        </body>
      </html>
    `);
    
    this.log('✅ Test content loaded', 'success');
    
    // Wait for content
    await this.page.waitForTimeout(2000);
    
    // Close page to finalize recording
    await this.page.close();
    this.log('✅ Page closed, recording finalized', 'success');
    
    // Wait for video file
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for video files
    const videoFiles = fs.readdirSync(this.capturesDir)
      .filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length > 0) {
      this.log(`✅ Video recording successful - found ${videoFiles.length} file(s)`, 'success');
      
      // Check file sizes
      for (const file of videoFiles) {
        const filePath = path.join(this.capturesDir, file);
        const stats = fs.statSync(filePath);
        this.log(`📹 ${file}: ${stats.size} bytes`, 'info');
      }
    } else {
      throw new Error('No video files found');
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
  const test = new MinimalTest();
  
  try {
    await test.runTest();
    console.log('\n🎯 Minimal Integration Test: PASSED');
  } catch (error) {
    console.error('\n❌ Minimal Integration Test: FAILED');
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MinimalTest };
