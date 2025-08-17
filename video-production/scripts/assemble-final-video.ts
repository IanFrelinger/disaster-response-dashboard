#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

interface VideoSegment {
  name: string;
  file: string;
  duration: number;
}

class VideoAssembler {
  private projectRoot: string;
  private inputDir: string;
  private outputDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.inputDir = path.join(this.projectRoot, 'out');
    this.outputDir = path.join(this.projectRoot, 'output');
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${emoji[type]} [${timestamp}] ${message}`);
  }

  async checkVideoFiles(): Promise<VideoSegment[]> {
    const segments: VideoSegment[] = [
      { name: 'Personal Introduction', file: '01_personal_intro.mp4', duration: 15 },
      { name: 'User Persona', file: '02_user_persona.mp4', duration: 20 },
      { name: 'Foundry Architecture', file: '03_foundry_architecture.mp4', duration: 30 },
      { name: 'Action Demonstration', file: '04_action_demonstration.mp4', duration: 30 },
      { name: 'Strong Call to Action', file: '05_strong_cta.mp4', duration: 45 }
    ];

    const availableSegments: VideoSegment[] = [];
    
    for (const segment of segments) {
      const filePath = path.join(this.inputDir, segment.file);
      if (fs.existsSync(filePath)) {
        availableSegments.push(segment);
        this.log(`Found video segment: ${segment.name}`, 'success');
      } else {
        this.log(`Missing video segment: ${segment.name} (${segment.file})`, 'warning');
      }
    }

    return availableSegments;
  }

  async createVideoListFile(segments: VideoSegment[]): Promise<string> {
    const listFilePath = path.join(this.outputDir, 'video_list.txt');
    const lines = segments.map(segment => `file '${path.join(this.inputDir, segment.file)}'`);
    
    fs.writeFileSync(listFilePath, lines.join('\n'));
    this.log(`Created video list file: ${listFilePath}`, 'info');
    
    return listFilePath;
  }

  async assembleVideos(segments: VideoSegment[], listFilePath: string): Promise<void> {
    if (segments.length === 0) {
      this.log('No video segments available for assembly', 'error');
      return;
    }

    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
    this.log(`Assembling ${segments.length} video segments (total duration: ${totalDuration}s)`, 'info');

    const outputPath = path.join(this.outputDir, 'final_enhanced_demo.mp4');
    
    try {
      // Use ffmpeg to concatenate videos
      const ffmpegCommand = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', listFilePath,
        '-c', 'copy',
        '-y', // Overwrite output file
        outputPath
      ].join(' ');

      this.log(`Running ffmpeg command: ${ffmpegCommand}`, 'info');
      
      execSync(ffmpegCommand, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });

      this.log(`✅ Final video assembled successfully: ${outputPath}`, 'success');
      this.log(`📊 Video details:`, 'info');
      this.log(`   - Total segments: ${segments.length}`, 'info');
      this.log(`   - Total duration: ${totalDuration} seconds (${Math.round(totalDuration/60*10)/10} minutes)`, 'info');
      this.log(`   - Output file: ${outputPath}`, 'info');

    } catch (error) {
      this.log(`Error assembling videos: ${error}`, 'error');
      throw error;
    }
  }

  async generateSummary(segments: VideoSegment[]): Promise<void> {
    const summary = {
      generatedAt: new Date().toISOString(),
      totalSegments: segments.length,
      totalDuration: segments.reduce((sum, segment) => sum + segment.duration, 0),
      segments: segments.map(segment => ({
        name: segment.name,
        file: segment.file,
        duration: segment.duration
      })),
      outputFiles: {
        finalVideo: 'final_enhanced_demo.mp4',
        videoList: 'video_list.txt'
      }
    };

    const summaryPath = path.join(this.outputDir, 'video_assembly_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    this.log(`Generated assembly summary: ${summaryPath}`, 'success');
  }

  async run(): Promise<void> {
    try {
      this.log('🎬 Starting video assembly process...', 'info');
      
      // Check available video files
      const segments = await this.checkVideoFiles();
      
      if (segments.length === 0) {
        this.log('No video segments found. Please run the HTML to video converter first.', 'error');
        return;
      }

      // Create video list file for ffmpeg
      const listFilePath = await this.createVideoListFile(segments);
      
      // Assemble the final video
      await this.assembleVideos(segments, listFilePath);
      
      // Generate summary
      await this.generateSummary(segments);
      
      this.log('🎉 Video assembly process completed successfully!', 'success');
      
    } catch (error) {
      this.log(`Error in video assembly process: ${error}`, 'error');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const assembler = new VideoAssembler();
  await assembler.run();
}

// Run main function
main().catch(console.error);

export { VideoAssembler };
