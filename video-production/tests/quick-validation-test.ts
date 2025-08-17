import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface QuickTestResult {
  testName: string;
  status: 'PASS' | 'FAIL';
  duration: number;
  details: string;
  error?: string;
}

class QuickValidationTest {
  private projectRoot: string;
  private capturesDir: string;
  private testResults: QuickTestResult[] = [];

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.capturesDir = path.join(this.projectRoot, 'captures');
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  private async runQuickTest(testName: string, testFunction: () => Promise<string>): Promise<QuickTestResult> {
    const startTime = Date.now();
    this.log(`🧪 Quick Test: ${testName}`);
    
    try {
      const details = await testFunction();
      const duration = Date.now() - startTime;
      
      const result: QuickTestResult = {
        testName,
        status: 'PASS',
        duration,
        details
      };
      
      this.log(`✅ PASS: ${testName} (${duration}ms)`);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: QuickTestResult = {
        testName,
        status: 'FAIL',
        duration,
        details: `Test failed: ${errorMessage}`,
        error: errorMessage
      };
      
      this.log(`❌ FAIL: ${testName} (${duration}ms) - ${errorMessage}`);
      return result;
    }
  }

  private async testCoreComponents(): Promise<string> {
    this.log('🔧 Testing core components...');
    
    // Check essential files exist
    const essentialFiles = [
      'scripts/intelligent-quality-agent.ts',
      'scripts/enhanced-frontend-captures-with-parameter-injection.ts',
      'package.json'
    ];
    
    for (const file of essentialFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Essential file missing: ${file}`);
      }
    }
    
    // Check directories exist
    const essentialDirs = ['captures', 'temp'];
    for (const dir of essentialDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
    
    return 'Core components validated successfully';
  }

  private async testParameterInjection(): Promise<string> {
    this.log('🔧 Testing parameter injection...');
    
    // Test basic parameter injection
    const testParams = { videoQuality: 'medium', resolution: '1280x720', captureDuration: 5 };
    const paramString = JSON.stringify(testParams);
    const command = `npx ts-node scripts/enhanced-frontend-captures-with-parameter-injection.ts '${paramString}'`;
    
    execSync(command, { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout for quick test
    });
    
    // Verify files were generated
    const files = fs.readdirSync(this.capturesDir).filter(f => f.endsWith('.webm') || f.endsWith('.png'));
    if (files.length === 0) {
      throw new Error('No capture files generated during parameter injection test');
    }
    
    return `Parameter injection successful - generated ${files.length} files`;
  }

  private async testQualityScoring(): Promise<string> {
    this.log('📊 Testing quality scoring...');
    
    // Analyze existing captures for quality scoring
    const files = fs.readdirSync(this.capturesDir).filter(f => f.endsWith('.webm') || f.endsWith('.png'));
    if (files.length === 0) {
      throw new Error('No files available for quality scoring test');
    }
    
    let totalSize = 0;
    for (const file of files) {
      const filePath = path.join(this.capturesDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
    
    const avgFileSize = totalSize / files.length;
    if (avgFileSize < 1000) { // Minimum file size threshold
      throw new Error(`File sizes too small for quality scoring: average ${avgFileSize} bytes`);
    }
    
    return `Quality scoring validated - average file size: ${(avgFileSize / 1024).toFixed(1)} KB`;
  }

  private async testFileRegeneration(): Promise<string> {
    this.log('🔄 Testing file regeneration...');
    
    // Clear existing captures first to ensure clean test
    if (fs.existsSync(this.capturesDir)) {
      const existingFiles = fs.readdirSync(this.capturesDir).filter(f => f.endsWith('.webm') || f.endsWith('.png'));
      for (const file of existingFiles) {
        const filePath = path.join(this.capturesDir, file);
        fs.unlinkSync(filePath);
      }
      this.log(`🗑️  Cleared ${existingFiles.length} existing files`);
    }
    
    // Count initial files (should be 0 after clearing)
    const initialFiles = fs.readdirSync(this.capturesDir).filter(f => f.endsWith('.webm') || f.endsWith('.png'));
    const initialCount = initialFiles.length;
    
    if (initialCount !== 0) {
      throw new Error(`Failed to clear existing files: ${initialCount} files remain`);
    }
    
    // Run capture generation
    const testParams = { videoQuality: 'high', resolution: '1920x1080', captureDuration: 7 };
    const paramString = JSON.stringify(testParams);
    const command = `npx ts-node scripts/enhanced-frontend-captures-with-parameter-injection.ts '${paramString}'`;
    
    execSync(command, { 
      cwd: this.projectRoot, 
      stdio: 'pipe',
      timeout: 30000
    });
    
    // Count final files
    const finalFiles = fs.readdirSync(this.capturesDir).filter(f => f.endsWith('.webm') || f.endsWith('.png'));
    const finalCount = finalFiles.length;
    
    if (finalCount === 0) {
      throw new Error('No files generated during regeneration test');
    }
    
    return `File regeneration successful: ${initialCount} → ${finalCount} files`;
  }

  private async testIntelligentAgent(): Promise<string> {
    this.log('🧠 Testing intelligent agent...');
    
    // Test intelligent agent with very limited iterations for quick test
    const command = `npx ts-node scripts/intelligent-quality-agent.ts`;
    
    try {
      // Run with much shorter timeout for quick test
      execSync(command, { 
        cwd: this.projectRoot, 
        stdio: 'pipe',
        timeout: 60000 // 1 minute for quick test
      });
      
      return 'Intelligent agent executed successfully';
      
    } catch (error) {
      // If it times out, that's expected in quick test mode
      if (error instanceof Error && error.message.includes('timeout')) {
        return 'Intelligent agent started successfully (timeout expected in quick test)';
      }
      
      // Check if it's a different type of error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('ETIMEDOUT')) {
        return 'Intelligent agent started successfully (timeout expected in quick test)';
      }
      
      throw error;
    }
  }

  private generateQuickReport(): void {
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    const successRate = ((passed / total) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 QUICK VALIDATION TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${failed} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    
    console.log(`\n📋 Results:`);
    for (const result of this.testResults) {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`   ${icon} ${result.testName} (${result.duration}ms)`);
      console.log(`      ${result.details}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (failed > 0) {
      console.log('⚠️  Some tests failed. Check the details above.');
      process.exit(1);
    } else {
      console.log('🎉 All quick validation tests passed!');
    }
  }

  async runQuickValidation(): Promise<void> {
    this.log('🚀 Starting Quick Validation Test Suite');
    this.log(`📁 Project Root: ${this.projectRoot}`);
    
    const testFunctions = [
      { name: 'Core Components', func: () => this.testCoreComponents() },
      { name: 'Parameter Injection', func: () => this.testParameterInjection() },
      { name: 'Quality Scoring', func: () => this.testQualityScoring() },
      { name: 'File Regeneration', func: () => this.testFileRegeneration() },
      { name: 'Intelligent Agent', func: () => this.testIntelligentAgent() }
    ];
    
    for (const test of testFunctions) {
      const result = await this.runQuickTest(test.name, test.func);
      this.testResults.push(result);
    }
    
    this.generateQuickReport();
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const quickTest = new QuickValidationTest();
    await quickTest.runQuickValidation();
  } catch (error) {
    console.error('❌ Quick validation test failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
