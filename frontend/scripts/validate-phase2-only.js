#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

console.log('='.repeat(80));
console.log('🔍 Phase 2: Integration Testing (3D Building & Route Integration)');
console.log('📝 Testing: Container networking, environment variables, data transformation, 3D building & route integration');
console.log('='.repeat(80));

const startTime = Date.now();

try {
  console.log('⏳ Starting Phase 2...');
  
  const command = 'npx playwright test tests/e2e/3d-terrain-integration.spec.ts --config=playwright.config.ts --timeout=60000 --retries=1 --workers=1 --reporter=list';
  
  console.log('🔧 Command:', command);
  console.log('⏳ Executing Phase 2 tests...');
  
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Phase 2 completed successfully in', duration.toFixed(2) + 's');
  console.log('📊 Phase 2 Test Results: PASSED');
  console.log('🎉 3D Building Integration is working correctly!');
  console.log('='.repeat(80));
  
} catch (error) {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('❌ Phase 2 failed after', duration.toFixed(2) + 's');
  console.log('Error:', error.message);
  console.log('🔧 Check the integration configuration and fix any issues');
  console.log('='.repeat(80));
  
  process.exit(1);
}
