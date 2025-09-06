#!/usr/bin/env node
/**
 * Automated Layer Validation Script
 * Integrates with CI/CD pipeline to validate frontend map layers
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
  timeout: 60000,
  headless: process.env.CI === 'true' ? true : false,
  screenshotPath: process.env.SCREENSHOT_PATH || 'test-results/layer-validation.png',
  resultsPath: process.env.RESULTS_PATH || 'test-results/layer-validation-results.json',
  maxRetries: 3,
  retryDelay: 2000,
  // Timeout configurations
  timeouts: {
    pageLoad: 30000,        // 30s for page load
    navigation: 15000,      // 15s for navigation
    elementWait: 10000,     // 10s for element waits
    mapLoad: 20000,         // 20s for map initialization
    layerRender: 15000,     // 15s for layer rendering
    validation: 10000,      // 10s for validation checks
    screenshot: 5000,       // 5s for screenshot capture
    networkIdle: 5000       // 5s for network idle
  }
};

// Validation thresholds
const THRESHOLDS = {
  minSuccessRate: 100, // 100% of layers must be successful
  maxLoadTime: 10000,  // 10 seconds max load time
  maxRenderTime: 5000  // 5 seconds max render time
};

class LayerValidationRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      success: false,
      overall: {
        successfulLayers: 0,
        totalLayers: 6,
        successRate: 0,
        errors: []
      },
      layers: {},
      performance: {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        ci: process.env.CI === 'true'
      }
    };
  }

  async run() {
    console.log('🔍 Starting automated layer validation...');
    console.log(`📍 Target URL: ${CONFIG.baseURL}`);
    console.log(`🤖 Headless mode: ${CONFIG.headless}`);
    
    const browser = await chromium.launch({ 
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Set up monitoring
      this.setupMonitoring(page);
      
      // Navigate and validate
      await this.navigateAndValidate(page);
      
      // Generate report
      await this.generateReport();
      
      // Determine success
      this.results.success = this.results.overall.successRate >= THRESHOLDS.minSuccessRate;
      
      if (this.results.success) {
        console.log('🎉 SUCCESS: All layer validation checks passed!');
        process.exit(0);
      } else {
        console.log('❌ FAILURE: Layer validation checks failed');
        console.log(`📊 Success rate: ${this.results.overall.successRate}% (required: ${THRESHOLDS.minSuccessRate}%)`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Validation failed with error:', error);
      this.results.overall.errors.push(`Validation failed: ${error.message}`);
      await this.generateReport();
      process.exit(1);
    } finally {
      await browser.close();
    }
  }

  setupMonitoring(page) {
    const startTime = Date.now();
    
    // Monitor console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.overall.errors.push(`Console error: ${msg.text()}`);
      }
    });
    
    // Monitor network errors
    page.on('response', response => {
      if (!response.ok()) {
        this.results.overall.errors.push(`Network error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Monitor page load time
    page.on('load', () => {
      this.results.performance.loadTime = Date.now() - startTime;
    });
  }

  async navigateAndValidate(page) {
    console.log('🌐 Navigating to application...');
    
    // Navigate to the app with test mode enabled
    await page.goto(`${CONFIG.baseURL}?test=true`, { 
      waitUntil: 'networkidle',
      timeout: CONFIG.timeouts.pageLoad 
    });
    
    // Wait for initial load
    await page.waitForTimeout(3000);
    
    // Click on the "Open 3D Map" button
    console.log('🗺️ Opening 3D Map...');
    try {
      await page.waitForSelector('button:has-text("Open 3D Map")', { timeout: CONFIG.timeouts.elementWait });
      await page.click('button:has-text("Open 3D Map")');
      console.log('✅ 3D Map button clicked');
    } catch (error) {
      throw new Error(`Failed to open 3D map: ${error.message}`);
    }
    
    // Wait for map to load
    console.log('⏳ Waiting for map and layers to load...');
    await page.waitForTimeout(CONFIG.timeouts.mapLoad);
    
    // Validate map container
    const mapContainer = await page.$('.map-container-3d');
    if (!mapContainer) {
      throw new Error('Map container not found');
    }
    console.log('✅ Map container found');
    
    // Extract validation results
    await this.extractValidationResults(page);
    
    // Take screenshot
    await this.takeScreenshot(page);
  }

  async extractValidationResults(page) {
    console.log('📊 Extracting validation results...');
    
    // Wait for validation overlay to appear
    try {
      await page.waitForSelector('*:has-text("Layer Validation")', { timeout: CONFIG.timeouts.validation });
    } catch (error) {
      console.warn('⚠️ Validation overlay not found within timeout, proceeding with extraction...');
    }
    
    // Get validation overlay text
    const validationText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const overlay = elements.find(el => el.textContent?.includes('Layer Validation'));
      return overlay ? overlay.textContent : null;
    });
    
    if (!validationText) {
      throw new Error('Validation overlay not found');
    }
    
    // Parse validation results
    const overallMatch = validationText.match(/Overall:\s*(\d+)\/(\d+)\s*layers successful/);
    if (overallMatch) {
      this.results.overall.successfulLayers = parseInt(overallMatch[1]);
      this.results.overall.totalLayers = parseInt(overallMatch[2]);
      this.results.overall.successRate = (this.results.overall.successfulLayers / this.results.overall.totalLayers) * 100;
    }
    
    // Parse individual layer results
    const layerResults = await page.evaluate(() => {
      const results = {};
      const layerNames = ['terrain', 'buildings', 'hazards', 'units', 'routes', 'enhancedRouting'];
      
      layerNames.forEach(name => {
        const regex = new RegExp(`${name}:(.*?)(?=\\n|$)`, 's');
        const match = document.body.textContent.match(regex);
        if (match) {
          const text = match[1].trim();
          results[name] = {
            success: text.includes('✓'),
            enabled: text.includes('🟢 Enabled'),
            rendered: text.includes('🎨 Rendered'),
            interactive: text.includes('🖱️ Interactive'),
            disabled: text.includes('🔴 Disabled'),
            notRendered: text.includes('⚪ Not Rendered'),
            static: text.includes('🚫 Static')
          };
        }
      });
      
      return results;
    });
    
    this.results.layers = layerResults;
    
    // Get performance metrics
    const performance = await page.evaluate(() => {
      return {
        memoryUsage: performance.memory?.usedJSHeapSize || 0,
        renderTime: Date.now() - window.performance.timing.navigationStart
      };
    });
    
    this.results.performance = { ...this.results.performance, ...performance };
    
    console.log(`📊 Validation Results: ${this.results.overall.successfulLayers}/${this.results.overall.totalLayers} layers successful (${this.results.overall.successRate.toFixed(1)}%)`);
  }

  async takeScreenshot(page) {
    console.log('📸 Taking screenshot...');
    
    // Ensure directory exists
    const dir = path.dirname(CONFIG.screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await page.screenshot({ 
      path: CONFIG.screenshotPath,
      fullPage: true,
      timeout: CONFIG.timeouts.screenshot
    });
    console.log(`📸 Screenshot saved: ${CONFIG.screenshotPath}`);
  }

  async generateReport() {
    console.log('📝 Generating validation report...');
    
    // Ensure directory exists
    const dir = path.dirname(CONFIG.resultsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write JSON report
    fs.writeFileSync(CONFIG.resultsPath, JSON.stringify(this.results, null, 2));
    console.log(`📝 Report saved: ${CONFIG.resultsPath}`);
    
    // Print summary
    console.log('\n📋 VALIDATION SUMMARY');
    console.log('====================');
    console.log(`✅ Success Rate: ${this.results.overall.successRate.toFixed(1)}%`);
    console.log(`⏱️  Load Time: ${this.results.performance.loadTime}ms`);
    console.log(`🎨 Render Time: ${this.results.performance.renderTime}ms`);
    console.log(`💾 Memory Usage: ${Math.round(this.results.performance.memoryUsage / 1024 / 1024)}MB`);
    
    if (this.results.overall.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.overall.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🔍 LAYER STATUS:');
    Object.entries(this.results.layers).forEach(([name, status]) => {
      const icon = status.success ? '✅' : '❌';
      const state = status.enabled ? 'Enabled' : status.disabled ? 'Disabled' : 'Unknown';
      const render = status.rendered ? 'Rendered' : status.notRendered ? 'Not Rendered' : 'Unknown';
      console.log(`  ${icon} ${name}: ${state} | ${render}`);
    });
  }
}

// Run validation
const runner = new LayerValidationRunner();
runner.run().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
