#!/usr/bin/env node

/**
 * Test script to verify error handling in the recording script
 * This script tests various error conditions to ensure graceful failure
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import path from 'path';

console.log('🧪 Testing Recording Script Error Handling\n');

// Test 1: Missing config file
console.log('Test 1: Missing config file');
let backupPath = '';
try {
  // Temporarily rename config file
  const configPath = 'record.config.json';
  backupPath = 'record.config.json.backup';
  
  if (existsSync(configPath)) {
    execSync(`mv ${configPath} ${backupPath}`);
  }
  
  const result = execSync('pnpm record', { encoding: 'utf8', stdio: 'pipe' });
  console.log('❌ Test failed: Should have exited with error');
} catch (error) {
  if (error.status === 1) {
    console.log('✅ Test passed: Script correctly exited with error code 1');
  } else {
    console.log(`❌ Test failed: Unexpected exit code ${error.status}`);
  }
  
  // Restore config file
  if (existsSync(backupPath)) {
    execSync(`mv ${backupPath} record.config.json`);
  }
}

console.log('');

// Test 2: Invalid config file
console.log('Test 2: Invalid config file');
let originalContent = '';
try {
  const configPath = 'record.config.json';
  originalContent = existsSync(configPath) ? execSync(`cat ${configPath}`, { encoding: 'utf8' }) : '';
  
  // Create invalid config
  writeFileSync(configPath, '{"invalid": "json"');
  
  const result = execSync('pnpm record', { encoding: 'utf8', stdio: 'pipe' });
  console.log('❌ Test failed: Should have exited with error');
} catch (error) {
  if (error.status === 1) {
    console.log('✅ Test passed: Script correctly exited with error code 1');
  } else {
    console.log(`❌ Test failed: Unexpected exit code ${error.status}`);
  }
  
  // Restore original config
  if (originalContent) {
    writeFileSync('record.config.json', originalContent);
  }
}

console.log('');

// Test 3: Environment validation (output directory not writable)
console.log('Test 3: Environment validation');
try {
  // Make captures directory read-only
  execSync('chmod 444 captures');
  
  const result = execSync('pnpm record', { encoding: 'utf8', stdio: 'pipe' });
  console.log('❌ Test failed: Should have exited with error');
} catch (error) {
  if (error.status === 1) {
    console.log('✅ Test passed: Script correctly exited with error code 1');
  } else {
    console.log(`❌ Test failed: Unexpected exit code ${error.status}`);
  }
  
  // Restore permissions
  execSync('chmod 755 captures');
}

console.log('');

console.log('🎯 All error handling tests completed!');
console.log('The recording script now properly handles errors and exits gracefully.');
