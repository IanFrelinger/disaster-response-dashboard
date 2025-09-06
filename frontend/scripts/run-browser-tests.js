#!/usr/bin/env node

/**
 * Browser Test Runner for White Screen Detection
 * Runs comprehensive browser tests to identify potential production issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Running Browser Tests for White Screen Detection...\n');

const testSuites = [
  {
    name: 'Component Rendering Tests',
    file: 'component-rendering.spec.ts',
    description: 'Tests basic component rendering and functionality'
  },
  {
    name: 'White Screen Detection Tests',
    file: 'white-screen-detection.spec.ts',
    description: 'Tests for common white screen causes'
  },
  {
    name: 'Production Environment Simulation Tests',
    file: 'production-simulation.spec.ts',
    description: 'Tests production-like conditions'
  }
];

async function runTestSuite(suite) {
  console.log(`\n📋 Running: ${suite.name}`);
  console.log(`📝 Description: ${suite.description}`);
  console.log('─'.repeat(60));
  
      try {
      const result = execSync(`npx playwright test ${suite.file} --reporter=list --reporter=json:test-results/${suite.name.toLowerCase().replace(/\s+/g, '-')}.json`, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Test suite completed successfully');
      return { success: true, output: result };
    } catch (error) {
      console.log('❌ Test suite failed');
      console.log('Error output:', error.stdout || error.message);
      return { success: false, output: error.stdout || error.message };
    }
}

async function runAllTests() {
  const results = [];
  
  for (const suite of testSuites) {
    const result = await runTestSuite(suite);
    results.push({
      suite: suite.name,
      ...result
    });
  }
  
  return results;
}

function generateReport(results) {
  console.log('\n📊 Test Results Summary');
  console.log('═'.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Test Suites: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n🚨 Failed Test Suites:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  • ${result.suite}`);
    });
    
    console.log('\n💡 Recommendations:');
    console.log('  1. Check browser console for JavaScript errors');
    console.log('  2. Verify all dependencies are properly loaded');
    console.log('  3. Check for missing environment variables');
    console.log('  4. Verify API endpoints are accessible');
    console.log('  5. Check for CSS/JavaScript loading failures');
  } else {
    console.log('\n🎉 All test suites passed!');
    console.log('   Your components should render correctly in production.');
  }
  
  // Save detailed report to file
  const reportPath = path.join(process.cwd(), 'browser-test-report.json');
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      successful,
      failed
    },
    results: results.map(r => ({
      suite: r.suite,
      success: r.success,
      output: r.output?.substring(0, 1000) + '...' // Truncate long outputs
    }))
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

async function main() {
  try {
    // Check if Playwright is installed
    try {
      execSync('npx playwright --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('⚠️  Playwright not found. Installing...');
      execSync('npx playwright install', { stdio: 'inherit' });
    }
    
    // Run all tests
    const results = await runAllTests();
    
    // Generate report
    generateReport(results);
    
    // Exit with appropriate code
    const hasFailures = results.some(r => !r.success);
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runAllTests, generateReport };
