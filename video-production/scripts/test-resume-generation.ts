#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function testResumeGeneration() {
  console.log('🧪 Testing resume generation functionality...\n');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const capturesDir = path.join(__dirname, '..', 'captures');
  
  try {
    // Check existing files
    console.log('📊 Checking existing files...');
    
    const expectedFiles = [
      '01_personal_intro.webm_with_vo.mp4',
      '02_user_persona.webm_with_vo.mp4',
      '03_technical_architecture.webm_with_vo.mp4',
      '04_platform_capabilities.webm_with_vo.mp4',
      '05_zone_management.webm_with_vo.mp4',
      '06_ai_powered_routing.webm_with_vo.mp4',
      '07_ai_decision_support.webm_with_vo.mp4',
      '08_service_layer_reliability.webm_with_vo.mp4',
      '09_integration_performance.webm_with_vo.mp4',
      '10_impact_call_to_action.webm_with_vo.mp4'
    ];
    
    const existingFiles: { [key: string]: boolean } = {};
    let completed = 0;
    
    for (const file of expectedFiles) {
      const filePath = path.join(capturesDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const isValid = stats.size > 100000; // > 100KB indicates valid file
        existingFiles[file] = isValid;
        if (isValid) completed++;
      } else {
        existingFiles[file] = false;
      }
    }
    
    console.log(`Progress: ${completed}/${expectedFiles.length} segments completed\n`);
    
    for (const [file, exists] of Object.entries(existingFiles)) {
      const status = exists ? '✅' : '⏳';
      const size = exists ? `(${fs.statSync(path.join(capturesDir, file)).size} bytes)` : '';
      console.log(`${status} ${file} ${size}`);
    }
    
    console.log('\n✅ Resume generation test completed successfully!');
    
    // Show what would be skipped
    const skippedFiles = Object.entries(existingFiles).filter(([_, exists]) => exists).map(([file, _]) => file);
    if (skippedFiles.length > 0) {
      console.log(`\n📋 Files that would be skipped on resume: ${skippedFiles.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Resume generation test failed:', error);
    process.exit(1);
  }
}

// Run the test
testResumeGeneration();
