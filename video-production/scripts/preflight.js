#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue.bold('🚀 Video Pipeline Preflight Check'));
console.log(chalk.gray('Verifying all dependencies and configurations...\n'));

const checks = {
  system: {},
  node: {},
  python: {},
  ffmpeg: {},
  playwright: {},
  api_keys: {},
  configs: {}
};

// System checks
console.log(chalk.yellow('🔍 System Requirements:'));
try {
  const platform = process.platform;
  const arch = process.arch;
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  checks.system.platform = platform;
  checks.system.arch = arch;
  checks.system.nodeVersion = nodeVersion;
  checks.system.nodeMajor = nodeMajor;
  
  console.log(`  ✅ Platform: ${platform} (${arch})`);
  console.log(`  ✅ Node.js: ${nodeVersion}`);
  
  if (nodeMajor < 18) {
    console.log(chalk.red(`  ❌ Node.js version ${nodeVersion} is too old. Need 18+`));
    checks.system.nodeCompatible = false;
  } else {
    console.log(chalk.green(`  ✅ Node.js version ${nodeMajor} is compatible`));
    checks.system.nodeCompatible = true;
  }
} catch (error) {
  console.log(chalk.red(`  ❌ System check failed: ${error.message}`));
  checks.system.error = error.message;
}

// Node dependencies
console.log(chalk.yellow('\n📦 Node Dependencies:'));
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['playwright', 'typescript', 'tsx', 'yaml', 'chalk'];
  const requiredDevDeps = ['@types/node'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(chalk.green(`  ✅ ${dep}: ${packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]}`));
      checks.node[dep] = true;
    } else {
      console.log(chalk.red(`  ❌ ${dep}: Missing`));
      checks.node[dep] = false;
    }
  }
  
  for (const dep of requiredDevDeps) {
    if (packageJson.devDependencies?.[dep]) {
      console.log(chalk.green(`  ✅ ${dep}: ${packageJson.devDependencies[dep]}`));
      checks.node[dep] = true;
    } else {
      console.log(chalk.red(`  ❌ ${dep}: Missing`));
      checks.node[dep] = false;
    }
  }
} catch (error) {
  console.log(chalk.red(`  ❌ Package.json check failed: ${error.message}`));
  checks.node.error = error.message;
}

// Python check
console.log(chalk.yellow('\n🐍 Python Environment:'));
try {
  const pythonVersion = execSync('python3 --version', { encoding: 'utf8' }).trim();
  const pythonMajor = parseInt(pythonVersion.split(' ')[1].split('.')[0]);
  const pythonMinor = parseInt(pythonVersion.split(' ')[1].split('.')[1]);
  
  checks.python.version = pythonVersion;
  checks.python.major = pythonMajor;
  checks.python.minor = pythonMinor;
  
  console.log(`  ✅ Python: ${pythonVersion}`);
  
  if (pythonMajor < 3 || (pythonMajor === 3 && pythonMinor < 10)) {
    console.log(chalk.red(`  ❌ Python version too old. Need 3.10+`));
    checks.python.compatible = false;
  } else {
    console.log(chalk.green(`  ✅ Python version ${pythonMajor}.${pythonMinor} is compatible`));
    checks.python.compatible = true;
  }
  
  // Check if requirements.txt exists
  if (fs.existsSync('requirements.txt')) {
    console.log(chalk.green('  ✅ requirements.txt found'));
    checks.python.requirements = true;
  } else {
    console.log(chalk.red('  ❌ requirements.txt not found'));
    checks.python.requirements = false;
  }
} catch (error) {
  console.log(chalk.red(`  ❌ Python check failed: ${error.message}`));
  checks.python.error = error.message;
}

// FFmpeg check
console.log(chalk.yellow('\n🎬 FFmpeg:'));
try {
  const ffmpegVersion = execSync('ffmpeg -version', { encoding: 'utf8' }).trim();
  const versionLine = ffmpegVersion.split('\n')[0];
  
  checks.ffmpeg.version = versionLine;
  checks.ffmpeg.available = true;
  
  console.log(`  ✅ ${versionLine}`);
  
  // Check for required codecs
  const codecCheck = execSync('ffmpeg -codecs | grep -E "(libx264|aac)"', { encoding: 'utf8' });
  if (codecCheck.includes('libx264') && codecCheck.includes('aac')) {
    console.log(chalk.green('  ✅ Required codecs: libx264, aac'));
    checks.ffmpeg.codecs = true;
  } else {
    console.log(chalk.red('  ❌ Missing required codecs: libx264, aac'));
    checks.ffmpeg.codecs = false;
  }
  
  // Check for subtitle filter
  const filterCheck = execSync('ffmpeg -filters | grep subtitles', { encoding: 'utf8' });
  if (filterCheck.includes('subtitles')) {
    console.log(chalk.green('  ✅ Subtitles filter available'));
    checks.ffmpeg.subtitles = true;
  } else {
    console.log(chalk.red('  ❌ Subtitles filter not available'));
    checks.ffmpeg.subtitles = false;
  }
} catch (error) {
  console.log(chalk.red(`  ❌ FFmpeg not found: ${error.message}`));
  checks.ffmpeg.available = false;
  checks.ffmpeg.error = error.message;
}

// Playwright check
console.log(chalk.yellow('\n🌐 Playwright:'));
try {
  const playwrightVersion = execSync('npx playwright --version', { encoding: 'utf8' }).trim();
  checks.playwright.version = playwrightVersion;
  checks.playwright.available = true;
  
  console.log(`  ✅ ${playwrightVersion}`);
  
  // Check if Chromium is installed
  try {
    execSync('npx playwright install --dry-run chromium', { encoding: 'utf8' });
    console.log(chalk.green('  ✅ Chromium browser available'));
    checks.playwright.chromium = true;
  } catch (error) {
    console.log(chalk.yellow('  ⚠️  Chromium not installed. Run: npx playwright install chromium'));
    checks.playwright.chromium = false;
  }
} catch (error) {
  console.log(chalk.red(`  ❌ Playwright not available: ${error.message}`));
  checks.playwright.available = false;
  checks.playwright.error = error.message;
}

// API Keys check
console.log(chalk.yellow('\n🔑 API Keys:'));
const requiredKeys = [
  'OPENAI_API_KEY',
  'ELEVEN_API_KEY', 
  'AZURE_SPEECH_KEY',
  'AZURE_SPEECH_REGION',
  'LOUDLY_API_KEY'
];

for (const key of requiredKeys) {
  if (process.env[key]) {
    console.log(chalk.green(`  ✅ ${key}: Set`));
    checks.api_keys[key] = true;
  } else {
    console.log(chalk.yellow(`  ⚠️  ${key}: Not set (optional)`));
    checks.api_keys[key] = false;
  }
}

// Config files check
console.log(chalk.yellow('\n📋 Configuration Files:'));
const requiredConfigs = [
  'narration.yaml',
  'timeline.yaml',
  'record.config.json'
];

for (const config of requiredConfigs) {
  if (fs.existsSync(config)) {
    console.log(chalk.green(`  ✅ ${config}: Found`));
    checks.configs[config] = true;
  } else {
    console.log(chalk.red(`  ❌ ${config}: Missing`));
    checks.configs[config] = false;
  }
}

// Directory structure check
console.log(chalk.yellow('\n📁 Directory Structure:'));
const requiredDirs = ['captures', 'audio', 'subs', 'luts', 'out', 'scripts'];
for (const dir of requiredDirs) {
  if (fs.existsSync(dir)) {
    console.log(chalk.green(`  ✅ ${dir}/: Exists`));
  } else {
    console.log(chalk.red(`  ❌ ${dir}/: Missing`));
  }
}

// Summary
console.log(chalk.blue.bold('\n📊 Preflight Summary:'));
const criticalIssues = [];
const warnings = [];

if (!checks.system.nodeCompatible) criticalIssues.push('Node.js version incompatible');
if (!checks.python.compatible) criticalIssues.push('Python version incompatible');
if (!checks.ffmpeg.available) criticalIssues.push('FFmpeg not available');
if (!checks.ffmpeg.codecs) criticalIssues.push('Required FFmpeg codecs missing');
if (!checks.playwright.available) criticalIssues.push('Playwright not available');

if (!checks.python.requirements) warnings.push('requirements.txt missing');
if (!checks.playwright.chromium) warnings.push('Chromium browser not installed');
if (!checks.api_keys.OPENAI_API_KEY) warnings.push('OpenAI API key not set (TTS will fail)');

if (criticalIssues.length === 0) {
  console.log(chalk.green.bold('✅ All critical requirements met!'));
  console.log(chalk.gray('You can run: pnpm run pipeline:full'));
} else {
  console.log(chalk.red.bold('❌ Critical issues found:'));
  criticalIssues.forEach(issue => console.log(chalk.red(`  • ${issue}`)));
}

if (warnings.length > 0) {
  console.log(chalk.yellow.bold('\n⚠️  Warnings:'));
  warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
}

console.log(chalk.gray('\n💡 Setup commands:'));
console.log(chalk.gray('  pnpm install'));
console.log(chalk.gray('  pnpm run setup'));
console.log(chalk.gray('  pnpm run preflight'));

// Save results
const resultsPath = path.join('out', 'preflight-results.json');
fs.ensureDirSync('out');
fs.writeFileSync(resultsPath, JSON.stringify(checks, null, 2));
console.log(chalk.gray(`\n📋 Results saved to: ${resultsPath}`));

process.exit(criticalIssues.length > 0 ? 1 : 0);
