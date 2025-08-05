#!/usr/bin/env node
/**
 * Frontend test runner script
 */

const { execSync } = require('child_process');
const path = require('path');

// Test categories
const TEST_CATEGORIES = {
  components: 'src/__tests__/components',
  hooks: 'src/__tests__/hooks',
  services: 'src/__tests__/services',
  utils: 'src/__tests__/utils',
  all: 'src/__tests__',
};

// Parse command line arguments
const args = process.argv.slice(2);
const category = args[0] || 'all';
const watch = args.includes('--watch');
const coverage = args.includes('--coverage');
const verbose = args.includes('--verbose');

// Validate category
if (!TEST_CATEGORIES[category]) {
  console.error(`Invalid test category: ${category}`);
  console.error(`Available categories: ${Object.keys(TEST_CATEGORIES).join(', ')}`);
  process.exit(1);
}

// Build vitest command
const testPath = TEST_CATEGORIES[category];
let command = 'npx vitest';

if (watch) {
  command += ' --watch';
}

if (coverage) {
  command += ' --coverage';
}

if (verbose) {
  command += ' --reporter=verbose';
} else {
  command += ' --reporter=basic';
}

command += ` ${testPath}`;

console.log(`Running ${category} tests...`);
console.log(`Command: ${command}`);
console.log('-'.repeat(50));

try {
  execSync(command, { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname),
  });
} catch (error) {
  console.error('Tests failed');
  process.exit(1);
} 