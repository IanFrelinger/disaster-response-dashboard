#!/usr/bin/env ts-node

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class CaptureSystemDebugger {
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

  async runDiagnostics(): Promise<void> {
    this.log('🔍 Starting Capture System Diagnostics...', 'info');
    
    try {
      // Test 1: Environment Check
      await this.testEnvironment();
      
      // Test 2: Dependencies Check
      await this.testDependencies();
      
      // Test 3: Browser Initialization
      await this.testBrowserInitialization();
      
      // Test 4: Video Recording
      await this.testVideoRecording();
      
      // Test 5: File Operations
      await this.testFileOperations();
      
      this.log('🎉 All diagnostics completed successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Diagnostics failed: ${error}`, 'error');
    } finally {
      await this.cleanup();
    }
  }

  private async testEnvironment(): Promise<void> {
    this.log('🧪 Testing environment...', 'info');
    
    // Check Node.js version
    const nodeVersion = process.version;
    this.log(`Node.js version: ${nodeVersion}`, 'info');
    
    if (parseInt(nodeVersion.slice(1).split('.')[0]) < 18) {
      throw new Error('Node.js 18+ required');
    }
    
    // Check working directory
    const cwd = process.cwd();
    this.log(`Working directory: ${cwd}`, 'info');
    
    // Check if we're in the right place
    if (!cwd.includes('video-production')) {
      this.log('⚠️  Not in video-production directory', 'warning');
    }
    
    this.log('✅ Environment test passed', 'success');
  }

  private async testDependencies(): Promise<void> {
    this.log('🧪 Testing dependencies...', 'info');
    
    // Check node_modules
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      throw new Error('node_modules not found - run npm install');
    }
    this.log('✅ node_modules found', 'success');
    
    // Check Playwright
    try {
      const { chromium } = await import('playwright');
      this.log('✅ Playwright import successful', 'success');
    } catch (error) {
      throw new Error(`Playwright import failed: ${error}`);
    }
    
    // Check FFmpeg
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      
      await execAsync('ffmpeg -version');
      this.log('✅ FFmpeg available', 'success');
    } catch (error) {
      this.log('⚠️  FFmpeg not available - video operations will be limited', 'warning');
    }
    
    this.log('✅ Dependencies test passed', 'success');
  }

  private async testBrowserInitialization(): Promise<void> {
    this.log('🧪 Testing browser initialization...', 'info');
    
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
      this.log('✅ Browser launched', 'success');
      
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
          dir: this.capturesDir,
          size: { width: 1920, height: 1080 }
        }
      });
      this.log('✅ Browser context created with video recording', 'success');
      
      this.page = await this.context.newPage();
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      this.log('✅ Page created and configured', 'success');
      
    } catch (error) {
      throw new Error(`Browser initialization failed: ${error}`);
    }
    
    this.log('✅ Browser initialization test passed', 'success');
  }

  private async testVideoRecording(): Promise<void> {
    this.log('🧪 Testing video recording...', 'info');
    
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    
    try {
      // Check if video recording is available
      const video = this.page.video();
      if (!video) {
        throw new Error('Video recording not available');
      }
      this.log('✅ Video recording object available', 'success');
      
      // Navigate to a simple page
      await this.page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                font-family: Arial, sans-serif;
                color: white;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
              }
              .test-content {
                font-size: 2rem;
              }
            </style>
          </head>
          <body>
            <div class="test-content">
              Video Recording Test Page<br>
              <small>This page should be recorded</small>
            </div>
          </body>
        </html>
      `);
      
      this.log('✅ Test content loaded', 'success');
      
      // Wait a bit for content to render
      await this.page.waitForTimeout(2000);
      
      // Close page to finalize recording
      await this.page.close();
      this.log('✅ Page closed, video recording should be finalized', 'success');
      
      // Wait for video file to be written
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for video files
      const videoFiles = fs.readdirSync(this.capturesDir)
        .filter(file => file.endsWith('.webm'));
      
      if (videoFiles.length === 0) {
        throw new Error('No video files found after recording');
      }
      
      this.log(`✅ Video recording successful - found ${videoFiles.length} file(s)`, 'success');
      
      // Check file sizes
      for (const file of videoFiles) {
        const filePath = path.join(this.capturesDir, file);
        const stats = fs.statSync(filePath);
        this.log(`📹 ${file}: ${stats.size} bytes`, 'info');
        
        if (stats.size === 0) {
          throw new Error(`Video file ${file} is empty`);
        }
      }
      
      // Create new page for next tests
      this.page = await this.context!.newPage();
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
    } catch (error) {
      throw new Error(`Video recording test failed: ${error}`);
    }
    
    this.log('✅ Video recording test passed', 'success');
  }

  private async testFileOperations(): Promise<void> {
    this.log('🧪 Testing file operations...', 'info');
    
    try {
      // Test file creation
      const testFilePath = path.join(this.capturesDir, 'test_file.txt');
      const testContent = 'This is a test file for debugging';
      
      fs.writeFileSync(testFilePath, testContent);
      this.log('✅ Test file created', 'success');
      
      // Test file reading
      const readContent = fs.readFileSync(testFilePath, 'utf8');
      if (readContent !== testContent) {
        throw new Error('File content mismatch');
      }
      this.log('✅ Test file read successfully', 'success');
      
      // Test file deletion
      fs.unlinkSync(testFilePath);
      this.log('✅ Test file deleted', 'success');
      
      // Test directory operations
      const testDirPath = path.join(this.capturesDir, 'test_dir');
      fs.mkdirSync(testDirPath, { recursive: true });
      this.log('✅ Test directory created', 'success');
      
      fs.rmdirSync(testDirPath);
      this.log('✅ Test directory deleted', 'success');
      
    } catch (error) {
      throw new Error(`File operations test failed: ${error}`);
    }
    
    this.log('✅ File operations test passed', 'success');
  }

  async cleanup(): Promise<void> {
    this.log('🧹 Cleaning up...', 'info');
    
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      
      this.log('✅ Cleanup completed', 'success');
    } catch (error) {
      this.log(`⚠️  Cleanup warning: ${error}`, 'warning');
    }
  }
}

// Main execution
async function main() {
  const debuggerInstance = new CaptureSystemDebugger();
  
  try {
    await debuggerInstance.runDiagnostics();
  } catch (error) {
    console.error('❌ Main execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CaptureSystemDebugger };
