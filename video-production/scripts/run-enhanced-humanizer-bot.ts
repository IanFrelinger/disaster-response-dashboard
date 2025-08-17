#!/usr/bin/env ts-node

import { EnhancedHumanizerBot } from './enhanced-humanizer-bot';
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
  validateOnly?: boolean;
}

function showUsage(): void {
  console.log('🤖 Enhanced Humanizer Bot CLI');
  console.log('===============================');
  console.log('');
  console.log('Usage: npx ts-node scripts/run-enhanced-humanizer-bot.ts [OPTIONS]');
  console.log('');
  console.log('Options:');
  console.log('  --url <url>                    Website URL to validate against');
  console.log('  --descriptions <desc1,desc2>   Comma-separated natural language descriptions');
  console.log('  --name <name>                  Segment name for the interaction');
  console.log('  --duration <seconds>           Duration in seconds');
  console.log('  --focus <focus>                Technical focus description');
  console.log('  --output <file>                Output JSON file (optional)');
  console.log('  --validate-only                Only validate UI elements without generating config');
  console.log('  --help                         Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  npx ts-node scripts/run-enhanced-humanizer-bot.ts \\');
  console.log('    --url http://localhost:3000 \\');
  console.log('    --descriptions "Click on the map button,Wait for the map to load" \\');
  console.log('    --name "Map Navigation" \\');
  console.log('    --duration 30 \\');
  console.log('    --focus "Basic map navigation"');
  console.log('');
  console.log('  npx ts-node scripts/run-enhanced-humanizer-bot.ts \\');
  console.log('    --url http://demo.com \\');
  console.log('    --descriptions "Hover over the hazard layer,Click on a hazard point" \\');
  console.log('    --name "Hazard Exploration" \\');
  console.log('    --duration 45 \\');
  console.log('    --focus "Interactive hazard management"');
  console.log('');
  console.log('  npx ts-node scripts/run-enhanced-humanizer-bot.ts \\');
  console.log('    --url http://localhost:3000 \\');
  console.log('    --validate-only');
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
        
      case '--validate-only':
        parsed.validateOnly = true;
        break;
        
      default:
        console.error(`❌ Unknown argument: ${arg}`);
        showUsage();
        return null;
    }
  }

  // Validate required arguments (unless validate-only mode)
  if (!parsed.validateOnly) {
    if (!parsed.url || !parsed.descriptions || !parsed.segmentName || !parsed.duration || !parsed.technicalFocus) {
      console.error('❌ Missing required arguments for full configuration generation');
      showUsage();
      return null;
    }

    if (parsed.duration <= 0) {
      console.error('❌ Duration must be positive');
      return null;
    }
  } else {
    // Validate-only mode only needs URL
    if (!parsed.url) {
      console.error('❌ URL required for validation mode');
      showUsage();
      return null;
    }
  }

  return parsed as CLIArgs;
}

async function runEnhancedHumanizerBot(args: CLIArgs): Promise<void> {
  if (args.validateOnly) {
    console.log('🔍 Running UI Element Validation Only...');
    console.log(`🌐 URL: ${args.url}`);
    console.log('');
  } else {
    console.log('🚀 Starting Enhanced Humanizer Bot...');
    console.log(`🌐 URL: ${args.url}`);
    console.log(`📝 Segment: ${args.segmentName}`);
    console.log(`⏱️  Duration: ${args.duration}s`);
    console.log(`🎯 Focus: ${args.technicalFocus}`);
    console.log(`📋 Actions: ${args.descriptions.length}`);
    console.log('');
  }

  const bot = new EnhancedHumanizerBot();
  
  try {
    // Initialize the bot
    await bot.initialize(args.url);
    
    if (args.validateOnly) {
      // Just run UI element discovery and validation
      console.log('🔍 Discovering UI elements...');
      const uiReport = await bot['generateUIElementReport']();
      
      console.log('');
      console.log('📊 UI Element Discovery Report:');
      console.log('==============================');
      console.log(`Total Elements: ${uiReport.totalElements}`);
      console.log(`Buttons: ${uiReport.elementCategories.buttons}`);
      console.log(`Links: ${uiReport.elementCategories.links}`);
      console.log(`Inputs: ${uiReport.elementCategories.inputs}`);
      console.log(`Navigation: ${uiReport.elementCategories.navigation}`);
      console.log(`Interactive: ${uiReport.elementCategories.interactive}`);
      console.log(`Content: ${uiReport.elementCategories.content}`);
      
      // Test some common descriptions
      const testDescriptions = [
        'map button',
        'hazard layer',
        'navigation menu',
        'search field',
        'submit button'
      ];
      
      console.log('');
      console.log('🧪 Testing Common UI Element Descriptions:');
      console.log('==========================================');
      
      for (const desc of testDescriptions) {
        const { validation, realElements, confidence } = await bot['validateWithRealUIElements'](desc);
        const status = validation.realElementMatch ? '✅' : '❌';
        console.log(`${status} "${desc}": ${realElements.length} matches, confidence: ${confidence}%`);
        
        if (realElements.length > 0) {
          const best = realElements[0];
          console.log(`   Best match: ${best.text || best.ariaLabel || best.dataTestId || 'Unknown'} (${best.tagName})`);
        }
      }
      
    } else {
      // Generate full interaction configuration
      const interaction = await bot.generateEnhancedInteractionConfig(
        args.descriptions,
        args.segmentName,
        args.duration,
        args.technicalFocus
      );
      
      console.log('');
      console.log('🎯 Generated Enhanced Interaction Configuration:');
      console.log('==============================================');
      console.log(`Name: ${interaction.name}`);
      console.log(`Duration: ${interaction.duration}s`);
      console.log(`Technical Focus: ${interaction.technicalFocus}`);
      console.log(`Validation Score: ${interaction.validation.score}/100 (${interaction.validation.overall})`);
      console.log(`Confidence: ${interaction.validation.confidence}%`);
      console.log(`Real Element Coverage: ${interaction.validation.realElementCoverage}%`);
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
      
      // Show action details with real UI validation
      console.log('📋 Actions with Real UI Validation:');
      interaction.actions.forEach((action, index) => {
        const status = action.validation.realElementMatch ? '✅' : '❌';
        const confidence = action.confidence > 0 ? ` (${action.confidence}% confidence)` : '';
        console.log(`  ${index + 1}. ${status} ${action.naturalLanguage}${confidence}`);
        
        if (action.validation.realElementMatch) {
          if (action.selector) {
            console.log(`     Selector: ${action.selector}`);
          } else if (action.x !== undefined && action.y !== undefined) {
            console.log(`     Coordinates: (${action.x}, ${action.y})`);
          }
          
          if (action.realUIElements.length > 0) {
            const best = action.realUIElements[0];
            console.log(`     Real Element: ${best.text || best.ariaLabel || best.dataTestId || 'Unknown'} (${best.tagName})`);
          }
        } else {
          console.log(`     ⚠️  No real UI elements found`);
        }
      });
      
      // Generate enhanced JSON configuration
      const configPath = await bot.generateEnhancedJSONConfig([interaction]);
      
      // Save to custom output file if specified
      if (args.outputFile) {
        const customPath = path.resolve(args.outputFile);
        fs.writeFileSync(customPath, JSON.stringify(interaction, null, 2));
        console.log(`📁 Custom output saved to: ${customPath}`);
      }
      
      console.log('');
      console.log('🎉 Enhanced Humanizer Bot completed successfully!');
      console.log(`📁 Configuration saved to: ${configPath}`);
    }
    
  } catch (error) {
    console.error('❌ Enhanced Humanizer Bot failed:', error);
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
  
  await runEnhancedHumanizerBot(args);
}

// Run main function
main().catch(console.error);
