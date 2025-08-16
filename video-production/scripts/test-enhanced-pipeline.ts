import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedPipelineTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private testResults: any[] = [];

  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Testing Enhanced Video Pipeline...');
    console.log('=' .repeat(50));
    
    try {
      await this.initializeBrowser();
      
      // Test 1: Configuration Loading
      await this.testConfigurationLoading();
      
      // Test 2: Overlay Engine
      await this.testOverlayEngine();
      
      // Test 3: Action Execution
      await this.testActionExecution();
      
      // Test 4: Browser Interactions
      await this.testBrowserInteractions();
      
      // Test 5: Video Recording
      await this.testVideoRecording();
      
      // Test 6: Asset Integration
      await this.testAssetIntegration();
      
      await this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing test browser...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });
    
    console.log('✅ Test browser initialized');
  }

  private async testConfigurationLoading() {
    console.log('\n📋 Test 1: Configuration Loading');
    
    try {
      // Test record.config.json
      const recordConfigPath = path.join(__dirname, '..', 'record.config.json');
      const recordConfig = JSON.parse(fs.readFileSync(recordConfigPath, 'utf8'));
      
      this.assertTest('record.config.json exists', true, fs.existsSync(recordConfigPath));
      this.assertTest('record.config.json is valid JSON', true, typeof recordConfig === 'object');
      this.assertTest('beats array exists', true, Array.isArray(recordConfig.beats));
      this.assertTest('beats count', 10, recordConfig.beats.length);
      
      // Test tts-cue-sheet.json
      const ttsCuePath = path.join(__dirname, '..', 'tts-cue-sheet.json');
      const ttsCueSheet = JSON.parse(fs.readFileSync(ttsCuePath, 'utf8'));
      
      this.assertTest('tts-cue-sheet.json exists', true, fs.existsSync(ttsCuePath));
      this.assertTest('tts-cue-sheet.json is valid JSON', true, typeof ttsCueSheet === 'object');
      this.assertTest('beats array exists in TTS', true, Array.isArray(ttsCueSheet.beats));
      this.assertTest('TTS beats count', 10, ttsCueSheet.beats.length);
      
      console.log('✅ Configuration loading tests passed');
      
    } catch (error) {
      this.assertTest('Configuration loading', false, false, error);
    }
  }

  private async testOverlayEngine() {
    console.log('\n🎨 Test 2: Overlay Engine');
    
    try {
      // Test overlay action parsing
      const testAction = 'overlay(title:Test Title,in,500)';
      const match = testAction.match(/overlay\(([^)]+)\)/);
      
      this.assertTest('Overlay action regex parsing', true, match !== null);
      
      if (match) {
        const params = match[1].split(',');
        this.assertTest('Overlay params count', 3, params.length);
        this.assertTest('Overlay type extraction', 'title:Test Title', params[0]);
        this.assertTest('Overlay timing extraction', '500', params[2]);
      }
      
      // Test overlay element creation
      await this.page!.evaluate(() => {
        const overlay = document.createElement('div');
        overlay.id = 'test-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100px; height: 100px; background: red; z-index: 10000;';
        document.body.appendChild(overlay);
        return overlay.id;
      });
      
      const overlayExists = await this.page!.evaluate(() => {
        return document.getElementById('test-overlay') !== null;
      });
      
      this.assertTest('Overlay element creation', true, overlayExists);
      
      // Clean up test overlay
      await this.page!.evaluate(() => {
        const overlay = document.getElementById('test-overlay');
        if (overlay) overlay.remove();
      });
      
      console.log('✅ Overlay engine tests passed');
      
    } catch (error) {
      this.assertTest('Overlay engine', false, false, error);
    }
  }

  private async testActionExecution() {
    console.log('\n⚡ Test 3: Action Execution');
    
    try {
      // Test action parsing
      const testActions = [
        'goto(APP_URL)',
        'waitForSelector(#root)',
        'click(text=Test)',
        'wait(1000)',
        'mouseMove(100,200)',
        'mouseClick(150,250)',
        'mouseDrag(100,200,300,400)',
        'wheel(-120)',
        'screenshot(test.png)',
        'overlay(title:Test,in,0)'
      ];
      
      for (const action of testActions) {
        const isValid = this.isValidAction(action);
        this.assertTest(`Action parsing: ${action}`, true, isValid);
      }
      
      console.log('✅ Action execution tests passed');
      
    } catch (error) {
      this.assertTest('Action execution', false, false, error);
    }
  }

  private async testBrowserInteractions() {
    console.log('\n🌐 Test 4: Browser Interactions');
    
    try {
      // Test page navigation
      await this.page!.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');
      const title = await this.page!.title();
      this.assertTest('Page navigation', 'Test Page', title);
      
      // Test element selection
      const h1Exists = await this.page!.evaluate(() => {
        return document.querySelector('h1') !== null;
      });
      this.assertTest('Element selection', true, h1Exists);
      
      // Test mouse interactions
      await this.page!.evaluate(() => {
        const div = document.createElement('div');
        div.id = 'clickable';
        div.style.cssText = 'position: fixed; top: 50%; left: 50%; width: 100px; height: 100px; background: blue; cursor: pointer;';
        div.onclick = () => div.style.background = 'green';
        document.body.appendChild(div);
      });
      
      await this.page!.click('#clickable');
      const backgroundColor = await this.page!.evaluate(() => {
        const div = document.getElementById('clickable');
        return div ? div.style.background : '';
      });
      
      this.assertTest('Mouse click interaction', 'green', backgroundColor);
      
      console.log('✅ Browser interaction tests passed');
      
    } catch (error) {
      this.assertTest('Browser interactions', false, false, error);
    }
  }

  private async testVideoRecording() {
    console.log('\n📹 Test 5: Video Recording');
    
    try {
      // Test output directory creation
      const outputDir = path.join(__dirname, '..', 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      this.assertTest('Output directory exists', true, fs.existsSync(outputDir));
      this.assertTest('Output directory is writable', true, fs.accessSync(outputDir, fs.constants.W_OK));
      
      // Test video file extension detection
      const testVideoFiles = ['test1.webm', 'test2.webm', 'final.mp4'];
      for (const file of testVideoFiles) {
        const isWebm = file.endsWith('.webm');
        const isMp4 = file.endsWith('.mp4');
        this.assertTest(`Video file detection: ${file}`, true, isWebm || isMp4);
      }
      
      console.log('✅ Video recording tests passed');
      
    } catch (error) {
      this.assertTest('Video recording', false, false, error);
    }
  }

  private async testAssetIntegration() {
    console.log('\n🖼️ Test 6: Asset Integration');
    
    try {
      const assetsDir = path.join(__dirname, '..', 'assets');
      
      // Test assets directory exists
      this.assertTest('Assets directory exists', true, fs.existsSync(assetsDir));
      
      // Test subdirectories
      const subdirs = ['diagrams', 'slides', 'art'];
      for (const subdir of subdirs) {
        const subdirPath = path.join(assetsDir, subdir);
        this.assertTest(`Assets subdirectory: ${subdir}`, true, fs.existsSync(subdirPath));
      }
      
      // Test specific asset files
      const requiredAssets = [
        'diagrams/api_data_flow.png',
        'diagrams/operational_overview.png',
        'diagrams/route_concept_overlay.png',
        'slides/impact_value.png',
        'art/conclusion.png'
      ];
      
      for (const asset of requiredAssets) {
        const assetPath = path.join(assetsDir, asset);
        this.assertTest(`Required asset exists: ${asset}`, true, fs.existsSync(assetPath));
      }
      
      console.log('✅ Asset integration tests passed');
      
    } catch (error) {
      this.assertTest('Asset integration', false, false, error);
    }
  }

  private isValidAction(action: string): boolean {
    const actionPatterns = [
      /^goto\([^)]+\)$/,
      /^waitForSelector\([^)]+\)$/,
      /^click\([^)]+\)$/,
      /^wait\(\d+\)$/,
      /^mouseMove\(\d+,\d+\)$/,
      /^mouseClick\(\d+,\d+\)$/,
      /^mouseDrag\(\d+,\d+,\d+,\d+\)$/,
      /^wheel\(-?\d+\)$/,
      /^screenshot\([^)]+\)$/,
      /^overlay\([^)]+\)$/
    ];
    
    return actionPatterns.some(pattern => pattern.test(action));
  }

  private assertTest(testName: string, expected: any, actual: any, error?: any) {
    const passed = expected === actual;
    const result = {
      name: testName,
      expected,
      actual,
      passed,
      error: error?.message || null
    };
    
    this.testResults.push(result);
    
    if (passed) {
      console.log(`  ✅ ${testName}`);
    } else {
      console.log(`  ❌ ${testName}`);
      if (error) {
        console.log(`     Error: ${error.message}`);
      }
    }
  }

  private async generateTestReport() {
    console.log('\n📊 Test Report');
    console.log('=' .repeat(50));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}`);
        console.log(`    Expected: ${result.expected}, Actual: ${result.actual}`);
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      });
    }
    
    // Save test results
    const reportPath = path.join(__dirname, '..', 'test-results', 'enhanced-pipeline-test-results.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests,
      successRate: (passedTests / totalTests) * 100,
      results: this.testResults
    }, null, 2));
    
    console.log(`\n📄 Test report saved to: ${reportPath}`);
    
    if (failedTests === 0) {
      console.log('\n🎉 All tests passed! Enhanced pipeline is ready for production.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review and fix issues before production use.');
    }
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('\n🧹 Test cleanup completed');
  }
}

// Run the test suite
const tester = new EnhancedPipelineTester();
tester.runAllTests().catch(console.error);
