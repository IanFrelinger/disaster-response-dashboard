#!/usr/bin/env node

/**
 * Phase 2 Error Testing - Visual Effects & Styling
 * 
 * Tests style builders, duplicate layer IDs, and visual rendering faults.
 * Goal: Style builders never create invalid styles; invalid inputs are rejected early.
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🎨 Phase 2 Error Testing - Visual Effects & Styling');
console.log('=' .repeat(60));

const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Test configuration
const phase2Tests = [
  {
    name: 'Map Layer and Style Faults',
    description: 'Test duplicate layer IDs, missing sprites, and font loading failures',
    tests: [
      'test:map:duplicate-layer-id',
      'test:map:missing-sprite',
      'test:map:font-load-fail',
      'test:map:tile-error'
    ]
  },
  {
    name: 'Data Validation Faults',
    description: 'Test invalid GeoJSON and degenerate geometry handling',
    tests: [
      'test:data:geojson-invalid',
      'test:data:degenerate-geometry'
    ]
  },
  {
    name: 'UI Component Styling Faults',
    description: 'Test component rendering failures and accessibility violations',
    tests: [
      'test:ui:component-render-fail',
      'test:ui:accessibility-violation'
    ]
  },
  {
    name: 'Style Builder Validation',
    description: 'Test style builders with invalid inputs and schema validation',
    tests: [
      'test:style:invalid-json',
      'test:style:unknown-properties',
      'test:style:out-of-range-values'
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
async function runPhase2ErrorTests() {
  console.log('\n🎯 Phase 2 Error Testing Strategy:');
  console.log('   • Style builders should reject invalid inputs with helpful errors');
  console.log('   • Duplicate layer IDs should trigger error boundaries');
  console.log('   • Invalid GeoJSON should be caught before rendering');
  console.log('   • Accessibility violations should be detected and reported');
  
  // Run all test categories
  phase2Tests.forEach(runTestCategory);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Phase 2 Error Testing Results:');
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
runPhase2ErrorTests().catch(error => {
  console.error('\n💥 Test execution failed:', error);
  process.exit(1);
});
