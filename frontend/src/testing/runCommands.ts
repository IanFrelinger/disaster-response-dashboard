#!/usr/bin/env node
/**
 * CLI runner for test commands and presets
 */

import { chromium } from 'playwright';
import { presetManager } from './presets/presets';
import { TestContext } from './commands/TestCommand';
import { promises as fs } from 'fs';
import path from 'path';

interface CLIOptions {
  preset?: string;
  headless?: boolean;
  baseUrl?: string;
  artifactsDir?: string;
  timeout?: number;
  verbose?: boolean;
}

class CommandRunner {
  private options: CLIOptions;

  constructor(options: CLIOptions = {}) {
    this.options = {
      preset: 'smoke-min',
      headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
      baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      artifactsDir: 'test-results',
      timeout: 60000,
      verbose: process.env.VERBOSE === 'true',
      ...options
    };
  }

  async run(): Promise<void> {
    console.log('🚀 Starting test command runner');
    console.log(`📋 Preset: ${this.options.preset}`);
    console.log(`🌐 Base URL: ${this.options.baseUrl}`);
    console.log(`📁 Artifacts: ${this.options.artifactsDir}`);
    console.log(`🤖 Headless: ${this.options.headless}`);
    console.log('');

    // Ensure artifacts directory exists
    await this.ensureArtifactsDir();

    // Get preset
    const preset = presetManager.getPreset(this.options.preset!);
    if (!preset) {
      console.error(`❌ Unknown preset: ${this.options.preset}`);
      console.log('Available presets:', presetManager.listPresets().join(', '));
      process.exit(1);
    }

    // Launch browser
    const browser = await chromium.launch({ 
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set up context
      const ctx: TestContext = {
        page,
        env: {
          stopOnFirstFailure: true,
          verbose: this.options.verbose
        },
        artifactsDir: this.options.artifactsDir!,
        baseUrl: this.options.baseUrl!
      };

      // Run preset
      const result = await preset.run(ctx);

      // Output results
      this.outputResults(result);

      // Exit with appropriate code
      process.exit(result.ok ? 0 : 1);

    } catch (error) {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    } finally {
      await browser.close();
    }
  }

  private async ensureArtifactsDir(): Promise<void> {
    try {
      await fs.mkdir(this.options.artifactsDir!, { recursive: true });
    } catch (error) {
      console.warn('Warning: Could not create artifacts directory:', error);
    }
  }

  private outputResults(result: any): void {
    console.log('\n📊 TEST RESULTS');
    console.log('================');
    console.log(`Name: ${result.name}`);
    console.log(`Status: ${result.ok ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Duration: ${result.durationMs}ms`);
    console.log(`Details: ${result.details}`);
    
    if (result.artifacts && result.artifacts.length > 0) {
      console.log(`\n📁 Artifacts:`);
      result.artifacts.forEach((artifact: string) => {
        console.log(`  - ${artifact}`);
      });
    }

    if (result.error) {
      console.log(`\n❌ Error: ${result.error.message}`);
    }
  }
}

// CLI argument parsing
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--preset':
      case '-p':
        options.preset = args[++i];
        break;
      case '--headless':
        options.headless = true;
        break;
      case '--no-headless':
        options.headless = false;
        break;
      case '--base-url':
      case '-u':
        options.baseUrl = args[++i];
        break;
      case '--artifacts-dir':
      case '-a':
        options.artifactsDir = args[++i];
        break;
      case '--timeout':
      case '-t':
        const timeoutArg = args[++i];
        if (timeoutArg) {
          options.timeout = parseInt(timeoutArg);
        }
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        if (arg && !arg.startsWith('-')) {
          options.preset = arg;
        }
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Test Command Runner

Usage: pnpm test:compose [options] [preset]

Options:
  -p, --preset <name>     Test preset to run (default: smoke-min)
  --headless              Run in headless mode (default: true)
  --no-headless           Run with visible browser
  -u, --base-url <url>    Base URL for the application (default: http://localhost:5173)
  -a, --artifacts-dir <dir> Artifacts directory (default: test-results)
  -t, --timeout <ms>      Timeout in milliseconds (default: 60000)
  -v, --verbose           Verbose output
  -h, --help              Show this help

Available presets:
  ${presetManager.listPresets().join('\n  ')}

Examples:
  pnpm test:compose smoke-min
  pnpm test:compose --preset map-core --no-headless
  pnpm test:compose full-map --base-url http://localhost:3000
  pnpm test:compose --verbose --artifacts-dir ./my-results
`);
}

// Main execution
async function main(): Promise<void> {
  try {
    const options = parseArgs();
    const runner = new CommandRunner(options);
    await runner.run();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export type { CLIOptions };
export { CommandRunner };
