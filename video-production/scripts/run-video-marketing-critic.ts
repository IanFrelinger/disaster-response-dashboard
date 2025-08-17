#!/usr/bin/env ts-node

import { VideoMarketingCriticBot } from './video-marketing-critic-bot';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CLIArgs {
  videoPath: string;
  outputDir?: string;
  detailed?: boolean;
  generateReport?: boolean;
}

function showUsage(): void {
  console.log('🎬 Video Marketing Critic Bot CLI');
  console.log('==================================');
  console.log('');
  console.log('Usage: npx ts-node scripts/run-video-marketing-critic.ts <VIDEO_PATH> [OPTIONS]');
  console.log('');
  console.log('Arguments:');
  console.log('  VIDEO_PATH                 Path to the video file to validate');
  console.log('');
  console.log('Options:');
  console.log('  --output-dir <path>        Custom output directory for reports');
  console.log('  --detailed                 Show detailed validation results');
  console.log('  --generate-report          Generate detailed marketing report');
  console.log('  --help                     Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  # Basic validation');
  console.log('  npx ts-node scripts/run-video-marketing-critic.ts ./output/final-video.mp4');
  console.log('');
  console.log('  # Detailed validation with report generation');
  console.log('  npx ts-node scripts/run-video-marketing-critic.ts ./output/final-video.mp4 \\');
  console.log('    --detailed \\');
  console.log('    --generate-report');
  console.log('');
  console.log('  # Custom output directory');
  console.log('  npx ts-node scripts/run-video-marketing-critic.ts ./output/final-video.mp4 \\');
  console.log('    --output-dir ./marketing-reports');
}

function parseArgs(): CLIArgs | null {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showUsage();
    return null;
  }
  
  const videoPath = args[0];
  if (!videoPath) {
    console.error('❌ Video path is required');
    showUsage();
    return null;
  }
  
  const parsed: CLIArgs = { videoPath };
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--output-dir':
        parsed.outputDir = args[++i];
        break;
        
      case '--detailed':
        parsed.detailed = true;
        break;
        
      case '--generate-report':
        parsed.generateReport = true;
        break;
        
      default:
        console.error(`❌ Unknown argument: ${arg}`);
        showUsage();
        return null;
    }
  }
  
  return parsed;
}

async function runVideoMarketingCritic(args: CLIArgs): Promise<void> {
  console.log('🚀 Starting Video Marketing Critic Bot...');
  console.log(`🎬 Video: ${args.videoPath}`);
  console.log('');
  
  // Check if video file exists
  if (!fs.existsSync(args.videoPath)) {
    console.error(`❌ Video file not found: ${args.videoPath}`);
    process.exit(1);
  }
  
  const criticBot = new VideoMarketingCriticBot();
  
  try {
    // Validate video marketing standards
    const validation = await criticBot.validateVideoMarketing(args.videoPath);
    
    // Display validation results
    displayValidationResults(validation, args.detailed);
    
    // Generate report if requested
    if (args.generateReport) {
      const reportPath = await criticBot.generateMarketingReport(args.videoPath);
      console.log(`\n📁 Detailed marketing report generated: ${reportPath}`);
    }
    
    // Summary
    console.log('\n🎯 Validation Summary:');
    console.log('=====================');
    console.log(`Overall Score: ${validation.overallScore}/100`);
    console.log(`Meets Recruiter Standards: ${validation.meetsRecruiterStandards ? '✅ YES' : '❌ NO'}`);
    console.log(`Critical Issues: ${validation.criticalIssues.length}`);
    console.log(`Improvement Areas: ${validation.improvementAreas.length}`);
    console.log(`Recommendations: ${validation.recommendations.length}`);
    
    if (validation.meetsRecruiterStandards) {
      console.log('\n🎉 Congratulations! Your video meets all recruiter standards!');
    } else {
      console.log('\n⚠️  Your video needs improvements to meet recruiter standards.');
      console.log('💡 Check the recommendations above for specific guidance.');
    }
    
  } catch (error) {
    console.error('❌ Video Marketing Critic Bot failed:', error);
    process.exit(1);
  }
}

function displayValidationResults(validation: any, detailed: boolean = false): void {
  console.log('🎯 Video Marketing Validation Results');
  console.log('====================================');
  console.log(`Overall Score: ${validation.overallScore}/100`);
  console.log(`Meets Recruiter Standards: ${validation.meetsRecruiterStandards ? '✅ YES' : '❌ NO'}`);
  console.log('');
  
  // Category scores
  console.log('📊 Category Scores:');
  console.log('==================');
  Object.entries(validation.categoryScores).forEach(([category, score]) => {
    const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const status = score >= 85 ? '✅' : score >= 70 ? '⚠️' : '❌';
    console.log(`  ${status} ${categoryName}: ${score}/100`);
  });
  console.log('');
  
  if (detailed) {
    // Critical issues
    if (validation.criticalIssues.length > 0) {
      console.log('🚨 Critical Issues:');
      validation.criticalIssues.forEach((issue: string) => console.log(`  - ${issue}`));
      console.log('');
    }
    
    // Improvement areas
    if (validation.improvementAreas.length > 0) {
      console.log('🔧 Areas for Improvement:');
      validation.improvementAreas.forEach((area: string) => console.log(`  - ${area}`));
      console.log('');
    }
    
    // Recommendations
    if (validation.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      validation.recommendations.forEach((rec: string) => console.log(`  - ${rec}`));
      console.log('');
    }
    
    // Best practice compliance
    console.log('📋 Best Practice Compliance:');
    console.log('============================');
    
    Object.entries(validation.bestPracticeCompliance).forEach(([source, items]) => {
      const sourceName = source.charAt(0).toUpperCase() + source.slice(1);
      console.log(`\n${sourceName} Guidelines:`);
      items.forEach((item: string) => console.log(`  ${item}`));
    });
    console.log('');
  }
  
  // Quick assessment
  console.log('🎯 Quick Assessment:');
  console.log('===================');
  
  if (validation.overallScore >= 90) {
    console.log('  🏆 Excellent! Your video meets professional marketing standards.');
  } else if (validation.overallScore >= 80) {
    console.log('  👍 Good! Your video is close to meeting all standards.');
  } else if (validation.overallScore >= 70) {
    console.log('  ⚠️  Fair. Your video needs improvements to meet professional standards.');
  } else {
    console.log('  ❌ Poor. Your video requires significant improvements.');
  }
  
  // Recruiter-specific feedback
  if (!validation.meetsRecruiterStandards) {
    console.log('\n🎯 Recruiter Requirements Not Met:');
    console.log('==================================');
    
    if (validation.categoryScores.technologyMention < 90) {
      console.log('  ❌ Foundry technology mention is insufficient');
      console.log('     → Recruiter specifically asked to "name-drop Foundry"');
      console.log('     → Include technical architecture details');
    }
    
    if (validation.categoryScores.narrativeStructure < 90) {
      console.log('  ❌ Narrative structure needs improvement');
      console.log('     → Follow problem → solution → value → action structure');
      console.log('     → Tell a compelling story, not just feature list');
    }
    
    if (validation.categoryScores.softwareDemonstration < 90) {
      console.log('  ❌ Software demonstration needs enhancement');
      console.log('     → Show live walk-through with clear step-by-step process');
      console.log('     → Demonstrate decision-making process');
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const args = parseArgs();
  if (!args) {
    process.exit(0);
  }
  
  await runVideoMarketingCritic(args);
}

// Run main function
main().catch(console.error);
