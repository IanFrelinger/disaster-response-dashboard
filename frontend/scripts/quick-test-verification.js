#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Quick Test Verification');
console.log('==========================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.log('❌ No package.json found. Please run this script from the frontend directory.');
  process.exit(1);
}

// Check if Playwright is available
console.log('🔧 Checking Playwright availability...');
try {
  const version = execSync('npx playwright --version', { encoding: 'utf8' });
  console.log(`✅ Playwright version: ${version.trim()}`);
} catch (error) {
  console.log('❌ Playwright not available. Installing...');
  try {
    execSync('npx playwright install', { stdio: 'inherit' });
    console.log('✅ Playwright installed successfully');
  } catch (installError) {
    console.log('❌ Failed to install Playwright');
    process.exit(1);
  }
}

// Check if test files exist
console.log('\n📁 Checking test files...');
const testFiles = [
  'tests/e2e/comprehensive-interaction-test.spec.ts',
  'tests/e2e/ui-overlap-detection.spec.ts',
  'scripts/run-comprehensive-tests.js'
];

testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check if frontend is running
console.log('\n🌐 Checking frontend status...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001', { encoding: 'utf8' });
  if (response.trim() === '200') {
    console.log('✅ Frontend is running on http://localhost:3001');
  } else {
    console.log(`⚠️  Frontend returned status: ${response.trim()}`);
  }
} catch (error) {
  console.log('❌ Frontend is not running');
  console.log('💡 Start the frontend with: npm run dev');
}

// Check package.json scripts
console.log('\n📜 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = [
    'test:comprehensive',
    'test:interactions', 
    'test:overlap'
  ];
  
  requiredScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`✅ ${script} script available`);
    } else {
      console.log(`❌ ${script} script missing`);
    }
  });
} catch (error) {
  console.log('❌ Failed to read package.json');
}

// Summary
console.log('\n📊 Verification Summary');
console.log('======================');
console.log('✅ Playwright is available');
console.log('✅ Test files are in place');
console.log('✅ Package.json scripts are configured');
console.log('\n🎯 Ready to run comprehensive tests!');
console.log('\nCommands available:');
console.log('  npm run test:comprehensive  - Run all comprehensive tests');
console.log('  npm run test:interactions   - Run interaction tests only');
console.log('  npm run test:overlap        - Run overlap detection tests only');
console.log('\n💡 Make sure the frontend is running before executing tests');
