#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import * as yaml from 'js-yaml';

interface VideoScene {
  id: string;
  title: string;
  duration: number;
  narration: string;
  voice: string;
  emphasis: string;
  capture_method: 'screenshot' | 'video';
}

interface NarrationConfig {
  metadata: {
    title: string;
    duration: number;
    language: string;
    voice_provider: string;
  };
  scenes: VideoScene[];
}

class FourMinuteVideoGenerator {
  private projectRoot: string;
  private capturesDir: string;
  private audioDir: string;
  private outputDir: string;
  private config: NarrationConfig;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.capturesDir = path.join(this.projectRoot, 'captures');
    this.audioDir = path.join(this.projectRoot, 'output', 'audio');
    this.outputDir = path.join(this.projectRoot, 'output');
    this.config = this.loadConfiguration();
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.outputDir, this.audioDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private loadConfiguration(): NarrationConfig {
    const configPath = path.join(this.projectRoot, 'config', 'narration.yaml');
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    const rawConfig = yaml.load(configContent) as any;

    if (!rawConfig || !rawConfig.scenes) {
      throw new Error('Invalid configuration file structure');
    }

    return rawConfig as NarrationConfig;
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

  private findCaptureFile(sceneId: string): string | null {
    // Look for capture files that match the scene ID
    const possibleExtensions = ['.webm', '.png', '.mp4'];
    
    for (const ext of possibleExtensions) {
      const filename = `${sceneId}${ext}`;
      const filepath = path.join(this.capturesDir, filename);
      if (fs.existsSync(filepath)) {
        return filepath;
      }
    }

    // Also check for files that might contain the scene ID in the name
    const files = fs.readdirSync(this.capturesDir);
    for (const file of files) {
      if (file.includes(sceneId) && (file.endsWith('.webm') || file.endsWith('.png') || file.endsWith('.mp4'))) {
        return path.join(this.capturesDir, file);
      }
    }

    return null;
  }

  private findAudioFile(sceneId: string): string | null {
    const audioFile = path.join(this.audioDir, `${sceneId}_narration.wav`);
    if (fs.existsSync(audioFile)) {
      return audioFile;
    }
    return null;
  }

  private async createVideoSegment(scene: VideoScene, index: number): Promise<string> {
    this.log(`🎬 Processing scene ${index + 1}/${this.config.scenes.length}: ${scene.title}`, 'info');
    
    const captureFile = this.findCaptureFile(scene.id);
    const audioFile = this.findAudioFile(scene.id);
    
    if (!captureFile) {
      this.log(`⚠️ No capture file found for scene: ${scene.id}`, 'warning');
      // Create a placeholder image if no capture exists
      return this.createPlaceholderImage(scene, index);
    }

    const outputFile = path.join(this.outputDir, `scene_${index + 1}_${scene.id}.mp4`);
    
    try {
      if (scene.capture_method === 'screenshot') {
        // Convert screenshot to video with audio
        await this.convertScreenshotToVideo(captureFile, audioFile, outputFile, scene.duration);
      } else {
        // Convert webm to mp4 and add audio if available
        await this.convertWebmToMp4(captureFile, audioFile, outputFile);
      }
      
      this.log(`✅ Scene ${scene.title} processed: ${outputFile}`, 'success');
      return outputFile;
      
    } catch (error) {
      this.log(`❌ Error processing scene ${scene.title}: ${error}`, 'error');
      // Fallback to placeholder
      return this.createPlaceholderImage(scene, index);
    }
  }

  private async createPlaceholderImage(scene: VideoScene, index: number): Promise<string> {
    this.log(`🖼️ Creating placeholder for scene: ${scene.title}`, 'info');
    
    const outputFile = path.join(this.outputDir, `scene_${index + 1}_${scene.id}_placeholder.mp4`);
    
    // Create a simple colored background with text
    const ffmpegArgs = [
      'ffmpeg',
      '-f', 'lavfi',
      '-i', `color=c=black:s=1920x1080:d=${scene.duration}`,
      '-vf', `drawtext=text='${scene.title.replace(/'/g, "\\'")}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-y',
      outputFile
    ];
    
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(ffmpegArgs[0], ffmpegArgs.slice(1), { 
        cwd: this.projectRoot, 
        stdio: 'pipe'
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(outputFile);
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        ffmpeg.kill();
        reject(new Error('FFmpeg timeout'));
      }, 30000);
    });
  }

  private async convertScreenshotToVideo(imagePath: string, audioPath: string | null, outputPath: string, duration: number): Promise<void> {
    const ffmpegArgs = [
      'ffmpeg',
      '-loop', '1',
      '-i', imagePath,
      ...(audioPath ? ['-i', audioPath] : []),
      '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
      '-c:v', 'libx264',
      '-t', duration.toString(),
      '-pix_fmt', 'yuv420p',
      ...(audioPath ? ['-c:a', 'aac', '-shortest'] : ['-an']),
      '-y',
      outputPath
    ];
    
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(ffmpegArgs[0], ffmpegArgs.slice(1), { 
        cwd: this.projectRoot, 
        stdio: 'pipe'
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        ffmpeg.kill();
        reject(new Error('FFmpeg timeout'));
      }, 60000);
    });
  }

  private async convertWebmToMp4(inputPath: string, audioPath: string | null, outputPath: string): Promise<void> {
    const ffmpegArgs = [
      'ffmpeg',
      '-i', inputPath,
      ...(audioPath ? ['-i', audioPath] : []),
      '-c:v', 'copy',
      ...(audioPath ? ['-c:a', 'aac'] : ['-an']),
      '-y',
      outputPath
    ];
    
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(ffmpegArgs[0], ffmpegArgs.slice(1), { 
        cwd: this.projectRoot, 
        stdio: 'pipe'
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        ffmpeg.kill();
        reject(new Error('FFmpeg timeout'));
      }, 60000);
    });
  }

  private async assembleFinalVideo(videoSegments: string[]): Promise<string> {
    this.log('🎬 Assembling final 4-minute video...', 'info');
    
    // Create a file list for ffmpeg concat
    const listFilePath = path.join(this.outputDir, 'video_segments_list.txt');
    const lines = videoSegments.map(segment => `file '${segment}'`);
    fs.writeFileSync(listFilePath, lines.join('\n'));
    
    const finalOutputPath = path.join(this.outputDir, 'disaster_response_4min_demo.mp4');
    
    const ffmpegCommand = [
      'ffmpeg',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFilePath,
      '-c', 'copy',
      '-y',
      finalOutputPath
    ];
    
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(ffmpegCommand[0], ffmpegCommand.slice(1), { 
        cwd: this.projectRoot, 
        stdio: 'pipe'
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(finalOutputPath);
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        ffmpeg.kill();
        reject(new Error('FFmpeg timeout'));
      }, 300000);
    });
  }

  async generateFourMinuteVideo(): Promise<void> {
    this.log('🚀 Starting 4-Minute Video Generation...', 'info');
    this.log(`📊 Configuration: ${this.config.scenes.length} scenes, ${this.config.metadata.duration}s total`, 'info');
    
    const startTime = Date.now();
    const videoSegments: string[] = [];
    
    try {
      // Process each scene
      for (let i = 0; i < this.config.scenes.length; i++) {
        const scene = this.config.scenes[i];
        const segmentPath = await this.createVideoSegment(scene, i);
        if (segmentPath) {
          videoSegments.push(segmentPath);
        }
      }
      
      if (videoSegments.length === 0) {
        throw new Error('No video segments were created successfully');
      }
      
      // Assemble final video
      const finalVideoPath = await this.assembleFinalVideo(videoSegments);
      
      const totalDuration = Date.now() - startTime;
      this.log(`🎉 4-Minute Video Generation Completed!`, 'success');
      this.log(`📁 Final video: ${finalVideoPath}`, 'success');
      this.log(`⏱️ Total processing time: ${totalDuration}ms`, 'info');
      this.log(`📊 Generated ${videoSegments.length} video segments`, 'info');
      
      // Generate summary
      this.generateSummary(videoSegments, finalVideoPath);
      
    } catch (error) {
      this.log(`❌ Video generation failed: ${error}`, 'error');
      throw error;
    }
  }

  private generateSummary(videoSegments: string[], finalVideoPath: string): void {
    const summary = {
      generated_at: new Date().toISOString(),
      total_scenes: this.config.scenes.length,
      total_duration: this.config.metadata.duration,
      video_segments: videoSegments.map((segment, index) => ({
        scene_number: index + 1,
        scene_id: this.config.scenes[index].id,
        scene_title: this.config.scenes[index].title,
        segment_file: path.basename(segment),
        duration: this.config.scenes[index].duration
      })),
      final_video: path.basename(finalVideoPath),
      narration_audio: this.config.scenes.map(scene => ({
        scene_id: scene.id,
        audio_file: `${scene.id}_narration.wav`,
        duration: scene.duration
      }))
    };
    
    const summaryPath = path.join(this.outputDir, '4min_video_generation_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    this.log(`📋 Generation summary saved to: ${summaryPath}`, 'info');
  }
}

// Main execution
async function main() {
  try {
    const generator = new FourMinuteVideoGenerator();
    await generator.generateFourMinuteVideo();
  } catch (error) {
    console.error('❌ 4-Minute video generation failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FourMinuteVideoGenerator };
