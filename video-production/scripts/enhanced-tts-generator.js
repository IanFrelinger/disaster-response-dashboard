#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

console.log('🎤 Enhanced TTS Generator - Creating High-Quality Voice Narration');

// Load narration configuration
const narrationPath = path.join(process.cwd(), 'narration.yaml');
if (!fs.existsSync(narrationPath)) {
  console.error('❌ narration.yaml not found');
  process.exit(1);
}

const narration = yaml.parse(fs.readFileSync(narrationPath, 'utf8'));
const outputDir = path.join(process.cwd(), 'output', 'voice-recordings');

// Ensure output directory exists
fs.ensureDirSync(outputDir);

// Enhanced TTS parameters for better quality
const ttsParams = {
  voice: 'en-us',           // American English voice
  speed: 150,               // Words per minute (slower for clarity)
  amplitude: 100,           // Volume (0-200)
  pitch: 50,                // Pitch (0-100, 50 is normal)
  wordGap: 1,               // Gap between words (0-10)
  emphasis: 1,              // Emphasis level (0-20)
  format: 'wav',            // Output format
  sampleRate: 22050         // Sample rate for better quality
};

console.log('📝 Processing narration scenes...');

narration.scenes.forEach((scene, index) => {
  const sceneNumber = String(index + 1).padStart(2, '0');
  const outputFile = path.join(outputDir, `scene-${sceneNumber}-enhanced.wav`);
  
  console.log(`🎬 Scene ${sceneNumber}: ${scene.title}`);
  
  try {
    // Create enhanced TTS command with better parameters
    const ttsCommand = [
      'espeak',
      `-v${ttsParams.voice}`,
      `-s${ttsParams.speed}`,
      `-a${ttsParams.amplitude}`,
      `-p${ttsParams.pitch}`,
      `-g${ttsParams.wordGap}`,
      `-k${ttsParams.emphasis}`,
      `-w${outputFile}`,
      `"${scene.narration}"`
    ].join(' ');
    
    console.log(`🔊 Generating TTS: ${scene.title}`);
    execSync(ttsCommand, { stdio: 'inherit' });
    
    // Verify the file was created
    if (fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      console.log(`✅ Generated: ${path.basename(outputFile)} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌ Failed to generate: ${path.basename(outputFile)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error generating TTS for scene ${sceneNumber}:`, error.message);
  }
});

console.log('\n🎉 Enhanced TTS generation complete!');
console.log(`📁 Output directory: ${outputDir}`);
console.log('\n📋 Next steps:');
console.log('1. Review the generated audio files');
console.log('2. Run: npm run dynamic-video');
console.log('3. Run: npm run comprehensive-pipeline');
