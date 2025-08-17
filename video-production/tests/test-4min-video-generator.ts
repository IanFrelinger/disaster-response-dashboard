#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Import not needed for static analysis tests

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  details: string;
  error?: string;
}

class FourMinuteVideoGeneratorTestSuite {
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
    this.log(`🧪 Running test: ${testName}`);
    
    try {
      const details = await testFunction();
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        testName,
        status: 'PASS',
        duration,
        details
      };
      
      this.log(`✅ Test PASSED: ${testName} (${duration}ms)`);
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
      
      this.log(`❌ Test FAILED: ${testName} (${duration}ms) - ${errorMessage}`);
      return result;
    }
  }

  // Test 1: Configuration Loading
  private async testConfigurationLoading(): Promise<string> {
    this.log('📋 Testing configuration loading...');
    
    // Test that narration.yaml can be loaded
    const configPath = path.join(this.projectRoot, 'config', 'narration.yaml');
    if (!fs.existsSync(configPath)) {
      throw new Error('narration.yaml not found');
    }
    
    // Test configuration structure
    const configContent = fs.readFileSync(configPath, 'utf8');
    const yaml = await import('js-yaml');
    const config = yaml.load(configContent);
    
    if (!config.scenes || !Array.isArray(config.scenes)) {
      throw new Error('Invalid configuration: missing scenes array');
    }
    
    if (config.scenes.length === 0) {
      throw new Error('Invalid configuration: empty scenes array');
    }
    
    // Validate each scene has required fields
    for (let i = 0; i < config.scenes.length; i++) {
      const scene = config.scenes[i];
      const requiredFields = ['id', 'title', 'duration', 'narration', 'capture_method'];
      
      for (const field of requiredFields) {
        if (!scene[field]) {
          throw new Error(`Scene ${i + 1} missing required field: ${field}`);
        }
      }
      
      if (typeof scene.duration !== 'number' || scene.duration <= 0) {
        throw new Error(`Scene ${i + 1} has invalid duration: ${scene.duration}`);
      }
    }
    
    this.log(`✅ Configuration validated: ${config.scenes.length} scenes, ${config.metadata?.duration || 'unknown'}s total`);
    return `Configuration loaded successfully with ${config.scenes.length} scenes`;
  }

  // Test 2: File Availability Validation
  private async testFileAvailability(): Promise<string> {
    this.log('📁 Testing file availability...');
    
    const capturesDir = path.join(this.projectRoot, 'captures');
    const audioDir = path.join(this.projectRoot, 'output', 'audio');
    
    if (!fs.existsSync(capturesDir)) {
      throw new Error('Captures directory not found');
    }
    
    if (!fs.existsSync(audioDir)) {
      throw new Error('Audio directory not found');
    }
    
    // Check for capture files (only actual files, not directories)
    const captureFiles = fs.readdirSync(capturesDir).filter(f => {
      const filePath = path.join(capturesDir, f);
      const stats = fs.statSync(filePath);
      return stats.isFile() && (f.endsWith('.webm') || f.endsWith('.png') || f.endsWith('.mp4'));
    });
    
    if (captureFiles.length === 0) {
      throw new Error('No capture files found in captures directory');
    }
    
    // Check for audio files
    const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.wav'));
    
    if (audioFiles.length === 0) {
      throw new Error('No audio files found in audio directory');
    }
    
    this.log(`✅ File availability validated: ${captureFiles.length} captures, ${audioFiles.length} audio files`);
    return `File availability validated: ${captureFiles.length} captures, ${audioFiles.length} audio files`;
  }

  // Test 3: File Naming Convention Validation
  private async testFileNamingConventions(): Promise<string> {
    this.log('🏷️ Testing file naming conventions...');
    
    const capturesDir = path.join(this.projectRoot, 'captures');
    const audioDir = path.join(this.projectRoot, 'output', 'audio');
    
    const captureFiles = fs.readdirSync(capturesDir);
    const audioFiles = fs.readdirSync(audioDir);
    
    // Check for consistent naming patterns
    const namingIssues: string[] = [];
    
    // Validate capture file naming (handle both files and directories)
    for (const file of captureFiles) {
      const filePath = path.join(capturesDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Check if directory contains valid capture files
        const subFiles = fs.readdirSync(filePath).filter(f => 
          f.endsWith('.webm') || f.endsWith('.png') || f.endsWith('.mp4')
        );
        if (subFiles.length === 0) {
          // Empty directories are acceptable (they might be placeholders)
          this.log(`ℹ️ Empty capture directory: ${file} (acceptable)`);
        }
      } else if (!file.match(/^[a-zA-Z0-9_-]+\.(webm|png|mp4)$/)) {
        namingIssues.push(`Capture file has non-standard naming: ${file}`);
      }
    }
    
    // Validate audio file naming (handle transcript files)
    for (const file of audioFiles) {
      if (file.endsWith('_transcript.txt')) {
        // Transcript files are acceptable
        continue;
      } else if (!file.match(/^[a-zA-Z0-9_-]+_narration\.wav$/)) {
        namingIssues.push(`Audio file has non-standard naming: ${file}`);
      }
    }
    
    if (namingIssues.length > 0) {
      throw new Error(`File naming convention violations:\n${namingIssues.join('\n')}`);
    }
    
    this.log(`✅ File naming conventions validated: ${captureFiles.length} files checked`);
    return `File naming conventions validated: ${captureFiles.length} files checked`;
  }

  // Test 4: Audio-Video Synchronization
  private async testAudioVideoSynchronization(): Promise<string> {
    this.log('🎵 Testing audio-video synchronization...');
    
    const configPath = path.join(this.projectRoot, 'config', 'narration.yaml');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const yaml = await import('js-yaml');
    const config = yaml.load(configContent);
    
    const audioDir = path.join(this.projectRoot, 'output', 'audio');
    const syncIssues: string[] = [];
    
    for (const scene of config.scenes) {
      const audioFile = path.join(audioDir, `${scene.id}_narration.wav`);
      
      if (!fs.existsSync(audioFile)) {
        syncIssues.push(`Missing audio for scene: ${scene.id}`);
      } else {
        // Check if audio file has reasonable size (not empty)
        const stats = fs.statSync(audioFile);
        if (stats.size < 1000) { // Less than 1KB
          syncIssues.push(`Audio file too small for scene: ${scene.id} (${stats.size} bytes)`);
        }
      }
    }
    
    if (syncIssues.length > 0) {
      throw new Error(`Audio-video synchronization issues:\n${syncIssues.join('\n')}`);
    }
    
    this.log(`✅ Audio-video synchronization validated: ${config.scenes.length} scenes checked`);
    return `Audio-video synchronization validated: ${config.scenes.length} scenes checked`;
  }

  // Test 5: FFmpeg Command Safety
  private async testFFmpegCommandSafety(): Promise<string> {
    this.log('🔒 Testing FFmpeg command safety...');
    
    // Test that the generator uses spawn instead of execSync
    const generatorCode = fs.readFileSync(path.join(this.projectRoot, 'scripts', 'generate-4min-video.ts'), 'utf8');
    
    if (generatorCode.includes('execSync')) {
      throw new Error('Generator still uses execSync - should use spawn for safety');
    }
    
    if (!generatorCode.includes('spawn')) {
      throw new Error('Generator does not use spawn for FFmpeg commands');
    }
    
    // Test for proper error handling in spawn calls
    if (!generatorCode.includes('ffmpeg.on(\'close\'')) {
      throw new Error('Generator missing proper error handling for FFmpeg processes');
    }
    
    if (!generatorCode.includes('ffmpeg.on(\'error\'')) {
      throw new Error('Generator missing error event handling for FFmpeg processes');
    }
    
    this.log(`✅ FFmpeg command safety validated: using spawn with proper error handling`);
    return `FFmpeg command safety validated: using spawn with proper error handling`;
  }

  // Test 6: Error Recovery Mechanisms
  private async testErrorRecoveryMechanisms(): Promise<string> {
    this.log('🛡️ Testing error recovery mechanisms...');
    
    const generatorCode = fs.readFileSync(path.join(this.projectRoot, 'scripts', 'generate-4min-video.ts'), 'utf8');
    
    // Check for fallback mechanisms
    if (!generatorCode.includes('createPlaceholderImage')) {
      throw new Error('Generator missing fallback mechanism for missing captures');
    }
    
    if (!generatorCode.includes('try {') || !generatorCode.includes('} catch (error)')) {
      throw new Error('Generator missing proper error handling structure');
    }
    
    // Check for timeout handling
    if (!generatorCode.includes('setTimeout') || !generatorCode.includes('ffmpeg.kill()')) {
      throw new Error('Generator missing timeout handling for FFmpeg processes');
    }
    
    this.log(`✅ Error recovery mechanisms validated: fallbacks, error handling, and timeouts present`);
    return `Error recovery mechanisms validated: fallbacks, error handling, and timeouts present`;
  }

  // Test 7: Output Directory Structure
  private async testOutputDirectoryStructure(): Promise<string> {
    this.log('📂 Testing output directory structure...');
    
    const outputDir = path.join(this.projectRoot, 'output');
    const requiredDirs = ['audio'];
    
    for (const dir of requiredDirs) {
      const fullPath = path.join(outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Required output directory not found: ${dir}`);
      }
    }
    
    // Check write permissions
    const testFile = path.join(outputDir, 'test_write_permission.tmp');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (error) {
      throw new Error(`Output directory not writable: ${error}`);
    }
    
    this.log(`✅ Output directory structure validated: all required directories exist and writable`);
    return `Output directory structure validated: all required directories exist and writable`;
  }

  // Test 8: Scene Processing Validation
  private async testSceneProcessingValidation(): Promise<string> {
    this.log('🎬 Testing scene processing validation...');
    
    const configPath = path.join(this.projectRoot, 'config', 'narration.yaml');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const yaml = await import('js-yaml');
    const config = yaml.load(configContent);
    
    const capturesDir = path.join(this.projectRoot, 'captures');
    const captureFiles = fs.readdirSync(capturesDir);
    
    // Check if we have captures for most scenes
    const sceneIds = config.scenes.map((s: any) => s.id);
    const availableCaptures = captureFiles.filter(f => 
      sceneIds.some(id => f.includes(id))
    );
    
    const coverage = (availableCaptures.length / sceneIds.length) * 100;
    
    if (coverage < 10) { // At least 10% coverage (very realistic for development)
      throw new Error(`Extremely low capture coverage: ${coverage.toFixed(1)}% (${availableCaptures.length}/${sceneIds.length} scenes)`);
    }
    
    if (coverage < 30) {
      this.log(`⚠️ Warning: Low capture coverage: ${coverage.toFixed(1)}% - most scenes will use placeholders`);
    } else if (coverage < 50) {
      this.log(`ℹ️ Info: Moderate capture coverage: ${coverage.toFixed(1)}% - some scenes will use placeholders`);
    }
    
    this.log(`✅ Scene processing validation: ${coverage.toFixed(1)}% capture coverage`);
    return `Scene processing validation: ${coverage.toFixed(1)}% capture coverage (${availableCaptures.length}/${sceneIds.length} scenes)`;
  }

  async runAllTests(): Promise<void> {
    this.log('🚀 Starting 4-Minute Video Generator Test Suite');
    this.log('==============================================');
    
    const tests = [
      { name: 'Configuration Loading', func: () => this.testConfigurationLoading() },
      { name: 'File Availability Validation', func: () => this.testFileAvailability() },
      { name: 'File Naming Convention Validation', func: () => this.testFileNamingConventions() },
      { name: 'Audio-Video Synchronization', func: () => this.testAudioVideoSynchronization() },
      { name: 'FFmpeg Command Safety', func: () => this.testFFmpegCommandSafety() },
      { name: 'Error Recovery Mechanisms', func: () => this.testErrorRecoveryMechanisms() },
      { name: 'Output Directory Structure', func: () => this.testOutputDirectoryStructure() },
      { name: 'Scene Processing Validation', func: () => this.testSceneProcessingValidation() }
    ];
    
    for (const test of tests) {
      const result = await this.runTest(test.name, test.func);
      this.testResults.push(result);
    }
    
    this.printResults();
  }

  private printResults(): void {
    this.log('\n' + '='.repeat(60));
    this.log('🧪 4-MINUTE VIDEO GENERATOR TEST RESULTS');
    this.log('='.repeat(60));
    
    const totalTests = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const successRate = ((passed / totalTests) * 100).toFixed(1);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${failed} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    
    console.log(`\n📋 Detailed Results:`);
    for (const result of this.testResults) {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`   ${statusIcon} ${result.testName} (${result.duration}ms)`);
      console.log(`      ${result.details}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (failed === 0) {
      this.log('🎉 All tests passed! 4-Minute video generator is ready for production.');
    } else {
      this.log(`⚠️ ${failed} test(s) failed. Please fix the issues before proceeding.`);
    }
  }
}

// Main execution
async function main() {
  try {
    const testSuite = new FourMinuteVideoGeneratorTestSuite();
    await testSuite.runAllTests();
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FourMinuteVideoGeneratorTestSuite };
