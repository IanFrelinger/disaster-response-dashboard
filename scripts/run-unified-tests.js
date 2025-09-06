#!/usr/bin/env node
/**
 * Unified Test Runner - Runs both frontend and backend tests using command pattern
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
  databaseUrl: process.env.DATABASE_URL || null,
  failFast: process.env.FAIL_FAST !== 'false',
  parallel: process.env.PARALLEL === 'true',
  maxConcurrency: parseInt(process.env.MAX_CONCURRENCY || '3'),
  reportPath: process.env.REPORT_PATH || 'test-results/unified-test-report.json',
  timeout: parseInt(process.env.TEST_TIMEOUT || '300000'), // 5 minutes
  retries: parseInt(process.env.TEST_RETRIES || '1')
};

class UnifiedTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      frontend: null,
      backend: null,
      overall: {
        success: false,
        totalDuration: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
  }

  async run() {
    console.log('🚀 Starting unified test execution');
    console.log(`⚙️  Configuration: failFast=${CONFIG.failFast}, parallel=${CONFIG.parallel}`);
    console.log(`🌐 Frontend URL: ${CONFIG.frontendUrl}`);
    console.log(`🔧 Backend URL: ${CONFIG.backendUrl}`);
    
    const startTime = Date.now();

    try {
      if (CONFIG.parallel) {
        // Run frontend and backend tests in parallel
        console.log('\n🔄 Running tests in parallel...');
        const [frontendResult, backendResult] = await Promise.allSettled([
          this.runFrontendTests(),
          this.runBackendTests()
        ]);

        this.results.frontend = frontendResult.status === 'fulfilled' ? frontendResult.value : { error: frontendResult.reason };
        this.results.backend = backendResult.status === 'fulfilled' ? backendResult.value : { error: backendResult.reason };
      } else {
        // Run frontend and backend tests sequentially
        console.log('\n📋 Running tests sequentially...');
        
        console.log('\n🎨 Running frontend tests...');
        this.results.frontend = await this.runFrontendTests();
        
        // Check if we should continue after frontend failure
        if (!this.results.frontend.success && CONFIG.failFast) {
          console.log('❌ Frontend tests failed, stopping execution (failFast enabled)');
          this.results.backend = { error: 'Skipped due to frontend failure' };
        } else {
          console.log('\n🔧 Running backend tests...');
          this.results.backend = await this.runBackendTests();
        }
      }

      // Calculate overall results
      this.calculateOverallResults();
      this.results.overall.totalDuration = Date.now() - startTime;

      // Generate report
      await this.generateReport();

      // Exit with appropriate code
      const exitCode = this.results.overall.success ? 0 : 1;
      console.log(`\n📊 Test execution completed: ${this.results.overall.success ? 'PASSED' : 'FAILED'}`);
      console.log(`⏱️  Total duration: ${this.results.overall.totalDuration}ms`);
      console.log(`📈 Success rate: ${this.results.overall.totalTests > 0 ? (this.results.overall.passedTests / this.results.overall.totalTests * 100).toFixed(1) : 0}%`);
      
      process.exit(exitCode);

    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    }
  }

  async runFrontendTests() {
    return new Promise((resolve, reject) => {
      console.log('  🎨 Starting frontend test orchestration...');
      
      const frontendProcess = spawn('node', [
        'frontend/src/testing/runFrontendTests.js',
        '--baseUrl', CONFIG.frontendUrl,
        '--timeout', CONFIG.timeout.toString(),
        '--retries', CONFIG.retries.toString(),
        '--failFast', CONFIG.failFast.toString(),
        '--parallel', CONFIG.parallel.toString(),
        '--maxConcurrency', CONFIG.maxConcurrency.toString(),
        '--reportPath', 'test-results/frontend-test-report.json'
      ], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      frontendProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`  [Frontend] ${data.toString().trim()}`);
      });

      frontendProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`  [Frontend Error] ${data.toString().trim()}`);
      });

      frontendProcess.on('close', (code) => {
        try {
          const reportPath = 'test-results/frontend-test-report.json';
          let report = null;
          
          if (fs.existsSync(reportPath)) {
            report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          }

          resolve({
            success: code === 0,
            exitCode: code,
            stdout,
            stderr,
            report
          });
        } catch (error) {
          reject(new Error(`Failed to parse frontend test results: ${error}`));
        }
      });

      frontendProcess.on('error', (error) => {
        reject(new Error(`Frontend test process failed: ${error}`));
      });
    });
  }

  async runBackendTests() {
    return new Promise((resolve, reject) => {
      console.log('  🔧 Starting backend test orchestration...');
      
      const backendProcess = spawn('python', [
        'backend/tests/runBackendTests.py',
        '--base-url', CONFIG.backendUrl,
        '--timeout', CONFIG.timeout.toString(),
        '--retries', CONFIG.retries.toString(),
        '--fail-fast', CONFIG.failFast.toString(),
        '--parallel', CONFIG.parallel.toString(),
        '--max-concurrency', CONFIG.maxConcurrency.toString(),
        '--report-path', 'test-results/backend-test-report.json'
      ], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      if (CONFIG.databaseUrl) {
        backendProcess.env.DATABASE_URL = CONFIG.databaseUrl;
      }

      let stdout = '';
      let stderr = '';

      backendProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`  [Backend] ${data.toString().trim()}`);
      });

      backendProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`  [Backend Error] ${data.toString().trim()}`);
      });

      backendProcess.on('close', (code) => {
        try {
          const reportPath = 'test-results/backend-test-report.json';
          let report = null;
          
          if (fs.existsSync(reportPath)) {
            report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          }

          resolve({
            success: code === 0,
            exitCode: code,
            stdout,
            stderr,
            report
          });
        } catch (error) {
          reject(new Error(`Failed to parse backend test results: ${error}`));
        }
      });

      backendProcess.on('error', (error) => {
        reject(new Error(`Backend test process failed: ${error}`));
      });
    });
  }

  calculateOverallResults() {
    const frontendSuccess = this.results.frontend?.success || false;
    const backendSuccess = this.results.backend?.success || false;
    
    this.results.overall.success = frontendSuccess && backendSuccess;
    
    // Count tests from reports
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    if (this.results.frontend?.report) {
      totalTests += this.results.frontend.report.totalTests || 0;
      passedTests += this.results.frontend.report.passedTests || 0;
      failedTests += this.results.frontend.report.failedTests || 0;
    }

    if (this.results.backend?.report) {
      totalTests += this.results.backend.report.total_tests || 0;
      passedTests += this.results.backend.report.passed_tests || 0;
      failedTests += this.results.backend.report.failed_tests || 0;
    }

    this.results.overall.totalTests = totalTests;
    this.results.overall.passedTests = passedTests;
    this.results.overall.failedTests = failedTests;
  }

  async generateReport() {
    try {
      const reportDir = path.dirname(CONFIG.reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      fs.writeFileSync(CONFIG.reportPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Unified test report saved to: ${CONFIG.reportPath}`);
    } catch (error) {
      console.error(`❌ Failed to save unified test report: ${error}`);
    }
  }
}

// Run the unified test runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new UnifiedTestRunner();
  runner.run().catch(error => {
    console.error('❌ Unified test runner failed:', error);
    process.exit(1);
  });
}

export { UnifiedTestRunner };
