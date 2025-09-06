#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

console.log('='.repeat(80));
console.log('🔍 Phase 3: Frontend Error Validation (3D Building & Route Error Handling)');
console.log('📝 Testing: No JavaScript errors, React errors, network failures, 3D building & route error handling');
console.log('='.repeat(80));

const startTime = Date.now();

try {
  console.log('⏳ Starting Phase 3...');
  
  const command = 'npx playwright test tests/e2e/3d-terrain-error-validation.spec.ts --config=playwright.config.ts --timeout=60000 --retries=1 --workers=1 --reporter=list';
  
  console.log('🔧 Command:', command);
  console.log('⏳ Executing Phase 3 tests...');
  
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Phase 3 completed successfully in', duration.toFixed(2) + 's');
  console.log('📊 Phase 3 Test Results: PASSED');
  console.log('🎉 3D Building Error Handling is working correctly!');
  console.log('='.repeat(80));
  
} catch (error) {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('❌ Phase 3 failed after', duration.toFixed(2) + 's');
  console.log('Error:', error.message);
  console.log('🔧 Check the error handling and fix any issues');
  console.log('='.repeat(80));
  
  process.exit(1);
}
