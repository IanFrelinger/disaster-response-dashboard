#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Comprehensive Frontend Testing Suite');
console.log('================================================\n');

// Configuration
const config = {
  baseUrl: 'http://localhost:3001',
  testTimeout: 300000, // 5 minutes
  retries: 2,
  workers: 1, // Run tests sequentially for better overlap detection
  outputDir: './test-results/comprehensive',
  screenshots: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Test suites to run
const testSuites = [
  {
    name: 'Comprehensive UI Interaction Tests',
    file: 'tests/e2e/comprehensive-interaction-test.spec.ts',
    description: 'Tests all UI interactions and verifies no overlapping elements'
  },
  {
    name: 'UI Overlap Detection Tests',
    file: 'tests/e2e/ui-overlap-detection.spec.ts',
    description: 'Specialized tests for detecting UI overlap issues'
  },
  {
    name: 'Existing E2E Tests',
    file: 'tests/e2e',
    description: 'Run all existing end-to-end tests'
  }
];

// Function to run a test suite
function runTestSuite(suite) {
  console.log(`\n📋 Running: ${suite.name}`);
  console.log(`📝 Description: ${suite.description}`);
  console.log('─'.repeat(60));
  
  try {
    const startTime = Date.now();
    
    // Run the test suite
    const command = `npx playwright test ${suite.file} --config=playwright.config.ts --timeout=${config.testTimeout} --retries=${config.retries} --workers=${config.workers} --reporter=html,json --output=${config.outputDir}/${suite.name.replace(/\s+/g, '-').toLowerCase()}`;
    
    console.log(`🔧 Command: ${command}`);
    console.log('⏳ Starting tests...\n');
    
    const result = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, PLAYWRIGHT_HTML_REPORT: config.outputDir }
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`\n✅ ${suite.name} completed successfully in ${duration.toFixed(2)}s`);
    return { success: true, duration, suite: suite.name };
    
  } catch (error) {
    console.log(`\n❌ ${suite.name} failed`);
    console.log(`Error: ${error.message}`);
    return { success: false, error: error.message, suite: suite.name };
  }
}

// Function to generate comprehensive report
function generateReport(results) {
  const reportPath = path.join(config.outputDir, 'comprehensive-test-report.json');
  const summaryPath = path.join(config.outputDir, 'test-summary.txt');
  
  const report = {
    timestamp: new Date().toISOString(),
    config,
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
    }
  };
  
  // Write detailed report
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Write human-readable summary
  let summary = 'Comprehensive Frontend Testing Report\n';
  summary += '=====================================\n\n';
  summary += `Generated: ${new Date().toLocaleString()}\n`;
  summary += `Total Test Suites: ${report.summary.total}\n`;
  summary += `Passed: ${report.summary.passed}\n`;
  summary += `Failed: ${report.summary.failed}\n`;
  summary += `Total Duration: ${(report.summary.totalDuration / 60).toFixed(2)} minutes\n\n`;
  
  summary += 'Detailed Results:\n';
  summary += '────────────────\n';
  
  results.forEach((result, index) => {
    summary += `${index + 1}. ${result.suite}\n`;
    summary += `   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`;
    if (result.duration) {
      summary += `   Duration: ${result.duration.toFixed(2)}s\n`;
    }
    if (result.error) {
      summary += `   Error: ${result.error}\n`;
    }
    summary += '\n';
  });
  
  fs.writeFileSync(summaryPath, summary);
  
  console.log('\n📊 Test Report Generated');
  console.log(`📁 Detailed Report: ${reportPath}`);
  console.log(`📄 Summary Report: ${summaryPath}`);
  
  return report;
}

// Function to check if frontend is running
function checkFrontendHealth() {
  console.log('🔍 Checking frontend health...');
  
  try {
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${config.baseUrl}`, { encoding: 'utf8' });
    
    if (response.trim() === '200') {
      console.log('✅ Frontend is running and healthy');
      return true;
    } else {
      console.log(`❌ Frontend returned status: ${response.trim()}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to connect to frontend');
    console.log('💡 Make sure the frontend is running on http://localhost:3001');
    return false;
  }
}

// Function to install Playwright if needed
function ensurePlaywrightInstalled() {
  console.log('🔧 Checking Playwright installation...');
  
  try {
    execSync('npx playwright --version', { stdio: 'ignore' });
    console.log('✅ Playwright is already installed');
  } catch (error) {
    console.log('📦 Installing Playwright...');
    try {
      execSync('npx playwright install', { stdio: 'inherit' });
      console.log('✅ Playwright installed successfully');
    } catch (installError) {
      console.log('❌ Failed to install Playwright');
      console.log('Error:', installError.message);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    // Pre-flight checks
    ensurePlaywrightInstalled();
    
    if (!checkFrontendHealth()) {
      console.log('\n💡 To start the frontend, run: npm run dev');
      process.exit(1);
    }
    
    console.log('\n🎯 Starting comprehensive testing...\n');
    
    // Run all test suites
    const results = [];
    
    for (const suite of testSuites) {
      const result = runTestSuite(suite);
      results.push(result);
      
      // Small delay between test suites
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate comprehensive report
    const report = generateReport(results);
    
    // Final summary
    console.log('\n🎉 Comprehensive Testing Complete!');
    console.log('==================================');
    console.log(`📊 Total Test Suites: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏱️  Total Duration: ${(report.summary.totalDuration / 60).toFixed(2)} minutes`);
    
    if (report.summary.failed > 0) {
      console.log('\n⚠️  Some tests failed. Check the detailed reports above.');
      process.exit(1);
    } else {
      console.log('\n🎊 All tests passed successfully!');
    }
    
  } catch (error) {
    console.error('\n💥 Fatal error during testing:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();

export { runTestSuite, generateReport, checkFrontendHealth };
