#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Phase 1: 3D Terrain Map Basic Functionality Test');
console.log('📝 Description: Validate basic 3D terrain map with buildings functionality');
console.log('🎯 Success Criteria:');
console.log('   1. Map loads successfully');
console.log('   2. 3D terrain is active');
console.log('   3. 3D buildings are visible');
console.log('   4. Basic map interactions work');
console.log('   5. No duplicate source errors');
console.log('='.repeat(80));

try {
  const startTime = Date.now();

  // Run the simple 3D terrain map test
  const command = `npx playwright test tests/e2e/3d-terrain-map.spec.ts --config=playwright.config.ts --timeout=60000 --retries=1 --workers=1 --reporter=list`;

  console.log(`🔧 Command: ${command}`);
  console.log('⏳ Starting 3D Terrain Map validation...\n');

  const result = execSync(command, {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`\n✅ Phase 1 completed successfully in ${duration.toFixed(2)}s`);
  console.log('📊 3D Terrain Map Test Results: PASSED');
  console.log('🎉 3D Terrain Map with Buildings is working correctly!');

} catch (error) {
  const errorTime = Date.now();
  const startTime = errorTime - 1000; // Fallback for error case
  console.error(`\n❌ Phase 1 failed after ${((errorTime - startTime) / 1000).toFixed(2)}s`);
  console.error('Error:', error.message);
  console.error('🔧 Check the 3D terrain map component and fix any loading issues');
  process.exit(1);
}
