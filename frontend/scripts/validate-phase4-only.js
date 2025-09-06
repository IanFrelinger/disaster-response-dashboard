#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

console.log('='.repeat(80));
console.log('🔍 Phase 4: User Story Testing (3D Building Visualization & Route Planning)');
console.log('📝 Testing: Emergency responders, disaster assessment, 3D building visualization, route planning, waypoint navigation');
console.log('='.repeat(80));

const startTime = Date.now();

try {
  console.log('⏳ Starting Phase 4...');
  
  const command = 'npx playwright test tests/e2e/3d-terrain-user-stories.spec.ts --config=playwright.config.ts --timeout=60000 --retries=1 --workers=1 --reporter=list';
  
  console.log('🔧 Command:', command);
  console.log('⏳ Executing Phase 4 tests...');
  
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Phase 4 completed successfully in', duration.toFixed(2) + 's');
  console.log('📊 Phase 4 Test Results: PASSED');
  console.log('🎉 3D Building User Stories are working correctly!');
  console.log('='.repeat(80));
  
} catch (error) {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('❌ Phase 4 failed after', duration.toFixed(2) + 's');
  console.log('Error:', error.message);
  console.log('🔧 Check the user story implementation and fix any issues');
  console.log('='.repeat(80));
  
  process.exit(1);
}
