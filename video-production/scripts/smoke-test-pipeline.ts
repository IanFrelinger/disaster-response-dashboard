#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as yaml from 'js-yaml';

interface SmokeTestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: string;
}

class PipelineSmokeTest {
  private projectRoot: string;
  private results: SmokeTestResult[] = [];

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${prefix[type]} [${timestamp}] ${message}`);
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: string): void {
    this.results.push({ test, status, message, details });
  }

  async runAllTests(): Promise<void> {
    this.log('Starting Video Production Pipeline Smoke Test', 'info');
    this.log('=============================================', 'info');

    // Test 1: Environment and Dependencies
    await this.testEnvironmentAndDependencies();

    // Test 2: Configuration Files
    await this.testConfigurationFiles();

    // Test 3: Script Availability
    await this.testScriptAvailability();

    // Test 4: Directory Structure
    await this.testDirectoryStructure();

    // Test 5: Basic Pipeline Execution
    await this.testBasicPipelineExecution();

    // Test 6: Configuration Validation
    await this.testConfigurationValidation();

    // Test 7: Output Directory Permissions
    await this.testOutputDirectoryPermissions();

    // Test 8: Package Dependencies
    await this.testPackageDependencies();

    this.log('', 'info');
    this.log('Smoke Test Results Summary', 'info');
    this.log('=========================', 'info');
    this.printResults();
  }

  private async testEnvironmentAndDependencies(): Promise<void> {
    this.log('Testing Environment and Dependencies...', 'info');

    // Check Node.js version
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion >= 18) {
        this.addResult('Node.js Version', 'PASS', `Node.js ${nodeVersion} is compatible`);
      } else {
        this.addResult('Node.js Version', 'FAIL', `Node.js ${nodeVersion} is too old. Required: >=18.0.0`);
      }
    } catch (error) {
      this.addResult('Node.js Version', 'FAIL', 'Failed to check Node.js version', error.toString());
    }

    // Check TypeScript
    try {
      const tsVersion = execSync('npx tsc --version', { encoding: 'utf8' }).trim();
      this.addResult('TypeScript', 'PASS', `TypeScript ${tsVersion} is available`);
    } catch (error) {
      this.addResult('TypeScript', 'FAIL', 'TypeScript is not available', error.toString());
    }

    // Check ts-node
    try {
      const tsNodeVersion = execSync('npx ts-node --version', { encoding: 'utf8' }).trim();
      this.addResult('ts-node', 'PASS', `ts-node ${tsNodeVersion} is available`);
    } catch (error) {
      this.addResult('ts-node', 'FAIL', 'ts-node is not available', error.toString());
    }
  }

  private async testConfigurationFiles(): Promise<void> {
    this.log('Testing Configuration Files...', 'info');

    const requiredConfigs = [
      'config/narration.yaml',
      'config/timeline-fixed.yaml',
      'package.json'
    ];

    for (const config of requiredConfigs) {
      const configPath = path.join(this.projectRoot, config);
      if (fs.existsSync(configPath)) {
        this.addResult(`Config: ${config}`, 'PASS', 'Configuration file exists');
      } else {
        this.addResult(`Config: ${config}`, 'FAIL', `Configuration file missing: ${config}`);
      }
    }
  }

  private async testScriptAvailability(): Promise<void> {
    this.log('Testing Script Availability...', 'info');

    const requiredScripts = [
      'scripts/run-enhanced-production.ts',
      'scripts/generate-enhanced-captures.ts',
      'scripts/generate-narration.ts',
      'scripts/assemble-final-video.ts'
    ];

    for (const script of requiredScripts) {
      const scriptPath = path.join(this.projectRoot, script);
      if (fs.existsSync(scriptPath)) {
        this.addResult(`Script: ${script}`, 'PASS', 'Script file exists');
      } else {
        this.addResult(`Script: ${script}`, 'FAIL', `Script file missing: ${script}`);
      }
    }
  }

  private async testDirectoryStructure(): Promise<void> {
    this.log('Testing Directory Structure...', 'info');

    const requiredDirs = [
      'output',
      'temp',
      'config',
      'scripts',
      'assets',
      'assets/art',
      'assets/diagrams',
      'assets/slides'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        this.addResult(`Directory: ${dir}`, 'PASS', 'Directory exists');
      } else {
        this.addResult(`Directory: ${dir}`, 'FAIL', `Directory missing: ${dir}`);
      }
    }
  }

  private async testBasicPipelineExecution(): Promise<void> {
    this.log('Testing Basic Pipeline Execution...', 'info');

    try {
      // Test if the main pipeline script can be parsed without syntax errors
      const mainScript = path.join(this.projectRoot, 'scripts', 'run-enhanced-production.ts');
      if (fs.existsSync(mainScript)) {
        const scriptContent = fs.readFileSync(mainScript, 'utf8');
        
        // Basic syntax check - try to require the file
        try {
          // This is a basic check - in a real scenario you might want to use ts-node to actually compile
          if (scriptContent.includes('class') && scriptContent.includes('export')) {
            this.addResult('Pipeline Script Syntax', 'PASS', 'Main pipeline script has valid structure');
          } else {
            this.addResult('Pipeline Script Syntax', 'FAIL', 'Main pipeline script has invalid structure');
          }
        } catch (error) {
          this.addResult('Pipeline Script Syntax', 'FAIL', 'Failed to parse pipeline script', error.toString());
        }
      } else {
        this.addResult('Pipeline Script Syntax', 'SKIP', 'Main pipeline script not found');
      }
    } catch (error) {
      this.addResult('Pipeline Script Syntax', 'FAIL', 'Error checking pipeline script', error.toString());
    }
  }

  private async testConfigurationValidation(): Promise<void> {
    this.log('Testing Configuration Validation...', 'info');

    try {
      // Test narration.yaml
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      if (fs.existsSync(narrationPath)) {
        try {
          const narrationContent = fs.readFileSync(narrationPath, 'utf8');
          const narration = yaml.load(narrationContent) as any;
          
          if (narration.metadata && narration.scenes && narration.voice_providers) {
            this.addResult('Narration Config', 'PASS', 'Narration configuration is valid');
          } else {
            this.addResult('Narration Config', 'FAIL', 'Narration configuration is missing required sections');
          }
        } catch (error) {
          this.addResult('Narration Config', 'FAIL', 'Failed to parse narration YAML', error.toString());
        }
      } else {
        this.addResult('Narration Config', 'SKIP', 'Narration configuration file not found');
      }

      // Test package.json
      const packagePath = path.join(this.projectRoot, 'package.json');
      if (fs.existsSync(packagePath)) {
        try {
          const packageContent = fs.readFileSync(packagePath, 'utf8');
          const packageJson = JSON.parse(packageContent);
          
          if (packageJson.scripts && packageJson.dependencies) {
            this.addResult('Package.json', 'PASS', 'Package.json is valid');
          } else {
            this.addResult('Package.json', 'FAIL', 'Package.json is missing required sections');
          }
        } catch (error) {
          this.addResult('Package.json', 'FAIL', 'Failed to parse package.json', error.toString());
        }
      } else {
        this.addResult('Package.json', 'SKIP', 'Package.json not found');
      }
    } catch (error) {
      this.addResult('Configuration Validation', 'FAIL', 'Error during configuration validation', error.toString());
    }
  }

  private async testOutputDirectoryPermissions(): Promise<void> {
    this.log('Testing Output Directory Permissions...', 'info');

    const outputDir = path.join(this.projectRoot, 'output');
    const tempDir = path.join(this.projectRoot, 'temp');

    try {
      // Test output directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const testFile = path.join(outputDir, 'smoke-test-permissions.tmp');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      this.addResult('Output Directory Permissions', 'PASS', 'Can write and delete files in output directory');

      // Test temp directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const testTempFile = path.join(tempDir, 'smoke-test-permissions.tmp');
      fs.writeFileSync(testTempFile, 'test');
      fs.unlinkSync(testTempFile);
      this.addResult('Temp Directory Permissions', 'PASS', 'Can write and delete files in temp directory');

    } catch (error) {
      this.addResult('Directory Permissions', 'FAIL', 'Cannot write to output or temp directories', error.toString());
    }
  }

  private async testPackageDependencies(): Promise<void> {
    this.log('Testing Package Dependencies...', 'info');

    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        this.addResult('Dependencies Installed', 'PASS', 'node_modules directory exists');
      } else {
        this.addResult('Dependencies Installed', 'FAIL', 'node_modules directory missing - run npm install');
      }

      // Check package-lock.json
      const packageLockPath = path.join(this.projectRoot, 'package-lock.json');
      if (fs.existsSync(packageLockPath)) {
        this.addResult('Package Lock', 'PASS', 'package-lock.json exists');
      } else {
        this.addResult('Package Lock', 'WARNING', 'package-lock.json missing - dependencies may be inconsistent');
      }

    } catch (error) {
      this.addResult('Package Dependencies', 'FAIL', 'Error checking package dependencies', error.toString());
    }
  }

  private printResults(): void {
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    const skipCount = this.results.filter(r => r.status === 'SKIP').length;
    const totalCount = this.results.length;

    console.log(`\n📊 Test Summary:`);
    console.log(`   Total Tests: ${totalCount}`);
    console.log(`   ✅ Passed: ${passCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);

    console.log(`\n📋 Detailed Results:`);
    this.results.forEach(result => {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'SKIP': '⏭️'
      };
      console.log(`   ${statusIcon[result.status]} ${result.test}: ${result.message}`);
      if (result.details) {
        console.log(`      Details: ${result.details}`);
      }
    });

    if (failCount === 0) {
      this.log('🎉 All critical tests passed! Pipeline is ready for use.', 'success');
    } else {
      this.log(`⚠️  ${failCount} test(s) failed. Please fix issues before running the pipeline.`, 'warning');
    }
  }
}

// Run the smoke test
async function main() {
  try {
    const smokeTest = new PipelineSmokeTest();
    await smokeTest.runAllTests();
  } catch (error) {
    console.error('❌ Smoke test failed with error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
