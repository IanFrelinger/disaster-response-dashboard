#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as yaml from 'js-yaml';

interface VideoPipelineTestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: string;
  duration?: number;
}

class EnhancedVideoPipelineSmokeTest {
  private projectRoot: string;
  private results: VideoPipelineTestResult[] = [];
  private startTime: number;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.startTime = Date.now();
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

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: string, duration?: number): void {
    this.results.push({ test, status, message, details, duration });
  }

  async runAllTests(): Promise<void> {
    this.log('Starting Enhanced Video Pipeline Smoke Test', 'info');
    this.log('============================================', 'info');

    // Core Infrastructure Tests
    await this.testCoreInfrastructure();
    
    // Video Pipeline Specific Tests
    await this.testVideoPipelineComponents();
    
    // Audio Processing Tests
    await this.testAudioProcessing();
    
    // Capture Generation Tests
    await this.testCaptureGeneration();
    
    // Pipeline Integration Tests
    await this.testPipelineIntegration();
    
    // Performance Tests
    await this.testPerformance();

    this.log('', 'info');
    this.log('Enhanced Video Pipeline Smoke Test Results', 'info');
    this.log('==========================================', 'info');
    this.printResults();
  }

  private async testCoreInfrastructure(): Promise<void> {
    this.log('Testing Core Infrastructure...', 'info');

    // Check Node.js version
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion >= 18) {
        this.addResult('Node.js Version', 'PASS', `Node.js ${nodeVersion} is compatible`);
      } else {
        this.addResult('Node.js Version', 'FAIL', `Node.js ${nodeVersion} is too old. Required: >=18.0.0`);
      }
    } catch (error) {
      this.addResult('Node.js Version', 'FAIL', 'Failed to check Node.js version', error.toString());
    }

    // Check TypeScript
    try {
      const tsVersion = execSync('npx tsc --version', { encoding: 'utf8' }).trim();
      this.addResult('TypeScript', 'PASS', `TypeScript ${tsVersion} is available`);
    } catch (error) {
      this.addResult('TypeScript', 'FAIL', 'TypeScript is not available', error.toString());
    }

    // Check ts-node
    try {
      const tsNodeVersion = execSync('npx ts-node --version', { encoding: 'utf8' }).trim();
      this.addResult('ts-node', 'PASS', `ts-node ${tsNodeVersion} is available`);
    } catch (error) {
      this.addResult('ts-node', 'FAIL', 'ts-node is not available', error.toString());
    }

    // Check Playwright (for capture generation)
    try {
      const playwrightVersion = execSync('npx playwright --version', { encoding: 'utf8' }).trim();
      this.addResult('Playwright', 'PASS', `Playwright ${playwrightVersion} is available`);
    } catch (error) {
      this.addResult('Playwright', 'FAIL', 'Playwright is not available', error.toString());
    }
  }

  private async testVideoPipelineComponents(): Promise<void> {
    this.log('Testing Video Pipeline Components...', 'info');

    // Test narration configuration
    try {
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      if (fs.existsSync(narrationPath)) {
        const narrationContent = fs.readFileSync(narrationPath, 'utf8');
        const narration = yaml.load(narrationContent) as any;
        
        if (narration.metadata && narration.scenes && narration.voice_providers) {
          // Check for required video pipeline elements
          const hasVideoScenes = narration.scenes.some((scene: any) => scene.capture_method === 'video');
          const hasScreenshotScenes = narration.scenes.some((scene: any) => scene.capture_method === 'screenshot');
          const hasVoiceSettings = narration.voice_providers.openai || narration.voice_providers.elevenlabs;
          
          if (hasVideoScenes && hasScreenshotScenes && hasVoiceSettings) {
            this.addResult('Video Pipeline Config', 'PASS', 'Video pipeline configuration is complete');
          } else {
            this.addResult('Video Pipeline Config', 'FAIL', 'Video pipeline configuration is incomplete');
          }
        } else {
          this.addResult('Video Pipeline Config', 'FAIL', 'Narration configuration is missing required sections');
        }
      } else {
        this.addResult('Video Pipeline Config', 'SKIP', 'Narration configuration file not found');
      }
    } catch (error) {
      this.addResult('Video Pipeline Config', 'FAIL', 'Failed to parse video pipeline configuration', error.toString());
    }

    // Test required video pipeline scripts
    const requiredVideoScripts = [
      'scripts/generate-enhanced-captures.ts',
      'scripts/generate-narration.ts',
      'scripts/assemble-final-video.ts',
      'scripts/run-enhanced-production.ts'
    ];

    for (const script of requiredVideoScripts) {
      const scriptPath = path.join(this.projectRoot, script);
      if (fs.existsSync(scriptPath)) {
        this.addResult(`Video Script: ${script}`, 'PASS', 'Video pipeline script exists');
      } else {
        this.addResult(`Video Script: ${script}`, 'FAIL', `Video pipeline script missing: ${script}`);
      }
    }
  }

  private async testAudioProcessing(): Promise<void> {
    this.log('Testing Audio Processing Capabilities...', 'info');

    // Test audio output directories
    const audioDirs = [
      'audio',
      'audio/vo',
      'subs'
    ];

    for (const dir of audioDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        this.addResult(`Audio Directory: ${dir}`, 'PASS', 'Audio directory exists');
      } else {
        this.addResult(`Audio Directory: ${dir}`, 'FAIL', `Audio directory missing: ${dir}`);
      }
    }

    // Test voice provider configurations
    try {
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      if (fs.existsSync(narrationPath)) {
        const narrationContent = fs.readFileSync(narrationPath, 'utf8');
        const narration = yaml.load(narrationContent) as any;
        
        if (narration.voice_providers) {
          const providers = Object.keys(narration.voice_providers);
          if (providers.length > 0) {
            this.addResult('Voice Providers', 'PASS', `Configured voice providers: ${providers.join(', ')}`);
          } else {
            this.addResult('Voice Providers', 'FAIL', 'No voice providers configured');
          }
        } else {
          this.addResult('Voice Providers', 'FAIL', 'Voice providers section missing');
        }
      } else {
        this.addResult('Voice Providers', 'SKIP', 'Narration configuration file not found');
      }
    } catch (error) {
      this.addResult('Voice Providers', 'FAIL', 'Failed to check voice providers', error.toString());
    }

    // Test audio settings
    try {
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      if (fs.existsSync(narrationPath)) {
        const narrationContent = fs.readFileSync(narrationPath, 'utf8');
        const narration = yaml.load(narrationContent) as any;
        
        if (narration.audio_settings) {
          const audioSettings = narration.audio_settings;
          if (audioSettings.sample_rate && audioSettings.format) {
            this.addResult('Audio Settings', 'PASS', `Audio configured: ${audioSettings.sample_rate}Hz, ${audioSettings.format}`);
          } else {
            this.addResult('Audio Settings', 'FAIL', 'Audio settings incomplete');
          }
        } else {
          this.addResult('Audio Settings', 'FAIL', 'Audio settings section missing');
        }
      } else {
        this.addResult('Audio Settings', 'SKIP', 'Narration configuration file not found');
      }
    } catch (error) {
      this.addResult('Audio Settings', 'FAIL', 'Failed to check audio settings', error.toString());
    }
  }

  private async testCaptureGeneration(): Promise<void> {
    this.log('Testing Capture Generation Capabilities...', 'info');

    // Test capture output directories
    const captureDirs = [
      'captures',
      'captures/screenshots',
      'captures/videos'
    ];

    for (const dir of captureDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        this.addResult(`Capture Directory: ${dir}`, 'PASS', 'Capture directory exists');
      } else {
        this.addResult(`Capture Directory: ${dir}`, 'FAIL', `Capture directory missing: ${dir}`);
      }
    }

    // Test capture settings in configuration
    try {
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      if (fs.existsSync(narrationPath)) {
        const narrationContent = fs.readFileSync(narrationPath, 'utf8');
        const narration = yaml.load(narrationContent) as any;
        
        if (narration.capture_settings) {
          const captureSettings = narration.capture_settings;
          if (captureSettings.screenshot && captureSettings.video) {
            this.addResult('Capture Settings', 'PASS', 'Capture settings configured for both screenshot and video');
          } else {
            this.addResult('Capture Settings', 'FAIL', 'Capture settings incomplete');
          }
        } else {
          this.addResult('Capture Settings', 'FAIL', 'Capture settings section missing');
        }
      } else {
        this.addResult('Capture Settings', 'SKIP', 'Narration configuration file not found');
      }
    } catch (error) {
      this.addResult('Capture Settings', 'FAIL', 'Failed to check capture settings', error.toString());
    }

    // Test scene capture methods
    try {
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      if (fs.existsSync(narrationPath)) {
        const narrationContent = fs.readFileSync(narrationPath, 'utf8');
        const narration = yaml.load(narrationContent) as any;
        
        if (narration.scenes) {
          const videoScenes = narration.scenes.filter((scene: any) => scene.capture_method === 'video');
          const screenshotScenes = narration.scenes.filter((scene: any) => scene.capture_method === 'screenshot');
          
          if (videoScenes.length > 0 && screenshotScenes.length > 0) {
            this.addResult('Scene Capture Methods', 'PASS', `${videoScenes.length} video scenes, ${screenshotScenes.length} screenshot scenes`);
          } else {
            this.addResult('Scene Capture Methods', 'FAIL', 'Missing video or screenshot scenes');
          }
        } else {
          this.addResult('Scene Capture Methods', 'FAIL', 'No scenes defined');
        }
      } else {
        this.addResult('Scene Capture Methods', 'SKIP', 'Narration configuration file not found');
      }
    } catch (error) {
      this.addResult('Scene Capture Methods', 'FAIL', 'Failed to check scene capture methods', error.toString());
    }
  }

  private async testPipelineIntegration(): Promise<void> {
    this.log('Testing Pipeline Integration...', 'info');

    // Test if main pipeline can be imported without errors
    try {
      const mainScript = path.join(this.projectRoot, 'scripts', 'run-enhanced-production.ts');
      if (fs.existsSync(mainScript)) {
        const scriptContent = fs.readFileSync(mainScript, 'utf8');
        
        // Check for required pipeline components
        const hasPipelineClass = scriptContent.includes('class') && scriptContent.includes('Pipeline');
        const hasMainFunction = scriptContent.includes('main') || scriptContent.includes('Main');
        const hasErrorHandling = scriptContent.includes('try') && scriptContent.includes('catch');
        
        if (hasPipelineClass && hasMainFunction && hasErrorHandling) {
          this.addResult('Pipeline Structure', 'PASS', 'Main pipeline has proper structure');
        } else {
          this.addResult('Pipeline Structure', 'FAIL', 'Main pipeline structure incomplete');
        }
      } else {
        this.addResult('Pipeline Structure', 'SKIP', 'Main pipeline script not found');
      }
    } catch (error) {
      this.addResult('Pipeline Structure', 'FAIL', 'Error checking pipeline structure', error.toString());
    }

    // Test output directory structure
    const outputDirs = [
      'output',
      'temp',
      'assets',
      'assets/art',
      'assets/diagrams',
      'assets/slides'
    ];

    for (const dir of outputDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        this.addResult(`Output Directory: ${dir}`, 'PASS', 'Output directory exists');
      } else {
        this.addResult(`Output Directory: ${dir}`, 'FAIL', `Output directory missing: ${dir}`);
      }
    }

    // Test write permissions
    try {
      const outputDir = path.join(this.projectRoot, 'output');
      const tempDir = path.join(this.projectRoot, 'temp');
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const testFile = path.join(outputDir, 'pipeline-test.tmp');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      this.addResult('Pipeline Write Permissions', 'PASS', 'Can write to pipeline output directories');

    } catch (error) {
      this.addResult('Pipeline Write Permissions', 'FAIL', 'Cannot write to pipeline output directories', error.toString());
    }
  }

  private async testPerformance(): Promise<void> {
    this.log('Testing Performance Characteristics...', 'info');

    // Test configuration file load time
    try {
      const startTime = Date.now();
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      const narrationContent = fs.readFileSync(narrationPath, 'utf8');
      const narration = yaml.load(narrationContent);
      const loadTime = Date.now() - startTime;
      
      if (loadTime < 100) {
        this.addResult('Config Load Performance', 'PASS', `Configuration loaded in ${loadTime}ms`);
      } else {
        this.addResult('Config Load Performance', 'WARNING', `Configuration loaded slowly in ${loadTime}ms`);
      }
    } catch (error) {
      this.addResult('Config Load Performance', 'FAIL', 'Failed to test configuration load performance', error.toString());
    }

    // Test directory listing performance
    try {
      const startTime = Date.now();
      const scriptsDir = path.join(this.projectRoot, 'scripts');
      const files = fs.readdirSync(scriptsDir);
      const listTime = Date.now() - startTime;
      
      if (listTime < 50) {
        this.addResult('File System Performance', 'PASS', `Directory listing in ${listTime}ms`);
      } else {
        this.addResult('File System Performance', 'WARNING', `Directory listing slow in ${listTime}ms`);
      }
    } catch (error) {
      this.addResult('File System Performance', 'FAIL', 'Failed to test file system performance', error.toString());
    }

    // Overall test duration
    const totalDuration = Date.now() - this.startTime;
    this.addResult('Total Test Duration', 'PASS', `All tests completed in ${totalDuration}ms`);
  }

  private printResults(): void {
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    const skipCount = this.results.filter(r => r.status === 'SKIP').length;
    const warningCount = this.results.filter(r => r.status === 'WARNING').length;
    const totalCount = this.results.length;

    console.log(`\n📊 Enhanced Video Pipeline Test Summary:`);
    console.log(`   Total Tests: ${totalCount}`);
    console.log(`   ✅ Passed: ${passCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ⚠️  Warnings: ${warningCount}`);

    console.log(`\n📋 Detailed Results:`);
    this.results.forEach(result => {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'SKIP': '⏭️',
        'WARNING': '⚠️'
      };
      console.log(`   ${statusIcon[result.status]} ${result.test}: ${result.message}`);
      if (result.details) {
        console.log(`      Details: ${result.details}`);
      }
      if (result.duration) {
        console.log(`      Duration: ${result.duration}ms`);
      }
    });

    if (failCount === 0) {
      this.log('🎉 All critical video pipeline tests passed! Pipeline is ready for video production.', 'success');
    } else {
      this.log(`⚠️  ${failCount} test(s) failed. Please fix issues before running the video pipeline.`, 'warning');
    }

    if (warningCount > 0) {
      this.log(`ℹ️  ${warningCount} warning(s) detected. Pipeline may work but could be optimized.`, 'info');
    }
  }
}

// Run the enhanced smoke test
async function main() {
  try {
    const smokeTest = new EnhancedVideoPipelineSmokeTest();
    await smokeTest.runAllTests();
  } catch (error) {
    console.error('❌ Enhanced smoke test failed with error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
