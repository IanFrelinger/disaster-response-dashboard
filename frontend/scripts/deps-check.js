#!/usr/bin/env node

/**
 * Dependency Consistency Checker
 * Ensures dev and prod dependencies are properly separated
 */

import fs from 'fs';
import path from 'path';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageProd = JSON.parse(fs.readFileSync('package.prod.json', 'utf8'));
const packageBuild = JSON.parse(fs.readFileSync('package.build.json', 'utf8'));

console.log('🔍 Checking dependency consistency...\n');

// Check for misplaced dependencies
const misplacedInDeps = [];
const misplacedInDevDeps = [];

// Check if any dev dependencies are in main dependencies
Object.keys(packageJson.devDependencies || {}).forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    misplacedInDeps.push(dep);
  }
});

// Check if any runtime dependencies are in dev dependencies
Object.keys(packageJson.dependencies || {}).forEach(dep => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    misplacedInDevDeps.push(dep);
  }
});

// Check production package consistency
const prodMissing = [];
Object.keys(packageJson.dependencies || {}).forEach(dep => {
  if (!packageProd.dependencies[dep]) {
    prodMissing.push(dep);
  }
});

// Check build package consistency
const buildMissing = [];
const buildDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
Object.keys(buildDeps).forEach(dep => {
  if (!packageBuild.dependencies[dep] && !packageBuild.devDependencies[dep]) {
    buildMissing.push(dep);
  }
});

// Report results
let hasIssues = false;

if (misplacedInDeps.length > 0) {
  console.log('❌ Dependencies that should be in devDependencies:');
  misplacedInDeps.forEach(dep => console.log(`   - ${dep}`));
  hasIssues = true;
}

if (misplacedInDevDeps.length > 0) {
  console.log('❌ Dev dependencies that should be in dependencies:');
  misplacedInDevDeps.forEach(dep => console.log(`   - ${dep}`));
  hasIssues = true;
}

if (prodMissing.length > 0) {
  console.log('❌ Dependencies missing from package.prod.json:');
  prodMissing.forEach(dep => console.log(`   - ${dep}`));
  hasIssues = true;
}

if (buildMissing.length > 0) {
  console.log('❌ Dependencies missing from package.build.json:');
  buildMissing.forEach(dep => console.log(`   - ${dep}`));
  hasIssues = true;
}

if (!hasIssues) {
  console.log('✅ All dependencies are properly organized!');
  console.log(`📦 Runtime dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
  console.log(`🔧 Dev dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
  console.log(`🏗️ Build dependencies: ${Object.keys(packageBuild.dependencies || {}).length + Object.keys(packageBuild.devDependencies || {}).length}`);
}

process.exit(hasIssues ? 1 : 0);
