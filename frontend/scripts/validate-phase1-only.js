#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

console.log('='.repeat(80));
console.log('🔍 Phase 1: Basic Functionality Test (Extruded 3D Buildings)');
console.log('📝 Testing: Extruded 3D buildings loading, routes, waypoints, basic interactions');
console.log('='.repeat(80));

const startTime = Date.now();

try {
  console.log('⏳ Starting Phase 1...');
  
  const command = 'npx playwright test tests/e2e/3d-terrain-map.spec.ts --config=playwright.config.ts --timeout=60000 --retries=1 --workers=1 --reporter=list';
  
  console.log('🔧 Command:', command);
  console.log('⏳ Executing Phase 1 tests...');
  
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Phase 1 completed successfully in', duration.toFixed(2) + 's');
  console.log('📊 Phase 1 Test Results: PASSED');
  console.log('🎉 Extruded 3D Buildings Basic Functionality is working correctly!');
  console.log('='.repeat(80));
  
} catch (error) {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '='.repeat(80));
  console.log('❌ Phase 1 failed after', duration.toFixed(2) + 's');
  console.log('Error:', error.message);
  console.log('🔧 Check the 3D building component and fix any loading issues');
  console.log('='.repeat(80));
  
  process.exit(1);
}
