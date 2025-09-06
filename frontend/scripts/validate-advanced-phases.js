#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

console.log('='.repeat(80));
console.log('🔍 Advanced Phases Test Suite (Phases 4-5)');
console.log('📝 Testing: User stories and stress testing');
console.log('='.repeat(80));

const startTime = Date.now();
const results = [];

// Phase 4: User Story Testing
console.log('\n🔍 Phase 4: User Story Testing');
try {
  execSync('npm run test:3d-terrain:phase4', { stdio: 'inherit', cwd: process.cwd() });
  results.push({ phase: 4, status: 'PASSED' });
  console.log('✅ Phase 4: PASSED');
} catch (error) {
  results.push({ phase: 4, status: 'FAILED', error: error.message });
  console.log('❌ Phase 4: FAILED');
}

// Phase 5: Stress Testing
console.log('\n🔍 Phase 5: Stress Testing');
try {
  execSync('npm run test:3d-terrain:phase5', { stdio: 'inherit', cwd: process.cwd() });
  results.push({ phase: 5, status: 'PASSED' });
  console.log('✅ Phase 5: PASSED');
} catch (error) {
  results.push({ phase: 5, status: 'FAILED', error: error.message });
  console.log('❌ Phase 5: FAILED');
}

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;

console.log('\n' + '='.repeat(80));
console.log('📊 Advanced Phases Test Results');
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
  console.log('\n🎉 ALL ADVANCED PHASES PASSED!');
  console.log('✅ 3D Building advanced features are working correctly!');
}
