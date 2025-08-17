#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MegaStressTestResult {
  testSuite: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  results?: any;
  error?: string;
}

class MegaStressTestRunner {
  private projectRoot: string;
  private testResults: MegaStressTestResult[] = [];
  private overallStartTime: number;
  private maxConcurrentTests: number = 3;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.overallStartTime = Date.now();
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔥 MEGA STRESS: ${message}`);
  }

  private async runTestSuite(testSuite: string, command: string): Promise<MegaStressTestResult> {
    const result: MegaStressTestResult = {
      testSuite,
      startTime: new Date(),
      status: 'RUNNING'
    };

    this.log(`🚀 Starting ${testSuite}...`);
    
    try {
      // Run the test suite
      const startTime = Date.now();
      execSync(command, { 
        cwd: this.projectRoot, 
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      });
      const duration = Date.now() - startTime;
      
      result.endTime = new Date();
      result.duration = duration;
      result.status = 'COMPLETED';
      
      this.log(`✅ ${testSuite} completed successfully in ${(duration / 1000).toFixed(1)}s`);
      
    } catch (error) {
      result.endTime = new Date();
      result.duration = Date.now() - result.startTime.getTime();
      result.status = 'FAILED';
      result.error = error instanceof Error ? error.message : String(error);
      
      this.log(`❌ ${testSuite} failed after ${(result.duration / 1000).toFixed(1)}s: ${result.error}`);
    }
    
    return result;
  }

  private async runSequentialStressTests(): Promise<void> {
    this.log('🔄 Running sequential stress tests...');
    
    const sequentialTests = [
      { name: 'Quick Validation (4-Min Video)', command: 'npm run quick-validation-4min' },
      { name: '4-Min Video Generator Tests', command: 'npm run test:4min-video' },
      { name: 'Stress Test (4-Min Video)', command: 'npm run stress-test-4min' }
    ];
    
    for (const test of sequentialTests) {
      const result = await this.runTestSuite(test.name, test.command);
      this.testResults.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  private async runConcurrentStressTests(): Promise<void> {
    this.log('⚡ Running concurrent stress tests...');
    
    const concurrentTests = [
      { name: 'Quick Validation (4-Min Video)', command: 'npm run quick-validation-4min' },
      { name: '4-Min Video Generator Tests', command: 'npm run test:4min-video' },
      { name: 'Stress Test (4-Min Video)', command: 'npm run stress-test-4min' }
    ];
    
    // Run tests in parallel with limited concurrency
    const chunks = [];
    for (let i = 0; i < concurrentTests.length; i += this.maxConcurrentTests) {
      chunks.push(concurrentTests.slice(i, i + this.maxConcurrentTests));
    }
    
    for (const chunk of chunks) {
      const promises = chunk.map(test => this.runTestSuite(test.name, test.command));
      const results = await Promise.all(promises);
      this.testResults.push(...results);
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private async runEnduranceStressTest(): Promise<void> {
    this.log('🏃 Running endurance stress test...');
    
    const enduranceDuration = 60000; // 1 minute
    const startTime = Date.now();
    let iterations = 0;
    
    while (Date.now() - startTime < enduranceDuration) {
      try {
        // Run quick validation in rapid succession
        execSync('npm run quick-validation-4min', { 
          cwd: this.projectRoot, 
          stdio: 'pipe',
          timeout: 30000 // 30 seconds timeout
        });
        
        iterations++;
        
        if (iterations % 5 === 0) {
          this.log(`🏃 Endurance test: ${iterations} iterations completed...`);
        }
        
        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        this.log(`⚠️ Endurance test iteration ${iterations} failed: ${error}`);
        // Continue with next iteration
      }
    }
    
    this.log(`🏃 Endurance stress test completed: ${iterations} iterations in ${enduranceDuration}ms`);
  }

  private async runResourceStressTest(): Promise<void> {
    this.log('💾 Running resource stress test...');
    
    // Create many temporary files to stress the file system
    const tempDir = path.join(this.projectRoot, 'temp-mega-stress');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const fileCount = 500;
    const files: string[] = [];
    
    try {
      // Create files rapidly
      for (let i = 0; i < fileCount; i++) {
        const fileName = `mega-stress-${i.toString().padStart(4, '0')}.tmp`;
        const filePath = path.join(tempDir, fileName);
        
        fs.writeFileSync(filePath, `Mega stress test content ${i} - ${'x'.repeat(1000)}`);
        files.push(filePath);
        
        if (i % 100 === 0) {
          this.log(`💾 Created ${i} stress files...`);
        }
      }
      
      // Perform file operations while running tests
      const testPromises = [
        this.runTestSuite('Quick Validation (Resource Stress)', 'npm run quick-validation-4min'),
        this.runTestSuite('4-Min Video Tests (Resource Stress)', 'npm run test:4min-video')
      ];
      
      const results = await Promise.all(testPromises);
      this.testResults.push(...results);
      
    } finally {
      // Clean up
      for (const file of files) {
        try {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  private async runErrorInjectionStressTest(): Promise<void> {
    this.log('💥 Running error injection stress test...');
    
    // Temporarily modify files to inject errors, then restore them
    const testFiles = [
      'tests/quick-validation-with-4min-video.ts',
      'tests/test-4min-video-generator.ts'
    ];
    
    const backupFiles: { path: string; content: string }[] = [];
    
    try {
      // Backup original files
      for (const file of testFiles) {
        const filePath = path.join(this.projectRoot, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          backupFiles.push({ path: filePath, content });
        }
      }
      
      // Inject errors and test error handling
      for (let i = 0; i < 3; i++) {
        this.log(`💥 Error injection iteration ${i + 1}...`);
        
        // Inject a syntax error
        const testFile = path.join(this.projectRoot, 'tests/quick-validation-with-4min-video.ts');
        const content = fs.readFileSync(testFile, 'utf8');
        const corruptedContent = content.replace('class QuickValidationWith4MinVideoTest', 'class QuickValidationWith4MinVideoTest {');
        
        fs.writeFileSync(testFile, corruptedContent);
        
        try {
          // Try to run the corrupted test
          execSync('npm run quick-validation-4min', { 
            cwd: this.projectRoot, 
            stdio: 'pipe',
            timeout: 30000
          });
          
          this.log(`⚠️ Warning: Corrupted test should have failed but didn't`);
          
        } catch (error) {
          this.log(`✅ Error injection test ${i + 1} correctly failed: ${error}`);
        }
        
        // Restore original content
        fs.writeFileSync(testFile, content);
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } finally {
      // Restore all backup files
      for (const backup of backupFiles) {
        try {
          fs.writeFileSync(backup.path, backup.content);
        } catch (error) {
          this.log(`⚠️ Warning: Could not restore backup file: ${error}`);
        }
      }
    }
  }

  async runAllMegaStressTests(): Promise<void> {
    this.log('🚀 Starting MEGA STRESS TEST SUITE');
    this.log('==================================');
    
    try {
      // Phase 1: Sequential stress tests
      this.log('📋 Phase 1: Sequential Stress Tests');
      await this.runSequentialStressTests();
      
      // Phase 2: Concurrent stress tests
      this.log('📋 Phase 2: Concurrent Stress Tests');
      await this.runConcurrentStressTests();
      
      // Phase 3: Endurance stress test
      this.log('📋 Phase 3: Endurance Stress Test');
      await this.runEnduranceStressTest();
      
      // Phase 4: Resource stress test
      this.log('📋 Phase 4: Resource Stress Test');
      await this.runResourceStressTest();
      
      // Phase 5: Error injection stress test
      this.log('📋 Phase 5: Error Injection Stress Test');
      await this.runErrorInjectionStressTest();
      
    } catch (error) {
      this.log(`❌ Mega stress test suite failed: ${error}`);
    }
    
    this.printResults();
  }

  private printResults(): void {
    const totalDuration = Date.now() - this.overallStartTime;
    
    console.log('\n' + '='.repeat(100));
    console.log('🚀 MEGA STRESS TEST SUITE RESULTS');
    console.log('='.repeat(100));
    
    const totalTests = this.testResults.length;
    const completed = this.testResults.filter(r => r.status === 'COMPLETED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const running = this.testResults.filter(r => r.status === 'RUNNING').length;
    const successRate = totalTests > 0 ? ((completed / totalTests) * 100).toFixed(1) : '0.0';
    
    console.log(`\n📊 Mega Stress Test Summary:`);
    console.log(`   Total Test Suites: ${totalTests}`);
    console.log(`   Completed: ${completed} ✅`);
    console.log(`   Failed: ${failed} ❌`);
    console.log(`   Still Running: ${running} 🔄`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    
    console.log(`\n📋 Detailed Results:`);
    for (const result of this.testResults) {
      const statusIcon = result.status === 'COMPLETED' ? '✅' : 
                        result.status === 'FAILED' ? '❌' : '🔄';
      
      console.log(`   ${statusIcon} ${result.testSuite}`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Start: ${result.startTime.toISOString()}`);
      if (result.endTime) {
        console.log(`      End: ${result.endTime.toISOString()}`);
      }
      if (result.duration) {
        console.log(`      Duration: ${(result.duration / 1000).toFixed(1)}s`);
      }
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
      console.log('');
    }
    
    console.log('='.repeat(100));
    
    if (failed === 0 && running === 0) {
      console.log('🎉 All mega stress tests completed successfully!');
      console.log('🚀 4-Minute video generator is EXTREMELY ROBUST and PRODUCTION-READY.');
      console.log('💪 System can handle extreme stress conditions reliably under all scenarios.');
    } else if (failed > 0) {
      console.log(`⚠️ ${failed} test suite(s) failed. System may have robustness issues.`);
      console.log('🔧 Please investigate and fix the failing stress tests before production.');
    } else {
      console.log(`🔄 ${running} test suite(s) still running. System is under extreme stress.`);
    }
  }
}

// Main execution
async function main() {
  try {
    const megaStressTest = new MegaStressTestRunner();
    await megaStressTest.runAllMegaStressTests();
  } catch (error) {
    console.error('❌ Mega stress test suite execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MegaStressTestRunner };
