#!/usr/bin/env ts-node

import { HumanizerBot } from './humanizer-bot';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CLIArgs {
  url: string;
  descriptions: string[];
  segmentName: string;
  duration: number;
  technicalFocus: string;
  outputFile?: string;
}

function showUsage(): void {
  console.log('🤖 Humanizer Bot CLI');
  console.log('=====================');
  console.log('');
  console.log('Usage: npx ts-node scripts/run-humanizer-bot.ts [OPTIONS]');
  console.log('');
  console.log('Options:');
  console.log('  --url <url>                    Website URL to validate against');
  console.log('  --descriptions <desc1,desc2>   Comma-separated natural language descriptions');
  console.log('  --name <name>                  Segment name for the interaction');
  console.log('  --duration <seconds>           Duration in seconds');
  console.log('  --focus <focus>                Technical focus description');
  console.log('  --output <file>                Output JSON file (optional)');
  console.log('  --help                         Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  npx ts-node scripts/run-humanizer-bot.ts \\');
  console.log('    --url http://localhost:3000 \\');
  console.log('    --descriptions "Click on the map button,Wait for the map to load" \\');
  console.log('    --name "Map Navigation" \\');
  console.log('    --duration 30 \\');
  console.log('    --focus "Basic map navigation"');
  console.log('');
  console.log('  npx ts-node scripts/run-humanizer-bot.ts \\');
  console.log('    --url http://demo.com \\');
  console.log('    --descriptions "Hover over the hazard layer,Click on a hazard point" \\');
  console.log('    --name "Hazard Exploration" \\');
  console.log('    --duration 45 \\');
  console.log('    --focus "Interactive hazard management"');
}

function parseArgs(): CLIArgs | null {
  const args = process.argv.slice(2);
  const parsed: Partial<CLIArgs> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
        showUsage();
        return null;
        
      case '--url':
        parsed.url = args[++i];
        break;
        
      case '--descriptions':
        parsed.descriptions = args[++i].split(',').map(d => d.trim());
        break;
        
      case '--name':
        parsed.segmentName = args[++i];
        break;
        
      case '--duration':
        parsed.duration = parseInt(args[++i]);
        break;
        
      case '--focus':
        parsed.technicalFocus = args[++i];
        break;
        
      case '--output':
        parsed.outputFile = args[++i];
        break;
        
      default:
        console.error(`❌ Unknown argument: ${arg}`);
        showUsage();
        return null;
    }
  }

  // Validate required arguments
  if (!parsed.url || !parsed.descriptions || !parsed.segmentName || !parsed.duration || !parsed.technicalFocus) {
    console.error('❌ Missing required arguments');
    showUsage();
    return null;
  }

  if (parsed.duration <= 0) {
    console.error('❌ Duration must be positive');
    return null;
  }

  return parsed as CLIArgs;
}

async function runHumanizerBot(args: CLIArgs): Promise<void> {
  console.log('🚀 Starting Humanizer Bot...');
  console.log(`🌐 URL: ${args.url}`);
  console.log(`📝 Segment: ${args.segmentName}`);
  console.log(`⏱️  Duration: ${args.duration}s`);
  console.log(`🎯 Focus: ${args.technicalFocus}`);
  console.log(`📋 Actions: ${args.descriptions.length}`);
  console.log('');

  const bot = new HumanizerBot();
  
  try {
    // Initialize the bot
    await bot.initialize(args.url);
    
    // Generate interaction configuration
    const interaction = await bot.generateInteractionConfig(
      args.descriptions,
      args.segmentName,
      args.duration,
      args.technicalFocus
    );
    
    console.log('');
    console.log('🎯 Generated Interaction Configuration:');
    console.log('=====================================');
    console.log(`Name: ${interaction.name}`);
    console.log(`Duration: ${interaction.duration}s`);
    console.log(`Technical Focus: ${interaction.technicalFocus}`);
    console.log(`Validation Score: ${interaction.validation.score}/100 (${interaction.validation.overall})`);
    console.log('');
    
    // Show validation details
    if (interaction.validation.issues.length > 0) {
      console.log('❌ Issues:');
      interaction.validation.issues.forEach(issue => console.log(`  - ${issue}`));
      console.log('');
    }
    
    if (interaction.validation.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      interaction.validation.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }
    
    if (interaction.validation.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      interaction.validation.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
      console.log('');
    }
    
    // Show action details
    console.log('📋 Actions:');
    interaction.actions.forEach((action, index) => {
      const status = action.validation.elementExists && action.validation.elementInteractable ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${action.naturalLanguage}`);
      if (action.selector) {
        console.log(`     Selector: ${action.selector}`);
      } else if (action.x !== undefined && action.y !== undefined) {
        console.log(`     Coordinates: (${action.x}, ${action.y})`);
      }
    });
    
    // Generate JSON configuration
    const configPath = await bot.generateJSONConfig([interaction]);
    
    // Save to custom output file if specified
    if (args.outputFile) {
      const customPath = path.resolve(args.outputFile);
      fs.writeFileSync(customPath, JSON.stringify(interaction, null, 2));
      console.log(`📁 Custom output saved to: ${customPath}`);
    }
    
    console.log('');
    console.log('🎉 Humanizer Bot completed successfully!');
    console.log(`📁 Configuration saved to: ${configPath}`);
    
  } catch (error) {
    console.error('❌ Humanizer Bot failed:', error);
    process.exit(1);
  } finally {
    await bot.cleanup();
  }
}

// Main execution
async function main(): Promise<void> {
  const args = parseArgs();
  if (!args) {
    process.exit(0);
  }
  
  await runHumanizerBot(args);
}

// Run main function
main().catch(console.error);
