#!/usr/bin/env node

/**
 * Phase 4 Error Testing - Advanced Integration & Performance
 * 
 * Tests API failures, state sync issues, and performance degradation.
 * Goal: API + state sync failures are handled; backpressure works.
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🔗 Phase 4 Error Testing - Advanced Integration & Performance');
console.log('=' .repeat(60));

const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Test configuration
const phase4Tests = [
  {
    name: 'HTTP API Fault Matrix',
    description: 'Test all HTTP status codes and API failure scenarios',
    tests: [
      'test:api:http-400',
      'test:api:http-401',
      'test:api:http-403',
      'test:api:http-404',
      'test:api:http-408',
      'test:api:http-409',
      'test:api:http-429',
      'test:api:http-500',
      'test:api:http-502',
      'test:api:http-503'
    ]
  },
  {
    name: 'API Response Faults',
    description: 'Test timeouts, invalid JSON, and schema mismatches',
    tests: [
      'test:api:timeout',
      'test:api:invalid-json',
      'test:api:schema-mismatch',
      'test:api:rate-limit-exceeded'
    ]
  },
  {
    name: 'Performance Degradation',
    description: 'Test frame rate drops, memory spikes, and network latency',
    tests: [
      'test:perf:frame-rate-drop',
      'test:perf:memory-spike',
      'test:perf:network-latency'
    ]
  },
  {
    name: 'Integration Service Faults',
    description: 'Test service discovery, circuit breakers, and data sync conflicts',
    tests: [
      'test:integration:service-discovery-fail',
      'test:integration:circuit-breaker-trigger',
      'test:integration:data-sync-conflict'
    ]
  },
  {
    name: 'Offline and Network Faults',
    description: 'Test offline scenarios and network connectivity issues',
    tests: [
      'test:api:network-error',
      'test:api:cors-error',
      'test:integration:fallback-service-unavailable'
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
async function runPhase4ErrorTests() {
  console.log('\n🎯 Phase 4 Error Testing Strategy:');
  console.log('   • HTTP errors should show appropriate user messages');
  console.log('   • Timeouts should trigger retry mechanisms with backoff');
  console.log('   • Performance issues should trigger degradation gracefully');
  console.log('   • Integration failures should fall back to offline mode');
  
  // Run all test categories
  phase4Tests.forEach(runTestCategory);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Phase 4 Error Testing Results:');
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
runPhase4ErrorTests().catch(error => {
  console.error('\n💥 Test execution failed:', error);
  process.exit(1);
});
