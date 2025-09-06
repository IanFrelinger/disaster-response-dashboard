#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

console.log('='.repeat(80));
console.log('🔍 Phase 5: Comprehensive Stress Testing (3D Building & Route Stress)');
console.log('📝 Testing: Load handling, graceful degradation, recovery mechanisms, 3D building & route stress handling');
console.log('='.repeat(80));

const startTime = Date.now();

try {
  console.log('⏳ Starting Phase 5...');
  
  const command = 'npx playwright test tests/e2e/3d-terrain-stress-testing.spec.ts --config=playwright.config.ts --timeout=60000 --retries=1 --workers=1 --reporter=list';
  
  console.log('🔧 Command:', command);
  console.log('⏳ Executing Phase 5 tests...');
  
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Phase 5 completed successfully in', duration.toFixed(2) + 's');
  console.log('📊 Phase 5 Test Results: PASSED');
  console.log('🎉 3D Building Stress Testing is working correctly!');
  console.log('='.repeat(80));
  
} catch (error) {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('❌ Phase 5 failed after', duration.toFixed(2) + 's');
  console.log('Error:', error.message);
  console.log('🔧 Check the stress testing implementation and fix any issues');
  console.log('='.repeat(80));
  
  process.exit(1);
}
