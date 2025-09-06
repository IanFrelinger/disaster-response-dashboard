#!/usr/bin/env node

/**
 * Phase 1 Error Testing - Foundation & Basic Functionality
 * 
 * Tests environment, WebGL, style loading, and basic initialization faults.
 * Goal: App initializes sanely or fails loudly with friendly UI.
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Phase 1 Error Testing - Foundation & Basic Functionality');
console.log('=' .repeat(60));

const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Test configuration
const phase1Tests = [
  {
    name: 'Environment Configuration Faults',
    description: 'Test missing/invalid environment variables and config',
    tests: [
      'test:env:missing-mapbox-token',
      'test:env:invalid-api-endpoint',
      'test:env:config-corrupt'
    ]
  },
  {
    name: 'WebGL and Map Initialization Faults',
    description: 'Test WebGL unavailability and map style loading failures',
    tests: [
      'test:map:webgl-unavailable',
      'test:map:style-load-fail',
      'test:map:invalid-token'
    ]
  },
  {
    name: 'API Network Faults',
    description: 'Test basic network connectivity and CORS issues',
    tests: [
      'test:api:network-error',
      'test:api:cors-error'
    ]
  },
  {
    name: 'Component Render Faults',
    description: 'Test basic component rendering failures',
    tests: [
      'test:ui:component-render-fail'
    ]
  }
];

// Run tests for a specific category
function runTestCategory(category) {
  console.log(`\n📋 ${category.name}`);
  console.log(`   ${category.description}`);
  console.log('   ' + '-'.repeat(category.description.length));
  
  category.tests.forEach(testName => {
    try {
      console.log(`   🔍 Running: ${testName}`);
      
      // Run the specific test
      const result = execSync(`npm run ${testName}`, {
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      console.log(`   ✅ PASSED: ${testName}`);
      testResults.passed++;
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${testName}`);
      console.log(`      Error: ${error.message}`);
      testResults.failed++;
      testResults.errors.push({
        test: testName,
        error: error.message
      });
    }
  });
}

// Main execution
async function runPhase1ErrorTests() {
  console.log('\n🎯 Phase 1 Error Testing Strategy:');
  console.log('   • Environment faults should show config error screens');
  console.log('   • WebGL faults should show fallback map panels');
  console.log('   • Network faults should show connection error messages');
  console.log('   • Component faults should trigger error boundaries');
  
  // Run all test categories
  phase1Tests.forEach(runTestCategory);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Phase 1 Error Testing Results:');
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`   • ${test}: ${error}`);
    });
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Testing interrupted by user');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:', error);
  process.exit(1);
});

// Run the tests
runPhase1ErrorTests().catch(error => {
  console.error('\n💥 Test execution failed:', error);
  process.exit(1);
});
