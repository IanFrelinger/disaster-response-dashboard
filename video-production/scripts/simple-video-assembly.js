#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleVideoAssembly {
  constructor() {
    this.capturesDir = path.join(__dirname, '../captures');
    this.outputDir = path.join(__dirname, '../output');
    this.audioDir = path.join(__dirname, '../audio');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async run() {
    console.log('🎬 Simple Video Assembly Pipeline');
    console.log('==================================\n');

    // Get all video files
    const videoFiles = fs.readdirSync(this.capturesDir)
      .filter(file => file.endsWith('.webm'))
      .map(file => path.join(this.capturesDir, file));

    if (videoFiles.length === 0) {
      throw new Error('No video files found in captures directory');
    }

    console.log(`📹 Found ${videoFiles.length} video files:`);
    videoFiles.forEach(file => {
      const stats = fs.statSync(file);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${path.basename(file)} (${sizeMB} MB)`);
    });

    // Get audio file
    const audioFile = path.join(this.audioDir, 'voiceover.wav');
    if (!fs.existsSync(audioFile)) {
      throw new Error('Voiceover file not found');
    }

    const audioStats = fs.statSync(audioFile);
    const audioSizeMB = (audioStats.size / (1024 * 1024)).toFixed(2);
    console.log(`🎵 Audio file: voiceover.wav (${audioSizeMB} MB)\n`);

    // Create video list file for FFmpeg
    const videoListFile = path.join(this.outputDir, 'video_list.txt');
    const videoListContent = videoFiles.map(file => `file '${file}'`).join('\n');
    fs.writeFileSync(videoListFile, videoListContent);

    // Assemble video with audio
    console.log('🎬 Assembling video with audio...');
    
    const outputFile = path.join(this.outputDir, 'disaster-response-demo.mp4');
    
    const ffmpegCommand = [
      'ffmpeg',
      '-f', 'concat',
      '-safe', '0',
      '-i', videoListFile,
      '-i', audioFile,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-shortest',
      '-y',
      outputFile
    ].join(' ');

    console.log(`Executing: ${ffmpegCommand}`);
    
    try {
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      // Verify output
      if (fs.existsSync(outputFile)) {
        const outputStats = fs.statSync(outputFile);
        const outputSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);
        console.log(`\n✅ Video assembly completed successfully!`);
        console.log(`📁 Output: ${outputFile} (${outputSizeMB} MB)`);
      } else {
        throw new Error('Output file was not created');
      }
    } catch (error) {
      console.error('❌ Video assembly failed:', error.message);
      throw error;
    }

    // Clean up
    fs.unlinkSync(videoListFile);
    console.log('🧹 Cleanup completed');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const assembly = new SimpleVideoAssembly();
  assembly.run().catch(error => {
    console.error('Pipeline failed:', error);
    process.exit(1);
  });
}

export default SimpleVideoAssembly;
