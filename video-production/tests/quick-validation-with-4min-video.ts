#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  details: string;
  error?: string;
}

class QuickValidationWith4MinVideoTest {
  private projectRoot: string;
  private testResults: TestResult[] = [];

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  private async runTest(testName: string, testFunction: () => Promise<string>): Promise<TestResult> {
    const startTime = Date.now();
    this.log(`🧪 Quick Test: ${testName}`);
    
    try {
      const details = await testFunction();
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        testName,
        status: 'PASS',
        duration,
        details
      };
      
      this.log(`✅ PASS: ${testName} (${duration}ms)`);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: TestResult = {
        testName,
        status: 'FAIL',
        duration,
        details: `Test failed with error: ${errorMessage}`,
        error: errorMessage
      };
      
      this.log(`❌ FAIL: ${testName} (${duration}ms) - ${errorMessage}`);
      return result;
    }
  }

  // Test 1: Core Components
  private async testCoreComponents(): Promise<string> {
    this.log('🔧 Testing core components...');
    
    // Check if key directories exist
    const requiredDirs = ['captures', 'output', 'config', 'scripts'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Required directory not found: ${dir}`);
      }
    }
    
    // Check if key files exist
    const requiredFiles = [
      'config/narration.yaml',
      'scripts/generate-4min-video.ts',
      'tests/test-4min-video-generator.ts'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${file}`);
      }
    }
    
    return 'Core components validated successfully';
  }

  // Test 2: 4-Minute Video Generator Configuration
  private async test4MinVideoConfig(): Promise<string> {
    this.log('📋 Testing 4-minute video configuration...');
    
    const configPath = path.join(this.projectRoot, 'config', 'narration.yaml');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Basic YAML validation
    if (!configContent.includes('scenes:')) {
      throw new Error('narration.yaml missing scenes section');
    }
    
    if (!configContent.includes('metadata:')) {
      throw new Error('narration.yaml missing metadata section');
    }
    
    // Check for required scene fields
    const requiredSceneFields = ['id', 'title', 'duration', 'capture_method'];
    for (const field of requiredSceneFields) {
      if (!configContent.includes(field + ':')) {
        throw new Error(`narration.yaml missing required field: ${field}`);
      }
    }
    
    return '4-minute video configuration validated successfully';
  }

  // Test 3: File Availability Check
  private async testFileAvailability(): Promise<string> {
    this.log('📁 Testing file availability...');
    
    const capturesDir = path.join(this.projectRoot, 'captures');
    const audioDir = path.join(this.projectRoot, 'output', 'audio');
    
    // Check captures
    if (!fs.existsSync(capturesDir)) {
      throw new Error('Captures directory not found');
    }
    
    const captureFiles = fs.readdirSync(capturesDir).filter(f => 
      f.endsWith('.webm') || f.endsWith('.png') || f.endsWith('.mp4')
    );
    
    if (captureFiles.length === 0) {
      throw new Error('No capture files found');
    }
    
    // Check audio files
    if (!fs.existsSync(audioDir)) {
      throw new Error('Audio directory not found');
    }
    
    const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.wav'));
    
    if (audioFiles.length === 0) {
      throw new Error('No audio files found');
    }
    
    return `File availability validated: ${captureFiles.length} captures, ${audioFiles.length} audio files`;
  }

  // Test 4: FFmpeg Command Safety
  private async testFFmpegCommandSafety(): Promise<string> {
    this.log('🔒 Testing FFmpeg command safety...');
    
    const generatorPath = path.join(this.projectRoot, 'scripts', 'generate-4min-video.ts');
    const generatorCode = fs.readFileSync(generatorPath, 'utf8');
    
    // Check for spawn usage (safe)
    if (!generatorCode.includes('spawn')) {
      throw new Error('Generator does not use spawn for FFmpeg commands');
    }
    
    // Check for execSync usage (unsafe)
    if (generatorCode.includes('execSync')) {
      throw new Error('Generator still uses execSync - should use spawn for safety');
    }
    
    // Check for proper error handling
    if (!generatorCode.includes('ffmpeg.on(\'close\'')) {
      throw new Error('Generator missing proper error handling for FFmpeg processes');
    }
    
    return 'FFmpeg command safety validated successfully';
  }

  // Test 5: Error Recovery Mechanisms
  private async testErrorRecoveryMechanisms(): Promise<string> {
    this.log('🛡️ Testing error recovery mechanisms...');
    
    const generatorPath = path.join(this.projectRoot, 'scripts', 'generate-4min-video.ts');
    const generatorCode = fs.readFileSync(generatorPath, 'utf8');
    
    // Check for fallback mechanisms
    if (!generatorCode.includes('createPlaceholderImage')) {
      throw new Error('Generator missing fallback mechanism for missing captures');
    }
    
    // Check for error handling structure
    if (!generatorCode.includes('try {') || !generatorCode.includes('} catch (error)')) {
      throw new Error('Generator missing proper error handling structure');
    }
    
    // Check for timeout handling
    if (!generatorCode.includes('setTimeout') || !generatorCode.includes('ffmpeg.kill()')) {
      throw new Error('Generator missing timeout handling for FFmpeg processes');
    }
    
    return 'Error recovery mechanisms validated successfully';
  }

  async runAllTests(): Promise<void> {
    this.log('🚀 Starting Quick Validation Test Suite (with 4-Min Video)');
    this.log('========================================================');
    
    const tests = [
      { name: 'Core Components', func: () => this.testCoreComponents() },
      { name: '4-Min Video Config', func: () => this.test4MinVideoConfig() },
      { name: 'File Availability', func: () => this.testFileAvailability() },
      { name: 'FFmpeg Command Safety', func: () => this.testFFmpegCommandSafety() },
      { name: 'Error Recovery Mechanisms', func: () => this.testErrorRecoveryMechanisms() }
    ];
    
    for (const test of tests) {
      const result = await this.runTest(test.name, test.func);
      this.testResults.push(result);
    }
    
    this.printResults();
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 QUICK VALIDATION TEST RESULTS (WITH 4-MIN VIDEO)');
    console.log('='.repeat(60));
    
    const totalTests = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const successRate = ((passed / totalTests) * 100).toFixed(1);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${failed} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    
    console.log(`\n📋 Results:`);
    for (const result of this.testResults) {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`   ${statusIcon} ${result.testName} (${result.duration}ms)`);
      console.log(`      ${result.details}`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (failed === 0) {
      console.log('🎉 All quick validation tests passed!');
      console.log('🚀 4-Minute video generator is ready for testing.');
    } else {
      console.log(`⚠️ ${failed} test(s) failed. Please fix the issues before proceeding.`);
    }
  }
}

// Main execution
async function main() {
  try {
    const testSuite = new QuickValidationWith4MinVideoTest();
    await testSuite.runAllTests();
  } catch (error) {
    console.error('❌ Quick validation test suite failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { QuickValidationWith4MinVideoTest };
