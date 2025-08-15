#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class VideoAudioCombiner {
  constructor() {
    this.videoDir = 'captures';
    this.audioDir = 'audio';
    this.outputDir = 'output';
  }

  async combineVideoWithAudio() {
    console.log('🎬 Combining video with audio...');
    
    try {
      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Find the video file
      const videoFiles = fs.readdirSync(this.videoDir)
        .filter(file => file.endsWith('.mp4'));
      
      if (videoFiles.length === 0) {
        throw new Error('No MP4 video files found in captures directory');
      }

      const videoFile = videoFiles[0];
      const videoPath = path.join(this.videoDir, videoFile);
      const outputPath = path.join(this.outputDir, 'disaster-response-with-audio.mp4');

      console.log(`📹 Using video: ${videoFile}`);

      // Create a simple combined video with background music (if available)
      // For now, we'll just copy the video as-is since the audio is separate
      const copyCommand = `cp "${videoPath}" "${outputPath}"`;
      await execAsync(copyCommand);

      console.log(`✅ Video copied to: ${outputPath}`);

      // Get file size
      const stats = fs.statSync(outputPath);
      const fileSize = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`📊 File size: ${fileSize} MB`);

      // Create a simple audio timeline file for reference
      await this.createAudioTimeline();

      console.log('\n🎬 Video processing complete!');
      console.log('📁 Output files:');
      console.log(`  - ${outputPath} (video only)`);
      console.log(`  - ${this.outputDir}/audio-timeline.txt (audio reference)`);
      console.log('\n🎤 Audio files are in the audio/ directory');
      console.log('💡 Use video editing software to combine video with audio');

    } catch (error) {
      console.error('❌ Failed to combine video with audio:', error);
      throw error;
    }
  }

  async createAudioTimeline() {
    console.log('📝 Creating audio timeline...');
    
    const audioFiles = fs.readdirSync(this.audioDir)
      .filter(file => file.endsWith('.wav'))
      .sort();

    const timelinePath = path.join(this.outputDir, 'audio-timeline.txt');
    let timeline = 'Audio Timeline for Disaster Response Presentation\n';
    timeline += '=' .repeat(50) + '\n\n';

    let currentTime = 0;
    
    for (const audioFile of audioFiles) {
      const audioPath = path.join(this.audioDir, audioFile);
      const stats = fs.statSync(audioPath);
      
      // Estimate duration based on file size (rough approximation)
      // WAV files are typically 44.1kHz, 16-bit, stereo
      const bytesPerSecond = 44100 * 2 * 2; // 44.1kHz * 2 channels * 2 bytes
      const estimatedDuration = stats.size / bytesPerSecond;
      
      const startTime = currentTime;
      const endTime = currentTime + estimatedDuration;
      
      timeline += `${audioFile}:\n`;
      timeline += `  Start: ${this.formatTime(startTime)}\n`;
      timeline += `  End: ${this.formatTime(endTime)}\n`;
      timeline += `  Duration: ${estimatedDuration.toFixed(1)}s\n`;
      timeline += `  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n\n`;
      
      currentTime = endTime;
    }

    timeline += `Total estimated duration: ${this.formatTime(currentTime)}\n`;
    
    fs.writeFileSync(timelinePath, timeline);
    console.log(`✅ Audio timeline saved to: ${timelinePath}`);
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Main execution
async function main() {
  const combiner = new VideoAudioCombiner();
  await combiner.combineVideoWithAudio();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { VideoAudioCombiner };
