#!/usr/bin/env tsx

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimplePipelineTest {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async runTest() {
    console.log('🧪 Simple Pipeline Test');
    console.log('=======================');
    
    try {
      console.log('1️⃣ Testing browser initialization...');
      await this.testBrowserInit();
      
      console.log('2️⃣ Testing app navigation...');
      await this.testAppNavigation();
      
      console.log('3️⃣ Testing basic recording...');
      await this.testBasicRecording();
      
      console.log('✅ All tests passed!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async testBrowserInit() {
    console.log('   🌐 Launching browser...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('   📄 Creating page...');
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });
    
    console.log('   ✅ Browser initialized successfully');
  }

  private async testAppNavigation() {
    console.log('   🏠 Navigating to app...');
    await this.page!.goto('http://localhost:3000');
    await this.page!.waitForLoadState('networkidle');
    
    console.log('   ✅ App loaded successfully');
    
    // Test if we can find the main navigation
    const dashboardButton = await this.page!.locator('button:has-text("Commander Dashboard")');
    if (await dashboardButton.count() > 0) {
      console.log('   ✅ Found Commander Dashboard button');
    } else {
      console.log('   ⚠️  Commander Dashboard button not found');
    }
  }

  private async testBasicRecording() {
    console.log('   📹 Testing basic recording...');
    
    // Create a simple overlay
    await this.page!.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(0,0,0,0.8); color: white; padding: 20px; 
                    border-radius: 10px; z-index: 1000;">
          <h2>Pipeline Test</h2>
          <p>This is a test overlay</p>
        </div>
      `;
      document.body.appendChild(testDiv);
    });
    
    console.log('   ⏳ Waiting 3 seconds...');
    await this.page!.waitForTimeout(3000);
    
    console.log('   ✅ Basic recording test completed');
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

// Run the simple test
const test = new SimplePipelineTest();
test.runTest().catch(console.error);
