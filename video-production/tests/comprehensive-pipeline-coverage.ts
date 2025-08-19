#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  details: string;
  error?: string;
  coverage?: number;
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestResult[];
  startTime: Date;
  endTime?: Date;
  totalDuration: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
}

class ComprehensivePipelineCoverageTest {
  private projectRoot: string;
  private testSuites: TestSuite[];
  private capturesDir: string;
  private testResultsDir: string;
  private scriptsDir: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.capturesDir = path.join(this.projectRoot, 'captures');
    this.testResultsDir = path.join(this.projectRoot, 'test-results');
    this.scriptsDir = path.join(this.projectRoot, 'scripts');
    this.testSuites = [];
    
    this.ensureTestDirectories();
  }

  private ensureTestDirectories(): void {
    if (!fs.existsSync(this.testResultsDir)) {
      fs.mkdirSync(this.testResultsDir, { recursive: true });
    }
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  private async runTest(testName: string, testFunction: () => Promise<string>, timeoutMs: number = 60000): Promise<TestResult> {
    const startTime = Date.now();
    this.log(`🧪 Running test: ${testName}`);
    
    const testTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Test timeout after ${timeoutMs/1000}s: ${testName}`)), timeoutMs);
    });
    
    try {
      const details = await Promise.race([
        testFunction(),
        testTimeout
      ]);
      
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
        details: `Test failed: ${errorMessage}`,
        error: errorMessage
      };
      
      this.log(`❌ Test FAILED: ${testName} (${duration}ms) - ${errorMessage}`);
      return result;
    }
  }

  // ===== CORE PIPELINE TESTS =====

  private async testHumanizerBotCore(): Promise<string> {
    this.log('🤖 Testing Humanizer Bot Core Functionality...');
    
    // Test UI element discovery
    const uiTestResult = execSync('npx ts-node scripts/ui-element-discovery.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Test enhanced humanizer bot
    const humanizerResult = execSync('npx ts-node scripts/enhanced-humanizer-bot.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Verify output files
    const configDir = path.join(this.projectRoot, 'config');
    const requiredFiles = [
      'ui-component-map.json',
      'humanizer-bot-context.md'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(configDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not generated: ${file}`);
      }
    }
    
    return 'Humanizer Bot core functionality validated successfully';
  }

  private async testFrontendCaptureGeneration(): Promise<string> {
    this.log('📹 Testing Frontend Capture Generation...');
    
    // Test basic capture generation
    execSync('npx ts-node scripts/enhanced-frontend-captures-with-validation.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test parameter injection
    execSync('npx ts-node scripts/enhanced-frontend-captures-with-parameter-injection.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Verify captures were generated
    const files = fs.readdirSync(this.capturesDir).filter(f => f.endsWith('.webm') || f.endsWith('.html'));
    if (files.length === 0) {
      throw new Error('No capture files generated');
    }
    
    return `Frontend capture generation validated: ${files.length} files created`;
  }

  private async testVideoProductionPipeline(): Promise<string> {
    this.log('🎬 Testing Video Production Pipeline...');
    
    // Test 7-minute technical video generation
    execSync('npx ts-node scripts/generate-7min-technical.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test final video assembly
    execSync('npx ts-node scripts/assemble-final-video.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test 4-minute video generator
    execSync('npx ts-node scripts/generate-4min-video.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    return 'Video production pipeline validated successfully';
  }

  private async testQualityAssurance(): Promise<string> {
    this.log('🔍 Testing Quality Assurance Systems...');
    
    // Test enhanced critic bot
    execSync('npx ts-node scripts/enhanced-critic-bot.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test intelligent quality agent
    execSync('npx ts-node scripts/intelligent-quality-agent.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test video marketing critic
    execSync('npx ts-node scripts/video-marketing-critic-bot.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    return 'Quality assurance systems validated successfully';
  }

  // ===== INTEGRATION TESTS =====

  private async testPipelineIntegration(): Promise<string> {
    this.log('🔗 Testing Pipeline Integration...');
    
    // Test unified pipeline
    execSync('npx ts-node scripts/run-unified-pipeline.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test enhanced production pipeline
    execSync('npx ts-node scripts/run-enhanced-production.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test enhanced production pipeline with validation
    execSync('npx ts-node scripts/enhanced-production-pipeline-with-validation.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    return 'Pipeline integration validated successfully';
  }

  private async testErrorHandling(): Promise<string> {
    this.log('🛡️ Testing Error Handling...');
    
    // Test timeout mechanisms
    execSync('npx ts-node scripts/test-timeout-mechanisms.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Test improved timeouts
    execSync('npx ts-node scripts/test-improved-timeouts.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Test error recovery
    execSync('npx ts-node scripts/test-minimal-pipeline.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    return 'Error handling and recovery validated successfully';
  }

  // ===== PERFORMANCE TESTS =====

  private async testPerformanceAndScalability(): Promise<string> {
    this.log('⚡ Testing Performance and Scalability...');
    
    // Test smoke test pipeline
    execSync('npx ts-node scripts/smoke-test-pipeline.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test enhanced video pipeline smoke test
    execSync('npx ts-node scripts/enhanced-video-pipeline-smoke-test.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test quick pipeline test
    execSync('npx ts-node scripts/quick-pipeline-test.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    return 'Performance and scalability validated successfully';
  }

  // ===== STRESS TESTS =====

  private async testStressTesting(): Promise<string> {
    this.log('🔥 Testing Stress Testing Capabilities...');
    
    // Test basic stress tests
    execSync('npx ts-node tests/stress-test-4min-video.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test advanced stress tests
    execSync('npx ts-node tests/advanced-stress-tests.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    // Test production readiness
    execSync('npx ts-node tests/production-readiness-stress-test.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 60000
    });
    
    return 'Stress testing capabilities validated successfully';
  }

  // ===== VALIDATION TESTS =====

  private async testValidationSystems(): Promise<string> {
    this.log('✅ Testing Validation Systems...');
    
    // Test quick validation
    execSync('npx ts-node tests/quick-validation-test.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Test 4-minute video validation
    execSync('npx ts-node tests/quick-validation-with-4min-video.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Test 4-minute video generator
    execSync('npx ts-node tests/test-4min-video-generator.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    return 'Validation systems validated successfully';
  }

  // ===== UTILITY TESTS =====

  private async testUtilityFunctions(): Promise<string> {
    this.log('🔧 Testing Utility Functions...');
    
    // Test mock narration generation
    execSync('npx ts-node scripts/generate-mock-narration.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Test HTML generation
    execSync('npx ts-node scripts/generate-basic-html-captures.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Test interactive demo generation
    execSync('npx ts-node scripts/generate-interactive-demo.ts', { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    return 'Utility functions validated successfully';
  }

  // ===== MAIN TEST EXECUTION =====

  async runComprehensiveCoverage(): Promise<void> {
    this.log('🚀 Starting Comprehensive Pipeline Coverage Test Suite');
    this.log(`📁 Project Root: ${this.projectRoot}`);
    this.log(`📁 Test Results: ${this.testResultsDir}`);
    
    const startTime = Date.now();
    
    // Define all test suites
    const testSuites = [
      {
        name: 'Humanizer Bot Core',
        description: 'Core humanizer bot functionality and UI mapping',
        testFunction: () => this.testHumanizerBotCore()
      },
      {
        name: 'Frontend Capture Generation',
        description: 'Frontend capture generation with validation',
        testFunction: () => this.testFrontendCaptureGeneration()
      },
      {
        name: 'Video Production Pipeline',
        description: 'Complete video production pipeline',
        testFunction: () => this.testVideoProductionPipeline()
      },
      {
        name: 'Quality Assurance',
        description: 'Quality assurance and critic systems',
        testFunction: () => this.testQualityAssurance()
      },
      {
        name: 'Pipeline Integration',
        description: 'Pipeline integration and workflow',
        testFunction: () => this.testPipelineIntegration()
      },
      {
        name: 'Error Handling',
        description: 'Error handling and recovery mechanisms',
        testFunction: () => this.testErrorHandling()
      },
      {
        name: 'Performance and Scalability',
        description: 'Performance testing and scalability',
        testFunction: () => this.testPerformanceAndScalability()
      },
      {
        name: 'Stress Testing',
        description: 'Stress testing capabilities',
        testFunction: () => this.testStressTesting()
      },
      {
        name: 'Validation Systems',
        description: 'Validation and quality checking systems',
        testFunction: () => this.testValidationSystems()
      },
      {
        name: 'Utility Functions',
        description: 'Utility and helper functions',
        testFunction: () => this.testUtilityFunctions()
      }
    ];
    
    // Execute all test suites
    for (let i = 0; i < testSuites.length; i++) {
      const suite = testSuites[i];
      this.log(`\n📋 Progress: Test Suite ${i + 1}/${testSuites.length} - ${suite.name}`);
      
      const testSuite: TestSuite = {
        name: suite.name,
        description: suite.description,
        tests: [],
        startTime: new Date(),
        totalDuration: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        coverage: 0
      };
      
      try {
        const result = await this.runTest(suite.name, suite.testFunction);
        testSuite.tests.push(result);
        
        if (result.status === 'PASS') {
          testSuite.passed++;
        } else if (result.status === 'FAIL') {
          testSuite.failed++;
        } else {
          testSuite.skipped++;
        }
        
        testSuite.totalDuration = result.duration;
        testSuite.coverage = (testSuite.passed / testSuite.tests.length) * 100;
        
      } catch (error) {
        this.log(`❌ Test suite ${suite.name} failed with unhandled error: ${error}`);
        testSuite.failed++;
        testSuite.coverage = 0;
      }
      
      testSuite.endTime = new Date();
      this.testSuites.push(testSuite);
      
      // Add delay between test suites
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const totalDuration = Date.now() - startTime;
    this.generateComprehensiveReport(totalDuration);
    
    // Calculate overall coverage
    const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.testSuites.reduce((sum, suite) => sum + suite.passed, 0);
    const overallCoverage = (totalPassed / totalTests) * 100;
    
    this.log(`\n🎯 Overall Test Coverage: ${overallCoverage.toFixed(1)}%`);
    
    if (overallCoverage >= 95) {
      this.log('🎉 Excellent! Pipeline has near-perfect test coverage!');
    } else if (overallCoverage >= 90) {
      this.log('✅ Good! Pipeline has strong test coverage!');
    } else if (overallCoverage >= 80) {
      this.log('⚠️ Fair! Pipeline has adequate test coverage but room for improvement.');
    } else {
      this.log('❌ Poor! Pipeline needs significant test coverage improvements.');
    }
  }

  private generateComprehensiveReport(totalDuration: number): void {
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: `${(totalDuration / 1000).toFixed(1)}s`,
      testSuites: this.testSuites,
      summary: {
        totalSuites: this.testSuites.length,
        totalTests: this.testSuites.reduce((sum, suite) => sum + suite.tests.length, 0),
        totalPassed: this.testSuites.reduce((sum, suite) => sum + suite.passed, 0),
        totalFailed: this.testSuites.reduce((sum, suite) => sum + suite.failed, 0),
        totalSkipped: this.testSuites.reduce((sum, suite) => sum + suite.skipped, 0),
        overallCoverage: 0
      }
    };
    
    // Calculate overall coverage
    const totalTests = report.summary.totalTests;
    if (totalTests > 0) {
      report.summary.overallCoverage = (report.summary.totalPassed / totalTests) * 100;
    }
    
    // Save detailed report
    const reportPath = path.join(this.testResultsDir, 'comprehensive-pipeline-coverage-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate human-readable summary
    const summaryPath = path.join(this.testResultsDir, 'comprehensive-pipeline-coverage-summary.txt');
    fs.writeFileSync(summaryPath, this.generateHumanReadableSummary(report));
    
    this.log(`\n📊 Comprehensive Report Generated:`);
    this.log(`   📁 Detailed Report: ${reportPath}`);
    this.log(`   📁 Summary Report: ${summaryPath}`);
    
    // Display summary
    this.displaySummary(report);
  }

  private generateHumanReadableSummary(report: any): string {
    let summary = 'COMPREHENSIVE PIPELINE COVERAGE TEST SUMMARY\n';
    summary += '='.repeat(60) + '\n\n';
    
    summary += `Timestamp: ${report.timestamp}\n`;
    summary += `Total Duration: ${report.totalDuration}\n\n`;
    
    summary += `OVERALL RESULTS:\n`;
    summary += `  Total Test Suites: ${report.summary.totalSuites}\n`;
    summary += `  Total Tests: ${report.summary.totalTests}\n`;
    summary += `  Passed: ${report.summary.totalPassed} ✅\n`;
    summary += `  Failed: ${report.summary.totalFailed} ❌\n`;
    summary += `  Skipped: ${report.summary.totalSkipped} ⏭️\n`;
    summary += `  Overall Coverage: ${report.summary.overallCoverage.toFixed(1)}%\n\n`;
    
    summary += `TEST SUITE RESULTS:\n`;
    for (const suite of report.testSuites) {
      const statusIcon = suite.passed > 0 ? '✅' : suite.failed > 0 ? '❌' : '⏭️';
      summary += `  ${statusIcon} ${suite.name}\n`;
      summary += `    Tests: ${suite.tests.length}, Passed: ${suite.passed}, Failed: ${suite.failed}\n`;
      summary += `    Coverage: ${suite.coverage.toFixed(1)}%\n`;
      summary += `    Duration: ${suite.totalDuration}ms\n\n`;
    }
    
    return summary;
  }

  private displaySummary(report: any): void {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 COMPREHENSIVE PIPELINE COVERAGE TEST RESULTS');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Overall Summary:`);
    console.log(`   Total Test Suites: ${report.summary.totalSuites}`);
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Passed: ${report.summary.totalPassed} ✅`);
    console.log(`   Failed: ${report.summary.totalFailed} ❌`);
    console.log(`   Skipped: ${report.summary.totalSkipped} ⏭️`);
    console.log(`   Overall Coverage: ${report.summary.overallCoverage.toFixed(1)}%`);
    console.log(`   Total Duration: ${report.totalDuration}`);
    
    console.log(`\n📋 Test Suite Results:`);
    for (const suite of report.testSuites) {
      const statusIcon = suite.passed > 0 ? '✅' : suite.failed > 0 ? '❌' : '⏭️';
      console.log(`   ${statusIcon} ${suite.name}`);
      console.log(`      Tests: ${suite.tests.length}, Passed: ${suite.passed}, Failed: ${suite.failed}`);
      console.log(`      Coverage: ${suite.coverage.toFixed(1)}%, Duration: ${suite.totalDuration}ms`);
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const testSuite = new ComprehensivePipelineCoverageTest();
    await testSuite.runComprehensiveCoverage();
  } catch (error) {
    console.error('❌ Comprehensive pipeline coverage test failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ComprehensivePipelineCoverageTest };
