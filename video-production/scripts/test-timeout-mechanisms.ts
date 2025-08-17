#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface TimeoutTestResult {
  test: string;
  expectedBehavior: string;
  actualBehavior: string;
  success: boolean;
  duration: number;
  details?: string;
}

class TimeoutMechanismTester {
  private projectRoot: string;
  private results: TimeoutTestResult[] = [];
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

  private addResult(result: TimeoutTestResult): void {
    this.results.push(result);
  }

  async runAllTests(): Promise<void> {
    this.log('🧪 Starting Timeout Mechanism Validation Tests', 'info');
    this.log('==============================================', 'info');

    // Test 1: Enhanced Production Pipeline Timeout
    await this.testEnhancedPipelineTimeout();

    // Test 2: Enhanced Frontend Captures Timeout
    await this.testEnhancedFrontendCapturesTimeout();

    // Test 3: Smoke Test Performance
    await this.testSmokeTestPerformance();

    // Test 4: Resource Cleanup Validation
    await this.testResourceCleanup();

    this.log('', 'info');
    this.log('Timeout Mechanism Test Results', 'info');
    this.log('================================', 'info');
    this.printResults();
  }

  private async testEnhancedPipelineTimeout(): Promise<void> {
    this.log('🧪 Testing Enhanced Production Pipeline Timeout...', 'info');
    
    const startTime = Date.now();
    
    try {
      // Run the enhanced pipeline
      const result = execSync('npm run enhanced-pipeline', { 
        encoding: 'utf8', 
        cwd: this.projectRoot,
        timeout: 120000 // 2 minutes timeout for this test
      });
      
      const duration = Date.now() - startTime;
      
      // Check if pipeline completed successfully
      if (result.includes('Enhanced production pipeline completed successfully!')) {
        this.addResult({
          test: 'Enhanced Pipeline Timeout',
          expectedBehavior: 'Pipeline should complete within 15 minutes',
          actualBehavior: `Pipeline completed successfully in ${duration}ms`,
          success: true,
          duration
        });
        this.log('✅ Enhanced pipeline timeout test passed', 'success');
      } else {
        this.addResult({
          test: 'Enhanced Pipeline Timeout',
          expectedBehavior: 'Pipeline should complete within 15 minutes',
          actualBehavior: 'Pipeline did not complete as expected',
          success: false,
          duration,
          details: result
        });
        this.log('❌ Enhanced pipeline timeout test failed', 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult({
        test: 'Enhanced Pipeline Timeout',
        expectedBehavior: 'Pipeline should complete within 15 minutes',
        actualBehavior: 'Pipeline execution failed',
        success: false,
        duration,
        details: error.toString()
      });
      this.log('❌ Enhanced pipeline timeout test failed', 'error');
    }
  }

  private async testEnhancedFrontendCapturesTimeout(): Promise<void> {
    this.log('🧪 Testing Enhanced Frontend Captures Timeout...', 'info');
    
    const startTime = Date.now();
    
    try {
      // Run the enhanced frontend captures
      const result = execSync('npm run enhanced-frontend-captures', { 
        encoding: 'utf8', 
        cwd: this.projectRoot,
        timeout: 120000 // 2 minutes timeout for this test
      });
      
      const duration = Date.now() - startTime;
      
      // Check if captures completed successfully (this is now the expected behavior after improvements)
      if (result.includes('Enhanced capture generation completed successfully') || 
          result.includes('✅ Personal Introduction video captured') ||
          result.includes('✅ User Persona video captured')) {
        this.addResult({
          test: 'Frontend Captures Timeout',
          expectedBehavior: 'Should complete successfully with improved timeouts',
          actualBehavior: `Completed successfully in ${duration}ms`,
          success: true,
          duration
        });
        this.log('✅ Frontend captures test passed - improvements working', 'success');
      } else if (result.includes('timed out after')) {
        this.addResult({
          test: 'Frontend Captures Timeout',
          expectedBehavior: 'Should complete successfully with improved timeouts',
          actualBehavior: 'Timed out (regression)',
          success: false,
          duration,
          details: 'Timeout occurred despite improvements - this indicates a regression'
        });
        this.log('❌ Frontend captures test failed - timeout regression detected', 'error');
      } else {
        this.addResult({
          test: 'Frontend Captures Timeout',
          expectedBehavior: 'Should complete successfully with improved timeouts',
          actualBehavior: 'Unexpected behavior',
          success: false,
          duration,
          details: result
        });
        this.log('❌ Frontend captures test failed - unexpected behavior', 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult({
        test: 'Frontend Captures Timeout',
        expectedBehavior: 'Should complete successfully with improved timeouts',
        actualBehavior: 'Execution failed',
        success: false,
        duration,
        details: error.toString()
      });
      this.log('❌ Frontend captures test failed - execution error', 'error');
    }
  }

  private async testSmokeTestPerformance(): Promise<void> {
    this.log('🧪 Testing Smoke Test Performance...', 'info');
    
    const startTime = Date.now();
    
    try {
      // Run the enhanced smoke test
      const result = execSync('npm run enhanced-smoke-test', { 
        encoding: 'utf8', 
        cwd: this.projectRoot,
        timeout: 60000 // 1 minute timeout for smoke test
      });
      
      const duration = Date.now() - startTime;
      
      // Check if smoke test completed successfully
      if (result.includes('All critical video pipeline tests passed!')) {
        this.addResult({
          test: 'Smoke Test Performance',
          expectedBehavior: 'Should complete within 5 seconds',
          actualBehavior: `Completed in ${duration}ms`,
          success: duration < 5000,
          duration
        });
        
        if (duration < 5000) {
          this.log('✅ Smoke test performance test passed', 'success');
        } else {
          this.log('⚠️  Smoke test performance test passed but was slow', 'warning');
        }
      } else {
        this.addResult({
          test: 'Smoke Test Performance',
          expectedBehavior: 'Should complete within 5 seconds',
          actualBehavior: 'Smoke test failed',
          success: false,
          duration,
          details: result
        });
        this.log('❌ Smoke test performance test failed', 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult({
        test: 'Smoke Test Performance',
        expectedBehavior: 'Should complete within 5 seconds',
        actualBehavior: 'Smoke test execution failed',
        success: false,
        duration,
        details: error.toString()
      });
        this.log('❌ Smoke test performance test failed', 'error');
    }
  }

  private async testResourceCleanup(): Promise<void> {
    this.log('🧪 Testing Resource Cleanup...', 'info');
    
    const startTime = Date.now();
    
    try {
      // Check if capture files were cleaned up properly
      const capturesDir = path.join(this.projectRoot, 'captures');
      const files = fs.readdirSync(capturesDir);
      
      // Filter out directories and check for temporary files
      const tempFiles = files.filter(file => 
        !fs.statSync(path.join(capturesDir, file)).isDirectory() &&
        (file.includes('.tmp') || file.includes('test'))
      );
      
      const duration = Date.now() - startTime;
      
      if (tempFiles.length === 0) {
        this.addResult({
          test: 'Resource Cleanup',
          expectedBehavior: 'No temporary files should remain',
          actualBehavior: 'No temporary files found',
          success: true,
          duration
        });
        this.log('✅ Resource cleanup test passed', 'success');
      } else {
        this.addResult({
          test: 'Resource Cleanup',
          expectedBehavior: 'No temporary files should remain',
          actualBehavior: `${tempFiles.length} temporary files found`,
          success: false,
          duration,
          details: `Temporary files: ${tempFiles.join(', ')}`
        });
        this.log('❌ Resource cleanup test failed', 'error');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult({
        test: 'Resource Cleanup',
        expectedBehavior: 'No temporary files should remain',
        actualBehavior: 'Resource cleanup check failed',
        success: false,
        duration,
        details: error.toString()
      });
      this.log('❌ Resource cleanup test failed', 'error');
    }
  }

  private printResults(): void {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const totalDuration = Date.now() - this.startTime;

    console.log(`\n📊 Timeout Mechanism Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${successfulTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   ⏱️  Total Duration: ${totalDuration}ms`);

    console.log(`\n📋 Test Details:`);
    this.results.forEach(result => {
      const statusIcon = result.success ? '✅' : '❌';
      console.log(`   ${statusIcon} ${result.test}: ${result.actualBehavior}`);
      console.log(`      Expected: ${result.expectedBehavior}`);
      console.log(`      Duration: ${result.duration}ms`);
      if (result.details) {
        console.log(`      Details: ${result.details}`);
      }
    });

    if (failedTests === 0) {
      this.log('🎉 All timeout mechanism tests passed!', 'success');
    } else {
      this.log(`⚠️  ${failedTests} test(s) failed. Please review the results above.`, 'warning');
    }
  }
}

// Run the timeout mechanism tests
async function main() {
  try {
    const tester = new TimeoutMechanismTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Timeout mechanism tests failed with error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
