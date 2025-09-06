#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

console.log('='.repeat(80));
console.log('🔍 Core Phases Test Suite (Phases 1-3)');
console.log('📝 Testing: Basic functionality, integration, and error handling');
console.log('='.repeat(80));

const startTime = Date.now();
const results = [];

// Phase 1: Basic Functionality
console.log('\n🔍 Phase 1: Basic Functionality Test');
try {
  execSync('npm run test:3d-terrain:phase1', { stdio: 'inherit', cwd: process.cwd() });
  results.push({ phase: 1, status: 'PASSED' });
  console.log('✅ Phase 1: PASSED');
} catch (error) {
  results.push({ phase: 1, status: 'FAILED', error: error.message });
  console.log('❌ Phase 1: FAILED');
}

// Phase 2: Integration Testing
console.log('\n🔍 Phase 2: Integration Testing');
try {
  execSync('npm run test:3d-terrain:phase2', { stdio: 'inherit', cwd: process.cwd() });
  results.push({ phase: 2, status: 'PASSED' });
  console.log('✅ Phase 2: PASSED');
} catch (error) {
  results.push({ phase: 2, status: 'FAILED', error: error.message });
  console.log('❌ Phase 2: FAILED');
}

// Phase 3: Error Validation
console.log('\n🔍 Phase 3: Error Validation');
try {
  execSync('npm run test:3d-terrain:phase3', { stdio: 'inherit', cwd: process.cwd() });
  results.push({ phase: 3, status: 'PASSED' });
  console.log('✅ Phase 3: PASSED');
} catch (error) {
  results.push({ phase: 3, status: 'FAILED', error: error.message });
  console.log('❌ Phase 3: FAILED');
}

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;

console.log('\n' + '='.repeat(80));
console.log('📊 Core Phases Test Results');
console.log('='.repeat(80));

const passed = results.filter(r => r.status === 'PASSED').length;
const failed = results.filter(r => r.status === 'FAILED').length;

results.forEach(result => {
  console.log(`Phase ${result.phase}: ${result.status}`);
});

console.log('\n📈 Summary:');
console.log(`   Total Phases: ${results.length}`);
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
console.log(`   Total Execution Time: ${duration.toFixed(2)}s`);

if (failed > 0) {
  console.log('\n⚠️  SOME PHASES FAILED');
  console.log('🔧 Review failed phases and fix issues');
  process.exit(1);
} else {
  console.log('\n🎉 ALL CORE PHASES PASSED!');
  console.log('✅ 3D Building core functionality is working correctly!');
}
