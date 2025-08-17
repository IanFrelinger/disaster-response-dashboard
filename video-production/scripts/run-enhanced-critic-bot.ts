#!/usr/bin/env ts-node

import { EnhancedCriticBot } from './enhanced-critic-bot';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CLIArgs {
  mode: 'validate' | 'iterate' | 'continuous' | 'report';
  outputDir?: string;
  maxIterations?: number;
  qualityThreshold?: number;
  configFile?: string;
}

function showUsage(): void {
  console.log('🎬 Enhanced Critic Bot CLI');
  console.log('==========================');
  console.log('');
  console.log('Usage: npx ts-node scripts/run-enhanced-critic-bot.ts [MODE] [OPTIONS]');
  console.log('');
  console.log('Modes:');
  console.log('  validate                    Validate current video quality');
  console.log('  iterate                     Run one quality improvement iteration');
  console.log('  continuous                  Run continuous quality improvement loop');
  console.log('  report                      Generate quality report from existing data');
  console.log('');
  console.log('Options:');
  console.log('  --output-dir <path>         Custom output directory');
  console.log('  --max-iterations <number>   Maximum iterations for continuous mode');
  console.log('  --quality-threshold <0-100> Custom quality threshold');
  console.log('  --config <file>             Custom quality standards configuration');
  console.log('  --help                      Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  # Validate current video quality');
  console.log('  npx ts-node scripts/run-enhanced-critic-bot.ts validate');
  console.log('');
  console.log('  # Run one improvement iteration');
  console.log('  npx ts-node scripts/run-enhanced-critic-bot.ts iterate');
  console.log('');
  console.log('  # Run continuous improvement loop');
  console.log('  npx ts-node scripts/run-enhanced-critic-bot.ts continuous');
  console.log('');
  console.log('  # Continuous mode with custom settings');
  console.log('  npx ts-node scripts/run-enhanced-critic-bot.ts continuous \\');
  console.log('    --max-iterations 15 \\');
  console.log('    --quality-threshold 90');
  console.log('');
  console.log('  # Generate report from existing data');
  console.log('  npx ts-node scripts/run-enhanced-critic-bot.ts report');
}

function parseArgs(): CLIArgs | null {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showUsage();
    return null;
  }
  
  const mode = args[0] as 'validate' | 'iterate' | 'continuous' | 'report';
  if (!['validate', 'iterate', 'continuous', 'report'].includes(mode)) {
    console.error(`❌ Invalid mode: ${mode}`);
    showUsage();
    return null;
  }
  
  const parsed: CLIArgs = { mode };
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--output-dir':
        parsed.outputDir = args[++i];
        break;
        
      case '--max-iterations':
        parsed.maxIterations = parseInt(args[++i]);
        break;
        
      case '--quality-threshold':
        parsed.qualityThreshold = parseInt(args[++i]);
        break;
        
      case '--config':
        parsed.configFile = args[++i];
        break;
        
      default:
        console.error(`❌ Unknown argument: ${arg}`);
        showUsage();
        return null;
    }
  }
  
  return parsed;
}

async function runEnhancedCriticBot(args: CLIArgs): Promise<void> {
  console.log(`🚀 Starting Enhanced Critic Bot in ${args.mode} mode...`);
  console.log('');
  
  const criticBot = new EnhancedCriticBot();
  
  try {
    switch (args.mode) {
      case 'validate':
        await runValidationMode(criticBot);
        break;
        
      case 'iterate':
        await runIterationMode(criticBot);
        break;
        
      case 'continuous':
        await runContinuousMode(criticBot, args);
        break;
        
      case 'report':
        await runReportMode(criticBot);
        break;
    }
    
  } catch (error) {
    console.error('❌ Enhanced Critic Bot failed:', error);
    process.exit(1);
  }
}

async function runValidationMode(criticBot: EnhancedCriticBot): Promise<void> {
  console.log('🔍 Running video quality validation...');
  console.log('');
  
  // Find all beat files
  const beatFiles = criticBot['findBeatFiles']();
  if (beatFiles.length === 0) {
    console.log('❌ No beat files found for validation');
    return;
  }
  
  console.log(`📁 Found ${beatFiles.length} beat files to validate`);
  console.log('');
  
  // Validate individual beats
  const beatValidations = [];
  for (const beatFile of beatFiles) {
    const validation = await criticBot['validateIndividualBeat'](beatFile);
    beatValidations.push(validation);
  }
  
  // Find combined video
  const combinedVideo = criticBot['findCombinedVideo']();
  if (!combinedVideo) {
    console.log('❌ Combined video not found for validation');
    return;
  }
  
  // Validate combined video
  const videoValidation = await criticBot['validateCombinedVideo'](combinedVideo, beatValidations);
  
  // Display validation results
  displayValidationResults(videoValidation);
  
  // Save validation results
  const validationPath = path.join(criticBot['iterationsDir'], `validation-${Date.now()}.json`);
  fs.writeFileSync(validationPath, JSON.stringify(videoValidation, null, 2));
  console.log(`\n📁 Validation results saved to: ${validationPath}`);
}

async function runIterationMode(criticBot: EnhancedCriticBot): Promise<void> {
  console.log('🔄 Running quality improvement iteration...');
  console.log('');
  
  const standardsMet = await criticBot['runQualityIteration']();
  
  if (standardsMet) {
    console.log('\n🎉 Video meets quality standards!');
  } else {
    console.log('\n📋 Video needs improvement - check iteration plan for details');
  }
}

async function runContinuousMode(criticBot: EnhancedCriticBot, args: CLIArgs): Promise<void> {
  console.log('🔄 Starting continuous quality improvement loop...');
  
  if (args.maxIterations) {
    criticBot['maxIterations'] = args.maxIterations;
    console.log(`⏱️  Maximum iterations set to: ${args.maxIterations}`);
  }
  
  if (args.qualityThreshold) {
    criticBot['qualityStandards']['overallScore'] = args.qualityThreshold;
    console.log(`🎯 Quality threshold set to: ${args.qualityThreshold}/100`);
  }
  
  console.log('');
  
  // Run continuous quality loop
  await criticBot['runContinuousQualityLoop']();
}

async function runReportMode(criticBot: EnhancedCriticBot): Promise<void> {
  console.log('📊 Generating quality report from existing data...');
  console.log('');
  
  const iterationsDir = criticBot['iterationsDir'];
  if (!fs.existsSync(iterationsDir)) {
    console.log('❌ No iterations directory found');
    return;
  }
  
  const files = fs.readdirSync(iterationsDir);
  const validationFiles = files.filter(f => f.includes('validation'));
  const planFiles = files.filter(f => f.includes('plan'));
  const reportFiles = files.filter(f => f.includes('report'));
  
  console.log('📁 Found existing data:');
  console.log(`  - Validation files: ${validationFiles.length}`);
  console.log(`  - Iteration plans: ${planFiles.length}`);
  console.log(`  - Reports: ${reportFiles.length}`);
  console.log('');
  
  if (validationFiles.length === 0) {
    console.log('❌ No validation data found');
    return;
  }
  
  // Load most recent validation
  const mostRecentValidation = validationFiles
    .map(f => ({ name: f, time: fs.statSync(path.join(iterationsDir, f)).mtime }))
    .sort((a, b) => b.time.getTime() - a.time.getTime())[0];
  
  const validationPath = path.join(iterationsDir, mostRecentValidation.name);
  const validationData = JSON.parse(fs.readFileSync(validationPath, 'utf8'));
  
  console.log(`📊 Most recent validation: ${mostRecentValidation.name}`);
  displayValidationResults(validationData);
}

function displayValidationResults(videoValidation: any): void {
  console.log('🎯 Video Quality Validation Results');
  console.log('==================================');
  console.log(`Overall Score: ${videoValidation.overallScore}/100`);
  console.log(`Technical Accuracy: ${videoValidation.technicalAccuracy}/100`);
  console.log(`Visual Quality: ${videoValidation.visualQuality}/100`);
  console.log(`Pacing: ${videoValidation.pacing}/100`);
  console.log(`Engagement: ${videoValidation.engagement}/100`);
  console.log(`Total Duration: ${videoValidation.totalDuration.toFixed(1)}s`);
  console.log(`Meets Standards: ${videoValidation.meetsStandards ? '✅ YES' : '❌ NO'}`);
  console.log('');
  
  // Beat summary
  const totalBeats = videoValidation.beatScores.length;
  const passingBeats = videoValidation.beatScores.filter((b: any) => b.passes).length;
  const failingBeats = totalBeats - passingBeats;
  
  console.log('📋 Beat Summary:');
  console.log(`  Total Beats: ${totalBeats}`);
  console.log(`  Passing: ${passingBeats} ✅`);
  console.log(`  Failing: ${failingBeats} ❌`);
  console.log('');
  
  // Individual beat scores
  if (videoValidation.beatScores.length > 0) {
    console.log('🎬 Individual Beat Scores:');
    videoValidation.beatScores.forEach((beat: any, index: number) => {
      const status = beat.passes ? '✅' : '❌';
      const score = beat.score;
      const duration = beat.duration;
      console.log(`  ${index + 1}. ${status} ${beat.name}: ${score}/100 (${duration}s)`);
      
      if (beat.issues.length > 0) {
        beat.issues.forEach((issue: string) => console.log(`     ❌ ${issue}`));
      }
      if (beat.warnings.length > 0) {
        beat.warnings.forEach((warning: string) => console.log(`     ⚠️  ${warning}`));
      }
    });
    console.log('');
  }
  
  // Critical issues
  if (videoValidation.criticalIssues.length > 0) {
    console.log('🚨 Critical Issues:');
    videoValidation.criticalIssues.forEach((issue: string) => console.log(`  - ${issue}`));
    console.log('');
  }
  
  // Improvement areas
  if (videoValidation.improvementAreas.length > 0) {
    console.log('🔧 Areas for Improvement:');
    videoValidation.improvementAreas.forEach((area: string) => console.log(`  - ${area}`));
    console.log('');
  }
  
  // Recommendations
  if (videoValidation.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    videoValidation.recommendations.forEach((rec: string) => console.log(`  - ${rec}`));
    console.log('');
  }
}

// Main execution
async function main(): Promise<void> {
  const args = parseArgs();
  if (!args) {
    process.exit(0);
  }
  
  await runEnhancedCriticBot(args);
}

// Run main function
main().catch(console.error);
