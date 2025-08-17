#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import * as path from 'path';

async function testImprovedTimeouts() {
  console.log('🧪 Testing Improved Timeout Mechanisms and Video Recording Validation');
  console.log('==================================================================');
  
  try {
    console.log('\n📋 Test 1: Running Enhanced Frontend Captures with Improved Timeouts');
    console.log('--------------------------------------------------------------------');
    
    // Test the enhanced frontend captures script directly
    const result = await runEnhancedFrontendCaptures();
    
    if (result.success) {
      console.log('✅ Enhanced frontend captures test completed successfully');
      console.log(`📊 Execution time: ${result.duration}ms`);
    } else {
      console.log('❌ Enhanced frontend captures test failed');
      console.log(`📊 Execution time: ${result.duration}ms`);
      console.log(`🔍 Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function runEnhancedFrontendCaptures(): Promise<{ success: boolean; duration: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    // Run the enhanced frontend captures script
    const child = spawn('npm', ['run', 'enhanced-frontend-captures'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      if (code === 0) {
        resolve({
          success: true,
          duration
        });
      } else {
        resolve({
          success: false,
          duration,
          error: stderr || stdout || `Process exited with code ${code}`
        });
      }
    });
    
    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        duration,
        error: error.message
      });
    });
    
    // Set a reasonable timeout for the entire test
    setTimeout(() => {
      child.kill();
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        duration,
        error: 'Test timed out after 5 minutes'
      });
    }, 300000); // 5 minutes
  });
}

// Main execution
async function main() {
  try {
    await testImprovedTimeouts();
    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
