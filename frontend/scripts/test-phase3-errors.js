#!/usr/bin/env node

/**
 * Phase 3 Error Testing - Interactive Elements
 * 
 * Tests event handling, error boundaries, and user interaction faults.
 * Goal: Input chaos doesn't crash handlers; error boundaries work properly.
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🖱️  Phase 3 Error Testing - Interactive Elements');
console.log('=' .repeat(60));

const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Test configuration
const phase3Tests = [
  {
    name: 'Event Handling Faults',
    description: 'Test rapid event bursts and event listener leaks',
    tests: [
      'test:ui:unhandled-promise',
      'test:ui:event-listener-leak',
      'test:ui:focus-trap-fail'
    ]
  },
  {
    name: 'Error Boundary Testing',
    description: 'Test error boundary activation and recovery',
    tests: [
      'test:ui:error-boundary-trigger',
      'test:ui:component-render-fail'
    ]
  },
  {
    name: 'Map Interaction Faults',
    description: 'Test geolocation errors and map interaction failures',
    tests: [
      'test:map:geolocation-error'
    ]
  },
  {
    name: 'Data Type Validation',
    description: 'Test type mismatches and missing required properties',
    tests: [
      'test:data:type-mismatch',
      'test:data:missing-required-props'
    ]
  },
  {
    name: 'User Input Stress Testing',
    description: 'Test rapid user interactions and input validation',
    tests: [
      'test:ui:rapid-click-burst',
      'test:ui:rapid-hover-burst',
      'test:ui:click-outside-map'
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
async function runPhase3ErrorTests() {
  console.log('\n🎯 Phase 3 Error Testing Strategy:');
  console.log('   • Rapid event bursts should not cause memory leaks');
  console.log('   • Error boundaries should catch and display errors gracefully');
  console.log('   • Focus management should work correctly during errors');
  console.log('   • User interactions should remain responsive after errors');
  
  // Run all test categories
  phase3Tests.forEach(runTestCategory);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Phase 3 Error Testing Results:');
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
runPhase3ErrorTests().catch(error => {
  console.error('\n💥 Test execution failed:', error);
  process.exit(1);
});
